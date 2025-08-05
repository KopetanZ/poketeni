// =====================================================
// ポケテニマスター - カードシステム型定義
// 栄冠ナイン方式のカード＆マップシステム
// =====================================================

export interface TrainingCard {
  id: string;
  name: string;
  type: 'training' | 'special' | 'event';
  number: number; // 進むマス数 (1-6)
  
  // 練習効果
  trainingEffects: {
    serve?: number;
    return?: number;
    volley?: number;
    stroke?: number;
    mental?: number;
    stamina?: number;
  };
  
  // 特殊効果
  specialEffects?: {
    conditionRecovery?: number; // コンディション回復
    trustIncrease?: number; // 信頼度上昇
    teamMoraleBoost?: boolean; // チーム士気向上
    practiceEfficiencyBoost?: number; // 練習効率アップ
  };
  
  // カード入手条件
  unlockRequirements?: {
    reputation?: number;
    year?: number;
    facilities?: string[];
  };
  
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

export interface MapPanel {
  id: string;
  position: number; // マップ上の位置 (0-365, 1年=365日)
  type: 'normal' | 'good_event' | 'bad_event' | 'match' | 'exam' | 'graduation' | 'special_training' | 'character' | 'facility';
  
  // パネル効果
  effects: {
    // ステータス変化
    statChanges?: {
      serve?: number;
      return?: number;
      volley?: number;
      stroke?: number;
      mental?: number;
      stamina?: number;
    };
    
    // チーム効果
    teamEffects?: {
      conditionChange?: number;
      moraleChange?: number;
      trustChange?: number;
      practiceEfficiencyChange?: number;
    };
    
    // リソース変化
    resourceChanges?: {
      funds?: number;
      reputation?: number;
    };
    
    // 特殊効果
    specialEffects?: {
      forceStop?: boolean; // 強制停止
      cardDraw?: number; // カード追加獲得
      facilityUnlock?: string; // 施設解放
      eventTrigger?: string; // イベント発生
    };
  };
  
  // イベント内容
  event?: {
    title: string;
    description: string;
    choices?: {
      text: string;
      effects: MapPanel['effects'];
    }[];
  };
  
  // パネル表示
  display: {
    color: 'blue' | 'red' | 'white' | 'green' | 'yellow' | 'purple' | 'orange';
    icon: string;
    name: string;
  };
  
  // 固定日程パネル（変更不可）
  isFixed: boolean;
}

export interface CardHand {
  cards: TrainingCard[];
  maxCards: number; // 手札上限
  drawPileSize: number; // 山札残り
}

export interface GameProgress {
  currentYear: number; // 1-3
  currentMonth: number; // 1-12
  currentDay: number; // 1-31
  currentPosition: number; // マップ上の現在位置
  
  // カード管理
  hand: CardHand;
  usedCards: TrainingCard[];
  
  // ゲーム状態
  isCardSelectionPhase: boolean;
  isMovementPhase: boolean;
  isEventPhase: boolean;
  
  // 強制停止フラグ
  forcedStop?: {
    reason: string;
    nextAction: 'match' | 'exam' | 'graduation' | 'special_event';
  };
}

export interface SeasonMap {
  year: number;
  totalDays: number;
  panels: MapPanel[];
  
  // 固定イベント日程
  fixedEvents: {
    position: number;
    type: 'match' | 'exam' | 'graduation' | 'entrance_ceremony' | 'sports_festival';
    name: string;
  }[];
  
  // ランダムパネル配置設定
  randomPanelDistribution: {
    good_event: number; // パーセンテージ
    bad_event: number;
    normal: number;
    special_training: number;
    character: number;
  };
}

// カードタイプの定義
export const CARD_TYPES = {
  // 基本練習カード
  SERVE_PRACTICE: 'serve_practice',
  RETURN_PRACTICE: 'return_practice',
  VOLLEY_PRACTICE: 'volley_practice',
  STROKE_PRACTICE: 'stroke_practice',
  MENTAL_PRACTICE: 'mental_practice',
  STAMINA_PRACTICE: 'stamina_practice',
  
  // 総合練習カード
  TOTAL_PRACTICE: 'total_practice',
  DOUBLES_PRACTICE: 'doubles_practice',
  MATCH_PRACTICE: 'match_practice',
  
  // 特殊カード
  REST_DAY: 'rest_day',
  TEAM_MEAL: 'team_meal',
  MASSAGE: 'massage',
  ENCOURAGE: 'encourage',
  INDIVIDUAL_COACHING: 'individual_coaching',
  FACILITY_MAINTENANCE: 'facility_maintenance',
  
  // レア特殊カード
  LEGENDARY_COACH: 'legendary_coach',
  PROFESSIONAL_VISIT: 'professional_visit',
  SPECIAL_TOURNAMENT: 'special_tournament',
  MIRACLE_RECOVERY: 'miracle_recovery'
} as const;

// パネルタイプの定義
export const PANEL_TYPES = {
  // 基本パネル
  NORMAL: 'normal',
  GOOD_EVENT: 'good_event',
  BAD_EVENT: 'bad_event',
  
  // 特別パネル
  MATCH: 'match',
  EXAM: 'exam',
  GRADUATION: 'graduation',
  SPECIAL_TRAINING: 'special_training',
  
  // キャラクターパネル
  GRADUATED_SENIOR: 'graduated_senior',
  PRO_PLAYER: 'pro_player',
  COACH_VISIT: 'coach_visit',
  
  // 施設パネル
  BOOKSTORE: 'bookstore',
  SPORTS_SHOP: 'sports_shop',
  RESTAURANT: 'restaurant',
  HOSPITAL: 'hospital'
} as const;