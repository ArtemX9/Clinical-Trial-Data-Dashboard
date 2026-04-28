import bcrypt
from fastapi import HTTPException, status
from loguru import logger
from sqlmodel import Session

from app.auth import create_access_token
from app.repositories.participant_repository import get_user_by_username
from app.schemas import TokenResponse


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def login(session: Session, username: str, password: str) -> TokenResponse:
    user = get_user_by_username(session, username)

    if not user or not verify_password(password, user.hashed_password):
        logger.warning(f"Failed login attempt for username: {username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    token = create_access_token(data={"sub": user.username})
    logger.info(f"User '{username}' authenticated successfully")
    return TokenResponse(access_token=token)
