'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AnimatedStatBarProps {
  label: string;
  value: number;
  maxValue: number;
  color: 'red' | 'blue' | 'yellow' | 'green' | 'purple';
  icon?: string;
  showValue?: boolean;
}

const colorVariants = {
  red: 'from-red-400 to-red-600',
  blue: 'from-blue-400 to-blue-600',
  yellow: 'from-yellow-400 to-yellow-600',
  green: 'from-green-400 to-green-600',
  purple: 'from-purple-400 to-purple-600',
};

export function AnimatedStatBar({ 
  label, 
  value, 
  maxValue, 
  color, 
  icon,
  showValue = true 
}: AnimatedStatBarProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const percentage = Math.min((value / maxValue) * 100, 100);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          {icon && <span>{icon}</span>}
          <span className="font-medium text-gray-700">{label}</span>
        </div>
        {showValue && (
          <span className="text-gray-600">{animatedValue}/{maxValue}</span>
        )}
      </div>
      
      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${colorVariants[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: 1.5, 
            ease: "easeOut",
            delay: 0.2
          }}
        />
        
        {/* キラキラエフェクト */}
        {percentage > 80 && (
          <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-end pr-1">
            <motion.span
              className="text-yellow-300 text-xs"
              animate={{ 
                opacity: [1, 0.5, 1],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              ✨
            </motion.span>
          </div>
        )}
      </div>
    </div>
  );
}