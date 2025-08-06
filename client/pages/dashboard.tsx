'use client';

import { useState, useEffect } from 'react';
import { Card, LoadingSpinner, Badge, Button } from '../components/ui';
import apiClient from '../utils/api';

interface Progress {
  _id: string;
  course: {
    name: string;
    level: string;
  };
  class: {
    name: string;
  };
  center: {
    name: string;
  };
  instructor: {
    name: string;
  };
  evaluationDate: string;
  overallProgress: number;
  skills: Array<{
    skillName: string;
    status: 'not_started' | 'learning' | 'completed' | 'needs_improvement';
    instructorNotes: string;
    practiceDrills: Array<{
      name: string;
      description: string;
      youtubeUrl: string;
    }>;
    advice: string;
  }>;
  instructorComments: string;
  nextGoals: Array<{
    goal: string;
    targetDate: string;
  }>;
}

interface Evaluation {
  _id: string;
  course: {
    name: string;
    level: string;
  };
  class: {
    name: string;
  };
  instructor: {
    name: string;
  };
  courseEndDate: string;
  isSubmitted: boolean;
}

export default function Dashboard() {
  const [progress, setProgress] = useState<Progress[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // 사용자 정보 조회
      const userResponse = await apiClient.getUserInfo();
      if (userResponse.data) {
        setUserInfo(userResponse.data);
      }

      // 진도 정보 조회
      const progressResponse = await apiClient.get('/progress/my-progress');
      if (progressResponse.data) {
        setProgress(progressResponse.data);
      }

      // 평가 가능한 강습 조회
      const evaluationsResponse = await apiClient.get('/progress/evaluations/available');
      if (evaluationsResponse.data) {
        setEvaluations(evaluationsResponse.data);
      }

      // 공지사항 조회
      const noticesResponse = await apiClient.getNotices();
      if (noticesResponse.data) {
        setNotices(noticesResponse.data.slice(0, 5)); // 최근 5개만
      }

    } catch (err) {
      setError('대시보드 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'learning': return 'warning';
      case 'needs_improvement': return 'error';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '완료';
      case 'learning': return '학습 중';
      case 'needs_improvement': return '개선 필요';
      default: return '미시작';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto" />
          <p className="mt-4 text-gray-600">대시보드를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            안녕하세요, {userInfo?.name || '회원'}님! 👋
          </h1>
          <p className="text-gray-600">오늘도 즐거운 수영을 시작해보세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽 컬럼 - 진도 현황 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 진도 현황 */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 나의 진도 현황</h2>
                
                {progress.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🏊‍♂️</div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">아직 진도 정보가 없습니다</h3>
                    <p className="text-gray-600">강사님이 진도를 체크해주시면 여기에 표시됩니다</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {progress.map((item) => (
                      <div key={item._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{item.course.name}</h3>
                            <p className="text-sm text-gray-600">
                              {item.center.name} • {item.instructor.name} 강사
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(item.evaluationDate).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="primary">
                            {item.overallProgress}% 완료
                          </Badge>
                        </div>

                        {/* 전체 진행률 */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">전체 진행률</span>
                            <span className="font-medium">{item.overallProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${item.overallProgress}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* 스킬 목록 */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700">스킬별 진행상황</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {item.skills.map((skill, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-sm text-gray-700">{skill.skillName}</span>
                                <Badge variant={getStatusColor(skill.status)} size="sm">
                                  {getStatusText(skill.status)}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 강사 코멘트 */}
                        {item.instructorComments && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <h4 className="text-sm font-medium text-blue-800 mb-1">강사 코멘트</h4>
                            <p className="text-sm text-blue-700">{item.instructorComments}</p>
                          </div>
                        )}

                        {/* 다음 목표 */}
                        {item.nextGoals.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">다음 목표</h4>
                            <div className="space-y-1">
                              {item.nextGoals.map((goal, index) => (
                                <div key={index} className="flex items-center space-x-2 text-sm">
                                  <span className="text-green-600">🎯</span>
                                  <span className="text-gray-700">{goal.goal}</span>
                                  {goal.targetDate && (
                                    <span className="text-gray-500 text-xs">
                                      ({new Date(goal.targetDate).toLocaleDateString()})
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* 평가 가능한 강습 */}
            {evaluations.length > 0 && (
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">📝 강습 평가</h2>
                  <div className="space-y-3">
                    {evaluations.map((evaluation) => (
                      <div key={evaluation._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">{evaluation.course.name}</h3>
                            <p className="text-sm text-gray-600">
                              {evaluation.instructor.name} 강사 • {evaluation.class.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              강습 종료: {new Date(evaluation.courseEndDate).toLocaleDateString()}
                            </p>
                          </div>
                          <Button variant="primary" size="sm">
                            평가하기
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* 오른쪽 컬럼 - 공지사항 */}
          <div className="space-y-6">
            {/* 공지사항 */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">📢 공지사항</h2>
                
                {notices.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">새로운 공지사항이 없습니다</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notices.map((notice) => (
                      <div key={notice._id} className="border-b border-gray-100 pb-3 last:border-b-0">
                        <h3 className="font-medium text-gray-900 text-sm mb-1">{notice.title}</h3>
                        <p className="text-gray-600 text-xs line-clamp-2">{notice.content}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          {new Date(notice.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-4">
                  <Button variant="outline" size="sm" className="w-full">
                    모든 공지사항 보기
                  </Button>
                </div>
              </div>
            </Card>

            {/* 빠른 메뉴 */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">⚡ 빠른 메뉴</h2>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    🏊‍♂️ 강습 예약
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    📅 내 일정
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    💳 결제 내역
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    👤 프로필 수정
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 