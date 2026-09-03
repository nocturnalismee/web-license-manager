# IndoLicense Backup and Restore Runbook

Runbook ini berlaku untuk Supabase PostgreSQL dan target VPS PostgreSQL di masa depan.
Backup dianggap valid hanya setelah restore test berhasil.

## Before Migration

1. Konfirmasi project/environment dan tujuan migration.
2. Pastikan migration sudah diuji pada staging.
3. Catat current migration version dan application version.
4. Pastikan backup/snapshot tersedia dan retention masih valid.
5. Jangan menjalankan reset/drop pada database berisi data penting.

## Managed Supabase Backup

- Gunakan backup/PITR sesuai plan Supabase.
- Untuk logical export, gunakan `supabase db dump` atau `pg_dump` melalui connection string
  Session Pooler/Direct sesuai panduan Supabase.
- Simpan backup terenkripsi di lokasi terpisah; jangan commit ke repository.
- Catat timestamp, project ref, PostgreSQL version, migration version, dan checksum file.

## Restore Drill

```text
Create temporary restore target
  -> Restore schema/roles/data
  -> Apply remaining migrations
  -> Run integrity queries
  -> Run application smoke tests
  -> Record result and destroy temporary target
```

Integrity minimum: foreign key violations = 0, duplicate provider/event ID = 0, duplicate
license `(product_id, key_hash)` = 0, valid organization memberships, complete migration table,
dan Better Auth user/session tables dapat dibaca.

## VPS Migration

1. Freeze destructive/admin writes dan jadwalkan maintenance window.
2. Backup database dan konfigurasi provider secara terpisah.
3. Provision PostgreSQL target dengan versi compatible.
4. Restore schema/data lalu jalankan migration repository.
5. Update `DATABASE_URL` secara server-side.
6. Smoke test auth, organization, license validation, activation, dan webhook idempotency.
7. Monitor error rate dan connection usage.
8. Simpan rollback plan dan backup source sampai cutover tervalidasi.

## RPO/RTO Record

```text
RPO:
RTO:
Backup frequency:
Retention:
Last restore drill:
Restore owner:
Emergency contact:
```

Connection string, backup, dan Better Auth secret tidak boleh masuk log atau repository.
