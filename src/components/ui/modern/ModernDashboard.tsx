'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModernUISystem } from '@/lib/ui-system/modern-ui-system';
import { ModernCard } from './ModernCard';
import { ModernButton } from './ModernButton';

interface DashboardTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  pokemonType?: string;
  badge?: number;
}

interface ModernDashboardProps {
  tabs: DashboardTab[];
  defaultTab?: string;
  title?: string;
  className?: string;
}

export function ModernDashboard({ 
  tabs, 
  defaultTab, 
  title,
  className = '' 
}: ModernDashboardProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const uiSystem = ModernUISystem.getInstance();
  const theme = uiSystem.getPokemonTheme();

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      {title && (
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{title}</h1>
          <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
        </motion.div>
      )}

      {/* Tab Navigation */}
      <motion.div
        className="flex flex-wrap gap-2 mb-8 p-2 bg-white bg-opacity-50 backdrop-blur-lg rounded-2xl border border-white border-opacity-30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              className={`
                relative flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300
                ${isActive 
                  ? 'text-white shadow-lg' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white hover:bg-opacity-60'
                }
              `}
              style={isActive ? {
                background: tab.pokemonType 
                  ? `linear-gradient(135deg, ${uiSystem.getPokemonTypeColor(tab.pokemonType)} 0%, ${uiSystem.getPokemonTypeColor(tab.pokemonType)}CC 100%)`
                  : `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`
              } : {}}
              onClick={() => setActiveTab(tab.id)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Background Glow for Active Tab */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-xl opacity-50"
                  style={{
                    background: tab.pokemonType 
                      ? `linear-gradient(135deg, ${uiSystem.getPokemonTypeColor(tab.pokemonType)} 0%, ${uiSystem.getPokemonTypeColor(tab.pokemonType)}80 100%)`
                      : `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
                    filter: 'blur(8px)',
                    transform: 'scale(1.1)'
                  }}
                  layoutId="activeTabGlow"
                />
              )}

              {/* Icon */}
              <motion.div
                className="relative z-10"
                animate={{ 
                  scale: isActive ? 1.1 : 1,
                  rotate: isActive ? [0, 5, -5, 0] : 0
                }}
                transition={{ duration: 0.3 }}
              >
                {tab.icon}
              </motion.div>

              {/* Label */}
              <span className="relative z-10">{tab.label}</span>

              {/* Badge */}
              {tab.badge && tab.badge > 0 && (
                <motion.div
                  className="relative z-10 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
                >
                  {tab.badge > 99 ? '99+' : tab.badge}
                </motion.div>
              )}

              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  className="absolute bottom-0 left-1/2 w-8 h-1 bg-white rounded-full"
                  layoutId="activeTab"
                  style={{ transform: 'translateX(-50%)' }}
                />
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTabData && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ModernCard
              variant={activeTabData.pokemonType ? 'pokemon' : 'gradient'}
              pokemonType={activeTabData.pokemonType}
              padding="lg"
              hover={false}
            >
              {activeTabData.content}
            </ModernCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.div
        className="fixed bottom-8 right-8 z-40"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
      >
        <ModernButton
          variant="pokemon"
          pokemonType={activeTabData?.pokemonType || 'electric'}
          size="lg"
          className="rounded-full w-16 h-16 shadow-2xl"
          onClick={() => {
            uiSystem.showNotification({
              type: 'info',
              title: 'ダッシュボード',
              message: `${activeTabData?.label}タブを表示中`
            });
          }}
        >
          ⚡
        </ModernButton>
      </motion.div>

      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-64 h-64 rounded-full opacity-5"
            style={{
              background: `radial-gradient(circle, ${theme.colors.primary} 0%, transparent 70%)`,
              left: `${20 + i * 20}%`,
              top: `${10 + i * 15}%`,
            }}
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Example usage component
export function DashboardExample() {
  const uiSystem = ModernUISystem.getInstance();

  const dashboardTabs: DashboardTab[] = [
    {
      id: 'overview',
      label: '概要',
      icon: '🏠',
      pokemonType: 'normal',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">ダッシュボード概要</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ModernCard variant="glass" padding="md">
              <h3 className="font-bold text-lg mb-2">総プレイヤー数</h3>
              <p className="text-3xl font-bold text-indigo-600">1,234</p>
            </ModernCard>
            <ModernCard variant="glass" padding="md">
              <h3 className="font-bold text-lg mb-2">アクティブユーザー</h3>
              <p className="text-3xl font-bold text-green-600">567</p>
            </ModernCard>
            <ModernCard variant="glass" padding="md">
              <h3 className="font-bold text-lg mb-2">今日の試合数</h3>
              <p className="text-3xl font-bold text-orange-600">89</p>
            </ModernCard>
          </div>
        </div>
      )
    },
    {
      id: 'players',
      label: 'プレイヤー',
      icon: '👤',
      pokemonType: 'fighting',
      badge: 12,
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">プレイヤー管理</h2>
          <p>プレイヤー一覧とステータス</p>
        </div>
      )
    },
    {
      id: 'matches',
      label: '試合',
      icon: '🎾',
      pokemonType: 'electric',
      badge: 5,
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">試合管理</h2>
          <p>試合スケジュールと結果</p>
        </div>
      )
    },
    {
      id: 'settings',
      label: '設定',
      icon: '⚙️',
      pokemonType: 'steel',
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">システム設定</h2>
          <ModernButton
            variant="pokemon"
            pokemonType="fire"
            onClick={() => {
              uiSystem.showNotification({
                type: 'success',
                title: '設定保存',
                message: '設定が正常に保存されました！'
              });
            }}
          >
            設定を保存
          </ModernButton>
        </div>
      )
    }
  ];

  return (
    <ModernDashboard
      tabs={dashboardTabs}
      title="ポケテニマスター 管理画面"
      defaultTab="overview"
    />
  );
}