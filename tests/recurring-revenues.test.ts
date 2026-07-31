import { describe, expect, it } from 'vitest';

import {
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  ServerError,
} from '../src/index.js';
import { recurringRevenueFixture } from './fixtures/cpq.js';
import { makeClient, respondWithError } from './helpers.js';

const client = makeClient();

describe('recurringRevenues', () => {
  it('lists recurring-revenue period definitions', async () => {
    expect(await client.recurringRevenues.list()).toEqual([recurringRevenueFixture]);
  });

  describe('error paths', () => {
    it('401 → AuthenticationError', async () => {
      respondWithError('get', '/api/recurringRevenues', 401);
      await expect(client.recurringRevenues.list()).rejects.toBeInstanceOf(AuthenticationError);
    });

    it('404 → NotFoundError', async () => {
      respondWithError('get', '/api/recurringRevenues', 404);
      await expect(client.recurringRevenues.list()).rejects.toBeInstanceOf(NotFoundError);
    });

    it('429 → RateLimitError', async () => {
      respondWithError('get', '/api/recurringRevenues', 429);
      await expect(client.recurringRevenues.list()).rejects.toBeInstanceOf(RateLimitError);
    });

    it('500 → ServerError', async () => {
      respondWithError('get', '/api/recurringRevenues', 500);
      await expect(client.recurringRevenues.list()).rejects.toBeInstanceOf(ServerError);
    });
  });
});
