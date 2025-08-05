'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Shuffle } from 'lucide-react';
import { useSoundManager } from '@/lib/sound-manager';

// フルーツの種類
const FRUITS = [
  { id: 'apple', name: 'りんご', emoji: '🍎', color: 'bg-red-100 border-red-300 text-red-700' },
  { id: 'banana', name: 'バナナ', emoji: '🍌', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
  { id: 'grape', name: 'ぶどう', emoji: '🍇', color: 'bg-purple-100 border-purple-300 text-purple-700' },
  { id: 'strawberry', name: 'いちご', emoji: '🍓', color: 'bg-pink-100 border-pink-300 text-pink-700' },
  { id: 'orange', name: 'オレンジ', emoji: '🍊', color: 'bg-orange-100 border-orange-300 text-orange-700' },
  { id: 'peach', name: 'もも', emoji: '🍑', color: 'bg-pink-100 border-pink-300 text-pink-600' },
  { id: 'melon', name: 'メロン', emoji: '🍈', color: 'bg-green-100 border-green-300 text-green-700' },
  { id: 'watermelon', name: 'すいか', emoji: '🍉', color: 'bg-green-100 border-green-400 text-green-800' },
];

interface FruitAuthProps {
  onComplete: (selection: { fruits: string[]; order: number[] }) => void;
  isLogin?: boolean;
  existingSelection?: { fruits: string[]; order: number[] };
}

export function FruitAuth({ onComplete, isLogin = false, existingSelection }: FruitAuthProps) {
  const [selectedFruits, setSelectedFruits] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<'select' | 'order'>('select');
  const [orderedFruits, setOrderedFruits] = useState<string[]>([]);
  const [draggedFruit, setDraggedFruit] = useState<string | null>(null);
  const soundManager = useSoundManager();

  // フルーツ選択
  const handleFruitSelect = (fruitId: string) => {
    soundManager.playClick();
    
    if (selectedFruits.includes(fruitId)) {
      setSelectedFruits(prev => prev.filter(id => id !== fruitId));
    } else if (selectedFruits.length < 4) {
      setSelectedFruits(prev => [...prev, fruitId]);
    }
  };

  // 順序決定ステップに進む
  const proceedToOrder = () => {
    if (selectedFruits.length === 4) {
      soundManager.playSuccess();
      setCurrentStep('order');
      setOrderedFruits([...selectedFruits]);
    }
  };

  // 順序をシャッフル
  const shuffleOrder = () => {
    soundManager.playClick();
    const shuffled = [...selectedFruits].sort(() => Math.random() - 0.5);
    setOrderedFruits(shuffled);
  };

  // ドラッグ開始
  const handleDragStart = (fruitId: string) => {
    setDraggedFruit(fruitId);
  };

  // ドラッグオーバー
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // ドロップ
  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!draggedFruit) return;

    const newOrder = [...orderedFruits];
    const draggedIndex = newOrder.indexOf(draggedFruit);
    
    // 配列の要素を移動
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedFruit);
    
    setOrderedFruits(newOrder);
    setDraggedFruit(null);
    soundManager.playClick();
  };

  // 認証完了
  const completeAuth = () => {
    console.log('Complete auth called with:', { orderedFruits, isLogin, length: orderedFruits.length });
    
    // データ検証
    if (!orderedFruits || orderedFruits.length !== 4) {
      console.error('Invalid fruit data:', orderedFruits);
      alert('フルーツの選択に問題があります。もう一度やり直してください。');
      return;
    }
    
    soundManager.playLevelUp();
    const order = orderedFruits.map((fruitId, index) => index + 1);
    const result = {
      fruits: orderedFruits,
      order
    };
    console.log('Calling onComplete with validated data:', result);
    onComplete(result);
  };

  // 既存の選択と一致するかチェック（ログイン時）
  const isValidLogin = () => {
    if (!existingSelection) return false;
    return JSON.stringify(orderedFruits) === JSON.stringify(existingSelection.fruits);
  };

  const getFruit = (id: string) => FRUITS.find(f => f.id === id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <motion.div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-poke-blue-500 to-poke-blue-600 text-white p-8 text-center">
          <h1 className="text-3xl font-bold font-display mb-2">
            🎾 ポケテニマスター
          </h1>
          <p className="text-blue-100">
            {isLogin ? 'フルーツの組み合わせを入力してください' : '4つのフルーツを選んで、あなただけの認証を作成しましょう'}
          </p>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {currentStep === 'select' && (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 font-display mb-2">
                    ステップ 1: フルーツを選択
                  </h2>
                  <p className="text-gray-600">
                    好きなフルーツを4つ選んでください ({selectedFruits.length}/4)
                  </p>
                </div>

                {/* フルーツ選択グリッド */}
                <div className="grid grid-cols-4 gap-4">
                  {FRUITS.map((fruit) => (
                    <motion.button
                      key={fruit.id}
                      onClick={() => handleFruitSelect(fruit.id)}
                      className={`
                        relative p-4 rounded-xl border-2 transition-all duration-200 text-center
                        ${selectedFruits.includes(fruit.id) 
                          ? `${fruit.color} border-opacity-100 transform scale-105` 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}
                        ${selectedFruits.length >= 4 && !selectedFruits.includes(fruit.id) 
                          ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                      whileHover={{ scale: selectedFruits.length >= 4 && !selectedFruits.includes(fruit.id) ? 1 : 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={selectedFruits.length >= 4 && !selectedFruits.includes(fruit.id)}
                    >
                      <div className="text-3xl mb-2">{fruit.emoji}</div>
                      <div className="text-sm font-medium">{fruit.name}</div>
                      
                      {selectedFruits.includes(fruit.id) && (
                        <motion.div
                          className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        >
                          <Check className="h-3 w-3" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>

                {/* 次へボタン */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={proceedToOrder}
                    disabled={selectedFruits.length !== 4}
                    className={`
                      flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-all
                      ${selectedFruits.length === 4
                        ? 'bg-poke-blue-500 text-white hover:bg-poke-blue-600 transform hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
                    `}
                  >
                    <span>順序を決める</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 'order' && (
              <motion.div
                key="order"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 font-display mb-2">
                    ステップ 2: 順序を決定
                  </h2>
                  <p className="text-gray-600">
                    {isLogin ? 'フルーツを正しい順序に並べてください' : 'ドラッグして好きな順序に並べ替えてください'}
                  </p>
                </div>

                {/* 順序決定エリア */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">あなたの順序</h3>
                    {!isLogin && (
                      <button
                        onClick={shuffleOrder}
                        className="flex items-center space-x-1 text-sm text-poke-blue-600 hover:text-poke-blue-700"
                      >
                        <Shuffle className="h-4 w-4" />
                        <span>シャッフル</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4">
                    {orderedFruits.map((fruitId, index) => {
                      const fruit = getFruit(fruitId);
                      if (!fruit) return null;

                      return (
                        <div
                          key={`${fruitId}-${index}`}
                          draggable={!isLogin}
                          onDragStart={() => handleDragStart(fruitId)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, index)}
                          className={`
                            relative p-4 rounded-xl border-2 text-center transition-all duration-200
                            ${fruit.color} cursor-move
                            ${draggedFruit === fruitId ? 'opacity-50 transform rotate-3' : ''}
                            ${isLogin ? 'cursor-default' : 'hover:transform hover:scale-105'}
                          `}
                        >
                          <div className="text-3xl mb-2">{fruit.emoji}</div>
                          <div className="text-sm font-medium">{fruit.name}</div>
                          <div className="absolute -top-2 -left-2 bg-poke-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ボタン */}
                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setCurrentStep('select')}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    戻る
                  </button>
                  
                  <button
                    onClick={completeAuth}
                    disabled={isLogin && !isValidLogin()}
                    className={`
                      flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-all
                      ${(!isLogin || isValidLogin())
                        ? 'bg-green-500 text-white hover:bg-green-600 transform hover:scale-105'
                        : 'bg-red-300 text-red-700 cursor-not-allowed'}
                    `}
                  >
                    <span>{isLogin ? 'ログイン' : '完了'}</span>
                    <Check className="h-4 w-4" />
                  </button>
                </div>

                {isLogin && !isValidLogin() && (
                  <div className="text-center text-red-600 text-sm">
                    フルーツの順序が正しくありません
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}