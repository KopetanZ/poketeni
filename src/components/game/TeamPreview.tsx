'use client';

import { useState } from 'react';
import { PokemonCard } from '../ui/PokemonCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// サンプルチームデータ
const sampleTeam = [
  {
    id: 25,
    name: 'ピカチュウ',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    level: 15,
    types: ['electric'],
    stats: { power: 55, technique: 40, speed: 90, stamina: 35, mental: 50 },
    position: 'captain' as const,
    condition: 'excellent' as const
  },
  {
    id: 1,
    name: 'フシギダネ',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
    level: 12,
    types: ['grass', 'poison'],
    stats: { power: 49, technique: 65, speed: 45, stamina: 49, mental: 65 },
    position: 'regular' as const,
    condition: 'good' as const
  },
  {
    id: 4,
    name: 'ヒトカゲ',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
    level: 18,
    types: ['fire'],
    stats: { power: 52, technique: 43, speed: 65, stamina: 39, mental: 50 },
    position: 'vice_captain' as const,
    condition: 'excellent' as const
  },
  {
    id: 7,
    name: 'ゼニガメ',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png',
    level: 14,
    types: ['water'],
    stats: { power: 48, technique: 65, speed: 43, stamina: 50, mental: 64 },
    position: 'regular' as const,
    condition: 'normal' as const
  },
  {
    id: 133,
    name: 'イーブイ',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png',
    level: 16,
    types: ['normal'],
    stats: { power: 55, technique: 45, speed: 55, stamina: 50, mental: 65 },
    position: 'regular' as const,
    condition: 'good' as const
  }
];

export function TeamPreview() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPokemon, setSelectedPokemon] = useState<number | null>(null);

  const nextPokemon = () => {
    setCurrentIndex((prev) => (prev + 1) % sampleTeam.length);
  };

  const prevPokemon = () => {
    setCurrentIndex((prev) => (prev - 1 + sampleTeam.length) % sampleTeam.length);
  };

  const visiblePokemon = [
    sampleTeam[currentIndex],
    sampleTeam[(currentIndex + 1) % sampleTeam.length],
    sampleTeam[(currentIndex + 2) % sampleTeam.length]
  ];

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 font-display">
          🌟 チームメンバー
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={prevPokemon}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-gray-500">
            {currentIndex + 1} / {sampleTeam.length}
          </span>
          <button
            onClick={nextPokemon}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ポケモンカードスライダー */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            {visiblePokemon.map((pokemon, index) => (
              <motion.div
                key={`${pokemon.id}-${currentIndex}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PokemonCard
                  pokemon={pokemon}
                  onClick={() => setSelectedPokemon(
                    selectedPokemon === pokemon.id ? null : pokemon.id
                  )}
                  isSelected={selectedPokemon === pokemon.id}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* チーム統計 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 font-display">
          チーム統計
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {['power', 'technique', 'speed', 'stamina', 'mental'].map((stat) => {
            const statLabel = {
              power: 'パワー',
              technique: 'テクニック', 
              speed: 'スピード',
              stamina: 'スタミナ',
              mental: 'メンタル'
            }[stat];
            
            const average = Math.round(
              sampleTeam.reduce((sum, p) => sum + p.stats[stat as keyof typeof p.stats], 0) / sampleTeam.length
            );
            
            return (
              <div key={stat} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-poke-blue-600">{average}</div>
                <div className="text-sm text-gray-600">{statLabel}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}