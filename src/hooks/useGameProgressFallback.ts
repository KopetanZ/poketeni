'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { StorageFallback } from '@/lib/storage-fallback';
import { checkTableExists } from '@/lib/database-setup';
import { MapGenerator } from '@/lib/card-system/map-generator';
import { CardGenerator } from '@/lib/card-system/card-generator';
import type { GameProgress, SeasonMap, MapPanel } from '@/types/card-system';

export function useGameProgressFallback() {
  const { user } = useAuth();
  const [gameProgress, setGameProgress] = useState<GameProgress | null>(null);
  const [seasonMap, setSeasonMap] = useState<SeasonMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useLocalStorage, setUseLocalStorage] = useState(false);

  // データベーステーブル存在チェック（常にローカルストレージを使用）
  useEffect(() => {
    if (user) {
      console.log('Using localStorage for all card game data due to database issues');
      setUseLocalStorage(true);
    }
  }, [user]);

  // データ読み込み
  useEffect(() => {
    if (!user) {
      setGameProgress(null);
      setSeasonMap(null);
      setLoading(false);
      return;
    }

    loadData();
  }, [user, useLocalStorage]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      if (useLocalStorage) {
        // ローカルストレージから読み込み
        const progress = StorageFallback.loadGameProgress(user.id);
        const map = StorageFallback.loadSeasonMap(user.id);

        console.log('Data loaded from localStorage:', { progress, map });

        setGameProgress(progress);
        setSeasonMap(map);
      } else {
        // データベースから読み込み（従来の処理）
        await loadFromDatabase();
      }
    } catch (err: any) {
      console.error('Failed to load data:', err);
      
      // データベースエラーの場合は常にローカルストレージにフォールバック
      if (!useLocalStorage) {
        console.log('Database error, switching to localStorage');
        setUseLocalStorage(true);
        
        // ローカルストレージからデータを読み込み直し
        const progress = StorageFallback.loadGameProgress(user?.id || '');
        const map = StorageFallback.loadSeasonMap(user?.id || '');
        setGameProgress(progress);
        setSeasonMap(map);
        
        setError(null); // エラーをクリア
      } else {
        setError('ローカルストレージからのデータ読み込みに失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFromDatabase = async () => {
    if (!user) return;

    // 学校IDを取得
    const { data: schoolData, error: schoolError } = await supabase
      .from('schools')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (schoolError) throw schoolError;
    if (!schoolData) throw new Error('School not found');

    const schoolId = schoolData.id;

    // ゲーム進行状況を取得
    const { data: progressData, error: progressError } = await supabase
      .from('game_progress')
      .select('*')
      .eq('school_id', schoolId)
      .single();

    if (progressError && progressError.code !== 'PGRST116') {
      throw progressError;
    }

    // シーズンマップを取得
    const { data: mapData, error: mapError } = await supabase
      .from('season_maps')
      .select('*')
      .eq('school_id', schoolId)
      .eq('year', progressData?.current_year || 1)
      .single();

    if (mapError && mapError.code !== 'PGRST116') {
      throw mapError;
    }

    // データ変換
    if (progressData) {
      const progress: GameProgress = {
        currentYear: progressData.current_year,
        currentMonth: progressData.current_month,
        currentDay: progressData.current_day,
        currentPosition: progressData.current_position,
        hand: progressData.hand || { cards: [], maxCards: 4, drawPileSize: 20 },
        usedCards: progressData.used_cards || [],
        isCardSelectionPhase: progressData.is_card_selection_phase,
        isMovementPhase: progressData.is_movement_phase,
        isEventPhase: progressData.is_event_phase,
        forcedStop: progressData.forced_stop
      };
      setGameProgress(progress);
    }

    if (mapData) {
      const map: SeasonMap = {
        year: mapData.year,
        totalDays: mapData.total_days,
        panels: mapData.panels,
        fixedEvents: mapData.fixed_events || [],
        randomPanelDistribution: mapData.random_panel_distribution || {
          good_event: 20,
          bad_event: 15,
          normal: 50,
          special_training: 10,
          character: 5
        }
      };
      setSeasonMap(map);
    }
  };

  // ゲーム進行状況保存
  const saveGameProgress = async (progress: GameProgress) => {
    if (!user) return;

    try {
      if (useLocalStorage) {
        // ローカルストレージに保存
        const schoolId = 'localStorage-school'; // 仮のschoolId
        StorageFallback.saveGameProgress(user.id, schoolId, progress);
        
        // 学校の日付も更新
        StorageFallback.updateSchoolDate(user.id, progress.currentMonth, progress.currentDay);
        
        setGameProgress(progress);
      } else {
        // データベースに保存（従来の処理）
        await saveToDatabase(progress);
        setGameProgress(progress);
      }
    } catch (err: any) {
      console.error('Failed to save game progress:', err);
      setError(err.message);
    }
  };

  const saveToDatabase = async (progress: GameProgress) => {
    if (!user) return;

    const { data: schoolData } = await supabase
      .from('schools')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!schoolData) throw new Error('School not found');

    const { error } = await supabase
      .from('game_progress')
      .upsert({
        school_id: schoolData.id,
        user_id: user.id,
        current_year: progress.currentYear,
        current_month: progress.currentMonth,
        current_day: progress.currentDay,
        current_position: progress.currentPosition,
        hand: progress.hand,
        used_cards: progress.usedCards,
        is_card_selection_phase: progress.isCardSelectionPhase,
        is_movement_phase: progress.isMovementPhase,
        is_event_phase: progress.isEventPhase,
        forced_stop: progress.forcedStop,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  };

  // シーズンマップ保存
  const saveSeasonMap = async (map: SeasonMap) => {
    if (!user) return;

    try {
      if (useLocalStorage) {
        // ローカルストレージに保存
        const schoolId = 'localStorage-school';
        StorageFallback.saveSeasonMap(user.id, schoolId, map);
        setSeasonMap(map);
      } else {
        // データベースに保存
        await saveMapToDatabase(map);
        setSeasonMap(map);
      }
    } catch (err: any) {
      console.error('Failed to save season map:', err);
      setError(err.message);
    }
  };

  const saveMapToDatabase = async (map: SeasonMap) => {
    if (!user) return;

    const { data: schoolData } = await supabase
      .from('schools')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!schoolData) throw new Error('School not found');

    const { error } = await supabase
      .from('season_maps')
      .upsert({
        school_id: schoolData.id,
        year: map.year,
        total_days: map.totalDays,
        panels: map.panels,
        fixed_events: map.fixedEvents,
        random_panel_distribution: map.randomPanelDistribution
      });

    if (error) throw error;
  };

  // イベント記録
  const recordEvent = async (eventData: any) => {
    if (!user) return;

    try {
      if (useLocalStorage) {
        StorageFallback.saveEventHistory(user.id, 'localStorage-school', eventData);
      } else {
        const { data: schoolData } = await supabase
          .from('schools')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!schoolData) throw new Error('School not found');

        const { error } = await supabase
          .from('event_history')
          .insert({
            school_id: schoolData.id,
            ...eventData
          });

        if (error) throw error;
      }
    } catch (err: any) {
      console.error('Failed to record event:', err);
    }
  };

  // 初期化
  const initializeGameProgress = async () => {
    if (!user) return;

    const initialProgress: GameProgress = {
      currentYear: 1,
      currentMonth: 4,
      currentDay: 1,
      currentPosition: 0,
      hand: {
        cards: CardGenerator.generateHand(0, 1, 0),
        maxCards: 4,
        drawPileSize: 20
      },
      usedCards: [],
      isCardSelectionPhase: true,
      isMovementPhase: false,
      isEventPhase: false
    };

    const initialMap = MapGenerator.generateSeasonMap(1, 0);

    // 常にローカルストレージを使用
    setUseLocalStorage(true);
    await saveGameProgress(initialProgress);
    await saveSeasonMap(initialMap);

    return { progress: initialProgress, map: initialMap };
  };

  return {
    gameProgress,
    seasonMap,
    loading,
    error,
    useLocalStorage,
    saveGameProgress,
    saveSeasonMap,
    recordEvent,
    initializeGameProgress,
    reload: loadData
  };
}