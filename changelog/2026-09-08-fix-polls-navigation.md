# Feature: Bootstrap voto.io application

## Problem

voto.io did not provide an integrated product flow for account creation, poll
creation, voting, poll results, groups, subscriptions, or live polls. The API,
shared contracts, database data, responsive client, and automated coverage for
these flows were incomplete.

Ranked polls also exposed Borda Count despite the product using instant-runoff
voting. The webapp used hardcoded Tailwind colour utilities, and API request
logs made the test output noisy.

## Solution

- Add shared Zod contracts, database schema and seed data for users, plans,
  subscriptions, groups, invitations, polls, poll options, and votes.
- Add authenticated API routes for registration, login, user lookup, poll
  pagination, creation, voting, results, and live-poll attendance.
- Add poll validation for ownership, group membership, demographic eligibility,
  unique options, valid ballots, pagination, sorting, and filtering.
- Add instant-runoff voting as the only ranked-poll method. Remove Borda Count
  from the API contract, schema constraint, seed data, results UI, creation UI,
  and product documentation.
- Replace the webapp with responsive localized views for landing, authentication,
  polls, results, groups, profile, plans, subscription, checkout, and live
  polls. Add English, Italian, Spanish, German, and French navigation.
- Add accessibility-aware UI states for private-poll access, empty content,
  loading, validation errors, success messages, warnings, and invitation status.
- Centralize the Coolors palette in webapp theme variables. Replace hardcoded
  component colours with semantic tokens, including dedicated success, warning,
  and danger foreground and subtle-background tokens.
- Suppress API request logging during tests while preserving it for development
  and production.
- Add API, webapp, and end-to-end coverage, plus CI updates for webapp tests.

## Verification

- `pnpm tsc`
- `pnpm -F webapp build`
- `pnpm -F webapp test -- Home.spec.tsx`
- `pnpm -F api test`
- `pnpm exec biome check packages/webapp/src/style.css packages/webapp/src/components packages/webapp/src/ui packages/webapp/src/view`
