/**
 * ⏰ JJ Swim Lab - 시간 슬롯 추가/수정 모달
 * 
 * 📋 **컴포넌트 목적**
 * - 개인레슨 및 레인대여 시간 슬롯 추가/수정
 * - 연속적이지 않은 시간대 설정 가능
 * - 시간대별 세부 설정 (가격, 인원, 메모 등)
 * 
 * 🔄 **주요 기능**
 * - 시작/종료 시간 선택
 * - 풀 타입 선택 (메인풀/유아풀/보조풀)
 * - 최대 레슨/대여 수 설정
 * - 강사당 인원 제한 (개인레슨)
 * - 시간대별 가격 설정
 * - 메모 추가
 * - 활성화/비활성화 토글
 * 
 * 🗄️ **데이터 연동**
 * - CenterSchedule 모델과 연동
 * - 개인레슨 및 레인대여 API와 연동
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-12: 초기 시간 슬롯 모달 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2025-01-12
 * - 상태: ✅ 완성
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, Users, DollarSign, FileText } from 'lucide-react';

interface TimeSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  type: 'personal-lesson' | 'lane-rental';
  editingSlot?: any;
}

export default function TimeSlotModal({ isOpen, onClose, onSubmit, type, editingSlot }: TimeSlotModalProps) {
  const [formData, setFormData] = useState({
    startTime: '09:00',
    endTime: '10:00',
    poolType: 'mainPool',
    isActive: true,
    maxLessons: 1,
    instructorCapacity: 1,
    maxRentals: 1,
    hourlyRate: 0,
    price: 0,
    notes: ''
  });

  useEffect(() => {
    if (editingSlot) {
      setFormData({
        startTime: editingSlot.startTime || '09:00',
        endTime: editingSlot.endTime || '10:00',
        poolType: editingSlot.poolType || 'mainPool',
        isActive: editingSlot.isActive !== undefined ? editingSlot.isActive : true,
        maxLessons: editingSlot.maxLessons || 1,
        instructorCapacity: editingSlot.instructorCapacity || 1,
        maxRentals: editingSlot.maxRentals || 1,
        hourlyRate: editingSlot.hourlyRate || 0,
        price: editingSlot.price || 0,
        notes: editingSlot.notes || ''
      });
    } else {
      setFormData({
        startTime: '09:00',
        endTime: '10:00',
        poolType: 'mainPool',
        isActive: true,
        maxLessons: 1,
        instructorCapacity: 1,
        maxRentals: 1,
        hourlyRate: 0,
        price: 0,
        notes: ''
      });
    }
  }, [editingSlot, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 시간 유효성 검사
    if (formData.startTime >= formData.endTime) {
      alert('종료 시간은 시작 시간보다 늦어야 합니다.');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {editingSlot ? '시간 슬롯 수정' : '시간 슬롯 추가'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 시간 설정 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              시간 설정
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500">시작 시간</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  className="w-full border rounded px-2 py-1 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">종료 시간</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  className="w-full border rounded px-2 py-1 text-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* 풀 타입 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              풀 타입
            </label>
            <select
              value={formData.poolType}
              onChange={(e) => handleInputChange('poolType', e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
            >
              <option value="mainPool">메인 풀</option>
              <option value="kidsPool">유아 풀</option>
              <option value="auxiliaryPool">보조 풀</option>
            </select>
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

          {/* 개인레슨 전용 설정 */}
          {type === 'personal-lesson' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  최대 레슨 수
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.maxLessons}
                  onChange={(e) => handleInputChange('maxLessons', parseInt(e.target.value))}
                  className="w-full border rounded px-2 py-1 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  강사당 최대 인원
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.instructorCapacity}
                  onChange={(e) => handleInputChange('instructorCapacity', parseInt(e.target.value))}
                  className="w-full border rounded px-2 py-1 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  레슨 가격 (원)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseInt(e.target.value))}
                  className="w-full border rounded px-2 py-1 text-sm"
                  placeholder="0"
                />
              </div>
            </>
          )}

          {/* 레인대여 전용 설정 */}
          {type === 'lane-rental' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  최대 대여 수
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.maxRentals}
                  onChange={(e) => handleInputChange('maxRentals', parseInt(e.target.value))}
                  className="w-full border rounded px-2 py-1 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  시간당 요금 (원)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.hourlyRate}
                  onChange={(e) => handleInputChange('hourlyRate', parseInt(e.target.value))}
                  className="w-full border rounded px-2 py-1 text-sm"
                  placeholder="0"
                />
              </div>
            </>
          )}

          {/* 메모 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              메모
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
              rows={3}
              placeholder="시간대별 특이사항이나 메모를 입력하세요..."
            />
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
              className={`px-4 py-2 text-white rounded-lg transition-colors ${
                type === 'personal-lesson' 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {editingSlot ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}






