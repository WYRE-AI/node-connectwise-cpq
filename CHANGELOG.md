## [1.0.1](https://github.com/WYRE-AI/node-connectwise-cpq/compare/v1.0.0...v1.0.1) (2026-08-25)


### Bug Fixes

* migrate to WYRE-AI org (npm scope, ghcr namespace, registry) ([#1](https://github.com/WYRE-AI/node-connectwise-cpq/issues/1)) ([ab62585](https://github.com/WYRE-AI/node-connectwise-cpq/commit/ab625853dcbf3bc60a278b7739fc59f5b8e1e68e))

# 1.0.0 (2026-07-31)


### Bug Fixes

* emit parenthesized list syntax for 'in' conditions ([47de390](https://github.com/WYRE-AI/node-connectwise-cpq/commit/47de390dc25dcfe390bc798d600a693289ce85b8))


### Features

* add CpqClient with http core, error hierarchy, and nine resource classes ([3bbb3c4](https://github.com/WYRE-AI/node-connectwise-cpq/commit/3bbb3c4bd2bf5b16b5334f1555707a61b8bedbbf))
* scaffold @wyre-ai/node-connectwise-cpq (tsup, TS6, vitest, semantic-release) ([b510392](https://github.com/WYRE-AI/node-connectwise-cpq/commit/b5103920441369728ebc78bfcc807f87d8c6cc2f))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Releases are cut automatically by semantic-release from conventional commits.

## [Unreleased]

### Added

- **Release workflow no longer persists a write-scoped git credential across `npm ci`.** The release job declares `contents: write`, which overrides this repo's read-only default workflow permission, so `actions/checkout`'s default persisted credential was write-scoped and lived in `.git/config` through dependency install, build and test — readable by any compromised dependency lifecycle script. `persist-credentials: false` is semantic-release's own documented GitHub Actions recipe; it authenticates its pushes from `GITHUB_TOKEN` directly and never needed the persisted credential. (CWE-250)

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
