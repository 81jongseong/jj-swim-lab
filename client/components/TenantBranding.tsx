/**
 * 테넌트 브랜딩 컴포넌트: 로고 및 브랜딩 표시
 *
 * 연동되는 데이터:
 * - TenantSettingsContext의 branding 정보
 *
 * 연동되는 파일:
 * - client/components/DashboardLayout.tsx (사이드바 로고 영역)
 * - client/app/center/[centerSlug]/admin/* (레이아웃)
 */

'use client';

import React from 'react';
import { useTenantSettings } from '@/contexts/TenantSettingsContext';

interface TenantBrandingProps {
  showLogo?: boolean;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TenantLogo({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const { branding } = useTenantSettings();
  
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  if (branding?.logo) {
    return (
      <div className={`${sizeMap[size]} ${className} relative`}>
        <img
          src={branding.logo}
          alt="센터 로고"
          className="w-full h-full object-contain rounded-lg"
        />
      </div>
    );
  }

  // 기본 로고 (로고가 없을 때)
  return (
    <div className={`${sizeMap[size]} ${className} bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg`}>
      <span className="text-white font-bold text-lg">J</span>
    </div>
  );
}

export function TenantBranding({ showLogo = true, showName = true, size = 'md', className = '' }: TenantBrandingProps) {
  const { branding } = useTenantSettings();

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {showLogo && <TenantLogo size={size} />}
      {showName && (
        <span className="font-bold text-xl text-white" style={{ 
          color: branding?.primaryColor ? `var(--tenant-primary-color, #fff)` : undefined 
        }}>
          JJ Swim Lab
        </span>
      )}
    </div>
  );
}

