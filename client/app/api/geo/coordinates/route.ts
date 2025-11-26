import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { success: false, error: '주소가 필요합니다.' },
        { status: 400 }
      );
    }

    const key = process.env.NEXT_PUBLIC_VWORLD_KEY;
    if (!key) {
      return NextResponse.json(
        { success: false, error: 'VWorld API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // VWorld 지오코딩 API 호출
    const url = new URL('https://api.vworld.kr/req/address');
    url.searchParams.set('service', 'address');
    url.searchParams.set('request', 'getCoord');
    url.searchParams.set('version', '2.0');
    url.searchParams.set('crs', 'EPSG:4326');
    url.searchParams.set('type', 'ROAD');
    url.searchParams.set('format', 'json');
    url.searchParams.set('key', key);
    url.searchParams.set('address', address);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`VWorld API 오류: ${response.status}`);
    }

    const data = await response.json();

    const point = data?.response?.result?.point;
    if (!point) {
      return NextResponse.json({
        success: false,
        error: '주소에서 좌표를 찾을 수 없습니다.'
      });
    }

    return NextResponse.json({
      success: true,
      lat: Number(point.y),
      lng: Number(point.x)
    });

  } catch (error) {
    logger.error('❌ 좌표 변환 API 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '좌표 변환 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

