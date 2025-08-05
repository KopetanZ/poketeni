// =====================================================
// カード生成システム
// 栄冠ナイン方式のカード生成ロジック
// =====================================================

import type { TrainingCard } from '@/types/card-system';
import { CARD_TYPES } from '@/types/card-system';

export class CardGenerator {
  // 基本カードデータベース
  private static readonly CARD_DATABASE: Omit<TrainingCard, 'id'>[] = [
    // 基本練習カード (数字1-3)
    {
      name: 'サーブ練習',
      type: 'training',
      number: 2,
      trainingEffects: { serve: 15 },
      description: 'サーブの威力と正確性を向上させる',
      rarity: 'common'
    },
    {
      name: 'リターン練習',
      type: 'training',
      number: 2,
      trainingEffects: { return: 15 },
      description: '相手のサーブを確実に返球する技術を磨く',
      rarity: 'common'
    },
    {
      name: 'ボレー練習',
      type: 'training',
      number: 2,
      trainingEffects: { volley: 15 },
      description: 'ネット前での素早い反応を鍛える',
      rarity: 'common'
    },
    {
      name: 'ストローク練習',
      type: 'training',
      number: 2,
      trainingEffects: { stroke: 15 },
      description: 'フォアハンド・バックハンドの基本を強化',
      rarity: 'common'
    },
    {
      name: 'メンタル練習',
      type: 'training',
      number: 3,
      trainingEffects: { mental: 12 },
      description: '試合での集中力を向上させる',
      rarity: 'common'
    },
    {
      name: 'スタミナ練習',
      type: 'training',
      number: 3,
      trainingEffects: { stamina: 18 },
      description: '持久力と体力を向上させる',
      rarity: 'common'
    },
    
    // 総合練習カード (数字3-4)
    {
      name: '総合練習',
      type: 'training',
      number: 3,
      trainingEffects: { serve: 8, return: 8, volley: 8, stroke: 8 },
      description: '全ての技術をバランスよく向上',
      rarity: 'uncommon'
    },
    {
      name: 'ダブルス練習',
      type: 'training',
      number: 3,
      trainingEffects: { volley: 12, mental: 8 },
      specialEffects: { trustIncrease: 5 },
      description: 'チームワークと連携を強化',
      rarity: 'uncommon'
    },
    {
      name: '実戦練習',
      type: 'training',
      number: 4,
      trainingEffects: { serve: 6, return: 6, volley: 6, stroke: 6, mental: 10 },
      description: '試合形式での実践的な練習',
      rarity: 'uncommon'
    },
    
    // 特殊カード (数字1-5)
    {
      name: '休養日',
      type: 'special',
      number: 1,
      trainingEffects: {},
      specialEffects: { conditionRecovery: 20 },
      description: 'しっかり休んでコンディションを回復',
      rarity: 'common'
    },
    {
      name: 'チーム食事会',
      type: 'special',
      number: 2,
      trainingEffects: {},
      specialEffects: { conditionRecovery: 10, trustIncrease: 8, teamMoraleBoost: true },
      description: 'みんなで食事をしてチームの絆を深める',
      rarity: 'uncommon'
    },
    {
      name: 'マッサージ',
      type: 'special',
      number: 1,
      trainingEffects: {},
      specialEffects: { conditionRecovery: 15 },
      description: '疲労回復でコンディションを整える',
      rarity: 'common'
    },
    {
      name: '個人指導',
      type: 'special',
      number: 2,
      trainingEffects: { serve: 20, return: 20, volley: 20, stroke: 20 },
      specialEffects: { trustIncrease: 10 },
      description: '1人の選手を集中的に指導',
      rarity: 'rare',
      unlockRequirements: { reputation: 50 }
    },
    {
      name: '施設メンテナンス',
      type: 'special',
      number: 3,
      trainingEffects: {},
      specialEffects: { practiceEfficiencyBoost: 15 },
      description: 'コートや設備を整備して練習効率アップ',
      rarity: 'uncommon'
    },
    
    // レア特殊カード (数字4-6)
    {
      name: '伝説のコーチ',
      type: 'special',
      number: 5,
      trainingEffects: { serve: 25, return: 25, volley: 25, stroke: 25, mental: 20 },
      specialEffects: { practiceEfficiencyBoost: 30, trustIncrease: 15 },
      description: '伝説的な指導者による特別レッスン',
      rarity: 'legendary',
      unlockRequirements: { reputation: 150, year: 3 }
    },
    {
      name: 'プロ選手訪問',
      type: 'special',
      number: 4,
      trainingEffects: { serve: 15, return: 15, volley: 15, stroke: 15, mental: 25 },
      specialEffects: { teamMoraleBoost: true, trustIncrease: 20 },
      description: 'プロテニス選手が指導に来てくれた',
      rarity: 'rare',
      unlockRequirements: { reputation: 100 }
    },
    {
      name: '特別トーナメント',
      type: 'event',
      number: 6,
      trainingEffects: { serve: 10, return: 10, volley: 10, stroke: 10, mental: 30 },
      description: '招待制トーナメントで経験を積む',
      rarity: 'rare',
      unlockRequirements: { reputation: 80, year: 2 }
    },
    {
      name: '奇跡の回復',
      type: 'special',
      number: 1,
      trainingEffects: {},
      specialEffects: { conditionRecovery: 50, teamMoraleBoost: true },
      description: '全員のコンディションが完全回復！',
      rarity: 'legendary'
    }
  ];

  // カード生成メソッド
  static generateCard(type?: string): TrainingCard {
    const availableCards = this.CARD_DATABASE.filter(card => 
      !type || card.name.includes(type)
    );
    
    const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
    
    return {
      ...randomCard,
      id: this.generateCardId()
    };
  }

  // 手札生成 (学校の評判に応じてカード枚数とレア度が変化)
  static generateHand(reputation: number, year: number, currentHandSize: number = 0): TrainingCard[] {
    // 手札上限計算 (評判に応じて増加)
    let maxCards = 4; // 初期手札数
    if (reputation >= 50) maxCards = 5;
    if (reputation >= 100) maxCards = 6;
    if (reputation >= 150) maxCards = 7;
    if (reputation >= 200) maxCards = 8;

    // 年数ボーナス
    maxCards += (year - 1);

    const cardsToGenerate = Math.min(maxCards - currentHandSize, 3); // 一度に最大3枚まで補充
    const newCards: TrainingCard[] = [];

    for (let i = 0; i < cardsToGenerate; i++) {
      const card = this.generateWeightedCard(reputation, year);
      newCards.push(card);
    }

    return newCards;
  }

  // 評判と年数に応じた重み付きカード生成
  private static generateWeightedCard(reputation: number, year: number): TrainingCard {
    const availableCards = this.CARD_DATABASE.filter(card => {
      // 解放条件チェック
      if (card.unlockRequirements) {
        if (card.unlockRequirements.reputation && reputation < card.unlockRequirements.reputation) {
          return false;
        }
        if (card.unlockRequirements.year && year < card.unlockRequirements.year) {
          return false;
        }
      }
      return true;
    });

    // レア度による重み付け
    const weightedCards: TrainingCard[] = [];
    
    availableCards.forEach(cardTemplate => {
      const card: TrainingCard = { ...cardTemplate, id: this.generateCardId() };
      
      let weight = 1;
      switch (card.rarity) {
        case 'common':
          weight = 10;
          break;
        case 'uncommon':
          weight = 5;
          break;
        case 'rare':
          weight = 2;
          break;
        case 'legendary':
          weight = 1;
          break;
      }

      // 評判ボーナス (高評判ほどレアカードが出やすい)
      if (card.rarity === 'rare' && reputation >= 100) weight *= 2;
      if (card.rarity === 'legendary' && reputation >= 150) weight *= 2;

      for (let i = 0; i < weight; i++) {
        weightedCards.push(card);
      }
    });

    return weightedCards[Math.floor(Math.random() * weightedCards.length)];
  }

  // 特定のカードタイプを取得
  static getCardByType(cardType: string): TrainingCard | null {
    const cardTemplate = this.CARD_DATABASE.find(card => 
      card.name.toLowerCase().includes(cardType.toLowerCase())
    );
    
    if (!cardTemplate) return null;
    
    return {
      ...cardTemplate,
      id: this.generateCardId()
    };
  }

  // すべてのカードタイプを取得
  static getAllCardTypes(): string[] {
    return this.CARD_DATABASE.map(card => card.name);
  }

  // ユニークなカードIDを生成
  private static generateCardId(): string {
    return `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // カード効果計算
  static calculateCardEffects(card: TrainingCard, teamCondition: number = 100): {
    finalTrainingEffects: TrainingCard['trainingEffects'];
    finalSpecialEffects: TrainingCard['specialEffects'];
  } {
    const conditionMultiplier = teamCondition / 100;
    
    const finalTrainingEffects: TrainingCard['trainingEffects'] = {};
    
    // コンディションに応じて練習効果を調整
    Object.entries(card.trainingEffects).forEach(([stat, value]) => {
      if (value) {
        finalTrainingEffects[stat as keyof TrainingCard['trainingEffects']] = 
          Math.round(value * conditionMultiplier);
      }
    });

    return {
      finalTrainingEffects,
      finalSpecialEffects: card.specialEffects
    };
  }
}