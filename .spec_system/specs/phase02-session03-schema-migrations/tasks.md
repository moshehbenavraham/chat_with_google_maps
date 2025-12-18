# Task Checklist

**Session ID**: `phase02-session03-schema-migrations`
**Total Tasks**: 23
**Estimated Duration**: 7-9 hours
**Created**: 2025-12-19

---

## Legend

- `[x]` = Completed
- `[ ]` = Pending
- `[P]` = Parallelizable (can run with other [P] tasks)
- `[S0203]` = Session reference (Phase 02, Session 03)
- `TNNN` = Task ID

---

## Progress Summary

| Category | Total | Done | Remaining |
|----------|-------|------|-----------|
| Setup | 3 | 3 | 0 |
| Foundation | 5 | 5 | 0 |
| Implementation | 8 | 8 | 0 |
| Testing | 4 | 4 | 0 |
| Documentation | 3 | 3 | 0 |
| **Total** | **23** | **23** | **0** |

---

## Setup (3 tasks)

Initial verification and environment preparation.

- [x] T001 [S0203] Verify Docker PostgreSQL running (`npm run db:start`)
- [x] T002 [S0203] Verify DATABASE_URL configured and connection works
- [x] T003 [S0203] Verify existing tests pass before making changes (`npm run test`)

---

## Foundation (5 tasks)

Core schema structures and type definitions.

- [x] T004 [S0203] [P] Create users table schema with auth-ready fields (`api/_db/schema/users.ts`)
- [x] T005 [S0203] [P] Create sessions table schema with FK to users (`api/_db/schema/sessions.ts`)
- [x] T006 [S0203] Update schema barrel exports (`api/_db/schema/index.ts`)
- [x] T007 [S0203] Verify TypeScript types compile correctly (User, NewUser, Session, NewSession)
- [x] T008 [S0203] Run TypeScript check to ensure no type errors (`npm run typecheck`)

---

## Implementation (8 tasks)

Migration workflow and database setup.

- [x] T009 [S0203] Generate initial migration with drizzle-kit (`npm run db:generate`)
- [x] T010 [S0203] Review generated SQL migration file in `drizzle/` directory
- [x] T011 [S0203] Verify migration SQL has correct table definitions
- [x] T012 [S0203] Apply migration to local PostgreSQL (`npm run db:migrate`)
- [x] T013 [S0203] Verify tables exist via SQL: `SELECT * FROM users LIMIT 1`
- [x] T014 [S0203] Verify column structure matches spec: `\d users` and `\d sessions`
- [x] T015 [S0203] Verify foreign key constraint on sessions.user_id
- [x] T016 [S0203] Test ON DELETE CASCADE behavior with manual insert/delete

---

## Testing (4 tasks)

Schema validation and quality assurance.

- [x] T017 [S0203] Create schema test file (`api/_db/__tests__/schema.test.ts`)
- [x] T018 [S0203] [P] Write unit tests for users table structure and types
- [x] T019 [S0203] [P] Write unit tests for sessions table structure and types
- [x] T020 [S0203] Run full test suite and verify all tests pass (`npm run test`)

---

## Documentation (3 tasks)

Schema conventions and project documentation.

- [x] T021 [S0203] Create schema conventions document (`docs/SCHEMA.md`)
- [x] T022 [S0203] Document naming patterns, type choices, and timestamp handling
- [x] T023 [S0203] Run quality checks and fix any issues (`npm run quality`)

---

## Completion Checklist

Before marking session complete:

- [x] All tasks marked `[x]`
- [x] All tests passing
- [x] All files ASCII-encoded (0-127 characters only)
- [x] Unix LF line endings throughout
- [x] TypeScript strict mode passes
- [x] ESLint passes with no warnings
- [x] Prettier formatting applied
- [x] implementation-notes.md updated
- [x] Ready for `/validate`

---

## Notes

### Parallelization
Tasks marked `[P]` can be worked on simultaneously:
- T004 and T005: Schema files are independent
- T018 and T019: Test suites for different tables

### Task Timing
Target ~20-25 minutes per task.

### Dependencies
Complete tasks in order unless marked `[P]`:
1. Setup must complete before Foundation
2. Foundation must complete before Implementation
3. T004/T005 must complete before T006 (barrel exports need schemas)
4. T009-T012 are sequential (generate -> review -> apply)
5. T013-T016 depend on migration being applied
6. T017 must exist before T018/T019 can be written
7. Documentation can start after Implementation

### Key Files

| File | Action | Purpose |
|------|--------|---------|
| `api/_db/schema/users.ts` | CREATE | Users table definition |
| `api/_db/schema/sessions.ts` | CREATE | Sessions table definition |
| `api/_db/schema/index.ts` | MODIFY | Barrel exports |
| `api/_db/__tests__/schema.test.ts` | CREATE | Schema tests |
| `docs/SCHEMA.md` | CREATE | Conventions doc |
| `drizzle/0000_*.sql` | GENERATE | Initial migration |

### Schema Quick Reference

**Users Table Columns:**
- `id` (text, PK)
- `email` (text, unique, not null)
- `email_verified` (boolean, default false)
- `name` (text, nullable)
- `image` (text, nullable)
- `created_at` (timestamp, default now)
- `updated_at` (timestamp, default now)

**Sessions Table Columns:**
- `id` (text, PK)
- `user_id` (text, FK -> users.id, cascade delete)
- `expires_at` (timestamp, not null)
- `created_at` (timestamp, default now)

---

## Next Steps

Run `/validate` to verify session completeness.
