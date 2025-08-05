'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GameLayout } from '@/components/layout/GameLayout';
import { PlayerList } from '@/components/player/PlayerList';
import { PlayerRecruitment } from '@/components/player/PlayerRecruitment';
import { useAuth } from '@/context/AuthContext';
import { usePlayerData } from '@/hooks/usePlayerData';
import { Users, UserPlus, TrendingUp, Settings } from 'lucide-react';

export default function PlayersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'roster' | 'recruitment' | 'formation'>('roster');
  const { players, loading, getPlayerStats } = usePlayerData();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <GameLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-poke-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </GameLayout>
    );
  }

  if (!user) {
    return null;
  }

  const tabs = [
    {
      id: 'roster',
      name: 'チーム管理',
      icon: Users,
      description: '現在のチームメンバーを管理'
    },
    {
      id: 'recruitment',
      name: 'スカウト',
      icon: UserPlus,
      description: '新しいポケモンをスカウト'
    },
    {
      id: 'formation',
      name: 'フォーメーション',
      icon: Settings,
      description: '試合の戦術と配置を設定'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'roster':
        return (
          <PlayerList
            players={players}
            onPlayerSelect={(pokemon) => {
              // プレイヤー詳細ページに遷移または詳細モーダルを表示
              console.log('Player selected:', pokemon);
            }}
            showStats={true}
            compact={false}
          />
        );
      case 'recruitment':
        return <PlayerRecruitment />;
      case 'formation':
        return (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              フォーメーション設定
            </h3>
            <p className="text-gray-500">
              戦術とフォーメーションの設定機能は開発中です
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <GameLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-display">
              選手管理
            </h1>
            <p className="text-gray-600 mt-2">
              チームのポケモンを管理し、新しいメンバーをスカウトしましょう
            </p>
          </div>
          
          {/* チーム統計 */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="text-2xl font-bold text-gray-900">{getPlayerStats().totalPlayers}</div>
              <div className="text-xs text-gray-500">総選手数</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="text-2xl font-bold text-green-600">
                {getPlayerStats().regularPlayers}
              </div>
              <div className="text-xs text-gray-500">レギュラー</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="text-2xl font-bold text-blue-600">
                {getPlayerStats().averageLevel}
              </div>
              <div className="text-xs text-gray-500">平均レベル</div>
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex-1 flex items-center justify-center space-x-2 py-4 px-6 text-sm font-medium transition-colors
                    ${activeTab === tab.id 
                      ? 'bg-poke-blue-50 text-poke-blue-600 border-b-2 border-poke-blue-600' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <tab.icon className="h-5 w-5" />
                  <div className="text-left">
                    <div>{tab.name}</div>
                    <div className="text-xs opacity-70">{tab.description}</div>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* タブコンテンツ */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </GameLayout>
  );
}