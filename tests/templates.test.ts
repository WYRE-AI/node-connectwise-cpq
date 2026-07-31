import { describe, expect, it } from 'vitest';

import {
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  ServerError,
} from '../src/index.js';
import { templateFixture } from './fixtures/cpq.js';
import { makeClient, respondWithError } from './helpers.js';

const client = makeClient();

describe('templates', () => {
  it('lists templates (templates ARE quotes — QuoteView[])', async () => {
    const templates = await client.templates.list();
    expect(templates).toEqual([templateFixture]);
    expect(templates[0].isTemplate).toBe(true);
  });

  describe('error paths', () => {
    it('401 → AuthenticationError', async () => {
      respondWithError('get', '/api/templates', 401);
      await expect(client.templates.list()).rejects.toBeInstanceOf(AuthenticationError);
    });

    it('404 → NotFoundError', async () => {
      respondWithError('get', '/api/templates', 404);
      await expect(client.templates.list()).rejects.toBeInstanceOf(NotFoundError);
    });

    it('429 → RateLimitError', async () => {
      respondWithError('get', '/api/templates', 429);
      await expect(client.templates.list()).rejects.toBeInstanceOf(RateLimitError);
    });

    it('500 → ServerError', async () => {
      respondWithError('get', '/api/templates', 500);
      await expect(client.templates.list()).rejects.toBeInstanceOf(ServerError);
    });
  });
});
