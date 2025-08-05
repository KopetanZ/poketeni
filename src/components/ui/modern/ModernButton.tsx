'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ModernUISystem } from '@/lib/ui-system/modern-ui-system';

interface ModernButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'pokemon';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  pokemonType?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function ModernButton({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  loading = false,
  pokemonType,
  icon,
  className = ''
}: ModernButtonProps) {
  const uiSystem = ModernUISystem.getInstance();
  const theme = uiSystem.getPokemonTheme();
  const animations = uiSystem.getAnimationPresets();

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const getButtonStyle = () => {
    if (pokemonType && variant === 'pokemon') {
      const typeColor = uiSystem.getPokemonTypeColor(pokemonType);
      return {
        background: `linear-gradient(135deg, ${typeColor} 0%, ${typeColor}CC 100%)`,
        color: 'white',
        boxShadow: `0 4px 15px ${typeColor}40`
      };
    }

    const styles = uiSystem.generateButtonStyles(variant);
    return styles;
  };

  return (
    <motion.button
      className={`
        relative overflow-hidden font-semibold rounded-xl border-none outline-none cursor-pointer
        flex items-center justify-center gap-2 transition-all duration-300
        ${sizeClasses[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      style={getButtonStyle()}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      initial="initial"
      animate="animate"
      whileHover={disabled ? {} : { scale: 1.02, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* 光る効果 */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
        style={{ transform: 'translateX(-100%)' }}
        animate={{ transform: 'translateX(200%)' }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 3
        }}
      />

      {/* アイコン */}
      {icon && !loading && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          {icon}
        </motion.div>
      )}

      {/* ローディングスピナー */}
      {loading && (
        <motion.div
          className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* テキスト */}
      <motion.span
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        {children}
      </motion.span>

      {/* Pokemon Type Badge */}
      {pokemonType && (
        <motion.div
          className="absolute -top-1 -right-1 bg-white text-xs px-2 py-1 rounded-full shadow-lg"
          style={{ color: uiSystem.getPokemonTypeColor(pokemonType) }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
        >
          {pokemonType}
        </motion.div>
      )}
    </motion.button>
  );
}