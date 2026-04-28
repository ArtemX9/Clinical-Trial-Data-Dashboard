from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.auth import get_current_user
from app.database import get_session
from app.models import User
from app.schemas import FieldError, ParticipantCreate, ParticipantResponse
from app.services.participant_service import (
    add_participant,
    fetch_all_participants,
    fetch_participant,
)

router = APIRouter(prefix="/api/participants", tags=["participants"])


@router.get("", response_model=list[ParticipantResponse])
def list_participants(
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user),
):
    return fetch_all_participants(session)


@router.get("/{participant_id}", response_model=ParticipantResponse)
def get_participant(
    participant_id: str,
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user),
):
    return fetch_participant(session, participant_id)


@router.post(
    "",
    response_model=ParticipantResponse,
    status_code=status.HTTP_201_CREATED,
    responses={422: {"model": list[FieldError]}},
)
def create_participant(
    body: ParticipantCreate,
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user),
):
    return add_participant(session, body)
