'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GameLayout } from '@/components/layout/GameLayout';
import { TrainingMenu } from '@/components/training/TrainingMenu';
import { TrainingSession } from '@/components/training/TrainingSession';
import { PlayerList } from '@/components/player/PlayerList';
import { useAuth } from '@/context/AuthContext';
import { usePlayerData } from '@/hooks/usePlayerData';
import { supabase } from '@/lib/supabase';
import { Target, Users, Play, ArrowLeft } from 'lucide-react';
import type { Player, School } from '@/types/game';

interface TrainingType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  stats: string[];
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  cost: number;
  requirements?: string;
  color: string;
}

interface TrainingResult {
  pokemonId: string;
  statChanges: {
    serve?: number;
    return?: number;
    volley?: number;
    stroke?: number;
    mental?: number;
    stamina?: number;
  };
  experience: number;
  conditionChange: number;
}

export default function TrainingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { players, loading: playersLoading, updatePlayer } = usePlayerData();
  
  const [currentStep, setCurrentStep] = useState<'player-selection' | 'training-menu' | 'training-session'>('player-selection');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [selectedTraining, setSelectedTraining] = useState<TrainingType | null>(null);
  const [schoolData, setSchoolData] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadSchoolData();
    }
  }, [user]);

  const loadSchoolData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setSchoolData(data);
    } catch (error) {
      console.error('Error loading school data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerSelection = (pokemon: Player) => {
    setSelectedPlayers(prev => {
      if (prev.includes(pokemon.id)) {
        return prev.filter(id => id !== pokemon.id);
      } else {
        return [...prev, pokemon.id];
      }
    });
  };

  const handleTrainingSelect = (training: TrainingType) => {
    setSelectedTraining(training);
    setCurrentStep('training-session');
  };

  const handleTrainingComplete = async (results: TrainingResult[]) => {
    try {
      // 各ポケモンのステータスを更新
      for (const result of results) {
        const pokemon = players.find(p => p.id === result.pokemonId);
        if (!pokemon) continue;

        const updatedStats = {
          serve_skill: pokemon.serve_skill + (result.statChanges.serve || 0),
          return_skill: pokemon.return_skill + (result.statChanges.return || 0),
          volley_skill: pokemon.volley_skill + (result.statChanges.volley || 0),
          stroke_skill: pokemon.stroke_skill + (result.statChanges.stroke || 0),
          mental: pokemon.mental + (result.statChanges.mental || 0),
          stamina: pokemon.stamina + (result.statChanges.stamina || 0)
        };

        // Condition remains the same for now, could be enhanced later
        await updatePlayer(result.pokemonId, {
          ...updatedStats
        });
      }

      // 学校の資金を減らす
      if (selectedTraining && schoolData) {
        const totalCost = selectedTraining.cost * selectedPlayers.length;
        await supabase
          .from('schools')
          .update({ funds: schoolData.funds - totalCost })
          .eq('id', schoolData.id);
        
        setSchoolData(prev => prev ? ({ ...prev, funds: prev.funds - totalCost }) : null);
      }

      alert('練習が完了しました！ポケモンの能力が向上しました。');
      
      // 初期状態に戻る
      setCurrentStep('player-selection');
      setSelectedPlayers([]);
      setSelectedTraining(null);
      
    } catch (error) {
      console.error('Error updating training results:', error);
      alert('練習結果の保存に失敗しました');
    }
  };

  const handleCancel = () => {
    setCurrentStep('player-selection');
    setSelectedPlayers([]);
    setSelectedTraining(null);
  };

  const getSelectedPlayersData = () => {
    return players.filter(p => selectedPlayers.includes(p.id));
  };

  if (authLoading || playersLoading || loading) {
    return (
      <GameLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-poke-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </GameLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <GameLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {currentStep !== 'player-selection' && (
              <button
                onClick={() => {
                  if (currentStep === 'training-session') {
                    setCurrentStep('training-menu');
                  } else {
                    setCurrentStep('player-selection');
                  }
                }}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
            )}
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-display">
                練習
              </h1>
              <p className="text-gray-600 mt-2">
                {currentStep === 'player-selection' && '練習に参加させるポケモンを選択してください'}
                {currentStep === 'training-menu' && '練習メニューを選択してください'}
                {currentStep === 'training-session' && '練習を実行中です'}
              </p>
            </div>
          </div>
          
          {/* 資金表示 */}
          <div className="text-right">
            <div className="text-sm text-gray-500">利用可能資金</div>
            <div className="text-2xl font-bold text-green-600">
              ¥{schoolData?.funds?.toLocaleString() || 0}
            </div>
          </div>
        </div>

        {/* ステップインジケーター */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-2 ${currentStep === 'player-selection' ? 'text-poke-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'player-selection' ? 'bg-poke-blue-100' : 'bg-gray-100'}`}>
                <Users className="h-4 w-4" />
              </div>
              <span className="font-medium">選手選択</span>
            </div>
            
            <div className="flex-1 h-px bg-gray-200 mx-4"></div>
            
            <div className={`flex items-center space-x-2 ${currentStep === 'training-menu' ? 'text-poke-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'training-menu' ? 'bg-poke-blue-100' : 'bg-gray-100'}`}>
                <Target className="h-4 w-4" />
              </div>
              <span className="font-medium">練習選択</span>
            </div>
            
            <div className="flex-1 h-px bg-gray-200 mx-4"></div>
            
            <div className={`flex items-center space-x-2 ${currentStep === 'training-session' ? 'text-poke-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'training-session' ? 'bg-poke-blue-100' : 'bg-gray-100'}`}>
                <Play className="h-4 w-4" />
              </div>
              <span className="font-medium">練習実行</span>
            </div>
          </div>
        </div>

        {/* コンテンツ */}
        {currentStep === 'player-selection' && (
          <div className="space-y-6">
            <PlayerList
              players={players}
              onPlayerSelect={handlePlayerSelection}
              selectedPlayers={selectedPlayers}
              showStats={true}
              compact={true}
            />
            
            {selectedPlayers.length > 0 && (
              <div className="flex justify-center">
                <button
                  onClick={() => setCurrentStep('training-menu')}
                  className="bg-poke-blue-500 text-white px-8 py-3 rounded-lg hover:bg-poke-blue-600 transition-colors font-medium"
                >
                  練習メニュー選択へ ({selectedPlayers.length}名選択中)
                </button>
              </div>
            )}
          </div>
        )}

        {currentStep === 'training-menu' && (
          <TrainingMenu
            onSelectTraining={handleTrainingSelect}
            availableFunds={schoolData?.funds || 0}
            selectedPlayers={selectedPlayers}
          />
        )}

        {currentStep === 'training-session' && selectedTraining && (
          <TrainingSession
            trainingType={selectedTraining}
            selectedPlayers={getSelectedPlayersData()}
            onComplete={handleTrainingComplete}
            onCancel={handleCancel}
          />
        )}
      </div>
    </GameLayout>
  );
}