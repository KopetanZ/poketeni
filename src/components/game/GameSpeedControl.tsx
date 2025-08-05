'use client';

import { useState } from 'react';
import { Play, Pause, FastForward } from 'lucide-react';
import { cn } from '@/lib/utils';

type GameSpeed = 'pause' | 'normal' | 'fast';

export function GameSpeedControl() {
  const [gameSpeed, setGameSpeed] = useState<GameSpeed>('pause');
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDay, setCurrentDay] = useState('月曜日');

  const speedConfig = {
    pause: { icon: Pause, label: '一時停止', color: 'bg-gray-500 hover:bg-gray-600' },
    normal: { icon: Play, label: '通常速度', color: 'bg-green-500 hover:bg-green-600' },
    fast: { icon: FastForward, label: '高速', color: 'bg-blue-500 hover:bg-blue-600' }
  };

  const handleSpeedChange = () => {
    const speeds: GameSpeed[] = ['pause', 'normal', 'fast'];
    const currentIndex = speeds.indexOf(gameSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setGameSpeed(speeds[nextIndex]);
  };

  const currentConfig = speedConfig[gameSpeed];
  const Icon = currentConfig.icon;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="text-center mb-3">
          <div className="text-xs text-gray-500 font-medium">現在</div>
          <div className="text-sm font-bold text-gray-800">第{currentWeek}週</div>
          <div className="text-xs text-gray-600">{currentDay}</div>
        </div>
        
        <div className="text-center mb-3 border-t pt-2">
          <div className="text-xs text-gray-500 font-medium">ゲーム速度</div>
          <div className="text-sm font-bold text-gray-800 mt-1">
            {currentConfig.label}
          </div>
        </div>
        
        <button
          onClick={handleSpeedChange}
          className={cn(
            "w-full flex items-center justify-center p-3 rounded-lg text-white font-medium transition-colors",
            currentConfig.color
          )}
        >
          <Icon className="h-5 w-5 mr-2" />
          {gameSpeed === 'pause' ? '開始' : 
           gameSpeed === 'normal' ? '高速化' : '一時停止'}
        </button>
        
        {/* 速度インジケーター */}
        <div className="flex justify-center space-x-1 mt-3">
          {(['pause', 'normal', 'fast'] as GameSpeed[]).map((speed) => (
            <div
              key={speed}
              className={cn(
                "h-2 w-8 rounded-full transition-colors",
                gameSpeed === speed ? 'bg-poke-blue-500' : 'bg-gray-200'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}