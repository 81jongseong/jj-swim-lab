/**
 * 🏊 SwimLab - 프로그램 목록 뷰
 * 
 * 📋 **컴포넌트 목적**
 * - 생성된 모든 훈련 프로그램을 카드 형식으로 표시
 * - 검색/필터 기능
 * - 클릭 시 상세보기/수정/삭제
 * 
 * 🔄 **주요 기능**
 * - 카드 그리드 레이아웃
 * - 프로그램 타입별 필터 (주간/레이스)
 * - 선수별 필터
 * - 날짜별 정렬
 * - 상세보기 모달
 * - 수정/삭제 기능
 */

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  listPrograms, 
  deleteProgram, 
  saveProgram,
  getProgramStats,
  type SavedProgram 
} from '@/lib/swimlab/utils/programStorage';
import { EVIDENCE } from '@/types/evidence';
import { apiClient } from '@/utils/api';
import StatCard from '@/components/StatCard';
import Button from '@/components/Button';
import CompletionInputModal, { type CompletionData } from '@/components/swimlab/CompletionInputModal';
import DayConditionInputModal, { type DayConditionData } from '@/components/swimlab/DayConditionInputModal';
import ConditionDetailModal from '@/components/swimlab/ConditionDetailModal';
import MemberStatistics from '@/components/swimlab/MemberStatistics';
import ProgramCard from '@/components/swimlab/program-list/ProgramCard';

interface ProgramListViewProps {
  selectedAthleteId?: string;
}

export default function ProgramListView({ selectedAthleteId }: ProgramListViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'weekly' | 'race'>('all');
  const [showRecentOnly, setShowRecentOnly] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<SavedProgram | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProgram, setEditedProgram] = useState<SavedProgram | null>(null);
  const [programs, setPrograms] = useState<SavedProgram[]>([]);
  const [editingSessionIdx, setEditingSessionIdx] = useState<number | null>(null);
  const [editingSetIdx, setEditingSetIdx] = useState<number | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [methodDrillSearch, setMethodDrillSearch] = useState('');
  const [methodDrillFilter, setMethodDrillFilter] = useState<'all' | 'method' | 'drill'>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completionSessionIdx, setCompletionSessionIdx] = useState<number | null>(null);
  const [showDayConditionModal, setShowDayConditionModal] = useState(false);
  const [dayConditionSessionIdx, setDayConditionSessionIdx] = useState<number | null>(null);
  // 레이스 프로그램 phases용 인덱스
  const [racePhaseIdx, setRacePhaseIdx] = useState<number | null>(null);
  const [raceWeekIdx, setRaceWeekIdx] = useState<number | null>(null);
  const [raceDayIdx, setRaceDayIdx] = useState<number | null>(null);
  const [showConditionDetail, setShowConditionDetail] = useState(false);
  const [selectedConditionId, setSelectedConditionId] = useState<string | null>(null);
  const [showMemberStatistics, setShowMemberStatistics] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // 훈련법/드릴 목록
  const [trainingMethods, setTrainingMethods] = useState<any[]>([]);
  const [drills, setDrills] = useState<any[]>([]);
  // 세트 수정 임시 저장
  const [tempSetContent, setTempSetContent] = useState<string>('');
  
  // stats를 programs 기반으로 계산
  const stats = useMemo(() => {
    const total = programs.length;
    const weekly = programs.filter(p => p.programType === 'weekly').length;
    const race = programs.filter(p => p.programType === 'race').length;
    return { total, weekly, race };
  }, [programs]);

  // 서버에서 프로그램 목록 로드
  useEffect(() => {
    loadProgramsFromServer();
    loadTrainingMethodsAndDrills();
  }, [selectedAthleteId]);

  const loadTrainingMethodsAndDrills = async () => {
    try {
      console.log('🔄 훈련법/드릴 로드 시작...');
      
      // 훈련법 로드
      const methodsRes = await apiClient.get('/api/swim-training-methods?isActive=true');
      console.log('📊 훈련법 응답:', methodsRes);
      setTrainingMethods(methodsRes.data || methodsRes || []);
      
      // 드릴 로드
      const drillsRes = await apiClient.get('/api/swim-drills?isActive=true');
      console.log('🎯 드릴 응답:', drillsRes);
      setDrills(drillsRes.data || drillsRes || []);
      
      console.log('✅ 훈련법/드릴 로드 완료:', {
        trainingMethods: (methodsRes.data || methodsRes)?.length || 0,
        drills: (drillsRes.data || drillsRes)?.length || 0
      });
    } catch (error) {
      console.error('❌ 훈련법/드릴 로드 오류:', error);
      setErrorMessage('훈련법/드릴 데이터를 불러오는 중 오류가 발생했습니다. 프로그램 수정 기능이 제한될 수 있습니다.');
      setTimeout(() => setErrorMessage(null), 5000);
      // 오류 시에도 빈 배열로 초기화하여 UI가 표시되도록
      setTrainingMethods([]);
      setDrills([]);
    }
  };

  const loadProgramsFromServer = async () => {
    setIsLoading(true);
    try {
      let serverPrograms: any[] = [];
      
      // 선택된 회원이 있으면 해당 회원의 프로그램만 가져오기
      if (selectedAthleteId) {
        console.log(`📥 회원 ${selectedAthleteId}의 프로그램 로드 중...`);
        const response = await apiClient.get(`/api/swim-programs/athlete/${selectedAthleteId}?limit=50`);
        // API 응답 구조: { count: 3, programs: [...] }
        serverPrograms = response.programs || response.data?.programs || [];
        console.log(`✅ ${serverPrograms.length}개 프로그램 로드됨`, serverPrograms);
      } else {
        // 회원 선택 안 했을 때는 모든 프로그램 조회
        console.log('📥 모든 프로그램 로드 중...');
        const response = await apiClient.get(`/api/swim-programs/all?limit=100`);
        serverPrograms = response.programs || response.data?.programs || [];
        console.log(`✅ 전체 ${serverPrograms.length}개 프로그램 로드됨`);
      }
      
      // localStorage와 병합 (중복 제거)
      const localPrograms = listPrograms();
      const allPrograms = [...localPrograms];
      
      // 서버 프로그램을 SavedProgram 형식으로 변환하여 추가
      serverPrograms.forEach((sp: any) => {
        if (!allPrograms.find(p => p.id === sp._id || p.id === sp.id)) {
          // 서버 데이터 구조 확인 및 안전하게 변환
          // 단체반은 groupClassName, 개인 PT는 athleteName 사용
          const displayName = sp.groupClassName || sp.athleteName || '이름 없음';
          
          allPrograms.push({
            id: sp._id || sp.id,
            _id: sp._id, // MongoDB ID 저장 (삭제 시 사용)
            athleteName: displayName,
            programType: sp.programType || 'weekly',
            programScope: sp.programScope,
            athleteLevel: sp.athleteLevel,
            createdAt: sp.createdAt || new Date().toISOString(),
            params: sp.params || {
              startDate: new Date().toISOString().split('T')[0],
              daysPerWeek: 3,
              selectedDays: [],
              sessionDuration: 60,
              pool: 25,
              mainStrokes: [],
              excludedStrokes: [],
              cssPer100: {},
              conditionIds: [],
              goal: '기술 연마'
            },
            content: sp.content || {
              summary: '프로그램',
              sessions: [],
              phases: [] // 레이스 프로그램용
            },
            // 완료율 정보를 직접 저장 (서버에서 가져온 데이터)
            completionData: sp.content?.sessions?.map((session: any) => ({
              sessionIdx: sp.content.sessions.indexOf(session),
              completion: session.completion
            })) || []
          } as SavedProgram);
        }
      });
      
      setPrograms(allPrograms);
    } catch (error) {
      console.error('프로그램 로드 실패:', error);
      setErrorMessage('프로그램을 불러오는 중 오류가 발생했습니다. 로컬 데이터를 사용합니다.');
      setTimeout(() => setErrorMessage(null), 5000);
      // 실패 시 localStorage만 사용
      setPrograms(listPrograms());
    } finally {
      setIsLoading(false);
    }
  };

  // 최근 1달 프로그램 계산
  const recentMonthCount = useMemo(() => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return programs.filter(p => new Date(p.createdAt) >= oneMonthAgo).length;
  }, [programs]);

  // 필터링된 프로그램 목록
  const filteredPrograms = useMemo(() => {
    let result = programs;
    
    // 타입 필터
    if (filterType !== 'all') {
      result = result.filter(p => p.programType === filterType);
    }
    
    // 최근 1달 필터
    if (showRecentOnly) {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      result = result.filter(p => new Date(p.createdAt) >= oneMonthAgo);
    }
    
    // 검색 필터
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.athleteName.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    }
    
    return result;
  }, [programs, filterType, showRecentOnly, searchQuery]);

  const handleDelete = async (id: string) => {
    if (!confirm('이 프로그램을 삭제하시겠습니까?')) return;
    
    try {
      // 서버에서 삭제
      const programToDelete = programs.find(p => p.id === id);
      console.log('🔍 삭제 대상 프로그램:', programToDelete);
      
      if (programToDelete && programToDelete._id) {
        console.log('🗑️ 서버에서 프로그램 삭제 시도:', programToDelete._id);
        
        try {
          const response = await apiClient.delete(`/api/swim-programs/${programToDelete._id}`);
          console.log('📥 삭제 API 응답:', response);
          
          if (response.success) {
            console.log('✅ 서버 삭제 성공');
            alert('프로그램이 삭제되었습니다.');
          } else {
            console.warn('⚠️ 서버 삭제 실패:', response);
            alert('서버에서 프로그램 삭제에 실패했습니다.');
            return;
          }
        } catch (error) {
          console.error('❌ 삭제 API 호출 오류:', error);
          setErrorMessage('프로그램 삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
          setTimeout(() => setErrorMessage(null), 5000);
          return;
        }
      } else {
        console.log('⚠️ 서버 ID 없음 (로컬 전용 프로그램), 로컬만 삭제');
        alert('로컬 프로그램이 삭제됩니다.');
      }
      
      // 로컬에서도 삭제
    deleteProgram(id);
      
      // 상세 모달 닫기
    setSelectedProgram(null);
      
      // 목록 새로고침
      console.log('🔄 프로그램 목록 새로고침...');
      await loadProgramsFromServer();
      
    } catch (error) {
      console.error('❌ 프로그램 삭제 실패:', error);
      setErrorMessage('프로그램 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleCompletionSubmit = async (data: CompletionData) => {
    if (!selectedProgram) return;

    try {
      const programId = selectedProgram._id || selectedProgram.id;
      
      // 레이스 프로그램 phases 내부 날짜인 경우
      if (racePhaseIdx !== null && raceWeekIdx !== null && raceDayIdx !== null) {
        console.log('💾 레이스 프로그램 완료율 저장 (phases):', { 
          programId, phaseIdx: racePhaseIdx, weekIdx: raceWeekIdx, dayIdx: raceDayIdx, data 
        });
        
        // 완료율 계산
        let completionRate = 0;
        if (data.completionType === 'detailed' && data.detailedCompletion) {
          const totalPlanned = data.detailedCompletion.sets.reduce((sum, set) => 
            sum + (set.planned.distance * set.planned.reps), 0
          );
          const totalActual = data.detailedCompletion.sets.reduce((sum, set) => 
            sum + (set.actual.completed ? (set.actual.distance * set.actual.reps) : 0), 0
          );
          completionRate = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0;
        } else if (data.simpleCompletion) {
          completionRate = data.simpleCompletion.overallRate;
        }
        
        // 로컬 업데이트
        const updatedProgram = { ...selectedProgram };
        if (updatedProgram.content.phases && 
            updatedProgram.content.phases[racePhaseIdx]?.weeklyPlans &&
            updatedProgram.content.phases[racePhaseIdx].weeklyPlans[raceWeekIdx]?.days) {
          
          const day = updatedProgram.content.phases[racePhaseIdx].weeklyPlans[raceWeekIdx].days[raceDayIdx];
          (day as any).completion = {
            completionRate,
            feeling: data.simpleCompletion?.feeling || data.detailedCompletion?.feeling,
            notes: data.simpleCompletion?.notes || data.detailedCompletion?.notes,
            inputAt: new Date().toISOString()
          };
        }
        setSelectedProgram(updatedProgram);
        alert(`완료율 ${completionRate}%가 저장되었습니다! (로컬)`);
        
        // 인덱스 초기화
        setRacePhaseIdx(null);
        setRaceWeekIdx(null);
        setRaceDayIdx(null);
        return;
      }
      
      // 일반 세션인 경우
      if (completionSessionIdx === null) return;
      
      console.log('💾 완료율 저장 시도:', { programId, sessionIdx: completionSessionIdx, data });
      
      const response = await apiClient.post(
        `/api/swim-programs/${programId}/sessions/${completionSessionIdx}/completion`,
        data
      );

      console.log('🔍 서버 응답 구조:', {
        'response.data': response.data,
        'response.data.data': response.data?.data,
        'response.data.data.completionRate': response.data?.data?.completionRate,
        'data.simpleCompletion?.overallRate': data.simpleCompletion?.overallRate,
        'data.detailedCompletion': data.detailedCompletion
      });

      // 완료율 계산: 상세 모드는 직접 계산, 간단 모드는 입력값 사용
      let completionRate = 0;
      if (data.completionType === 'detailed' && data.detailedCompletion) {
        const totalPlanned = data.detailedCompletion.sets.reduce((sum, set) => 
          sum + (set.planned.distance * set.planned.reps), 0
        );
        const totalActual = data.detailedCompletion.sets.reduce((sum, set) => 
          sum + (set.actual.completed ? (set.actual.distance * set.actual.reps) : 0), 0
        );
        completionRate = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0;
      } else if (data.simpleCompletion) {
        completionRate = data.simpleCompletion.overallRate;
      } else {
        completionRate = response.data?.data?.completionRate || 0;
      }

      console.log('✅ 최종 완료율:', completionRate);
      alert(`완료율 ${completionRate}%가 저장되었습니다!`);
      
      // 프로그램 목록 새로고침
      await refresh();
      
      // 선택된 프로그램도 업데이트 (세션의 completion 데이터 추가)
      if (selectedProgram) {
        const updatedProgram = { ...selectedProgram };
        if (updatedProgram.content && updatedProgram.content.sessions) {
          if (!updatedProgram.content.sessions[completionSessionIdx].completion) {
            updatedProgram.content.sessions[completionSessionIdx].completion = {};
          }
          updatedProgram.content.sessions[completionSessionIdx].completion = {
            completionRate,
            feeling: data.simpleCompletion?.feeling || data.detailedCompletion?.feeling,
            notes: data.simpleCompletion?.notes || data.detailedCompletion?.notes,
            inputAt: new Date().toISOString()
          };
        }
        setSelectedProgram(updatedProgram);
      }
    } catch (error) {
      console.error('완료율 저장 오류:', error);
      setErrorMessage('완료율 저장에 실패했습니다. 네트워크 연결을 확인해주세요.');
      setTimeout(() => setErrorMessage(null), 5000);
      throw error;
    }
  };

  const refresh = () => loadProgramsFromServer();

  // 🌤️ 당일 컨디션 제출 핸들러
  const handleDayConditionSubmit = async (data: any) => {
    if (!selectedProgram) return;

    try {
      const programId = selectedProgram._id || selectedProgram.id;
      
      // 레이스 프로그램 phases 내부 날짜인 경우
      if (racePhaseIdx !== null && raceWeekIdx !== null && raceDayIdx !== null) {
        console.log('🌤️ 레이스 프로그램 당일 컨디션 저장 (phases):', { 
          programId, phaseIdx: racePhaseIdx, weekIdx: raceWeekIdx, dayIdx: raceDayIdx, data 
        });
        
        // 로컬 업데이트 (서버 API는 나중에 구현)
        const updatedProgram = { ...selectedProgram };
        if (updatedProgram.content.phases && 
            updatedProgram.content.phases[racePhaseIdx]?.weeklyPlans &&
            updatedProgram.content.phases[racePhaseIdx].weeklyPlans[raceWeekIdx]?.days) {
          
          const day = updatedProgram.content.phases[racePhaseIdx].weeklyPlans[raceWeekIdx].days[raceDayIdx];
          (day as any).dayCondition = {
            ...data,
            inputAt: new Date().toISOString()
          };
        }
        setSelectedProgram(updatedProgram);
        alert('당일 컨디션이 저장되었습니다! (로컬)');
        
        // 인덱스 초기화
        setRacePhaseIdx(null);
        setRaceWeekIdx(null);
        setRaceDayIdx(null);
        return;
      }
      
      // 일반 세션인 경우
      if (dayConditionSessionIdx === null) return;
      
      console.log('🌤️ 당일 컨디션 저장 시도:', { programId, sessionIdx: dayConditionSessionIdx, data });
      
      const response = await apiClient.post(
        `/api/swim-programs/${programId}/sessions/${dayConditionSessionIdx}/day-condition`,
        data
      );

      console.log('✅ 당일 컨디션 저장 성공:', response.data);
      alert('당일 컨디션이 저장되었습니다!');
      
      // 프로그램 목록 새로고침
      await refresh();
      
      // 선택된 프로그램도 업데이트
      if (selectedProgram) {
        const updatedProgram = { ...selectedProgram };
        if (updatedProgram.content && updatedProgram.content.sessions) {
          if (!updatedProgram.content.sessions[dayConditionSessionIdx].dayCondition) {
            updatedProgram.content.sessions[dayConditionSessionIdx].dayCondition = {};
          }
          updatedProgram.content.sessions[dayConditionSessionIdx].dayCondition = {
            ...data,
            inputAt: new Date().toISOString()
          };
        }
        setSelectedProgram(updatedProgram);
      }
    } catch (error) {
      console.error('당일 컨디션 저장 오류:', error);
      setErrorMessage('당일 컨디션 저장에 실패했습니다. 네트워크 연결을 확인해주세요.');
      setTimeout(() => setErrorMessage(null), 5000);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* 에러 메시지 */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800">오류 발생</h4>
              <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-600 hover:text-red-800"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* 헤더 및 통계 */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
          <h3 className="text-xl font-semibold text-gray-900">생성된 프로그램 목록</h3>
            <p className="text-sm text-gray-500 mt-1">
              {selectedAthleteId ? '선택된 회원의 프로그램' : '모든 프로그램'}
            </p>
          </div>
          <div className="flex gap-2">
            {selectedAthleteId && (
              <Button
                onClick={() => {
                  setShowMemberStatistics(true);
                }}
                variant="primary"
                size="sm"
              >
                📊 통계 보기
              </Button>
            )}
          <Button
            onClick={refresh}
            variant="ghost"
            size="sm"
          >
            🔄 새로고침
          </Button>
          </div>
        </div>
        
        {/* 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            title="전체 프로그램"
            value={`${stats.total}개`}
            icon="📋"
            color="blue"
            subtitle={filterType === 'all' ? '전체 보기' : '클릭하여 전체 보기'}
            onClick={() => setFilterType('all')}
          />
          <StatCard
            title="주간 계획"
            value={`${stats.weekly}개`}
            icon="📅"
            color="green"
            subtitle={filterType === 'weekly' ? '필터 적용 중' : '클릭하여 필터링'}
            onClick={() => setFilterType(filterType === 'weekly' ? 'all' : 'weekly')}
          />
          <StatCard
            title="레이스 플랜"
            value={`${stats.race}개`}
            icon="🏁"
            color="purple"
            subtitle={filterType === 'race' ? '필터 적용 중' : '클릭하여 필터링'}
            onClick={() => setFilterType(filterType === 'race' ? 'all' : 'race')}
          />
          <StatCard
            title="최근 1달"
            value={`${recentMonthCount}개`}
            icon="🆕"
            color="orange"
            subtitle={showRecentOnly ? '필터 적용 중' : '클릭하여 필터링'}
            onClick={() => setShowRecentOnly(!showRecentOnly)}
          />
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white rounded-lg border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              선수 이름 검색
            </label>
            <input
              type="text"
              placeholder="이름으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              프로그램 타입
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              <option value="weekly">주간 계획</option>
              <option value="race">레이스 플랜</option>
            </select>
          </div>
        </div>
      </div>

      {/* 프로그램 카드 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPrograms.length === 0 && isLoading ? (
          <div className="col-span-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="text-gray-400 text-4xl mb-4">⏳</div>
            <p className="text-gray-500">프로그램 로딩 중...</p>
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="col-span-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="text-gray-400 text-lg mb-2">📭</div>
            <p className="text-gray-500">
              {searchQuery || filterType !== 'all' 
                ? '검색 결과가 없습니다' 
                : '아직 생성된 프로그램이 없습니다'}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              컨디션 설정 탭에서 프로그램을 생성하세요
            </p>
          </div>
        ) : (
          filteredPrograms.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              onClick={() => setSelectedProgram(program)}
            />
          ))
        )}
      </div>

      {/* 프로그램 상세 모달 */}
      {selectedProgram && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProgram(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🏊‍♂️</span>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedProgram.athleteName}의 {selectedProgram.programType === 'weekly' ? '주간 계획' : '레이스 플랜'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    생성일: {new Date(selectedProgram.createdAt).toLocaleString('ko-KR')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProgram(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* 본문 */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* 파라미터 정보 */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">📋 프로그램 정보</h4>
                
                {/* 목표 표시 */}
                {selectedProgram.params.goal && (
                  <div className="mb-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold inline-block ${
                      selectedProgram.params.goal === '기술 연마' ? 'bg-blue-100 text-blue-700' :
                      selectedProgram.params.goal === '체력 향상' ? 'bg-green-100 text-green-700' :
                      selectedProgram.params.goal === '실력 향상' ? 'bg-purple-100 text-purple-700' :
                      selectedProgram.params.goal === '체중 감량' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      🎯 {selectedProgram.params.goal}
                    </span>
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">시작일:</span>
                    <p className="font-medium">{selectedProgram.params.startDate}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">주당 훈련:</span>
                    <p className="font-medium">{selectedProgram.params.daysPerWeek}일</p>
                  </div>
                  <div>
                    <span className="text-gray-600">주간 시간:</span>
                    <p className="font-medium">
                      {selectedProgram.params.sessionDuration && selectedProgram.params.daysPerWeek
                        ? `${selectedProgram.params.sessionDuration}분 × ${selectedProgram.params.daysPerWeek}회 = ${selectedProgram.params.sessionDuration * selectedProgram.params.daysPerWeek}분`
                        : `${selectedProgram.content.totalDuration || 'N/A'}분`
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">주간 거리:</span>
                    <p className="font-medium">
                      {selectedProgram.programType === 'race' && selectedProgram.content.phases && selectedProgram.content.phases.length > 0
                        ? (() => {
                            // 각 phase의 주수를 계산
                            const totalWeeks = selectedProgram.content.phases.reduce((sum: number, phase: any) => 
                              sum + (phase.weekEnd - phase.weekStart + 1), 0
                            );
                            // 전체 volumeTarget을 주수로 나눔
                            const totalVolume = selectedProgram.content.phases.reduce((sum: number, phase: any) => 
                              sum + phase.volumeTarget, 0
                            );
                            const weeklyAvg = Math.round(totalVolume / totalWeeks);
                            return `${weeklyAvg.toLocaleString()}m (평균)`;
                          })()
                        : `${selectedProgram.content.totalMeters?.toLocaleString() || 'N/A'}m`
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">풀 길이:</span>
                    <p className="font-medium">{selectedProgram.params.pool}m</p>
                  </div>
                  <div>
                    <span className="text-gray-600">주 영법:</span>
                    <p className="font-medium">
                      {(selectedProgram.params.mainStrokes && selectedProgram.params.mainStrokes.length > 0)
                        ? selectedProgram.params.mainStrokes.map((stroke: string) => {
                            const strokeNames: Record<string, string> = {
                              'FR': '자유형', 'freestyle': '자유형',
                              'BK': '배영', 'backstroke': '배영',
                              'BR': '평영', 'breaststroke': '평영',
                              'FL': '접영', 'butterfly': '접영',
                              'elementary_backstroke': '기본배영',
                              'sidestroke': '횡영'
                            };
                            return strokeNames[stroke] || stroke;
                          }).join(', ')
                        : selectedProgram.params.stroke === 'FR' ? '자유형' :
                       selectedProgram.params.stroke === 'BK' ? '배영' :
                          selectedProgram.params.stroke === 'BR' ? '평영' : '접영'
                      }
                    </p>
                  </div>
                  {selectedProgram.params.excludedStrokes && selectedProgram.params.excludedStrokes.length > 0 && (
                    <div>
                      <span className="text-gray-600">회피 영법:</span>
                      <p className="font-medium text-red-600">
                        {selectedProgram.params.excludedStrokes.map((stroke: string) => {
                          const strokeNames: Record<string, string> = {
                            'FR': '자유형', 'freestyle': '자유형',
                            'BK': '배영', 'backstroke': '배영',
                            'BR': '평영', 'breaststroke': '평영',
                            'FL': '접영', 'butterfly': '접영',
                            'elementary_backstroke': '기본배영',
                            'sidestroke': '횡영'
                          };
                          return strokeNames[stroke] || stroke;
                        }).join(', ')}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">실력:</span>
                    <p className="font-medium">
                      {selectedProgram.params.skill ? 
                        (selectedProgram.params.skill === 'Beginner' ? '초급' :
                         selectedProgram.params.skill === 'Intermediate' ? '중급' : '상급') : 
                        'CSS 기반 판단'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">CSS/100m:</span>
                    <p className="font-medium">
                      {typeof selectedProgram.params.cssPer100 === 'object' 
                        ? Object.entries(selectedProgram.params.cssPer100)
                            .filter(([stroke, css]) => {
                              // 경영 영법만 표시 (기본배영, 횡영 제외)
                              return css > 0 && !['elementary_backstroke', 'sidestroke'].includes(stroke);
                            })
                            .map(([stroke, css]) => {
                              const strokeNames = {
                                FR: '자유형',
                                freestyle: '자유형',
                                BK: '배영',
                                backstroke: '배영',
                                BR: '평영',
                                breaststroke: '평영',
                                FL: '접영',
                                butterfly: '접영',
                                IM: '개인혼영'
                              };
                              return `${strokeNames[stroke] || stroke}: ${css}초`;
                            })
                            .join(', ') || 'CSS 미입력'
                        : `${selectedProgram.params.cssPer100}초`
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">신장:</span>
                    <p className="font-medium">{selectedProgram.params.heightCm || '회원 정보 참조'}cm</p>
                  </div>
                </div>
                
                {/* 레이스 전용 정보 */}
                {selectedProgram.programType === 'race' && selectedProgram.params.raceDate && (
                  <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-purple-600">🏆 대회일:</span>
                      <p className="font-medium">{selectedProgram.params.raceDate}</p>
                    </div>
                    <div>
                      <span className="text-purple-600">📉 테이퍼:</span>
                      <p className="font-medium">{selectedProgram.params.taperWeeks}주</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 컨디션 정보 */}
              {selectedProgram.params.conditionIds.length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-4 mb-6 border border-yellow-200">
                  <h4 className="font-semibold text-yellow-900 mb-3">⚕️ 질환 기반 조절 내역</h4>
                  <div className="space-y-2 mb-3">
                    {selectedProgram.params.conditionIds.map((id) => {
                      const adjustments: string[] = [];
                      
                      // 어깨 질환
                      if (id.includes('shoulder') || id.includes('어깨')) {
                        adjustments.push('🏊 자유형/접영 강도 70% (페이스 15% 느림)');
                        adjustments.push('🚫 패들 금지');
                        adjustments.push('📏 Z4 고강도 300m 제한');
                      }
                      // 무릎 질환
                      if (id.includes('knee') || id.includes('무릎')) {
                        adjustments.push('🚫 평영 금지');
                        adjustments.push('🏊 접영 강도 70% (돌핀킥 부담)');
                        adjustments.push('💡 풀부이 권장');
                      }
                      // 허리 질환
                      if (id.includes('back') || id.includes('spine') || id.includes('허리')) {
                        adjustments.push('🚫 Z5 고강도 금지');
                        adjustments.push('📏 Z4 200m 제한');
                        adjustments.push('⏱️ 휴식 시간 증가 (+10초)');
                      }
                      // 염소 민감
                      if (id.includes('chlorine') || id.includes('염소')) {
                        adjustments.push('🚫 Z5 고강도 금지');
                        adjustments.push('📏 Z4 300m 제한');
                        adjustments.push('⏱️ 휴식 시간 증가 (+10초, 환기)');
                        adjustments.push('🏊 배영 비중 증가 (얼굴 물 밖)');
                      }
                      
                      return (
                        <button
                        key={id} 
                          onClick={() => {
                            setSelectedConditionId(id);
                            setShowConditionDetail(true);
                          }}
                          className="w-full bg-white rounded p-3 border border-yellow-300 hover:border-yellow-400 hover:shadow-lg transition-all text-left"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-semibold text-yellow-900">{id}</p>
                            <span className="text-xs text-yellow-600">상세보기 →</span>
                          </div>
                          {adjustments.length > 0 && (
                            <ul className="text-xs text-yellow-700 space-y-1">
                              {adjustments.map((adj, i) => (
                                <li key={i}>• {adj}</li>
                              ))}
                            </ul>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="text-xs text-yellow-700 bg-yellow-100 rounded p-2">
                    💡 <strong>원래 프로그램</strong>은 컨디션이 없는 정상 상태 기준입니다. 
                    위 조절 사항이 적용되어 <strong>페이스가 느려지거나 거리가 조정</strong>되었습니다.
                  </div>
                </div>
              )}

              {/* 프로그램 내용 */}
              <div className="bg-white rounded-lg border p-4">
                {/* 레이스 프로그램이 아닐 때만 표시 */}
                {selectedProgram.programType !== 'race' && (
                  <>
                <h4 className="font-semibold text-gray-900 mb-3">🏊‍♂️ 훈련 프로그램</h4>
                
                {/* 요약 */}
                <div className="bg-blue-50 p-3 rounded mb-4">
                  <p className="text-sm text-blue-800">{selectedProgram.content.summary}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    총 거리: {selectedProgram.content.totalMeters.toLocaleString()}m
                  </p>
                </div>

                    {/* 주간 계획 설명 (있는 경우) */}
                    {selectedProgram.content.planExplanation && (
                      <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
                        <h5 className="font-semibold text-green-900 mb-2">📋 주간 훈련 계획 논리</h5>
                        <div className="text-sm text-green-800 whitespace-pre-line">
                          {selectedProgram.content.planExplanation}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* 레이스 프로그램 - Phases 상세 */}
                {selectedProgram.programType === 'race' && selectedProgram.content.phases && (
                  <div className="mb-6 space-y-4">
                    <h5 className="font-semibold text-gray-900 mb-3">🏆 페이즈별 훈련 계획</h5>
                    {selectedProgram.content.phases.map((phase: any, phaseIdx: number) => {
                      // Phase 정보
                      const phaseName = phase.phase === 'base' ? 'Base (기초)' :
                                       phase.phase === 'build' ? 'Build (증가)' :
                                       phase.phase === 'peak' ? 'Peak (정점)' :
                                       phase.phase === 'taper' ? 'Taper (조정)' : phase.phase;
                      
                      const phaseFocus = phase.focus || '페이즈 목표';
                      
                      return (
                        <div key={phaseIdx} className="border-2 rounded-lg p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                          <div className="flex items-center justify-between mb-3">
                            <h6 className="font-bold text-lg text-purple-900">
                              {phaseName}
                            </h6>
                            <span className="px-3 py-1 bg-purple-200 text-purple-900 rounded-full text-xs font-semibold">
                              Week {phase.weekStart}-{phase.weekEnd} ({phase.weekEnd - phase.weekStart + 1}주)
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-3 font-medium">
                            🎯 {phaseFocus}
                          </p>
                          <div className="text-xs text-gray-600 mb-4">
                            주간 목표: {phase.volumeTarget}m | 강도 분포: Z1 {phase.intensityDistribution?.z1}%, Z2 {phase.intensityDistribution?.z2}%, Z3 {phase.intensityDistribution?.z3}%, Z4 {phase.intensityDistribution?.z4}%, Z5 {phase.intensityDistribution?.z5}%
                          </div>
                          
                          {/* 주차별 세션 상세 */}
                          <div className="space-y-3">
                            {phase.weeklyPlans && phase.weeklyPlans.map((weekPlan: any, weekIdx: number) => (
                              <div key={weekIdx} className="bg-white rounded-lg p-4 border-2 border-purple-100">
                                {/* phaseIdx는 외부 map에서 가져와야 함 */}
                                <div className="flex items-center justify-between mb-3">
                                  <p className="text-sm font-bold text-purple-900">
                                    📅 Week {phase.weekStart + weekIdx}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    주간 총거리: {weekPlan.days?.reduce((sum: number, day: any) => sum + (day.totalMeters || 0), 0) || 0}m
                                  </p>
                                </div>
                                
                                {/* 일별 훈련 */}
                                {weekPlan.days && weekPlan.days.map((day: any, dayIdx: number) => (
                                  <div key={dayIdx} className="mb-4 last:mb-0 pb-4 last:pb-0 border-b last:border-b-0">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2 flex-1">
                                        <h6 className="font-semibold text-blue-600">{day.date}</h6>
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                          {day.themeDesc || day.theme}
                                        </span>
                                        <span className="text-xs text-gray-600">
                                          {day.totalMeters}m / {Math.round(day.totalDuration)}분
                                        </span>
                                      </div>
                                      
                                      {/* 🌤️ 컨디션 & 완료율 버튼 */}
                                      <div className="flex gap-2 items-center">
                                        {/* 당일 컨디션 */}
                                        {(() => {
                                          const dayDate = day.date ? new Date(day.date) : null;
                                          const today = new Date();
                                          today.setHours(0, 0, 0, 0);
                                          
                                          if (day.dayCondition) {
                                            const emoji = {
                                              'very_good': '😄', 'good': '🙂', 'normal': '😐', 
                                              'tired': '😓', 'very_tired': '😫'
                                            }[day.dayCondition.condition] || '😐';
                                            return (
                                              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                                                {emoji}
                                              </span>
                                            );
                                          } else if (dayDate && dayDate >= today) {
                                            return (
                                              <button
                                                onClick={() => {
                                                  setRacePhaseIdx(phaseIdx);
                                                  setRaceWeekIdx(weekIdx);
                                                  setRaceDayIdx(dayIdx);
                                                  setShowDayConditionModal(true);
                                                }}
                                                className="px-3 py-1 bg-purple-500 text-white rounded-lg text-xs hover:bg-purple-600 font-medium"
                                              >
                                                🌤️ 컨디션
                                              </button>
                                            );
                                          }
                                          return null;
                                        })()}
                                        
                                        {/* 완료율 */}
                                        {(() => {
                                          if (day.completion && day.completion.completionRate !== undefined) {
                                            return (
                                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                                                ✓ {day.completion.completionRate}%
                                              </span>
                                            );
                                          } else {
                                            return (
                                              <button
                                                onClick={() => {
                                                  setRacePhaseIdx(phaseIdx);
                                                  setRaceWeekIdx(weekIdx);
                                                  setRaceDayIdx(dayIdx);
                                                  setShowCompletionModal(true);
                                                }}
                                                className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600 font-medium"
                                              >
                                                📝 완료율
                                              </button>
                                            );
                                          }
                                        })()}
                                      </div>
                                    </div>
                                    
                                    {/* 세트 목록 */}
                                    <div className="space-y-1 pl-4">
                                      {day.sets && day.sets.map((set: any, setIdx: number) => (
                                        <div 
                                          key={setIdx} 
                                          className="text-xs text-gray-700 flex items-start gap-2 hover:bg-blue-50 p-2 rounded cursor-pointer transition-colors"
                                          onClick={() => {
                            // 레이스 프로그램 수정 모드로 전환
                            setEditedProgram(selectedProgram);
                            setIsEditing(true);
                            // phases 구조를 sessions처럼 변환하여 수정 가능하게
                            setEditingSessionIdx(phaseIdx * 100 + weekIdx); // 고유 인덱스 생성
                            setEditingSetIdx(setIdx);
                            setRacePhaseIdx(phaseIdx);
                            setRaceWeekIdx(weekIdx);
                            setRaceDayIdx(dayIdx);
                            // 임시 저장 (취소 가능하도록)
                            setTempSetContent(set.desc || '');
                                          }}
                                          title="클릭하여 세트 수정"
                                        >
                                          <span className="text-gray-400 font-mono">•</span>
                                          <div className="flex-1">
                                            <span className="font-medium">{set.desc}</span>
                                            {set.whySet && (
                                              <span className="text-gray-500 ml-2">- {set.whySet}</span>
                                            )}
                                          </div>
                                          <span className="text-blue-600 text-xs opacity-0 group-hover:opacity-100">✏️</span>
                                        </div>
                                      ))}
                                    </div>
                                    
                                    {/* 주의사항 */}
                                    {day.notes && day.notes.length > 0 && (
                                      <div className="mt-2 pl-4 space-y-1">
                                        {day.notes.map((note: string, noteIdx: number) => {
                                          // 질환명 추출 (예: "어깨 충돌증후군: freestyle=70%...")
                                          const conditionMatch = note.match(/^([^:]+):/);
                                          const conditionName = conditionMatch ? conditionMatch[1].trim() : null;
                                          
                                          // 질환 ID 추정 (간단한 매핑)
                                          const conditionIdMap: Record<string, string> = {
                                            '어깨 충돌증후군': 'shoulder_impingement',
                                            '평영 무릎': 'breaststroker_knee',
                                            '무릎 통증': 'knee_pain',
                                            '허리 통증': 'low_back_pain',
                                            '염소 민감': 'chlorine_sensitivity'
                                          };
                                          const conditionId = conditionName ? conditionIdMap[conditionName] : null;
                                          
                                          return (
                                            <div key={noteIdx} className="text-xs text-orange-600">
                                              ⚠️ {conditionName && conditionId ? (
                                                <>
                                                  <button
                                                    onClick={() => {
                                                      setSelectedConditionId(conditionId);
                                                      setShowConditionDetail(true);
                                                    }}
                                                    className="font-semibold underline hover:text-orange-800"
                                                  >
                                                    {conditionName}
                                                  </button>
                                                  : {note.substring(conditionName.length + 1)}
                                                </>
                                              ) : note}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 🌤️ 당일 컨디션 조절 요약 */}
                {selectedProgram.content.sessions.some((s: any) => s.dayCondition) && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      🌤️ 당일 컨디션 기반 조절 내역
                    </h5>
                    <div className="space-y-2">
                      {selectedProgram.content.sessions.map((session: any, idx: number) => {
                        if (!session.dayCondition) return null;
                        
                        const cond = session.dayCondition;
                        const adjustments: string[] = [];
                        
                        if (cond.condition === 'very_tired') adjustments.push('💤 매우 피곤함 → 강도 15% 감소');
                        if (cond.condition === 'tired') adjustments.push('😓 피곤함 → 강도 10% 감소');
                        if (cond.hasPain) adjustments.push(`⚠️ 통증(${cond.painLocation || '부위 미상'}) → 강도 20% 감소`);
                        if (cond.sleepQuality && cond.sleepQuality < 5) adjustments.push('😴 수면 부족 → 회복 위주 훈련');
                        if (cond.stressLevel && cond.stressLevel > 7) adjustments.push('😰 스트레스 높음 → 편안한 페이스');
                        if (cond.condition === 'very_good') adjustments.push('😄 컨디션 매우 좋음 → 강도 5% 증가');
                        
                        if (adjustments.length === 0 && cond.condition === 'normal') {
                          adjustments.push('😐 보통 → 표준 프로그램');
                        }
                        
                        return adjustments.length > 0 ? (
                          <div key={idx} className="text-sm text-gray-700">
                            <span className="font-medium">{session.date || session.day}:</span> {adjustments.join(', ')}
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* 세션별 상세 - 수정 가능 */}
                <div className="space-y-3">
                  {selectedProgram.content.sessions.map((session, sessionIdx) => (
                    <div key={sessionIdx} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                        <h5 className="font-medium text-gray-900">{session.day}</h5>
                            {session.date && (
                              <span className="text-xs text-gray-500">
                                ({session.date})
                              </span>
                            )}
                          </div>
                          {session.themeDesc && (
                            <p className="text-sm text-blue-600 mt-1">🎯 {session.themeDesc}</p>
                          )}
                          {/* 완료율 표시 */}
                          {(session as any).completion && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                ✓ {(session as any).completion.completionRate}% 완료
                              </span>
                              <span className="text-xs text-gray-600">
                                {(session as any).completion.feeling === 'easy' && '😊 쉬움'}
                                {(session as any).completion.feeling === 'moderate' && '😐 적당'}
                                {(session as any).completion.feeling === 'hard' && '😓 힘듦'}
                                {(session as any).completion.feeling === 'very_hard' && '😰 매우 힘듦'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 items-center flex-wrap">
                          {/* 🌤️ 당일 컨디션 입력 버튼 */}
                          {(() => {
                            const dayConditionInfo = (session as any).dayCondition;
                            const sessionDateObj = session.date ? new Date(session.date) : null;
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const isToday = sessionDateObj && 
                                          sessionDateObj.getFullYear() === today.getFullYear() &&
                                          sessionDateObj.getMonth() === today.getMonth() &&
                                          sessionDateObj.getDate() === today.getDate();

                            if (dayConditionInfo) {
                              const conditionEmoji = {
                                'very_good': '😄',
                                'good': '🙂',
                                'normal': '😐',
                                'tired': '😓',
                                'very_tired': '😫'
                              }[dayConditionInfo.condition] || '😐';

                              return (
                                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold">
                                  {conditionEmoji} 컨디션 입력됨
                                </span>
                              );
                            } else if (isToday || (sessionDateObj && sessionDateObj >= today)) {
                              return (
                                <button
                                  onClick={() => {
                                    setDayConditionSessionIdx(sessionIdx);
                                    setShowDayConditionModal(true);
                                  }}
                                  className="px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-xs font-semibold"
                                >
                                  🌤️ 컨디션 입력
                                </button>
                              );
                            }
                            return null;
                          })()}

                          {/* 완료율 상태 표시 */}
                          {(() => {
                            // 완료율 데이터 찾기 (서버 데이터 또는 세션 데이터에서)
                            const completionInfo = (selectedProgram as any).completionData?.find(
                              (cd: any) => cd.sessionIdx === sessionIdx
                            )?.completion || (session as any).completion;
                            
                            return completionInfo && completionInfo.completionRate !== undefined ? (
                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold">
                                  ✓ 완료율 {completionInfo.completionRate}%
                                </span>
                                <button
                                  onClick={() => {
                                    setCompletionSessionIdx(sessionIdx);
                                    setShowCompletionModal(true);
                                  }}
                                  className="text-xs text-gray-600 hover:text-blue-600 underline"
                                >
                                  수정
                                </button>
                              </div>
                            ) : null;
                          })()}
                          {/* 완료율 입력/수정 버튼 (항상 표시) */}
                          {(() => {
                            const completionInfo = (selectedProgram as any).completionData?.find(
                              (cd: any) => cd.sessionIdx === sessionIdx
                            )?.completion || (session as any).completion;
                            
                            // 완료율이 이미 있으면 위에서 "수정" 버튼 표시됨
                            // 완료율이 없으면 항상 입력 버튼 표시
                            if (!completionInfo || completionInfo.completionRate === undefined) {
                              return (
                                <button
                                  onClick={() => {
                                    setCompletionSessionIdx(sessionIdx);
                                    setShowCompletionModal(true);
                                  }}
                                  className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs font-semibold"
                                >
                                  📝 완료율 입력
                                </button>
                              );
                            }
                            return null;
                          })()}
                        <button
                          onClick={() => {
                            setEditedProgram({ ...selectedProgram });
                            setEditingSessionIdx(sessionIdx);
                            setIsEditing(true);
                          }}
                          className="text-xs px-2 py-1 border rounded hover:bg-white"
                        >
                          ✏️ 수정
                        </button>
                        </div>
                      </div>
                      <ul className="space-y-1 text-sm text-gray-700">
                        {(session.sets || session.blocks || []).map((set, setIdx) => {
                          const setData = typeof set === 'string' ? null : set;
                          
                          return (
                          <li 
                            key={setIdx} 
                              className="pl-4 border-l-2 border-blue-300 hover:border-blue-500 p-2 rounded mb-2"
                            >
                              {/* 세트 설명 */}
                              <div 
                                className="cursor-pointer hover:bg-white p-1 rounded"
                            onClick={() => {
                              setEditedProgram({ ...selectedProgram });
                              setEditingSessionIdx(sessionIdx);
                              setEditingSetIdx(setIdx);
                              setIsEditing(true);
                            }}
                            title="클릭하여 수정"
                          >
                                {typeof set === 'string' ? (
                                  set
                                ) : (
                                  <div className="space-y-1">
                                    {/* 세트 기본 정보 */}
                                    <div className="font-semibold text-gray-900">
                                      {setData?.reps && setData?.distance ? (
                                        <span className="text-blue-600">{setData.reps}×{setData.distance}m</span>
                                      ) : null}
                                      {' '}
                                      {setData?.stroke && (
                                        <span className="text-gray-700">
                                          {setData.stroke === 'freestyle' && '자유형'}
                                          {setData.stroke === 'backstroke' && '배영'}
                                          {setData.stroke === 'breaststroke' && '평영'}
                                          {setData.stroke === 'butterfly' && '접영'}
                                        </span>
                                      )}
                                      {setData?.totalDistance && (
                                        <span className="text-gray-500 text-xs ml-2">
                                          (총 {setData.totalDistance}m)
                                        </span>
                                      )}
                                    </div>
                                    
                                    {/* 세트 설명 */}
                                    {(setData?.description || setData?.desc) && (
                                      <div className="text-sm text-gray-600">
                                        {setData.description || setData.desc}
                                      </div>
                                    )}
                                    
                                    {/* 페이스 및 휴식 */}
                                    <div className="flex gap-4 text-xs text-gray-500">
                                      {setData?.pace && (
                                        <span>⏱️ 페이스: {setData.pace}</span>
                                      )}
                                      {setData?.rest && (
                                        <span>💤 휴식: {setData.rest}초</span>
                                      )}
                                      {setData?.zone && (
                                        <span className={`px-2 py-0.5 rounded ${
                                          setData.zone === 'Z1' ? 'bg-green-100 text-green-700' :
                                          setData.zone === 'Z2' ? 'bg-blue-100 text-blue-700' :
                                          setData.zone === 'Z3' ? 'bg-yellow-100 text-yellow-700' :
                                          setData.zone === 'Z4' ? 'bg-orange-100 text-orange-700' :
                                          'bg-red-100 text-red-700'
                                        }`}>
                                          {setData.zone}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {/* 🔬 설명가능성 표시 */}
                              {setData && (setData.whyPace || setData.whyRest || setData.whySet) && (
                                <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200 text-xs">
                                  {setData.whyPace && (
                                    <p className="mb-1">
                                      <strong className="text-blue-700">왜 이 페이스?</strong> {setData.whyPace}
                                    </p>
                                  )}
                                  {setData.whyRest && (
                                    <p className="mb-1">
                                      <strong className="text-blue-700">왜 이 휴식?</strong> {setData.whyRest}
                                    </p>
                                  )}
                                  {setData.whySet && (
                                    <p className="mb-1">
                                      <strong className="text-blue-700">왜 이 세트?</strong> {setData.whySet}
                                    </p>
                                  )}
                                  
                                  {/* Evidence 링크 */}
                                  {setData.evidenceKeys && setData.evidenceKeys.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-blue-200">
                                      <strong className="text-blue-700">📚 과학적 근거:</strong>
                                      <div className="mt-1 space-y-1">
                                        {setData.evidenceKeys.slice(0, 3).map((key: string) => {
                                          const evidence = EVIDENCE[key as keyof typeof EVIDENCE];
                                          return evidence ? (
                                            <a
                                              key={key}
                                              href={evidence.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="block text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                              • {evidence.authors} ({evidence.year})
                                            </a>
                                          ) : (
                                            <div key={key} className="text-gray-600">
                                              • {key.replace(/_/g, ' ')}
                                            </div>
                                          );
                                        })}
                                        {setData.evidenceKeys.length > 3 && (
                                          <div className="text-gray-500">
                                            + {setData.evidenceKeys.length - 3}개 논문 더...
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                          </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 푸터 - 액션 버튼 */}
            <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
              <Button
                onClick={() => {
                  setEditedProgram({ ...selectedProgram });
                  setIsEditing(true);
                }}
                variant="primary"
                size="md"
              >
                ✏️ 수정
              </Button>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    // ICS 재다운로드
                    alert('ICS 파일을 다시 다운로드합니다!');
                  }}
                  variant="success"
                  size="md"
                >
                  📥 다운로드
                </Button>
                
                <Button
                  onClick={() => handleDelete(selectedProgram.id)}
                  variant="danger"
                  size="md"
                >
                  🗑️ 삭제
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 수정 모달 */}
      {isEditing && editedProgram && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setIsEditing(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold">프로그램 수정</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {editingSessionIdx !== null && editingSetIdx !== null ? (
                // 특정 세트 수정
                <>
                  <div className="bg-blue-50 p-3 rounded-lg mb-4">
                    <h4 className="font-medium text-blue-900 mb-1">
                      {racePhaseIdx !== null && raceWeekIdx !== null && raceDayIdx !== null
                        ? `Week ${raceWeekIdx + 1} - Day ${raceDayIdx + 1} - 세트 수정`
                        : `${editedProgram.content.sessions?.[editingSessionIdx]?.day || '날짜'} - 세트 수정`
                      }
                    </h4>
                    <p className="text-xs text-blue-700">
                      훈련법/드릴을 교체하거나, 페이스/휴식시간/거리를 자유롭게 수정하세요
                    </p>
                  </div>

                  {/* 🎯 훈련법/드릴 선택 */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🏋️ 훈련법/드릴 교체 (선택사항)
                    </label>
                    
                    {/* 검색 및 필터 */}
                    <div className="flex gap-2 mb-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="🔍 훈련법/드릴 검색..."
                          value={methodDrillSearch}
                          onChange={(e) => setMethodDrillSearch(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setMethodDrillFilter('all')}
                          className={`px-3 py-2 text-xs rounded-lg font-medium ${
                            methodDrillFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          전체
                        </button>
                        <button
                          onClick={() => setMethodDrillFilter('method')}
                          className={`px-3 py-2 text-xs rounded-lg font-medium ${
                            methodDrillFilter === 'method' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          훈련법
                        </button>
                        <button
                          onClick={() => setMethodDrillFilter('drill')}
                          className={`px-3 py-2 text-xs rounded-lg font-medium ${
                            methodDrillFilter === 'drill' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          드릴
                        </button>
                      </div>
                    </div>
                    
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
                      onChange={(e) => {
                        if (e.target.value) {
                          const selectedContent = e.target.value;
                          console.log('🔽 드롭다운 선택:', selectedContent);
                          
                          // 즉시 editedProgram에 적용
                          let updatedProgram = { ...editedProgram };
                          
                          if (racePhaseIdx !== null && raceWeekIdx !== null && raceDayIdx !== null) {
                            // 레이스 프로그램
                            const newPhases = JSON.parse(JSON.stringify(editedProgram.content.phases));
                            const day = newPhases[racePhaseIdx].weeklyPlans[raceWeekIdx].days[raceDayIdx];
                            if (day.sets && day.sets[editingSetIdx]) {
                              day.sets[editingSetIdx].desc = selectedContent;
                              console.log('✅ 레이스 세트 즉시 수정:', selectedContent);
                            }
                            updatedProgram = {
                              ...editedProgram,
                              content: { ...editedProgram.content, phases: newPhases }
                            };
                          } else {
                            // 일반 세션
                            const newSessions = JSON.parse(JSON.stringify(editedProgram.content.sessions));
                            const session = newSessions[editingSessionIdx];
                            
                            if (session.sets) {
                              session.sets[editingSetIdx] = selectedContent;
                              console.log('✅ sets 배열 즉시 수정:', selectedContent);
                            } else if (session.blocks) {
                              session.blocks[editingSetIdx].description = selectedContent;
                              console.log('✅ blocks 배열 즉시 수정:', selectedContent);
                            }
                            
                            updatedProgram = {
                          ...editedProgram,
                          content: { ...editedProgram.content, sessions: newSessions }
                            };
                          }
                          
                          setEditedProgram(updatedProgram);
                          setTempSetContent(selectedContent);
                          
                          // 선택 초기화
                          e.target.value = '';
                          
                          console.log('✅ 드롭다운 선택 즉시 적용 완료');
                        }
                      }}
                    >
                      <option value="">-- 훈련법/드릴 선택 (DB에서 로드: {trainingMethods.length + drills.length}개) --</option>
                      
                      {/* 훈련법 목록 (카테고리별 그룹화) */}
                      {trainingMethods.length > 0 && methodDrillFilter !== 'drill' && (() => {
                        // 검색 필터링
                        const filteredMethods = trainingMethods.filter(method => {
                          if (!methodDrillSearch) return true;
                          const searchLower = methodDrillSearch.toLowerCase();
                          return (
                            (method.name || '').toLowerCase().includes(searchLower) ||
                            (method.title || '').toLowerCase().includes(searchLower) ||
                            (method.description || '').toLowerCase().includes(searchLower) ||
                            (method.howToDo || '').toLowerCase().includes(searchLower)
                          );
                        });
                        
                        if (filteredMethods.length === 0) return null;
                        
                        // 카테고리별로 그룹화
                        const grouped = filteredMethods.reduce((acc: any, method) => {
                          const cat = method.category || '기타';
                          if (!acc[cat]) acc[cat] = [];
                          acc[cat].push(method);
                          return acc;
                        }, {});
                        
                        // 카테고리 우선순위
                        const categoryOrder: Record<string, string> = {
                          'Speed': '🚀 속력',
                          'Endurance': '💪 지구력',
                          'Threshold': '🔥 역치',
                          'VO2max': '⚡ VO2max',
                          'RaceStrategy': '🎯 레이스 전략',
                          'Technique': '🎨 기술',
                          'HIIT': '⚡ 고강도 인터벌',
                          'Structure': '📐 구조/패턴',
                          'IM': '🌀 혼영',
                          'Kick': '🦵 킥',
                          'Pull': '💪 풀',
                          'Hypoxic': '🫁 저산소',
                          'Recovery': '😌 회복',
                          'Skills': '🎯 스킬',
                          'Openwater': '🌊 오픈워터',
                          'Mixed': '🔀 혼합'
                        };
                        
                        return Object.entries(grouped).map(([category, methods]: [string, any]) => (
                          <optgroup key={category} label={`${categoryOrder[category] || category} (${methods.length}개)`}>
                            {methods.map((method: any) => (
                              <option 
                                key={method._id || method.id} 
                                value={`${method.name || method.title} - ${method.description || method.howToDo || ''}`}
                                title={`${method.description || method.whenToUse || ''}\n사용법: ${method.howToDo || ''}\n대상: ${method.whoShouldUse || ''}`}
                              >
                                {method.name || method.title} - {method.howToDo || method.description} ({method.intensityAndVolume || method.zone || ''})
                              </option>
                            ))}
                          </optgroup>
                        ));
                      })()}
                      
                      {/* 드릴 목록 (영법별 그룹화) */}
                      {drills.length > 0 && methodDrillFilter !== 'method' && (() => {
                        // 검색 필터링
                        const filteredDrills = drills.filter(drill => {
                          if (!methodDrillSearch) return true;
                          const searchLower = methodDrillSearch.toLowerCase();
                          return (
                            (drill.name || '').toLowerCase().includes(searchLower) ||
                            (drill.description || '').toLowerCase().includes(searchLower) ||
                            (drill.category || '').toLowerCase().includes(searchLower)
                          );
                        });
                        
                        if (filteredDrills.length === 0) return null;
                        
                        // 영법/카테고리별로 그룹화
                        const grouped = filteredDrills.reduce((acc: any, drill) => {
                          const cat = drill.category || (drill.targetStroke?.[0] || '기타');
                          if (!acc[cat]) acc[cat] = [];
                          acc[cat].push(drill);
                          return acc;
                        }, {});
                        
                        // 카테고리 우선순위
                        const categoryOrder: Record<string, string> = {
                          'Freestyle': '🏊 자유형',
                          'Backstroke': '🏊 배영',
                          'Breaststroke': '🏊 평영',
                          'Butterfly': '🏊 접영',
                          'Kick': '🦵 킥',
                          'Pull': '💪 풀',
                          'Technique': '🎨 테크닉',
                          'all': '🌐 전체'
                        };
                        
                        return Object.entries(grouped).map(([category, drillList]: [string, any]) => (
                          <optgroup key={category} label={`${categoryOrder[category] || category} (${drillList.length}개)`}>
                            {drillList.map((drill: any) => (
                              <option 
                                key={drill._id || drill.id} 
                                value={`${drill.name} - ${drill.description || ''}`}
                                title={`${drill.description || ''}\n난이도: ${drill.difficulty || '중급'}\n대상: ${drill.who?.join(', ') || '전체'}`}
                              >
                                {drill.name} - {drill.description} {drill.difficulty ? `[${drill.difficulty}]` : ''}
                              </option>
                            ))}
                          </optgroup>
                        ));
                      })()}
                      
                      {/* 로딩 중이거나 데이터 없을 때 */}
                      {trainingMethods.length === 0 && drills.length === 0 && (
                        <optgroup label="⚠️ 데이터 로딩 중">
                          <option value="">훈련법/드릴을 불러오는 중...</option>
                        </optgroup>
                      )}
                    </select>
                    <p className="text-xs text-green-600 font-medium">
                      ✅ 드롭다운에서 선택하면 즉시 적용됩니다! [💾 저장] 버튼으로 서버에 저장하세요.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      세트 내용 (직접 수정 가능)
                    </label>
                    <textarea
                      value={tempSetContent}
                      onChange={(e) => {
                        // 임시 변수에만 저장 (즉시 적용 안함)
                        setTempSetContent(e.target.value);
                      }}
                      rows={4}
                      className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                      placeholder="예: 8×100m 지구력 빌드 @~1:40 per 100m, r 20″"
                    />
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <h5 className="text-xs font-medium text-yellow-900 mb-2">💡 수정 방법:</h5>
                    <ul className="text-xs text-yellow-800 space-y-1">
                      <li><strong>1. 훈련법/드릴 교체:</strong> 위 드롭다운에서 선택 (예: Descending → Ascending)</li>
                      <li><strong>2. 직접 수정:</strong> 아래 텍스트 영역에서 자유롭게 수정</li>
                      <li>• 반복 횟수: 8×100m → 10×100m</li>
                      <li>• 페이스: @~1:40 → @~1:35</li>
                      <li>• 휴식시간: r 20″ → r 30″</li>
                      <li>• 거리: 100m → 150m</li>
                      <li>• 강도: Z3 → Z4</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800 mb-3">
                      <strong>✅ 변경사항이 자동으로 적용되었습니다!</strong>
                    </p>
                    <button
                      onClick={() => {
                        // 세트 수정 모드 종료
                        setEditingSessionIdx(null);
                        setEditingSetIdx(null);
                        setRacePhaseIdx(null);
                        setRaceWeekIdx(null);
                        setRaceDayIdx(null);
                        setTempSetContent('');
                        console.log('✅ 세트 수정 완료, 모달 닫기');
                      }}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
                    >
                      ✓ 완료
                    </button>
                  </div>
                </>
              ) : editingSessionIdx !== null ? (
                // 세션 전체 수정
                <>
                  <div className="bg-purple-50 p-3 rounded-lg mb-4">
                    <h4 className="font-medium text-purple-900 mb-1">
                      {editedProgram.content.sessions[editingSessionIdx].day} - 전체 수정
                    </h4>
                    <p className="text-xs text-purple-700">
                      이 날의 모든 세트를 수정하거나, 개별 세트를 클릭하여 수정하세요
                    </p>
                  </div>

                  {(editedProgram.content.sessions[editingSessionIdx].sets || editedProgram.content.sessions[editingSessionIdx].blocks || []).map((set, setIdx) => (
                    <div 
                      key={setIdx} 
                      className="border rounded-lg p-3 bg-white hover:border-blue-400 cursor-pointer" 
                      onClick={() => {
                        setEditingSetIdx(setIdx);
                        // 임시 변수 초기화
                        setTempSetContent(typeof set === 'string' ? set : set.description || set.type || '');
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 font-mono text-sm text-gray-700">
                          {typeof set === 'string' ? set : set.description || set.type}
                        </div>
                        <button className="text-xs px-2 py-1 border rounded hover:bg-blue-50">
                          ✏️
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      const newSessions = [...editedProgram.content.sessions];
                      const session = newSessions[editingSessionIdx];
                      
                      if (session.sets) {
                        session.sets.push('새 세트: 클릭하여 수정');
                      } else if (session.blocks) {
                        session.blocks.push({
                          type: '새 세트',
                          description: '클릭하여 수정',
                          duration: 0,
                          distance: 0,
                          pace: 0
                        });
                      } else {
                        session.sets = ['새 세트: 클릭하여 수정'];
                      }
                      
                      setEditedProgram({
                        ...editedProgram,
                        content: { ...editedProgram.content, sessions: newSessions }
                      });
                    }}
                    className="w-full px-3 py-2 border-2 border-dashed rounded-lg hover:bg-blue-50 text-blue-600"
                  >
                    ➕ 세트 추가
                  </button>

                  <button
                    onClick={() => setEditingSessionIdx(null)}
                    className="w-full px-3 py-2 border rounded-lg hover:bg-gray-100"
                  >
                    ← 기본 정보 수정으로 돌아가기
                  </button>
                </>
              ) : (
                // 기본 파라미터 수정
                <>
                  {/* 시작일 수정 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      시작일
                    </label>
                    <input
                      type="date"
                      value={editedProgram.params.startDate}
                      onChange={(e) => setEditedProgram({
                        ...editedProgram,
                        params: { ...editedProgram.params, startDate: e.target.value }
                      })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  {/* 시간 기반 프로그램에서는 거리가 자동 계산되므로 편집 불가 */}

                  {/* CSS 수정 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CSS/100m (초) - 기본값
                    </label>
                    <input
                      type="number"
                      value={
                        typeof editedProgram.params.cssPer100 === 'object' 
                          ? editedProgram.params.cssPer100.freestyle || 90
                          : editedProgram.params.cssPer100 || 90
                      }
                      onChange={(e) => {
                        const newValue = Number(e.target.value);
                        setEditedProgram({
                        ...editedProgram,
                          params: { 
                            ...editedProgram.params, 
                            cssPer100: typeof editedProgram.params.cssPer100 === 'object'
                              ? { ...editedProgram.params.cssPer100, freestyle: newValue }
                              : newValue
                          }
                        });
                      }}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 영법별 CSS는 시간 기반 프로그램에서 자동 설정됩니다
                    </p>
                  </div>

                  {/* 영법 수정 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      주 영법
                    </label>
                    <select
                      value={editedProgram.params.stroke}
                      onChange={(e) => setEditedProgram({
                        ...editedProgram,
                        params: { ...editedProgram.params, stroke: e.target.value as any }
                      })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="FR">자유형</option>
                      <option value="BK">배영</option>
                      <option value="BR">평영</option>
                      <option value="FL">접영</option>
                    </select>
                  </div>

                  {/* 세션별 수정 바로가기 */}
                  <div className="pt-4 border-t">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">또는 요일별 세부 수정:</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {editedProgram.content.sessions.map((session, idx) => (
                        <button
                          key={idx}
                          onClick={() => setEditingSessionIdx(idx)}
                          className="px-3 py-2 border rounded-lg hover:bg-blue-50 text-sm"
                        >
                          {session.day} →
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50">
              {/* 저장 메시지 */}
              {saveMessage && (
                <div className={`mb-4 p-3 rounded-lg ${
                  saveMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  <div className="flex items-center">
                    {saveMessage.type === 'success' ? (
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="font-medium">{saveMessage.text}</span>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 justify-end">
              <Button
                onClick={() => setIsEditing(false)}
                variant="secondary"
                size="md"
              >
                취소
              </Button>
              <Button
                onClick={async () => {
                  try {
                    setIsSaving(true);
                    setSaveMessage(null);
                    console.log('💾 [저장] 클릭 - 서버에 저장 시작');
                    console.log('📤 저장할 데이터:', {
                      id: editedProgram.id,
                      'sessions[0].blocks[3]': editedProgram.content?.sessions?.[0]?.blocks?.[3]?.description
                    });
                    
                    // 로컬 저장
                  saveProgram(editedProgram);
                    
                    // 서버에 저장
                    if (editedProgram.id) {
                      const saveResponse = await apiClient.put(`/api/swim-programs/${editedProgram.id}`, {
                        content: editedProgram.content,
                        params: editedProgram.params
                      });
                      console.log('✅ 서버에 프로그램 저장 완료:', editedProgram.id);
                      console.log('📊 저장 응답:', saveResponse.data?.content?.sessions?.[0]?.blocks?.[3]?.description);
                    }
                    
                    // UI 업데이트 - 서버에서 다시 로드하고 수정된 프로그램 찾기
                    await loadProgramsFromServer();
                    
                    // 서버에서 수정된 프로그램을 직접 조회
                    const updatedProgramResponse = await apiClient.get(`/api/swim-programs/${editedProgram.id}`);
                    console.log('📥 수정된 프로그램 다시 로드:', updatedProgramResponse);
                    
                    // selectedProgram을 서버에서 가져온 최신 데이터로 교체
                    const serverData = updatedProgramResponse.data || updatedProgramResponse;
                    if (serverData) {
                      console.log('🔍 서버 데이터 상세:', {
                        content: serverData.content,
                        sessions: serverData.content?.sessions,
                        phases: serverData.content?.phases
                      });
                      
                      const freshProgram = {
                        id: serverData._id,
                        athleteId: serverData.athleteId,
                        athleteName: serverData.athleteName,
                        groupClassId: serverData.groupClassId,
                        groupClassName: serverData.groupClassName,
                        programType: serverData.programType,
                        programScope: serverData.programScope,
                        params: serverData.params,
                        content: serverData.content,
                        createdAt: serverData.createdAt
                      };
                      
                      console.log('🔄 freshProgram 생성:', freshProgram);
                      console.log('🔍 freshProgram.content.sessions[0]:', freshProgram.content?.sessions?.[0]);
                      console.log('🔍 freshProgram.content.sessions[0].sets:', freshProgram.content?.sessions?.[0]?.sets);
                      console.log('🔍 freshProgram.content.sessions[0].blocks:', freshProgram.content?.sessions?.[0]?.blocks);
                      
                      setSelectedProgram(freshProgram);
                      console.log('✅ selectedProgram 업데이트 완료');
                    }
                    
                  setEditingSessionIdx(null);
                  setEditingSetIdx(null);
                    setRacePhaseIdx(null);
                    setRaceWeekIdx(null);
                    setRaceDayIdx(null);
                    setTempSetContent('');
                  setIsEditing(false);
                    
                    console.log('🔄 UI 업데이트 완료');
                  setSaveMessage({ type: 'success', text: '프로그램이 성공적으로 수정되었습니다!' });
                  setTimeout(() => setSaveMessage(null), 3000);
                  } catch (error) {
                    console.error('❌ 프로그램 저장 오류:', error);
                    setSaveMessage({ type: 'error', text: '프로그램 저장에 실패했습니다. 다시 시도해주세요.' });
                  } finally {
                    setIsSaving(false);
                  }
                }}
                variant="primary"
                size="md"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    저장 중...
                  </>
                ) : (
                  '💾 저장'
                )}
              </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 완료율 입력 모달 */}
      {showCompletionModal && selectedProgram && (
        <CompletionInputModal
          programId={selectedProgram.id}
          sessionIndex={completionSessionIdx !== null ? completionSessionIdx : 0}
          sessionDay={
            racePhaseIdx !== null && raceWeekIdx !== null && raceDayIdx !== null
              ? selectedProgram.content.phases?.[racePhaseIdx]?.weeklyPlans?.[raceWeekIdx]?.days?.[raceDayIdx]?.date || '날짜 없음'
              : (completionSessionIdx !== null ? selectedProgram.content.sessions[completionSessionIdx]?.day : '날짜 없음')
          }
          sessionDate={
            racePhaseIdx !== null && raceWeekIdx !== null && raceDayIdx !== null
              ? selectedProgram.content.phases?.[racePhaseIdx]?.weeklyPlans?.[raceWeekIdx]?.days?.[raceDayIdx]?.date
              : (completionSessionIdx !== null ? selectedProgram.content.sessions[completionSessionIdx]?.date : undefined)
          }
          plannedSets={(() => {
            // desc에서 반복수 파싱 헬퍼
            const parseRepsFromDesc = (desc: string): number => {
              const match = desc.match(/^(?:\[.*?\]\s*)?(\d+)×/);
              return match ? parseInt(match[1]) : 1;
            };
            
            // 레이스 프로그램 phases 내부 날짜인 경우
            if (racePhaseIdx !== null && raceWeekIdx !== null && raceDayIdx !== null) {
              const day = selectedProgram.content.phases?.[racePhaseIdx]?.weeklyPlans?.[raceWeekIdx]?.days?.[raceDayIdx];
              if (day && day.sets) {
                return day.sets.map((set: any, idx: number) => {
                  const reps = parseRepsFromDesc(set.desc || '');
                  const distancePerRep = Math.round((set.meters || 0) / reps);
                  return {
                    distance: distancePerRep,
                    reps: reps,
                    estimatedTime: Math.round((set.meters || 0) / 100 * 90) // CSS 90초 기준 예상 시간
                  };
                });
              }
            }
            // 일반 세션인 경우
            if (completionSessionIdx !== null && selectedProgram.content.sessions[completionSessionIdx]) {
              const session = selectedProgram.content.sessions[completionSessionIdx];
              // blocks를 plannedSets로 변환
              if ((session as any).blocks) {
                return (session as any).blocks.map((block: any, idx: number) => {
                  const desc = block.description || '';
                  const reps = parseRepsFromDesc(desc);
                  const distancePerRep = Math.round((block.distance || 0) / reps);
                  return {
                    distance: distancePerRep,
                    reps: reps,
                    estimatedTime: block.duration ? block.duration * 60 : Math.round((block.distance || 0) / 100 * 90)
                  };
                });
              }
            }
            return undefined;
          })()}
          onClose={() => {
            setShowCompletionModal(false);
            setCompletionSessionIdx(null);
            setRacePhaseIdx(null);
            setRaceWeekIdx(null);
            setRaceDayIdx(null);
          }}
          onSubmit={handleCompletionSubmit}
        />
      )}

      {/* 🌤️ 당일 컨디션 입력 모달 */}
      {showDayConditionModal && selectedProgram && (
        <DayConditionInputModal
          sessionDate={
            racePhaseIdx !== null && raceWeekIdx !== null && raceDayIdx !== null
              ? selectedProgram.content.phases?.[racePhaseIdx]?.weeklyPlans?.[raceWeekIdx]?.days?.[raceDayIdx]?.date || '날짜 없음'
              : (dayConditionSessionIdx !== null ? (selectedProgram.content.sessions[dayConditionSessionIdx]?.date || selectedProgram.content.sessions[dayConditionSessionIdx]?.day) : '날짜 없음')
          }
          onClose={() => {
            setShowDayConditionModal(false);
            setDayConditionSessionIdx(null);
            setRacePhaseIdx(null);
            setRaceWeekIdx(null);
            setRaceDayIdx(null);
          }}
          onSubmit={handleDayConditionSubmit}
        />
      )}

      {/* 🏥 질환 상세 정보 모달 */}
      {showConditionDetail && selectedConditionId && (
        <ConditionDetailModal
          conditionId={selectedConditionId}
          onClose={() => {
            setShowConditionDetail(false);
            setSelectedConditionId(null);
          }}
        />
      )}

      {/* 📊 회원 통계 대시보드 */}
      {showMemberStatistics && selectedAthleteId && (
        <MemberStatistics
          memberId={selectedAthleteId}
          memberName={programs.find(p => p.athleteId === selectedAthleteId)?.athleteName || '회원'}
          onClose={() => setShowMemberStatistics(false)}
        />
      )}
    </div>
  );
}

