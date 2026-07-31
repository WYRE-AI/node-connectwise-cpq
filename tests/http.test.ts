import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import {
  AuthenticationError,
  CpqBasicAuth,
  CpqError,
  ForbiddenError,
  HttpClient,
  NotFoundError,
  RateLimitError,
  RateLimiter,
  ServerError,
  ValidationError,
  type JsonPatchOp,
} from '../src/index.js';
import { authTypoBody, serverErrorBody } from './fixtures/cpq.js';
import { server } from './mocks/server.js';

const BASE = 'https://sellapi.quosalsell.com';

function makeHttp(maxRetries = 0, baseUrl = BASE): HttpClient {
  return new HttpClient({
    baseUrl,
    rateLimiter: new RateLimiter(1000, 1000),
    auth: new CpqBasicAuth('site', 'pub', 'priv'),
    maxRetries,
  });
}

describe('HttpClient headers', () => {
  it('sends Content-Type: application/json; version=1.0 on EVERY request, including GET', async () => {
    let contentType: string | null = null;
    let accept: string | null = null;
    server.use(
      http.get(`${BASE}/probe`, ({ request }) => {
        contentType = request.headers.get('content-type');
        accept = request.headers.get('accept');
        return HttpResponse.json({ ok: true });
      })
    );
    await makeHttp().request('/probe');
    expect(contentType).toBe('application/json; version=1.0');
    expect(accept).toBe('application/json');
  });

  it('sends the CPQ Basic Authorization header', async () => {
    let authorization: string | null = null;
    server.use(
      http.get(`${BASE}/probe`, ({ request }) => {
        authorization = request.headers.get('authorization');
        return HttpResponse.json({ ok: true });
      })
    );
    await makeHttp().request('/probe');
    expect(authorization).toBe(`Basic ${Buffer.from('site+pub:priv').toString('base64')}`);
  });
});

describe('HttpClient URL building', () => {
  it('serializes params as plain key=value with no [] suffix', async () => {
    let url = '';
    server.use(
      http.get(`${BASE}/probe`, ({ request }) => {
        url = request.url;
        return HttpResponse.json([]);
      })
    );
    await makeHttp().request('/probe', {
      params: {
        conditions: 'isArchive = False',
        page: 1,
        pageSize: 100,
        showAllVersions: true,
        skipped: undefined,
        alsoSkipped: null,
      },
    });
    const parsed = new URL(url);
    expect(parsed.searchParams.get('conditions')).toBe('isArchive = False');
    expect(parsed.searchParams.get('page')).toBe('1');
    expect(parsed.searchParams.get('showAllVersions')).toBe('true');
    expect(parsed.search).not.toContain('%5B%5D'); // no "[]" array suffix
    expect(parsed.searchParams.has('skipped')).toBe(false);
  });

  it('normalizes trailing slashes on baseUrl and path (no redirect round-trips)', async () => {
    let path = '';
    server.use(
      http.get(`${BASE}/api/quotes`, ({ request }) => {
        path = new URL(request.url).pathname;
        return HttpResponse.json([]);
      })
    );
    await makeHttp(0, `${BASE}/`).request('api/quotes/');
    expect(path).toBe('/api/quotes');
  });
});

describe('HttpClient body handling', () => {
  it('resolves {} for 204 No Content (all CPQ DELETEs)', async () => {
    server.use(http.delete(`${BASE}/probe`, () => new HttpResponse(null, { status: 204 })));
    expect(await makeHttp().request('/probe', { method: 'DELETE' })).toEqual({});
  });

  it('reads success bodies as text-then-JSON.parse', async () => {
    server.use(
      http.get(
        `${BASE}/probe`,
        () =>
          new HttpResponse('{"parsed":true}', {
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
          })
      )
    );
    expect(await makeHttp().request('/probe')).toEqual({ parsed: true });
  });

  it('returns raw text when a JSON content-type carries a non-JSON body (defensive)', async () => {
    server.use(
      http.get(
        `${BASE}/probe`,
        () => new HttpResponse('not-json', { headers: { 'Content-Type': 'application/json' } })
      )
    );
    expect(await makeHttp().request('/probe')).toBe('not-json');
  });

  it('returns text for non-JSON content types', async () => {
    server.use(
      http.get(
        `${BASE}/probe`,
        () => new HttpResponse('plain', { headers: { 'Content-Type': 'text/plain' } })
      )
    );
    expect(await makeHttp().request('/probe')).toBe('plain');
  });

  it('serializes a JsonPatchOp[] body as a bare JSON array (RFC 6902)', async () => {
    let body: unknown;
    server.use(
      http.patch(`${BASE}/probe`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ ok: true });
      })
    );
    const ops: JsonPatchOp[] = [{ op: 'replace', path: '/name', value: 'X' }];
    await makeHttp().request('/probe', { method: 'PATCH', body: ops });
    expect(body).toEqual([{ op: 'replace', path: '/name', value: 'X' }]);
  });
});

describe('HttpClient error mapping', () => {
  it('maps 400 to ValidationError with the body message and empty errors[]', async () => {
    server.use(
      http.get(`${BASE}/probe`, () =>
        HttpResponse.json({ message: 'Invalid conditions' }, { status: 400 })
      )
    );
    const err = await makeHttp().request('/probe').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ValidationError);
    expect((err as ValidationError).message).toBe('Invalid conditions');
    expect((err as ValidationError).errors).toEqual([]);
  });

  it('maps the real 401 typo body to a terminal AuthenticationError', async () => {
    server.use(http.get(`${BASE}/probe`, () => HttpResponse.json(authTypoBody, { status: 401 })));
    const err = await makeHttp(3).request('/probe').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(AuthenticationError);
    expect((err as AuthenticationError).message).toBe(authTypoBody.message);
    expect((err as AuthenticationError).response).toEqual(authTypoBody);
  });

  it('maps 403 to ForbiddenError', async () => {
    server.use(
      http.get(`${BASE}/probe`, () => HttpResponse.json({ message: 'nope' }, { status: 403 }))
    );
    await expect(makeHttp().request('/probe')).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('maps 404 to NotFoundError', async () => {
    server.use(http.get(`${BASE}/probe`, () => HttpResponse.json({}, { status: 404 })));
    await expect(makeHttp().request('/probe')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('maps 429 to RateLimitError with default retryAfter 5 (header never observed)', async () => {
    server.use(http.get(`${BASE}/probe`, () => HttpResponse.json({}, { status: 429 })));
    const err = await makeHttp().request('/probe').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(RateLimitError);
    expect((err as RateLimitError).retryAfter).toBe(5);
  });

  it('maps 500 to ServerError preserving the missing-auth quirk body', async () => {
    server.use(
      http.get(`${BASE}/probe`, () => HttpResponse.json(serverErrorBody, { status: 500 }))
    );
    const err = await makeHttp().request('/probe').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ServerError);
    expect((err as ServerError).response).toEqual(serverErrorBody);
  });

  it('maps 502/503/504 to ServerError with the actual status', async () => {
    server.use(http.get(`${BASE}/probe`, () => HttpResponse.json({}, { status: 503 })));
    const err = await makeHttp().request('/probe').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ServerError);
    expect((err as ServerError).statusCode).toBe(503);
  });

  it('maps other 4xx to bare CpqError with the status', async () => {
    server.use(http.get(`${BASE}/probe`, () => HttpResponse.json({}, { status: 418 })));
    const err = await makeHttp().request('/probe').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(CpqError);
    expect(err).not.toBeInstanceOf(ServerError);
    expect((err as CpqError).statusCode).toBe(418);
  });

  it('parses non-JSON error bodies as raw text', async () => {
    server.use(
      http.get(
        `${BASE}/probe`,
        () => new HttpResponse('<html>gateway</html>', { status: 404 })
      )
    );
    const err = await makeHttp().request('/probe').catch((e: unknown) => e);
    expect((err as CpqError).response).toBe('<html>gateway</html>');
  });
});

describe('HttpClient retry behavior', () => {
  it('retries a 500 with backoff and succeeds', async () => {
    let calls = 0;
    server.use(
      http.get(`${BASE}/probe`, () => {
        calls += 1;
        if (calls === 1) return HttpResponse.json(serverErrorBody, { status: 500 });
        return HttpResponse.json({ ok: true });
      })
    );
    expect(await makeHttp(1).request('/probe')).toEqual({ ok: true });
    expect(calls).toBe(2);
  }, 10_000);

  it('retries a 429 and succeeds', async () => {
    let calls = 0;
    server.use(
      http.get(`${BASE}/probe`, () => {
        calls += 1;
        if (calls === 1) return HttpResponse.json({}, { status: 429 });
        return HttpResponse.json({ ok: true });
      })
    );
    expect(await makeHttp(1).request('/probe')).toEqual({ ok: true });
    expect(calls).toBe(2);
  }, 10_000);

  it('retries network errors and succeeds', async () => {
    let calls = 0;
    server.use(
      http.get(`${BASE}/probe`, () => {
        calls += 1;
        if (calls === 1) return HttpResponse.error();
        return HttpResponse.json({ ok: true });
      })
    );
    expect(await makeHttp(1).request('/probe')).toEqual({ ok: true });
    expect(calls).toBe(2);
  }, 10_000);

  it('exhausts retries on persistent 500 and throws ServerError', async () => {
    let calls = 0;
    server.use(
      http.get(`${BASE}/probe`, () => {
        calls += 1;
        return HttpResponse.json(serverErrorBody, { status: 500 });
      })
    );
    await expect(makeHttp(1).request('/probe')).rejects.toBeInstanceOf(ServerError);
    expect(calls).toBe(2); // initial + 1 retry
  }, 10_000);

  it('does NOT retry a 401 (terminal for static Basic creds)', async () => {
    let calls = 0;
    server.use(
      http.get(`${BASE}/probe`, () => {
        calls += 1;
        return HttpResponse.json(authTypoBody, { status: 401 });
      })
    );
    await expect(makeHttp(3).request('/probe')).rejects.toBeInstanceOf(AuthenticationError);
    expect(calls).toBe(1);
  });
});
