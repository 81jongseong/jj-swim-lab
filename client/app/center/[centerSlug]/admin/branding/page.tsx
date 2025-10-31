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

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/utils/api';
import { useTenantSettings } from '@/contexts/TenantSettingsContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Save, X, Eye, Palette, Image as ImageIcon } from 'lucide-react';
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
  
  const [formData, setFormData] = useState<BrandingFormData>({
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    themeMode: 'light',
  });

  useEffect(() => {
    if (branding) {
      setFormData({
        logo: branding.logo,
        mainImage: branding.mainImage,
        primaryColor: branding.primaryColor || '#3b82f6',
        secondaryColor: branding.secondaryColor || '#8b5cf6',
        themeMode: branding.theme || 'light',
      });
    }
  }, [branding]);

  // 실시간 미리보기 적용
  useEffect(() => {
    // 저장 중이면 useEffect 로직을 건너뜀 (handleSave에서 직접 설정 적용)
    if (isSaving) {
      return;
    }
    
    if (previewMode) {
      // 미리보기 모드: 변경된 설정 적용
      if (formData.primaryColor) {
        document.documentElement.style.setProperty('--tenant-primary-color', formData.primaryColor);
      }
      if (formData.secondaryColor) {
        document.documentElement.style.setProperty('--tenant-secondary-color', formData.secondaryColor);
      }
      if (formData.themeMode === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        console.log('🌙 다크 모드 적용');
      } else if (formData.themeMode === 'light') {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        console.log('☀️ 라이트 모드 적용');
      } else if (formData.themeMode === 'auto') {
        // auto 모드는 시스템 설정 따르기 - 현재는 light로 처리
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        console.log('⚙️ 자동 모드 (라이트로 처리)');
      }
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
          console.log('💾 useEffect: localStorage에서 primaryColor 가져옴:', storedPrimary);
        }
      }
      
      if (!secondaryColor && typeof window !== 'undefined') {
        const storedSecondary = localStorage.getItem('tenant-secondary-color');
        if (storedSecondary) {
          secondaryColor = storedSecondary;
          console.log('💾 useEffect: localStorage에서 secondaryColor 가져옴:', storedSecondary);
        }
      }
      
      // 최종 fallback
      primaryColor = primaryColor || formData.primaryColor || '#3b82f6';
      secondaryColor = secondaryColor || formData.secondaryColor || '#8b5cf6';
      // 테마 모드 확인 (localStorage 우선, 없으면 branding/formData 사용)
      let theme: 'light' | 'dark' | 'auto' | null = null;
      
      // localStorage에서 우선 가져오기 (사용자가 저장한 값이 우선)
      if (typeof window !== 'undefined') {
        const storedTheme = localStorage.getItem('tenant-theme');
        if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'auto')) {
          theme = storedTheme as 'light' | 'dark' | 'auto';
          console.log('💾 useEffect: localStorage에서 테마 모드 가져옴 (우선):', storedTheme);
        }
      }
      
      // localStorage에 없으면 branding/formData 사용
      if (!theme) {
        theme = branding?.theme || formData.themeMode || 'light';
        console.log('🔍 branding/formData 테마 모드 사용:', theme);
      }
      
      document.documentElement.style.setProperty('--tenant-primary-color', primaryColor);
      document.documentElement.style.setProperty('--tenant-secondary-color', secondaryColor);
      
      console.log('🎨 useEffect: 적용할 테마 모드:', theme);
      console.log('🔍 localStorage의 tenant-theme:', typeof window !== 'undefined' ? localStorage.getItem('tenant-theme') : 'N/A');
      console.log('🔍 현재 CSS 변수 --tenant-primary-color:', getComputedStyle(document.documentElement).getPropertyValue('--tenant-primary-color').trim());
      console.log('🔍 현재 CSS 변수 --tenant-secondary-color:', getComputedStyle(document.documentElement).getPropertyValue('--tenant-secondary-color').trim());
      console.log('🔍 적용 전 document.documentElement.classList:', Array.from(document.documentElement.classList));
      console.log('🔍 적용 전 document.body.classList:', Array.from(document.body.classList));
      
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        console.log('🌙 useEffect: 다크 모드 적용');
        console.log('🔍 적용 후 document.documentElement.classList:', Array.from(document.documentElement.classList));
        console.log('🔍 적용 후 document.body.classList:', Array.from(document.body.classList));
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        console.log('☀️ useEffect: 라이트 모드 적용');
        console.log('🔍 적용 후 document.documentElement.classList:', Array.from(document.documentElement.classList));
        console.log('🔍 적용 후 document.body.classList:', Array.from(document.body.classList));
      }
      
      // CSS 변수 실제 적용 확인
      const appliedPrimary = getComputedStyle(document.documentElement).getPropertyValue('--tenant-primary-color').trim();
      const appliedSecondary = getComputedStyle(document.documentElement).getPropertyValue('--tenant-secondary-color').trim();
      console.log('🎨 실제 적용된 CSS 변수:', { appliedPrimary, appliedSecondary });
    }
  }, [formData, previewMode, branding, isSaving]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);
      
      const token = localStorage.getItem('token');
      const centerId = localStorage.getItem('centerId');
      const response = await fetch('http://localhost:5000/api/centers/my-center/upload-logo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          ...(centerId ? { 'x-center-id': centerId } : {}),
        },
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setFormData(prev => ({ ...prev, logo: result.data.imageUrl }));
        await refresh();
        alert('로고가 성공적으로 업로드되었습니다.');
      } else {
        alert(result.message || '로고 업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('로고 업로드 오류:', error);
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
      const response = await fetch('http://localhost:5000/api/centers/my-center/upload-main-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          ...(centerId ? { 'x-center-id': centerId } : {}),
        },
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setFormData(prev => ({ ...prev, mainImage: result.data.imageUrl }));
        await refresh();
        alert('메인 이미지가 성공적으로 업로드되었습니다.');
      } else {
        alert(result.message || '메인 이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('메인 이미지 업로드 오류:', error);
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
        
        console.log('✅ 저장 응답에서 받은 브랜딩 정보:', responseBranding);
        console.log('🎨 적용할 색상:', { savedPrimaryColor, savedSecondaryColor, savedTheme });
        console.log('🔍 formData.themeMode:', formData.themeMode);
        console.log('🔍 responseBranding?.theme:', responseBranding?.theme);
        
        // 저장 후 새로운 설정을 즉시 적용 (응답에서 받은 값 사용)
        document.documentElement.style.setProperty('--tenant-primary-color', savedPrimaryColor);
        document.documentElement.style.setProperty('--tenant-secondary-color', savedSecondaryColor);
        
        // CSS 변수 적용 확인
        const setPrimary = getComputedStyle(document.documentElement).getPropertyValue('--tenant-primary-color').trim();
        const setSecondary = getComputedStyle(document.documentElement).getPropertyValue('--tenant-secondary-color').trim();
        console.log('✅ CSS 변수 설정 확인:', { setPrimary, setSecondary });
        
        // localStorage에 저장하여 다른 페이지에서도 사용 가능하도록 함
        try {
          localStorage.setItem('tenant-primary-color', savedPrimaryColor);
          localStorage.setItem('tenant-secondary-color', savedSecondaryColor);
          localStorage.setItem('tenant-theme', savedTheme);
          console.log('💾 브랜딩 색상 및 테마를 localStorage에 저장:', { savedPrimaryColor, savedSecondaryColor, savedTheme });
          console.log('🔍 저장 후 localStorage 확인 - tenant-theme:', localStorage.getItem('tenant-theme'));
          console.log('🔍 저장 후 localStorage 확인 - tenant-primary-color:', localStorage.getItem('tenant-primary-color'));
        } catch (e) {
          console.warn('localStorage 저장 실패:', e);
        }
        
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
          document.body.classList.add('dark');
          console.log('🌙 저장 후 다크 모드 적용');
        } else if (savedTheme === 'light') {
          document.documentElement.classList.remove('dark');
          document.body.classList.remove('dark');
          console.log('☀️ 저장 후 라이트 모드 적용');
        } else if (savedTheme === 'auto') {
          // auto 모드는 시스템 설정 따르기 - 현재는 light로 처리
          document.documentElement.classList.remove('dark');
          document.body.classList.remove('dark');
          console.log('⚙️ 저장 후 자동 모드 (라이트로 처리)');
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
            console.log('✅ refresh 후 branding 값 업데이트됨:', currentBranding);
            // 업데이트된 branding 값으로 적용
            const finalPrimaryColor = currentBranding.primaryColor || savedPrimaryColor;
            const finalSecondaryColor = currentBranding.secondaryColor || savedSecondaryColor;
            document.documentElement.style.setProperty('--tenant-primary-color', finalPrimaryColor);
            document.documentElement.style.setProperty('--tenant-secondary-color', finalSecondaryColor);
            console.log('🎨 최종 적용 색상:', { finalPrimaryColor, finalSecondaryColor });
            break;
          }
          retryCount++;
        }
        
        // 여전히 branding 값이 없으면 저장한 값으로 강제 적용
        if (retryCount >= maxRetries) {
          console.log('⚠️ refresh 후에도 branding 값이 없습니다. 저장한 값으로 강제 적용합니다.');
          document.documentElement.style.setProperty('--tenant-primary-color', savedPrimaryColor);
          document.documentElement.style.setProperty('--tenant-secondary-color', savedSecondaryColor);
        }
        
        // 추가 확인: refresh 후에도 색상 유지 확인 및 재적용 (TenantSettingsContext가 덮어쓸 수 있으므로)
        // 여러 번 확인하여 계속 적용 (TenantSettingsContext가 비동기로 덮어쓸 수 있음)
        const checkAndApplyColor = () => {
          const currentPrimary = getComputedStyle(document.documentElement).getPropertyValue('--tenant-primary-color').trim();
          const expectedColor = savedPrimaryColor;
          console.log('🔍 색상 확인 - 현재:', currentPrimary, '예상:', expectedColor);
          
          // 색상이 예상과 다른지 확인 (RGB 변환 고려)
          let needsApply = false;
          
          // 기본 파란색 체크
          if (currentPrimary === '#3b82f6' || currentPrimary === 'rgb(59, 130, 246)') {
            if (expectedColor !== '#3b82f6') {
              needsApply = true;
              console.log('⚠️ 기본 파란색으로 되어 있습니다.');
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
                console.log('⚠️ 예상 색상과 다릅니다.');
              }
            }
          }
          
          if (needsApply) {
            console.log('✅ 색상 재적용:', savedPrimaryColor);
            document.documentElement.style.setProperty('--tenant-primary-color', savedPrimaryColor);
            document.documentElement.style.setProperty('--tenant-secondary-color', savedSecondaryColor);
            // localStorage도 업데이트
            try {
              localStorage.setItem('tenant-primary-color', savedPrimaryColor);
              localStorage.setItem('tenant-secondary-color', savedSecondaryColor);
            } catch (e) {
              console.warn('localStorage 업데이트 실패:', e);
            }
            return true; // 재적용했음
          }
          console.log('✅ 색상이 정상적으로 적용되어 있습니다.');
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
      console.error('브랜딩 설정 저장 오류:', error);
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
        secondaryColor: branding.secondaryColor || '#8b5cf6',
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">브랜딩 설정</h1>
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
                    src={`http://localhost:5000${formData.logo}`}
                    alt="로고 미리보기"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
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
                    src={`http://localhost:5000${formData.mainImage}`}
                    alt="메인 이미지 미리보기"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
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
                <Label htmlFor="secondary-color">보조 색상 (Secondary)</Label>
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
                    placeholder="#8b5cf6"
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
                    const originalSecondaryColor = branding.secondaryColor || '#8b5cf6';
                    const originalTheme = branding.theme || 'light';
                    
                    document.documentElement.style.setProperty('--tenant-primary-color', originalPrimaryColor);
                    document.documentElement.style.setProperty('--tenant-secondary-color', originalSecondaryColor);
                    
                    if (originalTheme === 'dark') {
                      document.documentElement.classList.add('dark');
                    } else {
                      document.documentElement.classList.remove('dark');
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
                <div className="border rounded-lg p-4 bg-gradient-to-r"
                     style={{
                       background: `linear-gradient(to right, ${formData.primaryColor}, ${formData.secondaryColor || formData.primaryColor})`
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


