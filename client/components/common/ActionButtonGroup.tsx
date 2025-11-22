/**
 * 액션 버튼 그룹 컴포넌트
 * 
 * 컴포넌트 목적:
 * - 재사용 가능한 액션 버튼 그룹 컴포넌트
 * - 일관된 버튼 그룹 UI 제공
 * 
 * 연동 파일:
 * - 모든 액션 버튼 그룹이 필요한 페이지
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

export interface ActionButton {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface ActionButtonGroupProps {
  actions: ActionButton[];
  className?: string;
  align?: 'left' | 'right' | 'center' | 'between';
}

export default function ActionButtonGroup({
  actions,
  className = '',
  align = 'right'
}: ActionButtonGroupProps) {
  const alignClasses = {
    left: 'justify-start',
    right: 'justify-end',
    center: 'justify-center',
    between: 'justify-between'
  };

  return (
    <div className={`flex items-center gap-2 ${alignClasses[align]} ${className}`}>
      {actions.map((action, index) => (
        <Button
          key={index}
          onClick={action.onClick}
          variant={action.variant || 'primary'}
          disabled={action.disabled}
        >
          {action.icon && <span className="mr-2">{action.icon}</span>}
          {action.label}
        </Button>
      ))}
    </div>
  );
}

