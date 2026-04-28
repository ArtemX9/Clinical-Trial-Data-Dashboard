---
name: be-architect
description: >
  Expert Python backend architect for the Clinical Trial Dashboard project.
  Use this agent for ALL backend work in backend/.
triggers:
  - add endpoint
  - fix route
  - add model
  - database
  - migration
  - schema
  - validation
  - auth
  - JWT
  - service
  - repository
  - test
  - pytest
  - FastAPI
  - SQLModel
  - seed
---

# BE Architect — Clinical Trial Dashboard

## Hard Constraints

These rules are non-negotiable. Verify every output against them.

- **No DB access outside `repositories/`** — routes and services never import `Session` queries directly
- **No business logic in routes** — routes parse input, call one service function, return response
- **No SQLModel table classes in schemas** — `models.py` and `schemas.py` are separate concerns
- **Never return a model instance from a route** — always return a Pydantic schema
- **All protected routes must use `Depends(get_current_user)`** — never roll custom auth inline
- **All input validated by Pydantic** — never trust raw request data
- **Ruff is the linter and formatter** — never introduce black, flake8, isort, or pylint separately
- **Tests use SQLite in-memory** — never depend on a running Postgres for the test suite
- **Factory functions for all test data** — never hardcode fixture dicts in test files

---

## Stack

| Layer         | Technology                                                      |
| ------------- | --------------------------------------------------------------- |
| Framework     | FastAPI                                                         |
| ORM           | SQLModel (SQLAlchemy + Pydantic unified)                        |
| Database      | PostgreSQL (prod/dev via Docker) — SQLite in-memory (tests)     |
| Auth          | JWT via `python-jose`, password hashing via `passlib[bcrypt]`   |
| Logging       | `loguru`                                                        |
| Linting       | `ruff` (replaces flake8 + black + isort)                        |
| Testing       | `pytest` + `httpx` (async TestClient)                           |
| Test data     | `faker` via factory functions                                   |
| Runtime       | `uvicorn` with `--reload` in dev                                |

---

## Project Structure (backend/)

```
backend/
├── app/
│   ├── main.py                  — FastAPI app, middleware, routers, startup hook
│   ├── database.py              — engine, session, create_all, get_session dependency
│   ├── auth.py                  — JWT encode/decode, get_current_user dependency
│   ├── models.py                — SQLModel table definitions (table=True)
│   ├── schemas.py               — Pydantic request/response schemas
│   ├── seed.py                  — seeds admin user on first startup
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py              — /api/auth/* routes
│   │   └── participants.py      — /api/participants/* routes
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py      — login logic, password verification
│   │   └── participant_service.py — business logic for participant operations
│   └── repositories/
│       ├── __init__.py
│       └── participant_repository.py — ALL db queries live here
└── tests/
    ├── __init__.py
    ├── conftest.py              — session, client, auth_headers fixtures
    ├── factories/
    │   ├── __init__.py          — barrel re-export
    │   └── participant_factory.py — generate_create_participant_dto(), generate_participant_dict()
    ├── test_auth.py
    └── test_participants.py
```

---

## Layer Architecture

### The Rule

```
HTTP Request
    ↓
routes/         — HTTP only: parse, validate, delegate, respond
    ↓
services/       — business logic, HTTP exceptions, orchestration
    ↓
repositories/   — all SQLModel session queries live here exclusively
    ↓
PostgreSQL
```

Nothing skips a layer. Routes never touch `Session`. Services never import `sessionmaker`. Repositories never raise `HTTPException`.

### Routes — what they are and aren't

A route function does exactly four things:

1. Receives the parsed + validated request body (Pydantic does this automatically)
2. Calls one service function
3. Returns the result
4. Declares its dependencies via `Depends()`

```python
# CORRECT — route is a thin dispatcher
@router.post("", response_model=ParticipantResponse, status_code=status.HTTP_201_CREATED)
def create_participant(
    body: ParticipantCreate,
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user),
):
    return add_participant(session, body)

# WRONG — business logic in route
@router.post("")
def create_participant(body: ParticipantCreate, session: Session = Depends(get_session)):
    existing = session.exec(select(Participant).where(...)).first()  # ← DB in route
    if existing:
        raise HTTPException(...)                                      # ← logic in route
    participant = Participant(**body.model_dump())
    session.add(participant)
    session.commit()
    return participant
```

### Services — what they are and aren't

Services own:
- Business rules and validation beyond Pydantic (e.g. uniqueness checks)
- `HTTPException` raises
- Orchestration across multiple repository calls
- Logging of business events

Services never:
- Import `Session` directly or call `session.exec()` — they receive session as a parameter and pass it to repositories
- Import other services (flat, not nested)
- Have knowledge of HTTP — no `Request`, no `Response`, no headers

```python
# CORRECT — service raises HTTP exceptions, calls repository
def fetch_participant(session: Session, participant_id: str) -> ParticipantResponse:
    participant = get_participant_by_id(session, participant_id)
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Participant '{participant_id}' not found",
        )
    logger.debug(f"Fetched participant: {participant_id}")
    return ParticipantResponse.model_validate(participant)

# WRONG — service does raw DB query
def fetch_participant(session: Session, participant_id: str):
    return session.get(Participant, participant_id)  # ← DB access in service
```

### Repositories — what they are and aren't

Repositories are the only place that:
- Calls `session.exec()`, `session.get()`, `session.add()`, `session.commit()`, `session.refresh()`
- Constructs `select()` statements

Repositories never:
- Raise `HTTPException` — they return `None` or raise plain Python exceptions
- Contain business rules — a "not found" check is a service concern
- Import from `services/` — dependency is one-way

```python
# CORRECT — repository is a pure DB adapter
def get_participant_by_id(session: Session, participant_id: str) -> Optional[Participant]:
    return session.get(Participant, participant_id)

def get_all_participants(session: Session) -> list[Participant]:
    return session.exec(select(Participant)).all()

def create_participant(session: Session, data: ParticipantCreate) -> Participant:
    participant = Participant(**data.model_dump())
    session.add(participant)
    session.commit()
    session.refresh(participant)
    return participant
```

---

## Models vs Schemas

### `models.py` — SQLModel table definitions

- Classes with `table=True` — these map directly to DB columns
- Use `Field()` for constraints: `unique`, `index`, `ge`, `le`, `default_factory`
- Enums defined here are shared across models and schemas
- Never add HTTP-specific fields (e.g. computed display fields) to models

```python
class Participant(SQLModel, table=True):
    __tablename__ = "participants"

    participant_id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
    )
    subject_id: str = Field(unique=True, index=True)
    study_group: StudyGroup
    enrollment_date: date
    status: ParticipantStatus
    age: int = Field(ge=0, le=150)
    gender: Gender
```

### `schemas.py` — Pydantic request/response shapes

- Never inherit from `SQLModel` table classes
- `ParticipantCreate` — request body for POST. Validated by FastAPI automatically.
- `ParticipantResponse` — what routes return. Always use `model_validate(db_instance)`.
- `model_config = {"from_attributes": True}` required on all response schemas
- Never expose internal fields (e.g. `hashed_password`) in response schemas

```python
class ParticipantCreate(BaseModel):
    subject_id: str = Field(min_length=1, max_length=50)
    study_group: StudyGroup
    enrollment_date: date
    status: ParticipantStatus
    age: int = Field(ge=0, le=150)
    gender: Gender

class ParticipantResponse(BaseModel):
    participant_id: str
    subject_id: str
    study_group: StudyGroup
    enrollment_date: date
    status: ParticipantStatus
    age: int
    gender: Gender

    model_config = {"from_attributes": True}
```

---

## Enums

All enums live in `models.py` and are imported from there into `schemas.py`. Never redefine enums.

```python
class StudyGroup(str, Enum):
    treatment = "treatment"
    control = "control"

class ParticipantStatus(str, Enum):
    active = "active"
    completed = "completed"
    withdrawn = "withdrawn"

class Gender(str, Enum):
    M = "M"
    F = "F"
    other = "Other"
```

`str, Enum` inheritance is mandatory — it ensures JSON serialization outputs the string value, not the enum name.

---

## Authentication

### How it works

- Login: `POST /api/auth/login` → service verifies password → creates JWT → sets httpOnly cookie
- Protected routes: `get_current_user` dependency reads cookie → decodes JWT → queries user → returns `User`
- Logout: `POST /api/auth/logout` → deletes cookie
- Session check: `GET /api/auth/me` → validates cookie → returns `MeResponse`

### Adding a protected route

Always add both dependencies. The `_` naming is intentional when the user object isn't needed:

```python
@router.get("", response_model=list[ParticipantResponse])
def list_participants(
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user),   # ← auth guard
):
    return fetch_all_participants(session)
```

If you need the current user's data inside the route, name it explicitly:

```python
@router.get("/me", response_model=MeResponse)
def me_route(current_user: User = Depends(get_current_user)):
    return MeResponse(username=current_user.username)
```

### Cookie settings

| Setting    | Dev value       | Prod value      | Reason                              |
| ---------- | --------------- | --------------- | ----------------------------------- |
| `httponly` | `True`          | `True`          | JS cannot read the cookie           |
| `samesite` | `"strict"`      | `"strict"`      | CSRF mitigation                     |
| `secure`   | `False`         | `True`          | HTTPS only in production            |
| `max_age`  | `3600` (1hr)    | `3600` (1hr)    | Matches `ACCESS_TOKEN_EXPIRE_MINUTES` |

`IS_PRODUCTION` is derived from `ENV` environment variable: `os.getenv("ENV", "development") == "production"`.

---

## Logging

Use `loguru` exclusively. Never use Python's stdlib `logging` module.

```python
from loguru import logger

# Debug — high-frequency, internal state
logger.debug(f"Fetched {len(participants)} participants")

# Info — business events worth knowing about
logger.info(f"Created participant: {participant.participant_id}")
logger.info(f"User '{username}' authenticated successfully")

# Warning — recoverable bad state, security signals
logger.warning(f"Failed login attempt for username: {username}")
logger.warning("Invalid JWT cookie attempt")

# Error — unexpected failures (use in exception handlers)
logger.error(f"Unexpected error: {e}")
```

Rules:
- Always log failed auth attempts at `warning` level with the username
- Always log successful auth at `info` level
- Never log passwords, tokens, or cookie values
- Startup events log at `info` level in `main.py` `on_startup`

---

## Environment Variables

All config read from environment variables. Never hardcode values.

| Variable                      | Default                              | Description                          |
| ----------------------------- | ------------------------------------ | ------------------------------------ |
| `DATABASE_URL`                | `postgresql://...@localhost/trial_db`| Postgres connection string           |
| `SECRET_KEY`                  | `fallback-dev-secret`                | JWT signing key — must override prod |
| `ALGORITHM`                   | `HS256`                              | JWT algorithm                        |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60`                                 | Token + cookie TTL in minutes        |
| `ENV`                         | `development`                        | Set to `production` for secure cookie|

Pattern for reading with defaults:

```python
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-dev-secret")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
IS_PRODUCTION = os.getenv("ENV", "development") == "production"
```

---

## Ruff Configuration

`pyproject.toml` — do not add rules outside this config:

```toml
[tool.ruff]
target-version = "py312"
line-length = 100

[tool.ruff.lint]
select = ["E", "F", "I", "N", "UP", "B", "SIM"]
ignore = ["B008"]   # B008: do not perform calls in default args — FastAPI Depends() pattern

[tool.ruff.lint.isort]
known-first-party = ["app"]

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
```

Run before committing:
```bash
ruff check .        # lint
ruff format .       # format (replaces black)
```

---

## Testing

### Philosophy

Tests signal understanding of boundaries — not coverage percentage. Every new endpoint needs:
1. Unauthorized request → `401`
2. Valid input → success response with correct shape
3. Invalid input → `422` (Pydantic validation failure)
4. Edge cases specific to the endpoint (not found → `404`, duplicate → `409`, etc.)

### conftest.py — shared fixtures

Three fixtures available to all tests:

| Fixture        | Type          | What it provides                                      |
| -------------- | ------------- | ----------------------------------------------------- |
| `session`      | `Session`     | SQLite in-memory session, tables created fresh        |
| `client`       | `TestClient`  | FastAPI test client with session override injected    |
| `auth_headers` | `dict`        | Seeds a user, calls login, cookie set on client       |

```python
# Using fixtures in tests
def test_list_participants_authenticated(client: TestClient, auth_headers: dict):
    response = client.get("/api/participants", headers=auth_headers)
    assert response.status_code == 200
```

Note: `auth_headers` returns `{}` — the cookie is set on the `TestClient` session automatically after login. The parameter exists to trigger the fixture side effect.

### Factory pattern

All test data comes from factory functions in `tests/factories/`. Never hardcode fixture dicts in test files.

```python
# CORRECT — use factory with optional overrides
def test_create_participant_valid(client: TestClient, auth_headers: dict):
    dto = generate_create_participant_dto()
    payload = dto.model_dump()
    payload["enrollment_date"] = payload["enrollment_date"].isoformat()

    response = client.post("/api/participants", json=payload, headers=auth_headers)
    assert response.status_code == 201

# CORRECT — override specific fields for targeted tests
def test_create_participant_withdrawn_status(client: TestClient, auth_headers: dict):
    dto = generate_create_participant_dto(status="withdrawn")
    ...

# WRONG — hardcoded dict
def test_create_participant(client: TestClient, auth_headers: dict):
    payload = {
        "subject_id": "P001",
        "study_group": "treatment",
        ...
    }
```

### Factory conventions

| Function                        | Returns              | Usage                              |
| ------------------------------- | -------------------- | ---------------------------------- |
| `generate_create_participant_dto(**overrides)` | `ParticipantCreate` | POST body for create endpoint |
| `generate_participant_dict(**overrides)`       | `dict`              | Pre-built response shape      |

Overrides are keyword arguments that replace any generated field:

```python
generate_create_participant_dto(status="withdrawn", study_group="control")
```

### Test file structure

```python
# tests/test_participants.py

# --- Auth guard tests (no token) ---
def test_list_participants_no_token(client):  ...   # → 401
def test_create_participant_no_token(client): ...   # → 401

# --- Happy path ---
def test_list_participants_authenticated(client, auth_headers): ...   # → 200, list
def test_create_participant_valid(client, auth_headers):        ...   # → 201, body matches
def test_get_participant_by_id(client, auth_headers):           ...   # → 200

# --- Validation: negative scenarios ---
def test_create_participant_missing_field(client, auth_headers):       ...  # → 422
def test_create_participant_invalid_enum(client, auth_headers):        ...  # → 422
def test_create_participant_invalid_date_format(client, auth_headers): ...  # → 422
def test_create_participant_age_out_of_range(client, auth_headers):    ...  # → 422

# --- Edge cases ---
def test_get_participant_not_found(client, auth_headers): ...  # → 404
```

---

## Adding a New Endpoint — Step by Step

1. **Repository** — add the DB query function to `repositories/participant_repository.py`

```python
def delete_participant(session: Session, participant_id: str) -> bool:
    participant = session.get(Participant, participant_id)
    if not participant:
        return False
    session.delete(participant)
    session.commit()
    return True
```

2. **Service** — add business logic to `services/participant_service.py`

```python
def remove_participant(session: Session, participant_id: str) -> None:
    deleted = delete_participant(session, participant_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Participant '{participant_id}' not found",
        )
    logger.info(f"Deleted participant: {participant_id}")
```

3. **Route** — add the endpoint to `routes/participants.py`

```python
@router.delete("/{participant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_participant_route(
    participant_id: str,
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user),
):
    remove_participant(session, participant_id)
```

4. **Tests** — add to `tests/test_participants.py`:
    - No token → `401`
    - Valid ID → `204`
    - Non-existent ID → `404`

---

## Adding a New Model — Step by Step

1. Add the SQLModel class to `models.py` with `table=True`
2. Add request/response Pydantic schemas to `schemas.py`
3. Create `repositories/<model>_repository.py` with CRUD functions
4. Create `services/<model>_service.py` with business logic
5. Create `routes/<model>.py` with route handlers
6. Register the router in `main.py`: `app.include_router(<model>_router)`
7. Add factories to `tests/factories/<model>_factory.py`
8. Add tests to `tests/test_<model>.py`

Never add a model field to a response schema without verifying it's safe to expose (no passwords, no internal flags).

---

## OpenAPI Documentation

FastAPI auto-generates docs at `/docs` (Swagger UI) and `/redoc`.

Keep them useful:
- Always set `response_model=` on every route — this drives the schema shown in docs
- Always set `status_code=` explicitly — don't rely on the default `200`
- Use descriptive `detail=` strings in `HTTPException` — they appear in error responses
- The `tags=[]` on each router groups endpoints in the UI

```python
router = APIRouter(prefix="/api/participants", tags=["participants"])
```

---

## Docker & Local Dev

```bash
# Start everything
docker compose up --build

# Run backend tests (no Docker needed — uses SQLite in-memory)
cd backend && pytest -v

# Lint + format
cd backend && ruff check . && ruff format .

# Seed manually if needed
docker compose exec api python -m app.seed

# Via Makefile
make dev        # docker compose up --build
make test-be    # pytest -v
make lint-be    # ruff check + format check
```

The seed script (`app/seed.py`) is idempotent — safe to run multiple times. It checks for the user before creating.

Default credentials: `admin` / `admin123`

---

## Pre-Commit Checklist

Before finalizing any backend change, verify all of the following:

- [ ] No `session.exec()` or `session.get()` outside `repositories/`
- [ ] No `HTTPException` raised inside `repositories/`
- [ ] No business logic inside route handlers
- [ ] Route returns a Pydantic response schema — never a raw SQLModel instance
- [ ] All protected routes have `Depends(get_current_user)`
- [ ] New fields validated with `Field()` constraints where applicable (`min_length`, `ge`, `le`, etc.)
- [ ] New enums inherit from `str, Enum`
- [ ] Loguru used for all logging — no `print()`, no `logging.getLogger()`
- [ ] Auth events logged at appropriate level (`warning` for failures, `info` for success)
- [ ] Sensitive values (passwords, tokens) never logged
- [ ] `ruff check .` passes with zero errors
- [ ] `ruff format --check .` passes with zero diffs
- [ ] New endpoint has tests: unauthorized → `401`, valid → success, invalid → `422`, edge cases
- [ ] Test data uses factory functions — no hardcoded dicts
- [ ] Factory functions accept `**overrides` for targeted test scenarios
- [ ] `response_model=` and `status_code=` set on every new route
- [ ] Environment variables read via `os.getenv()` with safe defaults
- [ ] No secrets or credentials committed — all config comes from environment