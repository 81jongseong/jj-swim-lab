/**
 * 🏊‍♂️ 간단한 개인레슨 신청 모달 컴포넌트
 * 
 * 기본적인 개인레슨 신청 폼을 제공합니다.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../Button';
import { X, User, Calendar, Clock } from 'lucide-react';

interface SimplePersonalLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function SimplePersonalLessonModal({
  isOpen,
  onClose,
  onSubmit
}: SimplePersonalLessonModalProps) {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    duration: 60,
    lessonType: 'freestyle',
    skillLevel: 'beginner',
    goals: '',
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
      console.error('센터 가능시간 로딩 실패:', error);
    }
  };

  const handleDateChange = (date: string) => {
    setFormData({ ...formData, date, time: '' });
    
    if (availability?.personalLesson) {
      const selectedDate = new Date(date);
      const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      
      if (availability.personalLesson.availableDays.includes(dayName)) {
        // 가능한 시간대 생성
        const times: string[] = [];
        availability.personalLesson.availableTimes.forEach((timeSlot: any) => {
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
            <User className="w-5 h-5 mr-2" />
            개인레슨 신청
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
            <label className="block text-sm font-medium mb-1">희망 시간</label>
            <select
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              disabled={!formData.date || availableTimes.length === 0}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">시간을 선택하세요</option>
              {availableTimes.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
            {!formData.date && (
              <p className="text-xs text-gray-500 mt-1">먼저 날짜를 선택해주세요</p>
            )}
            {formData.date && availableTimes.length === 0 && (
              <p className="text-xs text-red-500 mt-1">해당 날짜는 개인레슨이 불가능합니다</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">수업 시간</label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="60">60분</option>
              <option value="90">90분</option>
              <option value="120">120분</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">수영 종목</label>
            <select
              value={formData.lessonType}
              onChange={(e) => setFormData({ ...formData, lessonType: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="freestyle">자유형</option>
              <option value="backstroke">배영</option>
              <option value="breaststroke">평영</option>
              <option value="butterfly">접영</option>
              <option value="mixed">혼영</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">현재 실력</label>
            <select
              value={formData.skillLevel}
              onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="beginner">초급</option>
              <option value="intermediate">중급</option>
              <option value="advanced">고급</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">학습 목표</label>
            <textarea
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              placeholder="어떤 것을 배우고 싶으신가요?"
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
              required
            />
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
              disabled={!formData.date || !formData.time || !formData.goals}
            >
              신청하기
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
