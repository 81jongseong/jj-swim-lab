'use client';

import { useState, useEffect } from 'react';
import { Card, LoadingSpinner, Badge } from '../components/ui';
import apiClient from '../utils/api';

interface SwimmingCenter {
  _id: string;
  name: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  phone: string;
  facilities: {
    lanes: number;
    poolLength: number;
    poolDepth: number;
    temperature: number;
  };
  operatingHours: any;
  pricing: {
    freeSwim: {
      adult: number;
      child: number;
      student: number;
    };
  };
  currentCapacity: number;
  maxCapacity: number;
  images: Array<{ url: string; caption: string }>;
}

export default function CentersPage() {
  const [centers, setCenters] = useState<SwimmingCenter[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<SwimmingCenter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    // 사용자 위치 가져오기
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.log('위치 정보를 가져올 수 없습니다:', error);
        }
      );
    }

    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      setIsLoading(true);
      const params = userLocation 
        ? `?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&radius=10`
        : '';
      
      const response = await apiClient.get(`/centers${params}`);
      
      if (response.data) {
        setCenters(response.data);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      setError('수영장 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const getOccupancyRate = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  const getOccupancyColor = (rate: number) => {
    if (rate < 30) return 'success';
    if (rate < 70) return 'warning';
    return 'error';
  };

  const getOccupancyText = (rate: number) => {
    if (rate < 30) return '여유';
    if (rate < 70) return '보통';
    return '혼잡';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto" />
          <p className="mt-4 text-gray-600">수영장 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchCenters}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏊‍♂️ 수영장 찾기</h1>
          <p className="text-gray-600">근처의 수영장을 찾아보세요</p>
        </div>

        {/* 지도 플레이스홀더 */}
        <div className="mb-8">
          <Card className="h-96 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-dashed border-blue-300">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-4">🗺️</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">지도</h3>
                <p className="text-gray-600">여기에 실제 지도가 표시됩니다</p>
                <p className="text-sm text-gray-500 mt-2">(Google Maps API 연동 예정)</p>
              </div>
            </div>
          </Card>
        </div>

        {/* 수영장 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {centers.map((center) => {
            const occupancyRate = getOccupancyRate(center.currentCapacity, center.maxCapacity);
            const occupancyColor = getOccupancyColor(occupancyRate);
            const occupancyText = getOccupancyText(occupancyRate);

            return (
              <Card key={center._id} className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedCenter(center)}>
                <div className="p-6">
                  {/* 수영장 이미지 플레이스홀더 */}
                  <div className="w-full h-48 bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg mb-4 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🏊‍♂️</div>
                      <p className="text-sm text-blue-700">수영장 사진</p>
                    </div>
                  </div>

                  {/* 수영장 정보 */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{center.name}</h3>
                      <p className="text-gray-600 text-sm">{center.address}</p>
                    </div>

                    {/* 시설 정보 */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-500">레인:</span>
                        <span className="font-medium">{center.facilities.lanes}개</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-500">수온:</span>
                        <span className="font-medium">{center.facilities.temperature}°C</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-500">길이:</span>
                        <span className="font-medium">{center.facilities.poolLength}m</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-500">깊이:</span>
                        <span className="font-medium">{center.facilities.poolDepth}m</span>
                      </div>
                    </div>

                    {/* 요금 정보 */}
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">자유수영 요금</span>
                        <span className="text-sm font-medium">₩{center.pricing.freeSwim.adult?.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* 입장 인원 */}
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">현재 입장 인원</span>
                        <Badge variant={occupancyColor} size="sm">
                          {occupancyText} ({center.currentCapacity}/{center.maxCapacity})
                        </Badge>
                      </div>
                    </div>

                    {/* 연락처 */}
                    <div className="border-t pt-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-gray-500">📞</span>
                        <span className="text-gray-700">{center.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* 수영장이 없을 때 */}
        {centers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🏊‍♂️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">근처에 수영장이 없습니다</h3>
            <p className="text-gray-600">다른 지역을 검색해보세요</p>
          </div>
        )}
      </div>

      {/* 수영장 상세 모달 */}
      {selectedCenter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{selectedCenter.name}</h2>
              <button 
                onClick={() => setSelectedCenter(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* 기본 정보 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">📍 기본 정보</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">주소:</span>
                    <span>{selectedCenter.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">전화:</span>
                    <span>{selectedCenter.phone}</span>
                  </div>
                </div>
              </div>

              {/* 시설 정보 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">🏊‍♂️ 시설 정보</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">레인 수:</span>
                    <span>{selectedCenter.facilities.lanes}개</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">수영장 길이:</span>
                    <span>{selectedCenter.facilities.poolLength}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">수영장 깊이:</span>
                    <span>{selectedCenter.facilities.poolDepth}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">수온:</span>
                    <span>{selectedCenter.facilities.temperature}°C</span>
                  </div>
                </div>
              </div>

              {/* 요금 정보 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">💰 요금 정보</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">성인:</span>
                    <span>₩{selectedCenter.pricing.freeSwim.adult?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">어린이:</span>
                    <span>₩{selectedCenter.pricing.freeSwim.child?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">학생:</span>
                    <span>₩{selectedCenter.pricing.freeSwim.student?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 운영 시간 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">🕒 운영 시간</h3>
                <div className="space-y-1 text-sm">
                  {Object.entries(selectedCenter.operatingHours).map(([day, hours]: [string, any]) => (
                    <div key={day} className="flex justify-between">
                      <span className="text-gray-600 capitalize">{day}:</span>
                      <span>{hours.isOpen ? `${hours.open} - ${hours.close}` : '휴무'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 현재 상황 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">👥 현재 상황</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">입장 인원:</span>
                    <Badge variant={getOccupancyColor(getOccupancyRate(selectedCenter.currentCapacity, selectedCenter.maxCapacity))}>
                      {selectedCenter.currentCapacity}/{selectedCenter.maxCapacity}
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getOccupancyRate(selectedCenter.currentCapacity, selectedCenter.maxCapacity)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button 
                onClick={() => setSelectedCenter(null)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                닫기
              </button>
              <button 
                className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-700"
              >
                예약하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 