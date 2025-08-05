'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Play } from 'lucide-react';
import { EventModal, EventResult } from './EventModal';
import { generateEventForCell } from '@/lib/game-engine/event-generator';
import { useSoundManager } from '@/lib/sound-manager';

// すごろくのマス目の種類
type CellType = 
  | 'start'           // スタート
  | 'training'        // 練習
  | 'rest'           // 休息
  | 'event'          // イベント
  | 'match'          // 試合
  | 'shop'           // ショップ
  | 'special'        // 特殊
  | 'goal';          // ゴール

interface SugorokuCell {
  id: number;
  type: CellType;
  title: string;
  description: string;
  icon: string;
  effect?: any;
}

// 1週間(7日)のすごろくボード
const sugorokuCells: SugorokuCell[] = [
  { id: 0, type: 'start', title: '月曜日', description: '新しい週の始まり', icon: '🌅' },
  { id: 1, type: 'training', title: '基礎練習', description: 'フットワークとストローク', icon: '🏃‍♂️' },
  { id: 2, type: 'event', title: 'ランダムイベント', description: '何かが起こる...', icon: '❓' },
  { id: 3, type: 'training', title: 'サーブ練習', description: 'サーブの威力を上げよう', icon: '🎾' },
  { id: 4, type: 'rest', title: '休息日', description: '疲労回復とメンタルケア', icon: '😴' },
  { id: 5, type: 'match', title: '練習試合', description: '他校との練習試合', icon: '⚔️' },
  { id: 6, type: 'goal', title: '日曜日', description: '週の終わり、成果を確認', icon: '🏆' },
];

interface DiceIconProps {
  value: number;
  className?: string;
}

function DiceIcon({ value, className = "" }: DiceIconProps) {
  const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
  const Icon = icons[value - 1] || Dice1;
  return <Icon className={className} />;
}

export function SugorokuBoard() {
  const [currentPosition, setCurrentPosition] = useState(0);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [gameMessage, setGameMessage] = useState<string>('サイコロを振って進みましょう！');
  const [actionPoints, setActionPoints] = useState(3);
  const [currentEvent, setCurrentEvent] = useState<EventResult | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const soundManager = useSoundManager();

  const rollDice = useCallback(async () => {
    if (isRolling || actionPoints <= 0) return;
    
    // サウンド再生とAudioContext再開
    soundManager.resume();
    soundManager.playDiceRoll();
    
    setIsRolling(true);
    setGameMessage('サイコロを振っています...');
    
    // アニメーション効果
    for (let i = 0; i < 10; i++) {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const finalValue = Math.floor(Math.random() * 6) + 1;
    setDiceValue(finalValue);
    
    // 位置を更新
    const newPosition = Math.min(currentPosition + finalValue, sugorokuCells.length - 1);
    setCurrentPosition(newPosition);
    
    // アクションポイント消費
    setActionPoints(prev => prev - 1);
    
    // マス目の効果を実行
    const currentCell = sugorokuCells[newPosition];
    executeCell(currentCell);
    
    setIsRolling(false);
  }, [currentPosition, isRolling, actionPoints]);

  const executeCell = (cell: SugorokuCell) => {
    if (cell.type === 'start') {
      setGameMessage('新しい週の始まりです！今週も頑張りましょう。');
      return;
    }
    
    if (cell.type === 'goal') {
      setGameMessage('おめでとうございます！週が終了しました。成果を確認しましょう。');
      return;
    }

    // イベントを生成してモーダル表示
    const eventResult = generateEventForCell(cell.type);
    setCurrentEvent(eventResult);
    setIsEventModalOpen(true);
    setGameMessage(`${cell.title}が発生しました！`);
    
    // イベントタイプに応じてサウンド再生
    if (eventResult.type === 'training') {
      soundManager.playNotification();
    } else if (eventResult.type === 'match') {
      if (eventResult.title.includes('勝利')) {
        soundManager.playVictory();
      } else {
        soundManager.playError();
      }
    } else if (eventResult.type === 'special') {
      soundManager.playLevelUp();
    } else {
      soundManager.playSuccess();
    }
  };

  const handleEventClose = () => {
    setIsEventModalOpen(false);
    setCurrentEvent(null);
    
    // イベント終了後のメッセージ
    if (currentEvent) {
      setGameMessage(`${currentEvent.title}が完了しました。続けてサイコロを振りましょう！`);
    }
  };

  const getCellColor = (type: CellType) => {
    switch (type) {
      case 'start': return 'bg-green-100 border-green-300';
      case 'training': return 'bg-blue-100 border-blue-300';
      case 'rest': return 'bg-yellow-100 border-yellow-300';
      case 'event': return 'bg-purple-100 border-purple-300';
      case 'match': return 'bg-red-100 border-red-300';
      case 'shop': return 'bg-orange-100 border-orange-300';
      case 'special': return 'bg-pink-100 border-pink-300';
      case 'goal': return 'bg-gold-100 border-gold-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const resetWeek = () => {
    setCurrentPosition(0);
    setDiceValue(null);
    setActionPoints(3);
    setGameMessage('新しい週が始まりました！サイコロを振って進みましょう。');
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 font-display">
          🎲 週間スケジュール
        </h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            <span className="text-gray-600">行動力: </span>
            <span className="font-bold text-poke-blue-600">{actionPoints}/3</span>
          </div>
          {currentPosition === sugorokuCells.length - 1 && (
            <button
              onClick={resetWeek}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              新しい週へ
            </button>
          )}
        </div>
      </div>

      {/* すごろくボード */}
      <div className="mb-6">
        <div className="grid grid-cols-7 gap-2">
          {sugorokuCells.map((cell, index) => (
            <motion.div
              key={cell.id}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-300 min-h-[100px] flex flex-col items-center justify-center text-center
                ${getCellColor(cell.type)}
                ${currentPosition === index ? 'ring-4 ring-poke-blue-500 ring-opacity-50 transform scale-105' : ''}
              `}
              whileHover={{ scale: 1.02 }}
              animate={currentPosition === index ? { 
                boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" 
              } : {}}
            >
              {/* マス目の内容 */}
              <div className="text-2xl mb-1">{cell.icon}</div>
              <div className="text-xs font-medium text-gray-800">{cell.title}</div>
              <div className="text-xs text-gray-600 mt-1 leading-tight">{cell.description}</div>
              
              {/* 現在位置のマーカー */}
              {currentPosition === index && (
                <motion.div
                  className="absolute -top-2 -right-2 w-6 h-6 bg-poke-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  📍
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* サイコロとコントロール */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* サイコロ */}
          <div className="flex items-center space-x-3">
            <motion.div
              className="p-3 bg-gray-100 rounded-lg border-2"
              animate={isRolling ? { rotate: [0, 360] } : {}}
              transition={{ duration: 0.1, repeat: isRolling ? Infinity : 0 }}
            >
              {diceValue ? (
                <DiceIcon value={diceValue} className="h-8 w-8 text-gray-700" />
              ) : (
                <div className="h-8 w-8 bg-gray-300 rounded border-2 flex items-center justify-center text-lg">
                  ?
                </div>
              )}
            </motion.div>
            
            <button
              onClick={rollDice}
              disabled={isRolling || actionPoints <= 0 || currentPosition >= sugorokuCells.length - 1}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all
                ${isRolling || actionPoints <= 0 || currentPosition >= sugorokuCells.length - 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-poke-blue-500 text-white hover:bg-poke-blue-600 transform hover:scale-105'}
              `}
            >
              <Play className="h-4 w-4" />
              <span>{isRolling ? '振っています...' : 'サイコロを振る'}</span>
            </button>
          </div>
        </div>

        {/* ゲームメッセージ */}
        <div className="flex-1 ml-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={gameMessage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-gray-50 p-3 rounded-lg"
            >
              <p className="text-sm text-gray-700">{gameMessage}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 進行状況バー */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>週の進行状況</span>
          <span>{currentPosition + 1} / {sugorokuCells.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-poke-blue-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentPosition + 1) / sugorokuCells.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* イベントモーダル */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={handleEventClose}
        eventResult={currentEvent}
      />
    </div>
  );
}