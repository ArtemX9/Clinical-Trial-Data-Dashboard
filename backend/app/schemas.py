from datetime import date

from pydantic import BaseModel, Field

from app.models import Gender, ParticipantStatus, StudyGroup


class FieldError(BaseModel):
    field: str
    error: str


class ParticipantCreate(BaseModel):
    subject_id: str = Field(min_length=1, max_length=50)
    study_group: StudyGroup
    enrollment_date: date
    status: ParticipantStatus
    age: int = Field(ge=0, le=150)
    gender: Gender


class ParticipantResponse(BaseModel):
    participant_id: str
    subject_id: str
    study_group: StudyGroup
    enrollment_date: date
    status: ParticipantStatus
    age: int
    gender: Gender

    model_config = {"from_attributes": True}


class MeResponse(BaseModel):
    username: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    username: str = Field(min_length=1)
    password: str = Field(min_length=1)
