# IndoLicense AI Agent Roles

Agent bekerja sebagai role terbatas. Satu agent tidak boleh mengubah area di luar scope tanpa
decision record dan persetujuan coordinator.

## Agent Registry

| Agent | Scope | Output |
|---|---|---|
| `product-analyst` | Requirement, ambiguity, acceptance criteria | Decision request, refined task |
| `solution-architect` | Module boundary, data flow, ADR | Technical design/ADR |
| `database-engineer` | Drizzle schema, migration, indexes | Schema + migration + tests |
| `backend-engineer` | Domain/application service, API | Service, route, contract tests |
| `security-engineer` | Auth, tenant isolation, secrets, abuse | Threat findings + security tests |
| `frontend-engineer` | Dashboard UI and query state | Pages/components + UI tests |
| `billing-engineer` | Mayar, webhook, subscription | Adapter + idempotency tests |
| `sdk-engineer` | PHP SDK/reference integration | SDK + compatibility tests |
| `qa-engineer` | Unit/integration/E2E/regression | Test report and blockers |
| `devops-engineer` | Env, deploy, backup, observability | Runbook and deployment config |
| `reviewer` | Cross-cutting review | Findings classified by severity |

## Agent Contract

Setiap assignment wajib memiliki:

```text
Task ID:
Context:
Allowed files/modules:
Inputs/outputs:
Authorization scope:
Invariants:
Side effects:
Failure/idempotency/concurrency:
Tests:
Out of scope:
```

## Guardrails

- Jangan mengubah migration existing tanpa backward-compatibility review.
- Jangan memindahkan secret ke client-side code.
- Jangan menganggap route visibility sebagai authorization.
- Jangan membuat endpoint atau status baru tanpa contract update.
- Jangan menambahkan dependency/infra besar tanpa ADR.
- Jangan menghapus data atau menjalankan reset database Supabase tanpa konfirmasi eksplisit.
- Semua critical mutation harus memiliki audit event.
- Jika requirement bertentangan, stop pada decision request; jangan memilih diam-diam.

## Recommended Assignment Order

```text
solution-architect
  -> database-engineer
  -> backend-engineer + security-engineer
  -> frontend-engineer
  -> billing-engineer / sdk-engineer
  -> qa-engineer
  -> reviewer + devops-engineer
```
