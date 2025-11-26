import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { centerId: string } }
) {
  try {
    const centerId = params.centerId;
    
    if (!centerId) {
      return NextResponse.json(
        { success: false, error: '센터 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 서버 API 호출
    const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
    const response = await fetch(`${serverUrl}/api/center-management/${centerId}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: '서버에서 센터 정보를 가져올 수 없습니다.' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    logger.error('센터 정보 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '센터 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


