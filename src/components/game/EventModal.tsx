'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, TrendingUp, Heart, Zap } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

export interface EventResult {
  type: 'training' | 'rest' | 'event' | 'match' | 'special';
  title: string;
  description: string;
  effects: {
    statChanges?: Record<string, number>;
    fatigueChange?: number;
    motivationChange?: number;
    specialEffects?: string[];
  };
  pokemonAffected?: {
    id: number;
    name: string;
    sprite: string;
  }[];
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventResult: EventResult | null;
}

export function EventModal({ isOpen, onClose, eventResult }: EventModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!eventResult) return null;

  const handleNext = () => {
    if (eventResult.pokemonAffected && currentStep < eventResult.pokemonAffected.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
      setCurrentStep(0);
    }
  };

  const getEffectIcon = (stat: string) => {
    switch (stat) {
      case 'power': return '💪';
      case 'technique': return '🎯';
      case 'speed': return '⚡';
      case 'stamina': return '❤️';
      case 'mental': return '🧠';
      default: return '✨';
    }
  };

  const getEffectColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const currentPokemon = eventResult.pokemonAffected?.[currentStep];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* ヘッダー */}
            <div className="bg-gradient-to-r from-poke-blue-500 to-poke-blue-600 text-white p-6 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              
              <div className="text-center">
                <div className="text-3xl mb-2">
                  {eventResult.type === 'training' && '🏃‍♂️'}
                  {eventResult.type === 'rest' && '😴'}
                  {eventResult.type === 'event' && '✨'}
                  {eventResult.type === 'match' && '⚔️'}
                  {eventResult.type === 'special' && '🌟'}
                </div>
                <h2 className="text-xl font-bold font-display">{eventResult.title}</h2>
                <p className="text-blue-100 text-sm mt-1">{eventResult.description}</p>
              </div>
            </div>

            {/* コンテンツ */}
            <div className="p-6">
              {/* ポケモンが影響を受ける場合 */}
              {currentPokemon && (
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-center mb-6"
                >
                  <div className="flex items-center justify-center mb-4">
                    <Image
                      src={currentPokemon.sprite}
                      alt={currentPokemon.name}
                      width={80}
                      height={80}
                      className="animate-bounce"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 font-display">
                    {currentPokemon.name}
                  </h3>
                </motion.div>
              )}

              {/* 効果の詳細 */}
              <div className="space-y-4">
                {/* ステータス変化 */}
                {eventResult.effects.statChanges && Object.keys(eventResult.effects.statChanges).length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      能力値の変化
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(eventResult.effects.statChanges).map(([stat, value]) => (
                        <div key={stat} className="flex items-center justify-between">
                          <span className="text-sm flex items-center">
                            <span className="mr-1">{getEffectIcon(stat)}</span>
                            {stat === 'power' ? 'パワー' :
                             stat === 'technique' ? 'テクニック' :
                             stat === 'speed' ? 'スピード' :
                             stat === 'stamina' ? 'スタミナ' :
                             stat === 'mental' ? 'メンタル' : stat}
                          </span>
                          <span className={`text-sm font-bold ${getEffectColor(value)}`}>
                            {value > 0 ? '+' : ''}{value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 疲労・モチベーション変化 */}
                {(eventResult.effects.fatigueChange !== undefined || eventResult.effects.motivationChange !== undefined) && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <Heart className="h-4 w-4 mr-2" />
                      コンディション
                    </h3>
                    <div className="space-y-2">
                      {eventResult.effects.fatigueChange !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm flex items-center">
                            <span className="mr-1">😴</span>
                            疲労
                          </span>
                          <span className={`text-sm font-bold ${getEffectColor(-eventResult.effects.fatigueChange)}`}>
                            {eventResult.effects.fatigueChange > 0 ? '+' : ''}{eventResult.effects.fatigueChange}
                          </span>
                        </div>
                      )}
                      {eventResult.effects.motivationChange !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm flex items-center">
                            <span className="mr-1">🔥</span>
                            やる気
                          </span>
                          <span className={`text-sm font-bold ${getEffectColor(eventResult.effects.motivationChange)}`}>
                            {eventResult.effects.motivationChange > 0 ? '+' : ''}{eventResult.effects.motivationChange}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 特殊効果 */}
                {eventResult.effects.specialEffects && eventResult.effects.specialEffects.length > 0 && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-yellow-800 mb-3 flex items-center">
                      <Star className="h-4 w-4 mr-2" />
                      特殊効果
                    </h3>
                    <ul className="space-y-1">
                      {eventResult.effects.specialEffects.map((effect, index) => (
                        <li key={index} className="text-sm text-yellow-700 flex items-center">
                          <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2 flex-shrink-0"></span>
                          {effect}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* ボタン */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-poke-blue-500 text-white rounded-lg hover:bg-poke-blue-600 transition-colors font-medium"
                >
                  {eventResult.pokemonAffected && currentStep < eventResult.pokemonAffected.length - 1 
                    ? '次へ' : '確認'}
                </button>
              </div>

              {/* 進行インジケーター */}
              {eventResult.pokemonAffected && eventResult.pokemonAffected.length > 1 && (
                <div className="mt-4 flex justify-center space-x-2">
                  {eventResult.pokemonAffected.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentStep ? 'bg-poke-blue-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}