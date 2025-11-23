/**
 * 범용 엔티티 카드 컴포넌트
 * 
 * 컴포넌트 목적:
 * - 재사용 가능한 엔티티 카드 컴포넌트
 * - 다양한 엔티티 타입에 적용 가능
 * 
 * 연동 파일:
 * - 모든 카드 형태의 엔티티 표시가 필요한 페이지
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui';

interface EntityCardProps {
  title: string;
  description?: string;
  image?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export default function EntityCard({
  title,
  description,
  image,
  badge,
  actions,
  onClick,
  className = '',
  children
}: EntityCardProps) {
  return (
    <Card
      className={`${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''} ${className}`}
      onClick={onClick}
    >
      {image && (
        <div className="w-full h-48 bg-gray-200 rounded-t-lg overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
      )}
      
      <Card.Content className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Card.Title className="text-lg font-semibold">{title}</Card.Title>
          {badge && <div>{badge}</div>}
        </div>
        
        {description && (
          <Card.Description className="text-sm text-gray-600 mb-4">
            {description}
          </Card.Description>
        )}
        
        {children}
        
        {actions && (
          <div className="mt-4 flex items-center gap-2">
            {actions}
          </div>
        )}
      </Card.Content>
    </Card>
  );
}

