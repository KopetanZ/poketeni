'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { 
  processMonthlyProgression,
  executeYearProgressionEvent,
  getNextMonth,
  checkYearEnd,
  checkGameEnd,
  getYearProgressionStats,
  YEAR_SETTINGS,
  type YearProgressionEvent
} from '@/lib/year-progression-system';
import type { School } from '@/types/game';

export function useYearProgression() {
  const { user } = useAuth();
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [pendingEvents, setPendingEvents] = useState<YearProgressionEvent[]>([]);
  const [yearStats, setYearStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 学校データを読み込み
  const loadSchoolData = useCallback(async () => {
    if (!user) {
      setCurrentSchool(null);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setCurrentSchool(data);

      // 年度進行統計を読み込み
      const stats = await getYearProgressionStats(data.id);
      setYearStats(stats);
    } catch (err) {
      console.error('Error loading school data:', err);
      setError('学校データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 月次進行処理
  const processMonth = useCallback(async () => {
    if (!currentSchool || isProcessing) return;

    try {
      setIsProcessing(true);
      setError(null);

      // 現在の月のイベントを生成
      const events = await processMonthlyProgression(
        currentSchool.id,
        currentSchool.current_year,
        currentSchool.current_month,
        currentSchool.reputation,
        currentSchool.funds
      );

      setPendingEvents(events);
      return events;
    } catch (err) {
      console.error('Error processing month:', err);
      setError('月次処理に失敗しました');
      return [];
    } finally {
      setIsProcessing(false);
    }
  }, [currentSchool, isProcessing]);

  // イベント実行
  const executeEvent = useCallback(async (event: YearProgressionEvent) => {
    if (!currentSchool) return false;

    try {
      setIsProcessing(true);
      const success = await executeYearProgressionEvent(event);
      
      if (success) {
        // 実行済みイベントを削除
        setPendingEvents(prev => prev.filter(e => e.id !== event.id));
        
        // 学校データを再読み込み
        await loadSchoolData();
        
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error executing event:', err);
      setError('イベントの実行に失敗しました');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [currentSchool, loadSchoolData]);

  // 月を進める
  const advanceMonth = useCallback(async () => {
    if (!currentSchool || isProcessing) return false;

    try {
      setIsProcessing(true);
      
      // 次の月を計算
      const nextMonthData = getNextMonth(currentSchool.current_month, currentSchool.current_year);
      
      // 学校データを更新
      const { error } = await supabase
        .from('schools')
        .update({
          current_month: nextMonthData.month,
          current_year: nextMonthData.year,
          current_day: 1 // 月初に戻す
        })
        .eq('id', currentSchool.id);

      if (error) throw error;

      // ローカル状態を更新
      setCurrentSchool(prev => prev ? {
        ...prev,
        current_month: nextMonthData.month,
        current_year: nextMonthData.year,
        current_day: 1
      } : null);

      // 新しい月のイベントを生成
      const events = await processMonthlyProgression(
        currentSchool.id,
        nextMonthData.year,
        nextMonthData.month,
        currentSchool.reputation,
        currentSchool.funds
      );

      setPendingEvents(events);
      return true;
    } catch (err) {
      console.error('Error advancing month:', err);
      setError('月の進行に失敗しました');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [currentSchool, isProcessing]);

  // 年度終了処理
  const processYearEnd = useCallback(async () => {
    if (!currentSchool) return false;

    const isYearEnd = checkYearEnd(currentSchool.current_month);
    const isGameEnd = checkGameEnd(currentSchool.current_year);

    if (isYearEnd) {
      // 年度終了の特別処理
      console.log(`Year ${currentSchool.current_year} ended`);
      
      if (isGameEnd) {
        // ゲーム終了処理
        console.log('Game completed - 3 years finished!');
        return { type: 'game_end', message: '3年間の高校生活が終了しました！' };
      } else {
        return { type: 'year_end', message: `${currentSchool.current_year}年目が終了しました` };
      }
    }

    return false;
  }, [currentSchool]);

  // 自動イベント実行
  const executeAutomaticEvents = useCallback(async () => {
    const automaticEvents = pendingEvents.filter(event => event.isAutomatic);
    
    for (const event of automaticEvents) {
      await executeEvent(event);
    }
  }, [pendingEvents, executeEvent]);

  // 全イベントをクリア
  const clearAllEvents = useCallback(() => {
    setPendingEvents([]);
  }, []);

  // 学校統計の取得
  const getSchoolProgress = useCallback(() => {
    if (!currentSchool) return null;

    const totalMonths = (currentSchool.current_year - 1) * 12 + currentSchool.current_month - 4; // 4月開始
    const totalPossibleMonths = YEAR_SETTINGS.totalYears * 12;
    const progressPercentage = Math.round((totalMonths / totalPossibleMonths) * 100);

    return {
      currentYear: currentSchool.current_year,
      currentMonth: currentSchool.current_month,
      totalMonths,
      progressPercentage,
      isYearEnd: checkYearEnd(currentSchool.current_month),
      isGameEnd: checkGameEnd(currentSchool.current_year),
      monthsRemaining: totalPossibleMonths - totalMonths,
      yearsRemaining: YEAR_SETTINGS.totalYears - currentSchool.current_year + 1
    };
  }, [currentSchool]);

  // 月の名前を取得
  const getMonthName = useCallback((month: number) => {
    const monthNames = [
      '', '1月', '2月', '3月', '4月', '5月', '6月',
      '7月', '8月', '9月', '10月', '11月', '12月'
    ];
    return monthNames[month] || '';
  }, []);

  // 学年の文字列を取得
  const getGradeString = useCallback((year: number) => {
    return `${year}年生`;
  }, []);

  // イベントの重要度によるフィルタリング
  const getEventsByPriority = useCallback((priority: 'high' | 'medium' | 'low') => {
    return pendingEvents.filter(event => event.priority === priority);
  }, [pendingEvents]);

  // 初期化
  useEffect(() => {
    loadSchoolData();
  }, [loadSchoolData]);

  // 自動イベントの実行（イベントが変更されたとき）
  useEffect(() => {
    if (pendingEvents.length > 0) {
      executeAutomaticEvents();
    }
  }, [pendingEvents.length]); // executeAutomaticEvents は除外して無限ループを防ぐ

  return {
    // 状態
    currentSchool,
    pendingEvents,
    yearStats,
    loading,
    error,
    isProcessing,

    // アクション
    processMonth,
    executeEvent,
    advanceMonth,
    processYearEnd,
    clearAllEvents,
    loadSchoolData,

    // ユーティリティ
    getSchoolProgress,
    getMonthName,
    getGradeString,
    getEventsByPriority,

    // 設定
    YEAR_SETTINGS
  };
}