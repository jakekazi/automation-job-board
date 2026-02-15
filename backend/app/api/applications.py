from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.application import Application, ApplicationStatus
from app.models.job import Job
from app.models.user import User, UserRole
from app.schemas.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationStatusUpdate,
)

router = APIRouter(prefix="/applications", tags=["applications"])


@router.get("", response_model=list[ApplicationResponse])
def get_my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get applications submitted by current apprentice."""
    if current_user.role != UserRole.APPRENTICE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only apprentices can view their applications",
        )

    applications = (
        db.query(Application)
        .filter(Application.apprentice_id == current_user.id)
        .order_by(Application.created_at.desc())
        .all()
    )

    return applications


@router.get("/job/{job_id}", response_model=list[ApplicationResponse])
def get_applications_for_job(
    job_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get applications for a specific job (sponsor/owner only)."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    if job.sponsor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view applications for your own jobs",
        )

    applications = (
        db.query(Application)
        .filter(Application.job_id == job_id)
        .order_by(Application.created_at.desc())
        .all()
    )

    # Include apprentice info
    for app in applications:
        _ = app.apprentice  # Load relationship

    return applications


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    app_data: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit an application to a job (apprentices only)."""
    if current_user.role != UserRole.APPRENTICE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only apprentices can apply to jobs",
        )

    # Check if job exists and is open
    job = db.query(Job).filter(Job.id == app_data.job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    if job.status != "open":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This job is no longer accepting applications",
        )

    # Check if already applied
    existing = (
        db.query(Application)
        .filter(
            Application.job_id == app_data.job_id,
            Application.apprentice_id == current_user.id,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied to this job",
        )

    application = Application(
        job_id=app_data.job_id,
        apprentice_id=current_user.id,
        cover_letter=app_data.cover_letter,
        proposed_rate=app_data.proposed_rate,
        estimated_completion_days=app_data.estimated_completion_days,
        ai_generated_cover_letter=app_data.ai_generated_cover_letter,
    )
    db.add(application)
    db.commit()
    db.refresh(application)

    return application


@router.get("/{application_id}", response_model=ApplicationResponse)
def get_application(
    application_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get application details."""
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    # Check permissions
    job = db.query(Job).filter(Job.id == application.job_id).first()
    is_owner = application.apprentice_id == current_user.id
    is_sponsor = job and job.sponsor_id == current_user.id

    if not (is_owner or is_sponsor):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this application",
        )

    return application


@router.patch("/{application_id}/status", response_model=ApplicationResponse)
def update_application_status(
    application_id: UUID,
    status_update: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update application status (sponsor accepts/rejects, or apprentice withdraws)."""
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    job = db.query(Job).filter(Job.id == application.job_id).first()

    # Apprentice can only withdraw their own application
    if status_update.status == ApplicationStatus.WITHDRAWN:
        if application.apprentice_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only withdraw your own applications",
            )
    # Sponsor can accept/reject
    elif status_update.status in [ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED]:
        if not job or job.sponsor_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the job owner can accept/reject applications",
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status transition",
        )

    application.status = status_update.status
    db.commit()
    db.refresh(application)

    return application
