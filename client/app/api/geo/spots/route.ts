/**
 * 지오해시 블록 기반 스팟 API
 * 
 * 연동되는 데이터:
 * - 주소 데이터를 지오해시 블록으로 집계
 * - k-익명성, 노이즈, 반올림을 통한 프라이버시 보호
 * 
 * 연동되는 파일:
 * - client/app/admin/geo/page-block-spots.tsx (프론트엔드)
 * - client/lib/center-colors.ts (센터 색상 관리)
 */

import { NextRequest, NextResponse } from 'next/server';
import ngeohash from 'ngeohash';

type Row = { 
  geohash: string; 
  center_id: string; 
  memberType: 'member' | 'instructor' | 'guest' | 'center';
  count: number; 
};

// 서울 강남구/서초구 경계 박스 (실제 지오해시 범위에 맞춤)
const BBOX_SEOUL = { 
  minLng: 126.9, 
  minLat: 37.4, 
  maxLng: 127.1, 
  maxLat: 37.6 
};

const K = 20;                 // 운영 기본 k-익명 (강화)
const ROUND = 10;             // 10명 단위 반올림 (강화)
const EPS = 1.5;              // 라플라스 노이즈 ε (강한 보호)

// 라플라스 노이즈 생성
const laplace = (n: number, eps = 1) => 
  n + (Math.random() < 0.5 ? -1 : 1) * (Math.log(1 - Math.random()) / -eps);

// 10단위 반올림 (보안 강화)
const round5 = (n: number) => Math.max(0, Math.round(n / ROUND) * ROUND);

// 경계 박스 내부 확인
function insideBBox(lng: number, lat: number, b = BBOX_SEOUL) {
  return lng >= b.minLng && lng <= b.maxLng && lat >= b.minLat && lat <= b.maxLat;
}

// DB에서 블록 집계 읽어오기 (실서비스는 Prisma/SQL 연결)
async function fetchAggBlocks(precision: number, dong?: string, memberType?: string): Promise<Row[]> {
  // 목업 데이터 - 실제로는 SELECT geohash, center_id, member_type, count FROM agg_blocks WHERE length(geohash)=precision AND ...
  // 서울 강남구/서초구 지역의 실제 지오해시 사용 (7자리 정밀도)
  // 강남구 중심 좌표 (127.0276, 37.4979) 주변의 실제 지오해시
  const mockData: Row[] = [
    // 회원 데이터 (5개 구역으로 분할 - 5자리 접두사)
    // 구역 1: wydm6
    { geohash: 'wydm69e', center_id: '강남센터', memberType: 'member', count: 1 },
    { geohash: 'wydm6dm', center_id: '홍대센터', memberType: 'member', count: 3 },
    { geohash: 'wydm6dc', center_id: '송파센터', memberType: 'member', count: 2 },
    { geohash: 'wydm698', center_id: '강남센터', memberType: 'member', count: 15 },
    
    // 구역 2: wydm7
    { geohash: 'wydm7du', center_id: '마포센터', memberType: 'member', count: 5 },
    { geohash: 'wydm7eh', center_id: '송파센터', memberType: 'member', count: 25 },
    { geohash: 'wydm76p', center_id: '강남센터', memberType: 'member', count: 10 },
    { geohash: 'wydm79v', center_id: '홍대센터', memberType: 'member', count: 45 },
    
    // 구역 3: wydm8
    { geohash: 'wydm8dc', center_id: '마포센터', memberType: 'member', count: 4 },
    { geohash: 'wydm8d0', center_id: '송파센터', memberType: 'member', count: 20 },
    { geohash: 'wydm8dk', center_id: '강남센터', memberType: 'member', count: 1 },
    { geohash: 'wydm89e', center_id: '마포센터', memberType: 'member', count: 35 },
    
    // 구역 4: wydm9
    { geohash: 'wydm9dm', center_id: '홍대센터', memberType: 'member', count: 6 },
    { geohash: 'wydm9dc', center_id: '강남센터', memberType: 'member', count: 12 },
    { geohash: 'wydm998', center_id: '송파센터', memberType: 'member', count: 7 },
    { geohash: 'wydm9du', center_id: '강남센터', memberType: 'member', count: 30 },
    
    // 구역 5: wydmb
    { geohash: 'wydmbeh', center_id: '홍대센터', memberType: 'member', count: 40 },
    { geohash: 'wydmb6p', center_id: '송파센터', memberType: 'member', count: 18 },
    { geohash: 'wydmb9v', center_id: '마포센터', memberType: 'member', count: 9 },
    
    // 강사 데이터 (5개 구역으로 분할 - 5자리 접두사)
    // 구역 1: wydm6
    { geohash: 'wydm69e', center_id: '강남센터', memberType: 'instructor', count: 2 },
    { geohash: 'wydm6dm', center_id: '홍대센터', memberType: 'instructor', count: 1 },
    { geohash: 'wydm6dc', center_id: '송파센터', memberType: 'instructor', count: 1 },
    { geohash: 'wydm698', center_id: '강남센터', memberType: 'instructor', count: 2 },
    
    // 구역 2: wydm7
    { geohash: 'wydm7du', center_id: '마포센터', memberType: 'instructor', count: 1 },
    { geohash: 'wydm7eh', center_id: '송파센터', memberType: 'instructor', count: 4 },
    { geohash: 'wydm76p', center_id: '강남센터', memberType: 'instructor', count: 2 },
    { geohash: 'wydm79v', center_id: '홍대센터', memberType: 'instructor', count: 5 },
    
    // 구역 3: wydm8
    { geohash: 'wydm8dc', center_id: '마포센터', memberType: 'instructor', count: 1 },
    { geohash: 'wydm8d0', center_id: '송파센터', memberType: 'instructor', count: 3 },
    { geohash: 'wydm8dk', center_id: '강남센터', memberType: 'instructor', count: 1 },
    { geohash: 'wydm89e', center_id: '마포센터', memberType: 'instructor', count: 6 },
    
    // 구역 4: wydm9
    { geohash: 'wydm9dm', center_id: '홍대센터', memberType: 'instructor', count: 2 },
    { geohash: 'wydm9dc', center_id: '강남센터', memberType: 'instructor', count: 4 },
    { geohash: 'wydm998', center_id: '송파센터', memberType: 'instructor', count: 2 },
    { geohash: 'wydm9du', center_id: '강남센터', memberType: 'instructor', count: 1 },
    
    // 구역 5: wydmb
    { geohash: 'wydmbeh', center_id: '홍대센터', memberType: 'instructor', count: 7 },
    { geohash: 'wydmb6p', center_id: '송파센터', memberType: 'instructor', count: 2 },
    { geohash: 'wydmb9v', center_id: '마포센터', memberType: 'instructor', count: 1 },
    
    // 게스트 데이터 (5개 구역으로 분할 - 5자리 접두사)
    // 구역 1: wydm6
    { geohash: 'wydm69e', center_id: '강남센터', memberType: 'guest', count: 1 },
    { geohash: 'wydm69f', center_id: '홍대센터', memberType: 'guest', count: 2 },
    { geohash: 'wydm69g', center_id: '송파센터', memberType: 'guest', count: 1 },
    
    // 구역 2: wydm7
    { geohash: 'wydm7ae', center_id: '강남센터', memberType: 'guest', count: 1 },
    { geohash: 'wydm7af', center_id: '마포센터', memberType: 'guest', count: 1 },
    { geohash: 'wydm7ag', center_id: '송파센터', memberType: 'guest', count: 3 },
    
    // 구역 3: wydm8
    { geohash: 'wydm8be', center_id: '홍대센터', memberType: 'guest', count: 4 },
    { geohash: 'wydm8bf', center_id: '마포센터', memberType: 'guest', count: 1 },
    { geohash: 'wydm8bg', center_id: '송파센터', memberType: 'guest', count: 2 },
    
    // 구역 4: wydm9
    { geohash: 'wydm9ce', center_id: '강남센터', memberType: 'guest', count: 1 },
    { geohash: 'wydm9cf', center_id: '마포센터', memberType: 'guest', count: 5 },
    { geohash: 'wydm9cg', center_id: '홍대센터', memberType: 'guest', count: 1 },
    
    // 구역 5: wydmb
    { geohash: 'wydmbde', center_id: '강남센터', memberType: 'guest', count: 3 },
    { geohash: 'wydmbdf', center_id: '송파센터', memberType: 'guest', count: 1 },
    { geohash: 'wydmbdg', center_id: '홍대센터', memberType: 'guest', count: 6 },
    { geohash: 'wydmbdh', center_id: '마포센터', memberType: 'guest', count: 1 },
    
    // 센터 데이터 (각 센터 위치에 1개씩)
    { geohash: 'wydm69e', center_id: '강남센터', memberType: 'center', count: 1 },
    { geohash: 'wydm6dm', center_id: '홍대센터', memberType: 'center', count: 1 },
    { geohash: 'wydm6dc', center_id: '송파센터', memberType: 'center', count: 1 },
    { geohash: 'wydm7du', center_id: '마포센터', memberType: 'center', count: 1 },
    { geohash: 'wydm8dc', center_id: '수원센터', memberType: 'center', count: 1 },
    { geohash: 'wydm9dm', center_id: '성남센터', memberType: 'center', count: 1 },
    { geohash: 'wydmbeh', center_id: '인천센터', memberType: 'center', count: 1 },
    { geohash: 'wydm69f', center_id: '부산센터', memberType: 'center', count: 1 },
    { geohash: 'wydm69g', center_id: '대구센터', memberType: 'center', count: 1 },
    { geohash: 'wydm7ae', center_id: '광주센터', memberType: 'center', count: 1 },
    { geohash: 'wydm7af', center_id: '대전센터', memberType: 'center', count: 1 },
    { geohash: 'wydm7ag', center_id: '울산센터', memberType: 'center', count: 1 },
    { geohash: 'wydm8be', center_id: '세종센터', memberType: 'center', count: 1 },
    { geohash: 'wydm8bf', center_id: '춘천센터', memberType: 'center', count: 1 },
    { geohash: 'wydm8bg', center_id: '강릉센터', memberType: 'center', count: 1 },
    { geohash: 'wydm9ce', center_id: '기타', memberType: 'center', count: 1 },
  ];

  // memberType 필터링
  if (memberType && memberType !== 'all') {
    return mockData.filter(row => row.memberType === memberType);
  }

  return mockData;
}

export async function GET(req: NextRequest) {
  try {
    console.log('🗺️ 지오해시 블록 스팟 API 호출 시작');

    const p = Number(req.nextUrl.searchParams.get('precision') || '7'); // 7 or 8 권장
    const dong = req.nextUrl.searchParams.get('dong') || undefined;
    const k = Number(req.nextUrl.searchParams.get('k') || K);
    const memberType = req.nextUrl.searchParams.get('memberType') || 'all';
    const zoom = Number(req.nextUrl.searchParams.get('zoom') || '12'); // 줌 레벨 추가

    console.log(`📊 요청 파라미터: precision=${p}, dong=${dong}, k=${k}, memberType=${memberType}, zoom=${zoom}`);

    const rows = await fetchAggBlocks(p, dong, memberType);

    // 정밀도별 구역 분할 (지번주소 단위 기준)
    let aggregationPrecision: number;
    if (zoom >= 16) {
      // 줌≥16: 도로명주소 단위 (7자리, ≈150m)
      aggregationPrecision = 7;
    } else if (zoom >= 15) {
      // 줌 15: 지번주소 단위 (5자리, ≈4.9km) - 도로명주소가 아닌 지번주소 단위
      aggregationPrecision = 5;
    } else if (zoom >= 12) {
      // 줌 12-14: 지번주소 단위 (5자리, ≈4.9km)
      aggregationPrecision = 5;
    } else if (zoom >= 10) {
      // 줌 10-11: 행정동 단위 (4자리, ≈19.5km)
      aggregationPrecision = 4;
    } else if (zoom >= 9) {
      // 줌 9: 행정구 단위 (3자리, ≈78km)
      aggregationPrecision = 3;
    } else {
      // 줌<9: 시 단위 (2자리, ≈312km)
      aggregationPrecision = 2;
    }
    
    // 줌 레벨에 따른 동적 집계
    const byAggregation = new Map<string, { 
      lat: number; 
      lng: number; 
      centers: { centerId: string; count: number }[] 
      blocks: string[]; // 원본 블록들
      totalCount: number; // 총 인원수 (중심 계산용)
    }>();

    for (const r of rows) {
      const { latitude, longitude } = ngeohash.decode(r.geohash);
      console.log(`📍 지오해시 ${r.geohash} → 좌표: (${latitude}, ${longitude})`);
      
      if (dong && !insideBBox(longitude, latitude)) continue; // 간단 bbox clip
      
      // 줌 레벨에 따른 동적 집계 키
      const aggregationKey = r.geohash.substring(0, aggregationPrecision);
      
      if (!byAggregation.has(aggregationKey)) {
        byAggregation.set(aggregationKey, { 
          lat: 0, // 나중에 가중 평균으로 계산
          lng: 0, // 나중에 가중 평균으로 계산
          centers: [],
          blocks: [],
          totalCount: 0
        });
      }
      
      const aggregation = byAggregation.get(aggregationKey)!;
      aggregation.centers.push({ centerId: r.center_id, count: r.count });
      aggregation.totalCount += r.count;
      
      if (!aggregation.blocks.includes(r.geohash)) {
        aggregation.blocks.push(r.geohash);
      }
    }

    // 집계된 블록들의 가중 평균 중심점 계산
    for (const [key, aggregation] of byAggregation.entries()) {
      let weightedLat = 0;
      let weightedLng = 0;
      let totalWeight = 0;

      for (const block of aggregation.blocks) {
        const { latitude, longitude } = ngeohash.decode(block);
        // 해당 블록의 총 인원수를 가중치로 사용
        const blockCount = aggregation.centers.reduce((sum, c) => sum + c.count, 0) / aggregation.blocks.length;
        
        weightedLat += latitude * blockCount;
        weightedLng += longitude * blockCount;
        totalWeight += blockCount;
      }

      if (totalWeight > 0) {
        aggregation.lat = weightedLat / totalWeight;
        aggregation.lng = weightedLng / totalWeight;
      } else {
        // 가중치가 0인 경우 첫 번째 블록의 좌표 사용
        const { latitude, longitude } = ngeohash.decode(aggregation.blocks[0]);
        aggregation.lat = latitude;
        aggregation.lng = longitude;
      }
    }

    // 행정구역 단위별 중심점 계산 (지도 비율에 맞춘 정확한 위치)
    for (const [key, aggregation] of byAggregation.entries()) {
      // 행정구역 단위에 따른 중심점 계산
      if (aggregationPrecision >= 7) {
        // 도로명주소 단위: 블록 중심의 가중 평균
        let weightedLat = 0;
        let weightedLng = 0;
        let totalWeight = 0;

        for (const block of aggregation.blocks) {
          const { latitude, longitude } = ngeohash.decode(block);
          const blockCount = aggregation.centers.reduce((sum, c) => sum + c.count, 0) / aggregation.blocks.length;
          
          weightedLat += latitude * blockCount;
          weightedLng += longitude * blockCount;
          totalWeight += blockCount;
        }

        if (totalWeight > 0) {
          aggregation.lat = weightedLat / totalWeight;
          aggregation.lng = weightedLng / totalWeight;
        }
      } else if (aggregationPrecision >= 5) {
        // 지번주소 단위: 지오해시 블록의 기하학적 중심
        let totalLat = 0;
        let totalLng = 0;

        for (const block of aggregation.blocks) {
          const { latitude, longitude } = ngeohash.decode(block);
          totalLat += latitude;
          totalLng += longitude;
        }

        aggregation.lat = totalLat / aggregation.blocks.length;
        aggregation.lng = totalLng / aggregation.blocks.length;
      } else {
        // 행정동/구 단위: 첫 번째 블록의 중심 사용
        const { latitude, longitude } = ngeohash.decode(aggregation.blocks[0]);
        aggregation.lat = latitude;
        aggregation.lng = longitude;
      }
      
      console.log(`📍 행정구역 중심점 계산: ${key} (정밀도 ${aggregationPrecision}) → (${aggregation.lat.toFixed(6)}, ${aggregation.lng.toFixed(6)})`);
    }

    // 주소 수집 단위 이름 매핑
    const getAdministrativeUnit = (precision: number) => {
      switch (precision) {
        case 8: return '도로명주소 단위 (≈38m)';
        case 7: return '도로명주소 단위 (≈150m)';
        case 6: return '도로명주소 단위 (≈1.2km)';
        case 5: return '지번주소 단위 (≈4.9km)';
        case 4: return '행정동 단위 (≈19.5km)';
        case 3: return '행정구 단위 (≈78km)';
        case 2: return '시 단위 (≈312km)';
        default: return `${precision}자리`;
      }
    };

    console.log(`🔢 행정단위별 집계 (줌 ${zoom}): ${byAggregation.size}개 구역 (${getAdministrativeUnit(aggregationPrecision)})`);
    
    // 정밀도별 구역 분할 상태 로깅 (지번주소 단위 기준)
    let adminLevel: string;
    if (zoom >= 16) {
      adminLevel = 'road-address-8'; // 도로명주소 단위
    } else if (zoom >= 15) {
      adminLevel = 'lot-address-6'; // 지번주소 단위 (도로명주소가 아닌 지번주소)
    } else if (zoom >= 12) {
      adminLevel = 'lot-address-6'; // 지번주소 단위
    } else if (zoom >= 10) {
      adminLevel = 'admin-dong'; // 행정동 단위
    } else if (zoom >= 9) {
      adminLevel = 'admin-gu'; // 행정구 단위
    } else {
      adminLevel = 'city'; // 시 단위
    }
    
    console.log(`🏛️ 정밀도별 구역 분할: ${adminLevel} (줌 ${zoom})`);
    console.log(`🎯 구역 단위: 정밀도 ${aggregationPrecision}자리 (${getAdministrativeUnit(aggregationPrecision)})`);
    console.log(`📍 정밀도별 구역 중심점 계산: 지번주소 단위 기준`);
    
    // 집계 결과 상세 로깅
    console.log(`🔍 정밀도별 구역 분할 분석:`);
    console.log(`   - 줌 레벨: ${zoom} → 정밀도 ${aggregationPrecision}자리 (${getAdministrativeUnit(aggregationPrecision)})`);
    console.log(`   - 총 ${byAggregation.size}개 구역으로 분할됨`);
    console.log(`   - 각 구역은 ${aggregationPrecision}자리 지오해시로 그룹화됨`);
    console.log(`   - 동그라미 개수 = 정밀도별 구역 개수 (${byAggregation.size}개)`);
    console.log(`   - ${getAdministrativeUnit(aggregationPrecision)} 단위로 구역 분할`);
    
    for (const [key, agg] of byAggregation.entries()) {
      console.log(`📍 구역 ${key}: ${agg.blocks.length}개 블록, 총 ${agg.totalCount}명, 중심 (${agg.lat.toFixed(6)}, ${agg.lng.toFixed(6)})`);
    }

    // k-익명 + 노이즈 + 반올림 + dominant 계산
    const spots: any[] = [];
    let hiddenBlocks = 0;
    let totalOriginalCount = 0;
    let totalApproxCount = 0;

    for (const [aggregationKey, obj] of byAggregation.entries()) {
      const total = obj.totalCount; // 이미 계산된 총 인원수 사용
      totalOriginalCount += total;

      if (total < k) {
        hiddenBlocks++;
        continue; // 블록 자체 숨김
      }

      // 작은 값은 기타로 묶기
      const majors: { centerId: string; count: number }[] = [];
      let others = 0;
      
      for (const c of obj.centers) {
        if (c.count < k) {
          others += c.count;
        } else {
          majors.push(c);
        }
      }
      
      if (others > 0) {
        majors.push({ centerId: '기타', count: others });
      }

      // 노이즈 + 반올림 (보안 강화)
      const centers = majors
        .map(m => ({ 
          centerId: m.centerId, 
          countApprox: round5(Math.max(0, laplace(m.count, EPS))) 
        }))
        .filter(x => x.countApprox > 0);

      if (!centers.length) continue;

      const dominant = centers.reduce((a, b) => 
        a.countApprox >= b.countApprox ? a : b
      ).centerId;
      
      const totalApprox = centers.reduce((s, v) => s + v.countApprox, 0);
      totalApproxCount += totalApprox;

      // 가중 평균 중심점 사용 (겹침 방지)
      // 유효성 검사
      if (!aggregationKey || typeof obj.lat !== 'number' || typeof obj.lng !== 'number' || !dominant) {
        console.warn('⚠️ 유효하지 않은 스팟 데이터 스킵:', { aggregationKey, lat: obj.lat, lng: obj.lng, dominant });
        return;
      }

      spots.push({
        geohash: aggregationKey,
        lat: obj.lat,
        lng: obj.lng,
        totalApprox,
        dominantCenter: dominant,
        centers,
        memberType: memberType as any, // 요청된 memberType 추가
        blocks: obj.blocks, // 원본 블록들 정보
        blockCount: obj.blocks.length // 집계된 블록 수
      });
    }

    console.log(`✅ 스팟 생성 완료: ${spots.length}개`);
    console.log(`🔒 프라이버시 보호: ${hiddenBlocks}개 블록 숨김`);
    console.log(`📊 원본 총합: ${totalOriginalCount} → 근사 총합: ${totalApproxCount}`);

    return NextResponse.json({ 
      success: true,
      data: {
        spots, 
        precision: p, 
        k,
        memberType,
        metadata: {
          totalSpots: spots.length,
          hiddenBlocks,
          totalOriginalCount,
          totalApproxCount,
          precision: p,
          aggregationPrecision,
          administrativeUnit: getAdministrativeUnit(aggregationPrecision),
          adminLevel,
          zoom,
          kAnonymity: k,
          noiseEpsilon: EPS,
          roundingUnit: ROUND,
          memberType
        }
      }
    }, { 
      headers: { 
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json'
      } 
    });

  } catch (error) {
    console.error('❌ 지오해시 블록 스팟 API 오류:', error);
    return NextResponse.json({
      success: false,
      error: '지오해시 블록 스팟 데이터를 가져오는 중 오류가 발생했습니다.',
      data: { spots: [] }
    }, { status: 500 });
  }
}
