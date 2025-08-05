'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Trophy,
  Target,
  Zap,
  Activity,
  Users,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import type { Player } from '@/types/game';

interface MatchSimulationProps {
  ourTeam: Player[];
  opponentSchool: string;
  matchType: 'practice' | 'tournament' | 'championship';
  onComplete: (result: MatchResult) => void;
  onCancel: () => void;
}

interface MatchResult {
  result: 'win' | 'lose' | 'draw';
  score: {
    our_points: number;
    opponent_points: number;
  };
  playerStats: {
    pokemonId: string;
    points: number;
    performance: 'excellent' | 'good' | 'average' | 'poor';
  }[];
  rewards: {
    funds: number;
    reputation: number;
    experience: number;
  };
}

interface GameEvent {
  type: 'match_start' | 'serve' | 'return' | 'volley' | 'point' | 'set_end' | 'match_end';
  player: string;
  success: boolean;
  message: string;
}

export function MatchSimulation({ 
  ourTeam, 
  opponentSchool, 
  matchType, 
  onComplete, 
  onCancel 
}: MatchSimulationProps) {
  const [gameState, setGameState] = useState<'preparing' | 'playing' | 'paused' | 'completed'>('preparing');
  const [currentSet, setCurrentSet] = useState(1);
  const [ourScore, setOurScore] = useState({ sets: 0, games: 0, points: 0 });
  const [opponentScore, setOpponentScore] = useState({ sets: 0, games: 0, points: 0 });
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [playerStats, setPlayerStats] = useState<{ [key: string]: { points: number; attempts: number } }>({});

  useEffect(() => {
    // 初期プレイヤー統計を設定
    const initialStats: { [key: string]: { points: number; attempts: number } } = {};
    ourTeam.forEach(pokemon => {
      initialStats[pokemon.id] = { points: 0, attempts: 0 };
    });
    setPlayerStats(initialStats);
    
    // 最初のプレイヤーを設定
    if (ourTeam.length > 0) {
      setCurrentPlayer(ourTeam[0]);
    }
  }, [ourTeam]);

  const startMatch = () => {
    setGameState('playing');
    addEvent('match_start', ourTeam[0]?.pokemon_name || 'プレイヤー', true, '試合開始！');
    simulatePoint();
  };

  const pauseMatch = () => {
    setGameState('paused');
  };

  const resumeMatch = () => {
    setGameState('playing');
    setTimeout(simulatePoint, 1000);
  };

  const addEvent = (type: GameEvent['type'], player: string, success: boolean, message: string) => {
    const newEvent: GameEvent = { type, player, success, message };
    setEvents(prev => [...prev.slice(-9), newEvent]); // 最新10件のみ保持
  };

  const simulatePoint = () => {
    if (gameState !== 'playing') return;

    setTimeout(() => {
      const randomPlayer = ourTeam[Math.floor(Math.random() * ourTeam.length)];
      setCurrentPlayer(randomPlayer);
      
      // プレイヤーの能力に基づいて成功率を計算
      const totalStats = randomPlayer.serve_skill + randomPlayer.return_skill + 
                        randomPlayer.volley_skill + randomPlayer.stroke_skill;
      const successRate = Math.min(0.8, (totalStats / 400) + 0.3);
      
      const isSuccess = Math.random() < successRate;
      const eventTypes = ['serve', 'return', 'volley'] as const;
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      
      // 統計を更新
      setPlayerStats(prev => ({
        ...prev,
        [randomPlayer.id]: {
          points: prev[randomPlayer.id].points + (isSuccess ? 1 : 0),
          attempts: prev[randomPlayer.id].attempts + 1
        }
      }));

      if (isSuccess) {
        addEvent(eventType, randomPlayer.pokemon_name, true, `${randomPlayer.pokemon_name}の素晴らしい${getEventLabel(eventType)}！`);
        scorePoint('our');
      } else {
        addEvent(eventType, randomPlayer.pokemon_name, false, `${randomPlayer.pokemon_name}のミス...`);
        scorePoint('opponent');
      }
    }, Math.random() * 2000 + 1000); // 1-3秒のランダム間隔
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case 'serve': return 'サーブ';
      case 'return': return 'リターン';
      case 'volley': return 'ボレー';
      default: return 'プレー';
    }
  };

  const scorePoint = (team: 'our' | 'opponent') => {
    if (team === 'our') {
      setOurScore(prev => {
        const newPoints = prev.points + 15;
        if (newPoints >= 60) {
          const newGames = prev.games + 1;
          if (newGames >= 6) {
            const newSets = prev.sets + 1;
            if (newSets >= 2) {
              // 試合終了
              completeMatch('win');
              return prev;
            }
            return { sets: newSets, games: 0, points: 0 };
          }
          return { ...prev, games: newGames, points: 0 };
        }
        return { ...prev, points: newPoints };
      });
    } else {
      setOpponentScore(prev => {
        const newPoints = prev.points + 15;
        if (newPoints >= 60) {
          const newGames = prev.games + 1;
          if (newGames >= 6) {
            const newSets = prev.sets + 1;
            if (newSets >= 2) {
              // 試合終了
              completeMatch('lose');
              return prev;
            }
            return { sets: newSets, games: 0, points: 0 };
          }
          return { ...prev, games: newGames, points: 0 };
        }
        return { ...prev, points: newPoints };
      });
    }

    if (gameState === 'playing') {
      setTimeout(simulatePoint, 500);
    }
  };

  const completeMatch = (result: 'win' | 'lose' | 'draw') => {
    setGameState('completed');
    
    // 最終結果を計算
    const finalResult: MatchResult = {
      result,
      score: {
        our_points: ourScore.sets,
        opponent_points: opponentScore.sets
      },
      playerStats: ourTeam.map(pokemon => ({
        pokemonId: pokemon.id,
        points: playerStats[pokemon.id]?.points || 0,
        performance: getPerformanceRating(playerStats[pokemon.id]?.points || 0, playerStats[pokemon.id]?.attempts || 1)
      })),
      rewards: calculateRewards(result, matchType)
    };

    setTimeout(() => onComplete(finalResult), 2000);
  };

  const getPerformanceRating = (points: number, attempts: number): 'excellent' | 'good' | 'average' | 'poor' => {
    const successRate = points / attempts;
    if (successRate >= 0.8) return 'excellent';
    if (successRate >= 0.6) return 'good';
    if (successRate >= 0.4) return 'average';
    return 'poor';
  };

  const calculateRewards = (result: 'win' | 'lose' | 'draw', matchType: string) => {
    const baseRewards = {
      practice: { funds: 10000, reputation: 5, experience: 20 },
      tournament: { funds: 25000, reputation: 15, experience: 50 },
      championship: { funds: 50000, reputation: 30, experience: 100 }
    };

    const base = baseRewards[matchType as keyof typeof baseRewards] || baseRewards.practice;
    const multiplier = result === 'win' ? 1.5 : result === 'draw' ? 1.0 : 0.5;

    return {
      funds: Math.floor(base.funds * multiplier),
      reputation: Math.floor(base.reputation * multiplier),
      experience: Math.floor(base.experience * multiplier)
    };
  };

  const getPointDisplay = (points: number) => {
    const pointMap = [0, 15, 30, 40, 'Ad'];
    return pointMap[Math.min(points / 15, 4)] || points;
  };

  if (gameState === 'completed') {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-8"
        >
          <motion.div
            initial={{ rotate: -180 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 1, type: "spring" }}
          >
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">試合終了！</h2>
          <p className="text-xl text-gray-700">
            最終スコア: {ourScore.sets} - {opponentScore.sets}
          </p>
        </motion.div>

        {/* プレイヤー成績 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">プレイヤー成績</h3>
          <div className="space-y-3">
            {ourTeam.map(pokemon => {
              const stats = playerStats[pokemon.id] || { points: 0, attempts: 0 };
              const successRate = stats.attempts > 0 ? (stats.points / stats.attempts * 100).toFixed(1) : '0.0';
              
              return (
                <div key={pokemon.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokemon_id}.png`}
                      alt={pokemon.pokemon_name}
                      className="w-10 h-10 object-contain"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{pokemon.pokemon_name}</h4>
                      <p className="text-sm text-gray-500">Lv.{pokemon.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{stats.points}pts</div>
                    <div className="text-sm text-gray-500">成功率 {successRate}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* スコアボード */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">vs {opponentSchool}</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">第{currentSet}セット</span>
            {gameState === 'playing' && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-2 h-2 bg-red-500 rounded-full"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">我がチーム</h3>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-blue-600">
                {ourScore.sets}
              </div>
              <div className="text-sm text-gray-600">
                {ourScore.games}ゲーム {getPointDisplay(ourScore.points)}
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{opponentSchool}</h3>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-red-600">
                {opponentScore.sets}
              </div>
              <div className="text-sm text-gray-600">
                {opponentScore.games}ゲーム {getPointDisplay(opponentScore.points)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 現在のプレイヤー */}
      {currentPlayer && (
        <div className="bg-gradient-to-r from-poke-blue-50 to-green-50 border border-poke-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-4">
            <img
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${currentPlayer.pokemon_id}.png`}
              alt={currentPlayer.pokemon_name}
              className="w-16 h-16 object-contain"
            />
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900">{currentPlayer.pokemon_name}</h3>
              <p className="text-sm text-gray-600">プレー中</p>
            </div>
          </div>
        </div>
      )}

      {/* イベントログ */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">試合経過</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          <AnimatePresence>
            {events.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`flex items-center space-x-2 p-2 rounded-lg ${
                  event.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}
              >
                {event.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <span className="text-sm">{event.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* コントロール */}
      <div className="flex justify-center space-x-4">
        {gameState === 'preparing' && (
          <button
            onClick={startMatch}
            className="flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            <Play className="h-5 w-5" />
            <span>試合開始</span>
          </button>
        )}
        
        {gameState === 'playing' && (
          <button
            onClick={pauseMatch}
            className="flex items-center space-x-2 bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            <Pause className="h-5 w-5" />
            <span>一時停止</span>
          </button>
        )}
        
        {gameState === 'paused' && (
          <button
            onClick={resumeMatch}
            className="flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            <Play className="h-5 w-5" />
            <span>再開</span>
          </button>
        )}
        
        <button
          onClick={onCancel}
          className="flex items-center space-x-2 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
        >
          <span>試合を終了</span>
        </button>
      </div>
    </div>
  );
}