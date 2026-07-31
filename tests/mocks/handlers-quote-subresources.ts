import { http, HttpResponse } from 'msw';

import { quoteCustomerFixture, quoteTermFixture } from '../fixtures/cpq.js';

const BASE = 'https://sellapi.quosalsell.com';

export const quoteSubresourceHandlers = [
  // Customers — exist only per-quote.
  http.get(`${BASE}/api/quotes/:quoteId/customers`, () =>
    HttpResponse.json([quoteCustomerFixture])
  ),
  http.put(`${BASE}/api/quotes/:quoteId/customers/:id`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...quoteCustomerFixture, ...body });
  }),
  http.patch(`${BASE}/api/quotes/:quoteId/customers/:id`, async ({ request }) => {
    const ops = (await request.json()) as Array<{ op: string; path: string; value?: unknown }>;
    const patched: Record<string, unknown> = { ...quoteCustomerFixture };
    for (const op of ops) {
      if (op.op === 'replace') patched[op.path.slice(1)] = op.value;
    }
    return HttpResponse.json(patched);
  }),
  http.delete(`${BASE}/api/quotes/:quoteId/customers/:id`, () =>
    new HttpResponse(null, { status: 204 })
  ),

  // Terms.
  http.get(`${BASE}/api/quotes/:quoteId/quoteTerms`, () => HttpResponse.json([quoteTermFixture])),
  http.post(`${BASE}/api/quotes/:quoteId/quoteTerms`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...quoteTermFixture, ...body, id: 'termnew1-0000-0000-0000-000000000001' });
  }),
  http.patch(`${BASE}/api/quotes/:quoteId/quoteTerms/:id`, async ({ request }) => {
    const ops = (await request.json()) as Array<{ op: string; path: string; value?: unknown }>;
    const patched: Record<string, unknown> = { ...quoteTermFixture };
    for (const op of ops) {
      if (op.op === 'replace') patched[op.path.slice(1)] = op.value;
    }
    return HttpResponse.json(patched);
  }),
  http.delete(`${BASE}/api/quotes/:quoteId/quoteTerms/:id`, () =>
    new HttpResponse(null, { status: 204 })
  ),
];
