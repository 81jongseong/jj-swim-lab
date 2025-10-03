/**
 * 🗺️ JJ Swim Lab - 회원 분포도 관리 페이지 (VWorld + MapLibre + deck.gl)
 * 
 * 📋 **페이지 목적**
 * - VWorld WMTS 타일을 배경으로 사용한 국내 무료 지도
 * - deck.gl H3HexagonLayer로 회원 분포 시각화
 * - 프라이버시 보호된 집계 데이터만 표시
 * - 실시간 필터링 및 CSV 내보내기 기능
 * 
 * 🔄 **주요 기능**
 * - VWorld WMTS 타일 렌더링
 * - H3 헥사곤 레이어 시각화
 * - 색상 팔레트 기반 분포 표시
 * - 마우스 호버 툴팁
 * - CSV 내보내기 (집계 데이터만)
 * - 필터링 옵션 (센터, 기간, 회원 유형)
 * 
 * 🗄️ **데이터 연동**
 * - /api/members/heatmap API
 * - VWorld WMTS 타일 서비스
 * - H3 헥사곤 집계 데이터
 * - 프라이버시 보호 메타데이터
 * 
 * 🛠️ **필요한 설치 파일**
 * - maplibre-gl: 오픈소스 지도 렌더러
 * - deck.gl: WebGL 기반 데이터 시각화
 * - @deck.gl/mapbox: MapLibre 연동
 * - @deck.gl/geo-layers: H3 레이어
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. VWorld API 키는 NEXT_PUBLIC_VWORLD_KEY에 설정
 * 2. 원본 주소/좌표는 절대 표시하지 않음
 * 3. 집계된 데이터만 시각화
 * 4. 프라이버시 보호 메타데이터 표시
 * 5. 반응형 디자인 적용
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] VWorld WMTS 타일 로딩 확인
 * - [ ] H3 헥사곤 레이어 렌더링 확인
 * - [ ] 색상 팔레트 적절성 확인
 * - [ ] 툴팁 정보 정확성 확인
 * - [ ] CSV 내보내기 동작 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (MapLibre + VWorld 연동)
 * - 2024-12-19: deck.gl H3HexagonLayer 구현
 * - 2024-12-19: 프라이버시 보호 UI 구현
 * - 2024-12-19: 필터링 및 내보내기 기능 추가
 * 
 * 📚 **참고 자료**
 * - VWorld WMTS 가이드: https://www.vworld.kr/dev/
 * - MapLibre GL JS: https://maplibre.org/
 * - deck.gl 공식 문서: https://deck.gl/
 * - H3 헥사곤 시스템: https://h3geo.org/
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import VWorldKeyBadge, { VWorldExpiryBanner } from '../../../components/VWorldKeyBadge';

// 동적 import로 SSR 문제 방지
let maplibregl: any;
let MapboxLayer: any;
let H3HexagonLayer: any;

// 타입 정의
interface H3Cell {
  h3: string;
  countApprox: number;
}

interface HeatmapData {
  cells: H3Cell[];
  metadata: {
    totalCells: number;
    h3Resolution: number;
    kAnonymityThreshold: number;
    laplaceEpsilon: number;
    filters: any;
    privacyNotice: string;
  };
}

// 필터 옵션
const CENTER_OPTIONS = [
  { value: '', label: '전체 센터' },
  { value: 'A', label: '강남 센터' },
  { value: 'B', label: '홍대 센터' },
  { value: 'C', label: '송파 센터' }
];

const USER_TYPE_OPTIONS = [
  { value: '', label: '전체 회원' },
  { value: 'student', label: '학생' },
  { value: 'instructor', label: '강사' },
  { value: 'centerAdmin', label: '센터 관리자' }
];

export default function GeoDistributionPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // 상태 관리
  const [heatmapData, setHeatmapData] = useState<H3Cell[]>([]);
  const [metadata, setMetadata] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<any>(null);
  
  // 필터 상태
  const [filters, setFilters] = useState({
    centerId: '',
    userType: '',
    from: '',
    to: ''
  });

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
        // maplibre-gl 설치 필요 - 현재는 placeholder
        console.warn('⚠️ maplibre-gl 패키지가 설치되지 않았습니다.');
        console.log('💡 이 페이지는 VWorld 지도를 사용하려면 maplibre-gl, deck.gl, @deck.gl/mapbox, @deck.gl/geo-layers, h3-js 패키지가 필요합니다.');
        console.log('📦 설치: npm install maplibre-gl deck.gl @deck.gl/mapbox @deck.gl/geo-layers h3-js');
      } catch (error) {
        console.error('❌ 라이브러리 로딩 오류:', error);
      }
    };

    loadLibraries();
  }, []);

  // 지도 초기화
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
      zoom: 9,
      attributionControl: true,
      logoPosition: 'bottom-left'
    });

    mapInstanceRef.current = map;

    // 지도 로딩 완료 이벤트
    map.on('load', () => {
      console.log('🗺️ VWorld 지도 로딩 완료');
      
      // H3 헥사곤 레이어 생성
      const h3Layer = new MapboxLayer({
        id: 'h3-hexagons',
        type: H3HexagonLayer,
        data: heatmapData,
        pickable: true,
        getHexagon: (d: H3Cell) => d.h3,
        getFillColor: (d: H3Cell) => getColorFromCount(d.countApprox),
        getElevation: (d: H3Cell) => Math.sqrt(d.countApprox) * 100,
        extruded: false,
        opacity: 0.7,
        coverage: 0.9
      });

      layerRef.current = h3Layer;
      map.addLayer(h3Layer);

      // 마우스 호버 이벤트
      map.on('mousemove', 'h3-hexagons', (e: any) => {
        if (e.features && e.features.length > 0) {
          setHoveredCell(e.features[0].properties);
          map.getCanvas().style.cursor = 'pointer';
        }
      });

      map.on('mouseleave', 'h3-hexagons', () => {
        setHoveredCell(null);
        map.getCanvas().style.cursor = '';
      });
    });

    // 정리 함수
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [heatmapData]);

  // 색상 팔레트 함수
  const getColorFromCount = (count: number): [number, number, number, number] => {
    // 7단계 색상 팔레트 (연한 파랑 → 진한 빨강)
    const colorStops = [
      [0, [240, 248, 255, 180]],      // 연한 파랑
      [10, [173, 216, 230, 180]],     // 하늘색
      [20, [135, 206, 250, 180]],     // 하늘 파랑
      [30, [70, 130, 180, 180]],      // 강철 파랑
      [40, [255, 165, 0, 180]],       // 주황색
      [50, [255, 69, 0, 180]],        // 주황 빨강
      [60, [220, 20, 60, 180]]        // 진한 빨강
    ];

    // 선형 보간으로 색상 계산
    const normalizedCount = Math.min(count / 60, 1);
    
    for (let i = 0; i < colorStops.length - 1; i++) {
      const [stop1, color1] = colorStops[i];
      const [stop2, color2] = colorStops[i + 1];
      
      if (normalizedCount >= stop1 / 60 && normalizedCount <= stop2 / 60) {
        const ratio = (normalizedCount - stop1 / 60) / ((stop2 - stop1) / 60);
        
        return [
          Math.round(color1[0] + (color2[0] - color1[0]) * ratio),
          Math.round(color1[1] + (color2[1] - color1[1]) * ratio),
          Math.round(color1[2] + (color2[2] - color1[2]) * ratio),
          180
        ] as [number, number, number, number];
      }
    }
    
    return [220, 20, 60, 180]; // 기본값 (진한 빨강)
  };

  // 데이터 로딩 함수
  const fetchHeatmapData = async () => {
    setLoadingData(true);
    try {
      const params = new URLSearchParams();
      if (filters.centerId) params.append('centerId', filters.centerId);
      if (filters.userType) params.append('userType', filters.userType);
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);

      const response = await fetch(`/api/members/heatmap?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setHeatmapData(result.data.cells);
        setMetadata(result.data.metadata);
        console.log('✅ 회원 분포도 데이터 로딩 완료:', result.data.cells.length, '셀');
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
      fetchHeatmapData();
    }
  }, [user]);

  // 필터 변경 시 데이터 재로딩
  useEffect(() => {
    if (user?.userType === 'superAdmin') {
      fetchHeatmapData();
    }
  }, [filters]);

  // CSV 내보내기 함수
  const exportToCSV = async () => {
    if (heatmapData.length === 0) {
      alert('내보낼 데이터가 없습니다.');
      return;
    }

    const headers = ['H3_Index', 'Approximate_Count', 'Latitude', 'Longitude'];
    const rows = await Promise.all(heatmapData.map(async (cell) => {
      // H3 인덱스를 좌표로 변환 (대략적)
      try {
        const h3 = await import('h3-js');
        const [lat, lon] = h3.h3ToGeo(cell.h3);
        return [cell.h3, cell.countApprox, lat.toFixed(6), lon.toFixed(6)];
      } catch {
        return [cell.h3, cell.countApprox, '', ''];
      }
    }));

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `swimlab_heatmap_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('📊 CSV 내보내기 완료');
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

  // maplibre-gl 패키지 미설치 안내
  if (!maplibregl || !MapboxLayer || !H3HexagonLayer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">📦 필수 패키지 설치 필요</h1>
          <p className="text-gray-600 mb-4">
            이 페이지를 사용하려면 다음 패키지들을 설치해야 합니다:
          </p>
          <div className="bg-gray-100 rounded-lg p-4 mb-4 font-mono text-sm">
            npm install maplibre-gl deck.gl @deck.gl/mapbox @deck.gl/geo-layers h3-js
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• <strong>maplibre-gl</strong>: 오픈소스 지도 렌더러</p>
            <p>• <strong>deck.gl</strong>: WebGL 데이터 시각화</p>
            <p>• <strong>@deck.gl/mapbox</strong>: MapLibre 연동</p>
            <p>• <strong>@deck.gl/geo-layers</strong>: H3 레이어</p>
            <p>• <strong>h3-js</strong>: H3 헥사곤 그리드</p>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              💡 현재는 <a href="/map" className="text-blue-600 underline">일반 지도 페이지 (/map)</a>를 사용할 수 있습니다.
            </p>
          </div>
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
            🗺️ 회원 분포도 (VWorld + MapLibre + deck.gl)
          </h1>
          <VWorldKeyBadge />
        </div>
        <p className="text-gray-600">
          국내 무료 지도 서비스 기반 회원 분포 시각화
        </p>
      </div>

      {/* 필터 패널 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h2 className="text-lg font-semibold mb-3">필터 옵션</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 센터 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              센터
            </label>
            <select
              value={filters.centerId}
              onChange={(e) => setFilters(prev => ({ ...prev, centerId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CENTER_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 회원 유형 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              회원 유형
            </label>
            <select
              value={filters.userType}
              onChange={(e) => setFilters(prev => ({ ...prev, userType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {USER_TYPE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 시작 날짜 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              시작 날짜
            </label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => setFilters(prev => ({ ...prev, from: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 종료 날짜 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              종료 날짜
            </label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => setFilters(prev => ({ ...prev, to: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 통계 정보 */}
      {metadata && (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{metadata.totalCells}</div>
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
              <div className="text-2xl font-bold text-orange-600">H3-{metadata.h3Resolution}</div>
              <div className="text-sm text-gray-600">헥사곤 해상도</div>
            </div>
          </div>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={fetchHeatmapData}
            disabled={loadingData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingData ? '로딩 중...' : '🔄 새로고침'}
          </button>
          <button
            onClick={exportToCSV}
            disabled={heatmapData.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📊 CSV 내보내기
          </button>
        </div>

        {/* 호버 정보 */}
        {hoveredCell && (
          <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg">
            <div className="text-sm">
              <div className="font-semibold">H3: {hoveredCell.h3}</div>
              <div>대략 회원 수: {hoveredCell.countApprox}명</div>
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

      {/* 범례 */}
      <div className="mt-4 bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold mb-3">색상 범례</h3>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(240, 248, 255)' }}></div>
            <span className="text-sm">0-10명</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(173, 216, 230)' }}></div>
            <span className="text-sm">10-20명</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(135, 206, 250)' }}></div>
            <span className="text-sm">20-30명</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(70, 130, 180)' }}></div>
            <span className="text-sm">30-40명</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(255, 165, 0)' }}></div>
            <span className="text-sm">40-50명</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(255, 69, 0)' }}></div>
            <span className="text-sm">50-60명</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(220, 20, 60)' }}></div>
            <span className="text-sm">60명 이상</span>
          </div>
        </div>
      </div>

      {/* 프라이버시 안내 */}
      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="text-yellow-600 mr-2">🔒</div>
          <div>
            <h3 className="text-sm font-semibold text-yellow-800 mb-1">프라이버시 보호 안내</h3>
            <p className="text-sm text-yellow-700">
              이 지도는 개인정보 보호를 위해 다음과 같은 기술이 적용되었습니다:
            </p>
            <ul className="text-sm text-yellow-700 mt-1 ml-4 list-disc">
              <li>k-익명성 (k≥5): 5명 미만 지역은 표시되지 않음</li>
              <li>라플라스 노이즈: 개별 수치에 무작위 노이즈 추가</li>
              <li>5단위 반올림: 정확한 개인 수 파악 방지</li>
              <li>H3 헥사곤 집계: 600m-1km 단위로 지역 통합</li>
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
          <div>🔍 <strong>지오코딩:</strong> VWorld Geocoder 2.0 (일 40,000건 무료)</div>
          <div>🔢 <strong>집계:</strong> H3 헥사곤 그리드 시스템</div>
        </div>
      </div>
    </div>
  );
}