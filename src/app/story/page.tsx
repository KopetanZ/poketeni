'use client';

import { useState } from 'react';
import { GameLayout } from '@/components/layout/GameLayout';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, Star, Users, Trophy, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StoryChapter {
  id: string;
  title: string;
  description: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  requiredLevel?: number;
  rewards?: string[];
}

export default function StoryPage() {
  const { user } = useAuth();
  const [selectedChapter, setSelectedChapter] = useState<StoryChapter | null>(null);

  const storyChapters: StoryChapter[] = [
    {
      id: '1',
      title: '新任監督の挑戦',
      description: 'あなたは新たに桜ヶ丘高校テニス部の監督に就任しました。弱小テニス部を全国レベルに導くことができるでしょうか？',
      isUnlocked: true,
      isCompleted: true,
      rewards: ['初期選手3名', '基本カード5枚']
    },
    {
      id: '2',
      title: '初めての大会',
      description: '新生テニス部として初めての公式戦。県予選での戦いが始まります。',
      isUnlocked: true,
      isCompleted: false,
      requiredLevel: 5,
      rewards: ['新カード3枚', '資金1000円']
    },
    {
      id: '3',
      title: 'ライバル校との出会い',
      description: '強豪校の監督と出会い、激しいライバル関係が始まります。',
      isUnlocked: false,
      isCompleted: false,
      requiredLevel: 10,
      rewards: ['特殊能力解放', '新施設']
    },
    {
      id: '4',
      title: '全国への道',
      description: '県大会を勝ち抜き、ついに全国大会への切符を手に入れる時が来ました。',
      isUnlocked: false,
      isCompleted: false,
      requiredLevel: 20,
      rewards: ['レジェンダリーカード', '特別コーチ']
    }
  ];

  return (
    <GameLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-display">
              ストーリー
            </h1>
            <p className="text-gray-600 mt-2">
              テニス部の成長物語を体験しましょう
            </p>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <BookOpen size={16} />
            <span>進行度: 25%</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* チャプター一覧 */}
          <div className="space-y-4">
            {storyChapters.map((chapter, index) => (
              <motion.div
                key={chapter.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  chapter.isUnlocked 
                    ? chapter.isCompleted
                      ? 'bg-green-50 border-green-300 hover:bg-green-100'
                      : 'bg-white border-blue-300 hover:bg-blue-50'
                    : 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
                }`}
                onClick={() => chapter.isUnlocked && setSelectedChapter(chapter)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      chapter.isCompleted 
                        ? 'bg-green-500 text-white' 
                        : chapter.isUnlocked
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-300 text-gray-600'
                    }`}>
                      {chapter.isCompleted ? (
                        <Star size={16} fill="currentColor" />
                      ) : (
                        <span className="text-sm font-bold">{chapter.id}</span>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-gray-900">{chapter.title}</h3>
                      {chapter.requiredLevel && !chapter.isUnlocked && (
                        <p className="text-xs text-gray-500">レベル {chapter.requiredLevel} で解放</p>
                      )}
                    </div>
                  </div>
                  
                  {chapter.isUnlocked && (
                    <ChevronRight className="text-gray-400" size={20} />
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* チャプター詳細 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <AnimatePresence mode="wait">
              {selectedChapter ? (
                <motion.div
                  key={selectedChapter.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedChapter.isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-blue-500 text-white'
                    }`}>
                      {selectedChapter.isCompleted ? (
                        <Star size={20} fill="currentColor" />
                      ) : (
                        <BookOpen size={20} />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {selectedChapter.title}
                      </h2>
                      <div className="text-sm text-gray-600">
                        {selectedChapter.isCompleted ? 'クリア済み' : '進行中'}
                      </div>
                    </div>
                  </div>

                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {selectedChapter.description}
                    </p>
                  </div>

                  {selectedChapter.rewards && (
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h3 className="font-bold text-yellow-800 mb-2 flex items-center">
                        <Trophy size={16} className="mr-1" />
                        報酬
                      </h3>
                      <ul className="space-y-1">
                        {selectedChapter.rewards.map((reward, index) => (
                          <li key={index} className="text-sm text-yellow-700 flex items-center">
                            <Star size={12} className="mr-2 text-yellow-500" />
                            {reward}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!selectedChapter.isCompleted && selectedChapter.isUnlocked && (
                    <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                      チャプターを開始
                    </button>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">
                    チャプターを選択して詳細を表示
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}