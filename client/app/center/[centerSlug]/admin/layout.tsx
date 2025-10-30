/**
 * 테넌트 레이아웃: centerSlug → centerId 컨텍스트 주입
 *
 * 연동되는 파일/페이지:
 * - client/app/center/[centerSlug]/admin/* (모든 하위 페이지)
 * - hooks/useTenant.ts (컨텍스트 훅)
 */

'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';

interface TenantContextValue {
  centerSlug: string;
  centerId?: string;
  loading: boolean;
  error?: string;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export default function TenantAdminLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const centerSlug = String((params as any)?.centerSlug || '');
  const [centerId, setCenterId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;
    async function resolveSlug() {
      try {
        setLoading(true);
        setError(undefined);
        // 슬러그 → 센터 조회 API (임시: slug가 id인 경우도 지원)
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/centers/resolve-slug/${encodeURIComponent(centerSlug)}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
        });
        if (res.ok) {
          const data = await res.json();
          const id = data?.data?.centerId || data?.centerId || data?.id || (centerSlug || undefined);
          if (isMounted) {
            setCenterId(id);
            try {
              // 로컬/쿠키에 저장하여 API 헤더에 첨부될 수 있게 함
              localStorage.setItem('centerId', String(id || ''));
              document.cookie = `centerId=${encodeURIComponent(String(id || ''))}; path=/; max-age=${60 * 60 * 24 * 7}`;
            } catch {}
          }
        } else {
          if (isMounted) {
            // 실패 시 slug 자체를 id로 취급하여 최소한 컨텍스트는 채움
          setCenterId(centerSlug || undefined);
            setError('failed_to_resolve_center_slug');
          }
        }
      } catch (e) {
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
      {children}
    </TenantContext.Provider>
  );
}
