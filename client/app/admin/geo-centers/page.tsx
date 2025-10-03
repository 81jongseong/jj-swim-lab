/**
 * 🗺️ JJ Swim Lab - 센터별 회원 분포 지도 (지배 센터 모드)
 * 
 * 📋 **페이지 목적**
 * - 센터별 회원 분포를 지배 센터 색상으로 시각화
 * - H3 헥사곤 레이어로 지리적 집계 표시
 * - 센터별 필터 및 범례 제공
 * - 프라이버시 보호된 집계 데이터만 표시
 * 
 * 🔄 **주요 기능**
 * - 지배 센터 색상 매핑 (HSL 해시)
 * - 센터별 필터 (체크박스)
 * - 마우스 호버 툴팁 (센터별 비율 표시)
 * - CSV 내보내기 (집계 데이터만)
 * - VWorld WMTS 배경 지도
 * 
 * 🗄️ **데이터 연동**
 * - /api/geo/aggregate-centers API
 * - VWorld WMTS 타일 서비스
 * - H3 헥사곤 집계 데이터
 * 
 * 🛠️ **필요한 설치 파일**
 * - maplibre-gl: 오픈소스 지도 렌더러
 * - deck.gl: WebGL 기반 데이터 시각화
 * - @deck.gl/mapbox: MapLibre 연동
 * - @deck.gl/geo-layers: H3 레이어
 * - h3-js: H3 헥사곤 유틸리티
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. VWorld API 키는 NEXT_PUBLIC_VWORLD_KEY에 설정
 * 2. 지배 센터 색상은 HSL 해시로 안정적 배정
 * 3. 원본 주소/좌표는 절대 표시하지 않음
 * 4. 집계된 데이터만 시각화
 * 5. 센터 필터는 실시간 반영
 */

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from 'next/navigation';

// 동적 import로 SSR 문제 방지
let maplibregl: any;
let MapboxLayer: any;
let H3HexagonLayer: any;
let h3: any;

// 타입 정의
interface CenterData {
  centerId: string;
  countApprox: number;
}

interface AggregatedCell {
  h3: string;
  totalApprox: number;
  dominantCenter: string;
  centers: CenterData[];
}

/**
 * 센터→색상 매핑 (HSL 해시)
 * 안정적이고 구별하기 쉬운 색상 자동 배정
 */
function colorOfCenter(centerId: string): [number, number, number, number] {
  // "기타"는 회색
  if (centerId === '기타') {
    return [160, 160, 160, 180];
  }

  // HSL 해시로 색상 생성
  let hue = 0;
  for (let i = 0; i < centerId.length; i++) {
    hue = (hue * 31 + centerId.charCodeAt(i)) % 360;
  }

  const saturation = 70; // 채도 (보기 좋은 수준)
  const lightness = 52;  // 명도 (보기 좋은 수준)

  // HSL→RGB 변환 (간단 변환)
  const a = saturation * Math.min(lightness, 100 - lightness) / 10000;
  const f = (n: number) => {
    const k = (n + hue / 30) % 12;
    const color = lightness / 100 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color);
  };

  return [f(0), f(8), f(4), 185]; // RGBA
}

export default function GeoCentersPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerRef = useRef<any>(null);

  const { user, loading } = useAuth();
  const router = useRouter();

  // 상태 관리
  const [cells, setCells] = useState<AggregatedCell[]>([]);
  const [metadata, setMetadata] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<AggregatedCell | null>(null);

  // 센터 필터 상태
  const [centers, setCenters] = useState<string[]>([]);
  const [activeCenters, setActiveCenters] = useState<Set<string>>(new Set());

  // 인증 확인
  useEffect(() => {
    if (!loading && (!user || user.userType !== 'superAdmin')) {
      router.push('/');
      return;
    }
  }, [user, loading, router]);

  // 라이브러리 동적 로딩
  useEffect(() => {
    const loadLibraries = async () => {
      try {
        maplibregl = (await import('maplibre-gl')).default;
        const deckGl = await import('@deck.gl/mapbox');
        const geoLayers = await import('@deck.gl/geo-layers');
        h3 = await import('h3-js');

        MapboxLayer = deckGl.MapboxLayer;
        H3HexagonLayer = geoLayers.H3HexagonLayer;

        // CSS 로딩
        await import('maplibre-gl/dist/maplibre-gl.css');

        console.log('✅ MapLibre + deck.gl 라이브러리 로딩 완료');
      } catch (error) {
        console.error('❌ 라이브러리 로딩 오류:', error);
      }
    };

    loadLibraries();
  }, []);

  // 데이터 로딩 함수
  const fetchData = async () => {
    setLoadingData(true);
    try {
      const response = await fetch('/api/geo/aggregate-centers');
      const result = await response.json();

      if (result.success) {
        const cellsData = result.data.cells;
        setCells(cellsData);
        setMetadata(result.data.metadata);

        // 센터 목록 추출
        const centerSet = new Set<string>();
        cellsData.forEach((cell: AggregatedCell) => {
          cell.centers.forEach(center => {
            if (center.centerId !== '기타') {
              centerSet.add(center.centerId);
            }
          });
        });

        const centerList = Array.from(centerSet).sort();
        setCenters(centerList);
        setActiveCenters(new Set(centerList)); // 초기엔 모두 활성화

        console.log('✅ 센터별 분포 데이터 로딩 완료:', cellsData.length, '셀');
        console.log('📍 센터 목록:', centerList);
      } else {
        console.error('❌ 데이터 로딩 실패:', result.error);
      }
    } catch (error) {
      console.error('❌ API 호출 오류:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // 초기 데이터 로딩
  useEffect(() => {
    if (user?.userType === 'superAdmin') {
      fetchData();
    }
  }, [user]);

  // 필터링된 셀 데이터
  const filteredCells = useMemo(() => {
    return cells.filter(cell => {
      // "기타"는 항상 표시
      if (cell.dominantCenter === '기타') return true;
      // 활성화된 센터만 표시
      return activeCenters.has(cell.dominantCenter);
    });
  }, [cells, activeCenters]);

  // 지도 초기화 및 레이어 업데이트
  useEffect(() => {
    if (!mapRef.current || !maplibregl || !MapboxLayer || !H3HexagonLayer) return;

    const VWORLD_KEY = process.env.NEXT_PUBLIC_VWORLD_KEY || 'demo_key';

    // VWorld WMTS 스타일 정의
    const style: any = {
      version: 8,
      sources: {
        vworld: {
          type: 'raster',
          tiles: [
            `https://api.vworld.kr/req/wmts/1.0.0/${VWORLD_KEY}/Base/{z}/{y}/{x}.png`,
          ],
          tileSize: 256,
          attribution: '© VWorld / NGII'
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

    // MapLibre 지도 인스턴스 생성
    const map = new maplibregl.Map({
      container: mapRef.current,
      style,
      center: [127.0, 37.5], // 서울 중심
      zoom: 10,
      attributionControl: true,
      logoPosition: 'bottom-left'
    });

    mapInstanceRef.current = map;

    // 지도 로딩 완료 이벤트
    map.on('load', () => {
      console.log('🗺️ VWorld 지도 로딩 완료');

      // H3 헥사곤 레이어 생성
      const h3Layer = new MapboxLayer({
        id: 'h3-dominant-center',
        type: H3HexagonLayer,
        data: filteredCells,
        pickable: true,
        getHexagon: (d: AggregatedCell) => d.h3,
        getFillColor: (d: AggregatedCell) => colorOfCenter(d.dominantCenter),
        getElevation: (d: AggregatedCell) => Math.sqrt(d.totalApprox) * 100,
        extruded: false,
        opacity: 0.7,
        coverage: 0.9
      });

      layerRef.current = h3Layer;
      map.addLayer(h3Layer);

      // 마우스 호버 이벤트
      map.on('mousemove', (e: any) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['h3-dominant-center']
        });

        if (features && features.length > 0) {
          const feature = features[0];
          const cellData = filteredCells.find(c => c.h3 === feature.properties?.h3);
          if (cellData) {
            setHoveredCell(cellData);
            map.getCanvas().style.cursor = 'pointer';
          }
        } else {
          setHoveredCell(null);
          map.getCanvas().style.cursor = '';
        }
      });
    });

    // 정리 함수
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [filteredCells]);

  // 범례 데이터
  const legend = useMemo(() => {
    return centers.map(centerId => ({
      id: centerId,
      color: colorOfCenter(centerId)
    }));
  }, [centers]);

  // 센터 필터 토글
  const toggleCenter = (centerId: string, checked: boolean) => {
    const newActiveCenters = new Set(activeCenters);
    if (checked) {
      newActiveCenters.add(centerId);
    } else {
      newActiveCenters.delete(centerId);
    }
    setActiveCenters(newActiveCenters);
  };

  // CSV 내보내기
  const exportToCSV = async () => {
    if (cells.length === 0) {
      alert('내보낼 데이터가 없습니다.');
      return;
    }

    try {
      const h3Module = await import('h3-js');
      
      const headers = ['H3_Index', 'Dominant_Center', 'Total_Count', 'Latitude', 'Longitude', 'Center_Details'];
      const rows = cells.map(cell => {
        const [lat, lon] = h3Module.h3ToGeo(cell.h3);
        const centerDetails = cell.centers
          .map(c => `${c.centerId}:${c.countApprox}`)
          .join('|');

        return [
          cell.h3,
          cell.dominantCenter,
          cell.totalApprox,
          lat.toFixed(6),
          lon.toFixed(6),
          centerDetails
        ];
      });

      const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `swimlab_centers_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('📊 CSV 내보내기 완료');
    } catch (error) {
      console.error('❌ CSV 내보내기 오류:', error);
      alert('CSV 내보내기 중 오류가 발생했습니다.');
    }
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 인증 실패
  if (!user || user.userType !== 'superAdmin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한 없음</h1>
          <p className="text-gray-600">이 페이지는 최고 관리자만 접근할 수 있습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🗺️ 센터별 회원 분포 지도
        </h1>
        <p className="text-gray-600">
          지배 센터 모드 - 각 지역에서 가장 많은 회원을 가진 센터 색상으로 표시
        </p>
      </div>

      {/* 센터 필터 패널 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm font-medium text-gray-700">센터 필터:</span>
          {legend.map(item => (
            <label key={item.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={activeCenters.has(item.id)}
                onChange={(e) => toggleCenter(item.id, e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="inline-flex items-center gap-2">
                <span
                  className="inline-block w-4 h-4 rounded"
                  style={{
                    backgroundColor: `rgba(${item.color[0]}, ${item.color[1]}, ${item.color[2]}, 1)`
                  }}
                />
                <span className="text-sm font-medium">{item.id}</span>
              </span>
            </label>
          ))}
          <span className="ml-auto text-xs text-gray-500">
            💡 체크박스로 표시할 센터를 선택하세요
          </span>
        </div>
      </div>

      {/* 통계 정보 */}
      {metadata && (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{filteredCells.length}</div>
              <div className="text-sm text-gray-600">표시된 지역</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">k≥{metadata.kAnonymityThreshold}</div>
              <div className="text-sm text-gray-600">k-익명성 임계값</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">ε={metadata.laplaceEpsilon}</div>
              <div className="text-sm text-gray-600">라플라스 노이즈</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{centers.length}개</div>
              <div className="text-sm text-gray-600">센터</div>
            </div>
          </div>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            disabled={loadingData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loadingData ? '로딩 중...' : '🔄 새로고침'}
          </button>
          <button
            onClick={exportToCSV}
            disabled={cells.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            📊 CSV 내보내기
          </button>
        </div>

        {/* 호버 툴팁 */}
        {hoveredCell && (
          <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm">
            <div className="text-sm space-y-2">
              <div className="font-bold text-lg border-b pb-2">
                🎯 {hoveredCell.dominantCenter}
              </div>
              <div className="text-gray-600">
                총 회원 수: <span className="font-semibold">{hoveredCell.totalApprox}명</span>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500">센터별 분포:</div>
                {hoveredCell.centers.slice(0, 3).map(center => {
                  const percentage = ((center.countApprox / hoveredCell.totalApprox) * 100).toFixed(1);
                  const color = colorOfCenter(center.centerId);
                  return (
                    <div key={center.centerId} className="flex items-center gap-2">
                      <span
                        className="inline-block w-3 h-3 rounded"
                        style={{
                          backgroundColor: `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`
                        }}
                      />
                      <span className="text-xs flex-1">
                        {center.centerId}: {center.countApprox}명 ({percentage}%)
                      </span>
                    </div>
                  );
                })}
                {hoveredCell.centers.length > 3 && (
                  <div className="text-xs text-gray-400">
                    +{hoveredCell.centers.length - 3}개 센터
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 지도 컨테이너 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div
          ref={mapRef}
          className="w-full h-[600px]"
          style={{ minHeight: '600px' }}
        />
      </div>

      {/* 프라이버시 안내 */}
      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="text-yellow-600 mr-2 text-xl">🔒</div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-yellow-800 mb-1">프라이버시 보호 안내</h3>
            <p className="text-sm text-yellow-700 mb-2">
              이 지도는 개인정보 보호를 위해 다음과 같은 기술이 적용되었습니다:
            </p>
            <ul className="text-sm text-yellow-700 ml-4 list-disc space-y-1">
              <li>k-익명성 (k≥5): 5명 미만 지역/센터는 표시되지 않거나 "기타"로 통합</li>
              <li>라플라스 노이즈: 개별 수치에 무작위 노이즈 추가</li>
              <li>5단위 반올림: 정확한 개인 수 파악 방지</li>
              <li>H3 헥사곤 집계: 600m-1km 단위로 지역 통합</li>
              <li>지배 센터 모드: 가장 많은 회원을 가진 센터만 색상 표시</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 기술 정보 */}
      <div className="mt-4 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">기술 스택</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <div>🗺️ <strong>지도:</strong> VWorld WMTS (국내 무료)</div>
          <div>⚡ <strong>렌더러:</strong> MapLibre GL JS (오픈소스)</div>
          <div>📊 <strong>시각화:</strong> deck.gl H3HexagonLayer</div>
          <div>🎨 <strong>색상:</strong> HSL 해시 기반 센터별 자동 배정</div>
          <div>🔢 <strong>집계:</strong> H3 헥사곤 그리드 시스템</div>
        </div>
      </div>
    </div>
  );
}
