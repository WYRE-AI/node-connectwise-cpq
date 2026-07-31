import { describe, expect, it } from 'vitest';

import { CpqClient } from '../src/index.js';

const valid = { accessKey: 'site', publicKey: 'pub', privateKey: 'priv' };

describe('CpqClient constructor', () => {
  it.each(['accessKey', 'publicKey', 'privateKey'] as const)(
    'throws immediately when %s is empty (500-means-missing-auth quirk)',
    (key) => {
      expect(() => new CpqClient({ ...valid, [key]: '' })).toThrow(new RegExp(`"${key}"`));
    }
  );

  it('throws on whitespace-only credentials', () => {
    expect(() => new CpqClient({ ...valid, privateKey: '   ' })).toThrow(/privateKey/);
  });

  it('exposes all nine resource classes', () => {
    const client = new CpqClient(valid);
    for (const resource of [
      client.quotes,
      client.quoteItems,
      client.quoteCustomers,
      client.quoteTabs,
      client.quoteTerms,
      client.templates,
      client.taxCodes,
      client.recurringRevenues,
      client.users,
    ]) {
      expect(resource).toBeDefined();
    }
  });
});
