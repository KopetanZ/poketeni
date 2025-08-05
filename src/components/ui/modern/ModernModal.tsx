'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ModernUISystem } from '@/lib/ui-system/modern-ui-system';

interface ModernModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  pokemonTheme?: boolean;
  pokemonType?: string;
}

export function ModernModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  pokemonTheme = false,
  pokemonType
}: ModernModalProps) {
  const uiSystem = ModernUISystem.getInstance();
  const theme = uiSystem.getPokemonTheme();

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getModalStyle = () => {
    if (pokemonTheme && pokemonType) {
      const typeColor = uiSystem.getPokemonTypeColor(pokemonType);
      return {
        background: `linear-gradient(135deg, ${theme.colors.surface} 0%, ${typeColor}10 100%)`,
        border: `2px solid ${typeColor}40`,
        boxShadow: `0 25px 50px ${typeColor}20`
      };
    }

    return {
      background: theme.colors.surface,
      boxShadow: theme.shadows.xl
    };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Backdrop Blur Effect */}
          <motion.div
            className="absolute inset-0 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          />

          {/* Modal */}
          <motion.div
            className={`relative w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden rounded-3xl`}
            style={getModalStyle()}
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              duration: 0.4 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pokemon Type Background Pattern */}
            {pokemonTheme && pokemonType && (
              <div className="absolute inset-0 opacity-5">
                <div 
                  className="absolute inset-0 bg-repeat opacity-30"
                  style={{
                    backgroundImage: `radial-gradient(circle at 20% 80%, ${uiSystem.getPokemonTypeColor(pokemonType)} 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${uiSystem.getPokemonTypeColor(pokemonType)} 0%, transparent 50%)`,
                    backgroundSize: '100px 100px'
                  }}
                />
              </div>
            )}

            {/* Header */}
            {title && (
              <motion.div
                className="flex items-center justify-between p-6 border-b border-gray-200"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  {pokemonType && (
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: uiSystem.getPokemonTypeColor(pokemonType) }}
                    />
                  )}
                  {title}
                </h2>
                
                <motion.button
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={24} />
                </motion.button>
              </motion.div>
            )}

            {/* Content */}
            <motion.div
              className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {children}
            </motion.div>

            {/* Close button when no title */}
            {!title && (
              <motion.button
                className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-white hover:bg-opacity-80 rounded-full transition-all z-10"
                onClick={onClose}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={24} />
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Modal context and hook for easy usage
import { createContext, useContext, useState } from 'react';

interface ModalContextType {
  openModal: (modalId: string, content: React.ReactNode, options?: Partial<ModernModalProps>) => void;
  closeModal: () => void;
  isOpen: boolean;
  modalId: string | null;
}

const ModalContext = createContext<ModalContextType | null>(null);

export function ModernModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalId, setModalId] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [modalOptions, setModalOptions] = useState<Partial<ModernModalProps>>({});

  const openModal = (id: string, content: React.ReactNode, options: Partial<ModernModalProps> = {}) => {
    setModalId(id);
    setModalContent(content);
    setModalOptions(options);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      setModalId(null);
      setModalContent(null);
      setModalOptions({});
    }, 300);
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal, isOpen, modalId }}>
      {children}
      <ModernModal
        isOpen={isOpen}
        onClose={closeModal}
        {...modalOptions}
      >
        {modalContent}
      </ModernModal>
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModernModalProvider');
  }
  return context;
}