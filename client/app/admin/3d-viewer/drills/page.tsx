/**
 * ✅ JJ Swim Lab - 드릴 관리 페이지
 * 
 * 📋 **기능**
 * - 수영 연습 드릴 추가/수정/삭제
 * - 드릴별 3D 모델 연결
 * - 드릴 난이도 및 카테고리 관리
 * - 드릴별 사용 통계
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

interface Drill {
  id: string;
  name: string;
  englishName: string;
  category: 'warmup' | 'technique' | 'endurance' | 'speed' | 'recovery';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  swimmingStyle: string;
  description: string;
  duration: number; // 분 단위
  distance: number; // 미터 단위
  modelCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DrillsPage() {
  const { user, hasUserType } = useAuth();
  const router = useRouter();
  const [drills, setDrills] = useState<Drill[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toasts, setToasts] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDrill, setEditingDrill] = useState<Drill | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  // 권한 체크
  useEffect(() => {
    if (!user || !hasUserType('superAdmin')) {
      router.push('/admin/dashboard');
      return;
    }
  }, [user, hasUserType, router]);

  // 드릴 데이터 로드
  useEffect(() => {
    if (user && hasUserType('superAdmin')) {
      loadDrills();
    }
  }, [user, hasUserType]);

  const loadDrills = async () => {
    try {
      setLoading(true);
      // TODO: 실제 API 호출로 대체
      const mockDrills: Drill[] = [
        {
          id: '1',
          name: '팔 젓기 연습',
          englishName: 'Arm Pull Practice',
          category: 'technique',
          difficulty: 'beginner',
          swimmingStyle: '자유형',
          description: '자유형의 팔 동작을 정확하게 연습하는 드릴입니다. 팔의 움직임과 물의 저항을 느끼며 연습합니다.',
          duration: 15,
          distance: 200,
          modelCount: 2,
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-15'
        },
        {
          id: '2',
          name: '다리 차기 연습',
          englishName: 'Leg Kick Practice',
          category: 'technique',
          difficulty: 'beginner',
          swimmingStyle: '자유형',
          description: '자유형의 다리 동작을 연습하는 드릴입니다. 발목을 유연하게 움직이며 효율적인 킥을 연습합니다.',
          duration: 20,
          distance: 300,
          modelCount: 1,
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-10'
        },
        {
          id: '3',
          name: '호흡 연습',
          englishName: 'Breathing Practice',
          category: 'technique',
          difficulty: 'intermediate',
          swimmingStyle: '자유형',
          description: '자유형에서 호흡 타이밍을 연습하는 드릴입니다. 정확한 호흡 리듬을 익힙니다.',
          duration: 25,
          distance: 400,
          modelCount: 1,
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '4',
          name: '평형 팔 동작',
          englishName: 'Breaststroke Arm Movement',
          category: 'technique',
          difficulty: 'intermediate',
          swimmingStyle: '평형',
          description: '평형의 팔 동작을 연습하는 드릴입니다. 팔의 원형 움직임과 물 밀어내기를 연습합니다.',
          duration: 20,
          distance: 250,
          modelCount: 2,
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-05'
        },
        {
          id: '5',
          name: '접영 돌고래 킥',
          englishName: 'Butterfly Dolphin Kick',
          category: 'technique',
          difficulty: 'advanced',
          swimmingStyle: '접영',
          description: '접영의 돌고래 킥을 연습하는 드릴입니다. 몸의 파도 움직임을 연습합니다.',
          duration: 30,
          distance: 500,
          modelCount: 1,
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-12'
        },
        {
          id: '6',
          name: '웜업 스트로크',
          englishName: 'Warm-up Strokes',
          category: 'warmup',
          difficulty: 'beginner',
          swimmingStyle: '혼합',
          description: '수영 전 몸을 따뜻하게 하는 웜업 드릴입니다. 천천히 스트로크를 연습합니다.',
          duration: 10,
          distance: 100,
          modelCount: 1,
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-08'
        },
        {
          id: '7',
          name: '지구력 연습',
          englishName: 'Endurance Training',
          category: 'endurance',
          difficulty: 'intermediate',
          swimmingStyle: '자유형',
          description: '장거리 수영을 위한 지구력을 기르는 드릴입니다. 일정한 페이스를 유지합니다.',
          duration: 45,
          distance: 1000,
          modelCount: 1,
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-18'
        },
        {
          id: '8',
          name: '스피드 연습',
          englishName: 'Speed Training',
          category: 'speed',
          difficulty: 'advanced',
          swimmingStyle: '자유형',
          description: '빠른 수영을 위한 스피드 드릴입니다. 인터벌 훈련으로 속도를 높입니다.',
          duration: 35,
          distance: 800,
          modelCount: 2,
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-22'
        }
      ];
      
      setDrills(mockDrills);
    } catch (error) {
      console.error('드릴 데이터 로드 실패:', error);
      showToast('error', '오류', '드릴 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDrills();
    setRefreshing(false);
    showToast('success', '새로고침', '드릴 데이터가 업데이트되었습니다.');
  };

  const handleAddDrill = () => {
    setShowAddForm(true);
    setEditingDrill(null);
  };

  const handleEditDrill = (drill: Drill) => {
    setEditingDrill(drill);
    setShowAddForm(true);
  };

  const handleDeleteDrill = async (id: string) => {
    if (confirm('정말로 이 드릴을 삭제하시겠습니까?')) {
      try {
        // TODO: 실제 API 호출로 대체
        setDrills(prev => prev.filter(drill => drill.id !== id));
        showToast('success', '삭제 완료', '드릴이 성공적으로 삭제되었습니다.');
      } catch (error) {
        console.error('드릴 삭제 실패:', error);
        showToast('error', '오류', '드릴 삭제에 실패했습니다.');
      }
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'warmup': return 'bg-blue-100 text-blue-800';
      case 'technique': return 'bg-green-100 text-green-800';
      case 'endurance': return 'bg-purple-100 text-purple-800';
      case 'speed': return 'bg-orange-100 text-orange-800';
      case 'recovery': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'warmup': return '웜업';
      case 'technique': return '기술';
      case 'endurance': return '지구력';
      case 'speed': return '스피드';
      case 'recovery': return '회복';
      default: return '기타';
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

  const filteredDrills = drills.filter(drill => {
    if (filterCategory !== 'all' && drill.category !== filterCategory) return false;
    if (filterDifficulty !== 'all' && drill.difficulty !== filterDifficulty) return false;
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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">🎯 드릴 관리</h1>
            <p className="text-gray-600">
              수영 연습 드릴을 체계적으로 관리하고 3D 모델과 연결하세요.
            </p>
          </div>
          <Button onClick={handleAddDrill} className="bg-blue-600 hover:bg-blue-700">
            ➕ 새 드릴 추가
          </Button>
        </div>
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">총 드릴 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{drills.length}</div>
            <p className="text-xs text-gray-500 mt-1">등록된 드릴</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">활성 드릴</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {drills.filter(d => d.isActive).length}
            </div>
            <p className="text-xs text-gray-500 mt-1">사용 중인 드릴</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">총 3D 모델</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {drills.reduce((sum, drill) => sum + drill.modelCount, 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">연결된 모델</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">평균 시간</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(drills.reduce((sum, drill) => sum + drill.duration, 0) / drills.length)}분
            </div>
            <p className="text-xs text-gray-500 mt-1">드릴당 평균</p>
          </CardContent>
        </Card>
      </div>

      {/* 필터 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="rounded-md border-gray-300 px-3 py-2"
              >
                <option value="all">전체</option>
                <option value="warmup">웜업</option>
                <option value="technique">기술</option>
                <option value="endurance">지구력</option>
                <option value="speed">스피드</option>
                <option value="recovery">회복</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">난이도</label>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="rounded-md border-gray-300 px-3 py-2"
              >
                <option value="all">전체</option>
                <option value="beginner">초급</option>
                <option value="intermediate">중급</option>
                <option value="advanced">고급</option>
                <option value="expert">전문가</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 드릴 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>드릴 목록 ({filteredDrills.length}개)</CardTitle>
            <RefreshButton onRefresh={handleRefresh} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">드릴명</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">카테고리</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">영법</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">난이도</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">시간/거리</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">3D 모델</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">상태</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">액션</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrills.map((drill) => (
                  <tr key={drill.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{drill.name}</div>
                        <div className="text-sm text-gray-500">{drill.englishName}</div>
                        <div className="text-xs text-gray-400 mt-1">{drill.description.substring(0, 60)}...</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(drill.category)}`}>
                        {getCategoryText(drill.category)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{drill.swimmingStyle}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(drill.difficulty)}`}>
                        {getDifficultyText(drill.difficulty)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      <div>{drill.duration}분</div>
                      <div className="text-xs text-gray-500">{drill.distance}m</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{drill.modelCount}</span>
                        <span className="text-xs text-gray-500">개</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        drill.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {drill.isActive ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleEditDrill(drill)}
                          variant="outline"
                          size="sm"
                        >
                          ✏️ 수정
                        </Button>
                        <Button
                          onClick={() => handleDeleteDrill(drill.id)}
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
