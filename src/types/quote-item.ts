/** CPQ QuoteItemView — sparse ~224-property model; every property optional. */
export interface QuoteItemView {
  id?: string;
  /** Parent quote GUID (in practice required when creating items). */
  idQuote?: string;
  /** Parent tab GUID (in practice required when creating items). */
  idQuoteTabs?: string;
  itemNumber?: number;
  mfgPartNumber?: string;
  vendorPartNumber?: string;
  description?: string;
  longDescription?: string;
  quantity?: number;
  basePrice?: number;
  cost?: number;
  price?: number;
  extendedPrice?: number;
  extendedCost?: number;
  margin?: number;
  isOptional?: boolean;
  isSelected?: boolean;
  isPrinted?: boolean;
  recurringRevenue?: number;
  recurringPeriod?: string;
  createDate?: string;
  modifyDate?: string;
  /** Custom-field slots. */
  [key: `zCustom${string}`]: unknown;
}
