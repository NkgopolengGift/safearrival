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

The demo supports server-persisted journeys, check-in, cancellation, extension, scheduled overdue processing, and scoped contact acknowledgement. Demo mode simulates notices. Live mode can send an overdue email through a dedicated Gmail SMTP sender, restricted to recipients in `LIVE_EMAIL_RECIPIENTS`. SMTP acceptance is not proof of inbox delivery; an ambiguous result is not retried automatically.

Email/password registration and sign-in, BCrypt password hashing, revocable server sessions, first-run timezone/arrival-window onboarding, and account-owned journey history are implemented. Email verification, password recovery, account deletion, and trusted-contact verification are not implemented; live email remains restricted to the configured recipient allowlist.

The traveller can explicitly share one current browser location fix. Coordinates are encrypted with AES-GCM under `DATA_ENCRYPTION_KEY`, visible only through the contact capability, and can be removed. They are not sent in email or captured in the background. The UI also offers direct `tel:` links for SAPS 10111 and mobile emergency 112; these are user-initiated calls, not app dispatch.

Capabilities are random bearer tokens stored as SHA-256 hashes in PostgreSQL. Demo contacts are fictional and seeded by the first Flyway migration. The core problem and proposed workflow remain hypotheses until the required interviews are synthesised. For run commands and live-only environment setup, see the root README.

