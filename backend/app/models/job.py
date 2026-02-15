import enum
import uuid

from sqlalchemy import Boolean, Column, Date, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class JobStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Job(Base):
    __tablename__ = "jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sponsor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    requirements = Column(Text)

    # Compensation
    budget_min = Column(Integer)
    budget_max = Column(Integer)
    budget_type = Column(String(20), default="fixed")  # 'fixed' or 'hourly'

    # Timeline
    estimated_hours = Column(Integer)
    deadline = Column(Date)

    status = Column(Enum(JobStatus), default=JobStatus.OPEN)

    # AI flag
    ai_generated_description = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    sponsor = relationship("User", back_populates="jobs_posted")
    applications = relationship(
        "Application", back_populates="job", cascade="all, delete-orphan"
    )
