/**
 * 📋 JJ Swim Lab - 외부 회원 개인레슨 요청 모달
 * 
 * 📋 **컴포넌트 목적**
 * - 외부 회원이 개인레슨을 요청할 때 사용하는 모달
 * - 장소(센터)와 시간을 모두 설정 가능
 * - 레인대여와 연동하여 장소 섭외 기능 제공
 * 
 * 🗄️ **데이터 연동**
 * - GET /api/centers/public - 센터 목록 조회
 * - GET /api/lane-rentals/availability/:date/:time - 레인 가용성 확인
 * - POST /api/personal-lessons/external-request - 외부 회원 개인레슨 요청
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, MapPin, Clock, Calendar, Users, AlertCircle } from 'lucide-react';

interface Center {
  _id: string;
  name: string;
  location?: {
    address?: string;
    province?: string;
    city?: string;
    gu?: string;
    dong?: string;
  };
  poolConfiguration?: {
    mainPool?: { lanes: number };
    kidsPool?: { lanes: number };
    auxiliaryPool?: { lanes: number };
  };
}

interface ExternalPersonalLessonRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function ExternalPersonalLessonRequestModal({
  isOpen,
  onClose,
  onSubmit
}: ExternalPersonalLessonRequestModalProps) {
  const [centers, setCenters] = useState<Center[]>([]);
  const [loadingCenters, setLoadingCenters] = useState(false);
  const [availableLanes, setAvailableLanes] = useState<number[]>([]);
  const [loadingLanes, setLoadingLanes] = useState(false);
  
  const [formData, setFormData] = useState({
    requestedCenterId: '',
    date: '',
    startTime: '',
    endTime: '',
    duration: 60,
    lessonType: 'freestyle',
    skillLevel: 'beginner',
    goals: '',
    notes: '',
    poolType: 'mainPool' as 'mainPool' | 'kidsPool' | 'auxiliaryPool',
    laneNumber: 1,
    requestLaneRental: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      loadCenters();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.requestedCenterId && formData.date && formData.startTime) {
      checkLaneAvailability();
    } else {
      setAvailableLanes([]);
    }
  }, [formData.requestedCenterId, formData.date, formData.startTime, formData.duration, formData.poolType]);

  const loadCenters = async () => {
    try {
      setLoadingCenters(true);
      const response = await fetch('http://localhost:5000/api/centers/public');
      const result = await response.json();
      
      if (result.success && result.data?.centers) {
        setCenters(result.data.centers);
      }
    } catch (error) {
      console.error('센터 목록 로드 실패:', error);
    } finally {
      setLoadingCenters(false);
    }
  };

  const checkLaneAvailability = async () => {
    if (!formData.requestedCenterId || !formData.date || !formData.startTime) {
      return;
    }

    try {
      setLoadingLanes(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/lane-rentals/availability/${formData.date}/${formData.startTime}?duration=${formData.duration}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.availableLanes) {
          setAvailableLanes(result.data.availableLanes);
        }
      }
    } catch (error) {
      console.error('레인 가용성 확인 실패:', error);
    } finally {
      setLoadingLanes(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDurationChange = (duration: number) => {
    handleChange('duration', duration);
    // 종료 시간 자동 계산
    if (formData.startTime) {
      const [h, m] = formData.startTime.split(':').map(Number);
      const end = new Date(2000, 0, 1, h, m + duration, 0);
      const endTime = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
      handleChange('endTime', endTime);
    }
  };

  const handleStartTimeChange = (startTime: string) => {
    handleChange('startTime', startTime);
    // 종료 시간 자동 계산
    if (formData.duration) {
      const [h, m] = startTime.split(':').map(Number);
      const end = new Date(2000, 0, 1, h, m + formData.duration, 0);
      const endTime = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
      handleChange('endTime', endTime);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.requestedCenterId) {
      newErrors.requestedCenterId = '센터를 선택해주세요.';
    }
    if (!formData.date) {
      newErrors.date = '날짜를 선택해주세요.';
    }
    if (!formData.startTime) {
      newErrors.startTime = '시작 시간을 선택해주세요.';
    }
    if (!formData.lessonType) {
      newErrors.lessonType = '레슨 타입을 선택해주세요.';
    }
    if (!formData.skillLevel) {
      newErrors.skillLevel = '스킬 레벨을 선택해주세요.';
    }
    if (!formData.goals) {
      newErrors.goals = '목표를 입력해주세요.';
    }
    if (formData.requestLaneRental && !formData.laneNumber) {
      newErrors.laneNumber = '레인 번호를 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    onSubmit(formData);
  };

  const selectedCenter = centers.find(c => c._id === formData.requestedCenterId);
  const maxLanes = selectedCenter?.poolConfiguration?.[formData.poolType]?.lanes || 10;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">외부 회원 개인레슨 요청</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 센터 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              센터 선택 (장소 섭외)
            </label>
            {loadingCenters ? (
              <div className="text-sm text-gray-500">센터 목록 로딩 중...</div>
            ) : (
              <select
                value={formData.requestedCenterId}
                onChange={(e) => handleChange('requestedCenterId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${errors.requestedCenterId ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">센터를 선택하세요</option>
                {centers.map(center => (
                  <option key={center._id} value={center._id}>
                    {center.name} {center.location?.address && `- ${center.location.address}`}
                  </option>
                ))}
              </select>
            )}
            {errors.requestedCenterId && (
              <p className="mt-1 text-sm text-red-600">{errors.requestedCenterId}</p>
            )}
          </div>

          {/* 날짜 및 시간 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                날짜
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-lg ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                시작 시간
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${errors.startTime ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.startTime && (
                <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종료 시간
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                수업 시간 (분)
              </label>
              <select
                value={formData.duration}
                onChange={(e) => handleDurationChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value={30}>30분</option>
                <option value={60}>60분</option>
                <option value={90}>90분</option>
                <option value={120}>120분</option>
              </select>
            </div>
          </div>

          {/* 레인대여 연동 */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="requestLaneRental"
                checked={formData.requestLaneRental}
                onChange={(e) => handleChange('requestLaneRental', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="requestLaneRental" className="text-sm font-medium text-gray-700">
                레인대여 신청 (장소 섭외)
              </label>
            </div>

            {formData.requestLaneRental && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    풀 타입
                  </label>
                  <select
                    value={formData.poolType}
                    onChange={(e) => handleChange('poolType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="mainPool">메인 풀</option>
                    <option value="kidsPool">키즈 풀</option>
                    <option value="auxiliaryPool">보조 풀</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    레인 번호
                  </label>
                  {loadingLanes ? (
                    <div className="text-sm text-gray-500">가용 레인 확인 중...</div>
                  ) : (
                    <>
                      <select
                        value={formData.laneNumber}
                        onChange={(e) => handleChange('laneNumber', Number(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-lg ${errors.laneNumber ? 'border-red-500' : 'border-gray-300'}`}
                      >
                        {Array.from({ length: maxLanes }, (_, i) => i + 1).map(lane => (
                          <option key={lane} value={lane}>
                            {lane}레인 {availableLanes.includes(lane) ? '✅' : '❌'}
                          </option>
                        ))}
                      </select>
                      {availableLanes.length > 0 && (
                        <p className="mt-1 text-xs text-green-600">
                          ✅ 사용 가능한 레인: {availableLanes.join(', ')}레인
                        </p>
                      )}
                      {availableLanes.length === 0 && formData.date && formData.startTime && (
                        <p className="mt-1 text-xs text-yellow-600 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          해당 시간에 사용 가능한 레인이 없습니다.
                        </p>
                      )}
                    </>
                  )}
                  {errors.laneNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.laneNumber}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 레슨 정보 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                레슨 타입
              </label>
              <select
                value={formData.lessonType}
                onChange={(e) => handleChange('lessonType', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${errors.lessonType ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="freestyle">자유형</option>
                <option value="backstroke">배영</option>
                <option value="breaststroke">평영</option>
                <option value="butterfly">접영</option>
              </select>
              {errors.lessonType && (
                <p className="mt-1 text-sm text-red-600">{errors.lessonType}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                스킬 레벨
              </label>
              <select
                value={formData.skillLevel}
                onChange={(e) => handleChange('skillLevel', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${errors.skillLevel ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="beginner">초급</option>
                <option value="intermediate">중급</option>
                <option value="advanced">고급</option>
              </select>
              {errors.skillLevel && (
                <p className="mt-1 text-sm text-red-600">{errors.skillLevel}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              목표
            </label>
            <textarea
              value={formData.goals}
              onChange={(e) => handleChange('goals', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg ${errors.goals ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="수업 목표를 입력하세요"
            />
            {errors.goals && (
              <p className="mt-1 text-sm text-red-600">{errors.goals}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              특이사항 (선택)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="특이사항을 입력하세요"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              요청하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

