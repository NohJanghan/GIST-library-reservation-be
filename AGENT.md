# Contributor Guide

## Project Overview
- This is an AWS SAM serverless backend built with TypeScript targeting Node.js 22.x.
- The `src/` directory is organized into:
  - `domain`
  - `infrastructure` (contains `Adapters` for library API calls)
  - `lambda` (Lambda handlers)
  - `common/types` for shared interfaces
- Bundling uses esbuild instead of Lambda layers.

## Environment Variables
- Set `GIST_LIBRARY_URL` and `GIST_LIBRARY_PORT` to match the values in `template.yaml`.

## Testing
- Jest is configured via `ts-jest`.
- Run `npm test` before committing.

## Branching and Commits
- Branches use `main`, `feature/<name>` or `fix/<name>` naming.
- Use concise English commit messages and merge commits.

## Running Locally
- Use `sam local start-api` for local testing.
- Deploy with `sam build` and `sam deploy`.
