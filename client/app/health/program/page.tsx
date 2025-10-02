/**
 * 수영 트레이닝 프로그램 결과 페이지
 * 
 * 연동되는 데이터:
 * - 회원 건강정보
 * - 수영 트레이닝 규칙 엔진 결과
 * - 주간 운동 계획
 * - 영법별 가이드라인
 * 
 * 연동되는 파일:
 * - /swim-training-engine/ (수영 트레이닝 규칙 엔진)
 * - /data/joint-conditions.ts (관절질환 가이드라인)
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle   } from '../../../components/ui/card';
import { Button   } from '../../../components/ui/button';
import { Badge   } from '../../../components/ui/badge';
import { Alert, AlertDescription   } from '../../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger   } from '../../../components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  Target, 
  Heart, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Download,
  Share,
  RefreshCw
} from 'lucide-react';
import type { PlanOutput, SessionPlan } from '../../swim-training-engine/src/types';

export default function TrainingProgramPage() {
  const [trainingPlan, setTrainingPlan] = useState<PlanOutput | null>(null);
  const [loading, setLoading] = useState(true);

  // 버튼 기능 구현
  const downloadProgram = () => {
    if (!trainingPlan) return;
    
    const programData = {
      title: '맞춤형 수영 프로그램',
      generatedAt: new Date().toLocaleDateString('ko-KR'),
      weeklyTarget: {
        time: `${trainingPlan.weekly_target_min}분`,
        distance: `${trainingPlan.weekly_target_distance}m`,
        pace: `${trainingPlan.exercisePrescription.averagePace}초/100m`,
        intensity: `${trainingPlan.exercisePrescription.intensity}%`
      },
      sessions: trainingPlan.sessions.map(session => ({
        day: session.day,
        totalDistance: `${session.totalDistance}m`,
        totalDuration: `${session.totalDuration}분`,
        averagePace: `${session.averagePace}초/100m`,
        strokePlan: session.stroke_plan.map(block => ({
          stroke: getStrokeName(block.stroke),
          block: block.block,
          distance: block.distance ? `${block.distance}m` : '',
          duration: block.duration ? `${block.duration}분` : '',
          pace: block.pace ? `${block.pace}초/100m` : ''
        })),
        constraints: session.constraints,
        intensityCues: session.intensity_cues,
        stopRules: session.stop_rules
      })),
      notes: trainingPlan.notes
    };

    const blob = new Blob([JSON.stringify(programData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `수영프로그램_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareProgram = async () => {
    if (!trainingPlan) return;
    
    const shareData = {
      title: '맞춤형 수영 프로그램',
      text: `주간 목표: ${trainingPlan.weekly_target_min}분, ${trainingPlan.weekly_target_distance}m\n평균 페이스: ${trainingPlan.exercisePrescription.averagePace}초/100m\n운동 강도: ${trainingPlan.exercisePrescription.intensity}%`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('공유 취소됨');
      }
    } else {
      // 클립보드에 복사
      await navigator.clipboard.writeText(shareData.text);
      alert('프로그램 정보가 클립보드에 복사되었습니다.');
    }
  };

  const regenerateProgram = () => {
    if (confirm('새로운 운동 프로그램을 생성하시겠습니까? 현재 프로그램이 교체됩니다.')) {
      setLoading(true);
      // 실제로는 API를 호출하여 새로운 프로그램을 생성
      setTimeout(() => {
        setLoading(false);
        alert('새로운 운동 프로그램이 생성되었습니다.');
      }, 2000);
    }
  };

  // 샘플 데이터 (실제로는 API에서 가져옴)
  useEffect(() => {
    const samplePlan: PlanOutput = {
      microcycle_week: 1,
      weekly_target_min: 150,
      weekly_target_distance: 2000,
      medical_clearance_required: false,
      programExplanation: {
        whyThisProgram: "체중 감량과 심혈관 건강 개선을 위해 설계된 프로그램입니다. 주 3일 운동으로 체력향상을 위한 지속주 → 인터벌 → 존2 순서로 진행합니다.",
        weeklySchedule: {
          monday: "지속주 운동: 체력 기반 구축을 위한 안정적인 수영",
          tuesday: "휴식일: 근육 회복과 재생을 위한 휴식",
          wednesday: "인터벌 운동: 심혈관 건강 개선을 위한 고강도 운동",
          thursday: "휴식일: 근육 회복과 재생을 위한 휴식",
          friday: "존2 운동: 체중 감량을 위한 지속적인 유산소 운동",
          saturday: "휴식일: 주말 휴식",
          sunday: "휴식일: 주말 휴식"
        },
        paceRationale: "존2 페이스 3분/100m을 기준으로 설정했습니다. 이는 체중 감량에 효과적인 지속적인 유산소 운동 강도입니다.",
        maxDuration: "일일 최대 50분으로 제한하여 과도한 운동으로 인한 부상을 방지합니다.",
        checklistBased: "자유형 25m 연속 수영 가능한 초급자 수준에 맞춰 기본 영법 위주로 구성했습니다."
      },
      sessions: [
        {
          day: 'Mon',
          focus: ['체중 감량', '심혈관 건강 개선'],
          stroke_plan: [
            { stroke: 'elementary_backstroke', block: '10분 워밍업', distance: 200, duration: 10, pace: 150 },
            { stroke: 'backstroke', block: '400m @90초/100m', distance: 400, duration: 30, pace: 90 },
            { stroke: 'freestyle', block: '300m @80초/100m', distance: 300, duration: 20, pace: 80 },
            { stroke: 'elementary_backstroke', block: '10분 쿨다운', distance: 200, duration: 10, pace: 150 }
          ],
          constraints: ['평영 킥 폭 축소', '피하기: 강한 팔 동작'],
          intensity_cues: { 
            primary: 'RPE 12-13 (약간 힘듦)', 
            secondary: 'HR 120-140 bpm' 
          },
          stop_rules: ['혈압 180/110 이상', 'chest_pain', 'unusual_dyspnea'],
          totalDistance: 1100,
          totalDuration: 70,
          averagePace: 85,
          intensity: 70
        },
        {
          day: 'Tue',
          focus: ['체중 감량', '심혈관 건강 개선'],
          stroke_plan: [
            { stroke: 'elementary_backstroke', block: '8\' warmup' },
            { stroke: 'backstroke', block: '25\' @RPE 12-13' },
            { stroke: 'freestyle', block: '25\' @RPE 12-13' },
            { stroke: 'elementary_backstroke', block: '7\' cooldown' }
          ],
          constraints: ['평영 킥 폭 축소', '피하기: 강한 팔 동작'],
          intensity_cues: { 
            primary: 'RPE 12-13 (약간 힘듦)', 
            secondary: 'HR 120-140 bpm' 
          },
          stop_rules: ['혈압 180/110 이상', 'chest_pain', 'unusual_dyspnea']
        },
        {
          day: 'Wed',
          focus: ['체중 감량', '심혈관 건강 개선'],
          stroke_plan: [
            { stroke: 'elementary_backstroke', block: '10\' warmup' },
            { stroke: 'backstroke', block: '30\' @RPE 12-13' },
            { stroke: 'freestyle', block: '20\' @RPE 12-13' },
            { stroke: 'elementary_backstroke', block: '10\' cooldown' }
          ],
          constraints: ['평영 킥 폭 축소', '피하기: 강한 팔 동작'],
          intensity_cues: { 
            primary: 'RPE 12-13 (약간 힘듦)', 
            secondary: 'HR 120-140 bpm' 
          },
          stop_rules: ['혈압 180/110 이상', 'chest_pain', 'unusual_dyspnea']
        },
        {
          day: 'Thu',
          focus: ['체중 감량', '심혈관 건강 개선'],
          stroke_plan: [
            { stroke: 'elementary_backstroke', block: '8\' warmup' },
            { stroke: 'backstroke', block: '25\' @RPE 12-13' },
            { stroke: 'freestyle', block: '25\' @RPE 12-13' },
            { stroke: 'elementary_backstroke', block: '7\' cooldown' }
          ],
          constraints: ['평영 킥 폭 축소', '피하기: 강한 팔 동작'],
          intensity_cues: { 
            primary: 'RPE 12-13 (약간 힘듦)', 
            secondary: 'HR 120-140 bpm' 
          },
          stop_rules: ['혈압 180/110 이상', 'chest_pain', 'unusual_dyspnea']
        },
        {
          day: 'Fri',
          focus: ['체중 감량', '심혈관 건강 개선'],
          stroke_plan: [
            { stroke: 'elementary_backstroke', block: '10\' warmup' },
            { stroke: 'backstroke', block: '30\' @RPE 12-13' },
            { stroke: 'freestyle', block: '20\' @RPE 12-13' },
            { stroke: 'elementary_backstroke', block: '10\' cooldown' }
          ],
          constraints: ['평영 킥 폭 축소', '피하기: 강한 팔 동작'],
          intensity_cues: { 
            primary: 'RPE 12-13 (약간 힘듦)', 
            secondary: 'HR 120-140 bpm' 
          },
          stop_rules: ['혈압 180/110 이상', 'chest_pain', 'unusual_dyspnea']
        }
      ],
      strength_days: 2,
      next_week_adjustment: 'maintain',
      notes: [
        '수중 HR은 개인차가 큼 — 확실하지 않음',
        '평영 킥 폭 축소 — 추측입니다',
        '개인차가 있으니 통증이나 불편함이 있으면 즉시 중단하세요'
      ],
      exercisePrescription: {
        totalDuration: 150,
        totalDistance: 2000,
        averagePace: 85,
        intensity: 70,
        grade: '3급'
      }
    };

    setTimeout(() => {
      setTrainingPlan(samplePlan);
      setLoading(false);
    }, 1000);
  }, []);

  const getStrokeName = (stroke: string) => {
    const strokeNames: { [key: string]: string } = {
      'freestyle': '자유형',
      'backstroke': '배영',
      'breaststroke': '평영',
      'butterfly': '접영',
      'elementary_backstroke': '기본배영',
      'sidestroke': '사이드스트로크'
    };
    return strokeNames[stroke] || stroke;
  };

  const getAdjustmentText = (adjustment: string) => {
    const adjustments: { [key: string]: string } = {
      'progress_+5%': '진행 (+5%)',
      'progress_+10%': '진행 (+10%)',
      'maintain': '유지',
      'deload_-10%': '감소 (-10%)',
      'deload_-20%': '감소 (-20%)'
    };
    return adjustments[adjustment] || adjustment;
  };

  const getAdjustmentColor = (adjustment: string) => {
    if (adjustment.includes('progress')) return 'green';
    if (adjustment.includes('deload')) return 'red';
    return 'blue';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">운동 프로그램을 생성하는 중...</p>
        </div>
      </div>
    );
  }

  if (!trainingPlan) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">운동 프로그램을 생성할 수 없습니다</h3>
        <p className="text-gray-500">건강정보를 다시 입력해주세요.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">맞춤형 수영 프로그램</h1>
            <p className="text-gray-600">나의 건강 상태에 맞춘 주간 운동 계획입니다.</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" className="flex items-center gap-2" onClick={() => downloadProgram()}>
              <Download className="h-4 w-4" />
              다운로드
            </Button>
            <Button variant="outline" className="flex items-center gap-2" onClick={() => shareProgram()}>
              <Share className="h-4 w-4" />
              공유
            </Button>
            <Button variant="outline" className="flex items-center gap-2" onClick={() => regenerateProgram()}>
              <RefreshCw className="h-4 w-4" />
              재생성
            </Button>
          </div>
        </div>
      </div>

      {/* 프로그램 설명 */}
      {trainingPlan.programExplanation && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              이 프로그램을 만든 이유
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-2">🎯 프로그램 목적</h4>
              <p className="text-sm text-gray-700">{trainingPlan.programExplanation.whyThisProgram}</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold mb-2">📅 주간 스케줄 설계 근거</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div><strong>월요일:</strong> {trainingPlan.programExplanation.weeklySchedule.monday}</div>
                <div><strong>화요일:</strong> {trainingPlan.programExplanation.weeklySchedule.tuesday}</div>
                <div><strong>수요일:</strong> {trainingPlan.programExplanation.weeklySchedule.wednesday}</div>
                <div><strong>목요일:</strong> {trainingPlan.programExplanation.weeklySchedule.thursday}</div>
                <div><strong>금요일:</strong> {trainingPlan.programExplanation.weeklySchedule.friday}</div>
                <div><strong>토요일:</strong> {trainingPlan.programExplanation.weeklySchedule.saturday}</div>
                <div><strong>일요일:</strong> {trainingPlan.programExplanation.weeklySchedule.sunday}</div>
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold mb-2">⚡ 페이스 설정 근거</h4>
              <p className="text-sm text-gray-700">{trainingPlan.programExplanation.paceRationale}</p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold mb-2">⏰ 운동 시간 제한</h4>
              <p className="text-sm text-gray-700">{trainingPlan.programExplanation.maxDuration}</p>
            </div>
            
            <div className="p-4 bg-pink-50 rounded-lg">
              <h4 className="font-semibold mb-2">✅ 체크리스트 기반 설계</h4>
              <p className="text-sm text-gray-700">{trainingPlan.programExplanation.checklistBased}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 프로그램 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">주간 목표 시간</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainingPlan.weekly_target_min}분</div>
            <p className="text-xs text-muted-foreground">주간 총 운동 시간</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">주간 목표 거리</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainingPlan.weekly_target_distance}m</div>
            <p className="text-xs text-muted-foreground">주간 총 수영 거리</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 페이스</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainingPlan.exercisePrescription.averagePace}초/100m</div>
            <p className="text-xs text-muted-foreground">권장 평균 페이스</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">운동 강도</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainingPlan.exercisePrescription.intensity}%</div>
            <p className="text-xs text-muted-foreground">권장 운동 강도</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">운동 일수</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainingPlan.sessions.length}일</div>
            <p className="text-xs text-muted-foreground">주간 운동 횟수</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">의료 확인</CardTitle>
            {trainingPlan.medical_clearance_required ? (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={trainingPlan.medical_clearance_required ? 'destructive' : 'default'}>
                {trainingPlan.medical_clearance_required ? '필요' : '불필요'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">의료진 상담 필요 여부</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">다음 주 조정</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={getAdjustmentColor(trainingPlan.next_week_adjustment)}>
                {getAdjustmentText(trainingPlan.next_week_adjustment)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">진행 상황에 따른 조정</p>
          </CardContent>
        </Card>
      </div>

      {/* 의료 확인 경고 */}
      {trainingPlan.medical_clearance_required && (
        <Alert className="mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>의료진 상담 필요:</strong> 고혈압이나 심장 질환이 있어 의료진과 상담 후 운동을 시작하세요.
            현재 제공된 프로그램은 안전을 최우선으로 한 저강도 프로그램입니다.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="schedule">주간 일정</TabsTrigger>
          <TabsTrigger value="guidelines">운동 가이드</TabsTrigger>
          <TabsTrigger value="notes">주의사항</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="mt-6">
          <div className="space-y-4">
            {trainingPlan.sessions.map((session, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {session.day}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {session.stroke_plan.reduce((total, block) => {
                          const minutes = parseInt(block.block.match(/\d+/)?.[0] || '0');
                          return total + minutes;
                        }, 0)}분
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    목표: {session.focus.join(', ')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* 세션 요약 정보 */}
                    <div className="grid grid-cols-3 gap-4 p-3 bg-blue-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-900">{session.totalDistance}m</div>
                        <div className="text-xs text-blue-600">총 거리</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-900">{session.totalDuration}분</div>
                        <div className="text-xs text-blue-600">총 시간</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-900">{session.averagePace}초/100m</div>
                        <div className="text-xs text-blue-600">평균 페이스</div>
                      </div>
                    </div>

                    {/* 운동 계획 */}
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">운동 계획</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {session.stroke_plan.map((block, blockIndex) => (
                          <div key={blockIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{getStrokeName(block.stroke)}</Badge>
                                <span className="text-sm">{block.block}</span>
                              </div>
                              {block.distance && (
                                <span className="text-xs text-gray-500 mt-1">
                                  {block.distance}m, {block.duration}분, {block.pace}초/100m
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 강도 지표 */}
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">강도 지표</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="text-sm font-medium text-blue-900">주요 지표</div>
                          <div className="text-sm text-blue-700">{session.intensity_cues.primary}</div>
                        </div>
                        {session.intensity_cues.secondary && (
                          <div className="p-3 bg-green-50 rounded-lg">
                            <div className="text-sm font-medium text-green-900">보조 지표</div>
                            <div className="text-sm text-green-700">{session.intensity_cues.secondary}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 제약사항 */}
                    {session.constraints.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">제약사항</h4>
                        <div className="flex flex-wrap gap-1">
                          {session.constraints.map((constraint, constraintIndex) => (
                            <Badge key={constraintIndex} variant="outline" className="text-xs">
                              {constraint}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 중단 규칙 */}
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">운동 중단 규칙</h4>
                      <div className="flex flex-wrap gap-1">
                        {session.stop_rules.map((rule, ruleIndex) => (
                          <Badge key={ruleIndex} variant="destructive" className="text-xs">
                            {rule}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="guidelines" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  운동 강도 가이드
                </CardTitle>
                <CardDescription>RPE(주관적 운동 강도) 기준으로 운동하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">RPE 9-10</span>
                      <span className="text-sm text-gray-600">매우 가벼움</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">RPE 11-12</span>
                      <span className="text-sm text-gray-600">가벼움</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <span className="text-sm font-medium">RPE 13-14</span>
                      <span className="text-sm text-blue-700 font-medium">약간 힘듦 (목표)</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">RPE 15-16</span>
                      <span className="text-sm text-gray-600">힘듦</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">RPE 17-20</span>
                      <span className="text-sm text-gray-600">매우 힘듦</span>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">운동 강도 판단법</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• 대화가 가능한 수준</li>
                      <li>• 약간 땀이 날 정도</li>
                      <li>• 숨이 가쁘지 않음</li>
                      <li>• 운동 후 피로감이 적음</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  영법별 주의사항
                </CardTitle>
                <CardDescription>안전한 수영을 위한 영법별 가이드라인</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">배영 (권장)</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 허리에 부담이 적음</li>
                      <li>• 호흡이 편함</li>
                      <li>• 초보자에게 적합</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">자유형 (주의)</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 팔 동작을 부드럽게</li>
                      <li>• 과도한 회전 피하기</li>
                      <li>• 통증 시 즉시 중단</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">평영 (제한)</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 킥 폭을 축소</li>
                      <li>• 허리 신전 최소화</li>
                      <li>• 통증 시 회피</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">접영 (금지)</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 허리에 과도한 부담</li>
                      <li>• 초보자에게 부적합</li>
                      <li>• 의료진 상담 필요</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <div className="space-y-4">
            {trainingPlan.notes.map((note, index) => (
              <Alert key={index}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{note}</AlertDescription>
              </Alert>
            ))}
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  일반적인 주의사항
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>운동 전 충분한 워밍업을 하세요 (최소 10분)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>운동 중 통증이나 불편함이 있으면 즉시 중단하세요</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>충분한 수분 섭취를 유지하세요</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>운동 후 쿨다운을 하세요 (최소 5분)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>규칙적인 운동 일정을 유지하세요</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
