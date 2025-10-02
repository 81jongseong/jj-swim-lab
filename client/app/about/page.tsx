'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

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

// 게스트용 센터 정보 뷰
const GuestCenterView: React.FC<{ centerInfo: CenterInfo }> = ({ centerInfo }) => (
  <div className="space-y-8">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">{centerInfo.name}</h1>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">{centerInfo.shortDescription}</p>
    </div>

    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">센터 소개</h2>
      <p className="text-gray-700 leading-relaxed">{centerInfo.description}</p>
    </div>

    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">연락처</h3>
        <div className="space-y-2 text-gray-700">
          <p><strong>주소:</strong> {centerInfo.address}</p>
          <p><strong>전화:</strong> {centerInfo.phone}</p>
          <p><strong>이메일:</strong> {centerInfo.email}</p>
          {centerInfo.website && <p><strong>웹사이트:</strong> <a href={centerInfo.website} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{centerInfo.website}</a></p>}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">운영시간</h3>
        <div className="space-y-2 text-gray-700">
          <p><strong>월요일:</strong> {centerInfo.businessHours.monday}</p>
          <p><strong>화요일:</strong> {centerInfo.businessHours.tuesday}</p>
          <p><strong>수요일:</strong> {centerInfo.businessHours.wednesday}</p>
          <p><strong>목요일:</strong> {centerInfo.businessHours.thursday}</p>
          <p><strong>금요일:</strong> {centerInfo.businessHours.friday}</p>
          <p><strong>토요일:</strong> {centerInfo.businessHours.saturday}</p>
          <p><strong>일요일:</strong> {centerInfo.businessHours.sunday}</p>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">시설 및 특징</h2>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">시설</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {centerInfo.facilities.map((facility, index) => (
              <li key={index}>{facility}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">특징</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {centerInfo.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">강사진</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {centerInfo.instructors.map((instructor, index) => (
          <div key={index} className="text-center p-4 border rounded-lg">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              {instructor.image ? (
                <img src={instructor.image} alt={instructor.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-2xl text-gray-500">👤</span>
              )}
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">{instructor.name}</h4>
            <p className="text-sm text-gray-600 mb-1">{instructor.specialty}</p>
            <p className="text-xs text-gray-500">{instructor.experience}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">강습 과정</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {centerInfo.courses.map((course, index) => (
          <div key={index} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h4 className="font-semibold text-gray-900 mb-2">{course.name}</h4>
            <p className="text-sm text-gray-600 mb-3">{course.description}</p>
            <div className="space-y-1 text-xs text-gray-500">
              <p><strong>난이도:</strong> {course.level}</p>
              <p><strong>기간:</strong> {course.duration}</p>
              <p><strong>가격:</strong> {course.price}</p>
            </div>
          </div>
        ))}
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
      console.error('저장 오류:', error);
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
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">로딩 중...</p>
            </div>
          </div>
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