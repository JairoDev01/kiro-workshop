# kiro-essentials

**English** | [Español](./README.es.md)

A fully **local** React SPA + Express API starter. The frontend (Vite) and the
backend API run entirely on your machine — there is **no AWS at runtime**: no
CDK, no API Gateway, no Lambda, no DynamoDB, and no Cognito sign-in. Auth is
mocked locally and data is ephemeral.

> **Local mode.** This repo was originally an AWS/Cognito/CDK starter. It has
> been simplified to run 100% locally for the workshop. Authentication is
> simulated (a fixed demo user) and the API is a local Express server. The AWS
> infrastructure code under `infra/` is kept for reference but is **not used**
> by the local workflow.

## Workspace Structure

| Path | Package | Description |
|------|---------|-------------|
| `apps/web` | @kiro-essentials/web | React SPA frontend (Vite + TypeScript) |
| `apps/api` | @kiro-essentials/api | Local Express backend API (TypeScript, `tsx`) |
| `packages/contracts` | @kiro-essentials/contracts | OpenAPI contract |
| `infra` | @kiro-essentials/infra | AWS CDK infrastructure (reference only — unused in local mode) |

## Getting Started

### Prerequisites

- Node.js 20+
- That's it. No AWS account, no AWS credentials, no AWS CLI, no CDK.

### Quick start

```
npm install
npm run dev:local
```

Then open **http://localhost:5173** and click **"Iniciar sesión"** — it takes
you straight to the home workspace as a simulated signed-in user. The
"Estado del entorno" panel calls the local `GET /hello` API automatically.

`npm run dev:local` starts both processes together, with prefixed output so you
can tell them apart:

- `[web]` → Vite dev server on **http://localhost:5173**
- `[api]` → local Express API on **http://localhost:3001**

Press `Ctrl+C` to stop both.

### How it works (local mode)

- **Auth is mocked.** There is no real login. Clicking "Iniciar sesión"
  navigates to `/home` with a fixed demo user (`demo@local.dev`). See
  `apps/web/src/lib/auth/mock-auth.tsx`.
- **The API is a local Express server.** `GET /hello` returns a demo JSON
  payload. No token is required or validated. See `apps/api/src/`.
- **Data is ephemeral.** Anything stored lives in memory on the API (or in the
  browser's `localStorage` on the frontend) and is lost on restart.

### Environment configuration

Vite reads `.env` from the repo root (`apps/web/vite.config.ts` sets
`envDir: '../..'`). For local mode the only variable that matters is:

```
VITE_API_URL=http://localhost:3001
```

`.env.example` documents the full set. `.env` is gitignored and must never be
committed. The `VITE_COGNITO_*` and `AWS_*` variables are no longer used at
runtime in local mode (kept only as documentation).

> Vite only reads `.env` at startup, so restart the dev server after editing it.

## Available Scripts

Run all scripts from the repository root:

| Script | Description |
|--------|-------------|
| `npm run dev:local` | **Start everything locally** — the API and the web app together |
| `npm run dev:web` | Start only the frontend dev server (http://localhost:5173) |
| `npm run dev:api` | Start only the local API server (http://localhost:3001) |
| `npm run build:web` | Build the frontend for production |
| `npm run build:api` | Type-check the backend workspace |
| `npm run typecheck` | Run TypeScript checks across all workspaces |
| `npm run test` | Run tests across all workspaces |

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, React Router
- **Auth:** mocked locally (no Cognito, no tokens)
- **Backend:** local Express API (TypeScript, run with `tsx`)
- **Data:** ephemeral (in-memory / `localStorage`)
- **Testing:** Vitest, React Testing Library, Supertest

## Legacy AWS mode (reference)

The original AWS deployment path (CDK stacks, Cognito, API Gateway + Lambda,
CloudFront + S3) still exists under `infra/` and `scripts/` but is **not part of
the local workflow**. It is retained for reference only and is not required to
run or develop the app locally.
