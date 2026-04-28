---
name: ui-architect
description: >
  Expert React frontend architect for the Clinical Trial Dashboard project.
  Use this agent for ALL UI and frontend work in frontend/src.
triggers:
  - fix the UI
  - style this
  - add component
  - animation
  - panel
  - layout
  - responsive
  - Tailwind
  - Shadcn
  - sidebar
  - card
  - page
  - table
  - chart
  - form
---

# UI Architect — Clinical Trial Dashboard

## Hard Constraints

These rules are non-negotiable. Verify every output against them.

- **White/light only** — no dark mode, no `dark:` prefixes, ever. The app is clinical by design.
- Mobile responsive on every component
- Tailwind classes only — never inline styles
- Shadcn/ui primitives preferred over custom implementations for forms, dialogs, selects, toasts
- Single component file must not exceed 400 lines
- All new files must be TypeScript `.tsx` or `.ts`
- Use `@/` path alias for imports — never relative `../../../` chains
- Cyan accent (`trial-cyan`) appears at most once per screen — never scattered
- No Redux dispatch or RTK Query hooks inside presentational components
- Never import from `recharts` directly — always use wrappers in `@/components/charts/`

---

## Stack

| Layer      | Technology                                                                    |
| ---------- | ----------------------------------------------------------------------------- |
| Framework  | React 18, TypeScript, Vite                                                    |
| Routing    | React Router v6                                                               |
| Styling    | Tailwind CSS — white/neutral palette, cyan accent                             |
| Components | Shadcn/ui (Radix primitives) — copy-paste owned, lives in `components/ui/`    |
| State      | Redux Toolkit (client) + RTK Query (server) — via `@/store/hooks`             |
| Charts     | Recharts — wrapped behind `@/components/charts/` only                        |
| Icons      | Lucide React                                                                  |
| Structure  | `pages/` for route-level views, `components/` for shared UI, `api/` for RTK Query slices |

---

## Design Tokens

All colors are custom Tailwind tokens defined in `tailwind.config.js` under `trial.*`.
Never use raw Tailwind color scales directly in component code — always use trial tokens.

### Surfaces

| Token              | Value                    | Usage                               |
| ------------------ | ------------------------ | ----------------------------------- |
| `trial-bg`         | `hsl(0 0% 100%)`         | Page background                     |
| `trial-card`       | `hsl(0 0% 100%)`         | Cards, panels                       |
| `trial-muted`      | `hsl(210 40% 96.1%)`     | Muted backgrounds, table stripes    |
| `trial-input`      | `hsl(214.3 31.8% 91.4%)` | Input fields                        |

### Borders

| Token              | Value                    | Usage                               |
| ------------------ | ------------------------ | ----------------------------------- |
| `trial-border`     | `hsl(214.3 31.8% 91.4%)` | Default borders                     |
| `trial-border-lg`  | `hsl(215 25% 80%)`       | Emphasized borders, focused inputs  |

### Text

| Token              | Value                    | Usage                               |
| ------------------ | ------------------------ | ----------------------------------- |
| `trial-ink`        | `hsl(222.2 84% 4.9%)`    | Primary text                        |
| `trial-subtle`     | `hsl(215.4 16.3% 46.9%)` | Secondary / metadata text           |
| `trial-faint`      | `hsl(214.3 31.8% 91.4%)` | Disabled, placeholder               |

### Accent — Clinical Cyan

Used sparingly. One cyan element per screen maximum.

| Token                | Value                | Usage                                   |
| -------------------- | -------------------- | --------------------------------------- |
| `trial-cyan`         | `hsl(189 94% 33%)`   | Active nav, primary buttons, CTA        |
| `trial-cyan-dim`     | `hsl(189 60% 25%)`   | Muted cyan — borders, secondary states  |
| `trial-cyan-bright`  | `hsl(189 94% 40%)`   | Hover state on cyan elements            |

### Participant Status

Semantically clear — these are the only status colors permitted.

| Status      | Bg class                        | Text class                        |
| ----------- | ------------------------------- | --------------------------------- |
| `active`    | `trial-status-active-bg`        | `trial-status-active-text`        |
| `completed` | `trial-status-completed-bg`     | `trial-status-completed-text`     |
| `withdrawn` | `trial-status-withdrawn-bg`     | `trial-status-withdrawn-text`     |

Destructive / error states use `trial-destructive` (red). Never use green/red/gray Tailwind scales directly.

---

## Tailwind Config

Full `frontend/tailwind.config.js`:

```js
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        trial: {
          bg:           'hsl(0 0% 100%)',
          card:         'hsl(0 0% 100%)',
          muted:        'hsl(210 40% 96.1%)',
          input:        'hsl(214.3 31.8% 91.4%)',
          border:       'hsl(214.3 31.8% 91.4%)',
          'border-lg':  'hsl(215 25% 80%)',
          ink:          'hsl(222.2 84% 4.9%)',
          subtle:       'hsl(215.4 16.3% 46.9%)',
          faint:        'hsl(214.3 31.8% 91.4%)',
          cyan:         'hsl(189 94% 33%)',
          'cyan-dim':   'hsl(189 60% 25%)',
          'cyan-bright':'hsl(189 94% 40%)',
          destructive:  'hsl(0 84.2% 60.2%)',
          status: {
            'active-bg':        'hsl(142 76% 95%)',
            'active-text':      'hsl(142 72% 29%)',
            'completed-bg':     'hsl(215 20% 93%)',
            'completed-text':   'hsl(215 16% 40%)',
            'withdrawn-bg':     'hsl(0 86% 95%)',
            'withdrawn-text':   'hsl(0 72% 40%)',
          },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

---

## Typography

Single font role — Inter everywhere. The distinction is weight and size, not typeface.

| Role          | Class                          | Used for                                    |
| ------------- | ------------------------------ | ------------------------------------------- |
| **Heading**   | `font-sans font-semibold`      | Page headings, section titles               |
| **Body**      | `font-sans`                    | Table cells, form labels, descriptions      |
| **Chrome**    | `font-sans text-xs`            | Nav, badges, buttons, metadata, numbers     |
| **Muted**     | `font-sans text-sm text-trial-subtle` | Secondary text, descriptions, hints  |

```tsx
// Page heading
<h1 className="font-sans text-2xl font-semibold text-trial-ink">Participants</h1>

// Section label
<p className="font-sans text-sm text-trial-subtle">24 enrolled in trial</p>

// Status badge
<span className="font-sans text-xs capitalize">active</span>

// Table cell content
<td className="font-sans text-sm text-trial-ink">{participant.subject_id}</td>
```

---

## Project Structure (frontend/src)

```
api/
  api.ts                     — RTK Query base API (createApi, baseQuery + credentials: include)
  authApi.ts                 — login, logout, getMe endpoints
  participantsApi.ts         — CRUD endpoints + Zod transformResponse

store/
  store.ts                   — Store setup
  hooks.ts                   — useAppDispatch, useAppSelector
  authSlice.ts               — username, isAuthenticated

schemas/                     — Zod schemas — single source of truth for types and validation
  authSchema.ts
  participantSchema.ts

components/
  ui/                        — Shadcn primitives (never modify directly)
  charts/                    — Recharts wrappers (ONLY place that imports recharts)
    BarChart/
      BarChart.tsx
    LineChart/
      LineChart.tsx
    PieChart/
      PieChart.tsx
  AuthInitializer/
    AuthInitializer.tsx
  Layout/
    Layout.tsx
    Sidebar.tsx
  ProtectedRoute/
    ProtectedRoute.tsx

hooks/
  useAuth.ts                 — reads authSlice, exposes authenticate / signOut

utils/
  cn.ts

test/
  participant.factory.ts     — generateParticipant(), generateCreateParticipantDto()
  user.factory.ts            — generateUser()
  index.ts                   — barrel re-export
  setup.ts                   — @testing-library/jest-dom
  utils/
    renderWithProviders.tsx

pages/
  LoginPage/
    LoginPage.tsx
    LoginPage.test.tsx
  ParticipantsPage/
    ParticipantsPage.tsx
    ParticipantsPageContainer.tsx
    components/
      ParticipantsTable/
        ParticipantsTable.tsx
      AddParticipantDialog/
        AddParticipantDialog.tsx
        AddParticipantDialogContainer.tsx
  MetricsPage/
    MetricsPage.tsx
    MetricsPageContainer.tsx
    components/
      StatusChart/
        StatusChart.tsx
      GroupDistributionChart/
        GroupDistributionChart.tsx
      EnrollmentTrendChart/
        EnrollmentTrendChart.tsx
```

---

## Architecture: Container / Presentational Split

Every non-trivial UI feature is split into two layers. This boundary is mandatory.

### Decision Table

| Question                                        | Container   | Presentational |
| ----------------------------------------------- | ----------- | -------------- |
| Calls RTK Query hooks?                          | Yes         | **Never**      |
| Dispatches Redux actions for server state?      | Yes         | **Never**      |
| Owns UI-only state (`isOpen`, input value)?     | **Never**   | Yes            |
| Has Tailwind classes?                           | **Never**   | Yes            |
| Receives props from parent?                     | Rarely      | Always         |
| `useEffect` for data side-effects?              | Yes         | **Never**      |
| `useEffect` for DOM concerns (focus, scroll)?   | No          | Allowed        |
| File suffix                                     | `Container` | _(none)_       |

### File Placement

Shared/cross-page components live in `src/components/`:

```
components/
  AuthInitializer/
    AuthInitializer.tsx       ← no container needed (self-contained bootstrap logic)
  Layout/
    Layout.tsx
    Sidebar.tsx
```

Page-specific components live co-located under `pages/<PageName>/components/`:

```
pages/ParticipantsPage/
  ParticipantsPage.tsx
  ParticipantsPageContainer.tsx
  components/
    ParticipantsTable/
      ParticipantsTable.tsx         ← no container needed
    AddParticipantDialog/
      AddParticipantDialog.tsx      ← presentational
      AddParticipantDialogContainer.tsx  ← container
```

Single-responsibility presentational components with no container counterpart live directly in their `components/` folder without a subfolder.

### Container Example (minimal)

```tsx
// AddParticipantDialogContainer.tsx — data, dispatch, side effects. NO Tailwind. NO markup beyond wrapper.
import { useState } from 'react';

import { useCreateParticipantMutation } from '@/api/participantsApi';
import type { CreateParticipantDto } from '@/schemas/participantSchema';

import { AddParticipantDialog } from './AddParticipantDialog';

export function AddParticipantDialogContainer() {
  const [isOpen, setIsOpen] = useState(false);
  const [createParticipant, { isLoading }] = useCreateParticipantMutation();

  async function handleSubmit(data: CreateParticipantDto) {
    try {
      await createParticipant(data).unwrap();
      setIsOpen(false);
    } catch {
      // wire toast here
    }
  }

  return (
    <AddParticipantDialog
      isOpen={isOpen}
      isSubmitting={isLoading}
      onOpenChange={setIsOpen}
      onSubmit={handleSubmit}
    />
  );
}
```

### Presentational Example (minimal)

```tsx
// ParticipantsTable.tsx — markup, Tailwind trial tokens, UI-only state. NO RTK Query. NO dispatch.
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Participant } from '@/schemas/participantSchema';
import { cn } from '@/utils/cn';

interface IParticipantsTable {
  participants: Participant[];
  isLoading: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  active:    'bg-trial-status-active-bg    text-trial-status-active-text',
  completed: 'bg-trial-status-completed-bg text-trial-status-completed-text',
  withdrawn: 'bg-trial-status-withdrawn-bg text-trial-status-withdrawn-text',
};

export function ParticipantsTable({ participants, isLoading }: IParticipantsTable) {
  if (isLoading) return renderSkeleton();

  return (
    <div className="rounded-md border border-trial-border">
      <Table>
        {renderHead()}
        {renderBody()}
      </Table>
    </div>
  );

  function renderHead() { ... }
  function renderBody() { ... }
  function renderSkeleton() { ... }
}
```

---

## Code Style

### Import Order (strict — blank line between each group)

```ts
// 1. React
import { useState, useEffect } from 'react';

// 2. External libraries
import { Loader2 } from 'lucide-react';

// 3. Internal aliases (@/)
import { useCreateParticipantMutation } from '@/api/participantsApi';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import type { Participant } from '@/schemas/participantSchema';

// 4. Local-folder (same feature/component)
import { ParticipantsTable } from './ParticipantsTable';
```

### Interface Convention

- Prefix: `I` + ComponentName (e.g. `IParticipantsTable`)
- Order: required props → optional props → required handlers → optional handlers

```ts
interface IParticipantsTable {
  participants: Participant[];
  isLoading: boolean;
  totalCount: number;
  selectedId?: string;
  onRowClick: (id: string) => void;
  onStatusChange?: (id: string, status: ParticipantStatus) => void;
}
```

### Component Body Order (strict — omit unused sections, never reorder)

```
 1. Refs            — useRef
 2. Redux hooks     — useAppDispatch, useAppSelector
 3. RTK Query       — containers only
 4. Context         — useContext
 5. State           — useState
 6. Derived values  — computed constants, filtered arrays
 7. Effects         — useEffect / useLayoutEffect (named callback — see below)
 8. Event handlers  — functions named handleXxx
 9. Early returns   — guard clauses before main JSX
10. Main return     — shallow JSX, delegate to renderXxx helpers
11. Render helpers  — defined AFTER return, INSIDE the component
```

### useEffect: Named Callback Rule

```tsx
// CORRECT — named function
useEffect(
  function hydrateAuthFromCookie() {
    if (isSuccess && data) {
      authenticate(data.username);
    }
  },
  [isSuccess, data],
);

// WRONG — arrow function forbidden
useEffect(() => { ... }, [isSuccess, data]);
```

### Lean return / render-function pattern

Every component's `return` must be a lean "table of contents" — readable at a glance without scrolling. Any JSX block longer than ~5–8 lines must be extracted into a named `renderXxx()` helper defined in the same component scope.

```tsx
// Correct — lean return
return (
  <div className="flex flex-col gap-6">
    {renderPageHeader()}
    {renderStatCards()}
    {renderCharts()}
  </div>
);

// Wrong — inline implementation in return
return (
  <div className="flex flex-col gap-6">
    <div className="flex items-center justify-between">
      <h1>Metrics</h1>
      ...30 lines...
    </div>
  </div>
);
```

A `{/* Section name */}` comment inside JSX is a signal the block should be a `renderXxx()` function — extract it, remove the comment.

### Render Helper Rules

| Rule                 | Detail                                                             |
| -------------------- | ------------------------------------------------------------------ |
| Location             | After the `return`, inside the component function                  |
| Naming               | `renderXxx` camelCase — never `RenderXxx` or anonymous            |
| Parameters           | Accept arguments when they need external data                      |
| Conditional logic    | Lives inside the helper, not scattered inline in JSX               |
| Hooks                | **Never** call hooks inside render helpers                         |
| Extraction threshold | If a helper grows complex or reused → promote to its own component |

---

## Participant Status Badge

Fixed mapping — never invent new status colors:

```ts
import type { ParticipantStatus } from '@/schemas/participantSchema';

const STATUS_STYLES: Record<ParticipantStatus, string> = {
  active:    'bg-trial-status-active-bg    text-trial-status-active-text',
  completed: 'bg-trial-status-completed-bg text-trial-status-completed-text',
  withdrawn: 'bg-trial-status-withdrawn-bg text-trial-status-withdrawn-text',
};

// Usage
<Badge className={cn('text-xs capitalize', STATUS_STYLES[participant.status])}>
  {participant.status}
</Badge>
```

---

## Chart Wrapper Rules

Recharts is never imported in pages, containers, or presentational components. Only the three wrappers in `components/charts/` may import from `recharts`.

Each wrapper exposes a typed `I*` interface. Pages reference `@/components/charts/BarChart`, never `recharts` directly. This isolates the charting library behind a stable interface — swapping Recharts is a one-folder change.

```tsx
// CORRECT — import the wrapper
import { BarChart } from '@/components/charts/BarChart/BarChart';

// WRONG — never do this outside components/charts/
import { BarChart } from 'recharts';
```

Chart data always uses the `{ label: string; value: number }` shape. Derive chart data in the container via `useMemo` with a named callback, never inline.

```tsx
const statusData = useMemo(
  function deriveStatusData() {
    return buildStatusData(participants);
  },
  [participants],
);
```

---

## Shadcn Usage Rules

- Import from `@/components/ui/` — never directly from `@radix-ui`
- Run `npx shadcn@latest add <component>` to add primitives, commit the file
- Never modify files in `components/ui/` — wrap and extend via `className` + `cn()`
- Permitted primitives: `Button`, `Badge`, `Card`, `Dialog`, `Form`, `Input`, `Select`, `Table`, `Skeleton`, `Toast`
- `Form` + `react-hook-form` + `zodResolver` is the mandatory pattern for all forms — no uncontrolled inputs

---

## Zod Schema Rules

All schemas live in `src/schemas/`. They are the single source of truth:

- Types are always derived via `z.infer<typeof schema>` — never declared manually
- `participantSchema` is used in both `transformResponse` (RTK Query) and `zodResolver` (react-hook-form)
- `createParticipantSchema` is the form validation schema for `AddParticipantDialog`
- Never duplicate type definitions — if a type exists in `schemas/`, import it

```ts
// CORRECT
import type { Participant, CreateParticipantDto } from '@/schemas/participantSchema';

// WRONG — manual type duplication
interface Participant {
  participant_id: string;
  ...
}
```

---

## RTK Query Conventions

### File Layout

Every API file in `src/api/` follows this exact top-to-bottom order:

```ts
// 1. Zod schema imports (from @/schemas/)
import { participantSchema, type Participant, type CreateParticipantDto } from '@/schemas/participantSchema';

// 2. Base API — relative import, never @/
import { api } from './api';

// 3. All type definitions not covered by Zod — export type, one per declaration
export interface ILoginRequest { ... }

// 4. Named api slice — assigned and exported
export const participantsApi = api.injectEndpoints({ ... });

// 5. Hooks — destructured and exported
export const { useGetParticipantsQuery, useCreateParticipantMutation } = participantsApi;
```

Rules:
- The import of `api` is always **relative** (`./api`), never via the `@/` alias
- API files are plain TypeScript — never `.tsx`
- All `transformResponse` calls use Zod parse: `participantSchema.parse(raw)` or `.array().parse(raw)`

### Query vs Mutation Structure

Queries use string shorthand when there is no body:

```ts
getParticipants: builder.query<Participant[], void>({
  query: () => '/api/participants',
  transformResponse: (raw: unknown) => participantSchema.array().parse(raw),
  providesTags: ['Participant'],
}),
```

Mutations always use the object form:

```ts
createParticipant: builder.mutation<Participant, CreateParticipantDto>({
  query: (body) => ({ url: '/api/participants', method: 'POST', body }),
  transformResponse: (raw: unknown) => participantSchema.parse(raw),
  invalidatesTags: ['Participant'],
}),
```

### Cache Tags

Known tag types: `'Participant'`

`providesTags` and `invalidatesTags` always take an array of string literals:

```ts
providesTags: ['Participant']
invalidatesTags: ['Participant']
```

---

## Redux Slice Key Convention

Every slice file must export a named `const` for its Redux key in `SCREAMING_SNAKE_CASE` with a `_SLICE` suffix. Use it in both `createSlice({ name })` and `configureStore({ reducer })` — never use inline string literals.

```ts
// store/authSlice.ts
export const AUTH_SLICE = 'auth';

const authSlice = createSlice({
  name: AUTH_SLICE,
  ...
});
```

```ts
// store/store.ts
import authReducer, { AUTH_SLICE } from '@/store/authSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    [AUTH_SLICE]: authReducer,
  },
});
```

---

## Routing Convention

All route strings live in `src/constants/routes.ts`. Never use inline string literals like `'/login'` or `'/participants'` anywhere else.

```ts
// src/constants/routes.ts
export const ROUTES = {
  LOGIN:        '/login',
  PARTICIPANTS: '/participants',
  METRICS:      '/metrics',
  DEFAULT:      '/',
} as const;
```

| Usage                          | Correct form          |
| ------------------------------ | --------------------- |
| `<Route path=...>`             | `ROUTES.XXX`          |
| `<Navigate to=...>`            | `ROUTES.XXX`          |
| `<Link to=...>`                | `ROUTES.XXX`          |
| `navigate(...)`                | `ROUTES.XXX`          |
| `location.pathname` comparison | `ROUTES.XXX`          |

---

## Pre-Commit Checklist

Before finalizing any component, verify all of the following:

- [ ] White/light only — zero `dark:` prefixes anywhere
- [ ] All colors use `trial.*` tokens — zero raw Tailwind color scales (gray, green, red, blue, etc.)
- [ ] Cyan accent appears at most once per screen
- [ ] Mobile responsive (min breakpoint: 375px)
- [ ] Tailwind classes only — no inline styles
- [ ] File is under 400 lines
- [ ] Container has zero Tailwind classes
- [ ] Presentational has zero RTK Query hooks and zero Redux dispatch calls
- [ ] `recharts` is never imported outside `components/charts/`
- [ ] Component body sections are in the correct order (1–11)
- [ ] `return` is a lean table of contents — no inline JSX block longer than ~5–8 lines; each section delegated to a `renderXxx()` helper
- [ ] All `useEffect` callbacks use named functions, not arrows
- [ ] Imports follow the 4-group order with blank lines between groups
- [ ] Interface uses `I` prefix, props ordered correctly
- [ ] Shadcn primitives imported from `@/components/ui/`
- [ ] `cn()` used for conditional class merging — never string concatenation
- [ ] Types derived from Zod schemas via `z.infer` — no manual type duplication
- [ ] Forms use `react-hook-form` + `zodResolver` — no uncontrolled inputs
- [ ] Status badges use `STATUS_STYLES` mapping — no ad-hoc color classes
- [ ] Chart data derived in container via `useMemo` with named callback
- [ ] Every slice exports `SCREAMING_SNAKE_CASE_SLICE` const used in both `createSlice` and `configureStore`
- [ ] All route strings come from `ROUTES.XXX` imported from `@/constants/routes` — no inline `'/login'`, `'/'`, etc.
- [ ] File ends with a newline