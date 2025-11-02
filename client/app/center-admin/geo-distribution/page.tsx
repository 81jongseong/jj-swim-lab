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

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import apiClient from '../../../utils/api';

// 동적 import로 SSR 문제 방지
let maplibregl: any;
let MapboxOverlay: any;
let ScatterplotLayer: any;

interface Spot {
  geohash: string;
  lat: number;
  lng: number;
  totalApprox: number;
  dominantCenter: string;
  centers: Array<{ centerId: string; countApprox: number }>;
  memberType?: 'member' | 'instructor' | 'guest' | 'center';
}

interface SpotsData {
  spots: Spot[];
  metadata: {
    totalSpots: number;
    hiddenBlocks: number;
    totalOriginalCount: number;
    totalApproxCount: number;
    precision: number;
    kAnonymity: number;
    noiseEpsilon: number;
    roundingUnit: number;
    memberType: string;
  };
}

const ZOOM_THRESHOLD = 10;

export default function CenterAdminGeoDistributionPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const overlayRef = useRef<any>(null);
  
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // 상태 관리
  const [spots, setSpots] = useState<Spot[]>([]);
  const [metadata, setMetadata] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [hoveredSpot, setHoveredSpot] = useState<any>(null);
  const [librariesLoaded, setLibrariesLoaded] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(12);
  
  // 필터 상태
  const [memberType, setMemberType] = useState<'all' | 'group-lesson' | 'personal-lesson' | 'free-swim'>('all');
  
  // 센터 관리 상태
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null);
  const [managedCenters, setManagedCenters] = useState<Array<{ _id: string; name: string }>>([]);

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
                // 센터 정보 조회
                try {
                  const response = await apiClient.get(`/api/center-management/${centerId}`);
                  if (response.success && response.data?.center) {
                    return {
                      _id: centerId,
                      name: response.data.center.name || `센터 ${centerId.substring(0, 8)}`
                    };
                  }
                } catch (error) {
                  console.warn(`센터 ${centerId} 정보 조회 실패:`, error);
                }
                return {
                  _id: centerId,
                  name: `센터 ${centerId.substring(0, 8)}`
                };
              })
            );
            setManagedCenters(centersList);
            setSelectedCenterId(null); // 초기값: "전체 센터 회원"
          } catch (error) {
            console.error('센터 목록 로드 오류:', error);
          }
        };
        loadCentersWithNames();
      }
    }
  }, [user, loading, router]);

  // 라이브러리 동적 로딩
  useEffect(() => {
    const loadLibraries = async () => {
      try {
        maplibregl = (await import('maplibre-gl')).default;
        const deckGl = await import('@deck.gl/mapbox');
        const coreLayers = await import('@deck.gl/layers');
        
        MapboxOverlay = deckGl.MapboxOverlay;
        ScatterplotLayer = coreLayers.ScatterplotLayer;
        
        await import('maplibre-gl/dist/maplibre-gl.css');
        setLibrariesLoaded(true);
      } catch (error) {
        console.error('라이브러리 로딩 실패:', error);
      }
    };

    loadLibraries();
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!librariesLoaded || !mapRef.current || !maplibregl || !MapboxOverlay) return;

    const style: any = {
      version: 8,
      sources: {
        'vworld': {
          type: 'raster',
          tiles: [
            `https://api.vworld.kr/req/wmts/1.0.0/${process.env.NEXT_PUBLIC_VWORLD_KEY}/Base/{z}/{y}/{x}.png`
          ],
          tileSize: 256
        }
      },
      layers: [
        {
          id: 'vworld-base',
          type: 'raster',
          source: 'vworld'
        }
      ]
    };

    const map = new maplibregl.Map({
      container: mapRef.current,
      style,
      center: [127.0276, 37.4979],
      zoom: 12,
      maxZoom: 18,
      minZoom: 8
    });

    mapInstanceRef.current = map;

    const overlay = new MapboxOverlay({
      interleaved: true,
      layers: []
    });
    
    map.addControl(overlay);
    overlayRef.current = overlay;

    map.on('zoom', () => {
      setCurrentZoom(map.getZoom());
    });

    map.on('load', () => {
      console.log('🗺️ VWorld 지도 로딩 완료');
      // 지도가 완전히 로드되고 WebGL 컨텍스트가 준비될 때까지 대기
      setTimeout(() => {
        setMapLoaded(true);
        // 추가 지연으로 WebGL 컨텍스트가 완전히 준비되도록 함
        setTimeout(() => {
          fetchSpotsData();
        }, 300);
      }, 300);
    });

    return () => {
      map.remove();
    };
  }, [librariesLoaded]);

  // 스팟 데이터 로딩
  const fetchSpotsData = useCallback(async () => {
    if (!user || !mapLoaded) return;

    setLoadingData(true);
    try {
      const params = new URLSearchParams({
        k: '5',
        memberType: memberType === 'all' ? '' : memberType
      });

      // centerAdmin인 경우 센터 필터링 추가
      if (selectedCenterId) {
        params.append('centerId', selectedCenterId);
      }

      const apiUrl = `/api/geo/aggregate?${params.toString()}`;
      console.log('🔍 API 요청:', apiUrl);
      const response = await apiClient.get(apiUrl);
      
      console.log('🗺️ 지도 데이터 응답:', {
        success: response.success,
        hasData: !!response.data,
        hasCells: !!response.data?.cells,
        cellsCount: response.data?.cells?.length || 0,
        metadata: response.data?.metadata,
        fullResponse: response
      });
      
      if (response.success) {
        const cells = response.data?.cells || response.cells || [];
        console.log(`📍 수신된 셀 데이터: ${cells.length}개`);
        
        if (cells.length === 0) {
          console.warn('⚠️ 셀 데이터가 비어있습니다. 서버 로그를 확인하세요:');
          console.warn(`  - 필터 조건: centerId=${selectedCenterId || 'all'}, memberType=${memberType}`);
          console.warn(`  - metadata:`, response.data?.metadata || response.metadata);
        }
        
        const spotsData: Spot[] = cells
          .filter((cell: any) => {
            const isValid = cell.lat && cell.lng && (cell.countApprox || 0) > 0;
            if (!isValid) {
              console.warn('⚠️ 유효하지 않은 셀 필터링:', cell);
            }
            return isValid;
          })
          .map((cell: any) => ({
            geohash: cell.h3Index || '',
            lat: cell.lat || 0,
            lng: cell.lng || 0,
            totalApprox: cell.countApprox || 0,
            dominantCenter: cell.centerName || '기타',
            centers: cell.centers || [],
            memberType: memberType === 'all' ? undefined : memberType
          }));

        console.log(`✅ 처리된 스팟 데이터: ${spotsData.length}개`);
        setSpots(spotsData);
        setMetadata(response.data?.metadata || response.metadata || {});
      } else {
        console.warn('⚠️ API 응답이 성공하지 않았습니다:', response);
        setSpots([]);
        setMetadata(null);
      }
    } catch (error) {
      console.error('❌ 스팟 데이터 로딩 오류:', error);
      setSpots([]);
      setMetadata(null);
    } finally {
      setLoadingData(false);
    }
  }, [user, mapLoaded, memberType, selectedCenterId]);

  // 필터 변경 시 데이터 재로딩
  useEffect(() => {
    if (librariesLoaded && mapLoaded) {
      fetchSpotsData();
    }
  }, [librariesLoaded, mapLoaded, memberType, selectedCenterId, fetchSpotsData]);

  // 반경 계산 함수 (관리자 페이지와 동일한 방식)
  const scaleRadius = useCallback((count: number): number => {
    if (!count || count <= 0) return 50;
    // 기본 블록 크기 153m 기준으로 스케일링
    const baseRadius = 50; // 미터 단위
    const scaled = baseRadius + Math.sqrt(count) * 10;
    return Math.min(scaled, 200); // 최대 200m
  }, []);

  // 스팟 레이어 생성 함수 (관리자 페이지와 동일한 방식)
  const buildSpotsLayer = useCallback(() => {
    if (!ScatterplotLayer) {
      console.warn('⚠️ ScatterplotLayer가 로드되지 않았습니다');
      return null;
    }

    // 데이터 타입 검증 및 정규화
    const validSpots = spots
      .map((spot: Spot) => {
        // 모든 필드를 명시적으로 숫자로 변환
        const lat = Number(spot.lat);
        const lng = Number(spot.lng);
        const totalApprox = Number(spot.totalApprox);
        
        if (isNaN(lat) || isNaN(lng) || isNaN(totalApprox)) {
          console.warn('❌ 유효하지 않은 숫자 데이터:', spot);
          return null;
        }
        
        if (totalApprox <= 0) {
          return null;
        }
        
        return {
          ...spot,
          lat,
          lng,
          totalApprox,
          dominantCenter: spot.dominantCenter || '기타'
        };
      })
      .filter((spot): spot is Spot => spot !== null);

    if (validSpots.length === 0) {
      console.log('⚠️ 유효한 스팟이 없습니다');
      return null;
    }

    console.log(`🗺️ Deck.gl 레이어 생성: ${validSpots.length}개 유효 스팟 (전체 ${spots.length}개)`);
    console.log('📊 샘플 스팟 데이터:', validSpots[0]);

    try {
      return new ScatterplotLayer({
        id: 'spots-layer',
        data: validSpots,
        pickable: true,
        opacity: 0.8,
        stroked: true,
        filled: true,
        lineWidthMinPixels: 1,
        radiusUnits: 'meters',
        getPosition: (d: Spot) => {
          // 타입 검증 강화
          const lng = Number(d.lng);
          const lat = Number(d.lat);
          if (isNaN(lng) || isNaN(lat)) {
            console.warn('⚠️ 잘못된 좌표:', d);
            return [126.9780, 37.5665]; // 서울 중심부 (기본값)
          }
          return [lng, lat];
        },
        getRadius: (d: Spot) => {
          const count = Number(d.totalApprox);
          if (isNaN(count) || count <= 0) {
            console.warn('⚠️ 잘못된 totalApprox:', d);
            return 50; // 기본 크기 (미터)
          }
          return scaleRadius(count);
        },
        getFillColor: (d: Spot) => {
          const center = d.dominantCenter || '기타';
          const colors: Record<string, [number, number, number, number]> = {
            'JJ Swim Lab': [255, 99, 132, 200],
            '강남센터': [255, 99, 132, 200],
            '홍대센터': [54, 162, 235, 200],
            '송파센터': [255, 205, 86, 200],
            '마포센터': [75, 192, 192, 200],
          };
          return colors[center] || [153, 102, 255, 200];
        },
        getLineColor: [255, 255, 255, 200],
        onHover: (info: any) => {
          if (info && info.object) {
            setHoveredSpot(info.object);
          }
        }
      });
    } catch (error) {
      console.error('❌ ScatterplotLayer 생성 오류:', error);
      return null;
    }
  }, [spots, scaleRadius, ScatterplotLayer]);

  // Deck.gl 레이어 업데이트 (관리자 페이지와 동일한 방식)
  useEffect(() => {
    // WebGL 컨텍스트와 라이브러리가 준비되지 않았으면 건너뜀
    if (!overlayRef.current || !mapLoaded || !librariesLoaded || !ScatterplotLayer) {
      console.log('⏳ 레이어 조건 대기 중:', {
        hasOverlay: !!overlayRef.current,
        mapLoaded,
        librariesLoaded,
        ScatterplotLayer: !!ScatterplotLayer
      });
      return;
    }

    if (!spots || !spots.length) {
      console.log('⚠️ 스팟 데이터가 없어 레이어 제거');
      // 비동기로 레이어 제거하여 렌더링 사이클 중 충돌 방지
      requestAnimationFrame(() => {
        if (overlayRef.current) {
          overlayRef.current.setProps({
            layers: []
          });
        }
      });
      return;
    }

    console.log('🔧 스팟 레이어 업데이트 시작:', spots.length, '개 스팟');
    
    const layer = buildSpotsLayer();
    if (!layer) {
      console.log('⚠️ 레이어 생성 실패');
      requestAnimationFrame(() => {
        if (overlayRef.current) {
          overlayRef.current.setProps({
            layers: []
          });
        }
      });
      return;
    }
    
    // requestAnimationFrame을 사용하여 렌더링 사이클과 동기화
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        try {
          if (!overlayRef.current) {
            console.warn('⚠️ overlayRef가 없음');
            return;
          }
          overlayRef.current.setProps({
            layers: [layer]
          });
          console.log('✅ 스팟 레이어 업데이트 완료');
        } catch (error) {
          console.error('❌ 레이어 설정 오류:', error);
          if (overlayRef.current) {
            overlayRef.current.setProps({
              layers: []
            });
          }
        }
      });
    });
  }, [spots, buildSpotsLayer, mapLoaded, librariesLoaded, ScatterplotLayer]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
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
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div ref={mapRef} className="w-full h-[600px]" />
          
          {/* 툴팁 */}
          {hoveredSpot && (
            <div className="absolute bg-white p-3 rounded-lg shadow-lg border border-gray-200 pointer-events-none z-10"
                 style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
              <div className="text-sm">
                <div className="font-semibold">{hoveredSpot.dominantCenter}</div>
                <div>예상 회원 수: {hoveredSpot.totalApprox}명</div>
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
