'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Shield, 
  Brain, 
  Dumbbell, 
  Target, 
  Star, 
  Crown,
  Sparkles,
  TrendingUp,
  Award,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ModernCard, ModernButton } from '@/components/ui/modern';
import { SpecialAbility, SpecialAbilitiesSystem } from '@/lib/special-abilities-system';

interface SpecialAbilitiesDisplayProps {
  playerId: string;
  playerAbilities: string[];
  pokemonType: string[];
  onAbilitySelect?: (ability: SpecialAbility) => void;
}

export function SpecialAbilitiesDisplay({ 
  playerId, 
  playerAbilities, 
  pokemonType,
  onAbilitySelect 
}: SpecialAbilitiesDisplayProps) {
  const [abilities, setAbilities] = useState<SpecialAbility[]>([]);
  const [expandedAbility, setExpandedAbility] = useState<string | null>(null);
  const [newAbilityAnimation, setNewAbilityAnimation] = useState<string | null>(null);
  const [combinations, setCombinations] = useState<{ name: string; effect: string }[]>([]);
  
  const abilitiesSystem = SpecialAbilitiesSystem.getInstance();

  useEffect(() => {
    // プレイヤーの特能を取得（実際の実装では、データベースから取得）
    const mockAbilities: SpecialAbility[] = [
      {
        id: 'power_serve',
        name: 'パワーサーブ',
        description: 'サーブの威力が大幅にアップ。エースを取りやすくなる',
        type: 'offensive',
        rarity: 'rare',
        effects: [
          { stat: 'serve_power', modifier: 15, description: 'サーブ威力+15' },
          { stat: 'ace_probability', modifier: 25, description: 'エース確率+25%' }
        ],
        acquisitionConditions: [],
        pokemonTypeBonus: ['fighting', 'steel']
      },
      {
        id: 'lightning_reflex',
        name: '電光石火',
        description: '相手の強打に対する反応が異常に早い',
        type: 'defensive',
        rarity: 'super_rare',
        effects: [
          { stat: 'reaction_speed', modifier: 25, description: '反応速度+25' },
          { stat: 'counter_attack', modifier: 40, description: 'カウンター成功率+40%' }
        ],
        acquisitionConditions: [],
        pokemonTypeBonus: ['electric', 'flying']
      }
    ];

    setAbilities(mockAbilities);

    // 組み合わせ効果をチェック
    const combos = abilitiesSystem.checkAbilityCombination(playerAbilities);
    setCombinations(combos);
  }, [playerAbilities]);

  const getTypeIcon = (type: SpecialAbility['type']) => {
    switch (type) {
      case 'offensive': return Zap;
      case 'defensive': return Shield;
      case 'mental': return Brain;
      case 'physical': return Dumbbell;
      case 'tactical': return Target;
      default: return Star;
    }
  };

  const getTypeColor = (type: SpecialAbility['type']) => {
    switch (type) {
      case 'offensive': return 'from-red-500 to-orange-500';
      case 'defensive': return 'from-blue-500 to-cyan-500';
      case 'mental': return 'from-purple-500 to-pink-500';
      case 'physical': return 'from-green-500 to-teal-500';
      case 'tactical': return 'from-indigo-500 to-purple-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRarityColor = (rarity: SpecialAbility['rarity']) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-50';
      case 'super_rare': return 'border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50';
      case 'rare': return 'border-blue-400 bg-gradient-to-r from-blue-50 to-cyan-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const getRarityStars = (rarity: SpecialAbility['rarity']) => {
    switch (rarity) {
      case 'legendary': return 5;
      case 'super_rare': return 4;
      case 'rare': return 3;
      case 'uncommon': return 2;
      default: return 1;
    }
  };

  const hasTypeBonus = (ability: SpecialAbility) => {
    return ability.pokemonTypeBonus?.some(type => pokemonType.includes(type)) || false;
  };

  const handleAbilityClick = (ability: SpecialAbility) => {
    setExpandedAbility(expandedAbility === ability.id ? null : ability.id);
    onAbilitySelect?.(ability);
  };

  const simulateNewAbilityAcquisition = (abilityId: string) => {
    setNewAbilityAnimation(abilityId);
    setTimeout(() => setNewAbilityAnimation(null), 3000);
  };

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Sparkles className="text-purple-500" />
          特能一覧
        </h3>
        <div className="text-sm text-gray-600">
          {abilities.length}個の特能を習得
        </div>
      </div>

      {/* 組み合わせ効果 */}
      {combinations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-300 rounded-xl p-4"
        >
          <h4 className="font-bold text-amber-800 flex items-center gap-2 mb-2">
            <Crown className="text-yellow-600" size={20} />
            🌟 特能組み合わせ効果発動中！
          </h4>
          <div className="space-y-2">
            {combinations.map((combo, index) => (
              <div key={index} className="bg-white bg-opacity-50 rounded-lg p-2">
                <div className="font-semibold text-amber-900">{combo.name}</div>
                <div className="text-sm text-amber-700">{combo.effect}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 特能リスト */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {abilities.map((ability, index) => (
          <ModernCard
            key={ability.id}
            variant="pokemon"
            pokemonType={ability.type === 'offensive' ? 'fire' : ability.type === 'defensive' ? 'water' : ability.type === 'mental' ? 'psychic' : ability.type === 'physical' ? 'fighting' : 'steel'}
            className="cursor-pointer"
            hover={true}
            glowEffect={hasTypeBonus(ability)}
            onClick={() => handleAbilityClick(ability)}
          >
            {/* 新特能習得アニメーション */}
            <AnimatePresence>
              {newAbilityAnimation === ability.id && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl opacity-80 flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0.8, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-white font-bold text-lg">🎉 新特能習得！</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ヘッダー */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${getTypeColor(ability.type)} text-white`}>
                  {React.createElement(getTypeIcon(ability.type), { size: 20 })}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 flex items-center gap-2">
                    {ability.name}
                    {hasTypeBonus(ability) && (
                      <motion.div
                        className="bg-green-500 text-white text-xs px-2 py-1 rounded-full"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        タイプボーナス！
                      </motion.div>
                    )}
                  </h4>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: getRarityStars(ability.rarity) }).map((_, i) => (
                      <Star key={i} size={12} className="text-yellow-500 fill-current" />
                    ))}
                    <span className="text-xs text-gray-600 ml-1 capitalize">
                      {ability.rarity.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <motion.div
                animate={{ rotate: expandedAbility === ability.id ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={20} className="text-gray-500" />
              </motion.div>
            </div>

            {/* 基本説明 */}
            <p className="text-gray-700 text-sm mb-3">{ability.description}</p>

            {/* 効果一覧 */}
            <div className="grid grid-cols-1 gap-2 mb-3">
              {ability.effects.slice(0, 2).map((effect, i) => (
                <div key={i} className="flex items-center justify-between bg-white bg-opacity-50 rounded-lg p-2">
                  <span className="text-sm font-medium text-gray-700">{effect.description}</span>
                  <div className="flex items-center gap-1">
                    <TrendingUp size={14} className="text-green-500" />
                    <span className="text-sm font-bold text-green-600">
                      {effect.modifier > 0 ? '+' : ''}{effect.modifier}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* 展開部分 */}
            <AnimatePresence>
              {expandedAbility === ability.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-200 pt-3"
                >
                  {/* 残りの効果 */}
                  {ability.effects.slice(2).map((effect, i) => (
                    <div key={i} className="flex items-center justify-between bg-white bg-opacity-50 rounded-lg p-2 mb-2">
                      <span className="text-sm font-medium text-gray-700">{effect.description}</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp size={14} className="text-green-500" />
                        <span className="text-sm font-bold text-green-600">
                          {effect.modifier > 0 ? '+' : ''}{effect.modifier}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* ポケモンタイプボーナス */}
                  {ability.pokemonTypeBonus && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                      <div className="text-sm font-semibold text-blue-800 mb-1">
                        🎯 タイプボーナス対象
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {ability.pokemonTypeBonus.map((type, i) => (
                          <span 
                            key={i} 
                            className={`text-xs px-2 py-1 rounded-full ${pokemonType.includes(type) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 習得条件 */}
                  {ability.acquisitionConditions.length > 0 && (
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="text-sm font-semibold text-purple-800 mb-2">
                        📋 習得条件
                      </div>
                      <div className="space-y-1">
                        {ability.acquisitionConditions.map((condition, i) => (
                          <div key={i} className="text-xs text-purple-700">
                            • {condition.requirement} (確率: {(condition.probability * 100).toFixed(1)}%)
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </ModernCard>
        ))}
      </div>

      {/* 特能習得のヒント */}
      <motion.div
        className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h4 className="font-bold text-indigo-800 flex items-center gap-2 mb-2">
          <Eye className="text-indigo-600" size={20} />
          💡 特能習得のコツ
        </h4>
        <div className="text-sm text-indigo-700 space-y-1">
          <p>• 試合での特定の行動を達成すると新しい特能を習得できます</p>
          <p>• ポケモンのタイプに合った特能は習得しやすくなります</p>
          <p>• 複数の特能を組み合わせると強力な効果が発動します</p>
          <p>• 選手の性格によって習得しやすい特能が変わります</p>
        </div>
      </motion.div>

      {/* デバッグ用ボタン（開発時のみ） */}
      {process.env.NODE_ENV === 'development' && (
        <ModernButton
          onClick={() => simulateNewAbilityAcquisition('power_serve')}
          variant="pokemon"
          pokemonType="electric"
          className="w-full"
          icon={<span>🎭</span>}
        >
          新特能習得をシミュレート（開発用）
        </ModernButton>
      )}
    </div>
  );
}