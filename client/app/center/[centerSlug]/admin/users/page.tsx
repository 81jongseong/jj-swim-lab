/**
 * 센터 관리자 사용자 경로 별칭
 *
 * 연동되는 파일/페이지:
 * - client/app/center-admin/members/page.tsx (/center-admin/members)
 *
 * 설명:
 * - /center-admin/users 접근 시 /center-admin/members 로 리다이렉트
 */

import { redirect } from 'next/navigation';

export default function UsersAliasPage() {
	redirect('/center-admin/members');
}
