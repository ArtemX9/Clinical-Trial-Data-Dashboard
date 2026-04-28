from fastapi.testclient import TestClient

from app.tests.factories import generate_create_participant_dto, generate_participant_dict

# --- Auth guard tests ---


def test_list_participants_no_token(client: TestClient):
    response = client.get("/api/participants")
    assert response.status_code == 401


def test_get_participant_no_token(client: TestClient):
    response = client.get("/api/participants/some-id")
    assert response.status_code == 401


def test_create_participant_no_token(client: TestClient):
    payload = generate_participant_dict()
    response = client.post("/api/participants", json=payload)
    assert response.status_code == 401


# --- Happy path tests ---


def test_list_participants_authenticated(client: TestClient, auth_headers: dict):
    response = client.get("/api/participants", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_participant_valid(client: TestClient, auth_headers: dict):
    dto = generate_create_participant_dto()
    payload = dto.model_dump()
    payload["enrollment_date"] = payload["enrollment_date"].isoformat()

    response = client.post("/api/participants", json=payload, headers=auth_headers)

    assert response.status_code == 201
    data = response.json()
    assert data["subject_id"] == dto.subject_id
    assert "participant_id" in data


def test_get_participant_by_id(client: TestClient, auth_headers: dict):
    dto = generate_create_participant_dto()
    payload = dto.model_dump()
    payload["enrollment_date"] = payload["enrollment_date"].isoformat()

    created = client.post("/api/participants", json=payload, headers=auth_headers).json()
    participant_id = created["participant_id"]

    response = client.get(f"/api/participants/{participant_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["participant_id"] == participant_id


def test_get_participant_not_found(client: TestClient, auth_headers: dict):
    response = client.get("/api/participants/nonexistent-uuid", headers=auth_headers)
    assert response.status_code == 404


# --- Validation: negative scenarios ---


def test_create_participant_missing_required_field(client: TestClient, auth_headers: dict):
    dto = generate_create_participant_dto()
    payload = dto.model_dump()
    payload["enrollment_date"] = payload["enrollment_date"].isoformat()
    del payload["subject_id"]

    response = client.post("/api/participants", json=payload, headers=auth_headers)
    assert response.status_code == 422


def test_create_participant_invalid_status(client: TestClient, auth_headers: dict):
    dto = generate_create_participant_dto()
    payload = dto.model_dump()
    payload["enrollment_date"] = payload["enrollment_date"].isoformat()
    payload["status"] = "deceased"  # not a valid enum value

    response = client.post("/api/participants", json=payload, headers=auth_headers)
    assert response.status_code == 422


def test_create_participant_invalid_study_group(client: TestClient, auth_headers: dict):
    dto = generate_create_participant_dto()
    payload = dto.model_dump()
    payload["enrollment_date"] = payload["enrollment_date"].isoformat()
    payload["study_group"] = "placebo"  # not a valid enum value

    response = client.post("/api/participants", json=payload, headers=auth_headers)
    assert response.status_code == 422


def test_create_participant_invalid_date_format(client: TestClient, auth_headers: dict):
    dto = generate_create_participant_dto()
    payload = dto.model_dump()
    payload["enrollment_date"] = "28-04-2026"  # wrong format, should be YYYY-MM-DD

    response = client.post("/api/participants", json=payload, headers=auth_headers)
    assert response.status_code == 422


def test_create_participant_age_out_of_range(client: TestClient, auth_headers: dict):
    dto = generate_create_participant_dto()
    payload = dto.model_dump()
    payload["enrollment_date"] = payload["enrollment_date"].isoformat()
    payload["age"] = 200  # exceeds max 150

    response = client.post("/api/participants", json=payload, headers=auth_headers)
    assert response.status_code == 422
