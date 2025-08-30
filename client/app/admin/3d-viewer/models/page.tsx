/**
 * ✅ JJ Swim Lab - 3D 모델 관리 페이지
 * 
 * 📋 **기능**
 * - 3D 모델 업로드/수정/삭제
 * - 모델별 영법 및 드릴 연결
 * - 모델 품질 및 버전 관리
 * - 모델 사용 통계
 * 
 * 🛠️ **기술 스택**
 * - Next.js App Router
 * - TypeScript
 * - Tailwind CSS
 * - React Hooks
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { LoadingSpinner, RefreshButton, Toast, ToastContainer } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface ThreeDModel {
  id: string;
  name: string;
  englishName: string;
  fileType: 'glb' | 'gltf' | 'fbx' | 'obj' | 'dae';
  fileSize: number; // MB 단위
  swimmingStyle: string;
  drillId?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  version: string;
  description: string;
  tags: string[];
  thumbnailUrl?: string;
  previewUrl?: string;
  downloadCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ThreeDModelsPage() {
  const { user, hasUserType } = useAuth();
  const router = useRouter();
  const [models, setModels] = useState<ThreeDModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toasts, setToasts] = useState<any[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingModel, setEditingModel] = useState<ThreeDModel | null>(null);
  const [filterStyle, setFilterStyle] = useState<string>('all');
  const [filterQuality, setFilterQuality] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 권한 체크
  useEffect(() => {
    if (!user || !hasUserType('superAdmin')) {
      router.push('/admin/dashboard');
      return;
    }
  }, [user, hasUserType, router]);

  // 3D 모델 데이터 로드
  useEffect(() => {
    if (user && hasUserType('superAdmin')) {
      loadThreeDModels();
    }
  }, [user, hasUserType]);

  const loadThreeDModels = async () => {
    try {
      setLoading(true);
      // TODO: 실제 API 호출로 대체
      const mockModels: ThreeDModel[] = [
        {
          id: '1',
          name: '자유형 기본 자세',
          englishName: 'Freestyle Basic Pose',
          fileType: 'glb',
          fileSize: 2.5,
          swimmingStyle: '자유형',
          difficulty: 'beginner',
          quality: 'high',
          version: '1.0.0',
          description: '자유형의 기본 자세를 보여주는 3D 모델입니다. 팔과 다리의 기본 위치를 정확하게 표현합니다.',
          tags: ['자유형', '기본', '자세', '초급'],
          downloadCount: 45,
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-15'
        },
        {
          id: '2',
          name: '자유형 팔 동작',
          englishName: 'Freestyle Arm Movement',
          fileType: 'glb',
          fileSize: 3.2,
          swimmingStyle: '자유형',
          drillId: '1',
          difficulty: 'beginner',
          quality: 'high',
          version: '1.1.0',
          description: '자유형의 팔 동작을 단계별로 보여주는 3D 모델입니다. 팔의 움직임을 자세히 분석할 수 있습니다.',
          tags: ['자유형', '팔', '동작', '분석'],
          downloadCount: 32,
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-10'
        },
        {
          id: '3',
          name: '평형 전체 동작',
          englishName: 'Breaststroke Full Motion',
          fileType: 'glb',
          fileSize: 4.1,
          swimmingStyle: '평형',
          difficulty: 'intermediate',
          quality: 'high',
          version: '1.0.0',
          description: '평형의 전체 동작을 보여주는 3D 모델입니다. 팔과 다리의 조화로운 움직임을 표현합니다.',
          tags: ['평형', '전체', '동작', '중급'],
          downloadCount: 28,
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '4',
          name: '접영 돌고래 킥',
          englishName: 'Butterfly Dolphin Kick',
          fileType: 'glb',
          fileSize: 3.8,
          swimmingStyle: '접영',
          drillId: '5',
          difficulty: 'advanced',
          quality: 'ultra',
          version: '1.2.0',
          description: '접영의 돌고래 킥을 고품질로 표현한 3D 모델입니다. 몸의 파도 움직임을 정확하게 보여줍니다.',
          tags: ['접영', '돌고래킥', '고급', '고품질'],
          downloadCount: 18,
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-12'
        },
        {
          id: '5',
          name: '배영 기본 자세',
          englishName: 'Backstroke Basic Pose',
          fileType: 'glb',
          fileSize: 2.8,
          swimmingStyle: '배영',
          difficulty: 'intermediate',
          quality: 'medium',
          version: '1.0.0',
          description: '배영의 기본 자세를 보여주는 3D 모델입니다. 등을 대고 수영하는 자세를 표현합니다.',
          tags: ['배영', '기본', '자세', '중급'],
          downloadCount: 22,
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-05'
        },
        {
          id: '6',
          name: '개구리형 다리 동작',
          englishName: 'Frog Kick Leg Movement',
          fileType: 'glb',
          fileSize: 2.1,
          swimmingStyle: '개구리형',
          drillId: '6',
          difficulty: 'beginner',
          quality: 'medium',
          version: '1.0.0',
          description: '개구리형의 다리 동작을 보여주는 3D 모델입니다. 평형의 다리 움직임을 독립적으로 연습할 수 있습니다.',
          tags: ['개구리형', '다리', '동작', '초급'],
          downloadCount: 15,
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-08'
        },
        {
          id: '7',
          name: '자유형 호흡 연습',
          englishName: 'Freestyle Breathing Practice',
          fileType: 'glb',
          fileSize: 3.5,
          swimmingStyle: '자유형',
          drillId: '3',
          difficulty: 'intermediate',
          quality: 'high',
          version: '1.1.0',
          description: '자유형의 호흡 연습을 위한 3D 모델입니다. 호흡 타이밍과 머리 회전을 정확하게 보여줍니다.',
          tags: ['자유형', '호흡', '연습', '중급'],
          downloadCount: 25,
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-18'
        },
        {
          id: '8',
          name: '스피드 훈련 모델',
          englishName: 'Speed Training Model',
          fileType: 'glb',
          fileSize: 4.5,
          swimmingStyle: '자유형',
          drillId: '8',
          difficulty: 'advanced',
          quality: 'ultra',
          version: '1.3.0',
          description: '스피드 훈련을 위한 고품질 3D 모델입니다. 빠른 수영 동작을 정확하게 표현합니다.',
          tags: ['자유형', '스피드', '훈련', '고급'],
          downloadCount: 12,
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-22'
        }
      ];
      
      setModels(mockModels);
    } catch (error) {
      console.error('3D 모델 데이터 로드 실패:', error);
      showToast('error', '오류', '3D 모델 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadThreeDModels();
    setRefreshing(false);
    showToast('success', '새로고침', '3D 모델 데이터가 업데이트되었습니다.');
  };

  const handleUploadModel = () => {
    setShowUploadForm(true);
    setEditingModel(null);
  };

  const handleEditModel = (model: ThreeDModel) => {
    setEditingModel(model);
    setShowUploadForm(true);
  };

  const handleDeleteModel = async (id: string) => {
    if (confirm('정말로 이 3D 모델을 삭제하시겠습니까?')) {
      try {
        // TODO: 실제 API 호출로 대체
        setModels(prev => prev.filter(model => model.id !== id));
        showToast('success', '삭제 완료', '3D 모델이 성공적으로 삭제되었습니다.');
      } catch (error) {
        console.error('3D 모델 삭제 실패:', error);
        showToast('error', '오류', '3D 모델 삭제에 실패했습니다.');
      }
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'low': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-green-100 text-green-800';
      case 'ultra': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQualityText = (quality: string) => {
    switch (quality) {
      case 'low': return '저품질';
      case 'medium': return '중품질';
      case 'high': return '고품질';
      case 'ultra': return '초고품질';
      default: return '미정';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '초급';
      case 'intermediate': return '중급';
      case 'advanced': return '고급';
      case 'expert': return '전문가';
      default: return '미정';
    }
  };

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'glb': return '📦';
      case 'gltf': return '🎨';
      case 'fbx': return '🎬';
      case 'obj': return '📐';
      case 'dae': return '🎭';
      default: return '📄';
    }
  };

  const filteredModels = models.filter(model => {
    if (filterStyle !== 'all' && model.swimmingStyle !== filterStyle) return false;
    if (filterQuality !== 'all' && model.quality !== filterQuality) return false;
    if (searchTerm && !model.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !model.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const showToast = (type: 'success' | 'error' | 'warning', title: string, message: string) => {
    const newToast = {
      id: Date.now(),
      type,
      title,
      message,
      duration: 5000
    };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  if (!user || !hasUserType('superAdmin')) {
    return <LoadingSpinner />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">📦 3D 모델 관리</h1>
            <p className="text-gray-600">
              3D 수영 모델을 업로드하고 체계적으로 관리하세요.
            </p>
          </div>
          <Button onClick={handleUploadModel} className="bg-blue-600 hover:bg-blue-700">
            📤 새 모델 업로드
          </Button>
        </div>
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">총 모델 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{models.length}</div>
            <p className="text-xs text-gray-500 mt-1">업로드된 모델</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">활성 모델</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {models.filter(m => m.isActive).length}
            </div>
            <p className="text-xs text-gray-500 mt-1">사용 중인 모델</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">총 다운로드</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {models.reduce((sum, model) => sum + model.downloadCount, 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">전체 다운로드</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">평균 파일 크기</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {(models.reduce((sum, model) => sum + model.fileSize, 0) / models.length).toFixed(1)}MB
            </div>
            <p className="text-xs text-gray-500 mt-1">모델당 평균</p>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>검색 및 필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
              <input
                type="text"
                placeholder="모델명 또는 설명 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border-gray-300 px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">영법</label>
              <select
                value={filterStyle}
                onChange={(e) => setFilterStyle(e.target.value)}
                className="w-full rounded-md border-gray-300 px-3 py-2"
              >
                <option value="all">전체</option>
                <option value="자유형">자유형</option>
                <option value="평형">평형</option>
                <option value="접영">접영</option>
                <option value="배영">배영</option>
                <option value="개구리형">개구리형</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">품질</label>
              <select
                value={filterQuality}
                onChange={(e) => setFilterQuality(e.target.value)}
                className="w-full rounded-md border-gray-300 px-3 py-2"
              >
                <option value="all">전체</option>
                <option value="low">저품질</option>
                <option value="medium">중품질</option>
                <option value="high">고품질</option>
                <option value="ultra">초고품질</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStyle('all');
                  setFilterQuality('all');
                }}
                variant="outline"
                className="w-full"
              >
                🔄 필터 초기화
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3D 모델 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>3D 모델 목록 ({filteredModels.length}개)</CardTitle>
            <RefreshButton onRefresh={handleRefresh} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">모델명</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">파일 정보</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">영법</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">품질</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">난이도</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">다운로드</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">상태</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">액션</th>
                </tr>
              </thead>
              <tbody>
                {filteredModels.map((model) => (
                  <tr key={model.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{model.name}</div>
                        <div className="text-sm text-gray-500">{model.englishName}</div>
                        <div className="text-xs text-gray-400 mt-1">{model.description.substring(0, 60)}...</div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {model.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                              {tag}
                            </span>
                          ))}
                          {model.tags.length > 3 && (
                            <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                              +{model.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getFileTypeIcon(model.fileType)}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{model.fileType.toUpperCase()}</div>
                          <div className="text-xs text-gray-500">{model.fileSize}MB</div>
                          <div className="text-xs text-gray-400">v{model.version}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{model.swimmingStyle}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getQualityColor(model.quality)}`}>
                        {getQualityText(model.quality)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(model.difficulty)}`}>
                        {getDifficultyText(model.difficulty)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{model.downloadCount}</span>
                        <span className="text-xs text-gray-500">회</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        model.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {model.isActive ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleEditModel(model)}
                          variant="outline"
                          size="sm"
                        >
                          ✏️ 수정
                        </Button>
                        <Button
                          onClick={() => handleDeleteModel(model.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          🗑️ 삭제
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 토스트 알림 */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
