-- ============================================================
-- Optional: sample test_results for a demo account, so the
-- dashboard/profile/charts have something to show immediately.
--
-- Run AFTER schema.sql, and AFTER you've registered at least one
-- real user through the app (so you have a valid auth.users id to
-- substitute below).
-- ============================================================

-- 1. Find your user id:
-- select id, email from auth.users;

-- 2. Replace 'YOUR-USER-UUID-HERE' below with that id, then run this block.

insert into public.test_results
  (user_id, class_num, subject, chapter, difficulty, score, total_questions,
   correct_count, wrong_count, skipped_count, time_taken_seconds, answers, analysis, created_at)
values
  ('YOUR-USER-UUID-HERE', 8, 'Science', 'Light — Reflection and Refraction', 'medium',
   7, 10, 7, 2, 1, 480,
   '[]'::jsonb, null, now() - interval '6 days'),

  ('YOUR-USER-UUID-HERE', 8, 'Math', 'Linear Equations in One Variable', 'medium',
   8, 10, 8, 1, 1, 420,
   '[]'::jsonb, null, now() - interval '4 days'),

  ('YOUR-USER-UUID-HERE', 8, 'English', 'Tenses', 'easy',
   9, 10, 9, 1, 0, 300,
   '[]'::jsonb, null, now() - interval '2 days'),

  ('YOUR-USER-UUID-HERE', 8, 'Science', 'Force and Pressure', 'hard',
   5, 10, 5, 4, 1, 540,
   '[]'::jsonb, null, now() - interval '1 day');
