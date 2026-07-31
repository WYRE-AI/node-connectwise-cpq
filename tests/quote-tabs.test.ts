import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import {
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  ServerError,
  buildConditions,
} from '../src/index.js';
import { quoteItemFixture, quoteTabFixture } from './fixtures/cpq.js';
import { BASE, makeClient, respondWithError } from './helpers.js';
import { server } from './mocks/server.js';

const client = makeClient();

describe('quoteTabs', () => {
  it('lists quote tabs', async () => {
    expect(await client.quoteTabs.list()).toEqual([quoteTabFixture]);
  });

  it('filters by idQuote via conditions', async () => {
    let conditions: string | null = null;
    server.use(
      http.get(`${BASE}/api/quoteTabs`, ({ request }) => {
        conditions = new URL(request.url).searchParams.get('conditions');
        return HttpResponse.json([quoteTabFixture]);
      })
    );
    await client.quoteTabs.list({
      conditions: buildConditions([{ field: 'idQuote', value: quoteTabFixture.idQuote! }]),
    });
    expect(conditions).toBe(`idQuote = "${quoteTabFixture.idQuote}"`);
  });

  it('lists the items on a tab', async () => {
    expect(await client.quoteTabs.listItems(quoteTabFixture.id!)).toEqual([quoteItemFixture]);
  });

  describe('error paths', () => {
    it('401 → AuthenticationError', async () => {
      respondWithError('get', '/api/quoteTabs', 401);
      await expect(client.quoteTabs.list()).rejects.toBeInstanceOf(AuthenticationError);
    });

    it('404 → NotFoundError', async () => {
      respondWithError('get', '/api/quoteTabs/:id/quoteItems', 404);
      await expect(client.quoteTabs.listItems('missing')).rejects.toBeInstanceOf(NotFoundError);
    });

    it('429 → RateLimitError', async () => {
      respondWithError('get', '/api/quoteTabs', 429);
      await expect(client.quoteTabs.list()).rejects.toBeInstanceOf(RateLimitError);
    });

    it('500 → ServerError', async () => {
      respondWithError('get', '/api/quoteTabs', 500);
      await expect(client.quoteTabs.list()).rejects.toBeInstanceOf(ServerError);
    });
  });
});
