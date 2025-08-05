'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface Pokemon {
  id: number;
  name: string;
  sprite: string;
  position: { x: number; y: number };
  activity: 'training' | 'resting' | 'playing';
  level: number;
}

// サンプルポケモンデータ
const samplePokemon: Pokemon[] = [
  { id: 25, name: 'ピカチュウ', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png', position: { x: 20, y: 30 }, activity: 'training', level: 15 },
  { id: 1, name: 'フシギダネ', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png', position: { x: 60, y: 20 }, activity: 'playing', level: 12 },
  { id: 4, name: 'ヒトカゲ', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png', position: { x: 80, y: 60 }, activity: 'resting', level: 18 },
  { id: 7, name: 'ゼニガメ', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png', position: { x: 30, y: 70 }, activity: 'training', level: 14 },
  { id: 133, name: 'イーブイ', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png', position: { x: 50, y: 45 }, activity: 'playing', level: 16 },
];

export function PokemonField() {
  const [pokemon, setPokemon] = useState<Pokemon[]>(samplePokemon);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);

  // ポケモンをランダムに移動させる
  useEffect(() => {
    const interval = setInterval(() => {
      setPokemon(prev => prev.map(p => ({
        ...p,
        position: {
          x: Math.max(10, Math.min(90, p.position.x + (Math.random() - 0.5) * 10)),
          y: Math.max(10, Math.min(90, p.position.y + (Math.random() - 0.5) * 10))
        }
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getActivityColor = (activity: Pokemon['activity']) => {
    switch (activity) {
      case 'training': return 'bg-green-100 border-green-300 text-green-800';
      case 'playing': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'resting': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    }
  };

  const getActivityEmoji = (activity: Pokemon['activity']) => {
    switch (activity) {
      case 'training': return '🏃‍♂️';
      case 'playing': return '🎾';
      case 'resting': return '😴';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 font-display">
          🏟️ テニスコート
        </h2>
        <div className="text-sm text-gray-500">
          部員数: {pokemon.length}名
        </div>
      </div>

      {/* テニスコート */}
      <div className="relative w-full h-96 bg-gradient-to-br from-green-100 to-green-200 rounded-lg border-4 border-green-300 overflow-hidden">
        {/* コートの線 */}
        <div className="absolute inset-4 border-2 border-white rounded opacity-60">
          {/* センターライン */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white transform -translate-x-0.5"></div>
          {/* サービスライン */}
          <div className="absolute left-0 right-0 top-1/4 h-0.5 bg-white"></div>
          <div className="absolute left-0 right-0 bottom-1/4 h-0.5 bg-white"></div>
        </div>

        {/* ネット */}
        <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-400 transform -translate-y-0.5 z-10">
          <div className="absolute left-1/4 right-1/4 top-0 bottom-0 bg-gray-600"></div>
        </div>

        {/* ポケモン配置 */}
        <AnimatePresence>
          {pokemon.map((p) => (
            <motion.div
              key={p.id}
              className="absolute cursor-pointer group"
              style={{
                left: `${p.position.x}%`,
                top: `${p.position.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              animate={{
                left: `${p.position.x}%`,
                top: `${p.position.y}%`,
                opacity: 1, 
                scale: 1
              }}
              transition={{ 
                duration: 2, 
                ease: "easeInOut",
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedPokemon(p)}
              initial={{ opacity: 0, scale: 0 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              {/* ポケモン画像 */}
              <div className="relative">
                <Image
                  src={p.sprite}
                  alt={p.name}
                  width={48}
                  height={48}
                  className="hover:animate-bounce transition-transform"
                />
                
                {/* アクティビティインジケーター */}
                <div className={`
                  absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs border-2
                  ${getActivityColor(p.activity)}
                `}>
                  {getActivityEmoji(p.activity)}
                </div>

                {/* レベル表示 */}
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-1 rounded">
                  Lv.{p.level}
                </div>

                {/* ホバー時の名前表示 */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  {p.name}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* 雲のアニメーション */}
        <div className="absolute top-2 right-4 text-white text-opacity-30 animate-pulse">
          ☁️
        </div>
        <div className="absolute top-6 left-8 text-white text-opacity-20 animate-pulse" style={{ animationDelay: '1s' }}>
          ☁️
        </div>
      </div>

      {/* アクティビティ凡例 */}
      <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
        <div className="flex items-center space-x-2">
          <span>🏃‍♂️</span>
          <span className="text-green-600">練習中</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>🎾</span>
          <span className="text-blue-600">プレイ中</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>😴</span>
          <span className="text-yellow-600">休憩中</span>
        </div>
      </div>

      {/* 選択されたポケモンの詳細 */}
      {selectedPokemon && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-gray-50 rounded-lg border"
        >
          <div className="flex items-center space-x-3">
            <Image
              src={selectedPokemon.sprite}
              alt={selectedPokemon.name}
              width={32}
              height={32}
            />
            <div>
              <h3 className="font-semibold text-gray-900">{selectedPokemon.name}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>レベル {selectedPokemon.level}</span>
                <span className="flex items-center space-x-1">
                  <span>{getActivityEmoji(selectedPokemon.activity)}</span>
                  <span>{selectedPokemon.activity === 'training' ? '練習中' : selectedPokemon.activity === 'playing' ? 'プレイ中' : '休憩中'}</span>
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedPokemon(null)}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}