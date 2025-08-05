import { supabase } from '@/lib/supabase';
import type { Player, School } from '@/types/game';

// 年度進行の設定
export const YEAR_SETTINGS = {
  totalYears: 3,
  monthsPerYear: 12,
  startMonth: 4, // 4月開始
  endMonth: 3,   // 3月終了
  graduationMonth: 3, // 3月卒業
  newStudentMonth: 4, // 4月入学
  summerTournament: 8, // 8月
  autumnTournament: 10, // 10月
  springTournament: 3, // 3月
  maxPlayersPerGrade: 10,
  minPlayersTotal: 5
};

// 月ごとのイベントタイプ
export const MONTHLY_EVENTS = {
  4: ['new_students', 'spring_training', 'practice_matches'],
  5: ['intensive_training', 'practice_matches', 'facility_maintenance'],
  6: ['practice_matches', 'conditioning', 'equipment_upgrade'],
  7: ['summer_preparation', 'training_camp', 'practice_matches'],
  8: ['summer_tournament', 'major_matches', 'scouting'],
  9: ['recovery', 'new_training_methods', 'practice_matches'],
  10: ['autumn_tournament', 'major_matches', 'player_development'],
  11: ['intensive_training', 'team_building', 'practice_matches'],
  12: ['winter_training', 'indoor_practice', 'year_end_review'],
  1: ['new_year_training', 'goal_setting', 'practice_matches'],
  2: ['final_preparation', 'conditioning', 'practice_matches'],
  3: ['spring_tournament', 'graduation', 'season_review']
};

// 学年進行イベント
export interface YearProgressionEvent {
  id: string;
  type: 'graduation' | 'promotion' | 'new_students' | 'tournament' | 'special';
  title: string;
  description: string;
  month: number;
  year: number;
  effects: {
    playerChanges?: Array<{
      playerId: string;
      changes: Partial<Player>;
    }>;
    schoolChanges?: Partial<School>;
    newPlayers?: Omit<Player, 'id' | 'created_at' | 'updated_at'>[];
    removePlayers?: string[];
    specialEffects?: string[];
  };
  isAutomatic: boolean;
  priority: 'high' | 'medium' | 'low';
}

// 卒業システム
export async function processGraduation(schoolId: string, currentYear: number): Promise<YearProgressionEvent | null> {
  try {
    // 3年生を取得
    const { data: graduatingPlayers, error } = await supabase
      .from('players')
      .select('*')
      .eq('school_id', schoolId)
      .eq('grade', 3);

    if (error) throw error;

    if (!graduatingPlayers || graduatingPlayers.length === 0) {
      return null;
    }

    // 卒業イベントを作成
    const graduationEvent: YearProgressionEvent = {
      id: `graduation-${currentYear}`,
      type: 'graduation',
      title: '卒業式',
      description: `${graduatingPlayers.length}名の3年生が卒業しました。彼らの功績は学校の歴史に刻まれるでしょう。`,
      month: 3,
      year: currentYear,
      effects: {
        removePlayers: graduatingPlayers.map(p => p.id),
        specialEffects: [
          '卒業生からの激励メッセージ',
          '伝統の継承',
          `卒業記念品として学校に${graduatingPlayers.length * 10000}円の寄付`
        ],
        schoolChanges: {
          funds: graduatingPlayers.length * 10000
        }
      },
      isAutomatic: true,
      priority: 'high'
    };

    return graduationEvent;
  } catch (error) {
    console.error('Error processing graduation:', error);
    return null;
  }
}

// 進級システム
export async function processPromotion(schoolId: string, currentYear: number): Promise<YearProgressionEvent | null> {
  try {
    // 1・2年生を取得
    const { data: players, error } = await supabase
      .from('players')
      .select('*')
      .eq('school_id', schoolId)
      .in('grade', [1, 2]);

    if (error) throw error;

    if (!players || players.length === 0) {
      return null;
    }

    // 進級処理
    const promotionChanges = players.map(player => ({
      playerId: player.id,
      changes: {
        grade: (player.grade + 1) as 1 | 2 | 3,
        // 進級で少し能力向上
        experience: player.experience + 25,
        motivation: Math.min(100, player.motivation + 10)
      }
    }));

    const promotionEvent: YearProgressionEvent = {
      id: `promotion-${currentYear}`,
      type: 'promotion',
      title: '進級',
      description: `新学年が始まりました。${players.length}名のプレイヤーが進級し、新たな目標に向かって歩み始めます。`,
      month: 4,
      year: currentYear + 1,
      effects: {
        playerChanges: promotionChanges,
        specialEffects: [
          '新学年への決意',
          '経験値ボーナス獲得',
          'モチベーション向上'
        ]
      },
      isAutomatic: true,
      priority: 'high'
    };

    return promotionEvent;
  } catch (error) {
    console.error('Error processing promotion:', error);
    return null;
  }
}

// 新入生システム
export async function generateNewStudents(schoolId: string, currentYear: number, reputation: number): Promise<YearProgressionEvent | null> {
  try {
    // 現在のプレイヤー数をチェック
    const { data: currentPlayers, error } = await supabase
      .from('players')
      .select('id, grade')
      .eq('school_id', schoolId);

    if (error) throw error;

    const currentCount = currentPlayers?.length || 0;
    const firstYearCount = currentPlayers?.filter(p => p.grade === 1).length || 0;

    // 新入生の数を決定（評判に基づく）
    let newStudentCount = 0;
    if (reputation >= 80) {
      newStudentCount = Math.floor(Math.random() * 4) + 3; // 3-6名
    } else if (reputation >= 60) {
      newStudentCount = Math.floor(Math.random() * 3) + 2; // 2-4名
    } else if (reputation >= 40) {
      newStudentCount = Math.floor(Math.random() * 2) + 1; // 1-2名
    } else {
      newStudentCount = Math.floor(Math.random() * 2); // 0-1名
    }

    // 最大人数制限
    const maxNewStudents = Math.max(0, YEAR_SETTINGS.maxPlayersPerGrade - firstYearCount);
    newStudentCount = Math.min(newStudentCount, maxNewStudents);

    if (newStudentCount === 0) {
      return {
        id: `new-students-${currentYear}`,
        type: 'new_students',
        title: '新学期開始',
        description: '今年は新入部員がいませんでした。部の魅力を高めて、来年はより多くの新入生を迎えましょう。',
        month: 4,
        year: currentYear,
        effects: {
          specialEffects: ['部員勧誘の必要性を痛感']
        },
        isAutomatic: true,
        priority: 'medium'
      };
    }

    // 新入生の質も評判に基づいて決定
    const { generatePlayer } = await import('@/lib/player-generator');
    const newPlayers = [];

    for (let i = 0; i < newStudentCount; i++) {
      // 評判が高いほど優秀な新入生が入る確率が上がる
      let rarityBonus = 0;
      if (reputation >= 80) rarityBonus = 0.3;
      else if (reputation >= 60) rarityBonus = 0.2;
      else if (reputation >= 40) rarityBonus = 0.1;

      const player = await generatePlayer(schoolId, 1, 'member');
      
      // 評判ボーナスを適用
      if (Math.random() < rarityBonus) {
        Object.keys(player).forEach(key => {
          if (['power', 'technique', 'speed', 'stamina', 'mental'].includes(key)) {
            (player as any)[key] = Math.min(100, (player as any)[key] + Math.floor(Math.random() * 10) + 5);
          }
        });
      }

      newPlayers.push(player);
    }

    const newStudentEvent: YearProgressionEvent = {
      id: `new-students-${currentYear}`,
      type: 'new_students',
      title: '新入部員加入',
      description: `${newStudentCount}名の新入部員が加入しました！彼らと共に新たな季節を戦い抜きましょう。`,
      month: 4,
      year: currentYear,
      effects: {
        newPlayers,
        specialEffects: [
          '新たな才能の発見',
          'チーム活性化',
          '後輩指導の責任感向上'
        ]
      },
      isAutomatic: true,
      priority: 'high'
    };

    return newStudentEvent;
  } catch (error) {
    console.error('Error generating new students:', error);
    return null;
  }
}

// 大会システム
export async function generateTournamentEvent(
  schoolId: string, 
  currentYear: number, 
  month: number, 
  reputation: number
): Promise<YearProgressionEvent | null> {
  const tournaments = {
    8: {
      name: '夏の大会',
      description: '暑い夏に開催される地区大会。多くの強豪校が参加します。',
      difficulty: 'high',
      rewards: { reputation: 30, funds: 50000, experience: 100 }
    },
    10: {
      name: '秋季大会',
      description: '新チーム初の公式戦。実力を試す絶好の機会です。',
      difficulty: 'medium',
      rewards: { reputation: 20, funds: 30000, experience: 75 }
    },
    3: {
      name: '春季大会',
      description: '卒業を控えた3年生にとって最後の大会かもしれません。',
      difficulty: 'high',
      rewards: { reputation: 25, funds: 40000, experience: 90 }
    }
  };

  const tournament = tournaments[month as keyof typeof tournaments];
  if (!tournament) return null;

  return {
    id: `tournament-${month}-${currentYear}`,
    type: 'tournament',
    title: tournament.name,
    description: tournament.description,
    month,
    year: currentYear,
    effects: {
      specialEffects: [
        '大会参加権獲得',
        '他校との交流機会',
        '選手のモチベーション向上'
      ]
    },
    isAutomatic: false,
    priority: 'high'
  };
}

// 特別イベント生成
export async function generateSpecialEvent(
  schoolId: string,
  currentYear: number,
  month: number,
  reputation: number,
  funds: number
): Promise<YearProgressionEvent | null> {
  const specialEvents = [
    {
      id: 'facility-upgrade',
      title: '施設改修の機会',
      description: 'OBからの寄付により、コートの改修が可能になりました。',
      condition: () => funds >= 100000,
      effects: {
        schoolChanges: { funds: -100000 },
        specialEffects: ['コート品質向上', '練習効率20%アップ', '選手モチベーション向上']
      }
    },
    {
      id: 'media-attention',
      title: 'メディア取材',
      description: '地元テレビ局がチームを取材したいと申し出ています。',
      condition: () => reputation >= 70,
      effects: {
        schoolChanges: { reputation: 15 },
        specialEffects: ['知名度大幅アップ', '新入生獲得率向上', 'スポンサー関心増加']
      }
    },
    {
      id: 'rival-school-challenge',
      title: 'ライバル校からの挑戦',
      description: '強豪校から練習試合の申し込みがありました。',
      condition: () => reputation >= 50,
      effects: {
        specialEffects: ['実力試しの機会', '選手成長の契機', 'チーム結束力向上']
      }
    },
    {
      id: 'equipment-donation',
      title: '機材寄付',
      description: '地域の企業から練習機材の寄付を受けました。',
      condition: () => true,
      effects: {
        specialEffects: ['練習環境改善', '選手満足度向上', '地域との絆深化']
      }
    },
    {
      id: 'injury-crisis',
      title: '怪我人続出',
      description: '練習中の事故で複数の選手が怪我をしてしまいました。',
      condition: () => Math.random() < 0.1, // 10%の確率
      effects: {
        specialEffects: ['選手コンディション悪化', '安全管理の重要性再認識', '結束力向上']
      }
    }
  ];

  // 条件を満たすイベントをフィルタリング
  const availableEvents = specialEvents.filter(event => event.condition());
  
  if (availableEvents.length === 0 || Math.random() < 0.7) {
    return null; // 70%の確率でイベントなし
  }

  const selectedEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];

  return {
    id: `special-${selectedEvent.id}-${currentYear}-${month}`,
    type: 'special',
    title: selectedEvent.title,
    description: selectedEvent.description,
    month,
    year: currentYear,
    effects: selectedEvent.effects,
    isAutomatic: false,
    priority: 'medium'
  };
}

// 年度進行のメイン処理
export async function processMonthlyProgression(
  schoolId: string,
  currentYear: number,
  currentMonth: number,
  reputation: number,
  funds: number
): Promise<YearProgressionEvent[]> {
  const events: YearProgressionEvent[] = [];

  try {
    // 3月の処理（卒業）
    if (currentMonth === 3) {
      const graduationEvent = await processGraduation(schoolId, currentYear);
      if (graduationEvent) events.push(graduationEvent);
    }

    // 4月の処理（進級・新入生）
    if (currentMonth === 4) {
      const promotionEvent = await processPromotion(schoolId, currentYear);
      if (promotionEvent) events.push(promotionEvent);

      const newStudentEvent = await generateNewStudents(schoolId, currentYear, reputation);
      if (newStudentEvent) events.push(newStudentEvent);
    }

    // 大会月の処理
    if ([8, 10, 3].includes(currentMonth)) {
      const tournamentEvent = await generateTournamentEvent(schoolId, currentYear, currentMonth, reputation);
      if (tournamentEvent) events.push(tournamentEvent);
    }

    // 特別イベントの処理
    const specialEvent = await generateSpecialEvent(schoolId, currentYear, currentMonth, reputation, funds);
    if (specialEvent) events.push(specialEvent);

    // イベントを優先度順にソート
    events.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    return events;
  } catch (error) {
    console.error('Error processing monthly progression:', error);
    return [];
  }
}

// イベント実行
export async function executeYearProgressionEvent(event: YearProgressionEvent): Promise<boolean> {
  try {
    const { effects } = event;

    // プレイヤーの変更を適用
    if (effects.playerChanges) {
      for (const change of effects.playerChanges) {
        await supabase
          .from('players')
          .update(change.changes)
          .eq('id', change.playerId);
      }
    }

    // プレイヤーの削除（卒業など）
    if (effects.removePlayers) {
      await supabase
        .from('players')
        .delete()
        .in('id', effects.removePlayers);
    }

    // 新しいプレイヤーの追加
    if (effects.newPlayers && effects.newPlayers.length > 0) {
      await supabase
        .from('players')
        .insert(effects.newPlayers);
    }

    // 学校の変更を適用
    if (effects.schoolChanges) {
      // 学校IDから学校情報を取得
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .select('*')
        .eq('id', event.id.includes('graduation') ? event.id.split('-')[1] : '')
        .single();

      if (!schoolError && school) {
        const updates: any = {};
        
        if (effects.schoolChanges.funds !== undefined) {
          updates.funds = (school.funds || 0) + effects.schoolChanges.funds;
        }
        if (effects.schoolChanges.reputation !== undefined) {
          updates.reputation = Math.max(0, Math.min(100, 
            (school.reputation || 0) + effects.schoolChanges.reputation
          ));
        }

        if (Object.keys(updates).length > 0) {
          await supabase
            .from('schools')
            .update(updates)
            .eq('id', school.id);
        }
      }
    }

    // イベント履歴に記録
    await supabase
      .from('event_history')
      .insert({
        school_id: event.id.split('-').pop(), // 簡略化
        event_date: new Date().toISOString().split('T')[0],
        event_position: 0,
        event_type: event.type,
        event_title: event.title,
        event_description: event.description,
        effects: effects,
        affected_players: []
      });

    return true;
  } catch (error) {
    console.error('Error executing year progression event:', error);
    return false;
  }
}

// 年度終了チェック
export function checkYearEnd(currentMonth: number): boolean {
  return currentMonth === 3;
}

// 全ての年度終了チェック
export function checkGameEnd(currentYear: number): boolean {
  return currentYear > YEAR_SETTINGS.totalYears;
}

// 次の月を計算
export function getNextMonth(currentMonth: number, currentYear: number): { month: number; year: number } {
  if (currentMonth === 12) {
    return { month: 1, year: currentYear + 1 };
  } else if (currentMonth === 3) {
    return { month: 4, year: currentYear + 1 };
  } else {
    return { month: currentMonth + 1, year: currentYear };
  }
}

// 年度進行の統計
export async function getYearProgressionStats(schoolId: string) {
  try {
    const { data: events, error } = await supabase
      .from('event_history')
      .select('*')
      .eq('school_id', schoolId)
      .in('event_type', ['graduation', 'promotion', 'new_students', 'tournament', 'special'])
      .order('created_at', { ascending: false });

    if (error) throw error;

    const stats = {
      totalEvents: events?.length || 0,
      graduationEvents: events?.filter(e => e.event_type === 'graduation').length || 0,
      tournamentEvents: events?.filter(e => e.event_type === 'tournament').length || 0,
      specialEvents: events?.filter(e => e.event_type === 'special').length || 0,
      newStudentEvents: events?.filter(e => e.event_type === 'new_students').length || 0,
      recentEvents: events?.slice(0, 5) || []
    };

    return stats;
  } catch (error) {
    console.error('Error getting year progression stats:', error);
    return {
      totalEvents: 0,
      graduationEvents: 0,
      tournamentEvents: 0,
      specialEvents: 0,
      newStudentEvents: 0,
      recentEvents: []
    };
  }
}