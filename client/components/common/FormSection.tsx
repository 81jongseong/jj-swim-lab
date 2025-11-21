/**
 * 📝 폼 섹션 컴포넌트
 * 
 * 📋 **컴포넌트 목적**:
 * - 폼의 섹션을 구분하고 일관된 스타일 제공
 * - 제목, 설명, 필수 표시 포함
 * 
 * 🔗 **연동 파일**:
 * - 모든 폼 페이지
 */

'use client';

import React, { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  description?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export default function FormSection({
  title,
  description,
  required = false,
  children,
  className = '',
  collapsible = false,
  defaultCollapsed = false
}: FormSectionProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            {title}
            {required && <span className="text-red-500">*</span>}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          )}
        </div>
        
        {collapsible && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isCollapsed ? '▼' : '▲'}
          </button>
        )}
      </div>
      
      {!isCollapsed && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
}

