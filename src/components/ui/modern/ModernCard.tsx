'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ModernUISystem } from '@/lib/ui-system/modern-ui-system';

interface ModernCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'gradient' | 'pokemon';
  pokemonType?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  glowEffect?: boolean;
}

export function ModernCard({
  children,
  variant = 'default',
  pokemonType,
  hover = true,
  padding = 'md',
  className = '',
  onClick,
  glowEffect = false
}: ModernCardProps) {
  const uiSystem = ModernUISystem.getInstance();
  const theme = uiSystem.getPokemonTheme();

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const getCardStyle = () => {
    switch (variant) {
      case 'glass':
        return {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        };
      
      case 'gradient':
        return {
          background: `linear-gradient(135deg, ${theme.colors.primary}20 0%, ${theme.colors.secondary}20 100%)`,
          border: `1px solid ${theme.colors.primary}40`
        };
      
      case 'pokemon':
        if (pokemonType) {
          const typeColor = uiSystem.getPokemonTypeColor(pokemonType);
          return {
            background: `linear-gradient(135deg, ${typeColor}10 0%, ${typeColor}20 100%)`,
            border: `2px solid ${typeColor}60`,
            boxShadow: glowEffect ? `0 0 30px ${typeColor}30` : theme.shadows.md
          };
        }
        return {};
      
      default:
        return {
          background: theme.colors.surface,
          border: `1px solid ${theme.colors.primary}20`,
          boxShadow: theme.shadows.md
        };
    }
  };

  return (
    <motion.div
      className={`
        relative rounded-2xl transition-all duration-300 cursor-pointer
        ${paddingClasses[padding]}
        ${className}
      `}
      style={getCardStyle()}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { 
        y: -8, 
        scale: 1.02,
        boxShadow: variant === 'pokemon' && pokemonType 
          ? `0 15px 40px ${uiSystem.getPokemonTypeColor(pokemonType)}40`
          : '0 15px 40px rgba(0, 0, 0, 0.15)'
      } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Background Animation */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0"
        style={{
          background: variant === 'pokemon' && pokemonType 
            ? `linear-gradient(135deg, ${uiSystem.getPokemonTypeColor(pokemonType)}20 0%, ${uiSystem.getPokemonTypeColor(pokemonType)}10 100%)`
            : `linear-gradient(135deg, ${theme.colors.primary}10 0%, ${theme.colors.secondary}10 100%)`
        }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Shimmer Effect */}
      {variant === 'pokemon' && (
        <motion.div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10"
            style={{ transform: 'translateX(-100%)' }}
            animate={{ transform: 'translateX(200%)' }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: 2
            }}
          />
        </motion.div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Type Badge */}
      {pokemonType && variant === 'pokemon' && (
        <motion.div
          className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg"
          style={{ backgroundColor: uiSystem.getPokemonTypeColor(pokemonType) }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
        >
          {pokemonType.toUpperCase()}
        </motion.div>
      )}
    </motion.div>
  );
}