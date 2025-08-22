'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  useEffect(() => {
    if (user) {
      loadExerciseData();
    }
  }, [user, selectedPeriod]);

  const loadExerciseData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/exercise/stats?days=${selectedPeriod}`);
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        setRecentSessions(data.recentSessions);
        setAiRecommendations(data.aiRecommendations);
      } else {
        setError('운동 데이터를 불러올 수 없습니다.');
      }
    } catch (error) {
      setError('서버 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
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
            <div className="text-3xl font-bold text-blue-600">{stats.totalSessions}</div>
            <div className="text-sm text-blue-700">총 운동 횟수</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-green-600">{formatDuration(stats.totalDuration)}</div>
            <div className="text-sm text-green-700">총 운동 시간</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.totalCalories}</div>
            <div className="text-sm text-purple-700">총 소모 칼로리</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-orange-600">{stats.averageIntensity}%</div>
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
              <div className="text-2xl font-bold text-gray-700">{stats.averagePoseScore.toFixed(1)}</div>
              <div className="text-sm text-gray-600">평균 자세 점수</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">{stats.bestIntensity}%</div>
              <div className="text-sm text-gray-600">최고 강도</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">{stats.bestPoseScore.toFixed(1)}</div>
              <div className="text-sm text-gray-600">최고 자세 점수</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">
                {stats.totalSessions > 0 ? Math.round(stats.totalDuration / stats.totalSessions) : 0}
              </div>
              <div className="text-sm text-gray-600">평균 운동 시간 (분)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

