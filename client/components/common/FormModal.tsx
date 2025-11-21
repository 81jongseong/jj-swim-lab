/**
 * 범용 폼 모달 컴포넌트
 * 
 * 컴포넌트 목적:
 * - 재사용 가능한 폼 모달 컴포넌트
 * - 다양한 폼에 적용 가능
 * 
 * 연동 파일:
 * - 모든 폼 모달이 필요한 페이지
 */

'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  title: string;
  children: React.ReactNode;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export default function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitText = '저장',
  cancelText = '취소',
  isLoading = false,
  maxWidth = 'md'
}: FormModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth={maxWidth}
    >
      <form onSubmit={handleSubmit}>
        <div className="p-6">
          {children}
        </div>
        
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? '처리 중...' : submitText}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

