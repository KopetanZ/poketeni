-- =====================================================
-- 開発用: Row Level Security を一時的に無効化
-- 注意: 本番環境では使用しないでください
-- =====================================================

-- すべてのテーブルでRLSを無効化
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE schools DISABLE ROW LEVEL SECURITY;
ALTER TABLE players DISABLE ROW LEVEL SECURITY;
ALTER TABLE pokemon DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE rankings DISABLE ROW LEVEL SECURITY;
ALTER TABLE items DISABLE ROW LEVEL SECURITY;
ALTER TABLE school_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE multiplayer_battles DISABLE ROW LEVEL SECURITY;

-- 開発完了後は以下のコマンドで再有効化してください:
-- ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;