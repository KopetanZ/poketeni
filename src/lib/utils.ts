import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 数値フォーマット関数
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ja-JP').format(num);
}

// 通貨フォーマット関数
export function formatCurrency(amount: number): string {
  return `¥${formatNumber(amount)}`;
}

// 日付フォーマット関数
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

// パーセンテージフォーマット関数
export function formatPercentage(value: number, total: number): string {
  const percentage = Math.round((value / total) * 100);
  return `${percentage}%`;
}

// ステータス値を色分けする関数
export function getStatColor(value: number, max: number = 100): string {
  const percentage = (value / max) * 100;
  
  if (percentage >= 80) return 'text-green-600';
  if (percentage >= 60) return 'text-blue-600';
  if (percentage >= 40) return 'text-yellow-600';
  if (percentage >= 20) return 'text-orange-600';
  return 'text-red-600';
}

// ポケモンタイプの色を取得する関数
export function getTypeColor(type: string): string {
  const typeColors: Record<string, string> = {
    normal: 'bg-gray-400',
    fire: 'bg-red-500',
    water: 'bg-blue-500',
    electric: 'bg-yellow-400',
    grass: 'bg-green-500',
    ice: 'bg-blue-300',
    fighting: 'bg-red-700',
    poison: 'bg-purple-500',
    ground: 'bg-yellow-600',
    flying: 'bg-indigo-400',
    psychic: 'bg-pink-500',
    bug: 'bg-green-400',
    rock: 'bg-yellow-800',
    ghost: 'bg-purple-700',
    dragon: 'bg-indigo-700',
    dark: 'bg-gray-800',
    steel: 'bg-gray-500',
    fairy: 'bg-pink-300'
  };
  
  return typeColors[type] || 'bg-gray-400';
}

// レベルから経験値を計算する関数
export function calculateExpForLevel(level: number): number {
  return Math.floor(level ** 3);
}

// 経験値からレベルを計算する関数
export function calculateLevelFromExp(exp: number): number {
  return Math.floor(Math.cbrt(exp));
}