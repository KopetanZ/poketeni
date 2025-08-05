'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { AnimatedStatBar } from './AnimatedStatBar';
import { getTypeColor } from '@/lib/utils';

interface PokemonCardProps {
  pokemon: {
    id: number;
    name: string;
    sprite: string;
    level: number;
    types: string[];
    stats: {
      power: number;
      technique: number;
      speed: number;
      stamina: number;
      mental: number;
    };
    position?: string;
    condition?: string;
  };
  onClick?: () => void;
  isSelected?: boolean;
}

export function PokemonCard({ pokemon, onClick, isSelected = false }: PokemonCardProps) {
  const { name, sprite, level, types, stats, position, condition } = pokemon;

  const getConditionColor = (condition?: string) => {
    switch (condition) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'normal': return 'text-gray-600 bg-gray-100';
      case 'poor': return 'text-orange-600 bg-orange-100';
      case 'terrible': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <motion.div
      className={`
        bg-white rounded-xl shadow-md border-2 p-4 cursor-pointer transition-all duration-200
        ${isSelected 
          ? 'border-poke-blue-500 shadow-lg transform scale-105' 
          : 'border-gray-200 hover:border-poke-blue-300 hover:shadow-lg hover:transform hover:scale-102'
        }
      `}
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <h3 className="font-bold text-gray-900 font-display">{name}</h3>
          <span className="text-sm text-gray-500">Lv.{level}</span>
        </div>
        
        {position && (
          <span className={`
            px-2 py-1 text-xs font-medium rounded-full
            ${position === 'captain' ? 'bg-yellow-100 text-yellow-800' :
              position === 'vice_captain' ? 'bg-purple-100 text-purple-800' :
              position === 'regular' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-600'}
          `}>
            {position === 'captain' ? '主将' :
             position === 'vice_captain' ? '副将' :
             position === 'regular' ? 'レギュラー' : '部員'}
          </span>
        )}
      </div>

      {/* ポケモン画像とタイプ */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="relative">
          <Image
            src={sprite}
            alt={name}
            width={64}
            height={64}
            className="hover:animate-pulse transition-all"
          />
          {/* コンディション表示 */}
          {condition && (
            <div className={`
              absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
              ${getConditionColor(condition)}
            `}>
              {condition === 'excellent' ? '😊' :
               condition === 'good' ? '🙂' :
               condition === 'normal' ? '😐' :
               condition === 'poor' ? '😟' : '😵'}
            </div>
          )}
        </div>
        
        <div className="flex-1">
          {/* タイプバッジ */}
          <div className="flex space-x-1 mb-2">
            {types.map((type, index) => (
              <span
                key={index}
                className={`
                  px-2 py-1 text-xs font-medium text-white rounded-full
                  ${getTypeColor(type)}
                `}
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ステータス */}
      <div className="space-y-2">
        <AnimatedStatBar
          label="パワー"
          value={stats.power}
          maxValue={100}
          color="red"
          icon="💪"
        />
        <AnimatedStatBar
          label="テクニック"
          value={stats.technique}
          maxValue={100}
          color="blue"
          icon="🎯"
        />
        <AnimatedStatBar
          label="スピード"
          value={stats.speed}
          maxValue={100}
          color="yellow"
          icon="⚡"
        />
        <AnimatedStatBar
          label="スタミナ"
          value={stats.stamina}
          maxValue={100}
          color="green"
          icon="❤️"
        />
        <AnimatedStatBar
          label="メンタル"
          value={stats.mental}
          maxValue={100}
          color="purple"
          icon="🧠"
        />
      </div>

      {/* 総合力表示 */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">総合力</span>
          <span className="font-bold text-poke-blue-600">
            {Object.values(stats).reduce((sum, stat) => sum + stat, 0)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}