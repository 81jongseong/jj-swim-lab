/**
 * @file 센터 관리자 홈페이지 (센터 소개)
 * @description 일반 웹사이트 홈페이지 스타일의 센터 소개 페이지입니다.
 * 
 * @연동되는 데이터:
 * - 센터 정보 API (/api/center-admin/center-info)
 * - 센터 소개 정보 API (/api/center-introduction/:centerId)
 * - 강습 과정 API (/api/courses)
 * - 강사 정보 API (/api/center-admin/instructors)
 * 
 * @연동되는 파일:
 * - hooks/useAuth.tsx (인증 상태)
 * - components/ui (UI 컴포넌트)
 */

'use client';
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTenantSettings } from '@/contexts/TenantSettingsContext';
import { 
  MapPin, Phone, Mail, Clock, Edit, 
  Users, ArrowRight, Calendar, Save, X, Upload
} from 'lucide-react';
import { Button } from '@/components/Button';

interface CenterInfo {
  _id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  shortDescription?: string;
  operatingHours?: {
    [key: string]: string;
  };
  facilities?: string[];
  images?: {
    mainImage?: string;
    logo?: string;
    [key: string]: string | undefined;
  };
  introduction?: {
    shortDescription?: string;
    fullDescription?: string;
    philosophy?: string;
    features?: string[];
    images?: string[];
    videoUrl?: string;
    contactInfo?: {
      website?: string;
      parkingInfo?: string;
      publicTransport?: string;
    };
  };
}

interface Course {
  _id: string;
  name: string;
  level: string;
  description?: string;
  maxStudents?: number;
  price?: number;
}

interface Instructor {
  _id: string;
  name: string;
  instructorInfo?: {
    specialties?: string[];
    experience?: string;
    photo?: string;
    bio?: string;
    introduction?: string;
  };
}

const CenterHomePage: React.FC = () => {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const { centerSlug } = useParams<{ centerSlug: string }>();
  const viewOnly = searchParams?.get('viewOnly') === 'true';
  const { branding } = useTenantSettings();
  const [centerInfo, setCenterInfo] = useState<CenterInfo | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 브랜딩 색상 가져오기 (기본값 fallback)
  const primaryColor = branding?.primaryColor || '#3b82f6';
  const secondaryColor = branding?.secondaryColor || '#ffffff';
  
  // 편집 상태
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingMainImage, setUploadingMainImage] = useState(false);

  // 센터 정보 로드
  useEffect(() => {
    loadCenterInfo();
  }, []);

  const loadCenterInfo = async () => {
    try {
      setIsLoading(true);

      if (viewOnly) {
        if (!centerSlug) {
          console.error('센터 slug가 없습니다.');
          return;
        }

        const resolveRes = await fetch(`http://localhost:5000/api/centers/resolve-slug/${centerSlug}`);
        if (!resolveRes.ok) {
          console.error('센터 정보를 불러올 수 없습니다.');
          return;
        }

        const resolveJson = await resolveRes.json();
        if (!resolveJson.success) {
          console.error(resolveJson.message || '센터 정보를 불러올 수 없습니다.');
          return;
        }

        const centerId = resolveJson.data?.centerId;
        const centerName = resolveJson.data?.name || centerSlug;

        let publicInfo: any = null;
        if (centerId) {
          const introRes = await fetch(`http://localhost:5000/api/center-introduction/public/${centerId}`);
          if (introRes.ok) {
            const introJson = await introRes.json();
            if (introJson.success) {
              publicInfo = introJson.data;
            }
          }

          const coursesRes = await fetch(`http://localhost:5000/api/courses/public/center/${centerId}`);
          if (coursesRes.ok) {
            const coursesJson = await coursesRes.json();
            if (coursesJson.success) {
              setCourses(coursesJson.data?.slice(0, 6) || []);
            }
          }
        }

        setCenterInfo({
          _id: centerId,
          name: centerName,
          address: publicInfo?.address,
          phone: publicInfo?.phone,
          email: publicInfo?.email,
          description: publicInfo?.introduction?.fullDescription || publicInfo?.introduction?.shortDescription,
          introduction: publicInfo?.introduction,
          facilities: publicInfo?.facilities || [],
          operatingHours: publicInfo?.operatingHours || {},
          images: publicInfo?.introduction?.images?.length
            ? { mainImage: publicInfo.introduction.images[0] }
            : undefined,
        } as CenterInfo);
        return;
      }

      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('인증 토큰이 없습니다.');
        return;
      }

      // 센터 정보 로드
      const centerResponse = await fetch('http://localhost:5000/api/center-admin/center-info', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (centerResponse.ok) {
        const centerData = await centerResponse.json();
        if (centerData.success) {
          setCenterInfo(centerData.data);
        }
      }

      // 강습 과정 로드
      const coursesResponse = await fetch('http://localhost:5000/api/courses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        if (coursesData.success) {
          setCourses(coursesData.data?.slice(0, 6) || []);
        }
      }

      // 강사 정보 로드
      const instructorsResponse = await fetch('http://localhost:5000/api/center-admin/instructors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (instructorsResponse.ok) {
        const instructorsData = await instructorsResponse.json();
        if (instructorsData.success) {
          setInstructors(instructorsData.data?.instructors?.slice(0, 3) || []);
        }
      }
    } catch (error) {
      console.error('센터 정보 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 섹션 편집 시작
  const startEdit = (section: string) => {
    if (viewOnly) return;
    setEditingSection(section);
    if (section === 'facilities') {
      setEditData({
        facilities: centerInfo?.facilities || [],
        images: centerInfo?.introduction?.images || [],
        fullDescription: centerInfo?.introduction?.fullDescription || '',
        philosophy: centerInfo?.introduction?.philosophy || ''
      });
    } else if (section === 'hero') {
      setEditData({
        name: centerInfo?.name || '',
        shortDescription: centerInfo?.introduction?.shortDescription || centerInfo?.description || '',
        mainImage: centerInfo?.images?.mainImage || '',
        logoImage: centerInfo?.images?.logo || ''
      });
    }
  };

  // 편집 저장
  const saveEdit = async () => {
    if (viewOnly) return;
    try {
      const token = localStorage.getItem('token');
      if (!token || !centerInfo?._id) return;

      if (editingSection === 'facilities') {
        // 시설 소개는 center-introduction API 사용
        const updateData = {
          fullDescription: editData.fullDescription,
          philosophy: editData.philosophy,
          images: editData.images
        };

        const response = await fetch(`http://localhost:5000/api/center-introduction/${centerInfo._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setEditingSection(null);
            loadCenterInfo();
          }
        }
      } else if (editingSection === 'hero') {
        // 히어로 섹션은 센터 정보 업데이트 API 사용 (센터명, 로고 이미지 포함)
        const updateData: any = {
          introduction: {
            shortDescription: editData.shortDescription
          }
        };

        // 센터명 업데이트
        if (editData.name) {
          updateData.name = editData.name;
        }

        // 이미지 업데이트
        if (editData.mainImage || editData.logoImage) {
          updateData.images = {
            ...(centerInfo?.images || {}),
            ...(editData.mainImage ? { mainImage: editData.mainImage } : {}),
            ...(editData.logoImage ? { logo: editData.logoImage } : {})
          };
        }

        const response = await fetch(`http://localhost:5000/api/centers/my-center`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setEditingSection(null);
            loadCenterInfo();
          } else {
            console.error('저장 실패:', result.message);
          }
        } else {
          const errorText = await response.text();
          console.error('저장 오류:', errorText);
        }
      }
    } catch (error) {
      console.error('편집 저장 오류:', error);
    }
  };

  const getOperatingHoursText = () => {
    if (!centerInfo?.operatingHours) return '문의하세요';
    
    const hours = centerInfo.operatingHours;
    const days = ['월', '화', '수', '목', '금', '토', '일'];
    const timeSlots: string[] = [];
    
    days.forEach((day, index) => {
      const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const time = hours[dayKeys[index]];
      if (time) {
        timeSlots.push(`${day}: ${time}`);
      }
    });
    
    return timeSlots.length > 0 ? timeSlots.join(', ') : '문의하세요';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">센터 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 히어로 섹션 - 모던 디자인 */}
      <section className="relative h-[700px] bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 overflow-hidden">
        {/* 배경 효과 */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
        {centerInfo?.images?.mainImage && (
          <img 
            src={centerInfo.images.mainImage} 
            alt={centerInfo.name}
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 via-blue-800/30 to-transparent"></div>
        
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          {!viewOnly && (
            <div className="absolute top-6 right-6">
              <Button
                onClick={() => startEdit('hero')}
                variant="outline"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-white/30 shadow-lg hover:shadow-xl transition-all"
              >
                <Edit className="mr-2 h-4 w-4" />
                편집
              </Button>
            </div>
          )}
          
          {/* 로고 이미지 표시 */}
          {centerInfo?.images?.logo && (
            <div className="mb-6">
              <img 
                src={`http://localhost:5000${centerInfo.images.logo}`} 
                alt={centerInfo.name}
                className="h-24 md:h-32 mx-auto object-contain drop-shadow-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          
          <div className="mb-8">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-white mb-6 drop-shadow-2xl tracking-tight break-words px-4">
              {centerInfo?.name || '수영센터'}
            </h1>
            <div className="w-24 h-1 bg-white/80 mx-auto mb-6 rounded-full"></div>
          </div>
          
          <p className="text-xl md:text-2xl lg:text-3xl text-white font-light mb-12 max-w-4xl leading-relaxed drop-shadow-lg">
            {centerInfo?.introduction?.shortDescription || 
             centerInfo?.description || 
             '최고의 수영 교육을 제공합니다'}
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <Button
              onClick={() => {
                if (viewOnly) {
                  const targetSlug = centerSlug || 'default';
                  window.open(`/center/${targetSlug}/admin/courses?viewOnly=true`, '_blank', 'noopener,noreferrer');
                } else {
                  window.location.href = '/center-admin/courses';
                }
              }}
              className="bg-white text-blue-700 hover:bg-gray-50 px-10 py-4 text-lg font-bold shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 rounded-full flex items-center justify-center gap-2"
            >
              <Calendar className="h-5 w-5" />
              {viewOnly ? '강습 과정 보기' : '강습 등록하기'}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
              <div className="w-1 h-3 bg-white/70 rounded-full mt-1"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 편집 모달 */}
      {!viewOnly && editingSection === 'hero' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6">히어로 섹션 편집</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">센터명</label>
                <input
                  type="text"
                  value={editData.name || ''}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                  placeholder="센터명을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">간단한 설명</label>
                <textarea
                  value={editData.shortDescription || ''}
                  onChange={(e) => setEditData({ ...editData, shortDescription: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                  rows={4}
                  placeholder="센터에 대한 간단한 설명을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">센터 로고 이미지</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    setUploadingLogo(true);
                    try {
                      const formData = new FormData();
                      formData.append('logo', file);
                      
                      const token = localStorage.getItem('token');
                      const response = await fetch(`http://localhost:5000/api/centers/my-center/upload-logo`, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${token}`
                        },
                        body: formData
                      });
                      
                      if (response.ok) {
                        const result = await response.json();
                        const logoUrl = result.data?.logo || result.data?.imageUrl;
                        if (logoUrl) {
                          setEditData({ ...editData, logoImage: logoUrl });
                          // 서버에 이미지 URL 저장 (PUT /api/centers/my-center)
                          const saveResponse = await fetch(`http://localhost:5000/api/centers/my-center`, {
                            method: 'PUT',
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                              images: {
                                logo: logoUrl
                              }
                            })
                          });
                          if (saveResponse.ok) {
                            alert('로고가 성공적으로 업로드 및 저장되었습니다.');
                            // 센터 정보 다시 로드하여 브랜딩 설정에도 반영
                            loadCenterInfo();
                          } else {
                            alert('로고는 업로드되었지만 저장에 실패했습니다.');
                          }
                        } else {
                          alert('로고 업로드는 성공했지만 URL을 가져올 수 없습니다.');
                        }
                      } else {
                        const error = await response.json();
                        alert(error.message || '로고 업로드에 실패했습니다.');
                      }
                    } catch (error) {
                      console.error('로고 업로드 오류:', error);
                      alert('로고 업로드 중 오류가 발생했습니다.');
                    } finally {
                      setUploadingLogo(false);
                    }
                  }}
                  className="w-full p-3 border rounded-lg"
                  disabled={uploadingLogo}
                />
                {editData.logoImage && (
                  <div className="mt-2">
                    <img 
                      src={`http://localhost:5000${editData.logoImage}`} 
                      alt="로고 미리보기" 
                      className="max-w-xs h-32 object-contain border rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                {uploadingLogo && <p className="mt-2 text-sm text-blue-600">업로드 중...</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">메인 배경 이미지</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    setUploadingMainImage(true);
                    try {
                      const formData = new FormData();
                      formData.append('mainImage', file);
                      
                      const token = localStorage.getItem('token');
                      const response = await fetch(`http://localhost:5000/api/centers/my-center/upload-main-image`, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${token}`
                        },
                        body: formData
                      });
                      
                      if (response.ok) {
                        const result = await response.json();
                        const mainImageUrl = result.data?.mainImage || result.data?.imageUrl;
                        if (mainImageUrl) {
                          setEditData({ ...editData, mainImage: mainImageUrl });
                          // 서버에 이미지 URL 저장 (PUT /api/centers/my-center)
                          const saveResponse = await fetch(`http://localhost:5000/api/centers/my-center`, {
                            method: 'PUT',
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                              images: {
                                mainImage: mainImageUrl
                              }
                            })
                          });
                          if (saveResponse.ok) {
                            alert('메인 이미지가 성공적으로 업로드 및 저장되었습니다.');
                            // 센터 정보 다시 로드하여 브랜딩 설정에도 반영
                            loadCenterInfo();
                          } else {
                            alert('메인 이미지는 업로드되었지만 저장에 실패했습니다.');
                          }
                        } else {
                          alert('메인 이미지 업로드는 성공했지만 URL을 가져올 수 없습니다.');
                        }
                      } else {
                        const error = await response.json();
                        alert(error.message || '메인 이미지 업로드에 실패했습니다.');
                      }
                    } catch (error) {
                      console.error('메인 이미지 업로드 오류:', error);
                      alert('메인 이미지 업로드 중 오류가 발생했습니다.');
                    } finally {
                      setUploadingMainImage(false);
                    }
                  }}
                  className="w-full p-3 border rounded-lg"
                  disabled={uploadingMainImage}
                />
                {editData.mainImage && (
                  <div className="mt-2">
                    <img 
                      src={`http://localhost:5000${editData.mainImage}`} 
                      alt="배경 미리보기" 
                      className="max-w-xs h-32 object-cover border rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                {uploadingMainImage && <p className="mt-2 text-sm text-blue-600">업로드 중...</p>}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-8">
              <Button onClick={() => setEditingSection(null)} variant="outline">
                <X className="mr-2 h-4 w-4" />
                취소
              </Button>
              <Button onClick={saveEdit} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Save className="mr-2 h-4 w-4" />
                저장
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 시설 소개 섹션 */}
      <section id="facilities" className="py-20 bg-gradient-to-b from-white to-gray-50 relative">
        <div className="absolute top-6 right-6 z-10">
          <Button
            onClick={() => startEdit('facilities')}
            variant="outline"
            className="bg-white/80 hover:bg-white shadow-lg backdrop-blur-sm text-gray-700 border-gray-200"
          >
            <Edit className="mr-2 h-4 w-4" />
            편집
          </Button>
        </div>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block text-blue-600 font-semibold mb-3">ABOUT</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">시설 소개</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </div>
          
      {!viewOnly && editingSection === 'facilities' && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-bold mb-4">시설 소개 편집</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">센터 철학</label>
                    <textarea
                      value={editData.philosophy || ''}
                      onChange={(e) => setEditData({ ...editData, philosophy: e.target.value })}
                      className="w-full p-3 border rounded-lg"
                      rows={4}
                      placeholder="센터의 철학과 비전을 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">상세 설명</label>
                    <textarea
                      value={editData.fullDescription || ''}
                      onChange={(e) => setEditData({ ...editData, fullDescription: e.target.value })}
                      className="w-full p-3 border rounded-lg"
                      rows={6}
                      placeholder="센터에 대한 상세한 설명을 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">시설 사진 (URL)</label>
                    <div className="space-y-2">
                      {(editData.images || []).map((img: string, index: number) => (
                        <input
                          key={index}
                          type="text"
                          value={img}
                          onChange={(e) => {
                            const newImages = [...(editData.images || [])];
                            newImages[index] = e.target.value;
                            setEditData({ ...editData, images: newImages });
                          }}
                          className="w-full p-3 border rounded-lg"
                          placeholder="이미지 URL"
                        />
                      ))}
                      <Button
                        onClick={() => setEditData({ ...editData, images: [...(editData.images || []), ''] })}
                        variant="outline"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        사진 추가
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button onClick={() => setEditingSection(null)} variant="outline">
                    <X className="mr-2 h-4 w-4" />
                    취소
                  </Button>
                  <Button onClick={saveEdit} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="mr-2 h-4 w-4" />
                    저장
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
              <div className="space-y-8">
                {centerInfo?.introduction?.philosophy ? (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4">
                        <span className="text-2xl">💎</span>
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900">센터 철학</h3>
                    </div>
                    <p className="text-lg text-gray-700 leading-relaxed">{centerInfo.introduction.philosophy}</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-8 border-2 border-dashed border-gray-300">
                    <p className="text-gray-400 text-center">센터 철학을 입력해주세요</p>
                  </div>
                )}
                {centerInfo?.introduction?.fullDescription ? (
                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                      <div className="w-1 h-8 bg-blue-600 rounded-full mr-4"></div>
                      상세 설명
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{centerInfo.introduction.fullDescription}</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-8 border-2 border-dashed border-gray-300">
                    <p className="text-gray-400 text-center">상세 설명을 입력해주세요</p>
                  </div>
                )}
              </div>
              
              {centerInfo?.introduction?.images && centerInfo.introduction.images.length > 0 ? (
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
                    <img 
                      src={centerInfo.introduction.images[0]} 
                      alt="센터 시설"
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                </div>
              ) : (
                <div className="relative h-96 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 font-medium">시설 사진을 추가해주세요</p>
                  </div>
                </div>
              )}
            </div>

            {centerInfo?.introduction?.images && centerInfo.introduction.images.length > 1 && (
              <div className="mt-20">
                <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">시설 사진 갤러리</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {centerInfo.introduction.images.slice(1, 7).map((image, index) => (
                    <div key={index} className="relative group cursor-pointer">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
                      <div className="relative h-64 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all">
                        <img 
                          src={image} 
                          alt={`시설 ${index + 2}`}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 강습 과정 소개 */}
      {courses.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block text-blue-600 font-semibold mb-3">COURSES</span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">강습 과정</h2>
              <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {courses.map((course) => (
                <div key={course._id} className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 w-full h-2"
                    style={{ 
                      background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` 
                    }}
                  ></div>
                  
                  <div className="mb-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-2xl font-bold text-gray-900">{course.name}</h3>
                      {course.level && (
                        <span 
                          className="px-4 py-1 text-white rounded-full text-sm font-semibold shadow-md"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {course.level}
                        </span>
                      )}
                    </div>
                    {course.description && (
                      <p className="text-gray-600 leading-relaxed">{course.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    {course.maxStudents && (
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">최대 {course.maxStudents}명</span>
                      </div>
                    )}
                    {course.price && (
                      <span 
                        className="text-2xl font-bold bg-clip-text text-transparent"
                        style={{ 
                          backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` 
                        }}
                      >
                        {course.price.toLocaleString()}원
                      </span>
                    )}
                  </div>
                  
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-center justify-center"
                    style={{ 
                      background: `linear-gradient(to bottom right, ${primaryColor}E6, ${secondaryColor}E6)` 
                    }}
                  >
                    <Button 
                      className="bg-white font-bold"
                      style={{ color: primaryColor }}
                    >
                      상세보기
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-16">
              <a href="/center-admin/courses">
                <Button 
                  className="text-white px-10 py-4 text-lg font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 rounded-full"
                  style={{ 
                    background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` 
                  }}
                >
                  전체 강습 과정 보기
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* 강사 소개 */}
      {instructors.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block text-blue-600 font-semibold mb-3">INSTRUCTORS</span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">전문 강사진</h2>
              <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {instructors.map((instructor) => (
                <div key={instructor._id} className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 text-center border border-gray-100 relative overflow-hidden">
                  <div 
                    className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 opacity-50"
                    style={{ 
                      background: `linear-gradient(to bottom right, ${primaryColor}40, ${secondaryColor}40)` 
                    }}
                  ></div>
                  
                  <div className="relative z-10">
                    <div 
                      className="w-32 h-32 rounded-full mx-auto mb-6 shadow-xl group-hover:shadow-2xl transition-all transform group-hover:scale-110 overflow-hidden border-4"
                      style={{ borderColor: `${primaryColor}40` }}
                    >
                      {instructor.instructorInfo?.photo ? (
                        <img 
                          src={`http://localhost:5000${instructor.instructorInfo.photo}`} 
                          alt={instructor.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // 이미지 로드 실패 시 기본 아이콘 표시
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="w-full h-full flex items-center justify-center" style="background: linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})"><svg class="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>`;
                            }
                          }}
                        />
                      ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center"
                          style={{ 
                            background: `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})` 
                          }}
                        >
                          <Users className="h-12 w-12 text-white" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{instructor.name}</h3>
                    {instructor.instructorInfo?.specialties && instructor.instructorInfo.specialties.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap justify-center gap-2">
                          {instructor.instructorInfo.specialties.map((specialty, idx) => (
                            <span 
                              key={idx} 
                              className="px-3 py-1 rounded-full text-sm font-medium"
                              style={{ 
                                backgroundColor: `${primaryColor}20`,
                                color: primaryColor
                              }}
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {(instructor.instructorInfo?.bio || instructor.instructorInfo?.introduction || instructor.instructorInfo?.experience) && (
                      <p className="text-gray-600 leading-relaxed text-sm">
                        {instructor.instructorInfo?.bio || instructor.instructorInfo?.introduction || instructor.instructorInfo?.experience}
                      </p>
                    )}
                    {!(instructor.instructorInfo?.bio || instructor.instructorInfo?.introduction || instructor.instructorInfo?.experience) && (
                      <p className="text-gray-400 text-sm italic">소개 정보가 없습니다</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 위치, 연락처, 운영시간 섹션 */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block text-blue-300 font-semibold mb-3">CONTACT</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">위치 및 연락처</h2>
            <div className="w-20 h-1 bg-blue-400 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all shadow-xl">
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <MapPin className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-4">위치</h3>
                  {centerInfo?.address ? (
                    <p className="text-gray-100 text-lg mb-4 leading-relaxed">{centerInfo.address}</p>
                  ) : (
                    <p className="text-gray-400">주소 정보가 없습니다</p>
                  )}
                  {centerInfo?.introduction?.contactInfo?.parkingInfo && (
                    <div className="mt-4 p-3 bg-white/5 rounded-lg">
                      <p className="text-gray-200 text-sm font-medium">주차 안내</p>
                      <p className="text-gray-300 text-sm mt-1">{centerInfo.introduction.contactInfo.parkingInfo}</p>
                    </div>
                  )}
                  {centerInfo?.introduction?.contactInfo?.publicTransport && (
                    <div className="mt-3 p-3 bg-white/5 rounded-lg">
                      <p className="text-gray-200 text-sm font-medium">교통 안내</p>
                      <p className="text-gray-300 text-sm mt-1">{centerInfo.introduction.contactInfo.publicTransport}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all shadow-xl">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Phone className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-4">연락처</h3>
                    <div className="space-y-3">
                      {centerInfo?.phone && (
                        <a href={`tel:${centerInfo.phone}`} className="flex items-center space-x-3 text-gray-100 hover:text-white transition-colors group">
                          <Phone className="h-5 w-5 text-blue-300 group-hover:text-blue-200" />
                          <span className="text-lg font-medium">{centerInfo.phone}</span>
                        </a>
                      )}
                      {centerInfo?.email && (
                        <a href={`mailto:${centerInfo.email}`} className="flex items-center space-x-3 text-gray-100 hover:text-white transition-colors group">
                          <Mail className="h-5 w-5 text-blue-300 group-hover:text-blue-200" />
                          <span className="text-lg">{centerInfo.email}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all shadow-xl">
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Clock className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-4">운영시간</h3>
                    <p className="text-gray-100 text-lg leading-relaxed whitespace-pre-line">
                      {getOperatingHoursText()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <Button
              onClick={() => window.location.href = '/center-admin/courses'}
              className="bg-white text-blue-700 hover:bg-gray-50 px-12 py-6 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 rounded-full flex items-center justify-center gap-3 mx-auto"
            >
              <Calendar className="h-6 w-6" />
              지금 바로 강습 등록하기
              <ArrowRight className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CenterHomePage;

