# Desk research: late arrivals, hijacking and journey check-ins in South Africa

**Prepared:** 5 November 2026  
**Purpose:** Provide a reliable starting point for SafeArrival interviews and product discovery.  
**Status:** Desk research only. It does not substitute for the assignment's required conversations with at least three affected people.

## 1. Executive summary

SafeArrival began with local reports of armed vehicle takeovers around a home gate, delayed discovery, and difficulty contacting help. Public data supports investigating vehicle hijacking and home arrival routines, but it does not by itself validate this exact user problem or a software solution.

The strongest evidence relevant to the scenario is:

- Statistics South Africa's 2023/24 Governance, Public Safety and Justice Survey estimated that 12.4% of surveyed hijacking incidents occurred at home and 12.3% in a residential street. Nearly half were reported in a street in town. These are survey estimates of incident locations, not proof of a specific tactic or time-of-day pattern. [Stats SA, GPSJS 2023/24](https://www.statssa.gov.za/publications/P0341/P0341August2024.pdf)
- The 2024/25 survey says hijacking was more likely to be reported by people in metro areas and Gauteng and Western Cape; the report warns that the sample was too small for detailed breakdowns. [Stats SA, GPSJS 2024/25](https://www.statssa.gov.za/publications/P0341/P03412025.pdf)
- Police recorded crime and household/individual survey estimates are different measures. They should not be combined into one time series without explaining the methods and definitions.
- Existing South African services already offer panic buttons, family safety, journey tracking/check-ins, or professional response. SafeArrival cannot be pitched as the first safety app or first check-in feature. Its possible differentiator is a personal arrival-window workflow designed around the interval between arriving at home, opening the gate, and confirming entry—but interviews must determine whether this is meaningfully unmet.
- The app's largest product risk is reliability. A web page cannot safely be assumed to keep checking GPS while backgrounded. Web push can notify a user in supported configurations, but an app server—not a phone page—should own the deadline. Push delivery, SMS, mobile data, browser permissions, battery, and contact response can all fail.
- Alerting trusted contacts is not the same as dispatching help. A missed timer is ambiguous; an unexpected call or alarm can draw attention. Escalation must be consent-based, configurable, discreet, and tested with users.
- The product would process sensitive location and contact data. POPIA's principles make purpose limitation, data minimisation, security safeguards, transparency, and retention limits central design concerns. Use fictional data for the internship prototype.

## 2. Research question and boundaries

### Primary research question

How do people who return home late manage the vulnerable arrival and gate-opening period, and what kind of check-in or escalation—if any—would they trust and use?

### Secondary questions

1. Is the painful moment the journey, arrival at the street, opening the gate, being outside the vehicle, or the time before family notices a missed arrival?
2. What do people currently do: call someone, share a live location, use a neighbourhood group, rely on a guard/armed response, use a tracker, or do nothing?
3. Who is actually able and willing to act on an alert, and how quickly?
4. Would automatic escalation reduce delay or create anxiety and false alarms?
5. What happens when the person leaves their phone in the vehicle, loses network access, has a flat battery, or cannot interact safely?
6. Would users want this as a hosted web app, a native app, a physical button, or a combination?

### Scope boundary

This project is about supporting a check-in and communication flow. It is not an anti-crime system, surveillance network, criminal identification tool, anonymous-caller tracing service, car tracker, armed response service, or police dispatch platform.

## 3. South African context and evidence

### 3.1 Two different ways of measuring crime

SAPS publishes police-recorded cases for reporting periods. Stats SA's Governance, Public Safety and Justice Survey asks people and households about experiences, including incidents that may not have been reported. The sources differ in population, definitions, reporting behavior, and collection method. A perceived decline in recorded cases does not establish that an individual neighbourhood feels safe; a survey estimate does not mean every experience is reported to police.

In the SAPS 2025/26 fourth-quarter release, police recorded **3,609 carjackings in January–March 2026**, compared with **4,533 in January–March 2025**, a reported decrease of 20.4%. The same release listed 2,062 of the 3,609 cases in Gauteng. These are counts in that quarter, not annual rates or a forecast. [SAPS, 2025/26 Q4 statistics](https://www.saps.gov.za/services/downloads/2025/2025-2026_-_4th_Quarter_WEB.pdf)

SAPS's 2024/25 annual report says 55,004 vehicles were reported stolen or robbed and 28,726 were recovered during that financial year. This covers theft and robbery categories in the report; it is not a carjacking-only recovery probability and should not be presented as one. [SAPS Annual Report 2024/25](https://www.saps.gov.za/about/stratframework/annual_report/2024_2025/2024-25-SAPS-Annual-Report.pdf)

Stats SA's GPSJS 2023/24 reports the distribution of surveyed hijacking incidents by location: street in town 47.1%, outside office/shops/at work 19.3%, at home 12.4%, residential street 12.3%, public parking lot 5.2%, and other 3.7%. This directly supports asking about home and residential arrival contexts. It does **not** state that these incidents involved opening a gate, following a driver, a running vehicle, or a particular hour. [Stats SA, GPSJS 2023/24, Figure 63](https://www.statssa.gov.za/publications/P0341/P0341August2024.pdf)

The 2024/25 GPSJS describes hijacking as an individual crime and says sample counts were too small for detailed disaggregation. It reports higher likelihood among metro respondents and in Gauteng and Western Cape, while warning against over-reading small subgroups. [Stats SA, GPSJS 2024/25, hijacking section](https://www.statssa.gov.za/publications/P0341/P03412025.pdf)

**Interpretation:** There is a credible problem area to investigate, but national data does not establish demand for SafeArrival's exact workflow. The interviews need to produce that evidence.

### 3.2 What is known about weapons and exposure

The 2024/25 Stats SA report's hijacking section includes a weapon distribution graphic, which lists a gun in 94.2% of reported hijacking incidents, with “other” at 4.4% and knife at 3.3%. Categories may overlap or be rounded; refer to the source graphic and methodology before treating these as mutually exclusive shares. [Stats SA, GPSJS 2024/25](https://www.statssa.gov.za/publications/P0341/P03412025.pdf)

This underscores why the product should not encourage resistance, confrontation, chasing suspects, crowd confrontation, or a loud, visible action. SAPS safety advice says to prioritize life over property and, if followed, go to a police station or call SAPS emergency services. [SAPS crime prevention pamphlet](https://www.saps.gov.za/resource_centre/publications/pamphlets/documents/crime_prevention_tips.pdf)

The project should avoid presenting product prompts as personal safety instructions in an armed incident. Direct users to current official guidance and emergency services; do not invent tactical advice.

### 3.3 Gate-opening is a plausible use context, not yet a proven segment

Stats SA's 2023/24 location categories distinguish “at home” and “in the street in a residential area,” but do not isolate driveway/gate incidents. SAPS vehicle-safety guidance says that if strangers are loitering at a driveway, drivers should drive past and report persistent suspicious activity. [SAPS vehicle safety](https://www.saps.gov.za/alert/safety_awareness_vehicle.php)

That supports discussing the gate-opening transition in interviews. It does not mean the app should advise someone to make a particular driving maneuver in every situation. The person knows local context; product content must defer to official guidance and user judgment.

### 3.4 Night travel and late arrival

The user's account places incidents after work and during evening arrivals. The sources reviewed here do not establish a national time-of-day pattern for the particular gate-opening scenario. Ask interviewees about their own schedule, not whether they confirm a presumed trend. Avoid saying “most people arrive between 6 and 8 pm” without a reliable source or local interview evidence.

### 3.5 Business vehicles and work tools

SafeArrival's motivating accounts also include a company construction vehicle and equipment. Tracker, a commercial vehicle tracking provider, reports from its customer base that business vehicles are disproportionately affected by vehicle crime. Its January–June 2025 analysis said business-owned vehicles were 48% more likely to be targeted than personally owned vehicles, with 57% of business vehicle crime in its data occurring in Gauteng; its January–June 2026 update reports the difference at 17% and says business vehicle incidents remain more skewed to hijacking than theft. The figures are provider-customer data, not a population-wide police estimate, and the changes between periods show why dates and sample definitions matter. [Tracker, Jan–Jun 2025](https://www.tracker.co.za/news-room/business-owned-vehicles-still-bear-the-brunt-of-vehicle-crime), [Tracker, Jan–Jun 2026](https://www.tracker.co.za/news-room/vehicle-crime-risk-declines)

This suggests a potentially distinct user group—small businesses and employees using work vehicles—but it should not be folded into the first-person late-arrival problem without evidence. Interviews with drivers may need to ask separately about the person’s safety, employer procedures, vehicle recovery, and the loss of tools/equipment. A driver-facing check-in app does not replace fleet telematics, employer policies, insurance, or recovery operations.

### 3.6 Connectivity and digital access

Stats SA's 2024 General Household Survey found that 82.1% of households had some kind of internet access and 75.6% had access through mobile internet; only 17.4% had fixed internet at home. These are household-level access measures, not evidence that every member has a smartphone, data, coverage throughout a route, or a working connection during an emergency. [Stats SA, General Household Survey 2024](https://www.statssa.gov.za/publications/P0318/P03182024.pdf)

The 2025 survey media release reports internet access of some kind in 85.6% of households. This headline measure includes multiple access types; it should not be interpreted as mobile-data access for each person. [Stats SA, GHS 2025 media release](https://www.statssa.gov.za/publications/P0318/MEDIA%20RELEASE%20-%20%20GHS%202025%20.pdf)

ICASA's affordability inquiry notes continuing concerns about the affordability of voice and broadband, particularly for low-income households, rural communities, youth, and informal-sector workers. [ICASA, Affordability Market Inquiry](https://www.icasa.org.za/pages/affordability-market-inquiry)

**Product implication:** Avoid a design that assumes constant mobile data or an expensive smartphone. Ask whether participants use prepaid data, Wi-Fi calling, SMS, or shared devices and what happens when airtime/data runs out. SMS or cellular calling may be worth exploring as a fallback, but this research does not establish that either is universally available or guaranteed. A prototype can simulate an offline state and explain that the alert could not be sent.

## 4. Existing solutions and implications

The category already includes emergency dispatch products, panic buttons, family tracking, journey tracking, and safety check-ins. This competitive scan is based on providers' own public descriptions and should be validated hands-on; feature availability, prices, coverage, and terms can change.

| Service | Publicly described capability | Implication for SafeArrival |
| --- | --- | --- |
| mySOS | Emergency contacts and location sharing; “Track Me” countdown journey timer; describes a wearable panic button. [mySOS](https://mysos.co.za/download-html/) | Journey timers and a separate trigger already exist in the market. Investigate exact workflow, supported areas, cost, and what users still find hard. |
| Namola | Emergency help, family safety, emergency response network; its site describes operator call-back and responder dispatch. [Namola](https://www.namola.com/) | Direct professional response is an established value proposition. SafeArrival should not imply that it dispatches responders unless it has a real partnership and operational capability. |
| Gauteng e-Panic Button | Public app listing describes private armed/medical response and adding loved ones. [Google Play listing](https://play.google.com/store/apps/details?id=za.gov.gautengPanicButton_new) | A government-branded panic-app option exists; interview people about awareness, trust, access, and actual use rather than assuming a gap. |
| Discovery 911 | Offers phone-based and physical panic buttons. Its FAQ explicitly says the physical device works independently if the phone is stolen, flat, or out of reach. [Discovery 911 FAQ](https://www.discovery.co.za/car-and-home-insurance/faq-discovery-911) | The phone-left-in-car problem has a known hardware response. A web app cannot replicate this guarantee. A device integration would be a later, partner-dependent option. |
| AT Alert | Provider describes panic alerts to family/friends, check-ins, requested check-ins, and location sharing. [AT Alert](https://afri-tec.com/at-alert-app/) | Family check-in functionality also exists. The proposed arrival window may be a narrower interaction, but differentiation is unproven. |
| TSU Protect / CEMRO-SA / iER | Providers describe emergency alerts connected with monitoring or response networks. [TSU Protect](https://tsuprotect.co.za/mobile-safety-security/), [CEMRO-SA](https://www.cemro.org.za/emergency-app/), [iER](https://www.ier.co.za/) | Emergency response depends on operating partners, coverage, subscriptions, or integrations; it is beyond the initial prototype. |
| Vehicle recovery services (for example Tracker and Cartrack) | Tracking providers describe installed vehicle units, control rooms, response teams, tamper/jamming alerts, and sometimes a backup radio-frequency tag. [Tracker](https://www.tracker.co.za/), [Cartrack recovery](https://www.cartrack.co.za/platform/features/risk-management-compliance/stolen-vehicle-recovery) | These are hardware and operations capabilities. A phone app cannot infer or recreate their tracking signals or safely direct a recovery team. |

### 4.1 Competitive implication

Do not pitch “a panic button app” or “an app that tracks your journey” as novel. Instead, investigate whether a very specific, low-friction **arrival grace period** solves a real gap that existing products do not solve for the intended users. It may turn out that the right recommendation is configuring an existing tool or changing a household routine rather than building a new product. That would still be a valuable research finding.

### 4.2 What to compare during interviews

- Have participants heard of or used any safety/check-in app or device?
- What happened in their last real use? What did they trust or distrust?
- Was location sharing continuous or only sent on request/alert?
- Was a response centre involved, or only personal contacts?
- What costs, data access, phone compatibility, or signup requirements were barriers?
- Did any existing feature cover the gate-to-inside period?

Do not ask interviewees for account credentials or detailed location histories.

## 5. Problem decomposition

### 5.1 The journey comprises distinct moments

1. **Before departure:** A person may tell someone they are leaving. Destination and ETA are estimates.
2. **En route:** A person might be unable to interact safely while driving. Frequent prompts can be distracting and unsafe.
3. **Near home:** A change in ETA could be traffic, a stop, route choice, navigation error, or danger. The app cannot infer which.
4. **At the gate:** The person may be outside the vehicle and unable to use a phone. A countdown may be running, but there may be no direct proof of safety.
5. **After entry:** The user may be able to confirm safe arrival. If no confirmation arrives, contacts need context and a sensible next step.

The feature should not require typing or screen interaction while driving. The first prototype can model the flow without claiming passive detection or live background tracking.

### 5.2 A missed check-in is ambiguous

Possible explanations include a safe but delayed arrival, stopped vehicle, dead phone, no data, app closed, notification ignored, inaccurate ETA, user forgetting, or an actual emergency. The system should describe the event as “check-in overdue” rather than “user in danger.” Contacts should receive enough information to decide whether to call, message, or take another appropriate step.

### 5.3 Location information is not ground truth

GPS may be unavailable, stale, imprecise, or permission-denied. Browser geolocation may return a quick low-accuracy location. The app should store the observation time and accuracy when it captures coordinates and display “last shared location” with timestamp—not “live location” unless it truly is live.

Avoid automatic geofence-based confirmation that treats arrival at a coordinate as proof the user is safe. A location can indicate proximity; only a user action can confirm safety in this prototype.

## 6. Product and safety implications

### 6.1 Escalation should be contact-first and configurable

An MVP can notify one or more user-selected trusted contacts when the app's backend sees a check-in deadline expire. The notification should say the check-in is overdue, when the journey began, the chosen deadline, and the timestamp/accuracy of the last shared location. A contact may then check in with the user.

Automatic calling of the person may be stressful or unsafe and may expose a phone in a hostile situation. Research whether a call is wanted; do not make it the default. A “contact the user” action for the trusted contact is different from an automatic call initiated by the system.

Do not automatically send an armed response or police dispatch request in the prototype. False dispatches, operational coverage, service agreements, and response accountability require a real partner and careful testing.

### 6.2 Discretion and false alarms

Participants should help decide whether reminders should be silent, vibrate, appear on lock screen, or be omitted. This is device-dependent and must be tested. The app should allow a short grace period and cancellation, but cancellation should not require multiple complex steps. Any interaction must avoid drawing attention in a threatening situation.

### 6.3 Phone left in the car

The initial web app depends on the user having access to the phone for start/confirm steps and on the browser/app having already been configured. In the reported scenario, the phone may be left inside the vehicle. A person may still have the phone on them, but the product cannot assume that. This is a central interview question and a scope risk.

Possible later alternatives, only if users validate the need, include a wearable, physical Bluetooth/SOS button, vehicle-integrated hardware, a trusted contact-operated check-in, or a routine that triggers escalation without a gate interaction. Each requires testing and, for physical devices or vehicle integration, hardware/partner work. Do not imply an ordinary web page can receive a Bluetooth button press when closed or deliver alerts like native hardware.

## 7. Web app and backend feasibility

### 7.1 What the web prototype can demonstrate

- Set trusted contacts using fictional demo values.
- Start a journey and define a planned arrival / grace window.
- Simulate a midway check-in and overdue state.
- Show how a trusted-contact alert would look.
- Demonstrate backend-owned deadline processing and an audit-friendly status history.
- Use opt-in location once, display its timestamp/accuracy, or use clearly labelled mock coordinates.

### 7.2 What must not be promised

- Continuous tracking while a browser tab is backgrounded or closed.
- Timely OS notifications across every browser, device, permission state, battery mode, and network condition.
- A missed check-in being proof of violence or danger.
- Guaranteed contact, police, or private security response.
- An app in the car alerting someone after the vehicle tracker is jammed or destroyed.

Chrome documents that browser geolocation is paused when a tab is backgrounded. MDN documents that service workers can run for events but are not continuously active, and that periodic background sync is not guaranteed at the requested interval and has limited browser support. [Chrome: one-time permissions](https://developer.chrome.com/blog/one-time-permissions), [MDN: offline and background operation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation), [MDN: periodic background sync](https://developer.mozilla.org/en-US/docs/Web/API/Web_Periodic_Background_Synchronization_API)

Apple supports web push for Home Screen web apps on iOS/iPadOS 16.4 or later, with user permission and a service worker. This is a notification feature, not background GPS tracking. [Apple: web push for web apps](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers)

### 7.3 Recommended prototype semantics

- The backend records a deadline and evaluates it server-side. The deadline should not depend on a JavaScript timer in the browser staying alive.
- A notification is sent only if the server reaches the deadline and an enabled provider is configured. Demo mode can produce an in-app event instead.
- Mark delivery states accurately: queued, sent to provider, provider accepted, failed. Do not show “delivered” just because an API request succeeded unless delivery is confirmed.
- Keep the interface explicit: “Demo alert” when simulated; “last location shared at…” for coordinates; “check-in overdue” for a missed deadline.
- Provide manual cancellation and safe test journeys; never notify real contacts during demos without explicit consent.

## 8. Privacy, security, and ethics

### 8.1 Data types and harm

Potentially collected data includes name or alias, contact channels, journey times, destination labels, coordinates, notification tokens, and alert history. Together, location and routine information can reveal where someone lives, when they are away, or who their trusted circle is. A data breach or unauthorized sharing could create physical risk.

### 8.2 POPIA design considerations

POPIA sets conditions for lawful processing, including accountability, processing limitation, purpose specification, information quality, openness, security safeguards, and retention limitation. The Information Regulator's guidance summarizes these conditions and stresses that data should not be retained longer than necessary for its purpose. [Protection of Personal Information Act](https://www.justice.gov.za/legislation/acts/2013-004.pdf), [Information Regulator guidance](https://inforegulator.org.za/wp-content/uploads/2020/07/Revised-Guidance-Note-on-applications-for-Prior-Authorisation-adopted-by-Members-30-Jan.pdf)

For a student prototype, use synthetic accounts, synthetic contacts, and simulated location. If real people test it, do not collect their exact home coordinates or contact details in a shared repository. Explain what is captured, why, who sees it, and how it is deleted. Avoid collecting location until the user starts an explicit journey, and stop retaining it when the journey purpose ends.

This document is product research, not legal advice. Any real launch requires a proper privacy review and accountable operator.

### 8.3 Security baseline for later design

- Use HTTPS in deployment.
- Do not store secrets in the repository or frontend bundle.
- Require authorization so users can only access their journeys and contacts.
- Minimize fields and retention; make deletion possible.
- Avoid exposing precise location in public links, analytics, logs, or error reports.
- Protect alert endpoints from abuse and duplicate sends.
- Keep an auditable status history without keeping unnecessary location history.
- Configure CORS narrowly and validate input server-side.
- Use fake data in seed scripts and demo accounts.

## 9. Interview plan: what desk research suggests asking

Use the neutral interview guide in [03-interview-guide.md](03-interview-guide.md). Do not read this research summary to participants as if it were a proven story. Ask about the person's own experience first, then show a concept only after learning their current behavior.

### Key assumptions to test

| Assumption | Why it matters | How to test |
| --- | --- | --- |
| Late arrivals and gate entry create a meaningful safety concern for the participant | Establishes whether the actual problem exists for the target group | Ask for a recent routine and specific friction, without prompting toward a crime narrative |
| A missed-arrival notification is useful to a trusted contact | Establishes recipient and value | Ask what the contact would do, when, and what information they need |
| A midway prompt is useful | Adds interruption and complexity | Ask whether they currently check in while travelling and when a prompt would be acceptable |
| Users can confirm safe arrival after leaving the car | Could fail in the motivating case | Ask how they carry/access phone and alternatives; test simple prototype flow |
| A web app is adequate for the first interaction | Web/PWA may not run reliably in background | Ask what device/browser they use and whether installing/opening a web app is acceptable |
| Contacts can be reached quickly and safely | Alert channel is a dependency | Ask which channels are reliable; do not request real contact details during research |
| Existing services leave a gap | Category already includes check-in and panic features | Ask what they know/use and what remains unresolved; verify product claims separately |

### Outcomes that should change the project

- If participants already use a satisfactory journey safety tool, investigate why they use it and consider a smaller complementary workflow.
- If phone access at the gate is the central barrier, do not pretend a web timer fixes it. Reassess target moment and feasibility.
- If contacts cannot act or alerts create risk, reconsider escalation behavior.
- If the problem is primarily vehicle recovery or caller threats, split those into separate problem statements rather than quietly adding unrelated features.
- If participants do not experience the proposed issue, pivot before spending time on architecture.

## 10. Initial product hypothesis and possible MVP

### Hypothesis

For people who want a trusted person to know when they arrive home, a simple journey check-in with a personal arrival grace period may reduce the time before a missed arrival is noticed. This remains unvalidated.

### Prototype scope candidate

1. Configure a test user and one or more fictional trusted contacts.
2. Start a journey with an expected arrival and personal grace period.
3. Simulate a midway confirmation.
4. Confirm arrival or allow the server-side deadline to expire.
5. Show a clearly labelled simulated alert to the contact view, with last shared time/location if enabled.
6. Let a contact mark that they acknowledged the alert.

Do not add a social crime map, anonymous phone tracing, public neighborhood alerts, vehicle tracking, suspect descriptions, or live dispatch until user evidence and a safe operational model justify them.

## 11. Risks and mitigations

| Risk | Why it matters | Mitigation for discovery/prototype |
| --- | --- | --- |
| Users assume alert equals emergency response | Could lead to dangerous reliance | Clearly label contact-only or simulated alerts; avoid rescue claims |
| Phone is unavailable at the gate | Core premise may fail | Treat as a research gate; examine non-phone alternatives without promising hardware |
| False alerts | Can cause panic, alert fatigue, or unsafe contact | Use an explicit grace period, cancellation, and overdue wording |
| Notification or data outage | A server cannot guarantee mobile delivery | Show status honestly; test offline/network loss; no safety guarantee |
| Location exposes home/routine | Creates privacy and physical-security risk | Collect minimally, only during an active trip, and use mock data during demo |
| False confidence from GPS/ETA | Arrival estimate may be wrong | User confirmation is authoritative; location is contextual only |
| Existing services already cover feature | Weak novelty and adoption | Compare actual alternatives and pivot to an evidenced gap |
| Escalation draws attention | A call or sound may be noticed by a threat | Test discreet settings; do not automatically call by default |
| Scope expands into unrelated crimes | Reduces quality and clarity | Keep initial research focused on late journey and home arrival check-in |

## 12. Preliminary conclusion

There is sufficient public evidence to justify interviewing people about vehicle hijacking around home and residential contexts. There is also clear evidence that South African services already offer emergency buttons, location sharing, journey tracking, and check-ins. The project opportunity is therefore not “crime needs an app”; it is to find out whether a specific arrival-check-in gap remains for a reachable group of users, and whether a hosted web prototype can demonstrate a useful, honest piece of that workflow.

The next decision should be based on the three or more interviews required by the assignment. Record what contradicts the idea as carefully as what supports it.

## 13. Adjacent problem: threatening or anonymous calls

The threat-by-phone account is serious, but it is a different problem from late-arrival check-ins and should be researched separately rather than added to SafeArrival's MVP. A caller ID display or caller-identification app is not a verified identity record. ICASA's 2026 enforcement notice documents a case involving misuse of numbering resources and CLI manipulation in a telecom context. That proves numbering abuse can occur; it does **not** show that a particular threatening call was anonymised at ISP level or that an app can identify its caller. [ICASA, 8 July 2026 decision](https://www.icasa.org.za/news/2026/icasa-imposes-sanctions-on-session-telecoms-for-non-compliance-with-the-numbering-plan-regulations)

RICA governs interception and communication-related information and prohibits unauthorized interception, subject to the Act's exceptions. It is not a public facility for an individual developer to trace callers. The appropriate response to a credible threat is to preserve call logs, voicemails, texts, and relevant dates; report it to SAPS and the service provider; retain the case reference; and let the lawful investigation determine what subscriber or network information can be obtained. SAPS says a victim can report a crime at a station or call 10111 in an emergency, and a case reference is issued. [RICA](https://www.justice.gov.za/legislation/acts/2002-070.pdf), [SAPS: report a crime](https://www.saps.gov.za/services/report_crime.php), [SAPS: 10111 call centre](https://www.saps.gov.za/services/cc_10111.php)

In March 2026, the Department of Justice reported systemic and operational SIM registration weaknesses that had, in some instances, limited law enforcement's ability to trace suspects. This is evidence that even formal investigative tracing can face limitations; it is not support for attempting technical deanonymization outside lawful channels. [Department of Justice, RICA/SIM registration statement](https://www.justice.gov.za/m_statements/2026/20260326-RICA.html)

**Scope decision:** Do not build caller tracing, number lookup, surveillance, or doxxing into SafeArrival. If this concern is later investigated as a separate project, start with victim needs, evidence preservation, reporting pathways, and false attribution risk—not technical identification of a person.

## 14. Emergency pathways and escalation design

SAPS describes 10111 as a 24-hour police emergency call centre. It asks callers for incident location and relevant details, and says that 10111 should be used for emergencies rather than general inquiries. SAPS also lists mobile emergency number 112 in its safety pamphlet; government pages list 10111 for police and 10177 for ambulance/fire as applicable. Availability and routing can vary, so a production app should verify current local guidance and avoid claiming a contact app directly reaches dispatch. [SAPS 10111 service](https://www.saps.gov.za/services/cc_10111.php), [SAPS crime-prevention pamphlet](https://www.saps.gov.za/resource_centre/publications/pamphlets/documents/crime_prevention_tips.pdf), [Department of Tourism emergency contacts](https://www.tourism.gov.za/Pages/Safety--Travel-Tips-Info.aspx)

The emergency process is voice-based and asks a caller to explain what happened. A SafeArrival contact alert may help a trusted person notice a missed arrival, but it does not provide dispatch with a verified emergency report. Any future emergency-services integration would require reliable location, operational acceptance, appropriate agreements, testing, and clear ownership of false alarms. The MVP should remain a personal check-in tool, not an emergency call-routing claim.

## 15. Vehicle tracking, jamming, and recovery: a separate technical layer

Vehicle tracking and recovery are distinct from personal check-ins. Recovery providers describe installed units, control-room monitoring, geofences, tamper alerts, backup radio-frequency tags, and coordinated recovery teams. Cartrack publicly describes anti-jamming alerts and backup radio-frequency tracking, while Tracker publishes risk statistics from its own customer base. These are provider claims and should be treated as descriptions of commercial systems, not independently verified product guarantees. [Cartrack stolen vehicle recovery](https://www.cartrack.co.za/platform/features/risk-management-compliance/stolen-vehicle-recovery), [Cartrack on anti-jamming](https://www.cartrack.co.za/blog/cartrack-tag-get-a-backup-tracker-and-outsmart-gps-jamming), [Tracker Vehicle Crime Index](https://datahub.tracker.co.za/crime-index/)

The user's account of a tracker signal pointing to a location where the vehicle was not found is consistent with a general distinction between a last/reported signal location and visual recovery; it does not establish exactly how the system was jammed, disabled, or located in that incident. Do not infer a mechanism without the provider's incident report. A mobile app using phone GPS cannot locate a stolen vehicle once the phone is left behind, separated, switched off, or without connectivity.

For an SME/fleet interview, investigate separately:

- What does the employer expect the driver to do when a vehicle is taken?
- Who has authority to contact the tracker and police?
- Are tools/equipment inventoried and recorded, and what is the reporting burden?
- What does the tracker tell the company: live signal, last-known position, tamper status, or recovery case status?
- Which response activities are done by the control room versus driver, employer, SAPS, or private recovery team?
- Is the primary unmet need personal safety, vehicle recovery, equipment inventory, or communication/coordination?

Never recommend that victims or neighbours pursue or confront suspects. The product should not direct untrained people to a tracker ping or potential recovery scene.

## 16. Updated discovery priorities

After this additional research, prioritize the following in interviews:

1. **Validate the specific arrival moment.** Ask for a recent routine and where/when a person can safely interact.
2. **Check the phone assumption.** Is the phone carried, mounted, in a bag, or left in the vehicle? What other item is accessible?
3. **Map current response relationships.** Which person is contacted, how, and what can they actually do?
4. **Explore connectivity and cost.** Do participants rely on prepaid data? What happens during a data outage or low battery?
5. **Compare existing services.** Ask which app/device/security provider they know or use and what remains unsolved.
6. **Keep individual and business needs apart.** A company fleet driver, employer, and personal household may have different goals and permissions.
7. **Separate SafeArrival from threatening-call investigation.** Do not merge identity tracing into this product.

## 17. New sources added

21. Statistics South Africa, [General Household Survey 2024](https://www.statssa.gov.za/publications/P0318/P03182024.pdf).
22. Statistics South Africa, [General Household Survey 2025 media release](https://www.statssa.gov.za/publications/P0318/MEDIA%20RELEASE%20-%20%20GHS%202025%20.pdf).
23. ICASA, [Affordability Market Inquiry](https://www.icasa.org.za/pages/affordability-market-inquiry).
24. Tracker, [Business-owned vehicle risk, Jan–Jun 2025](https://www.tracker.co.za/news-room/business-owned-vehicles-still-bear-the-brunt-of-vehicle-crime).
25. Tracker, [Vehicle crime risk update, Jan–Jun 2026](https://www.tracker.co.za/news-room/vehicle-crime-risk-declines).
26. Tracker, [Vehicle Crime Index](https://datahub.tracker.co.za/crime-index/).
27. Cartrack, [Stolen vehicle recovery service](https://www.cartrack.co.za/platform/features/risk-management-compliance/stolen-vehicle-recovery).
28. Cartrack, [Anti-jamming and backup tracker description](https://www.cartrack.co.za/blog/cartrack-tag-get-a-backup-tracker-and-outsmart-gps-jamming).
29. Republic of South Africa, [Regulation of Interception of Communications and Provision of Communication-Related Information Act 70 of 2002](https://www.justice.gov.za/legislation/acts/2002-070.pdf).
30. ICASA, [Decision on numbering plan non-compliance and CLI manipulation, July 2026](https://www.icasa.org.za/news/2026/icasa-imposes-sanctions-on-session-telecoms-for-non-compliance-with-the-numbering-plan-regulations).
31. Department of Justice and Constitutional Development, [RICA and SIM registration challenges, March 2026](https://www.justice.gov.za/m_statements/2026/20260326-RICA.html).
32. SAPS, [10111 call centre](https://www.saps.gov.za/services/cc_10111.php).
33. SAPS, [Reporting a crime](https://www.saps.gov.za/services/report_crime.php).
34. Department of Tourism, [Emergency contacts and travel tips](https://www.tourism.gov.za/Pages/Safety--Travel-Tips-Info.aspx).

## 18. Source register

Primary and product sources reviewed on 5 November 2026. Provider claims describe their own offerings and are not independent evaluations.

1. Statistics South Africa, [Governance, Public Safety and Justice Survey 2023/24](https://www.statssa.gov.za/publications/P0341/P0341August2024.pdf).
2. Statistics South Africa, [Governance, Public Safety and Justice Survey 2024/25](https://www.statssa.gov.za/publications/P0341/P03412025.pdf).
3. South African Police Service, [Police-recorded crime statistics, 2025/26 fourth quarter](https://www.saps.gov.za/services/downloads/2025/2025-2026_-_4th_Quarter_WEB.pdf).
4. South African Police Service, [Annual Report 2024/25](https://www.saps.gov.za/about/stratframework/annual_report/2024_2025/2024-25-SAPS-Annual-Report.pdf).
5. South African Police Service, [Safety hints to prevent hijackings, house and business robberies](https://www.saps.gov.za/resource_centre/publications/pamphlets/documents/crime_prevention_tips.pdf).
6. South African Police Service, [Safety awareness in a vehicle](https://www.saps.gov.za/alert/safety_awareness_vehicle.php).
7. mySOS, [Download and feature overview](https://mysos.co.za/download-html/).
8. Namola, [Emergency help and family safety](https://www.namola.com/).
9. Gauteng e-Panic Button, [Google Play app listing](https://play.google.com/store/apps/details?id=za.gov.gautengPanicButton_new).
10. Discovery, [Discovery 911 FAQ](https://www.discovery.co.za/car-and-home-insurance/faq-discovery-911).
11. Afri-Tec, [AT Alert app](https://afri-tec.com/at-alert-app/).
12. CEMRO-SA, [Emergency app and live personal tracker](https://www.cemro.org.za/emergency-app/).
13. TSU Protect, [Mobile safety and security app](https://tsuprotect.co.za/mobile-safety-security/).
14. iER, [Integrated Emergency Response](https://www.ier.co.za/).
15. Republic of South Africa, [Protection of Personal Information Act 4 of 2013](https://www.justice.gov.za/legislation/acts/2013-004.pdf).
16. Information Regulator South Africa, [Guidance note on prior authorisation and lawful processing](https://inforegulator.org.za/wp-content/uploads/2020/07/Revised-Guidance-Note-on-applications-for-Prior-Authorisation-adopted-by-Members-30-Jan.pdf).
17. Chrome for Developers, [One-time permissions and background tabs](https://developer.chrome.com/blog/one-time-permissions).
18. MDN, [Offline and background operation in PWAs](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation).
19. MDN, [Periodic Background Synchronization API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Periodic_Background_Synchronization_API).
20. Apple Developer, [Web push notifications for web apps and browsers](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers).

