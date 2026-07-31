import type { HttpClient } from '../http.js';
import { unwrap } from '../pagination.js';
import type { QuoteView } from '../types/quote.js';

/** Quote templates. Templates ARE quotes — the endpoint returns QuoteView[]. */
export class TemplatesResource {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<QuoteView[]> {
    const payload = await this.http.request<unknown>('/api/templates');
    return unwrap<QuoteView>(payload);
  }
}
