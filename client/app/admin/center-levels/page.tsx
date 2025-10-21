/**
 * @file 센터 레벨 관리 페이지
 * @description 센터별 학생 수영 레벨 구성 및 관리
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, type User } from '../../../hooks/useAuth';
import { getCenterLevels, updateCenterLevels, type CenterLevel } from '../../../lib/api/center-level';
import { Plus, Trash2, Save, X, GripVertical } from 'lucide-react';
import withAuth from '../../../components/withAuth';

function StudentLevelsManagement() {
  const { user } = useAuth();
  const [centerLevels, setCenterLevels] = useState<CenterLevel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingLevels, setEditingLevels] = useState<CenterLevel['levels']>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      console.log('🔍 사용자 정보 전체:', JSON.stringify(user, null, 2));
      console.log('🔍 사용자 타입:', user.userType);
      console.log('🔍 centerAdminInfo:', user.centerAdminInfo);
      console.log('🔍 instructorInfo:', user.instructorInfo);
      
      const centerId = getCenterId(user);
      console.log('🏢 센터 ID:', centerId);
      
      if (centerId) {
        loadCenterLevels(centerId);
      } else {
        console.error('❌ 센터 ID를 찾을 수 없습니다');
        setIsLoading(false);
      }
    }
  }, [user]);

  const getCenterId = (user: User): string | null => {
    console.log('🔍 getCenterId 호출:', {
      userType: user.userType,
      centerAdminInfo: user.centerAdminInfo,
      instructorInfo: user.instructorInfo
    });
    
    // superAdmin의 경우 모든 센터를 관리할 수 있도록 기본 센터 ID 반환
    if (user.userType === 'superAdmin') {
      console.log('✅ superAdmin: 모든 센터 관리 권한');
      return 'all-centers'; // 특별한 식별자
    }
    
    // centerAdminInfo 상세 정보 출력
    if (user.centerAdminInfo) {
      console.log('🔍 centerAdminInfo 상세:', {
        managedCenters: user.centerAdminInfo.managedCenters,
        hasManagedCenters: !!user.centerAdminInfo.managedCenters,
        managedCentersLength: user.centerAdminInfo.managedCenters?.length,
        firstCenter: user.centerAdminInfo.managedCenters?.[0]
      });
    }
    
    // instructorInfo 상세 정보 출력
    if (user.instructorInfo) {
      console.log('🔍 instructorInfo 상세:', {
        assignedCenters: user.instructorInfo.assignedCenters,
        hasAssignedCenters: !!user.instructorInfo.assignedCenters?.length
      });
    }
    
    if (user.userType === 'centerAdmin' && user.centerAdminInfo?.managedCenters?.length) {
      const centerId = user.centerAdminInfo.managedCenters[0];
      console.log('✅ centerAdmin에서 센터 ID 찾음:', centerId);
      return centerId;
    }
    
    if (user.userType === 'instructor' && user.instructorInfo?.assignedCenters?.length) {
      const centerId = user.instructorInfo.assignedCenters[0];
      console.log('✅ instructor에서 센터 ID 찾음:', centerId);
      return centerId;
    }
    
    console.log('❌ 센터 ID를 찾을 수 없음');
    return null;
  };

  const loadCenterLevels = async (centerId: string) => {
    try {
      console.log('📡 센터 레벨 로드 시작:', centerId);
      setIsLoading(true);
      
      // superAdmin의 경우 모든 센터를 관리할 수 있도록 기본 레벨 설정
      if (centerId === 'all-centers') {
        console.log('📡 superAdmin: 모든 센터용 기본 레벨 설정');
        const defaultLevels: CenterLevel['levels'] = [
          { name: '입문', description: '수영을 처음 시작하는 단계', order: 1 },
          { name: '초급', description: '기본적인 수영 기술을 익히는 단계', order: 2 },
          { name: '중급', description: '다양한 수영 기술을 익히는 단계', order: 3 },
          { name: '상급', description: '고급 수영 기술을 익히는 단계', order: 4 }
        ];
        
        setCenterLevels({
          centerId: 'all-centers',
          levels: defaultLevels,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as any);
        setEditingLevels([...defaultLevels]);
        setIsLoading(false);
        return;
      }
      
      const data = await getCenterLevels(centerId);
      console.log('📡 센터 레벨 로드 결과:', data);
      
      if (data) {
        setCenterLevels(data);
        setEditingLevels([...data.levels]);
      } else {
        console.log('📡 센터 레벨이 없어서 기본값 설정');
        const defaultLevels: CenterLevel['levels'] = [
          { name: '입문', description: '수영을 처음 시작하는 단계', order: 1 },
          { name: '초급', description: '기본적인 수영 기술을 익히는 단계', order: 2 },
          { name: '중급', description: '다양한 수영 기술을 익히는 단계', order: 3 },
          { name: '상급', description: '고급 수영 기술을 익히는 단계', order: 4 }
        ];
        
        setCenterLevels({
          centerId,
          levels: defaultLevels,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as any);
        setEditingLevels([...defaultLevels]);
      }
    } catch (error) {
      console.error('❌ 센터 레벨 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!centerLevels) return;
    
    try {
      setIsSaving(true);
      console.log('💾 센터 레벨 저장 시작:', editingLevels);
      
      // superAdmin의 경우 모든 센터에 적용되는 기본 레벨로 처리
      if (centerLevels.centerId === 'all-centers') {
        console.log('💾 superAdmin: 모든 센터용 기본 레벨 저장');
        // 실제로는 모든 센터에 이 레벨을 적용하는 로직이 필요하지만,
        // 현재는 로컬 상태만 업데이트
        setCenterLevels({
          ...centerLevels,
          levels: [...editingLevels],
          updatedAt: new Date().toISOString()
        } as any);
        setIsEditing(false);
        console.log('✅ superAdmin 센터 레벨 저장 완료');
        return;
      }
      
      await updateCenterLevels(centerLevels.centerId, { levels: editingLevels });
      
      setCenterLevels({
        ...centerLevels,
        levels: [...editingLevels],
        updatedAt: new Date().toISOString()
      } as any);
      
      setIsEditing(false);
      console.log('✅ 센터 레벨 저장 완료');
    } catch (error) {
      console.error('❌ 센터 레벨 저장 실패:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (centerLevels) {
      setEditingLevels([...centerLevels.levels]);
    }
    setIsEditing(false);
  };

  const handleAddLevel = () => {
    const newLevel = {
      name: '',
      description: '',
      order: editingLevels.length + 1
    };
    setEditingLevels([...editingLevels, newLevel]);
  };

  const handleRemoveLevel = (index: number) => {
    if (editingLevels.length > 1) {
      const newLevels = editingLevels.filter((_, i) => i !== index);
      // 순서 재정렬
      const reorderedLevels = newLevels.map((level, i) => ({
        ...level,
        order: i + 1
      }));
      setEditingLevels(reorderedLevels);
    }
  };

  const handleLevelChange = (index: number, field: keyof CenterLevel['levels'][0], value: string) => {
    const newLevels = [...editingLevels];
    newLevels[index] = {
      ...newLevels[index],
      [field]: value
    };
    setEditingLevels(newLevels);
  };

  const moveLevel = (index: number, direction: 'up' | 'down') => {
    const newLevels = [...editingLevels];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newLevels.length) {
      [newLevels[index], newLevels[targetIndex]] = [newLevels[targetIndex], newLevels[index]];
      
      // 순서 재정렬
      const reorderedLevels = newLevels.map((level, i) => ({
        ...level,
        order: i + 1
      }));
      
      setEditingLevels(reorderedLevels);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">센터 레벨을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!centerLevels) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">센터 레벨 관리</h1>
          <p className="text-gray-600">센터 정보를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">센터 레벨 관리</h1>
        <p className="text-gray-600 mt-2">
          {centerLevels.centerId === 'all-centers' 
            ? '전체 센터 학생 수영 레벨 구성 및 관리 (최고관리자)'
            : '센터별 학생 수영 레벨 구성 및 관리'
          }
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <GripVertical className="w-5 h-5" />
              🏊‍♂️ 학생 수영 레벨 구성
            </h2>
            
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                레벨 편집
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                >
                  <X className="w-4 h-4 mr-2" />
                  취소
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? '저장 중...' : '저장'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6">
          {isEditing ? (
            <div className="space-y-4">
              {editingLevels.map((level, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">레벨 {index + 1}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => moveLevel(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveLevel(index, 'down')}
                          disabled={index === editingLevels.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                    
                    {editingLevels.length > 1 && (
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleRemoveLevel(index)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        레벨명
                      </label>
                      <input
                        type="text"
                        value={level.name}
                        onChange={(e) => handleLevelChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="예: 초급, 중급, 상급"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        설명
                      </label>
                      <input
                        type="text"
                        value={level.description}
                        onChange={(e) => handleLevelChange(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="레벨에 대한 설명을 입력하세요"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                onClick={handleAddLevel}
                className="w-full border-dashed border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded-lg p-4 transition-colors flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-gray-500">새 레벨 추가</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {centerLevels.levels.map((level, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{level.name}</h3>
                      <p className="text-gray-600">{level.description}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      순서: {level.order}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withAuth(StudentLevelsManagement);