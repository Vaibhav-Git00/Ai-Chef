import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    
    // Prevent duplicate messages - check if same message already exists
    setToasts((prev) => {
      const isDuplicate = prev.some(
        (toast) => toast.message === message && toast.type === type
      );
      if (isDuplicate) {
        return prev; // Don't add duplicate
      }
      return [...prev, { id, message, type, duration }];
    });

    if (duration > 0) {
      const timer = setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, duration);

      return () => clearTimeout(timer);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value = {
    addToast,
    removeToast,
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    info: (message, duration) => addToast(message, 'info', duration),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, onRemove }) => {
  const getStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500/20',
          border: 'border-green-500/50',
          text: 'text-green-200',
          icon: '✅'
        };
      case 'error':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500/50',
          text: 'text-red-200',
          icon: '❌'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/50',
          text: 'text-yellow-200',
          icon: '⚠️'
        };
      default:
        return {
          bg: 'bg-blue-500/20',
          border: 'border-blue-500/50',
          text: 'text-blue-200',
          icon: 'ℹ️'
        };
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3 pointer-events-none max-w-sm">
      <AnimatePresence>
        {toasts.slice(-3).map((toast) => {
          const styles = getStyles(toast.type);
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 100, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`${styles.bg} ${styles.border} border rounded-lg p-4 w-96 max-w-full pointer-events-auto shadow-lg backdrop-blur-sm`}
              onClick={() => onRemove(toast.id)}
              role="alert"
              aria-live="polite"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{styles.icon}</span>
                <p className={`${styles.text} text-sm flex-1 font-medium`}>{toast.message}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(toast.id);
                  }}
                  className="text-white/50 hover:text-white/80 flex-shrink-0 transition-colors"
                  aria-label="Close notification"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastProvider;
