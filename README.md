# kiro-essentials

**English** | [Español](./README.es.md)

React SPA with AWS Cognito authentication (Managed Login v2, Authorization Code
Flow with PKCE), served via CloudFront + private S3, with an API Gateway HTTP API
protected by a Cognito JWT authorizer. Infrastructure is managed with AWS CDK.

## Access the AWS Event

Join the AWS Workshop Studio event to access the sandbox account provisioned for this workshop:

👉 **[Join the AWS event](https://catalog.us-east-1.prod.workshops.aws/join?access-code=9ac1-00e3fc-37)**

If the button doesn't work, copy and paste this URL into your browser:

```
https://catalog.us-east-1.prod.workshops.aws/join?access-code=9ac1-00e3fc-37
```

Follow the on-screen instructions to join, then use the credentials from your sandbox in the **AWS Access Keys** section of `.env` during setup.

## Workspace Structure

| Path | Package | Description |
|------|---------|-------------|
| `apps/web` | @kiro-essentials/web | React SPA frontend (Vite + TypeScript) |
| `apps/api` | @kiro-essentials/api | Backend Lambda workspace (no handlers in current auth-only scope) |
| `packages/contracts` | @kiro-essentials/contracts | OpenAPI contract (Cognito `BearerAuth` security scheme) |
| `infra` | @kiro-essentials/infra | AWS CDK infrastructure-as-code |

## Getting Started

### Prerequisites

- Node.js 20+
- AWS credentials (access keys) for the workshop sandbox account
- No Bash, Git Bash or WSL required — the setup runs natively on Windows,
  macOS and Linux
- No global AWS CLI or AWS CDK install required — the scripts use the AWS SDK
  and `npx cdk`

> Workshop sandbox accounts do not use IAM Identity Center / SSO. You
> authenticate with the **access keys** provided for your sandbox. The setup
> command reads them from `.env`; nothing is written to an AWS CLI profile.

### Quick start (cross-platform)

The same commands work in **Windows PowerShell**, **Windows Command Prompt**,
**macOS Terminal** and **Linux**:

```
npm run init
# fill in the AWS Access Keys section in .env
npm run setup
```

`npm run init` is a one-time step: it installs dependencies and creates `.env`
from `.env.example`, then asks you to add your AWS workshop credentials. Open
`.env`, fill in the **AWS Access Keys** section (`AWS_ACCESS_KEY_ID`,
`AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN` if your sandbox is temporary, and
`AWS_REGION`), then run `npm run setup` once to perform the full setup.

On a successful run, `npm run setup`:

1. Loads your AWS access keys from `.env` and validates them with STS, then
   resolves the account/region.
2. Bootstraps the environment for CDK (idempotent) and deploys the stacks in
   dependency order (`FrontendHostingStack` → `AuthStack` →
   `ApiGatewayAuthorizerStack`).
3. Resolves the CloudFormation outputs and writes `VITE_COGNITO_*` and
   `VITE_API_URL` back into `.env` (your AWS keys are preserved).
4. Creates and confirms a Cognito test user so you can log in immediately.
5. Builds the SPA and publishes it to S3 + CloudFront.
6. Prints a summary with the local and production URLs and the test
   credentials, then starts the local dev server (http://localhost:5173).

Then sign in with the printed test credentials (default
`testuser@example.com` / `TestPassw0rd!`).

The Cognito Hosted UI domain prefix defaults to `kiro-essentials-<accountId>`
so it stays globally unique across sandbox accounts; override it with the
`COGNITO_DOMAIN_PREFIX` environment variable if needed.

#### Setup options (cross-platform flags)

Flags work the same in every shell. With npm, put them after `--`:

```
npm run setup -- --skip-deploy
npm run setup -- --skip-frontend-deploy
npm run setup -- --skip-dev-server
npm run setup -- --skip-test-user
npm run setup -- --test-user-email=you@example.com --test-user-password='Str0ngPass!'
```

| Flag | Effect |
|------|--------|
| `--skip-deploy` | Reuse already-deployed stacks; only (re)write `.env` and the test user (also skips frontend publication). |
| `--skip-frontend-deploy` | Deploy infrastructure but don't publish the frontend to S3/CloudFront. |
| `--skip-dev-server` | Finish setup without starting the local dev server. |
| `--skip-test-user` | Do not create/update the Cognito test user. |
| `--test-user-email` / `--test-user-password` | Override the default test credentials. |

The equivalent environment variables (`SKIP_DEPLOY`, `SKIP_FRONTEND_DEPLOY`,
`SKIP_DEV_SERVER`, `SKIP_TEST_USER`, `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`)
remain supported for backward compatibility.

Example — refresh `.env` and the test user without redeploying:

```
npm run setup -- --skip-deploy
```

### Manual environment setup (alternative)

If you prefer not to run `npm run setup`, create `.env` at the repo root
(`npm run init` creates it from `.env.example` for you) and fill in the
Cognito values from the `AuthStack` outputs
(`UserPoolId`, `UserPoolClientId`, `CognitoDomain`). Vite reads `.env` from the
repo root (`apps/web/vite.config.ts` sets `envDir: '../..'`) and only loads it
at startup, so restart `npm run dev:web` after editing it.

> `.env` is gitignored and must never be committed.

## Available Scripts

Run all scripts from the repository root:

| Script | Description |
|--------|-------------|
| `npm run dev:web` | Start the frontend dev server |
| `npm run build:web` | Build the frontend for production |
| `npm run build:api` | Type-check the backend workspace |
| `npm run build:infra` | Compile CDK infrastructure |
| `npm run typecheck` | Run TypeScript checks across all workspaces |
| `npm run test` | Run tests across all workspaces |
| `npm run cdk:synth` | Synthesize CloudFormation templates |
| `npm run cdk:deploy` | Deploy all stacks to AWS |

Workshop setup / deployment (cross-platform — Windows, macOS, Linux):

| Script | Description |
|--------|-------------|
| `npm run init` | One-time init: install dependencies and create `.env` from `.env.example` (fill in your AWS credentials afterwards) |
| `npm run setup` | Full setup: load + validate credentials from `.env`, deploy stacks, write `.env`, create a test user, publish the frontend, start the dev server |
| `npm run deploy` | Deploy the CDK stacks in dependency order (`-- --diff` for diff-only, `-- <StackName>` for a single stack) |
| `npm run deploy:frontend` | Build the SPA and publish it to S3 + CloudFront (production) |

Examples:

```
npm run deploy
npm run deploy -- --diff
npm run deploy -- AuthStack
```

> The setup and deployment logic lives entirely in the Node.js scripts under
> `scripts/` (`init.mjs`, `setup.mjs`, `deploy.mjs`, `deploy-frontend.mjs`),
> which run natively on Windows, macOS and Linux. Always use the `npm run`
> commands above.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, React Router, oidc-client-ts
- **Auth:** AWS Cognito Managed Login v2 (Hosted UI), Authorization Code Flow with PKCE
- **Hosting:** CloudFront + private S3 (OAC)
- **API:** API Gateway HTTP API with a Cognito JWT authorizer
- **Infrastructure:** AWS CDK
- **Testing:** Vitest, React Testing Library
