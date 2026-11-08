# Project setup

## Architecture

SafeArrival is a hosted, mobile-first web app in an Nx monorepo managed with pnpm.

| Area | Choice |
| --- | --- |
| Workspace | Nx + pnpm |
| Frontend | React, Vite, TypeScript, Tailwind CSS, shadcn/ui conventions |
| Backend | Java 21 with Spring Boot |
| Database | PostgreSQL; Neon is a hosting option to evaluate |

## Repository layout

```text
apps/
  api/       Spring Boot service
  web/       React/Vite web app
docs/        Project documentation and research evidence
```

## Local prerequisites

- Java 21
- Maven
- Node.js and pnpm
- PostgreSQL locally or a Neon database

## Commands

Install JavaScript workspace dependencies with `pnpm install`.

- `pnpm dev` starts the frontend.
- `pnpm build` builds the frontend.
- `pnpm nx run api:dev` starts the backend.
- `pnpm nx run api:build` packages the backend.

The API reads `DATABASE_URL`, `DATABASE_USERNAME`, and `DATABASE_PASSWORD` from the environment. Never commit credentials. The backend hosting provider remains to be selected after checking Java support, free-tier limits, sleep behavior, and database connectivity.

## Current state

The current demo supports server-persisted journey creation, check-in, cancellation, deadline extension, scheduled overdue processing, and a scoped contact notice/acknowledgement flow. Traveller/contact capabilities are random bearer tokens stored as hashes in PostgreSQL; the browser keeps the raw demo tokens in session storage. Two fictional contacts are seeded by the first Flyway migration.

The demo's only notification outcome is `SIMULATED`; it never contacts email, SMS, a trusted person, or emergency services. Location sharing, user accounts, multi-contact escalation, and external delivery remain out of scope. The core problem and proposed workflow remain hypotheses until the required interviews are synthesised.

For local development, start PostgreSQL with `docker compose up -d`, run `pnpm nx run api:dev`, then run `pnpm dev` in another terminal. The web dev server proxies `/api` to the API. See the root README for the complete steps.

