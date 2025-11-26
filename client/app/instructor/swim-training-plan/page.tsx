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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { generateTimeBasedProgram } from '@/lib/swimlab/engine-v35-time-based';
import apiClient from '@/utils/api';
import { logger } from '@/lib/logger';
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
  Undo2,
  Calendar,
  ChevronLeft,
  ChevronRight
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
  displayName?: string;
  groupClassId?: string;
  groupClassName?: string;
  groupMemberCount?: number;
  isGroupRepresentative?: boolean;
  receivesPersonalLesson?: boolean;
  groupMemberships?: string[];
};

type GroupClassSummary = {
  _id: string;
  className: string;
  level?: string;
  students: StudentSummary[];
  activeCount: number;
  durationMinutes?: number;
  schedule?: Array<{ dayOfWeek: number; startTime?: string; endTime?: string }>;
  centerId?: string;
  courseId?: string;
  groupClassId?: string;
  instructorId?: string;
  hasGroupClassRecord: boolean;
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
  scope?: 'individual' | 'group';
  groupClassId?: string;
  representativeStudentId?: string;
  groupMembers?: StudentSummary[];
  healthWarnings?: string[];
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

const resolveStudentId = (candidate: any): string | null => {
  if (!candidate) return null;
  if (typeof candidate === 'string') return candidate;
  if (candidate._id) return candidate._id.toString();
  if (candidate.id) return candidate.id.toString();
  if (candidate.student) return resolveStudentId(candidate.student);
  if (candidate.studentId) return resolveStudentId(candidate.studentId);
  return null;
};

const toIdString = (value: any): string | undefined => {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'object') {
    if (typeof value._id === 'string') return value._id;
    if (value._id) {
      const result = value._id.toString?.();
      if (result && result !== '[object Object]') return result;
    }
    if (typeof value.id === 'string') return value.id;
    if (value.id) {
      const result = value.id.toString?.();
      if (result && result !== '[object Object]') return result;
    }
    if (typeof value.toString === 'function') {
      const result = value.toString();
      if (result && result !== '[object Object]') return result;
    }
  }
  return undefined;
};

const normalizeNameKey = (value?: string) => (value || '').trim().toLowerCase();

const buildGroupLookupKey = (name?: string, centerId?: string, instructorId?: string) =>
  [normalizeNameKey(name), centerId || 'unknown', instructorId || 'unknown'].join('|');

const buildGroupClassSchedule = (groupClass: any) => {
  if (!groupClass?.schedule) return [];
  const dayArray = Array.isArray(groupClass.schedule.dayOfWeek)
    ? groupClass.schedule.dayOfWeek
    : Array.isArray(groupClass.schedule.days)
      ? groupClass.schedule.days
      : [];
  return dayArray
    .map((day: any) => {
      const dayNumber = typeof day === 'number' ? day : Number(day);
      if (Number.isNaN(dayNumber)) return null;
      return {
        dayOfWeek: (dayNumber + 7) % 7,
        startTime: groupClass.schedule.startTime,
        endTime: groupClass.schedule.endTime
      };
    })
    .filter(Boolean) as Array<{ dayOfWeek: number; startTime?: string; endTime?: string }>;
};

const buildCourseSchedule = (course: any) => {
  if (!Array.isArray(course?.schedule)) return [];
  const dayMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6
  };

  return course.schedule
    .map((sch: any) => {
      const dayValue = sch?.dayOfWeek ?? sch?.day;
      let dayNumber: number | null = null;
      if (typeof dayValue === 'number') {
        dayNumber = dayValue;
      } else if (typeof dayValue === 'string') {
        const normalized = dayValue.toLowerCase();
        dayNumber = dayMap[normalized] ?? Number(normalized);
      }
      if (dayNumber === null || Number.isNaN(dayNumber)) {
        return null;
      }
      return {
        dayOfWeek: (dayNumber + 7) % 7,
        startTime: sch?.startTime,
        endTime: sch?.endTime
      };
    })
    .filter(Boolean) as Array<{ dayOfWeek: number; startTime?: string; endTime?: string }>;
};

const resolveStudentEntry = (
  candidate: any,
  studentMap: Map<string, StudentSummary>
): { student: StudentSummary; status: string } | null => {
  const id = resolveStudentId(candidate);
  if (!id) return null;
  const student = studentMap.get(id);
  if (!student) return null;
  const status = candidate?.status || candidate?.progressStatus || 'active';
  return { student, status };
};

const translateConditionKey = (key: string): string => {
  const map: Record<string, string> = {
    cardiovascular: '심혈관',
    respiratory: '호흡기',
    musculoskeletal: '근골격',
    diabetes: '당뇨',
    hypertension: '고혈압',
    asthma: '천식',
    other: '기타'
  };
  return map[key] || key;
};

const collectStudentConditions = (student: StudentSummary): string[] => {
  const profile = student.studentInfo?.healthProfile || {};
  const chronic = Array.isArray(profile.chronicConditions) ? profile.chronicConditions : [];
  const allergies = Array.isArray(profile.allergies) ? profile.allergies : [];
  const swimmingRelated = profile.swimmingRelatedConditions || {};

  const flagged = Object.entries(swimmingRelated)
    .filter(([, value]) => value)
    .map(([key]) => translateConditionKey(key));

  return unique([...chronic, ...allergies, ...flagged].filter(Boolean));
};

const buildGroupHealthWarnings = (students: StudentSummary[]): string[] => {
  return students
    .map((student) => {
      const conditions = collectStudentConditions(student);
      if (conditions.length === 0) return null;
      return `${student.name}: ${conditions.join(', ')} — 강도는 80% 이하로 조절하고 이상 징후 시 즉시 휴식 안내`;
    })
    .filter((warning): warning is string => Boolean(warning));
};

const buildIndividualWarnings = (student: StudentSummary): string[] => {
  const conditions = collectStudentConditions(student);
  if (conditions.length === 0) return [];
  return conditions.map((condition) =>
    `${condition} 관련 증상 발생 시 강도를 즉시 낮추고 휴식을 취하도록 안내하세요.`
  );
};

const buildGroupRepresentativeStudent = (group: GroupClassSummary): StudentSummary => {
  const firstMember = group.students[0];
  return {
    _id: group._id,
    name: group.className,
    displayName: group.className,
    groupClassName: group.className,
    groupMemberCount: group.activeCount,
    centerId: group.centerId,
    studentInfo: firstMember?.studentInfo || {},
    instructorInfo: firstMember?.instructorInfo || {}
  } as StudentSummary;
};

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
  const nameLabel = student.displayName || student.name;
  const title = student.groupClassName && student.groupMemberCount
    ? `${nameLabel} (${student.groupMemberCount}명)`
    : nameLabel;
  return `${title} · ${plan.goal} · 주 ${plan.weeklyFrequency}회 · 회당 ${perSession}분 (총 ${plan.weeklyTargetMinutes}분 / 약 ${plan.totalMeters}m)`;
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
    usedMethodIds: program?.usedMethodIds || [],
    groupMembers: program?.content?.groupMembers || [],
    healthWarnings: program?.content?.healthWarnings || []
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
    sessions,
    groupMembers: plan.groupMembers || [],
    healthWarnings: plan.healthWarnings || []
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

const buildGroupSavePayload = (plan: WeeklyPlan, group: GroupClassSummary) => {
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

  const groupMembers = (plan.groupMembers && plan.groupMembers.length > 0
    ? plan.groupMembers
    : group.students
  ).map((member) => ({
    studentId: member._id,
    name: member.name,
    email: member.email
  }));

  const content = {
    summary: plan.summary,
    planExplanation: plan.planExplanation,
    totalDuration: plan.weeklyTargetMinutes,
    totalMeters: plan.totalMeters,
    sessions,
    groupMembers,
    healthWarnings: plan.healthWarnings || []
  };

  const payload: any = {
    groupClassId: group.groupClassId || undefined,
    courseId: group.courseId || group.groupClassId || group._id,
    programData: {
      programType: 'weekly',
      programScope: 'group',
      params,
      content,
      usedMethodIds: plan.usedMethodIds
    }
  };

  if (!payload.groupClassId) {
    payload.groupClassId = group.courseId || group._id;
  }

  return payload;
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
  plan.scope = 'individual';
  plan.healthWarnings = buildIndividualWarnings(student);

  return plan;
};

const generatePlanForGroup = (group: GroupClassSummary): WeeklyPlan => {
  const representative = group.students[0];
  const swimmingProfile = representative?.studentInfo?.swimmingProfile || {};
  const fitnessProfile = representative?.studentInfo?.healthProfile || {};

  const frequencyFromSchedule = Array.isArray(group.schedule) && group.schedule.length > 0
    ? group.schedule.length
    : undefined;
  const frequency = Math.max(1, frequencyFromSchedule || swimmingProfile.weeklyFrequency || 3);
  const sessionDuration = Math.max(30, group.durationMinutes || swimmingProfile.sessionDuration || 60);
  const goal = fitnessProfile.fitnessGoals?.[0] || '기초 체력 유지';
  const startDate = new Date().toISOString().slice(0, 10);

  const preferredDays: string[] = (() => {
    if (Array.isArray(group.schedule) && group.schedule.length > 0) {
      const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
      return group.schedule
        .map((item) => dayNames[(item.dayOfWeek ?? 0) % 7])
        .filter((value, index, arr) => value && arr.indexOf(value) === index);
    }
    if (swimmingProfile.preferredDays && swimmingProfile.preferredDays.length > 0) {
      return swimmingProfile.preferredDays;
    }
    return DEFAULT_DAYS;
  })();

  const strokesAllowed = normalizeStrokeList(swimmingProfile.preferredStrokes || swimmingProfile.mainStrokes || ['freestyle']);
  const strokesAvoid = normalizeStrokeList(swimmingProfile.excludedStrokes || []);
  const css = extractCss(swimmingProfile.cssProfile || swimmingProfile.css || {});
  const poolLength = swimmingProfile.poolLength || 25;
  const level = mapLevelToEngine(representative?.studentInfo?.currentLevel || representative?.studentInfo?.swimmingLevel || 'beginner');

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
      conditionIds: [],
      dayCondition: 'normal',
      hasPain: false,
      weeklyFrequency: frequency,
      intensityPercent: swimmingProfile.intensityPercent || 1,
      cssMeasurementPoolLength: swimmingProfile.cssMeasurementPoolLength || poolLength
    });

    sessions.push(convertEnginePlanToSession(day, goal, enginePlan, i));
  }

  const totals = recalcPlanTotals(sessions);
  const pseudoStudent = buildGroupRepresentativeStudent(group);

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
    conditionIds: [],
    summary: '',
    planExplanation: '',
    sessions,
    usedMethodIds: unique(sessions.flatMap((session) => session.usedMethodIds || [])),
    scope: 'group',
    groupClassId: group.groupClassId || group._id,
    groupMembers: group.students,
    healthWarnings: buildGroupHealthWarnings(group.students)
  };

  plan.summary = buildPlanSummary(pseudoStudent, plan);
  plan.planExplanation = buildDefaultPlanExplanation(sessions);

  return plan;
};

const convertExistingGroupProgramToPlan = (program: any, group: GroupClassSummary): WeeklyPlan => {
  const pseudoStudent = buildGroupRepresentativeStudent(group);
  const plan = convertExistingProgramToPlan(program, pseudoStudent);
  plan.scope = 'group';
  plan.groupClassId = group.groupClassId || group._id;
  plan.groupMembers = group.students;
  plan.healthWarnings = buildGroupHealthWarnings(group.students);
  plan.conditionIds = [];
  return plan;
};

function SwimTrainingPlanPage() {
  const { user, hasUserType } = useAuth();
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [groupClasses, setGroupClasses] = useState<GroupClassSummary[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState<string | null>(null);

  const [selectedTarget, setSelectedTarget] = useState<{ type: 'individual' | 'group'; id: string } | null>(null);
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [existingProgramId, setExistingProgramId] = useState<string | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [programHistory, setProgramHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setDate(1);
    return today;
  });
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string | null>(null);

  const CALENDAR_WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];
  const CALENDAR_COLOR_CLASSES = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-slate-500',
    'bg-cyan-500'
  ];

  const cloneDate = (source: Date) => {
    const date = new Date(source);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const addDaysSafe = (source: Date, days: number) => {
    const date = cloneDate(source);
    date.setDate(date.getDate() + days);
    return date;
  };

  const resolveProgramDate = (program: any): Date | null => {
    if (!program) return null;
    const candidate =
      program?.params?.startDate ||
      program?.startDate ||
      program?.content?.startDate ||
      program?.createdAt ||
      program?.updatedAt;
    if (!candidate) return null;
    const date = new Date(candidate);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const formatDateKey = (date: Date) => date.toISOString().slice(0, 10);

  const buildCalendarDays = (month: Date) => {
    const firstDayOfMonth = cloneDate(month);
    const startOffset = (firstDayOfMonth.getDay() + 6) % 7; // Monday as first day
    const calendarStart = addDaysSafe(firstDayOfMonth, -startOffset);
    const days: Date[] = [];
    for (let i = 0; i < 42; i += 1) {
      days.push(addDaysSafe(calendarStart, i));
    }
    return days;
  };

  const resolveProgramScopeKey = (program: any) => {
    if (!program) return 'unknown';
    const groupId = program.groupClassId || program?.params?.groupClassId;
    if (groupId) return `group-${groupId}`;
    const athleteId = program.athleteId || program?.params?.athleteId;
    if (athleteId) return `athlete-${athleteId}`;
    if (program.programScope) return String(program.programScope);
    if (selectedTarget?.type === 'group') return 'group-current';
    if (selectedTarget?.type === 'individual') return 'individual-current';
    return 'unknown';
  };

  const calculateCompletionRate = (program: any) => {
    const sessions = program?.content?.sessions;
    if (!Array.isArray(sessions) || sessions.length === 0) {
      return null;
    }
    const completed = sessions.filter((session) => (session?.status || '').toLowerCase() === 'completed').length;
    return Math.round((completed / sessions.length) * 100);
  };

  const programColorMap = useMemo(() => {
    const map = new Map<string, string>();
    let colorIndex = 0;
    programHistory.forEach((program) => {
      const key = resolveProgramScopeKey(program);
      if (!map.has(key)) {
        map.set(key, CALENDAR_COLOR_CLASSES[colorIndex % CALENDAR_COLOR_CLASSES.length]);
        colorIndex += 1;
      }
    });
    return map;
  }, [programHistory]);

  const calendarEvents = useMemo(() => {
    const events: Record<string, any[]> = {};
    programHistory.forEach((program) => {
      const date = resolveProgramDate(program);
      if (!date) return;
      const key = formatDateKey(date);
      if (!events[key]) {
        events[key] = [];
      }
      events[key].push(program);
    });
    Object.keys(events).forEach((key) => {
      events[key].sort((a, b) => {
        const dateA = new Date(a?.updatedAt || a?.createdAt || 0).getTime();
        const dateB = new Date(b?.updatedAt || b?.createdAt || 0).getTime();
        return dateB - dateA;
      });
    });
    return events;
  }, [programHistory]);

  const calendarDays = useMemo(() => buildCalendarDays(calendarMonth), [calendarMonth]);

  const selectedHistoryPrograms = useMemo(() => {
    if (!selectedHistoryDate) return [];
    return calendarEvents[selectedHistoryDate] || [];
  }, [selectedHistoryDate, calendarEvents]);

  const handleChangeCalendarMonth = (delta: number) => {
    setCalendarMonth((prev) => {
      const next = new Date(prev.getFullYear(), prev.getMonth() + delta, 1);
      next.setHours(0, 0, 0, 0);
      return next;
    });
  };

  const handleSelectHistoryDate = (dateKey: string) => {
    setSelectedHistoryDate(dateKey);
  };

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
          setGroupClasses([]);
          return;
        }
        const formatted: StudentSummary[] = rawStudents.map((student: any) => {
          const summary: StudentSummary = {
            _id: student._id || student.id,
            name: student.name || '이름 없음',
            email: student.email,
            centerId: student.centerId,
            studentInfo: student.studentInfo,
            instructorInfo: student.instructorInfo,
            displayName: student.name || '이름 없음',
            receivesPersonalLesson: false,
            groupMemberships: []
          };
          return summary;
        });

        const studentMap = new Map<string, StudentSummary>();
        formatted.forEach((student) => {
          if (student._id) {
            studentMap.set(student._id.toString(), student);
          }
        });

        const instructorIdForQuery = toIdString(user?._id || user?.id || user?.userId);
        const groupSummaryMap = new Map<string, GroupClassSummary>();
        const groupMemberIds = new Set<string>();
        const personalLessonStudentIds = new Set<string>();

        const collectCourseEntries = (course: any) => {
          const entries: { student: StudentSummary; status: string }[] = [];
          const seen = new Set<string>();

          const pushCandidate = (candidate: any) => {
            const entry = resolveStudentEntry(candidate, studentMap);
            if (entry && entry.student && entry.student._id && !seen.has(entry.student._id)) {
              seen.add(entry.student._id);
              entries.push(entry);
            }
          };

          const enrolled = Array.isArray(course.enrolledStudents) ? course.enrolledStudents : [];
          enrolled.forEach(pushCandidate);

          const studentRefs = Array.isArray(course.students) ? course.students : [];
          studentRefs.forEach(pushCandidate);

          return entries;
        };

        const groupClassMapById = new Map<string, any>();
        const groupClassMapByName = new Map<string, any>();

        try {
          const searchParams = new URLSearchParams();
          searchParams.set('limit', '200');
          if (instructorIdForQuery) {
            searchParams.set('instructorId', instructorIdForQuery);
          }
          const groupClassesResponse = await apiClient.get<any>(
            `/api/group-classes?${searchParams.toString()}`
          );
          const rawGroupClasses =
            groupClassesResponse?.data?.groupClasses ||
            groupClassesResponse?.groupClasses ||
            (Array.isArray(groupClassesResponse?.data) ? groupClassesResponse.data : []);

          if (Array.isArray(rawGroupClasses)) {
            rawGroupClasses.forEach((groupClass: any) => {
              const groupClassId = toIdString(groupClass?._id);
              if (groupClassId) {
                groupClassMapById.set(groupClassId, groupClass);
              }
              const centerIdForKey = toIdString(groupClass?.centerId?._id || groupClass?.centerId);
              const instructorIdForKey = toIdString(groupClass?.instructorId?._id || groupClass?.instructorId);
              const key = buildGroupLookupKey(groupClass?.className, centerIdForKey, instructorIdForKey);
              if (key && !groupClassMapByName.has(key)) {
                groupClassMapByName.set(key, groupClass);
              }
            });
          }
        } catch (groupClassError) {
          logger.warn('단체반(GroupClass) 목록 조회 실패:', groupClassError);
        }

        try {
          const coursesResponse = await apiClient.get<any>('/api/instructor/courses');
          const courseList = Array.isArray(coursesResponse?.data)
            ? coursesResponse.data
            : Array.isArray(coursesResponse)
              ? coursesResponse
              : [];

          courseList.forEach((course: any) => {
            const courseId =
              toIdString(course.id) ||
              toIdString(course._id) ||
              toIdString(course.courseId) ||
              '';
            const groupClassIdCandidate =
              toIdString(course.groupClassId) ||
              toIdString(course.groupClass?._id) ||
              toIdString(course.groupClass?.id) ||
              toIdString(course.groupClass);
            const courseName = course.name || course.title || '단체반';
            const courseTypeRaw = course.courseType || course.type;
            const normalizedType = course.isPersonalLesson ? 'personal' : (courseTypeRaw || 'group');
            const memberEntries = collectCourseEntries(course);

            if (course.isPersonalLesson || normalizedType === 'personal') {
              memberEntries.forEach(({ student }) => {
                if (student?._id) {
                  personalLessonStudentIds.add(student._id);
                  student.receivesPersonalLesson = true;
                }
              });
            }

            if (normalizedType !== 'group') {
              return;
            }

            if (memberEntries.length === 0) {
              return;
            }

            const centerIdValue = (() => {
              if (course.centerId) {
                return toIdString(course.centerId);
              }
              if (course.center && (course.center._id || typeof course.center === 'string')) {
                return toIdString(course.center._id || course.center);
              }
              return undefined;
            })();

            const instructorIdValue = (() => {
              if (course.instructorId) {
                return toIdString(course.instructorId);
              }
              if (course.instructor && (course.instructor._id || typeof course.instructor === 'string')) {
                return toIdString(course.instructor._id || course.instructor);
              }
              if (course.teacherId) {
                return toIdString(course.teacherId);
              }
              if (course.teacher && (course.teacher._id || typeof course.teacher === 'string')) {
                return toIdString(course.teacher._id || course.teacher);
              }
              return instructorIdForQuery;
            })();

            const courseSchedule = buildCourseSchedule(course);
            const groupLookupKey = buildGroupLookupKey(courseName, centerIdValue, instructorIdValue);
            const matchedGroupClass =
              (groupClassIdCandidate && groupClassMapById.get(groupClassIdCandidate)) ||
              groupClassMapByName.get(groupLookupKey) ||
              null;
            const resolvedGroupClassId = toIdString(matchedGroupClass?._id) || groupClassIdCandidate || '';
            const summaryKey =
              resolvedGroupClassId ||
              courseId ||
              `${normalizeNameKey(courseName)}-${centerIdValue || 'center'}-${instructorIdValue || 'instructor'}`;

            if (!summaryKey) {
              return;
            }

            let summary = groupSummaryMap.get(summaryKey);
            if (!summary) {
              summary = {
                _id: resolvedGroupClassId || courseId || summaryKey,
                className: courseName,
                level: course.level || matchedGroupClass?.level,
                students: [],
                activeCount: 0,
                durationMinutes:
                  course.duration ||
                  course.classInfo?.duration ||
                  matchedGroupClass?.schedule?.duration ||
                  60,
                schedule:
                  courseSchedule.length > 0 ? courseSchedule : buildGroupClassSchedule(matchedGroupClass),
                centerId: centerIdValue,
                courseId,
                groupClassId: resolvedGroupClassId || undefined,
                instructorId: instructorIdValue || toIdString(matchedGroupClass?.instructorId),
                hasGroupClassRecord: Boolean(matchedGroupClass)
              };
            }

            const studentsMap = new Map<string, StudentSummary>(
              summary.students.map((student) => [student._id, student])
            );

            memberEntries.forEach(({ student }) => {
              if (!student?._id) return;
              groupMemberIds.add(student._id);
              student.groupMemberships = student.groupMemberships || [];
              if (courseName && !student.groupMemberships.includes(courseName)) {
                student.groupMemberships.push(courseName);
              }
              studentsMap.set(student._id, student);
            });

            if (matchedGroupClass?.students) {
              matchedGroupClass.students.forEach((member: any) => {
                const memberId = toIdString(member?.userId);
                if (!memberId) return;
                groupMemberIds.add(memberId);
                if (!studentsMap.has(memberId)) {
                  const mappedStudent =
                    studentMap.get(memberId) ||
                    {
                      _id: memberId,
                      name:
                        member?.user?.name ||
                        member?.name ||
                        '회원',
                      email: member?.user?.email,
                      centerId: centerIdValue,
                      studentInfo: member?.user?.studentInfo || {},
                      instructorInfo: {}
                    };
                  studentsMap.set(memberId, mappedStudent);
                }
              });
            }

            summary.students = Array.from(studentsMap.values());
            summary.activeCount = summary.students.length;
            if (!summary.groupClassId && resolvedGroupClassId) {
              summary.groupClassId = resolvedGroupClassId;
            }
            if (!summary.schedule || summary.schedule.length === 0) {
              summary.schedule =
                courseSchedule.length > 0 ? courseSchedule : buildGroupClassSchedule(matchedGroupClass);
            }
            if (!summary.durationMinutes && matchedGroupClass?.schedule?.duration) {
              summary.durationMinutes = matchedGroupClass.schedule.duration;
            }
            if (!summary.level) {
              summary.level = course.level || matchedGroupClass?.level;
            }
            if (!summary.instructorId) {
              summary.instructorId = instructorIdValue || toIdString(matchedGroupClass?.instructorId);
            }
            summary.hasGroupClassRecord = summary.hasGroupClassRecord || Boolean(matchedGroupClass);

            groupSummaryMap.set(summaryKey, summary);
          });
        } catch (groupError) {
          logger.warn('단체반(강의) 정보 조회 실패:', groupError);
        }

        const groupSummaries = Array.from(groupSummaryMap.values());

        const filteredIndividuals = formatted.filter((student) => {
          if (!student._id) return false;
          if (!groupMemberIds.has(student._id)) return true;
          return personalLessonStudentIds.has(student._id);
        });

        setGroupClasses(groupSummaries);
        setStudents(filteredIndividuals);
        setSelectedTarget((prev) => {
          let next = prev;
          if (prev?.type === 'individual' && !filteredIndividuals.some((student) => student._id === prev.id)) {
            next = null;
          }
          if (prev?.type === 'group' && !groupSummaries.some((group) => group._id === prev.id)) {
            next = null;
          }

          return next;
        });
      } catch (error) {
        logger.error('학생 목록 조회 실패:', error);
        setStudentsError('담당 학생 목록을 불러오는 중 오류가 발생했습니다.');
        setStudents([]);
        setGroupClasses([]);
        setSelectedTarget(null);
      } finally {
        setStudentsLoading(false);
      }
    };

    loadStudents();
  }, [hasUserType, user?._id, user?.id, user?.userId]);

  const selectedStudent = useMemo(
    () => (selectedTarget?.type === 'individual'
      ? students.find((student) => student._id === selectedTarget.id) || null
      : null),
    [selectedTarget, students]
  );

  const selectedGroup = useMemo(
    () => (selectedTarget?.type === 'group'
      ? groupClasses.find((group) => group._id === selectedTarget.id) || null
      : null),
    [selectedTarget, groupClasses]
  );

  const handleSelectIndividual = (studentId: string) => {
    setProgramHistory([]);
    setHistoryError(null);
    setSelectedTarget({ type: 'individual', id: studentId });
  };

  const handleSelectGroup = (groupId: string) => {
    setProgramHistory([]);
    setHistoryError(null);
    setSelectedTarget({ type: 'group', id: groupId });
  };

  const resolveProgramId = (program: any) => {
    if (!program) return '';
    return program._id || program.id || program.programId || '';
  };

  const formatProgramStartDate = (program: any) => {
    const start = program?.params?.startDate;
    if (!start) return null;
    try {
      const date = new Date(start);
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric' });
      }
      return typeof start === 'string' ? start : null;
    } catch {
      return typeof start === 'string' ? start : null;
    }
  };

  const formatProgramSavedAt = (program: any) => {
    const saved = program?.updatedAt || program?.createdAt;
    if (!saved) return null;
    try {
      const date = new Date(saved);
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      }
      return typeof saved === 'string' ? saved : null;
    } catch {
      return typeof saved === 'string' ? saved : null;
    }
  };

  const handleLoadProgramFromHistory = (
    programId: string,
    options?: { suppressMessage?: boolean }
  ) => {
    if (!programId || !selectedTarget) return;
    const program = programHistory.find((item) => resolveProgramId(item) === programId);
    if (!program) return;

    const programDate = resolveProgramDate(program);
    if (programDate) {
      const dateKey = formatDateKey(programDate);
      setSelectedHistoryDate(dateKey);
      setCalendarMonth((prev) => {
        if (prev.getFullYear() === programDate.getFullYear() && prev.getMonth() === programDate.getMonth()) {
          return prev;
        }
        const monthDate = cloneDate(programDate);
        monthDate.setDate(1);
        return monthDate;
      });
    }

    const label =
      formatProgramStartDate(program) ||
      formatProgramSavedAt(program) ||
      '선택한';

    setHistoryError(null);

    if (selectedTarget.type === 'individual') {
      if (!selectedStudent) return;
      const restoredPlan = convertExistingProgramToPlan(program, selectedStudent);
      restoredPlan.scope = 'individual';
      restoredPlan.healthWarnings = buildIndividualWarnings(selectedStudent);
      setPlan(restoredPlan);
      setExistingProgramId(programId);
      if (!options?.suppressMessage) {
        setStatusMessage({ type: 'info', message: `${label} 프로그램을 불러왔습니다.` });
      }
    } else {
      if (!selectedGroup) return;
      const groupPlan = convertExistingGroupProgramToPlan(program, selectedGroup);
      setPlan(groupPlan);
      setExistingProgramId(programId);
      if (!options?.suppressMessage) {
        setStatusMessage({ type: 'info', message: `${label} 단체반 프로그램을 불러왔습니다.` });
      }
    }
  };

  useEffect(() => {
    if (programHistory.length === 0) {
      if (selectedHistoryDate !== null) {
        setSelectedHistoryDate(null);
      }
      return;
    }

    const datedPrograms = programHistory
      .map((program) => {
        const date = resolveProgramDate(program);
        return date ? { program, date } : null;
      })
      .filter((item): item is { program: any; date: Date } => Boolean(item));

    if (datedPrograms.length === 0) {
      if (selectedHistoryDate !== null) {
        setSelectedHistoryDate(null);
      }
      return;
    }

    datedPrograms.sort((a, b) => b.date.getTime() - a.date.getTime());
    const latestDate = datedPrograms[0].date;
    const latestKey = formatDateKey(latestDate);

    setSelectedHistoryDate((prev) => prev ?? latestKey);
    setCalendarMonth((prev) => {
      if (prev.getFullYear() === latestDate.getFullYear() && prev.getMonth() === latestDate.getMonth()) {
        return prev;
      }
      const monthDate = cloneDate(latestDate);
      monthDate.setDate(1);
      return monthDate;
    });
  }, [programHistory, selectedHistoryDate]);

useEffect(() => {
    if (!selectedTarget) {
      setPlan(null);
      setExistingProgramId(null);
      setProgramHistory([]);
      setHistoryError(null);
      setHistoryLoading(false);
      return;
    }

    const loadPlan = async () => {
      try {
        setPlanLoading(true);
        setHistoryLoading(true);
        setStatusMessage(null);
        setHistoryError(null);

        if (selectedTarget.type === 'individual') {
          if (!selectedStudent) {
            setPlan(null);
            setExistingProgramId(null);
            setProgramHistory([]);
            setHistoryLoading(false);
            return;
          }

          const response = await apiClient.get<any>(
            `/api/swim-programs/athlete/${selectedStudent._id}?limit=10`
          );

          const programs = response?.programs || response?.data?.programs || [];
          setProgramHistory(programs);

          if (Array.isArray(programs) && programs.length > 0) {
            const existingProgram = programs[0];
            const restoredPlan = convertExistingProgramToPlan(existingProgram, selectedStudent);
            restoredPlan.scope = 'individual';
            restoredPlan.healthWarnings = buildIndividualWarnings(selectedStudent);
            setPlan(restoredPlan);
            setExistingProgramId(existingProgram._id);
            setStatusMessage({ type: 'info', message: '기존에 저장된 프로그램을 불러왔습니다.' });
          } else {
            const generatedPlan = generatePlanForStudent(selectedStudent);
            generatedPlan.scope = 'individual';
            generatedPlan.healthWarnings = buildIndividualWarnings(selectedStudent);
            setPlan(generatedPlan);
            setExistingProgramId(null);
            setStatusMessage({ type: 'info', message: '엔진으로 새 주간 프로그램을 생성했습니다.' });
          }
        } else {
          if (!selectedGroup) {
            setPlan(null);
            setExistingProgramId(null);
            setProgramHistory([]);
            setHistoryLoading(false);
            return;
          }

          const groupIdForApi = selectedGroup.groupClassId || selectedGroup.courseId || selectedGroup._id;
          const response = await apiClient.get<any>(`/api/group-programs/${groupIdForApi}`);
          const programs = response?.data?.programs || response?.programs || [];
          setProgramHistory(programs);

          if (Array.isArray(programs) && programs.length > 0) {
            const existingProgram = programs[0];
            const groupPlan = convertExistingGroupProgramToPlan(existingProgram, selectedGroup);
            setPlan(groupPlan);
            setExistingProgramId(existingProgram._id);
            setStatusMessage({ type: 'info', message: '단체반 공통 프로그램을 불러왔습니다.' });
          } else {
            const generatedGroupPlan = generatePlanForGroup(selectedGroup);
            setPlan(generatedGroupPlan);
            setExistingProgramId(null);
            setStatusMessage({ type: 'info', message: '단체반 기본 프로그램을 새로 생성했습니다.' });
          }
        }
      } catch (error) {
        logger.error('프로그램 불러오기 실패:', error);
        setProgramHistory([]);
        setHistoryError('프로그램 이력을 불러오지 못했습니다.');

        if (selectedTarget.type === 'individual' && selectedStudent) {
          const fallbackPlan = generatePlanForStudent(selectedStudent);
          fallbackPlan.scope = 'individual';
          fallbackPlan.healthWarnings = buildIndividualWarnings(selectedStudent);
          setPlan(fallbackPlan);
          setExistingProgramId(null);
          setStatusMessage({ type: 'error', message: '기존 프로그램을 불러오지 못해 새 프로그램을 생성했습니다.' });
        } else if (selectedTarget.type === 'group' && selectedGroup) {
          const fallbackGroupPlan = generatePlanForGroup(selectedGroup);
          setPlan(fallbackGroupPlan);
          setExistingProgramId(null);
          setStatusMessage({ type: 'error', message: '단체반 프로그램을 불러오지 못해 기본 프로그램을 생성했습니다.' });
        } else {
          setPlan(null);
          setExistingProgramId(null);
        }
      } finally {
        setPlanLoading(false);
        setHistoryLoading(false);
      }
    };

    loadPlan();
  }, [selectedTarget, selectedStudent, selectedGroup, historyRefreshKey]);

  const handleRegeneratePlan = () => {
    if (!plan || !selectedTarget) return;

    if (selectedTarget.type === 'group') {
      if (!selectedGroup) return;
      const regeneratedGroup = generatePlanForGroup(selectedGroup);
      setPlan(regeneratedGroup);
      setExistingProgramId(null);
      setStatusMessage({ type: 'info', message: '단체반 공통 프로그램을 재생성했습니다.' });
      return;
    }

    if (!selectedStudent) return;
    const regenerated = generatePlanForStudent(selectedStudent, {
      frequency: plan.weeklyFrequency,
      sessionDuration: plan.sessionDurationMinutes,
      goal: plan.goal,
      startDate: plan.startDate
    });
    regenerated.scope = 'individual';
    regenerated.healthWarnings = buildIndividualWarnings(selectedStudent);
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

      const summaryContext = updated.scope === 'group'
        ? (selectedGroup ? buildGroupRepresentativeStudent(selectedGroup) : null)
        : selectedStudent;
      if (summaryContext) {
        updated.summary = buildPlanSummary(summaryContext, updated);
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
      const summaryContext = prev.scope === 'group'
        ? (selectedGroup ? buildGroupRepresentativeStudent(selectedGroup) : null)
        : selectedStudent;
      return recalcPlanAfterSessionChange(prev, sessions, summaryContext || undefined);
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
        return applyCssIntensityToSession(recalculatedSession);
      });
      const summaryContext = prev.scope === 'group'
        ? (selectedGroup ? buildGroupRepresentativeStudent(selectedGroup) : null)
        : selectedStudent;
      return recalcPlanAfterSessionChange(prev, sessions, summaryContext || undefined);
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
        return applyCssIntensityToSession(recalculatedSession);
      });
      const summaryContext = prev.scope === 'group'
        ? (selectedGroup ? buildGroupRepresentativeStudent(selectedGroup) : null)
        : selectedStudent;
      return recalcPlanAfterSessionChange(prev, sessions, summaryContext || undefined);
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
        return applyCssIntensityToSession(recalculatedSession);
      });
      const summaryContext = prev.scope === 'group'
        ? (selectedGroup ? buildGroupRepresentativeStudent(selectedGroup) : null)
        : selectedStudent;
      return recalcPlanAfterSessionChange(prev, sessions, summaryContext || undefined);
    });
  };

  const generateSessionForDay = (day: string, index: number): PlanSession | null => {
    if (!plan) return null;
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
        conditionIds: plan.scope === 'group' ? [] : plan.conditionIds,
        dayCondition: 'normal',
        hasPain: false,
        weeklyFrequency: plan.weeklyFrequency,
        intensityPercent: 1,
        cssMeasurementPoolLength: plan.poolLength
      });

      return convertEnginePlanToSession(sanitizedDay, plan.goal, engineOutput, index);
    } catch (error) {
      logger.error('세션 재생성 실패:', error);
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

      const summaryContext = prev.scope === 'group'
        ? (selectedGroup ? buildGroupRepresentativeStudent(selectedGroup) : null)
        : selectedStudent;

      return recalcPlanAfterSessionChange(prev, sessions, summaryContext || undefined);
    });
  };

  const handleSavePlan = async () => {
    if (!plan || !selectedTarget) return;
    if (plan.scope === 'group') {
      if (!selectedGroup) {
        setStatusMessage({
          type: 'error',
          message: '단체반 정보를 찾을 수 없습니다. 다시 선택해 주세요.'
        });
        return;
      }
      const hasAnyGroupId = Boolean(
        selectedGroup.groupClassId ||
        selectedGroup.courseId ||
        selectedGroup._id
      );
      if (!hasAnyGroupId) {
        setStatusMessage({
          type: 'error',
          message: '단체반 ID를 확인할 수 없습니다. 센터 관리자에게 강습 정보를 확인해 주세요.'
        });
        return;
      }
    }
    try {
      setIsSaving(true);
      setStatusMessage(null);

      if (plan.scope === 'group') {
        if (!selectedGroup) {
          setStatusMessage({
            type: 'error',
            message: '단체반 정보를 찾을 수 없습니다. 다시 선택해 주세요.'
          });
          return;
        }
        const hasAnyGroupId = Boolean(
          selectedGroup.groupClassId ||
          selectedGroup.courseId ||
          selectedGroup._id
        );
        if (!hasAnyGroupId) {
          setStatusMessage({
            type: 'error',
            message: '단체반 정보를 찾을 수 없습니다. 센터 관리자에게 강습 정보를 확인해 주세요.'
          });
          return;
        }

        const groupPayload = buildGroupSavePayload(plan, selectedGroup);
        let response;

        if (existingProgramId) {
          response = await apiClient.put<any>(`/api/swim-programs/${existingProgramId}`, {
            content: groupPayload.programData.content,
            params: groupPayload.programData.params,
            usedMethodIds: groupPayload.programData.usedMethodIds
          });

          if (response?.success === false || response?.error) {
            throw new Error(response?.error || '단체반 프로그램 수정 중 오류가 발생했습니다.');
          }

          setStatusMessage({ type: 'success', message: '단체반 프로그램이 수정되었습니다.' });
          setHistoryRefreshKey((value) => value + 1);
        } else {
          response = await apiClient.post<any>('/api/group-programs', groupPayload);

          if (response?.success === false || response?.error) {
            throw new Error(response?.error || '단체반 프로그램 저장 중 오류가 발생했습니다.');
          }

          const createdId = response?.data?.programId || response?.programId;
          if (createdId) {
            setExistingProgramId(createdId);
          }

          setStatusMessage({
            type: 'success',
            message: response?.message || '단체반 프로그램이 저장되었습니다.'
          });
          setHistoryRefreshKey((value) => value + 1);
        }

        return;
      }

      if (!selectedStudent) return;

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
      setHistoryRefreshKey((value) => value + 1);
    } catch (error: any) {
      logger.error('프로그램 저장 실패:', error);
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
        <PageHeader
          title="맞춤형 수영 계획"
          description="수영 엔진 결과를 바탕으로 세션별 세트를 수정하고 바로 저장할 수 있습니다."
        />

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

              {groupClasses.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">단체반</p>
                  <div className="space-y-2">
                    {groupClasses.map((group) => {
                      const isActive = selectedTarget?.type === 'group' && selectedTarget.id === group._id;
                      const weekdayLabels = ['일', '월', '화', '수', '목', '금', '토'];
                      const daySummary = group.schedule && group.schedule.length > 0
                        ? group.schedule
                            .map((sch) => weekdayLabels[(sch.dayOfWeek ?? 0) % 7])
                            .filter((value, index, arr) => value && arr.indexOf(value) === index)
                            .join(', ')
                        : null;
                      const buttonStyle = isActive
                        ? 'border-purple-500 bg-purple-50 shadow-sm'
                        : group.hasGroupClassRecord
                          ? 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/40'
                          : 'border-red-300 hover:border-red-400 hover:bg-red-50/60';
                      return (
                        <button
                          key={group._id}
                          onClick={() => handleSelectGroup(group._id)}
                          className={`w-full text-left border rounded-lg px-4 py-3 transition-colors ${buttonStyle}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-gray-900">{group.className}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                                {group.activeCount}명
                              </span>
                              {!group.hasGroupClassRecord && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                                  연동 필요
                                </span>
                              )}
                              {isActive && (
                                <span className="text-xs px-2 py-0.5 bg-purple-600 text-white rounded-full">선택됨</span>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 space-y-1">
                            {group.level && <div>레벨: {group.level}</div>}
                            {group.durationMinutes && <div>회당 {group.durationMinutes}분</div>}
                            {daySummary && <div>요일: {daySummary}</div>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">개인 회원</p>
                {!studentsLoading && students.length === 0 && (
                  <div className="text-sm text-gray-500 py-4 text-center">
                    아직 담당 학생이 등록되어 있지 않습니다.
                  </div>
                )}
                {students.map((student) => {
                  const isActive = selectedTarget?.type === 'individual' && selectedTarget.id === student._id;
                  const levelLabel = student.studentInfo?.currentLevel || student.studentInfo?.swimmingLevel;
                  const goalLabel = student.studentInfo?.healthProfile?.fitnessGoals?.[0];
                  const groupAffiliations = groupClasses
                    .filter((group) => group.students.some((member) => member._id === student._id))
                    .map((group) => group.className);
                  return (
                    <button
                      key={student._id}
                      onClick={() => handleSelectIndividual(student._id)}
                      className={`w-full text-left border rounded-lg px-4 py-3 transition-colors ${
                        isActive
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900">{student.name}</span>
                        <div className="flex items-center gap-2">
                          {student.receivesPersonalLesson && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                              개인레슨
                            </span>
                          )}
                          {groupAffiliations.length > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              단체반 {groupAffiliations.join(', ')}
                            </span>
                          )}
                          {isActive && (
                            <span className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded-full">선택됨</span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        {levelLabel && <div>레벨: {levelLabel}</div>}
                        {goalLabel && <div>목표: {goalLabel}</div>}
                      </div>
                    </button>
                  );
                })}
              </div>
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

            {!planLoading && !plan && (
              <Card className="border border-dashed border-gray-300 bg-white">
                <CardContent className="py-16 text-center text-gray-500">
                  {selectedTarget
                    ? '프로그램 데이터를 불러오지 못했습니다. 다시 시도해주세요.'
                    : '프로그램을 확인할 대상을 선택해주세요.'}
                </CardContent>
              </Card>
            )}

            {!planLoading && plan && (
              <>
                {selectedTarget && (
                  <Card
                    id="plan-history"
                    className="border border-gray-200 shadow-sm scroll-mt-24"
                  >
                    <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          저장된 프로그램 이력
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600">
                          최근에 저장한 프로그램을 불러와 비교하거나 복구할 수 있습니다.
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setHistoryRefreshKey((value) => value + 1)}
                        disabled={historyLoading || planLoading}
                        className="flex items-center gap-2"
                      >
                        <RefreshCcw className="h-4 w-4" />
                        새로고침
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {historyLoading && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          프로그램 이력을 불러오는 중입니다...
                        </div>
                      )}

                      {!historyLoading && historyError && (
                        <div className="text-sm text-red-600">{historyError}</div>
                      )}

                      {!historyLoading && !historyError && programHistory.length === 0 && (
                        <div className="text-sm text-gray-500">
                          아직 저장된 프로그램 이력이 없습니다. 프로그램을 저장하면 자동으로 기록됩니다.
                        </div>
                      )}

                      {!historyLoading && !historyError && programHistory.length > 0 && (
                        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => handleChangeCalendarMonth(-1)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </button>
                              <div className="text-sm font-semibold text-gray-900">
                                {calendarMonth.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleChangeCalendarMonth(1)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-gray-500">
                              {CALENDAR_WEEKDAYS.map((weekday) => (
                                <div key={weekday} className="py-1">
                                  {weekday}
                                </div>
                              ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-xs">
                              {calendarDays.map((day) => {
                                const dateKey = formatDateKey(day);
                                const isCurrentMonth = day.getMonth() === calendarMonth.getMonth();
                                const isSelected = selectedHistoryDate === dateKey;
                                const isToday = formatDateKey(new Date()) === dateKey;
                                const events = calendarEvents[dateKey] || [];

                                const cellClasses = [
                                  'min-h-[72px]',
                                  'rounded-lg',
                                  'border',
                                  'p-2',
                                  'flex',
                                  'flex-col',
                                  'items-stretch',
                                  'justify-between',
                                  'transition-colors'
                                ];
                                if (isSelected) {
                                  cellClasses.push('border-blue-500 bg-blue-50 shadow-sm');
                                } else if (events.length > 0) {
                                  cellClasses.push('border-blue-200 bg-blue-50/40');
                                } else {
                                  cellClasses.push('border-gray-200');
                                }
                                if (!isCurrentMonth) {
                                  cellClasses.push('text-gray-400');
                                }
                                if (events.length === 0) {
                                  cellClasses.push('hover:bg-gray-50');
                                } else {
                                  cellClasses.push('hover:border-blue-400 hover:bg-blue-50');
                                }

                                return (
                                  <button
                                    key={dateKey}
                                    type="button"
                                    onClick={() => events.length > 0 && handleSelectHistoryDate(dateKey)}
                                    disabled={events.length === 0}
                                    className={`${cellClasses.join(' ')} ${
                                      events.length === 0 ? 'cursor-default' : 'cursor-pointer'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between text-[11px] font-medium">
                                      <span>{day.getDate()}</span>
                                      {isToday && (
                                        <span className="rounded-full bg-blue-500 px-1 text-[10px] font-semibold text-white">
                                          오늘
                                        </span>
                                      )}
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                      {events.slice(0, 3).map((program) => {
                                        const colorKey = resolveProgramScopeKey(program);
                                        const colorClass = programColorMap.get(colorKey) || 'bg-blue-500';
                                        return (
                                          <span
                                            key={`${resolveProgramId(program)}-${colorKey}`}
                                            className={`h-2.5 w-2.5 rounded-full ${colorClass}`}
                                          />
                                        );
                                      })}
                                      {events.length > 3 && (
                                        <span className="text-[10px] text-gray-500">+{events.length - 3}</span>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-semibold text-gray-900">
                                {selectedHistoryDate
                                  ? new Date(selectedHistoryDate).toLocaleDateString('ko-KR', {
                                      year: 'numeric',
                                      month: 'numeric',
                                      day: 'numeric'
                                    })
                                  : '날짜를 선택하세요'}
                              </div>
                              {selectedHistoryPrograms.length > 0 && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Droplets className="h-3 w-3 text-blue-500" />
                                  {selectedHistoryPrograms.length}개 프로그램
                                </div>
                              )}
                            </div>

                            {selectedHistoryPrograms.length === 0 ? (
                              <div className="rounded-lg border border-dashed border-gray-200 p-3 text-sm text-gray-500">
                                이 날짜에 저장된 프로그램이 없습니다. 다른 날짜를 선택하세요.
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {selectedHistoryPrograms.map((program, index) => {
                                  const programId = resolveProgramId(program);
                                  const isActive = existingProgramId === programId;
                                  const startLabel = formatProgramStartDate(program);
                                  const savedLabel = formatProgramSavedAt(program);
                                  const totalMeters = Number(program?.content?.totalMeters) || 0;
                                  const sessionCount = Array.isArray(program?.content?.sessions)
                                    ? program.content.sessions.length
                                    : Array.isArray(program?.params?.selectedDays)
                                      ? program.params.selectedDays.length
                                      : 0;
                                  const completionRate = calculateCompletionRate(program);
                                  const scopeKey = resolveProgramScopeKey(program);
                                  const colorClass = programColorMap.get(scopeKey) || 'bg-blue-500';

                                  return (
                                    <div
                                      key={programId || `${selectedHistoryDate}-${index}`}
                                      className={`space-y-2 rounded-lg border px-3 py-2 text-sm transition ${
                                        isActive ? 'border-blue-400 bg-blue-50/60' : 'border-gray-200 bg-white'
                                      }`}
                                    >
                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                          <span className={`h-2.5 w-2.5 rounded-full ${colorClass}`} />
                                          <span className="font-medium text-gray-900">
                                            {startLabel || savedLabel || `프로그램 #${index + 1}`}
                                          </span>
                                          {index === 0 && (
                                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                              최신
                                            </span>
                                          )}
                                          {isActive && (
                                            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                                              현재 적용
                                            </span>
                                          )}
                                        </div>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => !isActive && handleLoadProgramFromHistory(programId)}
                                          disabled={isActive}
                                          className="flex items-center gap-2"
                                        >
                                          <RefreshCcw className="h-3.5 w-3.5" />
                                          불러오기
                                        </Button>
                                      </div>
                                      <div className="space-y-1 text-xs text-gray-600">
                                        {savedLabel && (
                                          <div className="flex items-center gap-1 text-gray-500">
                                            <CalendarClock className="h-3.5 w-3.5" />
                                            저장: {savedLabel}
                                          </div>
                                        )}
                                        <div className="flex flex-wrap items-center gap-3">
                                          <div className="flex items-center gap-1">
                                            <Droplets className="h-3.5 w-3.5 text-blue-500" />
                                            총 {totalMeters.toLocaleString()}m
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Clock className="h-3.5 w-3.5 text-slate-500" />
                                            세션 {sessionCount}개
                                          </div>
                                          {completionRate !== null && (
                                            <div className="flex items-center gap-1 text-emerald-600">
                                              <CheckCircle className="h-3.5 w-3.5" />
                                              완료율 {completionRate}%
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-2">
                      <CardTitle className="text-xl font-semibold text-gray-900">
                        {plan.scope === 'group'
                          ? `${selectedGroup?.className || '단체반'} 공통 프로그램`
                          : `${selectedStudent?.name || '회원'} 주간 프로그램 요약`}
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
                        {plan.scope === 'group' && selectedGroup && (
                          <div className="flex items-center gap-2 text-purple-700">
                            <Users className="h-4 w-4" /> 구성원 {selectedGroup.activeCount}명
                          </div>
                        )}
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
                        {plan.scope === 'group' ? '단체반 저장하기' : '저장하기'}
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

                    {selectedTarget?.type === 'group' && selectedGroup && !selectedGroup.hasGroupClassRecord && (
                      <div className="flex items-start gap-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                        <AlertCircle className="mt-0.5 h-4 w-4" />
                        <div>
                          이 단체반은 새 강습 코스 기반으로 동작 중입니다. 프로그램 저장과 이력은 가능하지만,
                          센터 관리자에게 기존 `GroupClass`와 연결해 두면 다른 시스템과도 완전히 연동됩니다.
                        </div>
                      </div>
                    )}

                    {plan.healthWarnings && plan.healthWarnings.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-900 space-y-1">
                        <p className="font-semibold">건강 유의사항</p>
                        <ul className="list-disc pl-5 space-y-1">
                          {plan.healthWarnings.map((warning, index) => (
                            <li key={`${warning}-${index}`}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {plan.scope === 'group' && selectedGroup && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-900 space-y-1">
                        <p className="font-semibold">단체반 구성원</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedGroup.students.map((member) => (
                            <span key={member._id} className="px-2 py-1 rounded-full bg-white border border-purple-200">
                              {member.name}
                            </span>
                          ))}
                        </div>
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



















