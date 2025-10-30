/**
 * 테넌트 라우팅 별칭: /center/[centerSlug]/admin/dashboard → 기존 관리자 대시보드로 임시 리다이렉트
 *
 * 연동 파일: client/app/center-admin/dashboard/page.tsx
 */

import { redirect } from 'next/navigation';

export default function TenantDashboardAlias() {
  redirect('/center-admin/dashboard');
}


