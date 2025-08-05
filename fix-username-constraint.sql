-- =====================================================
-- ユーザー名制約を一時的に緩和
-- =====================================================

-- 既存のユーザー名制約を削除
ALTER TABLE users DROP CONSTRAINT IF EXISTS valid_username;

-- より緩い制約を追加（1文字以上50文字以下）
ALTER TABLE users ADD CONSTRAINT temp_valid_username 
  CHECK (LENGTH(username) >= 1 AND LENGTH(username) <= 50);

-- 確認: 現在のusersテーブルの制約を表示
SELECT 
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'users' 
AND con.contype = 'c';

-- 注意: この変更により、1文字のユーザー名も許可されます
-- 必要に応じて元の制約（3文字以上）に戻してください：
-- ALTER TABLE users DROP CONSTRAINT temp_valid_username;
-- ALTER TABLE users ADD CONSTRAINT valid_username 
--   CHECK (LENGTH(username) >= 3 AND LENGTH(username) <= 50);