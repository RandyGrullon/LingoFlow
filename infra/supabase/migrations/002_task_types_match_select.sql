-- Ampliar tipos de tarea: match_pairs, select_image

alter table public.tasks drop constraint if exists tasks_type_check;

alter table public.tasks add constraint tasks_type_check check (
  type in (
    'multiple_choice',
    'writing',
    'voice',
    'drag_drop',
    'pdf_worksheet',
    'match_pairs',
    'select_image'
  )
);
