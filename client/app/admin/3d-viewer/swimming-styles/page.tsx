/**
 * ✅ JJ Swim Lab - 영법 종류 관리 페이지
 * 
 * 📋 **기능**
 * - 수영 영법 종류 추가/수정/삭제
 * - 영법별 3D 모델 연결
 * - 영법 난이도 및 설명 관리
 * - 영법별 사용 통계
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

interface SwimmingStyle {
  id: string;
  name: string;
  englishName: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  description: string;
  modelCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SwimmingStylesPage() {
  const { user, hasUserType } = useAuth();
  const router = useRouter();
  const [styles, setStyles] = useState<SwimmingStyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toasts, setToasts] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStyle, setEditingStyle] = useState<SwimmingStyle | null>(null);

  // 권한 체크
  useEffect(() => {
    if (!user || !hasUserType('superAdmin')) {
      router.push('/admin/dashboard');
      return;
    }
  }, [user, hasUserType, router]);

  // 영법 데이터 로드
  useEffect(() => {
    if (user && hasUserType('superAdmin')) {
      loadSwimmingStyles();
    }
  }, [user, hasUserType]);

  const loadSwimmingStyles = async () => {
    try {
      setLoading(true);
      // TODO: 실제 API 호출로 대체
      const mockStyles: SwimmingStyle[] = [
        {
          id: '1',
          name: '자유형',
          englishName: 'Freestyle',
          difficulty: 'beginner',
          description: '가장 기본적이고 효율적인 수영 방법으로, 팔을 번갈아가며 젓고 다리를 교대로 차는 동작을 합니다.',
          modelCount: 3,
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-15'
        },
        {
          id: '2',
          name: '평형',
          englishName: 'Breaststroke',
          difficulty: 'intermediate',
          description: '팔과 다리를 동시에 움직이는 대칭적인 수영 방법으로, 물속에서 팔을 원을 그리며 젓습니다.',
          modelCount: 2,
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-10'
        },
        {
          id: '3',
          name: '접영',
          englishName: 'Butterfly',
          difficulty: 'advanced',
          description: '가장 역동적이고 아름다운 수영 방법으로, 양팔을 동시에 들어올려 물속으로 밀어넣는 동작을 합니다.',
          modelCount: 2,
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '4',
          name: '배영',
          englishName: 'Backstroke',
          difficulty: 'intermediate',
          description: '등을 대고 수영하는 방법으로, 자유형과 유사하지만 몸이 뒤집혀 있는 상태에서 수영합니다.',
          modelCount: 1,
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-05'
        },
        {
          id: '5',
          name: '개구리형',
          englishName: 'Frog Kick',
          difficulty: 'beginner',
          description: '평형의 다리 동작을 독립적으로 연습하는 방법으로, 다리만 사용하여 수영합니다.',
          modelCount: 1,
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-12'
        }
      ];
      
      setStyles(mockStyles);
    } catch (error) {
      console.error('영법 데이터 로드 실패:', error);
      showToast('error', '오류', '영법 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSwimmingStyles();
    setRefreshing(false);
    showToast('success', '새로고침', '영법 데이터가 업데이트되었습니다.');
  };

  const handleAddStyle = () => {
    setShowAddForm(true);
    setEditingStyle(null);
  };

  const handleEditStyle = (style: SwimmingStyle) => {
    setEditingStyle(style);
    setShowAddForm(true);
  };

  const handleDeleteStyle = async (id: string) => {
    if (confirm('정말로 이 영법을 삭제하시겠습니까?')) {
      try {
        // TODO: 실제 API 호출로 대체
        setStyles(prev => prev.filter(style => style.id !== id));
        showToast('success', '삭제 완료', '영법이 성공적으로 삭제되었습니다.');
      } catch (error) {
        console.error('영법 삭제 실패:', error);
        showToast('error', '오류', '영법 삭제에 실패했습니다.');
      }
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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">🏊‍♂️ 영법 종류 관리</h1>
            <p className="text-gray-600">
              수영 영법을 체계적으로 관리하고 3D 모델과 연결하세요.
            </p>
          </div>
          <Button onClick={handleAddStyle} className="bg-blue-600 hover:bg-blue-700">
            ➕ 새 영법 추가
          </Button>
        </div>
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">총 영법 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{styles.length}</div>
            <p className="text-xs text-gray-500 mt-1">등록된 영법</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">활성 영법</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {styles.filter(s => s.isActive).length}
            </div>
            <p className="text-xs text-gray-500 mt-1">사용 중인 영법</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">총 3D 모델</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {styles.reduce((sum, style) => sum + style.modelCount, 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">연결된 모델</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">평균 난이도</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">중급</div>
            <p className="text-xs text-gray-500 mt-1">전체 영법</p>
          </CardContent>
        </Card>
      </div>

      {/* 영법 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>영법 목록</CardTitle>
            <RefreshButton onRefresh={handleRefresh} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">영법명</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">영문명</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">난이도</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">3D 모델</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">상태</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">수정일</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">액션</th>
                </tr>
              </thead>
              <tbody>
                {styles.map((style) => (
                  <tr key={style.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{style.name}</div>
                        <div className="text-sm text-gray-500">{style.description.substring(0, 50)}...</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{style.englishName}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(style.difficulty)}`}>
                        {getDifficultyText(style.difficulty)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{style.modelCount}</span>
                        <span className="text-xs text-gray-500">개</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        style.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {style.isActive ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">{style.updatedAt}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleEditStyle(style)}
                          variant="outline"
                          size="sm"
                        >
                          ✏️ 수정
                        </Button>
                        <Button
                          onClick={() => handleDeleteStyle(style.id)}
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
