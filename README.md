# Port Gamble Weddings (staged rebuild)

The new portgambleweddings.com, built around one job: **get a warm lead from "is my date open?" to a booked tour as fast as possible.** Couples who tour book about 75% of the time.

This is a **staged** site. It is not deployed, it is set to `noindex`, and it touches none of the live sites or seller accounts. Background: [`docs/HANDOFF.md`](docs/HANDOFF.md) and [`docs/AGENT_BRIEF.md`](docs/AGENT_BRIEF.md).

## What it does

- **Check my date** (home page hero and `/check-your-date`): pick a date and a package (Church + Pavilion, Pavilion, Church only) and see Open or Booked with that day's published price.
- **Steers instead of dead-ending:** when a date is taken (or too soon), it shows the nearest open dates, favouring Fridays and Sundays over midweek, each with its price and a one-click "Tour for this date". For a peak-season request it also offers the nearest open off-season weekend.
- **Book a tour** (`/book-a-tour`): open tour times by day, a short form, instant confirmation on screen. The wedding date and package carry over from the date check.
- **Sticky mobile bar** with Call and Book a tour on every page.
- **Pricing transparency:** `/pricing` shows the 2027 rate card by day of week; rates that aren't published say so instead of guessing.
- **Conversion events** on a small analytics layer (see below).

## Stack

- Next.js 16 (App Router), React 19, TypeScript in strict mode
- Postgres 16 with plain SQL migrations (`db/migrations`), queried with `pg`
- zod for every input, Luxon for time zones (all venue logic runs in `America/Los_Angeles`)
- Vitest for unit and integration tests; GitHub Actions CI

## Run it locally

Needs Node 20.9+ and a Postgres you can create two databases on.

```bash
cp .env.example .env.local          # then edit the connection strings
createdb pg_weddings_dev
createdb pg_weddings_test
npm install
npm run db:migrate
npm run db:seed                      # FAKE bookings so date-check has something to show
npm run dev                          # http://localhost:3000
```

Checks (the same ones CI runs):

```bash
npm run typecheck
npm run lint
npm test                             # unit + integration; integration wipes pg_weddings_test
npm run build
```

## How it stays reliable

The rules that matter are enforced by the database, not just the code, so no bug or race can break them:

| Guarantee | How |
|---|---|
| A space is never double-booked | Partial unique index: one active reservation per space per day. Combination packages reserve church and Pavilion in one transaction, all or nothing. |
| A tour slot is never double-booked | Partial unique index on scheduled tours per start time. Tested with 10 simultaneous bookings: exactly one wins, the rest get a clean "just taken" message. |
| A retry never books twice | Every booking carries an `Idempotency-Key`; retries (double clicks, flaky networks, concurrent duplicates) return the original tour. |
| Expired holds never block a date | Availability ignores holds past `expires_at`; reserving a date first expires stale holds; a cron sweeps the rest. |
| Messages are never lost or doubled | Transactional outbox: messages are written in the same transaction as the booking, then sent by a dispatcher that claims rows with `SKIP LOCKED`, retries with backoff and gives up after 5 tries. |
| Times are right across daylight saving | Tour slots are generated from Pacific wall-clock times and stored as UTC instants; wedding dates are plain calendar dates. Tests cover the March and November changes. |
| Visitors always have a way forward | If the database is down, the API returns 503 with a "call us" message and the UI shows the phone number. Analytics failures never block a booking. |
| Only real tour times can be booked | The server regenerates the schedule and accepts only an exact slot with enough notice inside the booking window. |

Other hardening: strict input validation with field-level errors, a honeypot field, security headers, statement timeouts, constant-time cron auth that fails closed, migrations under an advisory lock with checksums.

## Layout

```
db/migrations/           SQL schema (the constraints above live here)
src/lib/                 Pure, tested logic: dates, pricing, alternatives, tour slots, validation, analytics events
src/server/              Database access, booking services, messaging, payments interface, API helpers
src/app/                 Pages and API routes
src/components/          DateChecker, TourBooker, site chrome
scripts/                 migrate, seed (fake data), dispatch-outbox
tests/unit, tests/integration
```

### API

| Route | Purpose |
|---|---|
| `GET /api/availability?date=YYYY-MM-DD&package=combination` | Status, price, nearby alternatives, off-season pick |
| `GET /api/tour-slots` | Open tour times (next 21 days) |
| `POST /api/tours` (header `Idempotency-Key`) | Book a tour; 201 new, 200 replay, 409 slot taken |
| `POST /api/events` | Browser funnel events (whitelisted names) |
| `GET /api/health` | Database check |
| `GET /api/cron/dispatch-outbox`, `GET /api/cron/expire-holds` | Background jobs; need `Authorization: Bearer $CRON_SECRET` |

Agents can call the booking services in `src/server/booking` directly; they're the internal API.

## Conversion events

One list in `src/lib/analytics/events.ts`, shared by browser and server:

`cta_clicked`, `date_check_started`, `date_checked`, `alternative_date_selected`, `tour_slot_selected`, `tour_booked`, `tour_booking_failed`, `phone_clicked`.

Every event is pushed to `window.dataLayer`, ready for GA4, Google Ads and Meta tags (no IDs are configured yet). `date_checked` and `tour_booked` are also recorded server-side in `funnel_events` when the action happens, which makes them the source of truth for funnel reporting; the rest are beaconed to `/api/events`. UTM tags are captured on landing and saved on the lead, so a booked tour can be credited to its ad.

## What's stubbed

- **Messaging.** Tour confirmation (email, and text with consent), 24-hour and 2-hour reminders and a staff notice are written to the outbox on every booking. `MESSAGING_MODE` controls them: `off`, `approval` (default: rows wait as `awaiting_approval` and are never sent) or `auto`. The only providers are `log` ones, which send nothing. Twilio, Resend or GHL plug in behind `EmailProvider` / `SmsProvider`.
- **Payments.** `PaymentProvider` with a fake implementation, not wired in yet (retainer, balance, deposit come later).
- **Photos.** Gradient placeholders marked "Photo: ..." where venue photography goes.
- **Admin.** No staff screens yet; holds and bookings are created through `reserveDate()`.

## Assumptions to confirm (all in `src/lib/booking-rules.ts` or `src/content`)

- Tour days and times: Mon to Thu 10, 12, 2, 4; Fri 10, 12, 2; Sat 10, 12; no Sundays or holidays; 60 minutes; 12 hours' notice; 21 days ahead.
- No tours on days the Pavilion has an event.
- Weddings can be checked from 14 days to about 3 years out. Holds last 7 days by default.
- One church event per day (the data shows a church-only ceremony can share a day with a Pavilion-only wedding, which this allows).
- Contact details are the seller's current ones; extra Pavilion hour $300 vs $280 is unresolved; seasonal and 2028 rates aren't published.
