from sqlmodel import Session, select

from app.models import Participant, User
from app.schemas import ParticipantCreate


def get_all_participants(session: Session) -> list[Participant]:
    return session.exec(select(Participant)).all()


def get_participant_by_id(session: Session, participant_id: str) -> Participant | None:
    return session.get(Participant, participant_id)


def get_participant_by_subject_id(session: Session, subject_id: str) -> Participant | None:
    return session.exec(select(Participant).where(Participant.subject_id == subject_id)).first()


def create_participant(session: Session, data: ParticipantCreate) -> Participant:
    participant = Participant(**data.model_dump())
    session.add(participant)
    session.commit()
    session.refresh(participant)
    return participant


def get_user_by_username(session: Session, username: str) -> User | None:
    return session.exec(select(User).where(User.username == username)).first()


def create_user(session: Session, username: str, hashed_password: str) -> User:
    user = User(username=username, hashed_password=hashed_password)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
