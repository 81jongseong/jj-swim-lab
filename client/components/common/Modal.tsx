/**
 * 재사용 가능한 모달 컴포넌트
 * 
 * 연동되는 파일:
 * - client/app/instructor/teaching-methods/page.tsx
 * - 기타 모달이 필요한 모든 페이지
 * 
 * 기능:
 * - 헤더 고정 (sticky)
 * - 헤더에 버튼 추가 가능
 * - 스크롤 가능한 본문
 * - 닫기 버튼
 */

'use client';

import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  headerButtons?: ReactNode; // 헤더에 추가할 버튼들
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl';
  className?: string;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl'
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  headerButtons,
  maxWidth = '4xl',
  className = ''
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg ${maxWidthClasses[maxWidth]} w-full max-h-[90vh] overflow-hidden flex flex-col ${className}`}>
        {/* 고정 헤더 */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <div className="flex items-center gap-2">
            {headerButtons && <div className="flex items-center gap-2">{headerButtons}</div>}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="닫기"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 스크롤 가능한 본문 */}
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}





