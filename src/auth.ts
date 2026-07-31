/** Supplies auth headers for the HttpClient and (optionally) handles 401s. */
export interface AuthProvider {
  headers(): Promise<Record<string, string>>;
  /** Called at most once per request on 401. Return true if refreshed → retry once. */
  handleUnauthorized?(): Promise<boolean>;
}

/**
 * ConnectWise CPQ Basic auth: `base64("{accessKey}+{publicKey}:{privateKey}")`.
 * No clientId header (unlike ConnectWise Manage — do not copy Manage auth code).
 * No handleUnauthorized — static Basic credentials make a 401 terminal.
 */
export class CpqBasicAuth implements AuthProvider {
  constructor(
    private readonly accessKey: string,
    private readonly publicKey: string,
    private readonly privateKey: string
  ) {}

  async headers(): Promise<Record<string, string>> {
    const token = Buffer.from(
      `${this.accessKey}+${this.publicKey}:${this.privateKey}`,
      'utf8'
    ).toString('base64');
    return { Authorization: `Basic ${token}` };
  }
}
