import type { HttpClient } from '../http.js';
import { fieldsToReplaceOps, type JsonPatchOp } from '../json-patch.js';
import { unwrap, type CpqListParams } from '../pagination.js';
import type { QuoteTermView } from '../types/quote-term.js';

/** Payment/financing term options on a quote. */
export class QuoteTermsResource {
  constructor(private readonly http: HttpClient) {}

  async list(quoteId: string, params?: CpqListParams): Promise<QuoteTermView[]> {
    const payload = await this.http.request<unknown>(
      `/api/quotes/${encodeURIComponent(quoteId)}/quoteTerms`,
      { params: { ...params } }
    );
    return unwrap<QuoteTermView>(payload);
  }

  async create(quoteId: string, term: Partial<QuoteTermView>): Promise<QuoteTermView> {
    return this.http.request(`/api/quotes/${encodeURIComponent(quoteId)}/quoteTerms`, {
      method: 'POST',
      body: term,
    });
  }

  async update(quoteId: string, id: string, ops: JsonPatchOp[]): Promise<QuoteTermView> {
    return this.http.request(
      `/api/quotes/${encodeURIComponent(quoteId)}/quoteTerms/${encodeURIComponent(id)}`,
      { method: 'PATCH', body: ops }
    );
  }

  async updateFields(
    quoteId: string,
    id: string,
    fields: Partial<QuoteTermView>
  ): Promise<QuoteTermView> {
    return this.update(quoteId, id, fieldsToReplaceOps(fields as Record<string, unknown>));
  }

  async delete(quoteId: string, id: string): Promise<void> {
    await this.http.request(
      `/api/quotes/${encodeURIComponent(quoteId)}/quoteTerms/${encodeURIComponent(id)}`,
      { method: 'DELETE' }
    );
  }
}
