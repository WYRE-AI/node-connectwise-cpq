import { describe, expect, it } from 'vitest';

import {
  AuthenticationError,
  CpqError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  ServerError,
  ValidationError,
} from '../src/index.js';

describe('error hierarchy', () => {
  it('every subclass extends CpqError and Error', () => {
    const errors = [
      new AuthenticationError('auth', {}),
      new ForbiddenError('forbidden', {}),
      new NotFoundError('missing', {}),
      new ValidationError('bad', [], {}),
      new RateLimitError('slow down', 5, {}),
      new ServerError('boom', {}),
    ];
    for (const err of errors) {
      expect(err).toBeInstanceOf(CpqError);
      expect(err).toBeInstanceOf(Error);
    }
  });

  it('pins status codes per subclass', () => {
    expect(new AuthenticationError('x', {}).statusCode).toBe(401);
    expect(new ForbiddenError('x', {}).statusCode).toBe(403);
    expect(new NotFoundError('x', {}).statusCode).toBe(404);
    expect(new ValidationError('x', [], {}).statusCode).toBe(400);
    expect(new RateLimitError('x', 5, {}).statusCode).toBe(429);
    expect(new ServerError('x', {}).statusCode).toBe(500);
  });

  it('ServerError carries the actual 5xx status when given one', () => {
    expect(new ServerError('bad gateway', {}, 502).statusCode).toBe(502);
    expect(new ServerError('unavailable', {}, 503).statusCode).toBe(503);
  });

  it('preserves the raw response body', () => {
    const body = { message: 'An unknown error has occured during basic auth validation' };
    expect(new AuthenticationError('auth', body).response).toEqual(body);
  });

  it('RateLimitError exposes retryAfter', () => {
    expect(new RateLimitError('x', 7, {}).retryAfter).toBe(7);
  });

  it('ValidationError exposes an errors array (empty for CPQ)', () => {
    expect(new ValidationError('x', [], {}).errors).toEqual([]);
  });
});
