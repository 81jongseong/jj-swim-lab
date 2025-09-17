/**
 * 🏢 JJ Swim Lab - 센터 소개 편집 페이지 (센터 관리자용)
 *
 * 📋 **페이지 목적**
 * - 센터 관리자가 자신의 센터 소개 내용을 편집하는 페이지
 * - 비회원, 소속 회원, 소속 강사에게 표시될 정보 관리
 * - 센터 검색 시 노출되는 정보 설정
 * - 이미지, 영상, 가격 정보 등 종합적인 센터 정보 관리
 * 
 * 🔄 **주요 기능**
 * - 센터 기본 정보 편집 (이름, 주소, 연락처)
 * - 센터 소개 내용 작성 및 편집 (간단 설명, 상세 설명)
 * - 특징, 인증, 성과, 특별 프로그램 관리
 * - 직원 정보 관리 (이름, 직책, 경력, 인증)
 * - 연락처 정보 및 SNS 링크 관리
 * - 가격 정보 설정 (회원권, 레슨비)
 * - 공개 설정 관리 (비회원, 회원, 강사별 표시 여부)
 * 
 * 🗄️ **데이터 연동**
 * - 센터 소개 정보 API (/api/center-introduction)
 * - 이미지 업로드 API
 * - 사용자 권한 확인 API
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect, useCallback)
 * - useAuth hook (사용자 인증)
 * - UI 컴포넌트 (Card, Button, Modal, Form)
 * - 센터 소개 관리 API
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 센터 관리자 권한 확인 필수
 * 2. 자신이 관리하는 센터만 편집 가능
 * 3. 이미지 업로드 보안 및 용량 제한
 * 4. 개인정보 보호 (가격 정보 공개 설정)
 * 5. 실시간 미리보기 기능
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-13: 초기 센터 소개 편집 페이지 구현
 * - 2025-01-13: 권한별 정보 표시 설정 추가
 * - 2025-01-13: 이미지 업로드 기능 구현
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import withAuth from '../../../components/withAuth';

// UI 컴포넌트 임포트
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// 아이콘 임포트
import { 
  Building, 
  Edit, 
  Save, 
  Plus, 
  Trash2, 
  Image, 
  Video, 
  Globe, 
  Users, 
  Eye, 
  EyeOff,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  Award,
  Target,
  Heart,
  History
} from 'lucide-react';

// 인터페이스 정의
interface StaffMember {
  name: string;
  position: string;
  experience: string;
  certifications: string[];
  photo?: string;
}

interface PricingItem {
  type: string;
  price: number;
  duration: string;
  description: string;
}

interface CenterIntroduction {
  shortDescription: string;
  fullDescription: string;
  features: string[];
  certifications: string[];
  images: string[];
  videoUrl?: string;
  achievements: string[];
  specialPrograms: string[];
  targetAudience: string[];
  philosophy: string;
  history: string;
  staff: StaffMember[];
  contactInfo: {
    website?: string;
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      youtube?: string;
      kakao?: string;
    };
    parkingInfo?: string;
    publicTransport?: string;
  };
  pricing: {
    membershipFees?: PricingItem[];
    lessonFees?: PricingItem[];
  };
  visibility: {
    isPublic: boolean;
    showToMembers: boolean;
    showToInstructors: boolean;
    lastUpdated: Date;
    updatedBy: string;
  };
}

interface Center {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  operatingHours: {
    open: string;
    close: string;
    days: string[];
  };
  facilities: string[];
  introduction?: CenterIntroduction;
}

function CenterIntroductionPage() {
  const { user, loading } = useAuth();
  
  // 상태 관리
  const [center, setCenter] = useState<Center | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [isEditing, setIsEditing] = useState(false);

  // 편집 데이터 상태
  const [editData, setEditData] = useState<Partial<CenterIntroduction>>({});
  
  // 새 항목 추가 상태
  const [newFeature, setNewFeature] = useState('');
  const [newStaff, setNewStaff] = useState<Partial<StaffMember>>({
    name: '',
    position: '',
    experience: '',
    certifications: []
  });

  // 권한 확인
  useEffect(() => {
    if (user && !['centerAdmin', 'superAdmin'].includes(user.userType)) {
      alert('센터 관리자만 접근할 수 있습니다.');
      window.location.href = '/dashboard';
    }
  }, [user]);

  // 센터 정보 로드
  const loadCenterInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('인증 토큰이 없습니다.');
        return;
      }

      // 사용자 정보가 아직 로드되지 않았으면 대기
      if (loading || !user) {
        console.log('사용자 정보 로딩 중...');
        return;
      }

      // 사용자의 센터 ID 가져오기
      const centerId = user?.centerId;
      if (!centerId) {
        console.error('센터 ID를 찾을 수 없습니다.');
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
          setCenter(data.data);
          setEditData(data.data.introduction || {});
          console.log('✅ 센터 정보 로드 완료:', data.data);
        } else {
          console.error('센터 정보 로드 실패:', data.message);
        }
      } else {
        console.error('센터 정보 로드 실패:', response.status);
      }
    } catch (error) {
      console.error('센터 정보 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // 초기 로드
  useEffect(() => {
    if (!loading && user && ['centerAdmin', 'superAdmin'].includes(user.userType)) {
      loadCenterInfo();
    }
  }, [user, loading, loadCenterInfo]);

  // 센터 소개 정보 저장
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      
      if (!center) {
        console.error('센터 정보가 없습니다.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/centers/my-center', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('✅ 센터 소개 정보 저장 완료');
          setIsEditing(false);
          loadCenterInfo(); // 새로고침
          alert('센터 소개 정보가 성공적으로 저장되었습니다.');
        } else {
          console.error('센터 소개 정보 저장 실패:', data.message);
          alert('저장 중 오류가 발생했습니다.');
        }
      } else {
        console.error('센터 소개 정보 저장 실패:', response.status);
        alert('저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('센터 소개 정보 저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 특징 추가
  const handleAddFeature = () => {
    if (newFeature.trim()) {
      const features = editData.features || [];
      setEditData({
        ...editData,
        features: [...features, newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  // 특징 삭제
  const handleRemoveFeature = (index: number) => {
    const features = editData.features || [];
    setEditData({
      ...editData,
      features: features.filter((_, i) => i !== index)
    });
  };

  // 직원 추가
  const handleAddStaff = () => {
    if (newStaff.name && newStaff.position) {
      const staff = editData.staff || [];
      setEditData({
        ...editData,
        staff: [...staff, newStaff as StaffMember]
      });
      setNewStaff({
        name: '',
        position: '',
        experience: '',
        certifications: []
      });
    }
  };

  // 직원 삭제
  const handleRemoveStaff = (index: number) => {
    const staff = editData.staff || [];
    setEditData({
      ...editData,
      staff: staff.filter((_, i) => i !== index)
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
        <span className="ml-2">센터 정보를 불러오는 중...</span>
      </div>
    );
  }

  if (!center) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <div className="p-6 text-center">
            <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              센터 정보를 찾을 수 없습니다
            </h3>
            <p className="text-gray-500 mb-4">
              센터 정보를 다시 불러오시겠습니까?
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
              🏢 {center.name} 소개 관리
            </h1>
            <p className="text-gray-600">
              센터 소개 내용을 편집하고 공개 설정을 관리하세요
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
                    setEditData(center.introduction || {});
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

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('basic')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'basic'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Building className="h-4 w-4 inline mr-2" />
            기본 정보
          </button>
          <button
            onClick={() => setActiveTab('description')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'description'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Edit className="h-4 w-4 inline mr-2" />
            소개 내용
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'features'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Star className="h-4 w-4 inline mr-2" />
            특징 & 성과
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'staff'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            직원 정보
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'contact'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Phone className="h-4 w-4 inline mr-2" />
            연락처 & SNS
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Eye className="h-4 w-4 inline mr-2" />
            공개 설정
          </button>
        </nav>
      </div>

      {/* 탭 컨텐츠 */}
      {activeTab === 'basic' && (
        <div className="space-y-6">
          {/* 기본 정보 */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                기본 정보
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">📍 위치 정보</h3>
                  <div className="space-y-2 text-gray-700">
                    <p><MapPin className="h-4 w-4 inline mr-2" />{center.address}</p>
                    <p><Phone className="h-4 w-4 inline mr-2" />{center.phone}</p>
                    <p><Mail className="h-4 w-4 inline mr-2" />{center.email}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">🕒 운영시간</h3>
                  <div className="space-y-1 text-gray-700">
                    <p><Clock className="h-4 w-4 inline mr-2" />
                      {center.operatingHours.open} - {center.operatingHours.close}
                    </p>
                    <p className="text-sm text-gray-500">
                      운영일: {center.operatingHours.days.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-3">🏊‍♂️ 시설 정보</h3>
                <div className="flex flex-wrap gap-2">
                  {center.facilities.map((facility, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'description' && (
        <div className="space-y-6">
          {/* 소개 내용 */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                센터 소개 내용
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    간단한 설명 (검색 시 표시)
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editData.shortDescription || ''}
                      onChange={(e) => setEditData({ ...editData, shortDescription: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="센터를 한 줄로 소개하는 간단한 설명을 입력하세요"
                    />
                  ) : (
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                      {center.introduction?.shortDescription || '간단한 설명이 없습니다.'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상세 설명
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editData.fullDescription || ''}
                      onChange={(e) => setEditData({ ...editData, fullDescription: e.target.value })}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="센터에 대한 상세한 설명을 입력하세요"
                    />
                  ) : (
                    <div className="text-gray-700 bg-gray-50 p-3 rounded-md">
                      {center.introduction?.fullDescription ? (
                        <div className="whitespace-pre-wrap">
                          {center.introduction.fullDescription}
                        </div>
                      ) : (
                        '상세 설명이 없습니다.'
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    운영 철학
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editData.philosophy || ''}
                      onChange={(e) => setEditData({ ...editData, philosophy: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="센터의 운영 철학이나 가치관을 입력하세요"
                    />
                  ) : (
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                      {center.introduction?.philosophy || '운영 철학이 없습니다.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'features' && (
        <div className="space-y-6">
          {/* 특징 및 성과 */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                센터 특징 및 성과
              </h2>

              {/* 특징 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  센터 특징
                </label>
                <div className="space-y-2">
                  {(editData.features || center.introduction?.features || []).map((feature, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                      <span className="text-gray-700">{feature}</span>
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveFeature(index)}
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

              {/* 성과 및 수상 경력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  성과 및 수상 경력
                </label>
                {isEditing ? (
                  <textarea
                    value={(editData.achievements || []).join('\n')}
                    onChange={(e) => setEditData({ 
                      ...editData, 
                      achievements: e.target.value.split('\n').filter(a => a.trim()) 
                    })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="성과나 수상 경력을 한 줄씩 입력하세요"
                  />
                ) : (
                  <div className="space-y-1">
                    {(center.introduction?.achievements || []).map((achievement, index) => (
                      <div key={index} className="flex items-center text-gray-700">
                        <Award className="h-4 w-4 mr-2 text-yellow-500" />
                        {achievement}
                      </div>
                    ))}
                    {(!center.introduction?.achievements || center.introduction.achievements.length === 0) && (
                      <p className="text-gray-500">등록된 성과가 없습니다.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'staff' && (
        <div className="space-y-6">
          {/* 직원 정보 */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                직원 정보
              </h2>

              <div className="space-y-4">
                {(editData.staff || center.introduction?.staff || []).map((member, index) => (
                  <div key={index} className="border border-gray-200 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{member.name}</h3>
                        <p className="text-sm text-gray-600">{member.position}</p>
                        {member.experience && (
                          <p className="text-sm text-gray-500 mt-1">{member.experience}</p>
                        )}
                        {member.certifications && member.certifications.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700">자격증:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {member.certifications.map((cert, certIndex) => (
                                <span
                                  key={certIndex}
                                  className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800"
                                >
                                  {cert}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveStaff(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {isEditing && (
                  <div className="border border-dashed border-gray-300 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">새 직원 추가</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={newStaff.name}
                        onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="이름"
                      />
                      <input
                        type="text"
                        value={newStaff.position}
                        onChange={(e) => setNewStaff({ ...newStaff, position: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="직책"
                      />
                      <input
                        type="text"
                        value={newStaff.experience}
                        onChange={(e) => setNewStaff({ ...newStaff, experience: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="경력"
                      />
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleAddStaff}
                          disabled={!newStaff.name || !newStaff.position}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          추가
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'contact' && (
        <div className="space-y-6">
          {/* 연락처 및 SNS */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                연락처 및 SNS 정보
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    웹사이트
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={editData.contactInfo?.website || ''}
                      onChange={(e) => setEditData({
                        ...editData,
                        contactInfo: {
                          ...editData.contactInfo,
                          website: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com"
                    />
                  ) : (
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                      {center.introduction?.contactInfo?.website || '웹사이트 정보가 없습니다.'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    주차 정보
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editData.contactInfo?.parkingInfo || ''}
                      onChange={(e) => setEditData({
                        ...editData,
                        contactInfo: {
                          ...editData.contactInfo,
                          parkingInfo: e.target.value
                        }
                      })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="주차 가능 여부, 요금 등"
                    />
                  ) : (
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                      {center.introduction?.contactInfo?.parkingInfo || '주차 정보가 없습니다.'}
                    </p>
                  )}
                </div>
              </div>

              {/* SNS 정보 */}
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-3">SNS 링크</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['facebook', 'instagram', 'youtube', 'kakao'].map((platform) => (
                    <div key={platform}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                        {platform}
                      </label>
                      {isEditing ? (
                        <input
                          type="url"
                          value={editData.contactInfo?.socialMedia?.[platform as keyof typeof editData.contactInfo.socialMedia] || ''}
                          onChange={(e) => setEditData({
                            ...editData,
                            contactInfo: {
                              ...editData.contactInfo,
                              socialMedia: {
                                ...editData.contactInfo?.socialMedia,
                                [platform]: e.target.value
                              }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={`${platform} 링크`}
                        />
                      ) : (
                        <p className="text-gray-700 bg-gray-50 p-2 rounded-md text-sm">
                          {center.introduction?.contactInfo?.socialMedia?.[platform as keyof typeof center.introduction.contactInfo.socialMedia] || `${platform} 링크가 없습니다.`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* 공개 설정 */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                공개 설정
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">비회원에게 공개</h3>
                    <p className="text-sm text-gray-500">센터 검색 시 정보가 표시됩니다</p>
                  </div>
                  {isEditing ? (
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editData.visibility?.isPublic ?? true}
                        onChange={(e) => setEditData({
                          ...editData,
                          visibility: {
                            ...editData.visibility,
                            isPublic: e.target.checked
                          }
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  ) : (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      center.introduction?.visibility?.isPublic
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {center.introduction?.visibility?.isPublic ? '공개' : '비공개'}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">소속 회원에게 표시</h3>
                    <p className="text-sm text-gray-500">센터 소속 회원이 상세 정보를 볼 수 있습니다</p>
                  </div>
                  {isEditing ? (
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editData.visibility?.showToMembers ?? true}
                        onChange={(e) => setEditData({
                          ...editData,
                          visibility: {
                            ...editData.visibility,
                            showToMembers: e.target.checked
                          }
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  ) : (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      center.introduction?.visibility?.showToMembers
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {center.introduction?.visibility?.showToMembers ? '표시' : '숨김'}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">소속 강사에게 표시</h3>
                    <p className="text-sm text-gray-500">센터 소속 강사가 상세 정보를 볼 수 있습니다</p>
                  </div>
                  {isEditing ? (
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editData.visibility?.showToInstructors ?? true}
                        onChange={(e) => setEditData({
                          ...editData,
                          visibility: {
                            ...editData.visibility,
                            showToInstructors: e.target.checked
                          }
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  ) : (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      center.introduction?.visibility?.showToInstructors
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {center.introduction?.visibility?.showToInstructors ? '표시' : '숨김'}
                    </span>
                  )}
                </div>
              </div>

              {/* 마지막 업데이트 정보 */}
              {center.introduction?.visibility?.lastUpdated && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    마지막 업데이트: {new Date(center.introduction.visibility.lastUpdated).toLocaleString('ko-KR')}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default withAuth(CenterIntroductionPage, { requireTypes: ['centerAdmin', 'superAdmin'] });
