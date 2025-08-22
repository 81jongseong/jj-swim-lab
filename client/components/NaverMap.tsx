'use client';

import { useEffect, useRef, useState } from 'react';

interface NaverMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  width?: string | number;
  height?: string | number;
  markers?: Array<{
    id: string;
    position: { lat: number; lng: number };
    title?: string;
    icon?: string;
  }>;
  onMarkerClick?: (markerId: string) => void;
  onMapClick?: (position: { lat: number; lng: number }) => void;
  className?: string;
}

declare global {
  interface Window {
    naver: any;
  }
}

export default function NaverMap({
  center = { lat: 37.5665, lng: 126.9780 }, // 서울시청 기본 위치
  zoom = 15,
  width = '100%',
  height = '400px',
  markers = [],
  onMarkerClick,
  onMapClick,
  className = '',
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Naver Maps API 스크립트 로드
    const loadNaverMaps = () => {
      if (window.naver) {
        setIsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${process.env.NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID}&submodules=geocoder`;
      script.async = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    };

    loadNaverMaps();
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.naver) return;

    try {
      // 지도 생성
      const mapInstance = new window.naver.maps.Map(mapRef.current, {
        center: new window.naver.maps.LatLng(center.lat, center.lng),
        zoom: zoom,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: window.naver.maps.MapTypeControlStyle.DROPDOWN,
          position: window.naver.maps.Position.TOP_RIGHT,
        },
        zoomControl: true,
        zoomControlOptions: {
          style: window.naver.maps.ZoomControlStyle.SMALL,
          position: window.naver.maps.Position.TOP_LEFT,
        },
        scaleControl: true,
        logoControl: false,
        mapDataControl: false,
        streetLamp: false,
      });

      setMap(mapInstance);

      // 지도 클릭 이벤트
      if (onMapClick) {
        window.naver.maps.Event.addListener(mapInstance, 'click', (e: any) => {
          const position = e.coord;
          onMapClick({
            lat: position.lat(),
            lng: position.lng(),
          });
        });
      }
    } catch (error) {
      console.error('Naver Maps 초기화 실패:', error);
    }
  }, [isLoaded, center.lat, center.lng, zoom, onMapClick]);

  useEffect(() => {
    if (!map || !window.naver) return;

    // 기존 마커 제거
    map.getOverlays().forEach((overlay: any) => {
      if (overlay instanceof window.naver.maps.Marker) {
        overlay.setMap(null);
      }
    });

    // 새 마커 추가
    markers.forEach((markerData) => {
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(markerData.position.lat, markerData.position.lng),
        map: map,
        title: markerData.title || '',
        icon: markerData.icon ? {
          content: markerData.icon,
          size: new window.naver.maps.Size(32, 32),
          anchor: new window.naver.maps.Point(16, 16),
        } : undefined,
      });

      // 마커 클릭 이벤트
      if (onMarkerClick) {
        window.naver.maps.Event.addListener(marker, 'click', () => {
          onMarkerClick(markerData.id);
        });
      }

      // 마커 호버 시 정보창 표시
      if (markerData.title) {
        const infoWindow = new window.naver.maps.InfoWindow({
          content: `
            <div style="padding: 10px; min-width: 150px;">
              <h3 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">
                ${markerData.title}
              </h3>
              <p style="margin: 0; font-size: 12px; color: #666;">
                ${markerData.position.lat.toFixed(6)}, ${markerData.position.lng.toFixed(6)}
              </p>
            </div>
          `,
          borderWidth: 0,
          backgroundColor: 'white',
          borderRadius: '8px',
          anchorSize: new window.naver.maps.Size(10, 10),
          anchorColor: 'white',
          pixelOffset: new window.naver.maps.Point(0, -10),
        });

        window.naver.maps.Event.addListener(marker, 'mouseover', () => {
          infoWindow.open(map, marker);
        });

        window.naver.maps.Event.addListener(marker, 'mouseout', () => {
          infoWindow.close();
        });
      }
    });
  }, [map, markers, onMarkerClick]);

  // 지도 중심점 변경
  useEffect(() => {
    if (!map || !window.naver) return;
    
    map.setCenter(new window.naver.maps.LatLng(center.lat, center.lng));
  }, [map, center.lat, center.lng]);

  // 줌 레벨 변경
  useEffect(() => {
    if (!map) return;
    
    map.setZoom(zoom);
  }, [map, zoom]);

  if (!isLoaded) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 ${className}`}
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">지도를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef}
      className={className}
      style={{ width, height }}
    />
  );
}

// 지도 컨트롤 컴포넌트
export function MapControls({ 
  map, 
  onZoomIn, 
  onZoomOut, 
  onReset 
}: { 
  map: any; 
  onZoomIn?: () => void; 
  onZoomOut?: () => void; 
  onReset?: () => void; 
}) {
  const handleZoomIn = () => {
    if (map) {
      map.setZoom(map.getZoom() + 1);
    }
    onZoomIn?.();
  };

  const handleZoomOut = () => {
    if (map) {
      map.setZoom(map.getZoom() - 1);
    }
    onZoomOut?.();
  };

  const handleReset = () => {
    if (map) {
      map.setZoom(15);
      map.setCenter(new window.naver.maps.LatLng(37.5665, 126.9780));
    }
    onReset?.();
  };

  return (
    <div className="absolute top-4 right-4 flex flex-col space-y-2">
      <button
        onClick={handleZoomIn}
        className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        title="확대"
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
      
      <button
        onClick={handleZoomOut}
        className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        title="축소"
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>
      
      <button
        onClick={handleReset}
        className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        title="위치 초기화"
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </button>
    </div>
  );
}

// 주소 검색 컴포넌트
export function AddressSearch({ 
  onAddressSelect 
}: { 
  onAddressSelect: (address: string, position: { lat: number; lng: number }) => void; 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{
    address: string;
    position: { lat: number; lng: number };
  }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchAddress = async () => {
    if (!searchQuery.trim() || !window.naver) return;

    setIsSearching(true);
    try {
      const geocoder = new window.naver.maps.Service.Geocoder();
      
      geocoder.geocode({
        query: searchQuery,
      }, (status: string, response: any) => {
        setIsSearching(false);
        
        if (status === window.naver.maps.Service.Status.ERROR) {
          console.error('주소 검색 실패:', response);
          return;
        }

        if (response.v2.meta.totalCount === 0) {
          setSearchResults([]);
          return;
        }

        const results = response.v2.addresses.map((item: any) => ({
          address: item.roadAddress || item.jibunAddress,
          position: {
            lat: parseFloat(item.y),
            lng: parseFloat(item.x),
          },
        }));

        setSearchResults(results);
      });
    } catch (error) {
      console.error('주소 검색 중 오류:', error);
      setIsSearching(false);
    }
  };

  const handleAddressSelect = (result: { address: string; position: { lat: number; lng: number } }) => {
    onAddressSelect(result.address, result.position);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="relative">
      <div className="flex space-x-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="주소를 입력하세요"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => e.key === 'Enter' && searchAddress()}
        />
        <button
          onClick={searchAddress}
          disabled={isSearching}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isSearching ? '검색 중...' : '검색'}
        </button>
      </div>

      {/* 검색 결과 */}
      {searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          {searchResults.map((result, index) => (
            <button
              key={index}
              onClick={() => handleAddressSelect(result)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="text-sm font-medium text-gray-900">{result.address}</div>
              <div className="text-xs text-gray-500">
                {result.position.lat.toFixed(6)}, {result.position.lng.toFixed(6)}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


