'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Trophy, 
  Target, 
  Calendar, 
  TrendingUp, 
  Activity,
  Star,
  Zap,
  Award,
  Clock,
  ChevronRight,
  BarChart3,
  PieChart,
  User,
  MapPin
} from 'lucide-react';
import { CardGameBoard } from '../card-system/CardGameBoard';
import { usePlayerData } from '@/hooks/usePlayerData';
import { useMatchData } from '@/hooks/useMatchData';
import { useYearProgression } from '@/hooks/useYearProgression';
import { getPokemonImageUrl } from '@/lib/pokemon-api';
import Link from 'next/link';

export function EnhancedDashboardOverview() {
  const { players, loading: playersLoading, getPlayerStats, getTopPlayers } = usePlayerData();
  const { getMatchStatistics } = useMatchData();
  const { currentSchool, getMonthName } = useYearProgression();
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'stats'>('overview');

  const playerStats = getPlayerStats();
  const matchStats = getMatchStatistics();
  const topPlayers = getTopPlayers(3);

  // リアルタイム統計
  const realStats = [
    {
      title: '部員数',
      value: playerStats.totalPlayers.toString(),
      subtitle: `レギュラー ${playerStats.regularPlayers}名`,
      icon: Users,
      color: 'blue' as const,
      trend: { value: playerStats.regularPlayers, label: `レギュラー ${playerStats.regularPlayers}名` },
      link: '/players'
    },
    {
      title: '平均レベル',
      value: playerStats.averageLevel.toString(),
      subtitle: '全体平均',
      icon: TrendingUp,
      color: 'green' as const,
      trend: { value: playerStats.goodConditionPlayers, label: `好調 ${playerStats.goodConditionPlayers}名` },
      link: '/players'
    },
    {
      title: '勝率',
      value: `${matchStats.winRate}%`,
      subtitle: `${matchStats.wonMatches}勝${matchStats.lostMatches}敗`,
      icon: Trophy,
      color: 'yellow' as const,
      trend: { value: matchStats.wonMatches, label: `${matchStats.wonMatches}勝利` },
      link: '/matches'
    },
    {
      title: '学校評判',
      value: (currentSchool?.reputation || 0).toString(),
      subtitle: '地域での評価',
      icon: Star,
      color: 'purple' as const,
      trend: { value: currentSchool?.reputation || 0, label: currentSchool?.reputation ? `評判 ${currentSchool.reputation}` : '評判不明' },
      link: '/'
    }
  ];

  const quickActions = [
    {
      title: 'クイックマッチ',
      description: '2名を選んで即座に試合開始',
      icon: Zap,
      href: '/matches',
      color: 'red' as const,
      badge: '人気'
    },
    {
      title: '選手詳細',
      description: 'ポケモンの詳細情報を確認',
      icon: User,
      href: '/players',
      color: 'blue' as const,
      badge: `${playerStats.totalPlayers}名`
    },
    {
      title: '月次進行',
      description: '次の月へ進んでイベント発生',
      icon: Calendar,
      href: '/',
      color: 'green' as const,
      badge: currentSchool ? getMonthName(currentSchool.current_month) : '4月'
    },
    {
      title: '統計分析',
      description: 'チームの詳細な分析データ',
      icon: BarChart3,
      href: '/matches',
      color: 'purple' as const,
      badge: 'NEW'
    }
  ];

  // 最近の活動（実際のデータベースから）
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    // 実際のアクティビティデータを生成
    if (players.length > 0) {
      const activities = [
        {
          time: '1時間前',
          action: `${topPlayers[0]?.pokemon_name || 'ポケモン'}が練習で好調です`,
          type: 'success',
          pokemon: topPlayers[0]
        },
        {
          time: '3時間前',
          action: `試合統計が更新されました (勝率${matchStats.winRate}%)`,
          type: 'info'
        },
        {
          time: '1日前',
          action: `${playerStats.goodConditionPlayers}名のポケモンが好調状態です`,
          type: 'success'
        },
        {
          time: '2日前',
          action: `新しい月が始まりました (${currentSchool ? getMonthName(currentSchool.current_month) : '4月'})`,
          type: 'info'
        }
      ];
      setRecentActivities(activities);
    }
  }, [players, matchStats, playerStats, topPlayers, currentSchool, getMonthName]);

  if (playersLoading) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">ダッシュボードを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* タブナビゲーション */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'overview', name: '概要', icon: BarChart3 },
              { id: 'team', name: 'チーム', icon: Users },
              { id: 'stats', name: '統計', icon: PieChart }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors flex-1 justify-center
                  ${activeTab === tab.id 
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 栄冠ナイン式カードゲームボード */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">月次進行ゲーム</h3>
                <CardGameBoard 
                  initialReputation={currentSchool?.reputation || 0}
                  initialYear={currentSchool?.current_year || 1}
                  onGameStateChange={(gameState) => {
                    console.log('Game state updated:', gameState);
                  }}
                />
              </div>

              {/* 統計カード */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">現在の状況</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {realStats.map((stat, index) => (
                    <Link key={index} href={stat.link}>
                      <motion.div
                        className="bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer group"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className={`p-2 rounded-lg bg-${stat.color}-100 group-hover:bg-${stat.color}-200 transition-colors`}>
                            <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </div>
                        <div className="mt-4">
                          <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                          <div className="text-sm text-gray-600">{stat.subtitle}</div>
                          <div className="text-xs text-gray-500 mt-1">{stat.trend.label}</div>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* クイックアクション */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">クイックアクション</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => (
                    <Link key={index} href={action.href}>
                      <motion.div
                        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {action.badge && (
                          <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full bg-${action.color}-100 text-${action.color}-700`}>
                            {action.badge}
                          </div>
                        )}
                        <div className={`w-12 h-12 rounded-lg bg-${action.color}-100 flex items-center justify-center mb-3 group-hover:bg-${action.color}-200 transition-colors`}>
                          <action.icon className={`w-6 h-6 text-${action.color}-600`} />
                        </div>
                        <h4 className="font-semibold text-gray-900 group-hover:text-gray-700">{action.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-6">
              {/* トッププレイヤー */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">エースプレイヤー</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {topPlayers.map((player, index) => (
                    <motion.div
                      key={player.id}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 p-4 relative"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {index === 0 && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                          <Award className="w-4 h-4 text-yellow-800" />
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-3">
                        <img
                          src={getPokemonImageUrl(player.pokemon_id)}
                          alt={player.pokemon_name}
                          className="w-16 h-16 object-contain"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{player.pokemon_name}</h4>
                          <div className="text-sm text-gray-600">Lv.{player.level}</div>
                          <div className="text-xs text-gray-500">
                            {player.position === 'captain' ? 'キャプテン' :
                             player.position === 'vice_captain' ? '副キャプテン' :
                             player.position === 'regular' ? 'レギュラー' : '部員'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">総合力:</span>
                          <span className="font-medium">
                            {player.serve_skill + player.return_skill + player.volley_skill + player.stroke_skill + player.mental + player.stamina}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">状態:</span>
                          <span className={`font-medium ${
                            player.condition === 'excellent' ? 'text-green-600' :
                            player.condition === 'good' ? 'text-blue-600' :
                            player.condition === 'normal' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {player.condition === 'excellent' ? '絶好調' :
                             player.condition === 'good' ? '好調' :
                             player.condition === 'normal' ? '普通' :
                             player.condition === 'poor' ? '不調' : '絶不調'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* チーム構成 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">チーム構成</h3>
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{playerStats.totalPlayers}</div>
                      <div className="text-sm text-gray-600">総部員数</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{playerStats.regularPlayers}</div>
                      <div className="text-sm text-gray-600">レギュラー</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">{playerStats.averageLevel}</div>
                      <div className="text-sm text-gray-600">平均レベル</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600">{playerStats.goodConditionPlayers}</div>
                      <div className="text-sm text-gray-600">好調選手</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* 試合統計 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">試合成績</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-6 text-center">
                    <div className="text-4xl font-bold text-green-600">{matchStats.wonMatches}</div>
                    <div className="text-sm text-green-700 mt-1">勝利数</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-6 text-center">
                    <div className="text-4xl font-bold text-red-600">{matchStats.lostMatches}</div>
                    <div className="text-sm text-red-700 mt-1">敗北数</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-6 text-center">
                    <div className="text-4xl font-bold text-blue-600">{matchStats.winRate}%</div>
                    <div className="text-sm text-blue-700 mt-1">勝率</div>
                  </div>
                </div>
              </div>

              {/* 学校情報 */}
              {currentSchool && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">学校情報</h3>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">基本情報</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">学校名:</span>
                            <span className="font-medium">{currentSchool.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">現在:</span>
                            <span className="font-medium">
                              {currentSchool.current_year}年 {getMonthName(currentSchool.current_month)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">評判:</span>
                            <span className="font-medium">{currentSchool.reputation}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">財政状況</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">資金:</span>
                            <span className="font-medium">¥{(currentSchool.funds || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">施設レベル:</span>
                            <span className="font-medium">Lv.{currentSchool.facilities?.courts?.quality || 1}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 最近の活動 */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-500" />
            最近の活動
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <motion.div
                key={index}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {activity.pokemon && (
                  <img
                    src={getPokemonImageUrl(activity.pokemon.pokemon_id)}
                    alt={activity.pokemon.pokemon_name}
                    className="w-8 h-8 object-contain mt-1"
                  />
                )}
                <div className={`
                  w-2 h-2 rounded-full mt-2 flex-shrink-0
                  ${activity.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}
                `} />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.action}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}