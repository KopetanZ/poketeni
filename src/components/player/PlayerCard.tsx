'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, TrendingUp, Zap, Activity, Heart, Shield } from 'lucide-react';
import { getPokemonImageUrl } from '@/lib/pokemon-api';
import type { Player } from '@/types/game';

interface PlayerCardProps {
  pokemon: Player;
  onSelect?: (pokemon: Player) => void;
  selected?: boolean;
  showStats?: boolean;
  compact?: boolean;
}

export function PlayerCard({ 
  pokemon, 
  onSelect, 
  selected = false, 
  showStats = true,
  compact = false 
}: PlayerCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    if (onSelect) {
      onSelect(pokemon);
    }
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'captain':
        return 'bg-yellow-100 text-yellow-800';
      case 'vice_captain':
        return 'bg-orange-100 text-orange-700';
      case 'regular':
        return 'bg-blue-100 text-blue-700';
      case 'member':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPositionLabel = (position: string) => {
    switch (position) {
      case 'captain':
        return 'キャプテン';
      case 'vice_captain':
        return '副キャプテン';
      case 'regular':
        return 'レギュラー';
      case 'member':
        return '部員';
      default:
        return '部員';
    }
  };

  const getTotalStats = () => {
    return pokemon.serve_skill + 
           pokemon.return_skill + 
           pokemon.volley_skill + 
           pokemon.stroke_skill + 
           pokemon.mental + 
           pokemon.stamina;
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
      normal: 'ノーマル',
      fire: 'ほのお',
      water: 'みず',
      electric: 'でんき',
      grass: 'くさ',
      ice: 'こおり',
      fighting: 'かくとう',
      poison: 'どく',
      ground: 'じめん',
      flying: 'ひこう',
      psychic: 'エスパー',
      bug: 'むし',
      rock: 'いわ',
      ghost: 'ゴースト',
      dragon: 'ドラゴン',
      dark: 'あく',
      steel: 'はがね',
      fairy: 'フェアリー'
    };
    return typeLabels[type] || type;
  };

  if (compact) {
    return (
      <motion.div
        className={`
          relative bg-white rounded-lg border-2 p-3 cursor-pointer transition-all
          ${selected 
            ? 'border-poke-blue-500 shadow-lg ring-2 ring-poke-blue-200' 
            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
          }
        `}
        onClick={handleClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            {!imageError ? (
              <img
                src={getPokemonImageUrl(pokemon.pokemon_id)}
                alt={pokemon.pokemon_name}
                className={`w-12 h-12 object-contain transition-opacity ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-gray-400" />
              </div>
            )}
            
            {/* レベル表示 */}
            <div className="absolute -top-1 -right-1 bg-yellow-400 text-xs font-bold text-white rounded-full w-5 h-5 flex items-center justify-center">
              {pokemon.level}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900 truncate">{pokemon.pokemon_name}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPositionColor(pokemon.position)}`}>
                {getPositionLabel(pokemon.position)}
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex items-center text-xs text-gray-500">
                <TrendingUp className="w-3 h-3 mr-1" />
                {getTotalStats()}
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <Activity className="w-3 h-3 mr-1" />
                {pokemon.condition}%
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`
        relative bg-white rounded-xl border-2 overflow-hidden cursor-pointer transition-all
        ${selected 
          ? 'border-poke-blue-500 shadow-xl ring-4 ring-poke-blue-200' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
        }
      `}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {!imageError ? (
                <img
                  src={getPokemonImageUrl(pokemon.pokemon_id)}
                  alt={pokemon.pokemon_name}
                  className={`w-16 h-16 object-contain transition-opacity ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
              )}
              
              {/* レベル表示 */}
              <div className="absolute -top-2 -right-2 bg-yellow-400 text-sm font-bold text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                {pokemon.level}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900">{pokemon.pokemon_name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPositionColor(pokemon.position)}`}>
                  {getPositionLabel(pokemon.position)}
                </span>
                <div className="flex space-x-1">
                  <span className={`px-2 py-1 text-xs font-medium text-white rounded ${getTypeColor(pokemon.pokemon_type_1)}`}>
                    {getTypeLabel(pokemon.pokemon_type_1)}
                  </span>
                  {pokemon.pokemon_type_2 && (
                    <span className={`px-2 py-1 text-xs font-medium text-white rounded ${getTypeColor(pokemon.pokemon_type_2)}`}>
                      {getTypeLabel(pokemon.pokemon_type_2)}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                総合力: {getTotalStats()}
              </div>
            </div>
          </div>

          {/* コンディション */}
          <div className="text-right">
            <div className="text-xs text-gray-500">コンディション</div>
            <div className={`text-lg font-bold ${
              pokemon.condition === 'excellent' ? 'text-green-600' :
              pokemon.condition === 'good' ? 'text-blue-600' :
              pokemon.condition === 'normal' ? 'text-yellow-600' :
              pokemon.condition === 'poor' ? 'text-orange-600' :
              'text-red-600'
            }`}>
              {pokemon.condition === 'excellent' ? '絶好調' : 
               pokemon.condition === 'good' ? '好調' :
               pokemon.condition === 'normal' ? '普通' :
               pokemon.condition === 'poor' ? '不調' : '絶不調'}
            </div>
          </div>
        </div>
      </div>

      {/* ステータス表示 */}
      {showStats && (
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-gray-600">サーブ</span>
              <span className="ml-auto font-medium">{pokemon.serve_skill}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600">リターン</span>
              <span className="ml-auto font-medium">{pokemon.return_skill}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600">ボレー</span>
              <span className="ml-auto font-medium">{pokemon.volley_skill}</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-gray-600">ストローク</span>
              <span className="ml-auto font-medium">{pokemon.stroke_skill}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-pink-500" />
              <span className="text-sm text-gray-600">メンタル</span>
              <span className="ml-auto font-medium">{pokemon.mental}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-red-500" />
              <span className="text-sm text-gray-600">スタミナ</span>
              <span className="ml-auto font-medium">{pokemon.stamina}</span>
            </div>
          </div>

          {/* 特性・性格 */}
          <div className="pt-3 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">特性:</span>
                <span className="ml-2 font-medium">{pokemon.ability?.name || '---'}</span>
              </div>
              <div>
                <span className="text-gray-500">性格:</span>
                <span className="ml-2 font-medium">{pokemon.nature?.name || '---'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 選択インジケーター */}
      {selected && (
        <motion.div
          className="absolute top-2 right-2 w-6 h-6 bg-poke-blue-500 rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <div className="w-2 h-2 bg-white rounded-full" />
        </motion.div>
      )}
    </motion.div>
  );
}