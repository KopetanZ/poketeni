'use client';

import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { ParticlesSystem } from '@/lib/3d-effects/particles-system';

export interface ParticlesCanvasRef {
  createPokemonEffect: (x: number, y: number, type: string, intensity?: 'low' | 'medium' | 'high') => string;
  createSpecialEffect: (x: number, y: number, effect: 'explosion' | 'victory' | 'levelup' | 'critical' | 'combo') => void;
  stopEffect: (id: string) => void;
  clearAll: () => void;
  getStats: () => { particleCount: number; emitterCount: number; activeEmitters: number };
}

interface ParticlesCanvasProps {
  className?: string;
  style?: React.CSSProperties;
}

export const ParticlesCanvas = forwardRef<ParticlesCanvasRef, ParticlesCanvasProps>(
  ({ className = '', style = {} }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesSystemRef = useRef<ParticlesSystem | null>(null);

    useEffect(() => {
      if (canvasRef.current) {
        particlesSystemRef.current = ParticlesSystem.getInstance();
        particlesSystemRef.current.initialize(canvasRef.current);
      }

      return () => {
        particlesSystemRef.current?.destroy();
      };
    }, []);

    useImperativeHandle(ref, () => ({
      createPokemonEffect: (x: number, y: number, type: string, intensity: 'low' | 'medium' | 'high' = 'medium') => {
        if (!particlesSystemRef.current) return '';
        return particlesSystemRef.current.createPokemonEmitter(x, y, type, intensity);
      },
      createSpecialEffect: (x: number, y: number, effect: 'explosion' | 'victory' | 'levelup' | 'critical' | 'combo') => {
        particlesSystemRef.current?.createSpecialEffect(x, y, effect);
      },
      stopEffect: (id: string) => {
        particlesSystemRef.current?.stopEmitter(id);
      },
      clearAll: () => {
        particlesSystemRef.current?.clearAllParticles();
      },
      getStats: () => {
        return particlesSystemRef.current?.getPerformanceStats() || {
          particleCount: 0,
          emitterCount: 0,
          activeEmitters: 0
        };
      }
    }), []);

    return (
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 pointer-events-none z-10 ${className}`}
        style={{
          ...style,
          width: '100%',
          height: '100%'
        }}
      />
    );
  }
);

ParticlesCanvas.displayName = 'ParticlesCanvas';