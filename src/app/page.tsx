'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GameLayout } from '@/components/layout/GameLayout';
import { EnhancedDashboardOverview } from '@/components/game/EnhancedDashboardOverview';
import { YearProgressionDashboard } from '@/components/year-progression/YearProgressionDashboard';
import { useAuth } from '@/context/AuthContext';
import { useYearProgressionLocal } from '@/hooks/useYearProgressionLocal';
import { motion } from 'framer-motion';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { currentSchool, getMonthName } = useYearProgressionLocal();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-6xl mb-4">🎾</div>
          <h2 className="text-2xl font-bold text-gray-900 font-display mb-2">
            ポケテニマスター
          </h2>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-poke-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-poke-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-poke-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-gray-600 mt-2">読み込み中...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null; // リダイレクト中
  }

  return (
    <GameLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-display">
              ダッシュボード
            </h1>
            <p className="text-gray-600 mt-2">
              {user.username}監督、{user.username}のテニス部の現在の状況を確認しましょう
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500">今日</div>
            <div className="text-lg font-bold text-gray-900">
              {currentSchool ? 
                `${currentSchool.current_year}年目 ${getMonthName(currentSchool.current_month)}${currentSchool.current_day}日` :
                '1年目 4月1日'
              }
            </div>
          </div>
        </div>

        <YearProgressionDashboard />
        
        <EnhancedDashboardOverview />
      </div>
    </GameLayout>
  );
}