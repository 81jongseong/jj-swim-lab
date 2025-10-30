/**
 * 테넌트 라우팅 별칭: /center/[centerSlug]/admin/members → 기존 관리자 회원 관리로 임시 리다이렉트
 *
 * 연동 파일: client/app/center-admin/members/page.tsx
 */

import { redirect } from 'next/navigation';

export default function TenantMembersAlias() {
	redirect('/center-admin/members');
}
