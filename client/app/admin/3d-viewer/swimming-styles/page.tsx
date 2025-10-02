'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../hooks/useAuth';

/**
 * 3D 뷰어 - 수영 스타일 관리 페이지
 * 2025-09-13: 404 오류 해결을 위해 생성
 * 기능: 자유형, 배영, 평영, 접영 등의 3D 수영 스타일 관리
 */

interface SwimmingStyle {
  id: string;
  name: string;
  displayName: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isActive: boolean;
  isPublicDemo?: boolean; // 체험 모드 공개 여부
  modelUrl?: string; // 3D 모델 파일 URL (GLB/GLTF)
  poster?: string; // 썸네일 이미지
  tags?: string[]; // 태그 (예: 캐치, 킥, 타이밍)
  cues?: string[]; // 코칭 큐
  cautions?: string[]; // 주의사항
  createdAt: string;
  updatedAt: string;
}

export default function SwimmingStylesPage() {
  const { user, loading } = useAuth();
  const [styles, setStyles] = useState<SwimmingStyle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 기본 수영 스타일 데이터 (하드코딩)
  const defaultStyles: SwimmingStyle[] = [
    {
      id: 'freestyle',
      name: 'freestyle',
      displayName: '자유형',
      description: '가장 기본적인 수영 스타일로, 팔을 번갈아가며 앞으로 젓는 방식',
      difficulty: 'beginner',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'backstroke',
      name: 'backstroke',
      displayName: '배영',
      description: '등을 뒤로 하여 수영하는 방식',
      difficulty: 'intermediate',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'breaststroke',
      name: 'breaststroke',
      displayName: '평영',
      description: '가슴을 앞으로 하여 팔과 다리를 동시에 움직이는 방식',
      difficulty: 'intermediate',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'butterfly',
      name: 'butterfly',
      displayName: '접영',
      description: '가장 어려운 수영 스타일로, 팔을 동시에 움직이는 방식',
      difficulty: 'advanced',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  useEffect(() => {
    if (user && (user.userType === 'superAdmin' || user.userType === 'centerAdmin')) {
      loadStyles();
    }
  }, [user]);

  const loadStyles = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/swimming-styles', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStyles(data.data || []);
        }
      } else {
        // API 실패 시 기본 데이터 사용
        setStyles(defaultStyles);
      }
    } catch (error) {
      console.error('영법 로드 오류:', error);
      setStyles(defaultStyles);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.userType !== 'superAdmin' && user.userType !== 'centerAdmin')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">접근 권한 없음</h1>
          <p className="text-gray-600">이 페이지에 접근할 권한이 없습니다.</p>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '초급';
      case 'intermediate': return '중급';
      case 'advanced': return '고급';
      default: return '알 수 없음';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">3D 뷰어 - 수영 스타일 관리</h1>
          <p className="text-gray-600">3D 모델을 활용한 수영 스타일 관리 시스템</p>
        </div>
        {styles.length === 0 && (
          <button
            onClick={async () => {
              if (!confirm('기본 영법 데이터를 생성하시겠습니까?')) return;
              
              for (const style of defaultStyles) {
                try {
                  await fetch('http://localhost:5000/api/swimming-styles', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('token')}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(style)
                  });
                } catch (err) {
                  console.error('영법 생성 오류:', err);
                }
              }
              
              alert('기본 영법 데이터가 생성되었습니다!');
              loadStyles();
            }}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            + 기본 데이터 생성
          </button>
        )}
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 스타일</p>
              <p className="text-2xl font-bold text-gray-900">{styles.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">활성 스타일</p>
              <p className="text-2xl font-bold text-gray-900">{styles.filter(s => s.isActive).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">중급 스타일</p>
              <p className="text-2xl font-bold text-gray-900">{styles.filter(s => s.difficulty === 'intermediate').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">고급 스타일</p>
              <p className="text-2xl font-bold text-gray-900">{styles.filter(s => s.difficulty === 'advanced').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 수영 스타일 목록 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">수영 스타일 목록</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  스타일명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  난이도
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  설명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {styles.map((style) => (
                <tr key={style.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {style.displayName.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {style.displayName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {style.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(style.difficulty)}`}>
                      {getDifficultyText(style.difficulty)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {style.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        style.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {style.isActive ? '✅ 활성' : '❌ 비활성'}
                      </span>
                      {style.isPublicDemo && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          🌍 체험 공개
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      3D 보기
                    </button>
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                      편집
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3D 뷰어 통합 안내 */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">🔗 3D 뷰어 통합</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>✅ <strong>체험 공개</strong> 체크박스를 활성화하면 <code>/3d-viewer</code> 페이지에 자동 표시됩니다</li>
          <li>✅ 영법 데이터가 <strong>실시간 동기화</strong>됩니다</li>
          <li>🔄 3D 모델 파일은 추후 업로드 기능으로 추가 예정</li>
        </ul>
      </div>

      {/* 안내 메시지 */}
      {styles.length === 0 && (
        <div className="mt-4 p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <div className="text-4xl mb-3">🏊‍♂️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">영법 데이터가 없습니다</h3>
          <p className="text-gray-600 mb-4">
            "기본 데이터 생성" 버튼을 눌러 4개 기본 영법을 생성하세요
          </p>
        </div>
      )}
    </div>
  );
}
