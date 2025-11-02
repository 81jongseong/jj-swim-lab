/**
 * 🏢 JJ Swim Lab - 센터 정보 관리 페이지 (센터 관리자용)
 *
 * 📋 **페이지 목적**
 * - 센터 관리자가 센터의 기본 정보, 시설 정보, 운영 시간, 설정 등을 관리
 * - 센터 정보 + 센터 설정 통합 페이지
 * 
 * 🔄 **주요 기능**
 * - 센터 기본 정보 관리 (이름, 주소, 연락처)
 * - 수영장 정보 관리 (메인풀, 유아풀, 엔드리스풀)
 * - 시설 정보 관리 (샤워실, 락커룸, 사우나, 체온유지탕 등)
 * - 운영시간 설정 (평일/주말/공휴일)
 * - 개인레슨 운영시간 설정 (요일별)
 * - 자유수영 운영시간 설정 (요일별)
 * - 급수 관리 (센터별 커스텀 급수)
 * 
 * 🗄️ **데이터 연동**
 * - Center 모델과 연동
 * - GET /api/centers/my-center (센터 정보 조회)
 * - PUT /api/centers/my-center (센터 정보 저장)
 * 
 * 🔗 **연동되는 파일**
 * - hooks/useAuth.tsx (인증 상태)
 * - components/withAuth (인증 HOC)
 * - components/ui (Card, Button, Input, Label 등)
 * - components/center-admin/LevelManagement (급수 관리)
 * 
 * 📅 **개발 히스토리**
 * - 2025-10-29: 자유수영 운영시간 설정 기능 추가
 * - 2025-10-31: 커밋 8123639에서 복원, 수심 범위 설정, 자유수영 레인 대여 연동
 * - 2025-10-31: 공휴일 운영시간 설정 추가
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import withAuth from '@/components/withAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, LoadingSpinner } from '@/components/ui';
import { Button } from '@/components/Button';
import LevelManagement from '@/components/center-admin/LevelManagement';
import { 
  Building, 
  Edit,
  Save, 
  X,
  Plus,
  Trash2,
  Waves,
  Clock,
  Settings,
  Users
} from 'lucide-react';

// 수영장 정보 인터페이스
interface PoolInfo {
  id: string;
  type: 'main' | 'auxiliary' | 'kids' | 'endless' | 'warmup' | 'children';
  length: number;
  width: number;
  depth: number;
  depthRange?: {
    min: number;
    max: number;
  };
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

// ⭐ 개인레슨 운영시간 타입 정의
interface PersonalLessonTimeSlot {
  startTime: string;
  endTime: string;
}

interface DayTimeSlot {
  day: string; // 'monday', 'tuesday', etc.
  timeSlots: PersonalLessonTimeSlot[];
}

interface PersonalLessonSettings {
  enabled: boolean;
  dayTimeSlots: DayTimeSlot[]; // 요일별로 시간대를 분리 저장
  cancellationPolicy: string;
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
  
  // 센터 추가 모달 상태
  const [showAddCenterModal, setShowAddCenterModal] = useState(false);
  const [newCenterFormTab, setNewCenterFormTab] = useState<'basic' | 'pools' | 'facilities' | 'operating' | 'other'>('basic');
  const [newCenterForm, setNewCenterForm] = useState({
    name: '',
    address: '',
    postalCode: '',
    city: '',
    province: '',
    phone: '',
    email: '',
    description: '',
    pools: [] as Array<{
      id: string;
      type: 'main' | 'auxiliary';
      length: number;
      width: number;
      depth: number;
      laneCount?: number;
      description?: string;
    }>,
    facilities: JSON.parse(JSON.stringify(FACILITY_TEMPLATES)) as FacilityDetail[],
    weekdaysOpen: '06:00',
    weekdaysClose: '22:00',
    weekendsOpen: '08:00',
    weekendsClose: '20:00',
    personalLessonSettings: {
      enabled: true,
      dayTimeSlots: [] as DayTimeSlot[],
      cancellationPolicy: '24시간 전 취소 가능'
    },
    freeSwimSettings: {
      enabled: true,
      dayTimeSlots: [] as DayTimeSlot[],
      cancellationPolicy: ''
    },
    capacity: 50,
    parkingAvailable: false,
    parkingSpaces: 0
  });
  
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
  const [holidaysOpen, setHolidaysOpen] = useState('09:00');
  const [holidaysClose, setHolidaysClose] = useState('18:00');
  const [holidaysEnabled, setHolidaysEnabled] = useState(false);
  const [parkingAvailable, setParkingAvailable] = useState(false);
  const [parkingSpaces, setParkingSpaces] = useState(0);
  
  // ⭐ 급수 관리 (초기값: 강습 관리에서 사용하는 급수)
  const [customLevels, setCustomLevels] = useState<Array<{
    id: string;
    name: string;
    description: string;
    order: number;
    color?: string;
    mappedToAdminLevel?: string;
  }>>([
    { id: 'beginner_1', name: '완전 초보', description: '물에 익숙해지는 단계', order: 1, color: '#22c55e', mappedToAdminLevel: 'beginner' },
    { id: 'beginner_2', name: '초급', description: '자유형 기본, 배영 가능', order: 2, color: '#3b82f6', mappedToAdminLevel: 'beginner' },
    { id: 'intermediate_1', name: '중급 하위', description: '자유형, 배영, 평영 가능', order: 3, color: '#a855f7', mappedToAdminLevel: 'intermediate' },
    { id: 'intermediate_2', name: '중급 상위', description: '모든 영법으로 100m 연속 수영', order: 4, color: '#f59e0b', mappedToAdminLevel: 'intermediate' },
    { id: 'advanced_1', name: '고급 하위', description: '모든 영법으로 장거리 수영 가능', order: 5, color: '#ef4444', mappedToAdminLevel: 'advanced' },
    { id: 'advanced_2', name: '고급 상위 (마스터즈)', description: '경쟁 수준, 기록 향상 목표', order: 6, color: '#8b5cf6', mappedToAdminLevel: 'advanced' },
    { id: 'master', name: '마스터', description: '엘리트 수준, 최적화된 훈련', order: 7, color: '#ec4899', mappedToAdminLevel: 'master' },
    { id: 'expert', name: '전문가', description: '경쟁 수준, 최대 부하', order: 8, color: '#dc2626', mappedToAdminLevel: 'master' }
  ]);
  
  // ⭐ 개인레슨 운영시간 설정 (요일별로 시간대 분리)
  const [personalLessonSettings, setPersonalLessonSettings] = useState<PersonalLessonSettings>({
    enabled: true,
    dayTimeSlots: [], // 요일별 시간대
    cancellationPolicy: '24시간 전 취소 가능'
  });
  
  // ⭐ 자유수영 운영시간 설정 (개인레슨과 동일한 구조)
  const [freeSwimSettings, setFreeSwimSettings] = useState<PersonalLessonSettings>({
    enabled: true,
    dayTimeSlots: [], // 요일별 시간대
    cancellationPolicy: ''
  });
  
  // 새 시간대 입력 상태 (개인레슨용)
  const [newTimeSlot, setNewTimeSlot] = useState({
    startTime: '09:00',
    endTime: '18:00'
  });
  
  // 새 시간대 입력 상태 (자유수영용)
  const [newFreeSwimTimeSlot, setNewFreeSwimTimeSlot] = useState({
    startTime: '09:00',
    endTime: '18:00'
  });
  
  // 선택된 요일 상태 (버튼식 요일 선택용 - 개인레슨)
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  
  // 선택된 요일 상태 (버튼식 요일 선택용 - 자유수영)
  const [selectedFreeSwimDays, setSelectedFreeSwimDays] = useState<string[]>([]);
  
  const [centerId, setCenterId] = useState('');

  // 권한 확인
  useEffect(() => {
    // center@swim.com 계정도 센터 관리자로 인식
    const isCenterAdmin = user && (
      ['centerAdmin', 'center-admin', 'superAdmin'].includes(user.userType) ||
      user.email === 'center@swim.com'
    );
    
    if (user && !isCenterAdmin) {
      alert('센터 관리자만 접근할 수 있습니다.');
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
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
          'Content-Type': 'application/json',
          'x-center-id': localStorage.getItem('centerId') || ''
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
          
          // ⭐ 급수 정보 로드 (DB에 데이터가 없으면 기본값 유지)
          if (centerData.customLevels && centerData.customLevels.length > 0) {
            setCustomLevels(centerData.customLevels);
          } else if (centerData.availabilitySettings?.personalLesson?.customLevels && centerData.availabilitySettings.personalLesson.customLevels.length > 0) {
            setCustomLevels(centerData.availabilitySettings.personalLesson.customLevels);
          }
          // DB에 데이터가 없으면 초기값 사용 (강습 관리에서 사용하는 급수)
          
          // ⭐ 개인레슨 운영시간 설정 로드
          if (centerData.availabilitySettings?.personalLesson) {
            // 새로운 dayTimeSlots 형식으로 변환
            const dayTimeSlots = centerData.availabilitySettings.personalLesson.dayTimeSlots || [];
            setPersonalLessonSettings({
              enabled: centerData.availabilitySettings.personalLesson.enabled || true,
              dayTimeSlots: dayTimeSlots.length > 0 ? dayTimeSlots : [],
              cancellationPolicy: centerData.availabilitySettings.personalLesson.cancellationPolicy || '24시간 전 취소 가능'
            });
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
            // 공휴일 운영시간 로드
            if (hours.holiday) {
              setHolidaysOpen(hours.holiday.open || '09:00');
              setHolidaysClose(hours.holiday.close || '18:00');
              setHolidaysEnabled(hours.holiday.isOpen || false);
            }
          }
          
          // 자유수영 운영시간 로드
          console.log('🔍 availabilitySettings 확인:', centerData.availabilitySettings);
          console.log('🔍 freeSwim 확인:', centerData.availabilitySettings?.freeSwim);
          if (centerData.availabilitySettings?.freeSwim) {
            const freeSwimData = centerData.availabilitySettings.freeSwim;
            const dayTimeSlots = freeSwimData.dayTimeSlots || [];
            console.log('🏊 자유수영 운영시간 로드:', {
              enabled: freeSwimData.enabled,
              dayTimeSlots: dayTimeSlots
            });
            setFreeSwimSettings({
              enabled: freeSwimData.enabled !== undefined ? freeSwimData.enabled : true,
              dayTimeSlots: dayTimeSlots.length > 0 ? dayTimeSlots : [],
              cancellationPolicy: freeSwimData.cancellationPolicy || ''
            });
          } else {
            // freeSwim이 없으면 기본값 설정
            console.log('⚠️ 자유수영 운영시간 데이터 없음, 기본값 설정');
            console.log('⚠️ availabilitySettings:', JSON.stringify(centerData.availabilitySettings, null, 2));
            setFreeSwimSettings({
              enabled: true,
              dayTimeSlots: [],
              cancellationPolicy: ''
            });
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
    // center@swim.com 계정도 센터 관리자로 인식
    const isCenterAdmin = user && (
      ['centerAdmin', 'center-admin', 'superAdmin'].includes(user.userType) ||
      user.email === 'center@swim.com'
    );
    
    if (isCenterAdmin) {
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

      // freeSwim dayTimeSlots를 laneRental 형식으로 변환
      const freeSwimDayTimeSlots = freeSwimSettings?.dayTimeSlots || [];
      const availableDays = freeSwimDayTimeSlots.map(slot => slot.day);
      const availableTimes = freeSwimDayTimeSlots.length > 0
        ? freeSwimDayTimeSlots.flatMap(slot => slot.timeSlots)
        : [];

      const dataToSave = {
        name: centerName,
        address,
        city,
        province,
        email,
        phone,
        description,
        // facilities는 제외 (Center 모델의 facilities는 string[] 형식)
        operatingHours: {
          monday: { open: weekdaysOpen, close: weekdaysClose, isOpen: true },
          tuesday: { open: weekdaysOpen, close: weekdaysClose, isOpen: true },
          wednesday: { open: weekdaysOpen, close: weekdaysClose, isOpen: true },
          thursday: { open: weekdaysOpen, close: weekdaysClose, isOpen: true },
          friday: { open: weekdaysOpen, close: weekdaysClose, isOpen: true },
          saturday: { open: weekendsOpen, close: weekendsClose, isOpen: true },
          sunday: { open: weekendsOpen, close: weekendsClose, isOpen: true },
          holiday: { open: holidaysOpen, close: holidaysClose, isOpen: holidaysEnabled }
        },
        customLevels: customLevels.length > 0 ? customLevels : undefined,
        availabilitySettings: {
          ...(personalLessonSettings ? {
            personalLesson: {
              enabled: personalLessonSettings.enabled,
              dayTimeSlots: personalLessonSettings.dayTimeSlots, // 요일별 시간대 저장
              cancellationPolicy: personalLessonSettings.cancellationPolicy
            }
          } : {}),
          freeSwim: {
            enabled: freeSwimSettings?.enabled !== undefined ? freeSwimSettings.enabled : true,
            dayTimeSlots: freeSwimSettings?.dayTimeSlots || [], // 요일별 시간대 저장 (항상 포함)
            cancellationPolicy: freeSwimSettings?.cancellationPolicy || ''
          },
          laneRental: {
            enabled: freeSwimSettings?.enabled !== undefined ? freeSwimSettings.enabled : true,
            availableDays: availableDays, // 요일 배열
            availableTimes: availableTimes.map((slot: any) => ({
              startTime: slot.startTime,
              endTime: slot.endTime,
              maxDuration: 180
            })),
            availableLanes: [1, 2, 3, 4, 5, 6],
            advanceBookingDays: 14,
            cancellationPolicy: freeSwimSettings?.cancellationPolicy || ''
          }
        }
      };

      console.log('📤 저장할 데이터:', JSON.stringify(dataToSave.availabilitySettings, null, 2));
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
    <div className="max-w-7xl mx-auto px-4 pt-20 pb-8">
      {/* 헤더 - 상단 고정 */}
      <div className="sticky top-16 z-40 bg-white pt-4 pb-4 mb-8 -mx-4 px-4 border-b border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0 pr-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              🏢 센터 정보 관리
            </h1>
            <p className="text-gray-600 text-sm">
              센터의 기본 정보, 시설, 운영시간 등을 관리하세요
            </p>
          </div>
          <div className="flex-shrink-0 self-start sm:self-center">
            <div className="flex flex-wrap gap-2">
            {/* 센터 추가 버튼 - 항상 표시 */}
            <Button
              onClick={() => setShowAddCenterModal(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              센터 추가
            </Button>
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
                  <label className="block text-xs text-gray-600 mb-1">수심 설정</label>
                  <select
                    value={pool.depthRange ? 'range' : 'single'}
                    onChange={(e) => {
                      if (e.target.value === 'range') {
                        updatePool(pool.id, 'depthRange', { min: pool.depth || 1.2, max: pool.depth || 1.8 });
                        updatePool(pool.id, 'depth', undefined);
                      } else {
                        updatePool(pool.id, 'depthRange', undefined);
                        updatePool(pool.id, 'depth', pool.depthRange?.min || pool.depth || 1.2);
                      }
                    }}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                  >
                    <option value="single">동일한 수심</option>
                    <option value="range">수심 범위</option>
                  </select>
                  {pool.depthRange ? (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="number"
                        value={pool.depthRange.min || 0}
                        onChange={(e) => updatePool(pool.id, 'depthRange', { ...pool.depthRange, min: Number(e.target.value) })}
                        disabled={!isEditing}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                        placeholder="최소"
                        min="0"
                        step="0.1"
                      />
                      <span className="self-center text-xs text-gray-400">~</span>
                      <input
                        type="number"
                        value={pool.depthRange.max || 0}
                        onChange={(e) => updatePool(pool.id, 'depthRange', { ...pool.depthRange, max: Number(e.target.value) })}
                        disabled={!isEditing}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                        placeholder="최대"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  ) : (
                    <input
                      type="number"
                      value={pool.depth || 0}
                      onChange={(e) => updatePool(pool.id, 'depth', Number(e.target.value))}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 mt-2"
                      placeholder="1.2"
                      min="0"
                      step="0.1"
                    />
                  )}
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
          <div className="space-y-6">
            {/* 강습 운영시간 */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-3">강습 운영시간</h4>
              <div className="grid md:grid-cols-3 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">공휴일 운영시간</label>
                  <div className="flex items-center space-x-2 mb-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={holidaysEnabled}
                        onChange={(e) => setHolidaysEnabled(e.target.checked)}
                        disabled={!isEditing}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2 disabled:bg-gray-100"
                      />
                      <span className="text-xs text-gray-600">운영</span>
                    </label>
                  </div>
                  {holidaysEnabled && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={holidaysOpen}
                        onChange={(e) => setHolidaysOpen(e.target.value)}
                        disabled={!isEditing}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                      <span>~</span>
                      <input
                        type="time"
                        value={holidaysClose}
                        onChange={(e) => setHolidaysClose(e.target.value)}
                        disabled={!isEditing}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  )}
                </div>
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

      {/* ⭐ 급수 관리 */}
      <LevelManagement
        levels={customLevels}
        onLevelsChange={(newLevels) => setCustomLevels(newLevels)}
        isEditing={isEditing}
      />

      {/* ⭐ 개인레슨 운영시간 설정 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            개인레슨 운영시간 설정
          </CardTitle>
          <CardDescription>개인레슨 운영 가능 시간대를 설정합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 개인레슨 활성화 */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">개인레슨 활성화</h4>
              <p className="text-sm text-gray-600">센터에서 개인레슨을 제공합니다</p>
            </div>
            <label className={`relative inline-flex items-center ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
              <input
                type="checkbox"
                checked={personalLessonSettings?.enabled || false}
                onChange={(e) => {
                  if (!isEditing) return;
                  setPersonalLessonSettings({
                    ...personalLessonSettings,
                    enabled: e.target.checked
                  });
                }}
                disabled={!isEditing}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                !isEditing 
                  ? 'bg-gray-100 cursor-not-allowed' 
                  : 'bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:bg-blue-600'
              }`}></div>
            </label>
          </div>

          {/* 요일별 시간대 설정 */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">요일별 운영 시간대</label>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    // 모든 요일 설정 초기화
                    setPersonalLessonSettings({
                      ...personalLessonSettings,
                      dayTimeSlots: []
                    });
                  }}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  전체 초기화
                </button>
              )}
            </div>
            
            {/* 시간대 입력 */}
            {isEditing && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">새 시간대 추가</h4>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">시작 시간</label>
                    <input
                      type="time"
                      id="newStartTime"
                      value={newTimeSlot.startTime}
                      onChange={(e) => setNewTimeSlot({ ...newTimeSlot, startTime: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">종료 시간</label>
                    <input
                      type="time"
                      id="newEndTime"
                      value={newTimeSlot.endTime}
                      onChange={(e) => setNewTimeSlot({ ...newTimeSlot, endTime: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-xs text-gray-600 mb-2">적용할 요일 선택</label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { value: 'monday', label: '월' },
                      { value: 'tuesday', label: '화' },
                      { value: 'wednesday', label: '수' },
                      { value: 'thursday', label: '목' },
                      { value: 'friday', label: '금' },
                      { value: 'saturday', label: '토' },
                      { value: 'sunday', label: '일' }
                    ].map(day => {
                      const isSelected = selectedDays.includes(day.value);
                      
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedDays(selectedDays.filter(d => d !== day.value));
                            } else {
                              setSelectedDays([...selectedDays, day.value]);
                            }
                          }}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isSelected
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const startTime = newTimeSlot.startTime;
                    const endTime = newTimeSlot.endTime;
                    
                    if (!startTime || !endTime) {
                      alert('시작 시간과 종료 시간을 모두 입력하세요.');
                      return;
                    }
                    
                    if (selectedDays.length === 0) {
                      alert('최소 1개 이상의 요일을 선택하세요.');
                      return;
                    }
                    
                    const currentSlots = [...(personalLessonSettings?.dayTimeSlots || [])];
                    
                    selectedDays.forEach(dayValue => {
                      const existingIndex = currentSlots.findIndex(d => d.day === dayValue);
                      
                      if (existingIndex >= 0) {
                        // 기존 요일에 시간대 추가
                        currentSlots[existingIndex].timeSlots.push({
                          startTime,
                          endTime
                        });
                      } else {
                        // 새 요일 추가
                        currentSlots.push({
                          day: dayValue,
                          timeSlots: [{ startTime, endTime }]
                        });
                      }
                    });
                    
                    setPersonalLessonSettings({
                      ...personalLessonSettings,
                      dayTimeSlots: currentSlots
                    });
                    
                    // 입력 필드 초기화
                    setNewTimeSlot({ startTime: '09:00', endTime: '18:00' });
                    setSelectedDays([]);
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  시간대 추가
                </button>
              </div>
            )}
            
            {/* 요일 버튼 - 현재 설정된 요일 표시 */}
            <div className="flex gap-2 flex-wrap mb-4">
              {[
                { value: 'monday', label: '월' },
                { value: 'tuesday', label: '화' },
                { value: 'wednesday', label: '수' },
                { value: 'thursday', label: '목' },
                { value: 'friday', label: '금' },
                { value: 'saturday', label: '토' },
                { value: 'sunday', label: '일' }
              ].map(day => {
                const daySlot = personalLessonSettings?.dayTimeSlots?.find(d => d.day === day.value);
                const timeSlots = daySlot?.timeSlots || [];
                const hasTimeSlots = timeSlots.length > 0;
                
                return (
                  <div
                    key={day.value}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      hasTimeSlots
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {day.label}요일 {hasTimeSlots && `(${timeSlots.length})`}
                  </div>
                );
              })}
            </div>
            
            {/* 설정된 시간대 표시 */}
            {personalLessonSettings?.dayTimeSlots && personalLessonSettings.dayTimeSlots.length > 0 && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                {personalLessonSettings.dayTimeSlots.map((daySlot, dayIndex) => {
                  const dayLabel = [
                    { value: 'monday', label: '월' },
                    { value: 'tuesday', label: '화' },
                    { value: 'wednesday', label: '수' },
                    { value: 'thursday', label: '목' },
                    { value: 'friday', label: '금' },
                    { value: 'saturday', label: '토' },
                    { value: 'sunday', label: '일' }
                  ].find(d => d.value === daySlot.day)?.label;
                  
                  return (
                    <div key={daySlot.day} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                      <h4 className="font-medium text-gray-900 mb-2">{dayLabel}요일</h4>
                      <div className="space-y-2">
                        {daySlot.timeSlots.map((timeSlot, index) => (
                          <div key={index} className="flex gap-3 items-center">
                            <div className="flex-1 grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">시작 시간</label>
                                <input
                                  type="time"
                                  value={timeSlot.startTime}
                                  onChange={(e) => {
                                    const currentSlots = [...(personalLessonSettings?.dayTimeSlots || [])];
                                    currentSlots[dayIndex].timeSlots[index].startTime = e.target.value;
                                    setPersonalLessonSettings({
                                      ...personalLessonSettings,
                                      dayTimeSlots: currentSlots
                                    });
                                  }}
                                  disabled={!isEditing}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">종료 시간</label>
                                <input
                                  type="time"
                                  value={timeSlot.endTime}
                                  onChange={(e) => {
                                    const currentSlots = [...(personalLessonSettings?.dayTimeSlots || [])];
                                    currentSlots[dayIndex].timeSlots[index].endTime = e.target.value;
                                    setPersonalLessonSettings({
                                      ...personalLessonSettings,
                                      dayTimeSlots: currentSlots
                                    });
                                  }}
                                  disabled={!isEditing}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100"
                                />
                              </div>
                            </div>
                            {isEditing && (
                              <button
                                type="button"
                                onClick={() => {
                                  const currentSlots = [...(personalLessonSettings?.dayTimeSlots || [])];
                                  currentSlots[dayIndex].timeSlots = currentSlots[dayIndex].timeSlots.filter((_, i) => i !== index);
                                  // 시간이 없으면 요일 자체 제거
                                  if (currentSlots[dayIndex].timeSlots.length === 0) {
                                    currentSlots.splice(dayIndex, 1);
                                  }
                                  setPersonalLessonSettings({
                                    ...personalLessonSettings,
                                    dayTimeSlots: currentSlots
                                  });
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => {
                            const currentSlots = [...(personalLessonSettings?.dayTimeSlots || [])];
                            currentSlots[dayIndex].timeSlots.push({ startTime: '09:00', endTime: '18:00' });
                            setPersonalLessonSettings({
                              ...personalLessonSettings,
                              dayTimeSlots: currentSlots
                            });
                          }}
                          className="mt-2 text-xs text-blue-600 hover:text-blue-700"
                        >
                          + 시간 추가
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ⭐ 자유수영 운영시간 설정 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Waves className="h-5 w-5 mr-2" />
            자유수영 운영시간 설정
          </CardTitle>
          <CardDescription>자유수영 운영 가능 시간대를 설정합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 자유수영 활성화 */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">자유수영 활성화</h4>
              <p className="text-sm text-gray-600">센터에서 자유수영을 제공합니다</p>
            </div>
            <label className={`relative inline-flex items-center ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
              <input
                type="checkbox"
                checked={freeSwimSettings?.enabled || false}
                onChange={(e) => {
                  if (!isEditing) return;
                  setFreeSwimSettings({
                    ...freeSwimSettings,
                    enabled: e.target.checked
                  });
                }}
                disabled={!isEditing}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                !isEditing 
                  ? 'bg-gray-100 cursor-not-allowed' 
                  : 'bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:bg-blue-600'
              }`}></div>
            </label>
          </div>

          {/* 요일별 시간대 설정 */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">요일별 운영 시간대</label>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    // 모든 요일 설정 초기화
                    setFreeSwimSettings({
                      ...freeSwimSettings,
                      dayTimeSlots: []
                    });
                  }}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  전체 초기화
                </button>
              )}
            </div>
            
            {/* 시간대 입력 */}
            {isEditing && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">새 시간대 추가</h4>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">시작 시간</label>
                    <input
                      type="time"
                      value={newFreeSwimTimeSlot.startTime}
                      onChange={(e) => setNewFreeSwimTimeSlot({ ...newFreeSwimTimeSlot, startTime: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">종료 시간</label>
                    <input
                      type="time"
                      value={newFreeSwimTimeSlot.endTime}
                      onChange={(e) => setNewFreeSwimTimeSlot({ ...newFreeSwimTimeSlot, endTime: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-xs text-gray-600 mb-2">적용할 요일 선택</label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { value: 'monday', label: '월' },
                      { value: 'tuesday', label: '화' },
                      { value: 'wednesday', label: '수' },
                      { value: 'thursday', label: '목' },
                      { value: 'friday', label: '금' },
                      { value: 'saturday', label: '토' },
                      { value: 'sunday', label: '일' }
                    ].map(day => {
                      const isSelected = selectedFreeSwimDays.includes(day.value);
                      
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedFreeSwimDays(selectedFreeSwimDays.filter(d => d !== day.value));
                            } else {
                              setSelectedFreeSwimDays([...selectedFreeSwimDays, day.value]);
                            }
                          }}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isSelected
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const startTime = newFreeSwimTimeSlot.startTime;
                    const endTime = newFreeSwimTimeSlot.endTime;
                    
                    if (!startTime || !endTime) {
                      alert('시작 시간과 종료 시간을 모두 입력하세요.');
                      return;
                    }
                    
                    if (selectedFreeSwimDays.length === 0) {
                      alert('최소 1개 이상의 요일을 선택하세요.');
                      return;
                    }
                    
                    const currentSlots = [...(freeSwimSettings?.dayTimeSlots || [])];
                    
                    selectedFreeSwimDays.forEach(dayValue => {
                      const existingIndex = currentSlots.findIndex(d => d.day === dayValue);
                      
                      if (existingIndex >= 0) {
                        // 기존 요일에 시간대 추가
                        currentSlots[existingIndex].timeSlots.push({
                          startTime,
                          endTime
                        });
                      } else {
                        // 새 요일 추가
                        currentSlots.push({
                          day: dayValue,
                          timeSlots: [{ startTime, endTime }]
                        });
                      }
                    });
                    
                    setFreeSwimSettings({
                      ...freeSwimSettings,
                      dayTimeSlots: currentSlots
                    });
                    
                    // 입력 필드 초기화
                    setNewFreeSwimTimeSlot({ startTime: '09:00', endTime: '18:00' });
                    setSelectedFreeSwimDays([]);
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  시간대 추가
                </button>
              </div>
            )}
            
            {/* 요일 버튼 - 현재 설정된 요일 표시 */}
            <div className="flex gap-2 flex-wrap mb-4">
              {[
                { value: 'monday', label: '월' },
                { value: 'tuesday', label: '화' },
                { value: 'wednesday', label: '수' },
                { value: 'thursday', label: '목' },
                { value: 'friday', label: '금' },
                { value: 'saturday', label: '토' },
                { value: 'sunday', label: '일' }
              ].map(day => {
                const daySlot = freeSwimSettings?.dayTimeSlots?.find(d => d.day === day.value);
                const timeSlots = daySlot?.timeSlots || [];
                const hasTimeSlots = timeSlots.length > 0;
                
                return (
                  <div
                    key={day.value}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      hasTimeSlots
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {day.label}요일 {hasTimeSlots && `(${timeSlots.length})`}
                  </div>
                );
              })}
            </div>
            
            {/* 설정된 시간대 표시 */}
            {freeSwimSettings?.dayTimeSlots && freeSwimSettings.dayTimeSlots.length > 0 && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                {freeSwimSettings.dayTimeSlots.map((daySlot, dayIndex) => {
                  const dayLabel = [
                    { value: 'monday', label: '월' },
                    { value: 'tuesday', label: '화' },
                    { value: 'wednesday', label: '수' },
                    { value: 'thursday', label: '목' },
                    { value: 'friday', label: '금' },
                    { value: 'saturday', label: '토' },
                    { value: 'sunday', label: '일' }
                  ].find(d => d.value === daySlot.day)?.label;
                  
                  return (
                    <div key={daySlot.day} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                      <h4 className="font-medium text-gray-900 mb-2">{dayLabel}요일</h4>
                      <div className="space-y-2">
                        {daySlot.timeSlots.map((timeSlot, index) => (
                          <div key={index} className="flex gap-3 items-center">
                            <div className="flex-1 grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">시작 시간</label>
                                <input
                                  type="time"
                                  value={timeSlot.startTime}
                                  onChange={(e) => {
                                    const currentSlots = [...(freeSwimSettings?.dayTimeSlots || [])];
                                    currentSlots[dayIndex].timeSlots[index].startTime = e.target.value;
                                    setFreeSwimSettings({
                                      ...freeSwimSettings,
                                      dayTimeSlots: currentSlots
                                    });
                                  }}
                                  disabled={!isEditing}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">종료 시간</label>
                                <input
                                  type="time"
                                  value={timeSlot.endTime}
                                  onChange={(e) => {
                                    const currentSlots = [...(freeSwimSettings?.dayTimeSlots || [])];
                                    currentSlots[dayIndex].timeSlots[index].endTime = e.target.value;
                                    setFreeSwimSettings({
                                      ...freeSwimSettings,
                                      dayTimeSlots: currentSlots
                                    });
                                  }}
                                  disabled={!isEditing}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100"
                                />
                              </div>
                            </div>
                            {isEditing && (
                              <button
                                type="button"
                                onClick={() => {
                                  const currentSlots = [...(freeSwimSettings?.dayTimeSlots || [])];
                                  currentSlots[dayIndex].timeSlots = currentSlots[dayIndex].timeSlots.filter((_, i) => i !== index);
                                  // 시간이 없으면 요일 자체 제거
                                  if (currentSlots[dayIndex].timeSlots.length === 0) {
                                    currentSlots.splice(dayIndex, 1);
                                  }
                                  setFreeSwimSettings({
                                    ...freeSwimSettings,
                                    dayTimeSlots: currentSlots
                                  });
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => {
                            const currentSlots = [...(freeSwimSettings?.dayTimeSlots || [])];
                            currentSlots[dayIndex].timeSlots.push({ startTime: '09:00', endTime: '18:00' });
                            setFreeSwimSettings({
                              ...freeSwimSettings,
                              dayTimeSlots: currentSlots
                            });
                          }}
                          className="mt-2 text-xs text-blue-600 hover:text-blue-700"
                        >
                          + 시간 추가
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 센터 추가 모달 */}
      {showAddCenterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* 헤더 */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">새 센터 추가</h3>
                <button
                  onClick={() => {
                    setShowAddCenterModal(false);
                    setNewCenterFormTab('basic');
                    setNewCenterForm({
                      name: '',
                      address: '',
                      postalCode: '',
                      city: '',
                      province: '',
                      phone: '',
                      email: '',
                      description: '',
                      pools: [],
                      facilities: JSON.parse(JSON.stringify(FACILITY_TEMPLATES)),
                      weekdaysOpen: '06:00',
                      weekdaysClose: '22:00',
                      weekendsOpen: '08:00',
                      weekendsClose: '20:00',
                      personalLessonSettings: {
                        enabled: true,
                        dayTimeSlots: [],
                        cancellationPolicy: '24시간 전 취소 가능'
                      },
                      freeSwimSettings: {
                        enabled: true,
                        dayTimeSlots: [],
                        cancellationPolicy: ''
                      },
                      capacity: 50,
                      parkingAvailable: false,
                      parkingSpaces: 0
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 탭 네비게이션 */}
              <div className="flex gap-2 overflow-x-auto">
                <button
                  onClick={() => setNewCenterFormTab('basic')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                    newCenterFormTab === 'basic' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  기본 정보
                </button>
                <button
                  onClick={() => setNewCenterFormTab('pools')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                    newCenterFormTab === 'pools' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  수영장 정보
                </button>
                <button
                  onClick={() => setNewCenterFormTab('facilities')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                    newCenterFormTab === 'facilities' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  시설 정보
                </button>
                <button
                  onClick={() => setNewCenterFormTab('operating')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                    newCenterFormTab === 'operating' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  운영시간
                </button>
                <button
                  onClick={() => setNewCenterFormTab('other')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                    newCenterFormTab === 'other' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  기타 정보
                </button>
              </div>
            </div>

            {/* 탭 컨텐츠 */}
            <div className="flex-1 overflow-y-auto p-6">
              {newCenterFormTab === 'basic' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">센터명 *</label>
                    <input
                      type="text"
                      value={newCenterForm.name}
                      onChange={e => setNewCenterForm({ ...newCenterForm, name: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      placeholder="센터명을 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">우편번호</label>
                    <input
                      type="text"
                      value={newCenterForm.postalCode}
                      onChange={e => setNewCenterForm({ ...newCenterForm, postalCode: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      placeholder="우편번호를 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">주소 *</label>
                    <input
                      type="text"
                      value={newCenterForm.address}
                      onChange={e => setNewCenterForm({ ...newCenterForm, address: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      placeholder="주소를 입력하세요"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">시/도</label>
                      <input
                        type="text"
                        value={newCenterForm.province}
                        onChange={e => setNewCenterForm({ ...newCenterForm, province: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        placeholder="시/도를 입력하세요"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">시/군/구</label>
                      <input
                        type="text"
                        value={newCenterForm.city}
                        onChange={e => setNewCenterForm({ ...newCenterForm, city: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        placeholder="시/군/구를 입력하세요"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">전화번호 *</label>
                    <input
                      type="text"
                      value={newCenterForm.phone}
                      onChange={e => setNewCenterForm({ ...newCenterForm, phone: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      placeholder="전화번호를 입력하세요 (예: 010-1234-5678)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">이메일 *</label>
                    <input
                      type="email"
                      value={newCenterForm.email}
                      onChange={e => setNewCenterForm({ ...newCenterForm, email: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      placeholder="이메일을 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                    <textarea
                      value={newCenterForm.description}
                      onChange={e => setNewCenterForm({ ...newCenterForm, description: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      rows={4}
                      placeholder="센터 설명을 입력하세요"
                    />
                  </div>
                </div>
              )}

              {newCenterFormTab === 'pools' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold">수영장 정보</h4>
                    <Button
                      onClick={() => {
                        setNewCenterForm({
                          ...newCenterForm,
                          pools: [
                            ...newCenterForm.pools,
                            {
                              id: `pool-${Date.now()}`,
                              type: 'main',
                              length: 25,
                              width: 12,
                              depth: 1.5,
                              laneCount: 5
                            }
                          ]
                        });
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      수영장 추가
                    </Button>
                  </div>
                  {newCenterForm.pools.map((pool, index) => (
                    <div key={pool.id} className="border rounded p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <h5 className="font-medium">수영장 {index + 1}</h5>
                        <Button
                          onClick={() => {
                            setNewCenterForm({
                              ...newCenterForm,
                              pools: newCenterForm.pools.filter(p => p.id !== pool.id)
                            });
                          }}
                          variant="secondary"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">유형 *</label>
                          <select
                            value={pool.type}
                            onChange={e => {
                              const updatedPools = [...newCenterForm.pools];
                              updatedPools[index].type = e.target.value as 'main' | 'auxiliary';
                              setNewCenterForm({ ...newCenterForm, pools: updatedPools });
                            }}
                            className="w-full border rounded px-3 py-2"
                          >
                            <option value="main">메인풀</option>
                            <option value="auxiliary">보조풀</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">길이 (m) *</label>
                          <input
                            type="number"
                            value={pool.length}
                            onChange={e => {
                              const updatedPools = [...newCenterForm.pools];
                              updatedPools[index].length = parseFloat(e.target.value) || 0;
                              setNewCenterForm({ ...newCenterForm, pools: updatedPools });
                            }}
                            className="w-full border rounded px-3 py-2"
                            min="5"
                            max="100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">폭 (m) *</label>
                          <input
                            type="number"
                            value={pool.width}
                            onChange={e => {
                              const updatedPools = [...newCenterForm.pools];
                              updatedPools[index].width = parseFloat(e.target.value) || 0;
                              setNewCenterForm({ ...newCenterForm, pools: updatedPools });
                            }}
                            className="w-full border rounded px-3 py-2"
                            min="3"
                            max="50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">깊이 (m) *</label>
                          <input
                            type="number"
                            step="0.1"
                            value={pool.depth}
                            onChange={e => {
                              const updatedPools = [...newCenterForm.pools];
                              updatedPools[index].depth = parseFloat(e.target.value) || 0;
                              setNewCenterForm({ ...newCenterForm, pools: updatedPools });
                            }}
                            className="w-full border rounded px-3 py-2"
                            min="0.3"
                            max="5"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">레인 수</label>
                          <input
                            type="number"
                            value={pool.laneCount || ''}
                            onChange={e => {
                              const updatedPools = [...newCenterForm.pools];
                              updatedPools[index].laneCount = parseInt(e.target.value) || undefined;
                              setNewCenterForm({ ...newCenterForm, pools: updatedPools });
                            }}
                            className="w-full border rounded px-3 py-2"
                            min="1"
                            max="20"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                        <textarea
                          value={pool.description || ''}
                          onChange={e => {
                            const updatedPools = [...newCenterForm.pools];
                            updatedPools[index].description = e.target.value;
                            setNewCenterForm({ ...newCenterForm, pools: updatedPools });
                          }}
                          className="w-full border rounded px-3 py-2"
                          rows={2}
                          placeholder="수영장 설명을 입력하세요"
                        />
                      </div>
                    </div>
                  ))}
                  {newCenterForm.pools.length === 0 && (
                    <p className="text-gray-500 text-center py-8">수영장 정보를 추가해주세요</p>
                  )}
                </div>
              )}

              {newCenterFormTab === 'facilities' && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">시설 정보</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {newCenterForm.facilities.map((facility, index) => (
                      <div key={facility.name} className="border rounded p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="checkbox"
                            checked={facility.enabled}
                            onChange={e => {
                              const updatedFacilities = [...newCenterForm.facilities];
                              updatedFacilities[index].enabled = e.target.checked;
                              setNewCenterForm({ ...newCenterForm, facilities: updatedFacilities });
                            }}
                            className="w-4 h-4"
                          />
                          <label className="font-medium">{facility.name}</label>
                        </div>
                        {facility.enabled && facility.details && (
                          <div className="mt-2 space-y-2 pl-6">
                            {facility.details.count !== undefined && (
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">개수</label>
                                <input
                                  type="number"
                                  value={facility.details.count || ''}
                                  onChange={e => {
                                    const updatedFacilities = [...newCenterForm.facilities];
                                    if (!updatedFacilities[index].details) {
                                      updatedFacilities[index].details = {};
                                    }
                                    updatedFacilities[index].details!.count = parseInt(e.target.value) || undefined;
                                    setNewCenterForm({ ...newCenterForm, facilities: updatedFacilities });
                                  }}
                                  className="w-full border rounded px-2 py-1 text-sm"
                                  min="0"
                                />
                              </div>
                            )}
                            {facility.details.type && (
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">유형</label>
                                <input
                                  type="text"
                                  value={facility.details.type || ''}
                                  onChange={e => {
                                    const updatedFacilities = [...newCenterForm.facilities];
                                    if (!updatedFacilities[index].details) {
                                      updatedFacilities[index].details = {};
                                    }
                                    updatedFacilities[index].details!.type = e.target.value;
                                    setNewCenterForm({ ...newCenterForm, facilities: updatedFacilities });
                                  }}
                                  className="w-full border rounded px-2 py-1 text-sm"
                                  placeholder={facility.details.type}
                                />
                              </div>
                            )}
                            {facility.details.description !== undefined && (
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">설명</label>
                                <textarea
                                  value={facility.details.description || ''}
                                  onChange={e => {
                                    const updatedFacilities = [...newCenterForm.facilities];
                                    if (!updatedFacilities[index].details) {
                                      updatedFacilities[index].details = {};
                                    }
                                    updatedFacilities[index].details!.description = e.target.value;
                                    setNewCenterForm({ ...newCenterForm, facilities: updatedFacilities });
                                  }}
                                  className="w-full border rounded px-2 py-1 text-sm"
                                  rows={2}
                                  placeholder="설명을 입력하세요"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {newCenterFormTab === 'operating' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold">운영시간</h4>
                  
                  {/* 일반 운영시간 */}
                  <div className="border rounded p-4">
                    <h5 className="font-medium mb-4">일반 운영시간</h5>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h6 className="text-sm font-medium mb-3 text-gray-700">평일 운영시간</h6>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">오픈 시간 *</label>
                            <input
                              type="time"
                              value={newCenterForm.weekdaysOpen}
                              onChange={e => setNewCenterForm({ ...newCenterForm, weekdaysOpen: e.target.value })}
                              className="w-full border rounded px-3 py-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">마감 시간 *</label>
                            <input
                              type="time"
                              value={newCenterForm.weekdaysClose}
                              onChange={e => setNewCenterForm({ ...newCenterForm, weekdaysClose: e.target.value })}
                              className="w-full border rounded px-3 py-2"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <h6 className="text-sm font-medium mb-3 text-gray-700">주말 운영시간</h6>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">오픈 시간 *</label>
                            <input
                              type="time"
                              value={newCenterForm.weekendsOpen}
                              onChange={e => setNewCenterForm({ ...newCenterForm, weekendsOpen: e.target.value })}
                              className="w-full border rounded px-3 py-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">마감 시간 *</label>
                            <input
                              type="time"
                              value={newCenterForm.weekendsClose}
                              onChange={e => setNewCenterForm({ ...newCenterForm, weekendsClose: e.target.value })}
                              className="w-full border rounded px-3 py-2"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 개인레슨 운영시간 */}
                  <div className="border rounded p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h5 className="font-medium">개인레슨 운영시간</h5>
                        <p className="text-sm text-gray-500">요일별로 개인레슨 가능 시간을 설정하세요</p>
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newCenterForm.personalLessonSettings.enabled}
                          onChange={e => {
                            setNewCenterForm({
                              ...newCenterForm,
                              personalLessonSettings: {
                                ...newCenterForm.personalLessonSettings,
                                enabled: e.target.checked
                              }
                            });
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">활성화</span>
                      </label>
                    </div>
                    {newCenterForm.personalLessonSettings.enabled && (
                      <div className="space-y-4">
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day, dayIndex) => {
                          const dayLabels: Record<string, string> = {
                            monday: '월요일',
                            tuesday: '화요일',
                            wednesday: '수요일',
                            thursday: '목요일',
                            friday: '금요일',
                            saturday: '토요일',
                            sunday: '일요일'
                          };
                          const daySlot = newCenterForm.personalLessonSettings.dayTimeSlots.find(s => s.day === day);
                          const timeSlots = daySlot?.timeSlots || [];

                          return (
                            <div key={day} className="border rounded p-3 bg-gray-50">
                              <h6 className="font-medium mb-2">{dayLabels[day]}</h6>
                              {timeSlots.length > 0 ? (
                                <div className="space-y-2">
                                  {timeSlots.map((slot, slotIndex) => (
                                    <div key={slotIndex} className="flex items-center gap-2 bg-white p-2 rounded">
                                      <span className="text-sm">{slot.startTime} ~ {slot.endTime}</span>
                                      <Button
                                        onClick={() => {
                                          const updatedSlots = [...newCenterForm.personalLessonSettings.dayTimeSlots];
                                          const dayIndex = updatedSlots.findIndex(s => s.day === day);
                                          if (dayIndex >= 0) {
                                            updatedSlots[dayIndex].timeSlots = updatedSlots[dayIndex].timeSlots.filter((_, i) => i !== slotIndex);
                                            if (updatedSlots[dayIndex].timeSlots.length === 0) {
                                              updatedSlots.splice(dayIndex, 1);
                                            }
                                          }
                                          setNewCenterForm({
                                            ...newCenterForm,
                                            personalLessonSettings: {
                                              ...newCenterForm.personalLessonSettings,
                                              dayTimeSlots: updatedSlots
                                            }
                                          });
                                        }}
                                        variant="secondary"
                                        className="text-red-600 hover:text-red-700 text-xs px-2 py-1"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-400">시간대가 설정되지 않았습니다</p>
                              )}
                              <div className="mt-2 flex gap-2">
                                <input
                                  type="time"
                                  className="border rounded px-2 py-1 text-sm"
                                  defaultValue="09:00"
                                  id={`personal-${day}-start`}
                                />
                                <span className="self-center">~</span>
                                <input
                                  type="time"
                                  className="border rounded px-2 py-1 text-sm"
                                  defaultValue="18:00"
                                  id={`personal-${day}-end`}
                                />
                                <Button
                                  onClick={() => {
                                    const startInput = document.getElementById(`personal-${day}-start`) as HTMLInputElement;
                                    const endInput = document.getElementById(`personal-${day}-end`) as HTMLInputElement;
                                    const startTime = startInput?.value || '09:00';
                                    const endTime = endInput?.value || '18:00';
                                    
                                    const updatedSlots = [...newCenterForm.personalLessonSettings.dayTimeSlots];
                                    const existingDayIndex = updatedSlots.findIndex(s => s.day === day);
                                    
                                    if (existingDayIndex >= 0) {
                                      updatedSlots[existingDayIndex].timeSlots.push({ startTime, endTime });
                                    } else {
                                      updatedSlots.push({
                                        day,
                                        timeSlots: [{ startTime, endTime }]
                                      });
                                    }
                                    
                                    setNewCenterForm({
                                      ...newCenterForm,
                                      personalLessonSettings: {
                                        ...newCenterForm.personalLessonSettings,
                                        dayTimeSlots: updatedSlots
                                      }
                                    });
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-xs px-3 py-1"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  추가
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 자유수영 운영시간 */}
                  <div className="border rounded p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h5 className="font-medium">자유수영 운영시간</h5>
                        <p className="text-sm text-gray-500">요일별로 자유수영 가능 시간을 설정하세요</p>
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newCenterForm.freeSwimSettings.enabled}
                          onChange={e => {
                            setNewCenterForm({
                              ...newCenterForm,
                              freeSwimSettings: {
                                ...newCenterForm.freeSwimSettings,
                                enabled: e.target.checked
                              }
                            });
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">활성화</span>
                      </label>
                    </div>
                    {newCenterForm.freeSwimSettings.enabled && (
                      <div className="space-y-4">
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                          const dayLabels: Record<string, string> = {
                            monday: '월요일',
                            tuesday: '화요일',
                            wednesday: '수요일',
                            thursday: '목요일',
                            friday: '금요일',
                            saturday: '토요일',
                            sunday: '일요일'
                          };
                          const daySlot = newCenterForm.freeSwimSettings.dayTimeSlots.find(s => s.day === day);
                          const timeSlots = daySlot?.timeSlots || [];

                          return (
                            <div key={day} className="border rounded p-3 bg-gray-50">
                              <h6 className="font-medium mb-2">{dayLabels[day]}</h6>
                              {timeSlots.length > 0 ? (
                                <div className="space-y-2">
                                  {timeSlots.map((slot, slotIndex) => (
                                    <div key={slotIndex} className="flex items-center gap-2 bg-white p-2 rounded">
                                      <span className="text-sm">{slot.startTime} ~ {slot.endTime}</span>
                                      <Button
                                        onClick={() => {
                                          const updatedSlots = [...newCenterForm.freeSwimSettings.dayTimeSlots];
                                          const dayIndex = updatedSlots.findIndex(s => s.day === day);
                                          if (dayIndex >= 0) {
                                            updatedSlots[dayIndex].timeSlots = updatedSlots[dayIndex].timeSlots.filter((_, i) => i !== slotIndex);
                                            if (updatedSlots[dayIndex].timeSlots.length === 0) {
                                              updatedSlots.splice(dayIndex, 1);
                                            }
                                          }
                                          setNewCenterForm({
                                            ...newCenterForm,
                                            freeSwimSettings: {
                                              ...newCenterForm.freeSwimSettings,
                                              dayTimeSlots: updatedSlots
                                            }
                                          });
                                        }}
                                        variant="secondary"
                                        className="text-red-600 hover:text-red-700 text-xs px-2 py-1"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-400">시간대가 설정되지 않았습니다</p>
                              )}
                              <div className="mt-2 flex gap-2">
                                <input
                                  type="time"
                                  className="border rounded px-2 py-1 text-sm"
                                  defaultValue="09:00"
                                  id={`freeswim-${day}-start`}
                                />
                                <span className="self-center">~</span>
                                <input
                                  type="time"
                                  className="border rounded px-2 py-1 text-sm"
                                  defaultValue="18:00"
                                  id={`freeswim-${day}-end`}
                                />
                                <Button
                                  onClick={() => {
                                    const startInput = document.getElementById(`freeswim-${day}-start`) as HTMLInputElement;
                                    const endInput = document.getElementById(`freeswim-${day}-end`) as HTMLInputElement;
                                    const startTime = startInput?.value || '09:00';
                                    const endTime = endInput?.value || '18:00';
                                    
                                    const updatedSlots = [...newCenterForm.freeSwimSettings.dayTimeSlots];
                                    const existingDayIndex = updatedSlots.findIndex(s => s.day === day);
                                    
                                    if (existingDayIndex >= 0) {
                                      updatedSlots[existingDayIndex].timeSlots.push({ startTime, endTime });
                                    } else {
                                      updatedSlots.push({
                                        day,
                                        timeSlots: [{ startTime, endTime }]
                                      });
                                    }
                                    
                                    setNewCenterForm({
                                      ...newCenterForm,
                                      freeSwimSettings: {
                                        ...newCenterForm.freeSwimSettings,
                                        dayTimeSlots: updatedSlots
                                      }
                                    });
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-xs px-3 py-1"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  추가
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {newCenterFormTab === 'other' && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">기타 정보</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">수용 인원 *</label>
                    <input
                      type="number"
                      value={newCenterForm.capacity}
                      onChange={e => setNewCenterForm({ ...newCenterForm, capacity: parseInt(e.target.value) || 0 })}
                      className="w-full border rounded px-3 py-2"
                      min="10"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={newCenterForm.parkingAvailable}
                        onChange={e => setNewCenterForm({ ...newCenterForm, parkingAvailable: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <label className="font-medium">주차 가능</label>
                    </div>
                    {newCenterForm.parkingAvailable && (
                      <div className="mt-2 pl-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">주차 대수</label>
                        <input
                          type="number"
                          value={newCenterForm.parkingSpaces}
                          onChange={e => setNewCenterForm({ ...newCenterForm, parkingSpaces: parseInt(e.target.value) || 0 })}
                          className="w-full border rounded px-3 py-2"
                          min="0"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 푸터 */}
            <div className="p-6 border-t flex justify-between">
              <div className="flex gap-2">
                {newCenterFormTab !== 'basic' && (
                  <Button
                    onClick={() => {
                      const tabs: Array<'basic' | 'pools' | 'facilities' | 'operating' | 'other'> = ['basic', 'pools', 'facilities', 'operating', 'other'];
                      const currentIndex = tabs.indexOf(newCenterFormTab);
                      if (currentIndex > 0) {
                        setNewCenterFormTab(tabs[currentIndex - 1]);
                      }
                    }}
                    variant="secondary"
                  >
                    이전
                  </Button>
                )}
                {newCenterFormTab !== 'other' && (
                  <Button
                    onClick={() => {
                      const tabs: Array<'basic' | 'pools' | 'facilities' | 'operating' | 'other'> = ['basic', 'pools', 'facilities', 'operating', 'other'];
                      const currentIndex = tabs.indexOf(newCenterFormTab);
                      if (currentIndex < tabs.length - 1) {
                        setNewCenterFormTab(tabs[currentIndex + 1]);
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    다음
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowAddCenterModal(false);
                    setNewCenterFormTab('basic');
                    setNewCenterForm({
                      name: '',
                      address: '',
                      postalCode: '',
                      city: '',
                      province: '',
                      phone: '',
                      email: '',
                      description: '',
                      pools: [],
                      facilities: JSON.parse(JSON.stringify(FACILITY_TEMPLATES)),
                      weekdaysOpen: '06:00',
                      weekdaysClose: '22:00',
                      weekendsOpen: '08:00',
                      weekendsClose: '20:00',
                      personalLessonSettings: {
                        enabled: true,
                        dayTimeSlots: [],
                        cancellationPolicy: '24시간 전 취소 가능'
                      },
                      freeSwimSettings: {
                        enabled: true,
                        dayTimeSlots: [],
                        cancellationPolicy: ''
                      },
                      capacity: 50,
                      parkingAvailable: false,
                      parkingSpaces: 0
                    });
                  }}
                  variant="secondary"
                >
                  취소
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      // 필수 필드 검증
                      if (!newCenterForm.name || !newCenterForm.address || !newCenterForm.phone || !newCenterForm.email) {
                        alert('필수 항목을 모두 입력해주세요.');
                        setNewCenterFormTab('basic');
                        return;
                      }
                      if (newCenterForm.pools.length === 0) {
                        alert('최소 1개 이상의 수영장 정보를 입력해주세요.');
                        setNewCenterFormTab('pools');
                        return;
                      }

                      const token = localStorage.getItem('token');
                      // 센터 등록 신청 API 호출
                      const response = await fetch('http://localhost:5000/api/center-registrations', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          centerName: newCenterForm.name,
                          businessNumber: `BIZ-${Date.now()}`, // 임시 사업자등록번호
                          representativeName: user?.name || '',
                          representativeEmail: newCenterForm.email,
                          representativePhone: newCenterForm.phone,
                          password: 'temp123!', // 임시 비밀번호 (나중에 변경해야 함)
                          address: {
                            postalCode: newCenterForm.postalCode,
                            address1: newCenterForm.address,
                            address2: '',
                            city: newCenterForm.city,
                            province: newCenterForm.province
                          },
                          centerInfo: {
                            description: newCenterForm.description,
                            pools: newCenterForm.pools,
                            facilities: newCenterForm.facilities.filter(f => f.enabled),
                            operatingHours: {
                              weekdays: {
                                open: newCenterForm.weekdaysOpen,
                                close: newCenterForm.weekdaysClose
                              },
                              weekends: {
                                open: newCenterForm.weekendsOpen,
                                close: newCenterForm.weekendsClose
                              }
                            },
                            personalLesson: {
                              enabled: newCenterForm.personalLessonSettings.enabled,
                              dayTimeSlots: newCenterForm.personalLessonSettings.dayTimeSlots,
                              cancellationPolicy: newCenterForm.personalLessonSettings.cancellationPolicy
                            },
                            freeSwim: {
                              enabled: newCenterForm.freeSwimSettings.enabled,
                              dayTimeSlots: newCenterForm.freeSwimSettings.dayTimeSlots,
                              cancellationPolicy: newCenterForm.freeSwimSettings.cancellationPolicy
                            },
                            capacity: newCenterForm.capacity,
                            parkingAvailable: newCenterForm.parkingAvailable,
                            parkingSpaces: newCenterForm.parkingAvailable ? newCenterForm.parkingSpaces : undefined
                          },
                          applicant: {
                            name: user?.name || '',
                            email: newCenterForm.email,
                            phone: newCenterForm.phone,
                            position: '센터 관리자'
                          }
                        })
                      });

                      const result = await response.json();
                      if (result.success) {
                        alert('센터 등록 신청이 완료되었습니다. 관리자 승인 후 이용하실 수 있습니다.');
                        setShowAddCenterModal(false);
                        setNewCenterFormTab('basic');
                        setNewCenterForm({
                          name: '',
                          address: '',
                          postalCode: '',
                          city: '',
                          province: '',
                          phone: '',
                          email: '',
                          description: '',
                          pools: [],
                          facilities: JSON.parse(JSON.stringify(FACILITY_TEMPLATES)),
                          weekdaysOpen: '06:00',
                          weekdaysClose: '22:00',
                          weekendsOpen: '08:00',
                          weekendsClose: '20:00',
                          capacity: 50,
                          parkingAvailable: false,
                          parkingSpaces: 0
                        });
                      } else {
                        alert(result.message || '센터 추가에 실패했습니다.');
                      }
                    } catch (error: any) {
                      console.error('센터 추가 오류:', error);
                      alert(error.response?.data?.message || '센터 추가 중 오류가 발생했습니다.');
                    }
                  }}
                  disabled={!newCenterForm.name || !newCenterForm.address || !newCenterForm.phone || !newCenterForm.email || newCenterForm.pools.length === 0}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  센터 등록 신청
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(CenterInfoManagementPage, { requireTypes: ['centerAdmin', 'superAdmin'] });
