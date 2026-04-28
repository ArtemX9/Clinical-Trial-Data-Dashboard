import os
from datetime import UTC, datetime, timedelta

from fastapi import Depends, HTTPException, Request, status
from jose import JWTError, jwt
from loguru import logger
from sqlmodel import Session

from app.database import get_session
from app.repositories.participant_repository import get_user_by_username

SECRET_KEY = os.getenv("SECRET_KEY", "fallback-dev-secret")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
COOKIE_NAME = "access_token"


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(UTC) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    request: Request,
    session: Session = Depends(get_session),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )

    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        logger.warning("Invalid JWT cookie attempt")
        raise credentials_exception from None

    user = get_user_by_username(session, username)
    if user is None:
        raise credentials_exception

    return user
