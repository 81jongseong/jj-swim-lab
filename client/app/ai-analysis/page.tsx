/**
 * 🤖 JJ Swim Lab - AI 분석 페이지
 *
 * =============================================================================
 * 📋 **의존성 파일들**
 * =============================================================================
 * 🔗 **직접 의존성**:
 *   - ../../hooks/useAuth.tsx (인증 상태 관리)
 *   - ../../components/AIDashboard.tsx (AI 대시보드 컴포넌트)
 *   - ../../components/ui/Card.tsx (카드 UI 컴포넌트)
 *   - ../../components/ui/Button.tsx (버튼 UI 컴포넌트)
 *   - ../../components/ui/Badge.tsx (배지 UI 컴포넌트)
 *   - lucide-react (아이콘 라이브러리)
 * 
 * 🔗 **연동되는 서버 API**:
 *   - /api/ai-analysis (AI 분석 데이터 조회)
 *   - /api/ai-config (AI 설정 관리)
 *   - /api/ai-evaluation (AI 평가 데이터)
 * 
 * 🔗 **데이터베이스 연동**:
 *   - AIAnalysis 컬렉션 (AI 분석 결과)
 *   - AIConfig 컬렉션 (AI 설정 정보)
 *   - User 컬렉션 (사용자 정보)
 *
 * =============================================================================
 * 🔄 **현재 구현된 기능들**
 * =============================================================================
 * ✅ **완전 구현**:
 *   - AI 분석 대시보드 표시
 *   - 실시간 AI 분석 데이터 조회
 *   - AI 설정 관리 인터페이스
 *   - 사용자별 AI 분석 결과 표시
 * 
 * ✅ **부분 구현**:
 *   - AI 분석 차트 및 그래프
 *   - AI 추천 시스템
 * 
 * ❌ **미구현**:
 *   - AI 모델 학습 관리
 *   - AI 분석 리포트 생성
 *   - AI 성능 모니터링
 *
 * =============================================================================
 * ⚠️ **중요한 주의사항**
 * =============================================================================
 * 🚨 **권한 체크**: 모든 사용자 타입 접근 가능 (권한별 다른 데이터 표시)
 * 🚨 **실시간 데이터**: AI 분석 결과는 실시간으로 업데이트
 * 🚨 **성능 최적화**: 대용량 AI 데이터 처리를 위한 최적화 필요
 * 🚨 **사용자 경험**: AI 분석 결과를 직관적으로 표시
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-13: 초기 AI 분석 페이지 구현
 * - 2025-01-13: AI 대시보드 컴포넌트 연동
 * - 2025-01-13: 실시간 데이터 조회 기능 추가
 * - 2025-01-13: 사용자별 맞춤형 AI 분석 표시 기능 추가
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import AIDashboard from '../../components/AIDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui';
import { Badge } from '../../components/ui';
import { 
  Brain, 
  Users, 
  TrendingUp, 
  Target,
  BarChart3,
  Lightbulb,
  Plus,
  Search
} from 'lucide-react';

interface Student {
  _id: string;
  name: string;
  email: string;
  userType: string;
  studentInfo?: {
    level: string;
    assignedInstructor?: string;
  };
}

export default function AIAnalysisPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user && (user.userType === 'instructor' || user.userType === 'centerAdmin')) {
      loadStudents();
    }
  }, [user]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users?userType=student&limit=100', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // API 응답 구조: { users: [...], pagination: {...} }
        setStudents(data.users || []);
      }
    } catch (error) {
      console.error('학생 목록 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLevelColor = (level: string) => {
    switch (level) {
      case '초급': return 'bg-green-100 text-green-800';
      case '초급+': return 'bg-blue-100 text-blue-800';
      case '중급': return 'bg-yellow-100 text-yellow-800';
      case '고급': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || (user.userType !== 'instructor' && user.userType !== 'centerAdmin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">접근 권한이 없습니다</h2>
          <p className="text-gray-600">AI 분석 기능은 강사 또는 센터 관리자만 사용할 수 있습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Brain className="w-8 h-8 mr-3 text-blue-600" />
                AI 수영 분석
              </h1>
              <p className="mt-2 text-gray-600">
                AI 기반 수영 자세 분석, 진도 예측, 개인화 추천을 제공합니다
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-sm">
                <Brain className="w-4 h-4 mr-1" />
                내장 AI 시스템
              </Badge>
            </div>
          </div>
        </div>

        {!selectedStudent ? (
          /* 학생 선택 화면 */
          <div className="space-y-6">
            {/* 검색 및 필터 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  학생 선택
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="학생 이름 또는 이메일로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-32 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStudents.map((student) => (
                      <div
                        key={student._id}
                        onClick={() => setSelectedStudent(student)}
                        className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer bg-white"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-gray-900">{student.name}</h3>
                          <Badge className={getLevelColor(student.studentInfo?.level || '미설정')}>
                            {student.studentInfo?.level || '미설정'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{student.email}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            강사: {student.studentInfo?.assignedInstructor || '미배정'}
                          </span>
                          <Button size="sm" variant="outline">
                            <Brain className="w-4 h-4 mr-1" />
                            분석 시작
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {filteredStudents.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {searchTerm ? '검색 결과가 없습니다.' : '등록된 학생이 없습니다.'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI 기능 소개 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">자세 분석</h3>
                  <p className="text-sm text-gray-600">
                    체크리스트 데이터를 기반으로 수영 자세를 분석하고 개선점을 제시합니다
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">진도 예측</h3>
                  <p className="text-sm text-gray-600">
                    학습 패턴을 분석하여 다음 레벨 도달 예상 시기를 예측합니다
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Lightbulb className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">개인화 추천</h3>
                  <p className="text-sm text-gray-600">
                    학습자의 약점을 분석하여 맞춤형 운동과 학습법을 추천합니다
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <BarChart3 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">성과 분석</h3>
                  <p className="text-sm text-gray-600">
                    전체적인 학습 성과를 분석하고 개선 방향을 제시합니다
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* AI 대시보드 화면 */
          <div className="space-y-6">
            {/* 학생 정보 헤더 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{selectedStudent.name}</h2>
                      <p className="text-gray-600">{selectedStudent.email}</p>
                      <Badge className={getLevelColor(selectedStudent.studentInfo?.level || '미설정')}>
                        {selectedStudent.studentInfo?.level || '미설정'}
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setSelectedStudent(null)}
                    variant="outline"
                  >
                    다른 학생 선택
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI 대시보드 */}
            <AIDashboard 
              studentId={selectedStudent._id}
              instructorId={user._id}
            />
          </div>
        )}
      </div>
    </div>
  );
}