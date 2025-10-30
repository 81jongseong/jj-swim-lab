/**
 * useTenant 훅 - centerSlug/centerId 테넌트 컨텍스트 사용
 *
 * 연동 파일:
 * - client/app/center/[centerSlug]/admin/layout.tsx
 */

'use client';

import { useParams } from 'next/navigation';

interface TenantContextValue {
  centerSlug: string;
  centerId?: string;
  loading: boolean;
  error?: string;
}

export function useTenant(): TenantContextValue {
  const params = useParams();
  const slug = String((params as any)?.centerSlug || '');
  return { centerSlug: slug, centerId: undefined, loading: false };
}

export default useTenant;
