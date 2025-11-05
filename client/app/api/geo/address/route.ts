/**
 * 좌표를 한글 주소로 변환하는 API Route
 * 
 * VWorld 역지오코딩 API를 서버 사이드에서 호출하여 CORS 문제 해결
 * 
 * 연동되는 파일:
 * - client/lib/utils/address-utils.ts (주소 변환 유틸리티)
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
      return NextResponse.json(
        { success: false, error: '좌표가 필요합니다.' },
        { status: 400 }
      );
    }

    const key = process.env.NEXT_PUBLIC_VWORLD_KEY;
    if (!key) {
      // API 키가 없으면 기본 주소 반환
      return NextResponse.json({
        success: true,
        address: getDefaultAddress(parseFloat(lat), parseFloat(lng))
      });
    }

    // VWorld 역지오코딩 API 호출
    const url = new URL('https://api.vworld.kr/req/address');
    url.searchParams.set('service', 'address');
    url.searchParams.set('request', 'getAddress');
    url.searchParams.set('version', '2.0');
    url.searchParams.set('crs', 'EPSG:4326');
    url.searchParams.set('point', `${lng},${lat}`);
    url.searchParams.set('format', 'json');
    url.searchParams.set('type', 'both');
    url.searchParams.set('zipcode', 'true');
    url.searchParams.set('simple', 'false');
    url.searchParams.set('key', key);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`VWorld API 오류: ${response.status}`);
    }

    const data = await response.json();

    if (data?.response?.status === 'OK' && data?.response?.result) {
      const result = data.response.result[0];
      if (result) {
        // ✅ 구주소(지번 주소)와 현주소(도로명 주소) 모두 확인
        // 도로명 주소 우선, 없으면 지번 주소 사용
        // result.text: 도로명 주소 (현주소)
        // result.parsed: 지번 주소 정보 (구주소)
        // result.zipcode: 우편번호
        
        let address = result.text || null; // 도로명 주소 (현주소) 우선
        
        // 도로명 주소가 없으면 지번 주소 사용 (구주소)
        if (!address && result.parsed) {
          const parsed = result.parsed;
          const parts = [];
          if (parsed.sido) parts.push(parsed.sido);
          if (parsed.sigungu) parts.push(parsed.sigungu);
          if (parsed.dong) parts.push(parsed.dong);
          if (parsed.ri) parts.push(parsed.ri);
          if (parts.length > 0) {
            address = parts.join(' ');
          }
        }
        
        // zipcode는 우편번호이므로 주소로 사용하지 않음
        
        if (address) {
          return NextResponse.json({
            success: true,
            address
          });
        }
      }
    }

    // 주소를 찾지 못한 경우 기본 주소 반환
    return NextResponse.json({
      success: true,
      address: getDefaultAddress(parseFloat(lat), parseFloat(lng))
    });

  } catch (error) {
    console.error('❌ 주소 변환 API 오류:', error);
    
    // 오류 시에도 기본 주소 반환
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '37.4979');
    const lng = parseFloat(searchParams.get('lng') || '127.0276');
    
    return NextResponse.json({
      success: true,
      address: getDefaultAddress(lat, lng)
    });
  }
}

/**
 * 기본 주소 생성 (API 실패 시 사용)
 */
function getDefaultAddress(lat: number, lng: number): string {
  // 좌표 기반으로 간단한 주소 생성
  // 서울 강남구 기준
  if (lat >= 37.4 && lat <= 37.6 && lng >= 126.9 && lng <= 127.1) {
    // 강남역 부근
    if (lat >= 37.49 && lat <= 37.51 && lng >= 127.02 && lng <= 127.04) {
      return '서울특별시 강남구 역삼동';
    }
    // 테헤란로 부근
    if (lat >= 37.5 && lat <= 37.52) {
      return '서울특별시 강남구 테헤란로';
    }
    return '서울특별시 강남구';
  }
  
  // 기본값
  return `서울특별시 (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
}



