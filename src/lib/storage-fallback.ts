// データベース接続失敗時のローカルストレージフォールバック
import type { GameProgress, SeasonMap } from '@/types/card-system';

const STORAGE_KEYS = {
  GAME_PROGRESS: 'poke-tennis-game-progress',
  SEASON_MAP: 'poke-tennis-season-map',
  EVENT_HISTORY: 'poke-tennis-event-history'
} as const;

export class StorageFallback {
  // ゲーム進行状況の保存
  static saveGameProgress(userId: string, schoolId: string, progress: GameProgress): void {
    try {
      const key = `${STORAGE_KEYS.GAME_PROGRESS}-${userId}`;
      const data = {
        ...progress,
        school_id: schoolId,
        user_id: userId,
        updated_at: new Date().toISOString()
      };
      localStorage.setItem(key, JSON.stringify(data));
      console.log('Game progress saved to localStorage:', key);
    } catch (error) {
      console.error('Failed to save game progress to localStorage:', error);
    }
  }

  // ゲーム進行状況の読み込み
  static loadGameProgress(userId: string): GameProgress | null {
    try {
      const key = `${STORAGE_KEYS.GAME_PROGRESS}-${userId}`;
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const data = JSON.parse(stored);
      console.log('Game progress loaded from localStorage:', key);
      return data;
    } catch (error) {
      console.error('Failed to load game progress from localStorage:', error);
      return null;
    }
  }

  // シーズンマップの保存
  static saveSeasonMap(userId: string, schoolId: string, map: SeasonMap): void {
    try {
      const key = `${STORAGE_KEYS.SEASON_MAP}-${userId}`;
      const data = {
        ...map,
        school_id: schoolId,
        user_id: userId,
        updated_at: new Date().toISOString()
      };
      localStorage.setItem(key, JSON.stringify(data));
      console.log('Season map saved to localStorage:', key);
    } catch (error) {
      console.error('Failed to save season map to localStorage:', error);
    }
  }

  // シーズンマップの読み込み
  static loadSeasonMap(userId: string): SeasonMap | null {
    try {
      const key = `${STORAGE_KEYS.SEASON_MAP}-${userId}`;
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const data = JSON.parse(stored);
      console.log('Season map loaded from localStorage:', key);
      return data;
    } catch (error) {
      console.error('Failed to load season map from localStorage:', error);
      return null;
    }
  }

  // イベント履歴の保存
  static saveEventHistory(userId: string, schoolId: string, event: any): void {
    try {
      const key = `${STORAGE_KEYS.EVENT_HISTORY}-${userId}`;
      const existingHistory = this.loadEventHistory(userId) || [];
      const newEvent = {
        ...event,
        id: crypto.randomUUID(),
        school_id: schoolId,
        user_id: userId,
        created_at: new Date().toISOString()
      };
      existingHistory.push(newEvent);
      
      localStorage.setItem(key, JSON.stringify(existingHistory));
      console.log('Event history saved to localStorage:', key);
    } catch (error) {
      console.error('Failed to save event history to localStorage:', error);
    }
  }

  // イベント履歴の読み込み
  static loadEventHistory(userId: string): any[] {
    try {
      const key = `${STORAGE_KEYS.EVENT_HISTORY}-${userId}`;
      const stored = localStorage.getItem(key);
      if (!stored) return [];

      const data = JSON.parse(stored);
      console.log('Event history loaded from localStorage:', key);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to load event history from localStorage:', error);
      return [];
    }
  }

  // 学校の日付更新（ローカルストレージ版）
  static updateSchoolDate(userId: string, month: number, day: number): void {
    try {
      const key = `poke-tennis-school-date-${userId}`;
      const dateData = {
        current_month: month,
        current_day: day,
        updated_at: new Date().toISOString()
      };
      localStorage.setItem(key, JSON.stringify(dateData));
      console.log('🎯 School date updated in localStorage:', {
        key,
        dateData,
        userId,
        storage: 'localStorage'
      });
      
      // 確認のために即座に読み込んでログ出力
      const saved = localStorage.getItem(key);
      console.log('✅ Verification - saved data:', saved ? JSON.parse(saved) : null);
    } catch (error) {
      console.error('❌ Failed to update school date in localStorage:', error);
    }
  }

  // 学校の日付読み込み
  static loadSchoolDate(userId: string): { current_month: number; current_day: number } | null {
    try {
      const key = `poke-tennis-school-date-${userId}`;
      const stored = localStorage.getItem(key);
      console.log('🔍 Loading school date from localStorage:', {
        key,
        userId,
        hasData: !!stored,
        rawData: stored
      });
      
      if (!stored) return null;

      const data = JSON.parse(stored);
      console.log('📅 School date loaded successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to load school date from localStorage:', error);
      return null;
    }
  }

  // 全データのクリア
  static clearAllData(userId: string): void {
    try {
      const keysToRemove = [
        `${STORAGE_KEYS.GAME_PROGRESS}-${userId}`,
        `${STORAGE_KEYS.SEASON_MAP}-${userId}`,
        `${STORAGE_KEYS.EVENT_HISTORY}-${userId}`,
        `poke-tennis-school-date-${userId}`
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log('All localStorage data cleared for user:', userId);
    } catch (error) {
      console.error('Failed to clear localStorage data:', error);
    }
  }

  // データベース同期チェック
  static shouldFallbackToLocalStorage(): boolean {
    // 簡易的なデータベース接続チェック
    return true; // 常にローカルストレージを使用
  }
}