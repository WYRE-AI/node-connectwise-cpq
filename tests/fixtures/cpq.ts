import type {
  QuoteCustomerView,
  QuoteItemView,
  QuoteTabView,
  QuoteTermView,
  QuoteView,
  RecurringRevenueView,
  TaxCodeView,
  UserView,
} from '../../src/index.js';

/** Trimmed QuoteView (the real model has ~204 sparse properties). */
export const quoteFixture: QuoteView = {
  id: '3f2a6c1e-9b1d-4f7a-8a2e-5c0d1b9e7f00',
  quoteNumber: 1042,
  quoteVersion: 1,
  name: 'Managed Services Renewal',
  quoteStatus: 'Open',
  accountName: 'Acme Corp',
  isAccepted: false,
  isSent: false,
  isArchive: false,
  isLost: false,
  requiresApproval: false,
  subtotal: 1000,
  tax: 80,
  quoteTotal: 1080,
  grossMargin: 0.32,
  createDate: '2026-07-01T12:00:00Z',
  modifyDate: '2026-07-15T09:30:00Z',
  expirationDate: '2026-08-31T00:00:00Z',
  expectedCloseDate: '2026-08-15T00:00:00Z',
  zCustomText1: 'east-region',
};

export const quoteVersionFixture: QuoteView = {
  ...quoteFixture,
  quoteVersion: 2,
  modifyDate: '2026-07-20T10:00:00Z',
};

export const templateFixture: QuoteView = {
  id: '11111111-2222-3333-4444-555555555555',
  quoteNumber: 7,
  quoteVersion: 1,
  name: 'MSP Onboarding Template',
  isTemplate: true,
};

export const quoteItemFixture: QuoteItemView = {
  id: 'aa11bb22-cc33-dd44-ee55-ff6677889900',
  idQuote: quoteFixture.id,
  idQuoteTabs: 'tab00001-0000-0000-0000-000000000001',
  itemNumber: 1,
  mfgPartNumber: 'FG-100E',
  description: 'FortiGate 100E firewall',
  quantity: 2,
  basePrice: 500,
  cost: 350,
  price: 500,
  extendedPrice: 1000,
  isOptional: false,
};

export const quoteCustomerFixture: QuoteCustomerView = {
  id: 'cust0001-0000-0000-0000-000000000001',
  idQuote: quoteFixture.id,
  customerType: 'Primary',
  companyName: 'Acme Corp',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane.doe@acme.example',
  city: 'Chattanooga',
  state: 'TN',
};

export const quoteTabFixture: QuoteTabView = {
  id: 'tab00001-0000-0000-0000-000000000001',
  idQuote: quoteFixture.id,
  tabName: 'Hardware',
  tabNumber: 1,
  subtotal: 1000,
  isPrinted: true,
  isOptional: false,
};

export const quoteTermFixture: QuoteTermView = {
  id: 'term0001-0000-0000-0000-000000000001',
  idQuote: quoteFixture.id,
  name: '36-month financing',
  periods: 36,
  interestRate: 0.059,
  paymentAmount: 32.5,
  isSelected: false,
};

export const taxCodeFixture: TaxCodeView = {
  id: 'tax00001-0000-0000-0000-000000000001',
  name: 'TN Sales Tax',
  description: 'Tennessee state sales tax',
  taxRate: 0.0925,
  isDefault: true,
};

export const recurringRevenueFixture: RecurringRevenueView = {
  id: 'rr000001-0000-0000-0000-000000000001',
  name: 'Monthly',
  description: 'Billed monthly',
  months: 1,
  isDefault: true,
};

export const userFixture: UserView = {
  id: 'user0001-0000-0000-0000-000000000001',
  userName: 'api.user',
  firstName: 'API',
  lastName: 'User',
  email: 'api@wyretechnology.com',
  isAdmin: false,
  isApprover: false,
  isApiUser: true,
  isDisabled: false,
};

/** The real CPQ 401 body — vendor typo ("occured") included. */
export const authTypoBody = {
  message: 'An unknown error has occured during basic auth validation',
};

/** The real CPQ 500 body — ALSO what a missing Authorization header produces. */
export const serverErrorBody = { message: 'An error has occurred.' };
