/**
 * 테넌트 라우팅 별칭: /center/[centerSlug]/admin/bookings → 예약·결제 관리로 임시 리다이렉트
 *
 * 연동 파일: client/app/center-admin/manage/page.tsx
 */

import { redirect } from 'next/navigation';

export default function TenantBookingsAlias() {
  redirect('/center-admin/manage?tab=bookings');
}


