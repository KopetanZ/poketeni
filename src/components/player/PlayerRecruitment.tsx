'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Users, TrendingUp, RefreshCw } from 'lucide-react';
import { PlayerCard } from './PlayerCard';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Player } from '@/types/game';

interface RecruitmentCandidate extends Omit<Player, 'id' | 'school_id'> {
  recruitment_cost: number;
  recruitment_difficulty: 'easy' | 'normal' | 'hard';
  special_condition?: string;
}

export function PlayerRecruitment() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<RecruitmentCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [recruiting, setRecruiting] = useState<string | null>(null);
  const [schoolData, setSchoolData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadSchoolData();
      generateCandidates();
    }
  }, [user]);

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

  const generateCandidates = async () => {
    setLoading(true);
    
    // ランダムなポケモン候補を生成
    const pokemonIds = Array.from({ length: 6 }, () => Math.floor(Math.random() * 151) + 1);
    const newCandidates: RecruitmentCandidate[] = [];

    for (const pokemonId of pokemonIds) {
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        const pokemonData = await response.json();
        
        const speciesResponse = await fetch(pokemonData.species.url);
        const speciesData = await speciesResponse.json();
        
        const japaneseName = speciesData.names.find((name: any) => name.language.name === 'ja')?.name || pokemonData.name;

        // ランダムな能力値生成
        const baseStats = {
          serve: Math.floor(Math.random() * 50) + 30,
          return: Math.floor(Math.random() * 50) + 30,
          volley: Math.floor(Math.random() * 50) + 30,
          stroke: Math.floor(Math.random() * 50) + 30,
          mental: Math.floor(Math.random() * 50) + 30,
          stamina: Math.floor(Math.random() * 50) + 30,
        };

        // 難易度とコストを決定
        const totalStats = Object.values(baseStats).reduce((sum, stat) => sum + stat, 0);
        let difficulty: 'easy' | 'normal' | 'hard';
        let cost: number;

        if (totalStats < 200) {
          difficulty = 'easy';
          cost = Math.floor(Math.random() * 20000) + 10000;
        } else if (totalStats < 250) {
          difficulty = 'normal';
          cost = Math.floor(Math.random() * 40000) + 30000;
        } else {
          difficulty = 'hard';
          cost = Math.floor(Math.random() * 80000) + 50000;
        }

        const candidate: RecruitmentCandidate = {
          pokemon_id: pokemonId,
          pokemon_name: japaneseName,
          pokemon_type_1: 'normal', // Default type, should be fetched from API
          custom_name: undefined,
          grade: 1,
          position: 'member',
          join_date: new Date().toISOString(),
          level: Math.floor(Math.random() * 10) + 1,
          experience: 0,
          evolution_stage: 0,
          power: baseStats.serve,
          technique: baseStats.return,
          speed: baseStats.volley,
          stamina: baseStats.stamina,
          mental: baseStats.mental,
          serve_skill: baseStats.serve,
          volley_skill: baseStats.volley,
          stroke_skill: baseStats.stroke,
          return_skill: baseStats.return,
          singles_aptitude: 50,
          doubles_aptitude: 50,
          tactical_understanding: 50,
          iv_power: 15,
          iv_technique: 15,
          iv_speed: 15,
          iv_stamina: 15,
          iv_mental: 15,
          ev_power: 0,
          ev_technique: 0,
          ev_speed: 0,
          ev_stamina: 0,
          ev_mental: 0,
          nature: { name: 'Hardy', description: 'No stat changes' },
          ability: { name: 'Run Away', description: 'Ensures fleeing from wild Pokemon', effects: {} },
          condition: 'normal' as const,
          physical_fatigue: 0,
          mental_fatigue: 0,
          accumulated_fatigue: 0,
          motivation: 80,
          learned_moves: [],
          move_slots: 4,
          matches_played: 0,
          matches_won: 0,
          sets_won: 0,
          sets_lost: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          recruitment_cost: cost,
          recruitment_difficulty: difficulty,
        };

        // 特別条件をランダムで追加
        if (Math.random() < 0.3) {
          const conditions = [
            '評判50以上が必要',
            'コート2面以上が必要',
            '他の特定ポケモンが必要',
            '特別な施設が必要'
          ];
          candidate.special_condition = conditions[Math.floor(Math.random() * conditions.length)];
        }

        newCandidates.push(candidate);
      } catch (error) {
        console.error(`Error fetching Pokemon ${pokemonId}:`, error);
      }
    }

    setCandidates(newCandidates);
    setLoading(false);
  };

  const handleRecruit = async (candidate: RecruitmentCandidate) => {
    if (!user || !schoolData) return;

    if (schoolData.funds < candidate.recruitment_cost) {
      alert('資金が不足しています');
      return;
    }

    setRecruiting(candidate.pokemon_name);

    try {
      // 学校の資金を減らす
      const { error: schoolError } = await supabase
        .from('schools')
        .update({ funds: schoolData.funds - candidate.recruitment_cost })
        .eq('id', schoolData.id);

      if (schoolError) throw schoolError;

      // ポケモンを追加
      const { error: pokemonError } = await supabase
        .from('players')
        .insert({
          school_id: schoolData.id,
          pokemon_id: candidate.pokemon_id,
          pokemon_name: candidate.pokemon_name,
          pokemon_type_1: candidate.pokemon_type_1,
          grade: candidate.grade,
          position: candidate.position,
          join_date: candidate.join_date,
          level: candidate.level,
          serve_skill: candidate.serve_skill,
          volley_skill: candidate.volley_skill,
          stroke_skill: candidate.stroke_skill,
          return_skill: candidate.return_skill,
          condition: candidate.condition,
        });

      if (pokemonError) throw pokemonError;

      // 成功時の処理
      alert(`${candidate.pokemon_name}をスカウトしました！`);
      
      // データを更新
      await loadSchoolData();
      
      // 候補から削除
      setCandidates(prev => prev.filter(c => c.pokemon_name !== candidate.pokemon_name));
      
    } catch (error) {
      console.error('Error recruiting Pokemon:', error);
      alert('スカウトに失敗しました');
    } finally {
      setRecruiting(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700';
      case 'normal':
        return 'bg-yellow-100 text-yellow-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '簡単';
      case 'normal':
        return '普通';
      case 'hard':
        return '困難';
      default:
        return '不明';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-poke-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">スカウト候補を探しています...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-display">
              スカウト
            </h1>
            <p className="text-gray-600 mt-2">
              新しいポケモンをチームに加えましょう
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500">現在の資金</div>
            <div className="text-2xl font-bold text-green-600">
              ¥{schoolData?.funds?.toLocaleString() || 0}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center space-x-4">
          <button
            onClick={generateCandidates}
            disabled={loading}
            className="flex items-center space-x-2 bg-poke-blue-500 text-white px-4 py-2 rounded-lg hover:bg-poke-blue-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>候補を更新</span>
          </button>
          
          <div className="text-sm text-gray-500">
            毎日新しい候補が現れます
          </div>
        </div>
      </div>

      {/* スカウト候補 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {candidates.map((candidate) => {
            const totalStats = candidate.serve_skill + candidate.return_skill + candidate.volley_skill + candidate.stroke_skill + candidate.mental + candidate.stamina;
            
            return (
              <motion.div
                key={candidate.pokemon_name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* カード上部 */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${candidate.pokemon_id}.png`}
                      alt={candidate.pokemon_name}
                      className="w-16 h-16 object-contain"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{candidate.pokemon_name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-500">Lv.{candidate.level}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(candidate.recruitment_difficulty)}`}>
                          {getDifficultyLabel(candidate.recruitment_difficulty)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ステータス */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">総合力</span>
                    <span className="font-medium">{totalStats}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">コンディション</span>
                    <span className="font-medium">{candidate.condition}%</span>
                  </div>
                  
                  {/* 特別条件 */}
                  {candidate.special_condition && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-xs text-yellow-700">{candidate.special_condition}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* スカウトボタン */}
                <div className="p-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">スカウト費用</span>
                    <span className="text-lg font-bold text-green-600">
                      ¥{candidate.recruitment_cost.toLocaleString()}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleRecruit(candidate)}
                    disabled={!schoolData || schoolData.funds < candidate.recruitment_cost || recruiting === candidate.pokemon_name}
                    className="w-full bg-poke-blue-500 text-white py-2 rounded-lg hover:bg-poke-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {recruiting === candidate.pokemon_name ? (
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>スカウト中...</span>
                      </div>
                    ) : schoolData && schoolData.funds < candidate.recruitment_cost ? (
                      '資金不足'
                    ) : (
                      'スカウト'
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {candidates.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            スカウト候補がいません
          </h3>
          <p className="text-gray-500 mb-4">
            候補を更新して新しいポケモンを探してみましょう
          </p>
          <button
            onClick={generateCandidates}
            className="bg-poke-blue-500 text-white px-6 py-2 rounded-lg hover:bg-poke-blue-600 transition-colors"
          >
            候補を更新
          </button>
        </div>
      )}
    </div>
  );
}