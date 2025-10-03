/**
 * 🗺️ JJ Swim Lab - 수영 센터 찾기 지도 (VWorld + Leaflet)
 * 
 * 📋 **페이지 목적**
 * - VWorld WMTS 타일 기반 국내 무료 지도
 * - 전국 JJ Swim Lab 센터 위치 표시
 * - 주소 검색 및 센터 정보 확인
 * - 모든 사용자 접근 가능
 */

'use client';

import { useState, useEffect, useRef } from 'react';

// 동적 import로 SSR 문제 방지
let L: any;

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
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [selectedCenter, setSelectedCenter] = useState<SwimmingCenter | null>(null);
  const [searchAddress, setSearchAddress] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);

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

  // Leaflet 라이브러리 로딩
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        // Leaflet 동적 로딩
        if (typeof window !== 'undefined') {
          L = (await import('leaflet')).default;

          // Leaflet CSS 로딩
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);

          console.log('✅ Leaflet 라이브러리 로딩 완료');
        }
      } catch (error) {
        console.error('❌ Leaflet 로딩 오류:', error);
      }
    };

    loadLeaflet();
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!mapRef.current || !L || mapInstanceRef.current) return;

    const VWORLD_KEY = process.env.NEXT_PUBLIC_VWORLD_KEY || 'demo_key';

    // 지도 생성
    const map = L.map(mapRef.current).setView([37.5665, 126.9780], 11);

    // VWorld WMTS 타일 레이어 추가
    L.tileLayer(
      `https://api.vworld.kr/req/wmts/1.0.0/${VWORLD_KEY}/Base/{z}/{y}/{x}.png`,
      {
        attribution: '© VWorld / NGII',
        maxZoom: 19,
        tileSize: 256
      }
    ).addTo(map);

    mapInstanceRef.current = map;
    setMapReady(true);

    console.log('🗺️ VWorld + Leaflet 지도 초기화 완료');

    // 센터 마커 추가
    swimmingCenters.forEach(center => {
      // 커스텀 아이콘
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 40px;
            height: 40px;
            background-color: #3b82f6;
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
          ">
            🏊
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      // 마커 생성
      const marker = L.marker([center.position.lat, center.position.lng], {
        icon: customIcon
      }).addTo(map);

      // 팝업 추가
      marker.bindPopup(`
        <div style="padding: 12px; min-width: 250px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #1f2937;">
            ${center.name}
          </h3>
          <p style="margin: 0 0 6px 0; font-size: 13px; color: #6b7280;">
            ${center.address}
          </p>
          <p style="margin: 0 0 6px 0; font-size: 13px; color: #6b7280;">
            📞 ${center.phone}
          </p>
          <div style="margin: 0 0 6px 0;">
            <span style="color: #f59e0b; font-weight: bold;">⭐ ${center.rating}</span>
          </div>
          <p style="margin: 0; font-size: 12px; color: #374151;">
            ${center.description}
          </p>
        </div>
      `);

      // 마커 클릭 이벤트
      marker.on('click', () => {
        setSelectedCenter(center);
      });

      markersRef.current.push(marker);
    });

    // 정리 함수
    return () => {
      if (map) {
        map.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [L, swimmingCenters]);

  // 주소 검색
  const handleSearch = async () => {
    if (!searchAddress.trim()) {
      alert('주소를 입력하세요.');
      return;
    }

    setSearchLoading(true);
    try {
      const key = process.env.NEXT_PUBLIC_VWORLD_KEY;

      const url = new URL('https://api.vworld.kr/req/address');
      url.searchParams.set('service', 'address');
      url.searchParams.set('request', 'getCoord');
      url.searchParams.set('version', '2.0');
      url.searchParams.set('crs', 'EPSG:4326');
      url.searchParams.set('type', 'ROAD');
      url.searchParams.set('format', 'json');
      url.searchParams.set('key', key!);
      url.searchParams.set('address', searchAddress);

      const response = await fetch(url.toString());
      const data = await response.json();

      const point = data?.response?.result?.point;

      if (!point) {
        alert('주소를 찾을 수 없습니다. 다시 시도해주세요.');
        return;
      }

      const lng = Number(point.x);
      const lat = Number(point.y);

      // 지도 이동
      if (mapInstanceRef.current && L) {
        mapInstanceRef.current.flyTo([lat, lng], 15, {
          duration: 1.5
        });

        // 검색 위치에 임시 마커 추가
        const searchIcon = L.divIcon({
          className: 'search-marker',
          html: `
            <div style="
              width: 30px;
              height: 30px;
              background-color: #ef4444;
              border: 2px solid white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">
              📍
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const searchMarker = L.marker([lat, lng], { icon: searchIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div style="padding: 10px;">
              <strong>검색 위치</strong><br/>
              ${searchAddress}
            </div>
          `)
          .openPopup();

        // 5초 후 제거
        setTimeout(() => {
          mapInstanceRef.current?.removeLayer(searchMarker);
        }, 5000);
      }

      console.log(`✅ 주소 검색 성공: ${searchAddress} → (${lng}, ${lat})`);
    } catch (error) {
      console.error('❌ 주소 검색 오류:', error);
      alert('주소 검색 중 오류가 발생했습니다.');
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="w-full px-2 sm:px-4 lg:px-6 py-4">
        {/* 헤더 */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">🗺️ 수영 센터 찾기</h1>
          <p className="text-sm text-gray-600">가까운 JJ Swim Lab 센터를 찾아보세요 (VWorld 무료 지도)</p>
        </div>

        {/* 주소 검색 */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h3 className="text-base font-semibold text-gray-900 mb-2">주소 검색</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="예: 서울특별시 강남구 테헤란로"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={searchLoading || !mapReady}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {searchLoading ? '검색 중...' : '🔍 검색'}
            </button>
          </div>
        </div>

        {/* 지도 및 사이드바 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 지도 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">지도</h3>
                <div className="text-sm text-gray-500">
                  VWorld 배경 지도
                </div>
              </div>

              <div
                ref={mapRef}
                className="w-full rounded-lg border border-gray-200"
                style={{ height: '80vh', minHeight: '600px' }}
              />
            </div>
          </div>

          {/* 사이드바 */}
          <div className="space-y-4">
            {/* 선택된 센터 정보 */}
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
                    <p className="text-gray-700 text-sm">{selectedCenter.description}</p>
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

                  <button 
                    onClick={() => {
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.flyTo(
                          [selectedCenter.position.lat, selectedCenter.position.lng],
                          15,
                          { duration: 1.5 }
                        );
                      }
                    }}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    지도에서 보기
                  </button>
                </div>
              </div>
            )}

            {/* 모든 센터 목록 */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                모든 센터 ({swimmingCenters.length})
              </h3>
              <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                {swimmingCenters.map((center) => (
                  <div
                    key={center.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedCenter?.id === center.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    onClick={() => {
                      setSelectedCenter(center);
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.flyTo(
                          [center.position.lat, center.position.lng],
                          15,
                          { duration: 1 }
                        );
                      }
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

            {/* 지도 사용법 */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">지도 사용법</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600">🗺️</span>
                  <span>VWorld 국내 무료 지도 서비스</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">📍</span>
                  <span>마커를 클릭하여 센터 정보 확인</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-purple-600">🔍</span>
                  <span>주소 검색으로 원하는 지역 찾기</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-orange-600">🏊</span>
                  <span>마우스 드래그로 지도 이동</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-red-600">🔎</span>
                  <span>마우스 휠로 확대/축소</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
