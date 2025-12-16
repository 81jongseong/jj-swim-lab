import Link from 'next/link';
import { Button } from './ui';

export default function AdminNotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">페이지를 찾을 수 없습니다</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-md">
                요청하신 페이지가 존재하지 않거나, 아직 준비 중인 기능입니다.
                관리자 대시보드로 이동하여 다른 메뉴를 확인해 보세요.
            </p>
            <div className="flex gap-4">
                <Link href="/admin/dashboard">
                    <Button>대시보드로 이동</Button>
                </Link>
                <Link href="/">
                    <Button variant="outline">홈으로 이동</Button>
                </Link>
            </div>
        </div>
    );
}
