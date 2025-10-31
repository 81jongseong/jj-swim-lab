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
  name?: string; // 센터명 추가
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

      // centerId가 변경되면 localStorage도 업데이트하여 apiClient가 최신 값을 사용하도록 함
      if (centerId) {
        try {
          localStorage.setItem('centerId', centerId);
          document.cookie = `centerId=${encodeURIComponent(centerId)}; path=/; max-age=${60 * 60 * 24 * 7}`;
        } catch (e) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('centerId 저장 실패:', e);
          }
        }
      }

      // 설정 머지 API 호출
      const response = await apiClient.get<{ success: boolean; data: TenantSettings }>('/api/centers/settings');
      
      if (response.success && response.data) {
        setSettings(response.data);
        
        // 브랜딩 정보 추출 (서버에서 branding 필드로 제공)
        const brandingData: TenantBranding = {
          logo: response.data.branding?.logo,
          mainImage: response.data.branding?.mainImage,
          primaryColor: response.data.branding?.primaryColor || (response.data.theme?.color ? undefined : undefined),
          secondaryColor: response.data.branding?.secondaryColor,
          theme: (response.data.branding?.theme as 'light' | 'dark' | 'auto') || 'light',
          name: response.data.branding?.name, // 센터명 추가
        };
        setBranding(brandingData);
        
        // 센터명을 localStorage에 저장 (Navigation 컴포넌트에서 사용)
        if (brandingData.name) {
          try {
            localStorage.setItem('center-name', brandingData.name);
          } catch (e) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('센터명 localStorage 저장 실패:', e);
            }
          }
        }
        
        // 로고 URL을 localStorage에 저장 (Navigation 컴포넌트에서 사용)
        if (brandingData.logo) {
          try {
            localStorage.setItem('center-logo', brandingData.logo);
            // 커스텀 이벤트 발생
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('center-logo-updated', { detail: { logoUrl: brandingData.logo } }));
            }
          } catch (e) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('로고 URL localStorage 저장 실패:', e);
            }
          }
        }

        // Hex to HSL 변환 함수
        const hexToHsl = (hex: string): string => {
          // # 제거
          hex = hex.replace('#', '');
          const r = parseInt(hex.substr(0, 2), 16) / 255;
          const g = parseInt(hex.substr(2, 2), 16) / 255;
          const b = parseInt(hex.substr(4, 2), 16) / 255;

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          let h: number = 0;
          let s: number = 0;
          const l = (max + min) / 2;

          if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
              case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
              case g: h = ((b - r) / d + 2) / 6; break;
              case b: h = ((r - g) / d + 4) / 6; break;
            }
          }

          return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
        };

        // 브랜딩 CSS 변수 적용 (값이 있을 때만 적용, 없으면 localStorage 또는 기존 값 유지)
        // 브랜딩 페이지에서 저장 중일 때는 덮어쓰지 않도록 주의 필요
        let primaryColorToApply = brandingData.primaryColor;
        if (!primaryColorToApply) {
          // branding 값이 없으면 localStorage에서 가져와서 사용
          const storedPrimaryColor = typeof window !== 'undefined' ? localStorage.getItem('tenant-primary-color') : null;
          if (storedPrimaryColor) {
            primaryColorToApply = storedPrimaryColor;
          }
        }
        
        if (primaryColorToApply) {
          // --tenant-primary-color (hex 값)
          document.documentElement.style.setProperty('--tenant-primary-color', primaryColorToApply);
          // --primary (HSL 값) - Tailwind가 사용하는 변수
          const primaryHsl = hexToHsl(primaryColorToApply);
          document.documentElement.style.setProperty('--primary', primaryHsl);
          // localStorage에도 저장
          try {
            localStorage.setItem('tenant-primary-color', primaryColorToApply);
          } catch (e) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('localStorage 저장 실패:', e);
            }
          }
        }
        
        let secondaryColorToApply = brandingData.secondaryColor;
        if (!secondaryColorToApply) {
          // branding 값이 없으면 localStorage에서 가져와서 사용
          const storedSecondaryColor = typeof window !== 'undefined' ? localStorage.getItem('tenant-secondary-color') : null;
          if (storedSecondaryColor) {
            secondaryColorToApply = storedSecondaryColor;
          }
        }
        
        if (secondaryColorToApply) {
          // --tenant-secondary-color (hex 값)
          document.documentElement.style.setProperty('--tenant-secondary-color', secondaryColorToApply);
          // --secondary (HSL 값) - Tailwind가 사용하는 변수
          const secondaryHsl = hexToHsl(secondaryColorToApply);
          document.documentElement.style.setProperty('--secondary', secondaryHsl);
          // 페이지 배경색 설정 (secondaryColor 사용)
          document.body.style.backgroundColor = secondaryColorToApply;
          // localStorage에도 저장
          try {
            localStorage.setItem('tenant-secondary-color', secondaryColorToApply);
          } catch (e) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('localStorage 저장 실패:', e);
            }
          }
        } else {
          // 기본값으로 흰색
          document.body.style.backgroundColor = '#ffffff';
        }
        
        // 테마 모드 적용 (localStorage 우선, 없으면 branding 값 사용)
        let themeMode: 'light' | 'dark' | 'auto' | null = null;
        
        // localStorage에서 우선 가져오기 (사용자가 저장한 값이 우선)
        if (typeof window !== 'undefined') {
          const storedTheme = localStorage.getItem('tenant-theme');
          if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'auto')) {
            themeMode = storedTheme as 'light' | 'dark' | 'auto';
          }
        }
        
        // localStorage에 없으면 branding 값 사용
        if (!themeMode && brandingData.theme) {
          themeMode = brandingData.theme as 'light' | 'dark' | 'auto';
        }
        
        // themeMode가 없으면 기본값 'light' 사용
        themeMode = themeMode || 'light';
        
        if (themeMode === 'dark') {
          document.documentElement.classList.add('dark');
          document.body.classList.add('dark');
        } else if (themeMode === 'light') {
          document.documentElement.classList.remove('dark');
          document.body.classList.remove('dark');
        } else if (themeMode === 'auto') {
          // auto 모드는 시스템 설정 따르기 - 현재는 light로 처리
          document.documentElement.classList.remove('dark');
          document.body.classList.remove('dark');
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


