/**
 * 🗺️ 회원/강사/게스트별 분포도 API
 * 
 * 📋 **목적**
 * - 회원, 강사, 게스트별 지역 분포도 제공
 * - 센터별, 지역별 필터링 지원
 * - 최고관리자는 모든 센터 접근 가능
 * - 일반 사용자는 공개된 센터만 접근 가능
 * 
 * 🗄️ **데이터 연동**
 * - 회원 테이블 (members)
 * - 강사 테이블 (instructors) 
 * - 게스트 테이블 (guests)
 * - 센터 테이블 (centers)
 * - H3 지리적 집계
 */

import { NextRequest, NextResponse } from 'next/server';
import * as h3 from 'h3-js';

// 타입 정의
type MemberType = 'member' | 'instructor' | 'guest';
type DistributionData = {
  h3: string;
  regionName: string;
  centerId: string;
  memberType: MemberType;
  count: number;
  coordinates: [number, number]; // [lng, lat]
};

// 목업 데이터 (실제로는 DB에서 가져와야 함)
function generateMockDistributionData(): DistributionData[] {
  const data: DistributionData[] = [];
  const centers = ['강남센터', '홍대센터', '송파센터', '마포센터'];
  const memberTypes: MemberType[] = ['member', 'instructor', 'guest'];
  
  // H3 셀 ID들 (서울 지역)
  const h3Cells = [
    '8830e1ca2bfffff', '8830e1ca27fffff', '8830e1ca2fffff', '8830e1ca23fffff',
    '8830e1ca3bfffff', '8830e1ca37fffff', '8830e1ca3fffff', '8830e1ca33fffff',
    '8830e1ca0bfffff', '8830e1ca07fffff', '8830e1ca0fffff', '8830e1ca03fffff',
    '8830e1ca1bfffff', '8830e1ca17fffff', '8830e1ca1fffff', '8830e1ca13fffff',
    '8830e1ca4bfffff', '8830e1ca47fffff', '8830e1ca4fffff', '8830e1ca43fffff'
  ];

  h3Cells.forEach(h3Cell => {
    const [lat, lng] = h3.cellToLatLng(h3Cell);
    
    centers.forEach(centerId => {
      memberTypes.forEach(memberType => {
        // 각 조합별로 랜덤한 수량 생성
        const count = Math.floor(Math.random() * 20) + 1;
        
        data.push({
          h3: h3Cell,
          regionName: getRegionName(h3Cell),
          centerId,
          memberType,
          count,
          coordinates: [lng, lat]
        });
      });
    });
  });

  return data;
}

// H3 셀 ID를 지역명으로 변환
function getRegionName(h3CellId: string): string {
  const regionMap: Record<string, string> = {
    '8830e1ca2bfffff': '강남구 역삼동',
    '8830e1ca27fffff': '강남구 역삼동',
    '8830e1ca2fffff': '강남구 역삼동',
    '8830e1ca23fffff': '강남구 역삼동',
    '8830e1ca3bfffff': '강남구 역삼동',
    '8830e1ca37fffff': '강남구 역삼동',
    '8830e1ca3fffff': '강남구 역삼동',
    '8830e1ca33fffff': '강남구 역삼동',
    '8830e1ca0bfffff': '서초구 서초동',
    '8830e1ca07fffff': '서초구 서초동',
    '8830e1ca0fffff': '서초구 서초동',
    '8830e1ca03fffff': '서초구 서초동',
    '8830e1ca1bfffff': '송파구 잠실동',
    '8830e1ca17fffff': '송파구 잠실동',
    '8830e1ca1fffff': '송파구 잠실동',
    '8830e1ca13fffff': '송파구 잠실동',
    '8830e1ca4bfffff': '마포구 홍대입구역',
    '8830e1ca47fffff': '마포구 홍대입구역',
    '8830e1ca4fffff': '마포구 홍대입구역',
    '8830e1ca43fffff': '마포구 홍대입구역'
  };
  
  return regionMap[h3CellId] || '서울시 기타';
}

export async function GET(request: NextRequest) {
  try {
    console.log('🗺️ 회원 분포도 API 호출 시작');

    const { searchParams } = new URL(request.url);
    const centerId = searchParams.get('centerId');
    const memberType = searchParams.get('memberType') as MemberType;
    const region = searchParams.get('region');
    const userRole = searchParams.get('userRole') || 'member'; // 기본값: 일반 회원

    // 목업 데이터 생성
    let data = generateMockDistributionData();

    // 필터링 적용
    if (centerId) {
      data = data.filter(d => d.centerId === centerId);
    }

    if (memberType) {
      data = data.filter(d => d.memberType === memberType);
    }

    if (region) {
      data = data.filter(d => d.regionName.includes(region));
    }

    // 권한 기반 필터링
    if (userRole !== 'superAdmin') {
      // 일반 사용자는 공개된 센터만 접근 가능
      // 실제로는 센터의 공개 설정을 확인해야 함
      const publicCenters = ['강남센터', '홍대센터']; // 목업: 공개된 센터
      data = data.filter(d => publicCenters.includes(d.centerId));
    }

    // H3 셀별로 집계
    const aggregated = new Map<string, {
      h3: string;
      regionName: string;
      coordinates: [number, number];
      centers: Record<string, {
        members: number;
        instructors: number;
        guests: number;
        total: number;
      }>;
      total: number;
    }>();

    data.forEach(item => {
      if (!aggregated.has(item.h3)) {
        aggregated.set(item.h3, {
          h3: item.h3,
          regionName: item.regionName,
          coordinates: item.coordinates,
          centers: {},
          total: 0
        });
      }

      const cell = aggregated.get(item.h3)!;
      if (!cell.centers[item.centerId]) {
        cell.centers[item.centerId] = {
          members: 0,
          instructors: 0,
          guests: 0,
          total: 0
        };
      }

      cell.centers[item.centerId][item.memberType + 's'] += item.count;
      cell.centers[item.centerId].total += item.count;
      cell.total += item.count;
    });

    const result = Array.from(aggregated.values());

    console.log(`✅ 회원 분포도 데이터 생성 완료: ${result.length}개 지역`);

    return NextResponse.json({
      success: true,
      data: {
        distributions: result,
        metadata: {
          total: result.length,
          totalMembers: result.reduce((sum, cell) => 
            sum + Object.values(cell.centers).reduce((s, c) => s + c.members, 0), 0),
          totalInstructors: result.reduce((sum, cell) => 
            sum + Object.values(cell.centers).reduce((s, c) => s + c.instructors, 0), 0),
          totalGuests: result.reduce((sum, cell) => 
            sum + Object.values(cell.centers).reduce((s, c) => s + c.guests, 0), 0),
          filters: {
            centerId,
            memberType,
            region,
            userRole
          },
          userRole,
          accessLevel: userRole === 'superAdmin' ? 'all_centers' : 'public_centers_only'
        }
      }
    });

  } catch (error) {
    console.error('❌ 회원 분포도 API 오류:', error);

    return NextResponse.json({
      success: false,
      error: '회원 분포도 데이터를 가져오는 중 오류가 발생했습니다.',
      data: { distributions: [] }
    }, { status: 500 });
  }
}



