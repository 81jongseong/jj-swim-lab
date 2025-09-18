/**
 * OpenStreetMap 컴포넌트 - React Strict Mode 완전 호환
 * - 무한 루프 방지
 * - 지도 컨테이너 재사용 오류 완전 해결
 * - 안정적인 의존성 관리
 * 
 * 연동 파일:
 * - client/app/map/page.tsx (지도 페이지)
 * - MapControls 컴포넌트 (지도 컨트롤)
 */

'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';

// 전역 타입 선언
declare global {
  interface Window {
    L: any;
  }
}

// 지도 마커 인터페이스
interface Marker {
  id: string;
  position: { lat: number; lng: number };
  title?: string;
  icon?: string;
  popup?: string;
}

// 컴포넌트 Props 인터페이스
interface OpenStreetMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  width?: string | number;
  height?: string | number;
  markers?: Marker[];
  onMarkerClick?: (markerId: string) => void;
  onMapClick?: (position: { lat: number; lng: number }) => void;
  className?: string;
  tileLayer?: 'osm' | 'satellite';
  onMapReady?: (map: any) => void;
}

// 고유 ID 생성기
let mapIdCounter = 0;

export default function OpenStreetMap({
  center = { lat: 37.5665, lng: 126.9780 },
  zoom = 15,
  width = '100%',
  height = '400px',
  markers = [],
  onMarkerClick,
  onMapClick,
  className = '',
  tileLayer = 'osm',
  onMapReady,
}: OpenStreetMapProps) {
  // 안정적인 참조들
  const mapId = useRef(`map-${++mapIdCounter}-${Date.now()}`);
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentMarkers, setCurrentMarkers] = useState<any[]>([]);

  // 안정적인 center 참조 (무한 루프 방지)
  const stableCenter = useMemo(() => center, [center.lat, center.lng]);
  
  // 안정적인 markers 참조 (무한 루프 방지)
  const stableMarkers = useMemo(() => markers, [JSON.stringify(markers)]);

  // Leaflet 라이브러리 로드 (한 번만 실행)
  useEffect(() => {
    const loadLeaflet = async () => {
      if (window.L) {
        setIsLoaded(true);
        return;
      }

      try {
        // CSS 로드
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        cssLink.onload = () => console.log('✅ Leaflet CSS 로드 완료');
        document.head.appendChild(cssLink);

        // JavaScript 로드
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        
        script.onload = () => {
          setTimeout(() => {
            if (window.L && window.L.map) {
              console.log('✅ Leaflet JS 로드 완료');
              setIsLoaded(true);
            }
          }, 100);
        };
        
        script.onerror = () => {
          console.error('❌ Leaflet 로드 실패');
        };
        
        document.head.appendChild(script);
      } catch (error) {
        console.error('❌ Leaflet 로드 중 오류:', error);
      }
    };

    loadLeaflet();
  }, []); // 빈 의존성 배열 - 한 번만 실행

  // 지도 초기화 (한 번만 실행)
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.L || map) return;

    let isMounted = true; // cleanup 플래그

    const initializeMap = () => {
      try {
        console.log(`🗺️ 지도 초기화 시작: ${mapId.current}`);
        
        const container = mapRef.current;
        if (!container || !isMounted) return;

        // DOM 완전 정리
        container.innerHTML = '';
        delete (container as any)._leaflet_id;
        delete (container as any)._leaflet_pos;
        delete (container as any)._leaflet;

        // 새 지도 생성
        const mapInstance = window.L.map(container, {
          center: [stableCenter.lat, stableCenter.lng],
          zoom: zoom,
          zoomControl: false,
          attributionControl: true,
          preferCanvas: true,
        });

        // 타일 레이어 추가 (일반/위성만)
        const getTileLayer = () => {
          switch (tileLayer) {
            case 'satellite':
              return window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri',
                maxZoom: 19
              });
            default: // osm
              return window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 19
              });
          }
        };

        const tileLayerInstance = getTileLayer();
        tileLayerInstance.addTo(mapInstance);

        // 지도 클릭 이벤트
        if (onMapClick) {
          mapInstance.on('click', (e: any) => {
            onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
          });
        }

        // 상태 업데이트
        setMap(mapInstance);

        // 부모에게 지도 인스턴스 전달
        if (onMapReady) {
          onMapReady(mapInstance);
        }

        // 지도 크기 조정
        setTimeout(() => {
          try {
            mapInstance.invalidateSize(true);
          } catch (e) {
            console.warn('지도 크기 조정 중 경고:', e);
          }
        }, 100);

        console.log(`✅ 지도 초기화 완료: ${mapId.current}`);
        
      } catch (error) {
        console.error('❌ 지도 초기화 실패:', error);
      }
    };

    initializeMap();

    // cleanup 함수
    return () => {
      isMounted = false;
    };
  }, [isLoaded]); // 최소한의 의존성만

  // 마커 관리 (지도 준비 후 한 번만)
  useEffect(() => {
    if (!map || !window.L || stableMarkers.length === 0) return;

    const updateMarkers = () => {
      try {
        // 기존 마커 제거
        currentMarkers.forEach(marker => {
          try {
            if (marker && map.hasLayer && map.hasLayer(marker)) {
              map.removeLayer(marker);
            }
          } catch (e) {
            console.warn('마커 제거 중 경고:', e);
          }
        });

        const newMarkers: any[] = [];

        // 새 마커 추가
        stableMarkers.forEach((markerData) => {
          try {
            const icon = window.L.icon({
              iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            });

            const marker = window.L.marker([markerData.position.lat, markerData.position.lng], {
              icon: icon,
              title: markerData.title || ''
            });

            // 팝업 추가
            if (markerData.popup) {
              marker.bindPopup(markerData.popup, {
                maxWidth: 300,
                className: 'custom-popup'
              });
            }

            // 클릭 이벤트
            if (onMarkerClick) {
              marker.on('click', () => {
                onMarkerClick(markerData.id);
              });
            }

            marker.addTo(map);
            newMarkers.push(marker);
            
          } catch (markerError) {
            console.warn('마커 생성 중 경고:', markerError);
          }
        });

        setCurrentMarkers(newMarkers);
        
      } catch (error) {
        console.warn('마커 업데이트 중 경고:', error);
      }
    };

    // 지도가 준비되면 마커 추가
    if (map._loaded) {
      updateMarkers();
    } else {
      map.whenReady(() => {
        setTimeout(updateMarkers, 100);
      });
    }
  }, [map]); // 지도가 준비되면 한 번만 실행

  // 윈도우 리사이즈 처리
  useEffect(() => {
    if (!map) return;

    const handleResize = () => {
      try {
        setTimeout(() => {
          if (map && map.invalidateSize) {
            map.invalidateSize(true);
          }
        }, 100);
      } catch (e) {
        console.warn('리사이즈 처리 중 경고:', e);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [map]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      console.log(`🧹 지도 정리: ${mapId.current}`);
      
      try {
        // 마커 정리
        currentMarkers.forEach(marker => {
          try {
            if (marker && marker.remove) {
              marker.remove();
            }
          } catch (e) {
            console.warn('마커 제거 중 경고:', e);
          }
        });

        // 지도 정리
        if (map) {
          try {
            map.off();
            map.remove();
          } catch (e) {
            console.warn('지도 제거 중 경고:', e);
          }
        }

        // DOM 정리
        if (mapRef.current) {
          const container = mapRef.current;
          delete (container as any)._leaflet_id;
          delete (container as any)._leaflet_pos;
          delete (container as any)._leaflet;
          container.innerHTML = '';
        }
      } catch (error) {
        console.warn('정리 중 경고:', error);
      }
    };
  }, []); // 빈 의존성 - 언마운트 시에만 실행

  return (
    <div 
      ref={mapRef}
      id={mapId.current}
      className={`${className} relative block`}
      style={{ 
        width: width || '100%', 
        height: height || '600px',
        minHeight: height || '600px',
        minWidth: '100%',
        backgroundColor: '#f3f4f6',
        zIndex: 1
      }}
    />
  );
}

// 지도 컨트롤 컴포넌트
export function MapControls({ 
  map, 
  onZoomIn, 
  onZoomOut, 
  onReset,
  onTileLayerChange
}: { 
  map: any; 
  onZoomIn?: () => void; 
  onZoomOut?: () => void; 
  onReset?: () => void;
  onTileLayerChange?: (layer: string) => void;
}) {
  const [currentTileLayer, setCurrentTileLayer] = useState('osm');

  const handleZoomIn = () => {
    try {
      if (map && map.zoomIn) {
        map.zoomIn();
      }
      onZoomIn?.();
    } catch (e) {
      console.warn('줌인 처리 중 경고:', e);
    }
  };

  const handleZoomOut = () => {
    try {
      if (map && map.zoomOut) {
        map.zoomOut();
      }
      onZoomOut?.();
    } catch (e) {
      console.warn('줌아웃 처리 중 경고:', e);
    }
  };

  const handleReset = () => {
    try {
      if (map && map.setView) {
        map.setView([37.5665, 126.9780], 15);
      }
      onReset?.();
    } catch (e) {
      console.warn('리셋 처리 중 경고:', e);
    }
  };

  const handleTileLayerChange = (layer: string) => {
    try {
      setCurrentTileLayer(layer);
      onTileLayerChange?.(layer);
      
      // 실제 지도의 타일 레이어 변경
      if (map && window.L) {
        // 기존 타일 레이어 제거
        map.eachLayer((layer: any) => {
          if (layer._url) { // 타일 레이어인지 확인
            map.removeLayer(layer);
          }
        });
        
        // 새 타일 레이어 추가 (일반/위성만)
        let newTileLayer;
        switch (layer) {
          case 'satellite':
            newTileLayer = window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
              attribution: 'Tiles &copy; Esri'
            });
            break;
          default: // osm
            newTileLayer = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; OpenStreetMap contributors'
            });
        }
        
        if (newTileLayer) {
          newTileLayer.addTo(map);
        }
      }
    } catch (e) {
      console.warn('타일 레이어 변경 중 경고:', e);
    }
  };

  return (
    <div className="absolute top-4 left-4 flex flex-col space-y-2 z-[1000]">
      {/* 줌 컨트롤 */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center border-b border-gray-200"
          title="확대"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center"
          title="축소"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      </div>

      {/* 홈 버튼 */}
      <button
        onClick={handleReset}
        className="w-10 h-10 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center rounded-lg shadow-lg"
        title="홈으로"
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </button>

      {/* 타일 레이어 선택 */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-2">
          <div className="text-xs text-gray-600 mb-2">지도 스타일</div>
          <div className="grid grid-cols-1 gap-1">
            {[
              { key: 'osm', label: '일반지도', icon: '🗺️' },
              { key: 'satellite', label: '위성지도', icon: '🛰️' }
            ].map((style) => (
              <button
                key={style.key}
                onClick={() => handleTileLayerChange(style.key)}
                className={`p-1 text-xs rounded transition-colors ${
                  currentTileLayer === style.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title={style.label}
              >
                <div className="flex flex-col items-center">
                  <span className="text-sm">{style.icon}</span>
                  <span className="text-xs">{style.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 주소 검색 컴포넌트
export function AddressSearch({ 
  onAddressSelect 
}: { 
  onAddressSelect: (position: { lat: number; lng: number }) => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      // 간단한 주소 검색 (실제로는 Geocoding API 사용)
      // 여기서는 샘플 위치들을 제공
      const sampleLocations = [
        { name: '서울시청', lat: 37.5665, lng: 126.9780 },
        { name: '강남역', lat: 37.4979, lng: 127.0276 },
        { name: '홍대입구역', lat: 37.5563, lng: 126.9236 },
        { name: '잠실역', lat: 37.5134, lng: 127.1000 },
        { name: '신촌역', lat: 37.5547, lng: 126.9364 }
      ];

      const found = sampleLocations.find(loc => 
        loc.name.includes(searchTerm) || searchTerm.includes(loc.name)
      );

      if (found) {
        onAddressSelect({ lat: found.lat, lng: found.lng });
      } else {
        // 기본값으로 서울시청
        onAddressSelect({ lat: 37.5665, lng: 126.9780 });
      }
    } catch (error) {
      console.warn('주소 검색 중 오류:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex space-x-2">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="주소 또는 장소명 입력 (예: 강남역, 홍대)"
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={isSearching}
      />
      <button
        onClick={handleSearch}
        disabled={isSearching || !searchTerm.trim()}
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isSearching ? '검색중...' : '검색'}
      </button>
    </div>
  );
}