import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import {
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  ServerError,
  buildConditions,
  paginate,
  type QuoteView,
} from '../src/index.js';
import { quoteFixture, quoteVersionFixture } from './fixtures/cpq.js';
import { BASE, makeClient, respondWithError } from './helpers.js';
import { server } from './mocks/server.js';

const client = makeClient();

describe('quotes', () => {
  it('lists quotes (bare-array response)', async () => {
    expect(await client.quotes.list()).toEqual([quoteFixture]);
  });

  it('passes conditions with bracketed date-only dates', async () => {
    let conditions: string | null = null;
    server.use(
      http.get(`${BASE}/api/quotes`, ({ request }) => {
        conditions = new URL(request.url).searchParams.get('conditions');
        return HttpResponse.json([quoteFixture]);
      })
    );
    await client.quotes.list({
      conditions: buildConditions([
        { field: 'createDate', op: '>=', value: new Date('2026-07-01T10:00:00Z') },
      ]),
    });
    expect(conditions).toBe('createDate >= [2026-07-01]');
  });

  it('gets a quote by GUID id', async () => {
    expect(await client.quotes.get(quoteFixture.id!)).toEqual(quoteFixture);
  });

  it('updates via raw JSON Patch ops', async () => {
    const updated = await client.quotes.update(quoteFixture.id!, [
      { op: 'replace', path: '/name', value: 'Renamed' },
    ]);
    expect(updated.name).toBe('Renamed');
  });

  it('updateFields converts a partial into replace ops', async () => {
    let body: unknown;
    server.use(
      http.patch(`${BASE}/api/quotes/:id`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(quoteFixture);
      })
    );
    await client.quotes.updateFields(quoteFixture.id!, { name: 'FY27', isArchive: true });
    expect(body).toEqual([
      { op: 'replace', path: '/name', value: 'FY27' },
      { op: 'replace', path: '/isArchive', value: true },
    ]);
  });

  it('deletes a quote (204 → resolves void)', async () => {
    await expect(client.quotes.delete(quoteFixture.id!)).resolves.toBeUndefined();
  });

  it('copies a template into a new quote', async () => {
    const copy = await client.quotes.copyFromTemplate('tmpl-guid');
    expect(copy.id).toBe('copied01-0000-0000-0000-000000000001');
  });

  it('lists versions by quoteNumber', async () => {
    expect(await client.quotes.listVersions(1042)).toEqual([quoteFixture, quoteVersionFixture]);
  });

  it('gets the latest version', async () => {
    expect(await client.quotes.getVersion(1042, 'latest')).toEqual(quoteVersionFixture);
  });

  it('gets a specific version', async () => {
    expect(await client.quotes.getVersion(1042, 2)).toEqual(quoteVersionFixture);
  });

  it('deletes a specific version', async () => {
    await expect(client.quotes.deleteVersion(1042, 2)).resolves.toBeUndefined();
  });

  it('paginates with short-page termination', async () => {
    let calls = 0;
    server.use(
      http.get(`${BASE}/api/quotes`, ({ request }) => {
        calls += 1;
        const page = Number(new URL(request.url).searchParams.get('page'));
        if (page === 1) return HttpResponse.json([quoteFixture, quoteVersionFixture]);
        return HttpResponse.json([quoteFixture]); // short page → stop
      })
    );
    const all: QuoteView[] = [];
    for await (const page of paginate((page, pageSize) => client.quotes.list({ page, pageSize }), 2)) {
      all.push(...page);
    }
    expect(all).toHaveLength(3);
    expect(calls).toBe(2);
  });

  describe('error paths', () => {
    it('401 → AuthenticationError (vendor typo body)', async () => {
      respondWithError('get', '/api/quotes', 401);
      await expect(client.quotes.list()).rejects.toBeInstanceOf(AuthenticationError);
    });

    it('404 → NotFoundError', async () => {
      respondWithError('get', '/api/quotes/:id', 404);
      await expect(client.quotes.get('missing')).rejects.toBeInstanceOf(NotFoundError);
    });

    it('429 → RateLimitError', async () => {
      respondWithError('get', '/api/quotes', 429);
      await expect(client.quotes.list()).rejects.toBeInstanceOf(RateLimitError);
    });

    it('500 → ServerError', async () => {
      respondWithError('get', '/api/quotes', 500);
      await expect(client.quotes.list()).rejects.toBeInstanceOf(ServerError);
    });
  });
});
