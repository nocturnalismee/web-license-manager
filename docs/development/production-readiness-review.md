# Production Readiness Review

Status: `CONDITIONAL GO` for internal staging; production release remains gated by provider and infrastructure sign-off.

## Verified in repository

| Area | Evidence | Status |
|---|---|---|
| Build and types | `npm run typecheck`, `npm run build` | PASS |
| Unit tests | `npm test -- --run` | PASS: 16 passed, 1 integration test skipped |
| Dependency audit | `npm audit --audit-level=high` | Run before release; must be zero high/critical findings |
| Tenant isolation | Membership checks on management routes and services | PASS for implemented routes |
| License secret handling | Hash + prefix persistence; plaintext returned only at creation | PASS |
| Public API abuse control | PostgreSQL bucket limiter, `429`, `Retry-After`, request ID | PASS in unit/contract coverage; DB integration pending |
| Billing idempotency | Webhook event persistence and duplicate protection | PASS; provider signature contract pending |
| Recovery | Backup/restore and migration runbook | DOCUMENTED |
| Browser journey | Signup, organization, billing, license sandbox flow | Required staging evidence |

## Release gates

1. Configure production secrets outside source control: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `MAYAR_API_KEY`, and the confirmed `MAYAR_WEBHOOK_SECRET` format.
2. Apply migrations through the release process and verify the migration journal; do not use ad-hoc schema edits.
3. Run a Supabase backup/restore drill and record the restore point, owner, and observed recovery time in the backup runbook.
4. Execute the disposable-account Playwright journey, including license creation and public validate/activate/deactivate calls.
5. Run PostgreSQL integration tests for activation concurrency and rate limiting against a disposable database.
6. Confirm Mayar sandbox webhook signature headers and replay a duplicate/tampered event; release is blocked if signature verification is not confirmed.
7. Confirm monitoring for 5xx, 429, webhook failures, database connection saturation, and authentication failures.
8. Prepare rollback: deploy previous application image, preserve forward-only migrations, and document the operator responsible for rollback.

## Known follow-ups

- A background reconciliation worker and automated refund workflow are outside the current MVP routes and must be added before high-volume billing operations.
- Email delivery is not a release dependency for the current MVP; transactional email provider and templates should be added before customer-facing launch.
- The skipped PostgreSQL integration test is an environment gate, not permission to skip concurrency verification in staging.

## Local workflow

Use Supabase PostgreSQL from `.env` with Drizzle:

```bash
npm run db:migrate
npm run db:studio
npm run typecheck
npm test -- --run
npm run build
```

Never place database URLs, Better Auth secrets, Mayar keys, or plaintext license keys in commits, screenshots, or issue descriptions.
