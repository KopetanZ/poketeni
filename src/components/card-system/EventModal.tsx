'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, AlertTriangle, Gift, Users, TrendingUp, Heart } from 'lucide-react';
import type { MapPanel } from '@/types/card-system';

interface EventModalProps {
  isOpen: boolean;
  panel: MapPanel | null;
  onClose: () => void;
  onChoiceSelect: (choiceIndex: number) => void;
  isProcessing?: boolean;
}

export function EventModal({ isOpen, panel, onClose, onChoiceSelect, isProcessing = false }: EventModalProps) {
  if (!panel?.event) return null;

  const getEventTypeIcon = () => {
    switch (panel.type) {
      case 'good_event':
        return <Star className="h-8 w-8 text-yellow-500" />;
      case 'bad_event':
        return <AlertTriangle className="h-8 w-8 text-red-500" />;
      case 'special_training':
        return <TrendingUp className="h-8 w-8 text-purple-500" />;
      case 'character':
        return <Users className="h-8 w-8 text-blue-500" />;
      case 'facility':
        return <Gift className="h-8 w-8 text-green-500" />;
      default:
        return <Heart className="h-8 w-8 text-gray-500" />;
    }
  };

  const getEventTypeColor = () => {
    switch (panel.type) {
      case 'good_event':
        return 'from-yellow-400 to-orange-500';
      case 'bad_event':
        return 'from-red-400 to-red-600';
      case 'special_training':
        return 'from-purple-400 to-purple-600';
      case 'character':
        return 'from-blue-400 to-blue-600';
      case 'facility':
        return 'from-green-400 to-green-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const formatEffectText = (effects: any) => {
    const texts: string[] = [];

    if (effects.statChanges) {
      Object.entries(effects.statChanges).forEach(([stat, value]) => {
        if (value && typeof value === 'number') {
          const statName = {
            serve: 'サーブ',
            return: 'リターン',
            volley: 'ボレー',
            stroke: 'ストローク',
            mental: 'メンタル',
            stamina: 'スタミナ'
          }[stat] || stat;
          texts.push(`${statName}: ${value > 0 ? '+' : ''}${value}`);
        }
      });
    }

    if (effects.teamEffects) {
      Object.entries(effects.teamEffects).forEach(([effect, value]) => {
        if (value && typeof value === 'number') {
          const effectName = {
            conditionChange: 'コンディション',
            moraleChange: '士気',
            trustChange: '信頼度',
            practiceEfficiencyChange: '練習効率'
          }[effect] || effect;
          texts.push(`${effectName}: ${value > 0 ? '+' : ''}${value}${effect === 'practiceEfficiencyChange' ? '%' : ''}`);
        }
      });
    }

    if (effects.resourceChanges) {
      Object.entries(effects.resourceChanges).forEach(([resource, value]) => {
        if (value && typeof value === 'number') {
          const resourceName = {
            funds: '資金',
            reputation: '評判'
          }[resource] || resource;
          texts.push(`${resourceName}: ${value > 0 ? '+' : ''}${resource === 'funds' ? `¥${Math.abs(value).toLocaleString()}` : value}`);
        }
      });
    }

    return texts;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <div className={`bg-gradient-to-r ${getEventTypeColor()} text-white p-6 relative`}>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center space-x-4">
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                >
                  {getEventTypeIcon()}
                </motion.div>
                
                <div>
                  <motion.h2
                    className="text-2xl font-bold mb-2"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {panel.event.title}
                  </motion.h2>
                  
                  <motion.div
                    className="flex items-center space-x-2 text-white/80"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <span className="text-sm">{panel.display.name}</span>
                    <span className="text-xs">•</span>
                    <span className="text-xs">{panel.display.icon}</span>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* コンテンツ */}
            <div className="p-6">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-6"
              >
                {/* イベント説明 */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-700 leading-relaxed">
                    {panel.event.description}
                  </p>
                </div>

                {/* 選択肢がない場合の自動効果表示 */}
                {!panel.event.choices && panel.effects && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                      <Gift className="h-4 w-4 mr-2" />
                      効果
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {formatEffectText(panel.effects).map((effect, index) => (
                        <div key={index} className="flex items-center space-x-2 text-blue-800">
                          <div className="w-2 h-2 bg-blue-400 rounded-full" />
                          <span>{effect}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 選択肢 */}
                {panel.event.choices && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 text-lg">どうしますか？</h4>
                    
                    <div className="space-y-3">
                      {panel.event.choices.map((choice, index) => (
                        <motion.button
                          key={index}
                          onClick={() => onChoiceSelect(index)}
                          disabled={isProcessing}
                          className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-poke-blue-300 hover:bg-poke-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                        >
                          <div className="text-left">
                            <div className="font-medium text-gray-900 mb-2">
                              {choice.text}
                            </div>
                            
                            {/* 選択肢の効果プレビュー */}
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                              {formatEffectText(choice.effects).map((effect, effectIndex) => (
                                <div key={effectIndex} className="flex items-center space-x-1">
                                  <div className="w-1.5 h-1.5 bg-poke-blue-400 rounded-full" />
                                  <span>{effect}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 処理中表示 */}
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center py-4"
                  >
                    <div className="flex items-center space-x-3 text-poke-blue-600">
                      <div className="w-6 h-6 border-2 border-poke-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="font-medium">処理中...</span>
                    </div>
                  </motion.div>
                )}

                {/* 選択肢がない場合の続行ボタン */}
                {!panel.event.choices && !isProcessing && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="flex justify-center"
                  >
                    <button
                      onClick={onClose}
                      className="bg-poke-blue-500 text-white px-8 py-3 rounded-xl hover:bg-poke-blue-600 transition-colors font-medium"
                    >
                      続行
                    </button>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}