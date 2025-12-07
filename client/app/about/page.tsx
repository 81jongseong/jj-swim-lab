'use client';
import { logger } from '@/lib/logger';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LoadingState } from '@/components/common';

interface CenterInfo {
  name: string;
  shortDescription: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  businessHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  facilities: string[];
  features: string[];
  instructors: Array<{
    name: string;
    specialty: string;
    experience: string;
    image?: string;
  }>;
  courses: Array<{
    name: string;
    description: string;
    level: string;
    duration: string;
    price: string;
  }>;
}

// 게스트용 플랫폼 소개 뷰
const GuestCenterView: React.FC<{ centerInfo: CenterInfo }> = ({ centerInfo }) => (
  <div className="space-y-8">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">JJ Swim Lab</h1>
      <p className="text-xl text-blue-600 font-semibold mb-6">스마트 수영 교육 플랫폼</p>
      <p className="text-gray-700 leading-relaxed max-w-4xl mx-auto">
        JJ Swim Lab은 수영장 센터와 강사, 회원을 연결하는 통합 수영 교육 관리 플랫폼입니다. 
        AI 기반 건강 분석, 맞춤형 훈련 프로그램 생성, 실시간 진도 관리 등 첨단 기술을 활용하여 
        효율적이고 체계적인 수영 교육을 지원합니다.
      </p>
    </div>

    {/* 주요 기능 */}
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">🎯 주요 기능</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
          <span className="text-blue-600 text-2xl">🏊‍♂️</span>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">맞춤형 훈련 프로그램</h4>
            <p className="text-sm text-gray-600">개인의 건강 상태와 목표에 맞는 수영 프로그램 자동 생성</p>
          </div>
        </div>
        <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
          <span className="text-green-600 text-2xl">📊</span>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">건강 프로필 관리</h4>
            <p className="text-sm text-gray-600">회원의 건강 상태, 컨디션, 질환을 체계적으로 관리</p>
          </div>
        </div>
        <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
          <span className="text-purple-600 text-2xl">📈</span>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">실시간 진도 추적</h4>
            <p className="text-sm text-gray-600">학습 진도와 실력 향상을 실시간으로 확인</p>
          </div>
        </div>
        <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
          <span className="text-yellow-600 text-2xl">👥</span>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">통합 관리 시스템</h4>
            <p className="text-sm text-gray-600">센터, 강사, 회원을 하나의 플랫폼에서 관리</p>
          </div>
        </div>
        <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg">
          <span className="text-red-600 text-2xl">💬</span>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">실시간 피드백</h4>
            <p className="text-sm text-gray-600">강사와 학생 간 즉각적인 소통과 피드백</p>
          </div>
        </div>
        <div className="flex items-start space-x-3 p-4 bg-indigo-50 rounded-lg">
          <span className="text-indigo-600 text-2xl">📱</span>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">모바일 최적화</h4>
            <p className="text-sm text-gray-600">PC와 모바일에서 언제 어디서나 접근 가능</p>
          </div>
        </div>
      </div>
    </div>

    {/* 플랫폼 장점 */}
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">✨ 왜 JJ Swim Lab인가요?</h2>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-4xl mb-3">🎯</div>
          <h4 className="font-semibold text-gray-900 mb-2">개인 맞춤형 교육</h4>
          <p className="text-sm text-gray-600">
            AI 기반 분석으로 각 개인의 건강 상태, 체력, 목표에 맞는 최적의 수영 프로그램을 제공합니다.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-4xl mb-3">⚡</div>
          <h4 className="font-semibold text-gray-900 mb-2">효율적인 관리</h4>
          <p className="text-sm text-gray-600">
            센터 운영부터 강사 관리, 회원 진도 추적까지 모든 과정을 하나의 플랫폼에서 간편하게 관리합니다.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-4xl mb-3">🔒</div>
          <h4 className="font-semibold text-gray-900 mb-2">안전한 데이터 관리</h4>
          <p className="text-sm text-gray-600">
            회원의 건강 정보와 개인 데이터를 안전하게 보호하며, 권한별 접근 제어를 통해 보안을 강화합니다.
          </p>
        </div>
      </div>
    </div>

    {/* 사용 대상 */}
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">👥 누가 사용하나요?</h2>
      <div className="space-y-4">
        <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
          <span className="text-3xl">🏢</span>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">수영장 센터</h4>
            <p className="text-sm text-gray-600">회원 및 강사를 통합 관리하고, 센터 운영 효율을 극대화합니다.</p>
          </div>
        </div>
        <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg">
          <span className="text-3xl">👨‍🏫</span>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">강사</h4>
            <p className="text-sm text-gray-600">수업 일정, 학생 진도, 피드백을 체계적으로 관리하고 효과적인 교육을 제공합니다.</p>
          </div>
        </div>
        <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg">
          <span className="text-3xl">🏊</span>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">회원 (학생)</h4>
            <p className="text-sm text-gray-600">개인 맞춤 훈련 프로그램을 받고, 건강 상태를 체크하며, 실력 향상을 추적합니다.</p>
          </div>
        </div>
      </div>
    </div>

    {/* 문의하기 */}
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 text-white text-center">
      <h2 className="text-3xl font-bold mb-4">JJ Swim Lab과 함께하세요</h2>
      <p className="text-lg mb-6">더 스마트하고 효율적인 수영 교육 관리를 경험해보세요.</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="/auth/signup?type=student" className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          회원 가입하기
        </a>
        <a href="/auth/signup?type=instructor" className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
          강사 등록하기
        </a>
      </div>
    </div>
  </div>
);

// 학생용 센터 정보 뷰
const StudentCenterView: React.FC<{ centerInfo: CenterInfo; user: any }> = ({ centerInfo, user }) => (
  <div className="space-y-8">
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
      <p className="text-blue-700">
        안녕하세요, <strong>{user.name}</strong>님! {centerInfo.name}에 오신 것을 환영합니다.
      </p>
    </div>
    <GuestCenterView centerInfo={centerInfo} />
  </div>
);

// 강사용 센터 정보 뷰
const InstructorCenterView: React.FC<{ centerInfo: CenterInfo; user: any }> = ({ centerInfo, user }) => (
  <div className="space-y-8">
    <div className="bg-green-50 border-l-4 border-green-400 p-4">
      <p className="text-green-700">
        안녕하세요, <strong>{user.name}</strong> 강사님! {centerInfo.name}에서 함께 일하게 되어 기쁩니다.
      </p>
    </div>
    <GuestCenterView centerInfo={centerInfo} />
  </div>
);

// 센터 관리자용 센터 정보 뷰
const CenterAdminView: React.FC<{ centerInfo: CenterInfo; user: any }> = ({ centerInfo, user }) => (
  <div className="space-y-8">
    <div className="bg-purple-50 border-l-4 border-purple-400 p-4">
      <p className="text-purple-700">
        안녕하세요, <strong>{user.name}</strong> 관리자님! {centerInfo.name}의 운영을 책임지고 계시는군요.
      </p>
    </div>
    <GuestCenterView centerInfo={centerInfo} />
  </div>
);

// 최고 관리자용 - JJ Swim Lab 프로그램 소개 뷰
const SuperAdminView: React.FC<{ centerInfo: CenterInfo; user: any }> = ({ centerInfo, user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [programInfo, setProgramInfo] = useState({
    title: 'JJ Swim Lab - 스마트 수영 교육 플랫폼',
    subtitle: 'AI 기반 맞춤형 수영 교육 솔루션',
    description: 'JJ Swim Lab은 수영장 센터와 강사, 회원을 연결하는 통합 수영 교육 관리 플랫폼입니다. AI 기반 건강 분석, 맞춤형 훈련 프로그램 생성, 실시간 진도 관리 등 첨단 기술을 활용하여 효율적이고 체계적인 수영 교육을 지원합니다.',
    mainFeatures: [
      '🏊‍♂️ AI 기반 맞춤형 훈련 프로그램 자동 생성',
      '📊 회원 건강 프로필 및 컨디션 관리',
      '📈 실시간 진도 추적 및 평가 시스템',
      '👥 센터·강사·회원 통합 관리',
      '📱 모바일 반응형 UI',
      '🔔 실시간 알림 시스템'
    ],
    targetUsers: [
      '수영장 센터: 회원 및 강사 통합 관리',
      '강사: 수업 일정 및 학생 진도 관리',
      '회원: 개인 맞춤 훈련 프로그램 및 건강 체크'
    ],
    supportHours: {
      weekday: '평일 09:00 - 18:00',
      weekend: '주말/공휴일 휴무'
    },
    contact: {
      email: 'support@jjswimlab.com',
      phone: '02-1234-5678',
      kakaotalk: '@jjswimlab'
    }
  });

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/program-info', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(programInfo)
      });

      if (response.ok) {
        alert('프로그램 소개가 저장되었습니다!');
        setIsEditing(false);
      } else {
        alert('저장에 실패했습니다.');
      }
    } catch (error) {
      logger.error('저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-red-50 border-l-4 border-red-400 p-4 flex justify-between items-center">
        <p className="text-red-700">
          안녕하세요, <strong>{user.name}</strong> 최고 관리자님! 프로그램 소개 페이지를 편집할 수 있습니다.
        </p>
        <button
          onClick={() => {
            if (isEditing) {
              handleSave();
            } else {
              setIsEditing(true);
            }
          }}
          className={`px-4 py-2 rounded-lg font-medium ${
            isEditing 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isEditing ? '💾 저장하기' : '✏️ 편집 모드'}
        </button>
      </div>

      {isEditing ? (
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">프로그램 소개 편집</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">프로그램 제목 *</label>
            <input
              type="text"
              value={programInfo.title}
              onChange={(e) => setProgramInfo({ ...programInfo, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">부제목 *</label>
            <input
              type="text"
              value={programInfo.subtitle}
              onChange={(e) => setProgramInfo({ ...programInfo, subtitle: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">상세 설명 *</label>
            <textarea
              value={programInfo.description}
              onChange={(e) => setProgramInfo({ ...programInfo, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={5}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">고객 지원 시간</label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="평일"
                value={programInfo.supportHours.weekday}
                onChange={(e) => setProgramInfo({ 
                  ...programInfo, 
                  supportHours: { ...programInfo.supportHours, weekday: e.target.value }
                })}
                className="px-3 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="주말/공휴일"
                value={programInfo.supportHours.weekend}
                onChange={(e) => setProgramInfo({ 
                  ...programInfo, 
                  supportHours: { ...programInfo.supportHours, weekend: e.target.value }
                })}
                className="px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">연락처</label>
            <div className="space-y-2">
              <input
                type="email"
                placeholder="이메일"
                value={programInfo.contact.email}
                onChange={(e) => setProgramInfo({ 
                  ...programInfo, 
                  contact: { ...programInfo.contact, email: e.target.value }
                })}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="전화번호"
                value={programInfo.contact.phone}
                onChange={(e) => setProgramInfo({ 
                  ...programInfo, 
                  contact: { ...programInfo.contact, phone: e.target.value }
                })}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="카카오톡 ID"
                value={programInfo.contact.kakaotalk}
                onChange={(e) => setProgramInfo({ 
                  ...programInfo, 
                  contact: { ...programInfo.contact, kakaotalk: e.target.value }
                })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              저장하기
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* 메인 소개 */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{programInfo.title}</h1>
            <p className="text-xl text-blue-600 font-semibold mb-6">{programInfo.subtitle}</p>
            <p className="text-gray-700 leading-relaxed max-w-4xl mx-auto">{programInfo.description}</p>
          </div>

          {/* 주요 기능 */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">🎯 주요 기능</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {programInfo.mainFeatures.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-600 text-xl">{feature.split(' ')[0]}</span>
                  <span className="text-gray-700">{feature.substring(feature.indexOf(' ') + 1)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 사용 대상 */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">👥 사용 대상</h2>
            <div className="space-y-3">
              {programInfo.targetUsers.map((target, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <span className="text-2xl">•</span>
                  <p className="text-gray-700 pt-1">{target}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 고객 지원 */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">⏰ 고객 지원 시간</h3>
              <div className="space-y-2 text-gray-700">
                <p><strong>평일:</strong> {programInfo.supportHours.weekday}</p>
                <p><strong>주말/공휴일:</strong> {programInfo.supportHours.weekend}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">📞 문의처</h3>
              <div className="space-y-2 text-gray-700">
                <p><strong>이메일:</strong> {programInfo.contact.email}</p>
                <p><strong>전화:</strong> {programInfo.contact.phone}</p>
                <p><strong>카카오톡:</strong> {programInfo.contact.kakaotalk}</p>
              </div>
            </div>
          </div>

          {/* 기술 스택 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">🛠️ 기술 스택</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-semibold text-gray-900 mb-2">Frontend</h4>
                <p className="text-sm text-gray-600">Next.js, React, TypeScript, Tailwind CSS</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-semibold text-gray-900 mb-2">Backend</h4>
                <p className="text-sm text-gray-600">Node.js, Express, MongoDB</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-semibold text-gray-900 mb-2">AI/Engine</h4>
                <p className="text-sm text-gray-600">Swim Training Engine, Health Analytics</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function AboutPage() {
  const { user, loading } = useAuth();
  const [centerInfo, setCenterInfo] = useState<CenterInfo>({
    name: 'JJ Swim Lab',
    shortDescription: '수영 교육의 새로운 패러다임을 제시하는 프리미엄 수영 교육 센터',
    description: 'JJ Swim Lab은 최신 기술과 전통적인 수영 교육 방법을 결합하여 모든 연령대와 수준의 학생들에게 맞춤형 수영 교육을 제공합니다. 우리는 단순히 수영을 가르치는 것이 아니라, 학생 개개인의 잠재력을 최대한 끌어올리고 수영을 통해 건강한 삶을 살 수 있도록 돕습니다.',
    address: '서울특별시 강남구 테헤란로 123',
    phone: '02-1234-5678',
    email: 'info@jjswimlab.com',
    website: 'https://jjswimlab.com',
    businessHours: {
      monday: '09:00 - 21:00',
      tuesday: '09:00 - 21:00',
      wednesday: '09:00 - 21:00',
      thursday: '09:00 - 21:00',
      friday: '09:00 - 21:00',
      saturday: '09:00 - 18:00',
      sunday: '10:00 - 17:00'
    },
    facilities: [
      '25m 6레인 수영장',
      '어린이 전용 수영장',
      '사우나 및 샤워 시설',
      '주차장 (무료)',
      '카페테리아',
      '프로샵'
    ],
    features: [
      'AI 기반 수영 자세 분석',
      '개인별 맞춤 교육 프로그램',
      '소수 정원제 수업',
      '전문 강사진',
      '체계적인 진도 관리',
      '안전 교육 시스템'
    ],
    instructors: [
      {
        name: '김수영',
        specialty: '자유형 전문',
        experience: '15년 경력, 국가대표 선수 출신',
        image: '/images/instructors/default-avatar.png'
      },
      {
        name: '박철수',
        specialty: '초급자 교육 전문',
        experience: '10년 경력, 어린이 수영 교육 전문가',
        image: '/images/instructors/default-avatar.png'
      }
    ],
    courses: [
      {
        name: '자유형 초급 과정',
        description: '수영을 처음 시작하는 분들을 위한 기초 과정',
        level: '초급',
        duration: '8주',
        price: '₩200,000'
      },
      {
        name: '자유형 중급 과정',
        description: '기초를 마친 분들을 위한 심화 과정',
        level: '중급',
        duration: '8주',
        price: '₩250,000'
      },
      {
        name: '배영 과정',
        description: '자유형을 마친 분들을 위한 배영 전용 과정',
        level: '중급',
        duration: '6주',
        price: '₩200,000'
      },
      {
        name: '평영 과정',
        description: '평영의 정확한 자세와 기술을 익히는 과정',
        level: '중급',
        duration: '6주',
        price: '₩200,000'
      }
    ]
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingState message="로딩 중..." size="lg" />
        </div>
      </div>
    );
  }

  // 사용자 타입별로 다른 컴포넌트 렌더링
  const renderUserSpecificContent = () => {
    if (!user) {
      return <GuestCenterView centerInfo={centerInfo} />;
    }

    switch (user.userType) {
      case 'student':
        return <StudentCenterView centerInfo={centerInfo} user={user} />;
      case 'instructor':
        return <InstructorCenterView centerInfo={centerInfo} user={user} />;
      case 'centerAdmin':
        return <CenterAdminView centerInfo={centerInfo} user={user} />;
      case 'superAdmin':
        return <SuperAdminView centerInfo={centerInfo} user={user} />;
      default:
        return <GuestCenterView centerInfo={centerInfo} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderUserSpecificContent()}
      </div>
    </div>
  );
} 