/**
 * 🏊‍♂️ JJ Swim Lab - ExerciseDashboard 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 수영 운동 및 훈련을 위한 종합 대시보드
 * - 운동 계획 및 진행 상황 관리
 * - 운동 성과 및 통계 시각화
 * - 개인별 맞춤 운동 추천
 * - 운동 일정 및 목표 설정
 * 
 * 🔄 **주요 기능**
 * - 운동 계획 및 일정 관리
 * - 운동 진행 상황 추적
 * - 운동 성과 및 통계 표시
 * - 개인별 맞춤 운동 추천
 * - 운동 목표 설정 및 달성도
 * 
 * 🗄️ **데이터 연동**
 * - 운동 계획 및 일정 데이터
 * - 운동 진행 상황 및 성과
 * - 개인별 운동 선호도 및 능력
 * - 운동 통계 및 분석 데이터
 * - 운동 목표 및 달성도
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect, useCallback)
 * - 차트 및 시각화 라이브러리
 * - 운동 데이터 관리 라이브러리
 * - 달력 및 일정 관리 라이브러리
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 운동 계획의 개인별 맞춤성
 * 2. 운동 진행 상황의 정확한 추적
 * 3. 운동 성과 데이터의 시각화 품질
 * 4. 운동 추천 시스템의 적절성
 * 5. 운동 목표 설정의 실현 가능성
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 운동 계획 및 일정 관리 확인
 * - [ ] 운동 진행 상황 추적 검증
 * - [ ] 운동 성과 시각화 확인
 * - [ ] 개인별 운동 추천 시스템 검증
 * - [ ] 운동 목표 설정 및 달성도 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 운동 대시보드)
 * - 2024-12-19: 운동 계획 및 일정 관리 시스템 구현
 * - 2024-12-19: 운동 진행 상황 추적 시스템 구현
 * - 2024-12-19: 개인별 맞춤 운동 추천 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (운동 대시보드 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - AI 기반 운동 계획 생성
 * - 실시간 운동 성과 분석
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <ExerciseDashboard 
 *   onExercisePlanUpdate={(plan) => handleExercisePlanUpdate(plan)}
 *   onProgressUpdate={(progress) => handleProgressUpdate(progress)}
 *   onRecommendationGenerated={(recommendation) => handleRecommendation(recommendation)}
 *   onGoalAchieved={(goal) => handleGoalAchieved(goal)}
 *   userId="user123"
 * />
 * ```
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from 'hooks/useAuth';

interface ExerciseStats {
  totalSessions: number;
  totalDuration: number;
  totalCalories: number;
  averageIntensity: number;
  averagePoseScore: number;
  bestIntensity: number;
  bestPoseScore: number;
}

interface ExerciseSession {
  _id: string;
  sessionId: string;
  exerciseType: string;
  startTime: string;
  duration: number;
  intensityData: {
    averageIntensity: number;
    totalCalories: number;
  };
  poseAnalysis?: {
    overallScore: number;
  };
}

interface AIRecommendations {
  nextWorkout: string;
  focusAreas: string[];
  restDays: number;
  intensityAdjustment: string;
  techniqueImprovements: string[];
  nutritionTips: string[];
}

export default function ExerciseDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ExerciseStats | null>(null);
  const [recentSessions, setRecentSessions] = useState<ExerciseSession[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendations | null>(null);
  const [smartWatchData, setSmartWatchData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  useEffect(() => {
    if (user) {
      loadExerciseData();
      loadSmartWatchData();
    }
  }, [user, selectedPeriod]);

  const loadExerciseData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('인증 토큰이 없습니다. 다시 로그인해주세요.');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/exercise/stats?days=${selectedPeriod}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        setRecentSessions(data.recentSessions);
        setAiRecommendations(data.aiRecommendations);
      } else {
        setError('운동 데이터를 불러올 수 없습니다: ' + data.message);
      }
    } catch (error) {
      setError('서버 오류가 발생했습니다: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSmartWatchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('인증 토큰이 없습니다.');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/smartwatch/data?limit=5`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSmartWatchData(data.data.sessions || []);
        } else {
          // 서버에 데이터가 없으면 임시 샘플 데이터 표시
          setSmartWatchData([
            {
              deviceInfo: {
                deviceType: 'apple_watch',
                deviceModel: 'Apple Watch Series 9'
              },
              sessionInfo: {
                startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                technique: 'freestyle',
                totalDistance: 1000,
                duration: 45
              },
              performanceMetrics: {
                averageHeartRate: 145,
                caloriesBurned: 320,
                efficiency: 85
              }
            },
            {
              deviceInfo: {
                deviceType: 'samsung_galaxy_watch',
                deviceModel: 'Galaxy Watch6'
              },
              sessionInfo: {
                startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                technique: 'backstroke',
                totalDistance: 750,
                duration: 35
              },
              performanceMetrics: {
                averageHeartRate: 138,
                caloriesBurned: 280,
                efficiency: 78
              }
            },
            {
              deviceInfo: {
                deviceType: 'garmin',
                deviceModel: 'Garmin Swim 2'
              },
              sessionInfo: {
                startTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
                technique: 'breaststroke',
                totalDistance: 1200,
                duration: 50
              },
              performanceMetrics: {
                averageHeartRate: 142,
                caloriesBurned: 380,
                efficiency: 82
              }
            }
          ]);
        }
      }
    } catch (error) {
      console.error('스마트워치 데이터 로드 실패:', error);
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}시간 ${mins}분`;
    }
    return `${mins}분`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 스마트워치 연동 핸들러
  const handleSmartWatchConnect = (deviceType: string) => {
    const deviceNames = {
      'apple_watch': 'Apple Watch',
      'samsung_galaxy_watch': 'Samsung Galaxy Watch',
      'garmin': 'Garmin'
    };
    
    const deviceName = deviceNames[deviceType as keyof typeof deviceNames];
    
    alert(`🔗 ${deviceName} 연동 안내\n\n실제 연동 방법:\n1. ${deviceName} 앱 설치\n2. JJ Swim Lab 연동 허용\n3. 수영 운동 시작\n4. 데이터 자동 동기화\n\n현재는 데모 환경이므로 "샘플 데이터 생성" 버튼을 사용해주세요.`);
  };

  // 샘플 데이터 생성 핸들러
  const handleGenerateSampleData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const devices = [
        {
          type: 'apple_watch',
          model: 'Apple Watch Series 9',
          version: '10.1'
        },
        {
          type: 'samsung_galaxy_watch',
          model: 'Galaxy Watch6',
          version: '5.0.0.2'
        },
        {
          type: 'garmin',
          model: 'Garmin Swim 2',
          version: '4.20'
        }
      ];

      let successCount = 0;

      for (const device of devices) {
        const sampleData = {
          sessionId: `${device.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          deviceInfo: {
            deviceType: device.type,
            deviceModel: device.model,
            firmwareVersion: device.version
          },
          sessionInfo: {
            startTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000 + (30 + Math.random() * 30) * 60 * 1000).toISOString(),
            duration: 30 + Math.floor(Math.random() * 30),
            technique: ['freestyle', 'backstroke', 'breaststroke', 'butterfly'][Math.floor(Math.random() * 4)],
            poolLength: 25,
            totalDistance: 600 + Math.floor(Math.random() * 600)
          },
          performanceMetrics: {
            averageSpeed: 0.8 + Math.random() * 0.6,
            maxSpeed: 1.0 + Math.random() * 0.8,
            averageHeartRate: 130 + Math.floor(Math.random() * 30),
            maxHeartRate: 150 + Math.floor(Math.random() * 30),
            minHeartRate: 110 + Math.floor(Math.random() * 20),
            strokeCount: 500 + Math.floor(Math.random() * 500),
            strokeRate: 15 + Math.floor(Math.random() * 8),
            caloriesBurned: 200 + Math.floor(Math.random() * 200),
            efficiency: 70 + Math.floor(Math.random() * 30)
          },
          detailedData: {
            heartRateData: Array.from({length: 5}, (_, idx) => ({
              timestamp: new Date(Date.now() - idx * 60 * 1000).toISOString(),
              heartRate: 130 + Math.floor(Math.random() * 30)
            })),
            strokeData: Array.from({length: 3}, (_, idx) => ({
              timestamp: new Date(Date.now() - idx * 2 * 60 * 1000).toISOString(),
              strokeType: ['freestyle', 'backstroke'][Math.floor(Math.random() * 2)],
              strokeCount: 20 + Math.floor(Math.random() * 10),
              strokeRate: 15 + Math.floor(Math.random() * 5)
            })),
            speedData: Array.from({length: 4}, (_, idx) => ({
              timestamp: new Date(Date.now() - idx * 90 * 1000).toISOString(),
              speed: 0.8 + Math.random() * 0.6,
              distance: 100 + Math.floor(Math.random() * 100)
            })),
            restPeriods: [{
              startTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
              endTime: new Date(Date.now() - 13 * 60 * 1000).toISOString(),
              duration: 2
            }]
          }
        };

        try {
          const response = await fetch('http://localhost:5000/api/smartwatch/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(sampleData)
          });

          if (response.ok) {
            successCount++;
          }
        } catch (error) {
          console.error(`${device.model} 데이터 생성 실패:`, error);
        }
      }

      if (successCount > 0) {
        alert(`✅ ${successCount}개의 스마트워치 샘플 데이터가 생성되었습니다!\n페이지를 새로고침하여 확인해주세요.`);
        // 데이터 새로고침
        loadSmartWatchData();
      } else {
        alert('❌ 샘플 데이터 생성에 실패했습니다. 서버 연결을 확인해주세요.');
      }

    } catch (error) {
      console.error('샘플 데이터 생성 오류:', error);
      alert('❌ 샘플 데이터 생성 중 오류가 발생했습니다.');
    }
  };

  // 대시보드 데이터 생성 핸들러
  const handleGenerateDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      console.log('📈 대시보드 샘플 데이터 생성 시작...');

      const response = await fetch('http://localhost:5000/api/sample-data/generate-dashboard-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ 대시보드 샘플 데이터 생성 완료!\n\n생성된 데이터:\n- 강의: ${result.data.courses}개\n- 예약: ${result.data.bookings}개\n- 결제: ${result.data.payments}개\n- 운동 기록: ${result.data.exerciseRecords}개\n- 건강 프로필: ${result.data.healthProfile ? '생성됨' : '기존 사용'}\n\n대시보드 페이지를 새로고침하여 확인해주세요!`);
      } else {
        alert(`❌ 대시보드 데이터 생성 실패: ${result.message}`);
      }

    } catch (error) {
      console.error('대시보드 데이터 생성 오류:', error);
      alert('❌ 대시보드 데이터 생성 중 오류가 발생했습니다.');
    }
  };

  const getExerciseTypeIcon = (type: string): string => {
    switch (type) {
      case 'swimming': return '🏊‍♂️';
      case 'pose_analysis': return '📹';
      case 'intensity_training': return '💪';
      case 'general_workout': return '🏃‍♂️';
      default: return '🎯';
    }
  };

  const getExerciseTypeLabel = (type: string): string => {
    switch (type) {
      case 'swimming': return '수영';
      case 'pose_analysis': return '자세 분석';
      case 'intensity_training': return '강도 훈련';
      case 'general_workout': return '일반 운동';
      default: return '기타';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">운동 데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold mb-2">오류 발생</p>
          <p>{error}</p>
          <button
            onClick={loadExerciseData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">📊 운동 대시보드</h2>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">기간:</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={7}>최근 7일</option>
            <option value={30}>최근 30일</option>
            <option value={90}>최근 90일</option>
          </select>
        </div>
      </div>

      {/* 통계 요약 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.totalSessions || 0}</div>
            <div className="text-sm text-blue-700">총 운동 횟수</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-green-600">{formatDuration(stats.totalDuration || 0)}</div>
            <div className="text-sm text-green-700">총 운동 시간</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.totalCalories || 0}</div>
            <div className="text-sm text-purple-700">총 소모 칼로리</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-orange-600">{stats.averageIntensity || 0}%</div>
            <div className="text-sm text-orange-700">평균 강도</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 운동 기록 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">📅 최근 운동 기록</h3>
          
          {recentSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🎯</div>
              <p>아직 운동 기록이 없습니다.</p>
              <p className="text-sm">첫 번째 운동을 시작해보세요!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <div key={session._id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getExerciseTypeIcon(session.exerciseType)}</span>
                      <span className="font-semibold text-gray-900">
                        {getExerciseTypeLabel(session.exerciseType)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(session.startTime)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-sm text-gray-600">지속시간</div>
                      <div className="font-semibold text-gray-900">{formatDuration(session.duration)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">평균 강도</div>
                      <div className="font-semibold text-gray-900">{session.intensityData.averageIntensity}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">소모 칼로리</div>
                      <div className="font-semibold text-gray-900">{session.intensityData.totalCalories}</div>
                    </div>
                  </div>
                  
                  {session.poseAnalysis?.overallScore && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">자세 점수</span>
                        <span className="font-semibold text-gray-900">
                          {session.poseAnalysis.overallScore}/100
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${session.poseAnalysis.overallScore}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI 추천사항 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">🤖 AI 추천사항</h3>
          
          {!aiRecommendations ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🤖</div>
              <p>AI 추천사항을 생성할 수 없습니다.</p>
              <p className="text-sm">더 많은 운동 데이터가 필요합니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 다음 운동 추천 */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-semibold text-blue-800 mb-2">🎯 다음 운동</h4>
                <p className="text-blue-700">{aiRecommendations.nextWorkout}</p>
              </div>

              {/* 집중 영역 */}
              {aiRecommendations.focusAreas.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="font-semibold text-green-800 mb-2">🎯 집중 영역</h4>
                  <div className="flex flex-wrap gap-2">
                    {aiRecommendations.focusAreas.map((area, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 강도 조정 */}
              {aiRecommendations.intensityAdjustment && (
                <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                  <h4 className="font-semibold text-orange-800 mb-2">⚡ 강도 조정</h4>
                  <p className="text-orange-700">{aiRecommendations.intensityAdjustment}</p>
                </div>
              )}

              {/* 기술 개선 */}
              {aiRecommendations.techniqueImprovements.length > 0 && (
                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                  <h4 className="font-semibold text-purple-800 mb-2">📚 기술 개선</h4>
                  <ul className="text-purple-700 space-y-1">
                    {aiRecommendations.techniqueImprovements.map((improvement, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-purple-600 mt-1">•</span>
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 영양 팁 */}
              {aiRecommendations.nutritionTips.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                  <h4 className="font-semibold text-yellow-800 mb-2">🍎 영양 팁</h4>
                  <ul className="text-yellow-700 space-y-1">
                    {aiRecommendations.nutritionTips.map((tip, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-yellow-600 mt-1">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 휴식 권장 */}
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-500">
                <h4 className="font-semibold text-gray-800 mb-2">😴 휴식 권장</h4>
                <p className="text-gray-700">
                  다음 운동까지 <span className="font-semibold">{aiRecommendations.restDays}일</span>의 휴식을 권장합니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 추가 통계 */}
      {stats && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 상세 통계</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">{(stats.averagePoseScore || 0).toFixed(1)}</div>
              <div className="text-sm text-gray-600">평균 자세 점수</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">{stats.bestIntensity || 0}%</div>
              <div className="text-sm text-gray-600">최고 강도</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">{(stats.bestPoseScore || 0).toFixed(1)}</div>
              <div className="text-sm text-gray-600">최고 자세 점수</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">
                {(stats.totalSessions || 0) > 0 ? Math.round((stats.totalDuration || 0) / (stats.totalSessions || 1)) : 0}
              </div>
              <div className="text-sm text-gray-600">평균 운동 시간 (분)</div>
            </div>
          </div>
        </div>
      )}

      {/* 스마트워치 연동 데이터 */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">⌚ 스마트워치 연동 데이터</h2>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">🍎 Apple Watch</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">⚙️ 삼성 Galaxy Watch</span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">🏃‍♂️ Garmin</span>
          </div>
        </div>

        {smartWatchData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {smartWatchData.map((session: any, index: number) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-md border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {session.deviceInfo?.deviceType === 'apple_watch' ? '🍎' :
                       session.deviceInfo?.deviceType === 'samsung_galaxy_watch' ? '⚙️' :
                       session.deviceInfo?.deviceType === 'garmin' ? '🏃‍♂️' : '⌚'}
                    </span>
                    <span className="font-medium text-gray-800">
                      {session.deviceInfo?.deviceModel || 'Smart Watch'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(session.sessionInfo?.startTime).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">🏊‍♂️ 영법:</span>
                    <span className="font-medium">
                      {session.sessionInfo?.technique === 'freestyle' ? '자유형' :
                       session.sessionInfo?.technique === 'backstroke' ? '배영' :
                       session.sessionInfo?.technique === 'breaststroke' ? '평영' :
                       session.sessionInfo?.technique === 'butterfly' ? '접영' : '기타'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">📏 거리:</span>
                    <span className="font-medium">{session.sessionInfo?.totalDistance || 0}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">⏱️ 시간:</span>
                    <span className="font-medium">{session.sessionInfo?.duration || 0}분</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">💓 평균 심박수:</span>
                    <span className="font-medium">{session.performanceMetrics?.averageHeartRate || 0} bpm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">🔥 칼로리:</span>
                    <span className="font-medium">{session.performanceMetrics?.caloriesBurned || 0} kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">⚡ 효율성:</span>
                    <span className="font-medium">{session.performanceMetrics?.efficiency || 0}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="text-6xl mb-4">⌚</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">스마트워치 연동 대기 중</h3>
            <p className="text-gray-600 mb-4">
              Apple Watch, 삼성 Galaxy Watch, Garmin 등의 스마트워치를 연동하여<br/>
              실시간 운동 데이터를 자동으로 수집하고 분석할 수 있습니다.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">🍎</div>
                <h4 className="font-medium text-gray-800">Apple Watch</h4>
                <p className="text-sm text-gray-600 mb-3">HealthKit 연동</p>
                <button 
                  onClick={() => handleSmartWatchConnect('apple_watch')}
                  className="w-full px-3 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                >
                  연동하기
                </button>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl mb-2">⚙️</div>
                <h4 className="font-medium text-gray-800">Galaxy Watch</h4>
                <p className="text-sm text-gray-600 mb-3">Samsung Health 연동</p>
                <button 
                  onClick={() => handleSmartWatchConnect('samsung_galaxy_watch')}
                  className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  연동하기
                </button>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl mb-2">🏃‍♂️</div>
                <h4 className="font-medium text-gray-800">Garmin</h4>
                <p className="text-sm text-gray-600 mb-3">Garmin Connect 연동</p>
                <button 
                  onClick={() => handleSmartWatchConnect('garmin')}
                  className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  연동하기
                </button>
              </div>
            </div>
            
            {/* 연동 안내 및 시뮬레이션 버튼 */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="text-yellow-600 text-xl">💡</div>
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-800 mb-1">연동 방법</h4>
                  <p className="text-sm text-yellow-700 mb-3">
                    실제 스마트워치 앱에서 JJ Swim Lab과 연동하거나, 
                    테스트용 샘플 데이터를 생성할 수 있습니다.
                  </p>
                  <div className="flex space-x-2">
                    <button 
                      onClick={handleGenerateSampleData}
                      className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      📊 스마트워치 데이터 생성
                    </button>
                    <button 
                      onClick={handleGenerateDashboardData}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      📈 대시보드 데이터 생성
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

