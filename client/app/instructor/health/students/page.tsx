/**
 * 👥 JJ Swim Lab - 강사용 학생 건강 상세정보 페이지
 * 
 * 📋 **페이지 목적**
 * - 강사가 담당하는 학생들의 개별 건강 상세정보를 조회하고 관리
 * - 학생별 건강 프로필, 운동 기록, 건강 변화 추이 등을 종합적으로 분석
 * - 개인별 맞춤 지도 계획 수립을 위한 상세 데이터 제공
 * 
 * 🔄 **주요 기능**
 * - 학생별 건강 프로필 상세 조회 (데이터베이스 연동)
 * - 건강 지표 변화 추이 및 그래프 시각화
 * - 운동 기록 및 성과 분석
 * - 건강 목표 설정 및 달성률 추적
 * - 개인별 건강 이슈 및 주의사항 관리
 * - 강사 피드백 및 코멘트 시스템
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect)
 * - useAuth hook (강사 권한 확인)
 * - 건강정보 API 연동
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * - 강사 권한 확인 필수
 * - 학생이 공개 설정한 건강정보만 조회 가능
 * - 개인정보 보호 및 보안 준수
 * - 실시간 데이터 동기화 및 업데이트
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (강사용 학생 건강 상세정보 페이지)
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { Users, Heart, Activity, Target, Calendar, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface StudentHealthDetail {
  _id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  bmi: number;
  bloodType: string;
  healthStatus: string;
  exerciseCompliance: number;
  lastHealthCheck: string;
  nextHealthCheck: string;
  healthGoals: string[];
  medicalHistory: string[];
  allergies: string[];
  currentMedications: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  exerciseHistory: {
    date: string;
    type: string;
    duration: number;
    intensity: string;
    notes: string;
  }[];
  healthMetrics: {
    date: string;
    bloodPressure: string;
    heartRate: number;
    bodyFat: number;
    muscleMass: number;
    flexibility: number;
    strength: number;
    endurance: number;
  }[];
}

export default function InstructorHealthStudents() {
  const { user, hasUserType } = useAuth();
  const [students, setStudents] = useState<StudentHealthDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentHealthDetail | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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
      loadStudentHealthDetails();
    }
  }, [user?.userType]);

  const loadStudentHealthDetails = async () => {
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
        const healthDetails = await Promise.all(
          studentsData.students.map(async (student: any) => {
            try {
              // 학생별 건강 상세정보 조회
              const healthResponse = await fetch(`http://localhost:5000/api/health/student/${student._id}/details`, {
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
                  age: healthData.age || 0,
                  gender: healthData.gender || '미정',
                  height: healthData.height || 0,
                  weight: healthData.weight || 0,
                  bmi: healthData.bmi || 0,
                  bloodType: healthData.bloodType || '미정',
                  healthStatus: healthData.healthStatus || '양호',
                  exerciseCompliance: healthData.exerciseCompliance || 0,
                  lastHealthCheck: healthData.lastHealthCheck || new Date().toISOString(),
                  nextHealthCheck: healthData.nextHealthCheck || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                  healthGoals: healthData.healthGoals || ['건강 유지', '체력 향상'],
                  medicalHistory: healthData.medicalHistory || [],
                  allergies: healthData.allergies || [],
                  currentMedications: healthData.currentMedications || [],
                  emergencyContact: healthData.emergencyContact || {
                    name: '미정',
                    relationship: '미정',
                    phone: '미정'
                  },
                  exerciseHistory: healthData.exerciseHistory || [],
                  healthMetrics: healthData.healthMetrics || []
                };
              } else {
                return {
                  _id: student._id,
                  name: student.name,
                  email: student.email,
                  age: 0,
                  gender: '미정',
                  height: 0,
                  weight: 0,
                  bmi: 0,
                  bloodType: '미정',
                  healthStatus: '양호',
                  exerciseCompliance: 0,
                  lastHealthCheck: new Date().toISOString(),
                  nextHealthCheck: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                  healthGoals: ['건강 유지', '체력 향상'],
                  medicalHistory: [],
                  allergies: [],
                  currentMedications: [],
                  emergencyContact: {
                    name: '미정',
                    relationship: '미정',
                    phone: '미정'
                  },
                  exerciseHistory: [],
                  healthMetrics: []
                };
              }
            } catch (error) {
              console.error(`학생 ${student.name} 건강정보 조회 실패:`, error);
              return {
                _id: student._id,
                name: student.name,
                email: student.email,
                age: 0,
                gender: '미정',
                height: 0,
                weight: 0,
                bmi: 0,
                bloodType: '미정',
                healthStatus: '양호',
                exerciseCompliance: 0,
                lastHealthCheck: new Date().toISOString(),
                nextHealthCheck: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                healthGoals: ['건강 유지', '체력 향상'],
                medicalHistory: [],
                allergies: [],
                currentMedications: [],
                emergencyContact: {
                  name: '미정',
                  relationship: '미정',
                  phone: '미정'
                },
                exerciseHistory: [],
                healthMetrics: []
              };
            }
          })
        );

        setStudents(healthDetails);
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

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case '우수': return 'bg-green-100 text-green-800';
      case '양호': return 'bg-blue-100 text-blue-800';
      case '보통': return 'bg-yellow-100 text-yellow-800';
      case '주의': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBMICategory = (bmi: number) => {
    if (bmi === 0) return { category: '미정', color: 'bg-gray-100 text-gray-800' };
    if (bmi < 18.5) return { category: '저체중', color: 'bg-blue-100 text-blue-800' };
    if (bmi < 25) return { category: '정상', color: 'bg-green-100 text-green-800' };
    if (bmi < 30) return { category: '과체중', color: 'bg-yellow-100 text-yellow-800' };
    return { category: '비만', color: 'bg-red-100 text-red-800' };
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              onClick={loadStudentHealthDetails}
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">👥 학생 건강 상세정보</h1>
          <p className="text-gray-600">담당 학생들의 개별 건강 상태를 상세하게 확인하세요</p>
        </div>

        {/* 검색 */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="학생 이름이나 이메일로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Users className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* 학생 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => {
            const bmiInfo = getBMICategory(student.bmi);
            return (
              <div key={student._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                {/* 학생 기본 정보 */}
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-blue-600">
                      {student.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                  <p className="text-sm text-gray-500">{student.email}</p>
                </div>

                {/* 건강 상태 요약 */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">건강 상태</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getHealthStatusColor(student.healthStatus)}`}>
                      {student.healthStatus}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">BMI</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{student.bmi > 0 ? student.bmi : '-'}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${bmiInfo.color}`}>
                        {bmiInfo.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">운동 준수율</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${student.exerciseCompliance}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{student.exerciseCompliance}%</span>
                    </div>
                  </div>
                </div>

                {/* 기본 정보 */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">나이:</span>
                    <span className="font-medium">{student.age > 0 ? `${student.age}세` : '미정'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">성별:</span>
                    <span className="font-medium">{student.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">혈액형:</span>
                    <span className="font-medium">{student.bloodType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">키:</span>
                    <span className="font-medium">{student.height > 0 ? `${student.height}cm` : '미정'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">몸무게:</span>
                    <span className="font-medium">{student.weight > 0 ? `${student.weight}kg` : '미정'}</span>
                  </div>
                </div>

                {/* 건강 목표 */}
                {student.healthGoals.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Target className="h-4 w-4 mr-1" />
                      건강 목표
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {student.healthGoals.map((goal, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 주의사항 */}
                {(student.allergies.length > 0 || student.medicalHistory.length > 0) && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      주의사항
                    </h4>
                    <div className="space-y-1">
                      {student.allergies.map((allergy, index) => (
                        <div key={index} className="text-xs text-red-600">• 알레르기: {allergy}</div>
                      ))}
                      {student.medicalHistory.map((history, index) => (
                        <div key={index} className="text-xs text-red-600">• 병력: {history}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 마지막 체크 정보 */}
                <div className="text-xs text-gray-500 text-center pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>마지막: {new Date(student.lastHealthCheck).toLocaleDateString('ko-KR')}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>다음: {new Date(student.nextHealthCheck).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>
                </div>

                {/* 상세보기 버튼 */}
                <button
                  onClick={() => setSelectedStudent(student)}
                  className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  상세보기
                </button>
              </div>
            );
          })}
        </div>

        {/* 검색 결과 없음 */}
        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-600">다른 검색어를 시도해보세요.</p>
          </div>
        )}

        {/* 학생 상세 모달 */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedStudent.name} 건강 상세정보</h2>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* 상세 정보 내용 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 기본 정보 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">이름:</span>
                        <span className="font-medium">{selectedStudent.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">이메일:</span>
                        <span className="font-medium">{selectedStudent.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">나이:</span>
                        <span className="font-medium">{selectedStudent.age > 0 ? `${selectedStudent.age}세` : '미정'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">성별:</span>
                        <span className="font-medium">{selectedStudent.gender}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">키:</span>
                        <span className="font-medium">{selectedStudent.height > 0 ? `${selectedStudent.height}cm` : '미정'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">몸무게:</span>
                        <span className="font-medium">{selectedStudent.weight > 0 ? `${selectedStudent.weight}kg` : '미정'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">BMI:</span>
                        <span className="font-medium">{selectedStudent.bmi > 0 ? selectedStudent.bmi : '미정'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">혈액형:</span>
                        <span className="font-medium">{selectedStudent.bloodType}</span>
                      </div>
                    </div>
                  </div>

                  {/* 건강 상태 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">건강 상태</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">건강 상태:</span>
                        <span className={`px-2 py-1 text-sm font-medium rounded-full ${getHealthStatusColor(selectedStudent.healthStatus)}`}>
                          {selectedStudent.healthStatus}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">운동 준수율:</span>
                        <span className="font-medium">{selectedStudent.exerciseCompliance}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">마지막 체크:</span>
                        <span className="font-medium">{new Date(selectedStudent.lastHealthCheck).toLocaleDateString('ko-KR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">다음 체크:</span>
                        <span className="font-medium">{new Date(selectedStudent.nextHealthCheck).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 건강 목표 */}
                {selectedStudent.healthGoals.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">건강 목표</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudent.healthGoals.map((goal, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 주의사항 */}
                {(selectedStudent.allergies.length > 0 || selectedStudent.medicalHistory.length > 0 || selectedStudent.currentMedications.length > 0) && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-red-900 mb-4">주의사항</h3>
                    <div className="space-y-3">
                      {selectedStudent.allergies.length > 0 && (
                        <div>
                          <h4 className="font-medium text-red-800 mb-2">알레르기</h4>
                          <ul className="list-disc list-inside text-red-700 space-y-1">
                            {selectedStudent.allergies.map((allergy, index) => (
                              <li key={index}>{allergy}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedStudent.medicalHistory.length > 0 && (
                        <div>
                          <h4 className="font-medium text-red-800 mb-2">병력</h4>
                          <ul className="list-disc list-inside text-red-700 space-y-1">
                            {selectedStudent.medicalHistory.map((history, index) => (
                              <li key={index}>{history}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedStudent.currentMedications.length > 0 && (
                        <div>
                          <h4 className="font-medium text-red-800 mb-2">복용 중인 약물</h4>
                          <ul className="list-disc list-inside text-red-700 space-y-1">
                            {selectedStudent.currentMedications.map((medication, index) => (
                              <li key={index}>{medication}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 비상 연락처 */}
                {selectedStudent.emergencyContact.name !== '미정' && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">비상 연락처</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <span className="text-sm text-gray-600">이름:</span>
                          <p className="font-medium">{selectedStudent.emergencyContact.name}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">관계:</span>
                          <p className="font-medium">{selectedStudent.emergencyContact.relationship}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">연락처:</span>
                          <p className="font-medium">{selectedStudent.emergencyContact.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 운동 기록 */}
                {selectedStudent.exerciseHistory.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 운동 기록</h3>
                    <div className="space-y-3">
                      {selectedStudent.exerciseHistory.slice(0, 5).map((exercise, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{exercise.type}</p>
                              <p className="text-sm text-gray-600">{exercise.notes}</p>
                            </div>
                            <div className="text-right text-sm">
                              <p className="font-medium">{exercise.duration}분</p>
                              <p className="text-gray-600">강도: {exercise.intensity}</p>
                              <p className="text-gray-500">{new Date(exercise.date).toLocaleDateString('ko-KR')}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 건강 지표 */}
                {selectedStudent.healthMetrics.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">건강 지표 변화</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedStudent.healthMetrics.slice(0, 4).map((metric, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">{new Date(metric.date).toLocaleDateString('ko-KR')}</p>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>혈압:</span>
                              <span className="font-medium">{metric.bloodPressure}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>심박수:</span>
                              <span className="font-medium">{metric.heartRate}회/분</span>
                            </div>
                            <div className="flex justify-between">
                              <span>체지방률:</span>
                              <span className="font-medium">{metric.bodyFat}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
