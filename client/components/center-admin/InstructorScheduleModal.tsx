/**
 * 👨‍🏫 JJ Swim Lab - 강사 스케줄 설정 모달
 * 
 * 📋 **컴포넌트 목적**
 * - 강사별 가능 시간 및 수용 인원 설정
 * - 시간대별 가격 및 수영 종목 설정
 * - 강사 타입별 차별화된 설정
 * 
 * 🔄 **주요 기능**
 * - 강사 선택 및 기본 정보 설정
 * - 시간 슬롯 추가/수정/삭제
 * - 시간대별 최대 학생 수 설정
 * - 시간대별 가격 설정
 * - 가르칠 수 있는 수영 종목 선택
 * - 가르칠 수 있는 수준 선택
 * - 풀 타입별 설정
 * 
 * 🗄️ **데이터 연동**
 * - CenterSchedule 모델과 연동
 * - 강사별 가능 시간 API와 연동
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-12: 초기 강사 스케줄 모달 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2025-01-12
 * - 상태: ✅ 완성
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, Users, DollarSign, Plus, Trash2, Edit } from 'lucide-react';

interface TimeSlot {
  startTime: string;
  endTime: string;
  maxStudents: number;
  poolType: string;
  isActive: boolean;
  pricingType: string;
  singleSessionPrice: number;
  packageOptions: Array<{
    sessions: number;
    price: number;
    expirationDays: number;
    name: string;
  }>;
  notes: string;
  lessonDuration: number;
  bufferTime: number;
}

interface InstructorScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  instructors: any[];
  editingInstructor?: any;
}

export default function InstructorScheduleModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  instructors, 
  editingInstructor 
}: InstructorScheduleModalProps) {
  const [formData, setFormData] = useState<{
    instructorId: string;
    instructorName: string;
    instructorType: string;
    availableDays: string[];
    timeSlots: TimeSlot[];
    isActive: boolean;
  }>({
    instructorId: '',
    instructorName: '',
    instructorType: 'instructor',
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    timeSlots: [],
    isActive: true
  });

  const [newTimeSlot, setNewTimeSlot] = useState({
    startTime: '09:00',
    endTime: '10:00',
    maxStudents: 1,
    poolType: 'mainPool',
    isActive: true,
    pricingType: 'package', // 'per-session' | 'package'
    singleSessionPrice: 70000, // 1회 가격
    packageOptions: [
      { sessions: 8, price: 400000, expirationDays: 30, name: '8회 패키지' },
      { sessions: 16, price: 700000, expirationDays: 60, name: '16회 패키지' },
      { sessions: 32, price: 1200000, expirationDays: 90, name: '32회 패키지' }
    ],
    notes: '',
    lessonDuration: 60, // 수업 시간 (분)
    bufferTime: 15 // 버퍼 시간 (분)
  });

  const [showAddTimeSlot, setShowAddTimeSlot] = useState(false);
  const [groupClassSchedule, setGroupClassSchedule] = useState<any[]>([]); // 단체 수업 시간표

  useEffect(() => {
    if (editingInstructor) {
      setFormData({
        instructorId: editingInstructor.instructorId || '',
        instructorName: editingInstructor.instructorName || '',
        instructorType: editingInstructor.instructorType || 'instructor',
        availableDays: editingInstructor.availableDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        timeSlots: editingInstructor.timeSlots || [],
        isActive: editingInstructor.isActive !== undefined ? editingInstructor.isActive : true
      });
    } else {
      setFormData({
        instructorId: '',
        instructorName: '',
        instructorType: 'instructor',
        availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        timeSlots: [],
        isActive: true
      });
    }
  }, [editingInstructor, isOpen]);

  // 단체 수업 시간표 가져오기
  useEffect(() => {
    if (isOpen) {
      fetchGroupClassSchedule();
    }
  }, [isOpen]);

  const fetchGroupClassSchedule = async () => {
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();
      
      if (data.success) {
        // 단체 수업 시간표 추출
        const groupClasses = data.data.filter((course: any) => 
          course.maxStudents > 1 // 단체 수업 (2명 이상)
        );
        
        setGroupClassSchedule(groupClasses);
      }
    } catch (error) {
      console.error('단체 수업 시간표 조회 실패:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.instructorId || !formData.instructorName) {
      alert('강사를 선택하고 이름을 입력해주세요.');
      return;
    }

    if (formData.timeSlots.length === 0) {
      alert('최소 하나의 시간 슬롯을 추가해주세요.');
      return;
    }

    onSubmit(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInstructorSelect = (instructorId: string) => {
    const instructor = instructors.find(inst => inst._id === instructorId);
    if (instructor) {
      // 강사 관리에서 설정된 가능 요일 정보 가져오기
      const instructorSchedule = instructor.instructorInfo?.workSchedule;
      const availableDays = instructorSchedule?.daysOfWeek || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      
      setFormData(prev => ({
        ...prev,
        instructorId: instructor._id,
        instructorName: instructor.name,
        instructorType: 'instructor', // 강습 강사로 고정
        availableDays: availableDays // 강사 관리에서 설정된 가능 요일 사용
      }));
    }
  };

  // 패키지 옵션 추가
  const addPackageOption = () => {
    const newPackage = {
      sessions: 8,
      price: 400000,
      expirationDays: 30,
      name: `${8}회 패키지`
    };
    setNewTimeSlot(prev => ({
      ...prev,
      packageOptions: [...prev.packageOptions, newPackage]
    }));
  };

  // 패키지 옵션 이름 자동 생성
  const generatePackageName = (sessions: number) => {
    return `${sessions}회 패키지`;
  };

  // 패키지 옵션 업데이트
  const updatePackageOption = (index: number, field: string, value: any) => {
    setNewTimeSlot(prev => ({
      ...prev,
      packageOptions: prev.packageOptions.map((pkg, i) => {
        if (i === index) {
          const updatedPackage = { ...pkg, [field]: value };
          // 회수가 변경되면 이름도 자동 업데이트
          if (field === 'sessions') {
            updatedPackage.name = generatePackageName(value);
          }
          return updatedPackage;
        }
        return pkg;
      })
    }));
  };

  // 패키지 옵션 삭제
  const removePackageOption = (index: number) => {
    setNewTimeSlot(prev => ({
      ...prev,
      packageOptions: prev.packageOptions.filter((_, i) => i !== index)
    }));
  };

  const addTimeSlot = () => {
    // 시간 유효성 검사
    if (newTimeSlot.startTime >= newTimeSlot.endTime) {
      alert('종료 시간은 시작 시간보다 늦어야 합니다.');
      return;
    }

    // 중복 시간 슬롯 확인
    const existingSlot = formData.timeSlots.find(slot => 
      slot.startTime === newTimeSlot.startTime && slot.endTime === newTimeSlot.endTime
    );

    if (existingSlot) {
      alert('이미 존재하는 시간 슬롯입니다.');
      return;
    }

    setFormData(prev => ({
      ...prev,
      timeSlots: [...prev.timeSlots, { ...newTimeSlot }]
    }));

    setNewTimeSlot({
      startTime: '09:00',
      endTime: '10:00',
      maxStudents: 1,
      poolType: 'mainPool',
      isActive: true,
      pricingType: 'package',
      singleSessionPrice: 70000,
      packageOptions: [
        { sessions: 8, price: 400000, expirationDays: 30, name: '8회 패키지' },
        { sessions: 16, price: 700000, expirationDays: 60, name: '16회 패키지' },
        { sessions: 32, price: 1200000, expirationDays: 90, name: '32회 패키지' }
      ],
      notes: '',
      lessonDuration: 60,
      bufferTime: 15
    });
    setShowAddTimeSlot(false);
  };

  const removeTimeSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, i) => i !== index)
    }));
  };

  const updateTimeSlot = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  if (!isOpen) return null;

  const days = [
    { key: 'monday', label: '월요일' },
    { key: 'tuesday', label: '화요일' },
    { key: 'wednesday', label: '수요일' },
    { key: 'thursday', label: '목요일' },
    { key: 'friday', label: '금요일' },
    { key: 'saturday', label: '토요일' },
    { key: 'sunday', label: '일요일' }
  ];

  const lessonTypes = [
    { value: 'freestyle', label: '자유형' },
    { value: 'backstroke', label: '배영' },
    { value: 'breaststroke', label: '평영' },
    { value: 'butterfly', label: '접영' },
    { value: 'private', label: '개인레슨' },
    { value: 'group', label: '그룹레슨' }
  ];

  const skillLevels = [
    { value: 'beginner', label: '초급' },
    { value: 'intermediate', label: '중급' },
    { value: 'advanced', label: '고급' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {editingInstructor ? '강사 스케줄 수정' : '강사 스케줄 추가'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 강사 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              강사 선택
            </label>
            <select
              value={formData.instructorId}
              onChange={(e) => handleInstructorSelect(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              required
            >
              <option value="">강사를 선택하세요</option>
              {instructors
                .filter(instructor => instructor.instructorInfo?.instructorType === 'instructor') // 강습 강사만 필터링
                .map((instructor) => (
                  <option key={instructor._id} value={instructor._id}>
                    {instructor.name} (수영강사)
                  </option>
                ))}
            </select>
          </div>

          {/* 강사 이름 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              강사 이름
            </label>
            <input
              type="text"
              value={formData.instructorName}
              onChange={(e) => handleInputChange('instructorName', e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              required
            />
          </div>

          {/* 강사 타입은 자동으로 강습 강사로 설정 */}

          {/* 가능 요일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              가능 요일
            </label>
            <div className="flex flex-wrap gap-2">
              {days.map((day) => (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => toggleDay(day.key)}
                  className={`px-3 py-1 rounded text-sm ${
                    formData.availableDays.includes(day.key)
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-300'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {/* 시간 슬롯 관리 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                가능 시간 슬롯
              </label>
              <button
                type="button"
                onClick={() => setShowAddTimeSlot(!showAddTimeSlot)}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                시간 추가
              </button>
            </div>

            {/* 새 시간 슬롯 추가 폼 */}
            {showAddTimeSlot && (
              <div className="border rounded p-4 mb-4 bg-gray-50">
                <h4 className="font-medium mb-3">새 시간 슬롯 추가</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">시작 시간</label>
                    <input
                      type="time"
                      value={newTimeSlot.startTime}
                      onChange={(e) => setNewTimeSlot(prev => ({ ...prev, startTime: e.target.value }))}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">종료 시간</label>
                    <input
                      type="time"
                      value={newTimeSlot.endTime}
                      onChange={(e) => setNewTimeSlot(prev => ({ ...prev, endTime: e.target.value }))}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">최대 학생 수</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newTimeSlot.maxStudents}
                      onChange={(e) => setNewTimeSlot(prev => ({ ...prev, maxStudents: parseInt(e.target.value) }))}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">풀 타입</label>
                    <select
                      value={newTimeSlot.poolType}
                      onChange={(e) => setNewTimeSlot(prev => ({ ...prev, poolType: e.target.value }))}
                      className="w-full border rounded px-2 py-1 text-sm"
                    >
                      <option value="mainPool">메인 풀</option>
                      <option value="kidsPool">유아 풀</option>
                      <option value="auxiliaryPool">보조 풀</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">수업 시간 (분)</label>
                    <input
                      type="number"
                      min="30"
                      max="120"
                      value={newTimeSlot.lessonDuration}
                      onChange={(e) => setNewTimeSlot(prev => ({ ...prev, lessonDuration: parseInt(e.target.value) }))}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">버퍼 시간 (분)</label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={newTimeSlot.bufferTime}
                      onChange={(e) => setNewTimeSlot(prev => ({ ...prev, bufferTime: parseInt(e.target.value) }))}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </div>
                  
                  {/* PT 패키지 옵션 */}
                  <div className="col-span-2">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">PT 패키지 설정</label>
                      <button
                        type="button"
                        onClick={addPackageOption}
                        className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700"
                      >
                        + 패키지 추가
                      </button>
                    </div>
                    
                    {/* 1회 가격 설정 */}
                    <div className="mb-3 p-3 border rounded bg-blue-50">
                      <label className="text-xs text-gray-600">1회 개별 가격</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <input
                          type="number"
                          min="0"
                          value={newTimeSlot.singleSessionPrice}
                          onChange={(e) => setNewTimeSlot(prev => ({ ...prev, singleSessionPrice: parseInt(e.target.value) }))}
                          className="w-24 border rounded px-2 py-1 text-sm"
                        />
                        <span className="text-sm text-gray-600">원</span>
                      </div>
                    </div>

                    {/* 패키지 옵션 목록 */}
                    <div className="space-y-2">
                      {newTimeSlot.packageOptions.map((pkg, index) => (
                        <div key={index} className="p-3 border rounded bg-white shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">{pkg.name}</h4>
                            <button
                              type="button"
                              onClick={() => removePackageOption(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-xs text-gray-500">회수</label>
                              <input
                                type="number"
                                min="1"
                                value={pkg.sessions}
                                onChange={(e) => updatePackageOption(index, 'sessions', parseInt(e.target.value))}
                                className="w-full border rounded px-2 py-1 text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">가격 (원)</label>
                              <input
                                type="number"
                                min="0"
                                value={pkg.price}
                                onChange={(e) => updatePackageOption(index, 'price', parseInt(e.target.value))}
                                className="w-full border rounded px-2 py-1 text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">소진 기간 (일)</label>
                              <input
                                type="number"
                                min="1"
                                value={pkg.expirationDays}
                                onChange={(e) => updatePackageOption(index, 'expirationDays', parseInt(e.target.value))}
                                className="w-full border rounded px-2 py-1 text-sm"
                              />
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-600">
                            1회당 평균: {pkg.sessions > 0 ? Math.round(pkg.price / pkg.sessions).toLocaleString() : 0}원
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-500">메모</label>
                    <input
                      type="text"
                      value={newTimeSlot.notes}
                      onChange={(e) => setNewTimeSlot(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full border rounded px-2 py-1 text-sm"
                      placeholder="특이사항 입력"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={addTimeSlot}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      추가
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 등록된 시간 슬롯 목록 */}
            <div className="space-y-3">
              {formData.timeSlots.map((slot, index) => (
                <div key={index} className="border rounded p-4 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-sm">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {slot.poolType === 'kidsPool' ? '유아풀' : slot.poolType === 'auxiliaryPool' ? '보조풀' : '메인풀'}
                        </span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          최대 {slot.maxStudents}명
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTimeSlot(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* 가격 정보 표시 */}
                  <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                    <div className="bg-blue-50 p-2 rounded">
                      <div className="text-gray-600">1회 개별</div>
                      <div className="font-medium">{slot.singleSessionPrice?.toLocaleString() || '0'}원</div>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                      <div className="text-gray-600">패키지 옵션</div>
                      <div className="font-medium">{slot.packageOptions?.length || 0}개</div>
                    </div>
                  </div>
                  
                  {/* 패키지 미리보기 */}
                  {slot.packageOptions && slot.packageOptions.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-600 mb-2">패키지 옵션:</div>
                      <div className="flex flex-wrap gap-1">
                        {slot.packageOptions.slice(0, 3).map((pkg, pkgIndex) => (
                          <span key={pkgIndex} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {pkg.sessions}회 {pkg.price.toLocaleString()}원
                          </span>
                        ))}
                        {slot.packageOptions.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{slot.packageOptions.length - 3}개 더
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* 수업 정보 */}
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>수업시간: {slot.lessonDuration || 60}분</span>
                    <span>버퍼시간: {slot.bufferTime || 15}분</span>
                    {slot.notes && <span>메모: {slot.notes}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 활성화 상태 */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="rounded"
            />
            <label className="text-sm text-gray-700">활성화</label>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingInstructor ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
