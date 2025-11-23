/**
 * ✅ JJ Swim Lab - Toast 컨테이너 컴포넌트
 * 
 * 📋 **기능**
 * - 여러 Toast 알림 관리
 * - Toast 추가/제거
 * - 자동 정렬 및 애니메이션
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Toast, ToastType } from './Toast';

export interface ToastItem {
  id: string | number;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContainerProps {
  className?: string;
  toasts?: ToastItem[];
  onRemove?: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ 
  className = '', 
  toasts: externalToasts, 
  onRemove: externalOnRemove 
}) => {
  const [internalToasts, setInternalToasts] = useState<ToastItem[]>([]);
  
  // 외부에서 전달된 toasts가 있으면 사용, 없으면 내부 상태 사용
  const toasts = externalToasts || internalToasts;
  const setToasts = externalToasts ? (() => {}) : setInternalToasts;

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string | number) => {
    if (externalOnRemove) {
      externalOnRemove(id.toString());
    } else {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }
  }, [externalOnRemove]);

  // 전역 함수로 사용할 수 있도록 window 객체에 추가
  React.useEffect(() => {
    (window as any).showToast = addToast;
    return () => {
      delete (window as any).showToast;
    };
  }, [addToast]);

  return (
    <div className={`fixed top-4 right-4 z-50 space-y-2 ${className}`}>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="transform transition-all duration-300"
          style={{
            transform: `translateY(${index * 20}px)`,
            zIndex: 1000 - index
          }}
        >
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
