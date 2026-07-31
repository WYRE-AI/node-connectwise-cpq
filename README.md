# node-connectwise-cpq

Node.js client library for the [ConnectWise CPQ (Sell)](https://developer.connectwise.com/Products/ConnectWise_CPQ) API.

- Zero runtime dependencies — built on native `fetch` (Node 20+).
- Dual ESM + CJS build with full TypeScript types.
- Token-bucket rate limiting (25 requests / 5 s, conservative — CPQ publishes no limits).
- Automatic retries with exponential backoff for network errors, 429, and 5xx.
- Typed error hierarchy (`CpqError` → `AuthenticationError`, `ForbiddenError`, `NotFoundError`, `ValidationError`, `RateLimitError`, `ServerError`).
- JSON Patch (RFC 6902) helpers for CPQ's PATCH endpoints.

## Install

```bash
npm install @wyre-technology/node-connectwise-cpq
```

The package is published to GitHub Packages under the `@wyre-technology` scope. Configure your `.npmrc`:

```
@wyre-technology:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

## Usage

```ts
import { CpqClient, buildConditions } from '@wyre-technology/node-connectwise-cpq';

const cpq = new CpqClient({
  accessKey: process.env.CPQ_ACCESS_KEY!,   // from the Sell URL: ...home?accesskey=<this>
  publicKey: process.env.CPQ_PUBLIC_KEY!,   // Settings → Organization Settings → API Keys
  privateKey: process.env.CPQ_PRIVATE_KEY!, // shown once at creation
});

// Search quotes with Manage-style conditions (dates are date-only and bracketed).
const quotes = await cpq.quotes.list({
  conditions: buildConditions([
    { field: 'createDate', op: '>=', value: new Date('2026-07-01') },
    { field: 'isArchive', value: false },
  ]),
  includeFields: 'id,quoteNumber,name,quoteStatus,quoteTotal',
  pageSize: 100,
});

// Get one quote (GUID id).
const quote = await cpq.quotes.get('3f2a6c1e-...');

// Update fields via JSON Patch sugar.
await cpq.quotes.updateFields(quote.id!, { name: 'Renewal — FY27' });

// Copy a template into a new quote (the API's only create path for quotes).
const draft = await cpq.quotes.copyFromTemplate('template-guid');

// Paginate everything (bare-array responses; stops on a short page).
import { paginate } from '@wyre-technology/node-connectwise-cpq';
for await (const page of paginate((page, pageSize) => cpq.quoteItems.list({ page, pageSize }))) {
  console.log(page.length);
}
```

## Resources

| Property | Endpoints |
|---|---|
| `quotes` | `/api/quotes`, `/api/quotes/{id}`, `/api/quotes/copyById/{id}`, `/api/quotes/{quoteNumber}/versions[/latest\|/{v}]` |
| `quoteItems` | `/api/quoteItems`, `/api/quoteItems/{id}` |
| `quoteCustomers` | `/api/quotes/{quoteId}/customers[/{id}]` |
| `quoteTabs` | `/api/quoteTabs`, `/api/quoteTabs/{id}/quoteItems` (read-only) |
| `quoteTerms` | `/api/quotes/{quoteId}/quoteTerms[/{id}]` |
| `templates` | `/api/templates` (templates are quotes — returns `QuoteView[]`) |
| `taxCodes` | `/api/taxCodes` |
| `recurringRevenues` | `/api/recurringRevenues` |
| `users` | `/settings/user` (note the non-`/api` prefix) |

## API quirks this SDK handles for you

- **Missing credentials produce a 500 upstream, not a 401** — the constructor therefore throws immediately if any of `accessKey`/`publicKey`/`privateKey` is empty.
- **Media-type versioning** — every request carries `Content-Type: application/json; version=1.0`, including GETs.
- **Bare-array list responses** — no envelope, no total count; pagination terminates when a page comes back shorter than `pageSize`.
- **Date conditions are date-only** — `buildConditions` brackets dates as `[YYYY-MM-DD]` and strips time components, which the API rejects.
- **The real 401 body** is `{"message":"An unknown error has occured during basic auth validation"}` (vendor typo included) and is terminal — Basic credentials have nothing to refresh.
- **No cookie jar** — Azure ARRAffinity cookies are deliberately discarded; native `fetch` does this by default.

## Requirements

- Node.js >= 20
- A ConnectWise CPQ **API user** and CPQ 2022.2+

## License

Apache-2.0 — see [LICENSE](./LICENSE).
