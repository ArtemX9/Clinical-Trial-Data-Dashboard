# CLAUDE.md — Clinical Trial Dashboard

This file provides context for AI coding assistants working in this repository.

---

## Project Overview

Full stack clinical trial data dashboard. Researchers visualize and manage trial participant data.

- **Backend:** FastAPI + SQLModel + PostgreSQL
- **Frontend:** React + TypeScript + RTK Query + shadcn/ui
- **Auth:** JWT (issued by Python API, stored in Redux auth slice)
- **Run:** `docker compose up --build` → frontend at `:5173`, API at `:8000`, docs at `:8000/docs`

---

## Repository Structure

```
clinical-trial-dashboard/
├── backend/
│   ├── app/
│   │   ├── routes/          — HTTP only: parse request, call service, return response
│   │   ├── services/        — business logic, raises HTTP exceptions
│   │   ├── repositories/    — ALL db access lives here exclusively
│   │   ├── models.py        — SQLModel table definitions
│   │   ├── schemas.py       — Pydantic request/response schemas
│   │   ├── auth.py          — JWT encode/decode, get_current_user dependency
│   │   ├── database.py      — engine, session, create_all
│   │   ├── seed.py          — seeds admin user on startup
│   │   └── main.py          — FastAPI app, middleware, routers, startup hook
│   └── tests/
│       ├── factories/       — generate_*() factory functions using faker
│       ├── conftest.py      — sqlite in-memory session, TestClient, auth_headers fixtures
│       ├── test_auth.py
│       └── test_participants.py
└── frontend/
    └── src/
        ├── api/             — RTK Query slices (api.ts base + injected endpoints)
        ├── store/           — Redux store, authSlice, typed hooks
        ├── schemas/         — Zod schemas (source of truth for types + validation)
        ├── hooks/           — shared hooks (useAuth)
        ├── utils/           — cn() only
        ├── test/            — factories + renderWithProviders + setup
        ├── components/
        │   ├── ui/          — shadcn primitives (never modify directly)
        │   ├── charts/      — Recharts wrappers (ONLY place that imports recharts)
        │   ├── Layout/
        │   └── ProtectedRoute/
        └── pages/           — route-level pages; each owns its sub-components
```

---

## Backend Rules

### Layer boundaries — strictly enforced

```
Route → Service → Repository → DB
```

- **Routes** (`app/routes/`) — no business logic, no DB calls. Parse input, call service, return response.
- **Services** (`app/services/`) — business logic, HTTP exceptions. Call repositories only.
- **Repositories** (`app/repositories/`) — only place that touches SQLModel sessions and queries.

**Never add a `session.exec()` or `session.get()` call outside of `repositories/`.**

### Models vs Schemas

- `models.py` — SQLModel table classes (`table=True`). These map to DB columns.
- `schemas.py` — Pydantic classes for request bodies and API responses. Keep them separate.
- Never return a model instance directly from a route — always return a schema.

### Auth

- `get_current_user` is a FastAPI dependency in `app/auth.py`. Add it to any protected route via `_: User = Depends(get_current_user)`.
- JWT secret and algorithm are environment variables (`SECRET_KEY`, `ALGORITHM`).
- Seed user: `admin` / `admin123` — created in `app/seed.py` on startup if not present.

### Enums

Defined in `models.py` and shared across models and schemas:
- `StudyGroup`: `treatment`, `control`
- `ParticipantStatus`: `active`, `completed`, `withdrawn`
- `Gender`: `M`, `F`, `Other`

### Validation error format — unified 422 response

All 422 errors — Pydantic schema validation and business-logic checks — return the same shape:

```json
{"detail": [{"field": "subject_id", "error": "Subject ID already exists"}]}
```

- `FieldError` in `schemas.py` is the canonical unit: `field: str`, `error: str`
- `main.py` has a `RequestValidationError` handler that converts Pydantic's verbose errors to `list[FieldError]`
- Services do business-logic validation by collecting errors and raising `HTTPException` if any exist:

```python
errors: list[FieldError] = []
if get_participant_by_subject_id(session, data.subject_id):
    errors.append(FieldError(field="subject_id", error="Subject ID already exists"))
if errors:
    raise HTTPException(status_code=422, detail=[e.model_dump() for e in errors])
```

**Rules:**
- Never use a bare string `detail=` on a 422 — always `list[FieldError.model_dump()]`
- Repositories never raise validation errors — that is a service concern
- Frontend can rely on `error.data.detail` always being `{field, error}[]` for 422 responses

### Adding a new endpoint

1. Add repository function in `repositories/participant_repository.py`
2. Add service function in `services/participant_service.py`
3. Add route in `routes/participants.py` with `Depends(get_current_user)`
4. Add tests in `tests/test_participants.py` using factory data

### Testing

- Uses SQLite in-memory DB via `conftest.py` — no Postgres needed for tests
- Factory pattern: always use `generate_create_participant_dto()` / `generate_participant_dict()` from `tests/factories`
- Every new endpoint needs: unauthorized → 401, valid input → success, invalid input → 422

```bash
cd backend && pytest -v
```

---

## Frontend Rules

### Container / Presentational split — mandatory

| Rule | Container (`*Container.tsx`) | Presentational |
|---|---|---|
| RTK Query hooks | ✅ | ❌ Never |
| Redux dispatch | ✅ | ❌ Never |
| Tailwind classes | ❌ Never | ✅ |
| UI-only state (`isOpen`, etc.) | ❌ Never | ✅ |
| Props from parent | Rarely | Always |

### Component body order — strict, never reorder

```
1. Refs              — useRef
2. Redux hooks       — useAppDispatch, useAppSelector
3. RTK Query         — containers only
4. Context           — useContext
5. State             — useState
6. Derived values    — computed constants
7. Effects           — useEffect (named callback, never arrow)
8. Event handlers    — handleXxx
9. Early returns     — guard clauses
10. Main return      — lean JSX, delegates to renderXxx helpers
11. Render helpers   — defined AFTER return, INSIDE component
```

### useEffect — named callback, never arrow

```tsx
// CORRECT
useEffect(
  function syncFiltersWithUrl() { ... },
  [dependency],
);

// WRONG — never use arrow functions in useEffect
useEffect(() => { ... }, [dependency]);
```

### Lean return + renderXxx helpers

The `return` must be a readable "table of contents". Any JSX block longer than ~5–8 lines must be extracted into a `renderXxx()` helper defined after the return inside the same component.

```tsx
// CORRECT
return (
  <div>
    {renderHeader()}
    {renderTable()}
    {renderDialogs()}
  </div>
);

// WRONG — inline implementation in return
return (
  <div>
    <header>... 20 lines ...</header>
    <main>... 40 lines ...</main>
  </div>
);
```

### Interface naming

- Prefix `I` + ComponentName: `IParticipantsTable`, `IAddParticipantDialog`
- Order: required props → optional props → required handlers → optional handlers

### Import order — enforced by ESLint

```ts
// 1. React
import React, { useState } from 'react';

// 2. External libraries
import { Loader2 } from 'lucide-react';

// 3. Internal aliases (@/)
import { useGetParticipantsQuery } from '@/api/participantsApi';
import { Button } from '@/components/ui/button';

// 4. Local (same feature/folder)
import { ParticipantsTable } from './ParticipantsTable';
```

### shadcn/ui rules

- Import from `@/components/ui/` only — never from `@radix-ui` directly
- Never modify files in `components/ui/` — wrap and extend via `className` + `cn()`
- Add new primitives: `npx shadcn@latest add <component>`, commit the file

### Charts rules

- **Never import from `recharts` outside of `src/components/charts/`**
- Pages and features import from `@/components/charts/BarChart`, `@/components/charts/PieChart`, etc.
- Each wrapper exposes a typed `I*` interface — keep Recharts internals invisible to consumers

### Zod schemas

Located in `src/schemas/`. These are the single source of truth:
- `participantSchema` — used in `transformResponse` in RTK Query AND in `react-hook-form` via `zodResolver`
- `createParticipantSchema` — form validation for AddParticipantDialog
- `loginSchema` — form validation for LoginPage

**Never duplicate type definitions.** Derive types via `z.infer<typeof schema>`.

### State management

- **Server state** — RTK Query only. No manual `useEffect` + `fetch` patterns.
- **Auth state** — `authSlice` in Redux. Access via `useAuth()` hook, not directly.
- **UI state** (`isOpen`, form values) — local `useState` in presentational components only.
- **Derived/computed state** — `useMemo` with named callback in containers.

### Testing

- Use `renderWithProviders()` from `@/test/utils/renderWithProviders` — it wires Redux + Router
- Use factories from `@/test`: `generateParticipant()`, `generateCreateParticipantDto()`, `generateUser()`
- Never hardcode test data — always use factories with optional overrides

```bash
cd frontend && npm run test
```

---

## Environment Variables

### Backend
| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://trial_user:trial_pass@localhost:5432/trial_db` | Postgres connection string |
| `SECRET_KEY` | `fallback-dev-secret` | JWT signing key — override in production |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Token TTL |

### Frontend
| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | Base URL for API calls |

---

## Common Tasks

### Add a new API endpoint

**Backend:**
1. `repositories/participant_repository.py` — add DB query function
2. `services/participant_service.py` — add business logic function
3. `routes/participants.py` — add route, wire `Depends(get_current_user)`
4. `tests/test_participants.py` — add positive + negative test cases

**Frontend:**
1. `src/api/participantsApi.ts` — inject new endpoint into RTK Query slice with `transformResponse` Zod parse
2. Create or update container to call the new hook
3. Pass result as props to presentational component

### Add a new page

1. Create `src/pages/NewPage/NewPage.tsx` (presentational)
2. Create `src/pages/NewPage/NewPageContainer.tsx` (data/RTK hooks)
3. Add route in `src/App.tsx` inside the `<ProtectedRoute>` block
4. Add nav item in `src/components/Layout/Sidebar.tsx` `NAV_ITEMS` array

### Run everything

```bash
make dev          # docker compose up --build
make test         # pytest + vitest
make lint         # ruff + eslint
```
