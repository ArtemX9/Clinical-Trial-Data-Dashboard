from fastapi.testclient import TestClient
from sqlmodel import Session

from app.repositories.participant_repository import create_user
from app.services.auth_service import hash_password

VALID_USERNAME = "researcher"
VALID_PASSWORD = "securepass"


def test_login_valid_credentials(session: Session, client: TestClient):
    create_user(session, VALID_USERNAME, hash_password(VALID_PASSWORD))

    response = client.post(
        "/api/auth/login",
        json={"username": VALID_USERNAME, "password": VALID_PASSWORD},
    )

    assert response.status_code == 200
    data = response.json()
    assert "username" in data
    assert data["username"] == VALID_USERNAME


def test_login_wrong_password(session: Session, client: TestClient):
    create_user(session, VALID_USERNAME, hash_password(VALID_PASSWORD))

    response = client.post(
        "/api/auth/login",
        json={"username": VALID_USERNAME, "password": "wrongpassword"},
    )

    assert response.status_code == 401


def test_login_unknown_user(client: TestClient):
    response = client.post(
        "/api/auth/login",
        json={"username": "ghost", "password": "irrelevant"},
    )

    assert response.status_code == 401


def test_login_missing_username(client: TestClient):
    response = client.post("/api/auth/login", json={"password": VALID_PASSWORD})
    assert response.status_code == 422


def test_login_missing_password(client: TestClient):
    response = client.post("/api/auth/login", json={"username": VALID_USERNAME})
    assert response.status_code == 422


def test_login_empty_fields(client: TestClient):
    response = client.post("/api/auth/login", json={"username": "", "password": ""})
    assert response.status_code == 422
