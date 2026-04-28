from loguru import logger
from sqlmodel import Session

from app.database import engine, init_db
from app.repositories.participant_repository import create_user, get_user_by_username
from app.services.auth_service import hash_password

SEED_USERNAME = "admin"
SEED_PASSWORD = "admin123"


def seed() -> None:
    init_db()
    with Session(engine) as session:
        existing = get_user_by_username(session, SEED_USERNAME)
        if existing:
            logger.info("Seed user already exists, skipping")
            return
        create_user(session, SEED_USERNAME, hash_password(SEED_PASSWORD))
        logger.info(f"Seeded admin user: username='{SEED_USERNAME}' password='{SEED_PASSWORD}'")


if __name__ == "__main__":
    seed()
