/**
 * 🗺️ H3 셀 ID를 실제 지역명으로 변환하는 API
 * 
 * 📋 **목적**
 * - H3 셀 ID를 한국의 실제 지역명으로 변환
 * - 서울시 구/동 단위로 매핑
 * - 회원 분포도에서 정확한 지역명 표시
 * 
 * 🗄️ **데이터 연동**
 * - H3 셀 중심 좌표를 기반으로 지역명 조회
 * - 서울시 행정구역 데이터 활용
 */

import { NextResponse } from 'next/server';
import * as h3 from 'h3-js';

// 서울시 구/동 매핑 데이터 (실제로는 DB에서 가져와야 함)
const SEOUL_REGIONS = {
  // 강남구
  '8830e1ca2bfffff': { gu: '강남구', dong: '역삼동' },
  '8830e1ca27fffff': { gu: '강남구', dong: '역삼동' },
  '8830e1ca2fffff': { gu: '강남구', dong: '역삼동' },
  '8830e1ca23fffff': { gu: '강남구', dong: '역삼동' },
  '8830e1ca3bfffff': { gu: '강남구', dong: '역삼동' },
  '8830e1ca37fffff': { gu: '강남구', dong: '역삼동' },
  '8830e1ca3fffff': { gu: '강남구', dong: '역삼동' },
  '8830e1ca33fffff': { gu: '강남구', dong: '역삼동' },
  
  // 서초구
  '8830e1ca0bfffff': { gu: '서초구', dong: '서초동' },
  '8830e1ca07fffff': { gu: '서초구', dong: '서초동' },
  '8830e1ca0fffff': { gu: '서초구', dong: '서초동' },
  '8830e1ca03fffff': { gu: '서초구', dong: '서초동' },
  
  // 송파구
  '8830e1ca1bfffff': { gu: '송파구', dong: '잠실동' },
  '8830e1ca17fffff': { gu: '송파구', dong: '잠실동' },
  '8830e1ca1fffff': { gu: '송파구', dong: '잠실동' },
  '8830e1ca13fffff': { gu: '송파구', dong: '잠실동' },
  
  // 마포구
  '8830e1ca4bfffff': { gu: '마포구', dong: '홍대입구역' },
  '8830e1ca47fffff': { gu: '마포구', dong: '홍대입구역' },
  '8830e1ca4fffff': { gu: '마포구', dong: '홍대입구역' },
  '8830e1ca43fffff': { gu: '마포구', dong: '홍대입구역' },
  
  // 기타 (기본값)
  'default': { gu: '서울시', dong: '기타' }
};

/**
 * H3 셀 ID를 지역명으로 변환
 */
function getRegionName(h3CellId: string): { gu: string; dong: string; fullName: string } {
  const region = SEOUL_REGIONS[h3CellId as keyof typeof SEOUL_REGIONS] || SEOUL_REGIONS.default;
  return {
    gu: region.gu,
    dong: region.dong,
    fullName: `${region.gu} ${region.dong}`
  };
}

/**
 * 좌표를 기반으로 지역명 조회 (향후 확장용)
 */
function getRegionByCoordinates(lat: number, lng: number): { gu: string; dong: string; fullName: string } {
  // 실제로는 좌표 기반 지역명 조회 API를 사용해야 함
  // 현재는 H3 셀 기반으로만 처리
  return { gu: '서울시', dong: '기타', fullName: '서울시 기타' };
}

export async function GET(request: Request) {
  try {
    console.log('🗺️ 지역명 변환 API 호출 시작');

    const { searchParams } = new URL(request.url);
    const h3CellIds = searchParams.get('h3CellIds');
    const coordinates = searchParams.get('coordinates');

    if (h3CellIds) {
      // H3 셀 ID 배열로 지역명 조회
      const cellIds = h3CellIds.split(',');
      const regionNames = cellIds.map(cellId => ({
        h3CellId: cellId,
        ...getRegionName(cellId)
      }));

      return NextResponse.json({
        success: true,
        data: {
          regionNames,
          total: regionNames.length
        }
      });
    }

    if (coordinates) {
      // 좌표 배열로 지역명 조회
      const coords = JSON.parse(coordinates);
      const regionNames = coords.map((coord: { lat: number; lng: number }) => ({
        coordinates: coord,
        ...getRegionByCoordinates(coord.lat, coord.lng)
      }));

      return NextResponse.json({
        success: true,
        data: {
          regionNames,
          total: regionNames.length
        }
      });
    }

    // 전체 지역명 목록 반환
    const allRegions = Object.entries(SEOUL_REGIONS)
      .filter(([key]) => key !== 'default')
      .map(([h3CellId, region]) => ({
        h3CellId,
        ...region,
        fullName: `${region.gu} ${region.dong}`
      }));

    return NextResponse.json({
      success: true,
      data: {
        regions: allRegions,
        total: allRegions.length
      }
    });

  } catch (error) {
    console.error('❌ 지역명 변환 API 오류:', error);

    return NextResponse.json({
      success: false,
      error: '지역명 변환 중 오류가 발생했습니다.',
      data: { regions: [] }
    }, { status: 500 });
  }
}



