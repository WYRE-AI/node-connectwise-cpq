import { describe, expect, it } from 'vitest';

import {
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  ServerError,
} from '../src/index.js';
import { taxCodeFixture } from './fixtures/cpq.js';
import { makeClient, respondWithError } from './helpers.js';

const client = makeClient();

describe('taxCodes', () => {
  it('lists tax codes', async () => {
    expect(await client.taxCodes.list()).toEqual([taxCodeFixture]);
  });

  it('accepts paging params', async () => {
    expect(await client.taxCodes.list({ page: 1, pageSize: 1 })).toEqual([taxCodeFixture]);
  });

  describe('error paths', () => {
    it('401 → AuthenticationError', async () => {
      respondWithError('get', '/api/taxCodes', 401);
      await expect(client.taxCodes.list()).rejects.toBeInstanceOf(AuthenticationError);
    });

    it('404 → NotFoundError', async () => {
      respondWithError('get', '/api/taxCodes', 404);
      await expect(client.taxCodes.list()).rejects.toBeInstanceOf(NotFoundError);
    });

    it('429 → RateLimitError', async () => {
      respondWithError('get', '/api/taxCodes', 429);
      await expect(client.taxCodes.list()).rejects.toBeInstanceOf(RateLimitError);
    });

    it('500 → ServerError', async () => {
      respondWithError('get', '/api/taxCodes', 500);
      await expect(client.taxCodes.list()).rejects.toBeInstanceOf(ServerError);
    });
  });
});
