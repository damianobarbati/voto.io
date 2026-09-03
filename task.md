# Feature: e2e

## Task

Implement all user stories with the possible user flows into /packages/e2e folder, using playwright.  
Command to start the e2e is: `pnpm -F e2e test` for CI or `pnpm -F e2e test:ui` for headed and slowed mode: the tests are run by vitest, controlling playwright.  
The environment (api and webapp) must be started prior in the environment.  
Database must be reset and seeded, using vitest global setup file and invoking the seeds (0-cleanup.ts).  
Tests do not run concurrently, or the race conditions would screw data and assertions.  
Expected delay used for the headed human-visible run is 50ms when user is typing, 500ms when clicking/tapping.

If any functionality is missing among the following provided specs, implement it:
- E2E must run on existing product stories and missing ones (implement them).  
- required E2E scenario must cover authentication, poll creation and each ballot type, eligibility rejection, private-group access, invitations, results, settings, subscriptions, payment outcomes, and live-poll states.
  - regarding invitations, create only an in-app pending record and a shareable link, no email sending for now
  - settings allows email and password change, nothing else
  - subscriptions and payment outcomes should mock payments
- email provider is AWS SES
- real-time protocol for live polls is SSE (server side events) and target is 1000 concurrent users voting
- browsers to validate is chrome (desktop 1280px wide and mobile 480px wide), in english language
- ignore accessibility standards
- test execution relies on provisioned database state, to reset and seed with default data on each run
- poll results are visible while open or closed to everyone.
- ignore tie-breaking and exhausted ballots case (to be done in the future)
- unauthenticated users can browse/detail polls, while voting requires login.
- user cannot update demographic data, and eligibility/results use a vote-time snapshot of the user's demographic at the time of voting.
- a poll is binding, but there are no governance, audit trail, vote secrecy, tamper evidence, and result certification (to be done in the future)
- there's no notification system right now, no email nor push notifications (to be done in the future)
- payment providers accepted will be credit card, paypal and apple pay (to be done in the future)
- the plan lifecycle is
  - free plan is the default, after registration user can upgrade
  - user can downgrade: no money is refund (add to terms)
  - user can upgrade: new plan starts from upgrade date, no money is refund (add to terms)
  - user can cancel: no money will be automatically charged at the end of the month
  - when upgrading/downgrading the user is asked the invoice details for next generated invoice; user cannot change the invoice details (he must cancel then resubscribe to plan)
- about billing:
    - currency is EUR
    - invoice fields are legal name, tax ID or VAT ID, address, postal code, city, country (prefilled with available user data excluding the vat number)
    - invoice must be neat and minimal
    - downgrade is immediate
- when a downgrade makes current usage exceed the new plan limit
    - if current groups exceed the allowed quote of new plan, all groups will be deleted: the user is prompted to confirm this, if not confirmed the downgrade does not happen (and nothing is deleted)
    - if current groups exceed the allowed quote of new plan, currently open group polls are deleted and all current group invitations are deleted
    - open live poll kicks out all users inside the live poll, and they must re-access the qr code (this way new limits are enforced)
- the canonical route set is /poll/list and /poll/:id/results
- regarding live-poll state model and quota:
  - an attendee reconnecting within 60 seconds keeps the same attendee identity and slot.
  - a closed live poll cannot reopen,  its attendee data and final result remain available
  - quota is based on concurrent attendees (users that opened the qr code and are in the live poll page)
  - heartbeat/disconnect timeout is 60s
  - when a voter submits as the poll closes, the vote is rejected (this should not happen as the page should refresh saying the poll is closed)
- the 1000 concurrent users voting must be tested using artillery

Acceptance criteria:
  - developer must be able to run the e2e specs in headed mode, and see playwright acting as the user, with a reasonable speed for the human to follow the flow
  - running `pnpn -F e2e test` should succeed
  - load test measures: 
      - SSE connections duration is 60s 
      - vote submission rate is 100 votes per second
      - maximum error rate is 1%
      - response-time percentile target is p99 under 100ms
      - test environment where this can run is "local"

## Problem

TBD.

## Solution

TBD.