/**
 * 特能システム - 栄冠ナインの特能要素をテニスに適用
 */

export interface SpecialAbility {
  id: string;
  name: string;
  description: string;
  type: 'offensive' | 'defensive' | 'mental' | 'physical' | 'tactical';
  rarity: 'common' | 'rare' | 'super_rare' | 'legendary';
  effects: AbilityEffect[];
  acquisitionConditions: AcquisitionCondition[];
  pokemonTypeBonus?: string[]; // 特定のポケモンタイプに有利
}

export interface AbilityEffect {
  stat: string;
  modifier: number;
  condition?: string;
  description: string;
}

export interface AcquisitionCondition {
  type: 'match_performance' | 'training_focus' | 'pokemon_type' | 'personality' | 'random_event';
  requirement: string;
  probability: number;
}

export interface PlayerSpecialAbilities {
  playerId: string;
  abilities: string[]; // ability IDs
  acquiredDate: { [abilityId: string]: string };
}

export class SpecialAbilitiesSystem {
  private static instance: SpecialAbilitiesSystem;
  
  public static getInstance(): SpecialAbilitiesSystem {
    if (!SpecialAbilitiesSystem.instance) {
      SpecialAbilitiesSystem.instance = new SpecialAbilitiesSystem();
    }
    return SpecialAbilitiesSystem.instance;
  }

  /**
   * 特能データベース
   */
  private abilities: SpecialAbility[] = [
    // 攻撃系特能
    {
      id: 'power_serve',
      name: 'パワーサーブ',
      description: 'サーブの威力が大幅にアップ。エースを取りやすくなる',
      type: 'offensive',
      rarity: 'rare',
      effects: [
        { stat: 'serve_power', modifier: 15, description: 'サーブ威力+15' },
        { stat: 'ace_probability', modifier: 25, description: 'エース確率+25%' }
      ],
      acquisitionConditions: [
        { type: 'match_performance', requirement: 'サーブエース10本以上', probability: 0.3 },
        { type: 'pokemon_type', requirement: 'fighting,steel', probability: 0.2 }
      ],
      pokemonTypeBonus: ['fighting', 'steel']
    },
    {
      id: 'precision_shot',
      name: '精密ショット',
      description: 'コートの狙った場所に正確にボールを打てる',
      type: 'offensive',
      rarity: 'rare',
      effects: [
        { stat: 'accuracy', modifier: 20, description: '精度+20' },
        { stat: 'unforced_errors', modifier: -30, description: 'ミス率-30%' }
      ],
      acquisitionConditions: [
        { type: 'training_focus', requirement: '技術練習重点', probability: 0.25 },
        { type: 'pokemon_type', requirement: 'psychic,electric', probability: 0.2 }
      ],
      pokemonTypeBonus: ['psychic', 'electric']
    },
    {
      id: 'lightning_reflex',
      name: '電光石火',
      description: '相手の強打に対する反応が異常に早い',
      type: 'defensive',
      rarity: 'super_rare',
      effects: [
        { stat: 'reaction_speed', modifier: 25, description: '反応速度+25' },
        { stat: 'counter_attack', modifier: 40, description: 'カウンター成功率+40%' }
      ],
      acquisitionConditions: [
        { type: 'match_performance', requirement: '連続10回以上リターン成功', probability: 0.15 },
        { type: 'pokemon_type', requirement: 'electric,flying', probability: 0.1 }
      ],
      pokemonTypeBonus: ['electric', 'flying']
    },
    // 守備系特能
    {
      id: 'iron_wall',
      name: '鉄壁',
      description: 'どんな強打も確実に返球する守備力',
      type: 'defensive',
      rarity: 'rare',
      effects: [
        { stat: 'defense', modifier: 18, description: '守備力+18' },
        { stat: 'stamina_consumption', modifier: -20, description: 'スタミナ消費-20%' }
      ],
      acquisitionConditions: [
        { type: 'match_performance', requirement: '被エース3本以下で勝利', probability: 0.2 },
        { type: 'pokemon_type', requirement: 'rock,steel', probability: 0.25 }
      ],
      pokemonTypeBonus: ['rock', 'steel']
    },
    // メンタル系特能
    {
      id: 'clutch_performer',
      name: 'ここぞ！',
      description: '重要な場面で実力以上の力を発揮する',
      type: 'mental',
      rarity: 'super_rare',
      effects: [
        { stat: 'performance', modifier: 30, condition: 'important_points', description: '重要ポイントで能力+30' },
        { stat: 'pressure_resistance', modifier: 50, description: 'プレッシャー耐性+50' }
      ],
      acquisitionConditions: [
        { type: 'match_performance', requirement: 'マッチポイントから逆転勝ち', probability: 0.1 },
        { type: 'personality', requirement: '勝負強い', probability: 0.15 }
      ]
    },
    {
      id: 'ice_cold',
      name: '冷静沈着',
      description: 'どんな状況でも動じない精神力',
      type: 'mental',
      rarity: 'rare',
      effects: [
        { stat: 'consistency', modifier: 25, description: '安定性+25' },
        { stat: 'error_rate', modifier: -40, condition: 'under_pressure', description: 'プレッシャー下でのミス率-40%' }
      ],
      acquisitionConditions: [
        { type: 'personality', requirement: 'クール', probability: 0.3 },
        { type: 'pokemon_type', requirement: 'ice,psychic', probability: 0.2 }
      ],
      pokemonTypeBonus: ['ice', 'psychic']
    },
    // フィジカル系特能
    {
      id: 'endless_stamina',
      name: '不屈の闘志',
      description: 'どれだけ長い試合でもスタミナが切れない',
      type: 'physical',
      rarity: 'legendary',
      effects: [
        { stat: 'stamina', modifier: 40, description: 'スタミナ+40' },
        { stat: 'fatigue_recovery', modifier: 100, description: '疲労回復+100%' }
      ],
      acquisitionConditions: [
        { type: 'match_performance', requirement: '5セットマッチ勝利', probability: 0.05 },
        { type: 'pokemon_type', requirement: 'fighting,dragon', probability: 0.03 }
      ],
      pokemonTypeBonus: ['fighting', 'dragon']
    },
    // 戦術系特能
    {
      id: 'game_maker',
      name: 'ゲームメーカー',
      description: '試合の流れを読み、最適な戦術を選択する',
      type: 'tactical',
      rarity: 'super_rare',
      effects: [
        { stat: 'tactical_awareness', modifier: 35, description: '戦術理解+35' },
        { stat: 'adaptation_speed', modifier: 50, description: '適応速度+50%' }
      ],
      acquisitionConditions: [
        { type: 'match_performance', requirement: '戦術変更で逆転勝ち', probability: 0.12 },
        { type: 'pokemon_type', requirement: 'psychic,dark', probability: 0.1 }
      ],
      pokemonTypeBonus: ['psychic', 'dark']
    }
  ];

  /**
   * 特能取得判定
   */
  checkAbilityAcquisition(
    playerId: string,
    pokemonType: string[],
    matchPerformance: any,
    trainingData: any,
    personality: string
  ): SpecialAbility[] {
    const acquiredAbilities: SpecialAbility[] = [];

    for (const ability of this.abilities) {
      let acquisitionChance = 0;

      for (const condition of ability.acquisitionConditions) {
        switch (condition.type) {
          case 'pokemon_type':
            if (condition.requirement.split(',').some(type => pokemonType.includes(type))) {
              acquisitionChance += condition.probability;
            }
            break;
          case 'match_performance':
            if (this.checkMatchPerformanceCondition(matchPerformance, condition.requirement)) {
              acquisitionChance += condition.probability;
            }
            break;
          case 'personality':
            if (personality === condition.requirement) {
              acquisitionChance += condition.probability;
            }
            break;
          case 'training_focus':
            if (this.checkTrainingCondition(trainingData, condition.requirement)) {
              acquisitionChance += condition.probability;
            }
            break;
          case 'random_event':
            acquisitionChance += condition.probability;
            break;
        }
      }

      // ポケモンタイプボーナス
      if (ability.pokemonTypeBonus) {
        const hasTypeBonus = ability.pokemonTypeBonus.some(type => pokemonType.includes(type));
        if (hasTypeBonus) {
          acquisitionChance *= 1.5;
        }
      }

      // 判定実行
      if (Math.random() < acquisitionChance) {
        acquiredAbilities.push(ability);
      }
    }

    return acquiredAbilities;
  }

  /**
   * 試合パフォーマンス条件チェック
   */
  private checkMatchPerformanceCondition(performance: any, requirement: string): boolean {
    switch (requirement) {
      case 'サーブエース10本以上':
        return performance.aces >= 10;
      case '連続10回以上リターン成功':
        return performance.consecutiveReturns >= 10;
      case '被エース3本以下で勝利':
        return performance.receivedAces <= 3 && performance.won;
      case 'マッチポイントから逆転勝ち':
        return performance.comebackFromMatchPoint;
      case '5セットマッチ勝利':
        return performance.sets >= 5 && performance.won;
      case '戦術変更で逆転勝ち':
        return performance.tacticalComeback;
      default:
        return false;
    }
  }

  /**
   * 練習条件チェック
   */
  private checkTrainingCondition(trainingData: any, requirement: string): boolean {
    switch (requirement) {
      case '技術練習重点':
        return trainingData.focusArea === 'technical';
      default:
        return false;
    }
  }

  /**
   * 特能効果の適用
   */
  applyAbilityEffects(
    baseStats: any,
    playerAbilities: string[],
    gameContext?: any
  ): any {
    const modifiedStats = { ...baseStats };

    for (const abilityId of playerAbilities) {
      const ability = this.abilities.find(a => a.id === abilityId);
      if (!ability) continue;

      for (const effect of ability.effects) {
        // 条件チェック
        if (effect.condition && !this.checkEffectCondition(effect.condition, gameContext)) {
          continue;
        }

        // 効果適用
        if (modifiedStats[effect.stat] !== undefined) {
          modifiedStats[effect.stat] += effect.modifier;
        } else {
          modifiedStats[effect.stat] = effect.modifier;
        }
      }
    }

    return modifiedStats;
  }

  /**
   * 効果発動条件チェック
   */
  private checkEffectCondition(condition: string, context: any): boolean {
    if (!context) return true;

    switch (condition) {
      case 'important_points':
        return context.isImportantPoint;
      case 'under_pressure':
        return context.pressureLevel > 7;
      default:
        return true;
    }
  }

  /**
   * 特能の組み合わせ効果
   */
  checkAbilityCombination(abilities: string[]): { name: string; effect: string }[] {
    const combinations: { name: string; effect: string }[] = [];

    // パワーサーブ + 精密ショット = 完璧なサーブ
    if (abilities.includes('power_serve') && abilities.includes('precision_shot')) {
      combinations.push({
        name: '完璧なサーブ',
        effect: 'サーブ時の全能力がさらに向上'
      });
    }

    // 鉄壁 + 冷静沈着 = 絶対防御
    if (abilities.includes('iron_wall') && abilities.includes('ice_cold')) {
      combinations.push({
        name: '絶対防御',
        effect: '防御時にほぼミスをしなくなる'
      });
    }

    // 電光石火 + ここぞ！ = 奇跡の一撃
    if (abilities.includes('lightning_reflex') && abilities.includes('clutch_performer')) {
      combinations.push({
        name: '奇跡の一撃',
        effect: '重要な場面でのカウンター成功率が大幅UP'
      });
    }

    return combinations;
  }

  /**
   * 特能継承システム（転生選手用）
   */
  generateInheritedAbilities(legendaryPlayerId: string): string[] {
    const legendaryAbilities: { [key: string]: string[] } = {
      'roger_federer_reborn': ['precision_shot', 'game_maker', 'clutch_performer'],
      'serena_williams_reborn': ['power_serve', 'ice_cold', 'endless_stamina'],
      'novak_djokovic_reborn': ['iron_wall', 'lightning_reflex', 'clutch_performer']
    };

    return legendaryAbilities[legendaryPlayerId] || [];
  }

  /**
   * 特能覚醒システム
   */
  checkAbilityEvolution(
    currentAbilities: string[],
    playerLevel: number,
    matchHistory: any[]
  ): { evolved: string; from: string }[] {
    const evolutions: { evolved: string; from: string }[] = [];

    // レベル50以上で進化可能
    if (playerLevel < 50) return evolutions;

    const evolutionPairs = [
      { from: 'power_serve', to: 'divine_serve', condition: '100勝達成' },
      { from: 'iron_wall', to: 'absolute_defense', condition: '失セット率5%以下' },
      { from: 'clutch_performer', to: 'miracle_worker', condition: '逆転勝ち10回以上' }
    ];

    for (const pair of evolutionPairs) {
      if (currentAbilities.includes(pair.from) && 
          this.checkEvolutionCondition(pair.condition, matchHistory)) {
        evolutions.push({ evolved: pair.to, from: pair.from });
      }
    }

    return evolutions;
  }

  private checkEvolutionCondition(condition: string, matchHistory: any[]): boolean {
    switch (condition) {
      case '100勝達成':
        return matchHistory.filter(match => match.won).length >= 100;
      case '失セット率5%以下':
        const lostSets = matchHistory.reduce((sum, match) => sum + match.lostSets, 0);
        const totalSets = matchHistory.reduce((sum, match) => sum + match.totalSets, 0);
        return totalSets > 0 && (lostSets / totalSets) <= 0.05;
      case '逆転勝ち10回以上':
        return matchHistory.filter(match => match.comebackWin).length >= 10;
      default:
        return false;
    }
  }
}