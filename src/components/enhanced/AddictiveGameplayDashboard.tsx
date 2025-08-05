'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Flame, 
  Star, 
  Clock, 
  TrendingUp, 
  Award, 
  Gift,
  Target,
  Zap,
  Crown,
  Calendar,
  Users
} from 'lucide-react';
import { ModernCard, ModernButton } from '@/components/ui/modern';
import { AddictionSystem, AddictionSystemData, ContinuousPlayBonus } from '@/lib/addiction-system';
import { EngagementAnalyzer } from '@/lib/addiction-system';

interface AddictiveGameplayDashboardProps {
  playerData: any;
  onContinuePlay: () => void;
}

export function AddictiveGameplayDashboard({ playerData, onContinuePlay }: AddictiveGameplayDashboardProps) {
  const [addictionData, setAddictionData] = useState<AddictionSystemData>({
    consecutivePlayDays: 5,
    totalPlayTime: 45.5,
    achievementStreak: 3,
    lastLoginDate: new Date().toISOString(),
    milestoneRewards: ['熱血監督の称号'],
    personalBestRecords: [
      {
        category: 'win_streak',
        value: 12,
        achievedDate: '2025-01-05',
        description: '連勝記録12勝達成！'
      }
    ]
  });

  const [bonuses, setBonuses] = useState<ContinuousPlayBonus[]>([]);
  const [justOneMoreElements, setJustOneMoreElements] = useState<string[]>([]);
  const [showBonusAnimation, setShowBonusAnimation] = useState(false);
  const [engagementLevel, setEngagementLevel] = useState<'low' | 'medium' | 'high' | 'super'>('medium');

  const addictionSystem = AddictionSystem.getInstance();

  useEffect(() => {
    // 連続プレイボーナス計算
    const currentBonuses = addictionSystem.calculateContinuousPlayBonus(addictionData.consecutivePlayDays);
    setBonuses(currentBonuses);

    // 「もうちょっと」要素生成
    const oneMoreElements = addictionSystem.generateJustOneMoreElements();
    setJustOneMoreElements(oneMoreElements.slice(0, 3));

    // エンゲージメントレベル分析
    const level = EngagementAnalyzer.analyzeEngagementLevel(addictionData);
    setEngagementLevel(level);

    // ボーナスアニメーション
    if (currentBonuses.length > 0) {
      setShowBonusAnimation(true);
      setTimeout(() => setShowBonusAnimation(false), 3000);
    }
  }, [addictionData]);

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'super': return 'from-purple-500 to-pink-500';
      case 'high': return 'from-green-500 to-blue-500';
      case 'medium': return 'from-yellow-500 to-orange-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getEngagementIcon = (level: string) => {
    switch (level) {
      case 'super': return Crown;
      case 'high': return Trophy;
      case 'medium': return Star;
      default: return Target;
    }
  };

  return (
    <ModernCard variant="gradient" padding="lg" className="shadow-2xl">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Flame className="text-orange-500" />
            継続プレイ状況
          </h2>
          <p className="text-gray-600">あなたの熱い情熱を数値化！</p>
        </div>
        <motion.div
          className={`px-4 py-2 rounded-full bg-gradient-to-r ${getEngagementColor(engagementLevel)} text-white font-bold flex items-center gap-2`}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {React.createElement(getEngagementIcon(engagementLevel), { size: 20 })}
          {engagementLevel.toUpperCase()} PLAYER
        </motion.div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          className="bg-gradient-to-r from-orange-400 to-red-500 rounded-xl p-4 text-white"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">連続プレイ</p>
              <p className="text-2xl font-bold">{addictionData.consecutivePlayDays}日</p>
            </div>
            <Calendar className="text-orange-200" size={32} />
          </div>
          <div className="mt-2">
            <div className="bg-orange-300 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${Math.min((addictionData.consecutivePlayDays / 30) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-orange-100 mt-1">30日で最大ボーナス！</p>
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl p-4 text-white"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">総プレイ時間</p>
              <p className="text-2xl font-bold">{addictionData.totalPlayTime}h</p>
            </div>
            <Clock className="text-blue-200" size={32} />
          </div>
          <p className="text-xs text-blue-100 mt-2">次のマイルストーンまで{50 - addictionData.totalPlayTime}時間</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-r from-green-400 to-teal-500 rounded-xl p-4 text-white"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">達成連続記録</p>
              <p className="text-2xl font-bold">{addictionData.achievementStreak}</p>
            </div>
            <TrendingUp className="text-green-200" size={32} />
          </div>
          <p className="text-xs text-green-100 mt-2">連続達成でボーナス倍率アップ！</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-4 text-white"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">個人ベスト</p>
              <p className="text-2xl font-bold">{addictionData.personalBestRecords[0]?.value || 0}</p>
            </div>
            <Award className="text-yellow-200" size={32} />
          </div>
          <p className="text-xs text-yellow-100 mt-2">{addictionData.personalBestRecords[0]?.description || '記録なし'}</p>
        </motion.div>
      </div>

      {/* アクティブボーナス */}
      <AnimatePresence>
        {bonuses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 mb-6 text-white overflow-hidden relative"
          >
            <motion.div
              className="absolute inset-0 bg-white opacity-20"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            
            <div className="relative z-10">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
                <Gift className="text-yellow-300" />
                🎉 アクティブボーナス！
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {bonuses.map((bonus, index) => (
                  <motion.div
                    key={index}
                    className="bg-white bg-opacity-20 rounded-lg p-3"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="text-yellow-300" size={16} />
                      <span className="font-semibold">{bonus.multiplier}x</span>
                    </div>
                    <p className="text-sm">{bonus.description}</p>
                    <p className="text-xs text-purple-200">残り{bonus.duration}ヶ月有効</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 「もうちょっと」要素 */}
      <div className="bg-white rounded-xl p-4 mb-6 border-2 border-dashed border-indigo-200">
        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Target className="text-indigo-500" />
          あとちょっとで...！
        </h3>
        <div className="space-y-2">
          {justOneMoreElements.map((element, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-3 p-2 bg-indigo-50 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              <span className="text-gray-700">{element}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 行動促進ボタン */}
      <div className="flex flex-col sm:flex-row gap-3">
        <ModernButton
          onClick={onContinuePlay}
          variant="pokemon"
          pokemonType="electric"
          size="lg"
          className="flex-1"
          icon={<Users size={20} />}
        >
          続けてプレイする
          <motion.div
            className="ml-2"
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            →
          </motion.div>
        </ModernButton>

        <ModernButton
          variant="secondary"
          size="lg"
          icon={<Clock size={20} />}
        >
          後で続きから
        </ModernButton>
      </div>

      {/* 復帰誘導メッセージ */}
      <motion.div
        className="mt-4 p-3 bg-gradient-to-r from-amber-100 to-orange-100 border-l-4 border-amber-500 rounded-r-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-amber-800 text-sm">
          💡 <strong>監督からのメッセージ:</strong> {addictionSystem.generateRetentionMessage(addictionData)}
        </p>
      </motion.div>
    </ModernCard>
  );
}