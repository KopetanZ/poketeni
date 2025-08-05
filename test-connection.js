// Supabase接続テスト
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔍 Supabase接続テスト開始...');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseAnonKey ? '✅ 設定済み' : '❌ 未設定');

  try {
    // 1. 基本的な接続テスト
    console.log('\n📡 基本接続テスト...');
    const { data, error } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1);

    if (error) {
      if (error.message.includes('relation "public.users" does not exist')) {
        console.log('⚠️  usersテーブルが存在しません - まずスキーマを作成してください');
        
        // テーブル一覧を取得
        console.log('\n📋 既存テーブル確認...');
        const { data: tables, error: tablesError } = await supabase
          .rpc('get_schema_tables');
        
        if (tablesError) {
          console.log('❌ テーブル一覧取得エラー:', tablesError.message);
        } else {
          console.log('✅ Supabase接続成功 - データベースにアクセス可能');
          console.log('既存テーブル:', tables || 'なし');
        }
      } else {
        console.error('❌ 接続エラー:', error.message);
      }
    } else {
      console.log('✅ usersテーブルアクセス成功');
      console.log('データ:', data);
    }

    // 2. 認証テスト
    console.log('\n🔐 認証システムテスト...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ 認証エラー:', authError.message);
    } else {
      console.log('✅ 認証システム動作中');
      console.log('セッション:', authData.session ? 'ログイン済み' : 'ゲスト');
    }

    // 3. リアルタイム機能テスト
    console.log('\n⚡ リアルタイム機能テスト...');
    const channel = supabase
      .channel('test-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'users' },
        (payload) => console.log('リアルタイム通知:', payload)
      );
    
    const subscribeResult = await channel.subscribe();
    console.log('✅ リアルタイム購読:', subscribeResult === 'SUBSCRIBED' ? '成功' : '失敗');
    
    // クリーンアップ
    setTimeout(() => {
      supabase.removeChannel(channel);
      console.log('🧹 テスト完了 - チャンネルクリーンアップ');
    }, 1000);

  } catch (error) {
    console.error('❌ テスト中にエラーが発生:', error.message);
  }
}

// 直接実行時のハンドリング
if (require.main === module) {
  testConnection();
}

module.exports = { testConnection };