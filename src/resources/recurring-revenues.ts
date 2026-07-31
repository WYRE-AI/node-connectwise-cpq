import type { HttpClient } from '../http.js';
import { unwrap, type CpqListParams } from '../pagination.js';
import type { RecurringRevenueView } from '../types/recurring-revenue.js';

/** Recurring-revenue period definitions. */
export class RecurringRevenuesResource {
  constructor(private readonly http: HttpClient) {}

  async list(params?: CpqListParams): Promise<RecurringRevenueView[]> {
    const payload = await this.http.request<unknown>('/api/recurringRevenues', {
      params: { ...params },
    });
    return unwrap<RecurringRevenueView>(payload);
  }
}
