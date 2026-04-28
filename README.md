# Clinical Trial Dashboard

Full stack application for visualizing and managing clinical trial participant data.

---

## Quick Start

### Run with Docker (recommended)

```bash
docker compose up --build
```

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:5173        |
| API      | http://localhost:8000        |
| API Docs | http://localhost:8000/docs   |

**Default credentials:** `admin` / `admin123` (seeded on first startup)

### Run locally (without Docker)

**Backend:**
```bash
cd backend
pip install -r requirements.txt
DATABASE_URL=postgresql://... SECRET_KEY=dev uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
VITE_API_URL=http://localhost:8000 npm run dev
```

---

## Testing

**Backend:**
```bash
cd backend
pytest -v
```

**Frontend:**
```bash
cd frontend
npm run test
```

**Both via Makefile:**
```bash
make test
```

---

## Authenticate and call a protected route

```bash
# 1. Login — server sets httpOnly cookie in the response
curl -c cookies.txt -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 2. Call protected endpoint — cookie sent automatically
curl -b cookies.txt http://localhost:8000/api/participants

# 3. Logout — server clears the cookie
curl -b cookies.txt -c cookies.txt -X POST http://localhost:8000/api/auth/logout
```

---

## Technologies & Rationale

### Backend

| Technology | Reason |
|---|---|
| **FastAPI** | Auto-generates OpenAPI docs, Pydantic validation built-in, async-ready, minimal boilerplate |
| **SQLModel** | Combines SQLAlchemy + Pydantic — one class for DB model and API schema, same author as FastAPI |
| **PostgreSQL** | Production-grade, future-proof for regulatory reporting and AI integrations; SQLite rejected as incompatible with the "future needs" requirement |
| **python-jose + passlib** | Standard JWT + bcrypt combo, well-documented FastAPI integration |
| **loguru** | Structured logging with zero config, far cleaner than Python's stdlib `logging` |
| **ruff** | Replaces flake8 + black + isort in a single tool |
| **pytest + httpx** | Async-compatible test client for FastAPI, factory pattern with `faker` for test data |

### Frontend

| Technology | Reason |
|---|---|
| **React + Vite + TypeScript** | Fast DX, strict typing throughout |
| **Redux Toolkit + RTK Query** | Chosen over lighter alternatives (Zustand + React Query) for explicit scalability — this app is expected to grow; RTK Query handles caching, invalidation, and loading states; Redux provides predictable global state |
| **React Router v6** | Nested route support, clean protected route pattern via `<Outlet />` |
| **shadcn/ui + Tailwind** | Pre-built accessible components on a white/neutral theme appropriate for a clinical context; avoids writing CSS from scratch |
| **Zod + react-hook-form** | Schema-first validation — one Zod schema serves as both form validator and TypeScript type source; `transformResponse` in RTK Query uses same schemas to validate API responses at the boundary |
| **Recharts** | Wrapped behind `@/components/charts/*` — Recharts is never imported directly in pages or features |
| **Vitest + RTL** | Co-located with Vite config, fast, factory-based test data via `@faker-js/faker` |

---

## Architecture

### Backend: Route → Service → Repository

```
HTTP Request
    ↓
routes/         — parse request, validate input via Pydantic, call service, return response
    ↓
services/       — business logic, orchestration, raises HTTP exceptions
    ↓
repositories/   — all DB access lives here exclusively; nothing else queries the DB
    ↓
PostgreSQL
```

No route accesses the DB directly. No service imports SQLAlchemy directly. This makes services independently testable and the DB implementation swappable.

### Frontend: Container / Presentational split

Every non-trivial feature is split:

- **Container** (`*Container.tsx`) — owns RTK Query hooks, Redux dispatch, side effects. No Tailwind. No markup beyond a plain wrapper.
- **Presentational** — receives typed props, owns UI state and markup. Never calls RTK Query.

Chart components (`@/components/charts/`) are the only consumers of Recharts. Pages reference `@/components/charts/BarChart`, never `recharts` directly. This isolates the charting library behind a stable interface.

---

## What's Implemented

- [x] FastAPI backend with full CRUD (Create, Read All, Read One)
- [x] JWT authentication with seeded admin user
- [x] Route → Service → Repository layering (no DB calls in routes)
- [x] Input validation via Pydantic (backend) and Zod (frontend)
- [x] React frontend: Login, Participants list, Add Participant form, Metrics dashboard
- [x] RTK Query with `transformResponse` Zod validation
- [x] Container/Presentational architecture
- [x] Recharts wrapped behind interface components
- [x] Docker Compose with Postgres, API, Frontend
- [x] GitHub Actions CI (parallel backend + frontend jobs)
- [x] Test factories (`generate_*` pattern) with `faker`
- [x] Backend: auth tests + participant CRUD + validation (positive + negative)
- [x] Frontend: LoginPage unit tests with RTL

## What's Skipped (and why)

| Feature | Reason |
|---|---|
| Update/Delete participant | Deprioritized — adds ~30min for low evaluation signal; architecture supports it trivially |
| Alembic migrations | `create_all()` on startup is appropriate for a dev/demo environment; production would use Alembic with versioned migrations |
| E2E tests (Playwright/Cypress) | Setup cost (~45min) not justified for a time-boxed challenge; integration tests cover the same auth/validation boundaries |
| Pagination & filtering | Out of scope for v1; RTK Query cache invalidation and URL params are the natural extension point |
| Real auth provider (Auth0/Keycloak) | Seeded JWT is appropriate for this scope; an ADR for OAuth2 with an IdP is the production path |

---

## What I'd Add With More Time

1. **Alembic migrations** — versioned DB schema changes
2. **Update/Delete participant** — trivial to add given existing layer structure
3. **Pagination + server-side filtering** — query params on `GET /api/participants`
4. **E2E tests** — Playwright covering login → add participant → verify in table
5. **Toast notifications** — success/error feedback on form submission (scaffolded in `AddParticipantDialogContainer`, not wired)
6. **Role-based access** — researcher vs admin roles, different route permissions
7. **Observability** — structured JSON logs (loguru already in place), Sentry for frontend errors, health check endpoint (already exists at `/health`)
8. **CI: Docker build job** — verify the compose stack builds cleanly on every PR

---

## Trade-offs

- **SQLModel vs separate SQLAlchemy + Pydantic schemas** — SQLModel reduces boilerplate significantly for this model count. At scale (20+ models with complex relationships), separate schemas give more control.
- **RTK Query vs React Query + Zustand** — RTK Query adds more boilerplate but is the right call if the app grows and needs complex cross-slice invalidation. For a 3-page app, React Query would be lighter.
- **In-memory auth state** — token is not persisted to `localStorage`. Refresh loses the session. Intentional for a challenge: persistent auth would use an httpOnly cookie set by the API.

---

## AI Tools Used

Claude (Anthropic) was used extensively for scaffolding:
- Project structure planning and stack decisions
- Boilerplate generation for all layers (routes, services, repositories, RTK slices, components)
- Test factory patterns and test case coverage planning

All architecture decisions, layer boundaries, naming conventions, and trade-off reasoning are my own. Every line of generated code was reviewed and I can explain any part of the solution.
