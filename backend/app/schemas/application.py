from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.application import ApplicationStatus
from app.schemas.user import UserResponse


class ApplicationCreate(BaseModel):
    job_id: UUID
    cover_letter: str | None = None
    proposed_rate: int | None = None
    estimated_completion_days: int | None = None
    ai_generated_cover_letter: bool = False


class ApplicationUpdate(BaseModel):
    cover_letter: str | None = None
    proposed_rate: int | None = None
    estimated_completion_days: int | None = None


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus


class ApplicationResponse(BaseModel):
    id: UUID
    job_id: UUID
    apprentice_id: UUID
    cover_letter: str | None = None
    proposed_rate: int | None = None
    estimated_completion_days: int | None = None
    status: ApplicationStatus
    ai_match_score: float | None = None
    ai_generated_cover_letter: bool
    created_at: datetime
    apprentice: UserResponse | None = None

    class Config:
        from_attributes = True
