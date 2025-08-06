-- =====================================================
-- カードゲーム関連テーブル追加スクリプト
-- 既存のテーブルと不足していた404エラーの原因テーブルを追加
-- =====================================================

-- 1. ゲーム進行状況テーブル
CREATE TABLE IF NOT EXISTS game_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 現在のゲーム状態
  current_year INTEGER DEFAULT 1 CHECK (current_year BETWEEN 1 AND 3),
  current_month INTEGER DEFAULT 4 CHECK (current_month BETWEEN 1 AND 12),
  current_day INTEGER DEFAULT 1 CHECK (current_day BETWEEN 1 AND 31),
  current_position INTEGER DEFAULT 0 CHECK (current_position >= 0),
  
  -- 手札情報
  hand JSONB NOT NULL DEFAULT '{"cards": [], "maxCards": 4, "drawPileSize": 20}',
  used_cards JSONB DEFAULT '[]',
  
  -- フェーズ管理
  is_card_selection_phase BOOLEAN DEFAULT true,
  is_movement_phase BOOLEAN DEFAULT false,
  is_event_phase BOOLEAN DEFAULT false,
  
  -- 強制停止情報
  forced_stop JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 制約
  UNIQUE(school_id),
  CONSTRAINT valid_hand_structure CHECK (
    hand ? 'cards' AND 
    hand ? 'maxCards' AND 
    hand ? 'drawPileSize'
  )
);

-- 2. シーズンマップテーブル
CREATE TABLE IF NOT EXISTS season_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  year INTEGER NOT NULL CHECK (year BETWEEN 1 AND 3),
  
  -- マップ情報
  total_days INTEGER NOT NULL DEFAULT 365,
  panels JSONB NOT NULL DEFAULT '[]',
  fixed_events JSONB DEFAULT '[]',
  random_panel_distribution JSONB DEFAULT '{"good_event": 20, "bad_event": 15, "normal": 50, "special_training": 10, "character": 5}',
  
  -- マップ設定  
  difficulty_modifier DECIMAL(3,2) DEFAULT 1.0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 制約
  UNIQUE(school_id, year),
  CONSTRAINT valid_panels CHECK (jsonb_array_length(panels) > 0)
);

-- 3. イベント履歴テーブル
CREATE TABLE IF NOT EXISTS event_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  -- イベント基本情報
  event_date VARCHAR(20) NOT NULL, -- "2024-04-15" 形式
  event_position INTEGER NOT NULL CHECK (event_position >= 0),
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
    'graduation', 'promotion', 'new_students', 'tournament', 'special',
    'practice_match', 'training_camp', 'equipment_purchase', 'facility_upgrade'
  )),
  event_title VARCHAR(200) NOT NULL,
  event_description TEXT,
  
  -- 選択・結果
  choice_selected INTEGER,
  choice_text TEXT,
  effects JSONB DEFAULT '{}',
  affected_players JSONB DEFAULT '[]',
  
  -- 日時
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- インデックス用
  CONSTRAINT valid_event_date CHECK (LENGTH(event_date) >= 8)
);

-- 4. インデックス作成
CREATE INDEX IF NOT EXISTS idx_game_progress_school ON game_progress(school_id);
CREATE INDEX IF NOT EXISTS idx_game_progress_user ON game_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_game_progress_date ON game_progress(current_year, current_month, current_day);

CREATE INDEX IF NOT EXISTS idx_season_maps_school_year ON season_maps(school_id, year);
CREATE INDEX IF NOT EXISTS idx_season_maps_difficulty ON season_maps(difficulty_modifier);

CREATE INDEX IF NOT EXISTS idx_event_history_school ON event_history(school_id);
CREATE INDEX IF NOT EXISTS idx_event_history_date ON event_history(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_event_history_type ON event_history(event_type);
CREATE INDEX IF NOT EXISTS idx_event_history_position ON event_history(event_position);

-- 5. RLS (Row Level Security) ポリシー設定
ALTER TABLE game_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_history ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のデータのみアクセス可能
CREATE POLICY "Users can access their own game progress" ON game_progress
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can access their own season maps" ON season_maps
  FOR ALL USING (school_id IN (SELECT id FROM schools WHERE user_id = auth.uid()))
  WITH CHECK (school_id IN (SELECT id FROM schools WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their own event history" ON event_history
  FOR ALL USING (school_id IN (SELECT id FROM schools WHERE user_id = auth.uid()))
  WITH CHECK (school_id IN (SELECT id FROM schools WHERE user_id = auth.uid()));

-- 6. トリガー設定
CREATE TRIGGER update_game_progress_updated_at BEFORE UPDATE ON game_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. コメント追加
COMMENT ON TABLE game_progress IS 'カードゲーム進行状況（栄冠ナイン式）';
COMMENT ON TABLE season_maps IS 'シーズンマップ情報';
COMMENT ON TABLE event_history IS 'ゲーム内イベント履歴';

COMMENT ON COLUMN game_progress.hand IS '手札データ: {"cards": [...], "maxCards": 4, "drawPileSize": 20}';
COMMENT ON COLUMN game_progress.used_cards IS '使用済みカード配列';
COMMENT ON COLUMN game_progress.forced_stop IS '強制停止情報: {"reason": "試合", "nextAction": "match"}';
COMMENT ON COLUMN season_maps.panels IS 'マップパネル配列: [{"position": 0, "type": "normal", "display": {...}, "effects": {...}}]';
COMMENT ON COLUMN event_history.effects IS 'イベント効果: {"reputation": +5, "funds": -1000}';
COMMENT ON COLUMN event_history.affected_players IS '影響を受けた選手のUUID配列';

-- =====================================================
-- カードゲームテーブル作成完了
-- =====================================================