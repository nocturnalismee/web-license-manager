# IndoLicense Development Documentation

Dokumen ini adalah execution layer dari [PRD IndoLicense](../PRD-SaaS-License-Management-v1.md).
PRD menjelaskan kebutuhan produk; folder ini menjelaskan cara memecahnya menjadi design,
agent task, dan acceptance criteria.

## Dokumen

| Dokumen | Tujuan |
|---|---|
| [technical-design.md](development/technical-design.md) | Arsitektur, module boundary, data flow, dan keputusan teknis |
| [database-design.md](development/database-design.md) | Entity, constraint, index, migration, dan tenant isolation |
| [task-backlog.md](development/task-backlog.md) | Backlog task berurutan dengan dependency dan Definition of Done |
| [agent-roles.md](development/agent-roles.md) | Peran AI agent, scope, input, output, dan guardrails |
| [ai-development-workflow.md](development/ai-development-workflow.md) | Prosedur menjalankan task secara konsisten |
| [integration-guide.md](integration-guide.md) | Panduan API, PHP SDK, JavaScript/TypeScript SDK, dan error handling |

## Source of Truth

1. PRD adalah source of truth untuk scope dan business requirement.
2. Technical design adalah source of truth untuk boundary dan keputusan implementasi.
3. Task backlog adalah source of truth untuk status pekerjaan.
4. Bila requirement belum jelas, agent harus membuat decision request; agent tidak boleh
   mengarang business rule baru.

## Project Status

- Product: IndoLicense
- Phase: MVP foundation
- Database: Supabase PostgreSQL
- ORM/migration: Drizzle ORM + Drizzle Kit
- App: Next.js App Router + TypeScript
- UI data layer: TanStack Query/Table bila diperlukan
