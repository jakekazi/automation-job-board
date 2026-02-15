"""Initial schema

Revision ID: 001
Revises:
Create Date: 2024-02-15

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create enum types
    user_role = postgresql.ENUM("sponsor", "apprentice", name="userrole", create_type=False)
    user_role.create(op.get_bind(), checkfirst=True)

    job_status = postgresql.ENUM(
        "open", "in_progress", "completed", "cancelled", name="jobstatus", create_type=False
    )
    job_status.create(op.get_bind(), checkfirst=True)

    application_status = postgresql.ENUM(
        "pending", "accepted", "rejected", "withdrawn", name="applicationstatus", create_type=False
    )
    application_status.create(op.get_bind(), checkfirst=True)

    # Create users table
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False, index=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("role", user_role, nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("bio", sa.Text),
        sa.Column("company_name", sa.String(255)),
        sa.Column("company_website", sa.String(500)),
        sa.Column("portfolio_url", sa.String(500)),
        sa.Column("github_url", sa.String(500)),
        sa.Column("linkedin_url", sa.String(500)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )

    # Create jobs table
    op.create_table(
        "jobs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "sponsor_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("requirements", sa.Text),
        sa.Column("budget_min", sa.Integer),
        sa.Column("budget_max", sa.Integer),
        sa.Column("budget_type", sa.String(20), default="fixed"),
        sa.Column("estimated_hours", sa.Integer),
        sa.Column("deadline", sa.Date),
        sa.Column("status", job_status, default="open"),
        sa.Column("ai_generated_description", sa.Boolean, default=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )
    op.create_index("idx_jobs_sponsor_id", "jobs", ["sponsor_id"])
    op.create_index("idx_jobs_status", "jobs", ["status"])

    # Create applications table
    op.create_table(
        "applications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "job_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("jobs.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "apprentice_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("cover_letter", sa.Text),
        sa.Column("proposed_rate", sa.Integer),
        sa.Column("estimated_completion_days", sa.Integer),
        sa.Column("status", application_status, default="pending"),
        sa.Column("ai_match_score", sa.Float),
        sa.Column("ai_generated_cover_letter", sa.Boolean, default=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.UniqueConstraint("job_id", "apprentice_id", name="uq_application_job_apprentice"),
    )
    op.create_index("idx_applications_job_id", "applications", ["job_id"])
    op.create_index("idx_applications_apprentice_id", "applications", ["apprentice_id"])
    op.create_index("idx_applications_status", "applications", ["status"])


def downgrade() -> None:
    op.drop_table("applications")
    op.drop_table("jobs")
    op.drop_table("users")

    op.execute("DROP TYPE IF EXISTS applicationstatus")
    op.execute("DROP TYPE IF EXISTS jobstatus")
    op.execute("DROP TYPE IF EXISTS userrole")
