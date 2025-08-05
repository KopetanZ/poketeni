'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Player } from '@/types/game';

export function usePlayerData() {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlayers = async () => {
    if (!user) {
      setPlayers([]);
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
        setPlayers([]);
        setLoading(false);
        return;
      }

      // 選手データを取得
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('school_id', schoolData.id)
        .order('level', { ascending: false });

      if (error) throw error;
      setPlayers(data || []);
    } catch (err) {
      console.error('Error loading players:', err);
      setError('選手データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const updatePlayer = async (playerId: string, updates: Partial<Player>) => {
    try {
      const { error } = await supabase
        .from('players')
        .update(updates)
        .eq('id', playerId);

      if (error) throw error;

      // ローカル状態を更新
      setPlayers(prev => prev.map(player => 
        player.id === playerId ? { ...player, ...updates } : player
      ));

      return true;
    } catch (err) {
      console.error('Error updating player:', err);
      setError('選手データの更新に失敗しました');
      return false;
    }
  };

  const addPlayer = async (playerData: Omit<Player, 'id' | 'school_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return false;

    try {
      // 学校IDを取得
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (schoolError) throw schoolError;

      const { data, error } = await supabase
        .from('players')
        .insert({
          ...playerData,
          school_id: schoolData.id,
        })
        .select()
        .single();

      if (error) throw error;

      // ローカル状態を更新
      setPlayers(prev => [...prev, data]);
      return true;
    } catch (err) {
      console.error('Error adding player:', err);
      setError('選手の追加に失敗しました');
      return false;
    }
  };

  const removePlayer = async (playerId: string) => {
    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);

      if (error) throw error;

      // ローカル状態を更新
      setPlayers(prev => prev.filter(player => player.id !== playerId));
      return true;
    } catch (err) {
      console.error('Error removing player:', err);
      setError('選手の削除に失敗しました');
      return false;
    }
  };

  const getPlayerStats = () => {
    const totalPlayers = players.length;
    const regularPlayers = players.filter(p => p.position !== 'member').length;
    const averageLevel = totalPlayers > 0 
      ? Math.round(players.reduce((sum, p) => sum + p.level, 0) / totalPlayers)
      : 0;
    const goodConditionPlayers = players.filter(p => p.condition === 'excellent' || p.condition === 'good').length;

    return {
      totalPlayers,
      regularPlayers,
      averageLevel,
      goodConditionPlayers,
      benchPlayers: totalPlayers - regularPlayers,
    };
  };

  const getPlayersByPosition = () => {
    return {
      captain: players.filter(p => p.position === 'captain'),
      vice_captain: players.filter(p => p.position === 'vice_captain'),
      regular: players.filter(p => p.position === 'regular'),
      member: players.filter(p => p.position === 'member'),
    };
  };

  const getTopPlayers = (limit: number = 5) => {
    return [...players]
      .sort((a, b) => {
        const totalA = a.serve_skill + a.return_skill + a.volley_skill + 
                      a.stroke_skill + a.mental + a.stamina;
        const totalB = b.serve_skill + b.return_skill + b.volley_skill + 
                      b.stroke_skill + b.mental + b.stamina;
        return totalB - totalA;
      })
      .slice(0, limit);
  };

  useEffect(() => {
    loadPlayers();
  }, [user]);

  return {
    players,
    loading,
    error,
    loadPlayers,
    updatePlayer,
    addPlayer,
    removePlayer,
    getPlayerStats,
    getPlayersByPosition,
    getTopPlayers,
  };
}