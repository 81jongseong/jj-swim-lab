/**
 * 📄 페이지 헤더 컴포넌트
 * 
 * 📋 **컴포넌트 목적**:
 * - 페이지 상단 헤더 일관성 제공
 * - 제목, 설명, 액션 버튼 포함
 * 
 * 🔗 **연동 파일**:
 * - 모든 페이지
 */

'use client';

import React, { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  className = ''
}: PageHeaderProps) {
  return (
    <div className={`mb-6 ${className}`}>
      {breadcrumbs && (
        <div className="mb-4">
          {breadcrumbs}
        </div>
      )}
      
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="mt-2 text-gray-600">{description}</p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

