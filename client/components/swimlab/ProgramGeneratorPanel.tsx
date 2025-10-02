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
 * - ICS 파일 다운로드
 * - 팀 일괄 생성 지원
 */

'use client';

import React, { useState } from 'react';
import { listAthletes, type AthleteProfile } from '@/lib/swimlab/utils/athletes';
import { exportWeeklyForAthletes, exportRaceForAthletes } from '@/lib/swimlab/utils/multiExport';
import { saveProgram, type SavedProgram } from '@/lib/swimlab/utils/programStorage';
import { TRAINING_METHODS } from '@/src/swimlab/data/trainingMethods';
import { DRILLS } from '@/src/swimlab/data/drills';
import { getMergedMethods, getMergedDrills } from '@/lib/swimlab/utils/customData';
import { buildProgram } from '@/src/swimlab/utils/engine';

interface ProgramGeneratorPanelProps {
  selectedAthleteIds: string[];
  conditionIds: string[];
}

export default function ProgramGeneratorPanel({ 
  selectedAthleteIds, 
  conditionIds 
}: ProgramGeneratorPanelProps) {
  // 프로그램 파라미터
  const [programType, setProgramType] = useState<'weekly' | 'race'>('weekly');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [weeklyMeters, setWeeklyMeters] = useState(8000);
  const [pool, setPool] = useState<number>(25);
  const [poolMode, setPoolMode] = useState<'preset' | 'custom'>('preset'); // 프리셋 또는 직접입력
  const [stroke, setStroke] = useState<'FR' | 'BK' | 'BR' | 'FL'>('FR');
  const [skill, setSkill] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [cssPer100, setCssPer100] = useState(100);
  const [heightCm, setHeightCm] = useState(175);
  
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
      
      const baseInput = {
        startDate,
        daysPerWeek: selectedDays.length,
        selectedDays, // ⭐ 선택된 요일
        weeklyMeters,
        pool,
        stroke,
        withTT: true,
        cssPer100,
        conditionIds, // ⭐ 자동으로 현재 컨디션 적용
        skill,
        heightCm,
        anchorMode: 'soft' as const,
        variancePct: 20,
        methods: getMergedMethods(TRAINING_METHODS), // ⭐ 기본 + 커스텀 병합
        drills: getMergedDrills(DRILLS),             // ⭐ 기본 + 커스텀 병합
      };

      if (programType === 'weekly') {
        exportWeeklyForAthletes(baseInput, athletes);
        
        // 웹에 저장 (어드민이 확인 가능)
        athletes.forEach((athlete, idx) => {
          const metersPerDay = Math.floor(weeklyMeters / selectedDays.length);
          const mergedMethods = getMergedMethods(TRAINING_METHODS);
          const mergedDrills = getMergedDrills(DRILLS);
          
          // 실제 엔진으로 매일 다른 프로그램 생성
          const sessions = selectedDays.map((day, dayIdx) => {
            // 각 요일마다 다른 목표로 프로그램 생성
            const goals = ['Endurance', 'Tempo', 'Speed', 'Technique', 'Recovery', 'Race', 'OpenWater'] as const;
            const dailyGoal = goals[dayIdx % goals.length];
            
            const program = buildProgram({
              methods: mergedMethods,
              drills: mergedDrills,
              goal: dailyGoal,
              targetMeters: metersPerDay,
              pool,
              cssPer100,
              conditionIds: athlete.conditionIds,
              stroke,
              skill,
              heightCm,
              withTT: true
            });
            
            // 프로그램을 세트 리스트로 변환
            const sets: string[] = [];
            
            // 워밍업
            program.WU.forEach(block => {
              sets.push(`🏊 ${block.name} (${block.meters}m)`);
              block.items.forEach(item => sets.push(`  • ${item}`));
            });
            
            // 프리셋
            program.PRE.forEach(block => {
              sets.push(`🔥 ${block.name} (${block.meters}m)`);
              block.items.forEach(item => sets.push(`  • ${item}`));
            });
            
            // 메인
            program.MAIN.forEach(block => {
              sets.push(`💪 ${block.name} (${block.meters}m)`);
              block.items.forEach(item => sets.push(`  • ${item}`));
            });
            
            // 쿨다운
            program.CD.forEach(block => {
              sets.push(`😌 ${block.name} (${block.meters}m)`);
              block.items.forEach(item => sets.push(`  • ${item}`));
            });
            
            sets.push(`\n📊 총 거리: ${program.totalMeters}m`);
            
            if (program.notes.length > 0) {
              sets.push(`\n💡 참고사항:`);
              program.notes.forEach(note => sets.push(`  • ${note}`));
            }
            
            return {
              day: `${day}요일 (${dailyGoal})`,
              sets
            };
          });
          
          const program: SavedProgram = {
            id: `prog_${Date.now()}_${idx}_${athlete.id}`,
            athleteName: athlete.name,
            athleteId: athlete.id,
            programType: 'weekly',
            createdAt: new Date().toISOString(),
            params: {
              ...baseInput,
              raceDate: undefined,
              taperWeeks: undefined
            },
            content: {
              summary: `${athlete.name}의 주간 계획 - ${startDate}부터 ${selectedDays.length}일간 (${selectedDays.join(', ')})`,
              totalMeters: weeklyMeters,
              sessions
            }
          };
          saveProgram(program);
        });
        
        const fileNames = athletes.map(a => `Swim_Weekly_${a.name}.ics`).join('\n');
        alert(
          `✅ ${athletes.length}명의 주간 계획이 생성되었습니다!\n\n` +
          `📥 ICS 파일 다운로드:\n${fileNames}\n\n` +
          `💾 웹에 저장 완료!\n` +
          `→ "프로그램 목록" 탭에서 확인하세요\n\n` +
          `💡 다운로드 폴더 위치:\n` +
          `C:\\Users\\사용자명\\Downloads`
        );
      } else {
        exportRaceForAthletes({ ...baseInput, raceDate, taperWeeks }, athletes);
        
        athletes.forEach(athlete => {
          const program: SavedProgram = {
            id: `prog_${Date.now()}_${athlete.id}`,
            athleteName: athlete.name,
            athleteId: athlete.id,
            programType: 'race',
            createdAt: new Date().toISOString(),
            params: baseInput,
            content: {
              summary: `${athlete.name}의 레이스 플랜 - ${raceDate} 대회 대비 (테이퍼 ${taperWeeks}주)`,
              totalMeters: weeklyMeters * 8, // 8주 평균
              sessions: [
                {
                  day: '1주차',
                  sets: [`베이스 빌딩: ${weeklyMeters}m`]
                },
                {
                  day: '테이퍼 주',
                  sets: [`볼륨 감소: ${Math.floor(weeklyMeters * 0.6)}m`]
                }
              ]
            }
          };
          saveProgram(program);
        });
        
        const fileNames = athletes.map(a => `Swim_Race_${a.name}.ics`).join('\n');
        alert(
          `✅ ${athletes.length}명의 레이스 플랜이 생성되었습니다!\n\n` +
          `📥 ICS 파일 다운로드:\n${fileNames}\n\n` +
          `💾 웹에 저장 완료!\n` +
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            주간 총 거리
          </label>
          <input
            type="number"
            value={weeklyMeters}
            onChange={(e) => setWeeklyMeters(Number(e.target.value))}
            step={1000}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            주 영법
          </label>
          <select
            value={stroke}
            onChange={(e) => setStroke(e.target.value as any)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="FR">자유형</option>
            <option value="BK">배영</option>
            <option value="BR">평영</option>
            <option value="FL">접영</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            실력 수준
          </label>
          <select
            value={skill}
            onChange={(e) => setSkill(e.target.value as any)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Beginner">초급</option>
            <option value="Intermediate">중급</option>
            <option value="Advanced">상급</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CSS/100m (초)
          </label>
          <input
            type="number"
            value={cssPer100}
            onChange={(e) => setCssPer100(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            신장 (cm)
          </label>
          <input
            type="number"
            value={heightCm}
            onChange={(e) => setHeightCm(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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

