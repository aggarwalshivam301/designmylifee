# DesignMyLife

A full-stack personal life OS — track habits with BCI scoring, set goals with milestones, manage tasks, journal, run Pomodoro focus sessions, and view analytics dashboards.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/designmylife run dev` — run the frontend (PORT from env)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (port 8080, proxied at `/api`)
- Frontend: React + Vite + Tailwind CSS (shadcn/ui components)
- Auth: JWT (`jsonwebtoken` + `bcryptjs`), token stored in `localStorage` as `dml_token`
- DB: PostgreSQL + Drizzle ORM
- Charts: Recharts (analytics page)
- State: Zustand (auth store), TanStack Query (server state)
- Routing: Wouter
- Validation: Zod + react-hook-form
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- AI: Anthropic claude-sonnet-4-6 (optional, requires `AI_API_KEY` env var)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/api-client-react/src/generated/` — generated hooks + Zod schemas
- `lib/db/src/schema/` — Drizzle table definitions (users, habits, goals, tasks, journal)
- `artifacts/api-server/src/routes/` — Express route handlers (auth, habits, goals, tasks, journal, ai)
- `artifacts/api-server/src/lib/bciCalculator.ts` — BCI scoring algorithm
- `artifacts/api-server/src/middlewares/auth.ts` — JWT protect middleware
- `artifacts/designmylife/src/pages/` — all React page components
- `artifacts/designmylife/src/hooks/use-auth.ts` — Zustand auth store

## Architecture decisions

- **Contract-first API**: OpenAPI spec → Orval codegen → typed React Query hooks. Never write fetch calls manually.
- **JWT auth**: Stateless JWT (30-day expiry). Token stored in localStorage, attached via `setAuthTokenGetter` in custom-fetch.ts. No sessions or cookies.
- **BCI formula**: `score = S×0.4 + C×0.3 + T×0.2 + G×0.1` — pure math, no AI required. AI coaching is opt-in and gracefully degraded when `AI_API_KEY` is absent.
- **Milestones stored in goals JSON**: Goal progress auto-updates to % of milestones done on every milestone save.
- **Proxy routing**: All `/api` traffic routed to api-server via the shared Replit reverse proxy. Frontend uses relative URLs.

## Product

- **Dashboard (Cockpit)**: BCI score card + 4-component breakdown + quick stats for all modules
- **Habits**: Daily/weekly check-ins, streak tracking, completion rate, create/edit/delete
- **Goals**: Progress bars, milestone checklists (auto-updates progress %), categories, status management
- **Tasks**: Priority queue (urgent/high/medium/low), status workflow (todo → in-progress → completed), due dates
- **Journal**: Markdown-free journaling with mood tagging, word count, tag-based organization
- **Analytics**: Recharts visualizations — 7-day habit completions, BCI radar chart, streak leaderboard, task status pie
- **Focus**: Pomodoro timer (25/5/15 min), SVG ring progress, auto-advance modes, session counter persisted to localStorage
- **Settings**: Profile update, password change, AI opt-in toggle

## User preferences

- No Clerk or Replit Auth — JWT-based auth only
- AI features (Anthropic) are opt-in. No API key = graceful math-only BCI fallback
- No emojis in UI

## Gotchas

- `JWT_SECRET` defaults to a hardcoded string if not set — set it in production
- Run `pnpm --filter @workspace/db run push` after any schema changes
- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec changes
- `setAuthTokenGetter` must be called before any API hooks are used (done in App.tsx at module level)
- The analytics `useListHabits` and `useGetDashboardSummary` both require `queryKey` passed explicitly in the `query` option to avoid cache mismatches

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
