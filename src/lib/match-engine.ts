import { supabase } from '@/lib/supabase';
import type { Player, Match, MatchLogEntry } from '@/types/game';

// 試合タイプ別の設定
export const MATCH_SETTINGS = {
  practice: {
    name: '練習試合',
    setCount: 3, // 3セットマッチ
    gameCount: 6, // 6ゲーム先取
    tiebreakAt: 6, // 6-6でタイブレーク
    experienceMultiplier: 1.0,
    fatigueMultiplier: 0.8
  },
  prefecture_preliminary: {
    name: '県予選',
    setCount: 3,
    gameCount: 6,
    tiebreakAt: 6,
    experienceMultiplier: 1.5,
    fatigueMultiplier: 1.2
  },
  prefecture_main: {
    name: '県大会本戦',
    setCount: 5, // 5セットマッチ
    gameCount: 6,
    tiebreakAt: 6,
    experienceMultiplier: 2.0,
    fatigueMultiplier: 1.5
  },
  regional: {
    name: '地区大会',
    setCount: 5,
    gameCount: 6,
    tiebreakAt: 6,
    experienceMultiplier: 2.5,
    fatigueMultiplier: 1.8
  },
  national: {
    name: '全国大会',
    setCount: 5,
    gameCount: 6,
    tiebreakAt: 6,
    experienceMultiplier: 3.0,
    fatigueMultiplier: 2.0
  }
};

// ポイント計算システム
export interface GamePoint {
  player1: number;
  player2: number;
  serving: 1 | 2; // どちらがサーブか
}

export interface GameSet {
  player1Games: number;
  player2Games: number;
  tiebreak?: {
    player1Points: number;
    player2Points: number;
  };
}

export interface MatchState {
  sets: GameSet[];
  currentSet: GameSet;
  currentGame: GamePoint;
  isFinished: boolean;
  winner?: 1 | 2;
  totalDuration: number; // 分単位
}

// 選手能力に基づく勝率計算
export function calculateWinProbability(player1: Player, player2: Player, matchType: keyof typeof MATCH_SETTINGS): number {
  // 基本能力値の計算
  const p1Total = player1.serve_skill + player1.return_skill + player1.volley_skill + 
                  player1.stroke_skill + player1.mental + player1.stamina;
  const p2Total = player2.serve_skill + player2.return_skill + player2.volley_skill + 
                  player2.stroke_skill + player2.mental + player2.stamina;

  // コンディション補正
  const conditionModifier = {
    'excellent': 1.2,
    'good': 1.1,
    'normal': 1.0,
    'poor': 0.9,
    'terrible': 0.8
  };

  const p1Modified = p1Total * conditionModifier[player1.condition];
  const p2Modified = p2Total * conditionModifier[player2.condition];

  // 疲労度の影響
  const fatigueImpact = (fatigue: number) => Math.max(0.7, 1 - (fatigue / 200));
  const p1Final = p1Modified * fatigueImpact(player1.physical_fatigue + player1.mental_fatigue);
  const p2Final = p2Modified * fatigueImpact(player2.physical_fatigue + player2.mental_fatigue);

  // 経験値による補正
  const experienceBonus = (matches: number) => 1 + Math.min(0.3, matches / 100);
  const p1WithExp = p1Final * experienceBonus(player1.matches_played);
  const p2WithExp = p2Final * experienceBonus(player2.matches_played);

  // 試合タイプによる補正（重要な試合ほどメンタルが重要）
  const mentalWeight = {
    practice: 0.1,
    prefecture_preliminary: 0.2,
    prefecture_main: 0.3,
    regional: 0.4,
    national: 0.5
  };

  const mentalDiff = (player1.mental - player2.mental) * mentalWeight[matchType];
  const finalP1 = p1WithExp + mentalDiff;
  const finalP2 = p2WithExp - mentalDiff;

  // 確率に変換（0.1-0.9の範囲に制限）
  const totalPower = finalP1 + finalP2;
  const probability = finalP1 / totalPower;
  
  return Math.max(0.1, Math.min(0.9, probability));
}

// ゲーム進行シミュレーション
export function simulatePoint(player1: Player, player2: Player, servingPlayer: 1 | 2): 1 | 2 {
  const serverBonus = 0.1; // サーバー有利
  let p1Chance = calculateWinProbability(player1, player2, 'practice');
  
  if (servingPlayer === 1) {
    p1Chance += serverBonus;
  } else {
    p1Chance -= serverBonus;
  }

  return Math.random() < p1Chance ? 1 : 2;
}

// 試合全体のシミュレーション
export function simulateMatch(
  player1: Player, 
  player2: Player, 
  matchType: keyof typeof MATCH_SETTINGS
): MatchState {
  const settings = MATCH_SETTINGS[matchType];
  const matchState: MatchState = {
    sets: [],
    currentSet: { player1Games: 0, player2Games: 0 },
    currentGame: { player1: 0, player2: 0, serving: 1 },
    isFinished: false,
    totalDuration: 0
  };

  let currentServer: 1 | 2 = 1;
  let estimatedDuration = 0;

  // セット数の半分+1を勝利条件とする
  const setsToWin = Math.ceil(settings.setCount / 2);
  let player1Sets = 0;
  let player2Sets = 0;

  while (player1Sets < setsToWin && player2Sets < setsToWin) {
    const setResult = simulateSet(player1, player2, settings, currentServer);
    matchState.sets.push(setResult.set);
    
    if (setResult.winner === 1) {
      player1Sets++;
    } else {
      player2Sets++;
    }

    estimatedDuration += setResult.duration;
    currentServer = currentServer === 1 ? 2 : 1; // 次セットはサーバー交代
  }

  matchState.isFinished = true;
  matchState.winner = player1Sets > player2Sets ? 1 : 2;
  matchState.totalDuration = estimatedDuration;

  return matchState;
}

// セットのシミュレーション
function simulateSet(
  player1: Player, 
  player2: Player, 
  settings: typeof MATCH_SETTINGS.practice,
  startingServer: 1 | 2
): { set: GameSet; winner: 1 | 2; duration: number } {
  const set: GameSet = { player1Games: 0, player2Games: 0 };
  let currentServer = startingServer;
  let duration = 0;

  while (true) {
    // ゲームをシミュレート
    const gameResult = simulateGame(player1, player2, currentServer);
    duration += gameResult.duration;

    if (gameResult.winner === 1) {
      set.player1Games++;
    } else {
      set.player2Games++;
    }

    // セット終了条件をチェック
    const p1Games = set.player1Games;
    const p2Games = set.player2Games;

    // 通常の勝利条件
    if (p1Games >= settings.gameCount && p1Games - p2Games >= 2) {
      return { set, winner: 1, duration };
    }
    if (p2Games >= settings.gameCount && p2Games - p1Games >= 2) {
      return { set, winner: 2, duration };
    }

    // タイブレーク条件
    if (p1Games === settings.tiebreakAt && p2Games === settings.tiebreakAt) {
      const tiebreakResult = simulateTiebreak(player1, player2, currentServer);
      set.tiebreak = tiebreakResult.score;
      duration += tiebreakResult.duration;
      return { set, winner: tiebreakResult.winner, duration };
    }

    // サーバー交代
    currentServer = currentServer === 1 ? 2 : 1;
  }
}

// ゲームのシミュレーション
function simulateGame(player1: Player, player2: Player, server: 1 | 2): { winner: 1 | 2; duration: number } {
  let p1Points = 0;
  let p2Points = 0;
  let duration = 5; // 平均5分/ゲーム

  while (true) {
    const pointWinner = simulatePoint(player1, player2, server);
    
    if (pointWinner === 1) {
      p1Points++;
    } else {
      p2Points++;
    }

    // ゲーム終了条件（テニスのスコアリング）
    if (p1Points >= 4 && p1Points - p2Points >= 2) {
      return { winner: 1, duration };
    }
    if (p2Points >= 4 && p2Points - p1Points >= 2) {
      return { winner: 2, duration };
    }

    duration += 0.5; // ポイントあたり30秒
  }
}

// タイブレークのシミュレーション
function simulateTiebreak(
  player1: Player, 
  player2: Player, 
  startingServer: 1 | 2
): { score: { player1Points: number; player2Points: number }; winner: 1 | 2; duration: number } {
  let p1Points = 0;
  let p2Points = 0;
  let currentServer = startingServer;
  let pointsPlayed = 0;
  let duration = 10; // 平均10分

  while (true) {
    const pointWinner = simulatePoint(player1, player2, currentServer);
    
    if (pointWinner === 1) {
      p1Points++;
    } else {
      p2Points++;
    }

    pointsPlayed++;

    // サーバー交代（最初は1ポイント、その後は2ポイントごと）
    if (pointsPlayed === 1 || pointsPlayed % 2 === 0) {
      currentServer = currentServer === 1 ? 2 : 1;
    }

    // タイブレーク終了条件
    if (p1Points >= 7 && p1Points - p2Points >= 2) {
      return { 
        score: { player1Points: p1Points, player2Points: p2Points }, 
        winner: 1, 
        duration 
      };
    }
    if (p2Points >= 7 && p2Points - p1Points >= 2) {
      return { 
        score: { player1Points: p1Points, player2Points: p2Points }, 
        winner: 2, 
        duration 
      };
    }

    duration += 0.5;
  }
}

// 試合統計の計算
export function calculateMatchStatistics(matchState: MatchState, player1: Player, player2: Player) {
  const totalGames = matchState.sets.reduce((sum, set) => 
    sum + set.player1Games + set.player2Games, 0
  );

  const player1Games = matchState.sets.reduce((sum, set) => sum + set.player1Games, 0);
  const player2Games = matchState.sets.reduce((sum, set) => sum + set.player2Games, 0);

  // 推定統計値（実際の試合では詳細に記録される）
  const estimatedAces1 = Math.floor(player1.serve_skill / 20 * matchState.totalDuration / 60);
  const estimatedAces2 = Math.floor(player2.serve_skill / 20 * matchState.totalDuration / 60);
  
  const estimatedUnforcedErrors1 = Math.floor((100 - player1.technique) / 10 * totalGames / 10);
  const estimatedUnforcedErrors2 = Math.floor((100 - player2.technique) / 10 * totalGames / 10);

  const estimatedWinners1 = Math.floor(player1.power / 15 * totalGames / 8);
  const estimatedWinners2 = Math.floor(player2.power / 15 * totalGames / 8);

  return {
    total_duration: matchState.totalDuration,
    total_games: totalGames,
    player1_stats: {
      games_won: player1Games,
      sets_won: matchState.sets.filter(set => {
        if (set.tiebreak) {
          return set.tiebreak.player1Points > set.tiebreak.player2Points;
        }
        return set.player1Games > set.player2Games;
      }).length,
      aces: estimatedAces1,
      unforced_errors: estimatedUnforcedErrors1,
      winners: estimatedWinners1
    },
    player2_stats: {
      games_won: player2Games,
      sets_won: matchState.sets.filter(set => {
        if (set.tiebreak) {
          return set.tiebreak.player2Points > set.tiebreak.player1Points;
        }
        return set.player2Games > set.player1Games;
      }).length,
      aces: estimatedAces2,
      unforced_errors: estimatedUnforcedErrors2,
      winners: estimatedWinners2
    }
  };
}

// 試合結果をデータベースに保存
export async function saveMatchResult(
  homeSchoolId: string,
  awaySchoolId: string,
  homePlayer: Player,
  awayPlayer: Player,
  matchState: MatchState,
  matchType: keyof typeof MATCH_SETTINGS
): Promise<boolean> {
  try {
    const statistics = calculateMatchStatistics(matchState, homePlayer, awayPlayer);
    const winner = matchState.winner === 1 ? homeSchoolId : awaySchoolId;
    
    // 試合ログを生成
    const matchLog: MatchLogEntry[] = [
      {
        time: '0:00',
        event: 'match_start',
        details: {
          players: [homePlayer.pokemon_name, awayPlayer.pokemon_name],
          match_type: matchType
        }
      }
    ];

    // セット結果をログに追加
    matchState.sets.forEach((set, index) => {
      const setWinner = set.player1Games > set.player2Games ? homePlayer.pokemon_name : awayPlayer.pokemon_name;
      matchLog.push({
        time: `${Math.floor(index * (matchState.totalDuration / matchState.sets.length))}:00`,
        event: 'set_complete',
        details: {
          set_number: index + 1,
          score: `${set.player1Games}-${set.player2Games}`,
          winner: setWinner,
          tiebreak: set.tiebreak ? `${set.tiebreak.player1Points}-${set.tiebreak.player2Points}` : null
        }
      });
    });

    matchLog.push({
      time: `${matchState.totalDuration}:00`,
      event: 'match_end',
      details: {
        winner: matchState.winner === 1 ? homePlayer.pokemon_name : awayPlayer.pokemon_name,
        final_score: matchState.sets.map(set => 
          set.tiebreak ? 
            `${set.player1Games}-${set.player2Games}(${set.tiebreak.player1Points}-${set.tiebreak.player2Points})` :
            `${set.player1Games}-${set.player2Games}`
        ).join(', ')
      }
    });

    // データベースに保存
    const { error } = await supabase
      .from('matches')
      .insert({
        home_school_id: homeSchoolId,
        away_school_id: awaySchoolId,
        match_type: MATCH_SETTINGS[matchType].name,
        status: 'completed',
        winner_school_id: winner,
        final_score: matchLog[matchLog.length - 1].details.final_score,
        match_log: matchLog,
        statistics: statistics,
        scheduled_at: new Date().toISOString(),
        started_at: new Date().toISOString(),
        completed_at: new Date(Date.now() + matchState.totalDuration * 60 * 1000).toISOString()
      });

    if (error) throw error;

    // 選手の統計を更新
    await updatePlayerStats(homePlayer.id, awayPlayer.id, matchState, statistics, matchType);
    
    return true;
  } catch (error) {
    console.error('Error saving match result:', error);
    return false;
  }
}

// 選手統計の更新
async function updatePlayerStats(
  player1Id: string,
  player2Id: string,
  matchState: MatchState,
  statistics: any,
  matchType: keyof typeof MATCH_SETTINGS
) {
  const settings = MATCH_SETTINGS[matchType];
  const experienceGain = Math.floor(20 * settings.experienceMultiplier);
  const fatigueGain = Math.floor(15 * settings.fatigueMultiplier);
  
  // 勝者と敗者を決定
  const winner = matchState.winner === 1 ? player1Id : player2Id;
  const loser = matchState.winner === 1 ? player2Id : player1Id;
  
  // 勝者の統計更新（簡易実装）
  const { data: winnerData } = await supabase
    .from('players')
    .select('matches_played, matches_won, sets_won, sets_lost, experience, physical_fatigue, mental_fatigue, motivation')
    .eq('id', winner)
    .single();
    
  if (winnerData) {
    await supabase
      .from('players')
      .update({
        matches_played: (winnerData.matches_played || 0) + 1,
        matches_won: (winnerData.matches_won || 0) + 1,
        sets_won: (winnerData.sets_won || 0) + (matchState.winner === 1 ? statistics.player1_stats.sets_won : statistics.player2_stats.sets_won),
        sets_lost: (winnerData.sets_lost || 0) + (matchState.winner === 1 ? statistics.player2_stats.sets_won : statistics.player1_stats.sets_won),
        experience: (winnerData.experience || 0) + experienceGain + 10, // 勝利ボーナス
        physical_fatigue: Math.min(100, (winnerData.physical_fatigue || 0) + fatigueGain),
        mental_fatigue: Math.min(100, (winnerData.mental_fatigue || 0) + Math.floor(fatigueGain * 0.8)),
        motivation: Math.min(100, (winnerData.motivation || 50) + 10) // 勝利でモチベーションアップ
      })
      .eq('id', winner);
  }

  // 敗者の統計更新と略実装）
  const { data: loserData } = await supabase
    .from('players')
    .select('matches_played, sets_won, sets_lost, experience, physical_fatigue, mental_fatigue, motivation')
    .eq('id', loser)
    .single();
    
  if (loserData) {
    await supabase
      .from('players')
      .update({
        matches_played: (loserData.matches_played || 0) + 1,
        sets_won: (loserData.sets_won || 0) + (matchState.winner === 2 ? statistics.player1_stats.sets_won : statistics.player2_stats.sets_won),
        sets_lost: (loserData.sets_lost || 0) + (matchState.winner === 2 ? statistics.player2_stats.sets_won : statistics.player1_stats.sets_won),
        experience: (loserData.experience || 0) + experienceGain,
        physical_fatigue: Math.min(100, (loserData.physical_fatigue || 0) + fatigueGain),
        mental_fatigue: Math.min(100, (loserData.mental_fatigue || 0) + fatigueGain),
        motivation: Math.max(10, (loserData.motivation || 50) - 5) // 敗北でモチベーション若干ダウン
      })
      .eq('id', loser);
  }
}