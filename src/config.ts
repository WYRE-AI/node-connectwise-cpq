/**
 * Single global CPQ host — tenancy is via accessKey, not host. This is the
 * BARE host: endpoints mix `/api/...` and `/settings/...` prefixes, so never
 * bake `/api` into the base URL.
 */
export const DEFAULT_BASE_URL = 'https://sellapi.quosalsell.com';

export interface CpqConfig {
  /** Tenant/site access key (from the Sell URL `...home?accesskey=<this>`). */
  accessKey: string;
  /** Public API key (Settings → Organization Settings → API Keys). */
  publicKey: string;
  /** Private API key — shown once at creation. */
  privateKey: string;
  /** Override ONLY if directed by ConnectWise support. Default {@link DEFAULT_BASE_URL}. */
  baseUrl?: string;
  /** Max retries for network errors, 429s, and 5xx responses (default 3). */
  maxRetries?: number;
}
