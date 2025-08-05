'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, Users } from 'lucide-react';
import { PlayerCard } from './PlayerCard';
import { PokemonDetailModal } from '../pokemon/PokemonDetailModal';
import type { Player } from '@/types/game';

interface PlayerListProps {
  players: Player[];
  onPlayerSelect?: (pokemon: Player) => void;
  selectedPlayers?: string[];
  showStats?: boolean;
  compact?: boolean;
  maxSelection?: number;
}

export function PlayerList({
  players,
  onPlayerSelect,
  selectedPlayers = [],
  showStats = true,
  compact = false,
  maxSelection
}: PlayerListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'level' | 'total_stats' | 'condition'>('level');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const filteredAndSortedPlayers = useMemo(() => {
    let filtered = players.filter(player => {
      const matchesSearch = player.pokemon_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPosition = positionFilter === 'all' || player.position === positionFilter;
      return matchesSearch && matchesPosition;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.pokemon_name.localeCompare(b.pokemon_name);
        case 'level':
          return b.level - a.level;
        case 'total_stats':
          const totalA = a.serve_skill + a.return_skill + a.volley_skill + 
                        a.stroke_skill + a.mental + a.stamina;
          const totalB = b.serve_skill + b.return_skill + b.volley_skill + 
                        b.stroke_skill + b.mental + b.stamina;
          return totalB - totalA;
        case 'condition':
          const conditionOrder = { 'excellent': 5, 'good': 4, 'normal': 3, 'poor': 2, 'terrible': 1 };
          return (conditionOrder[b.condition] || 0) - (conditionOrder[a.condition] || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [players, searchTerm, positionFilter, sortBy]);

  const handlePlayerSelect = (pokemon: Player) => {
    if (onPlayerSelect) {
      onPlayerSelect(pokemon);
    } else {
      // デフォルトで詳細モーダルを開く
      setSelectedPlayer(pokemon);
      setIsDetailModalOpen(true);
    }
  };

  const handleDetailClose = () => {
    setIsDetailModalOpen(false);
    setSelectedPlayer(null);
  };

  const getPositionFilterCount = (position: string) => {
    if (position === 'all') return players.length;
    return players.filter(p => p.position === position).length;
  };

  return (
    <div className="space-y-4">
      {/* 検索・フィルタ・ソート */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 検索 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="ポケモン名で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poke-blue-500 focus:border-transparent"
            />
          </div>

          {/* ポジションフィルタ */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poke-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">全てのポジション ({getPositionFilterCount('all')})</option>
              <option value="captain">キャプテン ({getPositionFilterCount('captain')})</option>
              <option value="vice_captain">副キャプテン ({getPositionFilterCount('vice_captain')})</option>
              <option value="regular">レギュラー ({getPositionFilterCount('regular')})</option>
              <option value="member">部員 ({getPositionFilterCount('member')})</option>
            </select>
          </div>

          {/* ソート */}
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poke-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="level">レベル順</option>
              <option value="total_stats">総合力順</option>
              <option value="condition">コンディション順</option>
              <option value="name">名前順</option>
            </select>
          </div>
        </div>

        {/* 選択状況 */}
        {maxSelection && selectedPlayers.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                選択中: {selectedPlayers.length}/{maxSelection}
              </span>
              {selectedPlayers.length >= maxSelection && (
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  最大選択数に達しました
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* プレイヤーリスト */}
      <div className="space-y-4">
        {filteredAndSortedPlayers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              該当するポケモンが見つかりません
            </h3>
            <p className="text-gray-500">
              検索条件を変更してもう一度お試しください
            </p>
          </div>
        ) : (
          <div className={`grid gap-4 ${
            compact 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {filteredAndSortedPlayers.map((pokemon) => (
              <PlayerCard
                key={pokemon.id}
                pokemon={pokemon}
                onSelect={handlePlayerSelect}
                selected={selectedPlayers.includes(pokemon.id)}
                showStats={showStats}
                compact={compact}
              />
            ))}
          </div>
        )}
      </div>

      {/* 統計情報 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{players.length}</div>
            <div className="text-sm text-gray-500">総選手数</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {players.filter(p => p.condition === 'excellent' || p.condition === 'good').length}
            </div>
            <div className="text-sm text-gray-500">好調選手</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(players.reduce((sum, p) => sum + p.level, 0) / players.length)}
            </div>
            <div className="text-sm text-gray-500">平均レベル</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {players.filter(p => p.position !== 'member').length}
            </div>
            <div className="text-sm text-gray-500">レギュラー</div>
          </div>
        </div>
      </div>

      {/* ポケモン詳細モーダル */}
      <PokemonDetailModal
        isOpen={isDetailModalOpen}
        player={selectedPlayer}
        onClose={handleDetailClose}
      />
    </div>
  );
}