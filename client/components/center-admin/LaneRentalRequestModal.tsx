/**
 * 🏊‍♀️ 레인대여 신청 모달 컴포넌트
 * 
 * 회원이 레인대여를 신청할 수 있는 모달입니다.
 * 센터에서 설정한 가능시간과 레인 내에서만 선택 가능합니다.
 */

'use client';
import { logger } from '@/lib/logger';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { Input } from '../ui';
// Textarea와 Select는 index.ts에서 export되지 않으므로 직접 import
import Textarea from '../ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { X, Calendar, Clock, MapPin, Target } from 'lucide-react';

interface LaneRentalRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LaneRentalData) => void;
}

interface LaneRentalData {
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  laneNumber: number;
  purpose: string;
  notes?: string;
}

interface CenterAvailability {
  laneRental: {
    enabled: boolean;
    availableDays: string[];
    availableTimes: Array<{
      startTime: string;
      endTime: string;
      maxDuration: number;
    }>;
    availableLanes: number[];
    advanceBookingDays: number;
  };
}

export default function LaneRentalRequestModal({
  isOpen,
  onClose,
  onSubmit
}: LaneRentalRequestModalProps) {
  const [formData, setFormData] = useState<LaneRentalData>({
    date: '',
    startTime: '',
    endTime: '',
    duration: 60,
    laneNumber: 1,
    purpose: '자유수영',
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
        availability.laneRental.availableTimes.forEach(timeSlot => {
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

  const handleStartTimeChange = (startTime: string) => {
    const startHour = parseInt(startTime.split(':')[0]);
    const startMinute = parseInt(startTime.split(':')[1]);
    
    // 기본 종료시간을 시작시간 + 1시간으로 설정
    const endHour = startHour + 1;
    const endTime = `${endHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
    
    setFormData({ 
      ...formData, 
      startTime, 
      endTime,
      duration: 60 
    });
  };

  const handleEndTimeChange = (endTime: string) => {
    const startTime = formData.startTime;
    if (startTime) {
      const start = new Date(`2000-01-01T${startTime}:00`);
      const end = new Date(`2000-01-01T${endTime}:00`);
      const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
      
      setFormData({ 
        ...formData, 
        endTime,
        duration: Math.max(30, duration)
      });
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
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => handleDateChange(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">레인 번호</label>
            <Select
              value={formData.laneNumber.toString()}
              onValueChange={(value) => setFormData({ ...formData, laneNumber: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availability?.laneRental?.availableLanes.map(lane => (
                  <SelectItem key={lane} value={lane.toString()}>
                    {lane}번 레인
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">시작 시간</label>
            <Select
              value={formData.startTime}
              onValueChange={handleStartTimeChange}
              disabled={!formData.date || availableTimes.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="시작 시간을 선택하세요" />
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
              <p className="text-xs text-red-500 mt-1">해당 날짜는 레인대여가 불가능합니다</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">종료 시간</label>
            <Select
              value={formData.endTime}
              onValueChange={handleEndTimeChange}
              disabled={!formData.startTime}
            >
              <SelectTrigger>
                <SelectValue placeholder="종료 시간을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {availableTimes
                  .filter(time => {
                    if (!formData.startTime) return false;
                    const startHour = parseInt(formData.startTime.split(':')[0]);
                    const timeHour = parseInt(time.split(':')[0]);
                    return timeHour > startHour;
                  })
                  .map(time => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {formData.startTime && (
              <p className="text-xs text-gray-500 mt-1">
                대여 시간: {formData.duration}분
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">대여 목적</label>
            <Select
              value={formData.purpose}
              onValueChange={(value) => setFormData({ ...formData, purpose: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="자유수영">자유수영</SelectItem>
                <SelectItem value="연습">연습</SelectItem>
                <SelectItem value="경기준비">경기준비</SelectItem>
                <SelectItem value="개인훈련">개인훈련</SelectItem>
              </SelectContent>
            </Select>
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


