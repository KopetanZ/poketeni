'use client';

import { motion } from 'framer-motion';
import { Zap, Users, Heart, Activity, Target, Shield } from 'lucide-react';
import type { TrainingCard as TrainingCardType } from '@/types/card-system';

interface TrainingCardProps {
  card: TrainingCardType;
  onSelect?: (card: TrainingCardType) => void;
  selected?: boolean;
  disabled?: boolean;
  compact?: boolean;
}

export function TrainingCard({ card, onSelect, selected = false, disabled = false, compact = false }: TrainingCardProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 border-gray-300';
      case 'uncommon':
        return 'bg-green-100 border-green-400';
      case 'rare':
        return 'bg-blue-100 border-blue-400';
      case 'legendary':
        return 'bg-purple-100 border-purple-400';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'uncommon':
        return 'shadow-green-200';
      case 'rare':
        return 'shadow-blue-200';
      case 'legendary':
        return 'shadow-purple-200';
      default:
        return 'shadow-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'training':
        return <Target className="h-4 w-4" />;
      case 'special':
        return <Heart className="h-4 w-4" />;
      case 'event':
        return <Users className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatIcon = (stat: string) => {
    switch (stat) {
      case 'serve':
        return <Zap className="h-3 w-3 text-orange-500" />;
      case 'return':
        return <Shield className="h-3 w-3 text-blue-500" />;
      case 'volley':
        return <Target className="h-3 w-3 text-green-500" />;
      case 'stroke':
        return <Activity className="h-3 w-3 text-purple-500" />;
      case 'mental':
        return <Heart className="h-3 w-3 text-pink-500" />;
      case 'stamina':
        return <Activity className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  const handleClick = () => {
    if (!disabled && onSelect) {
      onSelect(card);
    }
  };

  if (compact) {
    return (
      <motion.div
        className={`
          relative cursor-pointer transition-all duration-200 rounded-lg border-2 p-2
          ${getRarityColor(card.rarity)} ${getRarityGlow(card.rarity)}
          ${selected ? 'ring-4 ring-poke-blue-300 transform scale-105' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:scale-102'}
        `}
        onClick={handleClick}
        whileHover={!disabled ? { y: -2 } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
        style={{ minHeight: '80px', minWidth: '60px' }}
      >
        {/* カード番号 */}
        <div className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
          {card.number}
        </div>

        {/* タイプアイコン */}
        <div className="absolute top-1 right-1 text-gray-600">
          {getTypeIcon(card.type)}
        </div>

        {/* カード名（縦書き風） */}
        <div className="mt-6 text-center">
          <div className="text-xs font-medium text-gray-800 leading-tight break-all">
            {card.name}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`
        relative cursor-pointer transition-all duration-300 rounded-xl border-2 overflow-hidden
        ${getRarityColor(card.rarity)} ${getRarityGlow(card.rarity)}
        ${selected ? 'ring-4 ring-poke-blue-400 transform scale-105 shadow-xl' : 'shadow-md'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:scale-102'}
      `}
      onClick={handleClick}
      whileHover={!disabled ? { y: -4 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      style={{ width: '180px', height: '240px' }}
    >
      {/* カードヘッダー */}
      <div className="relative p-3 bg-gradient-to-r from-white/80 to-white/60">
        {/* カード番号 */}
        <div className="absolute top-2 left-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-lg font-bold shadow-md border-2 border-gray-300">
          {card.number}
        </div>

        {/* レア度表示 */}
        <div className="absolute top-2 right-2 flex">
          {Array.from({ length: card.rarity === 'legendary' ? 4 : card.rarity === 'rare' ? 3 : card.rarity === 'uncommon' ? 2 : 1 }).map((_, i) => (
            <div key={i} className="w-2 h-2 bg-yellow-400 rounded-full ml-0.5"></div>
          ))}
        </div>

        {/* タイプアイコンとラベル */}
        <div className="mt-8 flex items-center space-x-2">
          {getTypeIcon(card.type)}
          <span className="text-xs text-gray-600 uppercase tracking-wide">
            {card.type === 'training' ? '練習' : card.type === 'special' ? '特殊' : 'イベント'}
          </span>
        </div>
      </div>

      {/* カード名 */}
      <div className="px-3 py-2 bg-white/90">
        <h3 className="text-sm font-bold text-gray-900 text-center leading-tight">
          {card.name}
        </h3>
      </div>

      {/* 効果表示 */}
      <div className="flex-1 p-3 space-y-2">
        {/* 練習効果 */}
        {Object.entries(card.trainingEffects).some(([_, value]) => value && value > 0) && (
          <div className="space-y-1">
            <div className="text-xs text-gray-600 font-medium">練習効果</div>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(card.trainingEffects).map(([stat, value]) => 
                value && value > 0 ? (
                  <div key={stat} className="flex items-center space-x-1 text-xs">
                    {getStatIcon(stat)}
                    <span className="text-gray-700">+{value}</span>
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}

        {/* 特殊効果 */}
        {card.specialEffects && (
          <div className="space-y-1">
            <div className="text-xs text-gray-600 font-medium">特殊効果</div>
            <div className="space-y-1 text-xs text-gray-700">
              {card.specialEffects.conditionRecovery && (
                <div className="flex items-center space-x-1">
                  <Heart className="h-3 w-3 text-green-500" />
                  <span>体力+{card.specialEffects.conditionRecovery}</span>
                </div>
              )}
              {card.specialEffects.trustIncrease && (
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3 text-blue-500" />
                  <span>信頼+{card.specialEffects.trustIncrease}</span>
                </div>
              )}
              {card.specialEffects.teamMoraleBoost && (
                <div className="flex items-center space-x-1">
                  <Zap className="h-3 w-3 text-yellow-500" />
                  <span>士気UP</span>
                </div>
              )}
              {card.specialEffects.practiceEfficiencyBoost && (
                <div className="flex items-center space-x-1">
                  <Target className="h-3 w-3 text-purple-500" />
                  <span>効率+{card.specialEffects.practiceEfficiencyBoost}%</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* カード説明 */}
      <div className="px-3 py-2 bg-gray-50/80 border-t border-gray-200">
        <p className="text-xs text-gray-600 text-center leading-tight">
          {card.description}
        </p>
      </div>

      {/* 選択インジケーター */}
      {selected && (
        <motion.div
          className="absolute inset-0 border-4 border-poke-blue-400 rounded-xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* 発光エフェクト（レアカード用） */}
      {(card.rarity === 'rare' || card.rarity === 'legendary') && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className={`w-full h-full rounded-xl ${card.rarity === 'legendary' ? 'bg-purple-400' : 'bg-blue-400'}`} style={{ opacity: 0.1 }} />
        </motion.div>
      )}
    </motion.div>
  );
}