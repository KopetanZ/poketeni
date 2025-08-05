/**
 * 強化されたカードシステム - 栄冠ナインの戦略性を参考に
 */

import { TrainingCard } from '@/types/card-system';

export interface EnhancedCard extends TrainingCard {
  // 栄冠ナインスタイルの要素
  practiceEfficiency: number; // 練習効率倍率
  experienceMultiplier: number; // 経験値倍率
  comboEffects: CardCombo[]; // カード組み合わせ効果
  weatherDependency?: WeatherEffect; // 天候による効果変動
  teamMoraleImpact: number; // チーム士気への影響
  injuryRisk: number; // 怪我リスク
  specialConditions: SpecialCondition[]; // 特殊発動条件
  rarityLevel: 'common' | 'uncommon' | 'rare' | 'super_rare' | 'legendary';
}

export interface CardCombo {
  requiredCards: string[]; // 必要なカードID
  comboName: string;
  description: string;
  bonusEffects: {
    stat: string;
    multiplier: number;
    description: string;
  }[];
}

export interface WeatherEffect {
  sunny: number; // 晴れの日の効果倍率
  rainy: number; // 雨の日の効果倍率
  cloudy: number; // 曇りの日の効果倍率
}

export interface SpecialCondition {
  type: 'player_personality' | 'team_chemistry' | 'school_reputation' | 'season';
  requirement: string;
  effectMultiplier: number;
}

export interface CardEfficiencyBonus {
  type: 'consecutive_same_card' | 'balanced_training' | 'focus_training';
  multiplier: number;
  description: string;
}

export class EnhancedCardSystem {
  private static instance: EnhancedCardSystem;
  
  public static getInstance(): EnhancedCardSystem {
    if (!EnhancedCardSystem.instance) {
      EnhancedCardSystem.instance = new EnhancedCardSystem();
    }
    return EnhancedCardSystem.instance;
  }

  /**
   * 強化されたカードデッキ
   */
  private enhancedCards: EnhancedCard[] = [
    {
      id: 'intense_serve_training',
      name: '猛特訓サーブ',
      description: '厳しいサーブ練習。効果は高いが怪我のリスクも',
      type: 'training',
      rarity: 'rare',
      cost: 15,
      effects: [
        { type: 'serve_power', value: 25 },
        { type: 'stamina', value: -5 }
      ],
      practiceEfficiency: 1.5,
      experienceMultiplier: 2.0,
      comboEffects: [
        {
          requiredCards: ['mental_training', 'recovery_session'],
          comboName: '完璧な猛特訓',
          description: 'メンタル強化と回復を組み合わせた理想的な練習',
          bonusEffects: [
            { stat: 'serve_power', multiplier: 1.3, description: 'サーブ威力30%UP' },
            { stat: 'injury_resistance', multiplier: 2.0, description: '怪我耐性2倍' }
          ]
        }
      ],
      weatherDependency: {
        sunny: 1.2,
        rainy: 0.8,
        cloudy: 1.0
      },
      teamMoraleImpact: 5,
      injuryRisk: 15,
      specialConditions: [
        {
          type: 'player_personality',
          requirement: '努力家',
          effectMultiplier: 1.4
        }
      ],
      rarityLevel: 'rare'
    },
    {
      id: 'tactical_study',
      name: '戦術研究',
      description: 'ビデオ分析や戦術の勉強。知性が向上する',
      type: 'training',
      rarity: 'uncommon',
      cost: 8,
      effects: [
        { type: 'technique', value: 15 },
        { type: 'mental', value: 10 }
      ],
      practiceEfficiency: 1.0,
      experienceMultiplier: 1.3,
      comboEffects: [
        {
          requiredCards: ['match_observation', 'coach_advice'],
          comboName: '戦術マスター',
          description: '観戦と指導を組み合わせた高度な戦術学習',
          bonusEffects: [
            { stat: 'tactical_awareness', multiplier: 1.5, description: '戦術理解50%UP' },
            { stat: 'adaptation_speed', multiplier: 1.3, description: '適応速度30%UP' }
          ]
        }
      ],
      weatherDependency: {
        sunny: 1.0,
        rainy: 1.3, // 雨の日は室内で集中できる
        cloudy: 1.1
      },
      teamMoraleImpact: 3,
      injuryRisk: 0,
      specialConditions: [
        {
          type: 'player_personality',
          requirement: '冷静',
          effectMultiplier: 1.3
        }
      ],
      rarityLevel: 'uncommon'
    },
    {
      id: 'team_bonding',
      name: 'チーム親睦会',
      description: 'チームメンバーとの絆を深める。士気が大幅向上',
      type: 'event',
      rarity: 'rare',
      cost: 12,
      effects: [
        { type: 'team_chemistry', value: 30 },
        { type: 'morale', value: 25 }
      ],
      practiceEfficiency: 0.5, // 練習効果は低い
      experienceMultiplier: 1.0,
      comboEffects: [
        {
          requiredCards: ['celebration', 'team_meal'],
          comboName: '最高のチームワーク',
          description: 'パーティーと食事会で完璧な団結力',
          bonusEffects: [
            { stat: 'team_chemistry', multiplier: 1.8, description: 'チーム結束180%UP' },
            { stat: 'collective_performance', multiplier: 1.4, description: '団体戦能力40%UP' }
          ]
        }
      ],
      weatherDependency: {
        sunny: 1.3, // 屋外でのバーベキューなど
        rainy: 0.9,
        cloudy: 1.0
      },
      teamMoraleImpact: 20,
      injuryRisk: 0,
      specialConditions: [
        {
          type: 'season',
          requirement: '夏',
          effectMultiplier: 1.2
        }
      ],
      rarityLevel: 'rare'
    },
    {
      id: 'legendary_coach_visit',
      name: '伝説の指導者来校',
      description: 'テニス界のレジェンドが特別指導してくれる超レアイベント',
      type: 'special_event',
      rarity: 'legendary',
      cost: 0, // コストなし（超レア）
      effects: [
        { type: 'all_stats', value: 20 },
        { type: 'special_ability_chance', value: 50 }
      ],
      practiceEfficiency: 3.0,
      experienceMultiplier: 5.0,
      comboEffects: [],
      weatherDependency: {
        sunny: 1.0,
        rainy: 1.0,
        cloudy: 1.0
      },
      teamMoraleImpact: 50,
      injuryRisk: 0,
      specialConditions: [
        {
          type: 'school_reputation',
          requirement: '全国レベル',
          effectMultiplier: 1.0
        }
      ],
      rarityLevel: 'legendary'
    },
    {
      id: 'injury_recovery',
      name: '怪我治療・回復',
      description: '医師による治療とリハビリ。怪我リスクを軽減',
      type: 'recovery',
      rarity: 'common',
      cost: 5,
      effects: [
        { type: 'injury_heal', value: 100 },
        { type: 'stamina', value: 15 }
      ],
      practiceEfficiency: 0.3,
      experienceMultiplier: 0.5,
      comboEffects: [
        {
          requiredCards: ['nutrition_management', 'rest_day'],
          comboName: '完全回復',
          description: '栄養管理と休息で最適な回復',
          bonusEffects: [
            { stat: 'recovery_speed', multiplier: 2.0, description: '回復速度2倍' },
            { stat: 'injury_resistance', multiplier: 1.5, description: '怪我耐性50%UP' }
          ]
        }
      ],
      weatherDependency: {
        sunny: 1.0,
        rainy: 1.1, // 室内治療に集中
        cloudy: 1.0
      },
      teamMoraleImpact: -5, // 怪我は士気を下げる
      injuryRisk: -50, // 怪我リスクを大幅軽減
      specialConditions: [],
      rarityLevel: 'common'
    }
  ];

  /**
   * カード選択時の効率計算
   */
  calculateCardEfficiency(
    card: EnhancedCard,
    weather: 'sunny' | 'rainy' | 'cloudy',
    playerPersonality: string,
    schoolReputation: string,
    season: string,
    previousCards: string[]
  ): number {
    let efficiency = card.practiceEfficiency;

    // 天候効果
    if (card.weatherDependency) {
      efficiency *= card.weatherDependency[weather];
    }

    // 特殊条件チェック
    for (const condition of card.specialConditions) {
      let conditionMet = false;
      
      switch (condition.type) {
        case 'player_personality':
          conditionMet = playerPersonality === condition.requirement;
          break;
        case 'school_reputation':
          conditionMet = schoolReputation === condition.requirement;
          break;
        case 'season':
          conditionMet = season === condition.requirement;
          break;
      }

      if (conditionMet) {
        efficiency *= condition.effectMultiplier;
      }
    }

    // 連続使用ボーナス・ペナルティ
    const consecutiveUse = this.countConsecutiveCardUse(card.id, previousCards);
    if (consecutiveUse >= 3) {
      efficiency *= 0.7; // 連続使用でマンネリ化
    } else if (consecutiveUse === 2) {
      efficiency *= 0.9;
    }

    // バランス練習ボーナス
    const balanceBonus = this.calculateBalanceBonus(previousCards);
    efficiency *= balanceBonus;

    return efficiency;
  }

  /**
   * カード組み合わせ効果の確認
   */
  checkComboEffects(selectedCards: string[]): CardCombo[] {
    const activeCombo: CardCombo[] = [];

    for (const card of this.enhancedCards) {
      for (const combo of card.comboEffects) {
        const hasAllRequiredCards = combo.requiredCards.every(
          requiredCard => selectedCards.includes(requiredCard)
        );

        if (hasAllRequiredCards) {
          activeCombo.push(combo);
        }
      }
    }

    return activeCombo;
  }

  /**
   * 経験値効率の詳細計算（栄冠ナイン風）
   */
  calculateDetailedExperience(
    card: EnhancedCard,
    baseExperience: number,
    bonusMultipliers: { [key: string]: number }
  ): {
    base: number;
    cardMultiplier: number;
    bonusMultipliers: number;
    comboBonus: number;
    finalExperience: number;
    breakdown: string[];
  } {
    const breakdown: string[] = [];
    let totalMultiplier = 1.0;

    // カード基本倍率
    totalMultiplier *= card.experienceMultiplier;
    breakdown.push(`カード基本効果: ×${card.experienceMultiplier}`);

    // 練習効率倍率
    totalMultiplier *= card.practiceEfficiency;
    breakdown.push(`練習効率: ×${card.practiceEfficiency}`);

    // ボーナス倍率
    for (const [key, multiplier] of Object.entries(bonusMultipliers)) {
      totalMultiplier *= multiplier;
      breakdown.push(`${key}: ×${multiplier}`);
    }

    const finalExperience = Math.floor(baseExperience * totalMultiplier);

    return {
      base: baseExperience,
      cardMultiplier: card.experienceMultiplier,
      bonusMultipliers: Object.values(bonusMultipliers).reduce((a, b) => a * b, 1),
      comboBonus: 1.0, // 計算される組み合わせボーナス
      finalExperience,
      breakdown
    };
  }

  /**
   * カードレアリティシステム
   */
  generateCardPack(
    schoolReputation: number,
    playerLevel: number,
    seasonalEvent?: string
  ): EnhancedCard[] {
    const pack: EnhancedCard[] = [];
    const packSize = 5;

    // レアリティ確率（学校評判で変動）
    const rarityChances = this.calculateRarityChances(schoolReputation, playerLevel);

    for (let i = 0; i < packSize; i++) {
      const rarity = this.selectRarityByChance(rarityChances);
      const availableCards = this.enhancedCards.filter(card => card.rarityLevel === rarity);
      
      if (availableCards.length > 0) {
        const selectedCard = availableCards[Math.floor(Math.random() * availableCards.length)];
        pack.push(selectedCard);
      }
    }

    // 季節イベント特別カード
    if (seasonalEvent) {
      const specialCard = this.getSeasonalCard(seasonalEvent);
      if (specialCard) {
        pack.push(specialCard);
      }
    }

    return pack;
  }

  /**
   * レアリティ確率計算
   */
  private calculateRarityChances(reputation: number, level: number): { [key: string]: number } {
    const baseChances = {
      common: 0.6,
      uncommon: 0.25,
      rare: 0.12,
      super_rare: 0.025,
      legendary: 0.005
    };

    // 学校評判によるボーナス
    const reputationBonus = Math.min(reputation / 1000, 0.3);
    
    // レベルによるボーナス
    const levelBonus = Math.min(level / 100, 0.2);

    const totalBonus = reputationBonus + levelBonus;

    return {
      common: baseChances.common - totalBonus,
      uncommon: baseChances.uncommon,
      rare: baseChances.rare + totalBonus * 0.6,
      super_rare: baseChances.super_rare + totalBonus * 0.3,
      legendary: baseChances.legendary + totalBonus * 0.1
    };
  }

  /**
   * レアリティ選択
   */
  private selectRarityByChance(chances: { [key: string]: number }): string {
    const random = Math.random();
    let cumulative = 0;

    for (const [rarity, chance] of Object.entries(chances)) {
      cumulative += chance;
      if (random <= cumulative) {
        return rarity;
      }
    }

    return 'common';
  }

  /**
   * 連続カード使用回数カウント
   */
  private countConsecutiveCardUse(cardId: string, recentCards: string[]): number {
    let count = 0;
    for (let i = recentCards.length - 1; i >= 0; i--) {
      if (recentCards[i] === cardId) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  /**
   * バランス練習ボーナス計算
   */
  private calculateBalanceBonus(recentCards: string[]): number {
    const cardTypes = recentCards.map(cardId => {
      const card = this.enhancedCards.find(c => c.id === cardId);
      return card?.type || 'unknown';
    });

    const uniqueTypes = new Set(cardTypes);
    
    // 多様な練習をしているほどボーナス
    if (uniqueTypes.size >= 4) return 1.3;
    if (uniqueTypes.size === 3) return 1.2;
    if (uniqueTypes.size === 2) return 1.1;
    
    return 1.0;
  }

  /**
   * 季節限定カード取得
   */
  private getSeasonalCard(seasonalEvent: string): EnhancedCard | null {
    const seasonalCards: { [key: string]: EnhancedCard } = {
      'summer_festival': {
        id: 'summer_festival_training',
        name: '夏祭り特訓',
        description: '夏祭りの雰囲気の中での特別練習',
        type: 'special_event',
        rarity: 'super_rare',
        cost: 10,
        effects: [
          { type: 'stamina', value: 20 },
          { type: 'team_chemistry', value: 15 }
        ],
        practiceEfficiency: 1.4,
        experienceMultiplier: 1.8,
        comboEffects: [],
        weatherDependency: { sunny: 1.5, rainy: 0.7, cloudy: 1.0 },
        teamMoraleImpact: 25,
        injuryRisk: 5,
        specialConditions: [],
        rarityLevel: 'super_rare'
      }
    };

    return seasonalCards[seasonalEvent] || null;
  }

  /**
   * カード効果の詳細説明生成
   */
  generateCardEffectDescription(card: EnhancedCard, currentConditions: any): string {
    let description = card.description + '\n\n';
    
    // 基本効果
    description += '【基本効果】\n';
    for (const effect of card.effects) {
      description += `• ${effect.type}: ${effect.value > 0 ? '+' : ''}${effect.value}\n`;
    }

    // 練習効率
    description += `\n【練習効率】${card.practiceEfficiency}倍\n`;
    description += `【経験値倍率】${card.experienceMultiplier}倍\n`;

    // 天候効果
    if (card.weatherDependency) {
      description += '\n【天候効果】\n';
      description += `• 晴れ: ${card.weatherDependency.sunny}倍\n`;
      description += `• 雨: ${card.weatherDependency.rainy}倍\n`;
      description += `• 曇り: ${card.weatherDependency.cloudy}倍\n`;
    }

    // 組み合わせ効果
    if (card.comboEffects.length > 0) {
      description += '\n【組み合わせ効果】\n';
      for (const combo of card.comboEffects) {
        description += `• ${combo.comboName}: ${combo.description}\n`;
      }
    }

    // リスク
    if (card.injuryRisk > 0) {
      description += `\n⚠️ 怪我リスク: ${card.injuryRisk}%\n`;
    }

    return description;
  }
}