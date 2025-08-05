'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Trophy, 
  Users, 
  Star,
  Clock,
  Target,
  TrendingUp,
  Award
} from 'lucide-react';

interface Match {
  id: string;
  opponent_school: string;
  match_date: string;
  match_type: 'practice' | 'tournament' | 'championship';
  difficulty: number; // 1-5
  venue: 'home' | 'away' | 'neutral';
  status: 'scheduled' | 'in_progress' | 'completed';
  result?: 'win' | 'lose' | 'draw';
  score?: {
    our_points: number;
    opponent_points: number;
  };
  rewards?: {
    funds: number;
    reputation: number;
    experience: number;
  };
}

interface MatchCardProps {
  match: Match;
  onJoin?: (match: Match) => void;
  onViewResult?: (match: Match) => void;
  compact?: boolean;
}

export function MatchCard({ match, onJoin, onViewResult, compact = false }: MatchCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getMatchTypeInfo = (type: string) => {
    switch (type) {
      case 'practice':
        return {
          label: '練習試合',
          color: 'bg-blue-100 text-blue-700',
          icon: Target
        };
      case 'tournament':
        return {
          label: 'トーナメント',
          color: 'bg-purple-100 text-purple-700',
          icon: Trophy
        };
      case 'championship':
        return {
          label: '選手権',
          color: 'bg-yellow-100 text-yellow-700',
          icon: Award
        };
      default:
        return {
          label: '試合',
          color: 'bg-gray-100 text-gray-700',
          icon: Trophy
        };
    }
  };

  const getVenueInfo = (venue: string) => {
    switch (venue) {
      case 'home':
        return { label: 'ホーム', color: 'text-green-600' };
      case 'away':
        return { label: 'アウェイ', color: 'text-red-600' };
      case 'neutral':
        return { label: '中立', color: 'text-gray-600' };
      default:
        return { label: '未定', color: 'text-gray-600' };
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'scheduled':
        return { label: '予定', color: 'bg-gray-100 text-gray-700' };
      case 'in_progress':
        return { label: '進行中', color: 'bg-blue-100 text-blue-700' };
      case 'completed':
        return { label: '完了', color: 'bg-green-100 text-green-700' };
      default:
        return { label: '不明', color: 'bg-gray-100 text-gray-700' };
    }
  };

  const getResultColor = (result?: string) => {
    switch (result) {
      case 'win':
        return 'text-green-600';
      case 'lose':
        return 'text-red-600';
      case 'draw':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getResultLabel = (result?: string) => {
    switch (result) {
      case 'win':
        return '勝利';
      case 'lose':
        return '敗北';
      case 'draw':
        return '引き分け';
      default:
        return '未定';
    }
  };

  const getDifficultyStars = (difficulty: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < difficulty ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const typeInfo = getMatchTypeInfo(match.match_type);
  const venueInfo = getVenueInfo(match.venue);
  const statusInfo = getStatusInfo(match.status);
  const TypeIcon = typeInfo.icon;

  if (compact) {
    return (
      <motion.div
        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
        whileHover={{ scale: 1.01 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <TypeIcon className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{match.opponent_school}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{formatDate(match.match_date)}</span>
                <span>•</span>
                <span className={venueInfo.color}>{venueInfo.label}</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
            {match.result && (
              <div className={`text-sm font-medium mt-1 ${getResultColor(match.result)}`}>
                {getResultLabel(match.result)}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
      whileHover={{ y: -2 }}
    >
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${typeInfo.color.replace('text-', 'bg-').replace('700', '500')} bg-opacity-20`}>
              <TypeIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{match.opponent_school}</h3>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeInfo.color}`}>
                  {typeInfo.label}
                </span>
                <div className="flex items-center space-x-1">
                  {getDifficultyStars(match.difficulty)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
            {match.result && (
              <div className={`text-lg font-bold mt-1 ${getResultColor(match.result)}`}>
                {getResultLabel(match.result)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 詳細情報 */}
      <div className="p-4 space-y-4">
        {/* 日時・会場 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <div>
              <div className="font-medium">{formatDate(match.match_date)}</div>
              <div className="text-xs text-gray-500">{formatTime(match.match_date)}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span className={`font-medium ${venueInfo.color}`}>{venueInfo.label}</span>
          </div>
        </div>

        {/* スコア */}
        {match.score && match.status === 'completed' && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <div className="text-sm text-gray-500">我がチーム</div>
                <div className="text-2xl font-bold text-gray-900">{match.score.our_points}</div>
              </div>
              <div className="text-2xl font-bold text-gray-400">-</div>
              <div className="text-center">
                <div className="text-sm text-gray-500">{match.opponent_school}</div>
                <div className="text-2xl font-bold text-gray-900">{match.score.opponent_points}</div>
              </div>
            </div>
          </div>
        )}

        {/* 報酬 */}
        {match.rewards && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">獲得可能報酬</h4>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <div className="text-green-600 font-bold">¥{match.rewards.funds.toLocaleString()}</div>
                <div className="text-xs text-gray-600">資金</div>
              </div>
              <div className="text-center">
                <div className="text-purple-600 font-bold">+{match.rewards.reputation}</div>
                <div className="text-xs text-gray-600">評判</div>
              </div>
              <div className="text-center">
                <div className="text-blue-600 font-bold">+{match.rewards.experience}</div>
                <div className="text-xs text-gray-600">経験値</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* アクションボタン */}
      <div className="p-4 border-t border-gray-100">
        {match.status === 'scheduled' && onJoin && (
          <button
            onClick={() => onJoin(match)}
            className="w-full bg-poke-blue-500 text-white py-2 rounded-lg hover:bg-poke-blue-600 transition-colors font-medium"
          >
            試合に参加
          </button>
        )}
        
        {match.status === 'completed' && onViewResult && (
          <button
            onClick={() => onViewResult(match)}
            className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            試合結果を見る
          </button>
        )}
        
        {match.status === 'in_progress' && (
          <button
            disabled
            className="w-full bg-yellow-500 text-white py-2 rounded-lg opacity-75 cursor-not-allowed font-medium"
          >
            試合進行中...
          </button>
        )}
      </div>
    </motion.div>
  );
}