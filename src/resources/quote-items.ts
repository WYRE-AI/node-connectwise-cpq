import type { HttpClient } from '../http.js';
import { fieldsToReplaceOps, type JsonPatchOp } from '../json-patch.js';
import { unwrap, type CpqListParams } from '../pagination.js';
import type { QuoteItemView } from '../types/quote-item.js';

/** Quote line items. Filter by quote/tab via conditions (`idQuote = "<guid>"`). */
export class QuoteItemsResource {
  constructor(private readonly http: HttpClient) {}

  async list(params?: CpqListParams): Promise<QuoteItemView[]> {
    const payload = await this.http.request<unknown>('/api/quoteItems', { params: { ...params } });
    return unwrap<QuoteItemView>(payload);
  }

  async get(id: string): Promise<QuoteItemView> {
    return this.http.request(`/api/quoteItems/${encodeURIComponent(id)}`);
  }

  /** In practice requires `idQuote` and `idQuoteTabs` (community-established). */
  async create(item: Partial<QuoteItemView>): Promise<QuoteItemView> {
    return this.http.request('/api/quoteItems', { method: 'POST', body: item });
  }

  async update(id: string, ops: JsonPatchOp[]): Promise<QuoteItemView> {
    return this.http.request(`/api/quoteItems/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: ops,
    });
  }

  async updateFields(id: string, fields: Partial<QuoteItemView>): Promise<QuoteItemView> {
    return this.update(id, fieldsToReplaceOps(fields as Record<string, unknown>));
  }

  async delete(id: string): Promise<void> {
    await this.http.request(`/api/quoteItems/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }
}
