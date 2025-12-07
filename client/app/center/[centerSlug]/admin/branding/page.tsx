/**
 * 브랜딩 설정 페이지: 센터별 브랜딩 관리
 *
 * 연동되는 데이터:
 * - Center 모델의 images.logo, images.mainImage
 * - Center 모델의 settings.theme (primaryColor, secondaryColor, mode)
 * - /api/centers/my-center (PUT) - 센터 정보 업데이트
 * - /api/centers/my-center/upload-logo (POST) - 로고 업로드
 * - /api/centers/my-center/upload-main-image (POST) - 메인 이미지 업로드
 *
 * 연동되는 파일:
 * - hooks/useAuth.tsx (인증)
 * - utils/api.ts (apiClient)
 * - contexts/TenantSettingsContext.tsx (설정 로드/적용)
 */

'use client';
import { logger } from '@/lib/logger';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/utils/api';
import { useTenantSettings } from '@/contexts/TenantSettingsContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
// Label과 Select는 index.ts에서 export되지 않으므로 직접 import
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Upload, Save, X, Eye, Palette, Image as ImageIcon, RotateCcw } from 'lucide-react';
import withAuth from '@/components/withAuth';

interface BrandingFormData {
  logo?: string;
  mainImage?: string;
  primaryColor: string;
  secondaryColor: string;
  themeMode: 'light' | 'dark' | 'auto';
}

function BrandingSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { branding, settings, refresh } = useTenantSettings();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // 저장 중 플래그
  
  // localStorage에서 저장된 색상 가져오기 (기본값보다 우선)
  const getInitialColor = (key: 'primaryColor' | 'secondaryColor', defaultValue: string): string => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`tenant-${key === 'primaryColor' ? 'primary' : 'secondary'}-color`);
      if (stored) {
        logger.info(`💾 초기값으로 localStorage 사용: ${key}=${stored}`);
        return stored;
      }
    }
    return defaultValue;
  };

  const [formData, setFormData] = useState<BrandingFormData>({
    primaryColor: getInitialColor('primaryColor', '#3b82f6'),
    secondaryColor: getInitialColor('secondaryColor', '#ffffff'),
    themeMode: (typeof window !== 'undefined' ? localStorage.getItem('tenant-theme') : null) as 'light' | 'dark' | 'auto' || 'light',
  });

  useEffect(() => {
    if (branding) {
      logger.info('🔄 branding 업데이트:', branding);
      setFormData(prev => ({
        logo: branding.logo || prev.logo,
        mainImage: branding.mainImage || prev.mainImage,
        primaryColor: branding.primaryColor || prev.primaryColor || '#3b82f6',
             secondaryColor: branding.secondaryColor || prev.secondaryColor || '#ffffff',
        themeMode: branding.theme || prev.themeMode || 'light',
      }));
    }
  }, [branding]);

  // 실시간 미리보기 적용
  useEffect(() => {
    // 저장 중이면 useEffect 로직을 건너뜀 (handleSave에서 직접 설정 적용)
    if (isSaving) {
      return;
    }
    
    if (previewMode) {
      logger.info('👁️ 미리보기 모드: 색상 적용', { 
        primaryColor: formData.primaryColor, 
        secondaryColor: formData.secondaryColor,
        themeMode: formData.themeMode 
      });
      // Hex to HSL 변환 함수
      const hexToHsl = (hex: string): string => {
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

      // 미리보기 모드: 변경된 설정 적용
      if (formData.primaryColor) {
        const primaryHsl = hexToHsl(formData.primaryColor);
        document.documentElement.style.setProperty('--tenant-primary-color', formData.primaryColor);
        document.documentElement.style.setProperty('--primary', primaryHsl);
        logger.info('🎨 미리보기: primaryColor 적용', { hex: formData.primaryColor, hsl: primaryHsl });
      }
      if (formData.secondaryColor) {
        const secondaryHsl = hexToHsl(formData.secondaryColor);
        document.documentElement.style.setProperty('--tenant-secondary-color', formData.secondaryColor);
        document.documentElement.style.setProperty('--secondary', secondaryHsl);
        // 페이지 배경색도 미리보기
        document.body.style.backgroundColor = formData.secondaryColor;
        logger.info('🎨 미리보기: secondaryColor 적용', { hex: formData.secondaryColor, hsl: secondaryHsl });
      }
      if (formData.themeMode === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        logger.info('🌙 미리보기: 다크 모드 적용');
      } else if (formData.themeMode === 'light') {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        logger.info('☀️ 미리보기: 라이트 모드 적용');
      } else if (formData.themeMode === 'auto') {
        // auto 모드는 시스템 설정 따르기 - 현재는 light로 처리
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        logger.info('⚙️ 미리보기: 자동 모드 (라이트로 처리)');
      }
      
      // 미리보기 모드에서는 주기적으로 색상 재적용 (TenantSettingsContext가 덮어쓸 수 있으므로)
      const previewInterval = setInterval(() => {
        if (previewMode && formData.primaryColor) {
          const primaryHsl = hexToHsl(formData.primaryColor);
          document.documentElement.style.setProperty('--tenant-primary-color', formData.primaryColor);
          document.documentElement.style.setProperty('--primary', primaryHsl);
        }
        if (previewMode && formData.secondaryColor) {
          const secondaryHsl = hexToHsl(formData.secondaryColor);
          document.documentElement.style.setProperty('--tenant-secondary-color', formData.secondaryColor);
          document.documentElement.style.setProperty('--secondary', secondaryHsl);
        }
      }, 500);
      
      return () => {
        clearInterval(previewInterval);
      };
    } else {
      // 미리보기 종료: 원래 설정으로 복원
      // localStorage에서 가져오거나 branding/formData 사용
      let primaryColor = branding?.primaryColor;
      let secondaryColor = branding?.secondaryColor;
      
      // branding 값이 없으면 localStorage에서 가져오기
      if (!primaryColor && typeof window !== 'undefined') {
        const storedPrimary = localStorage.getItem('tenant-primary-color');
        if (storedPrimary) {
          primaryColor = storedPrimary;
          logger.info('💾 useEffect: localStorage에서 primaryColor 가져옴:', storedPrimary);
        }
      }
      
      if (!secondaryColor && typeof window !== 'undefined') {
        const storedSecondary = localStorage.getItem('tenant-secondary-color');
        if (storedSecondary) {
          secondaryColor = storedSecondary;
          logger.info('💾 useEffect: localStorage에서 secondaryColor 가져옴:', storedSecondary);
        }
      }
      
      // 최종 fallback
      primaryColor = primaryColor || formData.primaryColor || '#3b82f6';
      secondaryColor = secondaryColor || formData.secondaryColor || '#ffffff';
      
      // Hex to HSL 변환 함수
      const hexToHsl = (hex: string): string => {
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
      
      // 테마 모드 확인 (localStorage 우선, 없으면 branding/formData 사용)
      let theme: 'light' | 'dark' | 'auto' | null = null;
      
      // localStorage에서 우선 가져오기 (사용자가 저장한 값이 우선)
      if (typeof window !== 'undefined') {
        const storedTheme = localStorage.getItem('tenant-theme');
        if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'auto')) {
          theme = storedTheme as 'light' | 'dark' | 'auto';
          logger.info('💾 useEffect: localStorage에서 테마 모드 가져옴 (우선):', storedTheme);
        }
      }
      
      // localStorage에 없으면 branding/formData 사용
      if (!theme) {
        theme = branding?.theme || formData.themeMode || 'light';
        logger.info('🔍 branding/formData 테마 모드 사용:', theme);
      }
      
           const primaryHsl = hexToHsl(primaryColor);
           const secondaryHsl = hexToHsl(secondaryColor);
           
           document.documentElement.style.setProperty('--tenant-primary-color', primaryColor);
           document.documentElement.style.setProperty('--tenant-secondary-color', secondaryColor);
           document.documentElement.style.setProperty('--primary', primaryHsl);
           document.documentElement.style.setProperty('--secondary', secondaryHsl);
           
           // 페이지 배경색 설정 (secondaryColor 사용)
           if (secondaryColor) {
             document.body.style.backgroundColor = secondaryColor;
             logger.info('🎨 useEffect: 페이지 배경색 적용:', secondaryColor);
           } else {
             // 기본값으로 흰색
             document.body.style.backgroundColor = '#ffffff';
           }
      
      logger.info('🎨 useEffect: 적용할 테마 모드:', theme);
      logger.info('🔍 localStorage의 tenant-theme:', typeof window !== 'undefined' ? localStorage.getItem('tenant-theme') : 'N/A');
      logger.info('🎨 useEffect: --primary HSL 값 설정:', primaryHsl);
      logger.info('🎨 useEffect: --secondary HSL 값 설정:', secondaryHsl);
      logger.info('🔍 현재 CSS 변수 --tenant-primary-color:', getComputedStyle(document.documentElement).getPropertyValue('--tenant-primary-color').trim());
      logger.info('🔍 현재 CSS 변수 --tenant-secondary-color:', getComputedStyle(document.documentElement).getPropertyValue('--tenant-secondary-color').trim());
      logger.info('🔍 현재 CSS 변수 --primary:', getComputedStyle(document.documentElement).getPropertyValue('--primary').trim());
      logger.info('🔍 현재 CSS 변수 --secondary:', getComputedStyle(document.documentElement).getPropertyValue('--secondary').trim());
      logger.info('🔍 적용 전 document.documentElement.classList:', Array.from(document.documentElement.classList));
      logger.info('🔍 적용 전 document.body.classList:', Array.from(document.body.classList));
      
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        logger.info('🌙 useEffect: 다크 모드 적용');
        logger.info('🔍 적용 후 document.documentElement.classList:', Array.from(document.documentElement.classList));
        logger.info('🔍 적용 후 document.body.classList:', Array.from(document.body.classList));
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        logger.info('☀️ useEffect: 라이트 모드 적용');
        logger.info('🔍 적용 후 document.documentElement.classList:', Array.from(document.documentElement.classList));
        logger.info('🔍 적용 후 document.body.classList:', Array.from(document.body.classList));
      }
      
      // CSS 변수 실제 적용 확인
      const appliedPrimary = getComputedStyle(document.documentElement).getPropertyValue('--tenant-primary-color').trim();
      const appliedSecondary = getComputedStyle(document.documentElement).getPropertyValue('--tenant-secondary-color').trim();
      const appliedPrimaryHsl = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
      const appliedSecondaryHsl = getComputedStyle(document.documentElement).getPropertyValue('--secondary').trim();
      logger.info('🎨 실제 적용된 CSS 변수:', { 
        appliedPrimary, 
        appliedSecondary,
        appliedPrimaryHsl,
        appliedSecondaryHsl
      });
      
      // 실제 요소에 적용된 색상 확인
      setTimeout(() => {
        const testElements = document.querySelectorAll('.bg-primary, [class*="bg-primary"]');
        logger.info('🔍 찾은 bg-primary 요소 개수:', testElements.length);
        
        testElements.forEach((element, index) => {
          const computedStyle = getComputedStyle(element);
          const backgroundColor = computedStyle.backgroundColor;
          const backgroundImage = computedStyle.backgroundImage;
          const cssText = element.className;
          logger.info(`🎨 bg-primary 요소 #${index + 1}:`, {
            className: cssText,
            backgroundColor,
            backgroundImage,
            element: element
          });
        });
        
        // CSS 변수 값 직접 확인
        const rootStyle = getComputedStyle(document.documentElement);
        const primaryVar = rootStyle.getPropertyValue('--primary').trim();
        const secondaryVar = rootStyle.getPropertyValue('--secondary').trim();
        logger.info('🔍 root에서 확인한 CSS 변수:', {
          '--primary': primaryVar,
          '--secondary': secondaryVar,
          '--tenant-primary-color': rootStyle.getPropertyValue('--tenant-primary-color').trim(),
          '--tenant-secondary-color': rootStyle.getPropertyValue('--tenant-secondary-color').trim()
        });
        
        // Tailwind가 생성한 bg-primary 클래스의 실제 CSS 확인
        const styleSheets = Array.from(document.styleSheets);
        let foundBgPrimary = false;
        styleSheets.forEach(sheet => {
          try {
            const rules = Array.from(sheet.cssRules || sheet.rules || []);
            rules.forEach(rule => {
              if (rule instanceof CSSStyleRule) {
                if (rule.selectorText && (rule.selectorText.includes('.bg-primary') || rule.selectorText.includes('bg-primary'))) {
                  logger.info('🎨 Tailwind bg-primary CSS 규칙:', {
                    selector: rule.selectorText,
                    style: rule.style.cssText,
                    backgroundColor: rule.style.backgroundColor
                  });
                  foundBgPrimary = true;
                }
              }
            });
          } catch (e) {
            // CORS 오류 등 무시
          }
        });
        
        if (!foundBgPrimary) {
          logger.info('⚠️ Tailwind bg-primary CSS 규칙을 찾을 수 없습니다');
        }
      }, 500);
    }
  }, [formData.primaryColor, formData.secondaryColor, formData.themeMode, previewMode, branding, isSaving]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);
      
      const token = localStorage.getItem('token');
      const centerId = localStorage.getItem('centerId');
      
      // 1. 파일 업로드
      const uploadResponse = await fetch('http://localhost:5000/api/centers/my-center/upload-logo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          ...(centerId ? { 'x-center-id': centerId } : {}),
        },
        body: formData,
      });

      const uploadResult = await uploadResponse.json();
      if (uploadResult.success) {
        // 응답에서 로고 URL 가져오기 (imageUrl 또는 logo 필드 사용)
        const logoUrl = uploadResult.data?.logo || uploadResult.data?.imageUrl;
        if (logoUrl) {
          logger.info('✅ 로고 업로드 완료:', logoUrl);
          
          // 2. formData 즉시 업데이트 (UI 반영)
          setFormData(prev => ({ ...prev, logo: logoUrl }));
          
          // 3. 서버에 이미지 URL 저장 (PUT /api/centers/my-center)
          const saveResponse = await fetch('http://localhost:5000/api/centers/my-center', {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              ...(centerId ? { 'x-center-id': centerId } : {}),
            },
            body: JSON.stringify({
              images: {
                logo: logoUrl
              }
            }),
          });

          if (saveResponse.ok) {
            const saveResult = await saveResponse.json();
            logger.info('✅ 로고 URL 서버 저장 완료:', saveResult);
            
            // 4. localStorage에 로고 URL 저장 (Navigation 컴포넌트에서 사용)
            try {
              localStorage.setItem('center-logo', logoUrl);
              logger.info('💾 로고 URL localStorage 저장:', logoUrl);
            } catch (e) {
              logger.warn('localStorage 저장 실패:', e);
            }
            
            // 5. 커스텀 이벤트 발생 (Navigation 컴포넌트에서 감지)
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('center-logo-updated', { detail: { logoUrl } }));
              logger.info('📢 center-logo-updated 이벤트 발생:', logoUrl);
            }
            
            // 6. TenantSettingsContext 갱신
            await refresh();
            alert('로고가 성공적으로 업로드 및 저장되었습니다.');
          } else {
            const saveError = await saveResponse.json();
            logger.error('⚠️ 로고 URL 저장 실패:', saveError);
            alert('로고는 업로드되었지만 저장에 실패했습니다. 다시 시도해주세요.');
          }
        } else {
          logger.error('⚠️ 로고 URL이 응답에 없습니다:', uploadResult);
          alert('로고 업로드는 성공했지만 URL을 가져올 수 없습니다.');
        }
      } else {
        alert(uploadResult.message || '로고 업로드에 실패했습니다.');
      }
    } catch (error) {
      logger.error('로고 업로드 오류:', error);
      alert('로고 업로드에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('mainImage', file);
      
      const token = localStorage.getItem('token');
      const centerId = localStorage.getItem('centerId');
      
      // 1. 파일 업로드
      const uploadResponse = await fetch('http://localhost:5000/api/centers/my-center/upload-main-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          ...(centerId ? { 'x-center-id': centerId } : {}),
        },
        body: formData,
      });

      const uploadResult = await uploadResponse.json();
      if (uploadResult.success) {
        // 응답에서 메인 이미지 URL 가져오기 (imageUrl 또는 mainImage 필드 사용)
        const mainImageUrl = uploadResult.data?.mainImage || uploadResult.data?.imageUrl;
        if (mainImageUrl) {
          logger.info('✅ 메인 이미지 업로드 완료:', mainImageUrl);
          
          // 2. formData 즉시 업데이트 (UI 반영)
          setFormData(prev => ({ ...prev, mainImage: mainImageUrl }));
          
          // 3. 서버에 이미지 URL 저장 (PUT /api/centers/my-center)
          const saveResponse = await fetch('http://localhost:5000/api/centers/my-center', {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              ...(centerId ? { 'x-center-id': centerId } : {}),
            },
            body: JSON.stringify({
              images: {
                mainImage: mainImageUrl
              }
            }),
          });

          if (saveResponse.ok) {
            const saveResult = await saveResponse.json();
            logger.info('✅ 메인 이미지 URL 서버 저장 완료:', saveResult);
            
            // 4. TenantSettingsContext 갱신
            await refresh();
            alert('메인 이미지가 성공적으로 업로드 및 저장되었습니다.');
          } else {
            const saveError = await saveResponse.json();
            logger.error('⚠️ 메인 이미지 URL 저장 실패:', saveError);
            alert('메인 이미지는 업로드되었지만 저장에 실패했습니다. 다시 시도해주세요.');
          }
        } else {
          logger.error('⚠️ 메인 이미지 URL이 응답에 없습니다:', uploadResult);
          alert('메인 이미지 업로드는 성공했지만 URL을 가져올 수 없습니다.');
        }
      } else {
        alert(uploadResult.message || '메인 이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      logger.error('메인 이미지 업로드 오류:', error);
      alert('메인 이미지 업로드에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setIsSaving(true); // 저장 시작 플래그 설정
    try {
      const updateData = {
        settings: {
          theme: {
            primaryColor: formData.primaryColor,
            secondaryColor: formData.secondaryColor,
            mode: formData.themeMode,
          },
        },
      };

      const response = await apiClient.put('/api/centers/my-center', updateData);
      
      if (response.success) {
        // 미리보기 모드 종료 (useEffect 실행 방지)
        setPreviewMode(false);
        
        // 응답에서 브랜딩 정보 확인 (서버에서 직접 반환)
        const responseBranding = (response as any).branding;
        const savedPrimaryColor = responseBranding?.primaryColor || formData.primaryColor;
        const savedSecondaryColor = responseBranding?.secondaryColor || formData.secondaryColor;
        const savedTheme = responseBranding?.theme || formData.themeMode;
        
        logger.info('✅ 저장 응답에서 받은 브랜딩 정보:', responseBranding);
        logger.info('🎨 적용할 색상:', { savedPrimaryColor, savedSecondaryColor, savedTheme });
        logger.info('🔍 formData.themeMode:', formData.themeMode);
        logger.info('🔍 responseBranding?.theme:', responseBranding?.theme);
        
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

        // 저장 후 새로운 설정을 즉시 적용 (응답에서 받은 값 사용)
        // --tenant-primary-color와 --tenant-secondary-color (hex 값)
        document.documentElement.style.setProperty('--tenant-primary-color', savedPrimaryColor);
        document.documentElement.style.setProperty('--tenant-secondary-color', savedSecondaryColor);
        
             // --primary와 --secondary (HSL 값) - Tailwind가 사용하는 변수
             const primaryHsl = hexToHsl(savedPrimaryColor);
             const secondaryHsl = hexToHsl(savedSecondaryColor);
             document.documentElement.style.setProperty('--primary', primaryHsl);
             document.documentElement.style.setProperty('--secondary', secondaryHsl);
             logger.info('🎨 --primary HSL 값 설정:', primaryHsl);
             logger.info('🎨 --secondary HSL 값 설정:', secondaryHsl);
             
             // 페이지 배경색 설정 (secondaryColor 사용)
             if (savedSecondaryColor) {
               document.body.style.backgroundColor = savedSecondaryColor;
               logger.info('🎨 저장 후 페이지 배경색 적용:', savedSecondaryColor);
             }
        
        // CSS 변수 적용 확인
        const setPrimary = getComputedStyle(document.documentElement).getPropertyValue('--tenant-primary-color').trim();
        const setSecondary = getComputedStyle(document.documentElement).getPropertyValue('--tenant-secondary-color').trim();
        logger.info('✅ CSS 변수 설정 확인:', { setPrimary, setSecondary });
        
        // localStorage에 저장하여 다른 페이지에서도 사용 가능하도록 함
        try {
          localStorage.setItem('tenant-primary-color', savedPrimaryColor);
          localStorage.setItem('tenant-secondary-color', savedSecondaryColor);
          localStorage.setItem('tenant-theme', savedTheme);
          logger.info('💾 브랜딩 색상 및 테마를 localStorage에 저장:', { savedPrimaryColor, savedSecondaryColor, savedTheme });
          logger.info('🔍 저장 후 localStorage 확인 - tenant-theme:', localStorage.getItem('tenant-theme'));
          logger.info('🔍 저장 후 localStorage 확인 - tenant-primary-color:', localStorage.getItem('tenant-primary-color'));
        } catch (e) {
          logger.warn('localStorage 저장 실패:', e);
        }
        
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
          document.body.classList.add('dark');
          logger.info('🌙 저장 후 다크 모드 적용');
        } else if (savedTheme === 'light') {
          document.documentElement.classList.remove('dark');
          document.body.classList.remove('dark');
          logger.info('☀️ 저장 후 라이트 모드 적용');
        } else if (savedTheme === 'auto') {
          // auto 모드는 시스템 설정 따르기 - 현재는 light로 처리
          document.documentElement.classList.remove('dark');
          document.body.classList.remove('dark');
          logger.info('⚙️ 저장 후 자동 모드 (라이트로 처리)');
        }
        
        // 저장 완료 후 플래그 해제 전에 잠시 대기 (저장 완료 보장)
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 설정 새로고침 (서버에서 최신 데이터 가져오기)
        await refresh();
        
        // refresh 후 branding 값이 업데이트될 때까지 대기하고 색상 재적용
        let retryCount = 0;
        const maxRetries = 15;
        while (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 100));
          // branding 값 확인 (컨텍스트에서 가져오기)
          const currentBranding = branding;
          if (currentBranding && (currentBranding.primaryColor || currentBranding.secondaryColor)) {
            logger.info('✅ refresh 후 branding 값 업데이트됨:', currentBranding);
            // 업데이트된 branding 값으로 적용
            const finalPrimaryColor = currentBranding.primaryColor || savedPrimaryColor;
            const finalSecondaryColor = currentBranding.secondaryColor || savedSecondaryColor;
            
            // Hex to HSL 변환 함수 (이미 위에 정의되어 있지만 재사용을 위해)
            const hexToHslLocal = (hex: string): string => {
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
            
            document.documentElement.style.setProperty('--tenant-primary-color', finalPrimaryColor);
            document.documentElement.style.setProperty('--tenant-secondary-color', finalSecondaryColor);
            document.documentElement.style.setProperty('--primary', hexToHslLocal(finalPrimaryColor));
            document.documentElement.style.setProperty('--secondary', hexToHslLocal(finalSecondaryColor));
            logger.info('🎨 최종 적용 색상:', { finalPrimaryColor, finalSecondaryColor });
            break;
          }
          retryCount++;
        }
        
        // 여전히 branding 값이 없으면 저장한 값으로 강제 적용
        if (retryCount >= maxRetries) {
          logger.info('⚠️ refresh 후에도 branding 값이 없습니다. 저장한 값으로 강제 적용합니다.');
          document.documentElement.style.setProperty('--tenant-primary-color', savedPrimaryColor);
          document.documentElement.style.setProperty('--tenant-secondary-color', savedSecondaryColor);
        }
        
        // 추가 확인: refresh 후에도 색상 유지 확인 및 재적용 (TenantSettingsContext가 덮어쓸 수 있으므로)
        // 여러 번 확인하여 계속 적용 (TenantSettingsContext가 비동기로 덮어쓸 수 있음)
        const checkAndApplyColor = () => {
          const currentPrimary = getComputedStyle(document.documentElement).getPropertyValue('--tenant-primary-color').trim();
          const expectedColor = savedPrimaryColor;
          logger.info('🔍 색상 확인 - 현재:', currentPrimary, '예상:', expectedColor);
          
          // 색상이 예상과 다른지 확인 (RGB 변환 고려)
          let needsApply = false;
          
          // 기본 파란색 체크
          if (currentPrimary === '#3b82f6' || currentPrimary === 'rgb(59, 130, 246)') {
            if (expectedColor !== '#3b82f6') {
              needsApply = true;
              logger.info('⚠️ 기본 파란색으로 되어 있습니다.');
            }
          } 
          // 예상 색상과 직접 비교
          else if (expectedColor && currentPrimary !== expectedColor) {
            // RGB 형식일 수 있으므로 hex를 RGB로 변환해서 비교
            const hexToRgb = (hex: string) => {
              const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
              return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : null;
            };
            const expectedRgb = hexToRgb(expectedColor);
            if (expectedRgb && currentPrimary !== expectedRgb) {
              // hex 값의 마지막 6자리 포함 여부 확인 (대소문자 무시)
              const hexValue = expectedColor.replace('#', '').toLowerCase();
              if (!currentPrimary.toLowerCase().includes(hexValue)) {
                needsApply = true;
                logger.info('⚠️ 예상 색상과 다릅니다.');
              }
            }
          }
          
          if (needsApply) {
            logger.info('✅ 색상 재적용:', savedPrimaryColor);
            // Hex to HSL 변환 함수 (이미 위에 정의되어 있지만 재사용을 위해)
            const hexToHslLocal = (hex: string): string => {
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
            
            document.documentElement.style.setProperty('--tenant-primary-color', savedPrimaryColor);
            document.documentElement.style.setProperty('--tenant-secondary-color', savedSecondaryColor);
            document.documentElement.style.setProperty('--primary', hexToHslLocal(savedPrimaryColor));
            document.documentElement.style.setProperty('--secondary', hexToHslLocal(savedSecondaryColor));
            // localStorage도 업데이트
            try {
              localStorage.setItem('tenant-primary-color', savedPrimaryColor);
              localStorage.setItem('tenant-secondary-color', savedSecondaryColor);
            } catch (e) {
              logger.warn('localStorage 업데이트 실패:', e);
            }
            return true; // 재적용했음
          }
          logger.info('✅ 색상이 정상적으로 적용되어 있습니다.');
          return false; // 정상
        };
        
        // 즉시 확인
        checkAndApplyColor();
        
        // 200ms 후 확인
        setTimeout(() => {
          if (checkAndApplyColor()) {
            // 재적용이 필요했으면 400ms 후 다시 확인
            setTimeout(() => {
              checkAndApplyColor();
            }, 400);
          }
        }, 200);
        
        // 600ms 후 최종 확인
        setTimeout(() => {
          checkAndApplyColor();
        }, 600);
        
        // 1000ms 후 최종 확인
        setTimeout(() => {
          checkAndApplyColor();
        }, 1000);
        
        // 저장 완료 후 플래그 해제 전에 한 번 더 확인 및 적용
        // (TenantSettingsContext가 적용한 후 덮어쓸 수 있으므로)
        setTimeout(() => {
          checkAndApplyColor();
        }, 1500);
        
        // 저장 완료 후 플래그 해제 (이제 useEffect가 새로운 branding 값으로 동작)
        // 하지만 branding 값이 없을 수 있으므로 플래그 해제를 조금 지연
        setTimeout(() => {
          setIsSaving(false);
        }, 2000);
        
        alert('브랜딩 설정이 저장되었습니다!');
      }
    } catch (error) {
      logger.error('브랜딩 설정 저장 오류:', error);
      alert('브랜딩 설정 저장에 실패했습니다.');
      setIsSaving(false); // 오류 발생 시 플래그 해제
    } finally {
      setSaving(false);
    }
  };

  const handleCancelPreview = () => {
    // 폼 데이터를 원래 상태로 복원
    if (branding) {
      setFormData({
        logo: branding.logo,
        mainImage: branding.mainImage,
        primaryColor: branding.primaryColor || '#3b82f6',
        secondaryColor: branding.secondaryColor || '#ffffff',
        themeMode: branding.theme || 'light',
      });
    }
    // 미리보기 모드 종료 (useEffect에서 원래 설정으로 복원됨)
    setPreviewMode(false);
    // 원래 설정으로 복원 (CSS 변수와 테마 모드도 복원)
    refresh();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">사이트 테마 설정</h1>
        <p className="text-gray-600">센터 로고, 색상, 테마를 설정하여 브랜드 아이덴티티를 표현하세요.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 왼쪽: 설정 폼 */}
        <div className="space-y-6">
          {/* 로고 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                센터 로고
              </CardTitle>
              <CardDescription>사이드바와 네비게이션에 표시되는 로고입니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.logo && (
                <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-gray-50">
                  <img
                    src={formData.logo?.startsWith('http') ? formData.logo : `http://localhost:5000${formData.logo}`}
                    alt="로고 미리보기"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      logger.error('로고 이미지 로드 실패:', formData.logo);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                    onLoad={() => {
                      logger.info('✅ 로고 이미지 로드 성공:', formData.logo);
                    }}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg hover:bg-gray-50 transition-colors">
                    <Upload className="h-4 w-4" />
                    <span>{formData.logo ? '로고 변경' : '로고 업로드'}</span>
                  </div>
                </Label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          {/* 메인 이미지 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                메인 이미지
              </CardTitle>
              <CardDescription>홈페이지 히어로 섹션에 사용되는 배경 이미지입니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.mainImage && (
                <div className="relative w-full h-48 border rounded-lg overflow-hidden bg-gray-50">
                  <img
                    src={formData.mainImage?.startsWith('http') ? formData.mainImage : `http://localhost:5000${formData.mainImage}`}
                    alt="메인 이미지 미리보기"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      logger.error('메인 이미지 로드 실패:', formData.mainImage);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                    onLoad={() => {
                      logger.info('✅ 메인 이미지 로드 성공:', formData.mainImage);
                    }}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="main-image-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg hover:bg-gray-50 transition-colors">
                    <Upload className="h-4 w-4" />
                    <span>{formData.mainImage ? '메인 이미지 변경' : '메인 이미지 업로드'}</span>
                  </div>
                </Label>
                <input
                  id="main-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageUpload}
                  className="hidden"
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          {/* 테마 색상 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                테마 색상
              </CardTitle>
              <CardDescription>센터를 대표하는 주요 색상을 설정하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="primary-color">주요 색상 (Primary)</Label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    id="primary-color"
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-16 h-10 border rounded cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="secondary-color">배경 색상 (Background Color)</Label>
                <CardDescription className="mt-1 mb-2">
                  메뉴바, 페이지 배경, 보조 요소에 사용되는 색상입니다.
                </CardDescription>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    id="secondary-color"
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="w-16 h-10 border rounded cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 테마 모드 설정 */}
          <Card>
            <CardHeader>
              <CardTitle>테마 모드</CardTitle>
              <CardDescription>라이트 모드 또는 다크 모드를 선택하세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.themeMode}
                onValueChange={(value: 'light' | 'dark' | 'auto') => setFormData(prev => ({ ...prev, themeMode: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="테마 모드를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">라이트 모드</SelectItem>
                  <SelectItem value="dark">다크 모드</SelectItem>
                  <SelectItem value="auto">시스템 설정 따르기</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* 액션 버튼 */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => {
                  if (!previewMode) {
                    // 미리보기 시작
                    setPreviewMode(true);
                    alert('미리보기 모드입니다. 변경사항을 적용하려면 저장을 클릭하세요.');
                  } else {
                    // 미리보기 종료 - 변경사항은 유지하고 미리보기만 종료
                    setPreviewMode(false);
                    // 미리보기 종료 시 원래 저장된 설정으로 복원 (변경사항은 폼에 유지)
                    if (branding) {
                    const originalPrimaryColor = branding.primaryColor || '#3b82f6';
                    const originalSecondaryColor = branding.secondaryColor || '#ffffff';
                      const originalTheme = branding.theme || 'light';
                      
                      // Hex to HSL 변환
                      const hexToHsl = (hex: string): string => {
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
                      
                      document.documentElement.style.setProperty('--tenant-primary-color', originalPrimaryColor);
                      document.documentElement.style.setProperty('--tenant-secondary-color', originalSecondaryColor);
                      document.documentElement.style.setProperty('--primary', hexToHsl(originalPrimaryColor));
                      document.documentElement.style.setProperty('--secondary', hexToHsl(originalSecondaryColor));
                      
                      if (originalTheme === 'dark') {
                        document.documentElement.classList.add('dark');
                        document.body.classList.add('dark');
                      } else {
                        document.documentElement.classList.remove('dark');
                        document.body.classList.remove('dark');
                      }
                    }
                  }
                }}
                variant="outline"
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? '미리보기 종료' : '미리보기'}
              </Button>
              {previewMode && (
                <Button
                  onClick={handleCancelPreview}
                  variant="outline"
                >
                  <X className="h-4 w-4 mr-2" />
                  취소
                </Button>
              )}
              <Button
                onClick={handleSave}
                disabled={saving || loading}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? '저장 중...' : '저장'}
              </Button>
            </div>
            <Button
              onClick={() => {
                // 디폴트 색상으로 복구
                const defaultPrimaryColor = '#3b82f6';
                const defaultSecondaryColor = '#ffffff';
                
                // formData 업데이트
                setFormData(prev => ({
                  ...prev,
                  primaryColor: defaultPrimaryColor,
                  secondaryColor: defaultSecondaryColor,
                }));
                
                // Hex to HSL 변환 함수
                const hexToHsl = (hex: string): string => {
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
                
                // CSS 변수 즉시 적용
                document.documentElement.style.setProperty('--tenant-primary-color', defaultPrimaryColor);
                document.documentElement.style.setProperty('--tenant-secondary-color', defaultSecondaryColor);
                document.documentElement.style.setProperty('--primary', hexToHsl(defaultPrimaryColor));
                document.documentElement.style.setProperty('--secondary', hexToHsl(defaultSecondaryColor));
                
                // 페이지 배경색 복구
                document.body.style.backgroundColor = defaultSecondaryColor;
                
                // 미리보기 모드가 활성화되어 있으면 즉시 반영되도록
                if (previewMode) {
                  logger.info('🔄 디폴트 색상으로 복구 (미리보기 모드)');
                } else {
                  // 미리보기 모드가 아니면 미리보기 모드로 전환
                  setPreviewMode(true);
                  logger.info('🔄 디폴트 색상으로 복구 및 미리보기 모드 활성화');
                }
                
                alert('디폴트 색상으로 복구되었습니다. 저장을 클릭하여 적용하세요.');
              }}
              variant="outline"
              className="w-full border-dashed"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              디폴트 색으로 복구하기
            </Button>
          </div>
        </div>

        {/* 오른쪽: 실시간 미리보기 */}
        <div className="lg:sticky lg:top-8 h-fit">
          <Card>
            <CardHeader>
              <CardTitle>미리보기</CardTitle>
              <CardDescription>현재 설정이 적용된 모습을 확인하세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 로고 미리보기 */}
                <div className="rounded-lg p-4"
                     style={{
                       background: `linear-gradient(to right, ${formData.primaryColor}, ${formData.secondaryColor || '#ffffff'})`,
                       border: 'none'
                     }}>
                  <div className="flex items-center gap-3">
                    {formData.logo ? (
                      <img
                        src={`http://localhost:5000${formData.logo}`}
                        alt="로고"
                        className="w-12 h-12 object-contain rounded-lg bg-white/20 backdrop-blur-sm"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">J</span>
                      </div>
                    )}
                    <span className="text-white font-bold text-lg">센터명</span>
                  </div>
                </div>

                {/* 색상 스왓치 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-600 mb-1 block">주요 색상</Label>
                    <div
                      className="w-full h-16 rounded-lg border"
                      style={{ backgroundColor: formData.primaryColor }}
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.primaryColor}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 mb-1 block">보조 색상</Label>
                    <div
                      className="w-full h-16 rounded-lg border"
                      style={{ backgroundColor: formData.secondaryColor }}
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.secondaryColor}</p>
                  </div>
                </div>

                {/* 테마 모드 표시 */}
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">테마 모드</Label>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg">
                    <span className="text-sm font-medium">
                      {formData.themeMode === 'light' ? '라이트 모드' : 
                       formData.themeMode === 'dark' ? '다크 모드' : '시스템 설정 따르기'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default withAuth(BrandingSettingsPage);


