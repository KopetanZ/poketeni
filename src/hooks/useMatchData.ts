'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { simulateMatch, saveMatchResult, MATCH_SETTINGS } from '@/lib/match-engine';
import type { Match, Player } from '@/types/game';

export function useMatchData() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMatches = async () => {
    if (!user) {
      setMatches([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      // 学校IDを取得
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (schoolError) throw schoolError;
      if (!schoolData) {
        setMatches([]);
        setLoading(false);
        return;
      }

      // 試合データを取得（ホーム・アウェイ両方）
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          home_school:schools!matches_home_school_id_fkey(name),
          away_school:schools!matches_away_school_id_fkey(name)
        `)
        .or(`home_school_id.eq.${schoolData.id},away_school_id.eq.${schoolData.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMatches(data || []);
    } catch (err) {
      console.error('Error loading matches:', err);
      setError('試合データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const simulateNewMatch = async (
    homePlayer: Player,
    awayPlayer: Player,
    matchType: keyof typeof MATCH_SETTINGS = 'practice'
  ) => {
    if (!user) return null;

    try {
      setError(null);
      
      // 学校IDを取得
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (schoolError) throw schoolError;
      if (!schoolData) throw new Error('School not found');

      // 対戦相手の学校IDを生成（ダミー）
      const awaySchoolId = 'dummy-school-' + Math.random().toString(36).substr(2, 9);

      // 試合をシミュレート
      const matchResult = simulateMatch(homePlayer, awayPlayer, matchType);
      
      // 結果をデータベースに保存
      const saved = await saveMatchResult(
        schoolData.id,
        awaySchoolId,
        homePlayer,
        awayPlayer,
        matchResult,
        matchType
      );

      if (saved) {
        // 試合リストを再読み込み
        await loadMatches();
        return matchResult;
      } else {
        throw new Error('Failed to save match result');
      }
    } catch (err) {
      console.error('Error simulating match:', err);
      setError('試合のシミュレーションに失敗しました');
      return null;
    }
  };

  const getMatchStatistics = () => {
    const totalMatches = matches.length;
    // 簡易実装: winner_school_idがnullでない場合は勝利とみなす
    const wonMatches = matches.filter(match => match.winner_school_id !== null).length;
    const winRate = totalMatches > 0 ? Math.round((wonMatches / totalMatches) * 100) : 0;
    
    const matchTypes = matches.reduce((acc, match) => {
      acc[match.match_type] = (acc[match.match_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentMatches = matches.slice(0, 5);
    
    return {
      totalMatches,
      wonMatches,
      lostMatches: totalMatches - wonMatches,
      winRate,
      matchTypes,
      recentMatches,
      averageMatchDuration: totalMatches > 0 
        ? Math.round(matches.reduce((sum, match) => 
            sum + (match.statistics?.total_duration || 0), 0) / totalMatches)
        : 0
    };
  };

  const getPlayerMatchHistory = async (playerId: string) => {
    try {
      // プレイヤーが参加した試合を取得
      // 注意: この実装では簡略化しており、実際には試合参加者のテーブルが必要
      const playerMatches = matches.filter(match => {
        // 試合ログからプレイヤー参加を判定（簡略化）
        return match.match_log?.some(log => 
          log.details?.players?.includes(playerId)
        );
      });

      const wins = playerMatches.filter(match => {
        // プレイヤーが勝利したかを判定
        return match.winner_school_id === match.home_school_id; // 簡略化
      }).length;

      return {
        totalMatches: playerMatches.length,
        wins,
        losses: playerMatches.length - wins,
        winRate: playerMatches.length > 0 ? Math.round((wins / playerMatches.length) * 100) : 0,
        recentMatches: playerMatches.slice(0, 5)
      };
    } catch (err) {
      console.error('Error getting player match history:', err);
      return {
        totalMatches: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        recentMatches: []
      };
    }
  };

  const deleteMatch = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId);

      if (error) throw error;

      // ローカル状態を更新
      setMatches(prev => prev.filter(match => match.id !== matchId));
      return true;
    } catch (err) {
      console.error('Error deleting match:', err);
      setError('試合の削除に失敗しました');
      return false;
    }
  };

  const getOpponentSchools = () => {
    // 簡易実装：空配列を返す（実装は後で改良）
    return [];
  };

  const getMatchesByType = (matchType: string) => {
    return matches.filter(match => match.match_type === matchType);
  };

  const getMatchesByDateRange = (startDate: Date, endDate: Date) => {
    return matches.filter(match => {
      const matchDate = new Date(match.created_at);
      return matchDate >= startDate && matchDate <= endDate;
    });
  };

  useEffect(() => {
    loadMatches();
  }, [user]);

  return {
    matches,
    loading,
    error,
    loadMatches,
    simulateNewMatch,
    getMatchStatistics,
    getPlayerMatchHistory,
    deleteMatch,
    getOpponentSchools,
    getMatchesByType,
    getMatchesByDateRange,
    MATCH_SETTINGS
  };
}