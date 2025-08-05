# データベーススキーマセットアップ手順

## 1. Supabase SQL Editorでのスキーマ実行

以下の手順でデータベーススキーマを作成してください：

### ステップ1: Supabaseダッシュボードにアクセス
1. https://supabase.com/dashboard にアクセス
2. プロジェクト `oijhrdkbttuitkiwbigg` を選択

### ステップ2: SQL Editorを開く
1. 左サイドバーから「SQL Editor」をクリック
2. 「New query」ボタンをクリック

### ステップ3: スキーマSQLを実行
1. `database-schema.sql` の内容を SQL Editor にコピー&ペーストします
2. 右下の「Run」ボタンをクリックして実行

**重要:** SQLファイルが大きいため、以下の順番で分割実行することをお勧めします：

#### 3-1. まず基本テーブルを作成
```sql
-- 1.1 ユーザーテーブル
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) NOT NULL UNIQUE,
  fruits JSONB NOT NULL,
  avatar_config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.2 学校テーブル  
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  current_year INTEGER DEFAULT 1 CHECK (current_year BETWEEN 1 AND 3),
  current_month INTEGER DEFAULT 4 CHECK (current_month BETWEEN 1 AND 12),
  current_day INTEGER DEFAULT 1 CHECK (current_day BETWEEN 1 AND 31),
  game_speed VARCHAR(10) DEFAULT 'normal' CHECK (game_speed IN ('pause', 'normal', 'fast')),
  reputation INTEGER DEFAULT 0 CHECK (reputation >= 0),
  funds INTEGER DEFAULT 100000 CHECK (funds >= 0),
  facilities JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.3 選手テーブル
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  pokemon_id INTEGER NOT NULL CHECK (pokemon_id > 0 AND pokemon_id <= 1010),
  pokemon_name VARCHAR(50) NOT NULL,
  pokemon_type_1 VARCHAR(20) NOT NULL,
  pokemon_type_2 VARCHAR(20),
  custom_name VARCHAR(50),
  grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 3),
  position VARCHAR(20) DEFAULT 'member' CHECK (position IN ('captain', 'vice_captain', 'regular', 'member')),
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  graduation_date DATE,
  level INTEGER DEFAULT 1 CHECK (level BETWEEN 1 AND 100),
  experience INTEGER DEFAULT 0 CHECK (experience >= 0),
  evolution_stage INTEGER DEFAULT 0 CHECK (evolution_stage BETWEEN 0 AND 2),
  power INTEGER DEFAULT 50 CHECK (power BETWEEN 0 AND 100),
  technique INTEGER DEFAULT 50 CHECK (technique BETWEEN 0 AND 100),
  speed INTEGER DEFAULT 50 CHECK (speed BETWEEN 0 AND 100),
  stamina INTEGER DEFAULT 50 CHECK (stamina BETWEEN 0 AND 100),
  mental INTEGER DEFAULT 50 CHECK (mental BETWEEN 0 AND 100),
  serve_skill INTEGER DEFAULT 30 CHECK (serve_skill BETWEEN 0 AND 100),
  volley_skill INTEGER DEFAULT 30 CHECK (volley_skill BETWEEN 0 AND 100),
  stroke_skill INTEGER DEFAULT 30 CHECK (stroke_skill BETWEEN 0 AND 100),
  return_skill INTEGER DEFAULT 30 CHECK (return_skill BETWEEN 0 AND 100),
  singles_aptitude INTEGER DEFAULT 50 CHECK (singles_aptitude BETWEEN 0 AND 100),
  doubles_aptitude INTEGER DEFAULT 50 CHECK (doubles_aptitude BETWEEN 0 AND 100),
  tactical_understanding INTEGER DEFAULT 30 CHECK (tactical_understanding BETWEEN 0 AND 100),
  iv_power INTEGER DEFAULT 15 CHECK (iv_power BETWEEN 0 AND 31),
  iv_technique INTEGER DEFAULT 15 CHECK (iv_technique BETWEEN 0 AND 31),
  iv_speed INTEGER DEFAULT 15 CHECK (iv_speed BETWEEN 0 AND 31),
  iv_stamina INTEGER DEFAULT 15 CHECK (iv_stamina BETWEEN 0 AND 31),
  iv_mental INTEGER DEFAULT 15 CHECK (iv_mental BETWEEN 0 AND 31),
  ev_power INTEGER DEFAULT 0 CHECK (ev_power BETWEEN 0 AND 255),
  ev_technique INTEGER DEFAULT 0 CHECK (ev_technique BETWEEN 0 AND 255),
  ev_speed INTEGER DEFAULT 0 CHECK (ev_speed BETWEEN 0 AND 255),
  ev_stamina INTEGER DEFAULT 0 CHECK (ev_stamina BETWEEN 0 AND 255),
  ev_mental INTEGER DEFAULT 0 CHECK (ev_mental BETWEEN 0 AND 255),
  nature JSONB DEFAULT '{}',
  ability JSONB DEFAULT '{}',
  hidden_ability JSONB,
  condition VARCHAR(20) DEFAULT 'normal' CHECK (condition IN ('excellent', 'good', 'normal', 'poor', 'terrible')),
  physical_fatigue INTEGER DEFAULT 0 CHECK (physical_fatigue BETWEEN 0 AND 100),
  mental_fatigue INTEGER DEFAULT 0 CHECK (mental_fatigue BETWEEN 0 AND 100),
  accumulated_fatigue INTEGER DEFAULT 0 CHECK (accumulated_fatigue BETWEEN 0 AND 100),
  motivation INTEGER DEFAULT 70 CHECK (motivation BETWEEN 0 AND 100),
  learned_moves JSONB DEFAULT '[]',
  move_slots INTEGER DEFAULT 4 CHECK (move_slots BETWEEN 1 AND 4),
  matches_played INTEGER DEFAULT 0 CHECK (matches_played >= 0),
  matches_won INTEGER DEFAULT 0 CHECK (matches_won >= 0),
  sets_won INTEGER DEFAULT 0 CHECK (sets_won >= 0),
  sets_lost INTEGER DEFAULT 0 CHECK (sets_lost >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3-2. 基本インデックスを作成
```sql
CREATE INDEX idx_schools_user_id ON schools(user_id);
CREATE INDEX idx_players_school_id ON players(school_id);
CREATE INDEX idx_players_pokemon_id ON players(pokemon_id);
```

### ステップ4: 接続テスト
基本テーブル作成後、以下のコマンドで接続をテストしてください：

```bash
node test-connection.js
```

## 2. 完全スキーマ実行（推奨）

時間があるときに、`database-schema.sql`全体をSupabase SQL Editorで実行して、完全なスキーマを作成してください。

## 3. トラブルシューティング

### よくあるエラー:
- **権限エラー**: Supabase SQL Editorでは管理者権限で実行されます
- **構文エラー**: PostgreSQL構文を使用してください
- **長いクエリ**: 大きなSQLファイルはタイムアウトすることがあります

基本テーブルが作成できれば、アプリケーション開発を続行できます。