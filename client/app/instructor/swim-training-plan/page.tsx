/**
 * @file 강사용 맞춤형 수영 계획 편집 페이지.
 * @description 강사가 담당 회원의 주간 수영 프로그램을 불러오거나 생성하고 CSS 기반 강도를 확인합니다.
 * 연동 데이터: /api/learning-progress/instructor/students, /api/swim-programs, SwimLab engine v3.5 결과.
 * 연동 파일: '@/lib/swimlab/engine-v35-time-based', '@/utils/api', '@/hooks/useAuth', '@/components/ui/*'.
 */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import withAuth from '@/components/withAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateTimeBasedProgram } from '@/lib/swimlab/engine-v35-time-based';
import apiClient from '@/utils/api';
import {
  Loader2,
  RefreshCcw,
  Save,
  Users,
  AlertCircle,
  CheckCircle,
  Droplets,
  Clock,
  Dumbbell,
  Plus,
  Trash2,
  Sun,
  Puzzle,
  Flame,
  Snowflake,
  MoreHorizontal,
  CalendarClock,
  SkipForward,
  Undo2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

type StrokeKey = 'freestyle' | 'backstroke' | 'breaststroke' | 'butterfly' | 'sidestroke' | 'elementary_backstroke';

type StudentSummary = {
  _id: string;
  name: string;
  email?: string;
  centerId?: string;
  studentInfo?: any;
  instructorInfo?: any;
};

type PlanBlock = {
  type: string;
  description: string;
  distance: number;
  duration: number;
  zone?: string;
  restSec?: number;
  rpe?: number;
  equipment?: string[];
  whyPace?: string;
  whyRest?: string;
  whySet?: string;
  evidenceKeys?: string[];
  pacePer100Seconds?: number;
  paceDisplay?: string;
};

type PlanSession = {
  id: string;
  day: string;
  theme: string;
  themeDesc: string;
  focus: string[];
  duration: number;
  distance: number;
  intensity: {
    primary: string;
    secondary?: string;
  };
  status?: 'scheduled' | 'postponed' | 'skipped';
  blocks: PlanBlock[];
  warnings?: string[];
  usedMethodIds?: string[];
};

type WeeklyPlan = {
  goal: string;
  level: string;
  startDate: string;
  weeklyTargetMinutes: number;
  weeklyFrequency: number;
  sessionDurationMinutes: number;
  totalMeters: number;
  actualDurationMinutes: number;
  poolLength: number;
  strokesAllowed: string[];
  strokesAvoid: string[];
  css: Record<string, number>;
  conditionIds: string[];
  summary: string;
  planExplanation: string;
  sessions: PlanSession[];
  usedMethodIds: string[];
};

type StatusMessage = {
  type: 'success' | 'error' | 'info';
  message: string;
};

const DEFAULT_DAYS = ['월요일', '수요일', '금요일', '토요일', '일요일'];

const DEFAULT_CSS: Record<string, number> = {
  freestyle: 95,
  backstroke: 105,
  breaststroke: 120,
  butterfly: 110
};

const CSS_MAX_DEFAULT_SECONDS = 150;

const STROKE_NAME_TO_KEY: Record<string, StrokeKey> = {
  자유형: 'freestyle',
  배영: 'backstroke',
  평영: 'breaststroke',
  접영: 'butterfly',
  횡영: 'sidestroke',
  기본배영: 'elementary_backstroke',
  freestyle: 'freestyle',
  backstroke: 'backstroke',
  breaststroke: 'breaststroke',
  butterfly: 'butterfly',
  sidestroke: 'sidestroke',
  elementary_backstroke: 'elementary_backstroke'
};

const LEVEL_MAP: Record<string, string> = {
  초급: 'beginner',
  중급: 'intermediate',
  고급: 'advanced',
  전문가: 'expert',
  마스터: 'master'
};

const safeId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const unique = <T,>(items: T[]) => Array.from(new Set(items));

const clampCssPace = (value?: number) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return undefined;
  }
  return Math.min(value, CSS_MAX_DEFAULT_SECONDS);
};

const formatSecondsToPace = (seconds: number) => {
  const clamped = Math.max(0, seconds);
  const minutes = Math.floor(clamped / 60);
  const secs = Math.round(clamped % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const parseSetDescription = (desc: string, restOverride?: number) => {
  const repsMatch = desc.match(/(\d+)×(\d+)m/);
  const reps = repsMatch ? parseInt(repsMatch[1], 10) : 1;
  const distPerRep = repsMatch ? parseInt(repsMatch[2], 10) : 0;
  const totalDistance = reps * distPerRep;

  const paceMatch = desc.match(/@\s*(\d+):(\d+)\/(\d+)m/);
  const restMatch = desc.match(/r\s*(\d+)/i);
  const restSeconds = restOverride ?? (restMatch ? parseInt(restMatch[1], 10) : 0);

  if (!paceMatch || distPerRep === 0) {
    const restMinutes = (restSeconds * reps) / 60;
    return { totalDistance, totalMinutes: restMinutes, pacePer100Seconds: undefined, paceDisplay: undefined };
  }

  const paceMinutes = parseInt(paceMatch[1], 10);
  const paceSeconds = parseInt(paceMatch[2], 10);
  const paceDistance = parseInt(paceMatch[3], 10);
  const paceSecondsTotal = (paceMinutes * 60) + paceSeconds;
  const pacePerMeter = paceDistance > 0 ? paceSecondsTotal / paceDistance : 0;
  const restSecondsTotal = restSeconds * reps;
  const pacePer100SecondsRaw = paceDistance > 0 ? (paceSecondsTotal / paceDistance) * 100 : undefined;
  const normalizedPacePer100 = clampCssPace(pacePer100SecondsRaw);
  const paceDisplay = normalizedPacePer100 ? `${formatSecondsToPace(normalizedPacePer100)}/100m` : undefined;
  const swimSeconds = pacePerMeter * distPerRep * reps;
  const totalMinutes = (swimSeconds + restSecondsTotal) / 60;
  return { totalDistance, totalMinutes, pacePer100Seconds: normalizedPacePer100, paceDisplay };
};

const recalcSessionMetrics = (session: PlanSession) => {
  const totalDistance = session.blocks.reduce((sum, block) => sum + (Number(block.distance) || 0), 0);
  const totalMinutes = session.blocks.reduce((sum, block) => sum + (Number(block.duration) || 0), 0);
  return { totalDistance, totalMinutes };
};

const recalcPlanTotals = (sessions: PlanSession[]) => {
  const totals = sessions.reduce(
    (acc, session) => {
      acc.totalDistance += Number(session.distance) || 0;
      acc.totalMinutes += Number(session.duration) || 0;
      return acc;
    },
    { totalDistance: 0, totalMinutes: 0 }
  );
  return totals;
};

const deriveSessionIntensityFromCss = (
  blocks: PlanBlock[],
  distance?: number,
  duration?: number,
  fallback?: { primary: string; secondary?: string }
) => {
  const cssPaces = blocks
    .map((block) => block.pacePer100Seconds)
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0);

  if (cssPaces.length === 0) {
    return {
      primary: fallback?.primary || 'CSS 데이터 없음',
      secondary: fallback?.secondary
    };
  }

  const avg = cssPaces.reduce((sum, pace) => sum + pace, 0) / cssPaces.length;
  const min = Math.min(...cssPaces);
  const max = Math.max(...cssPaces);
  const zones = unique(
    blocks
      .map((block) => block.zone)
      .filter((zone): zone is string => typeof zone === 'string' && zone.trim().length > 0)
  );

  const secondaryParts: string[] = [];
  if (min !== max) {
    secondaryParts.push(`범위 ${formatSecondsToPace(min)}~${formatSecondsToPace(max)}/100m`);
  }
  if (zones.length > 0) {
    secondaryParts.push(`주요 Zone ${zones.join(', ')}`);
  }
  if (distance) {
    secondaryParts.push(`${Math.round(distance)}m`);
  }
  if (duration) {
    secondaryParts.push(`예상 ${Math.round(duration)}분`);
  }

  return {
    primary: `CSS 평균 페이스 ${formatSecondsToPace(avg)}/100m`,
    secondary: secondaryParts.length > 0 ? secondaryParts.join(' · ') : undefined
  };
};

const applyCssIntensityToSession = (session: PlanSession): PlanSession => ({
  ...session,
  intensity: deriveSessionIntensityFromCss(session.blocks, session.distance, session.duration, session.intensity)
});

const getBlockMeta = (type?: string) => {
  const normalized = (type || 'SET').toUpperCase();
  if (normalized.includes('WARM')) {
    return {
      label: '워밍업',
      icon: Sun,
      containerClass: 'border-amber-200 bg-amber-50/80',
      chipClass: 'bg-amber-100 text-amber-800',
      iconWrapClass: 'bg-amber-100 text-amber-600'
    };
  }
  if (normalized.includes('DRILL')) {
    return {
      label: '드릴',
      icon: Puzzle,
      containerClass: 'border-emerald-200 bg-emerald-50/70',
      chipClass: 'bg-emerald-100 text-emerald-800',
      iconWrapClass: 'bg-emerald-100 text-emerald-600'
    };
  }
  if (normalized.includes('MAIN')) {
    return {
      label: '메인 세트',
      icon: Flame,
      containerClass: 'border-rose-200 bg-rose-50/70',
      chipClass: 'bg-rose-100 text-rose-800',
      iconWrapClass: 'bg-rose-100 text-rose-600'
    };
  }
  if (normalized.includes('COOL')) {
    return {
      label: '쿨다운',
      icon: Snowflake,
      containerClass: 'border-sky-200 bg-sky-50/70',
      chipClass: 'bg-sky-100 text-sky-800',
      iconWrapClass: 'bg-sky-100 text-sky-600'
    };
  }
  return {
    label: '세트',
    icon: Droplets,
    containerClass: 'border-gray-200 bg-white',
    chipClass: 'bg-gray-100 text-gray-700',
    iconWrapClass: 'bg-gray-100 text-gray-600'
  };
};

const mapLevelToEngine = (level?: string) => {
  if (!level) return 'beginner';
  const normalized = level.toLowerCase();
  if (LEVEL_MAP[level]) return LEVEL_MAP[level];
  if (normalized.includes('beginner') || normalized.includes('초급')) return 'beginner';
  if (normalized.includes('intermediate') || normalized.includes('중급')) return 'intermediate';
  if (normalized.includes('advanced') || normalized.includes('고급')) return 'advanced';
  if (normalized.includes('expert') || normalized.includes('전문')) return 'expert';
  if (normalized.includes('master') || normalized.includes('마스터')) return 'master';
  return level;
};

const normalizeStrokeList = (strokes?: string[]) => {
  if (!strokes || strokes.length === 0) return ['freestyle'];
  return unique(
    strokes
      .map((stroke) => STROKE_NAME_TO_KEY[stroke] || STROKE_NAME_TO_KEY[stroke.replace(/\s+/g, '')] || 'freestyle')
  );
};

const extractCss = (raw?: any) => {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_CSS };
  const css: Record<string, number> = { ...DEFAULT_CSS };
  Object.keys(raw).forEach((key) => {
    const mappedKey = STROKE_NAME_TO_KEY[key] || key;
    const value = raw[key];
    if (typeof value === 'number' && value > 0) {
      css[mappedKey] = value;
    }
  });
  return css;
};

const buildPlanSummary = (student: StudentSummary, plan: WeeklyPlan) => {
  const perSession = Math.round(plan.sessionDurationMinutes);
  return `${student.name} · ${plan.goal} · 주 ${plan.weeklyFrequency}회 · 회당 ${perSession}분 (총 ${plan.weeklyTargetMinutes}분 / 약 ${plan.totalMeters}m)`;
};

const buildDefaultPlanExplanation = (sessions: PlanSession[]) =>
  sessions.map((session) => `${session.day}: ${session.themeDesc}`).join('\n');

const convertEnginePlanToSession = (
  day: string,
  goal: string,
  engineOutput: ReturnType<typeof generateTimeBasedProgram>,
  index: number
): PlanSession => {
  const blocks: PlanBlock[] = engineOutput.sets.map((set) => {
    const { totalDistance, totalMinutes, pacePer100Seconds, paceDisplay } = parseSetDescription(set.desc, set.restSec);
    return {
      type: set.subtype || 'SET',
      description: set.desc,
      distance: totalDistance || set.meters || 0,
      duration: Number(totalMinutes.toFixed(2)),
      zone: set.zone,
      restSec: set.restSec,
      rpe: set.rpe,
      equipment: set.equipment || [],
      whyPace: set.whyPace,
      whyRest: set.whyRest,
      whySet: set.whySet,
      evidenceKeys: set.evidenceKeys || [],
      pacePer100Seconds,
      paceDisplay
    };
  });

  const baseSession: PlanSession = {
    id: `session-${index}-${safeId()}`,
    day,
    theme: engineOutput.theme,
    themeDesc: engineOutput.themeDesc,
    focus: [goal],
    duration: engineOutput.estimatedMinutes,
    distance: engineOutput.totalMeters,
    intensity: {
      primary: '',
      secondary: `${engineOutput.totalMeters}m · ${engineOutput.estimatedMinutes}분`
    },
    status: 'scheduled',
    blocks,
    warnings: engineOutput.strokeWarnings,
    usedMethodIds: engineOutput.usedMethodIds
  };

  return applyCssIntensityToSession(baseSession);
};

const recalcPlanAfterSessionChange = (
  plan: WeeklyPlan,
  sessions: PlanSession[],
  student?: StudentSummary | null
) => {
  const sessionsWithCss = sessions.map(applyCssIntensityToSession);
  const totals = recalcPlanTotals(sessionsWithCss);
  const usedMethodIds = unique(
    sessionsWithCss.flatMap((session) => session.usedMethodIds || [])
  );
  const updated: WeeklyPlan = {
    ...plan,
    sessions: sessionsWithCss,
    totalMeters: totals.totalDistance,
    actualDurationMinutes: totals.totalMinutes,
    usedMethodIds
  };
  if (student) {
    updated.summary = buildPlanSummary(student, updated);
  }
  if (!updated.planExplanation) {
    updated.planExplanation = buildDefaultPlanExplanation(sessions);
  }
  return updated;
};

const convertExistingProgramToPlan = (program: any, student: StudentSummary): WeeklyPlan => {
  const sessions: PlanSession[] = (program?.content?.sessions || []).map((session: any, idx: number) => {
    const blocks: PlanBlock[] = (session.blocks || []).map((block: any) => {
      const parsed = parseSetDescription(block.description || '', block.restSec);
      const distance = Number(block.distance) || parsed.totalDistance || 0;
      const durationRaw = Number(block.duration);
      const duration = Number.isFinite(durationRaw) && durationRaw > 0
        ? durationRaw
        : parsed.totalMinutes
          ? Number(parsed.totalMinutes.toFixed(2))
          : 0;
      return {
        type: block.type || 'SET',
        description: block.description || '',
        distance,
        duration,
        zone: block.zone,
        restSec: block.restSec,
        rpe: block.rpe,
        equipment: block.equipment || [],
        whyPace: block.whyPace,
        whyRest: block.whyRest,
        whySet: block.whySet,
        evidenceKeys: block.evidenceKeys || [],
        pacePer100Seconds: parsed.pacePer100Seconds,
        paceDisplay: parsed.paceDisplay
      };
    });

    const intensityFallback = typeof session.intensity === 'string'
      ? { primary: session.intensity as string }
      : {
          primary: session.intensity?.primary || '',
          secondary: session.intensity?.secondary
        };

    const baseSession: PlanSession = {
      id: `existing-session-${idx}-${safeId()}`,
      day: session.day || `세션 ${idx + 1}`,
      theme: session.theme || session.themeDesc || '',
      themeDesc: session.themeDesc || session.theme || '',
      focus: Array.isArray(session.focus) && session.focus.length > 0 ? session.focus : [program?.params?.goal || '체력 향상'],
      duration: Number(session.duration) || blocks.reduce((sum, block) => sum + (block.duration || 0), 0),
      distance: Number(session.distance) || blocks.reduce((sum, block) => sum + (block.distance || 0), 0),
      intensity: intensityFallback,
      status: (session.status as 'scheduled' | 'postponed' | 'skipped') || 'scheduled',
      blocks,
      warnings: session.warnings,
      usedMethodIds: session.usedMethodIds || program?.usedMethodIds || []
    };

    return applyCssIntensityToSession(baseSession);
  });

  const totals = recalcPlanTotals(sessions);
  const sessionDuration = program?.params?.sessionDuration || (sessions.length > 0 ? totals.totalMinutes / sessions.length : 60);
  const weeklyFrequency = program?.params?.daysPerWeek || sessions.length || 1;
  const plan: WeeklyPlan = {
    goal: program?.params?.goal || '체력 향상',
    level: mapLevelToEngine(program?.params?.currentLevel || student.studentInfo?.currentLevel || 'beginner'),
    startDate: program?.params?.startDate || new Date().toISOString().slice(0, 10),
    weeklyTargetMinutes: (program?.params?.sessionDuration || sessionDuration) * weeklyFrequency,
    weeklyFrequency,
    sessionDurationMinutes: sessionDuration,
    totalMeters: program?.content?.totalMeters || totals.totalDistance,
    actualDurationMinutes: totals.totalMinutes,
    poolLength: program?.params?.pool || 25,
    strokesAllowed: program?.params?.mainStrokes || ['freestyle'],
    strokesAvoid: program?.params?.excludedStrokes || [],
    css: program?.params?.cssPer100 || { ...DEFAULT_CSS },
    conditionIds: program?.params?.conditionIds || [],
    summary: program?.content?.summary || '',
    planExplanation: program?.content?.planExplanation || '',
    sessions,
    usedMethodIds: program?.usedMethodIds || []
  };

  plan.summary = plan.summary || buildPlanSummary(student, plan);
  plan.planExplanation = plan.planExplanation || buildDefaultPlanExplanation(sessions);

  return plan;
};

const buildSavePayload = (plan: WeeklyPlan, student: StudentSummary) => {
  const sessionDuration = plan.sessionDurationMinutes || 60;
  const params = {
    startDate: plan.startDate,
    daysPerWeek: plan.weeklyFrequency,
    selectedDays: plan.sessions.map((session) => session.day),
    sessionDuration: sessionDuration,
    pool: plan.poolLength,
    mainStrokes: plan.strokesAllowed,
    excludedStrokes: plan.strokesAvoid,
    cssPer100: plan.css,
    conditionIds: plan.conditionIds,
    goal: plan.goal
  };

  const sessions = plan.sessions.map((session) => ({
    day: session.day,
    themeDesc: session.themeDesc,
    duration: Number(session.duration) || 0,
    distance: Number(session.distance) || 0,
    status: session.status || 'scheduled',
    intensity: [session.intensity.primary, session.intensity.secondary].filter(Boolean).join(' | '),
    blocks: session.blocks.map((block) => ({
      type: block.type,
      description: block.description,
      duration: Number(block.duration) || 0,
      distance: Number(block.distance) || 0,
      whyPace: block.whyPace,
      whyRest: block.whyRest,
      whySet: block.whySet,
      evidenceKeys: block.evidenceKeys || []
    }))
  }));

  const content = {
    summary: plan.summary,
    planExplanation: plan.planExplanation,
    totalDuration: plan.weeklyTargetMinutes,
    totalMeters: plan.totalMeters,
    sessions
  };

  return {
    athleteId: student._id,
    athleteName: student.name,
    centerId: student.centerId,
    programType: 'weekly',
    programScope: 'individual',
    params,
    content,
    usedMethodIds: plan.usedMethodIds
  };
};

const generatePlanForStudent = (
  student: StudentSummary,
  overrides?: Partial<{ frequency: number; sessionDuration: number; goal: string; startDate: string }>
): WeeklyPlan => {
  const swimmingProfile = student.studentInfo?.swimmingProfile || {};
  const healthProfile = student.studentInfo?.healthProfile || {};

  const frequency = Math.max(1, overrides?.frequency || swimmingProfile.weeklyFrequency || 3);
  const sessionDuration = Math.max(30, overrides?.sessionDuration || swimmingProfile.sessionDuration || 60);
  const goal = overrides?.goal || (healthProfile.fitnessGoals && healthProfile.fitnessGoals[0]) || '체력 향상';
  const startDate = overrides?.startDate || new Date().toISOString().slice(0, 10);

  const preferredDays: string[] = swimmingProfile.preferredDays && swimmingProfile.preferredDays.length > 0
    ? swimmingProfile.preferredDays
    : DEFAULT_DAYS;

  const strokesAllowed = normalizeStrokeList(swimmingProfile.preferredStrokes || swimmingProfile.mainStrokes || ['freestyle']);
  const strokesAvoid = normalizeStrokeList(swimmingProfile.excludedStrokes || []);
  const css = extractCss(swimmingProfile.cssProfile || swimmingProfile.css || {});
  const poolLength = swimmingProfile.poolLength || 25;
  const conditionIds = Array.isArray(healthProfile.chronicConditions)
    ? healthProfile.chronicConditions
    : [];

  const level = mapLevelToEngine(student.studentInfo?.currentLevel || student.studentInfo?.swimmingLevel || 'beginner');

  const sessions: PlanSession[] = [];
  for (let i = 0; i < frequency; i++) {
    const day = preferredDays[i % preferredDays.length];
    const enginePlan = generateTimeBasedProgram({
      targetMinutes: sessionDuration,
      css100: css,
      poolLen: poolLength,
      goal,
      level,
      strokesAllowed: strokesAllowed as StrokeKey[],
      strokesAvoid,
      conditionIds,
      dayCondition: 'normal',
      hasPain: false,
      weeklyFrequency: frequency,
      intensityPercent: swimmingProfile.intensityPercent || 1,
      cssMeasurementPoolLength: swimmingProfile.cssMeasurementPoolLength || poolLength
    });

    const session = convertEnginePlanToSession(day, goal, enginePlan, i);
    sessions.push(session);
  }

  const totals = recalcPlanTotals(sessions);
  const plan: WeeklyPlan = {
    goal,
    level,
    startDate,
    weeklyTargetMinutes: sessionDuration * frequency,
    weeklyFrequency: frequency,
    sessionDurationMinutes: sessionDuration,
    totalMeters: totals.totalDistance,
    actualDurationMinutes: totals.totalMinutes,
    poolLength,
    strokesAllowed,
    strokesAvoid,
    css,
    conditionIds,
    summary: '',
    planExplanation: '',
    sessions,
    usedMethodIds: unique(sessions.flatMap((session) => session.usedMethodIds || []))
  };

  plan.summary = buildPlanSummary(student, plan);
  plan.planExplanation = buildDefaultPlanExplanation(sessions);

  return plan;
};

function SwimTrainingPlanPage() {
  const { user, hasUserType } = useAuth();
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState<string | null>(null);

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [existingProgramId, setExistingProgramId] = useState<string | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!hasUserType('instructor')) return;
    const loadStudents = async () => {
      try {
        setStudentsLoading(true);
        setStudentsError(null);
        const response = await apiClient.get<any>('/api/learning-progress/instructor/students');
        const rawStudents = Array.isArray(response?.students) ? response.students : [];
        if (rawStudents.length === 0) {
          setStudents([]);
          return;
        }
        const formatted: StudentSummary[] = rawStudents.map((student: any) => ({
          _id: student._id || student.id,
          name: student.name || '이름 없음',
          email: student.email,
          centerId: student.centerId,
          studentInfo: student.studentInfo,
          instructorInfo: student.instructorInfo
        }));
        setStudents(formatted);
      } catch (error) {
        console.error('학생 목록 조회 실패:', error);
        setStudentsError('담당 학생 목록을 불러오는 중 오류가 발생했습니다.');
        setStudents([]);
      } finally {
        setStudentsLoading(false);
      }
    };

    loadStudents();
  }, [hasUserType]);

  const selectedStudent = useMemo(
    () => students.find((student) => student._id === selectedStudentId) || null,
    [students, selectedStudentId]
  );

  useEffect(() => {
    if (!selectedStudent) {
      setPlan(null);
      setExistingProgramId(null);
      return;
    }

    const loadPlan = async () => {
      try {
        setPlanLoading(true);
        setStatusMessage(null);

        const response = await apiClient.get<any>(
          `/api/swim-programs/athlete/${selectedStudent._id}?limit=1`
        );

        if (response?.count > 0 && response?.programs?.length > 0) {
          const existingProgram = response.programs[0];
          const restoredPlan = convertExistingProgramToPlan(existingProgram, selectedStudent);
          setPlan(restoredPlan);
          setExistingProgramId(existingProgram._id);
          setStatusMessage({ type: 'info', message: '기존에 저장된 프로그램을 불러왔습니다.' });
        } else {
          const generatedPlan = generatePlanForStudent(selectedStudent);
          setPlan(generatedPlan);
          setExistingProgramId(null);
          setStatusMessage({ type: 'info', message: '엔진으로 새 주간 프로그램을 생성했습니다.' });
        }
      } catch (error) {
        console.error('프로그램 불러오기 실패:', error);
        const generatedPlan = generatePlanForStudent(selectedStudent);
        setPlan(generatedPlan);
        setExistingProgramId(null);
        setStatusMessage({ type: 'error', message: '기존 프로그램을 불러오지 못해 새 프로그램을 생성했습니다.' });
      } finally {
        setPlanLoading(false);
      }
    };

    loadPlan();
  }, [selectedStudent]);

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
  };

  const handleRegeneratePlan = () => {
    if (!selectedStudent || !plan) return;
    const regenerated = generatePlanForStudent(selectedStudent, {
      frequency: plan.weeklyFrequency,
      sessionDuration: plan.sessionDurationMinutes,
      goal: plan.goal,
      startDate: plan.startDate
    });
    setPlan(regenerated);
    setExistingProgramId(null);
    setStatusMessage({ type: 'info', message: '엔진으로 새 프로그램을 재생성했습니다.' });
  };

  const handlePlanMetaChange = (field: keyof WeeklyPlan | 'sessionDurationMinutes', value: string | number) => {
    if (!plan) return;
    setPlan((prev) => {
      if (!prev) return prev;
      const updated: WeeklyPlan = { ...prev };

      if (field === 'goal') {
        updated.goal = String(value);
        updated.sessions = updated.sessions.map((session) => ({
          ...session,
          focus: [String(value)]
        }));
      } else if (field === 'weeklyFrequency' || field === 'sessionDurationMinutes' || field === 'weeklyTargetMinutes') {
        return prev;
      } else if (field === 'startDate') {
        updated.startDate = String(value);
      } else if (field === 'planExplanation') {
        updated.planExplanation = String(value);
      } else if (field === 'summary') {
        updated.summary = String(value);
      }

      if (selectedStudent) {
        updated.summary = buildPlanSummary(selectedStudent, updated);
      }
      return updated;
    });
  };

  const handleSessionFieldChange = (sessionId: string, field: keyof PlanSession | 'focus', value: string) => {
    if (!plan) return;
    setPlan((prev) => {
      if (!prev) return prev;
      const sessions = prev.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        if (field === 'focus') {
          const focus = value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
          return { ...session, focus: focus.length > 0 ? focus : session.focus };
        }
        if (field === 'themeDesc') {
          return { ...session, themeDesc: value };
        }
        if (field === 'theme') {
          return { ...session, theme: value };
        }
        if (field === 'day') {
          return { ...session, day: value };
        }
        return session;
      });
      return recalcPlanAfterSessionChange(prev, sessions, selectedStudent);
    });
  };

  const handleBlockChange = (
    sessionId: string,
    blockIndex: number,
    field: keyof PlanBlock,
    value: string
  ) => {
    if (!plan) return;
    setPlan((prev) => {
      if (!prev) return prev;
      const sessions = prev.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        const updatedBlocks = session.blocks.map((block, idx) => {
          if (idx !== blockIndex) return block;
          if (field === 'equipment') {
            return {
              ...block,
              equipment: value
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean)
            };
          }
          if (field === 'evidenceKeys') {
            return {
              ...block,
              evidenceKeys: value
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean)
            };
          }
          if (field === 'distance') {
            const num = Number(value) || 0;
            return { ...block, distance: num };
          }
          if (field === 'duration') {
            const num = Number(value) || 0;
            return { ...block, duration: num };
          }
          if (field === 'restSec') {
            const restValue = Number(value) || 0;
            const parsed = parseSetDescription(block.description, restValue);
            return {
              ...block,
              restSec: restValue,
              distance: parsed.totalDistance || block.distance,
              duration: parsed.totalMinutes ? Number(parsed.totalMinutes.toFixed(2)) : block.duration,
              pacePer100Seconds: parsed.pacePer100Seconds,
              paceDisplay: parsed.paceDisplay
            };
          }
          if (field === 'rpe') {
            const num = Number(value) || 0;
            return { ...block, rpe: num };
          }
          if (field === 'description') {
            const parsed = parseSetDescription(value, block.restSec);
            return {
              ...block,
              description: value,
              distance: parsed.totalDistance || block.distance,
              duration: parsed.totalMinutes ? Number(parsed.totalMinutes.toFixed(2)) : block.duration,
              pacePer100Seconds: parsed.pacePer100Seconds,
              paceDisplay: parsed.paceDisplay
            };
          }
          return { ...block, [field]: value };
        });
        const recalculatedSession = { ...session, blocks: updatedBlocks };
        const metrics = recalcSessionMetrics(recalculatedSession);
        recalculatedSession.distance = metrics.totalDistance;
        recalculatedSession.duration = metrics.totalMinutes;
        return applyCssIntensityToSession(recalculatedSession);
      });
      return recalcPlanAfterSessionChange(prev, sessions, selectedStudent);
    });
  };

  const handleAddBlock = (sessionId: string) => {
    if (!plan) return;
    setPlan((prev) => {
      if (!prev) return prev;
      const sessions = prev.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        const newBlock: PlanBlock = {
          type: 'SET',
          description: '신규 세트 설명을 입력하세요',
          distance: 0,
          duration: 0,
          equipment: []
        };
        const updatedBlocks = [...session.blocks, newBlock];
        const recalculatedSession = { ...session, blocks: updatedBlocks };
        const metrics = recalcSessionMetrics(recalculatedSession);
        recalculatedSession.distance = metrics.totalDistance;
        recalculatedSession.duration = metrics.totalMinutes;
        return applyCssIntensityToSession(recalculatedSession);
      });
      return recalcPlanAfterSessionChange(prev, sessions, selectedStudent);
    });
  };

  const handleRemoveBlock = (sessionId: string, blockIndex: number) => {
    if (!plan) return;
    setPlan((prev) => {
      if (!prev) return prev;
      const sessions = prev.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        const updatedBlocks = session.blocks.filter((_, idx) => idx !== blockIndex);
        const recalculatedSession = { ...session, blocks: updatedBlocks };
        const metrics = recalcSessionMetrics(recalculatedSession);
        recalculatedSession.distance = metrics.totalDistance;
        recalculatedSession.duration = metrics.totalMinutes;
        return applyCssIntensityToSession(recalculatedSession);
      });
      return recalcPlanAfterSessionChange(prev, sessions, selectedStudent);
    });
  };

  const generateSessionForDay = (day: string, index: number): PlanSession | null => {
    if (!selectedStudent || !plan) return null;
    const sanitizedDay = day.replace(/\s*\(.*?\)\s*$/, '');

    try {
      const engineOutput = generateTimeBasedProgram({
        targetMinutes: plan.sessionDurationMinutes,
        css100: plan.css,
        poolLen: plan.poolLength,
        goal: plan.goal,
        level: plan.level,
        strokesAllowed: plan.strokesAllowed as StrokeKey[],
        strokesAvoid: plan.strokesAvoid,
        conditionIds: plan.conditionIds,
        dayCondition: 'normal',
        hasPain: false,
        weeklyFrequency: plan.weeklyFrequency,
        intensityPercent: 1,
        cssMeasurementPoolLength: plan.poolLength
      });

      return convertEnginePlanToSession(sanitizedDay, plan.goal, engineOutput, index);
    } catch (error) {
      console.error('세션 재생성 실패:', error);
      return null;
    }
  };

  const handleMissedSessionAction = (
    sessionId: string,
    action: 'postpone' | 'skip' | 'regenerate' | 'reset'
  ) => {
    if (!plan) return;

    setPlan((prev) => {
      if (!prev) return prev;
      const idx = prev.sessions.findIndex((session) => session.id === sessionId);
      if (idx === -1) return prev;

      const sessions = prev.sessions.map((session) => ({
        ...session,
        blocks: session.blocks.map((block) => ({ ...block }))
      }));
      const originalDays = sessions.map((session) => session.day);

      if (action === 'postpone') {
        for (let j = idx; j < sessions.length - 1; j += 1) {
          const donor = sessions[j + 1];
          sessions[j] = applyCssIntensityToSession({
            ...sessions[j],
            ...donor,
            id: sessions[j].id,
            status: 'scheduled'
          });
        }

        const lastIndex = sessions.length - 1;
        const lastDay = originalDays[lastIndex];
        const regenerated = generateSessionForDay(lastDay, lastIndex);
        if (regenerated) {
          sessions[lastIndex] = {
            ...regenerated,
            id: prev.sessions[lastIndex].id,
            day: `${lastDay} (다음주)`
          };
        } else {
          sessions[lastIndex] = applyCssIntensityToSession({
            ...sessions[lastIndex],
            status: 'scheduled'
          });
        }
      } else if (action === 'skip') {
        sessions[idx] = applyCssIntensityToSession({
          ...sessions[idx],
          status: 'skipped'
        });
      } else if (action === 'reset') {
        sessions[idx] = applyCssIntensityToSession({
          ...sessions[idx],
          status: 'scheduled'
        });
      } else if (action === 'regenerate') {
        const regenerated = generateSessionForDay(sessions[idx].day, idx);
        if (regenerated) {
          sessions[idx] = {
            ...regenerated,
            id: sessions[idx].id,
            status: 'scheduled'
          };
        }
      }

      return recalcPlanAfterSessionChange(prev, sessions, selectedStudent);
    });
  };

  const handleSavePlan = async () => {
    if (!plan || !selectedStudent) return;
    try {
      setIsSaving(true);
      setStatusMessage(null);
      const payload = buildSavePayload(plan, selectedStudent);
      let response;
      if (existingProgramId) {
        response = await apiClient.put<any>(`/api/swim-programs/${existingProgramId}`, {
          content: payload.content,
          params: payload.params,
          usedMethodIds: payload.usedMethodIds
        });
      } else {
        response = await apiClient.post<any>('/api/swim-programs', payload);
      }

      if (response?.success === false || response?.error) {
        throw new Error(response?.error || '프로그램 저장 중 오류가 발생했습니다.');
      }

      if (!existingProgramId && response?.programId) {
        setExistingProgramId(response.programId);
      }

      setStatusMessage({ type: 'success', message: '프로그램이 저장되었습니다.' });
    } catch (error: any) {
      console.error('프로그램 저장 실패:', error);
      setStatusMessage({ type: 'error', message: error?.message || '프로그램 저장 중 오류가 발생했습니다.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!hasUserType('instructor')) {
  return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-4xl">🚫</div>
          <p className="text-gray-600">이 페이지는 강사 계정만 접근할 수 있습니다.</p>
      </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">맞춤형 수영 계획</h1>
          <p className="text-gray-600">
            수영 엔진 결과를 바탕으로 세션별 세트를 수정하고 바로 저장할 수 있습니다.
                          </p>
                        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Users className="h-4 w-4 text-blue-600" /> 담당 회원
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {studentsLoading && (
                <div className="flex items-center justify-center py-6 text-gray-500">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> 학생 정보를 불러오는 중입니다...
                      </div>
              )}
              {studentsError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                  {studentsError}
                          </div>
              )}
              {!studentsLoading && students.length === 0 && (
                <div className="text-sm text-gray-500 py-4 text-center">
                  아직 담당 학생이 등록되어 있지 않습니다.
                        </div>
              )}
              {students.map((student) => {
                const isActive = student._id === selectedStudentId;
                const levelLabel = student.studentInfo?.currentLevel || student.studentInfo?.swimmingLevel;
                const goalLabel = student.studentInfo?.healthProfile?.fitnessGoals?.[0];
                return (
                        <button 
                    key={student._id}
                    onClick={() => handleSelectStudent(student._id)}
                    className={`w-full text-left border rounded-lg px-4 py-3 transition-colors ${
                      isActive
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900">{student.name}</span>
                      {isActive && (
                        <span className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded-full">선택됨</span>
                      )}
                      </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      {levelLabel && <div>레벨: {levelLabel}</div>}
                      {goalLabel && <div>목표: {goalLabel}</div>}
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            {planLoading && (
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="flex items-center justify-center py-16 text-gray-500">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> 프로그램을 불러오는 중입니다...
                </CardContent>
              </Card>
            )}

            {!planLoading && !selectedStudent && (
              <Card className="border border-dashed border-gray-300 bg-white">
                <CardContent className="py-16 text-center text-gray-500">
                  프로그램을 확인할 학생을 선택해주세요.
                </CardContent>
              </Card>
            )}

            {!planLoading && selectedStudent && plan && (
              <>
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-2">
                      <CardTitle className="text-xl font-semibold text-gray-900">
                        {selectedStudent.name} 주간 프로그램 요약
                      </CardTitle>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-blue-500" />
                          총 {plan.totalMeters.toLocaleString()}m · 예상 {Math.round(plan.actualDurationMinutes)}분
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-500" />
                          주 {plan.weeklyFrequency}회 · 회당 {Math.round(plan.sessionDurationMinutes)}분 · 목표 {plan.weeklyTargetMinutes}분
                          </div>
                        <div className="flex items-center gap-2">
                          <Dumbbell className="h-4 w-4 text-emerald-500" />
                          목표: {plan.goal} · 레벨: {plan.level}
                        </div>
                      </div>
                </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        onClick={handleRegeneratePlan}
                        disabled={planLoading}
                        className="flex items-center gap-2"
                      >
                        <RefreshCcw className="h-4 w-4" /> 재생성
                      </Button>
                      <Button
                        onClick={handleSavePlan}
                        disabled={isSaving}
                        className="flex items-center gap-2"
                      >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        저장하기
                      </Button>
                      </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {statusMessage && (
                      <div
                        className={`flex items-center gap-2 px-3 py-2 rounded border text-sm ${
                          statusMessage.type === 'success'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : statusMessage.type === 'error'
                              ? 'bg-red-50 border-red-200 text-red-700'
                              : 'bg-blue-50 border-blue-200 text-blue-700'
                        }`}
                      >
                        {statusMessage.type === 'success' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                        <span>{statusMessage.message}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="space-y-1 text-sm">
                        <span className="text-gray-600">시작 날짜</span>
                        <input
                          type="date"
                          value={plan.startDate}
                          onChange={(event) => handlePlanMetaChange('startDate', event.target.value)}
                          className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </label>
                      <label className="space-y-1 text-sm">
                        <span className="text-gray-600">주간 빈도(회)</span>
                        <div className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 text-gray-800">
                          {plan.weeklyFrequency}
                      </div>
                      </label>
                      <label className="space-y-1 text-sm">
                        <span className="text-gray-600">세션당 목표 시간(분)</span>
                        <div className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 text-gray-800">
                          {Math.round(plan.sessionDurationMinutes)}
                      </div>
                      </label>
                      <label className="space-y-1 text-sm">
                        <span className="text-gray-600">주간 총 목표 시간(분)</span>
                        <div className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 text-gray-800">
                          {Math.round(plan.weeklyTargetMinutes)}
                      </div>
                      </label>
                    </div>

                    <label className="space-y-1 text-sm">
                      <span className="text-gray-600">주간 요약</span>
                      <textarea
                        value={plan.summary}
                        onChange={(event) => handlePlanMetaChange('summary', event.target.value)}
                        rows={2}
                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>

                    <label className="space-y-1 text-sm">
                      <span className="text-gray-600">코치 설명 / 계획 메모</span>
                      <textarea
                        value={plan.planExplanation}
                        onChange={(event) => handlePlanMetaChange('planExplanation', event.target.value)}
                        rows={3}
                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="주간 계획에 대한 설명이나 지도 메모를 입력하세요"
                      />
                    </label>
                  </CardContent>
                </Card>

                {plan.sessions.map((session, sessionIndex) => (
                  <Card key={session.id} className="border border-gray-200 shadow-sm">
                    <CardHeader className="flex flex-col gap-3">
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                            <div>
                            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                              <span className="text-blue-600">세션 {sessionIndex + 1}</span>
                              <input
                                value={session.day}
                                onChange={(event) => handleSessionFieldChange(session.id, 'day', event.target.value)}
                                className="border border-transparent rounded px-2 py-1 text-sm bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </CardTitle>
                            <p className="text-sm text-gray-600">
                              테마 설명
                              <input
                                value={session.themeDesc}
                                onChange={(event) => handleSessionFieldChange(session.id, 'themeDesc', event.target.value)}
                                className="ml-2 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {session.status === 'postponed' && (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                연기됨
                                    </span>
                            )}
                            {session.status === 'skipped' && (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 border border-red-200">
                                생략됨
                              </span>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => handleMissedSessionAction(session.id, 'postpone')}>
                                  <CalendarClock className="mr-2 h-4 w-4" /> 다음으로 연기
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleMissedSessionAction(session.id, 'skip')}>
                                  <SkipForward className="mr-2 h-4 w-4" /> 세션 생략
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleMissedSessionAction(session.id, 'regenerate')}>
                                  <RefreshCcw className="mr-2 h-4 w-4" /> 세션 재생성
                                </DropdownMenuItem>
                                {session.status && session.status !== 'scheduled' && (
                                  <DropdownMenuItem onClick={() => handleMissedSessionAction(session.id, 'reset')}>
                                    <Undo2 className="mr-2 h-4 w-4" /> 상태 초기화
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                                  </div>
                              </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <div className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full">
                            {session.distance.toLocaleString()}m
                            </div>
                          <div className="px-2 py-1 bg-sky-50 text-sky-700 rounded-full">
                            예상 {Math.round(session.duration)}분
                                </div>
                          <div className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full">
                            {session.focus.join(', ')}
                                  </div>
                              </div>
                            </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="space-y-1 text-sm">
                          <span className="text-gray-600">세션 목표 (쉼표로 구분)</span>
                          <input
                            value={session.focus.join(', ')}
                            onChange={(event) => handleSessionFieldChange(session.id, 'focus', event.target.value)}
                            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </label>
                        <label className="space-y-1 text-sm">
                          <span className="text-gray-600">강도/가이드 (CSS)</span>
                          <div className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 text-gray-800">
                            {session.intensity.primary || 'CSS 데이터 없음'}
                                    </div>
                        </label>
                        <label className="space-y-1 text-sm">
                          <span className="text-gray-600">보조 지표</span>
                          <div className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 text-gray-700">
                            {session.intensity.secondary || '---'}
                                </div>
                        </label>
                              </div>

                      {session.warnings && session.warnings.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded text-sm">
                          {session.warnings.map((warning, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 mt-0.5" />
                              <span>{warning}</span>
                        </div>
                      ))}
                    </div>
                    )}

                      <div className="space-y-3">
                        {session.blocks.map((block, blockIndex) => {
                          const meta = getBlockMeta(block.type);
                          const Icon = meta.icon;
                          return (
                            <div
                              key={`${session.id}-block-${blockIndex}`}
                              className={`rounded-lg border p-4 shadow-sm transition-all ${meta.containerClass}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                  <span className={`mt-1 flex h-9 w-9 items-center justify-center rounded-full ${meta.iconWrapClass}`}>
                                    <Icon className="h-4 w-4" />
                                  </span>
                                  <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="text-sm font-semibold text-gray-900">{meta.label}</span>
                                      <span className="text-xs uppercase tracking-wide text-gray-500">
                                        {block.type || 'SET'}
                                      </span>
                        </div>
                                    <div className="flex flex-wrap gap-2 text-[11px] font-medium">
                                      {block.zone && (
                                        <span className={`px-2 py-1 rounded-full ${meta.chipClass}`}>Zone {block.zone}</span>
                                      )}
                                      {block.paceDisplay && (
                                        <span className={`px-2 py-1 rounded-full ${meta.chipClass}`}>
                                          CSS {block.paceDisplay}
                                        </span>
                                      )}
                                      <span className="px-2 py-1 rounded-full bg-white/70 text-gray-700 border border-white/60">
                                        {block.distance || 0}m
                                      </span>
                                      <span className="px-2 py-1 rounded-full bg-white/70 text-gray-700 border border-white/60">
                                        예상 {Math.round(block.duration || 0)}분
                                      </span>
                                      <span className="px-2 py-1 rounded-full bg-white/70 text-gray-700 border border-white/60">
                                        휴식 {block.restSec ?? 0}초
                                      </span>
                    </div>
                  </div>
                </div>
                                <button
                                  onClick={() => handleRemoveBlock(session.id, blockIndex)}
                                  className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                                >
                                  <Trash2 className="h-3 w-3" /> 제거
                                </button>
              </div>

                              <label className="mt-4 block space-y-1 text-sm">
                                <span className="text-gray-600">세트 설명</span>
                                <textarea
                                  value={block.description}
                                  onChange={(event) => handleBlockChange(session.id, blockIndex, 'description', event.target.value)}
                                  rows={3}
                                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                  placeholder="세트 구성과 페이스를 입력하세요"
                                />
                              </label>

                              <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                                <label className="space-y-1">
                                  <span className="text-gray-500">세트 유형</span>
                                  <input
                                    value={block.type}
                                    onChange={(event) => handleBlockChange(session.id, blockIndex, 'type', event.target.value)}
                                    className="w-full border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </label>
                                <label className="space-y-1">
                                  <span className="text-gray-500">거리(m)</span>
                                  <input
                                    type="number"
                                    value={block.distance}
                                    onChange={(event) => handleBlockChange(session.id, blockIndex, 'distance', event.target.value)}
                                    className="w-full border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </label>
                                <label className="space-y-1">
                                  <span className="text-gray-500">시간(분)</span>
                                  <input
                                    type="number"
                                    value={block.duration}
                                    onChange={(event) => handleBlockChange(session.id, blockIndex, 'duration', event.target.value)}
                                    className="w-full border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </label>
                                <label className="space-y-1">
                                  <span className="text-gray-500">Zone</span>
                                  <input
                                    value={block.zone || ''}
                                    onChange={(event) => handleBlockChange(session.id, blockIndex, 'zone', event.target.value)}
                                    className="w-full border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                  {block.paceDisplay && (
                                    <span className="text-[11px] text-sky-600">CSS {block.paceDisplay}</span>
                                  )}
                                </label>
                                <label className="space-y-1">
                                  <span className="text-gray-500">휴식(초)</span>
                                  <input
                                    type="number"
                                    value={block.restSec || 0}
                                    onChange={(event) => handleBlockChange(session.id, blockIndex, 'restSec', event.target.value)}
                                    className="w-full border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </label>
          </div>

                              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                <label className="space-y-1">
                                  <span className="text-gray-500">장비(쉼표로 구분)</span>
                                  <input
                                    value={(block.equipment || []).join(', ')}
                                    onChange={(event) => handleBlockChange(session.id, blockIndex, 'equipment', event.target.value)}
                                    className="w-full border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </label>
                                <label className="space-y-1">
                                  <span className="text-gray-500">근거 키(쉼표로 구분)</span>
                                  <input
                                    value={(block.evidenceKeys || []).join(', ')}
                                    onChange={(event) => handleBlockChange(session.id, blockIndex, 'evidenceKeys', event.target.value)}
                                    className="w-full border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </label>
                    </div>

                              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                <label className="space-y-1">
                                  <span className="text-gray-500">왜 이 페이스?</span>
                                  <textarea
                                    value={block.whyPace || ''}
                                    onChange={(event) => handleBlockChange(session.id, blockIndex, 'whyPace', event.target.value)}
                                    rows={2}
                                    className="w-full border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </label>
                                <label className="space-y-1">
                                  <span className="text-gray-500">왜 이 휴식?</span>
                                  <textarea
                                    value={block.whyRest || ''}
                                    onChange={(event) => handleBlockChange(session.id, blockIndex, 'whyRest', event.target.value)}
                                    rows={2}
                                    className="w-full border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </label>
                                <label className="space-y-1">
                                  <span className="text-gray-500">왜 이 세트?</span>
                                  <textarea
                                    value={block.whySet || ''}
                                    onChange={(event) => handleBlockChange(session.id, blockIndex, 'whySet', event.target.value)}
                                    rows={2}
                                    className="w-full border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </label>
                      </div>
                      </div>
                          );
                        })}
                      </div>

                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddBlock(session.id)}
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" /> 세트 추가
                        </Button>
                    </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
              </div>
            </div>
      </div>
    </div>
  );
}

export default withAuth(SwimTrainingPlanPage, { requireTypes: ['instructor', 'superAdmin'] });


















