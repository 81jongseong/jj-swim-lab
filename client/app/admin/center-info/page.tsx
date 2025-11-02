/**
 * 🏢 JJ Swim Lab - 센터 정보 관리 페이지 (최고 관리자용)
 * 
 * @description 센터 정보 관리와 센터 관리를 통합한 페이지
 * @연동되는 데이터: 센터 기본 정보, 센터 목록, 센터 통계
 * @연동되는 파일: center-management-tab.tsx, hooks/useAuth.ts, components/withAuth.ts
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Save, Edit, Eye, Building, Info, FileText, Plus, Trash2, List, Settings, X } from 'lucide-react';
import withAuth from '../../../components/withAuth';
import CenterManagementTab from './center-management-tab';

interface CenterInfo {
  centerId: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  operatingHours: any;
  facilities: {
    mainPool: {
      lanes: number;
      poolLength: number;
      poolDepth: number;
    };
    kidsPool: {
      available: boolean;
      depth: number;
    };
    saunas: {
      dry: boolean;
      wet: boolean;
    };
    lockers: {
      total: number;
      free: number;
    };
    parking: {
      available: boolean;
      spots: number;
    };
    equipment: string[];
  };
  programs: {
    beginner: {
      description: string;
      duration: string;
      price: number;
    };
    intermediate: {
      description: string;
      duration: string;
      price: number;
    };
    advanced: {
      description: string;
      duration: string;
      price: number;
    };
  };
  introduction: string;
  guide: string;
  updatedAt: Date;
}

function CenterInfoManagement() {
  const { user } = useAuth();
  // 최고 관리자는 센터 관리 페이지로 리다이렉트, 센터 관리자는 센터 정보 관리만
  const isSuperAdmin = user?.userType === 'superAdmin';
  const isCenterAdmin = user?.userType === 'centerAdmin' || user?.userType === 'center-admin';
  
  // 디버깅: 센터 관리자 확인
  useEffect(() => {
    if (user) {
      console.log('🔍 [CenterInfo] 사용자 정보:', {
        userType: user.userType,
        isCenterAdmin,
        hasManagedCenters: !!user.centerAdminInfo?.managedCenters,
        managedCentersCount: user.centerAdminInfo?.managedCenters?.length || 0
      });
    }
  }, [user, isCenterAdmin]);
  const [centerInfo, setCenterInfo] = useState<CenterInfo | null>(null);
  const [managedCenters, setManagedCenters] = useState<Array<{ _id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddCenterModal, setShowAddCenterModal] = useState(false);
  const [selectedCenterId, setSelectedCenterId] = useState<string>('');
  
  // 새 센터 추가 폼 상태
  const [newCenterForm, setNewCenterForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    description: ''
  });

  // 관리하는 센터 목록 로드 (DB에서 센터 이름 가져오기)
  useEffect(() => {
    const loadManagedCenters = async () => {
      if (user && isCenterAdmin && user.centerAdminInfo?.managedCenters) {
        const centers = user.centerAdminInfo.managedCenters;
        try {
          // 각 센터 ID로 DB에서 센터 정보 조회
          const centersList = await Promise.all(
            centers.map(async (c: any) => {
              const centerId = c.toString ? c.toString() : c._id?.toString() || c;
              try {
                // 센터 정보 API 호출
                const response = await apiClient.get(`/api/center-management/${centerId}`);
                if (response.success && response.data?.center) {
                  return {
                    _id: centerId,
                    name: response.data.center.name || `센터 ${centerId}`
                  };
                }
              } catch (error) {
                console.error(`센터 ${centerId} 정보 조회 실패:`, error);
              }
              // API 호출 실패 시 ID만 사용
              return {
                _id: centerId,
                name: c.name || `센터 ${centerId}`
              };
            })
          );
          setManagedCenters(centersList.filter(c => c !== null));
          if (centersList.length > 0) {
            setSelectedCenterId(centersList[0]._id);
          }
        } catch (error) {
          console.error('관리 센터 목록 로드 실패:', error);
          // 실패 시 기본값 사용
          const centersList = centers.map((c: any) => ({
            _id: c.toString ? c.toString() : c._id?.toString() || c,
            name: c.name || `센터 ${c.toString ? c.toString() : c._id?.toString() || c}`
          }));
          setManagedCenters(centersList);
        }
      }
    };
    loadManagedCenters();
  }, [user, isCenterAdmin]);

  useEffect(() => {
    // 센터 관리자만 센터 정보 로드 (최고 관리자는 센터 관리 탭만 사용)
    if (user && isCenterAdmin) {
      loadCenterInfo();
    } else if (user && isSuperAdmin) {
      setIsLoading(false);
    }
  }, [user, isCenterAdmin, isSuperAdmin]);

  const loadCenterInfo = async () => {
    try {
      setIsLoading(true);
      // 임시 데이터로 설정
      const tempInfo: CenterInfo = {
        centerId: 'center001',
        name: 'JJ Swim Lab',
        description: '전문적인 수영 교육을 제공하는 프리미엄 수영장',
        address: '서울시 강남구 테헤란로 123',
        phone: '02-1234-5678',
        email: 'info@jjswimlab.com',
        operatingHours: '평일 06:00-22:00, 주말 08:00-20:00',
        facilities: {
          mainPool: {
            lanes: 8,
            poolLength: 25,
            poolDepth: 1.8
          },
          kidsPool: {
            available: true,
            depth: 0.8
          },
          saunas: {
            dry: true,
            wet: true
          },
          lockers: {
            total: 200,
            free: 45
          },
          parking: {
            available: true,
            spots: 50
          },
          equipment: ['킥보드', '풀부이', '패들', '핀', '스노클']
        },
        programs: {
          beginner: {
            description: '기초 수영 교육',
            duration: '60분',
            price: 80000
          },
          intermediate: {
            description: '중급 수영 기술',
            duration: '60분',
            price: 100000
          },
          advanced: {
            description: '고급 수영 완성',
            duration: '60분',
            price: 120000
          }
        },
        introduction: 'JJ Swim Lab에 오신 것을 환영합니다.',
        guide: '안전하고 즐거운 수영을 위해 규칙을 준수해주세요.',
        updatedAt: new Date()
      };
      setCenterInfo(tempInfo);
    } catch (error) {
      console.error('센터 정보 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {isSuperAdmin ? '🏢 센터 관리' : '🏢 센터 정보 관리'}
        </h1>
        <p className="text-sm text-gray-600">
          {isSuperAdmin 
            ? '모든 센터를 통합하여 관리하세요'
            : '센터 소개글과 이용안내를 작성하고 관리하세요'}
        </p>
      </div>

      {/* 최고 관리자는 원래 센터 관리 페이지로 리다이렉트 */}
      {isSuperAdmin && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">최고 관리자는 센터 관리 페이지를 사용하세요.</p>
          <a 
            href="/admin/center-management" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            센터 관리 페이지로 이동
          </a>
        </div>
      )}

      {/* 센터 정보 관리 탭 (센터 관리자만) */}
      {isCenterAdmin && (
        <>
          {/* 여러 센터 관리하는 경우 센터 선택 */}
          {managedCenters.length > 1 && (
            <div className="mb-6 bg-white rounded-lg shadow p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                관리하는 센터 선택:
              </label>
              <select 
                className="w-full max-w-md border rounded px-3 py-2" 
                value={selectedCenterId} 
                onChange={e => setSelectedCenterId(e.target.value)}
              >
                {managedCenters.map((center) => (
                  <option key={center._id} value={center._id}>
                    {center.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 센터 추가 버튼 */}
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold">센터 정보</h2>
            <button
              onClick={() => setShowAddCenterModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              센터 추가
            </button>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 센터 기본 정보 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Building className="w-5 h-5" />
              센터 기본 정보
            </h3>
            <button 
              onClick={() => setIsEditing(!isEditing)} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2 inline" />
              편집
            </button>
          </div>

          {centerInfo && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">센터명</label>
                <div className="text-gray-900">{centerInfo.name}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <div className="text-gray-900">{centerInfo.description}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
                <div className="text-gray-900">{centerInfo.address}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                <div className="text-gray-900">{centerInfo.phone}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <div className="text-gray-900">{centerInfo.email}</div>
              </div>
            </div>
          )}
        </div>

        {/* 운영 정보 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <Info className="w-5 h-5" />
            운영 정보
          </h3>

          {centerInfo && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">운영시간</label>
                <div className="text-gray-900">{centerInfo.operatingHours}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">시설 정보</label>
                <div className="space-y-2 text-sm">
                  <div>메인풀: {centerInfo.facilities.mainPool.lanes}레인, {centerInfo.facilities.mainPool.poolLength}m</div>
                  <div>키즈풀: {centerInfo.facilities.kidsPool.available ? '있음' : '없음'}</div>
                  <div>사우나: {centerInfo.facilities.saunas.dry ? '건식' : ''} {centerInfo.facilities.saunas.wet ? '습식' : ''}</div>
                  <div>주차: {centerInfo.facilities.parking.spots}대</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {centerInfo && (
        <div className="mt-6 text-center">
          <p className="text-xs text-green-600">
            마지막 업데이트: {centerInfo.updatedAt.toLocaleString()}
          </p>
        </div>
      )}
        </div>

      {/* 센터 추가 모달 */}
      {showAddCenterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">새 센터 추가</h3>
                <button
                  onClick={() => {
                    setShowAddCenterModal(false);
                    setNewCenterForm({ name: '', address: '', phone: '', email: '', description: '' });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">센터명 *</label>
                  <input
                    type="text"
                    value={newCenterForm.name}
                    onChange={e => setNewCenterForm({ ...newCenterForm, name: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="센터명을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">주소 *</label>
                  <input
                    type="text"
                    value={newCenterForm.address}
                    onChange={e => setNewCenterForm({ ...newCenterForm, address: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="주소를 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">전화번호 *</label>
                  <input
                    type="text"
                    value={newCenterForm.phone}
                    onChange={e => setNewCenterForm({ ...newCenterForm, phone: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="전화번호를 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이메일 *</label>
                  <input
                    type="email"
                    value={newCenterForm.email}
                    onChange={e => setNewCenterForm({ ...newCenterForm, email: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="이메일을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                  <textarea
                    value={newCenterForm.description}
                    onChange={e => setNewCenterForm({ ...newCenterForm, description: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    rows={4}
                    placeholder="센터 설명을 입력하세요"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddCenterModal(false);
                    setNewCenterForm({ name: '', address: '', phone: '', email: '', description: '' });
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  취소
                </button>
                <button
                  onClick={async () => {
                    try {
                      // 센터 등록 신청 API 호출
                      const response = await apiClient.post('/api/center-registrations', {
                        centerName: newCenterForm.name,
                        businessNumber: `BIZ-${Date.now()}`, // 임시 사업자등록번호
                        representativeName: user?.name || '',
                        representativeEmail: newCenterForm.email,
                        representativePhone: newCenterForm.phone,
                        password: 'temp123!', // 임시 비밀번호 (나중에 변경해야 함)
                        address: newCenterForm.address,
                        description: newCenterForm.description
                      });

                      if (response.success) {
                        alert('센터 등록 신청이 완료되었습니다. 관리자 승인 후 이용하실 수 있습니다.');
                        setShowAddCenterModal(false);
                        setNewCenterForm({ name: '', address: '', phone: '', email: '', description: '' });
                      } else {
                        alert(response.message || '센터 추가에 실패했습니다.');
                      }
                    } catch (error: any) {
                      console.error('센터 추가 오류:', error);
                      alert(error.response?.data?.message || '센터 추가 중 오류가 발생했습니다.');
                    }
                  }}
                  disabled={!newCenterForm.name || !newCenterForm.address || !newCenterForm.phone || !newCenterForm.email}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  센터 추가
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}

export default withAuth(CenterInfoManagement, { 
  requireTypes: ['centerAdmin', 'superAdmin'] 
});