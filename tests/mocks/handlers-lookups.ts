import { http, HttpResponse } from 'msw';

import {
  quoteItemFixture,
  quoteTabFixture,
  recurringRevenueFixture,
  taxCodeFixture,
  userFixture,
} from '../fixtures/cpq.js';

const BASE = 'https://sellapi.quosalsell.com';

export const lookupHandlers = [
  http.get(`${BASE}/api/quoteTabs`, () => HttpResponse.json([quoteTabFixture])),
  http.get(`${BASE}/api/quoteTabs/:id/quoteItems`, () => HttpResponse.json([quoteItemFixture])),
  http.get(`${BASE}/api/taxCodes`, () => HttpResponse.json([taxCodeFixture])),
  http.get(`${BASE}/api/recurringRevenues`, () => HttpResponse.json([recurringRevenueFixture])),
  // Note the non-/api prefix.
  http.get(`${BASE}/settings/user`, () => HttpResponse.json([userFixture])),
];
