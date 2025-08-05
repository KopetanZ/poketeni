import { EventResult } from '@/components/game/EventModal';

// サンプルポケモンデータ
const samplePokemon = [
  { id: 25, name: 'ピカチュウ', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png' },
  { id: 1, name: 'フシギダネ', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png' },
  { id: 4, name: 'ヒトカゲ', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png' },
  { id: 7, name: 'ゼニガメ', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png' },
  { id: 133, name: 'イーブイ', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png' },
];

// 練習イベント生成
export function generateTrainingEvent(): EventResult {
  const trainingTypes = [
    {
      title: '基礎フットワーク',
      description: 'コートでのフットワークを重点的に練習しました',
      mainStat: 'speed',
      effects: { speed: 3, stamina: 2, technique: 1 }
    },
    {
      title: 'サーブ練習',
      description: 'サーブの威力とコントロールを強化しました',
      mainStat: 'power',
      effects: { power: 4, technique: 2, mental: 1 }
    },
    {
      title: 'ボレー練習',
      description: 'ネット前でのボレー技術を磨きました',
      mainStat: 'technique',
      effects: { technique: 4, speed: 1, mental: 1 }
    },
    {
      title: 'ストローク練習',
      description: 'ベースラインからのストロークを集中練習しました',
      mainStat: 'technique',
      effects: { technique: 3, power: 2, stamina: 1 }
    },
    {
      title: 'メンタルトレーニング',
      description: '集中力と精神力を鍛えました',
      mainStat: 'mental',
      effects: { mental: 4, technique: 1 }
    }
  ];

  const training = trainingTypes[Math.floor(Math.random() * trainingTypes.length)];
  
  // ランダムに1-3匹のポケモンが参加
  const participantCount = Math.floor(Math.random() * 3) + 1;
  const participants = [...samplePokemon]
    .sort(() => Math.random() - 0.5)
    .slice(0, participantCount);

  return {
    type: 'training',
    title: training.title,
    description: training.description,
    effects: {
      statChanges: Object.fromEntries(
        Object.entries(training.effects).filter(([_, value]) => value !== undefined)
      ) as Record<string, number>,
      fatigueChange: Math.floor(Math.random() * 10) + 5,
      motivationChange: Math.floor(Math.random() * 3) + 1
    },
    pokemonAffected: participants
  };
}

// 休息イベント生成
export function generateRestEvent(): EventResult {
  const restTypes = [
    {
      title: 'ゆっくり休息',
      description: '部室でのんびりと休憩しました',
      effects: { fatigue: -15, motivation: 3 }
    },
    {
      title: 'マッサージ',
      description: '疲れた筋肉をほぐしました',
      effects: { fatigue: -20, motivation: 2 }
    },
    {
      title: '温泉旅行',
      description: 'みんなで温泉に行って疲れを癒しました',
      effects: { fatigue: -25, motivation: 5 },
      special: ['チーム結束力アップ']
    },
    {
      title: '栄養補給',
      description: '栄養価の高い食事でエネルギーチャージ',
      effects: { fatigue: -10, motivation: 4 },
      special: ['次の練習効果20%アップ']
    }
  ];

  const rest = restTypes[Math.floor(Math.random() * restTypes.length)];
  
  // 全員が参加
  const participants = [...samplePokemon];

  return {
    type: 'rest',
    title: rest.title,
    description: rest.description,
    effects: {
      fatigueChange: rest.effects.fatigue || 0,
      motivationChange: rest.effects.motivation || 0,
      specialEffects: rest.special
    },
    pokemonAffected: participants
  };
}

// ランダムイベント生成
export function generateRandomEvent(): EventResult {
  const randomEvents = [
    {
      title: '特別コーチ来訪',
      description: '元プロ選手がコーチとして指導してくれました！',
      effects: { 
        statChanges: { technique: 5, mental: 3 },
        motivationChange: 8,
        specialEffects: ['特別技習得のチャンス']
      }
    },
    {
      title: '野生ポケモン乱入',
      description: '野生のポケモンがコートに現れ、一緒に練習しました',
      effects: {
        statChanges: { speed: 3, power: 2 },
        motivationChange: 5,
        specialEffects: ['新しい仲間が増えるかも？']
      }
    },
    {
      title: '機材故障',
      description: '練習機材が故障してしまいました...',
      effects: {
        motivationChange: -3,
        fatigueChange: -5,
        specialEffects: ['次回練習まで修理中']
      }
    },
    {
      title: '地域テレビ取材',
      description: 'テレビ局の取材を受けました！',
      effects: {
        motivationChange: 10,
        specialEffects: ['学校の知名度アップ', 'スカウトの注目度アップ']
      }
    },
    {
      title: '伝説のラケット発見',
      description: '倉庫で古いラケットを発見しました',
      effects: {
        statChanges: { power: 2, technique: 4 },
        specialEffects: ['特別装備「伝説のラケット」を入手']
      }
    },
    {
      title: '新入部員候補',
      description: '強そうなポケモンが部活見学に来ました',
      effects: {
        motivationChange: 6,
        specialEffects: ['新入部員獲得のチャンス']
      }
    }
  ];

  const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
  
  // イベントによって影響を受けるポケモンを決定
  let participants;
  if (event.title.includes('全員') || event.title.includes('チーム')) {
    participants = [...samplePokemon];
  } else {
    const participantCount = Math.floor(Math.random() * 2) + 1;
    participants = [...samplePokemon]
      .sort(() => Math.random() - 0.5)
      .slice(0, participantCount);
  }

  const cleanEffects: any = {};
  
  if (event.effects.statChanges) {
    cleanEffects.statChanges = Object.fromEntries(
      Object.entries(event.effects.statChanges).filter(([_, value]) => value !== undefined)
    );
  }
  
  if (event.effects.fatigueChange !== undefined) {
    cleanEffects.fatigueChange = event.effects.fatigueChange;
  }
  
  if (event.effects.motivationChange !== undefined) {
    cleanEffects.motivationChange = event.effects.motivationChange;
  }
  
  if (event.effects.specialEffects) {
    cleanEffects.specialEffects = event.effects.specialEffects;
  }

  return {
    type: 'event',
    title: event.title,
    description: event.description,
    effects: cleanEffects,
    pokemonAffected: participants
  };
}

// 試合イベント生成
export function generateMatchEvent(): EventResult {
  const opponents = [
    '青空高校', '緑風学園', '紅葉中学', '白雲高校', 
    '山桜学院', '海風高校', '森の学園', '太陽中学'
  ];
  
  const opponent = opponents[Math.floor(Math.random() * opponents.length)];
  const isWin = Math.random() > 0.3; // 70%の勝率
  
  if (isWin) {
    return {
      type: 'match',
      title: `練習試合勝利！`,
      description: `${opponent}との練習試合に勝利しました！`,
      effects: {
        statChanges: { 
          technique: 2, 
          mental: 4, 
          power: 1 
        },
        motivationChange: 8,
        fatigueChange: 12,
        specialEffects: ['経験値大幅アップ', 'チーム士気向上']
      },
      pokemonAffected: [...samplePokemon]
    };
  } else {
    return {
      type: 'match',
      title: '練習試合敗北...',
      description: `${opponent}との練習試合に敗北しました`,
      effects: {
        statChanges: { 
          mental: 1,
          technique: 1
        },
        motivationChange: -2,
        fatigueChange: 8,
        specialEffects: ['悔しさをバネに成長', '次回練習効果アップ']
      },
      pokemonAffected: [...samplePokemon]
    };
  }
}

// 特殊イベント生成
export function generateSpecialEvent(): EventResult {
  const specialEvents = [
    {
      title: '進化のとき！',
      description: 'ポケモンが進化しようとしています！',
      effects: {
        statChanges: { power: 10, technique: 8, speed: 6, stamina: 8, mental: 7 },
        motivationChange: 15,
        specialEffects: ['進化完了！', '全能力大幅アップ']
      }
    },
    {
      title: '秘密の特訓',
      description: '深夜にこっそり特訓していました',
      effects: {
        statChanges: { technique: 6, mental: 4 },
        motivationChange: 3,
        fatigueChange: 15,
        specialEffects: ['隠し技習得', '集中力向上']
      }
    }
  ];

  const event = specialEvents[Math.floor(Math.random() * specialEvents.length)];
  
  // 特殊イベントは通常1匹のポケモンに影響
  const participant = samplePokemon[Math.floor(Math.random() * samplePokemon.length)];

  const cleanEffects: any = {};
  
  if (event.effects.statChanges) {
    cleanEffects.statChanges = Object.fromEntries(
      Object.entries(event.effects.statChanges).filter(([_, value]) => value !== undefined)
    );
  }
  
  if (event.effects.fatigueChange !== undefined) {
    cleanEffects.fatigueChange = event.effects.fatigueChange;
  }
  
  if (event.effects.motivationChange !== undefined) {
    cleanEffects.motivationChange = event.effects.motivationChange;
  }
  
  if (event.effects.specialEffects) {
    cleanEffects.specialEffects = event.effects.specialEffects;
  }

  return {
    type: 'special',
    title: event.title,
    description: event.description,
    effects: cleanEffects,
    pokemonAffected: [participant]
  };
}

// マス目タイプに応じてイベントを生成
export function generateEventForCell(cellType: string): EventResult {
  switch (cellType) {
    case 'training':
      return generateTrainingEvent();
    case 'rest':
      return generateRestEvent();
    case 'event':
      return generateRandomEvent();
    case 'match':
      return generateMatchEvent();
    case 'special':
      return generateSpecialEvent();
    default:
      return generateRandomEvent();
  }
}