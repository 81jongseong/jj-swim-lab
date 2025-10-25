/**
 * 개인강습 설정 모달 컴포넌트
 * 강사의 개인강습 활성화 및 가능시간 설정을 관리합니다.
 * 
 * 연동 데이터: 강사 정보, 개인강습 설정
 * 연동 파일: User.ts, PersonalLesson.ts
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Plus, 
  Trash2, 
  Save,
  User,
  Calendar,
  DollarSign
} from 'lucide-react';

interface PersonalLessonSettings {
  isPersonalLessonEnabled: boolean;
  lessonTypes: Array<{
    type: '1:1' | '1:2' | '1:3' | '1:4' | '1:5';
    maxStudents: number;
    pricePerSession: number;
    monthlyPrice?: number;
  }>;
  frequencyOptions: Array<{
    type: 'weekly' | 'monthly';
    sessions: number;
    price: number;
    expirationDays?: number;
  }>;
  availability: {
    timeSlots: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isActive: boolean;
    }>;
    maxDailyLessons?: number;
    bufferTime?: number;
  };
}

interface PersonalLessonSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  instructor: {
    _id: string;
    name: string;
    instructorInfo?: {
      personalLessonSettings?: PersonalLessonSettings;
    };
  };
  onSave: (settings: PersonalLessonSettings) => void;
}

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];

export default function PersonalLessonSettingsModal({
  isOpen,
  onClose,
  instructor,
  onSave
}: PersonalLessonSettingsModalProps) {
  const [settings, setSettings] = useState<PersonalLessonSettings>({
    isPersonalLessonEnabled: false,
    lessonTypes: [],
    frequencyOptions: [],
    availability: {
      timeSlots: [],
      maxDailyLessons: 5,
      bufferTime: 30
    }
  });

  useEffect(() => {
    if (instructor?.instructorInfo?.personalLessonSettings) {
      setSettings(instructor.instructorInfo.personalLessonSettings);
    }
  }, [instructor]);

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const addLessonType = () => {
    const newLessonType = {
      type: '1:1' as const,
      maxStudents: 1,
      pricePerSession: 80000
    };
    setSettings({
      ...settings,
      lessonTypes: [...settings.lessonTypes, newLessonType]
    });
  };

  const updateLessonType = (index: number, field: string, value: any) => {
    const newLessonTypes = [...settings.lessonTypes];
    newLessonTypes[index] = { ...newLessonTypes[index], [field]: value };
    setSettings({ ...settings, lessonTypes: newLessonTypes });
  };

  const removeLessonType = (index: number) => {
    setSettings({
      ...settings,
      lessonTypes: settings.lessonTypes.filter((_, i) => i !== index)
    });
  };

  const addFrequencyOption = () => {
    const newFrequencyOption = {
      type: 'weekly' as const,
      sessions: 4,
      price: 300000,
      expirationDays: 30
    };
    setSettings({
      ...settings,
      frequencyOptions: [...settings.frequencyOptions, newFrequencyOption]
    });
  };

  const updateFrequencyOption = (index: number, field: string, value: any) => {
    const newFrequencyOptions = [...settings.frequencyOptions];
    newFrequencyOptions[index] = { ...newFrequencyOptions[index], [field]: value };
    setSettings({ ...settings, frequencyOptions: newFrequencyOptions });
  };

  const removeFrequencyOption = (index: number) => {
    setSettings({
      ...settings,
      frequencyOptions: settings.frequencyOptions.filter((_, i) => i !== index)
    });
  };

  const addTimeSlot = () => {
    const newTimeSlot = {
      dayOfWeek: 1, // 월요일
      startTime: '06:00',
      endTime: '22:00',
      isActive: true
    };
    setSettings({
      ...settings,
      availability: {
        ...settings.availability,
        timeSlots: [...settings.availability.timeSlots, newTimeSlot]
      }
    });
  };

  const updateTimeSlot = (index: number, field: string, value: any) => {
    const newTimeSlots = [...settings.availability.timeSlots];
    newTimeSlots[index] = { ...newTimeSlots[index], [field]: value };
    setSettings({
      ...settings,
      availability: {
        ...settings.availability,
        timeSlots: newTimeSlots
      }
    });
  };

  const removeTimeSlot = (index: number) => {
    setSettings({
      ...settings,
      availability: {
        ...settings.availability,
        timeSlots: settings.availability.timeSlots.filter((_, i) => i !== index)
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <User className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {instructor.name} 강사 개인강습 설정
              </h2>
              <p className="text-sm text-gray-600">
                개인강습 활성화 및 가능시간을 설정하세요
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6 space-y-6">
          {/* 개인강습 활성화 */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="personalLessonEnabled"
              checked={settings.isPersonalLessonEnabled}
              onChange={(e) => setSettings({
                ...settings,
                isPersonalLessonEnabled: e.target.checked
              })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="personalLessonEnabled" className="text-sm font-medium text-gray-700">
              개인강습 활성화
            </label>
          </div>

          {settings.isPersonalLessonEnabled && (
            <>
              {/* 레슨 타입 설정 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">레슨 타입별 가격</h3>
                  <button
                    onClick={addLessonType}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    레슨 타입 추가
                  </button>
                </div>
                
                <div className="space-y-3">
                  {settings.lessonTypes.map((lessonType, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <select
                        value={lessonType.type}
                        onChange={(e) => updateLessonType(index, 'type', e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="1:1">1:1</option>
                        <option value="1:2">1:2</option>
                        <option value="1:3">1:3</option>
                        <option value="1:4">1:4</option>
                        <option value="1:5">1:5</option>
                      </select>
                      <input
                        type="number"
                        value={lessonType.pricePerSession}
                        onChange={(e) => updateLessonType(index, 'pricePerSession', parseInt(e.target.value))}
                        placeholder="가격"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="1000"
                      />
                      <span className="text-sm text-gray-500">원/회</span>
                      <button
                        onClick={() => removeLessonType(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 패키지 옵션 설정 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">패키지 옵션</h3>
                  <button
                    onClick={addFrequencyOption}
                    className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    패키지 추가
                  </button>
                </div>
                
                <div className="space-y-3">
                  {settings.frequencyOptions.map((option, index) => (
                    <div key={index} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-center gap-3">
                        <select
                          value={option.type}
                          onChange={(e) => updateFrequencyOption(index, 'type', e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="weekly">주간</option>
                          <option value="monthly">월간</option>
                        </select>
                        <input
                          type="number"
                          value={option.sessions}
                          onChange={(e) => updateFrequencyOption(index, 'sessions', parseInt(e.target.value))}
                          placeholder="횟수"
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          min="1"
                        />
                        <span className="text-sm text-gray-500">회</span>
                        <input
                          type="number"
                          value={option.price}
                          onChange={(e) => updateFrequencyOption(index, 'price', parseInt(e.target.value))}
                          placeholder="가격"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="1000"
                        />
                        <span className="text-sm text-gray-500">원</span>
                        <button
                          onClick={() => removeFrequencyOption(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600">사용기한:</label>
                        <input
                          type="number"
                          value={option.expirationDays || ''}
                          onChange={(e) => updateFrequencyOption(index, 'expirationDays', parseInt(e.target.value))}
                          placeholder="30"
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          min="1"
                        />
                        <span className="text-xs text-gray-500">일</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 가능시간 설정 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">가능 시간 설정</h3>
                  <button
                    onClick={addTimeSlot}
                    className="flex items-center px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    시간 추가
                  </button>
                </div>
                
                <div className="space-y-3">
                  {settings.availability.timeSlots.map((timeSlot, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <select
                        value={timeSlot.dayOfWeek}
                        onChange={(e) => updateTimeSlot(index, 'dayOfWeek', parseInt(e.target.value))}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        {DAYS_OF_WEEK.map((day, dayIndex) => (
                          <option key={dayIndex} value={dayIndex}>{day}</option>
                        ))}
                      </select>
                      <input
                        type="time"
                        value={timeSlot.startTime}
                        onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <span className="text-gray-500">~</span>
                      <input
                        type="time"
                        value={timeSlot.endTime}
                        onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <button
                        onClick={() => removeTimeSlot(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* 추가 설정 */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      하루 최대 레슨 수
                    </label>
                    <input
                      type="number"
                      value={settings.availability.maxDailyLessons || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        availability: {
                          ...settings.availability,
                          maxDailyLessons: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      레슨 간 휴식 시간 (분)
                    </label>
                    <input
                      type="number"
                      value={settings.availability.bufferTime || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        availability: {
                          ...settings.availability,
                          bufferTime: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max="120"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 푸터 */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            저장
          </button>
        </div>
      </div>
    </div>
  );
}




