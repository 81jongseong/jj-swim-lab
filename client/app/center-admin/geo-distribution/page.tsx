/**
 * 🗺️ JJ Swim Lab - 회원 분포도 (센터 관리자용)
 * 
 * 📋 **페이지 목적**
 * - 센터 관리자가 자신이 관리하는 센터들의 회원 분포를 확인
 * - 여러 센터 관리 시 지점별로 선택하여 조회 가능
 * - 전체 통계 및 개별 지점 통계 조회
 * 
 * 🔄 **주요 기능**
 * - 지오해시 블록별 스팟 표시
 * - 관리하는 센터 목록에서 선택하여 조회
 * - 전체 통계 및 지점별 통계 전환
 * - 회원 유형별 필터링 (전체/단체레슨/개인레슨/자유수영)
 * 
 * 🗄️ **데이터 연동**
 * - /api/geo/aggregate API (지오해시 블록 스팟)
 * - useAuth 훅 (관리하는 센터 목록)
 */

'use client';
import { logger } from '@/lib/logger';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import apiClient from '../../../utils/api';
import GeoDistributionMap, { Spot } from '../../../components/geo-distribution/GeoDistributionMap';
import { LoadingState } from '@/components/common';

// 툴팁 위치 계산 함수 (스팟 위치를 기준으로 가깝게 배치)
function calculateTooltipPosition(
  coordinates: { x: number; y: number } | null,
  containerRef: React.RefObject<HTMLDivElement>
): { top?: string; bottom?: string; left?: string; right?: string; transform?: string } {
  if (!coordinates || !containerRef.current) {
    return { bottom: '16px', right: '16px' }; // 기본: 오른쪽 하단
  }

  const container = containerRef.current;
  const containerWidth = container.offsetWidth;
  const containerHeight = container.offsetHeight;
  const tooltipWidth = 280;
  const tooltipHeight = 120;
  const padding = 16;
  const offsetFromSpot = 20; // 스팟으로부터의 거리

  // 스팟이 오른쪽 사이드에 있으면 왼쪽에 표시
  const isRightSide = coordinates.x > containerWidth * 0.6;
  // 스팟이 맨 아래에 있으면 위쪽에 표시
  const isBottom = coordinates.y > containerHeight * 0.8;
  // 스팟이 맨 위에 있으면 아래쪽에 표시
  const isTop = coordinates.y < containerHeight * 0.2;

  if (isBottom && isRightSide) {
    // 맨 아래 + 오른쪽 → 스팟 위쪽, 왼쪽에 표시
    return { 
      bottom: `${containerHeight - coordinates.y + offsetFromSpot}px`, 
      right: `${containerWidth - coordinates.x + offsetFromSpot}px`,
      transform: 'translateX(100%)'
    };
  } else if (isBottom) {
    // 맨 아래 → 스팟 위쪽, 오른쪽에 표시
    return { 
      bottom: `${containerHeight - coordinates.y + offsetFromSpot}px`, 
      left: `${coordinates.x + offsetFromSpot}px`
    };
  } else if (isTop && isRightSide) {
    // 맨 위 + 오른쪽 → 스팟 아래쪽, 왼쪽에 표시
    return { 
      top: `${coordinates.y + offsetFromSpot}px`, 
      right: `${containerWidth - coordinates.x + offsetFromSpot}px`,
      transform: 'translateX(100%)'
    };
  } else if (isTop) {
    // 맨 위 → 스팟 아래쪽, 오른쪽에 표시
    return { 
      top: `${coordinates.y + offsetFromSpot}px`, 
      left: `${coordinates.x + offsetFromSpot}px`
    };
  } else if (isRightSide) {
    // 오른쪽 사이드 → 왼쪽에 표시 (스팟 높이에 맞춤)
    return { 
      top: `${coordinates.y}px`, 
      right: `${containerWidth - coordinates.x + offsetFromSpot}px`, 
      transform: 'translateY(-50%) translateX(100%)'
    };
  } else {
    // 기본: 스팟 오른쪽, 위쪽에 표시
    return { 
      top: `${coordinates.y}px`, 
      left: `${coordinates.x + offsetFromSpot}px`,
      transform: 'translateY(-50%)'
    };
  }
}

const ZOOM_THRESHOLD = 10;

export default function CenterAdminGeoDistributionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // 상태 관리
  const [spots, setSpots] = useState<Spot[]>([]);
  const [metadata, setMetadata] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [hoveredSpot, setHoveredSpot] = useState<Spot | null>(null);
  const [hoveredAddress, setHoveredAddress] = useState<string | null>(null);
  const [hoveredCoordinates, setHoveredCoordinates] = useState<{ x: number; y: number } | null>(null);
  const [currentZoom, setCurrentZoom] = useState(12);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // 필터 상태
  const [memberType, setMemberType] = useState<'all' | 'group-lesson' | 'personal-lesson' | 'free-swim'>('all');
  
  // 센터 관리 상태
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null);
  const [managedCenters, setManagedCenters] = useState<Array<{ _id: string; name: string }>>([]);
  const [managedCenterIds, setManagedCenterIds] = useState<Set<string>>(new Set());
  const [managedCenterNames, setManagedCenterNames] = useState<Set<string>>(new Set());

  // 인증 확인 및 센터 목록 로드
  useEffect(() => {
    if (!loading && user) {
      if (user.userType !== 'centerAdmin' && user.userType !== 'center-admin') {
        router.push('/');
        return;
      }

      // 관리하는 센터 목록 로드
      if (user.centerAdminInfo?.managedCenters) {
        const loadCentersWithNames = async () => {
          try {
            const centers = user.centerAdminInfo.managedCenters;
            const centersList = await Promise.all(
              centers.map(async (c: any) => {
                const centerId = c.toString ? c.toString() : c._id?.toString() || c;
                // 센터 정보 조회 (서버 API 또는 기본값 사용)
                let centerName: string | null = null;
                
                // 서버 API 호출 시도
                try {
                  const response = await apiClient.get(`/api/center-management/${centerId}`);
                  if (response.success && response.data && typeof response.data === 'object' && 'center' in response.data) {
                    const centerData = response.data as { center?: { name?: string } };
                    if (centerData.center?.name) {
                      centerName = centerData.center.name;
                    }
                  }
                } catch (error) {
                  logger.warn(`센터 ${centerId} 정보 조회 실패:`, error);
                  // 서버 연결 실패 시 기본 센터 이름 사용
                  // ID가 특정 센터인 경우 기본 이름 설정
                  if (centerId === '68fb75b111747a8229d6cf5d' || centerId.includes('68fb75b1')) {
                    centerName = 'JJ Swim Lab';
                  } else if (centerId === '68f10983ccca24669078e1b4' || centerId.includes('68f10983')) {
                    centerName = 'JJ 수영장 강남점';
                  } else {
                    // 다른 센터 ID에 대한 기본 이름 매핑
                    centerName = `센터 ${centerId.substring(0, 8)}`;
                  }
                }
                
                // 센터 이름이 없으면 기본값 사용
                return {
                  _id: centerId,
                  name: centerName || `센터 ${centerId.substring(0, 8)}`
                };
              })
            );
            setManagedCenters(centersList);
            setSelectedCenterId(null); // 초기값: "전체 센터 회원"
            
            // 관리하는 센터 ID와 이름 Set 생성 (필터링용)
            const centerIds = new Set(centersList.map(c => c._id));
            const centerNames = new Set(centersList.map(c => c.name));
            setManagedCenterIds(centerIds);
            setManagedCenterNames(centerNames);
          } catch (error) {
            logger.error('센터 목록 로드 오류:', error);
          }
        };
        loadCentersWithNames();
      }
    }
  }, [user, loading, router]);

   // 스팟 데이터 로딩 (줌 레벨에 따라 aggregation precision 자동 조정)
   const fetchSpotsData = useCallback(async () => {
     logger.info('🚀 fetchSpotsData 호출:', { hasUser: !!user, userType: user?.userType, mapLoaded });
     if (!user) {
       logger.warn('⚠️ 사용자 정보 없음 - fetchSpotsData 취소');
       return;
     }

     setLoadingData(true);
     try {
       // ✅ 줌 레벨에 따른 aggregation precision 자동 조정
       // - 줌 레벨이 낮을수록 더 큰 블록으로 집계 (스팟이 합쳐짐)
       // - 줌 레벨이 높을수록 더 작은 블록으로 집계 (스팟이 분리됨)
       const params = new URLSearchParams({
         k: '5',
         memberType: memberType === 'all' ? '' : memberType,
         zoom: currentZoom.toString() // ✅ 줌 레벨 전달 (API에서 precision 조정)
       });

       // ⚠️ 중요: centerAdmin인 경우 항상 centerId를 전달해야 함
       // selectedCenterId가 null이면 서버에서 관리하는 모든 센터를 필터링하도록 하지 않고,
       // 서버가 자동으로 관리하는 센터만 필터링하도록 함 (centerId 파라미터 전달 안 함)
       // 하지만 초기 로딩 시에는 서버가 자동으로 필터링하므로 centerId를 전달하지 않음
       // 서버 필터링 로직이 이미 관리하는 센터만 반환하므로 추가 파라미터 불필요
       // 단, 특정 센터를 선택한 경우에만 centerId 전달

       // ✅ /api/geo/spots 사용 (aggregation precision 자동 조정)
       const apiUrl = `/api/geo/spots?${params.toString()}`;
       logger.info('🔍 API 요청:', apiUrl);
       
       // ✅ 인증 토큰 포함하여 요청 (센터 관리자 필터링을 위해)
       const headers: HeadersInit = {
         'Content-Type': 'application/json'
       };
       
       if (typeof window !== 'undefined') {
         const token = localStorage.getItem('token') || sessionStorage.getItem('token');
         if (token) {
           headers['Authorization'] = `Bearer ${token}`;
         }
       }
       
       const response = await fetch(apiUrl, { 
         cache: 'no-store',
         headers
       });
       const result = await response.json();
       
      logger.info('📊 스팟 데이터 응답:', result);
      logger.info('📊 응답 구조 확인:', {
        hasSuccess: !!result.success,
        hasData: !!result.data,
        hasSpots: !!result.data?.spots,
        spotsLength: result.data?.spots?.length || 0,
        hasSpotsTopLevel: !!result.spots,
        metadata: result.data?.metadata,
        debug: result.data?.metadata?.debug,
        fullResponse: result
      });
       
       if (result.success) {
         const spotsData = result.data?.spots || result.spots || [];
         logger.info(`✅ 처리된 스팟 데이터: ${spotsData.length}개`);
         if (spotsData.length > 0) {
           logger.info('📊 첫 번째 스팟 샘플:', spotsData[0]);
         }
         
         if (spotsData.length === 0) {
           logger.warn('⚠️ 스팟 데이터가 비어있습니다. 서버 로그를 확인하세요:');
           logger.warn(`  - 필터 조건: centerId=${selectedCenterId || 'all'}, memberType=${memberType}, zoom=${currentZoom}`);
           logger.warn(`  - metadata:`, result.data?.metadata || result.metadata);
         }
         
         // ✅ 유효성 검사 및 변환
         // ⚠️ 중요: 서버에서 이미 본인 센터 회원만 필터링해서 반환하므로
         // 클라이언트에서는 유효성 검사만 수행 (서버 필터링 신뢰)
         const validSpots: Spot[] = spotsData
           .filter((spot: any) => {
             // 좌표 유효성 검사만 수행
             const lat = Number(spot.lat);
             const lng = Number(spot.lng);
             const totalApprox = Number(spot.totalApprox);
             const isValid = !isNaN(lat) && !isNaN(lng) && !isNaN(totalApprox) && 
                            lat !== 0 && lng !== 0 && totalApprox > 0 &&
                            lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
             if (!isValid) {
               logger.warn('⚠️ 유효하지 않은 스팟 필터링:', spot, { lat, lng, totalApprox });
               return false;
             }
             
             // ✅ 서버에서 이미 필터링된 데이터이므로 클라이언트 필터링 제거
             // 서버가 본인 센터 회원만 반환하므로 여기서는 통과
             return true;
           })
           .map((spot: any) => ({
             geohash: spot.geohash || '',
             lat: Number(spot.lat),
             lng: Number(spot.lng),
             totalApprox: Number(spot.totalApprox),
             dominantCenter: spot.dominantCenter || '기타',
             centers: spot.centers || [],
             memberType: memberType === 'all' ? undefined : memberType
           }));
         
         logger.info(`✅ 필터링된 스팟 데이터: ${validSpots.length}개 (원본: ${spotsData.length}개)`);

         setSpots(validSpots);
         setMetadata(result.data?.metadata || result.metadata || {});
       } else {
         logger.warn('⚠️ API 응답이 성공하지 않았습니다:', result);
         setSpots([]);
         setMetadata(null);
       }
     } catch (error) {
       logger.error('❌ 스팟 데이터 로딩 오류:', error);
       setSpots([]);
       setMetadata(null);
     } finally {
       setLoadingData(false);
     }
         }, [user, memberType, selectedCenterId, currentZoom]);

  // 지도 로딩 완료 후 데이터 로드
  useEffect(() => {
    logger.info('🗺️ 지도 로딩 상태 확인:', { mapLoaded, hasUser: !!user, userType: user?.userType });
    if (mapLoaded) {
      logger.info('✅ 지도 로딩 완료 - 스팟 데이터 로딩 시작');
      fetchSpotsData();
    } else {
      logger.info('⏳ 지도 로딩 대기 중...');
    }
  }, [mapLoaded, fetchSpotsData, user]);

   // ✅ 필터 변경 시 데이터 재로딩 (줌 레벨 제외)
   useEffect(() => {
     if (mapLoaded) {
       logger.info('🔄 필터 변경 감지 - 데이터 재로딩:', { memberType, selectedCenterId });
       fetchSpotsData();
     }
   }, [mapLoaded, memberType, selectedCenterId, fetchSpotsData]);
 
   // ✅ 줌 레벨 변경 시 데이터 재로딩 (디바운스 적용)
   useEffect(() => {
     if (!mapLoaded) return;
     
     const timeoutId = setTimeout(() => {
       logger.info('🔍 줌 레벨 변경 감지 - 데이터 재로딩:', currentZoom);
       fetchSpotsData();
     }, 500); // 500ms 디바운스
 
     return () => clearTimeout(timeoutId);
   }, [currentZoom, mapLoaded, fetchSpotsData]);

  // 스팟 호버 핸들러 (좌표 정보 포함)
  const handleSpotHover = useCallback((spot: Spot | null, address: string | null, coordinates?: { x: number; y: number }) => {
    setHoveredSpot(spot);
    setHoveredAddress(address);
    if (coordinates) {
      setHoveredCoordinates(coordinates);
    }
  }, []);

  // 줌 레벨 변경 핸들러
  const handleZoomChange = useCallback((zoom: number) => {
    setCurrentZoom(zoom);
  }, []);

  // 지도 로딩 완료 핸들러
  const handleMapLoad = useCallback(() => {
    logger.info('✅ GeoDistributionMap 지도 로딩 완료 콜백 호출');
    setMapLoaded(true);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingState message="로딩 중..." size="lg" />
      </div>
    );
  }

  if (!user || (user.userType !== 'centerAdmin' && user.userType !== 'center-admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한 없음</h1>
          <p className="text-gray-600">이 페이지는 센터 관리자만 접근할 수 있습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🗺️ 회원 분포도</h1>
          <p className="text-gray-600">관리하는 센터의 회원 분포를 지도에서 확인하세요</p>
        </div>

        {/* 컨트롤 패널 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* 센터 선택 */}
            {managedCenters.length > 0 && (
              <label className="text-sm flex items-center gap-2">
                센터:
                <select 
                  className="border rounded px-3 py-1 min-w-[150px]" 
                  value={selectedCenterId || 'all'} 
                  onChange={e => {
                    const value = e.target.value;
                    setSelectedCenterId(value === 'all' ? null : value);
                  }}
                >
                  <option value="all">📊 전체 센터 회원</option>
                  {managedCenters.map((center) => (
                    <option key={center._id} value={center._id}>
                      {center.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {/* 유형 필터 */}
            <label className="text-sm flex items-center gap-2">
              유형:
              <select 
                className="border rounded px-3 py-1" 
                value={memberType} 
                onChange={e => setMemberType(e.target.value as any)}
              >
                <option value="all">전체</option>
                <option value="group-lesson">단체레슨</option>
                <option value="personal-lesson">개인레슨</option>
                <option value="free-swim">자유수영</option>
              </select>
            </label>

            {/* 새로고침 버튼 */}
            <button
              onClick={fetchSpotsData}
              disabled={loadingData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loadingData ? '로딩 중...' : '새로고침'}
            </button>
          </div>
        </div>

        {/* 지도 */}
        <div ref={mapContainerRef} className="bg-white rounded-lg shadow-sm overflow-hidden relative">
          <GeoDistributionMap
            spots={spots}
            currentZoom={currentZoom}
            onSpotHover={handleSpotHover}
            onZoomChange={handleZoomChange}
            onMapLoad={handleMapLoad}
            className="h-[600px]"
          />
          
          {/* 툴팁 - 동적 위치 조정 */}
          {hoveredSpot && hoveredAddress && (
            <div 
              className="absolute bg-white/95 backdrop-blur-sm px-4 py-3 rounded-lg shadow-xl border-2 border-gray-300 z-50 pointer-events-none"
              style={{
                ...calculateTooltipPosition(hoveredCoordinates, mapContainerRef),
                maxWidth: '280px'
              }}
            >
              <div className="text-sm">
                <div className="font-semibold mb-1 text-gray-900">
                  📍 집계 구역: {hoveredAddress}
                </div>
                <div className="text-blue-600 mb-1">
                  🏠 센터: <strong>{hoveredSpot.dominantCenter}</strong>
                </div>
                <div className="text-gray-700">
                  예상 회원 수: <strong>약 {hoveredSpot.totalApprox}명 (익명처리)</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 메타데이터 */}
        {metadata && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold mb-2">통계 정보</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-600">총 스팟 수</div>
                <div className="text-2xl font-bold">{metadata.totalCells || 0}</div>
              </div>
              <div>
                <div className="text-gray-600">표시된 스팟 수</div>
                <div className="text-2xl font-bold">{metadata.filteredCells || 0}</div>
              </div>
              <div>
                <div className="text-gray-600">K-익명성</div>
                <div className="text-2xl font-bold">{metadata.k || 'N/A'}</div>
              </div>
              <div>
                <div className="text-gray-600">처리된 회원 수</div>
                <div className="text-2xl font-bold">{spots.length > 0 ? spots.reduce((sum, s) => sum + s.totalApprox, 0) : 0}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
