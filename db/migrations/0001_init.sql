-- Port Gamble Weddings: core booking schema.
--
-- Reliability rules live here, in the database, so no code path can bypass them:
--   * one active reservation per space per day (partial unique index)
--   * one scheduled tour per slot (partial unique index)
--   * idempotency keys are unique, so a retried request can never create a second row
--   * enums are CHECK constraints so bad states cannot be written
-- Wedding dates are calendar dates (no time zone). Tour times are timestamptz and are
-- always generated from America/Los_Angeles wall-clock times in application code.

CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE leads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name      text NOT NULL CHECK (length(first_name) BETWEEN 1 AND 80),
  last_name       text NOT NULL CHECK (length(last_name) BETWEEN 1 AND 80),
  email           citext NOT NULL CHECK (length(email) BETWEEN 3 AND 254),
  phone           text CHECK (phone IS NULL OR length(phone) BETWEEN 7 AND 32),
  wedding_date    date,
  guest_count     integer CHECK (guest_count IS NULL OR guest_count BETWEEN 1 AND 1000),
  package_interest text CHECK (package_interest IS NULL OR package_interest IN ('pavilion', 'combination', 'church')),
  stage           text NOT NULL DEFAULT 'inquiry'
                    CHECK (stage IN ('inquiry', 'tour_booked', 'toured', 'hold', 'booked', 'lost')),
  source          text CHECK (source IS NULL OR length(source) <= 120),
  utm             jsonb NOT NULL DEFAULT '{}'::jsonb,
  sms_consent     boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
-- One lead per email address; repeat inquiries update the same lead.
CREATE UNIQUE INDEX leads_email_key ON leads (email);
CREATE INDEX leads_stage_idx ON leads (stage);

-- A reservation holds one space for one calendar day.
--   booking  - a signed wedding or event
--   hold     - a soft hold that expires (expires_at required)
--   blackout - staff-blocked day (maintenance, town events)
CREATE TABLE space_reservations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space       text NOT NULL CHECK (space IN ('pavilion', 'church')),
  event_date  date NOT NULL,
  kind        text NOT NULL CHECK (kind IN ('booking', 'hold', 'blackout')),
  status      text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'released', 'expired')),
  expires_at  timestamptz,
  lead_id     uuid REFERENCES leads (id) ON DELETE SET NULL,
  note        text CHECK (note IS NULL OR length(note) <= 500),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT holds_expire CHECK ((kind = 'hold') = (expires_at IS NOT NULL))
);
-- The double-booking guard: at most one active reservation per space per day.
CREATE UNIQUE INDEX space_reservations_one_active_per_day
  ON space_reservations (space, event_date) WHERE status = 'active';
CREATE INDEX space_reservations_date_idx ON space_reservations (event_date);
CREATE INDEX space_reservations_hold_expiry_idx
  ON space_reservations (expires_at) WHERE kind = 'hold' AND status = 'active';

CREATE TABLE tours (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id          uuid NOT NULL REFERENCES leads (id) ON DELETE RESTRICT,
  starts_at        timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60 CHECK (duration_minutes BETWEEN 15 AND 240),
  status           text NOT NULL DEFAULT 'scheduled'
                     CHECK (status IN ('scheduled', 'cancelled', 'completed', 'no_show')),
  idempotency_key  text NOT NULL CHECK (length(idempotency_key) BETWEEN 8 AND 128),
  notes            text CHECK (notes IS NULL OR length(notes) <= 2000),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
-- The tour double-booking guard: one scheduled tour per slot.
CREATE UNIQUE INDEX tours_one_scheduled_per_slot ON tours (starts_at) WHERE status = 'scheduled';
CREATE UNIQUE INDEX tours_idempotency_key ON tours (idempotency_key);
CREATE INDEX tours_lead_idx ON tours (lead_id);

-- Transactional outbox: messages are written in the same transaction as the booking,
-- then delivered by a separate dispatcher. Nothing is sent unless status = 'queued'.
CREATE TABLE outbox_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel         text NOT NULL CHECK (channel IN ('email', 'sms', 'internal')),
  template        text NOT NULL CHECK (length(template) BETWEEN 1 AND 80),
  lead_id         uuid REFERENCES leads (id) ON DELETE CASCADE,
  tour_id         uuid REFERENCES tours (id) ON DELETE CASCADE,
  payload         jsonb NOT NULL DEFAULT '{}'::jsonb,
  status          text NOT NULL
                    CHECK (status IN ('awaiting_approval', 'queued', 'sending', 'sent', 'failed', 'cancelled')),
  send_after      timestamptz NOT NULL DEFAULT now(),
  attempts        integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_error      text,
  idempotency_key text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX outbox_idempotency_key ON outbox_messages (idempotency_key);
CREATE INDEX outbox_due_idx ON outbox_messages (send_after) WHERE status = 'queued';

-- Funnel events recorded server-side (the source of truth for conversion reporting).
CREATE TABLE funnel_events (
  id          bigserial PRIMARY KEY,
  name        text NOT NULL CHECK (name ~ '^[a-z][a-z0-9_]{1,63}$'),
  session_id  text CHECK (session_id IS NULL OR length(session_id) <= 64),
  lead_id     uuid REFERENCES leads (id) ON DELETE SET NULL,
  props       jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX funnel_events_name_time_idx ON funnel_events (name, occurred_at);
