import { lookupHandlers } from './handlers-lookups.js';
import { quoteItemHandlers } from './handlers-quote-items.js';
import { quoteSubresourceHandlers } from './handlers-quote-subresources.js';
import { quoteHandlers } from './handlers-quotes.js';

// Subresource routes (/api/quotes/:quoteId/customers etc.) are registered
// before the generic /api/quotes/:id routes inside quoteHandlers never
// conflict with them (different segment counts), but keep literal-first
// ordering as a rule anyway.
export const handlers = [
  ...quoteSubresourceHandlers,
  ...quoteHandlers,
  ...quoteItemHandlers,
  ...lookupHandlers,
];
