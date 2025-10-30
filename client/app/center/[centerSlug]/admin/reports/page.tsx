/**
 * 테넌트 라우팅 별칭: /center/[centerSlug]/admin/reports → 기존 관리자 리포트로 임시 리다이렉트
 *
 * 연동 파일: client/app/center-admin/reports/page.tsx
 * 향후: centerSlug → centerId 매핑 후 컨텍스트 주입 예정
 */

import { redirect } from 'next/navigation';

export default function TenantReportsAlias() {
	redirect('/center-admin/reports');
}
