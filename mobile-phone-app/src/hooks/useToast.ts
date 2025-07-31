'use client';

import { useState, useCallback } from 'react';
import { ToastMessage, ToastType } from '@/components/Toast';

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((
    type: ToastType,
    title: string,
    message: string,
    duration?: number
  ) => {
    const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const newToast: ToastMessage = {
      id,
      type,
      title,
      message,
      duration,
    };

    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = useCallback((title: string, message: string, duration?: number) => {
    return addToast('success', title, message, duration);
  }, [addToast]);

  const error = useCallback((title: string, message: string, duration?: number) => {
    return addToast('error', title, message, duration);
  }, [addToast]);

  const warning = useCallback((title: string, message: string, duration?: number) => {
    return addToast('warning', title, message, duration);
  }, [addToast]);

  const info = useCallback((title: string, message: string, duration?: number) => {
    return addToast('info', title, message, duration);
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
  };
};