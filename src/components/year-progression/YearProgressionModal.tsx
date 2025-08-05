'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Calendar, 
  GraduationCap, 
  UserPlus, 
  Trophy, 
  Star, 
  Clock,
  ChevronRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import type { YearProgressionEvent } from '@/lib/year-progression-system';

interface YearProgressionModalProps {
  isOpen: boolean;
  events: YearProgressionEvent[];
  currentYear: number;
  currentMonth: number;
  onClose: () => void;
  onExecuteEvent: (event: YearProgressionEvent) => Promise<boolean>;
  isProcessing: boolean;
}

export function YearProgressionModal({
  isOpen,
  events,
  currentYear,
  currentMonth,
  onClose,
  onExecuteEvent,
  isProcessing
}: YearProgressionModalProps) {
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [executedEvents, setExecutedEvents] = useState<Set<string>>(new Set());

  if (!isOpen || events.length === 0) return null;

  const currentEvent = events[currentEventIndex];
  const hasNextEvent = currentEventIndex < events.length - 1;
  const hasPrevEvent = currentEventIndex > 0;

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'graduation':
        return <GraduationCap className="w-6 h-6" />;
      case 'promotion':
        return <Calendar className="w-6 h-6" />;
      case 'new_students':
        return <UserPlus className="w-6 h-6" />;
      case 'tournament':
        return <Trophy className="w-6 h-6" />;
      case 'special':
        return <Star className="w-6 h-6" />;
      default:
        return <Clock className="w-6 h-6" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'graduation':
        return 'from-purple-500 to-pink-500';
      case 'promotion':
        return 'from-blue-500 to-indigo-500';
      case 'new_students':
        return 'from-green-500 to-emerald-500';
      case 'tournament':
        return 'from-yellow-500 to-orange-500';
      case 'special':
        return 'from-red-500 to-rose-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'graduation':
        return '卒業';
      case 'promotion':
        return '進級';
      case 'new_students':
        return '新入生';
      case 'tournament':
        return '大会';
      case 'special':
        return '特別イベント';
      default:
        return type;
    }
  };

  const getMonthName = (month: number) => {
    const monthNames = [
      '', '1月', '2月', '3月', '4月', '5月', '6月',
      '7月', '8月', '9月', '10月', '11月', '12月'
    ];
    return monthNames[month] || '';
  };

  const handleExecuteEvent = async () => {
    const success = await onExecuteEvent(currentEvent);
    if (success) {
      setExecutedEvents(prev => new Set(prev).add(currentEvent.id));
      
      // 次のイベントがある場合は自動で進む
      if (hasNextEvent) {
        setTimeout(() => {
          setCurrentEventIndex(prev => prev + 1);
        }, 1000);
      } else {
        // 全てのイベントが完了したら少し待ってからモーダルを閉じる
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    }
  };

  const isCurrentEventExecuted = executedEvents.has(currentEvent.id);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ヘッダー */}
          <div className={`bg-gradient-to-r ${getEventColor(currentEvent.type)} text-white p-6`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  {getEventIcon(currentEvent.type)}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{currentEvent.title}</h2>
                  <div className="text-sm opacity-90">
                    {currentYear}年 {getMonthName(currentEvent.month)} - {getEventTypeLabel(currentEvent.type)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
                  {currentEventIndex + 1} / {events.length}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* コンテンツ */}
          <div className="p-6">
            {/* イベント説明 */}
            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed text-lg">
                {currentEvent.description}
              </p>
            </div>

            {/* エフェクト表示 */}
            <div className="space-y-4 mb-6">
              {currentEvent.effects.specialEffects && currentEvent.effects.specialEffects.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Star className="w-4 h-4 mr-2 text-yellow-500" />
                    特別効果
                  </h4>
                  <div className="space-y-2">
                    {currentEvent.effects.specialEffects.map((effect, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                        <span className="text-gray-700">{effect}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentEvent.effects.newPlayers && currentEvent.effects.newPlayers.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <UserPlus className="w-4 h-4 mr-2 text-green-500" />
                    新メンバー
                  </h4>
                  <div className="text-sm text-gray-700">
                    {currentEvent.effects.newPlayers.length}名の新しいプレイヤーが加入します
                  </div>
                </div>
              )}

              {currentEvent.effects.removePlayers && currentEvent.effects.removePlayers.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <GraduationCap className="w-4 h-4 mr-2 text-purple-500" />
                    卒業・離脱
                  </h4>
                  <div className="text-sm text-gray-700">
                    {currentEvent.effects.removePlayers.length}名のプレイヤーが卒業・離脱します
                  </div>
                </div>
              )}

              {currentEvent.effects.schoolChanges && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                    学校への影響
                  </h4>
                  <div className="space-y-1 text-sm text-gray-700">
                    {currentEvent.effects.schoolChanges.funds !== undefined && (
                      <div className="flex items-center space-x-2">
                        <span>資金:</span>
                        <span className={currentEvent.effects.schoolChanges.funds >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {currentEvent.effects.schoolChanges.funds >= 0 ? '+' : ''}
                          ¥{currentEvent.effects.schoolChanges.funds.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {currentEvent.effects.schoolChanges.reputation !== undefined && (
                      <div className="flex items-center space-x-2">
                        <span>評判:</span>
                        <span className={currentEvent.effects.schoolChanges.reputation >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {currentEvent.effects.schoolChanges.reputation >= 0 ? '+' : ''}
                          {currentEvent.effects.schoolChanges.reputation}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* プライオリティ表示 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">重要度:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  currentEvent.priority === 'high' ? 'bg-red-100 text-red-700' :
                  currentEvent.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {currentEvent.priority === 'high' ? '高' :
                   currentEvent.priority === 'medium' ? '中' : '低'}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {currentEvent.isAutomatic ? (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>自動実行</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>手動実行</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* フッター */}
          <div className="bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentEventIndex(prev => prev - 1)}
                  disabled={!hasPrevEvent}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  前へ
                </button>
                <button
                  onClick={() => setCurrentEventIndex(prev => prev + 1)}
                  disabled={!hasNextEvent}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  次へ
                </button>
              </div>

              <div className="flex items-center space-x-3">
                {isCurrentEventExecuted ? (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">実行済み</span>
                  </div>
                ) : (
                  <button
                    onClick={handleExecuteEvent}
                    disabled={isProcessing}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>実行中...</span>
                      </>
                    ) : (
                      <>
                        <span>実行</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}