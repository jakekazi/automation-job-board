from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.application import Application
from app.models.job import Job, JobStatus
from app.models.user import User, UserRole
from app.schemas.job import JobCreate, JobListResponse, JobResponse, JobUpdate

router = APIRouter(prefix="/jobs", tags=["jobs"])


def job_to_response(job: Job, db: Session) -> JobResponse:
    """Convert Job model to JobResponse with application count."""
    app_count = db.query(func.count(Application.id)).filter(Application.job_id == job.id).scalar()
    return JobResponse(
        id=job.id,
        sponsor_id=job.sponsor_id,
        title=job.title,
        description=job.description,
        requirements=job.requirements,
        budget_min=job.budget_min,
        budget_max=job.budget_max,
        budget_type=job.budget_type,
        estimated_hours=job.estimated_hours,
        deadline=job.deadline,
        status=job.status,
        ai_generated_description=job.ai_generated_description,
        created_at=job.created_at,
        application_count=app_count or 0,
        sponsor=job.sponsor,
    )


@router.get("", response_model=JobListResponse)
def list_jobs(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status_filter: JobStatus | None = Query(None, alias="status"),
    search: str | None = None,
):
    """List all open jobs with optional filters."""
    query = db.query(Job)

    # Filter by status (default to open jobs)
    if status_filter:
        query = query.filter(Job.status == status_filter)
    else:
        query = query.filter(Job.status == JobStatus.OPEN)

    # Search in title and description
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Job.title.ilike(search_term)) | (Job.description.ilike(search_term))
        )

    total = query.count()
    jobs = query.order_by(Job.created_at.desc()).offset(skip).limit(limit).all()

    return JobListResponse(
        jobs=[job_to_response(job, db) for job in jobs],
        total=total,
    )


@router.get("/my", response_model=JobListResponse)
def get_my_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get jobs posted by current sponsor."""
    if current_user.role != UserRole.SPONSOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only sponsors can view their posted jobs",
        )

    jobs = (
        db.query(Job)
        .filter(Job.sponsor_id == current_user.id)
        .order_by(Job.created_at.desc())
        .all()
    )

    return JobListResponse(
        jobs=[job_to_response(job, db) for job in jobs],
        total=len(jobs),
    )


@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: UUID, db: Session = Depends(get_db)):
    """Get job details."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )
    return job_to_response(job, db)


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    job_data: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new job posting (sponsors only)."""
    if current_user.role != UserRole.SPONSOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only sponsors can post jobs",
        )

    job = Job(
        sponsor_id=current_user.id,
        title=job_data.title,
        description=job_data.description,
        requirements=job_data.requirements,
        budget_min=job_data.budget_min,
        budget_max=job_data.budget_max,
        budget_type=job_data.budget_type,
        estimated_hours=job_data.estimated_hours,
        deadline=job_data.deadline,
        ai_generated_description=job_data.ai_generated_description,
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    return job_to_response(job, db)


@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: UUID,
    job_data: JobUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a job posting (owner only)."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    if job.sponsor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own jobs",
        )

    update_data = job_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)

    db.commit()
    db.refresh(job)

    return job_to_response(job, db)


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete/cancel a job posting (owner only)."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    if job.sponsor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own jobs",
        )

    db.delete(job)
    db.commit()
