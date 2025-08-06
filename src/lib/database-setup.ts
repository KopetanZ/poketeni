// データベース初期化とテーブル作成
import { supabase } from './supabase';

export async function initializeMissingTables() {
  try {
    console.log('Initializing missing database tables...');

    // 1. game_progressテーブルの作成
    const gameProgressTable = `
      CREATE TABLE IF NOT EXISTS game_progress (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        school_id UUID NOT NULL,
        user_id UUID NOT NULL,
        current_year INTEGER DEFAULT 1,
        current_month INTEGER DEFAULT 4,
        current_day INTEGER DEFAULT 1,
        current_position INTEGER DEFAULT 0,
        hand JSONB NOT NULL DEFAULT '{"cards": [], "maxCards": 4, "drawPileSize": 20}',
        used_cards JSONB DEFAULT '[]',
        is_card_selection_phase BOOLEAN DEFAULT true,
        is_movement_phase BOOLEAN DEFAULT false,
        is_event_phase BOOLEAN DEFAULT false,
        forced_stop JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    const { error: gameProgressError } = await supabase.rpc('exec_sql', { 
      sql: gameProgressTable 
    });

    if (gameProgressError) {
      console.warn('game_progress table creation failed:', gameProgressError);
    }

    // 2. season_mapsテーブルの作成
    const seasonMapsTable = `
      CREATE TABLE IF NOT EXISTS season_maps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        school_id UUID NOT NULL,
        year INTEGER NOT NULL DEFAULT 1,
        total_days INTEGER NOT NULL DEFAULT 365,
        panels JSONB NOT NULL DEFAULT '[]',
        theme VARCHAR(50) DEFAULT 'standard',
        difficulty_modifier DECIMAL(3,2) DEFAULT 1.0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    const { error: seasonMapsError } = await supabase.rpc('exec_sql', { 
      sql: seasonMapsTable 
    });

    if (seasonMapsError) {
      console.warn('season_maps table creation failed:', seasonMapsError);
    }

    // 3. event_historyテーブルの作成
    const eventHistoryTable = `
      CREATE TABLE IF NOT EXISTS event_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        school_id UUID NOT NULL,
        event_date VARCHAR(20) NOT NULL,
        event_position INTEGER NOT NULL DEFAULT 0,
        event_type VARCHAR(50) NOT NULL DEFAULT 'special',
        event_title VARCHAR(200) NOT NULL,
        event_description TEXT,
        choice_selected INTEGER,
        choice_text TEXT,
        effects JSONB DEFAULT '{}',
        affected_players JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    const { error: eventHistoryError } = await supabase.rpc('exec_sql', { 
      sql: eventHistoryTable 
    });

    if (eventHistoryError) {
      console.warn('event_history table creation failed:', eventHistoryError);
    }

    console.log('Database initialization completed');
    
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// テーブル存在確認
export async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .limit(1);
    
    return !error;
  } catch {
    return false;
  }
}

// データベース接続テスト
export async function testDatabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
    
    console.log('Database connection test successful');
    return true;
  } catch (error) {
    console.error('Database connection test error:', error);
    return false;
  }
}

// 簡易テーブル作成（RPC使わない版）
export async function createMissingTablesSimple() {
  try {
    console.log('Testing missing tables with direct queries...');

    // まず各テーブルの存在をテスト
    const tables = ['game_progress', 'season_maps', 'event_history'];
    const missingTables = [];

    for (const table of tables) {
      const exists = await checkTableExists(table);
      console.log(`Table ${table} exists:`, exists);
      if (!exists) {
        missingTables.push(table);
      }
    }

    if (missingTables.length > 0) {
      console.log('Missing tables:', missingTables);
      
      // 簡易的な対処: ローカルストレージを使用
      console.log('Falling back to localStorage for missing table data');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Table check error:', error);
    return false;
  }
}