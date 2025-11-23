/**
 * 대시보드 통계 API 프록시
 * 
 * 연동되는 데이터:
 * - 서버의 /api/dashboard/stats 엔드포인트
 * 
 * 연동되는 파일:
 * - client/lib/api/dashboard.ts
 * - client/app/admin/dashboard/page.tsx
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // 서버 URL 가져오기 (서버 사이드에서는 환경 변수 사용 가능)
    const serverUrl = process.env.SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    // 클라이언트에서 전달된 Authorization 헤더 가져오기
    const authHeader = req.headers.get('authorization');
    
    // 서버로 요청 전달
    const response = await fetch(`${serverUrl}/api/dashboard/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
      cache: 'no-store', // 캐시 사용 안 함
    });

    // 응답 데이터 가져오기
    const data = await response.json();

    // 서버 응답을 그대로 반환
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('대시보드 통계 프록시 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '대시보드 통계를 가져올 수 없습니다',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

