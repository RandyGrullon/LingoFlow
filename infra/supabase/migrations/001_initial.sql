-- LingoFlow AI — schema + RLS (Supabase PostgreSQL)

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  native_language text not null default 'es',
  target_language text not null default 'en',
  cefr_level text not null default 'A1',
  created_at timestamptz not null default now()
);

create table if not exists public.learning_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  strengths jsonb not null default '[]'::jsonb,
  weaknesses jsonb not null default '[]'::jsonb,
  goals jsonb not null default '[]'::jsonb,
  difficulty_score numeric not null default 1.0,
  total_xp int not null default 0,
  streak_days int not null default 0,
  last_active_at timestamptz,
  updated_at timestamptz not null default now(),
  recent_task_scores jsonb not null default '[]'::jsonb,
  weak_streak jsonb not null default '{}'::jsonb
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text,
  topic text,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create index if not exists conversations_user_last on public.conversations (user_id, last_message_at desc);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  audio_url text,
  corrections jsonb,
  created_at timestamptz not null default now()
);

create index if not exists messages_conv_created on public.messages (conversation_id, created_at);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  cefr_level text,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  generated_by_ai boolean not null default true,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('multiple_choice', 'writing', 'voice', 'drag_drop', 'pdf_worksheet')),
  prompt text not null,
  payload jsonb not null,
  expected_answer jsonb,
  user_answer jsonb,
  score numeric,
  feedback text,
  status text not null default 'pending' check (status in ('pending', 'submitted', 'graded')),
  created_at timestamptz not null default now(),
  submitted_at timestamptz
);

create index if not exists tasks_user_status on public.tasks (user_id, status);

create table if not exists public.pdf_evaluations (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  source_pdf_url text not null,
  submission_pdf_url text,
  extracted_text text,
  ai_score numeric,
  ai_feedback jsonb,
  graded_at timestamptz
);

alter table public.profiles enable row level security;
alter table public.learning_profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.lessons enable row level security;
alter table public.tasks enable row level security;
alter table public.pdf_evaluations enable row level security;

create policy "profiles_own_select" on public.profiles for select using (auth.uid() = id);
create policy "profiles_own_update" on public.profiles for update using (auth.uid() = id);
create policy "profiles_own_insert" on public.profiles for insert with check (auth.uid() = id);

create policy "learning_own_all" on public.learning_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "conv_own_all" on public.conversations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "msg_via_conv" on public.messages for all using (
  exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid())
) with check (
  exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid())
);

create policy "lessons_own_all" on public.lessons for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "tasks_own_all" on public.tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "pdf_eval_own_all" on public.pdf_evaluations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Storage buckets (create in Supabase UI or SQL)
insert into storage.buckets (id, name, public)
values ('worksheets', 'worksheets', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('submissions', 'submissions', false)
on conflict (id) do nothing;

create policy "worksheets_read" on storage.objects for select using (bucket_id = 'worksheets');
create policy "worksheets_upload_own" on storage.objects for insert with check (
  bucket_id = 'worksheets' and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "submissions_own" on storage.objects for all using (
  bucket_id = 'submissions' and auth.uid()::text = (storage.foldername(name))[1]
) with check (
  bucket_id = 'submissions' and auth.uid()::text = (storage.foldername(name))[1]
);
