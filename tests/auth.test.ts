import { describe, expect, it } from 'vitest';

import { CpqBasicAuth } from '../src/index.js';

describe('CpqBasicAuth', () => {
  it('builds Basic base64("accessKey+publicKey:privateKey")', async () => {
    const auth = new CpqBasicAuth('site', 'pub', 'priv');
    const headers = await auth.headers();
    const expected = Buffer.from('site+pub:priv', 'utf8').toString('base64');
    expect(headers).toEqual({ Authorization: `Basic ${expected}` });
  });

  it('does not implement handleUnauthorized (401 is terminal)', () => {
    const auth = new CpqBasicAuth('site', 'pub', 'priv');
    expect(auth.handleUnauthorized).toBeUndefined();
  });
});
