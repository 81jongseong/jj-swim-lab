'use client';

import React, { useState } from 'react';
import { 
  Target, 
  Activity, 
  Clock,
  MapPin,
  Zap,
  Calculator,
  Info,
  Users,
  BookOpen
} from 'lucide-react';

export default function InstructorExerciseCalculatorPage() {
  // 운동량 계산 상태
  const [exerciseSettings, setExerciseSettings] = useState({
    duration: 45,
    intensity: 60,
    strokes: ['freestyle', 'backstroke'],
    grade: '3급',
    poolDistance: 25,
    studentAge: 30,
    studentLevel: 'intermediate'
  });
  const [calculatedPlan, setCalculatedPlan] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateExercisePlan = async () => {
    setIsCalculating(true);
    try {
      // 임시 계산 결과
      const mockPlan = {
        weekly_target_min: 180,
        weekly_target_distance: 2000,
        exercisePrescription: {
          averagePace: 120,
          intensity: 65
        },
        sessions: [
          { day: '월요일', totalDistance: 500, totalDuration: 45, stroke_plan: [{ stroke: 'freestyle', block: '200m 워밍업' }] },
          { day: '수요일', totalDistance: 600, totalDuration: 50, stroke_plan: [{ stroke: 'backstroke', block: '300m 메인' }] },
          { day: '금요일', totalDistance: 400, totalDuration: 40, stroke_plan: [{ stroke: 'freestyle', block: '200m 쿨다운' }] }
        ]
      };
      setCalculatedPlan(mockPlan);
    } catch (error) {
      console.error('운동량 계산 오류:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const getStrokeName = (strokeId: string) => {
    switch (strokeId) {
      case 'freestyle': return '자유형';
      case 'backstroke': return '배영';
      case 'breaststroke': return '평영';
      case 'butterfly': return '접영';
      case 'elementary_backstroke': return '기본배영';
      case 'sidestroke': return '사이드스트로크';
      default: return strokeId;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Calculator className="h-8 w-8 text-blue-500" />
              강사용 운동량 계산기
            </h1>
            <p className="text-gray-600">
              학생 맞춤형 수영 운동량을 계산하고 주간 프로그램을 생성하세요
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              가이드라인 보기
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              학생 관리
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 설정 입력 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-blue-500" />
              학생 운동 설정
            </h3>
            <p className="text-sm text-gray-600">
              학생의 조건에 맞는 운동 프로그램을 설정하세요
            </p>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium">학생 나이</label>
              <input 
                type="number" 
                min="5" 
                max="80" 
                value={exerciseSettings.studentAge}
                onChange={(e) => setExerciseSettings(prev => ({ ...prev, studentAge: parseInt(e.target.value) }))}
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="text-sm font-medium">학생 수영 실력</label>
              <select 
                value={exerciseSettings.studentLevel}
                onChange={(e) => setExerciseSettings(prev => ({ ...prev, studentLevel: e.target.value }))}
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="beginner">초급 (Beginner)</option>
                <option value="intermediate">중급 (Intermediate)</option>
                <option value="advanced">고급 (Advanced)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">운동 시간 (분)</label>
              <input 
                type="range" 
                min="20" 
                max="90" 
                value={exerciseSettings.duration}
                onChange={(e) => setExerciseSettings(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                className="w-full mt-1"
              />
              <div className="text-xs text-gray-500 mt-1">{exerciseSettings.duration}분</div>
            </div>

            <div>
              <label className="text-sm font-medium">운동 강도 (%)</label>
              <input 
                type="range" 
                min="40" 
                max="80" 
                value={exerciseSettings.intensity}
                onChange={(e) => setExerciseSettings(prev => ({ ...prev, intensity: parseInt(e.target.value) }))}
                className="w-full mt-1"
              />
              <div className="text-xs text-gray-500 mt-1">{exerciseSettings.intensity}%</div>
            </div>

            <div>
              <label className="text-sm font-medium">수영 급수</label>
              <select 
                value={exerciseSettings.grade}
                onChange={(e) => setExerciseSettings(prev => ({ ...prev, grade: e.target.value }))}
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1급">1급 (고급)</option>
                <option value="2급">2급 (중급)</option>
                <option value="3급">3급 (초급)</option>
                <option value="4급">4급 (입문)</option>
                <option value="5급">5급 (기초)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">수영장 거리</label>
              <select 
                value={exerciseSettings.poolDistance}
                onChange={(e) => setExerciseSettings(prev => ({ ...prev, poolDistance: parseInt(e.target.value) }))}
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={25}>25m (일반 수영장)</option>
                <option value={50}>50m (올림픽 규격)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">지도할 영법</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {['freestyle', 'backstroke', 'breaststroke', 'butterfly', 'elementary_backstroke', 'sidestroke'].map(stroke => (
                  <label key={stroke} className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={exerciseSettings.strokes.includes(stroke)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setExerciseSettings(prev => ({ 
                            ...prev, 
                            strokes: [...prev.strokes, stroke] 
                          }));
                        } else {
                          setExerciseSettings(prev => ({ 
                            ...prev, 
                            strokes: prev.strokes.filter(s => s !== stroke) 
                          }));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">
                      {getStrokeName(stroke)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button 
              onClick={calculateExercisePlan} 
              disabled={isCalculating || exerciseSettings.strokes.length === 0}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Calculator className="h-4 w-4 mr-2" />
              {isCalculating ? '계산 중...' : '학생 맞춤 운동량 계산하기'}
            </button>
          </div>
        </div>

        {/* 계산 결과 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-green-500" />
              계산 결과
            </h3>
            <p className="text-sm text-gray-600">
              학생 맞춤 운동 프로그램
            </p>
          </div>
          
          {calculatedPlan ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{calculatedPlan.weekly_target_min}분</div>
                  <div className="text-xs text-gray-600">주간 목표 시간</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{calculatedPlan.weekly_target_distance}m</div>
                  <div className="text-xs text-gray-600">주간 목표 거리</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">{calculatedPlan.exercisePrescription.averagePace}초/100m</div>
                  <div className="text-xs text-gray-600">평균 페이스</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">{calculatedPlan.exercisePrescription.intensity}%</div>
                  <div className="text-xs text-gray-600">운동 강도</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">주간 세션 계획</h4>
                <div className="space-y-2">
                  {calculatedPlan.sessions.map((session: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{session.day}</span>
                        <div className="flex gap-2">
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">{session.totalDistance}m</span>
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">{session.totalDuration}분</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {session.stroke_plan.slice(0, 2).map((block: any, blockIndex: number) => (
                          <div key={blockIndex} className="flex items-center gap-2">
                            <span className="text-xs">{getStrokeName(block.stroke)}</span>
                            <span className="text-xs text-gray-500">{block.block}</span>
                          </div>
                        ))}
                        {session.stroke_plan.length > 2 && (
                          <div className="text-xs text-gray-500">
                            외 {session.stroke_plan.length - 2}개 영법
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">강사 지도 포인트</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• 학생의 체력과 기술 수준에 맞는 점진적 증가</div>
                  <div>• 각 영법별 기술 지도 및 자세 교정</div>
                  <div>• 안전한 운동 강도 유지 및 모니터링</div>
                  <div>• 학생의 피드백을 통한 프로그램 조정</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calculator className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>학생 정보를 입력하고 계산하기 버튼을 클릭하세요.</p>
            </div>
          )}
        </div>
      </div>

      {/* 강사 가이드 */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            강사 지도 가이드
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">학생 맞춤 지도</h4>
            <p className="text-sm text-blue-600">학생의 나이, 실력, 목표에 맞는 개별화된 운동 프로그램을 제공하세요.</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">안전 우선</h4>
            <p className="text-sm text-green-600">학생의 체력과 기술 수준을 고려하여 안전한 운동 강도를 유지하세요.</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-2">점진적 발전</h4>
            <p className="text-sm text-purple-600">학생의 발전에 따라 운동량과 강도를 점진적으로 조정하세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
}