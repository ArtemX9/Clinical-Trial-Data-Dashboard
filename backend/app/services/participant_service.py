from fastapi import HTTPException, status
from loguru import logger
from sqlmodel import Session

from app.repositories.participant_repository import (
    create_participant,
    get_all_participants,
    get_participant_by_id,
    get_participant_by_subject_id,
)
from app.schemas import FieldError, ParticipantCreate, ParticipantResponse


def fetch_all_participants(session: Session) -> list[ParticipantResponse]:
    participants = get_all_participants(session)
    logger.debug(f"Fetched {len(participants)} participants")
    return [ParticipantResponse.model_validate(p) for p in participants]


def fetch_participant(session: Session, participant_id: str) -> ParticipantResponse:
    participant = get_participant_by_id(session, participant_id)
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Participant '{participant_id}' not found",
        )
    return ParticipantResponse.model_validate(participant)


def add_participant(session: Session, data: ParticipantCreate) -> ParticipantResponse:
    errors: list[FieldError] = []

    if get_participant_by_subject_id(session, data.subject_id):
        errors.append(FieldError(field="subject_id", error="Subject ID already exists"))

    if errors:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=[e.model_dump() for e in errors],
        )

    participant = create_participant(session, data)
    logger.info(f"Created participant: {participant.participant_id}")
    return ParticipantResponse.model_validate(participant)
