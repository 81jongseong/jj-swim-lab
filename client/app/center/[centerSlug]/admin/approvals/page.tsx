/**
 * 테넌트 라우팅 별칭: /center/[centerSlug]/admin/approvals → 예약·결제 관리로 임시 리다이렉트
 *
 * 연동 파일: client/app/center-admin/manage/page.tsx
 */

import { redirect } from 'next/navigation';

export default function TenantApprovalsAlias() {
  redirect('/center-admin/manage?tab=approvals');
}


