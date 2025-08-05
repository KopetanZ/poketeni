/**
 * 中毒性システム - 栄冠ナインの魅力を基にした継続プレイ促進機能
 */

export interface AddictionSystemData {
  consecutivePlayDays: number;
  totalPlayTime: number;
  achievementStreak: number;
  lastLoginDate: string;
  milestoneRewards: string[];
  personalBestRecords: PersonalBest[];
}

export interface PersonalBest {
  category: 'win_streak' | 'tournament_wins' | 'player_development' | 'school_reputation';
  value: number;
  achievedDate: string;
  description: string;
}

export interface ContinuousPlayBonus {
  type: 'experience_boost' | 'rare_event' | 'special_recruit' | 'card_boost';
  multiplier: number;
  duration: number; // ゲーム内月数
  description: string;
}

export class AddictionSystem {
  private static instance: AddictionSystem;
  
  public static getInstance(): AddictionSystem {
    if (!AddictionSystem.instance) {
      AddictionSystem.instance = new AddictionSystem();
    }
    return AddictionSystem.instance;
  }

  /**
   * 連続プレイボーナスの計算
   */
  calculateContinuousPlayBonus(consecutiveDays: number): ContinuousPlayBonus[] {
    const bonuses: ContinuousPlayBonus[] = [];

    // 3日連続ボーナス
    if (consecutiveDays >= 3) {
      bonuses.push({
        type: 'experience_boost',
        multiplier: 1.2,
        duration: 1,
        description: '3日連続プレイボーナス: 経験値20%UP'
      });
    }

    // 7日連続ボーナス
    if (consecutiveDays >= 7) {
      bonuses.push({
        type: 'rare_event',
        multiplier: 2.0,
        duration: 1,
        description: '1週間連続プレイ: レアイベント発生率2倍'
      });
    }

    // 14日連続ボーナス
    if (consecutiveDays >= 14) {
      bonuses.push({
        type: 'special_recruit',
        multiplier: 1.5,
        duration: 2,
        description: '2週間連続プレイ: 特別スカウト成功率1.5倍'
      });
    }

    // 30日連続ボーナス
    if (consecutiveDays >= 30) {
      bonuses.push({
        type: 'card_boost',
        multiplier: 1.3,
        duration: 3,
        description: '1ヶ月連続プレイ: 全カード効果30%UP'
      });
    }

    return bonuses;
  }

  /**
   * 「もうちょっと」要素の生成
   */
  generateJustOneMoreElements(): string[] {
    return [
      "あと1ヶ月で新入生が入学します",
      "現在の連勝記録があと1勝で自己ベスト更新！",
      "このチームメンバーがあと2ヶ月で卒業してしまいます",
      "レジェンド選手の転生まで残り3ヶ月...",
      "地区大会まであと1ヶ月、今がチーム完成の正念場",
      "エース候補の成長がクライマックス！見届けませんか？"
    ];
  }

  /**
   * 個人記録の更新チェック
   */
  checkPersonalBestUpdate(
    category: PersonalBest['category'],
    newValue: number,
    currentBests: PersonalBest[]
  ): { isNewRecord: boolean; previousRecord?: number } {
    const existingRecord = currentBests.find(best => best.category === category);
    
    if (!existingRecord || newValue > existingRecord.value) {
      return {
        isNewRecord: true,
        previousRecord: existingRecord?.value
      };
    }

    return { isNewRecord: false };
  }

  /**
   * マイルストーン報酬の生成
   */
  generateMilestoneRewards(totalPlayTime: number): string[] {
    const rewards: string[] = [];
    const milestones = [
      { hours: 10, reward: "プレイ時間10時間達成記念バッジ" },
      { hours: 50, reward: "熱血監督の称号" },
      { hours: 100, reward: "テニス部のカリスマ" },
      { hours: 200, reward: "伝説の指導者" },
      { hours: 500, reward: "ポケテニマスター殿堂入り" }
    ];

    for (const milestone of milestones) {
      if (totalPlayTime >= milestone.hours) {
        rewards.push(milestone.reward);
      }
    }

    return rewards;
  }

  /**
   * プレイセッション終了時の誘導メッセージ
   */
  generateRetentionMessage(sessionData: AddictionSystemData): string {
    const messages = [
      `明日ログインすると連続プレイ${sessionData.consecutivePlayDays + 1}日目のボーナスがもらえます！`,
      "チームメンバーがあなたの指導を待っています",
      "ライバル校に差をつけるチャンス！明日も一緒に頑張りましょう",
      "新しいイベントが追加されました。確認してみませんか？",
      "あのエース候補の成長具合が気になりませんか？"
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * 復帰プレイヤー向けキャッチアップシステム
   */
  generateComebackBonus(daysSinceLastLogin: number): ContinuousPlayBonus[] {
    const bonuses: ContinuousPlayBonus[] = [];

    if (daysSinceLastLogin >= 7) {
      bonuses.push({
        type: 'experience_boost',
        multiplier: 1.5,
        duration: 3,
        description: '復帰ボーナス: 1週間分の経験値ブースト'
      });
    }

    if (daysSinceLastLogin >= 30) {
      bonuses.push({
        type: 'special_recruit',
        multiplier: 2.0,
        duration: 2,
        description: '復帰記念: 特別スカウトイベント開催'
      });
    }

    return bonuses;
  }

  /**
   * プレイヤーの習慣形成サポート
   */
  generateHabitFormationTips(): string[] {
    return [
      "毎日同じ時間にプレイすると、より深くゲームを楽しめます",
      "短時間でも毎日続けることで、チームの絆が深まります",
      "選手たちの成長を見守るのも監督の大切な仕事です",
      "定期的なプレイで、戦略の精度がアップします",
      "継続は力なり。小さな積み重ねが大きな成果を生みます"
    ];
  }

  /**
   * ソーシャル要素（将来のマルチプレイヤー対応）
   */
  generateSocialEngagementHooks(): string[] {
    return [
      "フレンドがあなたの記録を更新しました！",
      "今週のリーダーボードで上位を狙えるチャンス！",
      "コミュニティで話題の戦術を試してみませんか？",
      "他の監督たちの育成方法をチェック！",
      "季節限定イベントが開始されました"
    ];
  }
}

/**
 * プレイヤーのエンゲージメント状態を分析
 */
export class EngagementAnalyzer {
  static analyzeEngagementLevel(data: AddictionSystemData): 'low' | 'medium' | 'high' | 'super' {
    let score = 0;

    // 連続プレイ日数
    if (data.consecutivePlayDays >= 30) score += 3;
    else if (data.consecutivePlayDays >= 14) score += 2;
    else if (data.consecutivePlayDays >= 7) score += 1;

    // 総プレイ時間
    if (data.totalPlayTime >= 100) score += 3;
    else if (data.totalPlayTime >= 50) score += 2;
    else if (data.totalPlayTime >= 20) score += 1;

    // アチーブメント連続達成
    if (data.achievementStreak >= 10) score += 2;
    else if (data.achievementStreak >= 5) score += 1;

    if (score >= 7) return 'super';
    if (score >= 5) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  }

  static generateRetentionStrategy(
    engagementLevel: ReturnType<typeof EngagementAnalyzer.analyzeEngagementLevel>
  ): string[] {
    switch (engagementLevel) {
      case 'low':
        return [
          "簡単な目標設定で達成感を提供",
          "チュートリアルの充実",
          "初心者向けボーナス"
        ];
      case 'medium':
        return [
          "新機能の段階的解放",
          "コミュニティ要素の紹介",
          "中級者向けチャレンジ"
        ];
      case 'high':
        return [
          "上級戦術の提案",
          "リーダーボード参加の促進",
          "限定コンテンツへのアクセス"
        ];
      case 'super':
        return [
          "ベータ版機能の先行体験",
          "コミュニティリーダーとしての認定",
          "開発チームとの交流機会"
        ];
    }
  }
}