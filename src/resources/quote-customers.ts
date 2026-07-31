import type { HttpClient } from '../http.js';
import { fieldsToReplaceOps, type JsonPatchOp } from '../json-patch.js';
import { unwrap } from '../pagination.js';
import type { QuoteCustomerView } from '../types/customer.js';

/** Customer records attached to a quote (there is no global customer directory). */
export class QuoteCustomersResource {
  constructor(private readonly http: HttpClient) {}

  async list(quoteId: string): Promise<QuoteCustomerView[]> {
    const payload = await this.http.request<unknown>(
      `/api/quotes/${encodeURIComponent(quoteId)}/customers`
    );
    return unwrap<QuoteCustomerView>(payload);
  }

  /** Full replace (PUT). */
  async replace(
    quoteId: string,
    id: string,
    customer: Partial<QuoteCustomerView>
  ): Promise<QuoteCustomerView> {
    return this.http.request(
      `/api/quotes/${encodeURIComponent(quoteId)}/customers/${encodeURIComponent(id)}`,
      { method: 'PUT', body: customer }
    );
  }

  async update(quoteId: string, id: string, ops: JsonPatchOp[]): Promise<QuoteCustomerView> {
    return this.http.request(
      `/api/quotes/${encodeURIComponent(quoteId)}/customers/${encodeURIComponent(id)}`,
      { method: 'PATCH', body: ops }
    );
  }

  async updateFields(
    quoteId: string,
    id: string,
    fields: Partial<QuoteCustomerView>
  ): Promise<QuoteCustomerView> {
    return this.update(quoteId, id, fieldsToReplaceOps(fields as Record<string, unknown>));
  }

  async delete(quoteId: string, id: string): Promise<void> {
    await this.http.request(
      `/api/quotes/${encodeURIComponent(quoteId)}/customers/${encodeURIComponent(id)}`,
      { method: 'DELETE' }
    );
  }
}
