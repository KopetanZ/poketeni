'use client';

import { useEffect, useState } from 'react';
import { GameLayout } from '@/components/layout/GameLayout';
import { useAuth } from '@/context/AuthContext';
import { useYearProgression } from '@/hooks/useYearProgression';
import { Calendar, Trophy, Users, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

interface ScheduleEvent {
  id: string;
  title: string;
  type: 'match' | 'practice' | 'exam' | 'event';
  date: string;
  description: string;
  importance: 'high' | 'medium' | 'low';
}

export default function SchedulePage() {
  const { user } = useAuth();
  const { currentSchool, getMonthName } = useYearProgression();
  const [events, setEvents] = useState<ScheduleEvent[]>([]);

  useEffect(() => {
    // 模擬的なスケジュールイベント
    const mockEvents: ScheduleEvent[] = [
      {
        id: '1',
        title: '県予選トーナメント',
        type: 'match',
        date: '4月15日',
        description: '春季県大会の第1回戦',
        importance: 'high'
      },
      {
        id: '2',
        title: '合同練習',
        type: 'practice',
        date: '4月10日',
        description: '近隣の強豪校との合同練習',
        importance: 'medium'
      },
      {
        id: '3',
        title: '中間試験',
        type: 'exam',
        date: '5月20日',
        description: '1学期中間試験期間',
        importance: 'high'
      },
      {
        id: '4',
        title: '新入部員歓迎会',
        type: 'event',
        date: '4月8日',
        description: '新1年生の歓迎イベント',
        importance: 'low'
      }
    ];

    setEvents(mockEvents);
  }, []);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'match': return Trophy;
      case 'practice': return Users;
      case 'exam': return BookOpen;
      default: return Calendar;
    }
  };

  const getEventColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'bg-red-100 border-red-300 text-red-800';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <GameLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-display">
              スケジュール
            </h1>
            <p className="text-gray-600 mt-2">
              今後の予定を確認して準備を進めましょう
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500">現在</div>
            <div className="text-lg font-bold text-gray-900">
              {currentSchool ? 
                `${currentSchool.current_year}年目 ${getMonthName(currentSchool.current_month)}${currentSchool.current_day}日` :
                '1年目 4月1日'
              }
            </div>
          </div>
        </div>

        {/* カレンダービュー */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Calendar className="mr-2" size={24} />
            今月の予定
          </h2>
          
          <div className="grid gap-4">
            {events.map((event, index) => {
              const Icon = getEventIcon(event.type);
              
              return (
                <motion.div
                  key={event.id}
                  className={`p-4 rounded-lg border-2 ${getEventColor(event.importance)}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon className="flex-shrink-0" size={20} />
                      <div>
                        <h3 className="font-bold">{event.title}</h3>
                        <p className="text-sm opacity-75 mt-1">{event.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{event.date}</div>
                      <div className="text-xs opacity-75 mt-1 capitalize">{event.type}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 今日のタスク */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            今日のタスク
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <input type="checkbox" className="rounded" />
              <span>朝練の準備を行う</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <input type="checkbox" className="rounded" />
              <span>選手のコンディションをチェック</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <input type="checkbox" className="rounded" />
              <span>練習メニューを決定</span>
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}