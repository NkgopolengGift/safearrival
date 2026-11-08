# SafeArrival

SafeArrival is a mobile-first journey check-in prototype. A traveller starts a journey with an arrival window and a trusted contact. The API owns the deadline. Demo mode creates a simulated notice; live mode can send a real Gmail email after an overdue check-in.

SafeArrival is not an emergency response service. It does not dispatch responders or guarantee email delivery or personal safety. Location is optional, captured once only after the traveller requests it, and shown to the scoped contact. Emergency buttons place a call from the user's device; SafeArrival does not contact emergency services on their behalf. The product hypothesis still needs interviews with at least three affected people; see [the research plan](docs/research-plan.md) and [interview guide](docs/03-interview-guide.md).

The emergency links are for immediate emergencies only: SAPS directs police emergencies to 10111, and government guidance lists 112 from a mobile. [SAPS 10111](https://www.saps.gov.za/services/cc_10111.php), [Western Cape emergency numbers](https://www.westerncape.gov.za/know-who-you-can-call-emergency).

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

## Optional: enable a real Gmail sender

SafeArrival now has email/password accounts, BCrypt password hashes, 30-day revocable server sessions, onboarding, and account-owned journey history. Email ownership verification and self-service password recovery still need to be added before opening registration to the public. The default `APP_MODE=demo` never sends email. Live notices remain restricted to `LIVE_EMAIL_RECIPIENTS` because trusted-contact email verification is not implemented.

For a dedicated Gmail sender, turn on Google 2-Step Verification and create an App Password if the account offers that option. Use the App Password, not the account password. Google notes that App Passwords are less secure than Sign in with Google and may not be available for some accounts. [Google App Password guidance](https://support.google.com/mail/answer/185833?hl=en)

Google's Gmail SMTP settings use `smtp.gmail.com`, authentication, and TLS/STARTTLS on port 587. [Google SMTP settings](https://support.google.com/mail/answer/7104828)

In the API terminal, configure these environment variables before starting the API. Do not commit them or paste secrets into chat:

```bash
export APP_MODE=live
export APP_BASE_URL=http://localhost:5173
export AUTH_COOKIE_SECURE=false
export MAIL_USERNAME=your-sender@gmail.com
export EMAIL_FROM=your-sender@gmail.com
read -s -p 'Gmail App Password: ' MAIL_APP_PASSWORD
export MAIL_APP_PASSWORD
export LIVE_EMAIL_RECIPIENTS=your-approved-recipient@gmail.com
export DATA_ENCRYPTION_KEY="$(openssl rand -base64 32)"
```

`EMAIL_FROM` defaults to `MAIL_USERNAME`; set it only if you have configured an allowed Gmail send-as alias. Add each recipient only after you have permission to share their address and send them overdue alerts. For a hosted deployment, set `APP_BASE_URL` to the public HTTPS URL and `AUTH_COOKIE_SECURE=true`. The encryption key must stay stable while encrypted records exist; losing or changing it makes those records unreadable.

Live email is queued only after the server marks a journey overdue. Gmail SMTP acceptance does not confirm inbox delivery. If the send result is ambiguous, SafeArrival records it as unknown and does not retry automatically, to avoid sending duplicate alerts. SMTP secrets and a real sender are not needed in demo mode.

## Optional: enable one-time location sharing

Set `DATA_ENCRYPTION_KEY` to a private base64-encoded 32-byte key in the API environment. Without it, the location button stays disabled. While a journey is active, the traveller can explicitly choose **Share one-time location**; the browser then requests permission and captures one fix. The coordinates are encrypted in PostgreSQL, never added to the email body, and shown only in the scoped contact view. The traveller can remove them; after a journey ends, the location is deleted after 24 hours. No background or continuous tracking is implemented.

Browser geolocation requires user permission and a secure context. `localhost` works for local development; hosted use requires HTTPS. [MDN geolocation requirements](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition)

## Demo flow

1. In demo mode, start a journey with one of the fictional contacts.
2. Confirm arrival, extend the window, or select **Simulate a missed check-in**.
3. Open **Contact view** to see and acknowledge the simulated alert.
4. In live mode, enter an approved recipient's name/email and wait for the real deadline to expire; the contact opens the private link in the email.
5. Share location only by choosing the one-time location action during an active journey.

Traveller and demo contact capabilities are kept in the current browser tab's session storage. Live contact links carry a scoped expiring capability in the URL fragment; the app removes it from the address bar after opening. Completed, cancelled, and overdue journey records are removed after seven days. A missed check-in is ambiguous and should prompt human judgement, not an assumption that an emergency occurred.

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
