-- =====================================================
-- RLS ポリシー修正スクリプト
-- カスタム認証システム対応（auth.uid()使用不可のため）
-- 一時的に全テーブルのRLSを無効化
-- =====================================================

-- 既存のポリシーをすべて削除
DROP POLICY IF EXISTS "Users can access their own data" ON users;
DROP POLICY IF EXISTS "Users can access their own schools" ON schools;
DROP POLICY IF EXISTS "Users can access their own players" ON players;
DROP POLICY IF EXISTS "Schools can access their matches" ON matches;
DROP POLICY IF EXISTS "Anyone can view rankings" ON rankings;
DROP POLICY IF EXISTS "Users can insert their own rankings" ON rankings;
DROP POLICY IF EXISTS "Users can update their own rankings" ON rankings;
DROP POLICY IF EXISTS "Users can delete their own rankings" ON rankings;
DROP POLICY IF EXISTS "Anyone can view items" ON items;
DROP POLICY IF EXISTS "Users can manage their own items" ON school_items;

-- カードゲーム関連のポリシーも削除
DROP POLICY IF EXISTS "Users can access their own game progress" ON game_progress;
DROP POLICY IF EXISTS "Users can access their own season maps" ON season_maps;
DROP POLICY IF EXISTS "Users can access their own event history" ON event_history;

-- 全テーブルのRLSを一時的に無効化
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE schools DISABLE ROW LEVEL SECURITY;
ALTER TABLE players DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE match_games DISABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE training_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE items DISABLE ROW LEVEL SECURITY;
ALTER TABLE school_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE story_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE rankings DISABLE ROW LEVEL SECURITY;
ALTER TABLE multiplayer_battles DISABLE ROW LEVEL SECURITY;

-- カードゲーム関連テーブルのRLSも無効化
ALTER TABLE game_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE season_maps DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_history DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS無効化完了
-- 注意: これによりデータベースのセキュリティが一時的に低下します
-- 本番環境では適切なセキュリティポリシーの実装が必要です
-- =====================================================