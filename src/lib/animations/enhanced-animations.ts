/**
 * 強化アニメーションシステム
 * Framer Motionと連携した高度なアニメーション管理
 */

import { Variants, Transition } from 'framer-motion';

export interface AnimationPreset {
  initial: any;
  animate: any;
  exit?: any;
  transition?: Transition;
  whileHover?: any;
  whileTap?: any;
  whileFocus?: any;
}

export interface ChainedAnimation {
  id: string;
  animations: AnimationPreset[];
  delay: number;
  stagger?: number;
}

export class EnhancedAnimations {
  private static instance: EnhancedAnimations;

  public static getInstance(): EnhancedAnimations {
    if (!EnhancedAnimations.instance) {
      EnhancedAnimations.instance = new EnhancedAnimations();
    }
    return EnhancedAnimations.instance;
  }

  /**
   * ポケモンタイプ別アニメーションプリセット
   */
  getPokemonTypeAnimation(type: string): AnimationPreset {
    const animations: { [key: string]: AnimationPreset } = {
      fire: {
        initial: { 
          scale: 0.8, 
          opacity: 0, 
          y: 30,
          filter: 'brightness(0.5) saturate(2) hue-rotate(45deg)'
        },
        animate: { 
          scale: 1, 
          opacity: 1, 
          y: 0,
          filter: 'brightness(1) saturate(1) hue-rotate(0deg)'
        },
        transition: {
          type: "spring",
          stiffness: 200,
          damping: 20,
          duration: 0.8
        },
        whileHover: {
          scale: 1.05,
          filter: 'brightness(1.2) saturate(1.3) drop-shadow(0 0 20px #ff6b35)',
          transition: { duration: 0.2 }
        },
        whileTap: {
          scale: 0.95,
          filter: 'brightness(1.5) saturate(1.5)',
          transition: { duration: 0.1 }
        }
      },

      water: {
        initial: { 
          scale: 0.9, 
          opacity: 0, 
          x: -50,
          filter: 'blur(10px) brightness(0.7)'
        },
        animate: { 
          scale: 1, 
          opacity: 1, 
          x: 0,
          filter: 'blur(0px) brightness(1)'
        },
        transition: {
          type: "spring",
          stiffness: 150,
          damping: 25,
          duration: 1.0
        },
        whileHover: {
          scale: 1.03,
          y: -5,
          filter: 'blur(0px) brightness(1.1) drop-shadow(0 5px 15px #4a90e2)',
          transition: { duration: 0.3, ease: "easeOut" }
        }
      },

      electric: {
        initial: { 
          scale: 0, 
          opacity: 0,
          rotate: -180,
          filter: 'brightness(3) contrast(2)'
        },
        animate: { 
          scale: 1, 
          opacity: 1,
          rotate: 0,
          filter: 'brightness(1) contrast(1)'
        },
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 15,
          duration: 0.6
        },
        whileHover: {
          scale: 1.1,
          rotate: [0, -2, 2, 0],
          filter: 'brightness(1.3) contrast(1.2) drop-shadow(0 0 25px #ffd93d)',
          transition: { 
            scale: { duration: 0.2 },
            rotate: { duration: 0.5, repeat: Infinity },
            filter: { duration: 0.2 }
          }
        }
      },

      grass: {
        initial: { 
          scale: 0.7, 
          opacity: 0, 
          y: 50,
          rotate: -20,
          filter: 'saturate(2) hue-rotate(45deg)'
        },
        animate: { 
          scale: 1, 
          opacity: 1, 
          y: 0,
          rotate: 0,
          filter: 'saturate(1) hue-rotate(0deg)'
        },
        transition: {
          type: "spring",
          stiffness: 120,
          damping: 20,
          duration: 1.2
        },
        whileHover: {
          scale: 1.02,
          y: -3,
          rotate: [0, 1, -1, 0],
          filter: 'saturate(1.2) drop-shadow(0 3px 12px #78c850)',
          transition: { 
            rotate: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 0.3 },
            y: { duration: 0.3 }
          }
        }
      },

      psychic: {
        initial: { 
          scale: 0.5, 
          opacity: 0,
          rotateY: 180,
          filter: 'hue-rotate(180deg) saturate(3) brightness(2)'
        },
        animate: { 
          scale: 1, 
          opacity: 1,
          rotateY: 0,
          filter: 'hue-rotate(0deg) saturate(1) brightness(1)'
        },
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 25,
          duration: 1.5
        },
        whileHover: {
          scale: [1, 1.1, 1],
          rotateY: [0, 10, -10, 0],
          filter: 'hue-rotate(30deg) saturate(1.3) brightness(1.2) drop-shadow(0 0 30px #f85888)',
          transition: { 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }
        }
      },

      dragon: {
        initial: { 
          scale: 0.3, 
          opacity: 0,
          rotate: 360,
          filter: 'brightness(0.3) saturate(3)'
        },
        animate: { 
          scale: 1, 
          opacity: 1,
          rotate: 0,
          filter: 'brightness(1) saturate(1)'
        },
        transition: {
          type: "spring",
          stiffness: 80,
          damping: 20,
          duration: 2.0
        },
        whileHover: {
          scale: 1.08,
          rotate: [0, 5, -5, 0],
          filter: 'brightness(1.3) saturate(1.5) drop-shadow(0 0 35px #7038f8)',
          boxShadow: '0 0 50px rgba(112, 56, 248, 0.8)',
          transition: { 
            duration: 1.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }
        }
      }
    };

    return animations[type] || animations.fire;
  }

  /**
   * ゲーム状況別アニメーション
   */
  getGameStateAnimation(state: 'victory' | 'defeat' | 'critical' | 'combo' | 'levelup'): AnimationPreset {
    const animations: { [key: string]: AnimationPreset } = {
      victory: {
        initial: { scale: 0.8, opacity: 0, y: 50 },
        animate: { 
          scale: [0.8, 1.2, 1], 
          opacity: 1, 
          y: [50, -20, 0],
          filter: ['brightness(1)', 'brightness(2)', 'brightness(1.3)']
        },
        transition: {
          duration: 1.5,
          times: [0, 0.6, 1],
          ease: "easeOut"
        },
        whileHover: {
          scale: 1.1,
          rotate: [0, 5, -5, 0],
          filter: 'brightness(1.5) drop-shadow(0 0 40px gold)',
          transition: { duration: 0.8, repeat: Infinity }
        }
      },

      defeat: {
        initial: { scale: 1, opacity: 1, filter: 'brightness(1)' },
        animate: { 
          scale: [1, 0.9, 0.95], 
          opacity: [1, 0.7, 0.8],
          filter: ['brightness(1)', 'brightness(0.5)', 'brightness(0.7)']
        },
        transition: {
          duration: 1.0,
          ease: "easeInOut"
        }
      },

      critical: {
        initial: { scale: 1 },
        animate: { 
          scale: [1, 1.3, 1.1],
          rotate: [0, -10, 5, 0],
          filter: [
            'brightness(1)', 
            'brightness(2) contrast(2)', 
            'brightness(1.5) contrast(1.3)'
          ]
        },
        transition: {
          duration: 0.8,
          times: [0, 0.3, 1],
          ease: "easeOut"
        }
      },

      combo: {
        initial: { scale: 1 },
        animate: { 
          scale: [1, 1.15, 1.25, 1.1],
          y: [0, -10, -20, -5],
          filter: [
            'brightness(1) hue-rotate(0deg)', 
            'brightness(1.3) hue-rotate(90deg)', 
            'brightness(1.5) hue-rotate(180deg)',
            'brightness(1.2) hue-rotate(45deg)'
          ]
        },
        transition: {
          duration: 1.2,
          times: [0, 0.3, 0.7, 1],
          ease: "easeOut"
        }
      },

      levelup: {
        initial: { scale: 1, y: 0 },
        animate: { 
          scale: [1, 1.2, 1.05],
          y: [0, -30, -10],
          filter: [
            'brightness(1)', 
            'brightness(2) saturate(2)', 
            'brightness(1.3) saturate(1.3)'
          ]
        },
        transition: {
          duration: 2.0,
          times: [0, 0.5, 1],
          ease: "easeOut"
        }
      }
    };

    return animations[state];
  }

  /**
   * リスト・グリッドアニメーション（段階的表示）
   */
  getStaggeredListAnimation(index: number, total: number): AnimationPreset {
    const delay = (index / total) * 0.5; // 最大0.5秒の遅延

    return {
      initial: { 
        opacity: 0, 
        y: 30, 
        scale: 0.9 
      },
      animate: { 
        opacity: 1, 
        y: 0, 
        scale: 1 
      },
      exit: { 
        opacity: 0, 
        y: -20, 
        scale: 0.9 
      },
      transition: {
        delay,
        type: "spring",
        stiffness: 200,
        damping: 20
      },
      whileHover: {
        y: -5,
        scale: 1.02,
        transition: { duration: 0.2 }
      }
    };
  }

  /**
   * ページ遷移アニメーション
   */
  getPageTransition(direction: 'in' | 'out', type: 'slide' | 'fade' | 'scale' = 'slide'): AnimationPreset {
    const animations = {
      slide: {
        in: {
          initial: { x: '100%', opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: '-100%', opacity: 0 }
        },
        out: {
          initial: { x: 0, opacity: 1 },
          animate: { x: '-100%', opacity: 0 },
          exit: { x: '100%', opacity: 0 }
        }
      },
      fade: {
        in: {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 1.05 }
        },
        out: {
          initial: { opacity: 1, scale: 1 },
          animate: { opacity: 0, scale: 0.95 },
          exit: { opacity: 0, scale: 1.05 }
        }
      },
      scale: {
        in: {
          initial: { scale: 0, opacity: 0, rotate: -180 },
          animate: { scale: 1, opacity: 1, rotate: 0 },
          exit: { scale: 0, opacity: 0, rotate: 180 }
        },
        out: {
          initial: { scale: 1, opacity: 1, rotate: 0 },
          animate: { scale: 0, opacity: 0, rotate: -180 },
          exit: { scale: 0, opacity: 0, rotate: 180 }
        }
      }
    };

    return {
      ...animations[type][direction],
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 25,
        duration: 0.6
      }
    };
  }

  /**
   * モーダル・ポップアップアニメーション
   */
  getModalAnimation(): {
    backdrop: AnimationPreset;
    modal: AnimationPreset;
  } {
    return {
      backdrop: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.3 }
      },
      modal: {
        initial: { 
          scale: 0.8, 
          opacity: 0, 
          y: 50,
          filter: 'blur(10px)'
        },
        animate: { 
          scale: 1, 
          opacity: 1, 
          y: 0,
          filter: 'blur(0px)'
        },
        exit: { 
          scale: 0.8, 
          opacity: 0, 
          y: 50,
          filter: 'blur(10px)'
        },
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 25,
          duration: 0.5
        }
      }
    };
  }

  /**
   * ローディングアニメーション
   */
  getLoadingAnimation(type: 'spinner' | 'pulse' | 'bounce' | 'wave' = 'spinner'): AnimationPreset {
    const animations = {
      spinner: {
        initial: { rotate: 0 },
        animate: { rotate: 360 },
        transition: {
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }
      },
      pulse: {
        initial: { scale: 1, opacity: 1 },
        animate: { 
          scale: [1, 1.2, 1],
          opacity: [1, 0.7, 1]
        },
        transition: {
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }
      },
      bounce: {
        initial: { y: 0 },
        animate: { y: [-20, 0, -20] },
        transition: {
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }
      },
      wave: {
        initial: { scaleY: 1 },
        animate: { scaleY: [1, 2, 1] },
        transition: {
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    };

    return animations[type];
  }

  /**
   * 通知・アラートアニメーション
   */
  getNotificationAnimation(position: 'top' | 'bottom' | 'left' | 'right' = 'top'): AnimationPreset {
    const directions = {
      top: { initial: { y: -100, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: -100, opacity: 0 }},
      bottom: { initial: { y: 100, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: 100, opacity: 0 }},
      left: { initial: { x: -100, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -100, opacity: 0 }},
      right: { initial: { x: 100, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: 100, opacity: 0 }}
    };

    return {
      ...directions[position],
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30,
        duration: 0.4
      },
      whileHover: {
        scale: 1.02,
        transition: { duration: 0.2 }
      }
    };
  }

  /**
   * カスタムアニメーション合成
   */
  combineAnimations(...presets: Partial<AnimationPreset>[]): AnimationPreset {
    return presets.reduce((combined, preset) => ({
      initial: { ...combined.initial, ...preset.initial },
      animate: { ...combined.animate, ...preset.animate },
      exit: { ...combined.exit, ...preset.exit },
      transition: { ...combined.transition, ...preset.transition },
      whileHover: { ...combined.whileHover, ...preset.whileHover },
      whileTap: { ...combined.whileTap, ...preset.whileTap },
      whileFocus: { ...combined.whileFocus, ...preset.whileFocus }
    }), {
      initial: {},
      animate: {},
      exit: {},
      transition: {},
      whileHover: {},
      whileTap: {},
      whileFocus: {}
    });
  }

  /**
   * レスポンシブアニメーション（画面サイズに応じて調整）
   */
  getResponsiveAnimation(baseAnimation: AnimationPreset, screenSize: 'mobile' | 'tablet' | 'desktop'): AnimationPreset {
    const scaleFactor = {
      mobile: 0.8,
      tablet: 0.9,
      desktop: 1.0
    };

    const factor = scaleFactor[screenSize];

    return {
      ...baseAnimation,
      animate: {
        ...baseAnimation.animate,
        scale: baseAnimation.animate?.scale ? baseAnimation.animate.scale * factor : factor
      },
      whileHover: {
        ...baseAnimation.whileHover,
        scale: baseAnimation.whileHover?.scale ? baseAnimation.whileHover.scale * factor : 1.05 * factor
      }
    };
  }

  /**
   * アニメーション時間の調整
   */
  adjustAnimationSpeed(animation: AnimationPreset, speedMultiplier: number): AnimationPreset {
    return {
      ...animation,
      transition: {
        ...animation.transition,
        duration: animation.transition?.duration ? animation.transition.duration / speedMultiplier : 0.3 / speedMultiplier
      }
    };
  }
}