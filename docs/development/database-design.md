# IndoLicense Database Design

## 1. Core Entities

| Table | Tenant | Tujuan |
|---|---|---|
| `users` | platform | Identity reference |
| `organizations` | root | Tenant vendor |
| `organization_members` | organization | Membership + role |
| `platform_plans` | platform | Paket SaaS |
| `product_license_plans` | organization/product | Paket license software |
| `products` | organization | Software vendor |
| `customers` | organization | End customer |
| `licenses` | organization | Hak penggunaan product |
| `license_activations` | organization | Installation/domain binding |
| `subscriptions` | organization | SaaS subscription |
| `orders` / `payments` | organization | Financial records |
| `entitlements` | organization | Effective quotas/features |
| `api_keys` | organization/product | Vendor management credentials |
| `webhook_events` | platform/provider | Idempotent provider events |
| `audit_logs` | organization/platform | Append-only activity trail |

## 2. Required Constraints

```text
UNIQUE organization_members (organization_id, user_id)
UNIQUE products (organization_id, slug)
UNIQUE licenses (product_id, license_key_hash)
UNIQUE license_activations (license_id, installation_id)
UNIQUE webhook_events (provider, event_id)
```

Recommended indexes:

```text
products (organization_id, status)
licenses (organization_id, status, expires_at)
licenses (product_id, license_key_hash)
license_activations (license_id, status)
license_activations (organization_id, last_seen_at)
subscriptions (organization_id, status)
audit_logs (organization_id, created_at)
webhook_events (provider, event_id)
```

## 3. Data Rules

- Semua IDs memakai UUID/ULID; ID bukan pengganti authorization.
- Money disimpan sebagai integer dalam smallest currency unit dan memiliki `currency`.
- License key/API key plaintext tidak disimpan setelah issuance/rotation.
- Simpan `normalized_domain` dan optional `original_domain`.
- Timestamp disimpan dalam UTC; display timezone ditentukan UI.
- PII, IP, user-agent, dan raw provider payload memiliki retention policy.
- Audit log append-only; normal UI tidak boleh mengedit atau menghapusnya.

## 4. Tenant Isolation Checklist

Setiap repository method yang membaca/mengubah tenant resource harus menerima `organizationId`
sebagai parameter eksplisit. Test wajib membuktikan Organization A tidak dapat membaca,
mengubah, atau menghapus resource Organization B.

## 5. Migration Rules

1. Ubah Drizzle schema.
2. Jalankan `db:generate` dengan nama migration bermakna.
3. Review SQL migration.
4. Jalankan pada development/staging Supabase.
5. Jalankan migration test pada database kosong dan database berisi data.
6. Deploy application yang compatible dengan old dan new schema bila migration bertahap.
