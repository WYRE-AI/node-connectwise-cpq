import { describe, expect, it } from 'vitest';

import { fieldsToReplaceOps } from '../src/index.js';

describe('fieldsToReplaceOps', () => {
  it('maps each defined field to a replace op', () => {
    expect(fieldsToReplaceOps({ name: 'Renewal', isArchive: true })).toEqual([
      { op: 'replace', path: '/name', value: 'Renewal' },
      { op: 'replace', path: '/isArchive', value: true },
    ]);
  });

  it('skips undefined values but keeps null', () => {
    expect(fieldsToReplaceOps({ a: undefined, b: null })).toEqual([
      { op: 'replace', path: '/b', value: null },
    ]);
  });

  it('returns an empty array for an empty object', () => {
    expect(fieldsToReplaceOps({})).toEqual([]);
  });
});
