import { supabase } from '@/lib/supabase';
import { 
  fetchPokemonData, 
  fetchPokemonSpecies, 
  getStarterPokemonIds, 
  getRandomPokemonId, 
  POPULAR_POKEMON_IDS,
  getTypeStatTendencies,
  getJapaneseName
} from '@/lib/pokemon-api';
import type { Player, PokemonType, PlayerPosition, PokemonNature, PokemonAbility } from '@/types/game';

// ポケモンの性格データ
const POKEMON_NATURES: PokemonNature[] = [
  { name: 'がんばりや', description: '何事にも一生懸命取り組む' },
  { name: 'さみしがり', boost: 'power', reduce: 'technique', description: 'パワーは高いが技術面に不安' },
  { name: 'ゆうかん', boost: 'power', reduce: 'speed', description: 'パワフルだが動きが重い' },
  { name: 'いじっぱり', boost: 'power', reduce: 'mental', description: 'パワー重視で頭を使うのが苦手' },
  { name: 'やんちゃ', boost: 'power', reduce: 'stamina', description: 'パワーはあるがスタミナに不安' },
  { name: 'ずぶとい', boost: 'technique', reduce: 'power', description: '技術派だがパワー不足' },
  { name: 'すなお', description: 'バランスの取れた性格' },
  { name: 'のんき', boost: 'technique', reduce: 'speed', description: '技術は高いが動きが遅い' },
  { name: 'わんぱく', boost: 'stamina', reduce: 'mental', description: 'スタミナはあるが考えるのが苦手' },
  { name: 'のうてんき', boost: 'stamina', reduce: 'technique', description: 'タフだが技術が雑' },
  { name: 'おくびょう', boost: 'speed', reduce: 'power', description: '素早いがパワー不足' },
  { name: 'せっかち', boost: 'speed', reduce: 'technique', description: '素早いが技術が雑' },
  { name: 'まじめ', description: '真面目で努力家' },
  { name: 'ようき', boost: 'speed', reduce: 'mental', description: '素早いが集中力に欠ける' },
  { name: 'むじゃき', boost: 'speed', reduce: 'stamina', description: '素早いがスタミナ不足' },
  { name: 'ひかえめ', boost: 'mental', reduce: 'power', description: '頭脳派だがパワー不足' },
  { name: 'おっとり', boost: 'mental', reduce: 'technique', description: '頭は良いが技術が雑' },
  { name: 'れいせい', boost: 'mental', reduce: 'speed', description: '冷静だが動きが重い' },
  { name: 'てれや', boost: 'mental', reduce: 'stamina', description: '頭脳派だがスタミナ不足' },
  { name: 'きまぐれ', description: '気分屋で能力にムラがある' }
];

// 基本的な特性データ
const POKEMON_ABILITIES: PokemonAbility[] = [
  { name: '根性', description: 'ピンチになると力を発揮する', effects: { critical_boost: 1.2 } },
  { name: '集中力', description: '重要な場面で集中力を発揮', effects: { pressure_resistance: 1.3 } },
  { name: '持久力', description: 'スタミナの消耗が少ない', effects: { stamina_efficiency: 1.2 } },
  { name: '天才肌', description: '技術の習得が早い', effects: { technique_growth: 1.3 } },
  { name: '負けず嫌い', description: '劣勢でも諦めない', effects: { comeback_bonus: 1.4 } },
  { name: 'リーダーシップ', description: 'チーム全体を引っ張る', effects: { team_boost: 1.1 } },
  { name: '冷静沈着', description: 'プレッシャーに強い', effects: { mental_stability: 1.2 } },
  { name: '瞬発力', description: '短時間で最大パフォーマンス', effects: { speed_burst: 1.3 } },
  { name: '技巧派', description: 'テクニカルなプレーが得意', effects: { technique_boost: 1.2 } },
  { name: 'パワーヒッター', description: 'パワフルなショットが得意', effects: { power_boost: 1.2 } }
];

// 学年と経験値の関係
const GRADE_EXP_BASE = {
  1: 0,    // 1年生は新入生
  2: 150,  // 2年生は1年の経験あり
  3: 350   // 3年生は2年の経験あり
};

// 個体値生成（0-31、高めに偏らせる）
function generateIV(): number {
  // 平均20程度になるような分布
  const base = Math.floor(Math.random() * 16) + 12; // 12-27
  const bonus = Math.random() < 0.3 ? Math.floor(Math.random() * 5) : 0; // 30%で追加ボーナス
  return Math.min(31, base + bonus);
}

// レアリティに基づく基本能力値生成
function generateBaseStat(baseValue: number, typeModifier: number, rarity: 'common' | 'rare' | 'legendary'): number {
  const rarityModifier = {
    common: 1.0,
    rare: 1.2,
    legendary: 1.4
  };
  
  const modified = baseValue * typeModifier * rarityModifier[rarity];
  const randomVariation = 0.9 + (Math.random() * 0.2); // ±10%の変動
  
  return Math.min(100, Math.max(10, Math.floor(modified * randomVariation)));
}

// 特殊技生成
function generateSpecialMoves(pokemonId: number, types: PokemonType[]): any[] {
  const movePool = [
    { name: 'パワーサーブ', type: types[0], category: 'serve', power: 85, accuracy: 90 },
    { name: 'スピンストローク', type: types[0], category: 'stroke', power: 70, accuracy: 95 },
    { name: 'ドロップボレー', type: types[0], category: 'volley', power: 60, accuracy: 100 },
    { name: 'カウンターアタック', type: types[0], category: 'return', power: 80, accuracy: 85 },
    { name: '必殺サーブ', type: types[0], category: 'special', power: 120, accuracy: 70 }
  ];
  
  // ランダムに1-3個の技を選択
  const moveCount = Math.floor(Math.random() * 3) + 1;
  return movePool.sort(() => Math.random() - 0.5).slice(0, moveCount);
}

// ポケモンのレアリティ判定
function getPokemonRarity(pokemonId: number): 'common' | 'rare' | 'legendary' {
  if (pokemonId >= 144 && pokemonId <= 151) return 'legendary'; // 伝説ポケモン
  if (pokemonId >= 243 && pokemonId <= 251) return 'legendary'; // 第2世代伝説
  if (pokemonId >= 377 && pokemonId <= 386) return 'legendary'; // 第3世代伝説
  if (pokemonId >= 480 && pokemonId <= 493) return 'legendary'; // 第4世代伝説
  if (POPULAR_POKEMON_IDS.includes(pokemonId)) return 'rare';
  return 'common';
}

// 単一プレイヤー生成
export async function generatePlayer(
  schoolId: string, 
  grade: 1 | 2 | 3, 
  position: PlayerPosition,
  pokemonId?: number
): Promise<Omit<Player, 'id' | 'created_at' | 'updated_at'>> {
  try {
    // ポケモンID決定
    const finalPokemonId = pokemonId || getRandomPokemonId();
    
    // PokeAPIからデータ取得
    const [pokemonData, speciesData] = await Promise.all([
      fetchPokemonData(finalPokemonId),
      fetchPokemonSpecies(finalPokemonId)
    ]);
    
    // 基本情報
    const pokemonName = getJapaneseName(speciesData.names);
    const types = pokemonData.types.map(t => t.type.name as PokemonType);
    const typeModifiers = getTypeStatTendencies(types);
    const rarity = getPokemonRarity(finalPokemonId);
    
    // 個体値生成
    const ivs = {
      power: generateIV(),
      technique: generateIV(),
      speed: generateIV(),
      stamina: generateIV(),
      mental: generateIV()
    };
    
    // 基本能力値生成（ポケモンの種族値を参考に）
    const baseStats = pokemonData.stats.reduce((acc, stat) => {
      const statName = stat.stat.name;
      switch(statName) {
        case 'attack':
          acc.power = stat.base_stat;
          break;
        case 'defense':
          acc.stamina = stat.base_stat;
          break;
        case 'special-attack':
          acc.technique = stat.base_stat;
          break;
        case 'special-defense':
          acc.mental = stat.base_stat;
          break;
        case 'speed':
          acc.speed = stat.base_stat;
          break;
      }
      return acc;
    }, { power: 70, technique: 70, speed: 70, stamina: 70, mental: 70 });
    
    // 能力値を0-100スケールに調整
    const stats = {
      power: generateBaseStat(Math.min(100, baseStats.power * 0.8), typeModifiers.power, rarity),
      technique: generateBaseStat(Math.min(100, baseStats.technique * 0.8), typeModifiers.technique, rarity),
      speed: generateBaseStat(Math.min(100, baseStats.speed * 0.8), typeModifiers.speed, rarity),
      stamina: generateBaseStat(Math.min(100, baseStats.stamina * 0.8), typeModifiers.stamina, rarity),
      mental: generateBaseStat(Math.min(100, baseStats.mental * 0.8), typeModifiers.mental, rarity)
    };
    
    // テニス技術（基本能力値から派生）
    const tennisSkills = {
      serve_skill: Math.floor((stats.power * 0.7 + stats.technique * 0.3) + (Math.random() * 20 - 10)),
      volley_skill: Math.floor((stats.technique * 0.6 + stats.speed * 0.4) + (Math.random() * 20 - 10)),
      stroke_skill: Math.floor((stats.technique * 0.8 + stats.power * 0.2) + (Math.random() * 20 - 10)),
      return_skill: Math.floor((stats.speed * 0.5 + stats.mental * 0.5) + (Math.random() * 20 - 10))
    };
    
    // 0-100の範囲に制限
    Object.keys(tennisSkills).forEach(key => {
      tennisSkills[key as keyof typeof tennisSkills] = Math.max(10, Math.min(100, tennisSkills[key as keyof typeof tennisSkills]));
    });
    
    // 戦術理解
    const tacticalStats = {
      singles_aptitude: Math.floor(50 + (Math.random() * 40) + (stats.mental * 0.3)),
      doubles_aptitude: Math.floor(50 + (Math.random() * 40) + (stats.mental * 0.2)),
      tactical_understanding: Math.floor(40 + (Math.random() * 30) + (stats.mental * 0.4))
    };
    
    // 0-100の範囲に制限
    Object.keys(tacticalStats).forEach(key => {
      tacticalStats[key as keyof typeof tacticalStats] = Math.max(10, Math.min(100, tacticalStats[key as keyof typeof tacticalStats]));
    });
    
    // 性格とスキル選択
    const nature = POKEMON_NATURES[Math.floor(Math.random() * POKEMON_NATURES.length)];
    const ability = POKEMON_ABILITIES[Math.floor(Math.random() * POKEMON_ABILITIES.length)];
    
    // 特殊技生成
    const specialMoves = generateSpecialMoves(finalPokemonId, types);
    
    // 経験値とレベル計算
    const baseExp = GRADE_EXP_BASE[grade] + Math.floor(Math.random() * 50);
    const level = Math.floor(baseExp / 100) + 1;
    
    // 日付設定
    const currentDate = new Date();
    const joinDate = new Date(currentDate.getFullYear() - (grade - 1), 3, 1); // 4月入学
    const graduationDate = new Date(currentDate.getFullYear() + (4 - grade), 2, 31); // 3月卒業
    
    return {
      school_id: schoolId,
      pokemon_id: finalPokemonId,
      pokemon_name: pokemonName,
      pokemon_type_1: types[0],
      pokemon_type_2: types[1] || undefined,
      custom_name: undefined,
      
      // 基本情報
      grade,
      position,
      join_date: joinDate.toISOString(),
      graduation_date: graduationDate.toISOString(),
      
      // 成長情報
      level,
      experience: baseExp,
      evolution_stage: 1,
      
      // 基本能力値
      ...stats,
      
      // テニス技術
      ...tennisSkills,
      
      // 戦術理解
      ...tacticalStats,
      
      // 個体値
      iv_power: ivs.power,
      iv_technique: ivs.technique,
      iv_speed: ivs.speed,
      iv_stamina: ivs.stamina,
      iv_mental: ivs.mental,
      
      // 努力値（初期は0）
      ev_power: 0,
      ev_technique: 0,
      ev_speed: 0,
      ev_stamina: 0,
      ev_mental: 0,
      
      // 性格・特性
      nature,
      ability,
      hidden_ability: Math.random() < 0.1 ? POKEMON_ABILITIES[Math.floor(Math.random() * POKEMON_ABILITIES.length)] : undefined,
      
      // コンディション
      condition: 'good' as const,
      physical_fatigue: Math.floor(Math.random() * 20),
      mental_fatigue: Math.floor(Math.random() * 20),
      accumulated_fatigue: 0,
      motivation: 70 + Math.floor(Math.random() * 30),
      
      // 技・統計
      learned_moves: specialMoves,
      move_slots: 4,
      matches_played: Math.floor(Math.random() * grade * 10),
      matches_won: 0, // 後で計算
      sets_won: 0,
      sets_lost: 0
    };
  } catch (error) {
    console.error('Error generating player:', error);
    throw error;
  }
}

// 学校の初期メンバー生成
export async function generateInitialTeam(schoolId: string): Promise<boolean> {
  try {
    console.log('Generating initial team for school:', schoolId);
    
    // 御三家から1匹をキャプテンとして選択
    const starterIds = getStarterPokemonIds();
    const captainPokemonId = starterIds[Math.floor(Math.random() * starterIds.length)];
    
    // チーム構成を決定
    const teamComposition = [
      { grade: 3 as const, position: 'captain' as const, pokemonId: captainPokemonId },
      { grade: 3 as const, position: 'regular' as const },
      { grade: 2 as const, position: 'vice_captain' as const },
      { grade: 2 as const, position: 'regular' as const },
      { grade: 2 as const, position: 'regular' as const },
      { grade: 1 as const, position: 'member' as const },
      { grade: 1 as const, position: 'member' as const }
    ];
    
    // 各プレイヤーを生成
    const players = await Promise.all(
      teamComposition.map(({ grade, position, pokemonId }) => 
        generatePlayer(schoolId, grade, position, pokemonId)
      )
    );
    
    // 試合戦績を設定（経験に基づいて）
    players.forEach(player => {
      if (player.matches_played > 0) {
        const winRate = 0.4 + (Math.random() * 0.4); // 40-80%の勝率
        player.matches_won = Math.floor(player.matches_played * winRate);
        player.sets_won = Math.floor(player.matches_won * 2.2); // 平均2.2セット
        player.sets_lost = Math.floor((player.matches_played - player.matches_won) * 1.8); // 平均1.8セット
      }
    });
    
    // データベースに保存
    const { error } = await supabase
      .from('players')
      .insert(players);
    
    if (error) {
      console.error('Error inserting players:', error);
      throw error;
    }
    
    console.log(`Successfully generated ${players.length} players for school ${schoolId}`);
    return true;
    
  } catch (error) {
    console.error('Error generating initial team:', error);
    return false;
  }
}

// 新入部員候補生成（スカウト用）
export async function generateScoutCandidates(count: number = 3): Promise<any[]> {
  try {
    const candidates = [];
    
    for (let i = 0; i < count; i++) {
      // 30%の確率で人気ポケモン、70%で通常ポケモン
      const pokemonId = Math.random() < 0.3 
        ? POPULAR_POKEMON_IDS[Math.floor(Math.random() * POPULAR_POKEMON_IDS.length)]
        : getRandomPokemonId();
      
      const [pokemonData, speciesData] = await Promise.all([
        fetchPokemonData(pokemonId),
        fetchPokemonSpecies(pokemonId)
      ]);
      
      const pokemonName = getJapaneseName(speciesData.names);
      const types = pokemonData.types.map(t => t.type.name as PokemonType);
      const rarity = getPokemonRarity(pokemonId);
      
      candidates.push({
        pokemon_id: pokemonId,
        pokemon_name: pokemonName,
        pokemon_type_1: types[0],
        pokemon_type_2: types[1] || null,
        rarity,
        potential: Math.floor(Math.random() * 40) + 60, // 60-100のポテンシャル
        estimated_stats: pokemonData.stats.reduce((acc, stat) => {
          acc[stat.stat.name.replace('-', '_')] = Math.floor(stat.base_stat * 0.8);
          return acc;
        }, {} as Record<string, number>)
      });
    }
    
    return candidates;
    
  } catch (error) {
    console.error('Error generating scout candidates:', error);
    return [];
  }
}