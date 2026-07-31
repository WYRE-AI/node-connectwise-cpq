/**
 * Base error carries the HTTP status code and raw response body; subclasses pin
 * their status (ServerError carries the actual 5xx status it observed).
 */
export class CpqError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response: unknown
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * 401. CPQ's real body is `{"message":"An unknown error has occured during
 * basic auth validation"}` (vendor typo included) with a malformed
 * `WwwAuthenticate` challenge header — never parse it. Terminal for Basic
 * credentials: there is nothing to refresh.
 */
export class AuthenticationError extends CpqError {
  constructor(message: string, response: unknown) {
    super(message, 401, response);
  }
}

export class ForbiddenError extends CpqError {
  constructor(message: string, response: unknown) {
    super(message, 403, response);
  }
}

export class NotFoundError extends CpqError {
  constructor(message: string, response: unknown) {
    super(message, 404, response);
  }
}

/** 400. CPQ returns a single `message` with no field detail, so `errors` is usually empty. */
export class ValidationError extends CpqError {
  constructor(
    message: string,
    public errors: Array<{ field: string; message: string }>,
    response: unknown
  ) {
    super(message, 400, response);
  }
}

/** 429. CPQ has never been observed sending Retry-After; `retryAfter` defaults to 5 seconds. */
export class RateLimitError extends CpqError {
  constructor(message: string, public retryAfter: number, response: unknown) {
    super(message, 429, response);
  }
}

/**
 * 5xx. NOTE: a missing/stripped Authorization header also yields a 500
 * (`{"message":"An error has occurred."}`) upstream — which is why CpqClient
 * validates credentials at construction time.
 */
export class ServerError extends CpqError {
  constructor(message: string, response: unknown, statusCode = 500) {
    super(message, statusCode, response);
  }
}
