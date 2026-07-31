import type { HttpClient } from '../http.js';
import { fieldsToReplaceOps, type JsonPatchOp } from '../json-patch.js';
import { unwrap, type CpqListParams } from '../pagination.js';
import type { QuoteView } from '../types/quote.js';

/**
 * Quotes. Dual addressing is deliberate: GUID `id` for get/patch/delete/copy;
 * integer `quoteNumber` (+ version) for the versions subresource.
 */
export class QuotesResource {
  constructor(private readonly http: HttpClient) {}

  async list(params?: CpqListParams): Promise<QuoteView[]> {
    const payload = await this.http.request<unknown>('/api/quotes', { params: { ...params } });
    return unwrap<QuoteView>(payload);
  }

  async get(id: string): Promise<QuoteView> {
    return this.http.request(`/api/quotes/${encodeURIComponent(id)}`);
  }

  /** PATCH with raw RFC 6902 ops. */
  async update(id: string, ops: JsonPatchOp[]): Promise<QuoteView> {
    return this.http.request(`/api/quotes/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: ops,
    });
  }

  /** Sugar: partial object → `replace` ops. */
  async updateFields(id: string, fields: Partial<QuoteView>): Promise<QuoteView> {
    return this.update(id, fieldsToReplaceOps(fields as Record<string, unknown>));
  }

  async delete(id: string): Promise<void> {
    await this.http.request(`/api/quotes/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }

  /** The API's only quote-create path: copy a template (or any quote) by GUID. */
  async copyFromTemplate(templateId: string): Promise<QuoteView> {
    return this.http.request(`/api/quotes/copyById/${encodeURIComponent(templateId)}`, {
      method: 'POST',
    });
  }

  async listVersions(quoteNumber: number): Promise<QuoteView[]> {
    const payload = await this.http.request<unknown>(`/api/quotes/${quoteNumber}/versions`);
    return unwrap<QuoteView>(payload);
  }

  async getVersion(quoteNumber: number, version: number | 'latest'): Promise<QuoteView> {
    return this.http.request(`/api/quotes/${quoteNumber}/versions/${version}`);
  }

  async deleteVersion(quoteNumber: number, version: number): Promise<void> {
    await this.http.request(`/api/quotes/${quoteNumber}/versions/${version}`, {
      method: 'DELETE',
    });
  }
}
