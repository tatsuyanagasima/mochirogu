-- サンプルデータの挿入
-- 注意: 実際のユーザーIDに置き換えてください

-- サンプル習慣カテゴリ
INSERT INTO habit_categories (user_id, name, color, icon) VALUES
  (auth.uid(), '健康', '#10b981', 'heart'),
  (auth.uid(), '学習', '#3b82f6', 'book'),
  (auth.uid(), 'ライフスタイル', '#8b5cf6', 'home'),
  (auth.uid(), '仕事', '#f59e0b', 'briefcase')
ON CONFLICT DO NOTHING;

-- サンプル習慣データ
WITH categories AS (
  SELECT id, name FROM habit_categories WHERE user_id = auth.uid()
)
INSERT INTO habits (user_id, name, description, frequency, target_count, days_of_week, category_id) VALUES
  (auth.uid(), '朝の散歩', '健康のための朝の散歩', 'daily', 1, ARRAY[1,2,3,4,5,6,7], (SELECT id FROM categories WHERE name = '健康')),
  (auth.uid(), '読書', '毎日30分の読書', 'daily', 1, ARRAY[1,2,3,4,5,6,7], (SELECT id FROM categories WHERE name = '学習')),
  (auth.uid(), '瞑想', '心を落ち着かせる瞑想', 'daily', 1, ARRAY[1,2,3,4,5,6,7], (SELECT id FROM categories WHERE name = 'ライフスタイル')),
  (auth.uid(), '水分補給', '1日2リットルの水を飲む', 'daily', 8, ARRAY[1,2,3,4,5,6,7], (SELECT id FROM categories WHERE name = '健康')),
  (auth.uid(), '筋トレ', '週3回の筋力トレーニング', 'weekly', 3, ARRAY[1,3,5], (SELECT id FROM categories WHERE name = '健康')),
  (auth.uid(), '英語学習', '英語の勉強', 'daily', 1, ARRAY[1,2,3,4,5], (SELECT id FROM categories WHERE name = '学習')),
  (auth.uid(), '日記', '今日の振り返り', 'daily', 1, ARRAY[1,2,3,4,5,6,7], (SELECT id FROM categories WHERE name = 'ライフスタイル'))
ON CONFLICT DO NOTHING;

-- サンプル気分データ（過去2週間分）
INSERT INTO mood_logs (user_id, date, mood_score, notes, energy_level, stress_level) VALUES
  (auth.uid(), CURRENT_DATE - INTERVAL '13 days', 4, '良い一日でした', 4, 2),
  (auth.uid(), CURRENT_DATE - INTERVAL '12 days', 3, '普通の日', 3, 3),
  (auth.uid(), CURRENT_DATE - INTERVAL '11 days', 5, '最高の気分！', 5, 1),
  (auth.uid(), CURRENT_DATE - INTERVAL '10 days', 2, '少し疲れていました', 2, 4),
  (auth.uid(), CURRENT_DATE - INTERVAL '9 days', 4, 'リフレッシュできました', 4, 2),
  (auth.uid(), CURRENT_DATE - INTERVAL '8 days', 3, '平穏な一日', 3, 3),
  (auth.uid(), CURRENT_DATE - INTERVAL '7 days', 4, '今日も頑張りました', 4, 2),
  (auth.uid(), CURRENT_DATE - INTERVAL '6 days', 3, '普通の日', 3, 3),
  (auth.uid(), CURRENT_DATE - INTERVAL '5 days', 5, '素晴らしい一日', 5, 1),
  (auth.uid(), CURRENT_DATE - INTERVAL '4 days', 4, '充実していました', 4, 2),
  (auth.uid(), CURRENT_DATE - INTERVAL '3 days', 2, 'ストレスが多かった', 2, 5),
  (auth.uid(), CURRENT_DATE - INTERVAL '2 days', 3, '回復してきました', 3, 3),
  (auth.uid(), CURRENT_DATE - INTERVAL '1 days', 4, '良い調子です', 4, 2),
  (auth.uid(), CURRENT_DATE, 4, '今日も良い一日', 4, 2)
ON CONFLICT (user_id, date) DO NOTHING;

-- サンプル習慣記録データ（過去2週間分）
WITH habit_data AS (
  SELECT id, name FROM habits WHERE user_id = auth.uid()
),
date_series AS (
  SELECT generate_series(
    CURRENT_DATE - INTERVAL '13 days',
    CURRENT_DATE,
    INTERVAL '1 day'
  )::date AS log_date
)
INSERT INTO habit_logs (user_id, habit_id, date, completed, count, notes)
SELECT 
  auth.uid(),
  h.id,
  d.log_date,
  CASE 
    WHEN random() > 0.2 THEN true 
    ELSE false 
  END as completed,
  CASE 
    WHEN h.name = '水分補給' THEN floor(random() * 8 + 1)::integer
    WHEN h.name = '筋トレ' AND EXTRACT(dow FROM d.log_date) IN (1,3,5) THEN 1
    WHEN h.name = '英語学習' AND EXTRACT(dow FROM d.log_date) BETWEEN 1 AND 5 THEN 1
    ELSE 1
  END as count,
  CASE 
    WHEN random() > 0.7 THEN '順調です'
    ELSE ''
  END as notes
FROM habit_data h
CROSS JOIN date_series d
WHERE 
  (h.name != '筋トレ' OR EXTRACT(dow FROM d.log_date) IN (1,3,5))
  AND (h.name != '英語学習' OR EXTRACT(dow FROM d.log_date) BETWEEN 1 AND 5)
ON CONFLICT (user_id, habit_id, date) DO NOTHING;
