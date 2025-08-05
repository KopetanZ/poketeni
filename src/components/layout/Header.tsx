'use client';

import { useState } from 'react';
import { Bell, Settings, User, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function Header() {
  const [notifications, setNotifications] = useState(3);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ・タイトル */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-poke-blue-600 font-display">
                🎾 ポケテニマスター
              </h1>
            </div>
            
            {/* ゲーム情報 */}
            <div className="ml-8 flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="font-medium">1年目</span>
                <span className="ml-1">4月</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-yellow-600">¥150,000</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-purple-600">評判: 150</span>
              </div>
            </div>
          </div>

          {/* 右側のメニュー */}
          <div className="flex items-center space-x-4">
            {/* 通知 */}
            <button className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors">
              <Bell className="h-6 w-6" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>

            {/* 設定 */}
            <button className="p-2 text-gray-400 hover:text-gray-500 transition-colors">
              <Settings className="h-6 w-6" />
            </button>

            {/* ユーザーメニュー */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <User className="h-6 w-6" />
                <span className="text-sm font-medium">{user?.username || '監督さん'}</span>
              </button>

              {/* ドロップダウンメニュー */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                    <p className="text-xs text-gray-500">監督</p>
                  </div>
                  
                  <button
                    onClick={() => setShowUserMenu(false)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span>設定</span>
                  </button>
                  
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>ログアウト</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}