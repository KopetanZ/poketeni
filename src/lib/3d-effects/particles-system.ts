/**
 * 3Dパーティクルシステム - モダンゲームUI向け
 */

export interface Particle {
  id: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  opacity: number;
  type: 'spark' | 'smoke' | 'fire' | 'magic' | 'electric' | 'water';
  pokemonType?: string;
}

export interface ParticleEmitter {
  id: string;
  x: number;
  y: number;
  z: number;
  rate: number; // particles per second
  velocity: { min: number; max: number };
  spread: number; // angle spread in degrees
  life: { min: number; max: number };
  size: { min: number; max: number };
  colors: string[];
  type: Particle['type'];
  pokemonType?: string;
  gravity: number;
  wind: { x: number; y: number; z: number };
  active: boolean;
}

export class ParticlesSystem {
  private static instance: ParticlesSystem;
  private particles: Particle[] = [];
  private emitters: ParticleEmitter[] = [];
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationId: number | null = null;
  private lastTime = 0;

  public static getInstance(): ParticlesSystem {
    if (!ParticlesSystem.instance) {
      ParticlesSystem.instance = new ParticlesSystem();
    }
    return ParticlesSystem.instance;
  }

  /**
   * キャンバス初期化
   */
  initialize(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.setupCanvas();
    this.startAnimation();
  }

  private setupCanvas(): void {
    if (!this.canvas) return;
    
    const updateCanvasSize = () => {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
  }

  /**
   * パーティクルエミッター作成
   */
  createEmitter(config: Partial<ParticleEmitter> & { x: number; y: number }): string {
    const emitter: ParticleEmitter = {
      id: Math.random().toString(36).substring(7),
      z: 0,
      rate: 30,
      velocity: { min: 50, max: 150 },
      spread: 45,
      life: { min: 1, max: 3 },
      size: { min: 2, max: 8 },
      colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1'],
      type: 'spark',
      gravity: 100,
      wind: { x: 0, y: 0, z: 0 },
      active: true,
      ...config
    };

    this.emitters.push(emitter);
    return emitter.id;
  }

  /**
   * ポケモンタイプ専用エミッター
   */
  createPokemonEmitter(
    x: number, 
    y: number, 
    pokemonType: string, 
    intensity: 'low' | 'medium' | 'high' = 'medium'
  ): string {
    const typeConfigs = this.getPokemonTypeConfig(pokemonType, intensity);
    return this.createEmitter({
      x,
      y,
      pokemonType,
      ...typeConfigs
    });
  }

  private getPokemonTypeConfig(
    type: string, 
    intensity: 'low' | 'medium' | 'high'
  ): Partial<ParticleEmitter> {
    const intensityMultiplier = { low: 0.5, medium: 1, high: 2 }[intensity];
    
    const configs: { [key: string]: Partial<ParticleEmitter> } = {
      fire: {
        type: 'fire',
        colors: ['#FF6B35', '#F7931E', '#FFD23F', '#FF4757'],
        rate: 50 * intensityMultiplier,
        velocity: { min: 80, max: 200 },
        gravity: -50,
        life: { min: 1.5, max: 4 }
      },
      water: {
        type: 'water',
        colors: ['#3742FA', '#2F80ED', '#70A1FF', '#5352ED'],
        rate: 40 * intensityMultiplier,
        velocity: { min: 60, max: 120 },
        gravity: 150,
        wind: { x: 20, y: 0, z: 0 }
      },
      electric: {
        type: 'electric',
        colors: ['#FFD93D', '#6BCF7F', '#4B7BEC', '#FFF200'],
        rate: 60 * intensityMultiplier,
        velocity: { min: 100, max: 300 },
        size: { min: 1, max: 4 },
        life: { min: 0.5, max: 1.5 }
      },
      grass: {
        type: 'magic',
        colors: ['#6BCF7F', '#26DE81', '#20BF6B', '#0FB9B1'],
        rate: 35 * intensityMultiplier,
        velocity: { min: 40, max: 100 },
        gravity: -20,
        spread: 90
      },
      psychic: {
        type: 'magic',
        colors: ['#E056FD', '#F8B500', '#FF6B6B', '#4ECDC4'],
        rate: 45 * intensityMultiplier,
        velocity: { min: 70, max: 180 },
        size: { min: 3, max: 12 },
        life: { min: 2, max: 5 }
      },
      ice: {
        type: 'spark',
        colors: ['#A8E6CF', '#C5E3F0', '#B4E7CE', '#E1F5FE'],
        rate: 30 * intensityMultiplier,
        velocity: { min: 30, max: 80 },
        gravity: 80,
        life: { min: 3, max: 6 }
      },
      dragon: {
        type: 'fire',
        colors: ['#8E44AD', '#9B59B6', '#E74C3C', '#F39C12'],
        rate: 70 * intensityMultiplier,
        velocity: { min: 120, max: 250 },
        size: { min: 4, max: 15 },
        spread: 60
      }
    };

    return configs[type] || configs.fire;
  }

  /**
   * 特別なエフェクト作成
   */
  createSpecialEffect(
    x: number, 
    y: number, 
    effect: 'explosion' | 'victory' | 'levelup' | 'critical' | 'combo'
  ): void {
    switch (effect) {
      case 'explosion':
        this.createExplosionEffect(x, y);
        break;
      case 'victory':
        this.createVictoryEffect(x, y);
        break;
      case 'levelup':
        this.createLevelUpEffect(x, y);
        break;
      case 'critical':
        this.createCriticalEffect(x, y);
        break;
      case 'combo':
        this.createComboEffect(x, y);
        break;
    }
  }

  private createExplosionEffect(x: number, y: number): void {
    // 中心の爆発
    this.createEmitter({
      x, y,
      type: 'fire',
      colors: ['#FF4757', '#FF6B35', '#FFD23E', '#FF9F43'],
      rate: 200,
      velocity: { min: 100, max: 400 },
      spread: 360,
      size: { min: 3, max: 15 },
      life: { min: 0.5, max: 2 },
      gravity: 50
    });

    // 外側の煙
    setTimeout(() => {
      this.createEmitter({
        x, y,
        type: 'smoke',
        colors: ['#57606F', '#747D8C', '#A4B0BE'],
        rate: 50,
        velocity: { min: 50, max: 150 },
        spread: 180,
        size: { min: 8, max: 25 },
        life: { min: 2, max: 4 },
        gravity: -30
      });
    }, 200);
  }

  private createVictoryEffect(x: number, y: number): void {
    // 金色の星々
    this.createEmitter({
      x, y: y - 50,
      type: 'spark',
      colors: ['#FFD700', '#FFA500', '#FFFF00', '#F0E68C'],
      rate: 80,
      velocity: { min: 80, max: 200 },
      spread: 45,
      size: { min: 4, max: 12 },
      life: { min: 2, max: 4 },
      gravity: -100
    });

    // 虹色の輝き
    this.createEmitter({
      x, y,
      type: 'magic',
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
      rate: 60,
      velocity: { min: 60, max: 150 },
      spread: 360,
      size: { min: 2, max: 8 },
      life: { min: 1.5, max: 3 }
    });
  }

  private createLevelUpEffect(x: number, y: number): void {
    // 上昇する光の柱
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.createEmitter({
          x: x + (i - 2) * 20,
          y: y + 100,
          type: 'magic',
          colors: ['#00D2FF', '#3A7BD5', '#00F260', '#0575E6'],
          rate: 40,
          velocity: { min: 150, max: 300 },
          spread: 15,
          size: { min: 3, max: 10 },
          life: { min: 1, max: 2.5 },
          gravity: -200
        });
      }, i * 100);
    }
  }

  private createCriticalEffect(x: number, y: number): void {
    // 電撃のような効果
    this.createEmitter({
      x, y,
      type: 'electric',
      colors: ['#FFD93D', '#FF6B35', '#FFFFFF', '#4ECDC4'],
      rate: 150,
      velocity: { min: 200, max: 500 },
      spread: 360,
      size: { min: 1, max: 6 },
      life: { min: 0.3, max: 1 },
      gravity: 0
    });
  }

  private createComboEffect(x: number, y: number): void {
    // 連鎖的な爆発
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA726', '#AB47BC'];
    
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.createEmitter({
          x: x + (Math.random() - 0.5) * 100,
          y: y + (Math.random() - 0.5) * 100,
          type: 'magic',
          colors: [colors[i % colors.length], colors[(i + 1) % colors.length]],
          rate: 60,
          velocity: { min: 80, max: 180 },
          spread: 360,
          size: { min: 3, max: 10 },
          life: { min: 1, max: 2.5 }
        });
      }, i * 200);
    }
  }

  /**
   * パーティクル更新
   */
  private updateParticles(deltaTime: number): void {
    // 新しいパーティクル生成
    this.emitters.forEach(emitter => {
      if (!emitter.active) return;

      const particlesToSpawn = Math.floor(emitter.rate * deltaTime);
      for (let i = 0; i < particlesToSpawn; i++) {
        this.spawnParticle(emitter);
      }
    });

    // 既存パーティクル更新
    this.particles = this.particles.filter(particle => {
      particle.life -= deltaTime;
      
      if (particle.life <= 0) return false;

      // 物理演算
      particle.vx += (Math.random() - 0.5) * 20 * deltaTime;
      particle.vy += particle.type === 'fire' ? -100 * deltaTime : 100 * deltaTime;
      
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
      particle.z += particle.vz * deltaTime;

      // 透明度計算
      particle.opacity = particle.life / particle.maxLife;

      return true;
    });
  }

  private spawnParticle(emitter: ParticleEmitter): void {
    const angle = (Math.random() - 0.5) * emitter.spread * (Math.PI / 180);
    const velocity = emitter.velocity.min + Math.random() * (emitter.velocity.max - emitter.velocity.min);
    const life = emitter.life.min + Math.random() * (emitter.life.max - emitter.life.min);
    const size = emitter.size.min + Math.random() * (emitter.size.max - emitter.size.min);

    const particle: Particle = {
      id: Math.random().toString(36).substring(7),
      x: emitter.x + (Math.random() - 0.5) * 20,
      y: emitter.y + (Math.random() - 0.5) * 20,
      z: emitter.z,
      vx: Math.cos(angle) * velocity + emitter.wind.x,
      vy: Math.sin(angle) * velocity + emitter.wind.y,
      vz: emitter.wind.z,
      size,
      life,
      maxLife: life,
      color: emitter.colors[Math.floor(Math.random() * emitter.colors.length)],
      opacity: 1,
      type: emitter.type,
      pokemonType: emitter.pokemonType
    };

    this.particles.push(particle);
  }

  /**
   * 描画処理
   */
  private render(): void {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // パーティクルを奥から手前の順で描画
    const sortedParticles = [...this.particles].sort((a, b) => a.z - b.z);

    sortedParticles.forEach(particle => {
      this.renderParticle(particle);
    });
  }

  private renderParticle(particle: Particle): void {
    if (!this.ctx) return;

    this.ctx.save();
    
    // 3D効果のためのスケール計算
    const scale = 1 + particle.z * 0.001;
    const size = particle.size * scale;
    
    this.ctx.globalAlpha = particle.opacity;
    this.ctx.fillStyle = particle.color;

    // パーティクルタイプ別の描画
    switch (particle.type) {
      case 'spark':
        this.renderSpark(particle, size);
        break;
      case 'fire':
        this.renderFire(particle, size);
        break;
      case 'electric':
        this.renderElectric(particle, size);
        break;
      case 'magic':
        this.renderMagic(particle, size);
        break;
      case 'water':
        this.renderWater(particle, size);
        break;
      default:
        this.renderDefault(particle, size);
    }

    this.ctx.restore();
  }

  private renderSpark(particle: Particle, size: number): void {
    if (!this.ctx) return;
    
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
    this.ctx.fill();
    
    // 光る効果
    this.ctx.shadowBlur = size * 2;
    this.ctx.shadowColor = particle.color;
    this.ctx.fill();
  }

  private renderFire(particle: Particle, size: number): void {
    if (!this.ctx) return;
    
    // 炎の形状
    this.ctx.beginPath();
    this.ctx.ellipse(particle.x, particle.y, size * 0.6, size, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // 内側の明るい部分
    this.ctx.fillStyle = '#FFFF99';
    this.ctx.globalAlpha = particle.opacity * 0.7;
    this.ctx.beginPath();
    this.ctx.ellipse(particle.x, particle.y, size * 0.3, size * 0.7, 0, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private renderElectric(particle: Particle, size: number): void {
    if (!this.ctx) return;
    
    // 電気のような線状効果
    this.ctx.strokeStyle = particle.color;
    this.ctx.lineWidth = size * 0.5;
    this.ctx.lineCap = 'round';
    
    this.ctx.beginPath();
    this.ctx.moveTo(particle.x - size, particle.y);
    this.ctx.lineTo(particle.x + size, particle.y + (Math.random() - 0.5) * size);
    this.ctx.stroke();
    
    // 光る効果
    this.ctx.shadowBlur = size;
    this.ctx.shadowColor = particle.color;
    this.ctx.stroke();
  }

  private renderMagic(particle: Particle, size: number): void {
    if (!this.ctx) return;
    
    // 星形の魔法効果
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size * 0.4;
    
    this.ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i * Math.PI) / spikes;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = particle.x + Math.cos(angle) * radius;
      const y = particle.y + Math.sin(angle) * radius;
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.closePath();
    this.ctx.fill();
    
    // グロー効果
    this.ctx.shadowBlur = size * 1.5;
    this.ctx.shadowColor = particle.color;
    this.ctx.fill();
  }

  private renderWater(particle: Particle, size: number): void {
    if (!this.ctx) return;
    
    // 水滴の形状
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y - size * 0.3, size * 0.8, 0, Math.PI * 2);
    this.ctx.fill();
    
    // 光の反射
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.globalAlpha = particle.opacity * 0.6;
    this.ctx.beginPath();
    this.ctx.arc(particle.x - size * 0.3, particle.y - size * 0.5, size * 0.3, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private renderDefault(particle: Particle, size: number): void {
    if (!this.ctx) return;
    
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * アニメーションループ
   */
  private startAnimation(): void {
    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;

      if (deltaTime < 0.1) { // 最大フレームレート制限
        this.updateParticles(deltaTime);
        this.render();
      }

      this.animationId = requestAnimationFrame(animate);
    };

    this.animationId = requestAnimationFrame(animate);
  }

  /**
   * エミッター制御
   */
  stopEmitter(id: string): void {
    const emitter = this.emitters.find(e => e.id === id);
    if (emitter) {
      emitter.active = false;
    }
  }

  removeEmitter(id: string): void {
    this.emitters = this.emitters.filter(e => e.id !== id);
  }

  clearAllParticles(): void {
    this.particles = [];
    this.emitters = [];
  }

  /**
   * システム停止
   */
  destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.clearAllParticles();
  }

  /**
   * パフォーマンス監視
   */
  getPerformanceStats(): {
    particleCount: number;
    emitterCount: number;
    activeEmitters: number;
  } {
    return {
      particleCount: this.particles.length,
      emitterCount: this.emitters.length,
      activeEmitters: this.emitters.filter(e => e.active).length
    };
  }
}