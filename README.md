# SafeArrival

SafeArrival is a hosted, mobile-first journey check-in web app concept. It is intended to help people travelling home late confirm they arrived safely and alert trusted contacts if they miss a check-in.

This repository contains the initial project scaffold. Journey management, authentication, backend APIs, and notifications are not implemented yet.

## Project structure

```text
apps/
  api/       Spring Boot backend (Java 21)
  web/       React + Vite frontend (TypeScript)
docs/        Project brief, setup notes, and user research plan
```

## Technology

- Nx monorepo with pnpm
- React, Vite, TypeScript, Tailwind CSS, and shadcn/ui conventions
- Spring Boot and Java 21
- PostgreSQL, with Neon being evaluated as a hosted database

## Prerequisites

- Node.js
- pnpm (the repository is configured for pnpm 12)
- Java 21
- Maven
- PostgreSQL locally or a hosted PostgreSQL database for backend work

## Getting started

Install the workspace dependencies:

```bash
pnpm install
```

Start the frontend development server:

```bash
pnpm dev
```

Run the frontend build:

```bash
pnpm build
```

Start the Spring Boot API:

```bash
pnpm nx run api:dev
```

The backend reads database settings from `DATABASE_URL`, `DATABASE_USERNAME`, and `DATABASE_PASSWORD`. Set these in your local environment before starting the API. Do not commit credentials or real personal data.

## Documentation

- [Project brief](PROJECT_BRIEF.md)
- [Project setup and architecture](docs/project-setup.md)
- [User research plan](docs/research-plan.md)
- [Documentation index](docs/README.md)

## Project status

This is an early scaffold. The current frontend is a placeholder, and the backend is not connected to a configured database yet. The hosted backend provider and real notification method are still to be selected. Read the project setup notes for current details.
