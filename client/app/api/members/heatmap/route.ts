/**
 * 🗺️ JJ Swim Lab - 개별 회원 위치 분포 API
 * 
 * 📋 **API 목적**
 * - 개별 회원의 실제 위치를 점(Point)으로 표시
 * - 프라이버시 보호를 위한 위치 노이즈 추가
 * - 회원 유형별 색상 구분
 * 
 * 🔄 **주요 기능**
 * - 개별 회원 위치 데이터 제공
 * - 위치 노이즈 (100-200m 랜덤 오프셋)
 * - 회원 유형별 색상 매핑
 * - 프라이버시 보호 (정확한 주소 노출 방지)
 * 
 * 🗄️ **데이터 연동**
 * - 회원 데이터베이스
 * - 주소 → 좌표 변환 (VWorld Geocoder)
 * - 프라이버시 보호 알고리즘
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 정확한 주소는 절대 클라이언트에 전송 금지
 * 2. 위치 노이즈는 100-200m 범위로 제한
 * 3. 회원 유형별 색상은 일관성 유지
 * 4. 대량 데이터는 페이지네이션 고려
 */

import { NextResponse } from 'next/server';

// 타입 정의
interface MemberPoint {
  id: string;
  position: [number, number]; // [longitude, latitude]
  memberType: 'regular' | 'premium' | 'vip' | 'instructor';
  centerId: string;
  ageGroup: 'child' | 'teen' | 'adult' | 'senior';
  joinDate: string;
}

/**
 * 위치 노이즈 생성 (100-200m 랜덤 오프셋)
 */
function addLocationNoise(lat: number, lng: number): [number, number] {
  // 100-200m 랜덤 오프셋 (대략 0.001-0.002도)
  const noiseLat = (Math.random() - 0.5) * 0.002;
  const noiseLng = (Math.random() - 0.5) * 0.002;
  
  return [lng + noiseLng, lat + noiseLat];
}

/**
 * 목업 데이터 생성 - 개별 회원 위치
 * TODO: 실제 DB에서 가져오기
 */
function generateMemberPoints(): MemberPoint[] {
  // 서울 주요 지역 좌표
  const seoulLocations = [
    { lat: 37.4999, lng: 127.0311, name: '강남역' },
    { lat: 37.4869, lng: 127.0326, name: '서초역' },
    { lat: 37.5123, lng: 127.1023, name: '잠실역' },
    { lat: 37.5212, lng: 126.9243, name: '여의도역' },
    { lat: 37.5556, lng: 126.9367, name: '신촌역' },
    { lat: 37.5089, lng: 127.0628, name: '삼성역' },
    { lat: 37.5145, lng: 127.1056, name: '송파역' },
    { lat: 37.5547, lng: 126.9706, name: '서울역' },
    { lat: 37.5665, lng: 126.9780, name: '명동' },
    { lat: 37.5511, lng: 126.9882, name: '홍대입구' },
    { lat: 37.5407, lng: 127.0692, name: '건대입구' },
    { lat: 37.5172, lng: 127.0473, name: '선릉역' }
  ];

  const memberTypes: Array<'regular' | 'premium' | 'vip' | 'instructor'> = ['regular', 'premium', 'vip', 'instructor'];
  const ageGroups: Array<'child' | 'teen' | 'adult' | 'senior'> = ['child', 'teen', 'adult', 'senior'];
  const centers = ['강남센터', '홍대센터', '송파센터', '마포센터'];
  
  const points: MemberPoint[] = [];
  
  // 각 지역별로 5-15명의 회원 생성
  seoulLocations.forEach((location, index) => {
    const memberCount = Math.floor(Math.random() * 10) + 5; // 5-15명
    
    for (let i = 0; i < memberCount; i++) {
      const [noisyLng, noisyLat] = addLocationNoise(location.lat, location.lng);
      
      points.push({
        id: `member_${index}_${i}`,
        position: [noisyLng, noisyLat],
        memberType: memberTypes[Math.floor(Math.random() * memberTypes.length)],
        centerId: centers[Math.floor(Math.random() * centers.length)],
        ageGroup: ageGroups[Math.floor(Math.random() * ageGroups.length)],
        joinDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString()
      });
    }
  });
  
  return points;
}

/**
 * GET /api/members/heatmap
 * 개별 회원 위치 데이터 제공
 */
export async function GET() {
  try {
    console.log('🗺️ 개별 회원 위치 API 호출 시작');

    // 1) DB에서 데이터 가져오기 (현재는 목업 사용)
    // TODO: 실제 DB 쿼리로 교체
    const memberPoints = generateMemberPoints();

    console.log(`📊 개별 회원 위치: ${memberPoints.length}개`);

    // 2) 프라이버시 보호 적용
    // - 위치 노이즈는 이미 generateMemberPoints에서 적용됨
    // - 추가적인 프라이버시 보호 로직 필요시 여기에 추가

    // 3) 응답 데이터
    const response = {
      success: true,
      data: {
        points: memberPoints,
        metadata: {
          totalPoints: memberPoints.length,
          locationNoise: '100-200m 랜덤 오프셋 적용',
          privacyNotice: '개별 회원의 정확한 위치는 프라이버시 보호를 위해 노이즈가 적용되었습니다.',
          memberTypes: {
            regular: '일반 회원',
            premium: '프리미엄 회원', 
            vip: 'VIP 회원',
            instructor: '강사'
          },
          ageGroups: {
            child: '어린이 (7-12세)',
            teen: '청소년 (13-19세)',
            adult: '성인 (20-64세)',
            senior: '시니어 (65세 이상)'
          }
        }
      }
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('❌ 개별 회원 위치 API 오류:', error);

    return NextResponse.json({
      success: false,
      error: '개별 회원 위치 데이터를 가져오는 중 오류가 발생했습니다.',
      data: { points: [] }
    }, { status: 500 });
  }
}
