import { http, HttpResponse } from 'msw';

import {
  quoteFixture,
  quoteVersionFixture,
  templateFixture,
} from '../fixtures/cpq.js';

const BASE = 'https://sellapi.quosalsell.com';

// Literal routes are registered before parameterized ones.
export const quoteHandlers = [
  http.get(`${BASE}/api/quotes`, () => HttpResponse.json([quoteFixture])),
  http.get(`${BASE}/api/templates`, () => HttpResponse.json([templateFixture])),
  http.post(`${BASE}/api/quotes/copyById/:id`, () =>
    HttpResponse.json({ ...quoteFixture, id: 'copied01-0000-0000-0000-000000000001' })
  ),
  http.get(`${BASE}/api/quotes/:quoteNumber/versions/latest`, () =>
    HttpResponse.json(quoteVersionFixture)
  ),
  http.get(`${BASE}/api/quotes/:quoteNumber/versions/:version`, () =>
    HttpResponse.json(quoteVersionFixture)
  ),
  http.delete(`${BASE}/api/quotes/:quoteNumber/versions/:version`, () =>
    new HttpResponse(null, { status: 204 })
  ),
  http.get(`${BASE}/api/quotes/:quoteNumber/versions`, () =>
    HttpResponse.json([quoteFixture, quoteVersionFixture])
  ),
  http.get(`${BASE}/api/quotes/:id`, () => HttpResponse.json(quoteFixture)),
  http.patch(`${BASE}/api/quotes/:id`, async ({ request }) => {
    const ops = (await request.json()) as Array<{ op: string; path: string; value?: unknown }>;
    const patched: Record<string, unknown> = { ...quoteFixture };
    for (const op of ops) {
      if (op.op === 'replace') patched[op.path.slice(1)] = op.value;
    }
    return HttpResponse.json(patched);
  }),
  http.delete(`${BASE}/api/quotes/:id`, () => new HttpResponse(null, { status: 204 })),
];
