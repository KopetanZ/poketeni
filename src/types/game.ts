// ゲーム基本型定義
export interface User {
  id: string;
  username: string;
  fruits: FruitSelection;
  avatar_config: AvatarConfig;
  created_at: string;
  updated_at: string;
}

export interface FruitSelection {
  selection: string[]; // ['apple', 'banana', 'grape', 'strawberry']
  order: number[];     // [1, 2, 3, 4]
}

export interface AvatarConfig {
  colors: string[];
  pattern: string;
}

export interface School {
  id: string;
  user_id: string;
  name: string;
  current_year: number;
  current_month: number;
  current_day: number;
  game_speed: GameSpeed;
  reputation: number;
  funds: number;
  facilities: FacilityData;
  created_at: string;
  updated_at: string;
}

export type GameSpeed = 'pause' | 'normal' | 'fast';

export interface FacilityData {
  courts: {
    count: number;
    quality: number;
    surface: CourtSurface;
    maintenance: number;
  };
  equipment: {
    ball_machine: boolean;
    serve_machine: boolean;
    video_analysis: boolean;
    medical_room: boolean;
  };
  buildings: {
    clubhouse: number;
    shower: boolean;
    storage: number;
  };
}

export type CourtSurface = 'concrete' | 'asphalt' | 'artificial_grass' | 'clay' | 'hard';

export interface Player {
  id: string;
  school_id: string;
  pokemon_id: number;
  pokemon_name: string;
  pokemon_type_1: PokemonType;
  pokemon_type_2?: PokemonType;
  custom_name?: string;
  
  // 基本情報
  grade: 1 | 2 | 3;
  position: PlayerPosition;
  join_date: string;
  graduation_date?: string;
  
  // 成長情報
  level: number;
  experience: number;
  evolution_stage: number;
  
  // 基本能力値 (0-100)
  power: number;
  technique: number;
  speed: number;
  stamina: number;
  mental: number;
  
  // テニス技術 (0-100)
  serve_skill: number;
  volley_skill: number;
  stroke_skill: number;
  return_skill: number;
  
  // 戦術理解 (0-100)
  singles_aptitude: number;
  doubles_aptitude: number;
  tactical_understanding: number;
  
  // 個体値 (0-31)
  iv_power: number;
  iv_technique: number;
  iv_speed: number;
  iv_stamina: number;
  iv_mental: number;
  
  // 努力値 (0-255)
  ev_power: number;
  ev_technique: number;
  ev_speed: number;
  ev_stamina: number;
  ev_mental: number;
  
  // 性格・特性
  nature: PokemonNature;
  ability: PokemonAbility;
  hidden_ability?: PokemonAbility;
  
  // コンディション
  condition: PlayerCondition;
  physical_fatigue: number;
  mental_fatigue: number;
  accumulated_fatigue: number;
  motivation: number;
  
  // 技・統計
  learned_moves: SpecialMove[];
  move_slots: number;
  matches_played: number;
  matches_won: number;
  sets_won: number;
  sets_lost: number;
  
  created_at: string;
  updated_at: string;
}

export type PokemonType = 
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

export type PlayerPosition = 'captain' | 'vice_captain' | 'regular' | 'member';

export type PlayerCondition = 'excellent' | 'good' | 'normal' | 'poor' | 'terrible';

export interface PokemonNature {
  name: string;
  boost?: string;
  reduce?: string;
  description: string;
}

export interface PokemonAbility {
  name: string;
  description: string;
  effects: Record<string, any>;
}

export interface SpecialMove {
  id: string;
  name: string;
  type: PokemonType;
  category: 'serve' | 'stroke' | 'volley' | 'return' | 'special';
  power: number;
  accuracy: number;
  pp: number;
  priority: number;
  effects: Record<string, any>;
}

// 練習システム
export interface TrainingSession {
  id: string;
  school_id: string;
  training_date: string;
  session_type: TrainingType;
  intensity: TrainingIntensity;
  duration: number;
  participants: TrainingParticipant[];
  training_menu: Record<string, any>;
  special_events: SpecialEvent[];
  base_effectiveness: number;
  weather_modifier: number;
  facility_modifier: number;
  created_at: string;
}

export type TrainingType = 
  | 'basic_power' | 'basic_technique' | 'basic_speed' | 'basic_stamina' | 'basic_mental'
  | 'serve_training' | 'volley_training' | 'stroke_training' | 'return_training'
  | 'singles_strategy' | 'doubles_strategy' | 'tactical_analysis'
  | 'physical_conditioning' | 'mental_training' | 'team_building';

export type TrainingIntensity = 'light' | 'normal' | 'hard' | 'extreme';

export interface TrainingParticipant {
  player_id: string;
  attendance: boolean;
  motivation: number;
}

export interface SpecialEvent {
  id: string;
  name: string;
  description: string;
  effects: Record<string, any>;
}

// 試合システム
export interface Match {
  id: string;
  home_school_id: string;
  away_school_id: string;
  match_type: MatchType;
  tournament_round?: TournamentRound;
  court_type: CourtSurface;
  weather: WeatherType;
  temperature?: number;
  status: MatchStatus;
  current_game: number;
  home_wins: number;
  away_wins: number;
  winner_school_id?: string;
  final_score?: string;
  match_log: MatchLogEntry[];
  statistics: MatchStatistics;
  scheduled_at: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export type MatchType = 'practice' | 'prefecture_preliminary' | 'prefecture_main' | 'regional' | 'national';
export type TournamentRound = 'preliminary' | 'first_round' | 'second_round' | 'quarterfinal' | 'semifinal' | 'final';
export type MatchStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type WeatherType = 'clear' | 'cloudy' | 'rainy' | 'windy' | 'hot' | 'cold';

export interface MatchLogEntry {
  time: string;
  event: string;
  details: Record<string, any>;
}

export interface MatchStatistics {
  total_duration: number;
  total_aces: number;
  unforced_errors: number;
  winners: number;
}

// UI状態管理
export interface GameState {
  currentDate: Date;
  gameSpeed: GameSpeed;
  actionPointsRemaining: number;
  isProcessing: boolean;
}

export interface UIState {
  sidebarCollapsed: boolean;
  currentView: string;
  selectedPlayers: string[];
  filters: Record<string, any>;
}