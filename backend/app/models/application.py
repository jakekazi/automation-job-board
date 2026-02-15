import enum
import uuid

from sqlalchemy import Boolean, Column, DateTime, Enum, Float, ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class ApplicationStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class Application(Base):
    __tablename__ = "applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=False)
    apprentice_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    cover_letter = Column(Text)
    proposed_rate = Column(Integer)
    estimated_completion_days = Column(Integer)

    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.PENDING)

    # AI features
    ai_match_score = Column(Float)
    ai_generated_cover_letter = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    job = relationship("Job", back_populates="applications")
    apprentice = relationship("User", back_populates="applications")
