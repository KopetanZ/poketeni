// データベーススキーマセットアップスクリプト
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 環境変数の読み込み
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.error('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '設定済み' : '未設定');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('🚀 データベーススキーマのセットアップを開始...');
    
    // SQLファイルを読み込み
    const sqlPath = path.join(__dirname, 'database-schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // SQLを実行（複数のステートメントに分割）
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📋 ${statements.length}個のSQLステートメントを実行します...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length === 0) continue;
      
      try {
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: statement + ';' 
        });
        
        if (error) {
          // 一部のエラーは無視（テーブルが既に存在する場合など）
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate key value')) {
            console.log(`⚠️  スキップ: ${statement.substring(0, 50)}...`);
          } else {
            console.error(`❌ エラー: ${error.message}`);
            console.error(`   SQL: ${statement.substring(0, 100)}...`);
            errorCount++;
          }
        } else {
          successCount++;
          if (statement.startsWith('CREATE TABLE')) {
            const tableName = statement.match(/CREATE TABLE (\w+)/i)?.[1];
            console.log(`✅ テーブル作成: ${tableName}`);
          } else if (statement.startsWith('CREATE INDEX')) {
            const indexName = statement.match(/CREATE (?:UNIQUE )?INDEX (\w+)/i)?.[1];
            console.log(`✅ インデックス作成: ${indexName}`);
          } else if (statement.startsWith('CREATE TRIGGER')) {
            const triggerName = statement.match(/CREATE TRIGGER (\w+)/i)?.[1];
            console.log(`✅ トリガー作成: ${triggerName}`);
          }
        }
      } catch (err) {
        console.error(`❌ 実行エラー: ${err.message}`);
        console.error(`   SQL: ${statement.substring(0, 100)}...`);
        errorCount++;
      }
    }
    
    console.log('\n📊 セットアップ結果:');
    console.log(`✅ 成功: ${successCount}`);
    console.log(`❌ エラー: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 データベーススキーマのセットアップが完了しました！');
    } else {
      console.log('\n⚠️  一部エラーがありましたが、重要なテーブルは作成されている可能性があります');
    }
    
    // テーブル存在確認
    console.log('\n🔍 テーブル存在確認...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
      
    if (tablesError) {
      console.error(`❌ テーブル確認エラー: ${tablesError.message}`);
    } else {
      const tableNames = tables.map(t => t.table_name);
      const expectedTables = [
        'users', 'schools', 'players', 'matches', 'match_games',
        'training_sessions', 'training_records', 'items', 'school_items',
        'story_progress', 'achievements', 'rankings', 'multiplayer_battles'
      ];
      
      expectedTables.forEach(tableName => {
        if (tableNames.includes(tableName)) {
          console.log(`✅ ${tableName}`);
        } else {
          console.log(`❌ ${tableName} (未作成)`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ セットアップ中にエラーが発生しました:', error);
    process.exit(1);
  }
}

// 直接実行時のハンドリング
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };