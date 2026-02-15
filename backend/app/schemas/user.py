from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr

from app.models.user import UserRole


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: UserRole
    full_name: str
    bio: str | None = None
    company_name: str | None = None
    company_website: str | None = None
    portfolio_url: str | None = None
    github_url: str | None = None
    linkedin_url: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: str | None = None
    bio: str | None = None
    company_name: str | None = None
    company_website: str | None = None
    portfolio_url: str | None = None
    github_url: str | None = None
    linkedin_url: str | None = None


class UserResponse(BaseModel):
    id: UUID
    email: str
    role: UserRole
    full_name: str
    bio: str | None = None
    company_name: str | None = None
    company_website: str | None = None
    portfolio_url: str | None = None
    github_url: str | None = None
    linkedin_url: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
