'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { GameSpeedControl } from '../game/GameSpeedControl';

interface GameLayoutProps {
  children: ReactNode;
}

export function GameLayout({ children }: GameLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* ヘッダー */}
      <Header />
      
      <div className="flex">
        {/* サイドバー */}
        <Sidebar />
        
        {/* メインコンテンツ */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        
        {/* ゲーム速度コントロール（右下固定） */}
        <GameSpeedControl />
      </div>
    </div>
  );
}