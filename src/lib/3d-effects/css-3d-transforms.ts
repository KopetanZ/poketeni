/**
 * CSS 3D変換とアニメーション効果
 * パフォーマンス重視の軽量3D効果システム
 */

export interface Transform3D {
  translateX: number;
  translateY: number;
  translateZ: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
}

export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  iterations?: number | 'infinite';
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'forwards' | 'backwards' | 'both' | 'none';
}

export class CSS3DTransforms {
  private static instance: CSS3DTransforms;

  public static getInstance(): CSS3DTransforms {
    if (!CSS3DTransforms.instance) {
      CSS3DTransforms.instance = new CSS3DTransforms();
    }
    return CSS3DTransforms.instance;
  }

  /**
   * 3D変換文字列を生成
   */
  generateTransform(transform: Partial<Transform3D>): string {
    const {
      translateX = 0,
      translateY = 0,
      translateZ = 0,
      rotateX = 0,
      rotateY = 0,
      rotateZ = 0,
      scaleX = 1,
      scaleY = 1,
      scaleZ = 1
    } = transform;

    return [
      `translate3d(${translateX}px, ${translateY}px, ${translateZ}px)`,
      `rotateX(${rotateX}deg)`,
      `rotateY(${rotateY}deg)`,
      `rotateZ(${rotateZ}deg)`,
      `scale3d(${scaleX}, ${scaleY}, ${scaleZ})`
    ].join(' ');
  }

  /**
   * 要素に3D変換を適用
   */
  applyTransform(element: HTMLElement, transform: Partial<Transform3D>): void {
    element.style.transform = this.generateTransform(transform);
    element.style.transformOrigin = 'center center';
    element.style.transformStyle = 'preserve-3d';
  }

  /**
   * ポケモンカード風フリップアニメーション
   */
  flipCard(
    element: HTMLElement,
    direction: 'horizontal' | 'vertical' = 'horizontal',
    config: Partial<AnimationConfig> = {}
  ): Promise<void> {
    return new Promise((resolve) => {
      const animationConfig: AnimationConfig = {
        duration: 600,
        easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        ...config
      };

      const keyframes = direction === 'horizontal' ? [
        { transform: 'rotateY(0deg)', offset: 0 },
        { transform: 'rotateY(90deg)', offset: 0.5 },
        { transform: 'rotateY(180deg)', offset: 1 }
      ] : [
        { transform: 'rotateX(0deg)', offset: 0 },
        { transform: 'rotateX(90deg)', offset: 0.5 },
        { transform: 'rotateX(180deg)', offset: 1 }
      ];

      const animation = element.animate(keyframes, animationConfig);
      animation.onfinish = () => resolve();
    });
  }

  /**
   * 3Dカード浮遊効果
   */
  floatingCard(element: HTMLElement, intensity: 'subtle' | 'medium' | 'strong' = 'medium'): string {
    const intensityValues = {
      subtle: { y: 5, rotation: 1, duration: 3000 },
      medium: { y: 10, rotation: 2, duration: 2500 },
      strong: { y: 20, rotation: 3, duration: 2000 }
    };

    const { y, rotation, duration } = intensityValues[intensity];
    
    const animationName = `floating-${intensity}-${Math.random().toString(36).substring(7)}`;
    
    const keyframes = `
      @keyframes ${animationName} {
        0%, 100% {
          transform: translate3d(0, 0px, 0) rotateY(0deg);
        }
        25% {
          transform: translate3d(0, -${y}px, 10px) rotateY(${rotation}deg);
        }
        50% {
          transform: translate3d(0, -${y * 1.5}px, 20px) rotateY(0deg);
        }
        75% {
          transform: translate3d(0, -${y}px, 10px) rotateY(-${rotation}deg);
        }
      }
    `;

    // スタイルシートに追加
    if (!document.querySelector(`#keyframes-${animationName}`)) {
      const style = document.createElement('style');
      style.id = `keyframes-${animationName}`;
      style.textContent = keyframes;
      document.head.appendChild(style);
    }

    element.style.animation = `${animationName} ${duration}ms ease-in-out infinite`;
    element.style.transformStyle = 'preserve-3d';

    // アニメーション停止用のID返却
    return animationName;
  }

  /**
   * ポケモンタイプ別エントランスアニメーション
   */
  pokemonTypeEntrance(
    element: HTMLElement,
    pokemonType: string,
    config: Partial<AnimationConfig> = {}
  ): Promise<void> {
    return new Promise((resolve) => {
      const animationConfig: AnimationConfig = {
        duration: 800,
        easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        ...config
      };

      let keyframes: Keyframe[];

      switch (pokemonType) {
        case 'fire':
          keyframes = [
            { 
              transform: 'translate3d(0, 100px, -100px) rotateX(90deg) scale(0.3)',
              opacity: 0,
              filter: 'brightness(2) saturate(1.5)'
            },
            { 
              transform: 'translate3d(0, -20px, 20px) rotateX(-10deg) scale(1.1)',
              opacity: 0.8,
              filter: 'brightness(1.3) saturate(1.2)',
              offset: 0.7
            },
            { 
              transform: 'translate3d(0, 0, 0) rotateX(0deg) scale(1)',
              opacity: 1,
              filter: 'brightness(1) saturate(1)'
            }
          ];
          break;

        case 'water':
          keyframes = [
            { 
              transform: 'translate3d(-100px, 0, -50px) rotateY(-90deg) scale(0.5)',
              opacity: 0,
              filter: 'blur(10px) brightness(0.5)'
            },
            { 
              transform: 'translate3d(20px, -10px, 10px) rotateY(15deg) scale(1.05)',
              opacity: 0.9,
              filter: 'blur(2px) brightness(1.1)',
              offset: 0.8
            },
            { 
              transform: 'translate3d(0, 0, 0) rotateY(0deg) scale(1)',
              opacity: 1,
              filter: 'blur(0px) brightness(1)'
            }
          ];
          break;

        case 'electric':
          keyframes = [
            { 
              transform: 'translate3d(0, 0, 0) scale(0)',
              opacity: 0,
              filter: 'brightness(3) contrast(2)'
            },
            { 
              transform: 'translate3d(0, 0, 0) scale(1.3)',
              opacity: 0.7,
              filter: 'brightness(2) contrast(1.5)',
              offset: 0.3
            },
            { 
              transform: 'translate3d(0, 0, 0) scale(0.9)',
              opacity: 1,
              filter: 'brightness(1.2) contrast(1.2)',
              offset: 0.8
            },
            { 
              transform: 'translate3d(0, 0, 0) scale(1)',
              opacity: 1,
              filter: 'brightness(1) contrast(1)'
            }
          ];
          break;

        case 'grass':
          keyframes = [
            { 
              transform: 'translate3d(0, 50px, -30px) rotateZ(-180deg) scale(0.3)',
              opacity: 0,
              filter: 'hue-rotate(90deg) saturate(2)'
            },
            { 
              transform: 'translate3d(0, -10px, 5px) rotateZ(-20deg) scale(1.1)',
              opacity: 0.8,
              filter: 'hue-rotate(30deg) saturate(1.5)',
              offset: 0.6
            },
            { 
              transform: 'translate3d(0, 0, 0) rotateZ(0deg) scale(1)',
              opacity: 1,
              filter: 'hue-rotate(0deg) saturate(1)'
            }
          ];
          break;

        case 'psychic':
          keyframes = [
            { 
              transform: 'translate3d(0, 0, -200px) rotateX(360deg) rotateY(360deg) scale(0.1)',
              opacity: 0,
              filter: 'hue-rotate(180deg) saturate(3) brightness(2)'
            },
            { 
              transform: 'translate3d(0, 0, 50px) rotateX(10deg) rotateY(-10deg) scale(1.2)',
              opacity: 0.7,
              filter: 'hue-rotate(45deg) saturate(2) brightness(1.5)',
              offset: 0.7
            },
            { 
              transform: 'translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) scale(1)',
              opacity: 1,
              filter: 'hue-rotate(0deg) saturate(1) brightness(1)'
            }
          ];
          break;

        default:
          keyframes = [
            { 
              transform: 'translate3d(0, 30px, -20px) scale(0.8)',
              opacity: 0
            },
            { 
              transform: 'translate3d(0, -5px, 5px) scale(1.05)',
              opacity: 0.9,
              offset: 0.8
            },
            { 
              transform: 'translate3d(0, 0, 0) scale(1)',
              opacity: 1
            }
          ];
      }

      const animation = element.animate(keyframes, animationConfig);
      animation.onfinish = () => resolve();
    });
  }

  /**
   * ホバー時の3Dティルト効果
   */
  setupTiltEffect(element: HTMLElement, sensitivity: number = 20): () => void {
    let isHovering = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isHovering) return;

      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) / (rect.width / 2);
      const deltaY = (e.clientY - centerY) / (rect.height / 2);

      const tiltX = deltaY * sensitivity;
      const tiltY = -deltaX * sensitivity;

      this.applyTransform(element, {
        rotateX: tiltX,
        rotateY: tiltY,
        translateZ: 20
      });
    };

    const handleMouseEnter = () => {
      isHovering = true;
      element.style.transition = 'transform 0.1s ease-out';
    };

    const handleMouseLeave = () => {
      isHovering = false;
      element.style.transition = 'transform 0.3s ease-out';
      this.applyTransform(element, {
        rotateX: 0,
        rotateY: 0,
        translateZ: 0
      });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    // クリーンアップ関数を返す
    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }

  /**
   * 3D空間での回転アニメーション
   */
  rotateIn3D(
    element: HTMLElement,
    axis: 'x' | 'y' | 'z' | 'all' = 'y',
    speed: 'slow' | 'medium' | 'fast' = 'medium'
  ): string {
    const speeds = {
      slow: 4000,
      medium: 2000,
      fast: 1000
    };

    const duration = speeds[speed];
    const animationName = `rotate3d-${axis}-${Math.random().toString(36).substring(7)}`;

    let keyframes: string;

    switch (axis) {
      case 'x':
        keyframes = `
          @keyframes ${animationName} {
            from { transform: rotateX(0deg); }
            to { transform: rotateX(360deg); }
          }
        `;
        break;
      case 'y':
        keyframes = `
          @keyframes ${animationName} {
            from { transform: rotateY(0deg); }
            to { transform: rotateY(360deg); }
          }
        `;
        break;
      case 'z':
        keyframes = `
          @keyframes ${animationName} {
            from { transform: rotateZ(0deg); }
            to { transform: rotateZ(360deg); }
          }
        `;
        break;
      case 'all':
        keyframes = `
          @keyframes ${animationName} {
            0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
            25% { transform: rotateX(90deg) rotateY(90deg) rotateZ(90deg); }
            50% { transform: rotateX(180deg) rotateY(180deg) rotateZ(180deg); }
            75% { transform: rotateX(270deg) rotateY(270deg) rotateZ(270deg); }
            100% { transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg); }
          }
        `;
        break;
    }

    // スタイルシートに追加
    if (!document.querySelector(`#keyframes-${animationName}`)) {
      const style = document.createElement('style');
      style.id = `keyframes-${animationName}`;
      style.textContent = keyframes;
      document.head.appendChild(style);
    }

    element.style.animation = `${animationName} ${duration}ms linear infinite`;
    element.style.transformStyle = 'preserve-3d';

    return animationName;
  }

  /**
   * 3D遠近効果でのズームイン/アウト
   */
  zoomWithPerspective(
    element: HTMLElement,
    targetScale: number = 1.5,
    perspective: number = 1000,
    config: Partial<AnimationConfig> = {}
  ): Promise<void> {
    return new Promise((resolve) => {
      const parent = element.parentElement;
      if (parent) {
        parent.style.perspective = `${perspective}px`;
        parent.style.perspectiveOrigin = 'center center';
      }

      const animationConfig: AnimationConfig = {
        duration: 500,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        ...config
      };

      const keyframes = [
        { 
          transform: 'scale3d(1, 1, 1) translateZ(0px)',
          opacity: 1
        },
        { 
          transform: `scale3d(${1 + (targetScale - 1) * 0.5}, ${1 + (targetScale - 1) * 0.5}, 1) translateZ(${perspective * 0.3}px)`,
          opacity: 0.9,
          offset: 0.5
        },
        { 
          transform: `scale3d(${targetScale}, ${targetScale}, 1) translateZ(${perspective * 0.5}px)`,
          opacity: 1
        }
      ];

      const animation = element.animate(keyframes, animationConfig);
      animation.onfinish = () => resolve();
    });
  }

  /**
   * アニメーション停止
   */
  stopAnimation(element: HTMLElement, animationName?: string): void {
    if (animationName) {
      element.style.animation = element.style.animation.replaceAll(animationName, '');
    } else {
      element.style.animation = '';
    }
  }

  /**
   * 全ての3D効果をリセット
   */
  resetTransforms(element: HTMLElement): void {
    element.style.transform = '';
    element.style.transformStyle = '';
    element.style.transformOrigin = '';
    element.style.perspective = '';
    element.style.perspectiveOrigin = '';
    element.style.animation = '';
  }

  /**
   * パフォーマンス最適化用のGPU加速を強制有効化
   */
  enableGPUAcceleration(element: HTMLElement): void {
    element.style.transform = 'translateZ(0)';
    element.style.backfaceVisibility = 'hidden';
    element.style.willChange = 'transform';
  }

  /**
   * GPU加速を無効化（メモリ節約）
   */
  disableGPUAcceleration(element: HTMLElement): void {
    element.style.willChange = 'auto';
    element.style.backfaceVisibility = '';
  }
}