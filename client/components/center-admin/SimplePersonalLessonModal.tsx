/**
 * 🏊‍♂️ 간단한 개인레슨 신청 모달 컴포넌트
 * 
 * 기본적인 개인레슨 신청 폼을 제공합니다.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
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
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [availabilityMsg, setAvailabilityMsg] = useState<string>('');
  const [customDuration, setCustomDuration] = useState<number | ''>('');
  const [durationMode, setDurationMode] = useState<'preset' | 'custom'>('preset');
  const strokeOptions = [
    { key: 'freestyle', label: '자유형' },
    { key: 'backstroke', label: '배영' },
    { key: 'breaststroke', label: '평영' },
    { key: 'butterfly', label: '접영' },
    { key: 'turn', label: '턴' },
    { key: 'start', label: '스타트' }
  ];
  const [selectedStrokes, setSelectedStrokes] = useState<string[]>(['freestyle']);
  const [goalOptions, setGoalOptions] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [skillLevels, setSkillLevels] = useState<string[]>([]);
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');

  useEffect(() => {
    if (!isOpen) {
      setAvailableTimes([]);
      setAvailabilityMsg('');
      setSelectedStrokes(['freestyle']);
      setSelectedGoals([]);
      setGoalOptions([]);
      return;
    }
    // 요청하신 고정 운동 목표 목록으로 표기 (훈련법 아님)
    setGoalOptions([
      '심폐지구력 향상',
      '장거리 완주',
      '스트레스 해소',
      '체력 향상',
      '재활',
      '자세 교정',
      '호흡 개선',
      '턴/스타트 개선',
      '기초 체력 강화'
    ]);

    // API 권한 문제로 급수는 기본값으로 고정(콘솔 경고 방지)
    setSkillLevels(['초급', '중급', '고급']);

    // 신청자(회원) 목록 불러오기
    (async () => {
      try {
        const resp = await fetch('http://localhost:5000/api/center-admin/members', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const json = await resp.json();
        const list = Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json?.data?.users) ? json.data.users : [];
        const mapped = list.map((m: any) => ({ id: m._id || m.id, name: m.name })).filter((m: any) => m.id && m.name);
        setMembers(mapped);
        setSelectedMemberId(mapped[0]?.id || '');
      } catch (e) {
        setMembers([]);
        setSelectedMemberId('');
      }
    })();
  }, [isOpen]);

  const handleDateChange = (date: string) => {
    setFormData({ ...formData, date, time: '' });
    // 서버 호출 없이 정시(:00) 기본 슬롯 제공
    const defaults: string[] = [];
    for (let h = 9; h <= 20; h++) {
      defaults.push(`${String(h).padStart(2,'0')}:00`);
    }
    setAvailableTimes(defaults);
    setAvailabilityMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDuration = durationMode === 'custom' && typeof customDuration === 'number' ? customDuration : formData.duration;
    const primaryStroke = selectedStrokes[0] || 'freestyle';
    onSubmit({
      ...formData,
      duration: finalDuration,
      lessonType: primaryStroke,
      lessonTypes: selectedStrokes,
      goals: selectedGoals,
      studentId: selectedMemberId
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-full flex items-start justify-center p-6">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[85vh] overflow-y-auto">
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
            <label className="block text-sm font-medium mb-1">신청자(회원)</label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              {members.length === 0 && <option value="">회원 목록을 불러올 수 없습니다</option>}
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
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
              <p className="text-xs text-red-500 mt-1">{availabilityMsg || '해당 날짜는 개인레슨이 불가능합니다'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">수업 시간</label>
            <div className="flex flex-wrap gap-2">
              {[30, 50, 60].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setDurationMode('preset'); setFormData({ ...formData, duration: m }); }}
                  className={`px-3 py-1.5 text-sm rounded border ${durationMode === 'preset' && formData.duration === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                >
                  {m}분
                </button>
              ))}
              <button
                type="button"
                onClick={() => setDurationMode('custom')}
                className={`px-3 py-1.5 text-sm rounded border ${durationMode === 'custom' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              >
                직접입력
              </button>
            </div>
            {durationMode === 'custom' && (
              <div className="mt-2">
                <input
                  type="number"
                  min={10}
                  step={5}
                  placeholder="분 단위 입력 (예: 75)"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value === '' ? '' : Math.max(10, parseInt(e.target.value)))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">배우고 싶은 영법 (다중선택)</label>
            <div className="flex flex-wrap gap-2">
              {strokeOptions.map((opt) => {
                const active = selectedStrokes.includes(opt.key);
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setSelectedStrokes(prev => active ? prev.filter(k => k !== opt.key) : [...prev, opt.key]);
                    }}
                    className={`px-3 py-1.5 text-sm rounded-full border ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">운동 목표 (수영엔진)</label>
            {goalOptions.length === 0 ? (
              <p className="text-xs text-gray-500">목표 목록을 불러오는 중이거나 제공되지 않았습니다.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {goalOptions.map((goal) => {
                  const active = selectedGoals.includes(goal);
                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setSelectedGoals(prev => active ? prev.filter(g => g !== goal) : [...prev, goal])}
                      className={`px-3 py-1.5 text-sm rounded-full border ${active ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    >
                      {goal}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">현재 실력 (센터 급수)</label>
            <select
              value={formData.skillLevel}
              onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {skillLevels.length > 0 ? (
                skillLevels.map((lv) => (
                  <option key={lv} value={lv}>{lv}</option>
                ))
              ) : (
                <>
                  <option value="초급">초급</option>
                  <option value="중급">중급</option>
                  <option value="고급">고급</option>
                </>
              )}
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
              disabled={!formData.date || !formData.time || (durationMode === 'custom' && (customDuration === '' || isNaN(Number(customDuration))))}
            >
              신청하기
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
