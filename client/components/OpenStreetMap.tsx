'use client';

import { useEffect, useRef, useState } from 'react';

interface OpenStreetMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  width?: string | number;
  height?: string | number;
  markers?: Array<{
    id: string;
    position: { lat: number; lng: number };
    title?: string;
    icon?: string;
    popup?: string;
  }>;
  onMarkerClick?: (markerId: string) => void;
  onMapClick?: (position: { lat: number; lng: number }) => void;
  className?: string;
  tileLayer?: 'osm' | 'satellite' | 'terrain' | 'dark';
}

declare global {
  interface Window {
    L: any;
  }
}

export default function OpenStreetMap({
  center = { lat: 37.5665, lng: 126.9780 }, // 서울시청 기본 위치
  zoom = 15,
  width = '100%',
  height = '400px',
  markers = [],
  onMarkerClick,
  onMapClick,
  className = '',
  tileLayer = 'osm',
}: OpenStreetMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentMarkers, setCurrentMarkers] = useState<any[]>([]);

  useEffect(() => {
    // Leaflet 스크립트 로드
    const loadLeaflet = () => {
      if (window.L) {
        setIsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    };

    loadLeaflet();
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.L) return;

    try {
      // 타일 레이어 선택
      const getTileLayer = () => {
        switch (tileLayer) {
          case 'satellite':
            return window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
              attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            });
          case 'terrain':
            return window.L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
              attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
            });
          case 'dark':
            return window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
              subdomains: 'abcd',
              maxZoom: 20
            });
          default: // osm
            return window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            });
        }
      };

      // 지도 생성
      const mapInstance = window.L.map(mapRef.current, {
        center: [center.lat, center.lng],
        zoom: zoom,
        zoomControl: false, // 기본 줌 컨트롤 비활성화 (커스텀 컨트롤 사용)
        attributionControl: true,
      });

      // 타일 레이어 추가
      const tileLayerInstance = getTileLayer();
      tileLayerInstance.addTo(mapInstance);

      setMap(mapInstance);

      // 지도 클릭 이벤트
      if (onMapClick) {
        mapInstance.on('click', (e: any) => {
          onMapClick({
            lat: e.latlng.lat,
            lng: e.latlng.lng,
          });
        });
      }

      // 줌 컨트롤 추가 (우측 상단)
      window.L.control.zoom({
        position: 'topright'
      }).addTo(mapInstance);

      // 스케일 바 추가
      window.L.control.scale({
        position: 'bottomleft',
        metric: true,
        imperial: false,
        maxWidth: 200
      }).addTo(mapInstance);

    } catch (error) {
      console.error('OpenStreetMap 초기화 실패:', error);
    }
  }, [isLoaded, center.lat, center.lng, zoom, onMapClick, tileLayer]);

  useEffect(() => {
    if (!map || !window.L) return;

    // 기존 마커 제거
    currentMarkers.forEach(marker => {
      map.removeLayer(marker);
    });

    const newMarkers: any[] = [];

    // 새 마커 추가
    markers.forEach((markerData) => {
      // 커스텀 아이콘 생성
      const customIcon = window.L.divIcon({
        className: 'custom-marker',
        html: markerData.icon || `<div style="
          width: 32px;
          height: 32px;
          background: #3b82f6;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
        ">📍</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      const marker = window.L.marker([markerData.position.lat, markerData.position.lng], {
        icon: customIcon,
        title: markerData.title || '',
      }).addTo(map);

      // 팝업 추가
      if (markerData.popup || markerData.title) {
        const popupContent = markerData.popup || `
          <div style="padding: 10px; min-width: 150px;">
            <h3 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">
              ${markerData.title}
            </h3>
            <p style="margin: 0; font-size: 12px; color: #666;">
              ${markerData.position.lat.toFixed(6)}, ${markerData.position.lng.toFixed(6)}
            </p>
          </div>
        `;
        marker.bindPopup(popupContent);
      }

      // 마커 클릭 이벤트
      if (onMarkerClick) {
        marker.on('click', () => {
          onMarkerClick(markerData.id);
        });
      }

      newMarkers.push(marker);
    });

    setCurrentMarkers(newMarkers);
  }, [map, markers, onMarkerClick]);

  // 지도 중심점 변경
  useEffect(() => {
    if (!map) return;
    
    map.setView([center.lat, center.lng], zoom);
  }, [map, center.lat, center.lng, zoom]);

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
    if (map) {
      map.zoomIn();
    }
    onZoomIn?.();
  };

  const handleZoomOut = () => {
    if (map) {
      map.zoomOut();
    }
    onZoomOut?.();
  };

  const handleReset = () => {
    if (map) {
      map.setView([37.5665, 126.9780], 15);
    }
    onReset?.();
  };

  const handleTileLayerChange = (layer: string) => {
    setCurrentTileLayer(layer);
    onTileLayerChange?.(layer);
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

      {/* 타일 레이어 선택 */}
      <div className="bg-white rounded-lg shadow-lg p-2">
        <div className="text-xs font-semibold text-gray-700 mb-2 text-center">지도 스타일</div>
        <div className="space-y-1">
          {[
            { key: 'osm', label: '일반', icon: '🗺️' },
            { key: 'satellite', label: '위성', icon: '🛰️' },
            { key: 'terrain', label: '지형', icon: '🏔️' },
            { key: 'dark', label: '다크', icon: '🌙' }
          ].map((layer) => (
            <button
              key={layer.key}
              onClick={() => handleTileLayerChange(layer.key)}
              className={`w-full px-2 py-1 text-xs rounded transition-colors ${
                currentTileLayer === layer.key
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-50 text-gray-600'
              }`}
              title={layer.label}
            >
              <span className="mr-1">{layer.icon}</span>
              {layer.label}
            </button>
          ))}
        </div>
      </div>

      {/* 위치 초기화 */}
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

// 주소 검색 컴포넌트 (Nominatim API 사용)
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
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // OpenStreetMap Nominatim API 사용 (무료)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1&countrycodes=kr`
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const results = data.map((item: any) => ({
          address: item.display_name,
          position: {
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          },
        }));
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('주소 검색 중 오류:', error);
      setSearchResults([]);
    } finally {
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
          placeholder="주소를 입력하세요 (예: 서울시청, 강남구)"
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

// 사용 예시 컴포넌트
export function MapExample() {
  const [mapCenter, setMapCenter] = useState({ lat: 37.5665, lng: 126.9780 });
  const [markers, setMarkers] = useState([
    {
      id: '1',
      position: { lat: 37.5665, lng: 126.9780 },
      title: '서울시청',
      popup: '서울특별시청<br/>대한민국의 수도 서울을 대표하는 건물입니다.'
    },
    {
      id: '2',
      position: { lat: 37.5519, lng: 126.9882 },
      title: '명동',
      popup: '명동<br/>서울의 대표적인 쇼핑 거리입니다.'
    }
  ]);

  const handleMapClick = (position: { lat: number; lng: number }) => {
    const newMarker = {
      id: Date.now().toString(),
      position,
      title: `새 위치 (${position.lat.toFixed(4)}, ${position.lng.toFixed(4)})`,
      popup: `클릭한 위치<br/>위도: ${position.lat.toFixed(6)}<br/>경도: ${position.lng.toFixed(6)}`
    };
    setMarkers(prev => [...prev, newMarker]);
  };

  const handleMarkerClick = (markerId: string) => {
    console.log('마커 클릭:', markerId);
  };

  const handleAddressSelect = (address: string, position: { lat: number; lng: number }) => {
    setMapCenter(position);
    const newMarker = {
      id: Date.now().toString(),
      position,
      title: address,
      popup: `${address}<br/>위도: ${position.lat.toFixed(6)}<br/>경도: ${position.lng.toFixed(6)}`
    };
    setMarkers(prev => [...prev, newMarker]);
  };

  return (
    <div className="space-y-4">
      <AddressSearch onAddressSelect={handleAddressSelect} />
      
      <div className="relative">
        <OpenStreetMap
          center={mapCenter}
          zoom={15}
          width="100%"
          height="500px"
          markers={markers}
          onMarkerClick={handleMarkerClick}
          onMapClick={handleMapClick}
          className="rounded-lg border border-gray-200"
        />
        <MapControls 
          map={null} 
          onTileLayerChange={(layer) => console.log('타일 레이어 변경:', layer)}
        />
      </div>
    </div>
  );
}


