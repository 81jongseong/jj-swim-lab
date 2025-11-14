/**
 * 테넌트 레이아웃: centerSlug → centerId 컨텍스트 주입
 *
 * 연동되는 파일/페이지:
 * - client/app/center/[centerSlug]/admin/* (모든 하위 페이지)
 * - hooks/useTenant.ts (컨텍스트 훅)
 */

'use client';

import dynamic from 'next/dynamic';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { TenantSettingsProvider } from '@/contexts/TenantSettingsContext';

interface TenantContextValue {
  centerSlug: string;
  centerId?: string;
  loading: boolean;
  error?: string;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

function TenantAdminLayoutComponent({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const centerSlug = String((params as any)?.centerSlug || '');
  const [centerId, setCenterId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;
    // centerSlug를 localStorage에 저장 (리다이렉트용)
    if (centerSlug) {
      try {
        localStorage.setItem('centerSlug', centerSlug);
      } catch (storageError) {
        console.warn('centerSlug 저장 실패:', storageError);
      }
    }
    async function resolveSlug() {
      try {
        setLoading(true);
        setError(undefined);
        console.log(`🔍 센터 슬러그 해석 시작: ${centerSlug}`);
        
        // 슬러그 → 센터 조회 API (임시: slug가 id인 경우도 지원)
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/centers/resolve-slug/${encodeURIComponent(centerSlug)}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
        });
        
        if (res.ok) {
          const data = await res.json();
          const id = data?.data?.centerId || data?.centerId || data?.id || (centerSlug || undefined);
          console.log(`✅ 센터 ID 조회 성공: ${centerSlug} → ${id}`);
          
          if (isMounted) {
            setCenterId(id);
            try {
              // 로컬/쿠키에 저장하여 API 헤더에 첨부될 수 있게 함
              localStorage.setItem('centerId', String(id || ''));
              document.cookie = `centerId=${encodeURIComponent(String(id || ''))}; path=/; max-age=${60 * 60 * 24 * 7}`;
              console.log(`💾 센터 ID 저장 완료: ${id}`);
            } catch (e) {
              console.error('센터 ID 저장 실패:', e);
            }
          }
        } else if (res.status === 401) {
          console.warn(`⚠️ 인증 실패 (401), slug를 ID로 사용: ${centerSlug}`);
          // 인증 실패 시에도 slug를 id로 사용하여 계속 진행
          if (isMounted) {
            setCenterId(centerSlug || undefined);
            try {
              localStorage.setItem('centerId', centerSlug || '');
              document.cookie = `centerId=${encodeURIComponent(centerSlug || '')}; path=/; max-age=${60 * 60 * 24 * 7}`;
            } catch (persistError) {
              console.warn('centerId 저장 실패:', persistError);
            }
            setError('auth_required'); // 에러는 설정하되 계속 진행
          }
        } else {
          console.warn(`⚠️ 센터 ID 조회 실패 (${res.status}), slug를 ID로 사용: ${centerSlug}`);
          if (isMounted) {
            // 실패 시 slug 자체를 id로 취급하여 최소한 컨텍스트는 채움
            setCenterId(centerSlug || undefined);
            try {
              localStorage.setItem('centerId', centerSlug || '');
              document.cookie = `centerId=${encodeURIComponent(centerSlug || '')}; path=/; max-age=${60 * 60 * 24 * 7}`;
            } catch (fallbackError) {
              console.warn('centerId 저장 실패 (fallback):', fallbackError);
            }
            setError('failed_to_resolve_center_slug');
          }
        }
      } catch (e) {
        console.error('센터 슬러그 해석 오류:', e);
        if (isMounted) {
          setCenterId(centerSlug || undefined);
          setError('resolve_center_slug_error');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    if (centerSlug) resolveSlug();
    return () => { isMounted = false; };
  }, [centerSlug]);

  const value = useMemo<TenantContextValue>(() => ({ centerSlug, centerId, loading, error }), [centerSlug, centerId, loading, error]);

  return (
    <TenantContext.Provider value={value}>
      <TenantSettingsProvider centerId={centerId}>
        {children}
      </TenantSettingsProvider>
    </TenantContext.Provider>
  );
}

export default dynamic(() => Promise.resolve(TenantAdminLayoutComponent), { ssr: false });
