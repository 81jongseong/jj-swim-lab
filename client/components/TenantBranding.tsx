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
import { logger } from '@/lib/logger';

import React from 'react';
import { useTenantSettings } from '@/contexts/TenantSettingsContext';

interface TenantBrandingProps {
  showLogo?: boolean;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TenantLogo({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  let branding = null;
  try {
    const settings = useTenantSettings();
    branding = settings.branding;
  } catch {
    // TenantSettingsContext가 없으면 기본 로고 사용
  }
  
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  if (branding?.logo) {
    // 로고 URL이 상대 경로인 경우 서버 URL 추가
    const logoUrl = branding.logo.startsWith('http') 
      ? branding.logo 
      : `http://localhost:5000${branding.logo}`;
    
    return (
      <div className={`${sizeMap[size]} ${className} relative`}>
        <img
          src={logoUrl}
          alt="센터 로고"
          className="w-full h-full object-contain rounded-lg"
          onError={(e) => {
            logger.error('로고 이미지 로드 실패:', logoUrl);
            // 로드 실패 시 기본 로고로 대체
            (e.target as HTMLImageElement).style.display = 'none';
            const parent = (e.target as HTMLImageElement).parentElement;
            if (parent) {
              parent.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center"><span class="text-white font-bold text-lg">J</span></div>';
            }
          }}
          onLoad={() => {
            logger.info('✅ 로고 이미지 로드 성공:', logoUrl);
          }}
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
  let branding = null;
  try {
    const settings = useTenantSettings();
    branding = settings.branding;
  } catch {
    // TenantSettingsContext가 없으면 기본 브랜딩 사용
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {showLogo && <TenantLogo size={size} />}
      {showName && (
        <span 
          className="font-bold text-xl text-white" 
          style={{ 
            color: branding?.primaryColor || undefined 
          }}
        >
          {branding?.name || 'JJ Swim Lab'}
        </span>
      )}
    </div>
  );
}

