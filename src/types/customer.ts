/**
 * CPQ QuoteCustomerView. Customers exist only per-quote (synced from the CRM) —
 * there is no global customer directory in this API.
 */
export interface QuoteCustomerView {
  id?: string;
  idQuote?: string;
  /** e.g. 'Primary', 'BillTo', 'ShipTo'. */
  customerType?: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  email?: string;
  phone?: string;
  fax?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  createDate?: string;
  modifyDate?: string;
}
