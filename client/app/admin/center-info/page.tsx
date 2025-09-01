'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, Button, LoadingSpinner } from '@/components/ui';
import { Save, Edit, Eye, Building, Info, FileText } from 'lucide-react';
import withAuth from '../../../components/withAuth';

interface CenterInfo {
  centerId: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  operatingHours: string;
  facilities: string[];
  introduction: string;
  guide: string;
  updatedAt: Date;
}

function CenterInfoManagement() {
  const { user } = useAuth();
  const [centerInfo, setCenterInfo] = useState<CenterInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingInfo, setEditingInfo] = useState<Partial<CenterInfo>>({});

  useEffect(() => {
    if (user) {
      loadCenterInfo();
    }
  }, [user]);

  const loadCenterInfo = async () => {
    try {
      setIsLoading(true);
      // 임시 데이터 (실제로는 API에서 가져옴)
      const tempInfo: CenterInfo = {
        centerId: 'center001',
        name: 'JJ Swim Lab',
        description: '전문적인 수영 교육을 제공하는 프리미엄 수영장',
        address: '서울시 강남구 테헤란로 123',
        phone: '02-1234-5678',
        email: 'info@jjswimlab.com',
        operatingHours: '평일 06:00-22:00, 주말 08:00-20:00',
        facilities: ['25m 실내 수영장', '사우나', '피트니스룸', '주차장'],
        introduction: 'JJ Swim Lab은 체계적이고 과학적인 수영 교육을 통해 모든 연령대의 수영 실력을 향상시키는 것을 목표로 합니다. 경험丰富的한 강사진과 최신 시설을 갖춘 프리미엄 수영 교육 센터입니다.',
        guide: '1. 수강 신청: 온라인 또는 방문 접수\n2. 레벨 테스트: 첫 수업 시 무료 레벨 테스트 진행\n3. 수업 진행: 개인별 맞춤형 커리큘럼으로 진행\n4. 진도 관리: 정기적인 진도 체크 및 피드백 제공\n5. 안전 관리: 모든 수업에서 안전을 최우선으로 합니다.',
        updatedAt: new Date()
      };
      
      setCenterInfo(tempInfo);
      setEditingInfo(tempInfo);
    } catch (error) {
      console.error('센터 정보 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCenterInfo(prev => prev ? { ...prev, ...editingInfo, updatedAt: new Date() } : null);
      setIsEditing(false);
      alert('센터 정보가 성공적으로 저장되었습니다!');
    } catch (error) {
      console.error('센터 정보 저장 실패:', error);
      alert('센터 정보 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingInfo(centerInfo || {});
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="센터 정보를 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          🏢 센터 정보 관리
        </h1>
        <p className="text-sm text-gray-600">
          센터 소개글과 이용안내를 작성하고 관리하세요
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 센터 기본 정보 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                센터 기본 정보
              </CardTitle>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  편집
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancel}>
                    취소
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? '저장 중...' : '저장'}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">센터명 *</label>
                  <input
                    type="text"
                    value={editingInfo.name || ''}
                    onChange={(e) => setEditingInfo({...editingInfo, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">간단 설명</label>
                  <input
                    type="text"
                    value={editingInfo.description || ''}
                    onChange={(e) => setEditingInfo({...editingInfo, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
                  <input
                    type="text"
                    value={editingInfo.address || ''}
                    onChange={(e) => setEditingInfo({...editingInfo, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                    <input
                      type="text"
                      value={editingInfo.phone || ''}
                      onChange={(e) => setEditingInfo({...editingInfo, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                    <input
                      type="email"
                      value={editingInfo.email || ''}
                      onChange={(e) => setEditingInfo({...editingInfo, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">운영시간</label>
                  <input
                    type="text"
                    value={editingInfo.operatingHours || ''}
                    onChange={(e) => setEditingInfo({...editingInfo, operatingHours: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예: 평일 06:00-22:00, 주말 08:00-20:00"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">센터명</span>
                  <p className="text-gray-900">{centerInfo?.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">설명</span>
                  <p className="text-gray-900">{centerInfo?.description}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">주소</span>
                  <p className="text-gray-900">{centerInfo?.address}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">전화번호</span>
                    <p className="text-gray-900">{centerInfo?.phone}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">이메일</span>
                    <p className="text-gray-900">{centerInfo?.email}</p>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">운영시간</span>
                  <p className="text-gray-900">{centerInfo?.operatingHours}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 센터 소개글 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              센터 소개글
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {isEditing ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">소개글</label>
                <textarea
                  value={editingInfo.introduction || ''}
                  onChange={(e) => setEditingInfo({...editingInfo, introduction: e.target.value})}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="센터에 대한 자세한 소개글을 작성해주세요..."
                />
              </div>
            ) : (
              <div>
                <p className="text-gray-900 whitespace-pre-line">{centerInfo?.introduction}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 이용안내 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              이용안내
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {isEditing ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이용안내</label>
                <textarea
                  value={editingInfo.guide || ''}
                  onChange={(e) => setEditingInfo({...editingInfo, guide: e.target.value})}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="수강생들이 알아야 할 이용안내를 작성해주세요..."
                />
              </div>
            ) : (
              <div>
                <p className="text-gray-900 whitespace-pre-line">{centerInfo?.guide}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 저장 상태 표시 */}
      {centerInfo && (
        <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-700">
              ✅ 센터 정보가 저장되어 있습니다
            </span>
          </div>
          <p className="text-xs text-green-600 mt-1">
            마지막 업데이트: {centerInfo.updatedAt.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}

export default withAuth(CenterInfoManagement, { 
  requireTypes: ['centerAdmin', 'superAdmin'] 
});











