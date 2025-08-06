'use client';

import { useState } from 'react';
import { GameLayout } from '@/components/layout/GameLayout';
import { Award, Trophy, Star, Target, Users, TrendingUp, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'training' | 'match' | 'team' | 'special';
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
  reward: string;
  rarity: 'common' | 'rare' | 'legendary';
}

export default function AchievementsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const achievements: Achievement[] = [
    {
      id: '1',
      title: '初心者監督',
      description: '初めて練習を実行する',
      category: 'training',
      isUnlocked: true,
      progress: 1,
      maxProgress: 1,
      reward: '経験値 +100',
      rarity: 'common'
    },
    {
      id: '2',
      title: '練習の鬼',
      description: '100回の練習を完了する',
      category: 'training',
      isUnlocked: false,
      progress: 23,
      maxProgress: 100,
      reward: '特別カード「猛特訓」',
      rarity: 'rare'
    },
    {
      id: '3',
      title: '初勝利',
      description: '初めて試合に勝利する',
      category: 'match',
      isUnlocked: true,
      progress: 1,
      maxProgress: 1,
      reward: '資金 +500円',
      rarity: 'common'
    },
    {
      id: '4',
      title: '県大会制覇',
      description: '県大会で優勝する',
      category: 'match',
      isUnlocked: false,
      progress: 0,
      maxProgress: 1,
      reward: 'レジェンダリーカード',
      rarity: 'legendary'
    },
    {
      id: '5',
      title: 'チームビルダー',
      description: '10人の選手を育成する',
      category: 'team',
      isUnlocked: false,
      progress: 3,
      maxProgress: 10,
      reward: 'コーチ雇用権',
      rarity: 'rare'
    },
    {
      id: '6',
      title: '伝説の監督',
      description: '全国大会で優勝する',
      category: 'special',
      isUnlocked: false,
      progress: 0,
      maxProgress: 1,
      reward: '究極の称号',
      rarity: 'legendary'
    }
  ];

  const categories = [
    { id: 'all', label: 'すべて', icon: Award },
    { id: 'training', label: '練習', icon: Target },
    { id: 'match', label: '試合', icon: Trophy },
    { id: 'team', label: 'チーム', icon: Users },
    { id: 'special', label: '特別', icon: Star }
  ];

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50';
      case 'rare': return 'border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const getRarityStars = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 5;
      case 'rare': return 3;
      default: return 1;
    }
  };

  const getProgressPercentage = (progress: number, max: number) => {
    return Math.min((progress / max) * 100, 100);
  };

  return (
    <GameLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-display">
              実績
            </h1>
            <p className="text-gray-600 mt-2">
              あなたの監督としての成果を確認しましょう
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">達成済み</div>
              <div className="text-2xl font-bold text-green-600">
                {achievements.filter(a => a.isUnlocked).length}/{achievements.length}
              </div>
            </div>
          </div>
        </div>

        {/* カテゴリータブ */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={16} />
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 実績リスト */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              className={`p-6 rounded-xl border-2 ${getRarityColor(achievement.rarity)} ${
                achievement.isUnlocked ? '' : 'opacity-75'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${
                  achievement.isUnlocked 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {achievement.isUnlocked ? (
                    <Award size={24} />
                  ) : (
                    <Lock size={24} />
                  )}
                </div>
                
                <div className="flex">
                  {Array.from({ length: getRarityStars(achievement.rarity) }).map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      className={`${
                        achievement.rarity === 'legendary' ? 'text-yellow-500' :
                        achievement.rarity === 'rare' ? 'text-purple-500' :
                        'text-gray-400'
                      } fill-current`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-gray-900">{achievement.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                </div>

                {/* 進行度バー */}
                {!achievement.isUnlocked && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">進行度</span>
                      <span className="font-medium">
                        {achievement.progress}/{achievement.maxProgress}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${getProgressPercentage(achievement.progress, achievement.maxProgress)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* 報酬 */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">報酬</div>
                  <div className="font-medium text-sm text-gray-900">{achievement.reward}</div>
                </div>

                {achievement.isUnlocked && (
                  <div className="flex items-center space-x-2 text-green-600 text-sm font-medium">
                    <Star size={16} className="fill-current" />
                    <span>達成済み</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* 統計情報 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">統計情報</h2>
          
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {achievements.filter(a => a.isUnlocked).length}
              </div>
              <div className="text-sm text-gray-600">達成済み実績</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {achievements.filter(a => a.rarity === 'rare' && a.isUnlocked).length}
              </div>
              <div className="text-sm text-gray-600">レア実績</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {achievements.filter(a => a.rarity === 'legendary' && a.isUnlocked).length}
              </div>
              <div className="text-sm text-gray-600">レジェンド実績</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round((achievements.filter(a => a.isUnlocked).length / achievements.length) * 100)}%
              </div>
              <div className="text-sm text-gray-600">完成率</div>
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}