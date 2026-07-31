/** RFC 6902 JSON Patch operation — CPQ PATCH bodies are arrays of these. */
export interface JsonPatchOp {
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';
  path: string;
  value?: unknown;
  from?: string;
}

/**
 * Sugar: turn a partial object into `replace` ops, one per defined field.
 * `{ name: 'X', isArchive: true }` → `[{op:'replace',path:'/name',value:'X'}, ...]`
 */
export function fieldsToReplaceOps(fields: Record<string, unknown>): JsonPatchOp[] {
  return Object.entries(fields)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => ({ op: 'replace' as const, path: `/${key}`, value }));
}
