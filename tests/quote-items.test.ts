import { describe, expect, it } from 'vitest';

import {
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  ServerError,
} from '../src/index.js';
import { quoteItemFixture } from './fixtures/cpq.js';
import { makeClient, respondWithError } from './helpers.js';

const client = makeClient();

describe('quoteItems', () => {
  it('lists quote items', async () => {
    expect(await client.quoteItems.list()).toEqual([quoteItemFixture]);
  });

  it('gets a quote item by id', async () => {
    expect(await client.quoteItems.get(quoteItemFixture.id!)).toEqual(quoteItemFixture);
  });

  it('creates a quote item (idQuote + idQuoteTabs)', async () => {
    const created = await client.quoteItems.create({
      idQuote: quoteItemFixture.idQuote,
      idQuoteTabs: quoteItemFixture.idQuoteTabs,
      mfgPartNumber: 'FG-200F',
      quantity: 1,
    });
    expect(created.id).toBe('created1-0000-0000-0000-000000000001');
    expect(created.mfgPartNumber).toBe('FG-200F');
  });

  it('updates via JSON Patch', async () => {
    const updated = await client.quoteItems.update(quoteItemFixture.id!, [
      { op: 'replace', path: '/quantity', value: 5 },
    ]);
    expect(updated.quantity).toBe(5);
  });

  it('updateFields sugar works', async () => {
    const updated = await client.quoteItems.updateFields(quoteItemFixture.id!, { price: 450 });
    expect(updated.price).toBe(450);
  });

  it('deletes a quote item', async () => {
    await expect(client.quoteItems.delete(quoteItemFixture.id!)).resolves.toBeUndefined();
  });

  describe('error paths', () => {
    it('401 → AuthenticationError', async () => {
      respondWithError('get', '/api/quoteItems', 401);
      await expect(client.quoteItems.list()).rejects.toBeInstanceOf(AuthenticationError);
    });

    it('404 → NotFoundError', async () => {
      respondWithError('get', '/api/quoteItems/:id', 404);
      await expect(client.quoteItems.get('missing')).rejects.toBeInstanceOf(NotFoundError);
    });

    it('429 → RateLimitError', async () => {
      respondWithError('get', '/api/quoteItems', 429);
      await expect(client.quoteItems.list()).rejects.toBeInstanceOf(RateLimitError);
    });

    it('500 → ServerError', async () => {
      respondWithError('get', '/api/quoteItems', 500);
      await expect(client.quoteItems.list()).rejects.toBeInstanceOf(ServerError);
    });
  });
});
