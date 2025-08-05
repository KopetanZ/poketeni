'use client';

import { useState } from 'react';
import { FruitAuth } from '@/components/auth/FruitAuth';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, UserPlus } from 'lucide-react';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup' | null>(null);
  const [step, setStep] = useState<'username' | 'fruit-auth'>('username');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleAuthComplete = async (selection: { fruits: string[]; order: number[] }) => {
    console.log('Auth complete called with:', { username, selection, mode });
    
    if (!username.trim()) {
      setError('ユーザー名を入力してください');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Starting auth process...');
      
      if (mode === 'signup') {
        console.log('Calling signUp...');
        await signUp(username, selection);
        console.log('SignUp completed');
      } else if (mode === 'login') {
        console.log('Calling signIn...');
        await signIn(username, selection);
        console.log('SignIn completed');
      }
      
      console.log('Redirecting to home...');
      router.push('/');
    } catch (err) {
      console.error('Auth error:', err);
      setError(err instanceof Error ? err.message : '認証に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'fruit-auth') {
      setStep('username');
      setError(null);
    } else {
      setMode(null);
      setUsername('');
      setError(null);
      setStep('username');
    }
  };

  if (mode === 'login' || mode === 'signup') {
    return (
      <div>
        {/* ユーザー名入力 */}
        {step === 'username' && (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 font-display mb-2">
                {mode === 'login' ? 'ログイン' : '新規登録'}
              </h2>
              <p className="text-gray-600">
                {mode === 'login' ? 'ユーザー名を入力してください' : 'ユーザー名を決めてください'}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ユーザー名
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poke-blue-500 focus:border-transparent"
                  placeholder="監督さん"
                  maxLength={20}
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                >
                  {error}
                </motion.div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={handleBack}
                  className="flex-1 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  戻る
                </button>
                <button
                  onClick={() => {
                    const trimmedUsername = username.trim();
                    if (!trimmedUsername) {
                      setError('ユーザー名を入力してください');
                    } else if (trimmedUsername.length < 3) {
                      setError('ユーザー名は3文字以上で入力してください');
                    } else if (trimmedUsername.length > 50) {
                      setError('ユーザー名は50文字以下で入力してください');
                    } else {
                      // フルーツ認証に進む
                      setError(null);
                      setStep('fruit-auth');
                    }
                  }}
                  disabled={!username.trim() || isLoading}
                  className="flex-1 bg-poke-blue-500 text-white py-3 rounded-lg hover:bg-poke-blue-600 transition-colors disabled:opacity-50"
                >
                  {isLoading ? '処理中...' : 'フルーツ認証へ'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
        )}

        {/* フルーツ認証（ユーザー名入力後） */}
        {step === 'fruit-auth' && (
          <FruitAuth
            onComplete={handleAuthComplete}
            isLogin={mode === 'login'}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <motion.div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-poke-blue-500 to-poke-blue-600 text-white p-8 text-center">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold font-display mb-2">
              🎾 ポケテニマスター
            </h1>
            <p className="text-blue-100 text-lg">
              ポケモンと一緒にテニス部を育成しよう！
            </p>
          </motion.div>
        </div>

        {/* コンテンツ */}
        <div className="p-8 space-y-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-gray-900 font-display mb-4">
              ようこそ！
            </h2>
            <p className="text-gray-600 leading-relaxed">
              フルーツを使った独特な認証システムで<br />
              安全で楽しいゲーム体験を始めましょう
            </p>
          </motion.div>

          {/* 認証ボタン */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <button
              onClick={() => setMode('signup')}
              className="w-full flex items-center justify-center space-x-3 bg-green-500 text-white py-4 rounded-xl hover:bg-green-600 transition-colors transform hover:scale-105 shadow-lg"
            >
              <UserPlus className="h-6 w-6" />
              <span className="text-lg font-medium">新規登録</span>
            </button>

            <button
              onClick={() => setMode('login')}
              className="w-full flex items-center justify-center space-x-3 bg-poke-blue-500 text-white py-4 rounded-xl hover:bg-poke-blue-600 transition-colors transform hover:scale-105 shadow-lg"
            >
              <User className="h-6 w-6" />
              <span className="text-lg font-medium">ログイン</span>
            </button>
          </motion.div>

          {/* フィーチャー説明 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-gray-50 rounded-xl p-6"
          >
            <h3 className="font-semibold text-gray-800 mb-3 text-center">
              🍎 フルーツ認証システム
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>パスワード不要の簡単認証</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                <span>4つのフルーツを選んで順序を決定</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                <span>覚えやすく、楽しい認証体験</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}