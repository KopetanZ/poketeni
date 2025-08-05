'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  Calendar, 
  Trophy, 
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Target,
  Award,
  Store
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const navigationItems: SidebarItem[] = [
  { label: 'ホーム', href: '/', icon: Home },
  { label: '選手管理', href: '/players', icon: Users },
  { label: '練習', href: '/training', icon: Target },
  { label: 'スケジュール', href: '/schedule', icon: Calendar },
  { label: '試合', href: '/matches', icon: Trophy },
  { label: 'ストーリー', href: '/story', icon: BookOpen, badge: 2 },
  { label: '実績', href: '/achievements', icon: Award },
  { label: 'ショップ', href: '/shop', icon: Store },
  { label: '設定', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className={cn(
      "bg-white shadow-lg border-r border-gray-200 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* サイドバーヘッダー */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-gray-800 font-display">
              メニュー
            </h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* ナビゲーション */}
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative",
                isActive 
                  ? "bg-poke-blue-50 text-poke-blue-700 border-l-4 border-poke-blue-500" 
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                isCollapsed && "justify-center"
              )}
            >
              <Icon className={cn(
                "flex-shrink-0",
                isCollapsed ? "h-6 w-6" : "h-5 w-5"
              )} />
              
              {!isCollapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              
              {/* バッジ（折りたたみ時） */}
              {isCollapsed && item.badge && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* 学校情報（折りたたみ時は非表示） */}
      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600 space-y-1">
            <div className="font-medium">桜ヶ丘テニス部</div>
            <div>部員数: 12名</div>
            <div>次の試合: 4日後</div>
          </div>
        </div>
      )}
    </div>
  );
}