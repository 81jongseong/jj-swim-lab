/**
 * 🤖 개인별 운동 루틴 추천 페이지
 * 
 * 📋 **페이지 목적**
 * - AI 기반 개인 맞춤형 운동 루틴 추천
 * - 사용자 패턴 분석 및 맞춤 루틴 생성
 * 
 * 🔄 **연동되는 데이터**
 * - /api/ai-routine-recommendations/analyze/:userId (패턴 분석)
 * - /api/ai-routine-recommendations/generate/:userId (루틴 추천)
 * - /api/ai-routine-recommendations/generate-options/:userId (여러 옵션)
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import withAuth from '@/components/withAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { 
  Loader2, 
  Sparkles, 
  Calendar, 
  Clock, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Droplets
} from 'lucide-react';
import apiClient from '@/utils/api';
import { generateTimeBasedProgram } from '@/lib/swimlab/engine-v35-time-based';

interface UserPattern {
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'flexible';
  averageSessionDuration: number;
  preferredDaysOfWeek: number[];
  completionRate: number;
  intensityPreference: 'low' | 'moderate' | 'high' | 'varied';
  strokePreference: string[];
  consistencyScore: number;
  improvementTrend: 'improving' | 'stable' | 'declining';
  weeklyFrequency: number;
}

interface RoutineRecommendation {
  routineId: string;
  routineName: string;
  description: string;
  weeklySchedule: {
    dayOfWeek: number;
    recommendedTime: string;
    sessionDuration: number;
    intensity: 'low' | 'moderate' | 'high';
    focusArea: string;
    strokes: string[];
    program?: any; // 수영엔진으로 생성된 실제 프로그램 (DayPlan)
  }[];
  totalWeeklyDuration: number;
  totalWeeklyDistance: number;
  expectedCompletionRate: number;
  suitabilityScore: number;
  reasoning: string[];
  goals: string[];
  adaptations: {
    ifLowCompletion: string;
    ifHighCompletion: string;
    ifInjury: string;
    ifTimeLimited: string;
  };
  createdAt: Date;
}

const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

function RoutineRecommendationPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [pattern, setPattern] = useState<UserPattern | null>(null);
  const [recommendation, setRecommendation] = useState<RoutineRecommendation | null>(null);
  const [options, setOptions] = useState<RoutineRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    if (user?._id || user?.id) {
      analyzePattern();
    }
  }, [user]);

  const analyzePattern = async () => {
    if (!user?._id && !user?.id) return;

    try {
      setAnalyzing(true);
      setError(null);
      const userId = user._id || user.id;
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:5000/api/ai-routine-recommendations/analyze/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setPattern(data.data);
        }
      } else {
        setError('패턴 분석에 실패했습니다.');
      }
    } catch (error) {
      console.error('패턴 분석 실패:', error);
      setError('패턴 분석 중 오류가 발생했습니다.');
    } finally {
      setAnalyzing(false);
    }
  };

  const generateRecommendation = async (generateOptions = false) => {
    if (!user?._id && !user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const userId = user._id || user.id;
      const token = localStorage.getItem('token');

      if (generateOptions) {
        const response = await fetch(`http://localhost:5000/api/ai-routine-recommendations/generate-options/${userId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ count: 3 })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            // 수영엔진으로 각 세션별 실제 프로그램 생성
            const optionsWithPrograms = await Promise.all(
              data.data.map((option: RoutineRecommendation) => enhanceWithSwimEngine(option))
            );
            setOptions(optionsWithPrograms);
            setShowOptions(true);
          }
        } else {
          setError('루틴 옵션 생성에 실패했습니다.');
        }
      } else {
        const response = await fetch(`http://localhost:5000/api/ai-routine-recommendations/generate/${userId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ goals: [] })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            // 수영엔진으로 각 세션별 실제 프로그램 생성
            const recommendationWithPrograms = await enhanceWithSwimEngine(data.data);
            setRecommendation(recommendationWithPrograms);
            setShowOptions(false);
          }
        } else {
          setError('루틴 추천 생성에 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('루틴 추천 생성 실패:', error);
      setError('루틴 추천 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 수영엔진으로 각 세션별 실제 프로그램 생성
  const enhanceWithSwimEngine = async (recommendation: RoutineRecommendation): Promise<RoutineRecommendation> => {
    if (!user) return recommendation;

    // 사용자 정보에서 CSS 및 수영 프로필 가져오기
    const userProfile = user as any;
    const studentInfo = userProfile.studentInfo || {};
    const swimmingProfile = studentInfo.swimmingProfile || {};
    const healthProfile = studentInfo.healthProfile || {};

    // CSS 데이터 추출
    const css = swimmingProfile.css || {};
    const css100: Record<string, number> = {};
    if (css.freestyle && css.freestyle > 0) css100.freestyle = css.freestyle;
    if (css.backstroke && css.backstroke > 0) css100.backstroke = css.backstroke;
    if (css.breaststroke && css.breaststroke > 0) css100.breaststroke = css.breaststroke;
    if (css.butterfly && css.butterfly > 0) css100.butterfly = css.butterfly;

    // CSS가 없으면 레벨 기반 추정
    if (Object.keys(css100).length === 0) {
      const level = studentInfo.currentLevel || studentInfo.swimmingLevel || 'beginner_1';
      const estimatedCSS: Record<string, Record<string, number>> = {
        beginner_1: { freestyle: 150, backstroke: 165, breaststroke: 180, butterfly: 165 },
        beginner_2: { freestyle: 130, backstroke: 143, breaststroke: 156, butterfly: 143 },
        intermediate_1: { freestyle: 110, backstroke: 121, breaststroke: 132, butterfly: 121 },
        intermediate_2: { freestyle: 100, backstroke: 110, breaststroke: 120, butterfly: 110 },
        advanced_1: { freestyle: 85, backstroke: 93, breaststroke: 102, butterfly: 93 },
        advanced_2: { freestyle: 80, backstroke: 88, breaststroke: 96, butterfly: 88 }
      };
      Object.assign(css100, estimatedCSS[level as keyof typeof estimatedCSS] || estimatedCSS.beginner_1);
    }

    // 수영 프로필 정보
    const poolLength = swimmingProfile.poolLength || 25;
    const level = studentInfo.currentLevel || studentInfo.swimmingLevel || 'beginner_1';
    const mainStrokes = swimmingProfile.mainStrokes || ['freestyle'];
    const excludedStrokes = swimmingProfile.excludedStrokes || [];
    const conditionIds = swimmingProfile.conditionIds || healthProfile.chronicConditions || [];
    const goal = swimmingProfile.currentGoal || recommendation.goals[0] || '체력 향상';

    // 강도 퍼센트 계산 (intensity 기반)
    const intensityMap: Record<string, number> = {
      low: 0.6,
      moderate: 0.75,
      high: 0.9
    };

    // 각 세션별 수영엔진으로 프로그램 생성
    const enhancedSchedule = await Promise.all(
      recommendation.weeklySchedule.map(async (schedule) => {
        try {
          const intensityPercent = intensityMap[schedule.intensity] || 0.75;
          
          // 수영엔진 호출
          const program = generateTimeBasedProgram({
            targetMinutes: schedule.sessionDuration,
            css100: css100,
            poolLen: poolLength,
            goal: goal,
            level: level,
            strokesAllowed: (schedule.strokes.length > 0 ? schedule.strokes : mainStrokes) as any,
            strokesAvoid: excludedStrokes as any,
            conditionIds: conditionIds as any,
            dayCondition: 'normal',
            hasPain: false,
            weeklyFrequency: recommendation.weeklySchedule.length,
            intensityPercent: intensityPercent,
            cssMeasurementPoolLength: 25
          });

          return {
            ...schedule,
            program: program // 수영엔진으로 생성된 실제 프로그램
          };
        } catch (error) {
          console.error(`세션 ${schedule.dayOfWeek} 프로그램 생성 실패:`, error);
          return schedule; // 오류 시 원본 유지
        }
      })
    );

    // 총 거리 재계산 (수영엔진 결과 기반)
    const totalWeeklyDistance = enhancedSchedule.reduce((sum, s) => {
      return sum + (s.program?.totalMeters || 0);
    }, 0);

    return {
      ...recommendation,
      weeklySchedule: enhancedSchedule,
      totalWeeklyDistance // 수영엔진 결과로 업데이트
    };
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIntensityLabel = (intensity: string) => {
    switch (intensity) {
      case 'low': return '낮음';
      case 'moderate': return '보통';
      case 'high': return '높음';
      default: return intensity;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-indigo-600" />
            AI 기반 개인별 운동 루틴 추천
          </h1>
          <p className="mt-2 text-gray-600">
            당신의 운동 패턴을 분석하여 맞춤형 주간 수영 루틴을 추천해드립니다.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {/* 패턴 분석 섹션 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>운동 패턴 분석</CardTitle>
                <CardDescription>당신의 운동 습관을 분석한 결과입니다.</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={analyzePattern}
                disabled={analyzing}
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    분석 중...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    다시 분석
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {analyzing ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : pattern ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600">선호 시간대</div>
                  <div className="text-lg font-semibold text-gray-900 mt-1">
                    {pattern.preferredTimeOfDay === 'morning' ? '🌅 오전' :
                     pattern.preferredTimeOfDay === 'afternoon' ? '☀️ 오후' :
                     pattern.preferredTimeOfDay === 'evening' ? '🌙 저녁' : '🕐 유연'}
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600">평균 세션 시간</div>
                  <div className="text-lg font-semibold text-gray-900 mt-1">
                    {pattern.averageSessionDuration}분
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-gray-600">주당 빈도</div>
                  <div className="text-lg font-semibold text-gray-900 mt-1">
                    {pattern.weeklyFrequency}회
                  </div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="text-sm text-gray-600">완료율</div>
                  <div className="text-lg font-semibold text-gray-900 mt-1">
                    {pattern.completionRate}%
                  </div>
                </div>
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <div className="text-sm text-gray-600">일관성 점수</div>
                  <div className="text-lg font-semibold text-gray-900 mt-1">
                    {pattern.consistencyScore}/100
                  </div>
                </div>
                <div className="p-4 bg-pink-50 rounded-lg">
                  <div className="text-sm text-gray-600">향상 추세</div>
                  <div className="text-lg font-semibold text-gray-900 mt-1">
                    {pattern.improvementTrend === 'improving' ? '📈 향상 중' :
                     pattern.improvementTrend === 'stable' ? '➡️ 안정' : '📉 하락'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                패턴 분석을 시작하려면 "다시 분석" 버튼을 클릭하세요.
              </div>
            )}
          </CardContent>
        </Card>

        {/* 루틴 추천 생성 버튼 */}
        {pattern && (
          <div className="mb-6 flex gap-4">
            <Button
              onClick={() => generateRecommendation(false)}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  맞춤 루틴 추천받기
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => generateRecommendation(true)}
              disabled={loading}
            >
              여러 옵션 보기
            </Button>
          </div>
        )}

        {/* 추천 루틴 표시 */}
        {recommendation && !showOptions && (
          <Card>
            <CardHeader>
              <CardTitle>{recommendation.routineName}</CardTitle>
              <CardDescription>{recommendation.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <Badge className="bg-indigo-100 text-indigo-800">
                    적합성: {recommendation.suitabilityScore}/100
                  </Badge>
                  <Badge className="bg-green-100 text-green-800">
                    예상 완료율: {recommendation.expectedCompletionRate}%
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800">
                    주간 총 시간: {recommendation.totalWeeklyDuration}분
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-800">
                    주간 총 거리: {recommendation.totalWeeklyDistance}m
                  </Badge>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">주간 스케줄</h3>
                  <div className="space-y-3">
                    {recommendation.weeklySchedule.map((schedule, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-600" />
                            <span className="font-semibold">
                              {dayNames[schedule.dayOfWeek]}요일
                            </span>
                            <span className="text-sm text-gray-500">
                              {schedule.recommendedTime}
                            </span>
                          </div>
                          <Badge className={getIntensityColor(schedule.intensity)}>
                            {getIntensityLabel(schedule.intensity)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{schedule.sessionDuration}분</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{schedule.focusArea}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">영법: {schedule.strokes.join(', ')}</span>
                          </div>
                          {schedule.program && (
                            <div className="flex items-center gap-2">
                              <Droplets className="w-4 h-4 text-blue-400" />
                              <span className="text-sm text-blue-600">
                                {schedule.program.totalMeters}m
                              </span>
                            </div>
                          )}
                        </div>
                        {/* 수영엔진으로 생성된 실제 프로그램 세트 표시 */}
                        {schedule.program && schedule.program.sets && schedule.program.sets.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="text-xs font-semibold text-gray-700 mb-2">세트 구성:</div>
                            <div className="space-y-2">
                              {schedule.program.sets.slice(0, 5).map((set: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                                  <Badge className="bg-blue-100 text-blue-800 text-[10px]">
                                    {set.subtype || set.type || 'SET'}
                                  </Badge>
                                  <span className="flex-1">{set.desc || set.description}</span>
                                  {set.meters && (
                                    <span className="text-gray-500">{set.meters}m</span>
                                  )}
                                  {set.restSec && set.restSec > 0 && (
                                    <span className="text-gray-500">휴식 {set.restSec}초</span>
                                  )}
                                </div>
                              ))}
                              {schedule.program.sets.length > 5 && (
                                <div className="text-xs text-gray-500">
                                  외 {schedule.program.sets.length - 5}개 세트...
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">추천 이유</h3>
                  <ul className="space-y-2">
                    {recommendation.reasoning.map((reason, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">적응 방안</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <div className="text-sm font-semibold text-yellow-900 mb-1">완료율이 낮을 때</div>
                      <div className="text-sm text-yellow-800">{recommendation.adaptations.ifLowCompletion}</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-sm font-semibold text-green-900 mb-1">완료율이 높을 때</div>
                      <div className="text-sm text-green-800">{recommendation.adaptations.ifHighCompletion}</div>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="text-sm font-semibold text-red-900 mb-1">부상 시</div>
                      <div className="text-sm text-red-800">{recommendation.adaptations.ifInjury}</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-semibold text-blue-900 mb-1">시간이 부족할 때</div>
                      <div className="text-sm text-blue-800">{recommendation.adaptations.ifTimeLimited}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 여러 옵션 표시 */}
        {showOptions && options.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">추천 루틴 옵션</h2>
            {options.map((option, index) => (
              <Card key={option.routineId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{option.routineName}</CardTitle>
                    <Badge className="bg-indigo-100 text-indigo-800">
                      적합성: {option.suitabilityScore}/100
                    </Badge>
                  </div>
                  <CardDescription>{option.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600">주간 총 시간</div>
                      <div className="text-lg font-semibold">{option.totalWeeklyDuration}분</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">주간 총 거리</div>
                      <div className="text-lg font-semibold">{option.totalWeeklyDistance}m</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">예상 완료율</div>
                      <div className="text-lg font-semibold">{option.expectedCompletionRate}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">세션 수</div>
                      <div className="text-lg font-semibold">{option.weeklySchedule.length}회</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRecommendation(option);
                      setShowOptions(false);
                    }}
                  >
                    이 루틴 선택하기
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(RoutineRecommendationPage);

