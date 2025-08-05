-- =====================================================
-- 一時的にusersテーブルの制約を緩和
-- 認証問題のデバッグ用
-- =====================================================

-- 既存の制約を削除
ALTER TABLE users DROP CONSTRAINT IF EXISTS valid_fruits_structure;

-- fruits フィールドの CHECK 制約も一時的に削除
ALTER TABLE users ALTER COLUMN fruits DROP DEFAULT;

-- 新しいより緩い制約を追加（デバッグ用）
ALTER TABLE users ADD CONSTRAINT temp_fruits_check 
  CHECK (fruits IS NOT NULL AND jsonb_typeof(fruits) = 'object');

-- 注意: この変更は一時的なものです
-- 問題が解決したら、元の制約を復元することを推奨します

-- 元の制約を復元する場合は以下を実行:
-- ALTER TABLE users DROP CONSTRAINT temp_fruits_check;
-- ALTER TABLE users ADD CONSTRAINT valid_fruits_structure CHECK (
--   fruits ? 'selection' AND 
--   fruits ? 'order' AND
--   jsonb_array_length(fruits->'selection') = 4 AND
--   jsonb_array_length(fruits->'order') = 4
-- );