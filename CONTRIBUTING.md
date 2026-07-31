# Contributing to node-connectwise-cpq

Thanks for helping improve the ConnectWise CPQ client library.

## Development setup

```bash
export NODE_AUTH_TOKEN=$(gh auth token)   # GitHub Packages registry auth
npm install
```

## Workflow

- `npm run build` — tsup dual ESM + CJS build with declarations.
- `npm test` — vitest + MSW test suite (no network access; MSW errors on any unhandled request).
- `npm run lint` — TypeScript type check (`tsc --noEmit`).

All three must pass before a PR is merged.

## Commit messages

This repo releases via [semantic-release](https://semantic-release.gitbook.io/); commit
messages must follow [Conventional Commits](https://www.conventionalcommits.org/):

- `fix:` — patch release
- `feat:` — minor release
- `feat!:` / `BREAKING CHANGE:` — major release
- `docs:`, `test:`, `chore:`, `refactor:` — no release

## Guidelines

- **Zero runtime dependencies.** The SDK uses native `fetch` only; do not add runtime deps.
- Every new resource or behavior needs MSW-backed tests, including error paths
  (401/404/429/500).
- Keep view-model types all-optional — CPQ responses are sparse and field selection via
  `includeFields` is encouraged.
- Update `CHANGELOG.md` under `[Unreleased]` following
  [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
- Never commit credentials or fixtures containing real tenant data.

## Releasing

Merging to `main` triggers `.github/workflows/release.yml`: tests on Node 20/22, then
semantic-release publishes `@wyre-technology/node-connectwise-cpq` to GitHub Packages.
