'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Settings, Info } from 'lucide-react';
import { CardHand } from './CardHand';
import { GameMap } from './GameMap';
import { EventModal } from './EventModal';
import { TrainingCard } from './TrainingCard';
import { CardGenerator } from '@/lib/card-system/card-generator';
import { MapGenerator } from '@/lib/card-system/map-generator';
import { useGameProgressLocal } from '@/hooks/useGameProgressLocal';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { StorageFallback } from '@/lib/storage-fallback';
import type { 
  TrainingCard as TrainingCardType, 
  CardHand as CardHandType, 
  SeasonMap, 
  MapPanel, 
  GameProgress 
} from '@/types/card-system';

interface CardGameBoardProps {
  initialReputation?: number;
  initialYear?: number;
  onGameStateChange?: (gameState: GameProgress) => void;
}

export function CardGameBoard({ 
  initialReputation = 0, 
  initialYear = 1, 
  onGameStateChange 
}: CardGameBoardProps) {
  const { user } = useAuth();
  
  // ローカルストレージ専用データ管理
  const {
    gameProgress: savedGameProgress,
    seasonMap: savedSeasonMap,
    loading: progressLoading,
    error: progressError,
    useLocalStorage,
    saveGameProgress,
    saveSeasonMap,
    recordEvent,
    initializeGameProgress
  } = useGameProgressLocal();

  // ローカル状態
  const [gameProgress, setGameProgress] = useState<GameProgress | null>(null);
  const [seasonMap, setSeasonMap] = useState<SeasonMap | null>(null);
  const [selectedCard, setSelectedCard] = useState<TrainingCardType | null>(null);
  const [currentEvent, setCurrentEvent] = useState<MapPanel | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gameSpeed, setGameSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');

  // 初期化（Supabaseからデータを読み込み）
  useEffect(() => {
    if (savedGameProgress && savedSeasonMap) {
      setGameProgress(savedGameProgress);
      setSeasonMap(savedSeasonMap);
    } else if (!progressLoading && !savedGameProgress && !savedSeasonMap) {
      // 初回プレイ時の初期化
      initializeNewGame();
    }
  }, [savedGameProgress, savedSeasonMap, progressLoading]);

  // ゲーム状態変更の通知
  useEffect(() => {
    if (gameProgress && onGameStateChange) {
      onGameStateChange(gameProgress);
    }
  }, [gameProgress, onGameStateChange]);

  const initializeNewGame = async () => {
    // 新しいゲームを初期化
    await initializeGameProgress();
    
    // マップ生成
    const map = MapGenerator.generateSeasonMap(initialYear, initialReputation);
    await saveSeasonMap(map);
    setSeasonMap(map);

    // 初期手札生成
    const initialCards = CardGenerator.generateHand(initialReputation, initialYear, 0);
    
    const initialProgress: GameProgress = {
      currentYear: initialYear,
      currentMonth: 4,
      currentDay: 1,
      currentPosition: 0,
      hand: {
        cards: initialCards,
        maxCards: Math.min(4 + Math.floor(initialReputation / 50), 8),
        drawPileSize: 20
      },
      usedCards: [],
      isCardSelectionPhase: true,
      isMovementPhase: false,
      isEventPhase: false
    };

    await saveGameProgress(initialProgress);
    setGameProgress(initialProgress);
  };

  const handleCardSelect = (card: TrainingCardType) => {
    if (!gameProgress?.isCardSelectionPhase || isProcessing) return;
    
    setSelectedCard(prev => prev?.id === card.id ? null : card);
  };

  const handleCardPlay = async () => {
    if (!selectedCard || !seasonMap || !gameProgress || isProcessing) return;

    setIsProcessing(true);
    
    try {
      // カードを使用済みに移動
      const newUsedCards = [...gameProgress.usedCards, selectedCard];
      const newHand = gameProgress.hand.cards.filter(c => c.id !== selectedCard.id);

      // 移動処理
      const newPosition = Math.min(
        gameProgress.currentPosition + selectedCard.number,
        seasonMap.totalDays - 1
      );

      // 移動中に強制停止マスがあるかチェック
      let finalPosition = newPosition;
      let forcedStopPanel: MapPanel | null = null;

      for (let pos = gameProgress.currentPosition + 1; pos <= newPosition; pos++) {
        const panel = seasonMap.panels.find(p => p.position === pos);
        if (panel?.effects.specialEffects?.forceStop) {
          finalPosition = pos;
          forcedStopPanel = panel;
          break;
        }
      }

      // 日付計算
      const newDate = calculateDateFromPosition(finalPosition);

      // ゲーム状態更新
      const updatedProgress = {
        ...gameProgress,
        currentPosition: finalPosition,
        currentMonth: newDate.month,
        currentDay: newDate.day,
        hand: {
          ...gameProgress.hand,
          cards: newHand
        },
        usedCards: newUsedCards,
        isCardSelectionPhase: false,
        isMovementPhase: true,
        forcedStop: forcedStopPanel ? {
          reason: forcedStopPanel.display.name,
          nextAction: forcedStopPanel.type as any
        } : undefined
      };

      // データベースに保存
      await saveGameProgress(updatedProgress);
      setGameProgress(updatedProgress);

      // 学校の日付も更新
      console.log('🎯 About to update school date:', {
        oldDate: { month: gameProgress.currentMonth, day: gameProgress.currentDay },
        newDate: { month: newDate.month, day: newDate.day },
        cardUsed: selectedCard.name,
        userId: user.id,
        useLocalStorage
      });
      await updateSchoolDate(newDate.month, newDate.day);

      setSelectedCard(null);

      // 移動アニメーション
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 到着したパネルの処理
      const arrivedPanel = seasonMap.panels.find(p => p.position === finalPosition);
      if (arrivedPanel) {
        await handlePanelArrival(arrivedPanel);
      } else {
        // 通常日の場合は次のターンへ
        await nextTurn();
      }

    } finally {
      setIsProcessing(false);
    }
  };

  const handlePanelArrival = async (panel: MapPanel) => {
    if (!gameProgress) return;
    
    // イベントがある場合はモーダル表示
    if (panel.event) {
      setCurrentEvent(panel);
      setIsEventModalOpen(true);
      
      const updatedProgress = {
        ...gameProgress,
        isEventPhase: true
      };
      await saveGameProgress(updatedProgress);
      setGameProgress(updatedProgress);
    } else {
      // 直接効果適用
      await applyPanelEffects(panel.effects);
      await nextTurn();
    }
  };

  const handleEventChoice = async (choiceIndex: number) => {
    if (!currentEvent?.event?.choices || !gameProgress || isProcessing) return;

    setIsProcessing(true);

    try {
      const choice = currentEvent.event.choices[choiceIndex];
      
      // イベント履歴を記録
      await recordEvent({
        event_date: `${gameProgress.currentYear}-${String(gameProgress.currentMonth).padStart(2, '0')}-${String(gameProgress.currentDay).padStart(2, '0')}`,
        event_position: gameProgress.currentPosition,
        event_type: currentEvent.type,
        event_title: currentEvent.display.name,
        event_description: currentEvent.event.description,
        choice_selected: choiceIndex,
        choice_text: choice.text,
        effects: choice.effects,
        affected_players: []
      });
      
      await applyPanelEffects(choice.effects);
      
      setIsEventModalOpen(false);
      setCurrentEvent(null);
      
      // ゲーム状態をイベント終了に更新
      const updatedProgress = {
        ...gameProgress,
        isEventPhase: false
      };
      await saveGameProgress(updatedProgress);
      setGameProgress(updatedProgress);
      
      await nextTurn();
    } finally {
      setIsProcessing(false);
    }
  };

  const applyPanelEffects = async (effects: MapPanel['effects']) => {
    // ここで実際のゲーム効果を適用
    // 例: ポケモンのステータス更新、資金変更、評判変更など
    console.log('Applying effects:', effects);
    
    // 効果適用のアニメーション
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const nextTurn = async () => {
    if (!gameProgress) return;

    // 手札補充
    const newCards = CardGenerator.generateHand(
      initialReputation, 
      gameProgress.currentYear, 
      gameProgress.hand.cards.length
    );

    const updatedProgress = {
      ...gameProgress,
      hand: {
        ...gameProgress.hand,
        cards: [...gameProgress.hand.cards, ...newCards]
      },
      isCardSelectionPhase: true,
      isMovementPhase: false,
      isEventPhase: false,
      forcedStop: undefined
    };

    // データベースに保存
    await saveGameProgress(updatedProgress);
    setGameProgress(updatedProgress);
  };

  const calculateDateFromPosition = (position: number) => {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let remainingDays = position;
    let month = 3; // 4月開始なので3から開始（0ベース）
    
    while (remainingDays >= daysInMonth[month % 12] && month < 15) {
      remainingDays -= daysInMonth[month % 12];
      month++;
    }
    
    return {
      month: (month % 12) + 1,
      day: remainingDays + 1
    };
  };

  const updateSchoolDate = async (month: number, day: number) => {
    if (!user) return;
    
    try {
      if (useLocalStorage) {
        // ローカルストレージに保存
        StorageFallback.updateSchoolDate(user.id, month, day);
        console.log('School date updated in localStorage:', { month, day });
      } else {
        // データベースに保存
        const { error } = await supabase
          .from('schools')
          .update({
            current_month: month,
            current_day: day
          })
          .eq('user_id', user.id);

        if (error) throw error;
        console.log('School date updated in database:', { month, day });
      }
    } catch (error) {
      console.error('Error updating school date:', error);
    }
  };

  const handleDrawCards = async () => {
    if (!gameProgress || gameProgress.hand.cards.length >= gameProgress.hand.maxCards) return;
    
    const newCards = CardGenerator.generateHand(
      initialReputation, 
      gameProgress.currentYear, 
      gameProgress.hand.cards.length
    );

    const updatedProgress = {
      ...gameProgress,
      hand: {
        ...gameProgress.hand,
        cards: [...gameProgress.hand.cards, ...newCards],
        drawPileSize: Math.max(0, gameProgress.hand.drawPileSize - newCards.length)
      }
    };

    await saveGameProgress(updatedProgress);
    setGameProgress(updatedProgress);
  };

  const handleShuffleHand = async () => {
    if (!gameProgress) return;
    
    const updatedProgress = {
      ...gameProgress,
      hand: {
        ...gameProgress.hand,
        cards: [...gameProgress.hand.cards].sort(() => Math.random() - 0.5)
      }
    };

    await saveGameProgress(updatedProgress);
    setGameProgress(updatedProgress);
  };

  if (progressLoading || !seasonMap || !gameProgress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-poke-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">
            {progressError ? `エラー: ${progressError}` : 'ゲームを準備中...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ゲーム情報ヘッダー */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 font-display">
                  ポケテニマスター - {gameProgress?.currentYear || 1}年目
                </h1>
                <p className="text-gray-600">
                  {gameProgress?.currentMonth || 4}月{gameProgress?.currentDay || 1}日
                </p>
              </div>
              
              <div className="flex items-center space-x-4 text-sm">
                <div className="bg-blue-100 px-3 py-1 rounded-full">
                  <span className="text-blue-700 font-medium">
                    手札: {gameProgress?.hand.cards.length || 0}/{gameProgress?.hand.maxCards || 4}
                  </span>
                </div>
                
                <div className="bg-purple-100 px-3 py-1 rounded-full">
                  <span className="text-purple-700 font-medium">
                    山札: {gameProgress?.hand.drawPileSize || 0}枚
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                title="設定"
              >
                <Settings className="h-5 w-5" />
              </button>
              
              <button
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                title="ヘルプ"
              >
                <Info className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* メインゲームエリア */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* マップエリア */}
          <div className="xl:col-span-2">
            <GameMap
              seasonMap={seasonMap}
              currentPosition={gameProgress?.currentPosition || 0}
              onPanelClick={(panel) => console.log('Panel clicked:', panel)}
            />
          </div>

          {/* サイドパネル */}
          <div className="space-y-6">
            {/* 現在の状況 */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">現在の状況</h3>
              
              {gameProgress?.isCardSelectionPhase && (
                <div className="text-green-700 bg-green-50 p-3 rounded-lg">
                  <p className="font-medium">カード選択フェーズ</p>
                  <p className="text-sm mt-1">使用するカードを選んでください</p>
                </div>
              )}
              
              {gameProgress?.isMovementPhase && (
                <div className="text-blue-700 bg-blue-50 p-3 rounded-lg">
                  <p className="font-medium">移動中...</p>
                  <p className="text-sm mt-1">マップを進行中です</p>
                </div>
              )}
              
              {gameProgress?.isEventPhase && (
                <div className="text-purple-700 bg-purple-50 p-3 rounded-lg">
                  <p className="font-medium">イベント発生</p>
                  <p className="text-sm mt-1">選択を行ってください</p>
                </div>
              )}

              {gameProgress?.forcedStop && (
                <div className="text-orange-700 bg-orange-50 p-3 rounded-lg mt-3">
                  <p className="font-medium">強制停止: {gameProgress.forcedStop.reason}</p>
                  <p className="text-sm mt-1">次のアクション: {gameProgress.forcedStop.nextAction}</p>
                </div>
              )}
            </div>

            {/* 選択されたカード */}
            {selectedCard && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">選択中のカード</h3>
                <div className="flex justify-center">
                  <TrainingCard
                    card={selectedCard}
                    selected={true}
                    compact={false}
                  />
                </div>
                
                <div className="mt-4 space-y-2">
                  <button
                    onClick={handleCardPlay}
                    disabled={isProcessing || !gameProgress?.isCardSelectionPhase}
                    className="w-full bg-poke-blue-500 text-white py-3 rounded-lg hover:bg-poke-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>実行中...</span>
                      </div>
                    ) : (
                      `カードを使用 (${selectedCard.number}マス進む)`
                    )}
                  </button>
                  
                  <button
                    onClick={() => setSelectedCard(null)}
                    disabled={isProcessing}
                    className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    選択解除
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 手札エリア */}
        {gameProgress && (
          <CardHand
            hand={gameProgress.hand}
            onCardSelect={handleCardSelect}
            onDrawCards={handleDrawCards}
            onShuffleHand={handleShuffleHand}
            selectedCard={selectedCard}
            disabled={!gameProgress.isCardSelectionPhase || isProcessing}
          />
        )}

        {/* イベントモーダル */}
        <EventModal
          isOpen={isEventModalOpen}
          panel={currentEvent}
          onClose={() => {
            setIsEventModalOpen(false);
            setCurrentEvent(null);
            nextTurn();
          }}
          onChoiceSelect={handleEventChoice}
          isProcessing={isProcessing}
        />
      </div>
    </div>
  );
}