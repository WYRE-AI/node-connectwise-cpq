/** CPQ QuoteTermView — a payment/financing term option attached to a quote. */
export interface QuoteTermView {
  id?: string;
  idQuote?: string;
  name?: string;
  periods?: number;
  interestRate?: number;
  paymentAmount?: number;
  isSelected?: boolean;
  createDate?: string;
  modifyDate?: string;
}
