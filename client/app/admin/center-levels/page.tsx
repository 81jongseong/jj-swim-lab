'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, type User } from '../../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, Button, LoadingSpinner } from '@/components/ui';
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
    
    // centerAdminInfo 상세 정보 출력
    if (user.centerAdminInfo) {
      console.log('🔍 centerAdminInfo 상세:', {
        managedCenters: user.centerAdminInfo.managedCenters,
        hasManagedCenters: !!user.centerAdminInfo.managedCenters,
        managedCentersLength: user.centerAdminInfo.managedCenters?.length,
        firstCenter: user.centerAdminInfo.managedCenters?.[0]
      });
    }
    
    if (user.userType === 'centerAdmin' && user.centerAdminInfo?.managedCenters?.[0]) {
      const centerId = user.centerAdminInfo.managedCenters[0];
      console.log('✅ centerAdmin 센터 ID:', centerId);
      return centerId;
    }
    
    if (user.userType === 'instructor' && user.instructorInfo?.assignedCenters?.[0]) {
      const centerId = user.instructorInfo.assignedCenters[0];
      console.log('✅ instructor 센터 ID:', centerId);
      return centerId;
    }
    
    if (user.userType === 'superAdmin') {
      console.log('✅ superAdmin - default 센터 ID 사용');
      return 'center001'; // 실제 존재하는 센터 ID 사용
    }
    
    // centerAdmin이지만 managedCenters가 없는 경우 fallback
    if (user.userType === 'centerAdmin') {
      console.log('⚠️ centerAdmin이지만 managedCenters가 없음, 기본값 사용');
      return 'center001'; // 기본 센터 ID 사용
    }
    
    console.log('❌ 센터 ID를 찾을 수 없음');
    return null;
  };

  const loadCenterLevels = async (centerId: string) => {
    try {
      setIsLoading(true);
      console.log('🔍 센터 레벨 로드 시작:', centerId);
      
      const data = await getCenterLevels(centerId);
      console.log('✅ 센터 레벨 로드 성공:', data);
      
      setCenterLevels(data);
      setEditingLevels([...data.levels]);
    } catch (error) {
      console.error('❌ 센터 레벨 로드 실패:', error);
      
      // 에러가 발생해도 기본 레벨을 설정 (메달 등급 시스템)
      const defaultLevels = [
        { name: '🥉 브론즈', order: 1, description: '수영 초보자 - 물에 익숙해지기', color: '#CD7F32' },
        { name: '🥈 실버', order: 2, description: '기본 영법 습득자 - 자유형과 배영', color: '#C0C0C0' },
        { name: '🥇 골드', order: 3, description: '고급 기술 보유자 - 평영과 접영', color: '#FFD700' },
        { name: '💎 플래티넘', order: 4, description: '마스터 수준 - 모든 영법과 고급 기술', color: '#E5E4E2' }
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
      setEditingLevels([...defaultLevels]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLevel = () => {
    const newLevel = {
      name: '',
      order: editingLevels.length + 1,
      description: '',
      color: '#3B82F6'
    };
    setEditingLevels([...editingLevels, newLevel]);
  };

  const handleRemoveLevel = (index: number) => {
    const newLevels = editingLevels.filter((_, i) => i !== index);
    // 순서 재정렬
    const reorderedLevels = newLevels.map((level, i) => ({
      ...level,
      order: i + 1
    }));
    setEditingLevels(reorderedLevels);
  };

  const handleLevelChange = (index: number, field: keyof typeof editingLevels[0], value: string | number) => {
    const newLevels = [...editingLevels];
    newLevels[index] = { ...newLevels[index], [field]: value };
    setEditingLevels(newLevels);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // 유효성 검사
      if (editingLevels.length === 0) {
        alert('최소 1개 이상의 레벨이 필요합니다.');
        return;
      }
      
      const hasEmptyNames = editingLevels.some(level => !level.name.trim());
      if (hasEmptyNames) {
        alert('모든 레벨의 이름을 입력해주세요.');
        return;
      }
      
      const hasDuplicateNames = editingLevels.some((level, index) => 
        editingLevels.findIndex(l => l.name === level.name) !== index
      );
      if (hasDuplicateNames) {
        alert('중복된 레벨 이름이 있습니다.');
        return;
      }
      
      const centerId = getCenterId(user!);
      if (centerId) {
        const savedData = await updateCenterLevels(centerId, { levels: editingLevels });
        console.log('✅ 저장된 데이터:', savedData);
        
        // 저장된 데이터로 상태 업데이트
        setCenterLevels(savedData);
        setEditingLevels([...savedData.levels]);
        
        // 편집 모드 종료
        setIsEditing(false);
        
        // 성공 메시지 표시
        alert('레벨 설정이 성공적으로 저장되었습니다!');
      }
    } catch (error) {
      console.error('레벨 저장 실패:', error);
      alert('레벨 저장에 실패했습니다: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingLevels([...centerLevels!.levels]);
    setIsEditing(false);
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
          🏊‍♂️ 학생 수영 레벨 설정
        </h1>
        <p className="text-sm text-gray-600">
          센터에서 사용할 학생들의 수영 실력 레벨을 설정하고 관리하세요 (센터 등급과는 다릅니다)
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GripVertical className="w-5 h-5" />
              🏊‍♂️ 학생 수영 레벨 구성
            </CardTitle>
            
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Plus className="w-4 h-4 mr-2" />
                레벨 편집
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
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
                                            {editingLevels.map((level, index) => (
                 <div key={index} className="grid grid-cols-[80px_1fr_80px] items-center gap-4 p-4 border rounded-lg bg-gray-50">
                   <div className="flex items-center gap-2 text-gray-500">
                     <GripVertical className="w-4 h-4" />
                     <span className="text-sm font-medium">{level.order}</span>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        레벨명 *
                      </label>
                      <input
                        type="text"
                        value={level.name}
                        onChange={(e) => handleLevelChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="예: 기초, 초급, 중급"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        설명
                      </label>
                      <input
                        type="text"
                        value={level.description || ''}
                        onChange={(e) => handleLevelChange(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="레벨에 대한 설명"
                      />
                    </div>
                    
                                         <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">
                         색상
                       </label>
                       <div className="flex items-center gap-3">
                         <div className="flex-shrink-0">
                           <input
                             type="color"
                             value={level.color || '#3B82F6'}
                             onChange={(e) => handleLevelChange(index, 'color', e.target.value)}
                             className="w-16 h-12 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors"
                           />
                         </div>
                         <div className="flex-1">
                           <input
                             type="text"
                             value={level.color || '#3B82F6'}
                             onChange={(e) => handleLevelChange(index, 'color', e.target.value)}
                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                             placeholder="#3B82F6"
                           />
                         </div>
                       </div>
                                          </div>
                   </div>
                   
                   {editingLevels.length > 1 && (
                     <div className="flex items-center justify-center">
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => handleRemoveLevel(index)}
                         className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 w-12 h-10 p-0 transition-colors duration-200"
                       >
                         <Trash2 className="w-4 h-4" />
                       </Button>
                     </div>
                   )}
                 </div>
               ))}
              
              <Button
                onClick={handleAddLevel}
                variant="outline"
                className="w-full border-dashed border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                새 레벨 추가
              </Button>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 <strong>팁:</strong> 레벨 순서는 자동으로 정렬되며, 최소 1개 이상의 레벨이 필요합니다.
                  각 레벨의 이름은 고유해야 하며, 설명과 색상을 설정하여 시각적으로 구분할 수 있습니다.
                </p>
              </div>
            </div>
                       ) : (
               <div className="space-y-4">
                 {/* 저장 상태 표시 */}
                 <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                     <span className="text-sm font-medium text-green-700">
                       ✅ 현재 저장된 레벨 설정 ({centerLevels?.levels.length || 0}개)
                     </span>
                   </div>
                   <p className="text-xs text-green-600 mt-1">
                     마지막 업데이트: {centerLevels?.updatedAt ? new Date(centerLevels.updatedAt).toLocaleString() : '방금 전'}
                   </p>
                 </div>
                 
                 {centerLevels?.levels.map((level, index) => (
                   <div key={index} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                           <div className="flex items-center gap-3">
                        <div 
                          className="w-6 h-6 rounded-lg border-2 border-gray-200 shadow-sm"
                          style={{ backgroundColor: level.color || '#3B82F6' }}
                        />
                        <span className="text-sm font-medium text-gray-500">{level.order}</span>
                      </div>
                     
                     <div className="flex-1">
                       <h3 className="font-semibold text-gray-900">{level.name}</h3>
                       {level.description && (
                         <p className="text-sm text-gray-600">{level.description}</p>
                       )}
                     </div>
                     
                                           <div 
                        className="w-8 h-8 rounded-lg border-2 border-gray-200 shadow-sm"
                        style={{ backgroundColor: level.color || '#3B82F6' }}
                      />
                   </div>
                 ))}
                 
                 {centerLevels?.levels.length === 0 && (
                   <div className="text-center py-8 text-gray-500">
                     <p>아직 설정된 레벨이 없습니다.</p>
                     <p className="text-sm">레벨 편집 버튼을 클릭하여 레벨을 추가하세요.</p>
                   </div>
                 )}
               </div>
             )}
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuth(StudentLevelsManagement, { 
  requireTypes: ['centerAdmin', 'superAdmin'] 
});
