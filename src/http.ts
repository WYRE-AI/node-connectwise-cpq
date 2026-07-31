import type { AuthProvider } from './auth.js';
import {
  AuthenticationError,
  CpqError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  ServerError,
  ValidationError,
} from './errors.js';
import type { JsonPatchOp } from './json-patch.js';
import type { RateLimiter } from './rate-limiter.js';

export interface HttpClientConfig {
  baseUrl: string;
  rateLimiter: RateLimiter;
  auth?: AuthProvider;
  /** Max retries for network errors, 429s, and 5xx responses (default 3). */
  maxRetries?: number;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  params?: Record<string, unknown>;
  /** Plain object for POST/PUT, or a JsonPatchOp[] array for PATCH (RFC 6902). */
  body?: unknown | JsonPatchOp[];
}

/** Pull a human-readable message out of a CPQ error body (`{"message": "..."}`). */
function bodyMessage(body: unknown): string | undefined {
  if (body !== null && typeof body === 'object') {
    const message = (body as Record<string, unknown>)['message'];
    if (typeof message === 'string' && message.length > 0) return message;
  }
  return undefined;
}

/**
 * Native-fetch HTTP client for ConnectWise CPQ.
 *
 * - Sends `Content-Type: application/json; version=1.0` on EVERY request
 *   (media-type versioning), including GETs and DELETEs.
 * - Retries network errors, 429, 500, 502, 503, 504 with exponential backoff
 *   `min(1000 * 2^(attempt-1), 30s)`. No Retry-After header has ever been
 *   observed from CPQ; if one appears it is honored for 429s.
 * - Reads every response body as text first, then JSON.parse — never `.json()`.
 * - Serializes query params as plain `key=value` (CPQ params are scalars).
 * - Normalizes trailing slashes on base URL and paths.
 * - No cookie jar: Azure ARRAffinity cookies are deliberately discarded
 *   (native fetch's default) so traffic is not pinned to one backend node.
 */
export class HttpClient {
  private readonly baseUrl: string;
  private readonly rateLimiter: RateLimiter;
  private readonly auth: AuthProvider | undefined;
  private readonly maxRetries: number;

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.rateLimiter = config.rateLimiter;
    this.auth = config.auth;
    this.maxRetries = config.maxRetries ?? 3;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', params, body } = options;

    // Leading slash guaranteed; trailing slashes stripped so the API never
    // answers with a redirect round-trip.
    let normalizedPath = path.startsWith('/') ? path : `/${path}`;
    if (normalizedPath.length > 1) normalizedPath = normalizedPath.replace(/\/+$/, '');
    let url = `${this.baseUrl}${normalizedPath}`;

    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) searchParams.set(key, String(value));
      }
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }

    let attemptedAuthRefresh = false;
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      if (attempt > 0) {
        const delay = Math.min(1000 * 2 ** (attempt - 1), 30_000);
        await new Promise((r) => setTimeout(r, delay));
      }

      await this.rateLimiter.acquire();

      const headers: Record<string, string> = {
        Accept: 'application/json',
        // Media-type versioning: always sent, body or not.
        'Content-Type': 'application/json; version=1.0',
        ...(this.auth ? await this.auth.headers() : {}),
      };

      let response: Response;
      try {
        response = await fetch(url, {
          method,
          headers,
          body: body !== undefined ? JSON.stringify(body) : undefined,
        });
      } catch (err) {
        lastError = err as Error;
        continue;
      }

      if (response.ok) {
        // All CPQ DELETEs answer 204 No Content → resolve {}.
        if (response.status === 204) return {} as T;
        const rawText = await response.text();
        if (rawText.length === 0) return {} as T;
        const contentType = response.headers.get('content-type') ?? '';
        if (contentType.includes('application/json')) {
          try {
            return JSON.parse(rawText) as T;
          } catch {
            return rawText as T; // defensive: mislabeled non-JSON body
          }
        }
        return rawText as T;
      }

      // Read the error body safely: text first, then parse.
      let responseBody: unknown;
      const rawText = await response.text();
      try {
        responseBody = JSON.parse(rawText);
      } catch {
        responseBody = rawText;
      }
      const message = bodyMessage(responseBody);

      switch (response.status) {
        case 400:
          // CPQ gives a single `message`, no field detail — errors[] stays empty.
          throw new ValidationError(message ?? 'Bad request', [], responseBody);
        case 401: {
          const error = new AuthenticationError(message ?? 'Authentication failed', responseBody);
          if (!attemptedAuthRefresh && this.auth?.handleUnauthorized) {
            attemptedAuthRefresh = true;
            let refreshed = false;
            try {
              refreshed = await this.auth.handleUnauthorized();
            } catch {
              refreshed = false;
            }
            if (refreshed) {
              lastError = error;
              continue;
            }
          }
          throw error;
        }
        case 403:
          throw new ForbiddenError(message ?? 'Forbidden', responseBody);
        case 404:
          throw new NotFoundError(message ?? 'Resource not found', responseBody);
        case 429: {
          const retryAfterHeader = response.headers.get('retry-after');
          const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 5;
          const error = new RateLimitError('Rate limit exceeded', retryAfter, responseBody);
          if (attempt < this.maxRetries) {
            // Honor Retry-After if it ever appears; otherwise the loop's
            // exponential backoff applies (none has been observed from CPQ).
            if (retryAfterHeader) await new Promise((r) => setTimeout(r, retryAfter * 1000));
            lastError = error;
            continue;
          }
          throw error;
        }
        default:
          if (response.status >= 500) {
            // NB: a missing auth header ALSO produces a 500 upstream — see CpqClient's
            // constructor-time credential validation.
            lastError = new ServerError(
              message ?? `Server error: ${response.status}`,
              responseBody,
              response.status
            );
            if (attempt < this.maxRetries) continue;
            throw lastError;
          }
          throw new CpqError(message ?? `HTTP ${response.status}`, response.status, responseBody);
      }
    }

    throw lastError || new Error('Request failed after retries');
  }
}
