/**
 * ⚡ JJ Swim Lab - 빠른 액션 카드 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 대시보드 빠른 액션 영역에 사용되는 카드 컴포넌트
 * - 일관된 디자인과 상호작용 제공
 * - 반응형 레이아웃 지원
 * 
 * 🔄 **주요 기능**
 * - 아이콘, 제목 표시
 * - 호버 효과 및 클릭 액션
 * - 색상 테마 커스터마이징
 * 
 * 🗄️ **데이터 연동**
 * - 외부에서 href 또는 onClick으로 연결
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-09: 초기 구현
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface QuickActionCardProps {
  title: string;
  icon: React.ReactNode | LucideIcon;
  href?: string;
  onClick?: () => void;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'indigo' | 'pink' | 'red' | 'yellow';
  emoji?: string;
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    hoverBg: 'hover:bg-blue-50',
    hoverBorder: 'hover:border-blue-300',
  },
  green: {
    bg: 'bg-green-100',
    iconColor: 'text-green-600',
    hoverBg: 'hover:bg-green-50',
    hoverBorder: 'hover:border-green-300',
  },
  purple: {
    bg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    hoverBg: 'hover:bg-purple-50',
    hoverBorder: 'hover:border-purple-300',
  },
  orange: {
    bg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    hoverBg: 'hover:bg-orange-50',
    hoverBorder: 'hover:border-orange-300',
  },
  indigo: {
    bg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    hoverBg: 'hover:bg-indigo-50',
    hoverBorder: 'hover:border-indigo-300',
  },
  pink: {
    bg: 'bg-pink-100',
    iconColor: 'text-pink-600',
    hoverBg: 'hover:bg-pink-50',
    hoverBorder: 'hover:border-pink-300',
  },
  red: {
    bg: 'bg-red-100',
    iconColor: 'text-red-600',
    hoverBg: 'hover:bg-red-50',
    hoverBorder: 'hover:border-red-300',
  },
  yellow: {
    bg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    hoverBg: 'hover:bg-yellow-50',
    hoverBorder: 'hover:border-yellow-300',
  },
};

export default function QuickActionCard({
  title,
  icon,
  href,
  onClick,
  color = 'blue',
  emoji,
}: QuickActionCardProps) {
  const colorVariant = colorVariants[color];
  const IconComponent = typeof icon === 'function' ? icon : null;
  const iconNode = IconComponent ? <IconComponent className={`h-6 w-6 ${colorVariant.iconColor}`} /> : icon;

  const baseClassName = `h-24 flex flex-col items-center justify-center space-y-2 border rounded-lg transition-all cursor-pointer ${colorVariant.hoverBg} ${colorVariant.hoverBorder}`;

  const content = (
    <>
      <div className="w-10 h-10 rounded-full flex items-center justify-center">
        {emoji ? (
          <span className="text-2xl">{emoji}</span>
        ) : (
          <div className={`w-full h-full rounded-full ${colorVariant.bg} flex items-center justify-center`}>
            {iconNode}
          </div>
        )}
      </div>
      <span className="text-sm font-medium">{title}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={baseClassName}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={baseClassName} type="button">
        {content}
      </button>
    );
  }

  return (
    <div className={baseClassName}>
      {content}
    </div>
  );
}

