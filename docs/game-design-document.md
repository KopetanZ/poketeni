# ポケテニマスター ゲーム設計書

## 1. プロジェクト概要

### 1.1 ゲームタイトル
**ポケテニマスター (PokeTeni Master)**  
〜目指せ、ポケテニマスター！〜

### 1.2 ゲームジャンル
- 育成シミュレーションゲーム
- スポーツゲーム（テニス）
- Webブラウザゲーム

### 1.3 ターゲット層
- **メインターゲット**: 20-35歳のゲーマー
- **サブターゲット**: ポケモンファン、テニスファン、栄冠ナイン経験者
- **プラットフォーム**: PC・スマートフォンのWebブラウザ

### 1.4 ゲームコンセプト
「栄冠ナイン」のテニス版として、ポケモンを選手とした高校テニス部の監督となり、3年間で全国制覇を目指す育成シミュレーションゲーム。

**コアコンセプト**:
- 🎾 **テニス戦術の奥深さ**: サーブ&ボレー、ベースライン等の戦術
- 🔥 **ポケモンの個性**: タイプ相性、進化、特性を活用
- 📚 **選手への愛着**: 3年間の成長ストーリー
- 🌐 **純粋な楽しさ**: 課金なし、競争よりも育成の喜び

## 2. ゲームシステム設計

### 2.1 基本ゲームフロー

#### 2.1.1 メインループ（3年間）
```
Year 1: 基礎作り期
├── 春: 新入部員スカウト（初期メンバー確保）
├── 夏: 県大会初参加（1-2回戦突破目標）
├── 秋: 基礎練習強化期間
└── 冬: 次年度準備、個別指導

Year 2: 成長期
├── 春: 有望新入生獲得
├── 夏: 県大会上位進出（ベスト8目標）
├── 秋: 高度な戦術習得
└── 冬: 全国大会準備

Year 3: 集大成期
├── 春: 最強チーム完成
├── 夏: 全国大会挑戦
├── 秋: ポケテニマスター決定戦
└── エンドレスモード移行
```

#### 2.1.2 日次ループ
```
朝 (8:00-12:00): 
- 選手コンディション確認
- 練習メニュー計画
- 設備・道具管理

昼 (13:00-17:00):
- メイン練習実行
- 個別指導
- 練習試合

夕 (17:00-19:00):
- 選手面談
- 戦術会議
- 翌日準備
```

### 2.2 選手システム

#### 2.2.1 選手基本情報
```typescript
interface Player {
  // 基本情報
  pokemonId: number;          // PokeAPI ID
  pokemonName: string;        // ポケモン名
  customName?: string;        // プレイヤー命名
  grade: 1 | 2 | 3;          // 学年
  position: 'captain' | 'vice_captain' | 'regular' | 'member';
  
  // 成長情報
  level: number;              // 1-100
  experience: number;         // 経験値
  evolutionStage: number;     // 進化段階
  
  // 能力値 (各0-100)
  stats: {
    power: number;           // パワー
    technique: number;       // テクニック  
    speed: number;           // スピード
    stamina: number;         // スタミナ
    mental: number;          // メンタル
  };
  
  // テニス技術 (各0-100)
  tennisSkills: {
    serve: number;           // サーブ
    volley: number;          // ボレー
    stroke: number;          // ストローク
    return: number;          // リターン
  };
  
  // 戦術理解 (各0-100)
  tacticalSkills: {
    singles: number;         // シングルス適性
    doubles: number;         // ダブルス適性
    tactics: number;         // 戦術眼
  };
}
```

#### 2.2.2 ポケモン固有システム

**タイプ相性システム**
```typescript
// 例: 炎タイプ vs 草タイプ = 1.5倍効果
// 水タイプ vs 炎タイプ = 1.5倍効果
// 電気タイプ vs 水タイプ = 1.5倍効果
// 地面タイプ vs 電気タイプ = 2.0倍効果（無効化）

const typeChart = {
  fire: { effective: ['grass', 'ice', 'bug'], weak: ['water', 'ground', 'rock'] },
  water: { effective: ['fire', 'ground', 'rock'], weak: ['electric', 'grass'] },
  // ... 全18タイプ
};
```

**性格システム（能力補正）**
```typescript
const natures = [
  { name: 'いじっぱり', boost: 'power', reduce: 'technique' },     // パワー型
  { name: 'ひかえめ', boost: 'mental', reduce: 'power' },         // 頭脳型
  { name: 'ようき', boost: 'speed', reduce: 'technique' },        // スピード型
  { name: 'わんぱく', boost: 'stamina', reduce: 'mental' },       // 体力型
  { name: 'おくびょう', boost: 'speed', reduce: 'power' },        // 逃げ足速い
  // 全25種類の性格
];
```

**特性システム（特殊効果）**
```typescript
const abilities = [
  {
    name: 'プレッシャー',
    description: '相手の必殺技使用回数を多く消費させる',
    effect: { opponentPPReduction: 2 }
  },
  {
    name: 'てんのめぐみ',
    description: 'クリティカルが出やすい',
    effect: { criticalRatio: 2.0 }
  },
  {
    name: 'ちからずく',
    description: '技の威力が上がるが追加効果がない',
    effect: { powerBoost: 1.3, noSecondaryEffects: true }
  }
  // 全100種類以上の特性
];
```

#### 2.2.3 必殺技システム
```typescript
interface SpecialMove {
  id: string;
  name: string;                    // '雷鳴サーブ', '氷結ドロップ'
  type: PokemonType;              // 技のタイプ
  category: 'serve' | 'stroke' | 'volley' | 'return' | 'special';
  
  power: number;                  // 威力 (40-200)
  accuracy: number;               // 命中率 (50-100)
  pp: number;                     // 使用回数 (5-40)
  priority: number;               // 先制度 (-3 ~ +3)
  
  learnConditions: {
    level?: number;               // レベル習得
    evolution?: number;           // 進化時習得
    training?: string;            // 特訓で習得
    item?: string;               // アイテム使用
  };
  
  effects: {
    burnChance?: number;          // 火傷確率（相手1ターン行動不能）
    freezeChance?: number;        // 氷結確率（相手の技無効化）
    confuseChance?: number;       // 混乱確率（自分にダメージ）
    flinchChance?: number;        // ひるみ確率（そのターン行動不能）
    statBoost?: StatChange;       // 自分の能力変化
    statReduction?: StatChange;   // 相手の能力変化
  };
}

// 必殺技例
const exampleMoves = [
  {
    name: '10まんボルトサーブ',
    type: 'electric',
    power: 90,
    accuracy: 85,
    pp: 15,
    effects: { burnChance: 10 }
  },
  {
    name: 'ハイドロポンプストローク',
    type: 'water', 
    power: 110,
    accuracy: 80,
    pp: 5,
    effects: { statReduction: { technique: -1 } }
  }
];
```

### 2.3 練習・育成システム

#### 2.3.1 練習メニュー
```typescript
interface TrainingMenu {
  basicTraining: {
    // 基礎練習（毎日可能）
    powerTraining: { duration: 2, fatigue: 15, growth: 'power +2~5' };
    techniqueTraining: { duration: 2, fatigue: 10, growth: 'technique +2~5' };
    speedTraining: { duration: 1, fatigue: 20, growth: 'speed +2~5' };
    staminaTraining: { duration: 3, fatigue: 5, growth: 'stamina +2~5' };
    mentalTraining: { duration: 1, fatigue: 5, growth: 'mental +2~5' };
  };
  
  specialTraining: {
    // 専門練習（週1-2回）
    serveTraining: { requirements: ['サーブマシン'], growth: 'serve +3~8' };
    volleyTraining: { requirements: ['ネット'], growth: 'volley +3~8' };
    strokeTraining: { requirements: ['ボールマシン'], growth: 'stroke +3~8' };
    returnTraining: { requirements: ['パートナー'], growth: 'return +3~8' };
  };
  
  tacticalTraining: {
    // 戦術練習（週1回）
    singlesStrategy: { requirements: ['コーチ'], growth: 'singles +2~6' };
    doublesStrategy: { requirements: ['ペア相手'], growth: 'doubles +2~6' };
    gameAnalysis: { requirements: ['ビデオ'], growth: 'tactics +2~6' };
  };
}
```

#### 2.3.2 練習効果計算
```typescript
function calculateTrainingEffect(
  player: Player,
  trainingType: TrainingType,
  conditions: TrainingConditions
): TrainingResult {
  // 基礎効果
  let baseEffect = getBaseTrainingEffect(trainingType);
  
  // ポケモンタイプボーナス
  const typeBonus = getTypeTrainingBonus(player.type, trainingType);
  
  // 性格補正
  const natureModifier = getNatureModifier(player.nature, trainingType);
  
  // コンディション補正
  const conditionModifier = getConditionModifier(player.condition);
  
  // 疲労度ペナルティ
  const fatigueModifier = getFatigueModifier(player.fatigue);
  
  // 設備ボーナス
  const facilityBonus = getFacilityBonus(conditions.facilities, trainingType);
  
  // 最終効果計算
  const finalEffect = baseEffect * typeBonus * natureModifier * 
                     conditionModifier * fatigueModifier * facilityBonus;
                     
  // ランダム要素（±20%）
  const randomFactor = 0.8 + Math.random() * 0.4;
  
  return {
    statGrowth: Math.floor(finalEffect * randomFactor),
    experienceGain: Math.floor(finalEffect * 10),
    fatigueIncrease: getTrainingFatigue(trainingType, player.stamina),
    specialEvents: checkSpecialEvents(player, trainingType, finalEffect)
  };
}
```

### 2.4 試合システム

#### 2.4.1 試合形式
```typescript
interface MatchFormat {
  teamMatch: {
    format: 'S1-S2-D1-S3-D2';     // シングルス3、ダブルス2
    winCondition: '3勝先取';
    setFormat: '6ゲーム先取、タイブレーク有';
  };
  
  individualMatch: {
    singles: '3セット先取';
    doubles: '3セット先取';
    setFormat: '6ゲーム先取（デュース有）';
  };
}
```

#### 2.4.2 試合計算エンジン
```typescript
function simulateMatch(
  homePlayer: Player,
  awayPlayer: Player,
  conditions: MatchConditions
): MatchResult {
  // 基本能力比較
  const statComparison = calculateStatAdvantage(homePlayer.stats, awayPlayer.stats);
  
  // タイプ相性
  const typeEffectiveness = getTypeMatchup(homePlayer.type, awayPlayer.type);
  
  // 戦術相性
  const tacticalAdvantage = getTacticalMatchup(homePlayer.playStyle, awayPlayer.playStyle);
  
  // 環境要因
  const environmentalFactors = {
    court: getCourtAdvantage(conditions.courtType, homePlayer.type),
    weather: getWeatherEffect(conditions.weather, homePlayer.type),
    crowd: getCrowdEffect(conditions.isHome, homePlayer.mental)
  };
  
  // コンディション
  const conditionEffect = getConditionAdvantage(homePlayer.condition, awayPlayer.condition);
  
  // 総合勝率計算
  const winProbability = calculateWinProbability({
    statComparison,
    typeEffectiveness,
    tacticalAdvantage,
    environmentalFactors,
    conditionEffect
  });
  
  // 試合シミュレーション実行
  return simulateGameProgression(homePlayer, awayPlayer, winProbability);
}
```

### 2.5 リソース管理システム

#### 2.5.1 時間管理
```typescript
interface TimeManagement {
  gameCalendar: {
    currentDate: Date;
    gameSpeed: 'pause' | 'normal' | 'fast';
    seasonPhases: {
      spring: { months: [4, 5, 6], focus: 'recruitment_basic_training' };
      summer: { months: [7, 8], focus: 'tournaments_intensive_training' };
      autumn: { months: [9, 10, 11], focus: 'skill_development' };
      winter: { months: [12, 1, 2, 3], focus: 'planning_individual_coaching' };
    };
  };
  
  dailySchedule: {
    actionPoints: 6;           // 1日6アクション
    timeSlots: {
      morning: { slots: 2, efficiency: 1.0 };
      afternoon: { slots: 3, efficiency: 1.2 };
      evening: { slots: 1, efficiency: 0.8 };
    };
  };
}
```

#### 2.5.2 学校予算システム
```typescript
interface SchoolBudget {
  currentFunds: number;        // 現在の予算
  
  monthlyIncome: {
    schoolAllocation: 50000;   // 学校からの基本予算
    fundraising: 'variable';   // 部活動成績による変動
    sponsorship: 'variable';   // スポンサー収入（成績連動）
  };
  
  expenses: {
    // 固定費
    maintenance: 20000;        // 設備維持費
    utilities: 10000;         // 光熱費
    insurance: 5000;          // 保険料
    
    // 変動費
    equipment: 'variable';     // 用具購入費
    travel: 'variable';       // 遠征費
    tournaments: 'variable';   // 大会参加費
    specialTraining: 'variable'; // 特別指導費
  };
  
  investments: {
    courtUpgrade: { cost: 500000, effect: 'training_efficiency +20%' };
    equipmentUpgrade: { cost: 100000, effect: 'training_quality +10%' };
    coachHiring: { cost: 200000, effect: 'special_training_unlock' };
  };
}
```

#### 2.5.3 設備・施設システム
```typescript
interface FacilitySystem {
  courts: {
    count: number;             // コート数 (1-6)
    surface: 'concrete' | 'asphalt' | 'artificial_grass' | 'clay' | 'hard';
    quality: 1 | 2 | 3 | 4 | 5; // 品質レベル
    maintenance: number;       // 整備状況 (0-100)
    
    effects: {
      trainingEfficiency: number;    // 練習効率補正
      injuryRisk: number;           // 怪我リスク
      playerSatisfaction: number;    // 選手満足度
    };
  };
  
  equipment: {
    ballMachine: { owned: boolean, condition: number, effect: 'stroke_training +50%' };
    serveMachine: { owned: boolean, condition: number, effect: 'serve_training +50%' };
    videoAnalysis: { owned: boolean, version: number, effect: 'tactical_training +30%' };
    medicalRoom: { owned: boolean, equipment: string[], effect: 'injury_recovery +40%' };
  };
  
  facilities: {
    clubhouse: { level: number, effect: 'team_morale +10%' };
    showerRoom: { level: number, effect: 'fatigue_recovery +20%' };
    storage: { level: number, effect: 'equipment_durability +15%' };
  };
}
```

## 3. ストーリー・イベントシステム

### 3.1 メインストーリー構成

#### 3.1.1 1年目：「出会いと発見の春」
```
プロローグ:
- プレイヤーは新任監督として弱小校「ナッシー高校」に赴任
- 初期部員：コラッタ、ポッポ、キャタピー（全て1年生）
- 目標：県大会1回戦突破

主要イベント:
春：新入生スカウト、基礎練習開始
夏：初の県大会参加（1回戦敗退も成長を実感）
秋：他校との練習試合、新技習得
冬：来年への決意表明、個別面談

成長テーマ：「基礎の大切さ」「チームワーク」「努力の意味」
```

#### 3.1.2 2年目：「飛躍と試練の夏」
```
春の転機:
- 有望な転校生ポケモンが加入
- 前年の経験を活かした効率的練習
- 他校からの注目

夏の激闘:
- 県大会ベスト8進出
- 強豪校「バンギラス学園」との激闘（惜敗）
- 敗戦から学ぶ戦術の重要性

秋の成長:
- 伝説のコーチ「フシギダネじいさん」登場
- 高度な戦術・必殺技習得期間
- 選手同士の絆深化エピソード

成長テーマ：「戦略の重要性」「仲間への信頼」「挫折からの成長」
```

#### 3.1.3 3年目：「全国への挑戦と頂点への道」
```
春の準備:
- 最強世代の完成
- 全国レベルの高度な戦術練習
- 他地方の情報収集

夏の決戦:
- 県大会制覇、全国大会出場権獲得
- 全国大会での他地方強豪校との対戦
- 個性豊かなライバルたちとの熱戦

最終章：
- 全国大会決勝戦
- 最強のライバル校「ディアルガ・パルキア学園」
- 3年間の集大成となる最終決戦

エンディング分岐:
- 優勝：「ポケテニマスター」称号獲得
- 準優勝：「来年リベンジを誓う後輩たち」への継承
```

### 3.2 サブイベントシステム

#### 3.2.1 ランダムイベント
```typescript
const randomEvents = {
  training: [
    {
      id: 'sudden_rain',
      name: '突然の雨',
      description: '練習中に雨が降ってきた',
      choices: [
        { text: '室内で基礎練習', effect: { mental: +2, fatigue: -5 } },
        { text: '雨の中でも続行', effect: { stamina: +3, fatigue: +10 } },
        { text: '早めに切り上げ', effect: { motivation: +1, exp: -20 } }
      ]
    },
    {
      id: 'equipment_trouble',
      name: 'ラケット破損',
      description: 'エースのラケットが練習中に折れた',
      rarity: 'uncommon',
      effects: {
        spare_available: { morale: -5, equipment_cost: 5000 },
        no_spare: { training_cancelled: true, morale: -15 }
      }
    }
  ],
  
  seasonal: [
    {
      id: 'pro_visit',
      name: 'プロ選手の訪問',
      season: 'autumn',
      rarity: 'rare',
      description: '元プロ選手が特別指導',
      effect: { all_players_exp: +100, special_move_chance: 0.3 }
    }
  ]
};
```

#### 3.2.2 選手個別エピソード
```typescript
const playerEvents = {
  evolution_stories: [
    {
      pokemon: 'rattata',
      title: 'コラッタの挑戦',
      description: '弱虫だったコラッタが強敵に立ち向かう勇気を見つける',
      trigger: { consecutive_losses: 3, opponent_level_diff: 20 },
      outcome: { evolution_ready: true, courage_trait: true }
    }
  ],
  
  friendship_events: [
    {
      title: '深夜の特訓',
      participants: 2,
      description: '2匹だけの秘密の自主練習',
      effect: { doubles_synergy: +25, friendship: +20 }
    }
  ]
};
```

## 4. マルチプレイヤー要素

### 4.1 非同期対戦システム
```typescript
interface AsyncBattle {
  matchmaking: {
    criteria: 'team_strength' | 'school_reputation' | 'player_level_range';
    balancing: 'similar_strength_matching';
    frequency: 'weekly_tournaments';
  };
  
  battleSimulation: {
    useOpponentTeamData: true;
    replayGeneration: true;
    detailedLog: true;
  };
  
  rewards: {
    winner: { reputation: +10, funds: +5000, experience_bonus: 1.2 };
    loser: { reputation: +2, experience_bonus: 1.1 };
    participation: { friendship_increase: true };
  };
}
```

### 4.2 ランキング・リーグシステム
```typescript
interface RankingSystem {
  leagues: {
    bronze: { requirement: 'starting_league', capacity: 'unlimited' };
    silver: { requirement: 'bronze_top_30%', capacity: 'unlimited' };
    gold: { requirement: 'silver_top_20%', capacity: 'unlimited' };
    platinum: { requirement: 'gold_top_10%', capacity: 'limited' };
    diamond: { requirement: 'platinum_top_5%', capacity: 'very_limited' };
    master: { requirement: 'diamond_top_1%', capacity: 'exclusive' };
  };
  
  seasonalReset: {
    frequency: 'quarterly';
    carryOver: 'partial_progress';
    rewards: 'season_exclusive_items';
  };
  
  rankings: {
    teamPowerRanking: 'overall_team_strength';
    tournamentRanking: 'competitive_performance';
    coachingRanking: 'player_development_success';
    collectionRanking: 'pokemon_species_variety';
  };
}
```

## 5. エンドレスモード

### 5.1 ポケテニマスター学院
```typescript
interface MasterAcademy {
  role: 'academy_director';
  
  responsibilities: {
    multipleTeamManagement: 'manage_5_teams_simultaneously';
    newGenerationCoaching: 'continuous_new_student_cycles';
    researchProjects: 'unlock_advanced_training_methods';
    worldTournaments: 'compete_in_global_championships';
  };
  
  facilities: {
    mainCampus: 'upgraded_original_school';
    eliteCenter: 'advanced_training_facility';
    researchLab: 'pokemon_tennis_science_center';
    hallOfFame: 'legendary_players_museum';
  };
  
  newChallenges: {
    legendaryPokemon: { rarity: 0.1, requirements: 'master_rank_achievement' };
    perfectSeason: { challenge: 'win_every_match_in_year' };
    typeMastery: { challenge: 'specialize_in_single_type' };
    generationLegacy: { track: 'multi_generation_coaching_success' };
  };
}
```

## 6. バランス調整パラメータ

### 6.1 成長レート
```typescript
const growthRates = {
  statGrowth: {
    fast: { baseRate: 1.2, pokemonTypes: ['normal', 'flying'] };
    medium: { baseRate: 1.0, pokemonTypes: ['most_types'] };
    slow: { baseRate: 0.8, pokemonTypes: ['dragon', 'legendary'] };
  };
  
  experienceGain: {
    training: { base: 50, variance: '±20' };
    matches: { 
      win: { base: 200, bonus_multiplier: 1.5 },
      lose: { base: 100, learning_bonus: 1.2 }
    };
    special_events: { base: 500, rarity_multiplier: '2x-10x' };
  };
  
  difficultyScaling: {
    year1: { opponent_strength: '0.7x player_strength' };
    year2: { opponent_strength: '1.0x player_strength' };
    year3: { opponent_strength: '1.3x player_strength' };
    endless: { opponent_strength: 'dynamic_scaling' };
  };
}
```

### 6.2 経済バランス
```typescript
const economicBalance = {
  income: {
    monthly_base: 50000;
    tournament_prizes: {
      prefecture_winner: 100000;
      regional_winner: 500000;
      national_winner: 2000000;
    };
    sponsorship: 'performance_based_scaling';
  };
  
  costs: {
    daily_operations: 1000;
    equipment_maintenance: 'durability_based';
    facility_upgrades: {
      minor: 50000,
      major: 200000,
      premium: 1000000
    };
    special_training: 'effectiveness_based_pricing';
  };
  
  balancing_mechanisms: {
    income_scaling: 'prevents_excessive_accumulation';
    meaningful_choices: 'trade_offs_between_investments';
    progression_gates: 'achievement_based_unlocks';
  };
}
```

## 7. 技術仕様概要

### 7.1 技術スタック
- **フロントエンド**: Next.js 14 (App Router) + TypeScript + TailwindCSS
- **状態管理**: Zustand
- **データベース**: Supabase (PostgreSQL)
- **外部API**: PokeAPI (ポケモンデータ)
- **デプロイ**: Vercel
- **認証**: Supabase Auth (カスタム実装)

### 7.2 主要機能
- リアルタイムマルチプレイヤー対戦
- 複雑な能力値計算システム
- 動的バランス調整
- セーブデータの永続化
- レスポンシブデザイン

---

## 8. 開発フェーズ

### Phase 1: 基盤構築 (4週間)
- プロジェクトセットアップ
- 認証システム実装
- 基本UI/UXコンポーネント
- データベース設計・構築

### Phase 2: コア機能実装 (8週間)
- 選手管理システム
- 練習・育成システム
- 試合シミュレーション
- PokeAPI統合

### Phase 3: ゲームプレイ実装 (6週間)
- ストーリーモード
- イベントシステム
- リソース管理
- バランス調整

### Phase 4: マルチプレイヤー (4週間)
- 非同期対戦システム
- ランキングシステム
- ソーシャル機能

### Phase 5: 仕上げ・公開 (2週間)
- エンドレスモード
- パフォーマンス最適化
- テスト・デバッグ
- Vercel公開

**総開発期間: 約6ヶ月**

---

*このゲーム設計書は、純粋にゲームを楽しむことを最優先とし、プレイヤーが選手に愛着を持ち、成長の喜びを感じられる体験の提供を目的としています。*