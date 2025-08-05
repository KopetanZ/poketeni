/**
 * モダンゲームUIシステム - 2024年ベストプラクティス実装
 */

export interface UITheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      accent: string;
    };
    status: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };
    pokemon: {
      [type: string]: string;
    };
  };
  typography: {
    families: {
      primary: string;
      display: string;
      monospace: string;
    };
    sizes: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    weights: {
      light: number;
      normal: number;
      semibold: number;
      bold: number;
    };
  };
  spacing: {
    [key: string]: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    glow: string;
  };
  animations: {
    durations: {
      fast: string;
      normal: string;
      slow: string;
    };
    easings: {
      easeInOut: string;
      easeOut: string;
      bounce: string;
      spring: string;
    };
  };
}

export interface UIState {
  isLoading: boolean;
  notifications: UINotification[];
  activeModal: string | null;
  theme: 'light' | 'dark' | 'pokemon';
  accessibility: {
    reduceMotion: boolean;
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
  soundEnabled: boolean;
}

export interface UINotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    callback: () => void;
  };
}

export class ModernUISystem {
  private static instance: ModernUISystem;
  private uiState: UIState;
  private listeners: { [event: string]: ((data: any) => void)[] } = {};

  private constructor() {
    this.uiState = {
      isLoading: false,
      notifications: [],
      activeModal: null,
      theme: 'pokemon',
      accessibility: {
        reduceMotion: false,
        highContrast: false,
        fontSize: 'medium'
      },
      soundEnabled: true
    };
    this.initializeAccessibility();
  }

  public static getInstance(): ModernUISystem {
    if (!ModernUISystem.instance) {
      ModernUISystem.instance = new ModernUISystem();
    }
    return ModernUISystem.instance;
  }

  /**
   * ポケモン風テーマ定義
   */
  getPokemonTheme(): UITheme {
    return {
      colors: {
        primary: '#3B82F6', // ポケモンブルー
        secondary: '#F59E0B', // ポケモンイエロー
        accent: '#EF4444', // ポケボール赤
        background: '#F8FAFC',
        surface: '#FFFFFF',
        text: {
          primary: '#1F2937',
          secondary: '#6B7280',
          accent: '#3B82F6'
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6'
        },
        pokemon: {
          normal: '#A8A878',
          fire: '#F08030',
          water: '#6890F0',
          electric: '#F8D030',
          grass: '#78C850',
          ice: '#98D8D8',
          fighting: '#C03028',
          poison: '#A040A0',
          ground: '#E0C068',
          flying: '#A890F0',
          psychic: '#F85888',
          bug: '#A8B820',
          rock: '#B8A038',
          ghost: '#705898',
          dragon: '#7038F8',
          dark: '#705848',
          steel: '#B8B8D0',
          fairy: '#EE99AC'
        }
      },
      typography: {
        families: {
          primary: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          display: 'Fredoka One, cursive',
          monospace: 'JetBrains Mono, Consolas, monospace'
        },
        sizes: {
          xs: '0.75rem',
          sm: '0.875rem',
          md: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '2rem'
        },
        weights: {
          light: 300,
          normal: 400,
          semibold: 600,
          bold: 700
        }
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem'
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px'
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        glow: '0 0 20px rgba(59, 130, 246, 0.3)'
      },
      animations: {
        durations: {
          fast: '150ms',
          normal: '300ms',
          slow: '500ms'
        },
        easings: {
          easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
          easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
          bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }
      }
    };
  }

  /**
   * 通知システム
   */
  showNotification(notification: Omit<UINotification, 'id'>): string {
    const id = Math.random().toString(36).substring(7);
    const newNotification: UINotification = {
      id,
      duration: 5000,
      ...notification
    };

    this.uiState.notifications.push(newNotification);
    this.emit('notificationAdded', newNotification);

    // 自動削除
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }

  removeNotification(id: string): void {
    this.uiState.notifications = this.uiState.notifications.filter(n => n.id !== id);
    this.emit('notificationRemoved', id);
  }

  /**
   * ローディング状態管理
   */
  setLoading(loading: boolean): void {
    this.uiState.isLoading = loading;
    this.emit('loadingChanged', loading);
  }

  /**
   * モーダル管理
   */
  openModal(modalId: string): void {
    this.uiState.activeModal = modalId;
    this.emit('modalOpened', modalId);
  }

  closeModal(): void {
    const previousModal = this.uiState.activeModal;
    this.uiState.activeModal = null;
    this.emit('modalClosed', previousModal);
  }

  /**
   * テーマ変更
   */
  setTheme(theme: UIState['theme']): void {
    this.uiState.theme = theme;
    this.updateCSSVariables();
    this.emit('themeChanged', theme);
  }

  /**
   * アクセシビリティ設定
   */
  updateAccessibility(settings: Partial<UIState['accessibility']>): void {
    this.uiState.accessibility = { ...this.uiState.accessibility, ...settings };
    this.updateCSSVariables();
    this.emit('accessibilityChanged', this.uiState.accessibility);
  }

  /**
   * 音声設定
   */
  setSoundEnabled(enabled: boolean): void {
    this.uiState.soundEnabled = enabled;
    this.emit('soundToggled', enabled);
  }

  /**
   * UIの状態を取得
   */
  getState(): UIState {
    return { ...this.uiState };
  }

  /**
   * レスポンシブブレークポイント
   */
  getBreakpoints() {
    return {
      mobile: '640px',
      tablet: '768px',
      desktop: '1024px',
      wide: '1280px'
    };
  }

  /**
   * ポケモンタイプに基づく色取得
   */
  getPokemonTypeColor(type: string): string {
    const theme = this.getPokemonTheme();
    return theme.colors.pokemon[type] || theme.colors.primary;
  }

  /**
   * 動的スタイル生成
   */
  generateButtonStyles(variant: 'primary' | 'secondary' | 'ghost' | 'pokemon') {
    const theme = this.getPokemonTheme();
    
    const baseStyles = {
      fontFamily: theme.typography.families.primary,
      fontWeight: theme.typography.weights.semibold,
      borderRadius: theme.borderRadius.lg,
      padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
      transition: `all ${theme.animations.durations.normal} ${theme.animations.easings.easeOut}`,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      border: 'none',
      outline: 'none'
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          backgroundColor: theme.colors.primary,
          color: 'white',
          boxShadow: theme.shadows.md,
          ':hover': {
            backgroundColor: '#2563EB',
            transform: 'translateY(-1px)',
            boxShadow: theme.shadows.lg
          },
          ':active': {
            transform: 'translateY(0)'
          }
        };
      case 'pokemon':
        return {
          ...baseStyles,
          background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
          color: 'white',
          boxShadow: theme.shadows.glow,
          ':hover': {
            transform: 'scale(1.05)',
            boxShadow: `0 0 30px rgba(59, 130, 246, 0.5)`
          }
        };
      default:
        return baseStyles;
    }
  }

  /**
   * カスタムアニメーション
   */
  getAnimationPresets() {
    const theme = this.getPokemonTheme();
    
    return {
      fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.3, ease: theme.animations.easings.easeOut }
      },
      slideUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3, ease: theme.animations.easings.spring }
      },
      scaleIn: {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.2, ease: theme.animations.easings.bounce }
      },
      pokemonBounce: {
        animate: { 
          y: [-2, 2, -2],
          rotate: [-1, 1, -1]
        },
        transition: { 
          duration: 2,
          repeat: Infinity,
          ease: theme.animations.easings.easeInOut
        }
      },
      shimmer: {
        animate: {
          backgroundPosition: ['200% 0', '-200% 0']
        },
        transition: {
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear'
        }
      }
    };
  }

  /**
   * フィードバック効果
   */
  provideFeedback(type: 'success' | 'error' | 'warning' | 'info', message: string) {
    // 視覚的フィードバック
    this.showNotification({ type, title: type.toUpperCase(), message });

    // 音声フィードバック（実装時）
    if (this.uiState.soundEnabled) {
      this.emit('playSound', { type, sound: `${type}.mp3` });
    }

    // ハプティックフィードバック（モバイル対応時）
    if ('vibrate' in navigator) {
      const patterns = {
        success: [100],
        error: [100, 100, 100],
        warning: [200],
        info: [50]
      };
      navigator.vibrate(patterns[type]);
    }
  }

  /**
   * イベントリスナー管理
   */
  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  private emit(event: string, data: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  /**
   * CSS変数の更新
   */
  private updateCSSVariables(): void {
    const theme = this.getPokemonTheme();
    const root = document.documentElement;

    // 色
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);

    // フォントサイズ調整
    const fontSizeMultiplier = {
      small: 0.875,
      medium: 1,
      large: 1.125
    }[this.uiState.accessibility.fontSize];

    Object.entries(theme.typography.sizes).forEach(([key, size]) => {
      const numericSize = parseFloat(size);
      const adjustedSize = numericSize * fontSizeMultiplier;
      root.style.setProperty(`--font-size-${key}`, `${adjustedSize}rem`);
    });

    // モーション設定
    if (this.uiState.accessibility.reduceMotion) {
      root.style.setProperty('--animation-duration', '0.01ms');
    } else {
      root.style.setProperty('--animation-duration', theme.animations.durations.normal);
    }
  }

  /**
   * アクセシビリティ初期化
   */
  private initializeAccessibility(): void {
    // システム設定の検出
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.uiState.accessibility.reduceMotion = true;
    }

    if (window.matchMedia('(prefers-contrast: high)').matches) {
      this.uiState.accessibility.highContrast = true;
    }

    // 初期CSS変数設定
    this.updateCSSVariables();
  }

  /**
   * デバッグ用状態表示
   */
  getDebugInfo() {
    return {
      uiState: this.uiState,
      theme: this.getPokemonTheme(),
      breakpoints: this.getBreakpoints(),
      listeners: Object.keys(this.listeners).map(key => ({
        event: key,
        listenerCount: this.listeners[key].length
      }))
    };
  }
}