'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, Plus, RotateCcw } from 'lucide-react';
import { TrainingCard } from './TrainingCard';
import type { TrainingCard as TrainingCardType, CardHand as CardHandType } from '@/types/card-system';

interface CardHandProps {
  hand: CardHandType;
  onCardSelect: (card: TrainingCardType) => void;
  onDrawCards?: () => void;
  onShuffleHand?: () => void;
  selectedCard?: TrainingCardType | null;
  disabled?: boolean;
  compact?: boolean;
}

export function CardHand({ 
  hand, 
  onCardSelect, 
  onDrawCards, 
  onShuffleHand, 
  selectedCard, 
  disabled = false,
  compact = false 
}: CardHandProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleCardSelect = (card: TrainingCardType) => {
    if (!disabled) {
      onCardSelect(card);
    }
  };

  const getHandSpread = () => {
    const cardCount = hand.cards.length;
    if (cardCount <= 1) return [];
    
    const maxRotation = Math.min(cardCount * 3, 15); // 最大15度
    const step = (maxRotation * 2) / (cardCount - 1);
    
    return hand.cards.map((_, index) => ({
      rotation: -maxRotation + (step * index),
      translateY: Math.abs(-maxRotation + (step * index)) * 0.5,
      zIndex: index
    }));
  };

  const spreadPositions = getHandSpread();

  if (compact) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-gray-900">手札</h3>
            <span className="text-xs text-gray-500">
              {hand.cards.length}/{hand.maxCards}
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            {onDrawCards && (
              <button
                onClick={onDrawCards}
                disabled={disabled || hand.cards.length >= hand.maxCards}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="カードを引く"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
            
            {onShuffleHand && (
              <button
                onClick={onShuffleHand}
                disabled={disabled}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="手札をシャッフル"
              >
                <Shuffle className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-2">
          <AnimatePresence>
            {hand.cards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0"
              >
                <TrainingCard
                  card={card}
                  onSelect={handleCardSelect}
                  selected={selectedCard?.id === card.id}
                  disabled={disabled}
                  compact={true}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {hand.drawPileSize > 0 && (
          <div className="mt-2 text-xs text-gray-500 text-center">
            山札残り: {hand.drawPileSize}枚
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 手札背景 */}
      <div className="bg-gradient-to-t from-green-800 to-green-600 rounded-2xl p-6 shadow-2xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-white font-display">手札</h2>
            <div className="bg-white/20 rounded-full px-3 py-1">
              <span className="text-white text-sm font-medium">
                {hand.cards.length}/{hand.maxCards}
              </span>
            </div>
          </div>
          
          {/* 操作ボタン */}
          <div className="flex items-center space-x-2">
            {onDrawCards && (
              <motion.button
                onClick={onDrawCards}
                disabled={disabled || hand.cards.length >= hand.maxCards}
                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm">カードを引く</span>
              </motion.button>
            )}
            
            {onShuffleHand && (
              <motion.button
                onClick={onShuffleHand}
                disabled={disabled}
                className="flex items-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Shuffle className="h-4 w-4" />
                <span className="text-sm">シャッフル</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* カード表示エリア */}
        <div className="relative min-h-[280px] flex items-end justify-center">
          {hand.cards.length === 0 ? (
            <div className="text-center text-white/70">
              <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="h-8 w-8" />
              </div>
              <p className="text-lg">手札がありません</p>
              <p className="text-sm mt-1">カードを引いてください</p>
            </div>
          ) : (
            <div className="relative w-full flex justify-center">
              <AnimatePresence>
                {hand.cards.map((card, index) => {
                  const position = spreadPositions[index];
                  const isHovered = hoveredCard === card.id;
                  const isSelected = selectedCard?.id === card.id;
                  
                  return (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, y: 100, rotate: position?.rotation || 0 }}
                      animate={{ 
                        opacity: 1, 
                        y: isHovered || isSelected ? -20 : (position?.translateY || 0),
                        rotate: isHovered || isSelected ? 0 : (position?.rotation || 0),
                        x: (index - (hand.cards.length - 1) / 2) * (isHovered ? 0 : 40),
                        zIndex: isHovered || isSelected ? 100 : position?.zIndex || index
                      }}
                      exit={{ opacity: 0, y: 100 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 30,
                        delay: index * 0.1 
                      }}
                      className="absolute"
                      style={{ 
                        transformOrigin: 'bottom center',
                      }}
                      onHoverStart={() => setHoveredCard(card.id)}
                      onHoverEnd={() => setHoveredCard(null)}
                    >
                      <TrainingCard
                        card={card}
                        onSelect={handleCardSelect}
                        selected={selectedCard?.id === card.id}
                        disabled={disabled}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* フッター情報 */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/20">
          <div className="flex items-center space-x-4 text-white/80 text-sm">
            {hand.drawPileSize > 0 && (
              <div className="flex items-center space-x-2">
                <div className="w-6 h-8 bg-white/20 rounded border-2 border-white/40"></div>
                <span>山札: {hand.drawPileSize}枚</span>
              </div>
            )}
            
            {selectedCard && (
              <div className="flex items-center space-x-2 bg-white/20 rounded-full px-3 py-1">
                <div className="w-2 h-2 bg-poke-blue-400 rounded-full animate-pulse"></div>
                <span>選択中: {selectedCard.name}</span>
              </div>
            )}
          </div>
          
          <div className="text-white/60 text-xs">
            カードを選択して進行してください
          </div>
        </div>
      </div>

      {/* 選択されたカードのハイライト効果 */}
      {selectedCard && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-full h-full bg-poke-blue-400 rounded-2xl" style={{ opacity: 0.1 }} />
        </motion.div>
      )}
    </div>
  );
}