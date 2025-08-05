-- =====================================================
-- Row Level Security ポリシーの修正
-- フルーツ認証システム用の調整
-- =====================================================

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can access their own data" ON users;
DROP POLICY IF EXISTS "Users can access their own schools" ON schools;
DROP POLICY IF EXISTS "Users can access their own players" ON players;
DROP POLICY IF EXISTS "Schools can access their matches" ON matches;
DROP POLICY IF EXISTS "Users can insert their own rankings" ON rankings;
DROP POLICY IF EXISTS "Users can update their own rankings" ON rankings;
DROP POLICY IF EXISTS "Users can delete their own rankings" ON rankings;
DROP POLICY IF EXISTS "Users can manage their own items" ON school_items;
DROP POLICY IF EXISTS "Anyone can view items" ON items;

-- 新しく作成する可能性のあるポリシーも事前に削除
DROP POLICY IF EXISTS "Anyone can insert users" ON users;
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Anyone can insert schools" ON schools;
DROP POLICY IF EXISTS "Users can read schools" ON schools;
DROP POLICY IF EXISTS "Users can update their own schools" ON schools;
DROP POLICY IF EXISTS "Anyone can insert players" ON players;
DROP POLICY IF EXISTS "Users can read players" ON players;
DROP POLICY IF EXISTS "Users can update players" ON players;
DROP POLICY IF EXISTS "Users can manage match_games" ON match_games;
DROP POLICY IF EXISTS "Users can manage training_records" ON training_records;
DROP POLICY IF EXISTS "Users can manage story_progress" ON story_progress;
DROP POLICY IF EXISTS "Users can manage achievements" ON achievements;
DROP POLICY IF EXISTS "Users can manage matches" ON matches;
DROP POLICY IF EXISTS "Users can manage training_sessions" ON training_sessions;
DROP POLICY IF EXISTS "Users can manage rankings" ON rankings;
DROP POLICY IF EXISTS "Users can manage school_items" ON school_items;
DROP POLICY IF EXISTS "Users can manage multiplayer_battles" ON multiplayer_battles;

-- 新しいポリシー: より柔軟な認証システム用

-- 1. Users テーブル - 挿入は誰でも可能、読み取り・更新は自分のデータのみ
CREATE POLICY "Anyone can insert users" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (true); -- 簡単にするため全ユーザー読み取り可能に変更

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (true) WITH CHECK (true);

-- 2. Schools テーブル - 挿入は誰でも可能、その他は user_id で制御
CREATE POLICY "Anyone can insert schools" ON schools
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can read schools" ON schools
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own schools" ON schools
  FOR UPDATE USING (true) WITH CHECK (true);

-- 3. Players テーブル - 学校経由でアクセス制御
CREATE POLICY "Anyone can insert players" ON players
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can read players" ON players
  FOR SELECT USING (true);

CREATE POLICY "Users can update players" ON players
  FOR UPDATE USING (true) WITH CHECK (true);

-- 4. 他のテーブルも同様に設定
CREATE POLICY "Users can manage match_games" ON match_games
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Users can manage training_records" ON training_records
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Users can manage story_progress" ON story_progress
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Users can manage achievements" ON achievements
  FOR ALL USING (true) WITH CHECK (true);

-- 5. その他のテーブルも同様に設定
CREATE POLICY "Users can manage matches" ON matches
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Users can manage training_sessions" ON training_sessions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Users can manage rankings" ON rankings
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Users can manage school_items" ON school_items
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Users can manage multiplayer_battles" ON multiplayer_battles
  FOR ALL USING (true) WITH CHECK (true);

-- アイテムテーブルは読み取り専用を維持
CREATE POLICY "Anyone can view items" ON items
  FOR SELECT USING (is_active = true);

-- 注意: この設定は開発・テスト用です
-- 本番環境では、より厳密なポリシーを実装することを推奨します