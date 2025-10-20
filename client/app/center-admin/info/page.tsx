/**
 * 🏢 JJ Swim Lab - 센터 정보 관리 페이지 (센터 관리자용)
 *
 * 📋 **페이지 목적**
 * - 센터 관리자가 센터의 기본 정보, 시설 정보, 운영 시간 등을 관리
 * - 센터 가입 페이지와 동일한 UI/UX 제공
 * 
 * 🔄 **주요 기능**
 * - 센터 기본 정보 관리 (이름, 주소, 연락처)
 * - 수영장 정보 관리 (메인풀, 유아풀, 엔드리스풀)
 * - 시설 정보 관리 (샤워실, 락커룸, 사우나, 체온유지탕 등)
 * - 운영시간 설정
 * 
 * 🗄️ **데이터 연동**
 * - SwimmingCenter 모델과 연동
 * - 센터 정보 관리 API
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import withAuth from '../../../components/withAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, LoadingSpinner } from '../../../components/ui';
import { Button } from '../../../components/Button';
import { 
  Building, 
  Edit,
  Save, 
  X,
  Plus,
  Trash2,
  Waves,
  Clock
} from 'lucide-react';

// 수영장 정보 인터페이스
interface PoolInfo {
  id: string;
  type: 'main' | 'auxiliary' | 'kids' | 'endless' | 'warmup' | 'children';
  length: number;
  width: number;
  depth: number;
  laneCount?: number;
  temperature?: number;
  description?: string;
}

// 시설 상세 정보 인터페이스
interface FacilityDetail {
  name: string;
  enabled: boolean;
  details?: {
    count?: number;
    type?: string;
    description?: string;
  };
}

// 시설 기본 템플릿
const FACILITY_TEMPLATES: FacilityDetail[] = [
  { 
    name: '샤워실', 
    enabled: false, 
    details: { type: '남/여 구분', description: '' } 
  },
  { 
    name: '락커룸', 
    enabled: false, 
    details: { type: '남/여 분리', description: '' } 
  },
  { 
    name: '사우나', 
    enabled: false, 
    details: { type: '남/여 분리', description: '' } 
  },
  { 
    name: '탈수기', 
    enabled: false, 
    details: { type: '남/여 구분', description: '' } 
  },
  { 
    name: '수영용품 판매점', 
    enabled: false, 
    details: { description: '' } 
  },
  { 
    name: '황토방', 
    enabled: false, 
    details: { type: '남/여 분리', description: '' } 
  },
  { 
    name: '체온조절실', 
    enabled: false, 
    details: { type: '남/여 분리', description: '' } 
  },
  { 
    name: '체온유지탕(월풀)', 
    enabled: false, 
    details: { type: '남/여 분리', description: '' } 
  },
  { 
    name: '카페/휴게실', 
    enabled: false, 
    details: { description: '' } 
  },
  { 
    name: '키즈존', 
    enabled: false, 
    details: { description: '' } 
  },
  { 
    name: 'PT룸', 
    enabled: false, 
    details: { count: 0, description: '' } 
  },
  { 
    name: '수중 음향시스템', 
    enabled: false, 
    details: { description: '' } 
  },
  { 
    name: 'CCTV', 
    enabled: false, 
    details: { count: 0, description: '' } 
  },
  { 
    name: '자동 제세동기(AED)', 
    enabled: false, 
    details: { count: 0 } 
  },
  { 
    name: '응급처치실', 
    enabled: false, 
    details: { description: '' } 
  },
];

function CenterInfoManagementPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // 센터 정보
  const [centerName, setCenterName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  
  // 수영장 정보
  const [pools, setPools] = useState<PoolInfo[]>([]);
  
  // 시설 정보
  const [facilities, setFacilities] = useState<FacilityDetail[]>(
    JSON.parse(JSON.stringify(FACILITY_TEMPLATES))
  );
  
  // 운영 정보
  const [weekdaysOpen, setWeekdaysOpen] = useState('06:00');
  const [weekdaysClose, setWeekdaysClose] = useState('22:00');
  const [weekendsOpen, setWeekendsOpen] = useState('08:00');
  const [weekendsClose, setWeekendsClose] = useState('20:00');
  const [parkingAvailable, setParkingAvailable] = useState(false);
  const [parkingSpaces, setParkingSpaces] = useState(0);
  
  const [centerId, setCenterId] = useState('');

  // 권한 확인
  useEffect(() => {
    if (user && user.userType !== 'centerAdmin' && user.userType !== 'superAdmin') {
      alert('센터 관리자만 접근할 수 있습니다.');
      window.location.href = '/dashboard';
    }
  }, [user]);

  // 센터 정보 로드
  const loadCenterInfo = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      console.log('🔍 센터 정보 로드 시작');
      console.log('  - 토큰:', token ? '있음' : '없음');
      console.log('  - 유저:', userStr ? JSON.parse(userStr) : '없음');
      
      if (!token) {
        console.error('❌ 인증 토큰이 없습니다.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/centers/my-center', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const centerData = data.data;
          console.log('✅ 센터 정보 로드 완료:', centerData);
          
          // 기본 정보
          setCenterId(centerData._id);
          setCenterName(centerData.name || '');
          setAddress(centerData.address || '');
          setCity(centerData.city || '');
          setProvince(centerData.province || '');
          setEmail(centerData.email || '');
          setPhone(centerData.phone || '');
          setDescription(centerData.description || '');
          
          // 수영장 정보 로드
          if (centerData.facilities) {
            const loadedPools: PoolInfo[] = [];
            
            // 메인풀
            if (centerData.facilities.mainPool && centerData.facilities.mainPool.poolLength > 0) {
              loadedPools.push({
                id: 'main',
                type: 'main',
                length: centerData.facilities.mainPool.poolLength || 0,
                width: centerData.facilities.mainPool.poolWidth || 0,
                depth: centerData.facilities.mainPool.poolDepth || 0,
                laneCount: centerData.facilities.mainPool.lanes || 0,
                temperature: centerData.facilities.mainPool.temperature || 0,
                description: '메인 수영장'
              });
            }
            
            // 유아풀
            if (centerData.facilities.kidsPool && centerData.facilities.kidsPool.hasKidsPool) {
              loadedPools.push({
                id: 'kids',
                type: 'kids',
                length: centerData.facilities.kidsPool.kidsPoolLength || 0,
                width: 0,
                depth: centerData.facilities.kidsPool.kidsPoolDepth || 0,
                laneCount: centerData.facilities.kidsPool.kidsPoolLanes || 0,
                temperature: centerData.facilities.kidsPool.kidsPoolTemperature || 0,
                description: '유아 수영장'
              });
            }
            
            // 엔드리스풀
            if (centerData.facilities.endlessPool && centerData.facilities.endlessPool.hasEndlessPool) {
              loadedPools.push({
                id: 'endless',
                type: 'endless',
                length: centerData.facilities.endlessPool.endlessPoolLength || 0,
                width: centerData.facilities.endlessPool.endlessPoolWidth || 0,
                depth: 0,
                laneCount: centerData.facilities.endlessPool.endlessPoolCount || 0,
                description: '엔드리스 풀'
              });
            }
            
            if (loadedPools.length === 0) {
              // 기본 메인풀 추가
              loadedPools.push({
                id: 'main',
                type: 'main',
                length: 25,
                width: 12,
                depth: 1.2,
                laneCount: 6,
                description: '메인 수영장'
              });
            }
            
            setPools(loadedPools);
          }
          
          // 시설 정보 로드
          if (centerData.facilities && centerData.facilities.amenities) {
            const amenities = centerData.facilities.amenities;
            let detailedFacilities: any = {};
            
            try {
              if (amenities.additionalFacilities) {
                detailedFacilities = JSON.parse(amenities.additionalFacilities);
              }
            } catch (e) {
              console.log('시설 정보 파싱 오류:', e);
            }
            
            const facilityArray: FacilityDetail[] = JSON.parse(JSON.stringify(FACILITY_TEMPLATES));
            
            // 기본 시설 매핑
            facilityArray.forEach(f => {
              if (f.name === '샤워실' && (amenities.hasShower || detailedFacilities['샤워실'])) {
                f.enabled = true;
                if (detailedFacilities['샤워실']) {
                  f.details = detailedFacilities['샤워실'];
                }
              }
              if (f.name === '락커룸' && (amenities.hasLocker || detailedFacilities['락커룸'])) {
                f.enabled = true;
                if (detailedFacilities['락커룸']) {
                  f.details = detailedFacilities['락커룸'];
                }
              }
              if (f.name === '사우나' && (amenities.hasSauna || detailedFacilities['사우나'])) {
                f.enabled = true;
                if (detailedFacilities['사우나']) {
                  f.details = detailedFacilities['사우나'];
                }
              }
              if (f.name === '체온유지탕(월풀)' && (amenities.hasJacuzzi || detailedFacilities['체온유지탕(월풀)'])) {
                f.enabled = true;
                if (detailedFacilities['체온유지탕(월풀)']) {
                  f.details = detailedFacilities['체온유지탕(월풀)'];
                }
              }
              if (f.name === 'CCTV' && detailedFacilities['CCTV']) {
                f.enabled = true;
                f.details = detailedFacilities['CCTV'];
              }
              if (f.name === '응급처치실' && detailedFacilities['응급처치실']) {
                f.enabled = true;
                f.details = detailedFacilities['응급처치실'];
              }
            });
            
            // 커스텀 시설 추가
            Object.keys(detailedFacilities).forEach(key => {
              if (!['샤워실', '락커룸', '사우나', '체온유지탕(월풀)', 'CCTV', '응급처치실'].includes(key)) {
                facilityArray.push({
                  name: key,
                  enabled: true,
                  details: detailedFacilities[key]
                });
              }
            });
            
            setFacilities(facilityArray);
          }
          
          // 운영 시간 로드
          if (centerData.operatingHours || centerData.businessHours) {
            const hours = centerData.operatingHours || centerData.businessHours;
            if (hours.monday) {
              setWeekdaysOpen(hours.monday.open || '06:00');
              setWeekdaysClose(hours.monday.close || '22:00');
            }
            if (hours.saturday) {
              setWeekendsOpen(hours.saturday.open || '08:00');
              setWeekendsClose(hours.saturday.close || '20:00');
            }
          }
          
          // 주차 정보
          if (centerData.facilities && centerData.facilities.amenities) {
            setParkingAvailable(centerData.facilities.amenities.hasParking || false);
            setParkingSpaces(centerData.facilities.amenities.parkingSpaces || 0);
          }
        } else {
          console.error('센터 정보 로드 실패:', data.message);
        }
      } else {
        console.error('센터 정보 로드 실패:', response.status);
      }
    } catch (error) {
      console.error('센터 정보 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && ['centerAdmin', 'superAdmin'].includes(user.userType)) {
      loadCenterInfo();
    }
  }, [user]);

  // 시설 토글
  const toggleFacility = (index: number) => {
    setFacilities(prev => prev.map((f, i) => 
      i === index ? { ...f, enabled: !f.enabled } : f
    ));
  };

  // 시설 상세 정보 업데이트
  const updateFacilityDetail = (index: number, field: string, value: any) => {
    setFacilities(prev => prev.map((f, i) => 
      i === index 
        ? { ...f, details: { ...f.details, [field]: value } } 
        : f
    ));
  };

  // 커스텀 시설 추가
  const addCustomFacility = () => {
    const newFacility: FacilityDetail = {
      name: '',
      enabled: true,
      details: { description: '' }
    };
    setFacilities(prev => [...prev, newFacility]);
  };

  // 커스텀 시설 삭제
  const removeCustomFacility = (index: number) => {
    setFacilities(prev => prev.filter((_, i) => i !== index));
  };

  // 커스텀 시설 이름 업데이트
  const updateFacilityName = (index: number, name: string) => {
    setFacilities(prev => prev.map((f, i) => 
      i === index ? { ...f, name } : f
    ));
  };

  // 수영장 추가
  const addPool = (type: 'main' | 'kids' | 'endless') => {
    const newPool: PoolInfo = {
      id: `${type}-${Date.now()}`,
      type,
      length: type === 'kids' ? 12 : type === 'endless' ? 5 : 25,
      width: type === 'endless' ? 2.5 : 12,
      depth: type === 'kids' ? 0.6 : 1.2,
      laneCount: type === 'kids' ? 4 : type === 'endless' ? 1 : 6,
      description: type === 'kids' ? '유아 수영장' : type === 'endless' ? '엔드리스 풀' : '메인 수영장'
    };
    setPools(prev => [...prev, newPool]);
  };

  // 수영장 삭제
  const removePool = (id: string) => {
    setPools(prev => prev.filter(p => p.id !== id));
  };

  // 수영장 정보 업데이트
  const updatePool = (id: string, field: keyof PoolInfo, value: any) => {
    setPools(prev => prev.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  // 저장
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('인증 토큰이 없습니다.');
        return;
      }

      // 시설 정보 변환
      const facilityDetails: {[key: string]: any} = {};
      facilities.filter(f => f.enabled).forEach(f => {
        facilityDetails[f.name] = f.details || {};
      });

      // 수영장 정보 변환
      const mainPool = pools.find(p => p.type === 'main');
      const kidsPool = pools.find(p => p.type === 'kids');
      const endlessPool = pools.find(p => p.type === 'endless');

      const dataToSave = {
        name: centerName,
        address,
        city,
        province,
        email,
        phone,
        description,
        facilities: {
          availablePoolLengths: pools.map(p => p.length),
          mainPool: mainPool ? {
            lanes: mainPool.laneCount || 0,
            poolLength: mainPool.length || 0,
            poolWidth: mainPool.width || 0,
            poolDepth: mainPool.depth || 0,
            temperature: mainPool.temperature || 0
          } : undefined,
          kidsPool: kidsPool ? {
            hasKidsPool: true,
            kidsPoolLanes: kidsPool.laneCount || 0,
            kidsPoolLength: kidsPool.length || 0,
            kidsPoolDepth: kidsPool.depth || 0,
            kidsPoolTemperature: kidsPool.temperature || 0
          } : { hasKidsPool: false },
          endlessPool: endlessPool ? {
            hasEndlessPool: true,
            endlessPoolCount: endlessPool.laneCount || 1,
            endlessPoolLength: endlessPool.length || 0,
            endlessPoolWidth: endlessPool.width || 0
          } : { hasEndlessPool: false },
          amenities: {
            additionalFacilities: JSON.stringify(facilityDetails),
            hasShower: facilities.some(f => f.name === '샤워실' && f.enabled),
            hasLocker: facilities.some(f => f.name === '락커룸' && f.enabled),
            hasSauna: facilities.some(f => f.name === '사우나' && f.enabled),
            hasJacuzzi: facilities.some(f => f.name === '체온유지탕(월풀)' && f.enabled),
            hasParking: parkingAvailable,
            parkingSpaces: parkingSpaces
          }
        },
        operatingHours: {
          monday: { open: weekdaysOpen, close: weekdaysClose, isOpen: true },
          tuesday: { open: weekdaysOpen, close: weekdaysClose, isOpen: true },
          wednesday: { open: weekdaysOpen, close: weekdaysClose, isOpen: true },
          thursday: { open: weekdaysOpen, close: weekdaysClose, isOpen: true },
          friday: { open: weekdaysOpen, close: weekdaysClose, isOpen: true },
          saturday: { open: weekendsOpen, close: weekendsClose, isOpen: true },
          sunday: { open: weekendsOpen, close: weekendsClose, isOpen: true }
        }
      };

      const response = await fetch('http://localhost:5000/api/centers/my-center', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSave)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('✅ 센터 정보가 성공적으로 저장되었습니다!');
          setIsEditing(false);
          loadCenterInfo(); // 새로고침
        } else {
          alert(`❌ 저장 실패: ${data.message}`);
        }
      } else {
        alert('❌ 저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('센터 정보 저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!centerId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <div className="p-6 text-center">
            <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              센터 정보를 찾을 수 없습니다
            </h3>
            <p className="text-gray-500 mb-4">
              새로운 센터 정보를 생성하시겠습니까?
            </p>
            <Button onClick={loadCenterInfo} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              다시 시도
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🏢 센터 정보 관리
            </h1>
            <p className="text-gray-600">
              센터의 기본 정보, 시설, 운영시간 등을 관리하세요
            </p>
          </div>
          <div className="flex space-x-3">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                편집하기
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    loadCenterInfo(); // 취소 시 데이터 다시 로드
                  }}
                  variant="secondary"
                >
                  <X className="h-4 w-4 mr-2" />
                  취소
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700"
                >
                      <Save className="h-4 w-4 mr-2" />
                  {isSaving ? '저장 중...' : '저장'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

        {/* 기본 정보 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2" />
            기본 정보
          </CardTitle>
          <CardDescription>센터의 기본 정보를 관리합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                센터 이름 *
                </label>
                  <input
                    type="text"
                value={centerName}
                onChange={(e) => setCenterName(e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="JJ Swim Lab"
              />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                연락처 *
                </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="010-1234-5678"
              />
            </div>
              </div>

          <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                이메일
                </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="info@jjswim.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                시/도
              </label>
                  <input
                    type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="서울특별시"
              />
                  </div>
              </div>

          <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                시/구/군
                  </label>
                    <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="강남구"
              />
                    </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                상세 주소 *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="테헤란로 123"
              />
            </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
              센터 소개
                  </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!isEditing}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="센터에 대한 간단한 소개를 입력하세요"
            />
          </div>
        </CardContent>
      </Card>

      {/* 수영장 정보 */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <Waves className="h-5 w-5 mr-2" />
                수영장 정보
              </CardTitle>
              <CardDescription>센터의 수영장 정보를 관리합니다</CardDescription>
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Button
                  onClick={() => addPool('main')}
                  variant="secondary"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  메인풀
                </Button>
                <Button
                  onClick={() => addPool('kids')}
                  variant="secondary"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  유아풀
                </Button>
                <Button
                  onClick={() => addPool('endless')}
                  variant="secondary"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  엔드리스풀
                </Button>
                    </div>
                  )}
                </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {pools.map((pool, index) => (
            <div key={pool.id} className="p-4 border-2 border-gray-200 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-gray-900">
                  {pool.type === 'main' ? '🏊 메인 수영장' : 
                   pool.type === 'kids' ? '👶 유아 수영장' : 
                   '🌀 엔드리스 풀'}
                </h4>
                {isEditing && pools.length > 1 && (
                  <Button
                    onClick={() => removePool(pool.id)}
                    variant="danger"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    삭제
                  </Button>
                )}
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">길이 (m)</label>
                  <input
                    type="number"
                    value={pool.length || 0}
                    onChange={(e) => updatePool(pool.id, 'length', Number(e.target.value))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                    placeholder="25"
                    min="0"
                    step="0.1"
                  />
            </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">폭 (m)</label>
                  <input
                    type="number"
                    value={pool.width || 0}
                    onChange={(e) => updatePool(pool.id, 'width', Number(e.target.value))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                    placeholder="12"
                    min="0"
                    step="0.1"
                  />
          </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">수심 (m)</label>
                  <input
                    type="number"
                    value={pool.depth || 0}
                    onChange={(e) => updatePool(pool.id, 'depth', Number(e.target.value))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                    placeholder="1.2"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">레인 수</label>
                  <input
                    type="number"
                    value={pool.laneCount || 0}
                    onChange={(e) => updatePool(pool.id, 'laneCount', Number(e.target.value))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                    placeholder="6"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">수온 (°C)</label>
                  <input
                    type="number"
                    value={pool.temperature || 0}
                    onChange={(e) => updatePool(pool.id, 'temperature', Number(e.target.value))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                    placeholder="28"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">설명</label>
                    <input
                      type="text"
                  value={pool.description || ''}
                  onChange={(e) => updatePool(pool.id, 'description', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                  placeholder="수영장 설명"
                />
                </div>
            </div>
          ))}
        </CardContent>
        </Card>

      {/* 보유 시설 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🏪 보유 시설</CardTitle>
          <CardDescription>센터의 시설 정보를 상세히 입력해주세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {facilities.map((facility, index) => (
            <div key={index} className="p-4 border-2 border-gray-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={facility.enabled}
                    onChange={() => isEditing && toggleFacility(index)}
                    disabled={!isEditing}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3 disabled:bg-gray-100"
                  />
                  {facility.name ? (
                    <span className="text-sm font-medium text-gray-900">{facility.name}</span>
                  ) : (
                    <input
                      type="text"
                      value={facility.name}
                      onChange={(e) => updateFacilityName(index, e.target.value)}
                      disabled={!isEditing}
                      placeholder="시설명 입력"
                      className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm disabled:bg-gray-100"
                    />
                  )}
                </label>
                {index >= FACILITY_TEMPLATES.length && isEditing && (
                    <button
                    onClick={() => removeCustomFacility(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    삭제
                    </button>
                  )}
                </div>

              {facility.enabled && (
                <div className="ml-8 space-y-2 bg-gray-50 p-3 rounded-lg">
                  {/* 샤워실 */}
                  {facility.name === '샤워실' && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 mb-2">💡 샤워실은 남/여 분리가 기본입니다</p>
                      <div className="grid md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">남자 샤워기</label>
                  <input
                            type="number"
                            value={facility.details?.count || 0}
                            onChange={(e) => updateFacilityDetail(index, 'count', parseInt(e.target.value))}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                            placeholder="10"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">여자 샤워기</label>
                          <input
                            type="number"
                            value={(() => {
                              try {
                                const parsed = JSON.parse(facility.details?.description || '{}');
                                return parsed.femaleCount || 0;
                              } catch {
                                return 0;
                              }
                            })()}
                            onChange={(e) => {
                              try {
                                const parsed = JSON.parse(facility.details?.description || '{}');
                                parsed.femaleCount = parseInt(e.target.value);
                                updateFacilityDetail(index, 'description', JSON.stringify(parsed));
                              } catch {
                                updateFacilityDetail(index, 'description', JSON.stringify({ femaleCount: parseInt(e.target.value) }));
                              }
                            }}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                            placeholder="10"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">가족 샤워실</label>
                          <input
                            type="number"
                            value={(() => {
                              try {
                                const parsed = JSON.parse(facility.details?.description || '{}');
                                return parsed.familyCount || 0;
                              } catch {
                                return 0;
                              }
                            })()}
                            onChange={(e) => {
                              try {
                                const parsed = JSON.parse(facility.details?.description || '{}');
                                parsed.familyCount = parseInt(e.target.value);
                                updateFacilityDetail(index, 'description', JSON.stringify(parsed));
                              } catch {
                                updateFacilityDetail(index, 'description', JSON.stringify({ familyCount: parseInt(e.target.value) }));
                              }
                            }}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                            placeholder="2"
                            min="0"
                          />
                          <p className="text-xs text-gray-400 mt-1">부모-자녀 전용</p>
                        </div>
                      </div>
                </div>
              )}

                  {/* 락커룸 */}
                  {facility.name === '락커룸' && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 mb-2">💡 락커룸은 남/여 분리가 기본입니다</p>
                      <div className="grid md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">남자 락커</label>
                          <input
                            type="number"
                            value={facility.details?.count || 0}
                            onChange={(e) => updateFacilityDetail(index, 'count', parseInt(e.target.value))}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                            placeholder="80"
                            min="0"
                          />
            </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">여자 락커</label>
                          <input
                            type="number"
                            value={(() => {
                              try {
                                const parsed = JSON.parse(facility.details?.description || '{}');
                                return parsed.femaleCount || 0;
                              } catch {
                                return 0;
                              }
                            })()}
                            onChange={(e) => {
                              try {
                                const parsed = JSON.parse(facility.details?.description || '{}');
                                parsed.femaleCount = parseInt(e.target.value);
                                updateFacilityDetail(index, 'description', JSON.stringify(parsed));
                              } catch {
                                updateFacilityDetail(index, 'description', JSON.stringify({ femaleCount: parseInt(e.target.value) }));
                              }
                            }}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                            placeholder="70"
                            min="0"
                          />
          </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">가족 락커룸</label>
                          <input
                            type="number"
                            value={(() => {
                              try {
                                const parsed = JSON.parse(facility.details?.description || '{}');
                                return parsed.familyCount || 0;
                              } catch {
                                return 0;
                              }
                            })()}
                            onChange={(e) => {
                              try {
                                const parsed = JSON.parse(facility.details?.description || '{}');
                                parsed.familyCount = parseInt(e.target.value);
                                updateFacilityDetail(index, 'description', JSON.stringify(parsed));
                              } catch {
                                updateFacilityDetail(index, 'description', JSON.stringify({ familyCount: parseInt(e.target.value) }));
                              }
                            }}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                            placeholder="5"
                            min="0"
                          />
                          <p className="text-xs text-gray-400 mt-1">부모-자녀 전용</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 사우나 */}
                  {facility.name === '사우나' && (
            <div className="space-y-3">
                      <p className="text-xs text-gray-500 mb-2">💡 사우나 유형과 수용 인원을 입력해주세요</p>
                      
                      {/* 남자 사우나 */}
                      <div className="border-l-4 border-blue-400 pl-3">
                        <p className="text-sm font-semibold text-gray-700 mb-2">👨 남자 사우나</p>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">건식 사우나 (명)</label>
                            <input
                              type="number"
                              value={facility.details?.count || 0}
                              onChange={(e) => updateFacilityDetail(index, 'count', parseInt(e.target.value))}
                              disabled={!isEditing}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                              placeholder="10"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">습식 사우나 (명)</label>
                            <input
                              type="number"
                              value={(() => {
                                try {
                                  const parsed = JSON.parse(facility.details?.description || '{}');
                                  return parsed.maleWet || 0;
                                } catch {
                                  return 0;
                                }
                              })()}
                              onChange={(e) => {
                                try {
                                  const parsed = JSON.parse(facility.details?.description || '{}');
                                  parsed.maleWet = parseInt(e.target.value);
                                  updateFacilityDetail(index, 'description', JSON.stringify(parsed));
                                } catch {
                                  updateFacilityDetail(index, 'description', JSON.stringify({ maleWet: parseInt(e.target.value) }));
                                }
                              }}
                              disabled={!isEditing}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                              placeholder="8"
                              min="0"
                            />
                </div>
                        </div>
                      </div>

                      {/* 여자 사우나 */}
                      <div className="border-l-4 border-pink-400 pl-3">
                        <p className="text-sm font-semibold text-gray-700 mb-2">👩 여자 사우나</p>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">건식 사우나 (명)</label>
                  <input
                              type="number"
                              value={(() => {
                                try {
                                  const parsed = JSON.parse(facility.details?.description || '{}');
                                  return parsed.femaleDry || 0;
                                } catch {
                                  return 0;
                                }
                              })()}
                              onChange={(e) => {
                                try {
                                  const parsed = JSON.parse(facility.details?.description || '{}');
                                  parsed.femaleDry = parseInt(e.target.value);
                                  updateFacilityDetail(index, 'description', JSON.stringify(parsed));
                                } catch {
                                  updateFacilityDetail(index, 'description', JSON.stringify({ femaleDry: parseInt(e.target.value) }));
                                }
                              }}
                              disabled={!isEditing}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                              placeholder="10"
                              min="0"
                            />
                </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">습식 사우나 (명)</label>
                            <input
                              type="number"
                              value={(() => {
                                try {
                                  const parsed = JSON.parse(facility.details?.description || '{}');
                                  return parsed.femaleWet || 0;
                                } catch {
                                  return 0;
                                }
                              })()}
                              onChange={(e) => {
                                try {
                                  const parsed = JSON.parse(facility.details?.description || '{}');
                                  parsed.femaleWet = parseInt(e.target.value);
                                  updateFacilityDetail(index, 'description', JSON.stringify(parsed));
                                } catch {
                                  updateFacilityDetail(index, 'description', JSON.stringify({ femaleWet: parseInt(e.target.value) }));
                                }
                              }}
                              disabled={!isEditing}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                              placeholder="8"
                              min="0"
                            />
            </div>
          </div>
      </div>

                      {/* 추가 메모 */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">추가 메모</label>
                        <textarea
                          value={(() => {
                            try {
                              const parsed = JSON.parse(facility.details?.description || '{}');
                              return parsed.notes || '';
                            } catch {
                              return '';
                            }
                          })()}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(facility.details?.description || '{}');
                              parsed.notes = e.target.value;
                              updateFacilityDetail(index, 'description', JSON.stringify(parsed));
                            } catch {
                              updateFacilityDetail(index, 'description', JSON.stringify({ notes: e.target.value }));
                            }
                          }}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                          placeholder="예: 온도 조절 가능, 아로마 테라피 제공 등"
                        />
                      </div>
                    </div>
                  )}

                  {/* 탈수기 */}
                  {facility.name === '탈수기' && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 mb-2">💡 탈수기는 남/여 구분이 일반적입니다</p>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">남자 탈수기 (대)</label>
                          <input
                            type="number"
                            value={facility.details?.count || 0}
                            onChange={(e) => updateFacilityDetail(index, 'count', parseInt(e.target.value))}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                            placeholder="2"
                            min="0"
                          />
                    </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">여자 탈수기 (대)</label>
                          <input
                            type="number"
                            value={(() => {
                              try {
                                const parsed = JSON.parse(facility.details?.description || '{}');
                                return parsed.femaleCount || 0;
                              } catch {
                                return 0;
                              }
                            })()}
                            onChange={(e) => {
                              try {
                                const parsed = JSON.parse(facility.details?.description || '{}');
                                parsed.femaleCount = parseInt(e.target.value);
                                updateFacilityDetail(index, 'description', JSON.stringify(parsed));
                              } catch {
                                updateFacilityDetail(index, 'description', JSON.stringify({ femaleCount: parseInt(e.target.value) }));
                              }
                            }}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                            placeholder="2"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 체온조절실 */}
                  {facility.name === '체온조절실' && (
                    <div className="space-y-2">
                      <div className="mb-2">
                        <label className="block text-xs text-gray-600 mb-1">유형</label>
                        <select
                          value={facility.details?.type || '남/여 분리'}
                          onChange={(e) => updateFacilityDetail(index, 'type', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                        >
                          <option value="남/여 분리">남/여 분리</option>
                          <option value="공용">공용</option>
                        </select>
                      </div>
                      
                      {facility.details?.type === '공용' ? (
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">체온조절실 수용 인원 (명)</label>
                          <input
                            type="number"
                            value={facility.details?.count || 0}
                            onChange={(e) => updateFacilityDetail(index, 'count', parseInt(e.target.value))}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                            placeholder="10"
                            min="0"
                          />
                          <p className="text-xs text-gray-400 mt-1">총 수용 인원</p>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">남자 체온조절실 (명)</label>
                            <input
                              type="number"
                              value={facility.details?.count || 0}
                              onChange={(e) => updateFacilityDetail(index, 'count', parseInt(e.target.value))}
                              disabled={!isEditing}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                              placeholder="5"
                              min="0"
                            />
                            <p className="text-xs text-gray-400 mt-1">수용 인원</p>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">여자 체온조절실 (명)</label>
                            <input
                              type="number"
                              value={(() => {
                                try {
                                  const parsed = JSON.parse(facility.details?.description || '{}');
                                  return parsed.femaleCount || 0;
                                } catch {
                                  return 0;
                                }
                              })()}
                              onChange={(e) => {
                                try {
                                  const parsed = JSON.parse(facility.details?.description || '{}');
                                  parsed.femaleCount = parseInt(e.target.value);
                                  updateFacilityDetail(index, 'description', JSON.stringify(parsed));
                                } catch {
                                  updateFacilityDetail(index, 'description', JSON.stringify({ femaleCount: parseInt(e.target.value) }));
                                }
                              }}
                              disabled={!isEditing}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                              placeholder="5"
                              min="0"
                            />
                            <p className="text-xs text-gray-400 mt-1">수용 인원</p>
                          </div>
                        </div>
                    )}
                  </div>
                  )}

                  {/* 체온유지탕(월풀) */}
                  {facility.name === '체온유지탕(월풀)' && (
                    <div className="space-y-2">
                      <div className="mb-2">
                        <label className="block text-xs text-gray-600 mb-1">유형</label>
                        <select
                          value={facility.details?.type || '남/여 분리'}
                          onChange={(e) => updateFacilityDetail(index, 'type', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                        >
                          <option value="남/여 분리">남/여 분리</option>
                          <option value="공용">공용</option>
                        </select>
                </div>
                      
                      {facility.details?.type === '공용' ? (
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">체온유지탕 (명)</label>
                          <input
                            type="number"
                            value={facility.details?.count || 0}
                            onChange={(e) => updateFacilityDetail(index, 'count', parseInt(e.target.value))}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                            placeholder="12"
                            min="0"
                          />
                          <p className="text-xs text-gray-400 mt-1">총 수용 인원</p>
            </div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">남자 체온유지탕 (명)</label>
                            <input
                              type="number"
                              value={facility.details?.count || 0}
                              onChange={(e) => updateFacilityDetail(index, 'count', parseInt(e.target.value))}
                              disabled={!isEditing}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                              placeholder="6"
                              min="0"
                            />
                            <p className="text-xs text-gray-400 mt-1">수용 인원</p>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">여자 체온유지탕 (명)</label>
                            <input
                              type="number"
                              value={(() => {
                                try {
                                  const parsed = JSON.parse(facility.details?.description || '{}');
                                  return parsed.femaleCount || 0;
                                } catch {
                                  return 0;
                                }
                              })()}
                              onChange={(e) => {
                                try {
                                  const parsed = JSON.parse(facility.details?.description || '{}');
                                  parsed.femaleCount = parseInt(e.target.value);
                                  updateFacilityDetail(index, 'description', JSON.stringify(parsed));
                                } catch {
                                  updateFacilityDetail(index, 'description', JSON.stringify({ femaleCount: parseInt(e.target.value) }));
                                }
                              }}
                              disabled={!isEditing}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                              placeholder="6"
                              min="0"
                            />
                            <p className="text-xs text-gray-400 mt-1">수용 인원</p>
                  </div>
                </div>
                      )}
            </div>
                  )}

                  {/* PT룸, CCTV 등 기타 시설 */}
                  {facility.name === 'PT룸' && (
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">PT룸 개수</label>
                        <input
                          type="number"
                          value={facility.details?.count || 0}
                          onChange={(e) => updateFacilityDetail(index, 'count', parseInt(e.target.value))}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                          placeholder="2"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">상세 설명</label>
                  <input
                    type="text"
                          value={facility.details?.description || ''}
                          onChange={(e) => updateFacilityDetail(index, 'description', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                          placeholder="예: 개인 PT 진행 가능"
                        />
                      </div>
                    </div>
                  )}

                  {facility.name === 'CCTV' && (
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">CCTV 대수</label>
                        <input
                          type="number"
                          value={facility.details?.count || 0}
                          onChange={(e) => updateFacilityDetail(index, 'count', parseInt(e.target.value))}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                          placeholder="10"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">설치 위치</label>
                  <input
                    type="text"
                          value={facility.details?.description || ''}
                          onChange={(e) => updateFacilityDetail(index, 'description', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                          placeholder="예: 수영장, 락커룸, 입구"
                        />
                      </div>
                    </div>
                  )}

                  {facility.name === '자동 제세동기(AED)' && (
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">AED 대수</label>
                      <input
                        type="number"
                        value={facility.details?.count || 0}
                        onChange={(e) => updateFacilityDetail(index, 'count', parseInt(e.target.value))}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                        placeholder="1"
                        min="0"
                      />
                    </div>
                  )}

                  {/* 기타 시설 */}
                  {!['샤워실', '락커룸', '사우나', '체온유지탕(월풀)', 'PT룸', 'CCTV', '자동 제세동기(AED)'].includes(facility.name) && facility.name && (
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">상세 설명</label>
                    <input
                      type="text"
                        value={facility.details?.description || ''}
                        onChange={(e) => updateFacilityDetail(index, 'description', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                        placeholder="시설에 대한 상세 설명을 입력하세요"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {/* 커스텀 시설 추가 버튼 */}
          {isEditing && (
            <div className="pt-2">
                    <Button
                onClick={addCustomFacility}
                variant="secondary"
                size="sm"
                className="w-full flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                커스텀 시설 추가
                    </Button>
                  </div>
          )}
        </CardContent>
      </Card>

      {/* 운영 정보 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            운영 정보
          </CardTitle>
          <CardDescription>센터의 운영 시간과 주차 정보를 관리합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">평일 운영시간</label>
              <div className="flex items-center space-x-2">
                <input
                  type="time"
                  value={weekdaysOpen}
                  onChange={(e) => setWeekdaysOpen(e.target.value)}
                  disabled={!isEditing}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                <span>~</span>
                <input
                  type="time"
                  value={weekdaysClose}
                  onChange={(e) => setWeekdaysClose(e.target.value)}
                  disabled={!isEditing}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">주말 운영시간</label>
              <div className="flex items-center space-x-2">
                <input
                  type="time"
                  value={weekendsOpen}
                  onChange={(e) => setWeekendsOpen(e.target.value)}
                  disabled={!isEditing}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                <span>~</span>
                <input
                  type="time"
                  value={weekendsClose}
                  onChange={(e) => setWeekendsClose(e.target.value)}
                  disabled={!isEditing}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={parkingAvailable}
                onChange={(e) => setParkingAvailable(e.target.checked)}
                disabled={!isEditing}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2 disabled:bg-gray-100"
              />
              <span className="text-sm font-medium text-gray-700">주차 가능</span>
            </label>
            {parkingAvailable && (
              <div className="flex-1">
                <input
                  type="number"
                  value={parkingSpaces}
                  onChange={(e) => setParkingSpaces(parseInt(e.target.value))}
                  disabled={!isEditing}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="주차 대수"
                  min="0"
                />
                <span className="ml-2 text-sm text-gray-500">대</span>
              </div>
            )}
          </div>
        </CardContent>
        </Card>
    </div>
  );
}

export default withAuth(CenterInfoManagementPage, { requireTypes: ['centerAdmin', 'superAdmin'] });
