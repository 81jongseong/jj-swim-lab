/**
 * 🏥 JJ Swim Lab - VWorld API 헬스체크
 * 
 * 📋 **API 목적**
 * - VWorld WMTS 타일 서비스 상태 확인
 * - VWorld Geocoder API 상태 확인
 * - 키 만료/권한/쿼터 문제 사전 감지
 * 
 * 🔄 **주요 기능**
 * - WMTS 타일 1장 요청 (샘플)
 * - Geocoder 1건 요청 (샘플)
 * - HTTP 상태 코드 확인
 * - 성공/실패 응답
 * 
 * 🗄️ **데이터 연동**
 * - VWorld WMTS API
 * - VWorld Geocoder 2.0 API
 * - 환경변수 (API 키)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 하루 1회 정도만 호출 권장 (쿼터 소모 최소화)
 * 2. Geocoder는 일 40,000건 제한
 * 3. 헬스체크는 최소 샘플만 사용
 * 4. 캐싱 금지 (no-store)
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🏥 VWorld API 헬스체크 시작...');

    const clientKey = process.env.NEXT_PUBLIC_VWORLD_KEY;
    const serverKey = process.env.VWORLD_SERVER_KEY;

    if (!clientKey || !serverKey) {
      return NextResponse.json({
        success: false,
        tile: 'NO_KEY',
        geocoder: 'NO_KEY',
        message: 'VWorld API 키가 설정되지 않았습니다.'
      }, { 
        status: 500,
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
      });
    }

    // 1. WMTS 타일 헬스체크 (레벨 0, 타일 0,0 - 가장 가벼운 요청)
    const wmtsUrl = `https://api.vworld.kr/req/wmts/1.0.0/${clientKey}/Base/0/0/0.png`;

    // 2. Geocoder 헬스체크 (서울시청 - 항상 성공하는 주소)
    const geocoderUrl = new URL('https://api.vworld.kr/req/address');
    geocoderUrl.searchParams.set('service', 'address');
    geocoderUrl.searchParams.set('request', 'getCoord');
    geocoderUrl.searchParams.set('version', '2.0');
    geocoderUrl.searchParams.set('crs', 'EPSG:4326');
    geocoderUrl.searchParams.set('format', 'json');
    geocoderUrl.searchParams.set('type', 'ROAD');
    geocoderUrl.searchParams.set('key', serverKey);
    geocoderUrl.searchParams.set('address', '서울특별시청');

    // 병렬 요청 (타임아웃 10초)
    const [tileResult, geocoderResult] = await Promise.allSettled([
      fetch(wmtsUrl, { 
        method: 'GET', 
        cache: 'no-store',
        signal: AbortSignal.timeout(10000)
      }),
      fetch(geocoderUrl.toString(), { 
        method: 'GET', 
        cache: 'no-store',
        signal: AbortSignal.timeout(10000)
      })
    ]);

    // 결과 분석
    const tileOk = tileResult.status === 'fulfilled' && tileResult.value.status === 200;
    const geocoderOk = geocoderResult.status === 'fulfilled' && geocoderResult.value.status === 200;

    // 상세 상태
    const tileStatus = tileResult.status === 'fulfilled' 
      ? (tileResult.value.status === 200 ? 'OK' : `HTTP_${tileResult.value.status}`)
      : 'TIMEOUT_OR_ERROR';

    const geocoderStatus = geocoderResult.status === 'fulfilled'
      ? (geocoderResult.value.status === 200 ? 'OK' : `HTTP_${geocoderResult.value.status}`)
      : 'TIMEOUT_OR_ERROR';

    // 로깅
    console.log(`🗺️ WMTS 타일: ${tileStatus}`);
    console.log(`🌍 Geocoder: ${geocoderStatus}`);

    // 만료일 정보
    const expiresAtDate = process.env.NEXT_PUBLIC_VWORLD_EXPIRES_AT;
    let daysLeft = null;

    if (expiresAtDate) {
      const diffTime = new Date(expiresAtDate).getTime() - Date.now();
      daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const response = {
      success: tileOk && geocoderOk,
      tile: tileStatus,
      geocoder: geocoderStatus,
      expiresAt: expiresAtDate,
      daysLeft,
      timestamp: new Date().toISOString(),
      recommendations: []
    };

    // 문제 진단 및 권장사항
    if (!tileOk) {
      response.recommendations.push('WMTS 타일 로딩 실패. 키 만료/권한/도메인 등록을 확인하세요.');
    }

    if (!geocoderOk) {
      response.recommendations.push('Geocoder API 실패. 서버 키 확인 및 일일 쿼터(40,000건)를 확인하세요.');
    }

    if (daysLeft !== null) {
      if (daysLeft <= 0) {
        response.recommendations.push('🚨 VWorld API 키가 만료되었습니다! 즉시 갱신하세요.');
      } else if (daysLeft <= 7) {
        response.recommendations.push(`⚠️ VWorld API 키가 ${daysLeft}일 후 만료됩니다. 갱신을 준비하세요.`);
      } else if (daysLeft <= 30) {
        response.recommendations.push(`⏰ VWorld API 키가 ${daysLeft}일 후 만료됩니다.`);
      }
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('❌ VWorld 헬스체크 오류:', error);

    return NextResponse.json({
      success: false,
      tile: 'ERROR',
      geocoder: 'ERROR',
      message: '헬스체크 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error)
    }, { 
      status: 500,
      headers: { 'Cache-Control': 'no-store' }
    });
  }
}
