'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui';

type ColorVariant = 'blue' | 'yellow' | 'orange' | 'green' | 'purple' | 'red';

interface ThemedStatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: ColorVariant; // optional at runtime
  description?: string;
  className?: string;
  onClick?: () => void;
  href?: string;
}

const VARIANT_STYLES: Record<ColorVariant, { bg: string; border: string; hoverBg: string; hoverBorder: string; title: string; value: string; icon: string }>= {
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   hoverBg: 'hover:bg-blue-100',   hoverBorder: 'hover:border-blue-300',   title: 'text-blue-700',   value: 'text-blue-600',   icon: 'text-blue-600' },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', hoverBg: 'hover:bg-yellow-100', hoverBorder: 'hover:border-yellow-300', title: 'text-yellow-700', value: 'text-yellow-600', icon: 'text-yellow-600' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', hoverBg: 'hover:bg-orange-100', hoverBorder: 'hover:border-orange-300', title: 'text-orange-700', value: 'text-orange-600', icon: 'text-orange-600' },
  green:  { bg: 'bg-green-50',  border: 'border-green-200',  hoverBg: 'hover:bg-green-100',  hoverBorder: 'hover:border-green-300',  title: 'text-green-700',  value: 'text-green-600',  icon: 'text-green-600' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', hoverBg: 'hover:bg-purple-100', hoverBorder: 'hover:border-purple-300', title: 'text-purple-700', value: 'text-purple-600', icon: 'text-purple-600' },
  red:    { bg: 'bg-red-50',    border: 'border-red-200',    hoverBg: 'hover:bg-red-100',    hoverBorder: 'hover:border-red-300',    title: 'text-red-700',    value: 'text-red-600',    icon: 'text-red-600' },
};

export default function ThemedStatCard({ title, value, icon, color = 'blue', description, className, onClick, href }: ThemedStatCardProps) {
  const safeColor: ColorVariant = (color && VARIANT_STYLES[color]) ? color : 'blue';
  const v = VARIANT_STYLES[safeColor];
  const isClickable = !!onClick || !!href;
  const handleClick = () => {
    if (onClick) onClick();
    else if (href) window.location.href = href;
  };

  return (
    <Card
      className={`${v.bg} ${v.border} border-2 ${v.hoverBg} ${v.hoverBorder} transition-all hover:shadow-lg ${isClickable ? 'cursor-pointer' : ''} ${className || ''}`}
      onClick={isClickable ? handleClick : undefined}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`text-sm font-medium ${v.title}`}>{title}</CardTitle>
        {icon ? <div className={v.icon}>{icon}</div> : null}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${v.value}`}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}


