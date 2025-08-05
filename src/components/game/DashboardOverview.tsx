'use client';

import { Users, Trophy, Target, Calendar } from 'lucide-react';
import { StatCard } from '../ui/StatCard';
import { QuickActionCard } from '../ui/QuickActionCard';
import { PokemonField } from './PokemonField';
import { TeamPreview } from './TeamPreview';
import { CardGameBoard } from '../card-system/CardGameBoard';

export function DashboardOverview() {
  const stats = [
    {
      title: '部員数',
      value: '12',
      subtitle: '/ 15名',
      icon: Users,
      color: 'blue' as const,
      trend: { value: 2, label: '今月+2名' }
    },
    {
      title: '今週の練習',
      value: '4',
      subtitle: '/ 7回',
      icon: Target,
      color: 'green' as const,
      trend: { value: 85, label: '参加率85%' }
    },
    {
      title: '勝率',
      value: '75%',
      subtitle: '3勝1敗',
      icon: Trophy,
      color: 'yellow' as const,
      trend: { value: 15, label: '先月比+15%' }
    },
    {
      title: '次の試合',
      value: '4',
      subtitle: '日後',
      icon: Calendar,
      color: 'purple' as const,
      trend: { value: 0, label: 'vs 青空高校' }
    }
  ];

  const quickActions = [
    {
      title: '練習を開始',
      description: '今日の練習メニューを選択して開始',
      icon: Target,
      href: '/training',
      color: 'green' as const
    },
    {
      title: '選手を確認',
      description: '部員の状態とスキルをチェック',
      icon: Users,
      href: '/players',
      color: 'blue' as const
    },
    {
      title: '試合準備',
      description: '次の試合に向けて戦略を立てる',
      icon: Trophy,
      href: '/matches',
      color: 'yellow' as const
    }
  ];

  return (
    <div className="space-y-8">
      {/* 栄冠ナイン式カードゲームボード */}
      <div>
        <CardGameBoard 
          initialReputation={0}
          initialYear={1}
          onGameStateChange={(gameState) => {
            console.log('Game state updated:', gameState);
          }}
        />
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* ポケモンテニスコート */}
      <div>
        <PokemonField />
      </div>

      {/* チームプレビュー */}
      <div>
        <TeamPreview />
      </div>

      {/* 最近の活動 */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 font-display">
          最近の活動
        </h2>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="space-y-4">
            {[
              { time: '2時間前', action: 'ピカチュウの電光石火が上達しました', type: 'success' },
              { time: '1日前', action: '青空高校との練習試合に勝利しました', type: 'success' },
              { time: '2日前', action: 'イーブイが新しい技「でんこうせっか」を覚えました', type: 'info' },
              { time: '3日前', action: '新入部員フシギダネが入部しました', type: 'info' }
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`
                  w-2 h-2 rounded-full mt-2 flex-shrink-0
                  ${activity.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}
                `} />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}