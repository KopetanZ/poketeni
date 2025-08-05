// Supabaseクライアント経由でのスキーマセットアップ
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createBasicTables() {
  console.log('🚀 基本テーブルの作成を開始...');

  // usersテーブルの作成
  console.log('📋 usersテーブルを作成...');
  const { error: usersError } = await supabase.rpc('exec_sql', {
    sql_query: `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) NOT NULL UNIQUE,
        fruits JSONB NOT NULL,
        avatar_config JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  });
  
  if (usersError) {
    console.error('❌ usersテーブル作成エラー:', usersError.message);
  } else {
    console.log('✅ usersテーブル作成完了');
  }

  // schoolsテーブルの作成
  console.log('📋 schoolsテーブルを作成...');
  const { error: schoolsError } = await supabase.rpc('exec_sql', {
    sql_query: `
      CREATE TABLE IF NOT EXISTS schools (
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
    `
  });
  
  if (schoolsError) {
    console.error('❌ schoolsテーブル作成エラー:', schoolsError.message);
  } else {
    console.log('✅ schoolsテーブル作成完了');
  }

  // playersテーブルの作成
  console.log('📋 playersテーブルを作成...');
  const { error: playersError } = await supabase.rpc('exec_sql', {
    sql_query: `
      CREATE TABLE IF NOT EXISTS players (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
        pokemon_id INTEGER NOT NULL,
        pokemon_name VARCHAR(50) NOT NULL,
        pokemon_type_1 VARCHAR(20) NOT NULL,
        pokemon_type_2 VARCHAR(20),
        custom_name VARCHAR(50),
        grade INTEGER NOT NULL DEFAULT 1,
        position VARCHAR(20) DEFAULT 'member',
        join_date DATE NOT NULL DEFAULT CURRENT_DATE,
        graduation_date DATE,
        level INTEGER DEFAULT 1,
        experience INTEGER DEFAULT 0,
        evolution_stage INTEGER DEFAULT 0,
        power INTEGER DEFAULT 50,
        technique INTEGER DEFAULT 50,
        speed INTEGER DEFAULT 50,
        stamina INTEGER DEFAULT 50,
        mental INTEGER DEFAULT 50,
        serve_skill INTEGER DEFAULT 30,
        volley_skill INTEGER DEFAULT 30,
        stroke_skill INTEGER DEFAULT 30,
        return_skill INTEGER DEFAULT 30,
        singles_aptitude INTEGER DEFAULT 50,
        doubles_aptitude INTEGER DEFAULT 50,
        tactical_understanding INTEGER DEFAULT 30,
        iv_power INTEGER DEFAULT 15,
        iv_technique INTEGER DEFAULT 15,
        iv_speed INTEGER DEFAULT 15,
        iv_stamina INTEGER DEFAULT 15,
        iv_mental INTEGER DEFAULT 15,
        ev_power INTEGER DEFAULT 0,
        ev_technique INTEGER DEFAULT 0,
        ev_speed INTEGER DEFAULT 0,
        ev_stamina INTEGER DEFAULT 0,
        ev_mental INTEGER DEFAULT 0,
        nature JSONB DEFAULT '{}',
        ability JSONB DEFAULT '{}',
        hidden_ability JSONB,
        condition VARCHAR(20) DEFAULT 'normal',
        physical_fatigue INTEGER DEFAULT 0,
        mental_fatigue INTEGER DEFAULT 0,
        accumulated_fatigue INTEGER DEFAULT 0,
        motivation INTEGER DEFAULT 70,
        learned_moves JSONB DEFAULT '[]',
        move_slots INTEGER DEFAULT 4,
        matches_played INTEGER DEFAULT 0,
        matches_won INTEGER DEFAULT 0,
        sets_won INTEGER DEFAULT 0,
        sets_lost INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  });
  
  if (playersError) {
    console.error('❌ playersテーブル作成エラー:', playersError.message);
  } else {
    console.log('✅ playersテーブル作成完了');
  }

  // テーブル存在確認
  console.log('\n🔍 テーブル存在確認...');
  const { data: tables, error: checkError } = await supabase
    .from('pg_tables')
    .select('tablename')
    .eq('schemaname', 'public');

  if (checkError) {
    console.error('❌ テーブル確認エラー:', checkError.message);
  } else {
    const tableNames = tables?.map(t => t.tablename) || [];
    ['users', 'schools', 'players'].forEach(tableName => {
      if (tableNames.includes(tableName)) {
        console.log(`✅ ${tableName} テーブル存在`);
      } else {
        console.log(`❌ ${tableName} テーブル未作成`);
      }
    });
  }

  console.log('\n🎉 基本テーブルの作成処理が完了しました！');
}

// 直接実行時のハンドリング
if (require.main === module) {
  createBasicTables();
}

module.exports = { createBasicTables };