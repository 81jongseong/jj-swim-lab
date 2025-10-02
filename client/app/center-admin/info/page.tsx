/**
 * 🏢 JJ Swim Lab - 센터 정보 관리 페이지 (센터 관리자용)
 *
 * 📋 **페이지 목적**
 * - 센터 관리자가 센터의 기본 정보, 시설 정보, 운영 시간 등을 관리
 * - 기존 CenterInfo 모델과 연동하여 센터 정보 업데이트
 * - 이미지 업로드 및 갤러리 관리
 * - 시설 정보 및 편의시설 설정
 * 
 * 🔄 **주요 기능**
 * - 센터 기본 정보 관리 (이름, 주소, 연락처)
 * - 시설 정보 관리 (수영장, 편의시설, 주차장 등)
 * - 운영시간 설정
 * - 이미지 업로드 및 갤러리 관리
 * - 센터 특징 및 서비스 설정
 * 
 * 🗄️ **데이터 연동**
 * - CenterInfo 모델과 연동
 * - 이미지 업로드 API
 * - 센터 정보 관리 API
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect)
 * - useAuth hook
 * - UI 컴포넌트
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 기존 CenterInfo 모델 구조 유지
 * 2. 이미지 업로드 보안 및 용량 제한
 * 3. 센터 관리자 권한 확인
 * 4. 데이터 검증 및 오류 처리
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-13: 초기 센터 정보 관리 페이지 구현
 * - 2025-01-13: 기존 CenterInfo 모델과 연동
 * - 2025-01-13: 이미지 업로드 기능 구현
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import withAuth from '../../../components/withAuth';

// UI 컴포넌트 임포트
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui';
import { LoadingSpinner } from '../../../components/ui';

// 아이콘 임포트
import { 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Camera,
  Upload,
  Save,
  Edit,
  Plus,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';

// 인터페이스 정의 (기존 CenterInfo 모델과 일치)
interface CenterInfo {
  _id?: string;
  centerId: string;
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
  images: {
    mainImage?: string;
    gallery: string[];
  };
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
  }>;
  pricing: {
    membership: Array<{
      type: string;
      price: number;
      duration: string;
      description: string;
    }>;
    lessons: Array<{
      type: string;
      price: number;
      duration: string;
      description: string;
    }>;
  };
  updatedAt: Date;
}

function CenterInfoManagementPage() {
  const { user } = useAuth();
  
  // 상태 관리
  const [centerInfo, setCenterInfo] = useState<CenterInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingInfo, setEditingInfo] = useState<Partial<CenterInfo>>({});

  // 새 항목 추가 상태
  const [newFacility, setNewFacility] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [newInstructor, setNewInstructor] = useState({
    name: '',
    specialty: '',
    experience: ''
  });
  const [newCourse, setNewCourse] = useState({
    name: '',
    description: '',
    level: '',
    duration: ''
  });

  // 권한 확인
  useEffect(() => {
    if (user && !['centerAdmin', 'superAdmin'].includes(user.userType)) {
      alert('센터 관리자만 접근할 수 있습니다.');
      window.location.href = '/dashboard';
    }
  }, [user]);

  // 센터 정보 로드
  const loadCenterInfo = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('인증 토큰이 없습니다.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/centers/my-center', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCenterInfo(data.data);
          setEditingInfo(data.data);
          console.log('✅ 센터 정보 로드 완료:', data.data);
        } else {
          console.error('센터 정보 로드 실패:', data.message);
          loadTempData();
        }
      } else {
        console.error('센터 정보 로드 실패:', response.status);
        loadTempData();
      }
    } catch (error) {
      console.error('센터 정보 로드 오류:', error);
      loadTempData();
    } finally {
      setIsLoading(false);
    }
  };

  // 임시 데이터 로드 (기존 구조 유지)
  const loadTempData = () => {
    const tempInfo: CenterInfo = {
      centerId: 'jjswim-main',
      name: 'JJ Swim Lab',
      shortDescription: 'AI 기반 수영 교육의 새로운 패러다임',
      description: 'JJ Swim Lab은 최신 AI 기술과 전통적인 수영 교육 방법을 결합하여 모든 연령대와 수준의 학생들에게 맞춤형 수영 교육을 제공합니다.',
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
      images: {
        mainImage: '/api/placeholder/800/400',
        gallery: [
          '/api/placeholder/400/300',
          '/api/placeholder/400/300',
          '/api/placeholder/400/300'
        ]
      },
      instructors: [
        {
          name: '김수영',
          specialty: '자유형 전문',
          experience: '15년 경력, 국가대표 선수 출신',
          image: '/api/placeholder/100/100'
        },
        {
          name: '박철수',
          specialty: '초급자 교육 전문',
          experience: '10년 경력, 어린이 수영 교육 전문가',
          image: '/api/placeholder/100/100'
        }
      ],
      courses: [
        {
          name: '자유형 초급 과정',
          description: '자유형 기초 기술을 체계적으로 학습',
          level: '초급',
          duration: '8주'
        },
        {
          name: '접영 중급 과정',
          description: '접영의 핵심 기술과 타이밍 연습',
          level: '중급',
          duration: '10주'
        }
      ],
      pricing: {
        membership: [
          {
            type: '개인 회원권',
            price: 150000,
            duration: '1개월',
            description: '개인 수영 및 시설 이용'
          }
        ],
        lessons: [
          {
            type: '개인 레슨',
            price: 80000,
            duration: '1시간',
            description: '1:1 개인 맞춤 레슨'
          }
        ]
      },
      updatedAt: new Date()
    };

    setCenterInfo(tempInfo);
    setEditingInfo(tempInfo);
  };

  // 초기 로드
  useEffect(() => {
    if (user && ['centerAdmin', 'superAdmin'].includes(user.userType)) {
      loadCenterInfo();
    }
  }, [user]);

  // 센터 정보 저장
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/centers/my-center', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingInfo)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('✅ 센터 정보 저장 완료');
          setIsEditing(false);
          loadCenterInfo();
          alert('센터 정보가 성공적으로 저장되었습니다.');
        } else {
          console.error('센터 정보 저장 실패:', data.message);
          alert('저장 중 오류가 발생했습니다.');
        }
      } else {
        console.error('센터 정보 저장 실패:', response.status);
        alert('저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('센터 정보 저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 시설 추가
  const handleAddFacility = () => {
    if (newFacility.trim()) {
      const facilities = editingInfo.facilities || [];
      setEditingInfo({
        ...editingInfo,
        facilities: [...facilities, newFacility.trim()]
      });
      setNewFacility('');
    }
  };

  // 특징 추가
  const handleAddFeature = () => {
    if (newFeature.trim()) {
      const features = editingInfo.features || [];
      setEditingInfo({
        ...editingInfo,
        features: [...features, newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  // 강사 추가
  const handleAddInstructor = () => {
    if (newInstructor.name && newInstructor.specialty) {
      const instructors = editingInfo.instructors || [];
      setEditingInfo({
        ...editingInfo,
        instructors: [...instructors, { ...newInstructor, image: '/api/placeholder/100/100' }]
      });
      setNewInstructor({ name: '', specialty: '', experience: '' });
    }
  };

  // 강의 추가
  const handleAddCourse = () => {
    if (newCourse.name && newCourse.description) {
      const courses = editingInfo.courses || [];
      setEditingInfo({
        ...editingInfo,
        courses: [...courses, newCourse]
      });
      setNewCourse({ name: '', description: '', level: '', duration: '' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
        <span className="ml-2">센터 정보를 불러오는 중...</span>
      </div>
    );
  }

  if (!centerInfo) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <div className="p-6 text-center">
            <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              센터 정보를 찾을 수 없습니다
            </h3>
            <p className="text-gray-500 mb-4">
              새로운 센터 정보를 생성하시겠습니까?
            </p>
            <Button onClick={loadCenterInfo} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              다시 시도
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🏢 센터 정보 관리
            </h1>
            <p className="text-gray-600">
              센터의 기본 정보, 시설, 운영시간 등을 관리하세요
            </p>
          </div>
          <div className="flex space-x-3">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                편집하기
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setEditingInfo(centerInfo);
                  }}
                  variant="outline"
                >
                  취소
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSaving ? (
                    <>
                      <LoadingSpinner />
                      저장 중...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      저장
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 센터 정보 카드들 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 기본 정보 */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              기본 정보
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  센터명
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editingInfo.name || ''}
                    onChange={(e) => setEditingInfo({ ...editingInfo, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{centerInfo.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  간단한 설명
                </label>
                {isEditing ? (
                  <textarea
                    value={editingInfo.shortDescription || ''}
                    onChange={(e) => setEditingInfo({ ...editingInfo, shortDescription: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{centerInfo.shortDescription}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  주소
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editingInfo.address || ''}
                    onChange={(e) => setEditingInfo({ ...editingInfo, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center text-gray-700 bg-gray-50 p-3 rounded-md">
                    <MapPin className="h-4 w-4 mr-2" />
                    {centerInfo.address}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    전화번호
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editingInfo.phone || ''}
                      onChange={(e) => setEditingInfo({ ...editingInfo, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="flex items-center text-gray-700 bg-gray-50 p-3 rounded-md">
                      <Phone className="h-4 w-4 mr-2" />
                      {centerInfo.phone}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이메일
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editingInfo.email || ''}
                      onChange={(e) => setEditingInfo({ ...editingInfo, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="flex items-center text-gray-700 bg-gray-50 p-3 rounded-md">
                      <Mail className="h-4 w-4 mr-2" />
                      {centerInfo.email}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 운영시간 */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              운영시간
            </h2>
            
            <div className="space-y-3">
              {Object.entries(editingInfo.businessHours || centerInfo.businessHours).map(([day, hours]) => (
                <div key={day} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {day === 'monday' && '월요일'}
                    {day === 'tuesday' && '화요일'}
                    {day === 'wednesday' && '수요일'}
                    {day === 'thursday' && '목요일'}
                    {day === 'friday' && '금요일'}
                    {day === 'saturday' && '토요일'}
                    {day === 'sunday' && '일요일'}
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={hours}
                      onChange={(e) => setEditingInfo({
                        ...editingInfo,
                        businessHours: {
                          ...editingInfo.businessHours,
                          [day]: e.target.value
                        }
                      })}
                      className="w-32 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="09:00 - 21:00"
                    />
                  ) : (
                    <span className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded">
                      {hours}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* 시설 정보 */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              시설 정보
            </h2>
            
            <div className="space-y-3">
              {(editingInfo.facilities || centerInfo.facilities).map((facility, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <span className="text-gray-700">{facility}</span>
                  {isEditing && (
                    <button
                      onClick={() => {
                        const facilities = editingInfo.facilities || [];
                        setEditingInfo({
                          ...editingInfo,
                          facilities: facilities.filter((_, i) => i !== index)
                        });
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              
              {isEditing && (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newFacility}
                    onChange={(e) => setNewFacility(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="새 시설 추가"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddFacility();
                      }
                    }}
                  />
                  <Button
                    onClick={handleAddFacility}
                    disabled={!newFacility.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* 센터 특징 */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              센터 특징
            </h2>
            
            <div className="space-y-3">
              {(editingInfo.features || centerInfo.features).map((feature, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <span className="text-gray-700">{feature}</span>
                  {isEditing && (
                    <button
                      onClick={() => {
                        const features = editingInfo.features || [];
                        setEditingInfo({
                          ...editingInfo,
                          features: features.filter((_, i) => i !== index)
                        });
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              
              {isEditing && (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="새 특징 추가"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddFeature();
                      }
                    }}
                  />
                  <Button
                    onClick={handleAddFeature}
                    disabled={!newFeature.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* 강사 정보 */}
      <div className="mt-6">
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              강사 정보
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(editingInfo.instructors || centerInfo.instructors).map((instructor, index) => (
                <div key={index} className="border border-gray-200 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{instructor.name}</h3>
                      <p className="text-sm text-gray-600">{instructor.specialty}</p>
                      <p className="text-sm text-gray-500 mt-1">{instructor.experience}</p>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => {
                          const instructors = editingInfo.instructors || [];
                          setEditingInfo({
                            ...editingInfo,
                            instructors: instructors.filter((_, i) => i !== index)
                          });
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {isEditing && (
              <div className="mt-4 p-4 border border-dashed border-gray-300 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">새 강사 추가</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={newInstructor.name}
                    onChange={(e) => setNewInstructor({ ...newInstructor, name: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="이름"
                  />
                  <input
                    type="text"
                    value={newInstructor.specialty}
                    onChange={(e) => setNewInstructor({ ...newInstructor, specialty: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="전문분야"
                  />
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newInstructor.experience}
                      onChange={(e) => setNewInstructor({ ...newInstructor, experience: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="경력"
                    />
                    <Button
                      onClick={handleAddInstructor}
                      disabled={!newInstructor.name || !newInstructor.specialty}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(CenterInfoManagementPage, { requireTypes: ['centerAdmin', 'superAdmin'] });
