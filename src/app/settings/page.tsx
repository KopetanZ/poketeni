'use client';

import { useState } from 'react';
import { GameLayout } from '@/components/layout/GameLayout';
import { useAuth } from '@/context/AuthContext';
import { Settings, User, Bell, Gamepad2, Palette, Volume2, Save, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const [settings, setSettings] = useState({
    // ゲーム設定
    autoSave: true,
    gameSpeed: 'normal',
    difficulty: 'normal',
    
    // 表示設定
    theme: 'light',
    language: 'ja',
    showAnimations: true,
    showTutorials: true,
    
    // 音声設定
    masterVolume: 80,
    seVolume: 70,
    bgmVolume: 60,
    voiceVolume: 50,
    
    // 通知設定
    practiceReminders: true,
    matchNotifications: true,
    newsUpdates: false,
    emailNotifications: true
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = () => {
    // 設定保存ロジック
    console.log('Settings saved:', settings);
    alert('設定を保存しました！');
  };

  const resetSettings = () => {
    if (confirm('設定をリセットしますか？この操作は取り消せません。')) {
      setSettings({
        autoSave: true,
        gameSpeed: 'normal',
        difficulty: 'normal',
        theme: 'light',
        language: 'ja',
        showAnimations: true,
        showTutorials: true,
        masterVolume: 80,
        seVolume: 70,
        bgmVolume: 60,
        voiceVolume: 50,
        practiceReminders: true,
        matchNotifications: true,
        newsUpdates: false,
        emailNotifications: true
      });
    }
  };

  return (
    <GameLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-display">
              設定
            </h1>
            <p className="text-gray-600 mt-2">
              ゲームの設定をカスタマイズしましょう
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ユーザー情報 */}
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <User size={20} />
              <h2 className="text-xl font-bold">ユーザー情報</h2>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <h3 className="font-bold text-lg">{user?.username || 'ユーザー'}</h3>
                <p className="text-sm text-gray-600">ID: {user?.id.slice(0, 8)}...</p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>監督レベル:</span>
                  <span className="font-bold">5</span>
                </div>
                <div className="flex justify-between">
                  <span>プレイ日数:</span>
                  <span className="font-bold">12日</span>
                </div>
                <div className="flex justify-between">
                  <span>最後のログイン:</span>
                  <span className="font-bold">今日</span>
                </div>
              </div>

              <button 
                onClick={signOut}
                className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
              >
                <LogOut size={16} />
                <span>ログアウト</span>
              </button>
            </div>
          </motion.div>

          {/* 設定メニュー */}
          <div className="lg:col-span-2 space-y-6">
            {/* ゲーム設定 */}
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <Gamepad2 size={20} />
                <h2 className="text-xl font-bold">ゲーム設定</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">オートセーブ</label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.autoSave}
                      onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">自動でセーブする</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">ゲーム速度</label>
                  <select
                    value={settings.gameSpeed}
                    onChange={(e) => handleSettingChange('gameSpeed', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="slow">遅い</option>
                    <option value="normal">普通</option>
                    <option value="fast">速い</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">難易度</label>
                  <select
                    value={settings.difficulty}
                    onChange={(e) => handleSettingChange('difficulty', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="easy">簡単</option>
                    <option value="normal">普通</option>
                    <option value="hard">難しい</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.showTutorials}
                      onChange={(e) => handleSettingChange('showTutorials', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">チュートリアルを表示</span>
                  </label>
                </div>
              </div>
            </motion.div>

            {/* 表示設定 */}
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <Palette size={20} />
                <h2 className="text-xl font-bold">表示設定</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">テーマ</label>
                  <select
                    value={settings.theme}
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="light">ライト</option>
                    <option value="dark">ダーク</option>
                    <option value="auto">自動</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">言語</label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="ja">日本語</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.showAnimations}
                      onChange={(e) => handleSettingChange('showAnimations', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">アニメーションを表示</span>
                  </label>
                </div>
              </div>
            </motion.div>

            {/* 音声設定 */}
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <Volume2 size={20} />
                <h2 className="text-xl font-bold">音声設定</h2>
              </div>
              
              <div className="space-y-4">
                {[
                  { key: 'masterVolume', label: 'マスター音量' },
                  { key: 'seVolume', label: '効果音' },
                  { key: 'bgmVolume', label: 'BGM' },
                  { key: 'voiceVolume', label: 'ボイス' }
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">{label}</label>
                      <span className="text-sm text-gray-600">{settings[key as keyof typeof settings]}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings[key as keyof typeof settings]}
                      onChange={(e) => handleSettingChange(key, parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 通知設定 */}
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <Bell size={20} />
                <h2 className="text-xl font-bold">通知設定</h2>
              </div>
              
              <div className="space-y-3">
                {[
                  { key: 'practiceReminders', label: '練習リマインダー' },
                  { key: 'matchNotifications', label: '試合通知' },
                  { key: 'newsUpdates', label: 'ニュース更新' },
                  { key: 'emailNotifications', label: 'メール通知' }
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings[key as keyof typeof settings] as boolean}
                      onChange={(e) => handleSettingChange(key, e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </motion.div>

            {/* 保存ボタン */}
            <div className="flex space-x-4">
              <button
                onClick={saveSettings}
                className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Save size={16} />
                <span>設定を保存</span>
              </button>
              
              <button
                onClick={resetSettings}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                リセット
              </button>
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}