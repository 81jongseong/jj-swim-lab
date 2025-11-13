'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  Users, 
  Calendar, 
  DollarSign,
  Zap,
  Star,
  Target,
  Waves,
  Timer,
  CheckCircle,
  AlertCircle,
  Navigation,
  Phone,
  MessageSquare
} from 'lucide-react';

interface SmartMeetupCreatorProps {
  onSubmit?: (meetupData: any) => void;
  onCancel?: () => void;
}

export const SmartMeetupCreator: React.FC<SmartMeetupCreatorProps> = ({
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    meetupType: string;
    skillLevel: string;
    location: {
      type: 'preset' | 'custom';
      preset: string;
      custom: string;
      address: string;
      latitude: number;
      longitude: number;
    };
    datetime: {
      date: string;
      time: string;
      duration: number;
      isFlexible: boolean;
    };
    participants: {
      min: number;
      max: number;
      current: number;
      autoConfirm: boolean;
      requireApproval: boolean;
    };
    fee: {
      hasFee: boolean;
      amount: number;
      description: string;
      paymentMethod: string;
    };
    requirements: {
      skillLevel: string;
      equipment: string[];
      ageRange: { min: number; max: number };
      genderPreference: string;
    };
    contact: {
      method: string;
      phone: string;
      kakao: string;
      emergencyContact: string;
    };
  }>({
    title: '',
    description: '',
    meetupType: '',
    skillLevel: '',
    location: {
      type: 'preset',
      preset: '',
      custom: '',
      address: '',
      latitude: 0,
      longitude: 0
    },
    datetime: {
      date: '',
      time: '',
      duration: 60,
      isFlexible: false
    },
    participants: {
      min: 2,
      max: 8,
      current: 1,
      autoConfirm: true,
      requireApproval: false
    },
    fee: {
      hasFee: false,
      amount: 0,
      description: '',
      paymentMethod: 'split'
    },
    requirements: {
      skillLevel: 'all',
      equipment: [],
      ageRange: { min: 0, max: 100 },
      genderPreference: 'mixed'
    },
    contact: {
      method: 'app',
      phone: '',
      kakao: '',
      emergencyContact: ''
    }
  });

  // 미리 설정된 인기 장소들
  const presetLocations = [
    { 
      id: 'jamsil', 
      name: '잠실 수영장', 
      address: '서울 송파구 올림픽로 424',
      type: 'public',
      facilities: ['샤워실', '주차장', '매점'],
      avgRating: 4.2,
      priceRange: '3,000-5,000원'
    },
    { 
      id: 'yeouido', 
      name: '여의도 한강공원 수영장', 
      address: '서울 영등포구 여의동로 330',
      type: 'outdoor',
      facilities: ['야외수영장', '주차장', '편의점'],
      avgRating: 4.5,
      priceRange: '무료'
    },
    { 
      id: 'gangnam', 
      name: '강남 스포츠센터', 
      address: '서울 강남구 테헤란로 123',
      type: 'premium',
      facilities: ['사우나', '헬스장', '주차장', '카페'],
      avgRating: 4.7,
      priceRange: '8,000-12,000원'
    },
    { 
      id: 'hongdae', 
      name: '홍대 아쿠아틱센터', 
      address: '서울 마포구 홍익로 94',
      type: 'modern',
      facilities: ['최신시설', '샤워실', '주차장'],
      avgRating: 4.4,
      priceRange: '6,000-8,000원'
    }
  ];

  // 추천 시간대
  const recommendedTimes = [
    { time: '06:00', label: '새벽 (6시)', popularity: '높음', pros: ['한적함', '저렴함'] },
    { time: '09:00', label: '오전 (9시)', popularity: '보통', pros: ['적당한 인원', '좋은 수질'] },
    { time: '14:00', label: '오후 (2시)', popularity: '낮음', pros: ['매우 한적함', '개인 연습'] },
    { time: '18:00', label: '저녁 (6시)', popularity: '매우 높음', pros: ['퇴근 후', '활발한 분위기'] },
    { time: '20:00', label: '야간 (8시)', popularity: '높음', pros: ['여유로움', '조명 수영'] }
  ];

  // 모임 타입별 설정
  const meetupTypes = {
    practice: {
      name: '자유 연습',
      icon: '🏊‍♂️',
      description: '개인 연습 및 자유 수영',
      recommendedDuration: 60,
      recommendedSize: { min: 2, max: 6 },
      equipment: ['수영복', '수경', '수모']
    },
    lesson: {
      name: '그룹 레슨',
      icon: '👨‍🏫',
      description: '함께 배우는 그룹 강습',
      recommendedDuration: 90,
      recommendedSize: { min: 3, max: 8 },
      equipment: ['수영복', '수경', '수모', '킥보드']
    },
    competition: {
      name: '미니 대회',
      icon: '🏆',
      description: '친선 경기 및 기록 측정',
      recommendedDuration: 120,
      recommendedSize: { min: 4, max: 12 },
      equipment: ['수영복', '수경', '수모', '스톱워치']
    },
    social: {
      name: '소셜 수영',
      icon: '🎉',
      description: '친목 도모 및 즐거운 수영',
      recommendedDuration: 90,
      recommendedSize: { min: 4, max: 10 },
      equipment: ['수영복', '수경', '수모']
    }
  };

  // 모임 타입 선택 시 자동 설정
  const handleMeetupTypeChange = (type: string) => {
    const typeConfig = meetupTypes[type as keyof typeof meetupTypes];
    if (typeConfig) {
      setFormData(prev => ({
        ...prev,
        meetupType: type,
        datetime: {
          ...prev.datetime,
          duration: typeConfig.recommendedDuration
        },
        participants: {
          ...prev.participants,
          min: typeConfig.recommendedSize.min,
          max: typeConfig.recommendedSize.max
        },
        requirements: {
          ...prev.requirements,
          equipment: typeConfig.equipment
        }
      }));
    }
  };

  // 스마트 제목 생성
  const generateSmartTitle = () => {
    const typeConfig = meetupTypes[formData.meetupType as keyof typeof meetupTypes];
    const location = formData.location.preset ? 
      presetLocations.find(l => l.id === formData.location.preset)?.name.split(' ')[0] :
      '수영장';
    const date = formData.datetime.date ? new Date(formData.datetime.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : '';
    const time = formData.datetime.time ? formData.datetime.time.slice(0, 5) : '';
    
    if (typeConfig && location && date && time) {
      const smartTitle = `${date} ${time} ${location} ${typeConfig.name} (${formData.participants.min}-${formData.participants.max}명)`;
      setFormData(prev => ({ ...prev, title: smartTitle }));
    }
  };

  // 날짜/시간 변경 시 자동 제목 업데이트
  useEffect(() => {
    if (formData.meetupType && formData.location.preset && formData.datetime.date && formData.datetime.time) {
      generateSmartTitle();
    }
  }, [formData.meetupType, formData.location.preset, formData.datetime.date, formData.datetime.time]);

  // 현재 위치 기반 추천 장소
  const getNearbyLocations = () => {
    // 실제 환경에서는 GPS 기반으로 가까운 수영장 추천
    return presetLocations.slice(0, 3);
  };

  // 인기 시간대 추천
  const getRecommendedTimeSlots = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentHour = now.getHours();
    
    return recommendedTimes.filter(time => {
      const timeHour = parseInt(time.time.split(':')[0]);
      return timeHour > currentHour; // 현재 시간 이후만
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!formData.meetupType || !formData.datetime.date || !formData.datetime.time) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }
    
    if (formData.participants.min >= formData.participants.max) {
      alert('최대 인원은 최소 인원보다 많아야 합니다.');
      return;
    }

    // 모임 데이터 준비
    const meetupData = {
      title: formData.title,
      content: formData.description,
      meetupDate: new Date(`${formData.datetime.date}T${formData.datetime.time}`),
      location: formData.location.preset ? 
        presetLocations.find(l => l.id === formData.location.preset)?.name + ' - ' + presetLocations.find(l => l.id === formData.location.preset)?.address :
        formData.location.custom,
      maxParticipants: formData.participants.max,
      meetupType: formData.meetupType,
      skill_level: formData.skillLevel || 'all',
      fee: formData.fee.hasFee ? formData.fee.amount : 0,
      
      // 추가 정보
      duration: formData.datetime.duration,
      minParticipants: formData.participants.min,
      autoConfirm: formData.participants.autoConfirm,
      requireApproval: formData.participants.requireApproval,
      requirements: formData.requirements,
      contact: formData.contact
    };

    onSubmit?.(meetupData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 text-white">
          <h2 className="text-2xl font-bold flex items-center">
            <Zap className="h-6 w-6 mr-2" />
            스마트 번개모임 만들기
          </h2>
          <p className="text-blue-100 mt-1">몇 번의 클릭으로 완벽한 수영 모임을 만들어보세요!</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* 1단계: 모임 타입 선택 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-600" />
              어떤 모임을 만들까요?
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(meetupTypes).map(([key, type]) => (
                <motion.button
                  key={key}
                  type="button"
                  onClick={() => handleMeetupTypeChange(key)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.meetupType === key
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-3xl mb-2">{type.icon}</div>
                  <div className="font-medium">{type.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                  <div className="text-xs text-blue-600 mt-2">
                    {type.recommendedSize.min}-{type.recommendedSize.max}명 • {type.recommendedDuration}분
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* 2단계: 스마트 장소 선택 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-green-600" />
              어디서 만날까요?
            </h3>
            
            <div className="flex space-x-4 mb-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, location: { ...prev.location, type: 'preset' } }))}
                className={`px-4 py-2 rounded-lg ${
                  formData.location.type === 'preset'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                인기 장소에서 선택
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, location: { ...prev.location, type: 'custom' } }))}
                className={`px-4 py-2 rounded-lg ${
                  formData.location.type === 'custom'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                직접 입력
              </button>
            </div>

            {formData.location.type === 'preset' ? (
              <div className="grid md:grid-cols-2 gap-4">
                {presetLocations.map((location) => (
                  <motion.button
                    key={location.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      location: { ...prev.location, preset: location.id }
                    }))}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      formData.location.preset === location.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{location.name}</h4>
                      <div className="flex items-center text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm ml-1">{location.avgRating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{location.address}</p>
                    <div className="flex justify-between items-end">
                      <div className="text-xs text-blue-600">{location.priceRange}</div>
                      <div className="text-xs text-gray-500">
                        {location.facilities.slice(0, 2).join(', ')}
                        {location.facilities.length > 2 && ` +${location.facilities.length - 2}`}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.location.custom}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    location: { ...prev.location, custom: e.target.value }
                  }))}
                  placeholder="수영장 이름을 입력하세요"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    location: { ...prev.location, address: e.target.value }
                  }))}
                  placeholder="주소를 입력하세요"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
            )}
          </div>

          {/* 3단계: 스마트 시간 선택 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Clock className="h-5 w-5 mr-2 text-purple-600" />
              언제 만날까요?
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">날짜</label>
                <input
                  type="date"
                  value={formData.datetime.date}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    datetime: { ...prev.datetime, date: e.target.value }
                  }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">추천 시간대</label>
                <div className="grid grid-cols-2 gap-2">
                  {getRecommendedTimeSlots().slice(0, 4).map((timeSlot) => (
                    <button
                      key={timeSlot.time}
                      type="button"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        datetime: { ...prev.datetime, time: timeSlot.time }
                      }))}
                      className={`p-2 rounded-lg border text-sm ${
                        formData.datetime.time === timeSlot.time
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{timeSlot.label}</div>
                      <div className="text-xs text-gray-500">인기: {timeSlot.popularity}</div>
                    </button>
                  ))}
                </div>
                
                <div className="mt-3">
                  <label className="block text-sm text-gray-600 mb-1">또는 직접 선택</label>
                  <input
                    type="time"
                    value={formData.datetime.time}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      datetime: { ...prev.datetime, time: e.target.value }
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">예상 소요시간</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="30"
                    max="180"
                    step="15"
                    value={formData.datetime.duration}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      datetime: { ...prev.datetime, duration: Number(e.target.value) }
                    }))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-16">{formData.datetime.duration}분</span>
                </div>
              </div>
              
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.datetime.isFlexible}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      datetime: { ...prev.datetime, isFlexible: e.target.checked }
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm">시간 조정 가능</span>
                </label>
              </div>
            </div>
          </div>

          {/* 4단계: 스마트 인원 관리 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Users className="h-5 w-5 mr-2 text-orange-600" />
              몇 명이서 만날까요?
            </h3>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">최소 인원</label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        participants: { ...prev.participants, min: Math.max(2, prev.participants.min - 1) }
                      }))}
                      className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      <span className="h-4 w-4">➖</span>
                    </button>
                    <span className="text-xl font-bold w-8 text-center">{formData.participants.min}</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        participants: { ...prev.participants, min: Math.min(prev.participants.max - 1, prev.participants.min + 1) }
                      }))}
                      className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      <span className="h-4 w-4">➕</span>
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">최대 인원</label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        participants: { ...prev.participants, max: Math.max(prev.participants.min + 1, prev.participants.max - 1) }
                      }))}
                      className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      <span className="h-4 w-4">➖</span>
                    </button>
                    <span className="text-xl font-bold w-8 text-center">{formData.participants.max}</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        participants: { ...prev.participants, max: Math.min(20, prev.participants.max + 1) }
                      }))}
                      className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      <span className="h-4 w-4">➕</span>
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">현재 참가자</label>
                  <div className="text-center">
                    <span className="text-xl font-bold text-green-600">1</span>
                    <span className="text-sm text-gray-500 ml-1">(본인)</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid md:grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.participants.autoConfirm}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      participants: { ...prev.participants, autoConfirm: e.target.checked }
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm">자동 참가 승인</span>
                  <span className="text-xs text-gray-500 ml-2">(빠른 모집)</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.participants.requireApproval}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      participants: { ...prev.participants, requireApproval: e.target.checked }
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm">참가 승인 필요</span>
                  <span className="text-xs text-gray-500 ml-2">(신중한 선별)</span>
                </label>
              </div>
            </div>
          </div>

          {/* 5단계: 비용 및 연락처 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              비용 및 연락처
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.fee.hasFee}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      fee: { ...prev.fee, hasFee: e.target.checked }
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm">참가비 있음</span>
                </label>
                
                {formData.fee.hasFee && (
                  <div className="space-y-3 pl-6">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">1인당 참가비</label>
                      <input
                        type="number"
                        value={formData.fee.amount}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          fee: { ...prev.fee, amount: Number(e.target.value) }
                        }))}
                        placeholder="원"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">비용 설명</label>
                      <input
                        type="text"
                        value={formData.fee.description}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          fee: { ...prev.fee, description: e.target.value }
                        }))}
                        placeholder="예: 수영장 입장료, 장비 대여료 포함"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">연락 방법</label>
                  <select
                    value={formData.contact.method}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      contact: { ...prev.contact, method: e.target.value }
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="app">앱 내 메시지</option>
                    <option value="phone">전화번호</option>
                    <option value="kakao">카카오톡</option>
                  </select>
                </div>
                
                {formData.contact.method === 'phone' && (
                  <input
                    type="tel"
                    value={formData.contact.phone}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      contact: { ...prev.contact, phone: e.target.value }
                    }))}
                    placeholder="전화번호"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                )}
                
                {formData.contact.method === 'kakao' && (
                  <input
                    type="text"
                    value={formData.contact.kakao}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      contact: { ...prev.contact, kakao: e.target.value }
                    }))}
                    placeholder="카카오톡 ID"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                )}
              </div>
            </div>
          </div>

          {/* 6단계: 모임 설명 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-cyan-600" />
              모임 소개
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">자동 생성된 제목</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg bg-blue-50"
                placeholder="자동으로 생성됩니다"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">상세 설명</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="모임에 대한 추가 정보를 입력하세요. 예: 준비물, 주의사항, 모임 분위기 등"
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* 미리보기 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-3 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              모임 미리보기
            </h4>
            <div className="bg-white rounded-lg p-4 border">
              <h5 className="font-medium text-lg mb-2">{formData.title || '제목이 자동 생성됩니다'}</h5>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formData.datetime.date && formData.datetime.time ? 
                    `${new Date(formData.datetime.date).toLocaleDateString()} ${formData.datetime.time}` :
                    '날짜/시간 선택 필요'
                  }
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {formData.location.preset ? 
                    presetLocations.find(l => l.id === formData.location.preset)?.name :
                    formData.location.custom || '장소 선택 필요'
                  }
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  {formData.participants.min}-{formData.participants.max}명
                </div>
                <div className="flex items-center text-gray-600">
                  <Timer className="h-4 w-4 mr-2" />
                  약 {formData.datetime.duration}분
                </div>
              </div>
              {formData.fee.hasFee && (
                <div className="mt-2 text-sm text-green-600 font-medium">
                  참가비: {formData.fee.amount.toLocaleString()}원
                </div>
              )}
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 font-medium flex items-center"
            >
              <Zap className="h-5 w-5 mr-2" />
              번개모임 만들기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SmartMeetupCreator;
