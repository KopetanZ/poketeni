// PokeAPI統合ライブラリ
const POKEAPI_BASE_URL = process.env.NEXT_PUBLIC_POKEAPI_BASE_URL || 'https://pokeapi.co/api/v2';

export interface PokemonAPIResponse {
  id: number;
  name: string;
  types: Array<{
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }>;
  stats: Array<{
    base_stat: number;
    effort: number;
    stat: {
      name: string;
      url: string;
    };
  }>;
  abilities: Array<{
    ability: {
      name: string;
      url: string;
    };
    is_hidden: boolean;
    slot: number;
  }>;
  sprites: {
    front_default: string;
    front_shiny: string;
    other: {
      'official-artwork': {
        front_default: string;
        front_shiny: string;
      };
    };
  };
  height: number;
  weight: number;
  species: {
    name: string;
    url: string;
  };
}

export interface PokemonSpeciesResponse {
  id: number;
  name: string;
  names: Array<{
    language: {
      name: string;
    };
    name: string;
  }>;
  flavor_text_entries: Array<{
    flavor_text: string;
    language: {
      name: string;
    };
  }>;
  evolution_chain: {
    url: string;
  };
}

// キャッシュ管理
const pokemonCache = new Map<string, any>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24時間

interface CacheEntry {
  data: any;
  timestamp: number;
}

function getCachedData(key: string): any | null {
  const entry = pokemonCache.get(key) as CacheEntry;
  if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
    return entry.data;
  }
  pokemonCache.delete(key);
  return null;
}

function setCachedData(key: string, data: any): void {
  pokemonCache.set(key, {
    data,
    timestamp: Date.now()
  });
}

export async function fetchPokemonData(pokemonId: number | string): Promise<PokemonAPIResponse> {
  const cacheKey = `pokemon_${pokemonId}`;
  const cached = getCachedData(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${pokemonId}`, {
      next: { revalidate: 86400 } // 24時間キャッシュ
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Pokemon data: ${response.status}`);
    }
    
    const data = await response.json();
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching Pokemon data:', error);
    throw error;
  }
}

export async function fetchPokemonSpecies(pokemonId: number | string): Promise<PokemonSpeciesResponse> {
  const cacheKey = `species_${pokemonId}`;
  const cached = getCachedData(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(`${POKEAPI_BASE_URL}/pokemon-species/${pokemonId}`, {
      next: { revalidate: 86400 }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Pokemon species data: ${response.status}`);
    }
    
    const data = await response.json();
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching Pokemon species data:', error);
    throw error;
  }
}

export function getPokemonImageUrl(pokemonId: number, shiny: boolean = false): string {
  const imageType = shiny ? 'shiny' : 'default';
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
}

export function getPokemonSpriteUrl(pokemonId: number, shiny: boolean = false): string {
  const suffix = shiny ? '/shiny' : '';
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon${suffix}/${pokemonId}.png`;
}

// 日本語名取得
export function getJapaneseName(names: Array<{ language: { name: string }; name: string }>): string {
  const japaneseName = names.find(nameEntry => nameEntry.language.name === 'ja');
  return japaneseName?.name || names[0]?.name || '';
}

// ポケモンタイプから基本ステータス傾向を計算
export function getTypeStatTendencies(types: string[]): Record<string, number> {
  const typeModifiers: Record<string, Record<string, number>> = {
    fire: { power: 1.2, technique: 0.9, speed: 1.1, stamina: 0.8, mental: 1.0 },
    water: { power: 0.9, technique: 1.1, speed: 1.0, stamina: 1.2, mental: 1.1 },
    electric: { power: 1.1, technique: 1.0, speed: 1.3, stamina: 0.9, mental: 1.0 },
    grass: { power: 0.8, technique: 1.2, speed: 0.9, stamina: 1.3, mental: 1.1 },
    ice: { power: 1.0, technique: 1.1, speed: 0.8, stamina: 0.9, mental: 1.2 },
    fighting: { power: 1.4, technique: 0.8, speed: 1.1, stamina: 1.1, mental: 0.9 },
    poison: { power: 0.9, technique: 1.0, speed: 1.0, stamina: 1.2, mental: 1.0 },
    ground: { power: 1.3, technique: 0.9, speed: 0.8, stamina: 1.2, mental: 1.0 },
    flying: { power: 0.9, technique: 1.1, speed: 1.3, stamina: 0.9, mental: 1.1 },
    psychic: { power: 0.8, technique: 1.3, speed: 1.0, stamina: 0.9, mental: 1.4 },
    bug: { power: 0.9, technique: 1.0, speed: 1.2, stamina: 1.0, mental: 0.9 },
    rock: { power: 1.2, technique: 0.8, speed: 0.7, stamina: 1.4, mental: 1.0 },
    ghost: { power: 1.0, technique: 1.2, speed: 1.1, stamina: 0.9, mental: 1.2 },
    dragon: { power: 1.2, technique: 1.1, speed: 1.0, stamina: 1.1, mental: 1.1 },
    dark: { power: 1.1, technique: 1.2, speed: 1.1, stamina: 1.0, mental: 0.9 },
    steel: { power: 1.1, technique: 1.0, speed: 0.8, stamina: 1.3, mental: 1.1 },
    fairy: { power: 0.8, technique: 1.2, speed: 1.0, stamina: 1.0, mental: 1.3 },
    normal: { power: 1.0, technique: 1.0, speed: 1.0, stamina: 1.0, mental: 1.0 }
  };

  const result = { power: 1.0, technique: 1.0, speed: 1.0, stamina: 1.0, mental: 1.0 };
  
  types.forEach(type => {
    const modifiers = typeModifiers[type] || typeModifiers.normal;
    Object.keys(result).forEach(stat => {
      result[stat as keyof typeof result] *= modifiers[stat] || 1.0;
    });
  });

  // 複数タイプの場合は平均を取る
  if (types.length > 1) {
    Object.keys(result).forEach(stat => {
      result[stat as keyof typeof result] = Math.pow(result[stat as keyof typeof result], 1 / types.length);
    });
  }

  return result;
}

// ランダムなポケモンIDを生成（第1-4世代、1-493）
export function getRandomPokemonId(): number {
  return Math.floor(Math.random() * 493) + 1;
}

// 人気ポケモンのリスト（スカウト時によく出現）
export const POPULAR_POKEMON_IDS = [
  1, 4, 7, 25, 39, 54, 58, 66, 74, 81, 95, 104, 113, 123, 128, 131, 133, 143, 144, 145, 146, 150, 151,
  155, 158, 161, 179, 185, 196, 197, 201, 228, 244, 245, 249, 250, 251,
  252, 255, 258, 280, 302, 311, 312, 318, 333, 359, 380, 381, 382, 383, 384,
  387, 390, 393, 447, 448, 483, 484, 487, 491, 492, 493
];

export function getStarterPokemonIds(): number[] {
  return [1, 4, 7, 155, 158, 161, 252, 255, 258, 387, 390, 393]; // 各世代の御三家
}