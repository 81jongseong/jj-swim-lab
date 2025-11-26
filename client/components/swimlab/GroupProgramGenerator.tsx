/**
 * 🏊‍♂️ SwimLab - 단체반 프로그램 생성 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 강사가 단체반 전체를 위한 공통 프로그램 생성
 * - 자동으로 각 회원별 맞춤 조정사항 생성
 * - 질환/컨디션 기반 페이스 조정 및 주의사항 제공
 * 
 * 🔄 **연동 데이터**
 * - /api/group-classes: 단체반 목록
 * - /api/group-programs: 단체반 프로그램 생성
 * - /api/swim-engine: 프로그램 생성 엔진
 */

'use client';
import { logger } from '@/lib/logger';

import { useState, useEffect } from 'react';
import apiClient from '../../utils/api';

interface GroupClass {
  _id: string;
  className: string;
  level: string;
  currentStudents: number;
  maxStudents: number;
  schedule: {
    dayOfWeek: number[];
    duration: number;
  };
  poolLength: number;
  instructor: string;
}

export default function GroupProgramGenerator({ onClose }: { onClose: () => void }) {
  const [groupClasses, setGroupClasses] = useState<GroupClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<GroupClass | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  // 프로그램 설정
  const [programConfig, setProgramConfig] = useState({
    startDate: '',
    programType: 'weekly' as 'weekly' | 'race',
    goal: '체력 향상',
    mainStrokes: ['freestyle'] as string[],
    excludedStrokes: [] as string[],
    avgCSS: 90, // 평균 CSS (초급 기준)
    autoCalculateCSS: true // CSS 자동 계산 여부
  });

  useEffect(() => {
    loadGroupClasses();
  }, []);

  // 선택된 단체반이 바뀌면 CSS 자동 계산
  useEffect(() => {
    if (selectedClass && programConfig.autoCalculateCSS) {
      calculateAverageCSS();
    }
  }, [selectedClass]);

  const calculateAverageCSS = async () => {
    if (!selectedClass) return;

    try {
      // 단체반의 회원 CSS 가져오기
      const response = await apiClient.get(`/api/group-classes/${selectedClass._id}`);
      if (response.success && response.data) {
        const groupClass = response.data;
        
        // 회원들의 CSS 수집
        const cssValues: number[] = [];
        
        for (const student of (groupClass as any).students || []) {
          try {
            const userResponse = await apiClient.get(`/api/users/${student.userId}`) as any;
            if (userResponse.success && userResponse.data) {
              const css = (userResponse.data as any).studentInfo?.swimmingProfile?.css?.freestyle;
              if (css && css > 0) {
                cssValues.push(css);
              }
            }
          } catch (error) {
            logger.warn(`회원 CSS 조회 실패:`, error);
          }
        }

        // 평균 CSS 계산
        if (cssValues.length > 0) {
          const avgCSS = Math.round(cssValues.reduce((a, b) => a + b, 0) / cssValues.length);
          logger.info(`📊 ${selectedClass.className} 평균 CSS: ${avgCSS}초 (${cssValues.length}명)`);
          setProgramConfig(prev => ({ ...prev, avgCSS }));
        } else {
          // CSS가 없으면 레벨별 기본값
          const defaultCSS = selectedClass.level === 'advanced' ? 70 :
                            selectedClass.level === 'intermediate' ? 85 :
                            95;
          logger.info(`⚠️ CSS 데이터 없음. 레벨별 기본값 사용: ${defaultCSS}초`);
          setProgramConfig(prev => ({ ...prev, avgCSS: defaultCSS }));
        }
      }
    } catch (error) {
      logger.error('평균 CSS 계산 실패:', error);
    }
  };

  const loadGroupClasses = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/group-classes?status=active') as any;
      if (response.success && (response.data as any)?.groupClasses) {
        setGroupClasses((response.data as any).groupClasses);
      } else if (response.success && Array.isArray((response as any).students)) {
        // students 배열이 직접 응답에 있는 경우
        logger.info('✅ students 배열 직접 접근');
      }
    } catch (error) {
      logger.error('단체반 목록 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateProgram = async () => {
    if (!selectedClass || !programConfig.startDate) {
      alert('단체반과 시작일을 선택해주세요!');
      return;
    }

    setGenerating(true);
    try {
      logger.info('🚀 단체반 프로그램 생성 시작:', selectedClass.className);

      // 1. 프로그램 데이터 준비
      const engineInput = {
        startDate: programConfig.startDate,
        days: selectedClass.schedule.dayOfWeek,
        weeklyMinutes: selectedClass.schedule.duration * selectedClass.schedule.dayOfWeek.length,
        poolLen: selectedClass.poolLength,
        strokesAllowed: programConfig.mainStrokes,
        strokesAvoid: programConfig.excludedStrokes,
        css100: {
          freestyle: programConfig.avgCSS,
          backstroke: programConfig.avgCSS + 10,
          breaststroke: programConfig.avgCSS + 15,
          butterfly: programConfig.avgCSS + 20
        },
        conditionIds: [],
        dayCondition: 'normal',
        hasPain: false,
        goal: programConfig.goal,
        weekHistory: []
      };

      // 2. 프로그램 생성 엔진 호출
      const engineResponse = await apiClient.post('/api/swim-engine/generate', engineInput) as any;
      
      if (!engineResponse.success || !engineResponse.data) {
        throw new Error('프로그램 생성 실패');
      }

      logger.info('✅ 프로그램 생성 완료:', engineResponse.data);

      // 3. 단체반 프로그램으로 저장
      const programData = {
        programType: programConfig.programType,
        params: {
          startDate: programConfig.startDate,
          daysPerWeek: selectedClass.schedule.dayOfWeek.length,
          selectedDays: selectedClass.schedule.dayOfWeek.map(d => 
            ['일', '월', '화', '수', '목', '금', '토'][d]
          ),
          sessionDuration: selectedClass.schedule.duration,
          pool: selectedClass.poolLength,
          mainStrokes: programConfig.mainStrokes,
          excludedStrokes: programConfig.excludedStrokes,
          cssPer100: engineInput.css100,
          conditionIds: [],
          goal: programConfig.goal
        },
        content: {
          summary: `${selectedClass.className} - ${programConfig.goal} 프로그램`,
          planExplanation: (engineResponse.data as any).planExplanation || '',
          totalDuration: (engineResponse.data as any).sessions?.reduce((sum: number, s: any) => sum + s.duration, 0) || 0,
          totalMeters: (engineResponse.data as any).sessions?.reduce((sum: number, s: any) => sum + s.distance, 0) || 0,
          sessions: (engineResponse.data as any).sessions || []
        },
        usedMethodIds: (engineResponse.data as any).usedMethodIds || [],
        adjustmentCount: (engineResponse.data as any).adjustmentCount || 0
      };

      const saveResponse = await apiClient.post('/api/group-programs', {
        groupClassId: selectedClass._id,
        programData
      });

      if (saveResponse.success) {
        const adjustmentCount = (saveResponse.data as any)?.adjustmentCount || 0;
        alert(`✅ ${selectedClass.className} 프로그램 생성 완료!\n\n${adjustmentCount}명의 개인별 맞춤 조정사항이 자동 생성되었습니다.`);
        onClose();
      } else {
        throw new Error(saveResponse.message || '프로그램 저장 실패');
      }

    } catch (error: any) {
      logger.error('❌ 프로그램 생성 실패:', error);
      alert(`프로그램 생성 실패: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setGenerating(false);
    }
  };

  const strokes = [
    { id: 'freestyle', label: '자유형', icon: '🏊' },
    { id: 'backstroke', label: '배영', icon: '🏊‍♀️' },
    { id: 'breaststroke', label: '평영', icon: '🤽' },
    { id: 'butterfly', label: '접영', icon: '🦋' }
  ];

  const goals = [
    '체력 향상',
    '기술 개선',
    '지구력 강화',
    '스피드 향상',
    '다이어트'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">📚 단체반 프로그램 생성</h3>
            <p className="text-sm text-gray-600 mt-1">
              단체반 전체를 위한 공통 프로그램을 생성하고, 각 회원별 맞춤 조정사항이 자동 생성됩니다.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. 단체반 선택 */}
          <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-2xl">📚</span>
              <span>1. 단체반 선택</span>
            </h4>
            
            {loading ? (
              <div className="text-center py-4">불러오는 중...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {groupClasses.map((gc) => (
                  <button
                    key={gc._id}
                    onClick={() => setSelectedClass(gc)}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${
                      selectedClass?._id === gc._id
                        ? 'border-blue-600 bg-blue-100'
                        : 'border-gray-300 hover:border-blue-400 bg-white'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">{gc.className}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      👥 {gc.currentStudents}/{gc.maxStudents}명 | 
                      🏊 {gc.poolLength}m 풀 | 
                      ⏱️ {gc.schedule.duration}분
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      📅 주 {gc.schedule.dayOfWeek.length}회
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedClass && (
            <>
              {/* 2. 시작일 */}
              <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">📅</span>
                  <span>2. 프로그램 시작일</span>
                </h4>
                <input
                  type="date"
                  value={programConfig.startDate}
                  onChange={(e) => setProgramConfig({ ...programConfig, startDate: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* 3. 운동 목표 */}
              <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  <span>3. 운동 목표</span>
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {goals.map((goal) => (
                    <button
                      key={goal}
                      onClick={() => setProgramConfig({ ...programConfig, goal })}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        programConfig.goal === goal
                          ? 'bg-purple-600 text-white'
                          : 'bg-white border-2 border-purple-200 text-gray-700 hover:border-purple-400'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. 주 영법 */}
              <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">🏊</span>
                  <span>4. 주 영법 선택</span>
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {strokes.map((stroke) => (
                    <button
                      key={stroke.id}
                      onClick={() => {
                        const isSelected = programConfig.mainStrokes.includes(stroke.id);
                        setProgramConfig({
                          ...programConfig,
                          mainStrokes: isSelected
                            ? programConfig.mainStrokes.filter(s => s !== stroke.id)
                            : [...programConfig.mainStrokes, stroke.id]
                        });
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        programConfig.mainStrokes.includes(stroke.id)
                          ? 'bg-orange-600 text-white'
                          : 'bg-white border-2 border-orange-200 text-gray-700 hover:border-orange-400'
                      }`}
                    >
                      {stroke.icon} {stroke.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. 평균 CSS */}
              <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">⏱️</span>
                  <span>5. 단체반 평균 CSS (자유형 기준, 초/100m)</span>
                </h4>
                
                {/* CSS 자동 계산 토글 */}
                <div className="mb-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoCalcCSS"
                    checked={programConfig.autoCalculateCSS}
                    onChange={(e) => {
                      setProgramConfig({ ...programConfig, autoCalculateCSS: e.target.checked });
                      if (e.target.checked && selectedClass) {
                        calculateAverageCSS();
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <label htmlFor="autoCalcCSS" className="text-sm font-medium text-gray-700">
                    회원들의 CSS로 자동 계산
                  </label>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="60"
                    max="120"
                    step="5"
                    value={programConfig.avgCSS}
                    onChange={(e) => setProgramConfig({ ...programConfig, avgCSS: Number(e.target.value), autoCalculateCSS: false })}
                    className="flex-1"
                    disabled={programConfig.autoCalculateCSS}
                  />
                  <div className="text-2xl font-bold text-yellow-700 w-24 text-center">
                    {programConfig.avgCSS}초
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  💡 초급: 90-110초 | 중급: 80-95초 | 상급: 65-80초 | 마스터: 60-70초
                </div>
                {programConfig.autoCalculateCSS && (
                  <div className="text-xs text-blue-600 mt-2 bg-blue-50 p-2 rounded">
                    ✅ 회원들의 실제 CSS를 기반으로 자동 계산됩니다
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="border-t p-6">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={generateProgram}
              disabled={!selectedClass || !programConfig.startDate || generating}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {generating ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>생성 중...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>프로그램 생성 ({selectedClass?.currentStudents || 0}명 맞춤 조정 포함)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

