'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  TrendingUp,
  Clock,
  Users,
  Zap
} from 'lucide-react';
import { PlayerCard } from '@/components/player/PlayerCard';
import type { Player } from '@/types/game';

interface TrainingSessionProps {
  trainingType: {
    name: string;
    duration: number;
    stats: string[];
    icon: React.ComponentType<{ className?: string }>;
  };
  selectedPlayers: Player[];
  onComplete: (results: TrainingResult[]) => void;
  onCancel: () => void;
}

interface TrainingResult {
  pokemonId: string;
  statChanges: {
    serve?: number;
    return?: number;
    volley?: number;
    stroke?: number;
    mental?: number;
    stamina?: number;
  };
  experience: number;
  conditionChange: number;
}

export function TrainingSession({ 
  trainingType, 
  selectedPlayers, 
  onComplete, 
  onCancel 
}: TrainingSessionProps) {
  const [sessionState, setSessionState] = useState<'preparing' | 'running' | 'paused' | 'completed'>('preparing');
  const [timeRemaining, setTimeRemaining] = useState(trainingType.duration * 60); // 秒に変換
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<TrainingResult[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (sessionState === 'running' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          const totalTime = trainingType.duration * 60;
          setProgress(((totalTime - newTime) / totalTime) * 100);
          
          if (newTime <= 0) {
            completeTraining();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [sessionState, timeRemaining, trainingType.duration]);

  const startTraining = () => {
    setSessionState('running');
  };

  const pauseTraining = () => {
    setSessionState('paused');
  };

  const resumeTraining = () => {
    setSessionState('running');
  };

  const completeTraining = () => {
    setSessionState('completed');
    
    // 練習結果を計算
    const trainingResults: TrainingResult[] = selectedPlayers.map(pokemon => {
      // ベース向上値（レベルとコンディションに基づく）
      const baseImprovement = Math.floor(Math.random() * 3) + 1;
      const levelBonus = Math.floor(pokemon.level / 10);
      const conditionBonus = pokemon.condition === 'excellent' ? 2 : 
                            pokemon.condition === 'good' ? 1 : 
                            pokemon.condition === 'normal' ? 0 : 
                            pokemon.condition === 'poor' ? -1 : -2;
      
      const totalImprovement = Math.max(1, baseImprovement + levelBonus + conditionBonus);
      
      // ステータス変化を計算
      const statChanges: any = {};
      
      if (trainingType.stats.includes('サーブ') || trainingType.stats.includes('全能力')) {
        statChanges.serve = totalImprovement;
      }
      if (trainingType.stats.includes('リターン') || trainingType.stats.includes('全能力')) {
        statChanges.return = totalImprovement;
      }
      if (trainingType.stats.includes('ボレー') || trainingType.stats.includes('全能力')) {
        statChanges.volley = totalImprovement;
      }
      if (trainingType.stats.includes('ストローク') || trainingType.stats.includes('全能力')) {
        statChanges.stroke = totalImprovement;
      }
      if (trainingType.stats.includes('メンタル') || trainingType.stats.includes('全能力')) {
        statChanges.mental = totalImprovement;
      }
      if (trainingType.stats.includes('スタミナ') || trainingType.stats.includes('全能力')) {
        statChanges.stamina = totalImprovement;
      }

      return {
        pokemonId: pokemon.id,
        statChanges,
        experience: Math.floor(Math.random() * 20) + 10,
        conditionChange: Math.floor(Math.random() * 10) - 15 // 疲労による減少
      };
    });

    setResults(trainingResults);
    setTimeout(() => onComplete(trainingResults), 2000); // 2秒後に結果を返す
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getMotivationMessage = () => {
    const messages = [
      'みんな頑張っています！',
      '集中して練習中...',
      '技術が向上しています！',
      '素晴らしいフォームです！',
      'ポケモンたちが成長中...',
      '練習の成果が見えています！'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  if (sessionState === 'completed') {
    return (
      <div className="space-y-6">
        {/* 完了ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-green-50 border border-green-200 rounded-lg p-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 500, damping: 30 }}
          >
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-2xl font-bold text-green-900 mb-2">
            練習完了！
          </h2>
          <p className="text-green-700">
            {trainingType.name}が正常に完了しました
          </p>
        </motion.div>

        {/* 結果表示 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedPlayers.map((pokemon, index) => {
            const result = results.find(r => r.pokemonId === pokemon.id);
            return (
              <motion.div
                key={pokemon.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokemon_id}.png`}
                    alt={pokemon.pokemon_name}
                    className="w-12 h-12 object-contain"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{pokemon.pokemon_name}</h3>
                    <p className="text-sm text-gray-500">Lv.{pokemon.level}</p>
                  </div>
                </div>

                {result && (
                  <div className="space-y-2">
                    {/* ステータス変化 */}
                    {Object.entries(result.statChanges).map(([stat, change]) => (
                      <div key={stat} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 capitalize">{stat}</span>
                        <span className="text-green-600 font-medium">+{change}</span>
                      </div>
                    ))}
                    
                    {/* 経験値 */}
                    <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-2">
                      <span className="text-gray-600">経験値</span>
                      <span className="text-blue-600 font-medium">+{result.experience}</span>
                    </div>
                    
                    {/* コンディション変化 */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">コンディション</span>
                      <span className={`font-medium ${result.conditionChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {result.conditionChange >= 0 ? '+' : ''}{result.conditionChange}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* セッションヘッダー */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-poke-blue-100 rounded-lg">
              <trainingType.icon className="h-6 w-6 text-poke-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{trainingType.name}</h2>
              <p className="text-gray-600">参加者: {selectedPlayers.length}名</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 font-mono">
              {formatTime(timeRemaining)}
            </div>
            <div className="text-sm text-gray-500">残り時間</div>
          </div>
        </div>

        {/* プログレスバー */}
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-poke-blue-500 to-poke-blue-600 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-white drop-shadow">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>

      {/* コントロールボタン */}
      <div className="flex justify-center space-x-4">
        {sessionState === 'preparing' && (
          <button
            onClick={startTraining}
            className="flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            <Play className="h-5 w-5" />
            <span>練習を開始</span>
          </button>
        )}
        
        {sessionState === 'running' && (
          <button
            onClick={pauseTraining}
            className="flex items-center space-x-2 bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            <Pause className="h-5 w-5" />
            <span>一時停止</span>
          </button>
        )}
        
        {sessionState === 'paused' && (
          <>
            <button
              onClick={resumeTraining}
              className="flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              <Play className="h-5 w-5" />
              <span>再開</span>
            </button>
            <button
              onClick={() => {
                setTimeRemaining(trainingType.duration * 60);
                setProgress(0);
                setSessionState('preparing');
              }}
              className="flex items-center space-x-2 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <RotateCcw className="h-5 w-5" />
              <span>リセット</span>
            </button>
          </>
        )}
        
        <button
          onClick={onCancel}
          className="flex items-center space-x-2 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
        >
          <span>キャンセル</span>
        </button>
      </div>

      {/* 参加ポケモン一覧 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">参加ポケモン</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {selectedPlayers.map((pokemon) => (
            <PlayerCard
              key={pokemon.id}
              pokemon={pokemon}
              compact={true}
              showStats={false}
            />
          ))}
        </div>
      </div>

      {/* 練習状況 */}
      {sessionState === 'running' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-r from-poke-blue-50 to-green-50 border border-poke-blue-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-center space-x-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="h-5 w-5 text-poke-blue-600" />
            </motion.div>
            <span className="text-poke-blue-900 font-medium">
              {getMotivationMessage()}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}