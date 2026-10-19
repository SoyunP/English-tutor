# English Lab

Private English learning platform for one Korean middle-school Grade 1 student and their teacher.

**Curriculum scope:** NE능률 (김기택) *Middle School English 1*, Lessons 5–8 (2022 revised curriculum). Final exam focus: Lessons 5–8. Seven daily modules from **2026-10-16** to **2026-10-22** (Asia/Seoul).

All reading passages and exam items are **original practice material**, not reproduced textbook text.

## Features

- Student Learn (수업 복습) + Practice (오늘의 숙제)
- Korean middle-school exam-style questions (①–⑤, formal Korean stems)
- Required reasoning field on every question: **왜 그렇게 생각하나요?**
- Auto-save of answers + reasoning (no timer / no deadline)
- Server-side grading, remediation with similar questions, final mastery score
- Append-only grade history
- Teacher dashboard, understanding labels, CSV export, schedule unlock

## Quick start (Demo mode)

Demo mode runs automatically when Supabase env vars are missing. Progress is stored in a **server-side** `.demo-data/store.json` file (not localStorage). Demo storage is **not** production-grade immutable grading.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

- Student: **학생으로 시작하기** (기은)
- Teacher: **교사로 시작하기** (박선생님)

```bash
npm run typecheck
npm test
npm run lint
```

## Environment

Copy `.env.example` to `.env.local`:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin (migrations/seed) |
| `NEXT_PUBLIC_FORCE_DEMO` | Force demo mode even if Supabase is set |

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/migrations/001_english_lab_schema.sql` in the SQL editor.
3. Create Auth users for student and teacher; insert matching rows into `profiles` with roles.
4. Seed curriculum via your preferred import using the TypeScript seed modules under `src/data/`.
5. Set env vars and deploy to Vercel.

RLS denies student writes to grading tables and forbids `UPDATE`/`DELETE` on `grade_events` for ordinary roles. Prefer grading via trusted server actions / service role.

## Score rules

- **Initial Score** = points earned / total × 100 (never overwritten)
- **Remediation Mastery Rate** = remediated concepts / concepts needing remediation × 100
- **Final Mastery Score** = initial score if no remediation; else `round(0.8 × initial + 0.2 × remediation rate)`

Labeled as a learning/mastery score, not the original exam grade.

## Project layout

```
src/app/student|teacher   # App Router pages
src/components/homework   # Timed-free homework UI + reasoning
src/data/day1.ts…day7.ts  # Seeded curriculum
src/lib/repository.ts     # Demo persistence + grading workflow
supabase/migrations       # Postgres + RLS
tests/                    # Vitest unit + workflow tests
```

## Deploy (Vercel)

1. Push the repo and import into Vercel.
2. Add env vars (or leave empty for demo).
3. Build command: `npm run build`.

For production, configure Supabase Auth + migrations; do not rely on `.demo-data`.
