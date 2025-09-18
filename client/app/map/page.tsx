'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// 동적 import로 SSR 비활성화 (hydration 오류 방지)
const OpenStreetMap = dynamic(() => import('@/components/OpenStreetMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 flex items-center justify-center">🗺️ 지도 로딩중...</div>
});

const MapControls = dynamic(() => import('@/components/OpenStreetMap').then(mod => ({ default: mod.MapControls })), {
  ssr: false
});

const AddressSearch = dynamic(() => import('@/components/OpenStreetMap').then(mod => ({ default: mod.AddressSearch })), {
  ssr: false
});

interface SwimmingCenter {
  id: string;
  name: string;
  position: { lat: number; lng: number };
  address: string;
  phone: string;
  rating: number;
  courses: string[];
  description: string;
}

export default function MapPage() {
  const [mapCenter, setMapCenter] = useState({ lat: 37.5665, lng: 126.9780 });
  const [selectedCenter, setSelectedCenter] = useState<SwimmingCenter | null>(null);
  const [tileLayer, setTileLayer] = useState<'osm' | 'satellite'>('osm');
  const [mapInstance, setMapInstance] = useState<any>(null);

  // 샘플 수영 센터 데이터
  const swimmingCenters: SwimmingCenter[] = [
    {
      id: '1',
      name: 'JJ Swim Lab 강남점',
      position: { lat: 37.4979, lng: 127.0276 },
      address: '서울특별시 강남구 테헤란로 123',
      phone: '02-1234-5678',
      rating: 4.8,
      courses: ['초급 자유형', '중급 접영', '고급 평영'],
      description: '강남 지역 최고의 수영 교육 센터입니다.'
    },
    {
      id: '2',
      name: 'JJ Swim Lab 홍대점',
      position: { lat: 37.5563, lng: 126.9237 },
      address: '서울특별시 마포구 와우산로 123',
      phone: '02-2345-6789',
      rating: 4.6,
      courses: ['초급 자유형', '중급 접영', '고급 평영', '혼영'],
      description: '홍대 지역의 프리미엄 수영 교육 센터입니다.'
    },
    {
      id: '3',
      name: 'JJ Swim Lab 잠실점',
      position: { lat: 37.5139, lng: 127.1006 },
      address: '서울특별시 송파구 올림픽로 123',
      phone: '02-3456-7890',
      rating: 4.9,
      courses: ['초급 자유형', '중급 접영', '고급 평영', '혼영', '수구'],
      description: '잠실 지역의 대형 수영 교육 센터입니다.'
    },
    {
      id: '4',
      name: 'JJ Swim Lab 분당점',
      position: { lat: 37.3504, lng: 127.1085 },
      address: '경기도 성남시 분당구 정자로 123',
      phone: '031-4567-8901',
      rating: 4.7,
      courses: ['초급 자유형', '중급 접영', '고급 평영', '혼영'],
      description: '분당 지역의 프리미엄 수영 교육 센터입니다.'
    },
    {
      id: '5',
      name: 'JJ Swim Lab 일산점',
      position: { lat: 37.6584, lng: 126.7698 },
      address: '경기도 고양시 일산동구 중앙로 123',
      phone: '031-5678-9012',
      rating: 4.5,
      courses: ['초급 자유형', '중급 접영', '고급 평영'],
      description: '일산 지역의 친근한 수영 교육 센터입니다.'
    }
  ];

  const handleAddressSelect = (position: { lat: number; lng: number }) => {
    setMapCenter(position);
    setSelectedCenter(null);
  };

  const handleMarkerClick = (markerId: string) => {
    const center = swimmingCenters.find(c => c.id === markerId);
    if (center) {
      setSelectedCenter(center);
      setMapCenter(center.position);
    }
  };

  const handleTileLayerChange = (layer: 'osm' | 'satellite') => {
    setTileLayer(layer);
  };

  const getTileLayerName = (layer: string) => {
    switch (layer) {
      case 'osm': return '일반지도';
      case 'satellite': return '위성지도';
      default: return '일반지도';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="w-full px-2 sm:px-4 lg:px-6 py-4">
        {/* Page Header - 축소 */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">수영 센터 찾기</h1>
          <p className="text-sm text-gray-600">가까운 JJ Swim Lab 센터를 찾아보세요</p>
        </div>

        {/* Address Search - 축소 */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h3 className="text-base font-semibold text-gray-900 mb-2">주소 검색</h3>
          <AddressSearch onAddressSelect={handleAddressSelect} />
        </div>

        {/* Map Container */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map - 더 넓게 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">지도</h3>
                <div className="text-sm text-gray-500">
                  현재: {getTileLayerName(tileLayer)}
                </div>
              </div>
              
              <div className="relative w-full" style={{ height: '80vh', minHeight: '600px' }}>
                <OpenStreetMap
                  center={mapCenter}
                  zoom={13}
                  width="100%"
                  height="100%"
                  markers={swimmingCenters.map(center => ({
                    id: center.id,
                    position: center.position,
                    title: center.name,
                    popup: `
                      <div style="padding: 15px; min-width: 250px;">
                        <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: #1f2937;">
                          ${center.name}
                        </h3>
                        <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">
                          ${center.address}
                        </p>
                        <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">
                          📞 ${center.phone}
                        </p>
                        <div style="margin: 0 0 8px 0;">
                          <span style="color: #f59e0b; font-weight: bold;">⭐ ${center.rating}</span>
                        </div>
                        <p style="margin: 0; font-size: 13px; color: #374151;">
                          ${center.description}
                        </p>
                      </div>
                    `
                  }))}
                  onMarkerClick={handleMarkerClick}
                  onMapClick={() => setSelectedCenter(null)}
                  className="rounded-lg border border-gray-200 w-full h-full"
                  tileLayer={tileLayer}
                  onMapReady={setMapInstance}
                />
                
                <MapControls 
                  map={mapInstance}
                  onTileLayerChange={handleTileLayerChange}
                />
              </div>
            </div>
          </div>

          {/* Sidebar - 컴팩트 */}
          <div className="space-y-4">
            {/* Selected Center Info */}
            {selectedCenter && (
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-base font-semibold text-gray-900 mb-3">선택된 센터</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">{selectedCenter.name}</h4>
                    <p className="text-gray-600 text-sm">{selectedCenter.address}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-500 text-lg">⭐</span>
                    <span className="font-semibold text-gray-900">{selectedCenter.rating}</span>
                    <span className="text-gray-500 text-sm">/ 5.0</span>
                  </div>
                  
                  <div>
                    <p className="text-gray-600 text-sm mb-2">📞 {selectedCenter.phone}</p>
                    <p className="text-gray-700">{selectedCenter.description}</p>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">개설 과정</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedCenter.courses.map((course, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                    상세 정보 보기
                  </button>
                </div>
              </div>
            )}

            {/* All Centers List */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">모든 센터</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                {swimmingCenters.map((center) => (
                  <div 
                    key={center.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedCenter?.id === center.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedCenter(center);
                      setMapCenter(center.position);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">
                          {center.name}
                        </h4>
                        <p className="text-gray-600 text-xs mb-2">{center.address}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-yellow-500 text-sm">⭐</span>
                          <span className="text-gray-700 text-xs font-semibold">{center.rating}</span>
                          <span className="text-gray-500 text-xs">/ 5.0</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">
                          {center.courses.length}개 과정
                        </div>
                        <div className="text-xs text-blue-600 font-semibold">
                          {center.courses[0]}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Controls Info */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">지도 사용법</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600">🗺️</span>
                  <span>지도를 클릭하여 센터 정보를 확인하세요</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">📍</span>
                  <span>마커를 클릭하여 상세 정보를 보세요</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-purple-600">🔍</span>
                  <span>주소 검색으로 원하는 지역을 찾으세요</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-orange-600">⚙️</span>
                  <span>좌측 컨트롤로 지도 스타일을 변경하세요</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


