import random
import uuid

from faker import Faker

from app.schemas import ParticipantCreate

faker = Faker()

STUDY_GROUPS = ["treatment", "control"]
STATUSES = ["active", "completed", "withdrawn"]
GENDERS = ["M", "F", "Other"]

_subject_counter = 0


def _next_subject_id() -> str:
    global _subject_counter
    _subject_counter += 1
    return f"P{_subject_counter:03d}"


def generate_create_participant_dto(**overrides) -> ParticipantCreate:
    return ParticipantCreate(
        subject_id=overrides.get("subject_id", _next_subject_id()),
        study_group=overrides.get("study_group", random.choice(STUDY_GROUPS)),
        enrollment_date=overrides.get(
            "enrollment_date", faker.date_between(start_date="-1y", end_date="today").isoformat()
        ),
        status=overrides.get("status", random.choice(STATUSES)),
        age=overrides.get("age", faker.random_int(min=18, max=80)),
        gender=overrides.get("gender", random.choice(GENDERS)),
    )


def generate_participant_dict(**overrides) -> dict:
    dto = generate_create_participant_dto(**overrides)
    return {
        "participant_id": str(uuid.uuid4()),
        **dto.model_dump(),
        "enrollment_date": dto.enrollment_date.isoformat(),
    }
