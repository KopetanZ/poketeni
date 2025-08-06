'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  Users, 
  BookOpen,
  ChevronRight,
  Play,
  FastForward,
  AlertTriangle,
  CheckCircle2,
  Trophy,
  GraduationCap
} from 'lucide-react';
import { YearProgressionModal } from './YearProgressionModal';
import { useYearProgressionLocal } from '@/hooks/useYearProgressionLocal';

export function YearProgressionDashboard() {
  const {
    currentSchool,
    pendingEvents,
    loading,
    error,
    isProcessing,
    processMonth,
    executeEvent,
    getMonthName
  } = useYearProgressionLocal();

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 text-red-700">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">エラー</span>
        </div>
        <p className="text-red-600 mt-2">{error}</p>
      </div>
    );
  }

  if (!currentSchool) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <p className="text-gray-600">学校データが見つかりません</p>
      </div>
    );
  }

  const schoolProgress = getSchoolProgress();
  const highPriorityEvents = getEventsByPriority('high');
  const mediumPriorityEvents = getEventsByPriority('medium');

  const handleProcessMonth = async () => {
    const events = await processMonth();
    if (events && events.length > 0) {
      setIsEventModalOpen(true);
    }
  };

  const handleAdvanceMonth = async () => {
    await advanceMonth();
  };

  return (
    <div className="space-y-6">
      {/* メインダッシュボード */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">年度進行管理</h2>
              <p className="text-blue-100 mt-1">
                {currentSchool.name} - {getGradeString(currentSchool.current_year)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {getMonthName(currentSchool.current_month)}
              </div>
              <div className="text-sm text-blue-100">
                {currentSchool.current_year}/{YEAR_SETTINGS.totalYears}年目
              </div>
            </div>
          </div>
        </div>

        {/* 進行状況バー */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">学校生活進行度</span>
            <span className="text-sm text-gray-600">
              {schoolProgress?.progressPercentage || 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${schoolProgress?.progressPercentage || 0}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>入学</span>
            <span>{schoolProgress?.monthsRemaining || 0}ヶ月残り</span>
            <span>卒業</span>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {schoolProgress?.currentYear || 1}
              </div>
              <div className="text-sm text-gray-600">現在の学年</div>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {schoolProgress?.totalMonths || 0}
              </div>
              <div className="text-sm text-gray-600">経過月数</div>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {yearStats?.totalEvents || 0}
              </div>
              <div className="text-sm text-gray-600">総イベント数</div>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {currentSchool.reputation}
              </div>
              <div className="text-sm text-gray-600">学校評判</div>
            </div>
          </div>
        </div>
      </div>

      {/* ペンディングイベント */}
      {pendingEvents.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
              保留中のイベント ({pendingEvents.length})
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {pendingEvents.slice(0, 3).map((event) => (
              <div key={event.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      event.priority === 'high' ? 'bg-red-500' :
                      event.priority === 'medium' ? 'bg-yellow-500' :
                      'bg-gray-400'
                    }`} />
                    <div>
                      <div className="font-medium text-gray-900">{event.title}</div>
                      <div className="text-sm text-gray-600">
                        {getMonthName(event.month)} - {event.type}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {event.isAutomatic && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                        自動
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      event.priority === 'high' ? 'bg-red-100 text-red-700' :
                      event.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {event.priority === 'high' ? '重要' :
                       event.priority === 'medium' ? '中程度' : '軽微'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {pendingEvents.length > 3 && (
              <div className="p-4 text-center text-gray-600">
                他 {pendingEvents.length - 3} 件のイベント
              </div>
            )}
          </div>
        </div>
      )}

      {/* アクションボタン */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">月次進行</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleProcessMonth}
            disabled={isProcessing}
            className="flex items-center justify-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-5 h-5" />
            <span>今月のイベントを処理</span>
          </button>

          <button
            onClick={handleAdvanceMonth}
            disabled={isProcessing || pendingEvents.length > 0}
            className="flex items-center justify-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FastForward className="w-5 h-5" />
            <span>次月へ進む</span>
          </button>
        </div>

        {pendingEvents.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2 text-yellow-800">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                未処理のイベントがあるため、月を進めることができません
              </span>
            </div>
          </div>
        )}

        {pendingEvents.length > 0 && (
          <button
            onClick={() => setIsEventModalOpen(true)}
            className="mt-4 w-full flex items-center justify-center space-x-2 bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors font-medium"
          >
            <BookOpen className="w-5 h-5" />
            <span>イベントを確認・実行</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 年度統計 */}
      {yearStats && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">年度統計</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <GraduationCap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-purple-900">
                {yearStats.graduationEvents}
              </div>
              <div className="text-sm text-purple-700">卒業式</div>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-blue-900">
                {yearStats.newStudentEvents}
              </div>
              <div className="text-sm text-blue-700">新入生歓迎</div>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-yellow-900">
                {yearStats.tournamentEvents}
              </div>
              <div className="text-sm text-yellow-700">大会参加</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-green-900">
                {yearStats.specialEvents}
              </div>
              <div className="text-sm text-green-700">特別イベント</div>
            </div>
          </div>
        </div>
      )}

      {/* イベントモーダル */}
      <YearProgressionModal
        isOpen={isEventModalOpen}
        events={pendingEvents}
        currentYear={currentSchool.current_year}
        currentMonth={currentSchool.current_month}
        onClose={() => setIsEventModalOpen(false)}
        onExecuteEvent={executeEvent}
        isProcessing={isProcessing}
      />
    </div>
  );
}