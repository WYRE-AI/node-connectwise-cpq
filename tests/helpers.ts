import { http, HttpResponse } from 'msw';

import { CpqClient } from '../src/index.js';
import { authTypoBody, serverErrorBody } from './fixtures/cpq.js';
import { server } from './mocks/server.js';

export const BASE = 'https://sellapi.quosalsell.com';

/** maxRetries defaults to 0 so error-path tests fail fast (no backoff sleeps). */
export function makeClient(maxRetries = 0): CpqClient {
  return new CpqClient({
    accessKey: 'acme-site',
    publicKey: 'pubkey',
    privateKey: 'privkey',
    maxRetries,
  });
}

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

/** Override one route to answer a fixed error status (reset by afterEach). */
export function respondWithError(method: Method, path: string, status: number): void {
  const bodies: Record<number, unknown> = {
    401: authTypoBody,
    404: { message: 'Not found' },
    429: { message: 'Too many requests' },
    500: serverErrorBody,
  };
  server.use(
    http[method](`${BASE}${path}`, () =>
      HttpResponse.json(bodies[status] ?? { message: `HTTP ${status}` }, { status })
    )
  );
}
