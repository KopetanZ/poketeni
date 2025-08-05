'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card,
  Zap, 
  Cloud, 
  Sun, 
  CloudRain,
  TrendingUp,
  AlertTriangle,
  Heart,
  Star,
  Sparkles,
  Target,
  Eye,
  Info,
  RotateCcw,
  Shuffle
} from 'lucide-react';
import { ModernCard, ModernButton } from '@/components/ui/modern';
import { EnhancedCard, EnhancedCardSystem, CardCombo } from '@/lib/enhanced-card-system';

interface EnhancedCardSelectorProps {
  availableCards: EnhancedCard[];
  selectedCards: string[];
  onCardSelect: (cardId: string) => void;
  onCardDeselect: (cardId: string) => void;
  playerPersonality: string;
  schoolReputation: string;
  weather: 'sunny' | 'rainy' | 'cloudy';
  season: string;
  maxSelection: number;
}

export function EnhancedCardSelector({
  availableCards,
  selectedCards,
  onCardSelect,
  onCardDeselect,
  playerPersonality,
  schoolReputation,
  weather,
  season,
  maxSelection = 3
}: EnhancedCardSelectorProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showEfficiencyDetails, setShowEfficiencyDetails] = useState<string | null>(null);
  const [activeCombo, setActiveCombo] = useState<CardCombo[]>([]);
  const [weatherDescription, setWeatherDescription] = useState<string>('');
  const [sortBy, setSortBy] = useState<'efficiency' | 'rarity' | 'type'>('efficiency');

  const cardSystem = EnhancedCardSystem.getInstance();

  useEffect(() => {
    // 組み合わせ効果をチェック
    const combos = cardSystem.checkComboEffects(selectedCards);
    setActiveCombo(combos);

    // 天候説明
    const weatherDescriptions = {
      sunny: '☀️ 晴れ - 屋外練習が効果的',
      rainy: '🌧️ 雨 - 室内練習に集中',
      cloudy: '☁️ 曇り - バランスの良いコンディション'
    };
    setWeatherDescription(weatherDescriptions[weather]);
  }, [selectedCards, weather]);

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'sunny': return Sun;
      case 'rainy': return CloudRain;
      case 'cloudy': return Cloud;
      default: return Cloud;
    }
  };

  const calculateCardEfficiency = (card: EnhancedCard): number => {
    return cardSystem.calculateCardEfficiency(
      card,
      weather,
      playerPersonality,
      schoolReputation,
      season,
      selectedCards
    );
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-100';
      case 'super_rare': return 'border-purple-400 bg-gradient-to-br from-purple-50 to-pink-100';
      case 'rare': return 'border-blue-400 bg-gradient-to-br from-blue-50 to-cyan-100';
      case 'uncommon': return 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-100';
      default: return 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100';
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 2.0) return 'text-purple-600 bg-purple-100';
    if (efficiency >= 1.5) return 'text-blue-600 bg-blue-100';
    if (efficiency >= 1.2) return 'text-green-600 bg-green-100';
    if (efficiency >= 1.0) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const sortedCards = [...availableCards].sort((a, b) => {
    switch (sortBy) {
      case 'efficiency':
        return calculateCardEfficiency(b) - calculateCardEfficiency(a);
      case 'rarity':
        const rarityOrder = { legendary: 5, super_rare: 4, rare: 3, uncommon: 2, common: 1 };
        return (rarityOrder[b.rarityLevel as keyof typeof rarityOrder] || 0) - 
               (rarityOrder[a.rarityLevel as keyof typeof rarityOrder] || 0);
      case 'type':
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });

  const handleCardClick = (card: EnhancedCard) => {
    if (selectedCards.includes(card.id)) {
      onCardDeselect(card.id);
    } else if (selectedCards.length < maxSelection) {
      onCardSelect(card.id);
    }
  };

  const generateRandomSelection = () => {
    // 効率の良いカードを優先してランダム選択
    const shuffled = [...sortedCards].sort(() => Math.random() - 0.5);
    const newSelection = shuffled.slice(0, maxSelection).map(card => card.id);
    
    // 現在の選択をクリア
    selectedCards.forEach(cardId => onCardDeselect(cardId));
    
    // 新しい選択を適用
    newSelection.forEach(cardId => onCardSelect(cardId));
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Card className="text-indigo-500" />
            カード選択 ({selectedCards.length}/{maxSelection})
          </h3>
          <div className="flex items-center gap-2 mt-1">
            {React.createElement(getWeatherIcon(weather), { size: 16, className: "text-blue-500" })}
            <span className="text-sm text-gray-600">{weatherDescription}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="efficiency">効率順</option>
            <option value="rarity">レア度順</option>
            <option value="type">タイプ順</option>
          </select>

          <ModernButton
            onClick={generateRandomSelection}
            variant="pokemon"
            pokemonType="psychic"
            size="sm"
            icon={<Shuffle size={16} />}
          >
            おまかせ
          </ModernButton>
        </div>
      </div>

      {/* アクティブな組み合わせ効果 */}
      <AnimatePresence>
        {activeCombo.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-xl p-4"
          >
            <h4 className="font-bold text-orange-800 flex items-center gap-2 mb-3">
              <Sparkles className="text-yellow-600" />
              🎉 組み合わせ効果発動！
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeCombo.map((combo, index) => (
                <motion.div
                  key={index}
                  className="bg-white bg-opacity-70 rounded-lg p-3"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="font-semibold text-orange-900 mb-1">{combo.comboName}</div>
                  <div className="text-sm text-orange-700 mb-2">{combo.description}</div>
                  <div className="space-y-1">
                    {combo.bonusEffects.map((effect, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span>{effect.description}</span>
                        <span className="font-bold text-green-600">×{effect.multiplier}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* カードグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedCards.map((card, index) => {
          const efficiency = calculateCardEfficiency(card);
          const isSelected = selectedCards.includes(card.id);
          const canSelect = selectedCards.length < maxSelection || isSelected;

          return (
            <ModernCard
              key={card.id}
              variant="pokemon"
              pokemonType={card.type === 'training' ? 'fighting' : card.type === 'recovery' ? 'normal' : 'psychic'}
              className={`
                relative cursor-pointer transition-all duration-300
                ${isSelected ? 'ring-4 ring-indigo-300 scale-105' : ''}
                ${!canSelect ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              hover={canSelect}
              glowEffect={isSelected}
              onClick={() => canSelect && handleCardClick(card)}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* 選択インジケーター */}
              {isSelected && (
                <motion.div
                  className="absolute -top-2 -right-2 bg-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  ✓
                </motion.div>
              )}

              {/* カードヘッダー */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">{card.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getEfficiencyColor(efficiency)}`}>
                      効率 {efficiency.toFixed(1)}x
                    </span>
                    <div className="flex">
                      {Array.from({ length: card.rarityLevel === 'legendary' ? 5 : card.rarityLevel === 'super_rare' ? 4 : card.rarityLevel === 'rare' ? 3 : 2 }).map((_, i) => (
                        <Star key={i} size={12} className="text-yellow-500 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-600">コスト</div>
                  <div className="text-lg font-bold text-indigo-600">{card.cost}</div>
                </div>
              </div>

              {/* カード説明 */}
              <p className="text-gray-700 text-sm mb-3 min-h-[2.5rem]">{card.description}</p>

              {/* 効果一覧 */}
              <div className="space-y-2 mb-3">
                {card.effects.slice(0, 2).map((effect, i) => (
                  <div key={i} className="flex items-center justify-between bg-white bg-opacity-50 rounded-lg p-2">
                    <span className="text-sm text-gray-700">{effect.type}</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp size={12} className={effect.value > 0 ? "text-green-500" : "text-red-500"} />
                      <span className={`text-sm font-bold ${effect.value > 0 ? "text-green-600" : "text-red-600"}`}>
                        {effect.value > 0 ? '+' : ''}{effect.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* 特殊効果インジケーター */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* 天候ボーナス */}
                  {card.weatherDependency && card.weatherDependency[weather] > 1.0 && (
                    <div className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs flex items-center gap-1">
                      {React.createElement(getWeatherIcon(weather), { size: 12 })}
                      +{((card.weatherDependency[weather] - 1) * 100).toFixed(0)}%
                    </div>
                  )}

                  {/* 怪我リスク */}
                  {card.injuryRisk > 0 && (
                    <div className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs flex items-center gap-1">
                      <AlertTriangle size={12} />
                      {card.injuryRisk}%
                    </div>
                  )}

                  {/* 士気効果 */}
                  {card.teamMoraleImpact !== 0 && (
                    <div className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                      card.teamMoraleImpact > 0 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      <Heart size={12} />
                      {card.teamMoraleImpact > 0 ? '+' : ''}{card.teamMoraleImpact}
                    </div>
                  )}
                </div>

                <motion.button
                  className="text-gray-500 hover:text-indigo-500"
                  whileHover={{ scale: 1.1 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEfficiencyDetails(showEfficiencyDetails === card.id ? null : card.id);
                  }}
                >
                  <Info size={16} />
                </motion.button>
              </div>

              {/* 効率詳細 */}
              <AnimatePresence>
                {showEfficiencyDetails === card.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 p-3 bg-white bg-opacity-70 rounded-lg border"
                  >
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>基本効率:</span>
                        <span>{card.practiceEfficiency}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span>経験値倍率:</span>
                        <span>{card.experienceMultiplier}x</span>
                      </div>
                      {card.weatherDependency && (
                        <div className="flex justify-between">
                          <span>天候効果:</span>
                          <span>{card.weatherDependency[weather]}x</span>
                        </div>
                      )}
                      <div className="border-t pt-1 flex justify-between font-semibold">
                        <span>総合効率:</span>
                        <span className={getEfficiencyColor(efficiency).split(' ')[0]}>{efficiency.toFixed(2)}x</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ホバー時の詳細情報 */}
              <AnimatePresence>
                {hoveredCard === card.id && (
                  <motion.div
                    className="absolute inset-0 bg-black bg-opacity-90 text-white p-4 rounded-xl flex flex-col justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ zIndex: 10 }}
                  >
                    <div className="text-center">
                      <h5 className="font-bold mb-2">{card.name}</h5>
                      <p className="text-sm mb-3">{card.description}</p>
                      
                      {card.comboEffects.length > 0 && (
                        <div className="text-xs">
                          <div className="font-semibold mb-1">組み合わせ効果:</div>
                          {card.comboEffects.map((combo, i) => (
                            <div key={i} className="mb-1">
                              <div className="font-medium">{combo.comboName}</div>
                              <div className="text-gray-300">{combo.description}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </ModernCard>
          );
        })}
      </div>

      {/* 選択完了ガイド */}
      {selectedCards.length === maxSelection && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl p-4 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Target className="text-green-200" size={24} />
            <span className="text-lg font-bold">カード選択完了！</span>
          </div>
          <p className="text-green-100">
            選択したカードで月次進行を開始できます。組み合わせ効果も確認済みです！
          </p>
        </motion.div>
      )}
    </div>
  );
}