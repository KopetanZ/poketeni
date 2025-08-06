'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Award, Clock, Target, Zap, TrendingUp, Activity } from 'lucide-react';
import { getPokemonImageUrl } from '@/lib/pokemon-api';
import type { Match, Player } from '@/types/game';

interface MatchResultModalProps {
  isOpen: boolean;
  match: Match | null;
  homePlayer: Player | null;
  awayPlayer: Player | null;
  onClose: () => void;
}

export function MatchResultModal({ 
  isOpen, 
  match, 
  homePlayer, 
  awayPlayer, 
  onClose 
}: MatchResultModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'log'>('overview');

  if (!isOpen || !match || !homePlayer || !awayPlayer) return null;

  const isHomeWinner = match.winner_school_id === match.home_school_id;
  const winnerPlayer = isHomeWinner ? homePlayer : awayPlayer;
  const loserPlayer = isHomeWinner ? awayPlayer : homePlayer;

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}時間${mins}分` : `${mins}分`;
  };

  const getMatchTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      'practice': '練習試合',
      'prefecture_preliminary': '県予選',
      'prefecture_main': '県大会本戦',
      'regional': '地区大会',
      'national': '全国大会'
    };
    return typeMap[type] || type;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ヘッダー */}
          <div className={`${isHomeWinner ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-gradient-to-r from-red-500 to-orange-500'} text-white p-6`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <Trophy className="w-12 h-12 mx-auto mb-2" />
                  <div className="text-2xl font-bold">試合結果</div>
                  <div className="text-sm opacity-90">{getMatchTypeLabel(match.match_type)}</div>
                </div>
                
                <div className="flex items-center space-x-8">
                  {/* 勝者 */}
                  <div className="text-center">
                    <div className="relative">
                      <img
                        src={getPokemonImageUrl(winnerPlayer.pokemon_id)}
                        alt={winnerPlayer.pokemon_name}
                        className="w-20 h-20 object-contain mx-auto"
                      />
                      <div className="absolute -top-2 -right-2 bg-yellow-400 text-black rounded-full p-2">
                        <Award className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-lg font-bold mt-2">{winnerPlayer.pokemon_name}</div>
                    <div className="text-sm opacity-90">勝利</div>
                  </div>

                  <div className="text-4xl font-bold">VS</div>

                  {/* 敗者 */}
                  <div className="text-center opacity-75">
                    <img
                      src={getPokemonImageUrl(loserPlayer.pokemon_id)}
                      alt={loserPlayer.pokemon_name}
                      className="w-20 h-20 object-contain mx-auto"
                    />
                    <div className="text-lg font-bold mt-2">{loserPlayer.pokemon_name}</div>
                    <div className="text-sm opacity-90">敗北</div>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* タブナビゲーション */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'overview', name: '概要', icon: Trophy },
                { id: 'stats', name: '詳細統計', icon: TrendingUp },
                { id: 'log', name: '試合ログ', icon: Activity }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors
                    ${activeTab === tab.id 
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
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

          {/* コンテンツエリア */}
          <div className="p-6 overflow-y-auto max-h-96">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* 基本情報 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <div className="text-lg font-bold text-blue-900">
                      {formatDuration(match.statistics?.total_duration || 0)}
                    </div>
                    <div className="text-sm text-blue-700">試合時間</div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <Target className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <div className="text-lg font-bold text-green-900">
                      {match.statistics?.total_aces || 0}
                    </div>
                    <div className="text-sm text-green-700">エース数</div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <Award className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                    <div className="text-lg font-bold text-purple-900">
                      {match.match_type}
                    </div>
                    <div className="text-sm text-purple-700">試合種別</div>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                    <div className="text-lg font-bold text-yellow-900">
                      {match.final_score?.split(',').length || 0}
                    </div>
                    <div className="text-sm text-yellow-700">セット数</div>
                  </div>
                </div>

                {/* 最終スコア */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 text-center">最終スコア</h3>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {match.final_score}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(match.completed_at || match.created_at).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long'
                      })}
                    </div>
                  </div>
                </div>

                {/* 選手パフォーマンス */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <img
                        src={getPokemonImageUrl(homePlayer.pokemon_id)}
                        alt={homePlayer.pokemon_name}
                        className="w-12 h-12 object-contain"
                      />
                      <div>
                        <h4 className="font-semibold">{homePlayer.pokemon_name}</h4>
                        <div className="text-sm text-gray-600">
                          {isHomeWinner ? '勝利' : '敗北'}
                        </div>
                      </div>
                    </div>
                    <div className="text-center text-sm text-gray-600">
                      {isHomeWinner ? '勝利プレイヤーとして活躍しました！' : '健闘しました！'}
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <img
                        src={getPokemonImageUrl(awayPlayer.pokemon_id)}
                        alt={awayPlayer.pokemon_name}
                        className="w-12 h-12 object-contain"
                      />
                      <div>
                        <h4 className="font-semibold">{awayPlayer.pokemon_name}</h4>
                        <div className="text-sm text-gray-600">
                          {!isHomeWinner ? '勝利' : '敗北'}
                        </div>
                      </div>
                    </div>
                    <div className="text-center text-sm text-gray-600">
                      {!isHomeWinner ? '勝利プレイヤーとして活躍しました！' : '健闘しました！'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">詳細統計</h3>
                
                {/* 基本統計 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">試合統計</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>総エース数:</span>
                      <span className="font-bold">{match.statistics?.total_aces || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ウィナー数:</span>
                      <span className="font-bold">{match.statistics?.winners || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>エラー数:</span>
                      <span className="font-bold">{match.statistics?.unforced_errors || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'log' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">試合ログ</h3>
                
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {match.match_log && match.match_log.length > 0 ? (
                    match.match_log.map((log, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start space-x-3">
                          <div className="text-xs text-gray-500 font-mono min-w-12">
                            {log.time}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              {log.event === 'match_start' && '試合開始'}
                              {log.event === 'set_complete' && `第${log.details.set_number}セット終了`}
                              {log.event === 'match_end' && '試合終了'}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {log.event === 'set_complete' && (
                                <>
                                  スコア: {log.details.score}
                                  {log.details.tiebreak && ` (タイブレーク: ${log.details.tiebreak})`}
                                  - 勝者: {log.details.winner}
                                </>
                              )}
                              {log.event === 'match_end' && (
                                <>
                                  勝者: {log.details.winner} | 最終スコア: {log.details.final_score}
                                </>
                              )}
                              {log.event === 'match_start' && (
                                <>
                                  {log.details.players?.join(' vs ')} ({log.details.match_type})
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      試合ログがありません
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}