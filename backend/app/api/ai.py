from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.job import Job, JobStatus
from app.models.user import User, UserRole
from app.services.ai_service import ai_service

router = APIRouter(prefix="/ai", tags=["ai"])


class GenerateDescriptionRequest(BaseModel):
    brief: str
    requirements: list[str] | None = None


class GenerateDescriptionResponse(BaseModel):
    title: str
    description: str
    requirements: str


class GenerateCoverLetterRequest(BaseModel):
    job_id: str


class GenerateCoverLetterResponse(BaseModel):
    cover_letter: str


class JobMatchResponse(BaseModel):
    job_id: str
    score: float
    reason: str


@router.post("/generate-description", response_model=GenerateDescriptionResponse)
async def generate_description(
    request: GenerateDescriptionRequest,
    current_user: User = Depends(get_current_user),
):
    """Generate a job description from a brief input (sponsors only)."""
    if current_user.role != UserRole.SPONSOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only sponsors can generate job descriptions",
        )

    try:
        result = await ai_service.generate_job_description(
            request.brief, request.requirements
        )
        return GenerateDescriptionResponse(**result)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate description: {str(e)}",
        )


@router.post("/generate-cover-letter", response_model=GenerateCoverLetterResponse)
async def generate_cover_letter(
    request: GenerateCoverLetterRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a cover letter for a job application (apprentices only)."""
    if current_user.role != UserRole.APPRENTICE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only apprentices can generate cover letters",
        )

    # Get job details
    job = db.query(Job).filter(Job.id == request.job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    try:
        cover_letter = await ai_service.generate_cover_letter(
            job_title=job.title,
            job_description=job.description,
            apprentice_name=current_user.full_name,
            apprentice_bio=current_user.bio,
        )
        return GenerateCoverLetterResponse(cover_letter=cover_letter)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate cover letter: {str(e)}",
        )


@router.post("/match-jobs", response_model=list[JobMatchResponse])
async def match_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get job recommendations for current apprentice."""
    if current_user.role != UserRole.APPRENTICE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only apprentices can get job matches",
        )

    # Get open jobs
    jobs = db.query(Job).filter(Job.status == JobStatus.OPEN).limit(20).all()
    if not jobs:
        return []

    jobs_data = [
        {"id": str(job.id), "title": job.title, "description": job.description}
        for job in jobs
    ]

    try:
        matches = await ai_service.match_jobs_for_apprentice(
            apprentice_bio=current_user.bio,
            jobs=jobs_data,
        )
        return [JobMatchResponse(**m) for m in matches]
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to match jobs: {str(e)}",
        )
