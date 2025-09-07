'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { 
  Brain, 
  Users, 
  Target,
  TrendingUp,
  Clock,
  Heart,
  Zap,
  Award,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';

interface Student {
  _id: string;
  name: string;
  email: string;
  studentInfo: {
    swimmingLevel: string;
    age: number;
  };
}

interface EvaluationInput {
  studentId: string;
  technique: string;
  performanceMetrics: {
    speed?: number;
    endurance?: number;
    strokeCount?: number;
    heartRate?: number;
    distance?: number;
  };
  instructorObservations: {
    posture: number;
    breathing: number;
    movement: number;
    efficiency: number;
  };
}

export default function AIEvaluationPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [evaluationInput, setEvaluationInput] = useState<EvaluationInput>({
    studentId: '',
    technique: 'freestyle',
    performanceMetrics: {
      speed: 0,
      endurance: 0,
      strokeCount: 0,
      heartRate: 0,
      distance: 0
    },
    instructorObservations: {
      posture: 5,
      breathing: 5,
      movement: 5,
      efficiency: 5
    }
  });
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (user) {
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
        setStudents(data.users || []);
      }
    } catch (error) {
      console.error('학생 목록 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setEvaluationInput(prev => ({
      ...prev,
      studentId: student._id
    }));
    setShowResult(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setEvaluationInput(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setEvaluationInput(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as any),
        [field]: value
      }
    }));
  };

  const handleEvaluation = async () => {
    if (!selectedStudent || !evaluationInput.technique) {
      alert('학생과 수영 기법을 모두 선택해주세요.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/ai/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          studentId: selectedStudent._id,
          technique: evaluationInput.technique,
          level: 'beginner', // 기본값으로 설정
          performanceMetrics: evaluationInput.performanceMetrics,
          instructorObservations: evaluationInput.instructorObservations
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setEvaluationResult(data.data);
        setShowResult(true);
        
        // 성공 메시지 표시
        alert('AI 평가가 완료되었습니다! 자체 데이터베이스 기반 분석 결과를 확인하세요.');
      } else {
        alert('AI 평가 중 오류가 발생했습니다: ' + data.message);
      }
    } catch (error) {
      console.error('AI 평가 오류:', error);
      alert('AI 평가 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-red-100 text-red-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-blue-100 text-blue-800';
      case 'expert': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">AI 수영 평가 시스템</h1>
          </div>
          <p className="text-gray-600">
            종합적인 AI 분석을 통한 개인화된 수영 평가 및 운동량 추천
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 학생 선택 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                학생 선택
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {students.map((student) => (
                  <div
                    key={student._id}
                    onClick={() => handleStudentSelect(student)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedStudent?._id === student._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{student.name}</h3>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                      <Badge className={getLevelColor(student.studentInfo.swimmingLevel)}>
                        {student.studentInfo.swimmingLevel}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 평가 입력 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                평가 입력
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedStudent && (
                <>
                  {/* 수영 기법 선택 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      수영 기법
                    </label>
                    <select
                      value={evaluationInput.technique}
                      onChange={(e) => handleInputChange('technique', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="freestyle">자유형</option>
                      <option value="backstroke">배영</option>
                      <option value="breaststroke">평영</option>
                      <option value="butterfly">접영</option>
                    </select>
                  </div>

                  {/* 성과 지표 */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">성과 지표</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          속도 (m/s)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={evaluationInput.performanceMetrics.speed || ''}
                          onChange={(e) => handleNestedInputChange('performanceMetrics', 'speed', parseFloat(e.target.value) || 0)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          지구력 (분)
                        </label>
                        <input
                          type="number"
                          value={evaluationInput.performanceMetrics.endurance || ''}
                          onChange={(e) => handleNestedInputChange('performanceMetrics', 'endurance', parseInt(e.target.value) || 0)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          스트로크 수
                        </label>
                        <input
                          type="number"
                          value={evaluationInput.performanceMetrics.strokeCount || ''}
                          onChange={(e) => handleNestedInputChange('performanceMetrics', 'strokeCount', parseInt(e.target.value) || 0)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          심박수 (bpm)
                        </label>
                        <input
                          type="number"
                          value={evaluationInput.performanceMetrics.heartRate || ''}
                          onChange={(e) => handleNestedInputChange('performanceMetrics', 'heartRate', parseInt(e.target.value) || 0)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 강사 관찰 점수 */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">강사 관찰 점수 (1-10)</h3>
                    <div className="space-y-3">
                      {Object.entries(evaluationInput.instructorObservations).map(([key, value]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {key === 'posture' ? '자세' : 
                             key === 'breathing' ? '호흡' :
                             key === 'movement' ? '동작' : '효율성'}
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={value}
                            onChange={(e) => handleNestedInputChange('instructorObservations', key, parseInt(e.target.value))}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>1</span>
                            <span className="font-medium">{value}</span>
                            <span>10</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleEvaluation}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'AI 분석 중...' : 'AI 평가 시작'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* 평가 결과 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                평가 결과
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showResult && evaluationResult ? (
                <div className="space-y-4">
                  {/* 전체 점수 */}
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className={`text-3xl font-bold ${getScoreColor(evaluationResult.overallScore)}`}>
                      {evaluationResult.overallScore}점
                    </div>
                    <p className="text-sm text-gray-600">종합 점수</p>
                  </div>

                  {/* 카테고리별 점수 */}
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(evaluationResult.categoryScores).map(([category, score]) => (
                      <div key={category} className="text-center p-3 bg-white rounded-lg border">
                        <div className={`text-lg font-semibold ${getScoreColor(score as number)}`}>
                          {score as number}점
                        </div>
                        <p className="text-xs text-gray-600">
                          {category === 'posture' ? '자세' :
                           category === 'breathing' ? '호흡' :
                           category === 'movement' ? '동작' : '효율성'}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* 운동량 추천 */}
                  {evaluationResult.exerciseRecommendation && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">추천 운동량</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span>총 운동시간: {evaluationResult.exerciseRecommendation.totalDuration}분</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-blue-600" />
                          <span>세트 수: {evaluationResult.exerciseRecommendation.mainTraining?.sets}세트</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-blue-600" />
                          <span>강도: {evaluationResult.exerciseRecommendation.mainTraining?.intensity}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 피드백 */}
                  {evaluationResult.detailedFeedback && (
                    <div className="space-y-3">
                      {evaluationResult.detailedFeedback.strengths && (
                        <div>
                          <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            강점
                          </h4>
                          <ul className="text-sm text-green-700 space-y-1">
                            {evaluationResult.detailedFeedback.strengths.map((strength: string, index: number) => (
                              <li key={index}>• {strength}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {evaluationResult.detailedFeedback.improvements && (
                        <div>
                          <h4 className="font-medium text-orange-900 mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            개선점
                          </h4>
                          <ul className="text-sm text-orange-700 space-y-1">
                            {evaluationResult.detailedFeedback.improvements.map((improvement: string, index: number) => (
                              <li key={index}>• {improvement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>학생을 선택하고 평가를 시작하세요</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

