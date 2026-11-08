# SafeArrival project brief

## Working title

**SafeArrival** — a hosted, mobile-first web app for journey check-ins and arrival safety.

## Initial problem framing

People returning home late may be followed or targeted when they stop to open a gate. In the incidents that motivated this project, the person was outside the vehicle while opening the gate and could not easily use a phone left in the car. Nearby people learned about the incident only after someone called for help.

This is an initial framing based on local accounts. It is not yet validated as a frequent or broadly shared problem. Research and interviews must establish which situations are common, what people currently do, and what a useful intervention would be.

## Initial solution hypothesis

SafeArrival could let a person start a journey check-in, receive a midway prompt, and set a personal arrival window for the gate-opening and entry routine. If they do not confirm they are safe by the deadline, the service could notify chosen trusted contacts with the last available location and a request to check on them.

The concept may help close a communication gap. It cannot prevent an attack, determine that a missed check-in means a crime occurred, guarantee that a contact responds, dispatch emergency responders, or replace an authorised vehicle tracker.

## Delivery format

The user flow fits a phone, but this internship task requires a hosted solution. The first deliverable will therefore be a hosted, mobile-first web app. The demo must label simulated behavior clearly. A native app, wearable, or physical trigger is a possible future direction if research shows the web experience is inadequate and a practical, safe integration can be built.

## Initial technology choices

- Nx monorepo and pnpm
- React, Vite, TypeScript, Tailwind CSS, shadcn/ui conventions
- Spring Boot on Java 21
- PostgreSQL, with Neon as a database hosting option to evaluate

Backend hosting and notification delivery remain open technical decisions. See [project setup](06-project-setup.md).

## What must be validated

- Whether people actually want a journey check-in for the gate-opening scenario.
- Whether user-chosen trusted contacts are the right first responders.
- Whether a midway prompt helps or adds friction.
- What a safe, useful escalation looks like, including false alarms and missed connectivity.
- Whether people would carry the phone, and what they do when it is left in the car.
- Whether a web app can support the expected behavior well enough for a prototype.

