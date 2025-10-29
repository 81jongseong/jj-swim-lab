/**
 * 🗺️ JJ Swim Lab - 센터별 회원 분포 지도 (최종판)
 * 
 * 📋 **페이지 목적**
 * - 지배 모드: 가장 많은 센터 색상으로 표시
 * - 스택 모드: 방사형 원기둥으로 비율 표시
 * - 센터별 브랜드 컬러 프리셋 관리
 * - 실시간 필터링 및 툴팁
 * 
 * 🔄 **주요 기능**
 * - 모드 토글 (지배 ↔ 스택)
 * - HSL 해시 + 로컬 스토리지 색상 관리
 * - 센터 필터 (체크박스)
 * - 색상 편집 (color input)
 * - 마우스 호버 툴팁
 * - CSV 내보내기
 * 
 * 🗄️ **데이터 연동**
 * - /api/geo/aggregate-centers API
 * - VWorld WMTS 타일 서비스
 * - 로컬 스토리지 (색상 프리셋)
 * 
 * 🛠️ **필요한 설치 파일**
 * - maplibre-gl
 * - deck.gl
 * - @deck.gl/mapbox
 * - @deck.gl/geo-layers
 * - @deck.gl/layers
 * - h3-js
 */

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
  colorRgbaOf,
  colorCssOf,
  setCenterColor,
  resetCenterColors,
  cssToHex
} from '../../../lib/utils/centerColors';
import VWorldKeyBadge, { VWorldExpiryBanner } from '../../../components/VWorldKeyBadge';

// 동적 import로 SSR 문제 방지
let maplibregl: any;
let MapboxLayer: any;
let H3HexagonLayer: any;
let ColumnLayer: any;
let DeckGL: any;

// 타입 정의
interface CenterData {
  centerId: string;
  countApprox: number;
}

interface Cell {
  h3: string;
  totalApprox: number;
  dominantCenter: string;
  centers: CenterData[];
}

type RenderMode = 'dominant' | 'stack';

export default function GeoCentersPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<any>(null);

  const { user, loading } = useAuth();
  const router = useRouter();

  // 상태 관리
  const [cells, setCells] = useState<Cell[]>([]);
  const [metadata, setMetadata] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [librariesLoaded, setLibrariesLoaded] = useState(false);
  const [h3Module, setH3Module] = useState<any>(null);

  // 렌더링 모드
  const [mode, setMode] = useState<RenderMode>('dominant');
  const [topN, setTopN] = useState(3); // 스택 모드 상위 N개

  // 센터 필터
  const [centers, setCenters] = useState<string[]>([]);
  const [activeCenters, setActiveCenters] = useState<Set<string>>(new Set());

  // 색상 업데이트 트리거
  const [colorVersion, setColorVersion] = useState(0);

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
        const deckGlCore = await import('@deck.gl/core');
        const geoLayers = await import('@deck.gl/geo-layers');
        const coreLayers = await import('@deck.gl/layers');
        const h3 = await import('h3-js');

        MapboxLayer = deckGl.MapboxOverlay;
        H3HexagonLayer = geoLayers.H3HexagonLayer;
        ColumnLayer = coreLayers.ColumnLayer;
        DeckGL = deckGlCore.Deck;
        setH3Module(h3); // h3 모듈을 상태로 설정

        await import('maplibre-gl/dist/maplibre-gl.css' as any);

        console.log('✅ MapLibre + deck.gl 라이브러리 로딩 완료');
        setLibrariesLoaded(true); // 로딩 완료 상태 업데이트
      } catch (error) {
        console.error('❌ 라이브러리 로딩 오류:', error);
        setLibrariesLoaded(false);
      }
    };

    loadLibraries();
  }, []);

  // 데이터 로딩
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
        cellsData.forEach((cell: Cell) => {
          cell.centers.forEach(center => {
            if (center.centerId !== '기타') {
              centerSet.add(center.centerId);
            }
          });
        });

        const centerList = Array.from(centerSet).sort();
        setCenters(centerList);
        setActiveCenters(new Set(centerList));

        console.log('✅ 센터별 분포 데이터 로딩:', cellsData.length, '셀');
      } else {
        console.error('❌ 데이터 로딩 실패:', result.error);
      }
    } catch (error) {
      console.error('❌ API 호출 오류:', error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user?.userType === 'superAdmin') {
      fetchData();
    }
  }, [user]);

  // 필터링된 셀 데이터
  const filteredCells = useMemo(() => {
    return cells.filter(cell => {
      if (cell.dominantCenter === '기타') return true;
      return activeCenters.has(cell.dominantCenter);
    });
  }, [cells, activeCenters]);

  // 스택 모드용 방사형 좌표 계산
  const calculateRadialOffset = (
    lng: number,
    lat: number,
    radiusMeters: number = 120,
    angleDegrees: number = 0
  ): [number, number] => {
    const radiansPerDegree = Math.PI / 180;
    const cosLat = Math.cos(lat * radiansPerDegree);

    const deltaLat = radiusMeters / 111320; // 1도 위도 ≈ 111.32km
    const deltaLng = radiusMeters / (111320 * cosLat);

    const angleRadians = angleDegrees * radiansPerDegree;

    return [
      lng + deltaLng * Math.cos(angleRadians),
      lat + deltaLat * Math.sin(angleRadians)
    ];
  };

  // 스택 모드 데이터 준비
  const stackData = useMemo(() => {
    if (!h3Module) return [];

    const rows: any[] = [];

    for (const cell of filteredCells) {
      const sortedCenters = [...cell.centers]
        .sort((a, b) => b.countApprox - a.countApprox)
        .slice(0, topN);

      if (sortedCenters.length === 0) continue;

      try {
        const [lat, lng] = h3Module.cellToLatLng(cell.h3);
        const angleStep = 360 / Math.max(sortedCenters.length, 1);

        sortedCenters.forEach((center, index) => {
          if (!activeCenters.has(center.centerId) && center.centerId !== '기타') {
            return;
          }

          const [lng2, lat2] = calculateRadialOffset(lng, lat, 120, index * angleStep);

          rows.push({
            position: [lng2, lat2],
            centerId: center.centerId,
            count: center.countApprox,
            label: `${center.centerId} · 약 ${center.countApprox}명`,
            h3: cell.h3,
            cellTotal: cell.totalApprox
          });
        });
      } catch (error) {
        console.warn('H3 좌표 변환 오류:', cell.h3, error);
      }
    }

    return rows;
  }, [filteredCells, topN, activeCenters, h3Module]);

  // 지도 초기화 및 레이어 업데이트
  useEffect(() => {
    if (!mapRef.current || !maplibregl || !MapboxLayer || !H3HexagonLayer || !ColumnLayer) {
      return;
    }

    const VWORLD_KEY = process.env.NEXT_PUBLIC_VWORLD_KEY || 'demo_key';

    // OpenStreetMap으로 임시 변경 (VWorld API 키 문제)
    const style: any = {
      version: 8,
      sources: {
        osm: {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors'
        }
      },
      layers: [
        {
          id: 'osm-base',
          type: 'raster',
          source: 'osm'
        }
      ]
    };

    const map = new maplibregl.Map({
      container: mapRef.current,
      style,
      center: [127.0276, 37.4979], // 서울 강남구 중심
      zoom: 12,
      attributionControl: true,
      logoPosition: 'bottom-left'
    });

    mapInstanceRef.current = map;

    // 툴팁 엘리먼트
    const tooltip = document.createElement('div');
    tooltip.className = 'absolute z-50 px-3 py-2 text-xs bg-white/95 border border-gray-300 rounded-lg shadow-lg pointer-events-none';
    tooltip.style.display = 'none';
    mapRef.current.appendChild(tooltip);
    tooltipRef.current = tooltip;

    // 지배 모드 레이어
    const buildDominantLayer = () => {
      return new H3HexagonLayer({
        id: 'h3-dominant',
        data: filteredCells,
        pickable: true,
        getHexagon: (d: Cell) => d.h3,
        getFillColor: (d: Cell) => colorRgbaOf(d.dominantCenter, 0.72),
        getElevation: (d: Cell) => 0, // 2D로 변경
        extruded: false,
        opacity: 1.0,
        coverage: 1.0,
        wireframe: false
      });
    };

    // 스택 모드 레이어
    const buildStackLayer = () => {
      return new ColumnLayer({
        id: 'h3-stack',
        data: stackData,
        pickable: true,
        getPosition: (d: any) => d.position,
        getFillColor: (d: any) => colorRgbaOf(d.centerId, 0.9),
        getElevation: (d: any) => 0, // 2D로 변경
        elevationScale: 1,
        radius: 80,
        extruded: false,
        wireframe: false
      });
    };

    map.on('load', () => {
      console.log('🗺️ OpenStreetMap 지도 로딩 완료');
    });

    // 정리 함수
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [librariesLoaded]);

  // H3 헥사곤 레이어 렌더링 및 Deck.gl 연동
  useEffect(() => {
    console.log('🔍 H3 레이어 useEffect 실행:', { 
      hasMap: !!mapRef.current, 
      hasDeckGL: !!DeckGL, 
      hasH3HexagonLayer: !!H3HexagonLayer, 
      hasColumnLayer: !!ColumnLayer,
      cellsLength: cells.length, 
      librariesLoaded 
    });

    if (!mapRef.current || !DeckGL || !H3HexagonLayer || !ColumnLayer || !librariesLoaded || cells.length === 0) {
      console.log('⏳ H3 레이어 대기 중 - 라이브러리 로딩 또는 데이터 대기');
      return;
    }

    const map = mapRef.current;

    // 기존 Deck.gl 인스턴스가 있으면 제거
    if (layerRef.current) {
      layerRef.current.setProps({ layers: [] });
      layerRef.current.finalize();
      layerRef.current = null;
    }

    // 현재 모드에 따른 레이어 생성
    const currentLayer = mode === 'dominant' ? 
      new H3HexagonLayer({
        id: 'h3-dominant',
        data: filteredCells,
        pickable: true,
        getHexagon: (d: Cell) => d.h3,
        getFillColor: (d: Cell) => colorRgbaOf(d.dominantCenter, 0.72),
        getElevation: (d: Cell) => 0,
        extruded: false,
        opacity: 1.0,
        coverage: 1.0,
        wireframe: false
      }) :
      new ColumnLayer({
        id: 'h3-stack',
        data: stackData,
        pickable: true,
        getPosition: (d: any) => d.position,
        getFillColor: (d: any) => colorRgbaOf(d.centerId, 0.9),
        getElevation: (d: any) => 0,
        elevationScale: 1,
        radius: 80,
        extruded: false,
        wireframe: false
      });

    // Deck.gl 인스턴스 생성
    console.log('🔧 Deck.gl 인스턴스 생성 시작...');
    
    const deckInstance = new DeckGL({
      canvas: 'deck-canvas',
      width: '100%',
      height: '100%',
      initialViewState: {
        longitude: 127.0276,
        latitude: 37.4979,
        zoom: 12,
        pitch: 0,
        bearing: 0
      },
      controller: false,
      layers: [currentLayer],
      parameters: {
        depthTest: false
      },
      onError: (error: any) => {
        console.error('🚨 Deck.gl 오류:', error);
      },
      onAfterRender: () => {
        console.log('🎨 Deck.gl 렌더링 완료');
      }
    });
    
    console.log('✅ Deck.gl 인스턴스 생성 완료:', deckInstance);

    // MapLibre와 Deck.gl 연동
    if (mapInstanceRef.current) {
      mapInstanceRef.current.on('move', () => {
        const { lng, lat } = mapInstanceRef.current.getCenter();
        const zoom = mapInstanceRef.current.getZoom();
        deckInstance.setProps({
          viewState: {
            longitude: lng,
            latitude: lat,
            zoom: zoom,
            pitch: 0,
            bearing: 0
          }
        });
      });
    }

    layerRef.current = deckInstance;

    // 렌더링 강제 실행
    setTimeout(() => {
      console.log('🔄 Deck.gl 강제 렌더링 실행');
      deckInstance.setProps({
        layers: [currentLayer]
      });
    }, 1000);

    console.log(`✅ ${mode === 'dominant' ? '지배' : '스택'} 모드 H3 레이어 업데이트 완료`);
  }, [mode, filteredCells, stackData, topN, colorVersion, librariesLoaded]);

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

  // 센터 색상 변경
  const handleColorChange = (centerId: string, hexColor: string) => {
    setCenterColor(centerId, hexColor);
    setColorVersion(v => v + 1); // 색상 업데이트 트리거
    console.log(`🎨 센터 색상 변경: ${centerId} → ${hexColor}`);
  };

  // 색상 초기화
  const handleResetColors = () => {
    if (confirm('모든 센터 색상을 초기화하시겠습니까?')) {
      resetCenterColors();
      setColorVersion(v => v + 1);
      alert('✅ 센터 색상이 초기화되었습니다.');
    }
  };

  // CSV 내보내기
  const exportToCSV = async () => {
    if (cells.length === 0) {
      alert('내보낼 데이터가 없습니다.');
      return;
    }

    try {
      const h3 = await import('h3-js');

      const headers = ['H3_Index', 'Mode', 'Dominant_Center', 'Total_Count', 'Latitude', 'Longitude', 'Center_Details'];
      const rows = cells.map(cell => {
        const [lat, lon] = h3.cellToLatLng(cell.h3);
        const centerDetails = cell.centers
          .map(c => `${c.centerId}:${c.countApprox}`)
          .join('|');

        return [
          cell.h3,
          mode,
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
      link.setAttribute('download', `swimlab_centers_${mode}_${new Date().toISOString().split('T')[0]}.csv`);
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

  // maplibre-gl 패키지 로딩 대기
  if (!librariesLoaded || !maplibregl || !MapboxLayer || !H3HexagonLayer || !ColumnLayer || !h3Module) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">지도 라이브러리 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* VWorld 키 만료 배너 */}
      <VWorldExpiryBanner />

      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">
            🗺️ 센터별 회원 분포 지도 (최종판)
          </h1>
          <VWorldKeyBadge />
        </div>
        <p className="text-gray-600">
          지배/스택 모드 토글 + 센터 브랜드 컬러 프리셋 관리
        </p>
      </div>

      {/* 모드 선택 패널 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-medium">
            <span>렌더링 모드:</span>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as RenderMode)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="dominant">🎯 지배 모드 (가장 많은 센터 색)</option>
              <option value="stack">📊 스택 모드 (비율 기둥)</option>
            </select>
          </label>

          {mode === 'stack' && (
            <label className="flex items-center gap-2 text-sm font-medium">
              <span>상위 표시:</span>
              <select
                value={topN}
                onChange={(e) => setTopN(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[2, 3, 4].map(n => (
                  <option key={n} value={n}>Top {n}</option>
                ))}
              </select>
            </label>
          )}

          <span className="ml-auto text-xs text-gray-500">
            💡 {mode === 'dominant' 
              ? '지배 센터 색상으로 전체 셀 표시' 
              : '센터별 비율을 방사형 기둥으로 표시'}
          </span>
        </div>
      </div>

      {/* 센터 필터 및 색상 편집 패널 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">센터 필터 & 색상 관리</h2>
          <button
            onClick={handleResetColors}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            🔄 색상 초기화
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {centers.map(centerId => {
            const css = colorCssOf(centerId);
            const hexColor = cssToHex(css);

            return (
              <div key={centerId} className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg">
                <input
                  type="checkbox"
                  checked={activeCenters.has(centerId)}
                  onChange={(e) => toggleCenter(centerId, e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />

                <span
                  className="inline-block w-6 h-6 rounded border border-gray-300"
                  style={{ backgroundColor: css }}
                />

                <span className="flex-1 font-medium text-sm">{centerId}</span>

                <input
                  type="color"
                  value={hexColor}
                  onChange={(e) => handleColorChange(centerId, e.target.value)}
                  className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                  title="센터 색상 편집"
                />
              </div>
            );
          })}
        </div>

        {centers.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            데이터를 로딩 중입니다...
          </div>
        )}
      </div>

      {/* 통계 정보 */}
      {metadata && (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{filteredCells.length}</div>
              <div className="text-sm text-gray-600">표시된 지역</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">k≥{metadata.kAnonymityThreshold}</div>
              <div className="text-sm text-gray-600">k-익명성</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">ε={metadata.laplaceEpsilon}</div>
              <div className="text-sm text-gray-600">노이즈</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{centers.length}개</div>
              <div className="text-sm text-gray-600">센터</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-600">
                {mode === 'dominant' ? '지배' : `스택 (Top${topN})`}
              </div>
              <div className="text-sm text-gray-600">모드</div>
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
      </div>

      {/* 지도 컨테이너 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden relative">
        <div
          ref={mapRef}
          className="relative w-full h-[650px]"
          style={{ minHeight: '650px' }}
        />
        <canvas 
          id="deck-canvas"
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1, backgroundColor: 'rgba(255, 0, 0, 0.1)' }}
        />
      </div>

      {/* 프라이버시 안내 */}
      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="text-yellow-600 mr-2 text-xl">🔒</div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-yellow-800 mb-1">프라이버시 보호 안내</h3>
            <ul className="text-sm text-yellow-700 ml-4 list-disc space-y-1">
              <li>k-익명성 (k≥5): 5명 미만 지역/센터는 "기타"로 통합</li>
              <li>라플라스 노이즈 (ε=2): 개별 수치에 무작위 노이즈 추가</li>
              <li>5단위 반올림: 정확한 개인 수 파악 방지</li>
              <li>H3 헥사곤 집계: 600m-1km 단위로 지역 통합</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 모드 설명 */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">렌더링 모드 설명</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <div className="font-semibold mb-1">🎯 지배 모드</div>
            <ul className="ml-4 list-disc space-y-1">
              <li>각 셀에서 가장 많은 회원을 가진 센터 색으로 표시</li>
              <li>빠르고 직관적인 전체 분포 파악</li>
              <li>메인 대시보드 및 개요 보기에 적합</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-1">📊 스택 모드</div>
            <ul className="ml-4 list-disc space-y-1">
              <li>셀 중심에 센터별 원기둥을 방사형 배치</li>
              <li>혼합 지역의 센터별 비율까지 상세 표시</li>
              <li>분석 뷰 및 상세 확인에 적합</li>
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
          <div>📊 <strong>시각화:</strong> deck.gl (H3HexagonLayer + ColumnLayer)</div>
          <div>🎨 <strong>색상:</strong> HSL 해시 + 로컬 스토리지 프리셋</div>
          <div>🔢 <strong>집계:</strong> H3 헥사곤 그리드 시스템</div>
        </div>
      </div>
    </div>
  );
}