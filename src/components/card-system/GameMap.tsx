'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Trophy, BookOpen, Star, AlertTriangle, Users, Zap } from 'lucide-react';
import type { SeasonMap, MapPanel } from '@/types/card-system';

interface GameMapProps {
  seasonMap: SeasonMap;
  currentPosition: number;
  onPanelClick?: (panel: MapPanel) => void;
  showPath?: boolean;
  compact?: boolean;
}

export function GameMap({ seasonMap, currentPosition, onPanelClick, showPath = true, compact = false }: GameMapProps) {
  // 表示範囲の計算（現在位置の前後を表示）
  const visibleRange = useMemo(() => {
    const range = compact ? 15 : 30;
    const start = Math.max(0, currentPosition - range);
    const end = Math.min(seasonMap.totalDays - 1, currentPosition + range);
    return { start, end };
  }, [currentPosition, seasonMap.totalDays, compact]);

  // 表示するパネル
  const visiblePanels = useMemo(() => {
    return seasonMap.panels.filter(panel => 
      panel.position >= visibleRange.start && panel.position <= visibleRange.end
    );
  }, [seasonMap.panels, visibleRange]);

  // パネルの色とアイコンを取得
  const getPanelDisplay = (panel: MapPanel) => {
    const baseDisplay = {
      color: panel.display.color,
      icon: panel.display.icon,
      name: panel.display.name
    };

    // カスタムアイコンマッピング
    const iconMap: { [key: string]: React.ReactNode } = {
      '🏆': <Trophy className="h-4 w-4" />,
      '📚': <BookOpen className="h-4 w-4" />,
      '🎓': <Users className="h-4 w-4" />,
      '⭐': <Star className="h-4 w-4" />,
      '⚡': <Zap className="h-4 w-4" />,
      '💥': <AlertTriangle className="h-4 w-4" />,
      '✨': <Star className="h-4 w-4" />,
      '👨‍🎓': <Users className="h-4 w-4" />,
      '📍': <MapPin className="h-4 w-4" />,
      '⭕': <div className="w-3 h-3 bg-gray-300 rounded-full" />
    };

    return {
      ...baseDisplay,
      iconComponent: iconMap[baseDisplay.icon] || <div className="text-sm">{baseDisplay.icon}</div>
    };
  };

  // パネルの背景色を取得
  const getPanelBgColor = (panel: MapPanel, isCurrentPosition: boolean) => {
    if (isCurrentPosition) {
      return 'bg-poke-blue-500 border-poke-blue-600 shadow-lg shadow-poke-blue-200';
    }

    switch (panel.display.color) {
      case 'blue':
        return 'bg-blue-100 border-blue-300 hover:bg-blue-200';
      case 'red':
        return 'bg-red-100 border-red-300 hover:bg-red-200';
      case 'green':
        return 'bg-green-100 border-green-300 hover:bg-green-200';
      case 'yellow':
        return 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200';
      case 'purple':
        return 'bg-purple-100 border-purple-300 hover:bg-purple-200';
      case 'orange':
        return 'bg-orange-100 border-orange-300 hover:bg-orange-200';
      default:
        return 'bg-gray-100 border-gray-300 hover:bg-gray-200';
    }
  };

  // 日付を取得
  const getDateFromPosition = (position: number) => {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let remainingDays = position;
    let month = 0;
    
    while (remainingDays >= daysInMonth[month] && month < 11) {
      remainingDays -= daysInMonth[month];
      month++;
    }
    
    return {
      month: month + 1,
      day: remainingDays + 1
    };
  };

  const handlePanelClick = (panel: MapPanel) => {
    if (onPanelClick) {
      onPanelClick(panel);
    }
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">マップ ({seasonMap.year}年目)</h3>
          <div className="text-sm text-gray-500">
            {getDateFromPosition(currentPosition).month}月{getDateFromPosition(currentPosition).day}日
          </div>
        </div>

        <div className="relative">
          {/* 進行パス */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 rounded-full transform -translate-y-1/2" />
          
          {/* パネル */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {visiblePanels.map((panel) => {
              const isCurrentPosition = panel.position === currentPosition;
              const isPassed = panel.position < currentPosition;
              const display = getPanelDisplay(panel);

              return (
                <motion.button
                  key={panel.id}
                  onClick={() => handlePanelClick(panel)}
                  className={`
                    relative flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-white transition-all
                    ${getPanelBgColor(panel, isCurrentPosition)}
                    ${isPassed ? 'opacity-60' : ''}
                  `}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title={`${display.name} (${getDateFromPosition(panel.position).month}/${getDateFromPosition(panel.position).day})`}
                >
                  {display.iconComponent}
                  
                  {isCurrentPosition && (
                    <motion.div
                      className="absolute inset-0 border-2 border-poke-blue-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-sky-100 to-green-100 rounded-2xl p-6 shadow-xl">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Calendar className="h-6 w-6 text-gray-700" />
          <h2 className="text-2xl font-bold text-gray-900 font-display">
            {seasonMap.year}年目のマップ
          </h2>
        </div>
        
        <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
          <div className="text-sm text-gray-500">現在位置</div>
          <div className="text-lg font-bold text-gray-900">
            {getDateFromPosition(currentPosition).month}月{getDateFromPosition(currentPosition).day}日
          </div>
        </div>
      </div>

      {/* マップエリア */}
      <div className="relative bg-white rounded-xl p-6 shadow-inner overflow-hidden">
        {/* 背景パターン */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.15) 1px, transparent 0)',
            backgroundSize: '20px 20px'
          }} />
        </div>

        {/* 進行パス */}
        {showPath && (
          <div className="absolute top-1/2 left-6 right-6 transform -translate-y-1/2">
            <svg width="100%" height="4" className="overflow-visible">
              <defs>
                <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset={`${(currentPosition / seasonMap.totalDays) * 100}%`} stopColor="#3b82f6" />
                  <stop offset={`${(currentPosition / seasonMap.totalDays) * 100}%`} stopColor="#d1d5db" />
                  <stop offset="100%" stopColor="#d1d5db" />
                </linearGradient>
              </defs>
              <path
                d={`M 0 2 Q ${visiblePanels.length * 20} 2 ${(visibleRange.end - visibleRange.start) * 20} 2`}
                stroke="url(#pathGradient)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}

        {/* パネル表示 */}
        <div className="relative grid grid-cols-10 gap-3">
          {visiblePanels.map((panel, index) => {
            const isCurrentPosition = panel.position === currentPosition;
            const isPassed = panel.position < currentPosition;
            const isFuture = panel.position > currentPosition;
            const display = getPanelDisplay(panel);
            const date = getDateFromPosition(panel.position);

            return (
              <motion.div
                key={panel.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                className="relative"
              >
                <motion.button
                  onClick={() => handlePanelClick(panel)}
                  className={`
                    relative w-full aspect-square rounded-xl border-3 flex flex-col items-center justify-center p-2 transition-all
                    ${getPanelBgColor(panel, isCurrentPosition)}
                    ${isPassed ? 'opacity-70' : ''}
                    ${isFuture ? 'opacity-90' : ''}
                    ${isCurrentPosition ? 'ring-4 ring-poke-blue-300' : ''}
                  `}
                  whileHover={{ scale: 1.05, zIndex: 10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* アイコン */}
                  <div className={`${isCurrentPosition ? 'text-white' : 'text-gray-700'} mb-1`}>
                    {display.iconComponent}
                  </div>
                  
                  {/* 日付 */}
                  <div className={`text-xs font-medium ${isCurrentPosition ? 'text-white' : 'text-gray-600'}`}>
                    {date.month}/{date.day}
                  </div>

                  {/* 固定イベントマーカー */}
                  {panel.isFixed && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white" />
                  )}

                  {/* 現在位置のパルス効果 */}
                  {isCurrentPosition && (
                    <motion.div
                      className="absolute inset-0 border-3 border-poke-blue-400 rounded-xl"
                      animate={{ scale: [1, 1.1, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}

                  {/* 通過済みチェックマーク */}
                  {isPassed && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </motion.button>

                {/* パネル名のツールチップ */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {display.name}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 進行方向矢印 */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-gray-400"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" />
            </svg>
          </motion.div>
        </div>
      </div>

      {/* レジェンド */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded-full" />
          <span className="text-gray-700">良いイベント</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded-full" />
          <span className="text-gray-700">悪いイベント</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded-full" />
          <span className="text-gray-700">特別訓練</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded-full" />
          <span className="text-gray-700">卒業した先輩</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded-full" />
          <span className="text-gray-700">試合</span>
        </div>
      </div>
    </div>
  );
}