import enum
import uuid

from sqlalchemy import Column, DateTime, Enum, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class UserRole(str, enum.Enum):
    SPONSOR = "sponsor"
    APPRENTICE = "apprentice"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)

    full_name = Column(String(255), nullable=False)
    bio = Column(Text)

    # Sponsor fields
    company_name = Column(String(255))
    company_website = Column(String(500))

    # Apprentice fields
    portfolio_url = Column(String(500))
    github_url = Column(String(500))
    linkedin_url = Column(String(500))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    jobs_posted = relationship("Job", back_populates="sponsor", cascade="all, delete-orphan")
    applications = relationship(
        "Application", back_populates="apprentice", cascade="all, delete-orphan"
    )
