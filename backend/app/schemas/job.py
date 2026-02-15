from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.job import JobStatus
from app.schemas.user import UserResponse


class JobCreate(BaseModel):
    title: str
    description: str
    requirements: str | None = None
    budget_min: int | None = None
    budget_max: int | None = None
    budget_type: str = "fixed"
    estimated_hours: int | None = None
    deadline: date | None = None
    ai_generated_description: bool = False


class JobUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    requirements: str | None = None
    budget_min: int | None = None
    budget_max: int | None = None
    budget_type: str | None = None
    estimated_hours: int | None = None
    deadline: date | None = None
    status: JobStatus | None = None


class JobResponse(BaseModel):
    id: UUID
    sponsor_id: UUID
    title: str
    description: str
    requirements: str | None = None
    budget_min: int | None = None
    budget_max: int | None = None
    budget_type: str
    estimated_hours: int | None = None
    deadline: date | None = None
    status: JobStatus
    ai_generated_description: bool
    created_at: datetime
    application_count: int = 0
    sponsor: UserResponse | None = None

    class Config:
        from_attributes = True


class JobListResponse(BaseModel):
    jobs: list[JobResponse]
    total: int
