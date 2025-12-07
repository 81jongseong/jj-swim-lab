'use client';
import { logger } from '@/lib/logger';

import React, { useState, useEffect } from 'react';
import { useAuth, type User } from '../../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, LoadingSpinner } from '../../../components/ui';
import { getCenterLevels, type CenterLevel } from '../../../lib/api/center-level';
import { GripVertical, Eye, Info } from 'lucide-react';
import withAuth from '../../../components/withAuth';

function InstructorCenterLevels() {
  const { user } = useAuth();
  const [centerLevels, setCenterLevels] = useState<CenterLevel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      logger.info('🔍 강사 사용자 정보 전체:', JSON.stringify(user, null, 2));
      logger.info('🔍 사용자 타입:', user.userType);
      logger.info('🔍 instructorInfo:', user.instructorInfo);
      
      const centerId = getCenterId(user);
      logger.info('🏢 센터 ID:', centerId);
      
      if (centerId) {
        loadCenterLevels(centerId);
      } else {
        logger.error('❌ 센터 ID를 찾을 수 없습니다');
        setIsLoading(false);
      }
    }
  }, [user]);

  const getCenterId = (user: User): string | null => {
    logger.info('🔍 getCenterId 호출:', {
      userType: user.userType,
      instructorInfo: user.instructorInfo
    });
    
    // instructorInfo 상세 정보 출력
    if (user.instructorInfo) {
      logger.info('🔍 instructorInfo 상세:', {
        assignedCenters: user.instructorInfo.assignedCenters,
        hasAssignedCenters: !!user.instructorInfo.assignedCenters,
        assignedCentersLength: user.instructorInfo.assignedCenters?.length,
        firstCenter: user.instructorInfo.assignedCenters?.[0]
      });
    }
    
    if (user.userType === 'instructor' && user.instructorInfo?.assignedCenters?.[0]) {
      const centerId = user.instructorInfo.assignedCenters[0];
      logger.info('✅ instructor 센터 ID:', centerId);
      return centerId;
    }
    
    // instructor이지만 assignedCenters가 없는 경우 fallback
    if (user.userType === 'instructor') {
      logger.info('⚠️ instructor이지만 assignedCenters가 없음, 기본값 사용');
      return 'center001'; // 기본 센터 ID 사용
    }
    
    logger.info('❌ 센터 ID를 찾을 수 없음');
    return null;
  };

  const loadCenterLevels = async (centerId: string) => {
    try {
      setIsLoading(true);
      logger.info('🔍 센터 레벨 로드 시작:', centerId);
      
      const data = await getCenterLevels(centerId);
      logger.info('✅ 센터 레벨 로드 성공:', data);
      
      setCenterLevels(data);
    } catch (error) {
      logger.error('❌ 센터 레벨 로드 실패:', error);
      
      // 에러가 발생해도 기본 레벨을 설정
      const defaultLevels = [
        { name: '기초', order: 1, description: '수영을 처음 시작하는 단계', color: '#10B981' },
        { name: '초급', order: 2, description: '기본 동작을 익히는 단계', color: '#3B82F6' },
        { name: '중급', order: 3, description: '자유형과 배영을 배우는 단계', color: '#F59E0B' },
        { name: '상급', order: 4, description: '평영과 접영을 배우는 단계', color: '#EF4444' },
        { name: '마스터', order: 5, description: '고급 기술과 경영을 배우는 단계', color: '#8B5CF6' }
      ];
      
      const defaultCenterLevel = {
        _id: 'temp',
        centerId: centerId,
        levels: defaultLevels,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setCenterLevels(defaultCenterLevel);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="센터 레벨을 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          🎯 센터별 레벨 정보
        </h1>
        <p className="text-sm text-gray-600">
          {getCenterId(user!) || '센터'}의 수영 레벨 정보를 확인하세요
        </p>
      </div>

      {/* 정보 안내 카드 */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-900 mb-1">📋 레벨 정보 활용 가이드</h3>
              <p className="text-sm text-gray-600">
                이 센터에서 사용하는 수영 레벨 체계입니다. 체크리스트 관리나 학생 진도 평가 시 이 레벨을 참고하여 사용하세요.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            현재 센터 레벨 구성
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* 저장 상태 표시 */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-700">
                  📊 현재 센터 레벨 정보 ({centerLevels?.levels.length || 0}개)
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                마지막 업데이트: {centerLevels?.updatedAt ? new Date(centerLevels.updatedAt).toLocaleString() : '방금 전'}
              </p>
            </div>
            
            {centerLevels?.levels.map((level, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">{level.order}</span>
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{level.name}</h3>
                  {level.description && (
                    <p className="text-sm text-gray-600">{level.description}</p>
                  )}
                </div>
                
                <div 
                  className="w-6 h-6 rounded-full border-2 border-gray-200"
                  style={{ backgroundColor: level.color || '#3B82F6' }}
                />
              </div>
            ))}
            
            {centerLevels?.levels.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>아직 설정된 레벨이 없습니다.</p>
                <p className="text-sm">센터 관리자에게 문의하세요.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuth(InstructorCenterLevels, { 
  requireTypes: ['instructor'] 
});
