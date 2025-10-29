/**
 * 🏊‍♂️ 개인레슨 신청 모달 컴포넌트
 * 
 * 회원이 개인레슨을 신청할 수 있는 모달입니다.
 * 센터에서 설정한 가능시간 내에서만 선택 가능합니다.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../Button';
import { Input } from '../ui/input';
import Textarea from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { X, Calendar, Clock, User, Target } from 'lucide-react';

interface PersonalLessonRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PersonalLessonData) => void;
}

interface PersonalLessonData {
  date: string;
  time: string;
  duration: number;
  lessonType: string;
  skillLevel: string;
  goals: string;
  notes?: string;
}

interface CenterAvailability {
  personalLesson: {
    enabled: boolean;
    availableDays: string[];
    availableTimes: Array<{
      startTime: string;
      endTime: string;
      maxDuration: number;
    }>;
    advanceBookingDays: number;
  };
}

export default function PersonalLessonRequestModal({
  isOpen,
  onClose,
  onSubmit
}: PersonalLessonRequestModalProps) {
  const [formData, setFormData] = useState<PersonalLessonData>({
    date: '',
    time: '',
    duration: 60,
    lessonType: 'freestyle',
    skillLevel: 'beginner',
    goals: '',
    notes: ''
  });
  const [availability, setAvailability] = useState<CenterAvailability | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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
        availability.personalLesson.availableTimes.forEach(timeSlot => {
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
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => handleDateChange(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">희망 시간</label>
            <Select
              value={formData.time}
              onValueChange={(value) => setFormData({ ...formData, time: value })}
              disabled={!formData.date || availableTimes.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="시간을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {availableTimes.map(time => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!formData.date && (
              <p className="text-xs text-gray-500 mt-1">먼저 날짜를 선택해주세요</p>
            )}
            {formData.date && availableTimes.length === 0 && (
              <p className="text-xs text-red-500 mt-1">해당 날짜는 개인레슨이 불가능합니다</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">수업 시간</label>
            <Select
              value={formData.duration.toString()}
              onValueChange={(value) => setFormData({ ...formData, duration: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="60">60분</SelectItem>
                <SelectItem value="90">90분</SelectItem>
                <SelectItem value="120">120분</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">수영 종목</label>
            <Select
              value={formData.lessonType}
              onValueChange={(value) => setFormData({ ...formData, lessonType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="freestyle">자유형</SelectItem>
                <SelectItem value="backstroke">배영</SelectItem>
                <SelectItem value="breaststroke">평영</SelectItem>
                <SelectItem value="butterfly">접영</SelectItem>
                <SelectItem value="mixed">혼영</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">현재 실력</label>
            <Select
              value={formData.skillLevel}
              onValueChange={(value) => setFormData({ ...formData, skillLevel: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">초급</SelectItem>
                <SelectItem value="intermediate">중급</SelectItem>
                <SelectItem value="advanced">고급</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">학습 목표</label>
            <Textarea
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              placeholder="어떤 것을 배우고 싶으신가요?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">추가 요청사항</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="특별한 요청사항이 있다면 적어주세요"
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


