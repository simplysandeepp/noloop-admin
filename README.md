# NoLoop Admin

Operator dashboard for the NoLoop platform — a Next.js 15 (App Router) frontend for managing
organizations, users, and viewing activity logs.

**🌐 Live (Vercel):** https://noloop-admin.vercel.app

> ⚠️ The deployed UI can't log in yet — it needs `NEXT_PUBLIC_API_URL` pointed at a deployed
> backend (tracked in [Noloop#16](https://github.com/simplysandeepp/Noloop/issues/16)). Until the
> backend is on Render, the live link serves the UI only; use it locally against `:4000` for now.

> The backend is a **separate service** (the same NoLoop API the main app uses). This repo contains
> only the frontend; it talks to the backend over HTTP via `NEXT_PUBLIC_API_URL`.

## Prerequisites

- [Bun](https://bun.sh) (or Node 18+ with npm/pnpm/yarn)
- The NoLoop backend running and reachable (default `http://localhost:4000`)

## Setup

```bash
bun install
cp .env.example .env.local   # then edit if your backend isn't on :4000
```

| Variable              | Description                          | Default                 |
| --------------------- | ------------------------------------ | ----------------------- |
| `NEXT_PUBLIC_API_URL` | Base URL of the NoLoop backend API.  | `http://localhost:4000` |

## Scripts

```bash
bun run dev     # start the dev server on http://localhost:3001
bun run build   # production build
bun run start   # serve the production build on :3001
bun run lint    # run ESLint
```

Only `PLATFORM_ADMIN` accounts can sign in. The auth token is stored in `localStorage`.

## Project structure

```
src/
  app/                 # routes (App Router) — thin page composition
    page.tsx           #   dashboard (stats + organizations)
    login/             #   operator sign-in
    users/             #   all users across organizations
    logs/              #   activity logs
    orgs/[id]/         #   organization detail + employees
  components/
    layout/Shell.tsx   # authenticated app shell (nav + auth guard)
    ui/                # reusable presentational components
                       #   Logo, StatusBadge, TypeBadge, CredentialsCard, ErrorBanner
  hooks/               # useAuthRedirect (401/403 → /login)
  lib/
    api/               # boundary to the external backend
      client.ts        #   fetch wrappers + ApiError
      auth.ts          #   token storage
      endpoints.ts     #   typed functions, one per backend route
      index.ts         #   public surface (import from "@/lib/api")
    format.ts          # fmtDate
    utils.ts           # cn (clsx + tailwind-merge)
  types/               # shared domain types
```

The `@/*` path alias maps to `src/*`.
