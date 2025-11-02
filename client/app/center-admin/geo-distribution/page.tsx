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
 * - 회원 유형별 필터링 (전체/회원/강사/게스트)
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
  const [memberType, setMemberType] = useState<'all' | 'student' | 'instructor' | 'guest'>('all');
  
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
        const centers = user.centerAdminInfo.managedCenters;
        const centersList = centers.map((c: any) => ({
          _id: c.toString ? c.toString() : c._id?.toString() || c,
          name: c.name || `센터 ${c.toString ? c.toString() : c._id?.toString() || c}`
        }));
        setManagedCenters(centersList);
        
        // 초기값: "전체 통계" (null)
        setSelectedCenterId(null);
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
      setMapLoaded(true);
      fetchSpotsData();
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

      const response = await apiClient.get(`/api/geo/aggregate?${params.toString()}`);
      
      if (response.success && response.data) {
        const cells = response.data.cells || [];
        const spotsData: Spot[] = cells.map((cell: any) => ({
          geohash: cell.h3Index || '',
          lat: cell.lat || 0,
          lng: cell.lng || 0,
          totalApprox: cell.countApprox || 0,
          dominantCenter: cell.centerName || '기타',
          centers: cell.centers || [],
          memberType: memberType === 'all' ? undefined : memberType
        }));

        setSpots(spotsData);
        setMetadata(response.data.metadata || {});
      }
    } catch (error) {
      console.error('스팟 데이터 로딩 오류:', error);
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

  // Deck.gl 레이어 업데이트
  useEffect(() => {
    if (!overlayRef.current || !mapLoaded || !librariesLoaded || !ScatterplotLayer) return;
    
    // spots가 비어있으면 레이어를 제거
    if (!spots || spots.length === 0) {
      overlayRef.current.setProps({
        layers: []
      });
      return;
    }

    try {
      const layer = new ScatterplotLayer({
        id: 'spots-layer',
        data: spots.filter((spot: Spot) => spot.lat && spot.lng && spot.totalApprox > 0), // 유효한 데이터만
        pickable: true,
        opacity: 0.8,
        stroked: true,
        filled: true,
        radiusScale: 1,
        radiusMinPixels: 3,
        radiusMaxPixels: 50,
        lineWidthMinPixels: 1,
        getPosition: (d: Spot) => [d.lng, d.lat],
        getRadius: (d: Spot) => Math.max(3, Math.min(50, Math.sqrt(d.totalApprox || 1) * 2)),
        getFillColor: (d: Spot) => {
          const colors: Record<string, [number, number, number, number]> = {
            '강남센터': [255, 99, 132, 200],
            '홍대센터': [54, 162, 235, 200],
            '송파센터': [255, 205, 86, 200],
            '마포센터': [75, 192, 192, 200],
          };
          return colors[d.dominantCenter || ''] || [153, 102, 255, 200];
        },
        getLineColor: [255, 255, 255, 200],
        onHover: (info: any) => {
          setHoveredSpot(info.object || null);
        }
      });

      overlayRef.current.setProps({
        layers: [layer]
      });
    } catch (error) {
      console.error('Deck.gl 레이어 생성 오류:', error);
      overlayRef.current.setProps({
        layers: []
      });
    }
  }, [spots, mapLoaded, librariesLoaded]);

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
                  <option value="all">📊 전체 통계</option>
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
                <option value="student">회원</option>
                <option value="instructor">강사</option>
                <option value="guest">게스트</option>
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
                <div className="text-2xl font-bold">{metadata.totalSpots || 0}</div>
              </div>
              <div>
                <div className="text-gray-600">예상 총 회원 수</div>
                <div className="text-2xl font-bold">{metadata.totalApproxCount || 0}</div>
              </div>
              <div>
                <div className="text-gray-600">K-익명성</div>
                <div className="text-2xl font-bold">{metadata.kAnonymity || 'N/A'}</div>
              </div>
              <div>
                <div className="text-gray-600">정밀도</div>
                <div className="text-2xl font-bold">{metadata.precision || 'N/A'}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

