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

        // 브랜딩 CSS 변수 적용 (값이 있을 때만 적용, 없으면 localStorage 또는 기존 값 유지)
        // 브랜딩 페이지에서 저장 중일 때는 덮어쓰지 않도록 주의 필요
        if (brandingData.primaryColor) {
          console.log('🎨 브랜딩 primaryColor 적용:', brandingData.primaryColor);
          document.documentElement.style.setProperty('--tenant-primary-color', brandingData.primaryColor);
          // localStorage에도 저장
          try {
            localStorage.setItem('tenant-primary-color', brandingData.primaryColor);
          } catch (e) {
            console.warn('localStorage 저장 실패:', e);
          }
        } else {
          // branding 값이 없으면 localStorage에서 가져와서 사용
          const storedPrimaryColor = typeof window !== 'undefined' ? localStorage.getItem('tenant-primary-color') : null;
          if (storedPrimaryColor) {
            console.log('💾 localStorage에서 primaryColor 가져옴:', storedPrimaryColor);
            document.documentElement.style.setProperty('--tenant-primary-color', storedPrimaryColor);
          } else {
            console.log('⚠️ 브랜딩 primaryColor가 없어서 기존 값 유지');
          }
        }
        if (brandingData.secondaryColor) {
          console.log('🎨 브랜딩 secondaryColor 적용:', brandingData.secondaryColor);
          document.documentElement.style.setProperty('--tenant-secondary-color', brandingData.secondaryColor);
          // localStorage에도 저장
          try {
            localStorage.setItem('tenant-secondary-color', brandingData.secondaryColor);
          } catch (e) {
            console.warn('localStorage 저장 실패:', e);
          }
        } else {
          // branding 값이 없으면 localStorage에서 가져와서 사용
          const storedSecondaryColor = typeof window !== 'undefined' ? localStorage.getItem('tenant-secondary-color') : null;
          if (storedSecondaryColor) {
            console.log('💾 localStorage에서 secondaryColor 가져옴:', storedSecondaryColor);
            document.documentElement.style.setProperty('--tenant-secondary-color', storedSecondaryColor);
          } else {
            console.log('⚠️ 브랜딩 secondaryColor가 없어서 기존 값 유지');
          }
        }
        
        // 테마 모드 적용 (branding 값이 없으면 localStorage에서 가져오기)
        let themeMode = brandingData.theme;
        console.log('🔍 brandingData.theme:', brandingData.theme);
        console.log('🔍 현재 localStorage의 tenant-theme:', typeof window !== 'undefined' ? localStorage.getItem('tenant-theme') : 'N/A');
        console.log('🔍 localStorage의 모든 tenant 관련 키:', typeof window !== 'undefined' ? Object.keys(localStorage).filter(k => k.startsWith('tenant')) : []);
        
        if (!themeMode && typeof window !== 'undefined') {
          const storedTheme = localStorage.getItem('tenant-theme');
          if (storedTheme) {
            themeMode = storedTheme as 'light' | 'dark' | 'auto';
            console.log('💾 localStorage에서 테마 모드 가져옴:', storedTheme);
          }
        }
        
        // themeMode가 없으면 기본값 'light' 사용
        themeMode = themeMode || 'light';
        console.log('🎨 적용할 테마 모드:', themeMode);
        console.log('🔍 document.documentElement.classList:', Array.from(document.documentElement.classList));
        console.log('🔍 document.body.classList:', Array.from(document.body.classList));
        
        if (themeMode === 'dark') {
          document.documentElement.classList.add('dark');
          document.body.classList.add('dark');
          console.log('🌙 TenantSettingsContext: 다크 모드 적용');
        } else if (themeMode === 'light') {
          document.documentElement.classList.remove('dark');
          document.body.classList.remove('dark');
          console.log('☀️ TenantSettingsContext: 라이트 모드 적용');
        } else if (themeMode === 'auto') {
          // auto 모드는 시스템 설정 따르기 - 현재는 light로 처리
          document.documentElement.classList.remove('dark');
          document.body.classList.remove('dark');
          console.log('⚙️ TenantSettingsContext: 자동 모드 (라이트로 처리)');
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

