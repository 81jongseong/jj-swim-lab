/**
 * 테넌트 라우팅 별칭: /center/[centerSlug]/admin/courses → 기존 관리자 강습 관리로 임시 리다이렉트
 *
 * 연동 파일: client/app/center-admin/courses/page.tsx
 */

import { redirect } from 'next/navigation';

export default function TenantCoursesAlias() {
	redirect('/center-admin/courses');
}
