// 3D Effects Components Export
export { ParticlesCanvas } from './ParticlesCanvas';
export type { ParticlesCanvasRef } from './ParticlesCanvas';
export { Enhanced3DCard } from './Enhanced3DCard';

// Re-export 3D systems
export { ParticlesSystem } from '@/lib/3d-effects/particles-system';
export { CSS3DTransforms } from '@/lib/3d-effects/css-3d-transforms';
export type { 
  Particle, 
  ParticleEmitter,
  Transform3D,
  AnimationConfig 
} from '@/lib/3d-effects/particles-system';