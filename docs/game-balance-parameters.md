# ポケテニマスター ゲームバランス調整パラメータ

## 1. 基本バランス方針

### 1.1 設計理念
- **楽しさ優先**: 競争よりも育成・成長の喜びを重視
- **適度な挑戦**: 簡単すぎず難しすぎない絶妙な難易度
- **多様性の尊重**: 様々なプレイスタイルが有効
- **長期継続**: 3年間 + エンドレスモードでの飽きない設計

### 1.2 バランス調整の基本原則
```typescript
interface BalancePhilosophy {
  progressionCurve: 'logarithmic_with_milestone_boosts';  // 成長実感を維持
  difficultyScaling: 'adaptive_to_player_skill';          // プレイヤーレベルに応じた調整
  randomness: 'controlled_variance_with_safety_nets';     // 運要素は適度に
  playerChoice: 'meaningful_decisions_matter';            // 選択の重要性
  timeInvestment: 'respect_player_time';                  // 効率的な進行
}
```

## 2. 選手育成バランス

### 2.1 能力値成長システム
```typescript
interface StatGrowthParameters {
  // 基本成長率（練習1回あたり）
  baseGrowthRates: {
    power: { min: 1, max: 4, average: 2.5 };
    technique: { min: 1, max: 4, average: 2.5 };
    speed: { min: 1, max: 4, average: 2.5 };
    stamina: { min: 1, max: 4, average: 2.5 };
    mental: { min: 1, max: 4, average: 2.5 };
  };
  
  // 成長率補正システム
  growthModifiers: {
    pokemonType: {
      fire: { power: 1.2, technique: 0.9, speed: 1.1, stamina: 0.8, mental: 1.0 };
      water: { power: 0.9, technique: 1.1, speed: 1.0, stamina: 1.2, mental: 1.1 };
      electric: { power: 1.1, technique: 1.0, speed: 1.3, stamina: 0.9, mental: 1.0 };
      grass: { power: 0.8, technique: 1.2, speed: 0.9, stamina: 1.3, mental: 1.1 };
      // ... 全18タイプ
    };
    
    nature: {
      adamant: { power: 1.1, technique: 0.9 };      // いじっぱり
      modest: { mental: 1.1, power: 0.9 };          // ひかえめ
      jolly: { speed: 1.1, technique: 0.9 };        // ようき
      // ... 全25性格
    };
    
    condition: {
      excellent: 1.3;
      good: 1.1;
      normal: 1.0;
      poor: 0.8;
      terrible: 0.6;
    };
    
    motivation: {
      formula: 'base_rate * (0.5 + motivation / 100)';
      // motivation 0 = 0.5倍, 50 = 1.0倍, 100 = 1.5倍
    };
  };
  
  // 成長上限・制限
  growthLimits: {
    dailyTraining: 2;           // 1日最大2回練習
    statCap: 100;               // 各能力値の上限
    totalEVLimit: 510;          // 努力値合計上限
    experienceToLevelRatio: 'pokemon_growth_rate_based';
  };
}
```

### 2.2 レベル・経験値システム
```typescript
interface LevelingSystem {
  // 経験値テーブル（ポケモン準拠）
  experienceGroups: {
    fast: {        // 80万経験値でLv100
      formula: '(4 * level^3) / 5';
      pokemonTypes: ['normal', 'flying', 'poison'];
    };
    medium_fast: { // 100万経験値でLv100
      formula: 'level^3';
      pokemonTypes: ['fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'ground', 'rock', 'bug', 'ghost', 'steel', 'fairy'];
    };
    medium_slow: { // 105.4万経験値でLv100
      formula: '(6/5 * level^3) - (15 * level^2) + (100 * level) - 140';
      pokemonTypes: ['psychic', 'dark'];
    };
    slow: {        // 125万経験値でLv100
      formula: '(5 * level^3) / 4';
      pokemonTypes: ['dragon'];
    };
  };
  
  // 経験値獲得源
  experienceGains: {
    training: {
      basic: { base: 50, variance: 0.2 };        // 40-60
      special: { base: 100, variance: 0.3 };     // 70-130
      intensive: { base: 200, variance: 0.4 };   // 120-280
    };
    
    matches: {
      practice: { base: 150, win_bonus: 1.5 };   // 150 or 225
      tournament: { base: 300, win_bonus: 2.0 }; // 300 or 600
      important: { base: 500, win_bonus: 2.5 };  // 500 or 1250
    };
    
    special_events: {
      evolution: 1000;
      achievement: 500;
      story_milestone: 750;
    };
  };
}
```

### 2.3 進化システムバランス
```typescript
interface EvolutionBalance {
  // 進化条件の難易度調整
  evolutionRequirements: {
    level_based: {
      early: { level: 16, difficulty: 'easy' };      // 1年目で到達可能
      mid: { level: 32, difficulty: 'medium' };      // 2年目で到達可能
      late: { level: 48, difficulty: 'hard' };       // 3年目で到達可能
    };
    
    friendship_based: {
      requirement: 160;  // 最大255の約60%
      gain_rate: 2;      // 練習1回につき+2
      time_to_achieve: '約80回の練習';
    };
    
    item_based: {
      item_cost: { common: 5000, rare: 15000, legendary: 50000 };
      availability: 'progression_locked';
    };
    
    special_conditions: {
      time_based: 'night_training_only';
      location_based: 'special_facility_required';
      stat_based: 'specific_stat_threshold';
    };
  };
  
  // 進化による能力上昇
  evolutionBonuses: {
    stage1_to_stage2: {
      stat_increase: { min: 10, max: 25, average: 15 };
      new_moves: { count: 2, rarity: 'improved' };
      ability_upgrade: { chance: 0.3 };
    };
    
    stage2_to_stage3: {
      stat_increase: { min: 15, max: 35, average: 25 };
      new_moves: { count: 3, rarity: 'rare' };
      ability_upgrade: { chance: 0.7 };
      hidden_ability_unlock: { chance: 0.1 };
    };
  };
}
```

## 3. 試合システムバランス

### 3.1 勝率計算システム
```typescript
interface MatchBalance {
  // 基本勝率計算
  winProbabilityFactors: {
    stat_difference: {
      weight: 0.4;
      formula: 'sigmoid((own_total - opponent_total) / 50)';
      // 能力差50で約73%勝率、100で約88%勝率
    };
    
    type_effectiveness: {
      weight: 0.2;
      multipliers: {
        super_effective: 1.5;    // タイプ相性有利
        normal: 1.0;             // 相性普通
        not_very_effective: 0.67; // タイプ相性不利
        no_effect: 0.5;          // 無効（大幅不利）
      };
    };
    
    tactical_matchup: {
      weight: 0.15;
      serve_and_volley_vs_baseline: 1.2;  // 戦術相性
      doubles_chemistry: 1.3;              // ダブルス連携
    };
    
    environmental_factors: {
      weight: 0.1;
      court_surface: { hard: 1.0, clay: 1.1, grass: 0.9, indoor: 1.05 };
      weather: { clear: 1.0, rain: 0.9, wind: 0.85, hot: 1.1 };
      home_advantage: 1.1;
    };
    
    condition_and_fatigue: {
      weight: 0.15;
      condition_modifier: { excellent: 1.2, good: 1.1, normal: 1.0, poor: 0.9, terrible: 0.7 };
      fatigue_penalty: 'linear_decay_from_80_fatigue';
    };
  };
  
  // ランダム要素制御
  randomnessControl: {
    base_variance: 0.15;           // ±15%の基本ランダム要素
    upset_protection: {            // 大番狂わせの制限
      max_upset_ratio: 0.3;        // 30%以下の勝率でも10%は勝てる
      min_favorite_win: 0.7;       // 90%勝率でも30%は負ける可能性
    };
    
    critical_moments: {            // 重要な場面でのランダム性
      match_point: { variance: 0.25 };  // マッチポイントは揺れが大きい
      deuce_situation: { variance: 0.2 }; // デュースは接戦
    };
  };
}
```

### 3.2 試合形式別調整
```typescript
interface MatchFormatBalance {
  // シングルス
  singles: {
    individual_skill_weight: 0.8;
    mental_pressure_factor: 1.2;
    stamina_importance: 1.1;
    duration_average: '45_minutes';
  };
  
  // ダブルス
  doubles: {
    individual_skill_weight: 0.6;
    teamwork_bonus: 1.4;           // チームワークが重要
    communication_factor: 1.3;
    strategy_importance: 1.2;
    duration_average: '50_minutes';
  };
  
  // 団体戦
  team_match: {
    momentum_system: {
      win_streak_bonus: 1.1;       // 連勝で勢いアップ
    carry_over_effect: 0.05;      // 前試合の結果が次に影響
    pressure_buildup: 'increases_with_importance';
    };
    
    order_strategy: {
      captain_placement: 'high_impact_position';
      weak_link_protection: 'strategic_positioning';
      surprise_factor: 'unexpected_order_bonus';
    };
  };
}
```

## 4. 経済システムバランス

### 4.1 資金・コスト設計
```typescript
interface EconomicBalance {
  // 収入源
  incomeStreams: {
    monthly_allowance: {
      base: 50000;               // 月5万円の基本予算
      reputation_bonus: 'reputation * 100';  // 評判1につき+100円
      max_bonus: 30000;          // 最大3万円のボーナス
    };
    
    tournament_prizes: {
      prefecture_preliminary: { participation: 5000, win: 15000 };
      prefecture_main: { participation: 10000, win: 50000 };
      regional: { participation: 25000, win: 150000 };
      national: { participation: 100000, win: 500000 };
    };
    
    sponsorship: {
      unlock_condition: 'prefecture_best8_or_higher';
      monthly_amount: { min: 10000, max: 100000 };
      performance_based: 'win_rate_multiplier';
    };
  };
  
  // 主要支出
  expenses: {
    equipment_maintenance: {
      monthly_base: 20000;        // 基本維持費
      quality_multiplier: { poor: 0.8, average: 1.0, good: 1.3, excellent: 1.8 };
      usage_degradation: 'practice_frequency_based';
    };
    
    facility_upgrades: {
      court_improvement: { level1: 100000, level2: 300000, level3: 800000 };
      equipment_purchase: { basic: 50000, advanced: 150000, professional: 500000 };
      building_expansion: { clubhouse: 200000, medical_room: 400000 };
    };
    
    operational_costs: {
      utilities: 15000;           // 月間光熱費
      transportation: 'tournament_distance_based';
      medical_supplies: 'injury_frequency_based';
    };
  };
  
  // バランス調整メカニズム
  economicStabilizers: {
    bankruptcy_prevention: {
      minimum_funds: 10000;       // 最低保証額
      emergency_loan: 'available_with_reputation_penalty';
    };
    
    inflation_control: {
      price_scaling: 'year_based_gentle_increase';
      purchasing_power: 'maintain_relative_value';
    };
    
    investment_returns: {
      facility_roi: { training_efficiency: 1.2, player_satisfaction: 1.15 };
      long_term_benefits: 'reputation_and_recruitment_boost';
    };
  };
}
```

### 4.2 アイテム価格バランス
```typescript
interface ItemPricing {
  equipment: {
    // 練習器具
    ball_machine: { cost: 80000, effect: 'stroke_training +50%', maintenance: 5000 };
    serve_machine: { cost: 120000, effect: 'serve_training +60%', maintenance: 7000 };
    video_system: { cost: 200000, effect: 'tactical_training +40%', maintenance: 10000 };
    
    // 消耗品
    tennis_balls: { cost: 2000, quantity: 100, durability: '20_practices' };
    strings: { cost: 1500, durability: '15_practices', quality_impact: 'moderate' };
    grips: { cost: 800, durability: '30_practices', quality_impact: 'minor' };
  };
  
  evolution_items: {
    // 進化石
    thunder_stone: { cost: 15000, rarity: 'uncommon', uses: 1 };
    water_stone: { cost: 15000, rarity: 'uncommon', uses: 1 };
    fire_stone: { cost: 15000, rarity: 'uncommon', uses: 1 };
    
    // 特殊アイテム
    kings_rock: { cost: 50000, rarity: 'rare', condition: 'special_training_required' };
    metal_coat: { cost: 75000, rarity: 'very_rare', condition: 'advanced_facility_required' };
  };
  
  consumables: {
    // 体力回復
    energy_drink: { cost: 1000, effect: 'fatigue -20', instant: true };
    sports_drink: { cost: 500, effect: 'fatigue -10', instant: true };
    
    // 能力強化（一時的）
    focus_supplement: { cost: 3000, effect: 'mental +5', duration: '1_match' };
    power_booster: { cost: 3000, effect: 'power +5', duration: '1_match' };
  };
}
```

## 5. 時間進行バランス

### 5.1 ゲーム内時間システム
```typescript
interface TimeProgression {
  // 基本時間単位
  timeUnits: {
    game_day: { real_time: '30_seconds', actions: 6 };
    game_week: { real_time: '3.5_minutes', events: 'weekly_schedule' };
    game_month: { real_time: '15_minutes', milestones: 'major_events' };
    game_year: { real_time: '3_hours', completion: 'full_season' };
  };
  
  // アクションポイントシステム
  actionPoints: {
    daily_allowance: 6;          // 1日6アクション
    action_costs: {
      basic_training: 1;
      special_training: 2;
      match_participation: 3;
      facility_management: 1;
      player_counseling: 1;
      rest_day: 0;               // 休養は無料
    };
    
    efficiency_bonuses: {
      morning: 1.0;              // 通常効率
      afternoon: 1.2;            // 午後は効率UP
      evening: 0.8;              // 夜は効率DOWN
    };
  };
  
  // 疲労システム
  fatigueManagement: {
    accumulation_rate: {
      light_training: 5;         // 軽い練習で疲労+5
      normal_training: 10;       // 通常練習で疲労+10
      intensive_training: 20;    // 集中練習で疲労+20
      match_participation: 15;   // 試合参加で疲労+15
    };
    
    recovery_rate: {
      rest_day: -15;             // 休養日で疲労-15
      light_activity: -5;        // 軽い活動で疲労-5
      medical_treatment: -25;    // 医療ケアで疲労-25
      natural_recovery: -3;      // 自然回復で疲労-3/日
    };
    
    performance_impact: {
      fatigue_0_30: 1.0;         // 疲労30以下：影響なし
      fatigue_31_60: 0.9;        // 疲労31-60：10%ダウン
      fatigue_61_80: 0.75;       // 疲労61-80：25%ダウン
      fatigue_81_100: 0.5;       // 疲労81-100：50%ダウン
    };
  };
}
```

### 5.2 季節・イベントバランス
```typescript
interface SeasonalBalance {
  // 季節別特徴
  seasonalEffects: {
    spring: {
      recruitment_bonus: 1.5;    // 新入生スカウト効率UP
      growth_rate: 1.1;          // 成長期で能力UP
      weather_advantage: ['grass_court', 'outdoor_training'];
    };
    
    summer: {
      tournament_season: true;   // 大会シーズン
      heat_penalty: 0.9;         // 暑さで練習効率DOWN
      stamina_importance: 1.2;   // スタミナ重要性UP
    };
    
    autumn: {
      focus_training: 1.2;       // 集中練習期間
      special_coach_events: 0.3; // 特別コーチ出現率
      technique_focus: 1.1;      // 技術練習効率UP
    };
    
    winter: {
      indoor_training: 1.1;      // 室内練習効率UP
      injury_risk: 1.2;          // 怪我リスク増加
      mental_training: 1.3;      // メンタル練習効率UP
    };
  };
  
  // 年次進行バランス
  yearlyProgression: {
    year1: {
      difficulty_modifier: 0.8;   // 敵が弱め
      growth_bonus: 1.2;          // 成長ボーナス
      tutorial_support: true;     // チュートリアル支援
    };
    
    year2: {
      difficulty_modifier: 1.0;   // 標準難易度
      growth_bonus: 1.0;          // 標準成長
      advanced_content: true;     // 高度な要素解放
    };
    
    year3: {
      difficulty_modifier: 1.3;   // 高難易度
      growth_bonus: 0.9;          // 成長率やや低下
      final_challenge: true;      // 最終チャレンジ
    };
  };
}
```

## 6. 難易度調整システム

### 6.1 動的難易度調整（DDA）
```typescript
interface DynamicDifficultyAdjustment {
  // プレイヤースキル評価
  skillAssessment: {
    metrics: {
      win_rate: { target: 0.65, weight: 0.4 };          // 目標勝率65%
      progression_speed: { target: 'moderate', weight: 0.3 };
      session_length: { optimal: '30_45_minutes', weight: 0.2 };
      frustration_indicators: { rage_quit_prevention: 0.1 };
    };
    
    adjustment_frequency: 'after_every_5_matches';
    adjustment_magnitude: { max: 0.15, step: 0.05 };    // 最大15%ずつ調整
  };
  
  // 調整対象パラメータ
  adjustableParameters: {
    opponent_strength: { range: [0.7, 1.3], current: 1.0 };
    training_effectiveness: { range: [0.8, 1.4], current: 1.0 };
    random_event_frequency: { range: [0.5, 1.5], current: 1.0 };
    resource_generation: { range: [0.9, 1.2], current: 1.0 };
  };
  
  // セーフティネット
  safetyMechanisms: {
    losing_streak_protection: {
      trigger: '5_consecutive_losses';
      effect: 'temporary_opponent_weakness';
      duration: '3_matches';
    };
    
    power_level_insurance: {
      minimum_progress: 'guarantee_weekly_advancement';
      catch_up_mechanics: 'bonus_experience_when_behind';
    };
  };
}
```

### 6.2 プレイヤータイプ別調整
```typescript
interface PlayerTypeBalancing {
  // プレイヤー分類
  playerTypes: {
    casual: {
      characteristics: ['short_sessions', 'story_focused', 'low_competition'];
      adjustments: {
        progression_speed: 1.3;     // 早い進行
        difficulty: 0.8;            // 易しい難易度
        tutorial_extended: true;    // 詳細なガイド
      };
    };
    
    dedicated: {
      characteristics: ['long_sessions', 'optimization_focused', 'competitive'];
      adjustments: {
        progression_speed: 1.0;     // 標準進行
        difficulty: 1.2;            // やや高難易度
        advanced_features: true;    // 高度な機能解放
      };
    };
    
    completionist: {
      characteristics: ['collection_focused', 'perfectionist', 'long_term_play'];
      adjustments: {
        rare_content_access: 1.5;   // レアコンテンツ出現率UP
        achievement_difficulty: 1.1; // 実績難易度UP
        endgame_content: 'prioritized';
      };
    };
  };
  
  // 適応的コンテンツ提供
  adaptiveContent: {
    story_pacing: 'player_preference_based';
    challenge_difficulty: 'skill_level_appropriate';
    reward_frequency: 'engagement_level_optimized';
  };
}
```

## 7. バランステスト・検証方法

### 7.1 数値シミュレーション
```typescript
interface BalanceValidation {
  // 自動シミュレーション
  simulationTests: {
    progression_curve: {
      test_cases: 1000;
      player_types: ['casual', 'dedicated', 'completionist'];
      success_criteria: {
        completion_rate: { min: 0.7, max: 0.9 };
        average_playtime: { min: '15_hours', max: '50_hours' };
        satisfaction_score: { min: 4.0, max: 5.0 };
      };
    };
    
    economic_stability: {
      iterations: 500;
      scenarios: ['conservative_play', 'aggressive_investment', 'tournament_focused'];
      bankruptcy_rate: { max: 0.05 };  // 5%以下の破産率
    };
    
    match_outcomes: {
      sample_size: 10000;
      stat_combinations: 'comprehensive_matrix';
      upset_frequency: { target: 0.15, tolerance: 0.05 };  // 15%±5%の番狂わせ
    };
  };
  
  // A/Bテスト設計
  abTestFramework: {
    parameter_variations: {
      training_effectiveness: [0.8, 1.0, 1.2];
      opponent_difficulty: [0.9, 1.0, 1.1];
      experience_rates: [0.8, 1.0, 1.3];
    };
    
    success_metrics: {
      player_retention: { day1: 0.8, day7: 0.5, day30: 0.3 };
      session_duration: { target: '35_minutes', variance: 0.2 };
      progression_satisfaction: { rating: 4.2, sample_size: 100 };
    };
  };
}
```

### 7.2 プレイテスト計画
```typescript
interface PlaytestStrategy {
  // 段階的テスト
  testingPhases: {
    alpha: {
      participants: 10;
      focus: 'core_mechanics_validation';
      duration: '2_weeks';
      feedback_method: 'detailed_interviews';
    };
    
    beta: {
      participants: 100;
      focus: 'balance_and_progression';
      duration: '4_weeks';  
      feedback_method: 'surveys_and_analytics';
    };
    
    pre_launch: {
      participants: 500;
      focus: 'polish_and_final_tuning';
      duration: '2_weeks';
      feedback_method: 'metrics_and_targeted_feedback';
    };
  };
  
  // データ収集項目
  dataCollection: {
    quantitative: {
      session_analytics: ['duration', 'actions_per_minute', 'feature_usage'];
      progression_metrics: ['level_gains', 'stat_improvements', 'milestone_completion'];
      economic_behavior: ['spending_patterns', 'resource_management', 'investment_choices'];
    };
    
    qualitative: {
      satisfaction_surveys: ['enjoyment', 'difficulty_perception', 'feature_preferences'];
      usability_feedback: ['confusion_points', 'interface_issues', 'improvement_suggestions'];
      engagement_assessment: ['motivation_factors', 'memorable_moments', 'continuation_intent'];
    };
  };
}
```

## 8. 運用時バランス調整

### 8.1 モニタリング指標
```typescript
interface OperationalMetrics {
  // リアルタイム監視
  realTimeMetrics: {
    player_activity: {
      concurrent_users: 'peak_and_average_tracking';
      session_distribution: 'time_of_day_analysis';
      feature_adoption: 'new_feature_uptake_rate';
    };
    
    game_health: {
      progression_bottlenecks: 'completion_rate_by_stage';
      economic_indicators: 'resource_distribution_analysis';
      competitive_balance: 'win_rate_distribution';
    };
    
    technical_performance: {
      response_times: 'api_endpoint_monitoring';
      error_rates: 'critical_operation_success_rate';
      user_experience: 'page_load_and_interaction_speed';
    };
  };
  
  // 定期分析レポート
  periodicAnalysis: {
    weekly: {
      player_retention: 'cohort_analysis';
      content_consumption: 'feature_usage_patterns';
      balance_indicators: 'statistical_outlier_detection';
    };
    
    monthly: {
      comprehensive_review: 'full_game_health_assessment';
      player_segmentation: 'behavior_pattern_clustering';
      competitive_meta: 'dominant_strategy_identification';
    };
  };
}
```

### 8.2 調整実行プロセス
```typescript
interface BalanceUpdateProcess {
  // 変更管理
  changeManagement: {
    impact_assessment: {
      affected_systems: 'comprehensive_dependency_analysis';
      player_impact: 'estimated_experience_changes';
      rollback_plan: 'immediate_reversion_capability';
    };
    
    testing_protocol: {
      staging_environment: 'full_game_simulation';
      limited_rollout: 'gradual_deployment_to_subset';
      monitoring_period: '48_hour_observation_window';
    };
    
    communication_strategy: {
      advance_notice: '1_week_player_notification';
      change_explanation: 'clear_reasoning_and_expected_impact';
      feedback_collection: 'post_change_player_surveys';
    };
  };
  
  // 緊急対応
  emergencyProtocols: {
    hotfix_criteria: {
      game_breaking_bugs: 'immediate_priority';
      severe_balance_issues: '24_hour_response';
      player_frustration_spikes: 'rapid_investigation_and_response';
    };
    
    escalation_process: {
      detection: 'automated_alert_system';
      assessment: 'rapid_impact_evaluation';
      decision: 'stakeholder_approval_within_2_hours';
      deployment: 'emergency_patch_deployment';
    };
  };
}
```

---

## 9. バランス調整の成功指標

### 9.1 定量的指標
- **プレイヤー継続率**: Day-1: 85%+, Day-7: 60%+, Day-30: 35%+
- **セッション継続時間**: 平均35-45分（適度な集中時間）
- **進行満足度**: 4.2/5.0以上（アンケート調査）
- **コンテンツ消費速度**: 3年間ストーリーを2-4ヶ月で完了
- **経済バランス**: 破産率5%以下、リソース余剰率15%以下

### 9.2 定性的指標  
- **楽しさの維持**: "毎日続けたくなる"ユーザー比率70%+
- **適度な挑戦**: "難しすぎず簡単すぎない"評価80%+
- **成長実感**: "選手の成長が楽しい"評価85%+
- **戦略性**: "選択に意味がある"評価75%+

この詳細なバランス設計により、プレイヤーが長期間楽しめる、よく調整されたゲーム体験を提供します。
