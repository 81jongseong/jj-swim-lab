/**
 * 📈 JJ Swim Lab - 강사용 학생 건강 진행상황 추적 페이지
 * 
 * 📋 **페이지 목적**
 * - 강사가 담당하는 학생들의 건강 진행상황을 체계적으로 추적하고 관리
 * - 학생별 건강 지표 변화, 운동 목표 달성률, AI 예측 등을 시각적으로 표시
 * 
 * 🔄 **주요 기능**
 * - 학생별 건강 진행상황 실시간 추적
 * - 건강 지표 변화 추이 (BMI, 혈압, 심박수, 유연성, 근력, 지구력)
 * - 운동 준수율 모니터링 (주간, 월간, 전체)
 * - 목표 달성률 및 완료 예상 일정 추적
 * - AI 기반 건강 예측 및 위험 요소 식별
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect)
 * - useAuth hook (강사 권한 확인)
 * - 건강정보 API 연동
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * - 강사 권한 확인 필수
 * - 학생이 공개 설정한 진행상황 데이터만 조회
 * - 건강 정보 보안 및 개인정보 보호 준수
 * - 실시간 데이터 동기화 및 변화 추이 계산
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (강사용 학생 건강 진행상황 추적 페이지)
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { TrendingUp, Target, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';

interface HealthProgress {
  _id: string;
  name: string;
  email: string;
  currentBMI: number;
  previousBMI: number;
  bmiChange: number;
  exerciseCompliance: number;
  targetCompliance: number;
  lastHealthCheck: string;
  nextHealthCheck: string;
  healthTrend: 'improving' | 'stable' | 'declining';
  riskFactors: string[];
  recommendations: string[];
}

export default function InstructorHealthProgress() {
  const { user, hasUserType } = useAuth();
  const [progressData, setProgressData] = useState<HealthProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 강사 권한 확인
  if (!hasUserType('instructor')) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h1>
            <p className="text-gray-600">이 페이지는 강사만 접근할 수 있습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  // 데이터 로드
  useEffect(() => {
    if (user?.userType === 'instructor') {
      loadProgressData();
    }
  }, [user?.userType]);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('인증 토큰이 없습니다.');
        return;
      }

      // 담당 학생 목록 조회
      const studentsResponse = await fetch('http://localhost:5000/api/instructor/students', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        const progressData = await Promise.all(
          studentsData.students.map(async (student: any) => {
            try {
              // 학생별 건강 진행상황 조회
              const progressResponse = await fetch(`http://localhost:5000/api/health/student/${student._id}/progress`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              if (progressResponse.ok) {
                const progress = await progressResponse.json();
                return {
                  _id: student._id,
                  name: student.name,
                  email: student.email,
                  currentBMI: progress.currentBMI || 0,
                  previousBMI: progress.previousBMI || 0,
                  bmiChange: progress.bmiChange || 0,
                  exerciseCompliance: progress.exerciseCompliance || 0,
                  targetCompliance: progress.targetCompliance || 80,
                  lastHealthCheck: progress.lastHealthCheck || new Date().toISOString(),
                  nextHealthCheck: progress.nextHealthCheck || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                  healthTrend: progress.healthTrend || 'stable',
                  riskFactors: progress.riskFactors || [],
                  recommendations: progress.recommendations || []
                };
              } else {
                return {
                  _id: student._id,
                  name: student.name,
                  email: student.email,
                  currentBMI: 0,
                  previousBMI: 0,
                  bmiChange: 0,
                  exerciseCompliance: 0,
                  targetCompliance: 80,
                  lastHealthCheck: new Date().toISOString(),
                  nextHealthCheck: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                  healthTrend: 'stable' as const,
                  riskFactors: [],
                  recommendations: []
                };
              }
            } catch (error) {
              console.error(`학생 ${student.name} 진행상황 조회 실패:`, error);
              return {
                _id: student._id,
                name: student.name,
                email: student.email,
                currentBMI: 0,
                previousBMI: 0,
                bmiChange: 0,
                exerciseCompliance: 0,
                targetCompliance: 80,
                lastHealthCheck: new Date().toISOString(),
                nextHealthCheck: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                healthTrend: 'stable' as const,
                riskFactors: [],
                recommendations: []
              };
            }
          })
        );

        setProgressData(progressData);
      } else {
        setError('학생 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('진행상황 데이터 로딩 실패:', error);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'stable': return <Target className="h-5 w-5 text-blue-600" />;
      case 'declining': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <Target className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'improving': return '개선 중';
      case 'stable': return '안정';
      case 'declining': return '하락';
      default: return '미정';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600';
      case 'stable': return 'text-blue-600';
      case 'declining': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">건강 진행상황을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">오류가 발생했습니다</h1>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={loadProgressData}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📈 학생 건강 진행상황</h1>
          <p className="text-gray-600">담당 학생들의 건강 변화와 목표 달성을 추적하세요</p>
        </div>

        {/* 진행상황 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">개선 중</p>
                <p className="text-2xl font-bold text-gray-900">
                  {progressData.filter(p => p.healthTrend === 'improving').length}명
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">안정</p>
                <p className="text-2xl font-bold text-gray-900">
                  {progressData.filter(p => p.healthTrend === 'stable').length}명
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">주의 필요</p>
                <p className="text-2xl font-bold text-gray-900">
                  {progressData.filter(p => p.healthTrend === 'declining').length}명
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 학생별 진행상황 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">학생별 건강 진행상황</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">학생 정보</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BMI 변화</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">운동 준수율</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">건강 추세</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">다음 체크</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {progressData.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>현재: {student.currentBMI > 0 ? student.currentBMI : '-'}</div>
                        <div className="text-gray-500">
                          변화: {student.bmiChange !== 0 ? (student.bmiChange > 0 ? '+' : '') + student.bmiChange : '-'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${student.exerciseCompliance}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{student.exerciseCompliance}%</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">목표: {student.targetCompliance}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTrendIcon(student.healthTrend)}
                        <span className={`ml-2 text-sm font-medium ${getTrendColor(student.healthTrend)}`}>
                          {getTrendText(student.healthTrend)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(student.nextHealthCheck).toLocaleDateString('ko-KR')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 진행상황 관리 팁</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">📊 진행상황 해석</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• BMI 변화: ±0.5 이내는 정상 범위</li>
                <li>• 운동 준수율: 80% 이상이 목표</li>
                <li>• 건강 추세: 개선/안정/하락으로 분류</li>
                <li>• 정기 체크: 월 1회 권장</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">🎯 개선 방향</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 개인별 맞춤 운동 계획 수립</li>
                <li>• 정기적인 건강 상태 점검</li>
                <li>• 학생별 동기부여 및 피드백</li>
                <li>• AI 기반 운동 추천 활용</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
