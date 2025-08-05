-- カードゲーム進行状況テーブル
CREATE TABLE game_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  -- 時間進行
  current_year INTEGER NOT NULL DEFAULT 1 CHECK (current_year BETWEEN 1 AND 3),
  current_month INTEGER NOT NULL DEFAULT 4 CHECK (current_month BETWEEN 1 AND 12),
  current_day INTEGER NOT NULL DEFAULT 1 CHECK (current_day BETWEEN 1 AND 31),
  current_position INTEGER NOT NULL DEFAULT 0 CHECK (current_position >= 0),
  
  -- カード状態
  current_hand JSONB DEFAULT '[]', -- 現在の手札
  used_cards JSONB DEFAULT '[]',   -- 使用済みカード
  deck_cards JSONB DEFAULT '[]',   -- 山札
  
  -- ゲーム状態
  is_card_selection_phase BOOLEAN DEFAULT true,
  is_movement_phase BOOLEAN DEFAULT false,
  is_event_phase BOOLEAN DEFAULT false,
  
  -- その他の状態
  forced_stop JSONB DEFAULT NULL, -- 強制停止情報
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 制約
  UNIQUE(school_id) -- 1つの学校につき1つの進行状況のみ
);

-- イベント履歴テーブル
CREATE TABLE event_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  -- イベント情報
  event_date DATE NOT NULL,
  event_position INTEGER NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  event_title VARCHAR(200) NOT NULL,
  event_description TEXT,
  
  -- 選択した選択肢（選択肢がある場合）
  choice_selected INTEGER DEFAULT NULL,
  choice_text TEXT DEFAULT NULL,
  
  -- 効果
  effects JSONB DEFAULT '{}',
  
  -- 影響を受けた選手
  affected_players JSONB DEFAULT '[]',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 年間マップテーブル（生成されたマップを保存）
CREATE TABLE season_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  -- マップ情報
  year INTEGER NOT NULL CHECK (year BETWEEN 1 AND 3),
  total_days INTEGER NOT NULL DEFAULT 365,
  
  -- パネル配置
  panels JSONB NOT NULL DEFAULT '[]', -- パネル情報の配列
  
  -- 固定イベント
  fixed_events JSONB NOT NULL DEFAULT '[]',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 制約
  UNIQUE(school_id, year) -- 1つの学校の各年度につき1つのマップ
);

-- インデックス
CREATE INDEX idx_game_progress_school_id ON game_progress(school_id);
CREATE INDEX idx_event_history_school_date ON event_history(school_id, event_date);
CREATE INDEX idx_event_history_school_position ON event_history(school_id, event_position);
CREATE INDEX idx_season_maps_school_year ON season_maps(school_id, year);

-- RLS (Row Level Security) ポリシー
ALTER TABLE game_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_maps ENABLE ROW LEVEL SECURITY;

-- game_progress のポリシー
CREATE POLICY "Users can view their own game progress" ON game_progress
  FOR SELECT USING (
    school_id IN (
      SELECT id FROM schools WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own game progress" ON game_progress
  FOR ALL USING (
    school_id IN (
      SELECT id FROM schools WHERE user_id = auth.uid()
    )
  );

-- event_history のポリシー
CREATE POLICY "Users can view their own event history" ON event_history
  FOR SELECT USING (
    school_id IN (
      SELECT id FROM schools WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own event history" ON event_history
  FOR INSERT WITH CHECK (
    school_id IN (
      SELECT id FROM schools WHERE user_id = auth.uid()
    )
  );

-- season_maps のポリシー
CREATE POLICY "Users can view their own season maps" ON season_maps
  FOR SELECT USING (
    school_id IN (
      SELECT id FROM schools WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own season maps" ON season_maps
  FOR ALL USING (
    school_id IN (
      SELECT id FROM schools WHERE user_id = auth.uid()
    )
  );

-- 更新時間の自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_game_progress_updated_at 
  BEFORE UPDATE ON game_progress 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();