// サウンド管理クラス
class SoundManager {
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.warn('Web Audio API not supported');
      }
    }
  }

  // 基本的なビープ音を生成
  private createBeep(frequency: number, duration: number, volume: number = 0.1): void {
    if (!this.audioContext || !this.isEnabled) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (e) {
      console.warn('Could not play sound:', e);
    }
  }

  // サイコロを振る音
  playDiceRoll(): void {
    this.createBeep(200, 0.1);
    setTimeout(() => this.createBeep(250, 0.1), 100);
    setTimeout(() => this.createBeep(300, 0.1), 200);
  }

  // 成功音
  playSuccess(): void {
    this.createBeep(523, 0.2, 0.1); // C5
    setTimeout(() => this.createBeep(659, 0.2, 0.1), 150); // E5
    setTimeout(() => this.createBeep(784, 0.3, 0.1), 300); // G5
  }

  // レベルアップ音
  playLevelUp(): void {
    const notes = [523, 587, 659, 698, 784, 880, 988]; // C5 to B5
    notes.forEach((note, index) => {
      setTimeout(() => this.createBeep(note, 0.15, 0.08), index * 100);
    });
  }

  // エラー音
  playError(): void {
    this.createBeep(200, 0.5, 0.1);
  }

  // 通知音
  playNotification(): void {
    this.createBeep(800, 0.1, 0.1);
    setTimeout(() => this.createBeep(600, 0.1, 0.1), 150);
  }

  // クリック音
  playClick(): void {
    this.createBeep(1000, 0.05, 0.05);
  }

  // 勝利音
  playVictory(): void {
    const melody = [523, 523, 523, 415, 466, 523, 415, 466, 523];
    melody.forEach((note, index) => {
      setTimeout(() => this.createBeep(note, 0.2, 0.1), index * 200);
    });
  }

  // サウンドの有効/無効を切り替え
  toggle(): void {
    this.isEnabled = !this.isEnabled;
  }

  // サウンドが有効かどうか
  isSound(): boolean {
    return this.isEnabled;
  }

  // AudioContextを再開（ユーザーインタラクション後に必要）
  resume(): void {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

// シングルトンインスタンス
export const soundManager = new SoundManager();

// Reactコンポーネントで使用するためのフック
export function useSoundManager() {
  return soundManager;
}