'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { StorageFallback } from '@/lib/storage-fallback';

// ローカルストレージ専用の年度進行フック（簡素版）
export function useYearProgressionLocal() {
  const { user } = useAuth();
  const [currentSchool, setCurrentSchool] = useState<any>(null);
  const [pendingEvents, setPendingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 月名取得
  const getMonthName = (month: number): string => {
    const monthNames = [
      '1月', '2月', '3月', '4月', '5月', '6月',
      '7月', '8月', '9月', '10月', '11月', '12月'
    ];
    return monthNames[month - 1] || '不明';
  };

  // ローカルストレージから学校データを模擬的に作成
  const loadSchoolData = useCallback(async () => {
    if (!user) {
      setCurrentSchool(null);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      // ローカルストレージから日付を読み込み
      const localDate = StorageFallback.loadSchoolDate(user.id);
      
      // 模擬学校データ
      const mockSchoolData = {
        id: 'localStorage-school',
        user_id: user.id,
        name: `${user.username}のテニス部`,
        current_year: 1,
        current_month: localDate?.current_month || 4,
        current_day: localDate?.current_day || 1,
        reputation: 50,
        funds: 100000,
        facilities: {
          courts: { count: 2, quality: 1 }
        }
      };
      
      setCurrentSchool(mockSchoolData);
      console.log('Mock school data loaded:', mockSchoolData);
    } catch (err) {
      console.error('Error loading school data:', err);
      setError('学校データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSchoolData();
  }, [loadSchoolData]);

  // 年度進行統計取得（モック）
  const getYearProgressionStats = useCallback(() => {
    return {
      currentMonth: currentSchool?.current_month || 4,
      currentYear: currentSchool?.current_year || 1,
      totalEvents: 0,
      completedEvents: 0
    };
  }, [currentSchool]);

  // 月次進行処理（無効化）
  const processMonth = useCallback(async () => {
    console.log('Month progression disabled for localStorage mode');
    return [];
  }, []);

  // イベント実行（無効化）
  const executeEvent = useCallback(async (event: any) => {
    console.log('Event execution disabled for localStorage mode');
    return false;
  }, []);

  // 次の月へ進む（無効化）
  const advanceToNextMonth = useCallback(async () => {
    console.log('Month advancement disabled for localStorage mode');
    return null;
  }, []);

  return {
    currentSchool,
    pendingEvents,
    loading,
    error,
    isProcessing: false,
    
    // 関数
    getMonthName,
    getYearProgressionStats,
    processMonth,
    executeEvent,
    advanceToNextMonth,
    reload: loadSchoolData
  };
}