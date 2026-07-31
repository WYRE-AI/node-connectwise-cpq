import { describe, expect, it } from 'vitest';

import {
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  ServerError,
} from '../src/index.js';
import { quoteCustomerFixture, quoteFixture } from './fixtures/cpq.js';
import { makeClient, respondWithError } from './helpers.js';

const client = makeClient();
const quoteId = quoteFixture.id!;
const customerId = quoteCustomerFixture.id!;

describe('quoteCustomers', () => {
  it('lists the customers attached to a quote', async () => {
    expect(await client.quoteCustomers.list(quoteId)).toEqual([quoteCustomerFixture]);
  });

  it('replaces a customer record (PUT)', async () => {
    const replaced = await client.quoteCustomers.replace(quoteId, customerId, {
      companyName: 'Acme Holdings',
    });
    expect(replaced.companyName).toBe('Acme Holdings');
  });

  it('updates a customer via JSON Patch', async () => {
    const updated = await client.quoteCustomers.update(quoteId, customerId, [
      { op: 'replace', path: '/email', value: 'new@acme.example' },
    ]);
    expect(updated.email).toBe('new@acme.example');
  });

  it('updateFields sugar works', async () => {
    const updated = await client.quoteCustomers.updateFields(quoteId, customerId, {
      city: 'Nashville',
    });
    expect(updated.city).toBe('Nashville');
  });

  it('deletes a customer record', async () => {
    await expect(client.quoteCustomers.delete(quoteId, customerId)).resolves.toBeUndefined();
  });

  describe('error paths', () => {
    it('401 → AuthenticationError', async () => {
      respondWithError('get', '/api/quotes/:quoteId/customers', 401);
      await expect(client.quoteCustomers.list(quoteId)).rejects.toBeInstanceOf(AuthenticationError);
    });

    it('404 → NotFoundError', async () => {
      respondWithError('get', '/api/quotes/:quoteId/customers', 404);
      await expect(client.quoteCustomers.list('missing')).rejects.toBeInstanceOf(NotFoundError);
    });

    it('429 → RateLimitError', async () => {
      respondWithError('get', '/api/quotes/:quoteId/customers', 429);
      await expect(client.quoteCustomers.list(quoteId)).rejects.toBeInstanceOf(RateLimitError);
    });

    it('500 → ServerError', async () => {
      respondWithError('get', '/api/quotes/:quoteId/customers', 500);
      await expect(client.quoteCustomers.list(quoteId)).rejects.toBeInstanceOf(ServerError);
    });
  });
});
