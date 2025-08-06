'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { generateInitialTeam } from '@/lib/player-generator';
import { StorageFallback } from '@/lib/storage-fallback';
import { checkTableExists } from '@/lib/database-setup';
import type { GameProgress, SeasonMap, MapPanel } from '@/types/card-system';

interface GameProgressData {
  id: string;
  school_id: string;
  current_year: number;
  current_month: number;
  current_day: number;
  current_position: number;
  current_hand: any[];
  used_cards: any[];
  deck_cards: any[];
  is_card_selection_phase: boolean;
  is_movement_phase: boolean;
  is_event_phase: boolean;
  forced_stop: any;
  created_at: string;
  updated_at: string;
}

interface SeasonMapData {
  id: string;
  school_id: string;
  year: number;
  total_days: number;
  panels: MapPanel[];
  fixed_events: any[];
  created_at: string;
}

interface EventHistoryData {
  event_date: string;
  event_position: number;
  event_type: string;
  event_title: string;
  event_description: string;
  choice_selected?: number;
  choice_text?: string;
  effects: any;
  affected_players: string[];
}

export function useGameProgress() {
  const { user } = useAuth();
  const [gameProgress, setGameProgress] = useState<GameProgress | null>(null);
  const [seasonMap, setSeasonMap] = useState<SeasonMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ゲーム進行状況を読み込み
  const loadGameProgress = async () => {
    if (!user) {
      setGameProgress(null);
      setSeasonMap(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 学校IDを取得
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (schoolError) throw schoolError;
      if (!schoolData) throw new Error('School not found');

      // ゲーム進行状況を取得
      const { data: progressData, error: progressError } = await supabase
        .from('game_progress')
        .select('*')
        .eq('school_id', schoolData.id)
        .single();

      if (progressError && progressError.code !== 'PGRST116') {
        throw progressError;
      }

      // 年間マップを取得
      const currentYear = progressData?.current_year || 1;
      const { data: mapData, error: mapError } = await supabase
        .from('season_maps')
        .select('*')
        .eq('school_id', schoolData.id)
        .eq('year', currentYear)
        .single();

      if (mapError && mapError.code !== 'PGRST116') {
        throw mapError;
      }

      // データを変換
      if (progressData) {
        const gameState: GameProgress = {
          currentYear: progressData.current_year,
          currentMonth: progressData.current_month,
          currentDay: progressData.current_day,
          currentPosition: progressData.current_position,
          hand: {
            cards: progressData.current_hand || [],
            maxCards: Math.min(4 + Math.floor((progressData.current_year - 1) * 2), 8),
            drawPileSize: (progressData.deck_cards || []).length
          },
          usedCards: progressData.used_cards || [],
          isCardSelectionPhase: progressData.is_card_selection_phase,
          isMovementPhase: progressData.is_movement_phase,
          isEventPhase: progressData.is_event_phase,
          forcedStop: progressData.forced_stop
        };
        setGameProgress(gameState);
      }

      if (mapData) {
        const map: SeasonMap = {
          year: mapData.year,
          totalDays: mapData.total_days,
          panels: mapData.panels,
          fixedEvents: mapData.fixed_events,
          randomPanelDistribution: mapData.random_panel_distribution || {
            good_event: 20,
            bad_event: 10,
            normal: 50,
            special_training: 15,
            character: 5
          }
        };
        setSeasonMap(map);
      }

    } catch (err) {
      console.error('Error loading game progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to load game progress');
    } finally {
      setLoading(false);
    }
  };

  // ゲーム進行状況を保存
  const saveGameProgress = async (progress: GameProgress) => {
    if (!user) return false;

    try {
      // 学校IDを取得
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (schoolError) throw schoolError;
      if (!schoolData) throw new Error('School not found');

      const progressData = {
        school_id: schoolData.id,
        current_year: progress.currentYear,
        current_month: progress.currentMonth,
        current_day: progress.currentDay,
        current_position: progress.currentPosition,
        current_hand: progress.hand.cards,
        used_cards: progress.usedCards,
        deck_cards: [], // 山札は別途管理
        is_card_selection_phase: progress.isCardSelectionPhase,
        is_movement_phase: progress.isMovementPhase,
        is_event_phase: progress.isEventPhase,
        forced_stop: progress.forcedStop
      };

      const { error } = await supabase
        .from('game_progress')
        .upsert(progressData, { onConflict: 'school_id' });

      if (error) throw error;

      setGameProgress(progress);
      return true;

    } catch (err) {
      console.error('Error saving game progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to save game progress');
      return false;
    }
  };

  // 年間マップを保存
  const saveSeasonMap = async (map: SeasonMap) => {
    if (!user) return false;

    try {
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (schoolError) throw schoolError;
      if (!schoolData) throw new Error('School not found');

      const mapData = {
        school_id: schoolData.id,
        year: map.year,
        total_days: map.totalDays,
        panels: map.panels,
        fixed_events: map.fixedEvents
      };

      const { error } = await supabase
        .from('season_maps')
        .upsert(mapData, { onConflict: 'school_id,year' });

      if (error) throw error;

      setSeasonMap(map);
      return true;

    } catch (err) {
      console.error('Error saving season map:', err);
      setError(err instanceof Error ? err.message : 'Failed to save season map');
      return false;
    }
  };

  // イベント履歴を記録
  const recordEvent = async (eventData: EventHistoryData) => {
    if (!user) return false;

    try {
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (schoolError) throw schoolError;
      if (!schoolData) throw new Error('School not found');

      const { error } = await supabase
        .from('event_history')
        .insert({
          school_id: schoolData.id,
          ...eventData
        });

      if (error) throw error;
      return true;

    } catch (err) {
      console.error('Error recording event:', err);
      setError(err instanceof Error ? err.message : 'Failed to record event');
      return false;
    }
  };

  // 初期化処理
  const initializeGameProgress = async () => {
    if (!user) return false;

    try {
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('id, reputation')
        .eq('user_id', user.id)
        .single();

      if (schoolError) throw schoolError;
      if (!schoolData) throw new Error('School not found');

      // 既存の選手データをチェック
      const { data: existingPlayers, error: playersError } = await supabase
        .from('players')
        .select('id')
        .eq('school_id', schoolData.id)
        .limit(1);

      if (playersError) {
        console.error('Error checking existing players:', playersError);
      }

      // 選手が存在しない場合は初期チームを生成
      if (!existingPlayers || existingPlayers.length === 0) {
        console.log('No existing players found, generating initial team...');
        const teamGenerated = await generateInitialTeam(schoolData.id);
        if (!teamGenerated) {
          console.warn('Failed to generate initial team, but continuing...');
        }
      }

      // 初期ゲーム進行状況を作成
      const initialProgress = {
        school_id: schoolData.id,
        current_year: 1,
        current_month: 4,
        current_day: 1,
        current_position: 0,
        current_hand: [],
        used_cards: [],
        deck_cards: [],
        is_card_selection_phase: true,
        is_movement_phase: false,
        is_event_phase: false,
        forced_stop: null
      };

      const { error: progressError } = await supabase
        .from('game_progress')
        .upsert(initialProgress, { onConflict: 'school_id' });

      if (progressError) throw progressError;

      return true;

    } catch (err) {
      console.error('Error initializing game progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize game progress');
      return false;
    }
  };

  useEffect(() => {
    loadGameProgress();
  }, [user]);

  return {
    gameProgress,
    seasonMap,
    loading,
    error,
    loadGameProgress,
    saveGameProgress,
    saveSeasonMap,
    recordEvent,
    initializeGameProgress
  };
}