import os

from fastapi import APIRouter, Depends, Response
from sqlmodel import Session

from app.auth import COOKIE_NAME, get_current_user
from app.database import get_session
from app.models import User
from app.schemas import LoginRequest, MeResponse
from app.services.auth_service import login

router = APIRouter(prefix="/api/auth", tags=["auth"])

COOKIE_MAX_AGE = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")) * 60
IS_PRODUCTION = os.getenv("ENV", "development") == "production"


@router.post("/login", response_model=MeResponse)
def login_route(
    body: LoginRequest,
    response: Response,
    session: Session = Depends(get_session),
):
    result = login(session, body.username, body.password)
    response.set_cookie(
        key=COOKIE_NAME,
        value=result.access_token,
        httponly=True,
        samesite="strict",
        secure=IS_PRODUCTION,
        max_age=COOKIE_MAX_AGE,
    )
    return MeResponse(username=body.username)


@router.post("/logout")
def logout_route(response: Response):
    response.delete_cookie(key=COOKIE_NAME, samesite="strict")
    return {"message": "Logged out"}


@router.get("/me", response_model=MeResponse)
def me_route(current_user: User = Depends(get_current_user)):
    return MeResponse(username=current_user.username)
