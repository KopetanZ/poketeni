-- =====================================================
-- usersテーブルの制約を完全に削除（デバッグ用）
-- =====================================================

-- fruitsフィールドの全ての制約を削除
ALTER TABLE users DROP CONSTRAINT IF EXISTS valid_fruits_structure;

-- fruitsカラムの CHECK制約も削除（もしあれば）
DO $$ 
DECLARE
    constraint_name text;
BEGIN
    -- fruitsに関連するCHECK制約を全て削除
    FOR constraint_name IN 
        SELECT con.conname
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        WHERE rel.relname = 'users' 
        AND con.contype = 'c'
        AND pg_get_constraintdef(con.oid) LIKE '%fruits%'
    LOOP
        EXECUTE 'ALTER TABLE users DROP CONSTRAINT ' || constraint_name;
    END LOOP;
END $$;

-- fruitsフィールドをよりシンプルに定義（NOT NULL制約のみ）
-- ALTER TABLE users ALTER COLUMN fruits SET NOT NULL; -- 既にNOT NULLの場合はスキップ

-- 確認: 現在のusersテーブルの制約を表示
SELECT 
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'users' 
AND con.contype = 'c';

-- 注意: この変更により、fruitsフィールドに任意のJSONBデータを挿入できるようになります
-- 問題が解決したら、適切な制約を再設定することを推奨します