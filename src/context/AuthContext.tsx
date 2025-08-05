'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  username: string;
  fruits: {
    selection: string[];
    order: number[];
  };
  avatar_config: {
    colors: string[];
    pattern: string;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (username: string, fruits: { fruits: string[]; order: number[] }) => Promise<void>;
  signIn: (username: string, fruits: { fruits: string[]; order: number[] }) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初期認証状態の確認
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      // localStorage からユーザーIDを取得
      const storedUserId = localStorage.getItem('poke-tennis-user-id');
      if (storedUserId) {
        await loadUserProfile(storedUserId);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setUser({
        id: data.id,
        username: data.username,
        fruits: data.fruits,
        avatar_config: data.avatar_config || { colors: [], pattern: 'default' }
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const signUp = async (username: string, fruits: { fruits: string[]; order: number[] }) => {
    try {
      console.log('SignUp called with:', { username, fruits });
      
      // データ検証
      if (!fruits.fruits || !Array.isArray(fruits.fruits) || fruits.fruits.length !== 4) {
        throw new Error('フルーツの選択が正しくありません');
      }
      
      if (!fruits.order || !Array.isArray(fruits.order) || fruits.order.length !== 4) {
        throw new Error('フルーツの順序が正しくありません');
      }
      
      console.log('Data validation passed');
      
      // ユニークなUUIDを生成してユーザーIDとして使用
      console.log('Generating user ID...');
      const userId = crypto.randomUUID();
      
      console.log('User ID generated:', userId);

      // ユーザープロファイルをデータベースに保存
      console.log('Inserting user profile...');
      const userData = {
        id: userId,
        username,
        fruits: {
          selection: fruits.fruits,
          order: fruits.order
        },
        avatar_config: {
          colors: generateRandomColors(),
          pattern: 'default'
        }
      };
      
      console.log('User data to insert:', JSON.stringify(userData, null, 2));
      console.log('Fruits data details:', {
        selection: fruits.fruits,
        selectionType: typeof fruits.fruits,
        selectionLength: fruits.fruits?.length,
        order: fruits.order,
        orderType: typeof fruits.order,
        orderLength: fruits.order?.length
      });
      
      const { error: profileError } = await supabase
        .from('users')
        .insert(userData);

      if (profileError) {
        console.error('Profile error:', profileError);
        throw profileError;
      }

      console.log('User profile created successfully');

      // 学校も作成
      console.log('Creating school...');
      const { error: schoolError } = await supabase
        .from('schools')
        .insert({
          user_id: userId,
          name: `${username}のテニス部`,
          current_year: 1,
          current_month: 4,
          current_day: 1,
          reputation: 0,
          funds: 100000,
          facilities: {
            courts: {
              count: 2,
              quality: 1,
              surface: 'concrete',
              maintenance: 80
            },
            equipment: {
              ball_machine: false,
              serve_machine: false,
              video_analysis: false,
              medical_room: false
            },
            buildings: {
              clubhouse: 1,
              shower: false,
              storage: 1
            }
          }
        });

      if (schoolError) {
        console.error('School error:', schoolError);
        throw schoolError;
      }

      console.log('School created successfully');

      // ユーザーIDをローカルストレージに保存
      localStorage.setItem('poke-tennis-user-id', userId);
      
      console.log('Loading user profile...');
      await loadUserProfile(userId);
      console.log('SignUp process completed successfully');
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signIn = async (username: string, fruits: { fruits: string[]; order: number[] }) => {
    try {
      // ユーザー名でユーザーを検索
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (userError) throw new Error('ユーザーが見つかりません');

      // フルーツの組み合わせを確認
      const storedFruits = userData.fruits;
      if (JSON.stringify(storedFruits.selection) !== JSON.stringify(fruits.fruits)) {
        throw new Error('フルーツの組み合わせが正しくありません');
      }

      // Supabase Authにサインイン（匿名ユーザーとして）
      const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
      
      if (authError) throw authError;

      if (!authData.user) throw new Error('認証に失敗しました');

      // セッションにユーザーIDを関連付け（実際の実装では、より安全な方法を使用）
      localStorage.setItem('poke-tennis-user-id', userData.id);
      
      setUser({
        id: userData.id,
        username: userData.username,
        fruits: userData.fruits,
        avatar_config: userData.avatar_config || { colors: [], pattern: 'default' }
      });
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('poke-tennis-user-id');
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<AuthUser>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const generateRandomColors = (): string[] => {
    const colors = [
      '#ff6b6b', '#ffd93d', '#6bcf7f', '#4d96ff', '#9c88ff',
      '#ff8cc8', '#ff9f43', '#70c1b3', '#a8e6cf', '#ffd1dc'
    ];
    return colors.sort(() => Math.random() - 0.5).slice(0, 2);
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}