import { CpqBasicAuth } from './auth.js';
import { DEFAULT_BASE_URL, type CpqConfig } from './config.js';
import { HttpClient } from './http.js';
import { RateLimiter } from './rate-limiter.js';
import { QuoteCustomersResource } from './resources/quote-customers.js';
import { QuoteItemsResource } from './resources/quote-items.js';
import { QuoteTabsResource } from './resources/quote-tabs.js';
import { QuoteTermsResource } from './resources/quote-terms.js';
import { QuotesResource } from './resources/quotes.js';
import { RecurringRevenuesResource } from './resources/recurring-revenues.js';
import { TaxCodesResource } from './resources/tax-codes.js';
import { TemplatesResource } from './resources/templates.js';
import { UsersResource } from './resources/users.js';

const REQUIRED_CREDENTIALS = ['accessKey', 'publicKey', 'privateKey'] as const;

/** ConnectWise CPQ (Sell) API client. One HttpClient shared by all resources. */
export class CpqClient {
  readonly quotes: QuotesResource;
  readonly quoteItems: QuoteItemsResource;
  readonly quoteCustomers: QuoteCustomersResource;
  readonly quoteTabs: QuoteTabsResource;
  readonly quoteTerms: QuoteTermsResource;
  readonly templates: TemplatesResource;
  readonly taxCodes: TaxCodesResource;
  readonly recurringRevenues: RecurringRevenuesResource;
  readonly users: UsersResource;

  constructor(config: CpqConfig) {
    // Load-bearing: the CPQ API answers a MISSING Authorization header with a
    // 500 (not 401), so client-side validation is the only way to turn
    // "no credentials" into a clear, immediate error.
    for (const key of REQUIRED_CREDENTIALS) {
      const value = config[key];
      if (typeof value !== 'string' || value.trim() === '') {
        throw new Error(
          `ConnectWise CPQ credential "${key}" is required and must be a non-empty string. ` +
            'All three of accessKey, publicKey, and privateKey are needed — the CPQ API ' +
            'answers a missing Authorization header with an ambiguous 500.'
        );
      }
    }

    const http = new HttpClient({
      baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
      rateLimiter: new RateLimiter(25, 5_000),
      auth: new CpqBasicAuth(config.accessKey, config.publicKey, config.privateKey),
      ...(config.maxRetries !== undefined ? { maxRetries: config.maxRetries } : {}),
    });

    this.quotes = new QuotesResource(http);
    this.quoteItems = new QuoteItemsResource(http);
    this.quoteCustomers = new QuoteCustomersResource(http);
    this.quoteTabs = new QuoteTabsResource(http);
    this.quoteTerms = new QuoteTermsResource(http);
    this.templates = new TemplatesResource(http);
    this.taxCodes = new TaxCodesResource(http);
    this.recurringRevenues = new RecurringRevenuesResource(http);
    this.users = new UsersResource(http);
  }
}
