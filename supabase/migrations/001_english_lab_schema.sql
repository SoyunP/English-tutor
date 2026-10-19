-- English Lab schema + RLS
-- Append-only grade_events: no UPDATE/DELETE for app roles

create extension if not exists "pgcrypto";

create type public.user_role as enum ('student', 'teacher');
create type public.attempt_status as enum ('in_progress', 'submitted', 'remediating', 'completed');
create type public.understanding_label as enum (
  '정확히 이해함',
  '부분적으로 이해함',
  '개념을 잘못 이해함',
  '추가 설명 필요'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text not null,
  role public.user_role not null,
  created_at timestamptz not null default now()
);

create table public.lessons (
  id text primary key,
  day_number int not null unique check (day_number between 1 and 7),
  date date not null,
  title text not null,
  lesson_title text not null,
  textbook_note text not null,
  content jsonb not null,
  published boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.lesson_sections (
  id text primary key,
  lesson_id text not null references public.lessons(id) on delete cascade,
  type text not null,
  sort_order int not null,
  content jsonb not null
);

create table public.vocabulary (
  id text primary key,
  lesson_id text not null references public.lessons(id) on delete cascade,
  day_number int not null,
  word text not null,
  meaning_ko text not null,
  part_of_speech text not null,
  example_en text not null,
  example_ko text not null,
  sort_order int not null
);

create table public.assignments (
  id text primary key,
  day_number int not null unique,
  date date not null,
  title text not null,
  lesson_id text not null references public.lessons(id),
  published boolean not null default false,
  unlocked boolean not null default false,
  question_count int not null,
  total_points int not null
);

create table public.questions (
  id text primary key,
  day_number int not null,
  assignment_id text not null references public.assignments(id),
  type text not null,
  sort_order int not null,
  points int not null,
  prompt_ko text not null,
  payload jsonb not null,
  concept_id text not null,
  concept_label text not null,
  difficulty text not null,
  version int not null default 1,
  unique (assignment_id, sort_order)
);

create table public.question_versions (
  id bigserial primary key,
  question_id text not null references public.questions(id),
  version int not null,
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  unique (question_id, version)
);

create table public.remediation_questions (
  id text primary key,
  concept_id text not null,
  sort_order int not null,
  type text not null,
  points int not null,
  prompt_ko text not null,
  payload jsonb not null,
  concept_label text not null
);

create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id),
  assignment_id text not null references public.assignments(id),
  day_number int not null,
  status public.attempt_status not null default 'in_progress',
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  completed_at timestamptz,
  question_snapshots jsonb not null,
  initial_score numeric,
  remediation_mastery_rate numeric,
  final_mastery_score numeric,
  concepts_needing_remediation text[] not null default '{}',
  concepts_mastered text[] not null default '{}',
  concepts_needing_help text[] not null default '{}',
  retake_authorized boolean not null default false
);

-- At most one active in-progress attempt per student+assignment
create unique index attempts_one_active
  on public.attempts (student_id, assignment_id)
  where status = 'in_progress';

create table public.attempt_answers (
  id bigserial primary key,
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  question_id text not null,
  student_answer text not null default '',
  student_reasoning text not null default '',
  saved_at timestamptz not null default now(),
  submitted_at timestamptz,
  is_correct boolean,
  pending_review boolean default false,
  points_earned numeric,
  unique (attempt_id, question_id)
);

-- Append-only grade history
create table public.grade_events (
  id bigserial primary key,
  student_id uuid not null references public.profiles(id),
  assignment_id text not null,
  attempt_id uuid not null references public.attempts(id),
  event_type text not null,
  timestamp timestamptz not null default now(),
  payload jsonb not null,
  actor_id uuid,
  actor_role text not null
);

create table public.remediation_attempts (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts(id),
  student_id uuid not null references public.profiles(id),
  concept_id text not null,
  remediation_question_id text not null references public.remediation_questions(id),
  attempt_number int not null,
  student_answer text not null,
  student_reasoning text not null,
  is_correct boolean not null,
  status text not null,
  created_at timestamptz not null default now()
);

create table public.concept_mastery (
  student_id uuid not null references public.profiles(id),
  concept_id text not null,
  concept_label text not null,
  status text not null,
  last_updated timestamptz not null default now(),
  primary key (student_id, concept_id)
);

create table public.teacher_reviews (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts(id),
  question_id text not null,
  student_id uuid not null references public.profiles(id),
  understanding_label public.understanding_label,
  teacher_feedback text,
  reviewed_at timestamptz not null default now(),
  reviewer_id uuid not null references public.profiles(id),
  unique (attempt_id, question_id)
);

create index idx_attempts_student on public.attempts(student_id);
create index idx_grade_events_attempt on public.grade_events(attempt_id);
create index idx_attempt_answers_attempt on public.attempt_answers(attempt_id);
create index idx_questions_day on public.questions(day_number);

-- Helper: current profile role
create or replace function public.current_role()
returns public.user_role
language sql
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

alter table public.profiles enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_sections enable row level security;
alter table public.vocabulary enable row level security;
alter table public.assignments enable row level security;
alter table public.questions enable row level security;
alter table public.question_versions enable row level security;
alter table public.remediation_questions enable row level security;
alter table public.attempts enable row level security;
alter table public.attempt_answers enable row level security;
alter table public.grade_events enable row level security;
alter table public.remediation_attempts enable row level security;
alter table public.concept_mastery enable row level security;
alter table public.teacher_reviews enable row level security;

-- Profiles
create policy profiles_select on public.profiles for select using (
  id = auth.uid() or public.current_role() = 'teacher'
);

-- Content readable by authenticated users
create policy lessons_select on public.lessons for select to authenticated using (published or public.current_role() = 'teacher');
create policy lessons_teacher_write on public.lessons for all to authenticated using (public.current_role() = 'teacher') with check (public.current_role() = 'teacher');

create policy vocab_select on public.vocabulary for select to authenticated using (true);
create policy vocab_teacher on public.vocabulary for all to authenticated using (public.current_role() = 'teacher') with check (public.current_role() = 'teacher');

create policy assignments_select on public.assignments for select to authenticated using (published or public.current_role() = 'teacher');
create policy assignments_teacher on public.assignments for all to authenticated using (public.current_role() = 'teacher') with check (public.current_role() = 'teacher');

-- Questions: students must NOT read answer keys via direct select of full row in production.
-- Prefer serving questions through server actions / security definer functions that strip keys.
create policy questions_teacher on public.questions for all to authenticated using (public.current_role() = 'teacher') with check (public.current_role() = 'teacher');
create policy questions_student_meta on public.questions for select to authenticated using (
  public.current_role() = 'student' and exists (
    select 1 from public.assignments a where a.id = assignment_id and a.published
  )
);

create policy rem_q_select on public.remediation_questions for select to authenticated using (true);
create policy rem_q_teacher on public.remediation_questions for all to authenticated using (public.current_role() = 'teacher') with check (public.current_role() = 'teacher');

-- Attempts
create policy attempts_student_select on public.attempts for select using (
  student_id = auth.uid() or public.current_role() = 'teacher'
);
create policy attempts_student_insert on public.attempts for insert with check (
  student_id = auth.uid() and public.current_role() = 'student'
);
create policy attempts_student_update on public.attempts for update using (
  student_id = auth.uid() and status = 'in_progress'
);

create policy answers_student_select on public.attempt_answers for select using (
  exists (select 1 from public.attempts a where a.id = attempt_id and (a.student_id = auth.uid() or public.current_role() = 'teacher'))
);
create policy answers_student_upsert on public.attempt_answers for insert with check (
  exists (select 1 from public.attempts a where a.id = attempt_id and a.student_id = auth.uid() and a.status = 'in_progress')
);
create policy answers_student_update on public.attempt_answers for update using (
  exists (select 1 from public.attempts a where a.id = attempt_id and a.student_id = auth.uid() and a.status = 'in_progress')
);

-- grade_events: INSERT only, no UPDATE/DELETE policies (= denied)
create policy grade_events_select on public.grade_events for select using (
  student_id = auth.uid() or public.current_role() = 'teacher'
);
create policy grade_events_insert on public.grade_events for insert with check (
  student_id = auth.uid() or public.current_role() = 'teacher' or actor_role = 'system'
);

revoke update, delete on public.grade_events from authenticated, anon;

create policy rem_attempts_select on public.remediation_attempts for select using (
  student_id = auth.uid() or public.current_role() = 'teacher'
);
create policy rem_attempts_insert on public.remediation_attempts for insert with check (
  student_id = auth.uid()
);

create policy mastery_select on public.concept_mastery for select using (
  student_id = auth.uid() or public.current_role() = 'teacher'
);

create policy reviews_select on public.teacher_reviews for select using (
  student_id = auth.uid() or public.current_role() = 'teacher'
);
create policy reviews_teacher on public.teacher_reviews for all using (public.current_role() = 'teacher') with check (public.current_role() = 'teacher');
