'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CSS3DTransforms } from '@/lib/3d-effects/css-3d-transforms';
import { ModernCard } from '@/components/ui/modern';

interface Enhanced3DCardProps {
  children: React.ReactNode;
  pokemonType?: string;
  glowIntensity?: 'low' | 'medium' | 'high';
  tiltSensitivity?: number;
  floatingAnimation?: boolean;
  onHover?: (isHovering: boolean) => void;
  onClick?: () => void;
  className?: string;
}

export function Enhanced3DCard({
  children,
  pokemonType,
  glowIntensity = 'medium',
  tiltSensitivity = 15,
  floatingAnimation = true,
  onHover,
  onClick,
  className = ''
}: Enhanced3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const transforms3D = CSS3DTransforms.getInstance();
  const [isHovering, setIsHovering] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  // エントランスアニメーション
  useEffect(() => {
    if (cardRef.current && pokemonType && !hasEntered) {
      transforms3D.pokemonTypeEntrance(cardRef.current, pokemonType)
        .then(() => setHasEntered(true));
    }
  }, [pokemonType, hasEntered, transforms3D]);

  // 浮遊アニメーション
  useEffect(() => {
    if (cardRef.current && floatingAnimation && hasEntered) {
      const animationId = transforms3D.floatingCard(cardRef.current, 'subtle');
      return () => {
        if (cardRef.current) {
          transforms3D.stopAnimation(cardRef.current, animationId);
        }
      };
    }
  }, [floatingAnimation, hasEntered, transforms3D]);

  // ティルト効果
  useEffect(() => {
    if (cardRef.current && hasEntered) {
      const cleanup = transforms3D.setupTiltEffect(cardRef.current, tiltSensitivity);
      return cleanup;
    }
  }, [tiltSensitivity, hasEntered, transforms3D]);

  // GPU加速
  useEffect(() => {
    if (cardRef.current) {
      transforms3D.enableGPUAcceleration(cardRef.current);
      return () => {
        if (cardRef.current) {
          transforms3D.disableGPUAcceleration(cardRef.current);
        }
      };
    }
  }, [transforms3D]);

  const handleMouseEnter = () => {
    setIsHovering(true);
    onHover?.(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    onHover?.(false);
  };

  const getGlowStyles = () => {
    if (!pokemonType || !isHovering) return {};

    const glowColors = {
      fire: 'rgba(240, 128, 48, 0.6)',
      water: 'rgba(104, 144, 240, 0.6)',
      electric: 'rgba(248, 208, 48, 0.6)',
      grass: 'rgba(120, 200, 80, 0.6)',
      psychic: 'rgba(248, 88, 136, 0.6)',
      ice: 'rgba(168, 230, 207, 0.6)',
      dragon: 'rgba(112, 56, 248, 0.6)',
      normal: 'rgba(168, 168, 120, 0.6)'
    };

    const glowSizes = {
      low: '10px',
      medium: '20px',
      high: '30px'
    };

    const color = glowColors[pokemonType as keyof typeof glowColors] || glowColors.normal;
    const size = glowSizes[glowIntensity];

    return {
      boxShadow: `0 0 ${size} ${color}, 0 0 ${parseInt(size) * 2}px ${color.replace('0.6', '0.3')}`,
      filter: `brightness(1.1) contrast(1.1)`
    };
  };

  return (
    <motion.div
      ref={cardRef}
      className={`enhanced-3d-card ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        ...getGlowStyles()
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: hasEntered ? 1 : 0 }}
      whileHover={{ 
        scale: 1.05,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
      whileTap={{ scale: 0.95 }}
    >
      <ModernCard
        variant={pokemonType ? 'pokemon' : 'default'}
        pokemonType={pokemonType}
        hover={false} // 3D効果で処理するため無効化
        className="h-full transform-gpu"
      >
        {children}

        {/* ホログラム効果 */}
        {isHovering && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{
              background: `linear-gradient(45deg, 
                transparent 30%, 
                rgba(255, 255, 255, 0.1) 50%, 
                transparent 70%
              )`,
              backgroundSize: '200% 200%'
            }}
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        )}

        {/* レインボー効果（レア度が高い場合） */}
        {pokemonType === 'dragon' && isHovering && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{
              background: `conic-gradient(
                from 0deg,
                #ff0000, #ff8000, #ffff00, #80ff00, #00ff00,
                #00ff80, #00ffff, #0080ff, #0000ff, #8000ff,
                #ff00ff, #ff0080, #ff0000
              )`,
              opacity: 0.1,
              animation: 'spin 3s linear infinite'
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        )}

        {/* 電気効果 */}
        {pokemonType === 'electric' && isHovering && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at var(--x, 50%) var(--y, 50%), 
                rgba(248, 208, 48, 0.3) 0%, 
                transparent 50%
              )`
            }}
            animate={{
              '--x': ['20%', '80%', '20%'],
              '--y': ['30%', '70%', '30%']
            } as any}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}

        {/* 炎効果 */}
        {pokemonType === 'fire' && isHovering && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute pointer-events-none"
                style={{
                  width: '4px',
                  height: '20px',
                  background: 'linear-gradient(to top, #ff6b35, #ffd93d)',
                  borderRadius: '2px',
                  left: `${30 + i * 20}%`,
                  bottom: '10px',
                  transformOrigin: 'bottom center'
                }}
                animate={{
                  scaleY: [1, 1.5, 1],
                  scaleX: [1, 0.8, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </>
        )}

        {/* 水の波紋効果 */}
        {pokemonType === 'water' && isHovering && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden"
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border-2 border-blue-300"
                style={{
                  width: '20px',
                  height: '20px',
                  left: '50%',
                  top: '50%',
                  marginLeft: '-10px',
                  marginTop: '-10px'
                }}
                animate={{
                  scale: [0, 3],
                  opacity: [0.8, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.7,
                  ease: "easeOut"
                }}
              />
            ))}
          </motion.div>
        )}
      </ModernCard>
    </motion.div>
  );
}