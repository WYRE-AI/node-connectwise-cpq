import type { HttpClient } from '../http.js';
import { unwrap, type CpqListParams } from '../pagination.js';
import type { TaxCodeView } from '../types/tax-code.js';

/** Tax codes and rates. */
export class TaxCodesResource {
  constructor(private readonly http: HttpClient) {}

  async list(params?: CpqListParams): Promise<TaxCodeView[]> {
    const payload = await this.http.request<unknown>('/api/taxCodes', { params: { ...params } });
    return unwrap<TaxCodeView>(payload);
  }
}
