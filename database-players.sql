-- 選手テーブル
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  -- ポケモン基本情報
  pokemon_id INTEGER NOT NULL,
  pokemon_name VARCHAR(100) NOT NULL,
  pokemon_type_1 VARCHAR(20) NOT NULL,
  pokemon_type_2 VARCHAR(20) DEFAULT NULL,
  custom_name VARCHAR(100) DEFAULT NULL,
  
  -- 基本情報
  grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 3),
  position VARCHAR(20) NOT NULL CHECK (position IN ('captain', 'vice_captain', 'regular', 'member')),
  join_date DATE NOT NULL,
  graduation_date DATE DEFAULT NULL,
  
  -- 成長情報
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  experience INTEGER NOT NULL DEFAULT 0 CHECK (experience >= 0),
  evolution_stage INTEGER NOT NULL DEFAULT 1 CHECK (evolution_stage >= 1),
  
  -- 基本能力値 (0-100)
  power INTEGER NOT NULL DEFAULT 50 CHECK (power BETWEEN 0 AND 100),
  technique INTEGER NOT NULL DEFAULT 50 CHECK (technique BETWEEN 0 AND 100),
  speed INTEGER NOT NULL DEFAULT 50 CHECK (speed BETWEEN 0 AND 100),
  stamina INTEGER NOT NULL DEFAULT 50 CHECK (stamina BETWEEN 0 AND 100),
  mental INTEGER NOT NULL DEFAULT 50 CHECK (mental BETWEEN 0 AND 100),
  
  -- テニス技術 (0-100)
  serve_skill INTEGER NOT NULL DEFAULT 50 CHECK (serve_skill BETWEEN 0 AND 100),
  volley_skill INTEGER NOT NULL DEFAULT 50 CHECK (volley_skill BETWEEN 0 AND 100),
  stroke_skill INTEGER NOT NULL DEFAULT 50 CHECK (stroke_skill BETWEEN 0 AND 100),
  return_skill INTEGER NOT NULL DEFAULT 50 CHECK (return_skill BETWEEN 0 AND 100),
  
  -- 戦術理解 (0-100)
  singles_aptitude INTEGER NOT NULL DEFAULT 50 CHECK (singles_aptitude BETWEEN 0 AND 100),
  doubles_aptitude INTEGER NOT NULL DEFAULT 50 CHECK (doubles_aptitude BETWEEN 0 AND 100),
  tactical_understanding INTEGER NOT NULL DEFAULT 50 CHECK (tactical_understanding BETWEEN 0 AND 100),
  
  -- 個体値 (0-31)
  iv_power INTEGER NOT NULL DEFAULT 15 CHECK (iv_power BETWEEN 0 AND 31),
  iv_technique INTEGER NOT NULL DEFAULT 15 CHECK (iv_technique BETWEEN 0 AND 31),
  iv_speed INTEGER NOT NULL DEFAULT 15 CHECK (iv_speed BETWEEN 0 AND 31),
  iv_stamina INTEGER NOT NULL DEFAULT 15 CHECK (iv_stamina BETWEEN 0 AND 31),
  iv_mental INTEGER NOT NULL DEFAULT 15 CHECK (iv_mental BETWEEN 0 AND 31),
  
  -- 努力値 (0-255)
  ev_power INTEGER NOT NULL DEFAULT 0 CHECK (ev_power BETWEEN 0 AND 255),
  ev_technique INTEGER NOT NULL DEFAULT 0 CHECK (ev_technique BETWEEN 0 AND 255),
  ev_speed INTEGER NOT NULL DEFAULT 0 CHECK (ev_speed BETWEEN 0 AND 255),
  ev_stamina INTEGER NOT NULL DEFAULT 0 CHECK (ev_stamina BETWEEN 0 AND 255),
  ev_mental INTEGER NOT NULL DEFAULT 0 CHECK (ev_mental BETWEEN 0 AND 255),
  
  -- 性格・特性
  nature JSONB NOT NULL DEFAULT '{}',
  ability JSONB NOT NULL DEFAULT '{}',
  hidden_ability JSONB DEFAULT NULL,
  
  -- コンディション
  condition VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (condition IN ('excellent', 'good', 'normal', 'poor', 'terrible')),
  physical_fatigue INTEGER NOT NULL DEFAULT 0 CHECK (physical_fatigue BETWEEN 0 AND 100),
  mental_fatigue INTEGER NOT NULL DEFAULT 0 CHECK (mental_fatigue BETWEEN 0 AND 100),
  accumulated_fatigue INTEGER NOT NULL DEFAULT 0 CHECK (accumulated_fatigue >= 0),
  motivation INTEGER NOT NULL DEFAULT 70 CHECK (motivation BETWEEN 0 AND 100),
  
  -- 技・統計
  learned_moves JSONB NOT NULL DEFAULT '[]',
  move_slots INTEGER NOT NULL DEFAULT 4 CHECK (move_slots BETWEEN 1 AND 8),
  matches_played INTEGER NOT NULL DEFAULT 0 CHECK (matches_played >= 0),
  matches_won INTEGER NOT NULL DEFAULT 0 CHECK (matches_won >= 0),
  sets_won INTEGER NOT NULL DEFAULT 0 CHECK (sets_won >= 0),
  sets_lost INTEGER NOT NULL DEFAULT 0 CHECK (sets_lost >= 0),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 制約
  CONSTRAINT matches_won_check CHECK (matches_won <= matches_played),
  CONSTRAINT ev_total_check CHECK (ev_power + ev_technique + ev_speed + ev_stamina + ev_mental <= 510)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_players_school_id ON players(school_id);
CREATE INDEX IF NOT EXISTS idx_players_pokemon_id ON players(pokemon_id);
CREATE INDEX IF NOT EXISTS idx_players_grade ON players(grade);
CREATE INDEX IF NOT EXISTS idx_players_position ON players(position);
CREATE INDEX IF NOT EXISTS idx_players_level ON players(level);

-- RLS (Row Level Security) ポリシー
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- players のポリシー
CREATE POLICY "Users can view their own players" ON players
  FOR SELECT USING (
    school_id IN (
      SELECT id FROM schools WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own players" ON players
  FOR ALL USING (
    school_id IN (
      SELECT id FROM schools WHERE user_id = auth.uid()
    )
  );

-- 更新時間の自動更新
CREATE TRIGGER update_players_updated_at 
  BEFORE UPDATE ON players 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 練習履歴テーブル
CREATE TABLE IF NOT EXISTS training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  -- 練習情報
  training_date DATE NOT NULL,
  session_type VARCHAR(50) NOT NULL,
  intensity VARCHAR(20) NOT NULL CHECK (intensity IN ('light', 'normal', 'hard', 'extreme')),
  duration INTEGER NOT NULL DEFAULT 60 CHECK (duration > 0), -- 分単位
  
  -- 参加者情報
  participants JSONB NOT NULL DEFAULT '[]', -- 参加した選手のID配列
  training_menu JSONB NOT NULL DEFAULT '{}',
  special_events JSONB DEFAULT '[]',
  
  -- 効果修正値
  base_effectiveness DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  weather_modifier DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  facility_modifier DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- training_sessions のインデックス
CREATE INDEX IF NOT EXISTS idx_training_sessions_school_date ON training_sessions(school_id, training_date);
CREATE INDEX IF NOT EXISTS idx_training_sessions_type ON training_sessions(session_type);

-- training_sessions の RLS
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own training sessions" ON training_sessions
  FOR SELECT USING (
    school_id IN (
      SELECT id FROM schools WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own training sessions" ON training_sessions
  FOR ALL USING (
    school_id IN (
      SELECT id FROM schools WHERE user_id = auth.uid()
    )
  );

-- 試合履歴テーブル
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  away_school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  -- 試合情報
  match_type VARCHAR(50) NOT NULL,
  tournament_round VARCHAR(50) DEFAULT NULL,
  court_type VARCHAR(20) NOT NULL DEFAULT 'hard',
  weather VARCHAR(20) NOT NULL DEFAULT 'clear',
  temperature INTEGER DEFAULT NULL,
  
  -- 試合状態
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  current_game INTEGER NOT NULL DEFAULT 1,
  home_wins INTEGER NOT NULL DEFAULT 0,
  away_wins INTEGER NOT NULL DEFAULT 0,
  winner_school_id UUID DEFAULT NULL REFERENCES schools(id),
  final_score VARCHAR(100) DEFAULT NULL,
  
  -- 試合ログと統計
  match_log JSONB DEFAULT '[]',
  statistics JSONB DEFAULT '{}',
  
  -- 日時
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- matches のインデックス
CREATE INDEX IF NOT EXISTS idx_matches_home_school ON matches(home_school_id);
CREATE INDEX IF NOT EXISTS idx_matches_away_school ON matches(away_school_id);
CREATE INDEX IF NOT EXISTS idx_matches_scheduled_date ON matches(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);

-- matches の RLS
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view matches involving their school" ON matches
  FOR SELECT USING (
    home_school_id IN (SELECT id FROM schools WHERE user_id = auth.uid()) OR
    away_school_id IN (SELECT id FROM schools WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage matches involving their school" ON matches
  FOR ALL USING (
    home_school_id IN (SELECT id FROM schools WHERE user_id = auth.uid()) OR
    away_school_id IN (SELECT id FROM schools WHERE user_id = auth.uid())
  );