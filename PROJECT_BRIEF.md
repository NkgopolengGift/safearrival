# SafeArrival

**SafeArrival** is a hosted, mobile-first web app for journey check-ins and arrival safety.

## The problem

People returning home late may be followed and targeted when they stop to open a gate. In many incidents, the driver leaves their phone inside the vehicle while getting out, so they may not be able to use an app or call for help at the moment they are most at risk. Family, friends, or neighbours may only learn that something happened after a delay.

Stolen vehicles and equipment create another challenge: responders need useful information quickly, while location from a phone or vehicle tracker may be delayed or inaccurate. A safety app cannot prevent an attack, replace emergency services, or independently locate a vehicle without authorised tracking hardware.

## What SafeArrival will solve

We will design a journey check-in app that helps a person travelling home alert trusted contacts if they do not confirm they are safe within an expected time window. The initial focus is the vulnerable period between approaching home, opening the gate, and getting safely inside.

## How it will work

1. **Start a journey:** The user selects a destination and starts a trip. The app estimates an arrival time.
2. **Check in on the way:** At a chosen point, such as around halfway, the app requests a quick confirmation. If the user does not respond, it can remind them and then follow their selected escalation settings.
3. **Set an arrival window:** Near the destination, the app allows time for the user's normal gate-opening and entry routine. This can be a personal setting, such as two minutes.
4. **Confirm safety:** Once safely inside, the user confirms in the app. A future version could support an approved wearable or discreet physical trigger for people who cannot reach their phone.
5. **Alert trusted contacts:** If the user misses the arrival deadline, the app sends selected contacts an alert with the last available location and instructions to check on the user or contact emergency services as appropriate. The app should avoid automatically calling the user in a way that could draw attention to them.

## Delivery format and internship fit

The idea naturally fits a mobile app because the user is travelling and may need to check in from a phone. For this internship task, SafeArrival will be built and hosted as a **mobile-first web app** to meet the requirement to deliver a hosted solution. The prototype will demonstrate the core journey, check-in, and trusted-contact alert flow through a public web URL.

A native mobile app could be considered later for capabilities such as more dependable background location, lock-screen actions, and integration with a wearable or physical alert button. The web prototype must be clear about browser and device limitations; any behavior that cannot be reliably supported in the hosted demo should be simulated and labelled as a demonstration.

## Proposed technology stack

- **Frontend:** React with Vite, built as a responsive mobile-first web app.
- **Backend:** Java with Spring Boot, exposing API endpoints for accounts, trusted contacts, journeys, check-ins, and alert state.
- **Database:** PostgreSQL, using Neon as a possible hosted database provider.
- **Hosting:** Host the frontend using a suitable free static hosting service. Select and validate a backend hosting option that can run the Spring Boot service and connect securely to PostgreSQL.

The backend hosting choice is an open implementation decision. Before settling on a provider, confirm its current free-tier limits, Java/Spring Boot support, sleep or cold-start behavior, environment-variable and secret handling, outbound email or SMS support if needed, and database connectivity. If real message delivery is not practical within the available hosting limits, demonstrate alerts in-app or with a clearly labelled simulated notification flow.

## First prototype

- Create and manage trusted contacts.
- Start and end a journey check-in.
- Configure the midway prompt and personal arrival grace period.
- Send a reminder and escalate a missed check-in to selected contacts.
- Share only the location needed for the active journey and alert.

## Design principles and limits

- **Safety first:** Alerts should be discreet, configurable, and easy to cancel if they are false alarms.
- **Privacy:** Location sharing should be transparent, consent-based, and limited to the journey and people selected by the user.
- **Reliable expectations:** GPS and ETA can be wrong, so location should inform the check-in rather than prove that a person is safe.
- **Phone availability:** The initial prototype depends on the phone being carried, powered, and connected. A wearable or vehicle accessory would be a later extension, not something the app can guarantee.
- **No false promises:** The app supports communication with trusted people; it does not guarantee rescue, detect every threat, identify anonymous callers, or replace police, emergency services, or authorised vehicle trackers.

## Project goal

Build and evaluate a privacy-conscious, hosted web prototype that makes it easier for people travelling home late to check in and gives trusted contacts a timely signal when the person does not confirm they have arrived safely.
