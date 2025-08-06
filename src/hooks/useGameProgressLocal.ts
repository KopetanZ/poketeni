'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { StorageFallback } from '@/lib/storage-fallback';
import { MapGenerator } from '@/lib/card-system/map-generator';
import { CardGenerator } from '@/lib/card-system/card-generator';
import type { GameProgress, SeasonMap } from '@/types/card-system';

export function useGameProgressLocal() {
  const { user } = useAuth();
  const [gameProgress, setGameProgress] = useState<GameProgress | null>(null);
  const [seasonMap, setSeasonMap] = useState<SeasonMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // データ読み込み
  useEffect(() => {
    if (!user) {
      setGameProgress(null);
      setSeasonMap(null);
      setLoading(false);
      return;
    }

    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      console.log('Loading game data from localStorage for user:', user.id);

      // ローカルストレージから読み込み
      const progress = StorageFallback.loadGameProgress(user.id);
      const map = StorageFallback.loadSeasonMap(user.id);

      console.log('Loaded from localStorage:', { progress: !!progress, map: !!map });

      setGameProgress(progress);
      setSeasonMap(map);
    } catch (err: any) {
      console.error('Failed to load data from localStorage:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ゲーム進行状況保存
  const saveGameProgress = async (progress: GameProgress) => {
    if (!user) return;

    try {
      const schoolId = 'localStorage-school';
      StorageFallback.saveGameProgress(user.id, schoolId, progress);
      
      // 学校の日付も更新
      StorageFallback.updateSchoolDate(user.id, progress.currentMonth, progress.currentDay);
      
      setGameProgress(progress);
      console.log('Game progress saved to localStorage');
    } catch (err: any) {
      console.error('Failed to save game progress:', err);
      setError(err.message);
    }
  };

  // シーズンマップ保存
  const saveSeasonMap = async (map: SeasonMap) => {
    if (!user) return;

    try {
      const schoolId = 'localStorage-school';
      StorageFallback.saveSeasonMap(user.id, schoolId, map);
      setSeasonMap(map);
      console.log('Season map saved to localStorage');
    } catch (err: any) {
      console.error('Failed to save season map:', err);
      setError(err.message);
    }
  };

  // イベント記録
  const recordEvent = async (eventData: any) => {
    if (!user) return;

    try {
      StorageFallback.saveEventHistory(user.id, 'localStorage-school', eventData);
      console.log('Event recorded to localStorage');
    } catch (err: any) {
      console.error('Failed to record event:', err);
    }
  };

  // 初期化
  const initializeGameProgress = async () => {
    if (!user) return;

    console.log('Initializing new game in localStorage');

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

    await saveGameProgress(initialProgress);
    await saveSeasonMap(initialMap);

    console.log('Game initialized successfully');
    return { progress: initialProgress, map: initialMap };
  };

  return {
    gameProgress,
    seasonMap,
    loading,
    error,
    useLocalStorage: true, // 常にtrue
    saveGameProgress,
    saveSeasonMap,
    recordEvent,
    initializeGameProgress,
    reload: loadData
  };
}