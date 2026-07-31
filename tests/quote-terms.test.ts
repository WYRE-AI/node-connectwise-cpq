import { describe, expect, it } from 'vitest';

import {
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  ServerError,
} from '../src/index.js';
import { quoteFixture, quoteTermFixture } from './fixtures/cpq.js';
import { makeClient, respondWithError } from './helpers.js';

const client = makeClient();
const quoteId = quoteFixture.id!;
const termId = quoteTermFixture.id!;

describe('quoteTerms', () => {
  it('lists the terms on a quote', async () => {
    expect(await client.quoteTerms.list(quoteId)).toEqual([quoteTermFixture]);
  });

  it('creates a term', async () => {
    const created = await client.quoteTerms.create(quoteId, {
      name: '24-month financing',
      periods: 24,
    });
    expect(created.id).toBe('termnew1-0000-0000-0000-000000000001');
    expect(created.periods).toBe(24);
  });

  it('updates a term via JSON Patch', async () => {
    const updated = await client.quoteTerms.update(quoteId, termId, [
      { op: 'replace', path: '/isSelected', value: true },
    ]);
    expect(updated.isSelected).toBe(true);
  });

  it('updateFields sugar works', async () => {
    const updated = await client.quoteTerms.updateFields(quoteId, termId, { periods: 48 });
    expect(updated.periods).toBe(48);
  });

  it('deletes a term', async () => {
    await expect(client.quoteTerms.delete(quoteId, termId)).resolves.toBeUndefined();
  });

  describe('error paths', () => {
    it('401 → AuthenticationError', async () => {
      respondWithError('get', '/api/quotes/:quoteId/quoteTerms', 401);
      await expect(client.quoteTerms.list(quoteId)).rejects.toBeInstanceOf(AuthenticationError);
    });

    it('404 → NotFoundError', async () => {
      respondWithError('get', '/api/quotes/:quoteId/quoteTerms', 404);
      await expect(client.quoteTerms.list('missing')).rejects.toBeInstanceOf(NotFoundError);
    });

    it('429 → RateLimitError', async () => {
      respondWithError('get', '/api/quotes/:quoteId/quoteTerms', 429);
      await expect(client.quoteTerms.list(quoteId)).rejects.toBeInstanceOf(RateLimitError);
    });

    it('500 → ServerError', async () => {
      respondWithError('get', '/api/quotes/:quoteId/quoteTerms', 500);
      await expect(client.quoteTerms.list(quoteId)).rejects.toBeInstanceOf(ServerError);
    });
  });
});
