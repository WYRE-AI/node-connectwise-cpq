/**
 * CPQ QuoteView — a sparse ~204-property model; every property is optional
 * because responses honor `includeFields` and omit unset fields. Only the
 * commonly used subset is named here; `zCustom*` slots are typed via the
 * template index, and unrecognized properties survive round-trips untyped.
 */
export interface QuoteView {
  /** GUID id — used for get/patch/delete/copy addressing. */
  id?: string;
  /** Integer quote number — used (with quoteVersion) for the versions subresource. */
  quoteNumber?: number;
  quoteVersion?: number;
  name?: string;
  quoteStatus?: string;
  accountName?: string;
  isAccepted?: boolean;
  isSent?: boolean;
  isArchive?: boolean;
  isLost?: boolean;
  isTemplate?: boolean;
  requiresApproval?: boolean;
  approvalStatus?: string;
  orderPorterTemplate?: string;
  subtotal?: number;
  tax?: number;
  quoteTotal?: number;
  grossMargin?: number;
  createDate?: string;
  modifyDate?: string;
  expirationDate?: string;
  expectedCloseDate?: string;
  preparedBy?: string;
  insideRep?: string;
  outsideRep?: string;
  /** Custom-field slots (zCustomText1, zCustomNumber2, zCustomDate3, ...). */
  [key: `zCustom${string}`]: unknown;
}
