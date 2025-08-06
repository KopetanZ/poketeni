'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GameLayout } from '@/components/layout/GameLayout';
import { MatchCard } from '@/components/match/MatchCard';
import { MatchSimulation } from '@/components/match/MatchSimulation';
import { PlayerList } from '@/components/player/PlayerList';
import { useAuth } from '@/context/AuthContext';
import { usePlayerData } from '@/hooks/usePlayerData';
import { useMatchData } from '@/hooks/useMatchData';
import { supabase } from '@/lib/supabase';
import { Trophy, Calendar, Users, Plus, Filter, ArrowLeft, Zap } from 'lucide-react';
import type { Player, School, Match as FullMatch, MatchType } from '@/types/game';

// 簡単な試合用のインターフェース
interface SimpleMatch {
  id: string;
  opponent_school: string;
  match_date: string;
  match_type: MatchType;
  difficulty: number;
  venue: 'home' | 'away' | 'neutral';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  result?: 'win' | 'lose' | 'draw';
  score?: {
    our_points: number;
    opponent_points: number;
  };
  rewards?: {
    funds: number;
    reputation: number;
    experience: number;
  };
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

export default function MatchesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { players, loading: playersLoading, updatePlayer } = usePlayerData();
  const { 
    matches: realMatches, 
    loading: matchesLoading, 
    simulateNewMatch, 
    getMatchStatistics, 
    MATCH_SETTINGS 
  } = useMatchData();
  
  const [currentView, setCurrentView] = useState<'list' | 'team-selection' | 'simulation' | 'quick-match'>('list');
  const [matches, setMatches] = useState<SimpleMatch[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<SimpleMatch | null>(null);
  const [selectedRealMatch, setSelectedRealMatch] = useState<SimpleMatch | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [quickMatchPlayers, setQuickMatchPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed'>('all');
  const [loading, setLoading] = useState(true);
  const [schoolData, setSchoolData] = useState<School | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadSchoolData();
      generateMatches();
    }
  }, [user]);

  // 新しい試合統計を取得
  const matchStats = getMatchStatistics();

  const loadSchoolData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setSchoolData(data);
    } catch (error) {
      console.error('Error loading school data:', error);
    }
  };

  const generateMatches = async () => {
    setLoading(true);
    
    // ランダムな対戦相手を生成
    const opponentSchools = [
      '青葉学園', '桜ヶ丘高校', '雷鳴中学', '緑風学院', '星光高校',
      '海浜学園', '山頂中学', '虹ヶ丘高校', '風車学院', '月光高校',
      '太陽中学', '流星学園', '雲海高校', '森林中学', '花咲学院'
    ];

    const matchTypes: Array<'practice' | 'prefecture_preliminary' | 'prefecture_main'> = ['practice', 'prefecture_preliminary', 'prefecture_main'];
    const venues: Array<'home' | 'away' | 'neutral'> = ['home', 'away', 'neutral'];

    const generatedMatches: SimpleMatch[] = [];

    for (let i = 0; i < 10; i++) {
      const opponent = opponentSchools[Math.floor(Math.random() * opponentSchools.length)];
      const matchType = matchTypes[Math.floor(Math.random() * matchTypes.length)];
      const venue = venues[Math.floor(Math.random() * venues.length)];
      const difficulty = Math.floor(Math.random() * 5) + 1;
      
      // 日付をランダムに生成（今日から30日以内）
      const date = new Date();
      date.setDate(date.getDate() + Math.floor(Math.random() * 30));
      
      const status = Math.random() < 0.3 ? 'completed' : 'scheduled';
      
      let result: 'win' | 'lose' | 'draw' | undefined;
      let score: { our_points: number; opponent_points: number } | undefined;
      
      if (status === 'completed') {
        const outcomes = ['win', 'lose', 'draw'] as const;
        result = outcomes[Math.floor(Math.random() * outcomes.length)];
        score = {
          our_points: Math.floor(Math.random() * 3) + (result === 'win' ? 1 : 0),
          opponent_points: Math.floor(Math.random() * 3) + (result === 'lose' ? 1 : 0)
        };
      }

      const match: SimpleMatch = {
        id: `match-${i}`,
        opponent_school: opponent,
        match_date: date.toISOString(),
        match_type: matchType,
        difficulty,
        venue,
        status,
        result,
        score,
        rewards: {
          funds: Math.floor(Math.random() * 30000) + 10000,
          reputation: Math.floor(Math.random() * 20) + 5,
          experience: Math.floor(Math.random() * 50) + 20
        }
      };

      generatedMatches.push(match);
    }

    setMatches(generatedMatches);
    setLoading(false);
  };

  const handleJoinMatch = (match: SimpleMatch) => {
    setSelectedMatch(match);
    setCurrentView('team-selection');
  };

  const handlePlayerSelection = (pokemon: Player) => {
    setSelectedPlayers(prev => {
      if (prev.includes(pokemon.id)) {
        return prev.filter(id => id !== pokemon.id);
      } else if (prev.length < 6) { // 最大6名まで
        return [...prev, pokemon.id];
      }
      return prev;
    });
  };

  const startMatch = () => {
    if (selectedPlayers.length === 0) {
      alert('少なくとも1名のプレイヤーを選択してください');
      return;
    }
    setCurrentView('simulation');
  };

  const handleMatchComplete = async (result: MatchResult) => {
    try {
      // プレイヤーの経験値とコンディションを更新
      for (const playerStat of result.playerStats) {
        const pokemon = players.find(p => p.id === playerStat.pokemonId);
        if (!pokemon) continue;

        const experienceGain = result.rewards.experience / result.playerStats.length;
        let newCondition = pokemon.condition;
        if (playerStat.performance === 'excellent') {
          if (pokemon.condition === 'poor') newCondition = 'normal';
          else if (pokemon.condition === 'normal') newCondition = 'good';
          else if (pokemon.condition === 'good') newCondition = 'excellent';
        } else if (playerStat.performance === 'poor') {
          if (pokemon.condition === 'excellent') newCondition = 'good';
          else if (pokemon.condition === 'good') newCondition = 'normal';
          else if (pokemon.condition === 'normal') newCondition = 'poor';
        }

        await updatePlayer(playerStat.pokemonId, {
          condition: newCondition
        });
      }

      // 学校の資金と評判を更新
      if (schoolData) {
        await supabase
          .from('schools')
          .update({ 
            funds: schoolData.funds + result.rewards.funds,
            reputation: schoolData.reputation + result.rewards.reputation
          })
          .eq('id', schoolData.id);
        
        setSchoolData(prev => prev ? ({
          ...prev,
          funds: prev.funds + result.rewards.funds,
          reputation: prev.reputation + result.rewards.reputation
        }) : null);
      }

      // 試合結果を保存（実際の実装では matches テーブルに保存）
      alert(`試合${result.result === 'win' ? '勝利' : result.result === 'lose' ? '敗北' : '引き分け'}！報酬を獲得しました。`);
      
      // 試合リストに戻る
      setCurrentView('list');
      setSelectedMatch(null);
      setSelectedPlayers([]);
      
    } catch (error) {
      console.error('Error saving match result:', error);
      alert('試合結果の保存に失敗しました');
    }
  };

  // クイックマッチ機能
  const handleQuickMatch = () => {
    setCurrentView('quick-match');
  };

  const startQuickMatch = async () => {
    if (quickMatchPlayers.length !== 2) {
      alert('対戦する2名のプレイヤーを選択してください');
      return;
    }

    const [player1, player2] = quickMatchPlayers;
    const result = await simulateNewMatch(player1, player2, 'practice');
    
    if (result) {
      alert(`試合終了！${result.winner === 1 ? player1.pokemon_name : player2.pokemon_name}の勝利！`);
    }
    
    setCurrentView('list');
    setQuickMatchPlayers([]);
  };

  const handleQuickMatchPlayerSelect = (player: Player) => {
    setQuickMatchPlayers(prev => {
      if (prev.some(p => p.id === player.id)) {
        return prev.filter(p => p.id !== player.id);
      } else if (prev.length < 2) {
        return [...prev, player];
      }
      return prev;
    });
  };

  // 試合結果詳細表示
  const handleViewMatchResult = (match: SimpleMatch) => {
    setSelectedRealMatch(match);
    setIsResultModalOpen(true);
  };

  const handleCancel = () => {
    setCurrentView('list');
    setSelectedMatch(null);
    setSelectedPlayers([]);
  };

  const filteredMatches = matches.filter(match => {
    if (filter === 'all') return true;
    return match.status === filter;
  });

  const getSelectedPlayersData = () => {
    return players.filter(p => selectedPlayers.includes(p.id));
  };

  if (authLoading || playersLoading || loading || matchesLoading) {
    return (
      <GameLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-poke-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </GameLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <GameLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {currentView !== 'list' && (
              <button
                onClick={() => {
                  if (currentView === 'simulation') {
                    setCurrentView('team-selection');
                  } else {
                    setCurrentView('list');
                  }
                }}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
            )}
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-display">
                試合
              </h1>
              <p className="text-gray-600 mt-2">
                {currentView === 'list' && '試合管理 - 統計と履歴'}
                {currentView === 'team-selection' && 'チームメンバーを選択してください'}
                {currentView === 'simulation' && '試合進行中'}
                {currentView === 'quick-match' && 'クイックマッチ - 2名選択'}
              </p>
            </div>
          </div>
          
          {/* 学校情報 */}
          <div className="text-right">
            <div className="text-sm text-gray-500">資金 / 評判</div>
            <div className="text-xl font-bold text-gray-900">
              ¥{schoolData?.funds?.toLocaleString() || 0} / {schoolData?.reputation || 0}
            </div>
          </div>
        </div>

        {/* 試合管理 */}
        {currentView === 'list' && (
          <div className="space-y-6">
            {/* 統計サマリー */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm text-gray-600">総試合数</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {matchStats.totalMatches}
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-600">勝率</span>
                </div>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  {matchStats.winRate}%
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-gray-600">勝利数</span>
                </div>
                <div className="text-2xl font-bold text-blue-600 mt-1">
                  {matchStats.wonMatches}
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <span className="text-sm text-gray-600">平均時間</span>
                </div>
                <div className="text-2xl font-bold text-purple-600 mt-1">
                  {matchStats.averageMatchDuration}分
                </div>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">クイックアクション</h3>
                <button
                  onClick={handleQuickMatch}
                  className="bg-poke-blue-500 text-white px-4 py-2 rounded-lg hover:bg-poke-blue-600 transition-colors font-medium flex items-center space-x-2"
                >
                  <Zap className="h-4 w-4" />
                  <span>クイックマッチ</span>
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                2名のプレイヤーを選んで即座に試合をシミュレートできます
              </p>
            </div>

            {/* 試合履歴 */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">試合履歴</h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                {realMatches.length > 0 ? (
                  realMatches.slice(0, 10).map((match) => (
                    <div key={match.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${
                            match.winner_school_id === match.home_school_id ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <div>
                            <div className="font-medium text-gray-900">
                              {match.match_type} - {match.final_score}
                            </div>
                            <div className="text-sm text-gray-600">
                              {new Date(match.created_at).toLocaleDateString('ja-JP')}
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => {
                            // FullMatchをSimpleMatchに変換
                            const simpleMatch: SimpleMatch = {
                              id: match.id,
                              opponent_school: match.away_school_id || '対戦相手',
                              match_date: match.scheduled_at,
                              match_type: match.match_type,
                              difficulty: 3, // デフォルト値
                              venue: 'home', // デフォルト値
                              status: match.status === 'scheduled' ? 'scheduled' : 
                                     match.status === 'in_progress' ? 'in_progress' : 'completed',
                              result: match.winner_school_id ? 
                                     (match.winner_school_id === match.home_school_id ? 'win' : 'lose') : 
                                     undefined,
                              score: match.final_score ? {
                                our_points: parseInt(match.final_score.split('-')[0] || '0'),
                                opponent_points: parseInt(match.final_score.split('-')[1] || '0')
                              } : undefined
                            };
                            handleViewMatchResult(simpleMatch);
                          }}
                          className="text-poke-blue-600 hover:text-poke-blue-800 text-sm font-medium"
                        >
                          詳細を見る
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>まだ試合履歴がありません</p>
                    <p className="text-sm mt-1">クイックマッチで最初の試合を始めましょう</p>
                  </div>
                )}
              </div>
            </div>

            {/* 試合リスト */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMatches.map(match => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onJoin={handleJoinMatch}
                  onViewResult={(match) => console.log('View result:', match)}
                />
              ))}
            </div>

            {filteredMatches.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  該当する試合がありません
                </h3>
                <p className="text-gray-500">
                  フィルタを変更するか、新しい試合が追加されるまでお待ちください
                </p>
              </div>
            )}
          </div>
        )}

        {/* チーム選択 */}
        {currentView === 'team-selection' && selectedMatch && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                vs {selectedMatch.opponent_school}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">試合タイプ:</span>
                  <div className="font-medium">{selectedMatch.match_type}</div>
                </div>
                <div>
                  <span className="text-gray-500">難易度:</span>
                  <div className="font-medium">★{selectedMatch.difficulty}</div>
                </div>
                <div>
                  <span className="text-gray-500">会場:</span>
                  <div className="font-medium">{selectedMatch.venue}</div>
                </div>
                <div>
                  <span className="text-gray-500">選択中:</span>
                  <div className="font-medium">{selectedPlayers.length}/6名</div>
                </div>
              </div>
            </div>

            <PlayerList
              players={players.filter(p => p.condition !== 'terrible' && p.condition !== 'poor')} // 悪いコンディション以外
              onPlayerSelect={handlePlayerSelection}
              selectedPlayers={selectedPlayers}
              maxSelection={6}
              showStats={true}
              compact={true}
            />

            <div className="flex justify-center space-x-4">
              <button
                onClick={startMatch}
                disabled={selectedPlayers.length === 0}
                className="bg-poke-blue-500 text-white px-8 py-3 rounded-lg hover:bg-poke-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                試合開始 ({selectedPlayers.length}名選択中)
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        {/* クイックマッチ */}
        {currentView === 'quick-match' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                クイックマッチ - プレイヤー選択
              </h2>
              <div className="text-sm text-gray-600 mb-4">
                対戦する2名のプレイヤーを選択してください。選択後、自動的に試合がシミュレートされます。
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium">
                  選択中: {quickMatchPlayers.length}/2名
                </div>
                {quickMatchPlayers.map((player, index) => (
                  <div key={player.id} className="flex items-center space-x-2 bg-blue-100 rounded-lg px-3 py-1">
                    <span className="text-sm font-medium">{player.pokemon_name}</span>
                    <button
                      onClick={() => handleQuickMatchPlayerSelect(player)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <PlayerList
              players={players.filter(p => p.condition !== 'terrible')}
              onPlayerSelect={handleQuickMatchPlayerSelect}
              selectedPlayers={quickMatchPlayers.map(p => p.id)}
              maxSelection={2}
              showStats={true}
              compact={true}
            />

            <div className="flex justify-center space-x-4">
              <button
                onClick={startQuickMatch}
                disabled={quickMatchPlayers.length !== 2}
                className="bg-poke-blue-500 text-white px-8 py-3 rounded-lg hover:bg-poke-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Zap className="h-4 w-4" />
                <span>試合開始</span>
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        {/* 試合シミュレーション */}
        {currentView === 'simulation' && selectedMatch && (
          <MatchSimulation
            ourTeam={getSelectedPlayersData()}
            opponentSchool={selectedMatch.opponent_school}
            matchType={selectedMatch.match_type}
            onComplete={handleMatchComplete}
            onCancel={handleCancel}
          />
        )}

        {/* 試合結果詳細モーダル (簡易版) */}
        {selectedRealMatch && isResultModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold mb-4">試合結果</h3>
              <p className="mb-2">対戦相手: {selectedRealMatch.opponent_school}</p>
              <p className="mb-2">日時: {new Date(selectedRealMatch.match_date).toLocaleDateString('ja-JP')}</p>
              <p className="mb-4">結果: {selectedRealMatch.result === 'win' ? '勝利' : selectedRealMatch.result === 'lose' ? '敗北' : '引き分け'}</p>
              <button
                onClick={() => {
                  setIsResultModalOpen(false);
                  setSelectedRealMatch(null);
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                閉じる
              </button>
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
}