'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { ModernUISystem, UINotification } from '@/lib/ui-system/modern-ui-system';

interface ModernNotificationProps {
  notification: UINotification;
  onClose: (id: string) => void;
}

export function ModernNotification({ notification, onClose }: ModernNotificationProps) {
  const [progress, setProgress] = useState(100);
  const uiSystem = ModernUISystem.getInstance();
  const theme = uiSystem.getPokemonTheme();

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (notification.duration! / 100));
          if (newProgress <= 0) {
            onClose(notification.id);
            return 0;
          }
          return newProgress;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [notification.duration, notification.id, onClose]);

  const getIcon = () => {
    switch (notification.type) {
      case 'success': return CheckCircle;
      case 'error': return AlertCircle;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
    }
  };

  const getColors = () => {
    switch (notification.type) {
      case 'success':
        return {
          bg: 'from-green-500 to-emerald-500',
          icon: 'text-green-100',
          progress: 'bg-green-300'
        };
      case 'error':
        return {
          bg: 'from-red-500 to-rose-500',
          icon: 'text-red-100',
          progress: 'bg-red-300'
        };
      case 'warning':
        return {
          bg: 'from-yellow-500 to-orange-500',
          icon: 'text-yellow-100',
          progress: 'bg-yellow-300'
        };
      case 'info':
        return {
          bg: 'from-blue-500 to-cyan-500',
          icon: 'text-blue-100',
          progress: 'bg-blue-300'
        };
    }
  };

  const colors = getColors();
  const Icon = getIcon();

  return (
    <motion.div
      className={`relative p-4 rounded-2xl shadow-2xl text-white overflow-hidden bg-gradient-to-r ${colors.bg} backdrop-blur-lg`}
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      layout
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black bg-opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-10" />
      </div>

      {/* Progress Bar */}
      {notification.duration && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-white bg-opacity-30 rounded-full"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      )}

      <div className="relative z-10 flex items-start gap-3">
        {/* Icon */}
        <motion.div
          className={`mt-0.5 ${colors.icon}`}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 500 }}
        >
          <Icon size={24} />
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <motion.h4
            className="font-bold text-lg mb-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {notification.title}
          </motion.h4>
          
          <motion.p
            className="text-white text-opacity-90 text-sm leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {notification.message}
          </motion.p>

          {/* Action Button */}
          {notification.action && (
            <motion.button
              className="mt-3 px-4 py-2 bg-white bg-opacity-20 rounded-lg text-sm font-semibold hover:bg-opacity-30 transition-all duration-200"
              onClick={notification.action.callback}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {notification.action.label}
            </motion.button>
          )}
        </div>

        {/* Close Button */}
        <motion.button
          className="text-white text-opacity-70 hover:text-opacity-100 transition-opacity"
          onClick={() => onClose(notification.id)}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X size={20} />
        </motion.button>
      </div>

      {/* Sparkle Animation for Success */}
      {notification.type === 'success' && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

export function ModernNotificationContainer() {
  const [notifications, setNotifications] = useState<UINotification[]>([]);
  const uiSystem = ModernUISystem.getInstance();

  useEffect(() => {
    const handleNotificationAdded = (notification: UINotification) => {
      setNotifications(prev => [...prev, notification]);
    };

    const handleNotificationRemoved = (id: string) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    };

    uiSystem.on('notificationAdded', handleNotificationAdded);
    uiSystem.on('notificationRemoved', handleNotificationRemoved);

    return () => {
      uiSystem.off('notificationAdded', handleNotificationAdded);
      uiSystem.off('notificationRemoved', handleNotificationRemoved);
    };
  }, [uiSystem]);

  const handleClose = (id: string) => {
    uiSystem.removeNotification(id);
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <ModernNotification
            key={notification.id}
            notification={notification}
            onClose={handleClose}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}