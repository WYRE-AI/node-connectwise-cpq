# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Releases are cut automatically by semantic-release from conventional commits.

## [Unreleased]

### Added

- Initial SDK: `CpqClient` with nine resource classes (`quotes`, `quoteItems`,
  `quoteCustomers`, `quoteTabs`, `quoteTerms`, `templates`, `taxCodes`,
  `recurringRevenues`, `users`).
- Native-fetch `HttpClient` with token-bucket rate limiting (25 req / 5 s),
  exponential-backoff retries (network errors, 429, 500, 502, 503, 504), and
  media-type versioning (`Content-Type: application/json; version=1.0` on every
  request).
- `CpqError` hierarchy: `AuthenticationError`, `ForbiddenError`,
  `NotFoundError`, `ValidationError`, `RateLimitError`, `ServerError`.
- JSON Patch (RFC 6902) support: `JsonPatchOp` type and `fieldsToReplaceOps()`.
- Bare-array pagination via `paginate()` with short-page termination, plus
  `buildConditions()` (quoted strings, `True`/`False` booleans, bracketed
  date-only dates, parenthesized `in` lists) and defensive `unwrap()`.
- Constructor-time credential validation (CPQ answers a missing Authorization
  header with 500, not 401).
- Fully typed sparse view models with all-optional properties, including
  `zCustom*` slots.
