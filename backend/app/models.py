import uuid
from datetime import date
from enum import Enum

from sqlmodel import Field, SQLModel


class StudyGroup(str, Enum):
    treatment = "treatment"
    control = "control"


class ParticipantStatus(str, Enum):
    active = "active"
    completed = "completed"
    withdrawn = "withdrawn"


class Gender(str, Enum):
    M = "M"
    F = "F"
    other = "Other"


class Participant(SQLModel, table=True):
    __tablename__ = "participants"

    participant_id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
    )
    subject_id: str = Field(unique=True, index=True)
    study_group: StudyGroup
    enrollment_date: date
    status: ParticipantStatus
    age: int = Field(ge=0, le=150)
    gender: Gender


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    hashed_password: str
