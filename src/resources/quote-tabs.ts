import type { HttpClient } from '../http.js';
import { unwrap, type CpqListParams } from '../pagination.js';
import type { QuoteItemView } from '../types/quote-item.js';
import type { QuoteTabView } from '../types/quote-tab.js';

/** Quote tabs/sections — read-only surface (the API offers no tab mutation). */
export class QuoteTabsResource {
  constructor(private readonly http: HttpClient) {}

  async list(params?: CpqListParams): Promise<QuoteTabView[]> {
    const payload = await this.http.request<unknown>('/api/quoteTabs', { params: { ...params } });
    return unwrap<QuoteTabView>(payload);
  }

  async listItems(tabId: string): Promise<QuoteItemView[]> {
    const payload = await this.http.request<unknown>(
      `/api/quoteTabs/${encodeURIComponent(tabId)}/quoteItems`
    );
    return unwrap<QuoteItemView>(payload);
  }
}
