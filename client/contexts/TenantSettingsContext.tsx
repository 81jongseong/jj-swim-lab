/**
 * 테넌트 설정 컨텍스트: 글로벌 → 센터 → 사용자 설정 머지 및 브랜딩
 *
 * 연동되는 데이터:
 * - /api/centers/settings (글로벌→센터→사용자 설정 머지)
 * - Center 모델의 images.logo, images.mainImage (브랜딩)
 * - Center 모델의 settings (센터별 설정)
 *
 * 연동되는 파일:
 * - client/app/center/[centerSlug]/admin/layout.tsx
 * - hooks/useTenantSettings.ts (컨텍스트 훅)
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { apiClient } from '@/utils/api';

export interface TenantBranding {
  logo?: string;
  mainImage?: string;
  primaryColor?: string;
  secondaryColor?: string;
  theme?: 'light' | 'dark' | 'auto';
}

export interface TenantSettings {
  theme?: {
    color?: string;
    density?: 'compact' | 'comfortable' | 'spacious';
  };
  notifications?: {
    email?: boolean;
    sms?: boolean;
  };
  features?: {
    reports?: boolean;
    payments?: boolean;
    bookings?: boolean;
  };
  branding?: TenantBranding;
  [key: string]: any;
}

interface TenantSettingsContextValue {
  settings: TenantSettings | null;
  branding: TenantBranding | null;
  loading: boolean;
  error?: string;
  refresh: () => Promise<void>;
}

const TenantSettingsContext = createContext<TenantSettingsContextValue | undefined>(undefined);

export function TenantSettingsProvider({ children, centerId }: { children: React.ReactNode; centerId?: string }) {
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [branding, setBranding] = useState<TenantBranding | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(undefined);

      console.log(`🔄 테넌트 설정 로드 시작: centerId=${centerId}`);

      // centerId가 변경되면 localStorage도 업데이트하여 apiClient가 최신 값을 사용하도록 함
      if (centerId) {
        try {
          localStorage.setItem('centerId', centerId);
          document.cookie = `centerId=${encodeURIComponent(centerId)}; path=/; max-age=${60 * 60 * 24 * 7}`;
          console.log(`💾 centerId 저장 완료: ${centerId}`);
        } catch (e) {
          console.warn('centerId 저장 실패:', e);
        }
      }

      // 설정 머지 API 호출
      const response = await apiClient.get<{ success: boolean; data: TenantSettings }>('/api/centers/settings');
      console.log(`📥 테넌트 설정 응답:`, response);
      
      if (response.success && response.data) {
        setSettings(response.data);
        
        // 브랜딩 정보 추출 (서버에서 branding 필드로 제공)
        const brandingData: TenantBranding = {
          logo: response.data.branding?.logo,
          mainImage: response.data.branding?.mainImage,
          primaryColor: response.data.branding?.primaryColor || (response.data.theme?.color ? undefined : undefined),
          secondaryColor: response.data.branding?.secondaryColor,
          theme: (response.data.branding?.theme as 'light' | 'dark' | 'auto') || 'light',
        };
        setBranding(brandingData);
        console.log(`✅ 테넌트 설정 로드 완료:`, { settings: response.data, branding: brandingData });

        // 브랜딩 CSS 변수 적용
        if (brandingData.primaryColor) {
          document.documentElement.style.setProperty('--tenant-primary-color', brandingData.primaryColor);
        }
        if (brandingData.secondaryColor) {
          document.documentElement.style.setProperty('--tenant-secondary-color', brandingData.secondaryColor);
        }
        
        // 테마 모드 적용
        if (brandingData.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (brandingData.theme === 'light') {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (err: any) {
      console.error('테넌트 설정 로드 오류:', err);
      setError(err.message || '설정을 불러오는데 실패했습니다.');
      // 기본값 사용
      setSettings({
        theme: { color: 'blue', density: 'comfortable' },
        notifications: { email: true, sms: false },
        features: { reports: true, payments: true, bookings: true },
      });
      setBranding(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (centerId) {
      // centerId가 변경되면 설정을 다시 로드
      loadSettings();
    } else {
      // centerId가 없으면 기본 설정 사용
      setSettings({
        theme: { color: 'blue', density: 'comfortable' },
        notifications: { email: true, sms: false },
        features: { reports: true, payments: true, bookings: true },
      });
      setBranding(null);
      setLoading(false);
    }
  }, [centerId]);

  const value = useMemo<TenantSettingsContextValue>(
    () => ({
      settings,
      branding,
      loading,
      error,
      refresh: loadSettings,
    }),
    [settings, branding, loading, error]
  );

  return <TenantSettingsContext.Provider value={value}>{children}</TenantSettingsContext.Provider>;
}

export function useTenantSettings() {
  const context = useContext(TenantSettingsContext);
  if (context === undefined) {
    throw new Error('useTenantSettings must be used within a TenantSettingsProvider');
  }
  return context;
}

