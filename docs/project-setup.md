# Project setup

## Architecture

SafeArrival is a hosted, mobile-first web app in an Nx monorepo managed with pnpm.

| Area | Choice |
| --- | --- |
| Workspace | Nx + pnpm |
| Frontend | React, Vite, TypeScript, Tailwind CSS, shadcn/ui conventions |
| Backend | Spring Boot, Java 21 |
| Database | PostgreSQL; Neon is the current hosted option to evaluate |

## Repository layout

```text
apps/
  api/       Spring Boot service
  web/       React/Vite web app
docs/        Project documentation and research evidence
```

## Local prerequisites

- Java 21
- Maven 3.9+
- Node.js and pnpm
- PostgreSQL locally or a Neon database

## Commands

Install JavaScript workspace dependencies with `pnpm install`.

- `pnpm dev` starts the frontend.
- `pnpm build` builds the frontend.
- `pnpm nx run api:dev` starts the backend.
- `pnpm nx run api:build` packages the backend.

The API reads `DATABASE_URL`, `DATABASE_USERNAME`, and `DATABASE_PASSWORD` from the environment. Never commit real credentials. The backend hosting provider remains to be selected after checking Java support, free-tier limits, service sleep behavior, and database connectivity.

## Current state

This is an initial scaffold. It does not yet implement journeys, accounts, authentication, check-in deadlines, or real notifications. The visible frontend message is only a placeholder for the product flow.
