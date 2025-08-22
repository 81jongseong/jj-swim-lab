'use client';

import { useState, useEffect } from 'react';
import withAuth from '../../../components/withAuth';

interface CenterInfo {
  _id: string;
  centerId: string;
  name: string;
  description: string;
  shortDescription: string;
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
  images: {
    mainImage: string;
    gallery: string[];
  };
  features: string[];
  instructors: {
    name: string;
    specialty: string;
    experience: string;
    image?: string;
  }[];
  courses: {
    name: string;
    description: string;
    level: string;
    duration: string;
    price: string;
  }[];
  socialMedia: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    blog?: string;
  };
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  isActive: boolean;
  lastUpdated: Date;
}

function CenterInfoPage() {
  const [centerInfo, setCenterInfo] = useState<CenterInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<CenterInfo>>({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadCenterInfo();
  }, []);

  const loadCenterInfo = async () => {
    try {
      setLoading(true);
      // Mock 데이터 사용
      const mockCenterInfo: CenterInfo = {
        _id: '1',
        centerId: 'JJSWIM001',
        name: 'JJ 수영장',
        description: '전문적인 수영 교육을 제공하는 프리미엄 수영장입니다.',
        shortDescription: '전문 수영 교육의 새로운 기준',
        address: '서울시 강남구 테헤란로 123',
        phone: '02-1234-5678',
        email: 'info@jjswim.com',
        website: 'https://jjswim.com',
        businessHours: {
          monday: '06:00-22:00',
          tuesday: '06:00-22:00',
          wednesday: '06:00-22:00',
          thursday: '06:00-22:00',
          friday: '06:00-22:00',
          saturday: '08:00-20:00',
          sunday: '08:00-18:00'
        },
        facilities: ['수영장', '샤워실', '탈의실', '사우나', '주차장'],
        images: {
          mainImage: '/api/placeholder/400/300',
          gallery: ['/api/placeholder/300/200', '/api/placeholder/300/200']
        },
        features: ['24시간 운영', '전문 강사진', '무료 주차', '사우나 이용'],
        instructors: [
          {
            name: '김강사',
            specialty: '자유형',
            experience: '10년',
            image: '/api/placeholder/100/100'
          }
        ],
        courses: [
          {
            name: '초급 자유형',
            description: '자유형 기초 과정',
            level: '초급',
            duration: '3개월',
            price: '300,000원'
          }
        ],
        socialMedia: {
          instagram: '@jjswim',
          facebook: 'jjswim',
          youtube: 'JJ수영장'
        },
        location: {
          latitude: 37.5665,
          longitude: 126.9780,
          address: '서울시 강남구 테헤란로 123'
        },
        isActive: true,
        lastUpdated: new Date()
      };

      setCenterInfo(mockCenterInfo);
      setFormData(mockCenterInfo);
    } catch (error) {
      console.error('센터 정보 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Mock 저장 로직
      setCenterInfo(formData as CenterInfo);
      setEditing(false);
      alert('센터 정보가 성공적으로 저장되었습니다.');
    } catch (error) {
      console.error('센터 정보 저장 실패:', error);
      alert('센터 정보 저장에 실패했습니다.');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'gallery') => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      // Mock 이미지 업로드
      const imageUrl = URL.createObjectURL(file);
      
      if (type === 'main') {
        setFormData(prev => ({
          ...prev,
          images: { ...prev.images, mainImage: imageUrl }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          images: { 
            ...prev.images, 
            gallery: [...(prev.images?.gallery || []), imageUrl] 
          }
        }));
      }

      alert('이미지가 성공적으로 업로드되었습니다.');
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">센터 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!centerInfo && !editing) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">센터 정보 관리</h1>
            <p className="text-gray-600 mb-8">아직 센터 정보가 등록되지 않았습니다.</p>
            <button
              onClick={() => setEditing(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              센터 정보 등록하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">센터 정보 관리</h1>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              수정하기
            </button>
          ) : (
            <div className="space-x-2">
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData(centerInfo || {});
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                저장
              </button>
            </div>
          )}
        </div>

        {editing ? (
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            {/* 기본 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">센터명</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">센터 ID</label>
                <input
                  type="text"
                  value={formData.centerId || ''}
                  onChange={(e) => handleInputChange('centerId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">간단 설명</label>
              <input
                type="text"
                value={formData.shortDescription || ''}
                onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="200자 이내로 센터를 소개해주세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">상세 설명</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="센터에 대한 자세한 설명을 입력해주세요"
              />
            </div>

            {/* 연락처 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">주소</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 이미지 업로드 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">메인 이미지</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'main')}
                  disabled={uploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formData.images?.mainImage && (
                  <img
                    src={formData.images.mainImage}
                    alt="메인 이미지"
                    className="mt-2 w-32 h-32 object-cover rounded-md"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">갤러리 이미지</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageUpload(e, 'gallery')}
                  disabled={uploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formData.images?.gallery && formData.images.gallery.length > 0 && (
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {formData.images.gallery.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`갤러리 이미지 ${index + 1}`}
                        className="w-24 h-24 object-cover rounded-md"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 시설 및 특징 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">주요 시설</label>
                <textarea
                  value={formData.facilities?.join(', ') || ''}
                  onChange={(e) => handleInputChange('facilities', e.target.value.split(', ').filter(Boolean))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="쉼표로 구분하여 입력 (예: 수영장, 샤워실, 탈의실)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">특징</label>
                <textarea
                  value={formData.features?.join(', ') || ''}
                  onChange={(e) => handleInputChange('features', e.target.value.split(', ').filter(Boolean))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="쉼표로 구분하여 입력 (예: 24시간 운영, 전문 강사진, 무료 주차)"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 기본 정보 */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">기본 정보</h2>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">센터명:</span>
                    <span className="ml-2 text-gray-900">{centerInfo?.name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">센터 ID:</span>
                    <span className="ml-2 text-gray-900">{centerInfo?.centerId}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">간단 설명:</span>
                    <p className="ml-2 text-gray-900 mt-1">{centerInfo?.shortDescription}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">상세 설명:</span>
                    <p className="ml-2 text-gray-900 mt-1">{centerInfo?.description}</p>
                  </div>
                </div>
              </div>

              {/* 연락처 정보 */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">연락처 정보</h2>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">주소:</span>
                    <span className="ml-2 text-gray-900">{centerInfo?.address}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">전화번호:</span>
                    <span className="ml-2 text-gray-900">{centerInfo?.phone}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">이메일:</span>
                    <span className="ml-2 text-gray-900">{centerInfo?.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 이미지 */}
            {centerInfo?.images && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">이미지</h2>
                <div className="space-y-4">
                  {centerInfo.images.mainImage && (
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">메인 이미지</h3>
                      <img
                        src={centerInfo.images.mainImage}
                        alt="메인 이미지"
                        className="w-48 h-32 object-cover rounded-lg shadow-md"
                      />
                    </div>
                  )}
                  {centerInfo.images.gallery && centerInfo.images.gallery.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">갤러리</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {centerInfo.images.gallery.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`갤러리 이미지 ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg shadow-md"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 시설 및 특징 */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {centerInfo?.facilities && centerInfo.facilities.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">주요 시설</h2>
                  <div className="flex flex-wrap gap-2">
                    {centerInfo.facilities.map((facility, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {centerInfo?.features && centerInfo.features.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">특징</h2>
                  <div className="flex flex-wrap gap-2">
                    {centerInfo.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(CenterInfoPage, { requireTypes: ['centerAdmin', 'superAdmin'], requirePermission: null });











