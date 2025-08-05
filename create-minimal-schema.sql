-- 最小限のスキーマ（開発開始用）
-- Supabase SQL Editorにコピー&ペーストして実行してください

-- ユーザーテーブル
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) NOT NULL UNIQUE,
  fruits JSONB NOT NULL,
  avatar_config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 学校テーブル
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  current_year INTEGER DEFAULT 1,
  current_month INTEGER DEFAULT 4,
  current_day INTEGER DEFAULT 1,
  game_speed VARCHAR(10) DEFAULT 'normal',
  reputation INTEGER DEFAULT 0,
  funds INTEGER DEFAULT 100000,
  facilities JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 選手テーブル
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  pokemon_id INTEGER NOT NULL,
  pokemon_name VARCHAR(50) NOT NULL,
  pokemon_type_1 VARCHAR(20) NOT NULL,
  pokemon_type_2 VARCHAR(20),
  custom_name VARCHAR(50),
  grade INTEGER NOT NULL DEFAULT 1,
  position VARCHAR(20) DEFAULT 'member',
  level INTEGER DEFAULT 1,
  power INTEGER DEFAULT 50,
  technique INTEGER DEFAULT 50,
  speed INTEGER DEFAULT 50,
  stamina INTEGER DEFAULT 50,
  mental INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 基本インデックス
CREATE INDEX idx_schools_user_id ON schools(user_id);
CREATE INDEX idx_players_school_id ON players(school_id);

-- Row Level Security（セキュリティ）
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- 基本ポリシー
CREATE POLICY "Users can access their own data" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can access their own schools" ON schools
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own players" ON players
  FOR ALL USING (school_id IN (SELECT id FROM schools WHERE user_id = auth.uid()));

-- テスト用サンプルデータ（オプション）
-- INSERT INTO users (username, fruits) VALUES 
-- ('test_user', '{"selection": ["apple", "banana", "grape", "strawberry"], "order": [1, 2, 3, 4]}');