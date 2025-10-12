/**
 * 🏊 SwimLab - 통합 프로그램 생성 패널
 * 
 * 📋 **컴포넌트 목적**
 * - 컨디션 설정 탭에서 바로 프로그램 생성
 * - 중복 입력 없이 원스톱으로 처리
 * - 선택된 선수와 컨디션을 자동으로 반영
 * 
 * 🔄 **주요 기능**
 * - 프로그램 생성 파라미터 입력
 * - 선택된 컨디션 자동 적용
 * - 실시간 프로그램 생성
 * - 웹에서 이력 관리
 * - 팀 일괄 생성 지원
 */

'use client';

import React, { useState } from 'react';
import { listAthletes, type AthleteProfile } from '@/lib/swimlab/utils/athletes';
// import { exportWeeklyForAthletes, exportRaceForAthletes } from '@/lib/swimlab/utils/multiExport';
import { saveProgram, type SavedProgram } from '@/lib/swimlab/utils/programStorage';
import { apiClient } from '@/utils/api';
import { TRAINING_METHODS } from '@/src/swimlab/data/trainingMethods';
import { DRILLS } from '@/src/swimlab/data/drills';
import { getMergedMethods, getMergedDrills } from '@/lib/swimlab/utils/customData';
import { generateAdvancedProgram, type SessionBlock } from '@/lib/swimlab/advanced-program-generator';
import { generateWeeklyPlan, type Input as EngineInput, type DayPlan, type SetItem } from '@/lib/swimlab/engine-v31';
import { analyzeProgress } from '@/lib/swimlab/progressAnalyzer';
// import { buildProgram } from '@/src/swimlab/utils/engine';

interface ProgramGeneratorPanelProps {
  selectedAthleteIds: string[];
  conditionIds: string[];
  // 컨디션 설정 탭의 시간 기반 설정
  timeBasedSettings?: {
    sessionDuration: number;
    mainStrokes: string[];
    excludedStrokes: string[];
    strokeCSS: Record<string, number>;
    goal: string;
    applyCompletionRate?: boolean; // 완료율 반영 여부
    intensityMode?: 'auto' | 'maintain' | 'increase' | 'decrease'; // 강도 조정 모드
    // ⚠️ condition, hasPain 제거: 프로그램 실행 시점에 입력받음
  };
}

// 컨디션 기반 조정 로직
const getConditionBasedAdjustments = (conditionIds: string[]) => {
  const adjustments = {
    excludedStrokes: [] as string[],
    intensityReduction: 0,
    explanations: [] as string[]
  };

  if (conditionIds.includes('shoulder_impingement')) {
    adjustments.excludedStrokes.push('FL', 'FR');
    adjustments.intensityReduction += 0.2;
    adjustments.explanations.push('어깨 충돌 증후군으로 인해 자유형, 접영 강도 감소');
  }

  if (conditionIds.includes('knee_pain')) {
    adjustments.excludedStrokes.push('BR');
    adjustments.intensityReduction += 0.15;
    adjustments.explanations.push('무릎 통증으로 인해 평영 강도 감소');
  }

  if (conditionIds.includes('chlorine_sensitivity')) {
    adjustments.intensityReduction += 0.1;
    adjustments.explanations.push('염소 민감도로 인해 전체 강도 감소');
  }

  return adjustments;
};

export default function ProgramGeneratorPanel({ 
  selectedAthleteIds, 
  conditionIds,
  timeBasedSettings
}: ProgramGeneratorPanelProps) {
  // 프로그램 파라미터
  const [programType, setProgramType] = useState<'weekly' | 'race'>('weekly');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  // const [weeklyMeters, setWeeklyMeters] = useState(8000); // 시간 기반으로 변경됨
  const [pool, setPool] = useState<number>(25);
  const [poolMode, setPoolMode] = useState<'preset' | 'custom'>('preset'); // 프리셋 또는 직접입력
  const [stroke, setStroke] = useState<'FR' | 'BK' | 'BR' | 'FL'>('FR');
  // const [skill, setSkill] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate'); // 시간 기반으로 불필요
  const [cssPer100, setCssPer100] = useState(100);
  // const [heightCm, setHeightCm] = useState(175); // 시간 기반으로 불필요
  
  // 요일 선택 (체크박스)
  const [selectedDays, setSelectedDays] = useState<string[]>(['월', '화', '수', '목', '금']);
  const allDays = ['월', '화', '수', '목', '금', '토', '일'];
  
  // 레이스 전용
  const [raceDate, setRaceDate] = useState(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const [taperWeeks, setTaperWeeks] = useState(2);

  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (selectedAthleteIds.length === 0) {
      alert('먼저 선수를 선택하세요.');
      return;
    }

    setGenerating(true);

    try {
      const athletes = listAthletes().filter(a => selectedAthleteIds.includes(a.id));
      
      // 시간 기반 파라미터 (weeklyMeters, skill, heightCm 제거됨)
      const baseInput = {
        startDate,
        daysPerWeek: selectedDays.length,
        selectedDays, // ⭐ 선택된 요일
        pool,
        stroke,
        withTT: true,
        cssPer100,
        conditionIds, // ⭐ 자동으로 현재 컨디션 적용
        anchorMode: 'soft' as const,
        variancePct: 20,
        methods: getMergedMethods(TRAINING_METHODS), // ⭐ 기본 + 커스텀 병합
        drills: getMergedDrills(DRILLS),             // ⭐ 기본 + 커스텀 병합
      };

      if (programType === 'weekly') {
        // exportWeeklyForAthletes(baseInput, athletes);
        
        // 웹에 저장 (어드민이 확인 가능) - 시간 기반 프로그램 생성
        for (let idx = 0; idx < athletes.length; idx++) {
          const athlete = athletes[idx];
          // 컨디션 설정 탭의 시간 기반 설정 사용
          const sessionDuration = timeBasedSettings?.sessionDuration || 60;
          const mainStrokes = timeBasedSettings?.mainStrokes || [stroke];
          const excludedStrokes = timeBasedSettings?.excludedStrokes || [];
          const strokeCSS = timeBasedSettings?.strokeCSS || { [stroke]: cssPer100 || 90 };
          const goal = timeBasedSettings?.goal || '';
          
          // ⚠️ 당일 컨디션은 프로그램 생성 시점이 아닌 실행 시점에 적용!
          // condition, hasPain은 제거됨 (ProgramListView에서 실행 시 입력)
          
          // 제외된 영법을 제외한 실제 사용할 영법
          const activeStrokes = mainStrokes.filter(s => !excludedStrokes.includes(s));
          
          if (activeStrokes.length === 0) {
            console.warn(`선수 ${athlete.name}: 사용 가능한 영법이 없습니다.`);
            return;
          }
          
          // 📚 최근 3주 훈련법 이력 조회 (MongoDB)
          let weekHistory: string[] = [];
          try {
            const historyResponse = await apiClient.get(`/swim-programs/athlete/${athlete.id}/history`);
            weekHistory = historyResponse.data.weekHistory || [];
            console.log(`📚 ${athlete.name}의 최근 3주 이력:`, weekHistory);
          } catch (error) {
            console.warn('이력 조회 실패, 기본값 사용:', error);
            weekHistory = [];
          }
          
          // ⭐ v3.1 엔진 사용 (CSS + Zone 기반, 주간 테마 자동 변화, 이력 기반 다양성)
          const engineInput: EngineInput = {
            startDate: startDate,
            days: selectedDays as any,
            weeklyMinutes: sessionDuration * selectedDays.length,
            weeklyMeters: 0, // 아래에서 계산
            poolLen: pool as any,
            strokesAllowed: activeStrokes as any,
            strokesAvoid: excludedStrokes as any,
            css100: strokeCSS,
            conditionIds: athlete.conditionIds || [],
            dayCondition: 'normal', // ⚠️ 주간 생성 시에는 항상 normal (표준 페이스)
            hasPain: false, // ⚠️ 주간 생성 시에는 통증 없음으로 가정
            goal: goal, // 운동 목표만 반영 (25개 훈련법 자동 선택)
            weekHistory: weekHistory // 📚 이력 기반 다양성
          };
          
          // 주간 거리 추정 (CSS 기반) - 실제 수영 시간 고려
          // 60분 세션에서 실제 수영 시간은 약 70% (워밍업/쿨다운/휴식 제외)
          const validCSS = Object.entries(strokeCSS).filter(([_, css]) => css > 0);
          if (validCSS.length === 0) {
            alert('최소 하나의 영법에 대한 CSS를 입력해주세요.');
            return;
          }
          
          const avgCSS = validCSS.reduce((sum, [_, css]) => sum + css, 0) / validCSS.length;
          // 실제 수영 시간 = 세션 시간 × 0.7 (워밍업 10%, 쿨다운 15%, 휴식 5%)
          const actualSwimMinutes = sessionDuration * 0.7;
          // 일일 거리 = (실제 수영 시간(분) × 60초) ÷ (평균 CSS(초/100m) ÷ 100m)
          const dailyMeters = Math.round((actualSwimMinutes * 60) / (avgCSS / 100) / 25) * 25; // 25m 단위
          engineInput.weeklyMeters = dailyMeters * selectedDays.length;
          
          console.log(`💡 거리 계산: 세션 ${sessionDuration}분 × 실제 70% = ${actualSwimMinutes}분, CSS ${avgCSS}초 → 일일 ${dailyMeters}m, 주간 ${engineInput.weeklyMeters}m`);
          
          console.log(`🔍 프로그램 생성 입력:`, {
            선수: athlete.name,
            컨디션IDs: athlete.conditionIds,
            염소민감포함: athlete.conditionIds?.includes('chlorine_sensitivity'),
            주간시간: engineInput.weeklyMinutes,
            주간거리: engineInput.weeklyMeters,
            일일거리: Math.round(engineInput.weeklyMeters / selectedDays.length),
            CSS: strokeCSS
          });
          
          // 🔬 강도 계산 (주간 프로그램은 표준 강도 사용)
          const conditionAdjustments = getConditionBasedAdjustments(athlete.conditionIds || []);
          const finalIntensity = 1.0 * (1 - conditionAdjustments.intensityReduction); // 주간 프로그램은 컨디션/통증 제외
          
          const weeklyPlan = generateWeeklyPlan(engineInput);
          
          console.log(`📊 생성된 계획:`, {
            목표: weeklyPlan.goal,
            계획설명: weeklyPlan.planExplanation,
            총거리: weeklyPlan.days.reduce((sum, d) => sum + d.totalMeters, 0),
            일별거리: weeklyPlan.days.map(d => d.totalMeters)
          });
          
          const sessions = weeklyPlan.days.map((dayPlan, dayIdx) => {
            // 각 세션의 실제 날짜 계산
            const sessionDate = new Date(startDate);
            const dayIndex = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'].indexOf(selectedDays[dayIdx]);
            sessionDate.setDate(sessionDate.getDate() + (dayIndex >= 0 ? dayIndex : dayIdx));
            
            // DayPlan을 기존 형식으로 변환
            const blocks = dayPlan.sets.map((set: SetItem) => ({
              type: set.zone === 'Z1' && set.desc.includes('워밍업') ? '워밍업' :
                    set.zone === 'Z1' && set.desc.includes('쿨다운') ? '쿨다운' :
                    set.subtype === '팔' ? '기술 세트 (팔)' :
                    set.subtype === '발차기' ? '기술 세트 (발차기)' :
                    set.subtype === '콤비네이션' ? '기술 세트 (콤비네이션)' :
                    set.zone === 'Z4' || set.zone === 'Z5' ? '스피드 세트' :
                    set.zone === 'Z2' ? '지구력 세트' : '메인 세트',
              stroke: set.stroke,
              strokeName: {
                freestyle: '자유형',
                backstroke: '배영',
                breaststroke: '평영',
                butterfly: '접영',
                elementary_backstroke: '기본배영',
                sidestroke: '측영'
              }[set.stroke] || set.stroke,
              totalDistance: set.meters,
              duration: Math.round((set.meters / 100) * (strokeCSS[set.stroke] || avgCSS) / 60),
              pace: strokeCSS[set.stroke] || avgCSS,
              rpe: set.rpe || 5,
              restSec: set.restSec,
              equipment: set.equipment || [],
              description: set.desc,
              desc: set.desc,
              // 🔬 설명가능성 필드 복사
              whyPace: set.whyPace,
              whyRest: set.whyRest,
              whySet: set.whySet,
              evidenceKeys: set.evidenceKeys
            }));
            
            return {
              day: selectedDays[dayIdx],
              date: sessionDate.toISOString().split('T')[0], // YYYY-MM-DD 형식
              themeDesc: dayPlan.themeDesc, // 테마 설명 추가
              dayNumber: dayIdx + 1,
              blocks: blocks,
              totalDuration: dayPlan.totalDuration,
              totalDistance: dayPlan.totalMeters,
              intensity: Math.round(finalIntensity * 100),
              theme: dayPlan.theme,
              notes: dayPlan.notes
            };
          });
          
          // 주간 총 거리 계산
          const weeklyDistance = sessions.reduce((sum, s) => sum + s.totalDistance, 0);
          
          // 프로그램을 세트 리스트로 변환
          const sets: string[] = [];
          sessions.forEach(session => {
            sets.push(`📅 ${session.day} (${session.totalDuration}분, ${session.totalDistance}m)`);
            session.blocks.forEach(block => {
              if (block.method) {
                sets.push(`  • ${block.type}: ${block.description}`);
                sets.push(`    💡 ${block.method}: ${block.methodDetails}`);
              } else if (block.drill) {
                sets.push(`  • ${block.type}: ${block.description}`);
                sets.push(`    🏊‍♂️ ${block.drill}: ${block.drillDetails}`);
              } else {
                sets.push(`  • ${block.type}: ${block.description}`);
              }
            });
          });
          
          // 조정 사항 설명 추가
          if (conditionAdjustments.explanations.length > 0) {
            sets.push(`\n💡 컨디션 기반 조정:`);
            conditionAdjustments.explanations.forEach(explanation => {
              sets.push(`  • ${explanation}`);
            });
          }
          
          // 🎯 사용된 훈련법 ID 추출 (이력 관리용)
          const usedMethodIds: string[] = [];
          weeklyPlan.days.forEach(day => {
            day.sets.forEach(set => {
              // 훈련법 이름에서 ID 추출 (예: "역치(Threshold/LT) 인터벌" → "06")
              const methodMatch = set.desc.match(/역치.*인터벌|LSD|스프린트|디센딩|빌드업|템포 홀드|스컬링|킥 파워|패들|핀 보조/);
              if (methodMatch) {
                // 간단한 매핑 (실제로는 더 정교하게)
                const methodName = methodMatch[0];
                const methodId = TRAINING_METHODS.find(m => m.title.includes(methodName))?.id;
                if (methodId && !usedMethodIds.includes(methodId)) {
                  usedMethodIds.push(methodId);
                }
              }
            });
          });
          
          console.log(`🎯 ${athlete.name}의 사용된 훈련법:`, usedMethodIds);
          
          // MongoDB에 저장
          try {
            const response = await apiClient.post('/swim-programs', {
              athleteId: athlete.id,
              athleteName: athlete.name,
              centerId: null, // 필요시 추가
              programType: 'weekly',
              params: {
                startDate,
                daysPerWeek: selectedDays.length,
                selectedDays,
                sessionDuration,
                pool,
                mainStrokes: activeStrokes,
                excludedStrokes,
                cssPer100: Object.fromEntries(
                  Object.entries(strokeCSS).filter(([_, css]) => css > 0)
                ),
                conditionIds: athlete.conditionIds || [],
                goal
              },
              content: {
                summary: `${athlete.name}의 시간 기반 주간 계획 - ${startDate}부터 ${selectedDays.length}일간 (${selectedDays.join(', ')})`,
                planExplanation: weeklyPlan.planExplanation, // 주간 계획 설명 추가
                totalDuration: sessionDuration * selectedDays.length,
                totalMeters: weeklyDistance,
                sessions: sessions.map(s => ({
                  day: s.day,
                  date: s.date, // 실제 날짜 추가
                  themeDesc: s.themeDesc, // 테마 설명 추가
                  duration: s.totalDuration,
                  distance: s.totalDistance,
                  intensity: s.intensity.toString(),
                  blocks: s.blocks
                }))
              },
              usedMethodIds: usedMethodIds
            });
            
            console.log(`✅ ${athlete.name}의 프로그램이 MongoDB에 저장되었습니다.`, response.data.programId);
          } catch (error) {
            console.error('MongoDB 저장 실패, localStorage로 폴백:', error);
            // 폴백: localStorage에 저장
          const program: SavedProgram = {
            id: `prog_${Date.now()}_${idx}_${athlete.id}`,
            athleteName: athlete.name,
            athleteId: athlete.id,
            programType: 'weekly',
            createdAt: new Date().toISOString(),
            params: {
                startDate,
                daysPerWeek: selectedDays.length,
                selectedDays,
                sessionDuration,
                pool,
                stroke: activeStrokes.join(', '),
                cssPer100: Object.fromEntries(
                  Object.entries(strokeCSS).filter(([_, css]) => css > 0)
                ),
                conditionIds: athlete.conditionIds || [],
                mainStrokes: activeStrokes,
                excludedStrokes,
                goal
            },
            content: {
                summary: `${athlete.name}의 시간 기반 주간 계획 - ${startDate}부터 ${selectedDays.length}일간 (${selectedDays.join(', ')})`,
                totalDuration: sessionDuration * selectedDays.length,
                totalMeters: weeklyDistance,
                sessions: sessions.map(s => ({
                  day: s.day,
                  date: s.date, // 실제 날짜 추가
                  themeDesc: s.themeDesc, // 테마 설명 추가
                  duration: s.totalDuration,
                  distance: s.totalDistance,
                  intensity: s.intensity,
                  blocks: s.blocks
                }))
            }
          };
          saveProgram(program);
          }
        }
        
        // const fileNames = athletes.map(a => `Swim_Weekly_${a.name}.ics`).join('\n');
        alert(
          `✅ ${athletes.length}명의 주간 계획이 생성되었습니다!\n\n` +
          `💾 프로그램 생성 완료!\n` +
          `→ "프로그램 목록" 탭에서 확인하세요`
        );
      } else {
        // exportRaceForAthletes({ ...baseInput, raceDate, taperWeeks }, athletes);
        
        for (const athlete of athletes) {
          // 시간 기반 레이스 플랜 생성
          const sessionDuration = (timeBasedSettings?.sessionDuration || 90) + 30; // 레이스 플랜은 더 긴 세션
          const mainStrokes = timeBasedSettings?.mainStrokes || [stroke];
          const excludedStrokes = timeBasedSettings?.excludedStrokes || [];
          const strokeCSS = timeBasedSettings?.strokeCSS || { [stroke]: cssPer100 || 90 };
          const condition = timeBasedSettings?.condition || '';
          const hasPain = timeBasedSettings?.hasPain || false;
          
          // 컨디션과 통증에 따른 강도 조정
          const conditionAdjustments = getConditionBasedAdjustments(athlete.conditionIds || []);
          
          // 오늘의 컨디션에 따른 강도 조정
          const conditionMultiplier = condition === '매우 좋음' ? 1.0 :
                                    condition === '좋음' ? 0.95 :
                                    condition === '보통' ? 0.9 :
                                    condition === '피곤함' ? 0.8 :
                                    condition === '매우 피곤함' ? 0.7 : 1.0;
          
          // 통증 있으면 추가 강도 감소
          const painMultiplier = hasPain ? 0.8 : 1.0;
          
          // 전체 강도 조정 (시간은 조정하지 않고 강도만 조정)
          const finalIntensity = conditionMultiplier * painMultiplier * (1 - conditionAdjustments.intensityReduction);
          const adjustedSessionDuration = sessionDuration; // 시간은 원래대로 유지
          
          const program: SavedProgram = {
            id: `prog_${Date.now()}_${athlete.id}`,
            athleteName: athlete.name,
            athleteId: athlete.id,
            programType: 'race',
            createdAt: new Date().toISOString(),
            params: {
              startDate,
              raceDate,
              taperWeeks,
              sessionDuration,
              pool,
              stroke: mainStrokes.join(', '), // 복수 영법
              cssPer100: Object.fromEntries(
                Object.entries(strokeCSS).filter(([_, css]) => css > 0)
              ), // 입력한 영법의 CSS만 저장
              conditionIds: athlete.conditionIds || [],
              intensityMultiplier: finalIntensity,
              mainStrokes,
              excludedStrokes,
              condition,
              hasPain
            },
            content: {
              summary: `${athlete.name}의 시간 기반 레이스 플랜 - ${raceDate} 대회 대비 (테이퍼 ${taperWeeks}주)`,
              totalDuration: adjustedSessionDuration * 8, // 8주 평균
              totalMeters: Math.floor((adjustedSessionDuration * 60) / (cssPer100 || 90) * 100) * 8, // 시간 기반 거리 계산
              sessions: [
                {
                  day: '1-6주차 (베이스 빌딩)',
                  duration: adjustedSessionDuration,
                  distance: Math.floor((adjustedSessionDuration * 60) / (cssPer100 || 90) * 100),
                  intensity: Math.round(finalIntensity * 100),
                  blocks: [
                    {
                      type: '워밍업',
                      description: `${Math.round(adjustedSessionDuration * 0.1)}분 가볍게 수영`
                    },
                    {
                      type: '메인 세트',
                      description: `${Math.round(adjustedSessionDuration * 0.75)}분 강도 훈련`
                    },
                    {
                      type: '쿨다운',
                      description: `${Math.round(adjustedSessionDuration * 0.15)}분 여유롭게 수영`
                    }
                  ]
                },
                {
                  day: '테이퍼 주',
                  duration: Math.round(adjustedSessionDuration * 0.6),
                  distance: Math.floor((Math.round(adjustedSessionDuration * 0.6) * 60) / (cssPer100 || 90) * 100),
                  intensity: Math.round(finalIntensity * 60),
                  blocks: [
                    {
                      type: '워밍업',
                      description: `${Math.round(adjustedSessionDuration * 0.6 * 0.2)}분 가볍게 수영`
                    },
                    {
                      type: '메인 세트',
                      description: `${Math.round(adjustedSessionDuration * 0.6 * 0.6)}분 경량 훈련`
                    },
                    {
                      type: '쿨다운',
                      description: `${Math.round(adjustedSessionDuration * 0.6 * 0.2)}분 여유롭게 수영`
                    }
                  ]
                }
              ]
            }
          };
          saveProgram(program);
        }
        
        // const fileNames = athletes.map(a => `Swim_Race_${a.name}.ics`).join('\n');
        alert(
          `✅ ${athletes.length}명의 레이스 플랜이 생성되었습니다!\n\n` +
          `💾 프로그램 생성 완료!\n` +
          `→ "프로그램 목록" 탭에서 확인하세요\n\n` +
          `🏆 대회일: ${raceDate}\n` +
          `📅 테이퍼: ${taperWeeks}주`
        );
      }
    } catch (error) {
      console.error('프로그램 생성 실패:', error);
      alert('프로그램 생성에 실패했습니다.');
    } finally {
      setGenerating(false);
    }
  };

  if (selectedAthleteIds.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <p className="text-yellow-800 text-sm">
          💡 먼저 상단에서 선수를 선택하세요
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          프로그램 생성
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            선택된 선수: {selectedAthleteIds.length}명
          </span>
          <span className="text-sm text-gray-600">
            | 컨디션: {conditionIds.length}개
          </span>
        </div>
      </div>

      {/* 프로그램 타입 선택 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          프로그램 타입
        </label>
        <div className="flex gap-4">
          <button
            onClick={() => setProgramType('weekly')}
            className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
              programType === 'weekly'
                ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-lg mb-1">📅</div>
            <div className="font-medium">주간 계획</div>
            <div className="text-xs opacity-70">일상 훈련</div>
          </button>
          <button
            onClick={() => setProgramType('race')}
            className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
              programType === 'race'
                ? 'border-purple-500 bg-purple-50 text-purple-700 font-medium'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-lg mb-1">🏆</div>
            <div className="font-medium">레이스 플랜</div>
            <div className="text-xs opacity-70">대회 준비</div>
          </button>
        </div>
      </div>

      {/* 요일 선택 */}
      <div className="space-y-2 pb-4 border-b">
        <label className="block text-sm font-medium text-gray-700">
          훈련 요일 선택 ({selectedDays.length}일)
        </label>
        <div className="flex flex-wrap gap-2">
          {allDays.map(day => (
            <button
              key={day}
              onClick={() => {
                if (selectedDays.includes(day)) {
                  setSelectedDays(selectedDays.filter(d => d !== day));
                } else {
                  setSelectedDays([...selectedDays, day]);
                }
              }}
              className={`px-4 py-2 rounded-lg border-2 transition-all min-w-[60px] ${
                selectedDays.includes(day)
                  ? 'bg-blue-500 text-white border-blue-500 font-medium'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          💡 원하는 요일을 클릭하여 선택/해제하세요
        </p>
      </div>

      {/* 공통 파라미터 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            시작일
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>


        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            풀 길이 (m)
          </label>
          <div className="flex gap-2">
            <select
              value={poolMode}
              onChange={(e) => {
                const mode = e.target.value as 'preset' | 'custom';
                setPoolMode(mode);
                if (mode === 'preset') setPool(25);
              }}
              className="w-32 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="preset">표준</option>
              <option value="custom">직접 입력</option>
            </select>
            
            {poolMode === 'preset' ? (
              <select
                value={pool}
                onChange={(e) => setPool(Number(e.target.value))}
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={25}>25m (단수)</option>
                <option value={50}>50m (장수)</option>
              </select>
            ) : (
              <input
                type="number"
                placeholder="예: 33.3"
                value={pool}
                onChange={(e) => setPool(Number(e.target.value) || 25)}
                min={10}
                max={100}
                step={0.1}
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            💡 일반: 25m(단수) / 50m(장수) | 특수: 33.3m, 36.5m 등
          </p>
        </div>




      </div>

      {/* 레이스 전용 파라미터 */}
      {programType === 'race' && (
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              대회 날짜
            </label>
            <input
              type="date"
              value={raceDate}
              onChange={(e) => setRaceDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              테이퍼 주수
            </label>
            <select
              value={taperWeeks}
              onChange={(e) => setTaperWeeks(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value={1}>1주</option>
              <option value={2}>2주</option>
              <option value={3}>3주</option>
            </select>
          </div>
        </div>
      )}

      {/* 생성 버튼 */}
      <div className="flex gap-4 pt-4 border-t">
        <button
          onClick={handleGenerate}
          disabled={generating}
          className={`flex-1 px-6 py-4 rounded-lg font-medium transition-all ${
            generating
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : programType === 'weekly'
              ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
              : 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          {generating ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>생성 중...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">🚀</span>
              <span>
                {programType === 'weekly' ? '주간 계획' : '레이스 플랜'} 생성
                {selectedAthleteIds.length > 1 && ` (${selectedAthleteIds.length}명)`}
              </span>
            </div>
          )}
        </button>
      </div>

      {/* 자동 적용 정보 */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <span className="text-green-600">✅</span>
          <div className="flex-1 text-sm text-green-800">
            <div className="font-medium mb-1">자동으로 적용되는 정보</div>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>선택된 선수의 저장된 컨디션 ({conditionIds.length}개)</li>
              <li>건강 프로필 (만성질환, 알레르기)</li>
              <li>수영 실력 수준 및 목표</li>
              <li>의학적 근거 기반 안전 가이드라인</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

