# DesignMyLife

> A personal life operating system for turning daily actions into measurable progress.

DesignMyLife brings habits, goals, tasks, journaling, focus sessions, and analytics into one workspace. It is designed for people who want a practical system for planning, reflection, and consistent execution rather than a collection of disconnected productivity tools.

## Why this project exists

Most productivity tools track isolated activities. DesignMyLife connects daily habits and tasks to longer-term goals, then summarizes consistency through a Behavioral Consistency Index (BCI). The result is a single place to plan work, reflect, and understand progress over time.

## Core features

| Module | Capabilities |
|---|---|
| Cockpit | BCI score, component breakdown, and daily summary |
| Habits | Daily or weekly check-ins, streaks, and 91-day heatmaps |
| Goals | Milestones, progress tracking, categories, and status management |
| Tasks | Priority queue, due dates, goal linking, and status workflow |
| Journal | Mood tagging, word count, tags, and private entries |
| Focus | Pomodoro work and break cycles with persistent session count |
| Analytics | Completion charts, BCI radar, streak leaderboard, and task breakdown |
| AI assistance | Optional goal elaboration, milestone decomposition, journal analysis, and BCI coaching |

## Product tour

Add screenshots or a short demo GIF here. Recommended assets:

- `docs/screenshots/cockpit.png`
- `docs/screenshots/habits.png`
- `docs/screenshots/goals.png`
- `docs/screenshots/analytics.png`
- `docs/demo.gif`

If a public deployment is available, add it here:

**Live demo:** `https://your-real-demo-url.example`

## Architecture

```text
React + Vite frontend
        |
        | typed API client generated from OpenAPI
        v
Express API server
        |
        +--> JWT authentication
        +--> Zod validation
        +--> AI service (optional)
        v
PostgreSQL via Drizzle ORM
```

The project uses a contract-first API workflow: the OpenAPI specification is the source of truth, generated hooks provide typed client access, and shared schemas reduce drift between the frontend and backend.

## Technology stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Wouter
- **Backend:** Node.js, Express 5, TypeScript
- **Data:** PostgreSQL, Drizzle ORM
- **State and validation:** Zustand, TanStack Query, Zod, React Hook Form
- **Charts:** Recharts
- **Authentication:** JWT with bcryptjs
- **AI:** Optional Anthropic integration with a rule-based fallback when no key is configured
- **Workspace:** pnpm monorepo

## Getting started

### Prerequisites

- Node.js 24 or a compatible current LTS release
- pnpm
- PostgreSQL

### Installation

```bash
git clone https://github.com/aggarwalshivam301/designmylifee.git
cd designmylifee
pnpm install
```

Create the required environment files from the repository’s example files. Never commit secrets. At minimum, configure a strong production `JWT_SECRET`, the PostgreSQL connection string, and any optional AI key only when AI features are enabled.

### Development

Run the API server:

```bash
pnpm --filter @workspace/api-server run dev
```

Run the frontend in a second terminal:

```bash
pnpm --filter @workspace/designmylife run dev
```

Push the development database schema when required:

```bash
pnpm --filter @workspace/db run push
```

### Validation

```bash
pnpm run typecheck
pnpm run build
```

Regenerate API hooks and schemas after changing the OpenAPI contract:

```bash
pnpm --filter @workspace/api-spec run codegen
```

## Security notes

- Use a unique, strong `JWT_SECRET` in every non-development environment.
- Keep database credentials and AI keys in environment variables, never in Git.
- Review the default CORS, token expiry, and rate-limiting policy before deploying publicly.
- AI features are optional; the application should continue to work through its deterministic scoring and heuristic fallbacks when AI is disabled.

## Project structure

```text
artifacts/api-server/          Express routes and server-side logic
artifacts/designmylife/        React application
lib/api-spec/                  OpenAPI source contract
lib/api-client-react/          Generated typed client and schemas
lib/db/                        Drizzle schema and database package
scripts/                       Workspace scripts
```

## Current status

Implemented MVP modules include authentication, habits, goals, tasks, journaling, focus sessions, analytics, and optional AI-assisted workflows. Add a short “Known limitations” section here that reflects the current deployment, test coverage, and any unfinished integrations.

## Roadmap

- Add end-to-end tests for authentication and the core habit/goal/task flows.
- Add a public hosted demo with safe seeded data.
- Add export and backup tools for user data.
- Improve observability with structured server logs and health checks.
- Add accessibility and performance checks to CI.

## License

MIT

## Contact

- GitHub: [@aggarwalshivam301](https://github.com/aggarwalshivam301)
- Email: [shivaggarwal272@gmail.com](mailto:shivaggarwal272@gmail.com)
