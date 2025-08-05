// =====================================================
// マップ生成システム
// 栄冠ナイン方式のマップ＆パネル生成ロジック
// =====================================================

import type { MapPanel, SeasonMap } from '@/types/card-system';
import { PANEL_TYPES } from '@/types/card-system';

export class MapGenerator {
  // 1年間の日数
  private static readonly DAYS_PER_YEAR = 365;
  
  // 固定イベントの日程 (月-日で指定)
  private static readonly FIXED_EVENTS = [
    { month: 4, day: 8, type: 'entrance_ceremony', name: '入学式' },
    { month: 4, day: 15, type: 'match', name: '春季大会予選' },
    { month: 5, day: 15, type: 'match', name: '春季大会本選' },
    { month: 6, day: 30, type: 'exam', name: '期末試験' },
    { month: 7, day: 15, type: 'match', name: '夏季大会予選' },
    { month: 8, day: 10, type: 'match', name: '夏季大会本選' },
    { month: 9, day: 1, type: 'sports_festival', name: '体育祭' },
    { month: 10, day: 15, type: 'match', name: '秋季大会予選' },
    { month: 11, day: 10, type: 'match', name: '秋季大会本選' },
    { month: 12, day: 20, type: 'exam', name: '期末試験' },
    { month: 1, day: 20, type: 'match', name: '新人戦' },
    { month: 2, day: 28, type: 'graduation', name: '卒業式' },
    { month: 3, day: 15, type: 'match', name: '春季選抜大会' }
  ];

  // 卒業した先輩キャラクター
  private static readonly GRADUATED_SENIORS = [
    { name: 'サトシ先輩', specialty: 'serve', bonus: { serve: 25, mental: 15 } },
    { name: 'ミサト先輩', specialty: 'return', bonus: { return: 25, mental: 15 } },
    { name: 'タケシ先輩', specialty: 'volley', bonus: { volley: 25, stamina: 15 } },
    { name: 'ハルカ先輩', specialty: 'stroke', bonus: { stroke: 25, mental: 15 } },
    { name: 'コウジ先輩', specialty: 'mental', bonus: { mental: 30, serve: 10, return: 10 } },
    { name: 'ユウキ先輩', specialty: 'stamina', bonus: { stamina: 30, volley: 10, stroke: 10 } }
  ];

  // マップ生成メイン関数
  static generateSeasonMap(year: number, reputation: number = 0): SeasonMap {
    const panels: MapPanel[] = [];
    const fixedEvents: SeasonMap['fixedEvents'] = [];

    // 固定イベントの配置
    this.FIXED_EVENTS.forEach(event => {
      const position = this.dateToPosition(event.month, event.day);
      
      panels.push(this.createFixedEventPanel(position, event));
      fixedEvents.push({
        position,
        type: event.type as any,
        name: event.name
      });
    });

    // ランダムパネルの配置
    this.generateRandomPanels(panels, year, reputation);

    // 空いている位置に通常パネルを配置
    this.fillEmptyPositions(panels);

    return {
      year,
      totalDays: this.DAYS_PER_YEAR,
      panels: panels.sort((a, b) => a.position - b.position),
      fixedEvents,
      randomPanelDistribution: this.getRandomDistribution(year, reputation)
    };
  }

  // 固定イベントパネル作成
  private static createFixedEventPanel(position: number, event: any): MapPanel {
    const basePanel: MapPanel = {
      id: `fixed_${position}`,
      position,
      type: event.type === 'entrance_ceremony' ? 'special_training' : 
            event.type === 'sports_festival' ? 'good_event' : 
            event.type,
      isFixed: true,
      display: {
        color: event.type === 'match' ? 'orange' : 
               event.type === 'exam' ? 'red' : 
               event.type === 'graduation' ? 'purple' : 'blue',
        icon: event.type === 'match' ? '🏆' : 
              event.type === 'exam' ? '📚' : 
              event.type === 'graduation' ? '🎓' : '⭐',
        name: event.name
      },
      effects: this.getFixedEventEffects(event.type)
    };

    // イベント内容
    if (event.type === 'match') {
      basePanel.event = {
        title: event.name,
        description: 'この試合の結果によってチームの評判が変わります',
        choices: [
          {
            text: '全力で挑む',
            effects: {
              teamEffects: { moraleChange: 10 },
              resourceChanges: { reputation: 15 }
            }
          },
          {
            text: '経験を積む',
            effects: {
              statChanges: { mental: 10 },
              teamEffects: { trustChange: 5 }
            }
          }
        ]
      };
    }

    return basePanel;
  }

  // ランダムパネル生成
  private static generateRandomPanels(panels: MapPanel[], year: number, reputation: number): void {
    const occupiedPositions = new Set(panels.map(p => p.position));
    const distribution = this.getRandomDistribution(year, reputation);
    
    // 卒業した先輩パネル (年数に応じて増加)
    const seniorPanelCount = Math.min(year * 3, 12);
    for (let i = 0; i < seniorPanelCount; i++) {
      const position = this.getRandomEmptyPosition(occupiedPositions);
      if (position !== -1) {
        panels.push(this.createSeniorPanel(position));
        occupiedPositions.add(position);
      }
    }

    // 特別訓練パネル
    const specialTrainingCount = Math.floor(reputation / 30) + 2;
    for (let i = 0; i < specialTrainingCount; i++) {
      const position = this.getRandomEmptyPosition(occupiedPositions);
      if (position !== -1) {
        panels.push(this.createSpecialTrainingPanel(position));
        occupiedPositions.add(position);      }
    }

    // 施設パネル
    const facilityPanelCount = Math.floor(reputation / 50) + 1;
    for (let i = 0; i < facilityPanelCount; i++) {
      const position = this.getRandomEmptyPosition(occupiedPositions);
      if (position !== -1) {
        panels.push(this.createFacilityPanel(position));
        occupiedPositions.add(position);
      }
    }

    // 良いイベントパネル
    const goodEventCount = Math.floor(this.DAYS_PER_YEAR * distribution.good_event / 100);
    for (let i = 0; i < goodEventCount; i++) {
      const position = this.getRandomEmptyPosition(occupiedPositions);
      if (position !== -1) {
        panels.push(this.createGoodEventPanel(position));
        occupiedPositions.add(position);
      }
    }

    // 悪いイベントパネル
    const badEventCount = Math.floor(this.DAYS_PER_YEAR * distribution.bad_event / 100);
    for (let i = 0; i < badEventCount; i++) {
      const position = this.getRandomEmptyPosition(occupiedPositions);
      if (position !== -1) {
        panels.push(this.createBadEventPanel(position));
        occupiedPositions.add(position);
      }
    }
  }

  // 卒業した先輩パネル作成
  private static createSeniorPanel(position: number): MapPanel {
    const senior = this.GRADUATED_SENIORS[Math.floor(Math.random() * this.GRADUATED_SENIORS.length)];
    
    return {
      id: `senior_${position}`,
      position,
      type: 'character',
      isFixed: false,
      display: {
        color: 'purple',
        icon: '👨‍🎓',
        name: senior.name
      },
      effects: {
        statChanges: senior.bonus,
        teamEffects: { trustChange: 10, moraleChange: 15 }
      },
      event: {
        title: `${senior.name}との遭遇`,
        description: `卒業した${senior.name}がアドバイスをくれました！`,
        choices: [
          {
            text: '熱心に聞く',
            effects: {
              statChanges: senior.bonus,
              teamEffects: { trustChange: 15 }
            }
          },
          {
            text: '軽く聞き流す',
            effects: {
              statChanges: Object.fromEntries(
                Object.entries(senior.bonus).map(([k, v]) => [k, Math.floor(v * 0.5)])
              ),
              teamEffects: { trustChange: 5 }
            }
          }
        ]
      }
    };
  }

  // 特別訓練パネル作成
  private static createSpecialTrainingPanel(position: number): MapPanel {
    const trainingTypes = [
      { name: 'サーブ特訓', stat: 'serve', bonus: 30 },
      { name: 'リターン特訓', stat: 'return', bonus: 30 },
      { name: 'ボレー特訓', stat: 'volley', bonus: 30 },
      { name: 'ストローク特訓', stat: 'stroke', bonus: 30 },
      { name: 'メンタル特訓', stat: 'mental', bonus: 25 },
      { name: 'スタミナ特訓', stat: 'stamina', bonus: 35 }
    ];
    
    const training = trainingTypes[Math.floor(Math.random() * trainingTypes.length)];
    
    return {
      id: `special_training_${position}`,
      position,
      type: 'special_training',
      isFixed: false,
      display: {
        color: 'yellow',
        icon: '⚡',
        name: training.name
      },
      effects: {
        statChanges: { [training.stat]: training.bonus },
        teamEffects: { practiceEfficiencyChange: 10 }
      },
      event: {
        title: `特別訓練: ${training.name}`,
        description: '集中的な特訓でスキルアップのチャンス！',
        choices: [
          {
            text: '全力で取り組む',
            effects: {
              statChanges: { [training.stat]: training.bonus },
              teamEffects: { practiceEfficiencyChange: 15, conditionChange: -10 }
            }
          },
          {
            text: '適度に取り組む',
            effects: {
              statChanges: { [training.stat]: Math.floor(training.bonus * 0.7) },
              teamEffects: { practiceEfficiencyChange: 8, conditionChange: -5 }
            }
          }
        ]
      }
    };
  }

  // 施設パネル作成
  private static createFacilityPanel(position: number): MapPanel {
    const facilities = [
      { name: '本屋', icon: '📚', effect: { mental: 15, funds: -5000 } },
      { name: 'スポーツ用品店', icon: '🏪', effect: { serve: 10, return: 10, funds: -8000 } },
      { name: 'レストラン', icon: '🍽️', effect: { conditionChange: 15, funds: -3000 } },
      { name: '病院', icon: '🏥', effect: { conditionChange: 30, funds: -10000 } }
    ];
    
    const facility = facilities[Math.floor(Math.random() * facilities.length)];
    
    return {
      id: `facility_${position}`,
      position,
      type: 'facility',
      isFixed: false,
      display: {
        color: 'green',
        icon: facility.icon,
        name: facility.name
      },
      effects: {
        statChanges: facility.effect.mental ? { mental: facility.effect.mental } : 
                     facility.effect.serve ? { serve: facility.effect.serve, return: facility.effect.return } : {},
        teamEffects: facility.effect.conditionChange ? { conditionChange: facility.effect.conditionChange } : {},
        resourceChanges: { funds: facility.effect.funds }
      }
    };
  }

  // 良いイベントパネル作成
  private static createGoodEventPanel(position: number): MapPanel {
    const goodEvents = [
      { name: '晴天', effect: { practiceEfficiencyChange: 10, moraleChange: 5 } },
      { name: '寄付金', effect: { funds: 15000 } },
      { name: '地域応援', effect: { reputation: 10, moraleChange: 10 } },
      { name: '新入部員', effect: { trustChange: 5, moraleChange: 5 } },
      { name: 'メディア取材', effect: { reputation: 20, moraleChange: 15 } }
    ];
    
    const event = goodEvents[Math.floor(Math.random() * goodEvents.length)];
    
    return {
      id: `good_event_${position}`,
      position,
      type: 'good_event',
      isFixed: false,
      display: {
        color: 'blue',
        icon: '✨',
        name: event.name
      },
      effects: {
        teamEffects: {
          practiceEfficiencyChange: event.effect.practiceEfficiencyChange,
          moraleChange: event.effect.moraleChange,
          trustChange: event.effect.trustChange
        },
        resourceChanges: {
          funds: event.effect.funds,
          reputation: event.effect.reputation
        }
      }
    };
  }

  // 悪いイベントパネル作成
  private static createBadEventPanel(position: number): MapPanel {
    const badEvents = [
      { name: '雨天中止', effect: { practiceEfficiencyChange: -15, conditionChange: -5 } },
      { name: '設備故障', effect: { funds: -20000, practiceEfficiencyChange: -10 } },
      { name: '食中毒', effect: { conditionChange: -25, practiceEfficiencyChange: -20 } },
      { name: 'ケガ人発生', effect: { conditionChange: -15, moraleChange: -10 } },
      { name: 'スキャンダル', effect: { reputation: -15, moraleChange: -15 } }
    ];
    
    const event = badEvents[Math.floor(Math.random() * badEvents.length)];
    
    return {
      id: `bad_event_${position}`,
      position,
      type: 'bad_event',
      isFixed: false,
      display: {
        color: 'red',
        icon: '💥',
        name: event.name
      },
      effects: {
        teamEffects: {
          practiceEfficiencyChange: event.effect.practiceEfficiencyChange,
          conditionChange: event.effect.conditionChange,
          moraleChange: event.effect.moraleChange
        },
        resourceChanges: {
          funds: event.effect.funds,
          reputation: event.effect.reputation
        }
      }
    };
  }

  // ヘルパー関数群
  private static dateToPosition(month: number, day: number): number {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let position = 0;
    
    for (let i = 0; i < month - 1; i++) {
      position += daysInMonth[i];
    }
    
    return position + day - 1;
  }

  private static getRandomEmptyPosition(occupiedPositions: Set<number>): number {
    for (let attempts = 0; attempts < 100; attempts++) {
      const position = Math.floor(Math.random() * this.DAYS_PER_YEAR);
      if (!occupiedPositions.has(position)) {
        return position;
      }
    }
    return -1;
  }

  private static fillEmptyPositions(panels: MapPanel[]): void {
    const occupiedPositions = new Set(panels.map(p => p.position));
    
    for (let position = 0; position < this.DAYS_PER_YEAR; position++) {
      if (!occupiedPositions.has(position)) {
        panels.push({
          id: `normal_${position}`,
          position,
          type: 'normal',
          isFixed: false,
          display: {
            color: 'white',
            icon: '⭕',
            name: '通常日'
          },
          effects: {}
        });
      }
    }
  }

  private static getRandomDistribution(year: number, reputation: number) {
    return {
      good_event: Math.min(15 + Math.floor(reputation / 20), 25),
      bad_event: Math.max(10 - Math.floor(reputation / 30), 5),
      normal: 60,
      special_training: Math.min(5 + Math.floor(reputation / 40), 10),
      character: Math.min(3 + year, 8)
    };
  }

  private static getFixedEventEffects(eventType: string) {
    switch (eventType) {
      case 'match':
        return {
          specialEffects: { forceStop: true },
          teamEffects: { moraleChange: 10 }
        };
      case 'exam':
        return {
          specialEffects: { forceStop: true },
          statChanges: { mental: 15 }
        };
      case 'graduation':
        return {
          specialEffects: { forceStop: true, cardDraw: 2 },
          teamEffects: { trustChange: 20 }
        };
      default:
        return {};
    }
  }
}