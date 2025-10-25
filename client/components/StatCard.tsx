/**
 * 통계 카드 컴포넌트
 * 
 * 연동되는 데이터:
 * - title: 카드 제목
 * - value: 메인 값
 * - icon: 아이콘 (이모지)
 * - color: 색상 테마
 * - change: 변화량 (선택사항)
 * - subtitle: 부제목 (선택사항)
 * 
 * 연동되는 파일:
 * - 사용하는 페이지: admin/center-statistics, admin/revenue-management, admin/dashboard 등
 */

'use client';

import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: string | React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'yellow' | 'indigo';
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  subtitle?: string;
  description?: string;
  className?: string;
  onClick?: () => void;
  href?: string;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    text: 'text-blue-600',
    icon: 'text-blue-600'
  },
  green: {
    bg: 'bg-green-50',
    iconBg: 'bg-green-100',
    text: 'text-green-600',
    icon: 'text-green-600'
  },
  red: {
    bg: 'bg-red-50',
    iconBg: 'bg-red-100',
    text: 'text-red-600',
    icon: 'text-red-600'
  },
  purple: {
    bg: 'bg-purple-50',
    iconBg: 'bg-purple-100',
    text: 'text-purple-600',
    icon: 'text-purple-600'
  },
  orange: {
    bg: 'bg-orange-50',
    iconBg: 'bg-orange-100',
    text: 'text-orange-600',
    icon: 'text-orange-600'
  },
  yellow: {
    bg: 'bg-yellow-50',
    iconBg: 'bg-yellow-100',
    text: 'text-yellow-600',
    icon: 'text-yellow-600'
  },
  indigo: {
    bg: 'bg-indigo-50',
    iconBg: 'bg-indigo-100',
    text: 'text-indigo-600',
    icon: 'text-indigo-600'
  }
};

const changeIcons = {
  increase: '↗️',
  decrease: '↘️',
  neutral: '➡️'
};

const changeColors = {
  increase: 'text-green-600',
  decrease: 'text-red-600',
  neutral: 'text-gray-600'
};

export function StatCard({
  title,
  value,
  icon,
  color,
  change,
  subtitle,
  description,
  className = '',
  onClick,
  href
}: StatCardProps) {
  const colors = colorClasses[color];

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      window.location.href = href;
    }
  };

  const isClickable = onClick || href;
  const clickableClasses = isClickable 
    ? 'cursor-pointer hover:shadow-lg hover:scale-105 transform transition-all duration-200' 
    : '';

  return (
    <div 
      className={`${colors.bg} rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow ${clickableClasses} ${className}`}
      onClick={isClickable ? handleClick : undefined}
    >
      <div className="flex items-center">
        <div className={`p-2 ${colors.iconBg} rounded-lg`}>
          {typeof icon === 'string' ? (
            <span className={`text-2xl ${colors.icon}`}>{icon}</span>
          ) : (
            <div className={colors.icon}>{icon}</div>
          )}
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${colors.text}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
          {change && (
            <div className="flex items-center mt-1">
              <span className={`text-xs ${changeColors[change.type]}`}>
                {changeIcons[change.type]} {Math.abs(change.value)}%
              </span>
              <span className="text-xs text-gray-500 ml-1">전월 대비</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatCard;
