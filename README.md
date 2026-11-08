# SafeArrival

SafeArrival is a mobile-first journey check-in prototype. A traveller starts a journey with an arrival window and a fictional trusted contact. The API owns the deadline; if it expires, the app creates a simulated contact notice that can be acknowledged.

This is a demo, not an emergency response service. It does not send email or SMS, collect location, dispatch responders, or guarantee that a person is safe. The product hypothesis still needs interviews with at least three affected people; see [the research plan](docs/research-plan.md) and [interview guide](docs/03-interview-guide.md).

## Stack

- Nx monorepo with pnpm
- React, Vite, TypeScript, Tailwind CSS
- Java 21 and Spring Boot
- PostgreSQL with Flyway-managed schema

## Run locally

Prerequisites: Node.js, pnpm, Java 21, Maven, and Docker Compose.

Install the JavaScript workspace dependencies:

```bash
pnpm install
```

Start the local database:

```bash
docker compose up -d
```

In one terminal, start the API. Flyway creates the schema on first startup:

```bash
pnpm nx run api:dev
```

In another terminal, start the web app:

```bash
pnpm dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`). Vite proxies `/api` requests to the API on port 8080. The API uses local Compose credentials by default. For another PostgreSQL database, set `DATABASE_URL`, `DATABASE_USERNAME`, and `DATABASE_PASSWORD` in the API environment.

## Demo flow

1. Start a journey using one of the fictional contacts.
2. Confirm arrival, extend the window, or select **Simulate a missed check-in**.
3. Open **Contact view** to see the server-created simulated alert and acknowledge it.

Traveller and contact capabilities are kept in the current browser tab's session storage. The contact view is therefore a local evaluator preview, not an invitation or message sent to the contact. Demo journeys are removed seven days after completion, cancellation, or overdue status.

To reset the local database and reseed the fictional contacts, stop the stack and remove its local volume:

```bash
docker compose down -v
docker compose up -d
```

## Project documentation

- [Project brief](PROJECT_BRIEF.md)
- [Documentation index](docs/00-index.md)
- [System blueprint](docs/07-system-blueprint.md)
- [Research plan](docs/research-plan.md)
