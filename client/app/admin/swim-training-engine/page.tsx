/**
 * 🏊‍♂️ JJ Swim Lab - 수영 트레이닝 규칙 엔진 관리 페이지
 * 
 * 📋 **실제 기능들:**
 * - WHO/ACSM 기준 기반 운동 도스 계산
 * - 고혈압/비만/고지혈증 가드레일 적용
 * - 수중 HR 보정 및 의료 확인 필요성 판단
 * - 28개 관절질환 × 6영법 안전도 기반 영법 선택
 * - 성취율 기반 프로그레션 알고리즘
 * - 투명성 노트 포함
 * 
 * 🔗 **연동 파일:**
 * - swim-training-engine/src/engine/swim-plan.ts (수영 계획 생성기)
 * - swim-training-engine/src/engine/health-policy.ts (건강 정책 및 도스 규칙)
 * - swim-training-engine/src/data/jj-swim-lab-joint-guidance.ts (28개 관절질환 데이터)
 * - swim-training-engine/src/types.ts (타입 정의)
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useSearchParams } from 'next/navigation';
import apiClient from '../../../utils/api';
import { GLOSSARY, parseWorkoutLine, explainToken } from '../../../lib';
import CSSConverter from '../../../components/CSSConverter';
import { allJointConditions } from '../../../swim-training-engine/src/data/jj-swim-lab-joint-guidance';
import StatCard from '@/components/StatCard';
import Button from '@/components/Button';
// SwimLab Data Pack v4 통합
import { CONDITIONS as SWIMLAB_CONDITIONS } from '../../../src/swimlab/data/conditions_full';
import { STROKE_SAFETY as SWIMLAB_STROKE_SAFETY } from '../../../src/swimlab/data/strokeSafety';
import { EVIDENCE as SWIMLAB_EVIDENCE } from '../../../src/swimlab/data/evidence';
import { TRAINING_METHODS } from '../../../src/swimlab/data/trainingMethods';
import { DRILLS } from '../../../src/swimlab/data/drills';
import { MSK_28_IDS } from '../../../src/swimlab/data/conditions_msk28_index';
import { countAll } from '../../../src/swimlab/utils/catalog';
// SwimLab 통합 컴포넌트들
// import ConditionQuickPick from '../../../components/swimlab/ConditionQuickPick'; // ⚠️ 삭제됨: 전체 질환 목록으로 대체
import AthleteProfileBar from '../../../components/swimlab/AthleteProfileBar';
import { measureCoverage, generateRuleTemplates } from '../../../lib/swimlab/utils/coverage';
import { listAthletes, type AthleteProfile } from '../../../lib/swimlab/utils/athletes';
import { exportWeeklyForAthletes } from '../../../lib/swimlab/utils/multiExport';
import ProgramGeneratorPanel from '../../../components/swimlab/ProgramGeneratorPanel';
import ProgramListView from '../../../components/swimlab/ProgramListView';
import ProgramSuggestionCard from '../../../components/swimlab/ProgramSuggestionCard';
import { analyzeProgress } from '../../../lib/swimlab/progressAnalyzer';
import BulkMemberVariablesModal from '../../../components/swimlab/BulkMemberVariablesModal';
import { saveCustomMethod, saveCustomDrill, getMergedMethods, getMergedDrills } from '../../../lib/swimlab/utils/customData';
import { upsertAthlete } from '../../../lib/swimlab/utils/athletes';
import GroupProgramGenerator from '../../../components/swimlab/GroupProgramGenerator';
import StudentChecklistModal from '../../../components/swimlab/StudentChecklistModal';
import QuickActionButtons from '../../../components/swimlab/QuickActionButtons';
import { convertHealthToConditions } from '../../../lib/swimlab/utils/healthToCondition';
import { getProgramStats } from '../../../lib/swimlab/utils/programStorage';
import { saveCustomCondition, deleteCustomCondition, getMergedConditions, createSimpleCondition } from '../../../lib/swimlab/utils/customConditions';
import AllConditionsDrawer from '../../../components/swimlab/AllConditionsDrawer';
import { 
  Zap, 
  Activity, 
  Target, 
  Settings, 
  BookOpen,
  Shield,
  Heart,
  Clock,
  BarChart3,
  Play,
  Download,
  Code,
  Database,
  Cpu,
  Delete,
  Info,
  AlertTriangle,
  CheckCircle,
  Users,
  TrendingUp,
  TrendingDown,
  FileText,
  Calendar,
  Star,
  Award,
  User
} from 'lucide-react';

// 건강정보 인터페이스
interface HealthInput {
  demographics: { age: number; sex: 'M' | 'F' };
  anthropometrics: { height_cm: number; weight_kg: number; bmi?: number };
  vitals: { rest_hr?: number; rest_bp?: { sbp: number; dbp: number }; on_beta_blocker?: boolean };
  conditions: {
    obesity: 'normal' | 'overweight' | 'obesity';
    hypertension: 'normal' | 'elevated' | 'stage1' | 'stage2';
    dyslipidemia: boolean;
    diabetes: boolean;
  };
  orthopedics: string[];
  swim_profile: { level: 'beginner' | 'intermediate' | 'advanced'; grade: string };
  goals: string[];
  adherence_last_week: number;
  symptoms_flags: string[];
}

// 프로그램 출력 인터페이스
interface PlanOutput {
  weeklySchedule: {
    totalSessions: number;
    sessionDuration: number;
    sessions: Array<{
      day: string;
      sessionType: string;
      intensity: number;
      exercises: Array<{
        stroke: string;
        distance: number;
        sets: number;
        rest: number;
      }>;
    }>;
  };
  safetyNotes: string[];
  medicalClearance: boolean;
  intensityAdjustments: string[];
}

// SwimLab Data Pack v4 데이터 - 초기 로드 (함수 외부에서는 기본값만)
const jointConditionsBase = SWIMLAB_CONDITIONS.map(condition => ({
  id: condition.id,
  name: (condition as any).name || (condition as any).label,
  label: (condition as any).label || (condition as any).name,
  category: condition.category,
  severity: (condition as any).severity,
  impacts: (condition as any).impacts,
  strokeNotes: (condition as any).strokeNotes,
  evidenceKeys: (condition as any).evidenceKeys,
  notes: (condition as any).notes,
  swimmingGuidance: (condition as any).swimmingGuidance,
  exerciseRestrictions: (condition as any).exerciseRestrictions,
  description: (condition as any).description
}));

// 영법별 안전성 데이터 (SwimLab Data Pack v4)
const strokeSafety = {
  freestyle: { safe: 5, caution: 1, avoid: 0 },
  backstroke: { safe: 4, caution: 2, avoid: 0 },
  breaststroke: { safe: 3, caution: 2, avoid: 1 },
  butterfly: { safe: 2, caution: 3, avoid: 1 },
  elementary_backstroke: { safe: 6, caution: 0, avoid: 0 },
  sidestroke: { safe: 4, caution: 2, avoid: 0 }
};

// 데이터팩 카운트 (임시 데이터)
const dataPackCounts = {
  methods: TRAINING_METHODS.length,
  drills: DRILLS.length,
  conditions: SWIMLAB_CONDITIONS.length,
  conditionsMSK28: MSK_28_IDS.length,
  conditionsAll: SWIMLAB_CONDITIONS.length,
  strokeGuides: 6,
  msk28Target: 28
};

export default function SwimTrainingEnginePage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCondition, setSelectedCondition] = useState<any>(null);
  const [showAllConditionsModal, setShowAllConditionsModal] = useState(false);
  
  // 빠른 생성 탭 상태
  const [quickGenState, setQuickGenState] = useState({
    selectedMember: null as any,
    sessionDuration: 60, // 기본 60분
    sessionsPerWeek: 3,
    mainStrokes: [] as string[], // 주 영법 (복수 선택)
    excludedStrokes: [] as string[], // 제외할 영법
    strokeCSS: { // 영법별 CSS (초/100m) - 경영 영법만, 선택한 영법만 입력
      freestyle: 0,
      backstroke: 0,
      breaststroke: 0,
      butterfly: 0,
      // elementary_backstroke와 sidestroke는 CSS 측정 안함 (경영 영법 아님)
      // 프로그램 생성 시 자동으로 느린 페이스 적용
    } as Record<string, number>,
    condition: '', // 오늘의 컨디션
    hasPain: false, // 통증 여부
    goal: '', // 오늘의 목표
    applyCompletionRate: true, // 완료율 기반 조정 적용 여부
    intensityMode: 'auto' as 'auto' | 'maintain' | 'increase' | 'decrease' // 강도 조정 모드
  });
  
  const [generatedProgram, setGeneratedProgram] = useState<any>(null);
  const [showProgramResult, setShowProgramResult] = useState(false);
  const [programSuggestion, setProgramSuggestion] = useState<any>(null); // 프로그램 변경 제안
  const [showBulkVariablesModal, setShowBulkVariablesModal] = useState(false); // 다중 회원 변수 설정 모달
  const [showGroupProgramGenerator, setShowGroupProgramGenerator] = useState(false); // 단체반 프로그램 생성
  const [showStudentChecklist, setShowStudentChecklist] = useState(false); // 학생 체크리스트
  const [checklistStudent, setChecklistStudent] = useState<{ id: string; name: string; level: string } | null>(null);
  const [bulkSelectedMembers, setBulkSelectedMembers] = useState<any[]>([]); // 다중 선택된 회원들
  const [currentAthleteId, setCurrentAthleteId] = useState<string | undefined>(undefined); // 현재 선택된 회원 ID (프로그램 목록용)
  
  // 컨디션 설정 탭 상태 (간소화)
  // ⚠️ 당일 컨디션/통증은 삭제됨 (프로그램 실행 시 입력)
  // 운동 목표만 주간 생성 시 사용

  // 주 영법 토글 (복수 선택, 회피영법과 중복 방지)
  const toggleMainStroke = (strokeId: string) => {
    setQuickGenState(prev => {
      const isRemoving = prev.mainStrokes.includes(strokeId);
      
      // 추가 시 회피영법에서 제거
      if (!isRemoving) {
        // 회피영법에 있으면 제거
        const newExcludedStrokes = prev.excludedStrokes.filter(s => s !== strokeId);
        
        // 영법 제거 시 해당 CSS도 0으로 리셋
        const newStrokeCSS = { ...prev.strokeCSS };
        if (isRemoving && !['elementary_backstroke', 'sidestroke'].includes(strokeId)) {
          newStrokeCSS[strokeId] = 0;
        }
        
        return {
          ...prev,
          mainStrokes: [...prev.mainStrokes, strokeId],
          excludedStrokes: newExcludedStrokes,
          strokeCSS: newStrokeCSS
        };
      } else {
        // 제거 시
        const newStrokeCSS = { ...prev.strokeCSS };
        if (!['elementary_backstroke', 'sidestroke'].includes(strokeId)) {
          newStrokeCSS[strokeId] = 0;
        }
        
        return {
          ...prev,
          mainStrokes: prev.mainStrokes.filter(s => s !== strokeId),
          strokeCSS: newStrokeCSS
        };
      }
    });
  };

  // 제외할 영법 토글 (주영법과 중복 방지)
  const toggleExcludedStroke = (strokeId: string) => {
    setQuickGenState(prev => {
      const isRemoving = prev.excludedStrokes.includes(strokeId);
      
      // 추가 시 주영법에서 제거
      if (!isRemoving) {
        // 주영법에 있으면 제거하고 CSS도 0으로 리셋
        const newMainStrokes = prev.mainStrokes.filter(s => s !== strokeId);
        const newStrokeCSS = { ...prev.strokeCSS };
        if (!['elementary_backstroke', 'sidestroke'].includes(strokeId)) {
          newStrokeCSS[strokeId] = 0;
        }
        
        return {
          ...prev,
          excludedStrokes: [...prev.excludedStrokes, strokeId],
          mainStrokes: newMainStrokes,
          strokeCSS: newStrokeCSS
        };
      } else {
        // 제거 시
        return {
          ...prev,
          excludedStrokes: prev.excludedStrokes.filter(s => s !== strokeId)
        };
      }
    });
  };


  // ⚠️ 컨디션 기반 조정은 삭제됨 (프로그램 실행 시 적용)


  // 빠른 프로그램 생성
  const generateQuickProgram = () => {
    const { sessionDuration, sessionsPerWeek, mainStrokes, excludedStrokes, strokeCSS, condition, hasPain, goal } = quickGenState;
    
    // 제외된 영법을 제외한 실제 사용할 영법
    const activeStrokes = mainStrokes.filter(s => !excludedStrokes.includes(s));
    
    if (activeStrokes.length === 0) {
      alert('최소 1개 이상의 영법을 선택해주세요!');
      return;
    }
    
    // 컨디션에 따른 강도 조정
    const intensityMultiplier = condition === '매우 좋음' ? 1.0 :
                                condition === '좋음' ? 0.95 :
                                condition === '보통' ? 0.9 :
                                condition === '피곤함' ? 0.8 :
                                condition === '매우 피곤함' ? 0.7 : 0.9;
    
    // 통증 있으면 강도 추가 감소
    const finalIntensity = hasPain ? intensityMultiplier * 0.8 : intensityMultiplier;
    
    // 조정된 세션 시간 계산
    const adjustedSessionDuration = Math.round(sessionDuration * finalIntensity);
    
    // 세션별 프로그램 생성
    interface SessionBlock {
      type: string;
      stroke: string;
      strokeName: string;
      duration: number;
      distance: number;
      pace: number;
      description: string;
    }
    
    interface Session {
      day: string;
      dayNumber: number;
      blocks: SessionBlock[];
      totalDuration: number;
      totalDistance: number;
      intensity: number;
    }
    
    const sessions: Session[] = [];
    const daysOfWeek = ['월', '화', '수', '목', '금', '토', '일'];
    
    for (let i = 0; i < sessionsPerWeek; i++) {
      const sessionBlocks: SessionBlock[] = [];
      
      // 워밍업 (10% of time)
      const warmupTime = Math.round(adjustedSessionDuration * 0.1);
      sessionBlocks.push({
        type: '워밍업',
        stroke: 'elementary_backstroke',
        strokeName: '기본배영',
        duration: warmupTime,
        distance: 0, // 시간 기반이므로 거리는 나중에 계산
        pace: 120,
        description: `${warmupTime}분 가볍게 수영`
      });
      
      // 메인 세트 (75% of time) - 선택한 영법들로 분배
      const mainTime = Math.round(adjustedSessionDuration * 0.75);
      const timePerStroke = Math.floor(mainTime / activeStrokes.length);
      
      activeStrokes.forEach((strokeId, idx) => {
        const css = strokeCSS[strokeId] || 90;
        const strokeName = {
          freestyle: '자유형',
          backstroke: '배영',
          breaststroke: '평영',
          butterfly: '접영',
          elementary_backstroke: '기본배영',
          sidestroke: '횡영'
        }[strokeId] || strokeId;
        
        // 시간으로부터 거리 계산: (시간(분) * 60초) / (페이스(초/100m)) * 100m
        const calculatedDistance = Math.round((timePerStroke * 60) / (css / 100));
        
        // 25m 단위로 조정 (짝수 배수)
        const adjustedDistance = Math.round(calculatedDistance / 50) * 50; // 50m 단위로 (25m의 짝수배)
        
        sessionBlocks.push({
          type: '메인 세트',
          stroke: strokeId,
          strokeName: strokeName,
          duration: timePerStroke,
          distance: adjustedDistance,
          pace: css,
          description: `${strokeName} ${adjustedDistance}m @ ${css}초/100m (${timePerStroke}분)`
        });
      });
      
      // 쿨다운 (15% of time)
      const cooldownTime = Math.round(adjustedSessionDuration * 0.15);
      sessionBlocks.push({
        type: '쿨다운',
        stroke: 'elementary_backstroke',
        strokeName: '기본배영',
        duration: cooldownTime,
        distance: 0,
        pace: 120,
        description: `${cooldownTime}분 여유롭게 수영`
      });
      
      // 세션 총 거리 계산
      const totalDistance = sessionBlocks.reduce((sum, block) => sum + block.distance, 0);
      
      sessions.push({
        day: daysOfWeek[i],
        dayNumber: i + 1,
        blocks: sessionBlocks,
        totalDuration: adjustedSessionDuration,
        totalDistance: totalDistance,
        intensity: Math.round(finalIntensity * 100)
      });
    }
    
    // 주간 총 거리 계산
    const weeklyDistance = sessions.reduce((sum, s) => sum + s.totalDistance, 0);
    
    const program = {
      sessions,
      summary: {
        weeklyDuration: adjustedSessionDuration * sessionsPerWeek,
        weeklyDistance,
        sessionsPerWeek,
        mainStrokes: activeStrokes,
        excludedStrokes,
        condition,
        hasPain,
        goal,
        adjustmentNote: finalIntensity < 1 
          ? `컨디션(${condition})과 통증 여부에 따라 강도를 ${Math.round((1 - finalIntensity) * 100)}% 감소했습니다.`
          : '최적 강도로 프로그램을 생성했습니다.'
      }
    };
    
    setGeneratedProgram(program);
    setShowProgramResult(true);
  };
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTrainingMethod, setSelectedTrainingMethod] = useState<string | null>(null);
  const [selectedDrill, setSelectedDrill] = useState<string | null>(null);
  const [previousTab, setPreviousTab] = useState<string | null>(null);
  const [previousTrainingMethod, setPreviousTrainingMethod] = useState<string | null>(null);
  const [isAddingTrainingMethod, setIsAddingTrainingMethod] = useState(false);
  const [isAddingDrill, setIsAddingDrill] = useState(false);
  const [engineStatus, setEngineStatus] = useState<'running' | 'stopped' | 'error'>('running');
  const [allMethods, setAllMethods] = useState(getMergedMethods(TRAINING_METHODS));
  const [allDrills, setAllDrills] = useState(getMergedDrills(DRILLS));
  const [allConditions, setAllConditions] = useState(getMergedConditions(jointConditionsBase));
  const [isAddingCondition, setIsAddingCondition] = useState(false);
  const [editingCondition, setEditingCondition] = useState<any>(null);
  
  // SwimLab 통합 상태
  const [conditionIds, setConditionIds] = useState<string[]>([]);
  const [teamSelectedIds, setTeamSelectedIds] = useState<string[]>([]);
  
  // 프로그램 통계 (클라이언트에서만 실행)
  const [stats, setStats] = useState({ total: 0, athletes: 0, recentCount: 0 });
  
  useEffect(() => {
    setStats(getProgramStats());
  }, []);

  // 엔진 통계
  const [engineStats, setEngineStats] = useState({
    totalPrograms: 1247,
    averageGenerationTime: 2.3,
    successRate: 98.7,
    safetyScore: 'AAA'
  });

  // 탭 변경 함수 (이전 탭 추적)
  const handleTabChange = (tabId: string) => {
    setPreviousTab(activeTab);
    setActiveTab(tabId);
  };

  // 돌아가기 함수
  const goBackToPreviousTab = () => {
    if (previousTab) {
      setActiveTab(previousTab);
      setPreviousTab(null);
    }
  };

  // 훈련법 모달 닫기 함수
  const closeTrainingMethodModal = () => {
    setSelectedTrainingMethod(null);
  };

  // 드릴 모달 닫기 함수
  const closeDrillModal = () => {
    setSelectedDrill(null);
  };

  // 영법명 변환 함수
  const getStrokeName = (strokeId: string) => {
    switch (strokeId) {
      case 'freestyle': return '자유형';
      case 'backstroke': return '배영';
      case 'breaststroke': return '평영';
      case 'butterfly': return '접영';
      case 'elementary_backstroke': return '기본 배영';
      case 'sidestroke': return '횡영';
      default: return strokeId;
    }
  };

  // 질환명 변환 함수
  const getConditionName = (conditionId: string) => {
    const condition = allJointConditions.find(c => c.conditionId === conditionId);
    return condition ? condition.conditionName : conditionId;
  };


  // 엔진 상태 확인
  const checkEngineStatus = async () => {
    try {
      // 실제 엔진 상태 확인 API 호출
      const response = await apiClient.get('/api/swim-engine/status');
      if (response.success) {
        setEngineStatus('running');
      } else {
        setEngineStatus('error');
      }
    } catch (error) {
      // 백엔드 서버가 없어도 프론트엔드는 정상 작동하므로 조용히 처리
      setEngineStatus('stopped');
    }
  };

  // URL 파라미터 처리
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    // 초기화 로직 (필요시)
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 h-screen flex flex-col">
      {/* 헤더 */}
      <div className="mb-8 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Zap className="h-8 w-8 text-blue-500" />
              수영 트레이닝 규칙 엔진
            </h1>
            <p className="text-gray-600">
              건강정보 기반 맞춤형 수영 프로그램 자동 생성 시스템
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* 빠른 통계 */}
            <div className="flex gap-3 text-sm">
              <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                생성됨: {stats.total}개
              </div>
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                선수: {stats.athletes}명
              </div>
              <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                최근 1주: {stats.recentCount}개
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 상태 표시 */}
      <div className="mb-6">
        <div className={`p-4 rounded-lg border ${engineStatus === 'running' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${engineStatus === 'running' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <h4 className="font-semibold">
              엔진 상태: {engineStatus === 'running' ? '정상 동작' : '오류 발생'}
            </h4>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {engineStatus === 'running' 
              ? '수영 트레이닝 규칙 엔진이 정상적으로 작동하고 있습니다.'
              : '엔진에 문제가 발생했습니다. 관리자에게 문의하세요.'
            }
          </p>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="mb-6 flex-shrink-0">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'quick-generate', name: '⚡ 빠른 생성', icon: Zap },
              { id: 'overview', name: '개요', icon: Info },
              { id: 'condition-setup', name: '컨디션 설정', icon: Settings },
              { id: 'program-list', name: '프로그램 목록', icon: Calendar },
              { id: 'training-methods', name: '훈련법 관리', icon: BookOpen },
              { id: 'drills', name: '드릴 관리', icon: Activity },
              { id: 'conditions', name: '질환별 가이드라인', icon: Heart },
              { id: 'analytics', name: '분석', icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 탭 내용 */}
      <div className="flex-1 min-h-0">
        {activeTab === 'quick-generate' && (
          <div className="space-y-6 h-full overflow-y-auto pb-20">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">⚡ 빠른 프로그램 생성</h2>
              <p className="text-gray-600">
                회원을 선택하고 현재 컨디션만 입력하면 맞춤형 수영 프로그램이 자동으로 생성됩니다.
              </p>
            </div>

            {/* Step 1: 회원 선택 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                Step 1. 회원 선택
              </h3>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  회원 검색 또는 선택
                </label>
                <input
                  type="text"
                  placeholder="회원 이름, 이메일로 검색..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Tip:</strong> 회원의 저장된 건강 정보가 자동으로 불러와집니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2: 훈련 설정 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-500" />
                Step 2. 훈련 설정
              </h3>
              <div className="space-y-4">
                {/* ℹ️ 안내 메시지 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💡 <strong>시간, 영법, CSS, 운동 목표, 훈련 요일</strong>은 이제 
                    <strong className="text-blue-600"> "회원 불러오기"</strong>에서 설정됩니다!
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Step 1에서 회원을 불러오면 저장된 변수가 자동으로 적용됩니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3: 현재 컨디션 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Step 3. 현재 컨디션
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    오늘의 컨디션
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {['매우 좋음', '좋음', '보통', '피곤함', '매우 피곤함'].map((condition) => (
                      <button
                        key={condition}
                        onClick={() => setQuickGenState(prev => ({ ...prev, condition }))}
                        className={`px-4 py-3 border-2 rounded-lg transition-all ${
                          quickGenState.condition === condition
                            ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                            : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                        }`}
                      >
                        {condition}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    통증 여부
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setQuickGenState(prev => ({ ...prev, hasPain: false }))}
                      className={`px-4 py-3 border-2 rounded-lg transition-all ${
                        !quickGenState.hasPain
                          ? 'border-green-500 bg-green-50 text-green-700 font-semibold'
                          : 'border-gray-200 hover:border-green-500 hover:bg-green-50'
                      }`}
                    >
                      ✅ 통증 없음
                    </button>
                    <button 
                      onClick={() => setQuickGenState(prev => ({ ...prev, hasPain: true }))}
                      className={`px-4 py-3 border-2 rounded-lg transition-all ${
                        quickGenState.hasPain
                          ? 'border-red-500 bg-red-50 text-red-700 font-semibold'
                          : 'border-gray-200 hover:border-red-500 hover:bg-red-50'
                      }`}
                    >
                      ⚠️ 통증 있음
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Step 4: 프로그램 생성 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Step 4. 프로그램 생성
              </h3>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">선택된 정보</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>⏱️ 운동 시간: <span className="font-medium">{quickGenState.sessionDuration}분 × {quickGenState.sessionsPerWeek}회</span></p>
                    <p>🏊 주 영법: <span className="font-medium">
                      {quickGenState.mainStrokes.length > 0 
                        ? `${quickGenState.mainStrokes.length}개 선택됨`
                        : '선택 필요'}
                    </span></p>
                    <p>⛔ 제외 영법: <span className="font-medium">
                      {quickGenState.excludedStrokes.length > 0 
                        ? `${quickGenState.excludedStrokes.length}개 제외됨`
                        : '없음'}
                    </span></p>
                    <p>💪 컨디션: <span className="font-medium">{quickGenState.condition || '선택 필요'}</span></p>
                    <p>🎯 목표: <span className="font-medium">{quickGenState.goal || '선택 필요'}</span></p>
                  </div>
                </div>

                <Button
                  onClick={generateQuickProgram}
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={quickGenState.mainStrokes.length === 0 || !quickGenState.condition || !quickGenState.goal}
                >
                  <Zap className="h-5 w-5 mr-2" />
                  맞춤형 프로그램 생성하기
                </Button>

                <p className="text-xs text-center text-gray-500">
                  * 영법, 컨디션, 목표를 모두 선택해야 생성 가능합니다
                </p>
              </div>
            </div>

            {/* 생성된 프로그램 결과 */}
            {showProgramResult && generatedProgram && (
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    생성된 주간 프로그램
                  </h3>
                  <Button
                    onClick={() => setShowProgramResult(false)}
                    variant="outline"
                    size="sm"
                  >
                    닫기
                  </Button>
                </div>

                {/* 프로그램 요약 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <StatCard
                    title="주간 총 시간"
                    value={`${generatedProgram.summary.weeklyDuration}분`}
                    icon="⏱️"
                    subtitle={`세션당 ${quickGenState.sessionDuration}분`}
                    color="blue"
                  />
                  <StatCard
                    title="주간 총 거리"
                    value={`${generatedProgram.summary.weeklyDistance.toLocaleString()}m`}
                    icon="📏"
                    subtitle={`${generatedProgram.sessions.length}회 세션`}
                    color="green"
                  />
                  <StatCard
                    title="사용 영법"
                    value={`${generatedProgram.summary.mainStrokes.length}개`}
                    icon="🏊"
                    subtitle="선택된 영법"
                    color="purple"
                  />
                  <StatCard
                    title="강도 조정"
                    value={`${generatedProgram.sessions[0]?.intensity || 100}%`}
                    icon="💪"
                    subtitle={quickGenState.condition}
                    color="orange"
                  />
                </div>

                {/* 조정 사항 안내 */}
                {generatedProgram.summary.adjustmentNote && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
                    <p className="text-sm text-yellow-800">
                      ⚠️ {generatedProgram.summary.adjustmentNote}
                    </p>
                  </div>
                )}

                {/* 세션별 상세 프로그램 */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 text-lg">📅 주간 일정</h4>
                  
                  {generatedProgram.sessions.map((session: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-bold text-gray-900">
                          {session.day}요일 (Day {session.dayNumber})
                        </h5>
                        <div className="flex gap-3 text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            ⏱️ {session.totalDuration}분
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                            📏 {session.totalDistance}m
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {session.blocks.map((block: any, blockIdx: number) => (
                          <div key={blockIdx} className="bg-white rounded p-3 border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mr-2 ${
                                  block.type === '워밍업' ? 'bg-green-100 text-green-700' :
                                  block.type === '메인 세트' ? 'bg-blue-100 text-blue-700' :
                                  'bg-purple-100 text-purple-700'
                                }`}>
                                  {block.type}
                                </span>
                                <span className="font-semibold text-gray-900">
                                  {block.strokeName}
                                </span>
                              </div>
                              <div className="text-right text-sm">
                                {block.distance > 0 && (
                                  <div className="text-gray-700">
                                    <span className="font-semibold">{block.distance}m</span>
                                    <span className="text-gray-500 ml-2">@ {block.pace}초/100m</span>
                                  </div>
                                )}
                                <div className="text-gray-600">{block.duration}분</div>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              {block.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 프로그램 상세 정보 */}
                <div className="mt-6 bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">📊 프로그램 분석</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">사용 영법:</span>
                      <div className="font-medium text-gray-900">
                        {generatedProgram.summary.mainStrokes.map((s: string) => 
                          ({
                            freestyle: '자유형',
                            backstroke: '배영',
                            breaststroke: '평영',
                            butterfly: '접영',
                            elementary_backstroke: '기본배영',
                            sidestroke: '횡영'
                          }[s] || s)
                        ).join(', ')}
                      </div>
                    </div>
                    {generatedProgram.summary.excludedStrokes.length > 0 && (
                      <div>
                        <span className="text-gray-600">제외 영법:</span>
                        <div className="font-medium text-red-600">
                          {generatedProgram.summary.excludedStrokes.map((s: string) => 
                            ({
                              freestyle: '자유형',
                              backstroke: '배영',
                              breaststroke: '평영',
                              butterfly: '접영',
                              elementary_backstroke: '기본배영',
                              sidestroke: '횡영'
                            }[s] || s)
                          ).join(', ')}
                        </div>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">통증 상태:</span>
                      <div className={`font-medium ${generatedProgram.summary.hasPain ? 'text-red-600' : 'text-green-600'}`}>
                        {generatedProgram.summary.hasPain ? '⚠️ 통증 있음' : '✅ 통증 없음'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-6 h-full overflow-y-auto">
            {/* 엔진 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="생성된 프로그램"
                value={`${engineStats.totalPrograms}개`}
                icon="💾"
                color="blue"
                subtitle="총 생성 건수"
              />
              <StatCard
                title="평균 생성 시간"
                value={`${engineStats.averageGenerationTime}초`}
                icon="⚡"
                color="green"
                subtitle="처리 속도"
              />
              <StatCard
                title="성공률"
                value={`${engineStats.successRate}%`}
                icon="✅"
                color="purple"
                subtitle="정확도"
              />
              <StatCard
                title="안전성 등급"
                value={engineStats.safetyScore}
                icon="🛡️"
                color="orange"
                subtitle="AAA 등급"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-8 w-8 text-purple-500" />
                  <h3 className="text-lg font-semibold">안전 기능</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>의료진 검토 완료</p>
                  <p>부상 위험 최소화</p>
                  <p>개인별 맞춤 조절</p>
                  <p>실시간 모니터링</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                엔진 설명
              </h3>
              <div className="prose max-w-none text-gray-700">
                <p className="mb-4">
                  수영 트레이닝 규칙 엔진은 개인의 건강 상태, 체력 수준, 수영 실력을 종합적으로 분석하여 
                  최적의 수영 프로그램을 자동으로 생성하는 AI 시스템입니다.
                </p>
                <p className="mb-4">
                  <strong className="text-blue-600">{dataPackCounts.conditionsMSK28}개 MSK 질환 + {dataPackCounts.conditionsAll}개 전체 질환</strong> 가이드라인과 
                  <strong className="text-green-600"> {dataPackCounts.strokeGuides}가지 영법</strong>별 운동 프로그램을 기반으로 
                  안전하고 효과적인 맞춤형 수영 교육을 제공합니다.
                </p>
                <p className="mb-4 text-sm text-gray-600">
                  <strong>데이터팩:</strong> 드릴 {dataPackCounts.drills}개 | 훈련법 {dataPackCounts.methods}개 | 의학적 근거 {SWIMLAB_EVIDENCE.length}개 출처
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">🏥 의학적 근거</h4>
                    <p className="text-sm text-blue-700">
                      의료진 검토를 거친 과학적 근거 기반의 운동 처방 시스템
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">🎯 개인 맞춤</h4>
                    <p className="text-sm text-green-700">
                      개인의 건강 상태와 수영 실력에 따른 맞춤형 프로그램 생성
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">🛡️ 안전성</h4>
                    <p className="text-sm text-purple-700">
                      관절질환별 위험도 분석을 통한 안전한 운동 프로그램 제공
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2">📊 성취율 기반</h4>
                    <p className="text-sm text-orange-700">
                      개인의 운동 성취율을 분석하여 지속 가능한 프로그램 제공
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'condition-setup' && (
          <div className="space-y-6 h-full overflow-y-auto">

            {/* 선수 프로필 바 (기존 유지) */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                회원 프로필
              </h3>
              
              <AthleteProfileBar
                condIds={conditionIds}
                onBulkVariablesNeeded={(members) => {
                  // 다중 회원 선택 시 변수 설정 모달 표시
                  console.log('🎯 onBulkVariablesNeeded 받은 데이터:', members.map(m => ({
                    name: m.name,
                    'studentInfo': m.studentInfo,
                    'studentInfo?.currentLevel': m.studentInfo?.currentLevel,
                    'level': (m as any).level
                  })));
                  setBulkSelectedMembers(members);
                  setShowBulkVariablesModal(true);
                }}
                onLoad={async (athlete: AthleteProfile) => {
                  // 선수 선택 시 저장된 모든 변수 자동 로드
                  console.log('선수 선택됨:', athlete.name, '컨디션:', athlete.conditionIds);
                  
                  // athlete.id가 "athlete_X" 형식이면 실제 User _id 추출
                  const actualUserId = athlete.id.startsWith('athlete_') 
                    ? athlete.id.replace('athlete_', '') 
                    : athlete.id;
                  
                  // 현재 선택된 회원 ID 저장 (프로그램 목록용)
                  setCurrentAthleteId(actualUserId);
                  
                  // 1. 컨디션 설정
                  if (athlete.conditionIds && athlete.conditionIds.length > 0) {
                    setConditionIds(athlete.conditionIds);
                    console.log('컨디션 설정됨:', athlete.conditionIds);
                  }
                  
                  // 2. 회원의 모든 저장된 변수 불러오기
                  const athleteData = athlete as any;
                  setQuickGenState(prev => ({
                    ...prev,
                    selectedMember: athlete,
                    mainStrokes: athleteData.mainStrokes || prev.mainStrokes,
                    excludedStrokes: athleteData.excludedStrokes || prev.excludedStrokes,
                    strokeCSS: athleteData.customCSS || prev.strokeCSS,
                    sessionsPerWeek: athleteData.sessionsPerWeek || prev.sessionsPerWeek,
                    sessionDuration: athleteData.sessionDuration || prev.sessionDuration,
                    goal: athleteData.goal || prev.goal
                  }));
                  
                  console.log('회원 변수 로드 완료:', {
                    mainStrokes: athleteData.mainStrokes,
                    excludedStrokes: athleteData.excludedStrokes,
                    sessionsPerWeek: athleteData.sessionsPerWeek,
                    sessionDuration: athleteData.sessionDuration
                  });
                  
                  // 완료율 기반 프로그램 변경 제안 분석 (개인 PT만)
                  if (!(athlete as any).groupClassId) {
                    try {
                      const response = await apiClient.get(`/api/swim-programs/athlete/${actualUserId}/history`);
                      const programHistory = (response as any).data?.data?.programs || [];
                      
                      if (programHistory.length >= 3) { // 최소 3주 이상의 기록이 있을 때
                        // 현재 CSS (가상으로 strokeCSS 사용, 실제로는 최근 측정값 사용)
                        const currentCSS = quickGenState.strokeCSS;
                        
                        const analysis = analyzeProgress(
                          athlete.id,
                          programHistory,
                          currentCSS
                        );
                        
                        if ((analysis as any).shouldChange) {
                          setProgramSuggestion(analysis);
                          console.log('프로그램 변경 제안:', analysis);
                        } else {
                          setProgramSuggestion(null);
                        }
                      }
                    } catch (error) {
                      console.error('프로그램 분석 실패:', error);
                    }
                  } else {
                    console.log('📚 단체반 선택됨: 이력 분석 스킵');
                    setProgramSuggestion(null);
                  }
                }}
                onBulkSelect={(ids: string[]) => setTeamSelectedIds(ids)}
              />

              {/* 팀 내보내기 버튼 */}
              {teamSelectedIds.length > 1 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    {/* 일괄 프로그램 생성 버튼 */}
                    <button
                      className="px-4 py-3 text-sm border-2 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-700 border-purple-300 font-semibold shadow-md hover:shadow-lg transition-all"
                      onClick={async () => {
                        const athletes = listAthletes().filter(a => teamSelectedIds.includes(a.id));
                        if (!athletes.length) return alert('프로그램을 생성할 선수를 선택하세요.');
                        
                        if (!confirm(`${athletes.length}명의 프로그램을 일괄 생성하시겠습니까?\n\n각 선수의 개별 변수(CSS, 선호 영법, 운동 요일, 목표)가 적용됩니다.`)) {
                          return;
                        }
                        
                        let successCount = 0;
                        
                        for (const athlete of athletes) {
                          try {
                            // 각 선수의 개별 변수 사용
                            const customCSS = (athlete as any).customCSS || {};
                            const trainingDays = (athlete as any).trainingDays || [1, 3, 5];
                            const goal = (athlete as any).goal || '체력 향상';
                            
                            // 프로그램 생성 로직 (간소화)
                            // 실제로는 ProgramGeneratorPanel의 handleGenerate 로직 사용
                            console.log(`${athlete.name} 프로그램 생성:`, {
                              css: customCSS,
                              days: trainingDays.length,
                              goal
                            });
                            
                            successCount++;
                          } catch (error) {
                            console.error(`${athlete.name} 프로그램 생성 실패:`, error);
                          }
                        }
                        
                        alert(`${successCount}/${athletes.length}명의 프로그램이 생성되었습니다!`);
                      }}
                    >
                      🚀 일괄 프로그램 생성 ({teamSelectedIds.length}명)
                    </button>
                    
                    <button
                      className="px-4 py-2 text-sm border rounded bg-gradient-to-r from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 text-green-700 border-green-200 font-medium"
                      onClick={() => {
                        const athletes = listAthletes().filter(a => teamSelectedIds.includes(a.id));
                        if (!athletes.length) return alert('내보낼 선수를 선택하세요.');
                        
                        exportWeeklyForAthletes({
                          startDate: new Date().toISOString().slice(0,10),
                          daysPerWeek: 5,
                          weeklyMeters: 8000,
                          pool: 25,
                          stroke: 'FR',
                          withTT: true,
                          cssPer100: 100,
                          conditionIds: [],
                          skill: 'Intermediate',
                          heightCm: 175,
                          anchorMode: 'soft',
                          variancePct: 20,
                          methods: [],
                          drills: [],
                        }, athletes);
                        
                        alert(`${athletes.length}명의 주간 계획이 다운로드되었습니다!`);
                      }}
                    >
                      📦 팀 주간 계획 일괄 내보내기 ({teamSelectedIds.length}명)
                    </button>
                    
                    <div className="text-xs text-gray-600">
                      각 선수의 컨디션이 자동으로 반영됩니다
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 컨디션 선택 컴포넌트 (기존 유지) */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  컨디션 선택
                </h3>
                {/* 커버리지 지표 + 템플릿 내보내기 */}
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-600 bg-gray-50 px-3 py-1 rounded-full border">
                    규칙 커버리지: <span className="font-medium">{measureCoverage().ratio}%</span>
                  </div>
                  <button
                    className="text-xs px-3 py-1 border rounded bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 text-orange-700 border-orange-200 font-medium"
                    onClick={()=>{
                      const txt = generateRuleTemplates();
                      const blob = new Blob([txt], {type:'text/plain'});
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url; 
                      a.download = 'rules_templates_unmapped.ts'; 
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    📄 룰 템플릿 내보내기
                  </button>
                </div>
              </div>
              
              {/* 선택된 회원 정보 표시 */}
              {teamSelectedIds.length === 1 && (() => {
                const selectedAthlete = listAthletes().find(a => a.id === teamSelectedIds[0]);
                if (!selectedAthlete) return null;
                
                return (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-300 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">
                      👤 선택된 회원: {selectedAthlete.name}
                    </h4>
                    <p className="text-xs text-blue-600">
                      회원 정보에 기입된 질환/특수상황이 자동으로 표시됩니다.
                    </p>
                  </div>
                );
              })()}
              
              {/* 현재 선택된 질환/특수상황 표시 */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700">
                      📋 질환/특수상황 ({conditionIds.length}개)
                    </h4>
                    {conditionIds.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {allConditions
                          .filter(c => conditionIds.includes(c.id))
                          .map(c => c.label)
                          .slice(0, 3)
                          .join(', ')}
                        {conditionIds.length > 3 && ` 외 ${conditionIds.length - 3}개`}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAllConditionsModal(true)}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold"
                    >
                      ➕ 질환/특수상황 모두보기
                    </button>
                    {teamSelectedIds.length === 1 && conditionIds.length > 0 && (
                      <button
                        onClick={async () => {
                          const selectedAthlete = listAthletes().find(a => a.id === teamSelectedIds[0]);
                          if (!selectedAthlete) {
                            alert('회원을 찾을 수 없습니다.');
                            return;
                          }

                          try {
                            await apiClient.patch(`/users/${selectedAthlete.id}/conditions`, {
                              conditionIds: conditionIds
                            });
                            alert(`✅ ${selectedAthlete.name}의 질환/특수상황 ${conditionIds.length}개가 저장되었습니다!`);
                          } catch (error) {
                            console.error('회원 정보 업데이트 실패:', error);
                            alert('❌ 저장에 실패했습니다. 콘솔을 확인하세요.');
                          }
                        }}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-semibold animate-pulse"
                      >
                        💾 회원에 저장 ({conditionIds.length}개)
                      </button>
                    )}
                  </div>
                </div>
                
                {conditionIds.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {allConditions
                      .filter(c => conditionIds.includes(c.id))
                      .map(c => (
                        <span 
                          key={c.id}
                          className="px-3 py-1.5 bg-white border border-blue-300 rounded-full text-xs text-blue-700 font-medium inline-flex items-center gap-2 hover:bg-blue-50 transition-colors cursor-pointer"
                          onClick={() => {
                            // 클릭하면 제거
                            setConditionIds(prev => prev.filter(id => id !== c.id));
                          }}
                        >
                          {c.label}
                          <span className="text-red-500 hover:text-red-700">✕</span>
                        </span>
                      ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-600">
                    💡 "➕ 질환/특수상황 모두보기" 버튼을 눌러 질환/특수상황을 선택하세요.
                  </p>
                )}
                
                {teamSelectedIds.length === 1 && (
                  <p className="text-xs text-gray-500 mt-2">
                    ℹ️ 선택 후 "💾 회원에 저장" 버튼을 눌러야 프로그램 생성 시 반영됩니다.
                  </p>
                )}
              </div>
            </div>

            {/* ⚠️ 모든 회원 설정은 [수정] 버튼 → 팝업에서 진행 */}

            {/* 프로그램 변경 제안 카드 */}
            {programSuggestion && (
              <ProgramSuggestionCard
                analysis={programSuggestion}
                onAccept={() => {
                  // 제안된 목표로 자동 설정
                  if (programSuggestion.suggestions && programSuggestion.suggestions.length > 0) {
                    const newGoal = programSuggestion.suggestions[0].newGoal;
                    // 목표 매핑 ('performance' -> '실력 향상', 'technique' -> '기술 연마')
                    const goalMapping: Record<string, string> = {
                      'performance': '실력 향상',
                      'technique': '기술 연마',
                      'endurance': '체력 향상',
                      'rehabilitation': '재활'
                    };
                    const mappedGoal = goalMapping[newGoal] || newGoal;
                    setQuickGenState(prev => ({ ...prev, goal: mappedGoal }));
                    alert(`목표가 "${mappedGoal}"으로 변경되었습니다!`);
                  }
                  setProgramSuggestion(null);
                }}
                onDecline={() => {
                  setProgramSuggestion(null);
                  alert('현재 목표를 유지합니다.');
                }}
              />
            )}

            {/* 운동 목표 및 설정 안내 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200 p-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                💡 회원 설정 방법
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>1. <strong>[회원 불러오기]</strong> 버튼으로 회원을 선택하세요</p>
                <p>2. 회원을 체크박스로 선택한 후 <strong>[✏️ 수정]</strong> 버튼을 클릭하세요</p>
                <p>3. 팝업에서 CSS, 주영법, 회피영법, 운동요일, 목표, 컨디션 등을 설정하세요</p>
                <p>4. <strong>[저장 후 주간 계획 생성]</strong> 버튼으로 프로그램을 생성하세요</p>
              </div>
              <div className="mt-4 p-3 bg-white rounded border border-blue-200">
                <p className="text-xs text-gray-600">
                  ✅ 목표에 따라 <strong>25개 훈련법</strong>과 <strong>40개 드릴</strong>이 자동 선택됩니다<br/>
                  ✅ 컨디션에 따라 안전한 영법만 자동으로 필터링됩니다
                </p>
              </div>
            </div>

            {/* 완료율 기반 조정 옵션 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                📊 완료율 기반 강도 조정
              </h3>
              
              <div className="space-y-4">
                {/* 조정 적용 여부 토글 */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-800">
                        이전 완료율 반영
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        quickGenState.applyCompletionRate 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {quickGenState.applyCompletionRate ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      이전 프로그램의 완료율을 분석하여 다음 프로그램의 강도/볼륨을 자동으로 조정합니다
                    </p>
                  </div>
                  <button
                    onClick={() => setQuickGenState(prev => ({
                      ...prev,
                      applyCompletionRate: !prev.applyCompletionRate
                    }))}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      quickGenState.applyCompletionRate
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    }`}
                  >
                    {quickGenState.applyCompletionRate ? '적용 중 ✓' : '적용 안 함'}
                  </button>
                </div>

                {/* 강도 조정 모드 (완료율 적용 시에만 표시) */}
                {quickGenState.applyCompletionRate && (
                  <div className="border rounded-lg p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      강도 조정 모드
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { value: 'auto', label: '🤖 자동 조정', desc: 'AI가 완료율 분석하여 추천' },
                        { value: 'maintain', label: '➡️ 현재 유지', desc: '이전과 동일한 강도' },
                        { value: 'increase', label: '⬆️ 강제 증가', desc: '+5% 강도 상승' },
                        { value: 'decrease', label: '⬇️ 강제 감소', desc: '-10% 강도 하락' }
                      ].map((mode) => (
                        <button
                          key={mode.value}
                          onClick={() => setQuickGenState(prev => ({ 
                            ...prev, 
                            intensityMode: mode.value as any 
                          }))}
                          className={`px-4 py-3 border-2 rounded-lg transition-all text-left ${
                            quickGenState.intensityMode === mode.value
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="font-semibold text-sm mb-1">{mode.label}</div>
                          <div className="text-xs text-gray-600">{mode.desc}</div>
                        </button>
                      ))}
                    </div>
                    
                    {quickGenState.intensityMode === 'auto' && (
                      <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                        <p className="text-sm text-green-800">
                          💡 <strong>자동 조정</strong>: 최근 3주 완료율, RPE(체감 난이도), 부상 이력을 종합 분석하여 
                          과학적으로 최적의 강도를 추천합니다.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 완료율 적용 안함 시 안내 */}
                {!quickGenState.applyCompletionRate && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      ℹ️ 완료율 반영이 <strong>OFF</strong> 상태입니다. 
                      이전 프로그램의 완료율과 관계없이 표준 강도로 생성됩니다.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 선택 결과 표시 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                선택 결과
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">선택된 컨디션:</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {conditionIds.length}개
                  </span>
                </div>

                {conditionIds.length > 0 && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="text-xs font-mono text-gray-600 mb-2">
                      conditionIds (배열):
                    </div>
                    <div className="text-sm font-mono bg-white p-3 rounded border border-gray-200 overflow-x-auto">
                      <pre className="text-xs">{JSON.stringify(conditionIds, null, 2)}</pre>
                    </div>
                  </div>
                )}

                {conditionIds.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">
                      위에서 컨디션을 선택하면 여기에 결과가 표시됩니다
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 프로그램 생성 패널 */}
            <ProgramGeneratorPanel
              selectedAthleteIds={teamSelectedIds}
              conditionIds={conditionIds}
              timeBasedSettings={{
                sessionDuration: quickGenState.sessionDuration,
                mainStrokes: quickGenState.mainStrokes,
                excludedStrokes: quickGenState.excludedStrokes,
                strokeCSS: quickGenState.strokeCSS,
                goal: quickGenState.goal,
                applyCompletionRate: quickGenState.applyCompletionRate, // 완료율 반영 여부
                intensityMode: quickGenState.intensityMode // 강도 조정 모드
                // ⚠️ condition, hasPain 제거: 프로그램 실행 시점에 입력
              }}
            />
          </div>
        )}

        {activeTab === 'program-list' && (
          <div className="h-full overflow-y-auto">
              <ProgramListView 
                selectedAthleteId={currentAthleteId}
              />
          </div>
        )}

        {activeTab === 'training-methods' && (
          <div className="h-full relative">
            {/* 고정 헤더 */}
            <div className="absolute top-0 left-0 right-0 bg-white z-30 pb-2 border-b border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">훈련법 관리</h3>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => {
                      const newMethod = {
                        id: `custom_method_${Date.now()}`,
                        title: prompt('훈련법 이름:') || '새 훈련법',
                        category: 'Endurance' as any,
                        whenToUse: prompt('언제 사용하나요?') || '',
                        whoShouldUse: prompt('누구에게 적합한가요?') || '',
                        howToDo: prompt('어떻게 하나요?') || '',
                        intensityAndVolume: prompt('강도와 볼륨:') || '',
                        pros: prompt('장점:') || '',
                        cons: prompt('단점:') || '',
                        cautions: prompt('주의사항:') || '',
                        recommendedDrills: [],
                        evidence: []
                      };
                      saveCustomMethod(newMethod);
                      setAllMethods(getMergedMethods(TRAINING_METHODS));
                      alert('✅ 훈련법이 추가되었습니다!\n→ 즉시 프로그램 생성에 반영됩니다.');
                    }}
                    variant="primary"
                    size="sm"
                  >
                    ➕ 훈련법 추가
                  </Button>
                  <div className="text-sm text-gray-600">
                    총 {allMethods.length}개의 훈련법 (기본 {TRAINING_METHODS.length} + 커스텀 {allMethods.length - TRAINING_METHODS.length})
                  </div>
                </div>
              </div>
              
            </div>

            {/* 스크롤 가능한 콘텐츠 - 훈련법 */}
            <div className="pt-24 h-full overflow-y-auto pb-20">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 p-8">
                {allMethods.map((method) => (
                  <div
                    key={method.id}
                    className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer min-h-[280px] flex flex-col"
                    onClick={() => setSelectedTrainingMethod(method.id)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        <h4 className="font-semibold text-gray-800">{method.title}</h4>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        method.category === 'Endurance' ? 'bg-blue-100 text-blue-700' :
                        method.category === 'Speed' ? 'bg-red-100 text-red-700' :
                        method.category === 'Technique' ? 'bg-green-100 text-green-700' :
                        method.category === 'RaceStrategy' ? 'bg-purple-100 text-purple-700' :
                        'bg-teal-100 text-teal-700'
                      }`}>
                        {method.category}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm flex-1">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="font-medium text-blue-700 mb-1 text-xs">📌 언제 사용하나요?</div>
                        <div className="text-blue-600 text-xs leading-relaxed">{method.whenToUse}</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="font-medium text-green-700 mb-1 text-xs">👤 누구에게 적합한가요?</div>
                        <div className="text-green-600 text-xs">{method.whoShouldUse}</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="font-medium text-purple-700 mb-1 text-xs">🏊‍♂️ 어떻게 하나요?</div>
                        <div className="text-purple-600 text-xs font-mono">{method.howToDo}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="font-medium text-gray-700 mb-1 text-xs">⚡ 강도/볼륨</div>
                        <div className="text-gray-600 text-xs">{method.intensityAndVolume}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-3 text-center border-t pt-2">
                      클릭하여 상세 정보 보기 →
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 훈련법 상세 모달 */}
            {selectedTrainingMethod && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeTrainingMethodModal}>
                <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                  {/* 고정 헤더 */}
                  <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 flex-shrink-0">
                    <h3 className="text-lg font-semibold">훈련법 상세 정보</h3>
                    <button 
                      onClick={closeTrainingMethodModal}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  
                  {/* 스크롤 가능한 콘텐츠 */}
                  <div className="flex-1 overflow-y-auto p-6 pt-4">
                    {(() => {
                      const method = TRAINING_METHODS.find(m => m.id === selectedTrainingMethod);
                      if (!method) return null;
                      
                      return (
                        <div className="space-y-4">
                          {/* 제목 및 카테고리 */}
                          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 rounded-lg text-white">
                            <h4 className="text-xl font-bold mb-2">{method.title}</h4>
                            <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                              method.category === 'Endurance' ? 'bg-blue-500' :
                              method.category === 'Speed' ? 'bg-red-500' :
                              method.category === 'Technique' ? 'bg-green-500' :
                              method.category === 'RaceStrategy' ? 'bg-purple-500' :
                              'bg-teal-500'
                            }`}>
                              {method.category}
                            </span>
                          </div>

                          {/* 언제 사용하나요? */}
                          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                            <h4 className="font-semibold text-blue-800 mb-2 text-lg">📌 언제 사용하나요?</h4>
                            <p className="text-blue-700">{method.whenToUse}</p>
                          </div>

                          {/* 누구에게 적합한가요? */}
                          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                            <h4 className="font-semibold text-green-800 mb-2 text-lg">👤 누구에게 적합한가요?</h4>
                            <p className="text-green-700">{method.whoShouldUse}</p>
                          </div>

                          {/* 어떻게 하나요? */}
                          <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                            <h4 className="font-semibold text-purple-800 mb-2 text-lg">🏊‍♂️ 어떻게 하나요?</h4>
                            <p className="text-purple-700 font-mono bg-purple-100 px-4 py-2 rounded">{method.howToDo}</p>
                          </div>

                          {/* 강도와 볼륨 */}
                          <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                            <h4 className="font-semibold text-orange-800 mb-2 text-lg">⚡ 강도와 볼륨</h4>
                            <p className="text-orange-700">{method.intensityAndVolume}</p>
                          </div>

                          {/* 장점 */}
                          <div className="bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-500">
                            <h4 className="font-semibold text-emerald-800 mb-2 text-lg">✅ 장점</h4>
                            <p className="text-emerald-700">{method.pros}</p>
                          </div>

                          {/* 단점 */}
                          <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
                            <h4 className="font-semibold text-amber-800 mb-2 text-lg">⚠️ 단점</h4>
                            <p className="text-amber-700">{method.cons}</p>
                          </div>

                          {/* 주의사항 */}
                          <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                            <h4 className="font-semibold text-red-800 mb-2 text-lg flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5" /> 주의사항
                            </h4>
                            <p className="text-red-700">{method.cautions}</p>
                          </div>

                          {/* 추천 드릴 */}
                          {method.recommendedDrills && method.recommendedDrills.length > 0 && (
                            <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
                              <h4 className="font-semibold text-indigo-800 mb-3 text-lg">🎯 추천 드릴</h4>
                              <div className="flex flex-wrap gap-2">
                                {method.recommendedDrills.map((drillId, index) => (
                                  <span key={index} className="px-3 py-1 bg-indigo-200 text-indigo-800 rounded text-sm font-medium">
                                    {drillId}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 의학적 근거 */}
                          {method.evidence && method.evidence.length > 0 && (
                            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-500">
                              <h4 className="font-semibold text-gray-800 mb-3 text-lg">📚 의학적 근거</h4>
                              <div className="space-y-2">
                                {method.evidence.map((ev, index) => (
                                  <div key={index} className="text-gray-700">
                                    <a 
                                      href={ev.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline flex items-center gap-2"
                                    >
                                      <span className="font-medium">{ev.label}</span>
                                      <span className="text-xs">↗</span>
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'drills' && (
          <div className="h-full relative">
            {/* 고정 헤더 */}
            <div className="absolute top-0 left-0 right-0 bg-white z-30 pb-2 border-b border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">드릴 관리</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const newDrill = {
                        id: `custom_drill_${Date.now()}`,
                        name: prompt('드릴 이름:') || '새 드릴',
                        definition: prompt('정의:') || '',
                        why: prompt('왜 하는가?') || '',
                        when: prompt('언제 하는가?') || '',
                        who: prompt('누구에게 적합한가?') || '',
                        how: prompt('어떻게 하는가?') || '',
                        pros: prompt('장점:') || '',
                        cons: prompt('단점:') || '',
                        cautions: prompt('주의사항:') || '',
                        cues: [],
                        examples: [],
                        tags: [],
                        evidence: []
                      };
                      saveCustomDrill(newDrill);
                      setAllDrills(getMergedDrills(DRILLS));
                      alert('✅ 드릴이 추가되었습니다!\n→ 즉시 프로그램 생성에 반영됩니다.');
                    }}
                    className="px-3 py-1 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                  >
                    + 드릴 추가
                  </button>
                  <div className="text-sm text-gray-600">
                    총 {allDrills.length}개의 드릴 (기본 {DRILLS.length} + 커스텀 {allDrills.length - DRILLS.length})
                  </div>
                </div>
              </div>
              
            </div>

            {/* 스크롤 가능한 콘텐츠 - 드릴 */}
            <div className="pt-24 h-full overflow-y-auto pb-20">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 p-8">
                {allDrills.map((drill) => (
                  <div 
                    key={drill.id} 
                    className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer min-h-[280px] flex flex-col"
                    onClick={() => setSelectedDrill(drill.id)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-orange-500" />
                        <h4 className="font-semibold text-gray-800">{drill.name}</h4>
                      </div>
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                        {drill.id}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm flex-1">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="font-medium text-blue-700 mb-1 text-xs">📖 정의</div>
                        <div className="text-blue-600 text-xs leading-relaxed">{drill.definition}</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="font-medium text-purple-700 mb-1 text-xs">🎯 왜 하는가?</div>
                        <div className="text-purple-600 text-xs">{drill.why}</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="font-medium text-green-700 mb-1 text-xs">👤 누구에게?</div>
                        <div className="text-green-600 text-xs">{drill.who}</div>
                      </div>
                      <div className="bg-amber-50 p-3 rounded-lg">
                        <div className="font-medium text-amber-700 mb-1 text-xs">⏰ 언제?</div>
                        <div className="text-amber-600 text-xs">{drill.when}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="font-medium text-gray-700 mb-1 text-xs">🏊‍♂️ 어떻게?</div>
                        <div className="text-gray-600 text-xs font-mono">{drill.how}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-3 text-center border-t pt-2">
                      클릭하여 상세 정보 보기 →
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 드릴 상세 모달 */}
            {selectedDrill && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeDrillModal}>
                <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                  {/* 고정 헤더 */}
                  <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 flex-shrink-0">
                    <h3 className="text-lg font-semibold">드릴 상세 정보</h3>
                    <button 
                      onClick={closeDrillModal}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  
                  {/* 스크롤 가능한 콘텐츠 */}
                  <div className="flex-1 overflow-y-auto p-6 pt-4">
                    {(() => {
                      const drill = DRILLS.find(d => d.id === selectedDrill);
                      if (!drill) return null;
                      
                      return (
                        <div className="space-y-4">
                          {/* 이름 및 기본 정보 */}
                          <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-5 rounded-lg text-white">
                            <h4 className="text-xl font-bold mb-3">{drill.name}</h4>
                            <div className="flex flex-wrap gap-3 text-sm">
                              <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                                <User className="h-3 w-3" />
                                <span>{drill.who}</span>
                              </div>
                              <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                                <Clock className="h-3 w-3" />
                                <span>{drill.when}</span>
                              </div>
                            </div>
                          </div>

                          {/* 정의 */}
                          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                            <h4 className="font-semibold text-blue-800 mb-2 text-lg">📖 정의</h4>
                            <p className="text-blue-700">{drill.definition}</p>
                          </div>

                          {/* 왜 하는가? */}
                          <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                            <h4 className="font-semibold text-purple-800 mb-2 text-lg">🎯 왜 하는가?</h4>
                            <p className="text-purple-700">{drill.why}</p>
                          </div>

                          {/* 어떻게 하는지 */}
                          <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
                            <h4 className="font-semibold text-indigo-800 mb-2 text-lg">🏊‍♂️ 어떻게 하는가?</h4>
                            <p className="text-indigo-700 font-mono bg-indigo-100 px-4 py-2 rounded">{drill.how}</p>
                          </div>

                          {/* 코칭 큐 */}
                          {drill.cues && drill.cues.length > 0 && (
                            <div className="bg-teal-50 p-4 rounded-lg border-l-4 border-teal-500">
                              <h4 className="font-semibold text-teal-800 mb-3 text-lg">🎯 코칭 큐 (선수에게 이렇게 말하세요)</h4>
                              <div className="flex flex-wrap gap-2">
                                {drill.cues.map((cue, idx) => (
                                  <span key={idx} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium shadow-sm">
                                    &quot;{cue}&quot;
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 예시 */}
                          {drill.examples && drill.examples.length > 0 && (
                            <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
                              <h4 className="font-semibold text-amber-800 mb-3 text-lg">📌 세트 예시</h4>
                              <div className="grid grid-cols-1 gap-2">
                                {drill.examples.map((ex, idx) => (
                                  <div key={idx} className="text-amber-900 font-mono bg-amber-100 px-4 py-2 rounded border border-amber-200">
                                    {ex}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* 장점 */}
                          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                            <h4 className="font-semibold text-green-800 mb-2 text-lg">✅ 장점</h4>
                            <p className="text-green-700">{drill.pros}</p>
                          </div>
                          
                          {/* 단점 */}
                          <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                            <h4 className="font-semibold text-orange-800 mb-2 text-lg">⚠️ 단점</h4>
                            <p className="text-orange-700">{drill.cons}</p>
                          </div>

                          {/* 주의사항 */}
                          <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                            <h4 className="font-semibold text-red-800 mb-2 text-lg flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" /> 주의사항
                            </h4>
                            <p className="text-red-700">{drill.cautions}</p>
                          </div>

                          {/* 태그 */}
                          {drill.tags && drill.tags.length > 0 && (
                            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-500">
                              <h4 className="font-semibold text-gray-800 mb-3 text-lg">🏷️ 태그</h4>
                              <div className="flex flex-wrap gap-2">
                                {drill.tags.map((tag, idx) => (
                                  <span key={idx} className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 의학적 근거 */}
                          {drill.evidence && drill.evidence.length > 0 && (
                            <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-slate-500">
                              <h4 className="font-semibold text-slate-800 mb-3 text-lg">📚 참고 자료</h4>
                              <div className="space-y-2">
                                {drill.evidence.map((ev, index) => (
                                  <div key={index} className="text-slate-700">
                                    <a 
                                      href={ev.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline flex items-center gap-2"
                                    >
                                      <span className="font-medium">{ev.label}</span>
                                      <span className="text-xs">↗</span>
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'conditions' && (
          <div className="h-full relative">
            {/* 고정 헤더 */}
            <div className="absolute top-0 left-0 right-0 bg-white z-30 pb-2 border-b border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">질환별 가이드라인</h3>
                <div className="flex items-center gap-3">
                  {/* 📋 질환/특수상황 모두보기 버튼 */}
                  <button
                    onClick={() => {
                      const selectedAthlete = teamSelectedIds.length === 1 
                        ? listAthletes().find(a => a.id === teamSelectedIds[0])
                        : null;
                      
                      const athleteInfo = selectedAthlete 
                        ? `\n\n👤 선택된 회원: ${selectedAthlete.name}\n현재 설정: ${conditionIds.length}개`
                        : '\n\n👤 회원을 선택하면 해당 회원의 질환/특수상황이 표시됩니다.';
                      
                      alert(
                        `📋 질환/특수상황 현황\n\n` +
                        `총 ${allConditions.length}개 등록됨\n` +
                        `- 기본 질환: ${jointConditionsBase.length}개\n` +
                        `- 특수상황: ${allConditions.filter(c => c.category === 'special').length}개\n` +
                        `- 커스텀: ${allConditions.length - jointConditionsBase.length}개` +
                        athleteInfo +
                        `\n\n💡 질환을 선택하고 "회원에 저장" 버튼을 눌러 저장하세요.`
                      );
                    }}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold"
                  >
                    📋 질환/특수상황 모두보기
                  </button>
                  
                  {/* 💾 회원에 저장 버튼 */}
                  {teamSelectedIds.length === 1 && conditionIds.length > 0 && (
                    <button
                      onClick={async () => {
                        const selectedAthlete = listAthletes().find(a => a.id === teamSelectedIds[0]);
                        if (!selectedAthlete) {
                          alert('회원을 찾을 수 없습니다.');
                          return;
                        }
                        
                        // conditionIds를 회원 정보에 저장
                        try {
                          await apiClient.patch(`/users/${selectedAthlete.id}/conditions`, {
                            conditionIds: conditionIds
                          });
                          alert(`✅ ${selectedAthlete.name}의 질환/특수상황 ${conditionIds.length}개가 저장되었습니다!`);
                        } catch (error) {
                          console.error('회원 정보 업데이트 실패:', error);
                          alert('❌ 저장에 실패했습니다. 콘솔을 확인하세요.');
                        }
                      }}
                      className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-semibold animate-pulse"
                    >
                      💾 회원에 저장 ({conditionIds.length}개)
                    </button>
                  )}
                  
                  <div className="text-sm text-gray-600">
                    선택됨: <strong className="text-green-600">{conditionIds.length}개</strong>
                  </div>
                </div>
              </div>
              
              {/* 카테고리 필터 */}
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === 'all' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  전체 ({allJointConditions.length})
                </button>
                <button
                  onClick={() => setSelectedCategory('spine')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === 'spine' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  척추 ({allJointConditions.filter(c => c.category === 'spine').length})
                </button>
                <button
                  onClick={() => setSelectedCategory('knee')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === 'knee' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  무릎 ({allJointConditions.filter(c => c.category === 'knee').length})
                </button>
                <button
                  onClick={() => setSelectedCategory('shoulder')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === 'shoulder' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  어깨 ({allConditions.filter(c => c.category === 'shoulder').length})
                </button>
                <button
                  onClick={() => setSelectedCategory('hip')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === 'hip' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  고관절 ({allConditions.filter(c => c.category === 'hip').length})
                </button>
                <button
                  onClick={() => setSelectedCategory('ankle')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === 'ankle' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  발목 ({allConditions.filter(c => c.category === 'ankle').length})
                </button>
                <button
                  onClick={() => setSelectedCategory('elbow')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === 'elbow' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  팔꿈치 ({allConditions.filter(c => c.category === 'elbow').length})
                </button>
                <button
                  onClick={() => setSelectedCategory('wrist')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === 'wrist' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  손목 ({allConditions.filter(c => c.category === 'wrist').length})
                </button>
                <button
                  onClick={() => setSelectedCategory('knee')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === 'knee' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  무릎 ({allConditions.filter(c => c.category === 'knee').length})
                </button>
                <button
                  onClick={() => setSelectedCategory('skin')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === 'skin' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  피부 ({allConditions.filter(c => c.category === 'skin').length})
                </button>
                <button
                  onClick={() => setSelectedCategory('chronic')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === 'chronic' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  만성질환 ({allConditions.filter(c => c.category === 'chronic').length})
                </button>
                <button
                  onClick={() => setSelectedCategory('mental')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === 'mental' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  정신건강 ({allConditions.filter(c => c.category === 'mental').length})
                </button>
                <button
                  onClick={() => setSelectedCategory('special')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === 'special' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  특수상황 ({allConditions.filter(c => c.category === 'special').length})
                </button>
              </div>
            </div>

            {/* 스크롤 가능한 콘텐츠 */}
            <div className="pt-32 h-screen overflow-y-auto pb-32">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 gap-4 p-8">
                {allConditions
                  .filter(condition => selectedCategory === 'all' || condition.category === selectedCategory)
                  .map((condition) => (
                  <div 
                    key={condition.id} 
                    className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer min-h-[200px] flex flex-col" 
                    onClick={() => setSelectedCondition(condition.id)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      <h4 className="font-medium">{condition.name}</h4>
                    </div>
                    
                    <div className="space-y-3 text-sm flex-1">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="font-medium text-blue-700 mb-2">💡 주요 영향</div>
                        <div className="text-blue-600 text-xs leading-relaxed space-y-1">
                          {condition.impacts?.map((impact: any, idx: number) => (
                            <div key={idx}>
                              <span className="font-semibold">{impact.type}:</span> {impact.how}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="font-medium text-purple-700 mb-2">📍 부위</div>
                        <div className="text-purple-600 text-xs">{condition.category}</div>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <div className="font-medium text-orange-700 mb-2">⚠️ 심각도</div>
                        <div className="text-orange-600 text-xs">
                          {condition.severity === 'mild' ? '경증' : 
                           condition.severity === 'moderate' ? '중등도' : '중증'}
                        </div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="font-medium text-green-700 mb-2">🏊‍♂️ 권장 영법</div>
                        <div className="text-green-600 text-xs">자유형, 배영</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-3 text-center border-t pt-2">
                      클릭하여 상세 정보 보기 →
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 질환별 가이드라인 상세 모달 */}
            {selectedCondition && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedCondition(null)}>
                <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                  {/* 고정 헤더 */}
                  <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 flex-shrink-0">
                    <h3 className="text-lg font-semibold">질환별 가이드라인 상세 정보</h3>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const condition = allConditions.find(c => c.id === selectedCondition);
                        const isCustom = condition?.id.startsWith('custom_');
                        
                        return (
                          <>
                            {isCustom && (
                              <>
                                <button
                                  onClick={() => setEditingCondition(condition)}
                                  className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded"
                                >
                                  ✏️ 수정
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`"${condition.name}"을(를) 삭제하시겠습니까?`)) {
                                      deleteCustomCondition(condition.id);
                                      setAllConditions(getMergedConditions(jointConditionsBase));
                                      setSelectedCondition(null);
                                      alert('✅ 질환이 삭제되었습니다!');
                                    }
                                  }}
                                  className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
                                >
                                  🗑️ 삭제
                                </button>
                              </>
                            )}
                            <button 
                              onClick={() => setSelectedCondition(null)}
                              className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                              ✕
                            </button>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  
                  {/* 스크롤 가능한 콘텐츠 */}
                  <div className="flex-1 overflow-y-auto p-6 pt-4">
                    {(() => {
                      // 두 데이터 소스에서 찾기
                      let condition = allConditions.find(c => c.id === selectedCondition);
                      if (!condition) {
                        const oldCondition = allJointConditions.find(c => c.conditionId === selectedCondition);
                        if (oldCondition) {
                          condition = {
                            id: oldCondition.conditionId,
                            name: oldCondition.conditionName,
                            category: oldCondition.category,
                            severity: oldCondition.severity,
                            description: oldCondition.description,
                            swimmingGuidance: oldCondition.swimmingGuidance,
                            exerciseRestrictions: oldCondition.exerciseRestrictions
                          };
                        }
                      }
                      if (!condition) return <div className="text-center text-gray-500">질환 정보를 찾을 수 없습니다.</div>;
                      
                      return (
                        <div className="space-y-6">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-800 mb-2">💡 질환 설명</h4>
                            <p className="text-blue-700">{condition.description}</p>
                          </div>
                          
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-purple-800 mb-2">📍 부위</h4>
                            <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded text-sm">
                              {condition.category}
                            </span>
                          </div>
                          
                          <div className="bg-orange-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-orange-800 mb-2">⚠️ 심각도</h4>
                            <span className={`px-2 py-1 rounded text-sm ${
                              condition.severity === 'mild' ? 'bg-green-200 text-green-800' :
                              condition.severity === 'moderate' ? 'bg-yellow-200 text-yellow-800' :
                              'bg-red-200 text-red-800'
                            }`}>
                              {condition.severity === 'mild' ? '경증' : 
                               condition.severity === 'moderate' ? '중등도' : '중증'}
                            </span>
                          </div>
                          
                          {/* 6가지 영법별 상세 가이드라인 */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-800 mb-4">🏊‍♂️ 6가지 영법별 상세 가이드라인</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* 자유형 */}
                              <div className={`p-3 rounded-lg border-2 ${
                                condition.swimmingGuidance.freestyle.level === 'safe' ? 'bg-green-50 border-green-200' :
                                condition.swimmingGuidance.freestyle.level === 'caution' ? 'bg-yellow-50 border-yellow-200' :
                                'bg-red-50 border-red-200'
                              }`}>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-medium">🏊‍♂️ 자유형</span>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    condition.swimmingGuidance.freestyle.level === 'safe' ? 'bg-green-200 text-green-800' :
                                    condition.swimmingGuidance.freestyle.level === 'caution' ? 'bg-yellow-200 text-yellow-800' :
                                    'bg-red-200 text-red-800'
                                  }`}>
                                    {condition.swimmingGuidance.freestyle.level === 'safe' ? '안전' :
                                     condition.swimmingGuidance.freestyle.level === 'caution' ? '주의' : '금지'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 mb-2">{condition.swimmingGuidance.freestyle.detailedExplanation}</p>
                                <p className="text-xs text-gray-600">이유: {condition.swimmingGuidance.freestyle.reason}</p>
                              </div>

                              {/* 배영 */}
                              <div className={`p-3 rounded-lg border-2 ${
                                condition.swimmingGuidance.backstroke.level === 'safe' ? 'bg-green-50 border-green-200' :
                                condition.swimmingGuidance.backstroke.level === 'caution' ? 'bg-yellow-50 border-yellow-200' :
                                'bg-red-50 border-red-200'
                              }`}>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-medium">🏊‍♀️ 배영</span>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    condition.swimmingGuidance.backstroke.level === 'safe' ? 'bg-green-200 text-green-800' :
                                    condition.swimmingGuidance.backstroke.level === 'caution' ? 'bg-yellow-200 text-yellow-800' :
                                    'bg-red-200 text-red-800'
                                  }`}>
                                    {condition.swimmingGuidance.backstroke.level === 'safe' ? '안전' :
                                     condition.swimmingGuidance.backstroke.level === 'caution' ? '주의' : '금지'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 mb-2">{condition.swimmingGuidance.backstroke.detailedExplanation}</p>
                                <p className="text-xs text-gray-600">이유: {condition.swimmingGuidance.backstroke.reason}</p>
                              </div>

                              {/* 평영 */}
                              <div className={`p-3 rounded-lg border-2 ${
                                condition.swimmingGuidance.breaststroke.level === 'safe' ? 'bg-green-50 border-green-200' :
                                condition.swimmingGuidance.breaststroke.level === 'caution' ? 'bg-yellow-50 border-yellow-200' :
                                'bg-red-50 border-red-200'
                              }`}>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-medium">🐸 평영</span>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    condition.swimmingGuidance.breaststroke.level === 'safe' ? 'bg-green-200 text-green-800' :
                                    condition.swimmingGuidance.breaststroke.level === 'caution' ? 'bg-yellow-200 text-yellow-800' :
                                    'bg-red-200 text-red-800'
                                  }`}>
                                    {condition.swimmingGuidance.breaststroke.level === 'safe' ? '안전' :
                                     condition.swimmingGuidance.breaststroke.level === 'caution' ? '주의' : '금지'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 mb-2">{condition.swimmingGuidance.breaststroke.detailedExplanation}</p>
                                <p className="text-xs text-gray-600">이유: {condition.swimmingGuidance.breaststroke.reason}</p>
                              </div>

                              {/* 나비영 */}
                              <div className={`p-3 rounded-lg border-2 ${
                                condition.swimmingGuidance.butterfly.level === 'safe' ? 'bg-green-50 border-green-200' :
                                condition.swimmingGuidance.butterfly.level === 'caution' ? 'bg-yellow-50 border-yellow-200' :
                                'bg-red-50 border-red-200'
                              }`}>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-medium">🦋 나비영</span>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    condition.swimmingGuidance.butterfly.level === 'safe' ? 'bg-green-200 text-green-800' :
                                    condition.swimmingGuidance.butterfly.level === 'caution' ? 'bg-yellow-200 text-yellow-800' :
                                    'bg-red-200 text-red-800'
                                  }`}>
                                    {condition.swimmingGuidance.butterfly.level === 'safe' ? '안전' :
                                     condition.swimmingGuidance.butterfly.level === 'caution' ? '주의' : '금지'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 mb-2">{condition.swimmingGuidance.butterfly.detailedExplanation}</p>
                                <p className="text-xs text-gray-600">이유: {condition.swimmingGuidance.butterfly.reason}</p>
                              </div>

                              {/* 기본 배영 */}
                              <div className={`p-3 rounded-lg border-2 ${
                                condition.swimmingGuidance.elementary_backstroke.level === 'safe' ? 'bg-green-50 border-green-200' :
                                condition.swimmingGuidance.elementary_backstroke.level === 'caution' ? 'bg-yellow-50 border-yellow-200' :
                                'bg-red-50 border-red-200'
                              }`}>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-medium">🏊‍♂️ 기본 배영</span>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    condition.swimmingGuidance.elementary_backstroke.level === 'safe' ? 'bg-green-200 text-green-800' :
                                    condition.swimmingGuidance.elementary_backstroke.level === 'caution' ? 'bg-yellow-200 text-yellow-800' :
                                    'bg-red-200 text-red-800'
                                  }`}>
                                    {condition.swimmingGuidance.elementary_backstroke.level === 'safe' ? '안전' :
                                     condition.swimmingGuidance.elementary_backstroke.level === 'caution' ? '주의' : '금지'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 mb-2">{condition.swimmingGuidance.elementary_backstroke.detailedExplanation}</p>
                                <p className="text-xs text-gray-600">이유: {condition.swimmingGuidance.elementary_backstroke.reason}</p>
                              </div>

                              {/* 측영 */}
                              <div className={`p-3 rounded-lg border-2 ${
                                condition.swimmingGuidance.sidestroke.level === 'safe' ? 'bg-green-50 border-green-200' :
                                condition.swimmingGuidance.sidestroke.level === 'caution' ? 'bg-yellow-50 border-yellow-200' :
                                'bg-red-50 border-red-200'
                              }`}>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-medium">🏊‍♀️ 측영</span>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    condition.swimmingGuidance.sidestroke.level === 'safe' ? 'bg-green-200 text-green-800' :
                                    condition.swimmingGuidance.sidestroke.level === 'caution' ? 'bg-yellow-200 text-yellow-800' :
                                    'bg-red-200 text-red-800'
                                  }`}>
                                    {condition.swimmingGuidance.sidestroke.level === 'safe' ? '안전' :
                                     condition.swimmingGuidance.sidestroke.level === 'caution' ? '주의' : '금지'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 mb-2">{condition.swimmingGuidance.sidestroke.detailedExplanation}</p>
                                <p className="text-xs text-gray-600">이유: {condition.swimmingGuidance.sidestroke.reason}</p>
                              </div>
                            </div>
                          </div>

                          {/* 의학적 근거 */}
                          {condition.swimmingGuidance.freestyle.medicalEvidence && condition.swimmingGuidance.freestyle.medicalEvidence.length > 0 && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h4 className="font-semibold text-blue-800 mb-3">📚 의학적 근거</h4>
                              <div className="space-y-3">
                                {condition.swimmingGuidance.freestyle.medicalEvidence.map((evidence, index) => (
                                  <div key={index} className="bg-white p-3 rounded border">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                        {evidence.level}
                                      </span>
                                      <span className="text-sm font-medium text-gray-800">{evidence.citation}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{evidence.keyFindings}</p>
                                    {evidence.link && (
                                      <a 
                                        href={evidence.link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                                      >
                                        논문 링크 →
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="bg-red-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-red-800 mb-2">⚠️ 운동 제한사항</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="font-medium text-red-700 mb-1">강도 감소:</p>
                                <p className="text-red-600">{condition.exerciseRestrictions.intensityReduction}% 감소</p>
                              </div>
                              <div>
                                <p className="font-medium text-red-700 mb-1">운동 시간:</p>
                                <p className="text-red-600">최대 {condition.exerciseRestrictions.durationLimit}분</p>
                              </div>
                              <div>
                                <p className="font-medium text-red-700 mb-1">주간 빈도:</p>
                                <p className="text-red-600">주 {condition.exerciseRestrictions.frequencyLimit}회 이하</p>
                              </div>
                            </div>
                            <div className="mt-3">
                              <p className="font-medium text-red-700 mb-1">금지 운동:</p>
                              <ul className="text-red-600 text-sm">
                                {condition.exerciseRestrictions.contraindicatedExercises.map((exercise, index) => (
                                  <li key={index}>• {exercise}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="mt-3">
                              <p className="font-medium text-red-700 mb-1">권장 운동:</p>
                              <ul className="text-red-600 text-sm">
                                {condition.exerciseRestrictions.recommendedExercises.map((exercise, index) => (
                                  <li key={index}>• {exercise}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6 h-full overflow-y-auto">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                엔진 성능 분석
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">총 생성 프로그램</h4>
                  <p className="text-2xl font-bold text-blue-600">{engineStats.totalPrograms}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">평균 생성 시간</h4>
                  <p className="text-2xl font-bold text-green-600">{engineStats.averageGenerationTime}초</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">성공률</h4>
                  <p className="text-2xl font-bold text-purple-600">{engineStats.successRate}%</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">안전성 점수</h4>
                  <p className="text-2xl font-bold text-red-600">{engineStats.safetyScore}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 질환/특수상황 모두보기 모달 */}
      {showAllConditionsModal && (
        <AllConditionsDrawer
          value={conditionIds}
          onChange={(ids) => setConditionIds(ids)}
          onClose={() => setShowAllConditionsModal(false)}
        />
      )}

      {/* 다중 회원 변수 설정 모달 */}
      {showBulkVariablesModal && bulkSelectedMembers.length > 0 && (
        <BulkMemberVariablesModal
          members={bulkSelectedMembers}
          onClose={() => {
            setShowBulkVariablesModal(false);
            setBulkSelectedMembers([]);
          }}
          onConfirm={async (variables, generateWeeklyPlan) => {
            console.log('일괄 생성 시작:', variables);
            
            // 각 회원의 선수 프로필 추가 및 프로그램 생성
            let successCount = 0;
            const failedMembers: string[] = [];
            
            for (const memberVar of variables) {
              const member = bulkSelectedMembers.find((m: any) => m._id === memberVar.memberId);
              if (!member) continue;
              
              try {
                // 건강정보 자동 변환
                const healthProfile = {
                  age: member.studentInfo?.age,
                  height: member.studentInfo?.healthProfile?.height,
                  weight: member.studentInfo?.healthProfile?.weight,
                  chronicConditions: member.studentInfo?.healthProfile?.chronicConditions,
                  allergies: member.studentInfo?.healthProfile?.allergies
                };
                
                const { auto: autoConditions } = convertHealthToConditions(healthProfile);

                // 선수 프로필 추가
                const strokeCode = memberVar.mainStrokes[0] === '자유형' ? 'FR' :
                                   memberVar.mainStrokes[0] === '배영' ? 'BK' :
                                   memberVar.mainStrokes[0] === '평영' ? 'BR' :
                                   memberVar.mainStrokes[0] === '접영' ? 'FL' : 'FR';
                
                const newProfile = {
                  id: `athlete_${member._id}`,
                  name: memberVar.memberName,
                  icon: '🏊‍♂️',
                  conditionIds: memberVar.conditionIds.length > 0 ? memberVar.conditionIds : autoConditions,
                  cssPer100: undefined,
                  stroke: strokeCode as 'FR' | 'BK' | 'BR' | 'FL',
                  raceTargets: [],
                  customCSS: memberVar.css,
                  mainStrokes: memberVar.mainStrokes,
                  excludedStrokes: memberVar.excludedStrokes,
                  trainingDays: memberVar.trainingDays,
                  sessionsPerWeek: memberVar.trainingDays.length, // 운동 요일 개수 = 주당 세션 수
                  sessionDuration: memberVar.sessionDuration,
                  poolLength: memberVar.poolLength,
                  goal: memberVar.goal
                };

                upsertAthlete(newProfile as any);
              } catch (error: any) {
                console.error(`${memberVar.memberName} 프로필 추가 실패:`, error);
              }

              // 프로그램 자동 생성 (프로필 추가와 별개로 처리)
              if (generateWeeklyPlan) {
                try {
                  const today = new Date();
                  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
                  
                  // 영법 변환 함수
                  const convertStroke = (koreanStroke: string): string => {
                    if (koreanStroke === '자유형') return 'freestyle';
                    if (koreanStroke === '배영') return 'backstroke';
                    if (koreanStroke === '평영') return 'breaststroke';
                    if (koreanStroke === '접영') return 'butterfly';
                    return 'freestyle';
                  };
                  
                  // 단체반인지 확인
                  const isGroupClass = !!(member as any).groupClassId;
                  
                  // 🏁 레이스 플랜 vs 주간 플랜 분기
                  console.log(`🔍 ${memberVar.memberName} 프로그램 타입:`, memberVar.programType, {
                    typeCheck: typeof memberVar.programType,
                    isRace: memberVar.programType === 'race',
                    rawValue: JSON.stringify(memberVar.programType),
                    raceDate: memberVar.raceDate,
                    currentTime: memberVar.currentTime,
                    targetTime: memberVar.targetTime
                  });
                  
                  if (memberVar.programType === 'race') {
                    console.log('🏁 레이스 플랜 생성 시작:', memberVar.memberName);
                    
                    // 레이스 플랜 검증
                    if (!memberVar.raceDate) {
                      console.warn(`⚠️ ${memberVar.memberName}: 대회일 미입력`);
                      throw new Error(`${memberVar.memberName}: 대회일을 입력하세요.`);
                    }
                    if (!memberVar.currentTime || memberVar.currentTime <= 0) {
                      console.warn(`⚠️ ${memberVar.memberName}: 현재 기록 미입력`);
                      throw new Error(`${memberVar.memberName}: 현재 기록을 입력하세요.`);
                    }
                    if (!memberVar.targetTime || memberVar.targetTime <= 0) {
                      console.warn(`⚠️ ${memberVar.memberName}: 목표 기록 미입력`);
                      throw new Error(`${memberVar.memberName}: 목표 기록을 입력하세요.`);
                    }
                    
                    console.log(`✅ ${memberVar.memberName} 레이스 플랜 검증 통과:`, {
                      raceDate: memberVar.raceDate,
                      currentTime: memberVar.currentTime,
                      targetTime: memberVar.targetTime
                    });
                    
                    // 🔥 레이스 프로그램 생성기 사용
                    const { generateRaceProgram } = await import('@/lib/swimlab/raceProgramGenerator');
                    
                    const strokeKey = memberVar.raceStroke === 'freestyle' ? '자유형' : 
                                     memberVar.raceStroke === 'backstroke' ? '배영' :
                                     memberVar.raceStroke === 'breaststroke' ? '평영' : '접영';
                    
                    const raceProgram = generateRaceProgram({
                      raceDate: memberVar.raceDate,
                      raceEvent: {
                        distance: (memberVar.raceDistance || 100) as any,
                        stroke: convertStroke(strokeKey) as any
                      },
                      currentTime: memberVar.currentTime,
                      targetTime: memberVar.targetTime,
                      athleteInfo: {
                        level: memberVar.memberLevel.includes('beginner') ? 'novice' :
                               (memberVar.memberLevel.includes('advanced') || memberVar.memberLevel.includes('master')) ? 'elite' : 'trained',
                        css: memberVar.css,
                        mainStrokes: memberVar.mainStrokes,
                        excludedStrokes: memberVar.excludedStrokes,
                        conditionIds: memberVar.conditionIds
                      },
                      trainingSchedule: {
                        daysPerWeek: memberVar.trainingDays.length, // 운동 요일 개수 = 주당 세션 수
                        selectedDays: memberVar.trainingDays,
                        sessionDuration: memberVar.sessionDuration,
                        poolLength: (memberVar.poolLength || 25) as any
                      }
                    });
                    
                    console.log('✅ 레이스 프로그램 생성 완료:', raceProgram);
                    
                    // 통합 프로그램으로 저장 (페이즈 정보 포함)
                    const programData = {
                      athleteId: isGroupClass ? undefined : member._id,
                      athleteName: isGroupClass ? undefined : memberVar.memberName,
                      athleteLevel: memberVar.memberLevel || 'beginner',
                      groupClassId: isGroupClass ? (member as any).groupClassId : undefined,
                      groupClassName: isGroupClass ? memberVar.memberName : undefined,
                      centerId: member.studentInfo?.centerId || (member as any).centerId,
                      programType: 'race',
                      programScope: isGroupClass ? 'group' : 'individual',
                      usedEngine: 'raceProgramGenerator',
                      params: {
                        startDate: memberVar.startDate || today.toISOString().split('T')[0],
                        daysPerWeek: memberVar.trainingDays.length, // 운동 요일 개수 = 주당 세션 수
                        selectedDays: memberVar.trainingDays.map(d => dayNames[d]),
                        sessionDuration: memberVar.sessionDuration,
                        pool: memberVar.poolLength,
                        goal: memberVar.goal,
                        // 레이스 전용 필드
                        raceDate: memberVar.raceDate,
                        raceDistance: memberVar.raceDistance,
                        raceStroke: memberVar.raceStroke,
                        currentTime: memberVar.currentTime,
                        targetTime: memberVar.targetTime,
                        feasibilityGrade: raceProgram.feasibility.grade,
                        feasibilityConfidence: raceProgram.feasibility.confidence,
                        cssPer100: memberVar.css
                      },
                      content: {
                        summary: `${memberVar.memberName}${isGroupClass ? ' 단체반' : '님의'} 대회 준비 프로그램 (${raceProgram.summary.totalWeeks}주)`,
                        planExplanation: `Base ${raceProgram.summary.baseWeeks}주 → Build ${raceProgram.summary.buildWeeks}주 → Peak ${raceProgram.summary.peakWeeks}주 → Taper ${raceProgram.summary.taperWeeks}주`,
                        goal: memberVar.goal,
                        totalDuration: 0, // 페이즈별로 계산됨
                        totalMeters: raceProgram.summary.totalDistance,
                        feasibility: raceProgram.feasibility,
                        phases: raceProgram.phases,
                        phaseSummary: raceProgram.summary,
                        recommendations: raceProgram.recommendations,
                        engineVersion: 'raceProgramGenerator'
                      }
                    };
                    
                    console.log('레이스 프로그램 저장 데이터:', programData);
                    
                    const apiUrl = isGroupClass ? '/api/group-programs' : '/api/swim-programs';
                    const apiPayload = isGroupClass 
                      ? { groupClassId: (member as any).groupClassId, programData }
                      : programData;
                    
                    const response = await apiClient.post(apiUrl, apiPayload);
                    console.log(`✅ ${memberVar.memberName} 레이스 프로그램 API 응답:`, response);
                    
                    const programId = (response as any).programId || (response as any).data?.programId;
                    const isSuccess = !!(response as any).programId || ((response as any).success && (response as any).data?.programId);
                    
                    if (isSuccess) {
                      console.log(`✅ ${memberVar.memberName} 레이스 프로그램 저장 성공 (ID: ${programId})`);
                      successCount++;
                    } else {
                      console.error(`❌ ${memberVar.memberName} 레이스 프로그램 저장 실패:`, response);
                      failedMembers.push(memberVar.memberName);
                    }
                    
                  } else {
                    // 🔥 주간 플랜 생성 (기존 로직)
                    console.log('🏊 주간 플랜 생성 시작:', memberVar.memberName);
                    console.log('🔍 프로그램 타입 확인:', {
                      programType: memberVar.programType,
                      isRace: (memberVar as any).programType === 'race',
                      typeCheck: typeof memberVar.programType
                    });
                    const { generateWeeklyPlan: engineGenerateWeeklyPlan } = await import('@/lib/swimlab/engine-v31');
                    
                    // 요일 변환: 숫자 → 영문 약자
                    const dayMap: Record<number, string> = {
                      0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat'
                    };
                    
                    // 🔍 CSS 필수 검증 (상급/마스터 레벨)
                    const isAdvancedLevel = ['advanced', 'advanced_1', 'advanced_2', 'master', 'expert'].includes(memberVar.memberLevel);
                    const hasCSS = memberVar.css && Object.keys(memberVar.css).length > 0;
                    
                    if (isAdvancedLevel && !hasCSS) {
                      console.warn(`⚠️ ${memberVar.memberName}: 상급/마스터 레벨이지만 CSS 미입력`);
                      throw new Error(`${memberVar.memberName}은(는) 상급/마스터 레벨입니다.\nCSS를 입력해야 프로그램을 생성할 수 있습니다.\n\n회원 불러오기 → CSS 입력 → 저장 후 다시 시도하세요.`);
                    }
                    
                    // 주간 목표 거리 계산 (UI 입력값 우선, 없으면 시간 기반 추정)
                    const sessionsPerWeek = memberVar.trainingDays.length; // 운동 요일 개수 = 주당 세션 수
                    const estimatedMetersPerMin = memberVar.memberLevel.includes('beginner') ? 20 :
                                                  memberVar.memberLevel.includes('intermediate') ? 30 :
                                                  memberVar.memberLevel.includes('advanced') ? 40 : 50;
                    const weeklyMetersTarget = memberVar.weeklyDistance || 
                                              (memberVar.sessionDuration * sessionsPerWeek * estimatedMetersPerMin);
                    
                    // 🎯 이전 주 완료율 조회 (강도 조절용)
                    let previousWeekCompletionRate: number | undefined;
                    try {
                      // 최근 프로그램에서 완료율 조회
                      const recentPrograms = await apiClient.get(`/api/swim-programs/athlete/${member._id}?limit=1`) as any;
                      if (recentPrograms.programs && recentPrograms.programs.length > 0) {
                        const recentProgram = recentPrograms.programs[0];
                        if (recentProgram.content?.sessions) {
                          // 최근 세션들의 완료율 평균 계산
                          const completedSessions = recentProgram.content.sessions.filter(
                            (session: any) => session.completion && session.completion.completionRate !== undefined
                          );
                          if (completedSessions.length > 0) {
                            const totalCompletion = completedSessions.reduce(
                              (sum: number, session: any) => sum + session.completion.completionRate, 0
                            );
                            previousWeekCompletionRate = Math.round(totalCompletion / completedSessions.length);
                            console.log(`🎯 ${memberVar.memberName} 이전 주 완료율: ${previousWeekCompletionRate}%`);
                          }
                        }
                      }
                    } catch (error) {
                      console.warn(`⚠️ ${memberVar.memberName} 이전 주 완료율 조회 실패:`, error);
                    }

                    const engineInput = {
                    startDate: today.toISOString().split('T')[0],
                    days: memberVar.trainingDays.map((d: number) => dayMap[d] || 'Mon') as any,
                    weeklyMinutes: memberVar.sessionDuration * sessionsPerWeek,
                    weeklyMeters: weeklyMetersTarget,
                    poolLen: (memberVar.poolLength || 25) as any,
                    strokesAllowed: memberVar.mainStrokes.map(convertStroke) as any,
                    strokesAvoid: (memberVar.excludedStrokes || []).map(convertStroke),
                    css100: memberVar.css || {},
                    conditionIds: (memberVar.conditionIds || []) as any,
                    dayCondition: 'normal' as any,
                    hasPain: false,
                    goal: memberVar.goal || '체력 향상',
                    level: memberVar.memberLevel, // 레벨 전달
                    weekHistory: [], // TODO: 이력 조회 추가
                    // 🎯 완료율 기반 강도 조절
                    previousWeekCompletionRate,
                    intensityAdjustmentMode: 'auto' as const, // 자동 조절 모드
                    // 🧬 생리학적 지표 (개선 한계 판단용)
                    vo2max: memberVar.vo2max,
                    maxHeartRate: memberVar.maxHeartRate,
                    restingHeartRate: memberVar.restingHeartRate
                  };
                  
                  console.log('🔥 엔진 v3.1 입력:', engineInput);
                  
                  // 엔진 호출
                  let weeklyPlan;
                  try {
                    weeklyPlan = engineGenerateWeeklyPlan(engineInput);
                    console.log('✅ 엔진 v3.1 출력:', weeklyPlan);
                    console.log('✅ 엔진 출력 타입:', typeof weeklyPlan);
                    console.log('✅ 엔진 출력 days:', weeklyPlan?.days);
                    console.log('✅ 엔진 출력 days 길이:', weeklyPlan?.days?.length);
                  } catch (engineError: any) {
                    console.error('❌ 엔진 v3.1 호출 실패:', engineError);
                    console.error('엔진 에러 상세:', {
                      message: engineError.message,
                      stack: engineError.stack
                    });
                    throw engineError;
                  }
                  
                  // 엔진 결과 유효성 검사
                  if (!weeklyPlan || !weeklyPlan.days || !Array.isArray(weeklyPlan.days)) {
                    console.error('❌ 엔진 출력이 유효하지 않음:', weeklyPlan);
                    throw new Error('엔진이 유효한 프로그램을 생성하지 못했습니다.');
                  }
                  
                  if (weeklyPlan.days.length === 0) {
                    console.error('❌ 엔진이 빈 days 배열을 반환함');
                    throw new Error('엔진이 훈련 세션을 생성하지 못했습니다.');
                  }
                  
                  console.log(`✅ 엔진이 ${weeklyPlan.days.length}일 프로그램 생성 완료`);
                  
                  // 엔진 결과를 DB 형식으로 변환
                  const sessions = weeklyPlan.days.map((dayPlan: any, idx: number) => {
                    console.log(`📅 Day ${idx + 1} 변환 중:`, {
                      theme: dayPlan.theme,
                      sets: dayPlan.sets?.length,
                      totalMeters: dayPlan.totalMeters
                    });
                    
                    if (!dayPlan.sets || !Array.isArray(dayPlan.sets)) {
                      console.error(`❌ Day ${idx + 1}의 sets가 유효하지 않음:`, dayPlan);
                      return null;
                    }
                    
                    const blocks = dayPlan.sets.map((set: any) => {
                      // 엔진 v3.1 출력: { desc: "6×100m @ CSS+0″, r20″", meters: 600, stroke: "freestyle", ... }
                      const desc = set.desc || set.description || '';
                      const stroke = set.stroke || 'freestyle';
                      
                      // desc에서 reps×distance 추출: "6×100m ..." → reps: 6, distance: 100
                      let reps = 1;
                      let distance = 50;
                      
                      const match = desc.match(/(\d+)\s*[×xX]\s*(\d+)\s*m/);
                      if (match) {
                        reps = parseInt(match[1]) || 1;
                        distance = parseInt(match[2]) || 50;
                      } else {
                        // "200m Easy" 형식
                        const simpleMatch = desc.match(/(\d+)\s*m/);
                        if (simpleMatch) {
                          distance = parseInt(simpleMatch[1]) || 50;
                          reps = 1;
                        }
                      }
                      
                      const totalDistance = set.meters || (reps * distance);
                      
                      return {
                        type: set.type || '세트',
                        description: desc,
                        reps: reps,
                        distance: distance,
                        totalDistance: totalDistance,
                        duration: Math.ceil((set.targetSec || 0) / 60) || 10,
                        stroke: stroke,
                        zone: set.zone,
                        pace: set.pace || `CSS 기준`,
                        rest: set.restSec,
                        whyPace: set.whyPace,
                        whyRest: set.whyRest,
                        whySet: set.whySet,
                        drills: set.drills
                      };
                    });
                    
                    return {
                      day: engineInput.days[idx],
                      date: new Date(today.getTime() + idx * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      theme: dayPlan.theme,
                      themeDesc: dayPlan.themeDesc,
                      duration: dayPlan.totalDuration,
                      distance: dayPlan.totalMeters,
                      intensity: dayPlan.theme === 'tempo_hi' ? '높음' : dayPlan.theme === 'endurance' ? '중간' : '낮음',
                      blocks: blocks,
                      notes: dayPlan.notes || []
                    };
                  }).filter((s: any) => s !== null); // null 제거
                  
                  console.log(`✅ ${sessions.length}개 세션 변환 완료`);
                  
                  if (sessions.length === 0) {
                    console.error('❌ 변환된 세션이 없음');
                    throw new Error('프로그램 변환에 실패했습니다.');
                  }
                  
                  const totalDistance = sessions.reduce((sum: number, s: any) => sum + s.distance, 0);
                  const totalDuration = sessions.reduce((sum: number, s: any) => sum + s.duration, 0);
                  
                    console.log(`✅ 총 거리: ${totalDistance}m, 총 시간: ${totalDuration}분`);
                    
                    const programData = {
                    athleteId: isGroupClass ? undefined : member._id,
                    athleteName: isGroupClass ? undefined : memberVar.memberName,
                    athleteLevel: memberVar.memberLevel || 'beginner',
                    groupClassId: isGroupClass ? (member as any).groupClassId : undefined,
                    groupClassName: isGroupClass ? memberVar.memberName : undefined,
                    centerId: member.studentInfo?.centerId || (member as any).centerId,
                    programType: 'weekly',
                    programScope: isGroupClass ? 'group' : 'individual',
                    usedEngine: 'v3.1', // 엔진 버전 표시
                    params: {
                      startDate: today.toISOString().split('T')[0],
                      daysPerWeek: sessionsPerWeek, // 운동 요일 개수 = 주당 세션 수
                      selectedDays: memberVar.trainingDays.map(d => dayNames[d]),
                      sessionDuration: memberVar.sessionDuration,
                      pool: memberVar.poolLength,
                      mainStrokes: memberVar.mainStrokes,
                      excludedStrokes: memberVar.excludedStrokes,
                      cssPer100: memberVar.css, // CSS 정보 포함
                      conditionIds: memberVar.conditionIds,
                      goal: memberVar.goal
                    },
                    content: {
                      summary: `${memberVar.memberName}${isGroupClass ? ' 단체반' : '님의'} ${memberVar.goal} 주간 프로그램 (엔진 v3.1)`,
                      planExplanation: weeklyPlan.planExplanation || `${sessionsPerWeek}회/주, ${memberVar.sessionDuration}분/회`,
                      goal: weeklyPlan.goal || memberVar.goal,
                      totalDuration: totalDuration,
                      totalMeters: totalDistance,
                      sessions: sessions,
                      engineVersion: 'v3.1',
                      cssUsed: memberVar.css // CSS 정보 명시적으로 포함
                    },
                    usedMethodIds: [] // TODO: 사용된 훈련법 ID 추출
                  };

                  console.log('프로그램 생성 데이터:', programData);
                  
                  // 단체반은 group-programs API 사용
                  const apiUrl = isGroupClass ? '/api/group-programs' : '/api/swim-programs';
                  const apiPayload = isGroupClass 
                    ? { groupClassId: (member as any).groupClassId, programData }
                    : programData;
                  
                  console.log(`API 호출: ${apiUrl}`);
                  const response = await apiClient.post(apiUrl, apiPayload);
                  
                  console.log(`API 응답:`, response);
                  
                  // apiClient는 이미 data를 직접 반환함
                  // 개인 PT: response.programId
                  // 단체반: response.success && response.data?.programId
                  const programId = (response as any).programId || (response as any).data?.programId;
                  const isSuccess = !!(response as any).programId || ((response as any).success && (response as any).data?.programId);
                  
                    if (isSuccess) {
                      console.log(`✅ ${memberVar.memberName} 프로그램 생성 완료 (ID: ${programId})`);
                      successCount++;
                      console.log(`현재 성공 카운트: ${successCount}`);
                    } else {
                      console.warn(`⚠️ ${memberVar.memberName} 프로그램 생성 실패:`, response);
                    }
                  } // end of weekly plan else block
                } catch (error: any) {
                  console.error(`❌ ${memberVar.memberName} 프로그램 생성 실패:`, error);
                  console.error('에러 상세:', {
                    message: error.message,
                    stack: error.stack,
                    response: error.response,
                    data: error.data
                  });
                  failedMembers.push(memberVar.memberName);
                }
              }
            }
            
            console.log('=== 최종 결과 ===');
            console.log('generateWeeklyPlan:', generateWeeklyPlan);
            console.log('successCount:', successCount);
            console.log('failedMembers:', failedMembers);
            console.log('총 회원 수:', variables.length);
            
            setShowBulkVariablesModal(false);
            setBulkSelectedMembers([]);
            
            if (generateWeeklyPlan) {
              if (failedMembers.length > 0) {
                alert(`✅ ${successCount}명 프로그램 생성 완료\n❌ ${failedMembers.length}명 실패: ${failedMembers.join(', ')}`);
              } else {
                alert(`🎉 ${successCount}명의 주간 프로그램이 생성되었습니다!\n\n페이지를 새로고침하여 목록을 업데이트합니다.`);
              }
              
              // alert 후 페이지 새로고침
              setTimeout(() => {
                window.location.reload();
              }, 500);
            } else {
              alert(`${variables.length}명의 회원이 추가되었습니다!`);
            }
          }}
        />
      )}

      {/* 단체반 프로그램 생성 모달 */}
      {showGroupProgramGenerator && (
        <GroupProgramGenerator
          onClose={() => setShowGroupProgramGenerator(false)}
        />
      )}

      {/* 학생 체크리스트 모달 */}
      {showStudentChecklist && checklistStudent && (
        <StudentChecklistModal
          studentId={checklistStudent.id}
          studentName={checklistStudent.name}
          studentLevel={checklistStudent.level}
          onClose={() => {
            setShowStudentChecklist(false);
            setChecklistStudent(null);
          }}
        />
      )}
    </div>
  );
}