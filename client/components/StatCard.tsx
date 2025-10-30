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
import ThemedStatCard from './ThemedStatCard';

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
  // 변경 요약(change)과 subtitle은 현재 ThemedStatCard에서 직접 표시하지 않지만,
  // 설명(description)에 우선 표시되도록 합성합니다.
  const composedDescription = description || subtitle;
  return (
    <ThemedStatCard
      title={title}
      value={typeof value === 'number' ? value : value}
      icon={typeof icon === 'string' ? <span className="text-2xl">{icon}</span> : icon}
      color={color as any}
      description={composedDescription}
      className={className}
      onClick={onClick}
      href={href}
    />
  );
}

export default StatCard;
