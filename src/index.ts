export { CpqClient } from './client.js';
export { DEFAULT_BASE_URL, type CpqConfig } from './config.js';
export { CpqBasicAuth, type AuthProvider } from './auth.js';
export { HttpClient, type HttpClientConfig, type RequestOptions } from './http.js';
export { RateLimiter } from './rate-limiter.js';
export {
  CpqError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ServerError,
} from './errors.js';
export { fieldsToReplaceOps, type JsonPatchOp } from './json-patch.js';
export {
  paginate,
  unwrap,
  buildConditions,
  type CpqListParams,
  type ConditionClause,
} from './pagination.js';
export { QuotesResource } from './resources/quotes.js';
export { QuoteItemsResource } from './resources/quote-items.js';
export { QuoteCustomersResource } from './resources/quote-customers.js';
export { QuoteTabsResource } from './resources/quote-tabs.js';
export { QuoteTermsResource } from './resources/quote-terms.js';
export { TemplatesResource } from './resources/templates.js';
export { TaxCodesResource } from './resources/tax-codes.js';
export { RecurringRevenuesResource } from './resources/recurring-revenues.js';
export { UsersResource } from './resources/users.js';
export type {
  ReferenceLink,
  QuoteView,
  QuoteItemView,
  QuoteCustomerView,
  QuoteTabView,
  QuoteTermView,
  TaxCodeView,
  RecurringRevenueView,
  UserView,
} from './types/index.js';
