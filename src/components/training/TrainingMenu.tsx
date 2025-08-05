'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Zap, 
  Activity, 
  Heart, 
  Shield, 
  TrendingUp,
  Clock,
  Users,
  Star,
  CheckCircle
} from 'lucide-react';

interface TrainingType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  stats: string[];
  duration: number; // 分
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  cost: number;
  requirements?: string;
  color: string;
}

const trainingTypes: TrainingType[] = [
  {
    id: 'serve',
    name: 'サーブ練習',
    description: 'サーブの威力と正確性を向上させる基礎練習',
    icon: Zap,
    stats: ['サーブ'],
    duration: 30,
    difficulty: 'beginner',
    cost: 1000,
    color: 'orange'
  },
  {
    id: 'return',
    name: 'リターン練習',
    description: '相手のサーブを確実に返球する技術を磨く',
    icon: Shield,
    stats: ['リターン'],
    duration: 30,
    difficulty: 'beginner',
    cost: 1000,
    color: 'blue'
  },
  {
    id: 'volley',
    name: 'ボレー練習',
    description: 'ネット前での素早い反応とボレー技術を向上',
    icon: Target,
    stats: ['ボレー'],
    duration: 45,
    difficulty: 'intermediate',
    cost: 1500,
    color: 'green'
  },
  {
    id: 'stroke',
    name: 'ストローク練習',
    description: 'フォアハンド・バックハンドの基本技術を強化',
    icon: TrendingUp,
    stats: ['ストローク'],
    duration: 45,
    difficulty: 'beginner',
    cost: 1200,
    color: 'purple'
  },
  {
    id: 'mental',
    name: 'メンタル練習',
    description: '試合での集中力とプレッシャー耐性を向上',
    icon: Heart,
    stats: ['メンタル'],
    duration: 60,
    difficulty: 'advanced',
    cost: 2000,
    requirements: 'レベル5以上',
    color: 'pink'
  },
  {
    id: 'stamina',
    name: 'スタミナ練習',
    description: '持久力と体力を向上させる基礎体力作り',
    icon: Activity,
    stats: ['スタミナ'],
    duration: 60,
    difficulty: 'intermediate',
    cost: 800,
    color: 'red'
  },
  {
    id: 'combination',
    name: '総合練習',
    description: '全ての能力をバランスよく向上させる特別練習',
    icon: Star,
    stats: ['全能力'],
    duration: 90,
    difficulty: 'advanced',
    cost: 3000,
    requirements: 'レベル10以上、コート2面以上',
    color: 'yellow'
  }
];

interface TrainingMenuProps {
  onSelectTraining: (training: TrainingType) => void;
  availableFunds: number;
  selectedPlayers: string[];
}

export function TrainingMenu({ onSelectTraining, availableFunds, selectedPlayers }: TrainingMenuProps) {
  const [selectedTraining, setSelectedTraining] = useState<TrainingType | null>(null);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-700';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '初級';
      case 'intermediate':
        return '中級';
      case 'advanced':
        return '上級';
      default:
        return '不明';
    }
  };

  const getStatColor = (stat: string) => {
    switch (stat) {
      case 'サーブ':
        return 'text-orange-600';
      case 'リターン':
        return 'text-blue-600';
      case 'ボレー':
        return 'text-green-600';
      case 'ストローク':
        return 'text-purple-600';
      case 'メンタル':
        return 'text-pink-600';
      case 'スタミナ':
        return 'text-red-600';
      case '全能力':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const canAfford = (training: TrainingType) => {
    return availableFunds >= training.cost * selectedPlayers.length;
  };

  const handleTrainingSelect = (training: TrainingType) => {
    if (canAfford(training)) {
      setSelectedTraining(training);
      onSelectTraining(training);
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-display">
              練習メニュー
            </h2>
            <p className="text-gray-600 mt-2">
              ポケモンの能力を向上させる練習を選択してください
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500">利用可能資金</div>
            <div className="text-2xl font-bold text-green-600">
              ¥{availableFunds.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              選択中: {selectedPlayers.length}名
            </div>
          </div>
        </div>
      </div>

      {/* 練習メニューグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainingTypes.map((training) => {
          const Icon = training.icon;
          const affordable = canAfford(training);
          const totalCost = training.cost * selectedPlayers.length;

          return (
            <motion.div
              key={training.id}
              className={`
                relative bg-white rounded-xl border-2 overflow-hidden cursor-pointer transition-all
                ${selectedTraining?.id === training.id 
                  ? 'border-poke-blue-500 shadow-xl ring-4 ring-poke-blue-200' 
                  : affordable
                    ? 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                    : 'border-gray-200 opacity-60 cursor-not-allowed'
                }
              `}
              onClick={() => affordable && handleTrainingSelect(training)}
              whileHover={affordable ? { scale: 1.02 } : {}}
              whileTap={affordable ? { scale: 0.98 } : {}}
            >
              {/* ヘッダー */}
              <div className={`bg-gradient-to-r from-${training.color}-500 to-${training.color}-600 text-white p-4`}>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{training.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full bg-white bg-opacity-20`}>
                        {getDifficultyLabel(training.difficulty)}
                      </span>
                      <div className="flex items-center text-sm">
                        <Clock className="h-3 w-3 mr-1" />
                        {training.duration}分
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* コンテンツ */}
              <div className="p-4 space-y-4">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {training.description}
                </p>

                {/* 対象能力 */}
                <div>
                  <div className="text-xs text-gray-500 mb-2">向上する能力</div>
                  <div className="flex flex-wrap gap-2">
                    {training.stats.map((stat) => (
                      <span
                        key={stat}
                        className={`px-2 py-1 text-xs font-medium rounded-full bg-gray-100 ${getStatColor(stat)}`}
                      >
                        {stat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 必要条件 */}
                {training.requirements && (
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-yellow-500" />
                      <span className="text-xs text-yellow-700">{training.requirements}</span>
                    </div>
                  </div>
                )}

                {/* コスト */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-500">単価</div>
                      <div className="text-sm font-medium text-gray-900">
                        ¥{training.cost.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">総費用</div>
                      <div className={`text-lg font-bold ${affordable ? 'text-green-600' : 'text-red-600'}`}>
                        ¥{totalCost.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  {!affordable && (
                    <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                      資金不足
                    </div>
                  )}
                </div>
              </div>

              {/* 選択インジケーター */}
              {selectedTraining?.id === training.id && (
                <motion.div
                  className="absolute top-4 right-4 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <CheckCircle className="w-4 h-4 text-poke-blue-500" />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* 選択情報 */}
      <AnimatePresence>
        {selectedTraining && selectedPlayers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-poke-blue-50 border border-poke-blue-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-poke-blue-500 text-white rounded-lg">
                  <selectedTraining.icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium text-poke-blue-900">{selectedTraining.name}</h4>
                  <p className="text-sm text-poke-blue-700">
                    {selectedPlayers.length}名が参加 • {selectedTraining.duration}分
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-poke-blue-700">総費用</div>
                <div className="text-xl font-bold text-poke-blue-900">
                  ¥{(selectedTraining.cost * selectedPlayers.length).toLocaleString()}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 注意事項 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">練習について</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• 練習の効果はポケモンのレベルや個体値によって変動します</li>
          <li>• 上級練習には特定の条件を満たす必要があります</li>
          <li>• 連続で同じ練習を行うと効果が低下する場合があります</li>
          <li>• コンディションが低いポケモンは練習効果が下がります</li>
        </ul>
      </div>
    </div>
  );
}