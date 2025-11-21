/**
 * ✅ 확인 모달 컴포넌트
 * 
 * 📋 **컴포넌트 목적**:
 * - 삭제, 수정 등 확인이 필요한 작업에 사용
 * - 일관된 확인 모달 UI 제공
 * 
 * 🔗 **연동 파일**:
 * - 모든 삭제/수정 작업이 필요한 페이지
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = '확인',
  message,
  confirmText = '확인',
  cancelText = '취소',
  variant = 'info',
  isLoading = false
}: ConfirmModalProps) {
  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const variantStyles = {
    danger: {
      button: 'bg-red-600 hover:bg-red-700 text-white',
      icon: '🔴'
    },
    warning: {
      button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      icon: '⚠️'
    },
    info: {
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
      icon: 'ℹ️'
    }
  };

  const style = variantStyles[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="md"
    >
      <div className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <span className="text-3xl">{style.icon}</span>
          <p className="text-gray-700 flex-1">{message}</p>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className={style.button}
          >
            {isLoading ? '처리 중...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

