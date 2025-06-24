-- サンプル習慣データの挿入（実際のユーザーIDに置き換えてください）
-- このスクリプトは、ユーザーがサインアップした後に実行してください

-- 注意: 以下のuser_idは例です。実際のユーザーIDに置き換える必要があります
-- INSERT INTO habits (user_id, name, description) VALUES
--   ('your-user-id-here', '朝の散歩', '毎朝30分の散歩をする'),
--   ('your-user-id-here', '読書', '毎日最低15分読書をする'),
--   ('your-user-id-here', '瞑想', '5分間の瞑想を行う'),
--   ('your-user-id-here', '水分補給', '1日2リットルの水を飲む'),
--   ('your-user-id-here', '早寝', '23時までに就寝する');

-- サンプル気分データ（過去1週間分）
-- INSERT INTO mood_logs (user_id, date, mood, note) VALUES
--   ('your-user-id-here', CURRENT_DATE - INTERVAL '6 days', 4, '良い一日でした'),
--   ('your-user-id-here', CURRENT_DATE - INTERVAL '5 days', 3, '普通の日'),
--   ('your-user-id-here', CURRENT_DATE - INTERVAL '4 days', 5, '最高の気分！'),
--   ('your-user-id-here', CURRENT_DATE - INTERVAL '3 days', 2, '少し疲れていました'),
--   ('your-user-id-here', CURRENT_DATE - INTERVAL '2 days', 4, 'リフレッシュできました'),
--   ('your-user-id-here', CURRENT_DATE - INTERVAL '1 days', 3, '平穏な一日'),
--   ('your-user-id-here', CURRENT_DATE, 4, '今日も頑張りました');
