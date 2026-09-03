# Critical Browser Journey

T-052 diverifikasi dengan Playwright CLI pada development server localhost.

## Journey

```mermaid
flowchart LR
  A[Landing page] --> B[Sign up]
  B --> C[Session created]
  C --> D[Dashboard]
  D --> E[Create organization]
  E --> F[Organization context]
  F --> G[Billing dashboard]
  G --> H[Plan and usage paywall visible]
  H --> I[License inventory]
  I --> J[Create disposable license fixture]
  J --> K[Validate / activate / deactivate]
```

## Manual verification

Start the application:

```bash
npm run dev
```

Then use Playwright CLI to open `/auth/sign-up`, create a disposable QA account, verify redirect to `/dashboard`, create an organization through the authenticated organization API, and open `/dashboard/{organizationId}/billing`.

Expected results:

- Signup creates a Better Auth user and session.
- Dashboard renders the signed-in user.
- Organization context renders the owner role and tenant name.
- Billing renders `No active plan`, available platform plans, and the usage paywall empty state.
- Browser console has no application errors on the organization and billing pages.
- License inventory is tenant-scoped and supports creating a license from an active product and product license plan.
- The plaintext license key is displayed once after creation; the database stores only its hash and prefix.
- Public validate, activate, idempotent re-activate, and deactivate requests return the documented API envelope.
- Rate-limited responses return HTTP `429` and `Retry-After`.

Use a disposable QA email and clean up test data according to the database retention policy. Do not use a production customer account for browser testing.

The license fixture must use a disposable product/customer. Keep the returned plaintext key only in the local test session and never commit it to logs, screenshots, or source control.
