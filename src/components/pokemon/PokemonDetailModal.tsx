'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, TrendingUp, Zap, Heart, Activity, Shield, Award } from 'lucide-react';
import { fetchPokemonData, fetchPokemonSpecies, getPokemonImageUrl, getJapaneseName } from '@/lib/pokemon-api';
import type { Player } from '@/types/game';

interface PokemonDetailModalProps {
  isOpen: boolean;
  player: Player | null;
  onClose: () => void;
}

export function PokemonDetailModal({ isOpen, player, onClose }: PokemonDetailModalProps) {
  const [pokemonData, setPokemonData] = useState<any>(null);
  const [speciesData, setSpeciesData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'moves' | 'history'>('stats');

  useEffect(() => {
    if (isOpen && player) {
      loadPokemonDetails();
    }
  }, [isOpen, player]);

  const loadPokemonDetails = async () => {
    if (!player) return;

    try {
      setLoading(true);
      const [pokemon, species] = await Promise.all([
        fetchPokemonData(player.pokemon_id),
        fetchPokemonSpecies(player.pokemon_id)
      ]);
      setPokemonData(pokemon);
      setSpeciesData(species);
    } catch (error) {
      console.error('Error loading Pokemon details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      normal: 'bg-gray-400',
      fire: 'bg-red-500',
      water: 'bg-blue-500',
      electric: 'bg-yellow-400',
      grass: 'bg-green-500',
      ice: 'bg-blue-200',
      fighting: 'bg-red-700',
      poison: 'bg-purple-500',
      ground: 'bg-yellow-600',
      flying: 'bg-indigo-400',
      psychic: 'bg-pink-500',
      bug: 'bg-green-400',
      rock: 'bg-yellow-800',
      ghost: 'bg-purple-700',
      dragon: 'bg-indigo-700',
      dark: 'bg-gray-800',
      steel: 'bg-gray-600',
      fairy: 'bg-pink-300'
    };
    return typeColors[type] || 'bg-gray-400';
  };

  const getTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      normal: 'ノーマル', fire: 'ほのお', water: 'みず', electric: 'でんき',
      grass: 'くさ', ice: 'こおり', fighting: 'かくとう', poison: 'どく',
      ground: 'じめん', flying: 'ひこう', psychic: 'エスパー', bug: 'むし',
      rock: 'いわ', ghost: 'ゴースト', dragon: 'ドラゴン', dark: 'あく',
      steel: 'はがね', fairy: 'フェアリー'
    };
    return typeLabels[type] || type;
  };

  const getStatBar = (value: number, max: number = 100) => {
    const percentage = Math.min((value / max) * 100, 100);
    return (
      <div className="flex items-center space-x-2">
        <div className="w-16 text-right font-mono text-sm">{value}</div>
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="w-8 text-xs text-gray-500">{Math.round(percentage)}</div>
      </div>
    );
  };

  const calculateOverallRating = () => {
    if (!player) return 0;
    const total = player.serve_skill + player.return_skill + player.volley_skill + 
                  player.stroke_skill + player.mental + player.stamina;
    return Math.round((total / 600) * 100);
  };

  const getFlavorText = () => {
    if (!speciesData) return '';
    const japaneseEntry = speciesData.flavor_text_entries?.find(
      (entry: any) => entry.language.name === 'ja-Hrkt'
    );
    return japaneseEntry?.flavor_text || '';
  };

  if (!isOpen || !player) return null;

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
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={getPokemonImageUrl(player.pokemon_id)}
                    alt={player.pokemon_name}
                    className="w-20 h-20 object-contain"
                  />
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center">
                    {player.level}
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{player.pokemon_name}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-3 py-1 text-xs font-medium text-white rounded ${getTypeColor(player.pokemon_type_1)}`}>
                      {getTypeLabel(player.pokemon_type_1)}
                    </span>
                    {player.pokemon_type_2 && (
                      <span className={`px-3 py-1 text-xs font-medium text-white rounded ${getTypeColor(player.pokemon_type_2)}`}>
                        {getTypeLabel(player.pokemon_type_2)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>総合評価: {calculateOverallRating()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Award className="w-4 h-4" />
                      <span>{player.position === 'captain' ? 'キャプテン' : 
                              player.position === 'vice_captain' ? '副キャプテン' :
                              player.position === 'regular' ? 'レギュラー' : '部員'}</span>
                    </div>
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
                { id: 'stats', name: 'ステータス', icon: TrendingUp },
                { id: 'moves', name: '技・特性', icon: Zap },
                { id: 'history', name: '戦績・履歴', icon: Activity }
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
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {activeTab === 'stats' && (
                  <div className="space-y-6">
                    {/* 基本能力値 */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                        基本能力値
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">パワー</div>
                          {getStatBar(player.power)}
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">テクニック</div>
                          {getStatBar(player.technique)}
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">スピード</div>
                          {getStatBar(player.speed)}
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">スタミナ</div>
                          {getStatBar(player.stamina)}
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">メンタル</div>
                          {getStatBar(player.mental)}
                        </div>
                      </div>
                    </div>

                    {/* テニス技術 */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-orange-600" />
                        テニス技術
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">サーブ</div>
                          {getStatBar(player.serve_skill)}
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">リターン</div>
                          {getStatBar(player.return_skill)}
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">ボレー</div>
                          {getStatBar(player.volley_skill)}
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">ストローク</div>
                          {getStatBar(player.stroke_skill)}
                        </div>
                      </div>
                    </div>

                    {/* 戦術理解 */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-green-600" />
                        戦術理解
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">シングルス適性</div>
                          {getStatBar(player.singles_aptitude)}
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">ダブルス適性</div>
                          {getStatBar(player.doubles_aptitude)}
                        </div>
                        <div className="col-span-full">
                          <div className="text-sm text-gray-600 mb-1">戦術理解度</div>
                          {getStatBar(player.tactical_understanding)}
                        </div>
                      </div>
                    </div>

                    {/* ポケモン図鑑情報 */}
                    {pokemonData && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">ポケモン図鑑</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">高さ:</span>
                              <span className="ml-2">{pokemonData.height / 10}m</span>
                            </div>
                            <div>
                              <span className="text-gray-600">重さ:</span>
                              <span className="ml-2">{pokemonData.weight / 10}kg</span>
                            </div>
                          </div>
                          {getFlavorText() && (
                            <p className="mt-4 text-sm text-gray-700 leading-relaxed">
                              {getFlavorText()}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'moves' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">習得技</h3>
                      <div className="grid gap-3">
                        {player.learned_moves && player.learned_moves.length > 0 ? (
                          player.learned_moves.map((move: any, index: number) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{move.name}</h4>
                                <span className={`px-2 py-1 text-xs text-white rounded ${getTypeColor(move.type)}`}>
                                  {getTypeLabel(move.type)}
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-4 mt-2 text-sm text-gray-600">
                                <div>威力: {move.power || '---'}</div>
                                <div>命中: {move.accuracy || '---'}</div>
                                <div>カテゴリ: {move.category}</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">習得技がありません</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">特性・性格</h3>
                      <div className="grid gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-medium text-blue-900">特性: {player.ability?.name || '---'}</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            {player.ability?.description || '特性の説明がありません'}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <h4 className="font-medium text-green-900">性格: {player.nature?.name || '---'}</h4>
                          <p className="text-sm text-green-700 mt-1">
                            {player.nature?.description || '性格の説明がありません'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">試合戦績</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">{player.matches_played}</div>
                          <div className="text-sm text-blue-700">総試合数</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">{player.matches_won}</div>
                          <div className="text-sm text-green-700">勝利数</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-purple-600">{player.sets_won}</div>
                          <div className="text-sm text-purple-700">セット勝利</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-gray-600">
                            {player.matches_played > 0 ? Math.round((player.matches_won / player.matches_played) * 100) : 0}%
                          </div>
                          <div className="text-sm text-gray-700">勝率</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">成長記録</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">現在レベル:</span>
                            <span className="ml-2 font-medium">{player.level}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">経験値:</span>
                            <span className="ml-2 font-medium">{player.experience}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">入部日:</span>
                            <span className="ml-2">{new Date(player.join_date).toLocaleDateString('ja-JP')}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">学年:</span>
                            <span className="ml-2">{player.grade}年生</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}