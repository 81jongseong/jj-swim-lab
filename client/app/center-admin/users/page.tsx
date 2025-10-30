/**
 * 센터 관리자 사용자 경로 별칭
 *
 * 연동되는 파일/페이지:
 * - client/app/center-admin/members/page.tsx (/center-admin/members)
 *
 * 설명:
 * - /center-admin/users 접근 시 /center-admin/members 로 리다이렉트
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UsersAliasPage() {
	const router = useRouter();
	
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const slug = localStorage.getItem('centerSlug') || 'default';
			const currentPath = window.location.pathname;
			if (currentPath.startsWith('/center-admin/users')) {
				router.replace(`/center/${slug}/admin/members`);
				return;
			}
		}
	}, [router]);
	
	return null;
}
