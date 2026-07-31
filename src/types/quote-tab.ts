/** CPQ QuoteTabView — a section of a quote. Read-only surface in this SDK. */
export interface QuoteTabView {
  id?: string;
  idQuote?: string;
  tabName?: string;
  tabNumber?: number;
  subtotal?: number;
  isPrinted?: boolean;
  isOptional?: boolean;
  createDate?: string;
  modifyDate?: string;
}
