/** Errors the API maps to specific HTTP responses. Messages are safe to show visitors. */

export class AppError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, readonly fields: Record<string, string> = {}) {
    super(message, "invalid_request", 400);
  }
}

export class SlotUnavailableError extends AppError {
  constructor(message = "That tour time was just taken. Please pick another.") {
    super(message, "slot_unavailable", 409);
  }
}

export class DateUnavailableError extends AppError {
  constructor(message = "That date is no longer available.") {
    super(message, "date_unavailable", 409);
  }
}

export class IdempotencyConflictError extends AppError {
  constructor() {
    super("This request was already used for a different booking.", "idempotency_conflict", 409);
  }
}

export class DatabaseUnavailableError extends AppError {
  constructor(detail: string) {
    super("Booking is temporarily unavailable. Please call us and we'll get you on the calendar.", "unavailable", 503);
    this.detail = detail;
  }
  readonly detail: string;
}
