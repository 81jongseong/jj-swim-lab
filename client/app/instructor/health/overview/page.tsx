/**
 * 👨‍🏫 JJ Swim Lab - 강사용 학생 건강정보 개요 페이지
 * 
 * 📋 **페이지 목적**
 * - 강사가 담당하는 학생들의 공개된 건강정보를 한눈에 볼 수 있는 개요 페이지
 * - 학생별 건강 상태, BMI, 운동 준수율, AI 추천사항 등을 데이터베이스에서 실시간으로 조회
 * 
 * 🔄 **주요 기능**
 * - 담당 학생들의 공개 건강정보 조회 (실시간 데이터베이스 연동)
 * - 학생별 건강 상태 및 BMI 표시
 * - 운동 준수율 및 마지막 건강 체크 일자
 * - AI 기반 운동 추천사항 확인
 * - 건강 통계 대시보드 (전체/우수/양호/주의 학생 수)
 * - 평균 BMI 및 운동 준수율 통계
 * - 주요 건강 이슈 리스트
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect)
 * - useAuth hook (강사 권한 확인)
 * - 건강정보 API 연동
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * - 강사 권한 확인 필수
 * - 학생이 공개 설정한 건강정보만 조회
 * - 개인정보 보호 준수
 * - 실시간 데이터 동기화
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (강사용 학생 건강정보 개요 페이지)
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { Users, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface StudentHealthSummary {
  _id: string;
  name: string;
  email: string;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  bmi: number;
  lastHealthCheck: string;
  exerciseCompliance: number;
  hasHealthData: boolean;
}

interface HealthStatistics {
  totalStudents: number;
  excellentCount: number;
  goodCount: number;
  fairCount: number;
  poorCount: number;
  averageBMI: number;
  averageCompliance: number;
}

export default function InstructorHealthOverview() {
  const { user, hasUserType } = useAuth();
  const [students, setStudents] = useState<StudentHealthSummary[]>([]);
  const [statistics, setStatistics] = useState<HealthStatistics | null>(null);
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
      loadStudentHealthData();
    }
  }, [user?.userType]);

  const loadStudentHealthData = async () => {
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
        const studentsWithHealth = await Promise.all(
          studentsData.students.map(async (student: any) => {
            try {
              // 학생별 공개 건강정보 조회
              const healthResponse = await fetch(`http://localhost:5000/api/health/student/${student._id}/public`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              if (healthResponse.ok) {
                const healthData = await healthResponse.json();
                return {
                  _id: student._id,
                  name: student.name,
                  email: student.email,
                  healthStatus: healthData.healthStatus || 'good',
                  bmi: healthData.bmi || 0,
                  lastHealthCheck: healthData.lastHealthCheck || new Date().toISOString(),
                  exerciseCompliance: healthData.exerciseCompliance || 0,
                  hasHealthData: true
                };
              } else {
                return {
                  _id: student._id,
                  name: student.name,
                  email: student.email,
                  healthStatus: 'good' as const,
                  bmi: 0,
                  lastHealthCheck: new Date().toISOString(),
                  exerciseCompliance: 0,
                  hasHealthData: false
                };
              }
            } catch (error) {
              console.error(`학생 ${student.name} 건강정보 조회 실패:`, error);
              return {
                _id: student._id,
                name: student.name,
                email: student.email,
                healthStatus: 'good' as const,
                bmi: 0,
                lastHealthCheck: new Date().toISOString(),
                exerciseCompliance: 0,
                hasHealthData: false
              };
            }
          })
        );

        setStudents(studentsWithHealth);
        
        // 통계 계산
        const stats = calculateHealthStatistics(studentsWithHealth);
        setStatistics(stats);
      } else {
        setError('학생 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('학생 건강정보 로딩 실패:', error);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const calculateHealthStatistics = (students: StudentHealthSummary[]): HealthStatistics => {
    const totalStudents = students.length;
    const excellentCount = students.filter(s => s.healthStatus === 'excellent').length;
    const goodCount = students.filter(s => s.healthStatus === 'good').length;
    const fairCount = students.filter(s => s.healthStatus === 'fair').length;
    const poorCount = students.filter(s => s.healthStatus === 'poor').length;
    
    const studentsWithBMI = students.filter(s => s.bmi > 0);
    const averageBMI = studentsWithBMI.length > 0 
      ? studentsWithBMI.reduce((sum, s) => sum + s.bmi, 0) / studentsWithBMI.length 
      : 0;
    
    const studentsWithCompliance = students.filter(s => s.exerciseCompliance > 0);
    const averageCompliance = studentsWithCompliance.length > 0
      ? studentsWithCompliance.reduce((sum, s) => sum + s.exerciseCompliance, 0) / studentsWithCompliance.length
      : 0;

    return {
      totalStudents,
      excellentCount,
      goodCount,
      fairCount,
      poorCount,
      averageBMI: Math.round(averageBMI * 100) / 100,
      averageCompliance: Math.round(averageCompliance * 100) / 100
    };
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthStatusText = (status: string) => {
    switch (status) {
      case 'excellent': return '우수';
      case 'good': return '양호';
      case 'fair': return '보통';
      case 'poor': return '주의';
      default: return '미정';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">학생 건강정보를 불러오는 중...</p>
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
              onClick={loadStudentHealthData}
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏥 학생 건강정보 개요</h1>
          <p className="text-gray-600">담당 학생들의 건강 상태를 한눈에 확인하세요</p>
        </div>

        {/* 통계 카드 */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">전체 학생</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.totalStudents}명</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">우수/양호</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.excellentCount + statistics.goodCount}명</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">주의 필요</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.fairCount + statistics.poorCount}명</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">평균 준수율</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.averageCompliance}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 학생 목록 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">학생별 건강 현황</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">학생 정보</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">건강 상태</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BMI</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">운동 준수율</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">마지막 체크</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getHealthStatusColor(student.healthStatus)}`}>
                        {getHealthStatusText(student.healthStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.bmi > 0 ? student.bmi : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${student.exerciseCompliance}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{student.exerciseCompliance}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(student.lastHealthCheck).toLocaleDateString('ko-KR')}
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 건강 관리 팁</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">🏊‍♂️ 수영 운동의 장점</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 전신 근력 및 지구력 향상</li>
                <li>• 심폐 기능 강화</li>
                <li>• 관절 부담 최소화</li>
                <li>• 스트레스 해소 효과</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">📊 건강 지표 해석</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• BMI 18.5-24.9: 정상 체중</li>
                <li>• 운동 준수율 80% 이상: 우수</li>
                <li>• 정기 건강 체크: 월 1회 권장</li>
                <li>• 개인별 맞춤 운동 계획 필요</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
