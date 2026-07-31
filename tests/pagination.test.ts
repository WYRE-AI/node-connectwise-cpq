import { describe, expect, it } from 'vitest';

import { buildConditions, paginate, unwrap } from '../src/index.js';

describe('paginate', () => {
  it('stops when a page comes back shorter than pageSize', async () => {
    const pages = [
      ['a', 'b'],
      ['c'], // short page → terminate
    ];
    const calls: number[] = [];
    const collected: string[] = [];
    for await (const page of paginate(async (page) => {
      calls.push(page);
      return pages[page - 1] ?? [];
    }, 2)) {
      collected.push(...page);
    }
    expect(collected).toEqual(['a', 'b', 'c']);
    expect(calls).toEqual([1, 2]); // never requested page 3
  });

  it('handles an empty first page', async () => {
    const collected: string[] = [];
    for await (const page of paginate<string>(async () => [], 100)) collected.push(...page);
    expect(collected).toEqual([]);
  });

  it('requests one extra page when the last full page is an exact multiple', async () => {
    const pages = [['a', 'b'], ['c', 'd'], []];
    const calls: number[] = [];
    const collected: string[] = [];
    for await (const page of paginate(async (page) => {
      calls.push(page);
      return pages[page - 1] ?? [];
    }, 2)) {
      collected.push(...page);
    }
    expect(collected).toEqual(['a', 'b', 'c', 'd']);
    expect(calls).toEqual([1, 2, 3]);
  });
});

describe('unwrap', () => {
  it('passes bare arrays through (the CPQ shape)', () => {
    expect(unwrap([1, 2])).toEqual([1, 2]);
  });

  it('defensively unwraps common envelope keys', () => {
    expect(unwrap({ data: [1] })).toEqual([1]);
    expect(unwrap({ items: [2] })).toEqual([2]);
    expect(unwrap({ results: [3] })).toEqual([3]);
    expect(unwrap({ value: [4] })).toEqual([4]);
  });

  it('returns an empty array for unrecognized payloads', () => {
    expect(unwrap(null)).toEqual([]);
    expect(unwrap('nope')).toEqual([]);
    expect(unwrap({ message: 'x' })).toEqual([]);
  });
});

describe('buildConditions', () => {
  it('quotes strings', () => {
    expect(buildConditions([{ field: 'name', value: 'Renewal' }])).toBe('name = "Renewal"');
  });

  it('capitalizes booleans', () => {
    expect(
      buildConditions([
        { field: 'isArchive', value: false },
        { field: 'isSent', value: true },
      ])
    ).toBe('isArchive = False and isSent = True');
  });

  it('brackets Date values date-only', () => {
    expect(
      buildConditions([{ field: 'createDate', op: '>=', value: new Date('2026-07-01T15:30:00Z') }])
    ).toBe('createDate >= [2026-07-01]');
  });

  it('strips time components from ISO date strings (the API rejects them)', () => {
    expect(
      buildConditions([{ field: 'modifyDate', op: '<', value: '2026-07-15T09:30:00Z' }])
    ).toBe('modifyDate < [2026-07-15]');
  });

  it('leaves numbers bare and escapes quotes in strings', () => {
    expect(
      buildConditions([
        { field: 'quoteNumber', value: 1042 },
        { field: 'name', value: 'The "Big" One' },
      ])
    ).toBe('quoteNumber = 1042 and name = "The \\"Big\\" One"');
  });
});
