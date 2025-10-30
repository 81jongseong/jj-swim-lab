/**
 * 테넌트 라우팅 별칭: /center/[centerSlug]/admin/notices → 기존 관리자 공지 관리로 임시 리다이렉트
 *
 * 연동 파일: client/app/center-admin/notices/page.tsx
 */

import { redirect } from 'next/navigation';

export default function TenantNoticesAlias() {
	redirect('/center-admin/notices');
}
