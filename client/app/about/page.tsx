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

// 최고 관리자용 센터 정보 뷰
const SuperAdminView: React.FC<{ centerInfo: CenterInfo; user: any }> = ({ centerInfo, user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(centerInfo);

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/center-info', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        alert('센터 정보가 저장되었습니다!');
        setIsEditing(false);
        window.location.reload();
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
          안녕하세요, <strong>{user.name}</strong> 최고 관리자님! 소개 페이지를 편집할 수 있습니다.
        </p>
        <button
          onClick={() => {
            if (isEditing) {
              handleSave();
            } else {
              setEditForm(centerInfo);
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">센터 정보 편집</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">센터명 *</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">간단 소개 *</label>
            <input
              type="text"
              value={editForm.shortDescription}
              onChange={(e) => setEditForm({ ...editForm, shortDescription: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">상세 설명 *</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={5}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">주소 *</label>
              <input
                type="text"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">전화번호 *</label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
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
        <GuestCenterView centerInfo={centerInfo} />
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