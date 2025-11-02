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

  // 관리하는 센터 목록 로드
  useEffect(() => {
    if (user && isCenterAdmin && user.centerAdminInfo?.managedCenters) {
      const centers = user.centerAdminInfo.managedCenters;
      const centersList = centers.map((c: any) => ({
        _id: c.toString ? c.toString() : c._id?.toString() || c,
        name: c.name || `센터 ${c.toString ? c.toString() : c._id?.toString() || c}`
      }));
      setManagedCenters(centersList);
      if (centersList.length > 0) {
        setSelectedCenterId(centersList[0]._id);
      }
    }
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
      )}
    </div>
  );
}

export default withAuth(CenterInfoManagement, { 
  requireTypes: ['centerAdmin', 'superAdmin'] 
});