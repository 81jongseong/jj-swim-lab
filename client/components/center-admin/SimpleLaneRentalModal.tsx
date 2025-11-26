/**
 * 🏊‍♀️ 간단한 레인대여 신청 모달 컴포넌트
 * 
 * 기본적인 레인대여 신청 폼을 제공합니다.
 */

'use client';
import { logger } from '@/lib/logger';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { X, MapPin, Calendar, Clock } from 'lucide-react';

interface SimpleLaneRentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function SimpleLaneRentalModal({
  isOpen,
  onClose,
  onSubmit
}: SimpleLaneRentalModalProps) {
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    duration: 60,
    laneNumber: 1,
    purpose: '자유수영',
    notes: ''
  });
  const [availability, setAvailability] = useState<any>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadCenterAvailability();
    }
  }, [isOpen]);

  const loadCenterAvailability = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/centers/availability', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailability(data.data);
      }
    } catch (error) {
      logger.error('센터 가능시간 로딩 실패:', error);
    }
  };

  const handleDateChange = (date: string) => {
    setFormData({ ...formData, date, startTime: '', endTime: '' });
    
    if (availability?.laneRental) {
      const selectedDate = new Date(date);
      const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      
      if (availability.laneRental.availableDays.includes(dayName)) {
        // 가능한 시간대 생성
        const times: string[] = [];
        availability.laneRental.availableTimes.forEach((timeSlot: any) => {
          const start = parseInt(timeSlot.startTime.split(':')[0]);
          const end = parseInt(timeSlot.endTime.split(':')[0]);
          
          for (let hour = start; hour < end; hour++) {
            times.push(`${hour.toString().padStart(2, '0')}:00`);
            if (hour < end - 1) {
              times.push(`${hour.toString().padStart(2, '0')}:30`);
            }
          }
        });
        
        setAvailableTimes(times);
      } else {
        setAvailableTimes([]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            레인대여 신청
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">희망 날짜</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleDateChange(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">레인 번호</label>
            <select
              value={formData.laneNumber}
              onChange={(e) => setFormData({ ...formData, laneNumber: parseInt(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {availability?.laneRental?.availableLanes?.map((lane: number) => (
                <option key={lane} value={lane}>{lane}번 레인</option>
              )) || (
                <>
                  <option value="1">1번 레인</option>
                  <option value="2">2번 레인</option>
                  <option value="3">3번 레인</option>
                  <option value="4">4번 레인</option>
                  <option value="5">5번 레인</option>
                  <option value="6">6번 레인</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">시작 시간</label>
            <select
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              disabled={!formData.date || availableTimes.length === 0}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">시작 시간을 선택하세요</option>
              {availableTimes.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
            {!formData.date && (
              <p className="text-xs text-gray-500 mt-1">먼저 날짜를 선택해주세요</p>
            )}
            {formData.date && availableTimes.length === 0 && (
              <p className="text-xs text-red-500 mt-1">해당 날짜는 레인대여가 불가능합니다</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">종료 시간</label>
            <select
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              disabled={!formData.startTime}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">종료 시간을 선택하세요</option>
              {availableTimes
                .filter(time => {
                  if (!formData.startTime) return false;
                  const startHour = parseInt(formData.startTime.split(':')[0]);
                  const timeHour = parseInt(time.split(':')[0]);
                  return timeHour > startHour;
                })
                .map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">대여 목적</label>
            <select
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="자유수영">자유수영</option>
              <option value="연습">연습</option>
              <option value="경기준비">경기준비</option>
              <option value="개인훈련">개인훈련</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">추가 요청사항</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="특별한 요청사항이 있다면 적어주세요"
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={!formData.date || !formData.startTime || !formData.endTime}
            >
              신청하기
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
