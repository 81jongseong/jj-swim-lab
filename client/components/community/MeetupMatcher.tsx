'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Users, 
  Waves, 
  Timer,
  Target,
  Star,
  Calendar,
  Zap,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Heart,
  MessageSquare
} from 'lucide-react';

interface MeetupMatcherProps {
  userProfile?: {
    skillLevel: string;
    preferredStrokes: string[];
    preferredPace: string;
    experience: number;
  };
}

export const MeetupMatcher: React.FC<MeetupMatcherProps> = ({ userProfile }) => {
  const [meetups, setMeetups] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    skillLevel: userProfile?.skillLevel || '',
    strokes: userProfile?.preferredStrokes || [],
    pace: userProfile?.preferredPace || '',
    focus: [],
    date: '',
    location: '',
    maxDistance: 1000,
    showOnlyMatching: false
  });
  const [loading, setLoading] = useState(false);

  // 필터 옵션들
  const skillLevels = [
    { value: 'beginner', label: '초급자', icon: '🌱', description: '수영 기초를 배우는 단계' },
    { value: 'intermediate', label: '중급자', icon: '🏊‍♂️', description: '기본 영법을 할 수 있는 단계' },
    { value: 'advanced', label: '고급자', icon: '🏆', description: '모든 영법이 가능한 단계' },
    { value: 'all', label: '모든 레벨', icon: '🌟', description: '레벨 상관없이' }
  ];

  const strokeOptions = [
    { value: 'freestyle', label: '자유형', icon: '🏊‍♂️' },
    { value: 'backstroke', label: '배영', icon: '🏊‍♀️' },
    { value: 'breaststroke', label: '평영', icon: '🐸' },
    { value: 'butterfly', label: '접영', icon: '🦋' },
    { value: 'medley', label: '혼영', icon: '🌊' }
  ];

  const paceOptions = [
    { value: 'easy', label: '이지', icon: '😌', color: 'green' },
    { value: 'moderate', label: '보통', icon: '🚶‍♂️', color: 'blue' },
    { value: 'fast', label: '빠름', icon: '🏃‍♂️', color: 'orange' },
    { value: 'sprint', label: '스프린트', icon: '⚡', color: 'red' },
    { value: 'mixed', label: '믹스', icon: '🎯', color: 'purple' }
  ];

  // 모의 번개모임 데이터
  const mockMeetups = [
    {
      id: '1',
      title: '12/20 저녁 자유형 이지페이스 번개모임 (3-6명)',
      description: '퇴근 후 편안하게 자유형 연습하실 분들 모여요!',
      author: { name: '김수영', level: 'intermediate', rating: 4.8 },
      meetupDate: '2024-12-20T18:00:00',
      location: '잠실 수영장',
      participants: { current: 2, max: 6, min: 3 },
      swimmingDetails: {
        primaryStroke: 'freestyle',
        strokes: ['freestyle'],
        pace: { type: 'easy', description: '편안하게 대화하며', targetTime: '100m 3분' },
        focus: ['technique', 'fun'],
        training: { main: { totalDistance: 600 } },
        levelRequirements: { minimumDistance: 100 }
      },
      convenience: {
        beginnerFriendly: true,
        equipmentSharing: true,
        afterMeetup: 'coffee'
      },
      matchScore: 95,
      status: 'recruiting'
    },
    {
      id: '2',
      title: '12/21 오전 평영 기술향상 번개모임 (4-8명)',
      description: '평영 킥 동작을 완성하고 싶은 분들과 함께해요',
      author: { name: '박평영', level: 'advanced', rating: 4.9 },
      meetupDate: '2024-12-21T09:00:00',
      location: '강남 스포츠센터',
      participants: { current: 3, max: 8, min: 4 },
      swimmingDetails: {
        primaryStroke: 'breaststroke',
        strokes: ['breaststroke', 'freestyle'],
        pace: { type: 'moderate', description: '적당한 강도로', targetTime: '100m 2분 30초' },
        focus: ['technique', 'endurance'],
        training: { main: { totalDistance: 800 } },
        levelRequirements: { minimumDistance: 200, experienceMonths: 3 }
      },
      convenience: {
        beginnerFriendly: false,
        carpoolAvailable: true,
        photoSession: true
      },
      matchScore: 87,
      status: 'recruiting'
    },
    {
      id: '3',
      title: '12/22 주말 접영 도전 번개모임 (2-4명)',
      description: '접영을 배우고 싶거나 연습하고 싶은 고급자 모집!',
      author: { name: '이접영', level: 'advanced', rating: 5.0 },
      meetupDate: '2024-12-22T14:00:00',
      location: '올림픽 수영장',
      participants: { current: 1, max: 4, min: 2 },
      swimmingDetails: {
        primaryStroke: 'butterfly',
        strokes: ['butterfly', 'freestyle'],
        pace: { type: 'fast', description: '고강도 훈련', targetTime: '50m 1분' },
        focus: ['technique', 'strength'],
        training: { main: { totalDistance: 400 } },
        levelRequirements: { minimumDistance: 400, experienceMonths: 12 }
      },
      convenience: {
        beginnerFriendly: false,
        equipmentSharing: false
      },
      matchScore: 72,
      status: 'recruiting'
    }
  ];

  // 매칭 점수 계산
  const calculateMatchScore = (meetup: any): number => {
    let score = 0;
    
    // 스킬 레벨 매칭 (30점)
    if (userProfile?.skillLevel === meetup.swimmingDetails.levelRequirements.skillLevel) {
      score += 30;
    } else if (userProfile?.skillLevel === 'intermediate' && meetup.convenience.beginnerFriendly) {
      score += 20;
    }
    
    // 선호 영법 매칭 (25점)
    if (userProfile?.preferredStrokes?.includes(meetup.swimmingDetails.primaryStroke)) {
      score += 25;
    }
    
    // 페이스 매칭 (20점)
    if (userProfile?.preferredPace === meetup.swimmingDetails.pace.type) {
      score += 20;
    }
    
    // 거리 적합성 (15점)
    const userMaxDistance = userProfile?.experience ? userProfile.experience * 100 : 200;
    if (meetup.swimmingDetails.training.main.totalDistance <= userMaxDistance) {
      score += 15;
    }
    
    // 편의 기능 (10점)
    if (meetup.convenience.beginnerFriendly && userProfile?.skillLevel === 'beginner') {
      score += 10;
    }
    
    return Math.min(100, score);
  };

  // 모임 카드 컴포넌트
  const MeetupCard = ({ meetup }: { meetup: any }) => {
    const matchScore = calculateMatchScore(meetup);
    const isHighMatch = matchScore >= 80;
    const isMediumMatch = matchScore >= 60;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border rounded-xl p-4 hover:shadow-lg transition-all ${
          isHighMatch ? 'border-green-300 bg-green-50' :
          isMediumMatch ? 'border-blue-300 bg-blue-50' :
          'border-gray-200 bg-white'
        }`}
      >
        {/* 매칭 점수 배지 */}
        <div className="flex justify-between items-start mb-3">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isHighMatch ? 'bg-green-500 text-white' :
            isMediumMatch ? 'bg-blue-500 text-white' :
            'bg-gray-400 text-white'
          }`}>
            매칭도 {matchScore}%
          </div>
          <div className="text-xs text-gray-500">
            {new Date(meetup.meetupDate).toLocaleDateString()} {new Date(meetup.meetupDate).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <h4 className="font-bold text-lg mb-2">{meetup.title}</h4>
        <p className="text-gray-600 text-sm mb-4">{meetup.description}</p>

        {/* 수영 정보 */}
        <div className="grid md:grid-cols-3 gap-3 mb-4">
          <div className="flex items-center text-sm">
            <Waves className="h-4 w-4 mr-2 text-blue-500" />
            <span>{strokeOptions.find(s => s.value === meetup.swimmingDetails.primaryStroke)?.label}</span>
          </div>
          <div className="flex items-center text-sm">
            <Timer className="h-4 w-4 mr-2 text-purple-500" />
            <span>{paceOptions.find(p => p.value === meetup.swimmingDetails.pace.type)?.label} 페이스</span>
          </div>
          <div className="flex items-center text-sm">
            <Target className="h-4 w-4 mr-2 text-green-500" />
            <span>{meetup.swimmingDetails.training.main.totalDistance}m</span>
          </div>
        </div>

        {/* 편의 기능 태그 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {meetup.convenience.beginnerFriendly && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">초보자 환영</span>
          )}
          {meetup.convenience.equipmentSharing && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">장비 공유</span>
          )}
          {meetup.convenience.carpoolAvailable && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">카풀 가능</span>
          )}
          {meetup.convenience.afterMeetup && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
              모임 후 {meetup.convenience.afterMeetup === 'coffee' ? '카페' : meetup.convenience.afterMeetup}
            </span>
          )}
        </div>

        {/* 하단 정보 */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {meetup.location}
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {meetup.participants.current}/{meetup.participants.max}명
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center">
              <Zap className="h-4 w-4 mr-1" />
              참가하기
            </button>
            <button className="p-2 text-gray-500 hover:text-red-500">
              <Heart className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 매칭 이유 (고매칭일 때만 표시) */}
        {isHighMatch && (
          <div className="mt-3 p-3 bg-green-100 rounded-lg">
            <div className="text-xs text-green-700 font-medium mb-1">왜 이 모임이 추천되나요?</div>
            <div className="text-xs text-green-600">
              • 선호 영법과 일치 • 적절한 페이스 • 경험 수준에 맞음
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ⚡ 스마트 번개모임 매칭
        </h1>
        <p className="text-gray-600">
          나에게 딱 맞는 수영 모임을 AI가 추천해드립니다
        </p>
      </div>

      {/* 필터 섹션 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          모임 필터
        </h2>
        
        <div className="grid md:grid-cols-4 gap-4">
          {/* 스킬 레벨 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">수영 레벨</label>
            <select
              value={filters.skillLevel}
              onChange={(e) => setFilters(prev => ({ ...prev, skillLevel: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="">모든 레벨</option>
              {skillLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.icon} {level.label}
                </option>
              ))}
            </select>
          </div>

          {/* 영법 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">선호 영법</label>
            <select
              value={filters.strokes[0] || ''}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                strokes: e.target.value ? [e.target.value] : []
              }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="">모든 영법</option>
              {strokeOptions.map(stroke => (
                <option key={stroke.value} value={stroke.value}>
                  {stroke.icon} {stroke.label}
                </option>
              ))}
            </select>
          </div>

          {/* 페이스 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">선호 페이스</label>
            <select
              value={filters.pace}
              onChange={(e) => setFilters(prev => ({ ...prev, pace: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="">모든 페이스</option>
              {paceOptions.map(pace => (
                <option key={pace.value} value={pace.value}>
                  {pace.icon} {pace.label}
                </option>
              ))}
            </select>
          </div>

          {/* 최대 거리 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              최대 거리: {filters.maxDistance}m
            </label>
            <input
              type="range"
              min="100"
              max="2000"
              step="100"
              value={filters.maxDistance}
              onChange={(e) => setFilters(prev => ({ ...prev, maxDistance: Number(e.target.value) }))}
              className="w-full"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.showOnlyMatching}
              onChange={(e) => setFilters(prev => ({ ...prev, showOnlyMatching: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-sm">나에게 맞는 모임만 보기 (매칭도 70% 이상)</span>
          </label>
          
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
            <Search className="h-4 w-4 mr-2" />
            검색
          </button>
        </div>
      </div>

      {/* 추천 모임 섹션 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* 나에게 딱 맞는 모임 */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            나에게 딱 맞는 모임
          </h2>
          <div className="space-y-4">
            {mockMeetups
              .filter(m => calculateMatchScore(m) >= 80)
              .map(meetup => (
                <MeetupCard key={meetup.id} meetup={meetup} />
              ))}
          </div>
        </div>

        {/* 추천 모임 */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Star className="h-5 w-5 mr-2 text-yellow-600" />
            추천 모임
          </h2>
          <div className="space-y-4">
            {mockMeetups
              .filter(m => calculateMatchScore(m) >= 60 && calculateMatchScore(m) < 80)
              .map(meetup => (
                <MeetupCard key={meetup.id} meetup={meetup} />
              ))}
          </div>
        </div>
      </div>

      {/* 빠른 모임 생성 버튼 */}
      <div className="text-center">
        <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 font-medium text-lg flex items-center mx-auto shadow-lg">
          <Zap className="h-6 w-6 mr-2" />
          나만의 번개모임 만들기
        </button>
      </div>
    </div>
  );
};

export default MeetupMatcher;
