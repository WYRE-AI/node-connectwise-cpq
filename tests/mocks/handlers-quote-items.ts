import { http, HttpResponse } from 'msw';

import { quoteItemFixture } from '../fixtures/cpq.js';

const BASE = 'https://sellapi.quosalsell.com';

export const quoteItemHandlers = [
  http.get(`${BASE}/api/quoteItems`, () => HttpResponse.json([quoteItemFixture])),
  http.post(`${BASE}/api/quoteItems`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...quoteItemFixture, ...body, id: 'created1-0000-0000-0000-000000000001' });
  }),
  http.get(`${BASE}/api/quoteItems/:id`, () => HttpResponse.json(quoteItemFixture)),
  http.patch(`${BASE}/api/quoteItems/:id`, async ({ request }) => {
    const ops = (await request.json()) as Array<{ op: string; path: string; value?: unknown }>;
    const patched: Record<string, unknown> = { ...quoteItemFixture };
    for (const op of ops) {
      if (op.op === 'replace') patched[op.path.slice(1)] = op.value;
    }
    return HttpResponse.json(patched);
  }),
  http.delete(`${BASE}/api/quoteItems/:id`, () => new HttpResponse(null, { status: 204 })),
];
