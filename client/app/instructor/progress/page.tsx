/**
 * 레슨 진행 · 출석 관리 페이지
 *
 * 연동되는 데이터: /api/learning-progress/instructor/students, /api/instructor/courses, /api/instructor/progress/student/:studentId
 * 연동되는 파일: @/components/ui/card, @/components/ui/dialog, @/components/withAuth, @/utils/api
 */
'use client';

import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import withAuth from '@/components/withAuth';
import {
  CalendarDays,
  ClipboardList,
  PenSquare,
  Users,
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MessageCircle,
  Target,
  CalendarCheck,
  BookOpen,
  Loader2,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogDescription,
  DialogTitle,
  DialogClose,
  HealthDialogContent,
  HealthDialogHeader,
  HealthDialogBody,
  HealthDialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import apiClient from '@/utils/api';
import { getChecklistItems } from '@/data/swimming-checklist';

type AttendanceStatus = 'present' | 'late' | 'absent';

type SessionType = 'group' | 'personal';

interface CoachNote {
  noteId: string;
  sessionId?: string;
  createdAt: string;
  authorName?: string;
  content: string;
}

type LessonSession = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  activity: string;
  location?: string;
  sessionType: 'group' | 'personal';
  courseName?: string;
};

type StudentProfile = {
  id: string;
  name: string;
  courseName: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  focus: string;
  startDate: string;
  personalLesson?: boolean;
  groupName?: string;
  weeklyGoal: string;
  sessions: LessonSession[];
};

type AttendanceMap = Record<string, AttendanceStatus>;

type CoachNotesMap = Record<string, CoachNote[]>;

interface HomeworkItem {
  taskId: string;
  title: string;
  description?: string;
  dueDate: string;
  createdAt: string;
  completed: boolean;
  completedAt?: string | null;
}

type HomeworkMap = Record<string, HomeworkItem[]>;

type ChecklistCategory = 'stroke' | 'technique' | 'endurance' | 'safety';

interface LevelChecklistItem {
  id: string;
  label: string;
  description?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: ChecklistCategory;
  checked: boolean; // 실제 수업 체크리스트에서 집계된 완료 상태 (읽기 전용)
  checkedAt?: Date; // 완료 일시 (집계된 데이터)
  sourceMethodId?: string | null;
  sourceMethodName?: string | null;
}

type LevelChecklistMap = Record<string, LevelChecklistItem[]>;

const categoryLabels: Record<ChecklistCategory, string> = {
  stroke: '영법',
  technique: '기술',
  endurance: '체력',
  safety: '안전'
};

const MAX_CHECKLIST_ITEMS = 12;

const mapTeachingCategoryToChecklistCategory = (category: string): ChecklistCategory => {
  const normalized = (category || '').toLowerCase();
  if (
    normalized.includes('자유') ||
    normalized.includes('배영') ||
    normalized.includes('평영') ||
    normalized.includes('접영') ||
    normalized.includes('stroke')
  ) {
    return 'stroke';
  }
  if (
    normalized.includes('체력') ||
    normalized.includes('stamina') ||
    normalized.includes('endurance') ||
    normalized.includes('interval') ||
    normalized.includes('지구력')
  ) {
    return 'endurance';
  }
  if (normalized.includes('안전') || normalized.includes('safety') || normalized.includes('rescue')) {
    return 'safety';
  }
  return 'technique';
};

const mapStudentLevelToTeachingMethodLevel = (level: StudentProfile['level']) => {
  switch (level) {
    case 'intermediate':
      return '중급';
    case 'advanced':
      return '고급';
    case 'beginner':
    default:
      return '초급';
  }
};

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s]/g, '')
    .replace(/\s+/g, '-');

const buildChecklistFromTeachingMethods = (
  methods: any[],
  studentLevel: StudentProfile['level']
): LevelChecklistItem[] => {
  if (!Array.isArray(methods) || methods.length === 0) {
    return [];
  }

  const unique = new Map<string, LevelChecklistItem>();

  methods.forEach((method: any) => {
    const checklistItems: any[] = Array.isArray(method?.checklist) ? method.checklist : [];
    if (checklistItems.length === 0) return;

    const methodLevel = mapLevelToTag(method?.level || studentLevel);
    const category = mapTeachingCategoryToChecklistCategory(method?.category || '');

    checklistItems.forEach((rawItem, index: number) => {
      const rawLabel =
        typeof rawItem === 'string'
          ? rawItem
          : rawItem?.label || rawItem?.title || rawItem?.name || rawItem?.text || '';
      const label = (rawLabel || '').toString().trim();
      if (!label) return;

      const slug = slugify(`${method?._id || method?.id || method?.name || 'method'}-${label}-${index}`);
      const detail =
        typeof rawItem === 'object'
          ? rawItem?.description || rawItem?.detail || rawItem?.notes || rawItem?.comment
          : undefined;
      if (!unique.has(slug)) {
        unique.set(slug, {
          id: slug,
          label,
          description:
            detail ||
            (method?.name ? `${method.name} · ${method?.description || '핵심 체크포인트'}` : method?.description),
          level: methodLevel,
          category,
          checked: false,
          sourceMethodId: method?._id || method?.id || null,
          sourceMethodName: method?.name || null
        });
      }
    });
  });

  return Array.from(unique.values()).slice(0, MAX_CHECKLIST_ITEMS);
};

const buildFallbackChecklist = (student: StudentProfile): LevelChecklistItem[] => {
  const items = getChecklistItems();
  const currentLevelItems = items.filter((item) => item.level === student.level);
  const nextLevel = resolveNextLevel(student.level);
  const nextLevelItems = items.filter((item) => item.level === nextLevel);
  const combined = [...currentLevelItems, ...nextLevelItems];
  const unique = Array.from(
    new Map(
      combined.map((item) => [
        item.id,
        {
          id: item.id,
          label: item.label,
          description: item.description,
          level: item.level,
          category: item.category,
          checked: false
        } as LevelChecklistItem
      ])
    ).values()
  );
  return unique.slice(0, MAX_CHECKLIST_ITEMS);
};

const mergeChecklistWithExisting = (
  template: LevelChecklistItem[],
  existing?: LevelChecklistItem[]
): LevelChecklistItem[] => {
  if (!existing || existing.length === 0) return template;
  const existingMap = new Map(existing.map((item) => [item.id, item]));
  const merged = template.map((item) => {
    const saved = existingMap.get(item.id);
    if (!saved) return item;
    return {
      ...item,
      checked: saved.checked,
      description: saved.description || item.description,
      sourceMethodId: saved.sourceMethodId ?? item.sourceMethodId ?? null,
      sourceMethodName: saved.sourceMethodName ?? item.sourceMethodName ?? null
    };
  });

  existing.forEach((item) => {
    if (!merged.find((templateItem) => templateItem.id === item.id)) {
      merged.push(item);
    }
  });

  return merged.slice(0, MAX_CHECKLIST_ITEMS);
};

const isChecklistDifferent = (current: LevelChecklistItem[] | undefined, next: LevelChecklistItem[]): boolean => {
  if (!current) return true;
  if (current.length !== next.length) return true;
  for (let index = 0; index < current.length; index += 1) {
    const a = current[index];
    const b = next[index];
    if (!b) return true;
    if (
      a.id !== b.id ||
      a.checked !== b.checked ||
      a.label !== b.label ||
      a.level !== b.level ||
      a.category !== b.category ||
      (a.description || '') !== (b.description || '') ||
      (a.sourceMethodId || '') !== (b.sourceMethodId || '') ||
      (a.sourceMethodName || '') !== (b.sourceMethodName || '')
    ) {
      return true;
    }
  }
  return false;
};

type AttendanceCellStatus = AttendanceStatus | 'upcoming' | 'not_assigned';

const MAX_GROUP_SESSION_COLUMNS = 12;

type SummaryStatCardProps = {
  icon: ComponentType<React.SVGProps<SVGSVGElement>>;
  iconClassName: string;
  title: string;
  metric: string;
  description: string;
  footer?: ReactNode;
};

const SummaryStatCard = ({ icon: Icon, iconClassName, title, metric, description, footer }: SummaryStatCardProps) => (
  <Card className="group relative border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-sky-400 hover:shadow-lg focus-within:-translate-y-1 focus-within:border-sky-400 focus-within:shadow-lg">
    <span className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-xl bg-gradient-to-r from-sky-100 via-transparent to-sky-100 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100" />
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
      <Icon className={`w-5 h-5 ${iconClassName}`} />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-semibold text-slate-900">{metric}</div>
      <p className="mt-4 text-xs text-slate-500">{description}</p>
      {footer && <div className="mt-3 text-xs text-slate-500">{footer}</div>}
    </CardContent>
  </Card>
);

const attendancePalette: Record<AttendanceStatus, { label: string; bg: string; text: string }> = {
  present: { label: '출석', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  late: { label: '지각', bg: 'bg-amber-100', text: 'text-amber-700' },
  absent: { label: '결석', bg: 'bg-rose-100', text: 'text-rose-700' }
};

const attendanceCellPalette: Record<AttendanceCellStatus, { label: string; className: string }> = {
  present: { label: '출석', className: 'bg-emerald-500/10 text-emerald-700 border border-emerald-200' },
  late: { label: '지각', className: 'bg-amber-500/10 text-amber-700 border border-amber-200' },
  absent: { label: '결석', className: 'bg-rose-500/10 text-rose-700 border border-rose-200' },
  upcoming: { label: '예정', className: 'bg-slate-100 text-slate-600 border border-dashed border-slate-300' },
  not_assigned: { label: '-', className: 'text-slate-400' }
};

const resolveNextLevel = (level: StudentProfile['level']): StudentProfile['level'] => {
  if (level === 'beginner') return 'intermediate';
  if (level === 'intermediate') return 'advanced';
  return 'advanced';
};

const levelLabels: Record<StudentProfile['level'], string> = {
  beginner: '초급',
  intermediate: '중급',
  advanced: '고급'
};

const levelBadges: Record<StudentProfile['level'], string> = {
  beginner: 'bg-sky-100 text-sky-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-indigo-100 text-indigo-700'
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const getWeekStart = (base: Date) => {
  const start = new Date(base);
  const day = start.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // 월요일 기준 주차
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
};

const formatDate = (value: string | Date) => {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' });
};

const formatTimeRange = (session: LessonSession) => `${session.startTime} ~ ${session.endTime}`;

const createId = () => (
  typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
);

const getWeekdayLabel = (date: Date) => {
  const weekdayLabels = ['일', '월', '화', '수', '목', '금', '토'] as const;
  return weekdayLabels[date.getDay()];
};

const formatDayAndWeekday = (value: string | Date) => {
  const date = typeof value === 'string' ? new Date(value) : value;
  return `${date.getDate()}일(${getWeekdayLabel(date)})`;
};

const getMonthRange = (base: Date) => {
  const start = new Date(base.getFullYear(), base.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const formatPeriod = (start: Date, end: Date) => {
  const startText = start.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  const endText = end.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  return `${startText} ~ ${endText}`;
};

const mapLevelToTag = (rawLevel?: string): 'beginner' | 'intermediate' | 'advanced' => {
  const normalized = (rawLevel || '').toLowerCase();
  if (['중급', 'intermediate', 'mid'].includes(normalized)) return 'intermediate';
  if (['고급', 'advanced', 'high'].includes(normalized)) return 'advanced';
  return 'beginner';
};

const resolveDayNumber = (value: any): number | null => {
  if (value === undefined || value === null) return null;
  if (typeof value === 'number' && value >= 0 && value <= 6) return value;
  const normalized = value.toString().toLowerCase();
  const dayMap: Record<string, number> = {
    sunday: 0,
    sun: 0,
    '0': 0,
    monday: 1,
    mon: 1,
    '1': 1,
    tuesday: 2,
    tue: 2,
    '2': 2,
    wednesday: 3,
    wed: 3,
    '3': 3,
    thursday: 4,
    thu: 4,
    '4': 4,
    friday: 5,
    fri: 5,
    '5': 5,
    saturday: 6,
    sat: 6,
    '6': 6
  };
  return dayMap[normalized] ?? null;
};

const generateSessionsFromCourses = async (baseStudents: StudentProfile[]): Promise<{ students: StudentProfile[]; attendanceSeed: AttendanceMap }> => {
  const studentsMap = new Map<string, StudentProfile>(baseStudents.map((student) => [student.id, { ...student, sessions: [...student.sessions] }]));
  const attendanceSeed: AttendanceMap = {};

  try {
    const response = await apiClient.get<any>('/api/instructor/courses');
    const courses = Array.isArray(response?.data) ? response.data : [];
    if (courses.length === 0) {
      return { students: baseStudents, attendanceSeed };
    }

    const baseWeek = getWeekStart(new Date());

    courses.forEach((course: any) => {
      const schedule = Array.isArray(course?.schedule) ? course.schedule : [];
      if (schedule.length === 0) return;

      const enrolled = Array.isArray(course?.enrolledStudents) ? course.enrolledStudents : [];
      const studentIds: string[] = [];
      enrolled.forEach((entry: any) => {
        const id = entry?.studentId || entry?.student?._id || entry?.student?._id?.toString?.() || entry?.student?.toString?.();
        if (id) studentIds.push(id.toString());
      });
      const fallbackStudents = Array.isArray(course?.students) ? course.students : [];
      fallbackStudents.forEach((id: any) => {
        if (id) studentIds.push(id.toString());
      });

      if (studentIds.length === 0) return;

      schedule.forEach((item: any, scheduleIndex: number) => {
        const dayNumbers: number[] = [];
        if (Array.isArray(item?.dayOfWeek)) {
          item.dayOfWeek.forEach((value: any) => {
            const resolved = resolveDayNumber(value);
            if (resolved !== null) dayNumbers.push(resolved);
          });
        } else {
          const resolved = resolveDayNumber(item?.dayOfWeek ?? item?.day);
          if (resolved !== null) dayNumbers.push(resolved);
        }

        if (dayNumbers.length === 0) return;

        dayNumbers.forEach((dayNumber) => {
          for (let week = -1; week <= 4; week += 1) {
            const sessionDate = addDays(baseWeek, dayNumber + week * 7);
            const dateStr = sessionDate.toISOString().slice(0, 10);
            const startTime = item?.startTime || '00:00';
            const endTime = item?.endTime || '00:00';
            const location = item?.location || item?.lanes?.assignedLanes?.length
              ? `레인 ${(item?.lanes?.assignedLanes || []).join(', ')}`
              : course?.poolType || '수영장';
            const activity = item?.activity || `${course?.name || '레슨'} 세션`;
            const courseName = course?.name || '레슨';
            const sessionType: 'group' | 'personal' = course?.isPersonalLesson ? 'personal' : 'group';

            studentIds.forEach((studentId) => {
              const mappedStudent = studentsMap.get(studentId.toString());
              if (!mappedStudent) return;

              const sessionId = `${course?._id || course?.id || course?.courseId || 'course'}-${scheduleIndex}-${week}-${dayNumber}-${studentId}`;
              const session: LessonSession = {
                id: sessionId,
                date: dateStr,
                startTime,
                endTime,
                activity,
                location,
                sessionType,
                courseName
              };

              mappedStudent.sessions = [...(mappedStudent.sessions || []), session];
              if (!attendanceSeed[sessionId]) {
                attendanceSeed[sessionId] = 'absent';
              }
            });
          }
        });
      });
    });

    const students = Array.from(studentsMap.values()).map((student) => ({
      ...student,
      sessions: (student.sessions || []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }));

    return { students, attendanceSeed };
  } catch (error) {
    console.warn('강의 일정 기반 세션 생성 실패:', error);
    return { students: baseStudents, attendanceSeed };
  }
};

function InstructorProgress() {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [attendance, setAttendance] = useState<AttendanceMap>({});
  const [coachNotes, setCoachNotes] = useState<CoachNotesMap>({});
  const [homework, setHomework] = useState<HomeworkMap>({});
  const [noteDraft, setNoteDraft] = useState<string>('');
  const [selectedSessionForNote, setSelectedSessionForNote] = useState<string | 'all'>('all');
  const [homeworkDraft, setHomeworkDraft] = useState({ title: '', description: '', dueDate: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isStudentsLoading, setIsStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [rangeMode, setRangeMode] = useState<'week' | 'month'>('week');
  const [studentFilter, setStudentFilter] = useState<'all' | 'personal' | 'group'>('all');
  const [levelChecklist, setLevelChecklist] = useState<LevelChecklistMap>({});
  const [checklistTemplates, setChecklistTemplates] = useState<Record<string, LevelChecklistItem[]>>({});
  const [isChecklistLoading, setIsChecklistLoading] = useState(false);
  const [checklistError, setChecklistError] = useState<string | null>(null);
  const [isRecommendingPromotion, setIsRecommendingPromotion] = useState(false);
 
  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) || null,
    [students, selectedStudentId]
  );

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsStudentsLoading(true);
        setStudentsError(null);
 
        const response = await apiClient.get<any>('/api/learning-progress/instructor/students');
        const rawStudents = Array.isArray(response?.students) ? response.students : [];
 
        const mapped: StudentProfile[] = rawStudents.map((student: any) => {
          const level = mapLevelToTag(
            student?.studentInfo?.currentLevel || student?.studentInfo?.swimmingLevel || student?.level
          );
          const focus = student?.studentInfo?.swimmingProfile?.focusAreas?.[0] || '맞춤 레슨 진행 중';
          const weeklyGoal = student?.studentInfo?.healthProfile?.fitnessGoals?.[0] || '이번 주 목표를 설정해 주세요';
          const startDate = student?.studentInfo?.enrollmentDate || student?.createdAt || new Date().toISOString();
 
          return {
            id: student._id || student.id,
            name: student.name || '이름 없음',
            courseName: student.currentCourse?.name || '개별 관리',
            level,
            focus,
            startDate: new Date(startDate).toISOString().slice(0, 10),
            personalLesson: student?.studentInfo?.lessonType === 'personal',
            groupName: student?.studentInfo?.groupName || undefined,
            weeklyGoal,
            sessions: []
          };
        });
 
        const { students: enrichedStudents, attendanceSeed } = await generateSessionsFromCourses(mapped);
        setStudents(enrichedStudents);
        setAttendance(attendanceSeed);
        if (mapped.length > 0) {
          setSelectedStudentId(mapped[0].id);
        }
      } catch (error) {
        console.error('담당 학생 로드 실패:', error);
        setStudentsError('담당 학생 목록을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsStudentsLoading(false);
      }
    };
 
    fetchStudents();
  }, [user]);

  useEffect(() => {
    if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  useEffect(() => {
    if (!dialogOpen || !selectedStudent) {
      return;
    }

    const loadProgress = async () => {
      try {
        setIsLoadingProgress(true);
        const response = await apiClient.get<any>(`/api/instructor/progress/student/${selectedStudent.id}`);
        const progress = response?.data;

        if (!progress) {
          setStatusBanner(null);
          return;
        }

        if (Array.isArray(progress.sessions)) {
          const mappedSessions: LessonSession[] = progress.sessions.map((session: any) => ({
            id: session.sessionId,
            date: new Date(session.sessionDate).toISOString().slice(0, 10),
            startTime: session.startTime,
            endTime: session.endTime,
            activity: session.activity,
            location: session.location,
            sessionType: session.sessionType || 'group',
            courseName: session.courseName || progress.courseName || selectedStudent.courseName
          }));

          setStudents((prev) =>
            prev.map((student) =>
              student.id === selectedStudent.id
                ? { ...student, courseName: progress.courseName || student.courseName, sessions: mappedSessions }
                : student
            )
          );

          setAttendance((prev) => {
            const next = { ...prev };
            progress.sessions.forEach((session: any) => {
              next[session.sessionId] = session.status || 'absent';
            });
            return next;
          });
        }

        if (Array.isArray(progress.notes)) {
          const mappedNotes: CoachNote[] = progress.notes.map((note: any) => ({
            noteId: note.noteId,
            sessionId: note.sessionId || undefined,
            createdAt: new Date(note.createdAt).toISOString(),
            authorName: note.authorName,
            content: note.content
          }));
          setCoachNotes((prev) => ({ ...prev, [selectedStudent.id]: mappedNotes }));
        }

        if (Array.isArray(progress.homework)) {
          const mappedHomework: HomeworkItem[] = progress.homework.map((task: any) => ({
            taskId: task.taskId,
            title: task.title,
            description: task.description,
            dueDate: new Date(task.dueDate).toISOString().slice(0, 10),
            createdAt: new Date(task.createdAt).toISOString(),
            completed: Boolean(task.completed),
            completedAt: task.completedAt ? new Date(task.completedAt).toISOString() : null
          }));
          setHomework((prev) => ({ ...prev, [selectedStudent.id]: mappedHomework }));
        }

        // 레벨 체크리스트는 서버에서 실제 수업 체크리스트에서 실시간 집계된 데이터 사용
        if (Array.isArray(progress.levelChecklist)) {
          const mappedChecklist: LevelChecklistItem[] = progress.levelChecklist.map((item: any) => ({
            id: item.itemId || item.id || createId(),
            label: item.label,
            description: item.description,
            level: mapLevelToTag(item.level || selectedStudent.level),
            category: ['stroke', 'technique', 'endurance', 'safety'].includes(item.category)
              ? (item.category as ChecklistCategory)
              : 'technique',
            checked: Boolean(item.checked), // 서버에서 집계된 완료 상태 사용
            checkedAt: item.checkedAt ? new Date(item.checkedAt) : undefined,
            sourceMethodId: item.sourceMethodId || null,
            sourceMethodName: item.sourceMethodName || null
          }));
          setLevelChecklist((prev) => ({ ...prev, [selectedStudent.id]: mappedChecklist }));
          
          // 템플릿도 집계된 데이터로 업데이트 (다음 조회 시 병합을 위해)
          setChecklistTemplates((prev) => ({ ...prev, [selectedStudent.id]: mappedChecklist }));
        }

        setStatusBanner(null);
      } catch (error) {
        console.error('진행 관리 데이터 로드 실패:', error);
        setStatusBanner({ type: 'error', message: '기존 진행 관리 데이터를 불러오지 못했습니다.' });
      } finally {
        setIsLoadingProgress(false);
      }
    };

    loadProgress();
  }, [dialogOpen, selectedStudent?.id]);

  // 레벨 체크리스트는 서버에서 실제 수업 체크리스트에서 실시간 집계되므로
  // 클라이언트에서 템플릿을 생성하지 않고 서버에서 집계된 데이터 사용
  // loadProgress()에서 이미 집계된 레벨 체크리스트를 가져오므로 별도 로드 불필요

  const currentWeekRange = useMemo(() => {
    const start = getWeekStart(new Date());
    const end = addDays(start, 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }, []);

  const currentMonthRange = useMemo(() => getMonthRange(new Date()), []);

  const currentRange = useMemo(() => {
    if (rangeMode === 'week') {
      return { ...currentWeekRange, label: '이번 주', type: 'week' as const };
    }
    return { ...currentMonthRange, label: '이번 달', type: 'month' as const };
  }, [currentMonthRange, currentWeekRange, rangeMode]);

  const sessionsInRange = useMemo(() => {
    if (!selectedStudent) return [];
    const startTime = currentRange.start.getTime();
    const endTime = currentRange.end.getTime();
    return selectedStudent.sessions.filter((session) => {
      const sessionTime = new Date(session.date).getTime();
      return sessionTime >= startTime && sessionTime <= endTime;
    });
  }, [selectedStudent, currentRange]);

  const getAttendanceSummaryForSessions = (sessions: LessonSession[], start: Date, end: Date) => {
    const summary: Record<AttendanceStatus | 'total', number> = { total: 0, present: 0, late: 0, absent: 0 };
    const startTime = start.getTime();
    const endTime = (() => {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return Math.min(end.getTime(), today.getTime());
    })();

    sessions.forEach((session) => {
      const sessionTime = new Date(session.date).getTime();
      if (sessionTime < startTime || sessionTime > endTime) return;
      summary.total += 1;
      const status = attendance[session.id] ?? 'absent';
      summary[status] += 1;
    });

    const attended = summary.present + summary.late;
    const rate = summary.total > 0 ? Math.round((attended / summary.total) * 100) : 0;
    return { ...summary, rate };
  };

  const rangeAttendanceStats = useMemo(() => getAttendanceSummaryForSessions(sessionsInRange, currentRange.start, currentRange.end), [
    sessionsInRange,
    currentRange,
    attendance
  ]);
  const upcomingSessionsCount = Math.max(0, sessionsInRange.length - rangeAttendanceStats.total);

  const getOverallAttendanceSummary = (start: Date, end: Date) => {
    const summary = { total: 0, present: 0, late: 0, absent: 0 };
    students.forEach((student) => {
      const studentSummary = getAttendanceSummaryForSessions(student.sessions || [], start, end);
      summary.total += studentSummary.total;
      summary.present += studentSummary.present;
      summary.late += studentSummary.late;
      summary.absent += studentSummary.absent;
    });
    const attended = summary.present + summary.late;
    const rate = summary.total > 0 ? Math.round((attended / summary.total) * 100) : 0;
    return { ...summary, rate };
  };

  const weeklyOverview = useMemo(
    () => getOverallAttendanceSummary(currentWeekRange.start, currentWeekRange.end),
    [currentWeekRange, students, attendance]
  );

  const monthlyOverview = useMemo(
    () => getOverallAttendanceSummary(currentMonthRange.start, currentMonthRange.end),
    [currentMonthRange, students, attendance]
  );

  const studentProgressRows = useMemo(() => {
    return students.map((student) => {
      const weekly = getAttendanceSummaryForSessions(student.sessions || [], currentWeekRange.start, currentWeekRange.end);
      const monthly = getAttendanceSummaryForSessions(student.sessions || [], currentMonthRange.start, currentMonthRange.end);
      const pendingHomework = (homework[student.id] || []).filter((task) => !task.completed).length;
      const noteCount = (coachNotes[student.id] || []).length;
      return {
        student,
        weekly,
        monthly,
        pendingHomework,
        noteCount
      };
    });
  }, [students, currentWeekRange, currentMonthRange, homework, coachNotes, attendance]);

  const attendanceRiskCounts = useMemo(() => {
    let excellent = 0;
    let stable = 0;
    let caution = 0;
    let noData = 0;

    studentProgressRows.forEach(({ monthly }) => {
      if (monthly.total === 0) {
        noData += 1;
        return;
      }
      if (monthly.rate >= 90) {
        excellent += 1;
      } else if (monthly.rate >= 70) {
        stable += 1;
      } else {
        caution += 1;
      }
    });

    return { excellent, stable, caution, noData };
  }, [studentProgressRows]);

  const groupAttendanceSheets = useMemo(() => {
    type GroupAccumulator = {
      groupName: string;
      members: StudentProfile[];
      sessions: Map<
        string,
        {
          key: string;
          date: string;
          startTime: string;
          endTime: string;
          sessionType: SessionType;
          courseName?: string;
        }
      >;
      memberSessions: Map<string, Map<string, LessonSession>>;
    };

    const rangeStart = new Date(currentMonthRange.start);
    const rangeEnd = new Date(currentMonthRange.end);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const groups = new Map<string, GroupAccumulator>();

    students.forEach((student) => {
      const groupSessions = (student.sessions || []).filter((session) => session.sessionType === 'group');
      if (groupSessions.length === 0) {
        return;
      }

      groupSessions.forEach((session) => {
        const sessionDate = new Date(session.date);
        if (sessionDate < rangeStart || sessionDate > rangeEnd) {
          return;
        }

        const groupKey = student.groupName || session.courseName || '단체반';
        let group = groups.get(groupKey);
        if (!group) {
          group = {
            groupName: groupKey,
            members: [],
            sessions: new Map(),
            memberSessions: new Map()
          };
          groups.set(groupKey, group);
        }

        if (!group.members.some((member) => member.id === student.id)) {
          group.members.push(student);
        }

        const key = `${session.date}|${session.startTime}|${session.endTime}`;
        if (!group.sessions.has(key)) {
          group.sessions.set(key, {
            key,
            date: session.date,
            startTime: session.startTime,
            endTime: session.endTime,
            sessionType: session.sessionType,
            courseName: session.courseName
          });
        }

        const memberSessionMap = group.memberSessions.get(student.id) ?? new Map<string, LessonSession>();
        memberSessionMap.set(key, session);
        group.memberSessions.set(student.id, memberSessionMap);
      });
    });

    return Array.from(groups.values()).map((group) => {
      const allSessions = Array.from(group.sessions.values()).sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime() || a.startTime.localeCompare(b.startTime)
      );
      const limitedSessions = allSessions.slice(0, MAX_GROUP_SESSION_COLUMNS);
      const hiddenCount = Math.max(allSessions.length - limitedSessions.length, 0);
    const scheduleDescriptor = limitedSessions[0]
      ? `${new Date(limitedSessions[0].date).getMonth() + 1}월 · ${limitedSessions[0].startTime}`
      : '';

      const rows = group.members.map((member) => {
        const sessionMap = group.memberSessions.get(member.id) ?? new Map<string, LessonSession>();
        const cells = limitedSessions.map((session) => {
          const mappedSession = sessionMap.get(session.key);
          if (!mappedSession) {
            return { status: 'not_assigned' as AttendanceCellStatus };
          }
          const sessionDate = new Date(mappedSession.date);
          const isFuture = sessionDate.getTime() > today.getTime();
          const rawStatus = attendance[mappedSession.id] ?? 'absent';
          const normalizedStatus: AttendanceCellStatus =
            isFuture && (rawStatus === 'absent' || rawStatus === undefined)
              ? 'upcoming'
              : (rawStatus as AttendanceStatus);
          return { status: normalizedStatus };
        });

        return { member, cells };
      });

      return {
        groupName: group.groupName,
        memberCount: group.members.length,
        sessions: limitedSessions,
        rows,
      hiddenCount,
      scheduleDescriptor
      };
    });
  }, [students, attendance, currentMonthRange]);

  const personalAttendanceRows = useMemo(() => {
    return students
      .map((student) => {
        const personalSessions = (student.sessions || []).filter((session) => session.sessionType === 'personal');
        if (personalSessions.length === 0) {
          return null;
        }

        const weekly = getAttendanceSummaryForSessions(personalSessions, currentWeekRange.start, currentWeekRange.end);
        const monthly = getAttendanceSummaryForSessions(
          personalSessions,
          currentMonthRange.start,
          currentMonthRange.end
        );
        const pendingHomework = (homework[student.id] || []).filter((task) => !task.completed).length;
        const noteCount = (coachNotes[student.id] || []).length;

        return {
          student,
          weekly,
          monthly,
          pendingHomework,
          noteCount
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);
  }, [students, currentWeekRange, currentMonthRange, homework, coachNotes, attendance]);

  const categorizeStudent = (student: StudentProfile) => {
    const hasGroup = Boolean(student.groupName) || (student.sessions || []).some((session) => session.sessionType === 'group');
    const hasPersonal = Boolean(student.personalLesson) || (student.sessions || []).some((session) => session.sessionType === 'personal');
    if (hasGroup && hasPersonal) return 'hybrid';
    if (hasGroup) return 'group';
    if (hasPersonal) return 'personal';
    return 'personal';
  };

  const filteredStudents = useMemo(() => {
    if (studentFilter === 'all') return students;
    return students.filter((student) => {
      const category = categorizeStudent(student);
      if (studentFilter === 'personal') {
        return category === 'personal' || category === 'hybrid';
      }
      if (studentFilter === 'group') {
        return category === 'group' || category === 'hybrid';
      }
      return true;
    });
  }, [students, studentFilter]);

  const checklistForStudent = selectedStudent ? levelChecklist[selectedStudent.id] || [] : [];

  const checklistStats = useMemo(() => {
    if (!checklistForStudent || checklistForStudent.length === 0) {
      return { total: 0, completed: 0, percent: 0 };
    }
    const completed = checklistForStudent.filter((item) => item.checked).length;
    const percent = Math.round((completed / checklistForStudent.length) * 100);
    return { total: checklistForStudent.length, completed, percent };
  }, [checklistForStudent]);

  const canRecommendPromotion = checklistStats.total > 0 && checklistStats.completed === checklistStats.total;

  const buildChecklistForStudent = (student: StudentProfile): LevelChecklistItem[] => {
    const items = getChecklistItems();
    const currentLevelItems = items.filter((item) => item.level === student.level);
    const nextLevel = resolveNextLevel(student.level);
    const nextLevelItems = items.filter((item) => item.level === nextLevel);
    const combined = [...currentLevelItems, ...nextLevelItems];
    const unique = Array.from(
      new Map(
        combined.map((item) => [
          item.id,
          {
            id: item.id,
            label: item.label,
            description: item.description,
            level: item.level,
            category: item.category,
            checked: false
          } as LevelChecklistItem
        ])
      ).values()
    );
    return unique.slice(0, 8);
  };

  const getGroupScheduleInfo = (student: StudentProfile) => {
    const groupSessions = (student.sessions || [])
      .filter((session) => session.sessionType === 'group')
      .sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime() || a.startTime.localeCompare(b.startTime)
      );
    if (groupSessions.length === 0) {
      return null;
    }
    const first = groupSessions[0];
    return {
      title: student.groupName || first.courseName || student.courseName,
      schedule: `${formatDayAndWeekday(first.date)} ${first.startTime} ~ ${first.endTime}`,
      courseName: first.courseName || student.courseName
    };
  };

  const personalLessonCount = useMemo(() => {
    const ids = new Set<string>();
    personalAttendanceRows.forEach(({ student }) => ids.add(student.id));
    return ids.size;
  }, [personalAttendanceRows]);

  const groupLessonCount = useMemo(() => {
    const ids = new Set<string>();
    groupAttendanceSheets.forEach((sheet) => {
      sheet.rows.forEach((row) => ids.add(row.member.id));
    });
    return ids.size;
  }, [groupAttendanceSheets]);
  const rangePeriodText = useMemo(() => formatPeriod(currentRange.start, currentRange.end), [currentRange]);

  const handleAttendanceChange = (sessionId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [sessionId]: status }));
  };

  // 레벨 체크리스트는 실제 수업 체크리스트에서 집계되므로 직접 체크 불가
  // 실제 수업 체크리스트(/instructor/checklist)에서만 체크 가능
  const handleToggleChecklistItem = (studentId: string, itemId: string) => {
    // 레벨 체크리스트는 읽기 전용 - 직접 체크 불가
    // 실제 수업 체크리스트에서 체크해야 함
    setStatusBanner({ 
      type: 'info', 
      message: '레벨 체크리스트는 실제 수업 체크리스트에서 자동으로 집계됩니다. 실제 수업 체크리스트에서 체크해주세요.' 
    });
  };

  // 레벨 체크리스트는 실제 수업 체크리스트에서 집계되므로 리셋 불가
  const handleResetChecklist = (studentId: string) => {
    // 레벨 체크리스트는 읽기 전용 - 리셋 불가
    setStatusBanner({ 
      type: 'info', 
      message: '레벨 체크리스트는 실제 수업 체크리스트에서 자동으로 집계됩니다. 리셋할 수 없습니다.' 
    });
  };

  const handleRecommendPromotion = async () => {
    if (!selectedStudent) return;
    const checklist = levelChecklist[selectedStudent.id] ?? [];
    if (checklist.length === 0) {
      setStatusBanner({ type: 'error', message: '체크리스트 항목이 없습니다. 먼저 항목을 설정해 주세요.' });
      return;
    }
    const completed = checklist.filter((item) => item.checked).length;
    if (completed < checklist.length) {
      setStatusBanner({ type: 'error', message: '모든 체크리스트 항목을 완료하면 승급 제안을 보낼 수 있습니다.' });
      return;
    }
    const nextLevel = resolveNextLevel(selectedStudent.level);
    try {
      setIsRecommendingPromotion(true);
      const response = await apiClient.put<any>(`/api/student-levels/${selectedStudent.id}/level`, {
        newLevel: nextLevel,
        reason: `레벨 체크리스트 ${completed}/${checklist.length} 완료`
      });

      if (response && response.success === false) {
        throw new Error(response.message || response.error || '레벨 승급 요청이 거절되었습니다.');
      }

      const updatedLevelEnglish = response?.data?.newLevelEnglish || nextLevel;
      const updatedLevelKorean =
        response?.data?.newLevel ||
        levelLabels[updatedLevelEnglish as StudentProfile['level']] ||
        levelLabels[nextLevel];

      setStudents((prev) =>
        prev.map((student) =>
          student.id === selectedStudent.id
            ? { ...student, level: updatedLevelEnglish as StudentProfile['level'] }
            : student
        )
      );

      setStatusBanner({
        type: 'success',
        message: `${selectedStudent.name}님의 ${updatedLevelKorean} 레벨 승급을 요청했습니다. 관리자 검토 후 반영됩니다.`
      });

      setLevelChecklist((prev) => ({
        ...prev,
        [selectedStudent.id]: []
      }));

      setChecklistTemplates((prev) => {
        const nextTemplates = { ...prev };
        delete nextTemplates[selectedStudent.id];
        return nextTemplates;
      });
    } catch (error) {
      console.error('레벨 승급 제안 실패:', error);
      setStatusBanner({
        type: 'error',
        message: '레벨 승급 요청 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
      });
    } finally {
      setIsRecommendingPromotion(false);
    }
  };

  const handleAddNote = () => {
    if (!selectedStudent || !noteDraft.trim()) return;
    const newNote: CoachNote = {
      noteId: createId(),
      sessionId: selectedSessionForNote === 'all' ? undefined : selectedSessionForNote,
      createdAt: new Date().toISOString(),
      authorName: user?.name || '코치',
      content: noteDraft.trim()
    };
    setCoachNotes((prev) => ({
      ...prev,
      [selectedStudent.id]: [newNote, ...(prev[selectedStudent.id] || [])]
    }));
    setNoteDraft('');
    setSelectedSessionForNote('all');
  };

  const handleAddHomework = () => {
    if (!selectedStudent || !homeworkDraft.title.trim()) return;
    const newTask: HomeworkItem = {
      taskId: createId(),
      title: homeworkDraft.title.trim(),
      description: homeworkDraft.description.trim(),
      dueDate: homeworkDraft.dueDate || new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
      completed: false,
      completedAt: null
    };
    setHomework((prev) => ({
      ...prev,
      [selectedStudent.id]: [newTask, ...(prev[selectedStudent.id] || [])]
    }));
    setHomeworkDraft({ title: '', description: '', dueDate: '' });
  };

  const toggleHomeworkCompleted = (studentId: string, taskId: string) => {
    setHomework((prev) => ({
      ...prev,
      [studentId]: (prev[studentId] || []).map((task) =>
        task.taskId === taskId
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date().toISOString() : null
            }
          : task
      )
    }));
  };

  const removeHomework = (studentId: string, taskId: string) => {
    setHomework((prev) => ({
      ...prev,
      [studentId]: (prev[studentId] || []).filter((task) => task.taskId !== taskId)
    }));
  };

  const handleSaveProgress = async () => {
    if (!selectedStudent) return;

    try {
      setIsSavingProgress(true);
      setStatusBanner(null);

      const payload = {
        courseName: selectedStudent.courseName,
        sessions: selectedStudent.sessions.map((session) => ({
          sessionId: session.id,
          sessionDate: new Date(session.date).toISOString(),
          startTime: session.startTime,
          endTime: session.endTime,
          activity: session.activity,
          location: session.location,
          sessionType: session.sessionType,
          courseName: session.courseName,
          status: attendance[session.id] || 'absent'
        })),
        notes: (coachNotes[selectedStudent.id] || []).map((note) => ({
          noteId: note.noteId,
          sessionId: note.sessionId,
          content: note.content,
          authorName: note.authorName,
          createdAt: note.createdAt
        })),
        homework: (homework[selectedStudent.id] || []).map((task) => ({
          taskId: task.taskId,
          title: task.title,
          description: task.description,
          dueDate: new Date(task.dueDate).toISOString(),
          createdAt: task.createdAt,
          completed: task.completed,
          completedAt: task.completedAt || null
        })),
        // 레벨 체크리스트는 실제 수업 체크리스트에서 실시간 집계되므로 저장하지 않음
        levelChecklist: []
      };

      await apiClient.post(`/api/instructor/progress/student/${selectedStudent.id}`, payload);
      setStatusBanner({ type: 'success', message: '진행 관리 정보를 저장했습니다.' });
    } catch (error) {
      console.error('진행 관리 저장 실패:', error);
      setStatusBanner({ type: 'error', message: '저장 중 오류가 발생했습니다. 다시 시도해 주세요.' });
    } finally {
      setIsSavingProgress(false);
    }
  };

  if (isStudentsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" /> 담당 학생 정보를 불러오는 중입니다...
        </div>
      </div>
    );
  }

  if (studentsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-sm text-rose-600">{studentsError}</p>
        </div>
      </div>
    );
  }

  if (!selectedStudent) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <Users className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-gray-500">등록된 담당 학생이 없습니다. 먼저 강의 또는 학생 배정을 완료해 주세요.</p>
        </div>
      </div>
    );
  }

  const notesForStudent = coachNotes[selectedStudent?.id || ''] || [];
  const homeworkForStudent = homework[selectedStudent?.id || ''] || [];
  const pendingHomeworkForStudent = homeworkForStudent.filter((task) => !task.completed).length;
  const latestNotePreview = notesForStudent[0]?.content
    ? notesForStudent[0].content.replace(/\s+/g, ' ').trim()
    : '';

  const summaryCards: SummaryStatCardProps[] = [
    {
      icon: CalendarCheck,
      iconClassName: 'text-sky-500',
      title: '이번 주 출석률',
      metric: `${weeklyOverview.rate}%`,
      description: `오늘까지 ${weeklyOverview.total}회 세션 기준`,
      footer: (
        <div className="grid grid-cols-3 gap-2">
          <span>출석 {weeklyOverview.present}회</span>
          <span>지각 {weeklyOverview.late}회</span>
          <span>결석 {weeklyOverview.absent}회</span>
        </div>
      )
    },
    {
      icon: CalendarDays,
      iconClassName: 'text-indigo-500',
      title: '이달 출석률',
      metric: `${monthlyOverview.rate}%`,
      description: `이달 진행 ${monthlyOverview.total}회 세션 기준`,
      footer: (
        <div className="grid grid-cols-3 gap-2">
          <span>출석 {monthlyOverview.present}회</span>
          <span>지각 {monthlyOverview.late}회</span>
          <span>결석 {monthlyOverview.absent}회</span>
        </div>
      )
    },
    {
      icon: Users,
      iconClassName: 'text-emerald-500',
      title: '담당 학생',
      metric: `${students.length}명`,
      description: '개인 · 단체 수업 모두 포함',
      footer: (
        <div className="grid grid-cols-2 gap-2">
          <span>개인 {personalLessonCount}명</span>
          <span>단체 {groupLessonCount}명</span>
        </div>
      )
    },
    {
      icon: ClipboardList,
      iconClassName: 'text-amber-500',
      title: `${selectedStudent.name} 과제 현황`,
      metric: `${pendingHomeworkForStudent}건`,
      description: '미완료 과제 수',
      footer: (
        <div>
          총 등록 {homeworkForStudent.length}건
        </div>
      )
    },
    {
      icon: MessageCircle,
      iconClassName: 'text-rose-500',
      title: `${selectedStudent.name} 코멘트`,
      metric: `${notesForStudent.length}건`,
      description: '저장된 코치 피드백',
      footer: (
        <div className="max-w-[200px] truncate">
          {latestNotePreview ? `최근: ${latestNotePreview}` : '기록된 코멘트가 없습니다.'}
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">레슨 진행 · 출석 관리</h1>
          <p className="text-gray-600">
            출석, 코멘트, 과제를 한 번에 관리하고 주간 진행 상황을 추적하세요. 정산 자료도 출석 데이터를 기반으로 자동 집계할 수 있습니다.
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {summaryCards.map((card) => (
            <SummaryStatCard key={card.title} {...card} />
          ))}
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">출석 진행 리포트</h2>
              <p className="text-sm text-slate-500">이번 달 출석률 기반으로 우수 학생과 주의 학생을 즉시 확인할 수 있습니다.</p>
            </div>
            <span className="text-xs font-medium text-slate-400">데이터 기준: {formatPeriod(currentMonthRange.start, currentMonthRange.end)}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <SummaryStatCard
              icon={TrendingUp}
              iconClassName="text-emerald-500"
              title="출석 우수"
              metric={`${attendanceRiskCounts.excellent}명`}
              description="이달 출석률 90% 이상"
            />
            <SummaryStatCard
              icon={Target}
              iconClassName="text-sky-500"
              title="안정 유지"
              metric={`${attendanceRiskCounts.stable}명`}
              description="이달 출석률 70% ~ 89%"
            />
            <SummaryStatCard
              icon={AlertTriangle}
              iconClassName="text-rose-500"
              title="주의 필요"
              metric={`${attendanceRiskCounts.caution}명`}
              description="이달 출석률 70% 미만"
            />
            <SummaryStatCard
              icon={CalendarDays}
              iconClassName="text-slate-500"
              title="일정 미확인"
              metric={`${attendanceRiskCounts.noData}명`}
              description="이번 달 예정 세션 없음"
            />
          </div>
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">단체반 출석부</h3>
                  <p className="text-xs text-slate-500">이달 일정 기준 · 반별 출석 현황을 한눈에 확인하세요.</p>
                </div>
                <span className="text-[11px] font-medium text-slate-400">표시 세션 최대 {MAX_GROUP_SESSION_COLUMNS}회</span>
              </div>
              {groupAttendanceSheets.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
                  등록된 단체반 레슨이 없거나 이달 일정이 비어 있습니다.
                </div>
              ) : (
                <div className="space-y-5">
                  {groupAttendanceSheets.map((sheet) => (
                    <div key={sheet.groupName} className="space-y-2">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <h4 className="text-base font-semibold text-slate-900">
                            {sheet.groupName}
                            {sheet.scheduleDescriptor && (
                              <span className="ml-2 text-sm font-normal text-slate-500">· {sheet.scheduleDescriptor}</span>
                            )}
                          </h4>
                          <p className="text-xs text-slate-500">단체반 구성원 {sheet.memberCount}명</p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                          <span className="rounded-full bg-slate-100 px-2 py-0.5">
                            표시 중 {sheet.sessions.length}회
                          </span>
                          {sheet.hiddenCount > 0 && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-500">
                              + {sheet.hiddenCount}회 더 있음
                            </span>
                          )}
                        </div>
                      </div>
                      {sheet.sessions.length === 0 ? (
                        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-400">
                          이달에 예정된 세션이 없습니다.
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                          <table className="min-w-full text-sm text-slate-700">
                            <thead className="sticky top-0 z-20 bg-slate-100 text-xs font-medium uppercase tracking-wide text-slate-500">
                              <tr className="divide-x divide-slate-200">
                                <th className="sticky left-0 z-30 bg-slate-100 px-4 py-3 text-left">회원</th>
                                {sheet.sessions.map((session) => (
                                  <th key={session.key} className="px-3 py-3 text-center">
                                    <div className="font-semibold text-slate-700">{formatDayAndWeekday(session.date)}</div>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {sheet.rows.map((row) => (
                                <tr key={row.member.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                                  <td className="sticky left-0 z-10 bg-white px-4 py-3 align-middle text-sm font-semibold text-slate-900">
                                    {row.member.name}
                                  </td>
                                  {row.cells.map((cell, index) => {
                                    const session = sheet.sessions[index];
                                    const palette = attendanceCellPalette[cell.status];
                                    return (
                                      <td key={`${row.member.id}-${session?.key ?? index}`} className="px-3 py-2 text-center align-middle">
                                        {cell.status === 'not_assigned' ? (
                                          <span className="text-xs text-slate-300">-</span>
                                        ) : (
                                          <span className={`inline-flex min-w-[56px] items-center justify-center rounded-full px-2 py-1 text-[11px] font-medium ${palette.className}`}>
                                            {palette.label}
                                          </span>
                                        )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">개인 레슨 출석 현황</h3>
                  <p className="text-xs text-slate-500">주·월간 출석률과 결석 내역을 확인하세요.</p>
                </div>
                <span className="text-[11px] font-medium text-slate-400">데이터 기준: {formatPeriod(currentMonthRange.start, currentMonthRange.end)}</span>
              </div>
              {personalAttendanceRows.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
                  개인 레슨 대상 학생이 없습니다.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                  <table className="min-w-full text-sm text-slate-700">
                    <thead className="bg-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">학생</th>
                        <th className="px-4 py-3">이번 주 출석</th>
                        <th className="px-4 py-3">이번 달 출석</th>
                        <th className="px-4 py-3">이달 결석</th>
                        <th className="px-4 py-3">미완료 과제</th>
                        <th className="px-4 py-3">코멘트</th>
                      </tr>
                    </thead>
                    <tbody>
                      {personalAttendanceRows.map(({ student, weekly, monthly, pendingHomework, noteCount }) => (
                        <tr key={student.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 align-top">
                            <div className="font-semibold text-slate-900">{student.name}</div>
                            <div className="text-xs text-slate-500 mt-1">{student.courseName}</div>
                          </td>
                          <td className="px-4 py-3 align-top">
                            {weekly.total > 0 ? (
                              <>
                                <div className="text-sm font-semibold text-slate-900">{weekly.rate}%</div>
                                <div className="text-xs text-slate-500 mt-1">
                                  출석 {weekly.present} · 지각 {weekly.late} · 결석 {weekly.absent}
                                </div>
                              </>
                            ) : (
                              <span className="text-xs text-slate-400">주간 일정 없음</span>
                            )}
                          </td>
                          <td className="px-4 py-3 align-top">
                            {monthly.total > 0 ? (
                              <>
                                <div className="text-sm font-semibold text-slate-900">{monthly.rate}%</div>
                                <div className="text-xs text-slate-500 mt-1">
                                  출석 {monthly.present} · 지각 {monthly.late} · 결석 {monthly.absent}
                                </div>
                              </>
                            ) : (
                              <span className="text-xs text-slate-400">월간 일정 없음</span>
                            )}
                          </td>
                          <td className="px-4 py-3 align-top text-sm text-slate-600">{monthly.absent}회</td>
                          <td className="px-4 py-3 align-top text-sm text-slate-600">{pendingHomework}건</td>
                          <td className="px-4 py-3 align-top text-sm text-slate-600">{noteCount}건</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-slate-900">담당 학생</h2>
              <p className="text-sm text-slate-500">카드를 클릭하면 레슨 진행 · 출석 관리 팝업이 열립니다.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                {[
                  { key: 'all' as const, label: '전체' },
                  { key: 'personal' as const, label: '개인 회원' },
                  { key: 'group' as const, label: '단체반' }
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setStudentFilter(option.key)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      studentFilter === option.key
                        ? option.key === 'group'
                          ? 'bg-indigo-500 text-white shadow'
                          : option.key === 'personal'
                            ? 'bg-emerald-500 text-white shadow'
                            : 'bg-sky-500 text-white shadow'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <BookOpen className="w-6 h-6 text-slate-400" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredStudents.map((student) => {
              const category = categorizeStudent(student);
              const groupInfo = getGroupScheduleInfo(student);
              const isGroupOnly = category === 'group' && groupInfo;
              const categoryBadge =
                category === 'hybrid'
                  ? {
                      label: '단체 + 개인',
                      className: 'bg-gradient-to-r from-emerald-500 to-indigo-500 text-white'
                    }
                  : category === 'group'
                    ? {
                        label: '단체반',
                        className: 'bg-indigo-500/10 text-indigo-600 border border-indigo-200'
                      }
                    : {
                        label: '개인레슨',
                        className: 'bg-emerald-500/10 text-emerald-600 border border-emerald-200'
                      };
              return (
                <Card
                  key={student.id}
                  className="border-slate-200 cursor-pointer transition hover:border-sky-400 hover:shadow"
                  onClick={() => {
                    setSelectedStudentId(student.id);
                    setRangeMode('week');
                    setDialogOpen(true);
                  }}
                >
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <CardTitle className="text-xl font-semibold text-slate-900 leading-tight">
                          {student.name}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          {groupInfo ? (
                            <>
                              <span className="font-medium text-indigo-600">{groupInfo.title}</span>
                              {groupInfo.schedule && (
                                <>
                                  <span>·</span>
                                  <span>{groupInfo.schedule}</span>
                                </>
                              )}
                            </>
                          ) : (
                            <span>{student.courseName}</span>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${levelBadges[student.level]}`}>
                        {levelLabels[student.level]}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className={`text-[11px] font-medium px-2 py-1 rounded-full ${categoryBadge.className}`}>
                        {categoryBadge.label}
                      </span>
                      {groupInfo && <span className="text-slate-500">회원: {student.name}</span>}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <CalendarDays className="w-3 h-3" />
                      시작일 {new Date(student.startDate).toLocaleDateString('ko-KR')}
                    </div>
                    <p className="text-xs text-slate-500">
                      주간 목표: <span className="text-slate-700 font-medium">{student.weeklyGoal}</span>
                    </p>
                    {(() => {
                      const currentWeekStart = getWeekStart(new Date());
                      const currentWeekEnd = addDays(currentWeekStart, 6);
                      const sessionsThisWeek = (student.sessions || []).filter((session) => {
                        const sessionDate = new Date(session.date);
                        return sessionDate >= currentWeekStart && sessionDate <= currentWeekEnd;
                      }).length;
                      return (
                        <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                          {student.groupName && <span>단체반: {student.groupName}</span>}
                          {student.personalLesson && <span>개인레슨 진행 중</span>}
                          <span>이번 주 세션 {sessionsThisWeek}회</span>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <Dialog open={dialogOpen && Boolean(selectedStudent)} onOpenChange={setDialogOpen}>
          <HealthDialogContent>
            <HealthDialogHeader>
              <div>
                <DialogTitle className="text-2xl font-semibold text-slate-900">
                  {selectedStudent?.name} · 레슨 진행 / 출석 관리
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-500">
                  주간 출석, 코멘트, 과제를 기록하면 정산 및 리포트에 자동 반영됩니다.
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  onClick={handleSaveProgress}
                  disabled={isSavingProgress || isLoadingProgress}
                >
                  {isSavingProgress ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> 저장 중...
                    </span>
                  ) : (
                    '저장'
                  )}
                </Button>
                <DialogClose className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100">
                  닫기
                </DialogClose>
              </div>
            </HealthDialogHeader>
            <HealthDialogBody>
                {statusBanner && (
                  <div
                    className={`rounded-lg border px-4 py-3 text-sm ${
                      statusBanner.type === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-rose-200 bg-rose-50 text-rose-700'
                    }`}
                  >
                    {statusBanner.message}
                  </div>
                )}
                {isLoadingProgress && (
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> 진행 관리 데이터를 불러오는 중...
                  </div>
                )}
                {selectedStudent && (
                  <>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{selectedStudent.courseName}</h3>
                    <p className="text-sm text-slate-500">주간 목표: {selectedStudent.weeklyGoal}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      현재 보기: {currentRange.label} · {rangePeriodText} · 총 {sessionsInRange.length}회 일정
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                      <button
                        onClick={() => setRangeMode('week')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                          rangeMode === 'week'
                            ? 'bg-sky-500 text-white shadow'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        이번 주
                      </button>
                      <button
                        onClick={() => setRangeMode('month')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                          rangeMode === 'month'
                            ? 'bg-indigo-500 text-white shadow'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        이번 달
                      </button>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2 text-[11px] text-slate-500">
                      {rangeAttendanceStats.total > 0 && (
                        <span className="rounded-full bg-sky-50 px-2 py-0.5 text-sky-600">
                          출석률 {rangeAttendanceStats.rate}%
                        </span>
                      )}
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-600">
                        출석 {rangeAttendanceStats.present}회
                      </span>
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-600">
                        지각 {rangeAttendanceStats.late}회
                      </span>
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-rose-600">
                        결석 {rangeAttendanceStats.absent}회
                      </span>
                      {upcomingSessionsCount > 0 && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                          예정 {upcomingSessionsCount}회
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="min-w-full text-sm text-slate-700">
                    <thead className="bg-slate-100 text-slate-600">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">수업 일정</th>
                        <th className="px-4 py-3 text-left font-medium">활동</th>
                        <th className="px-4 py-3 text-left font-medium">출석</th>
                        <th className="px-4 py-3 text-left font-medium">메모</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessionsInRange.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                            선택한 기간에 예정된 레슨이 없습니다.
                          </td>
                        </tr>
                      )}
                      {sessionsInRange.map((session) => {
                        const status = attendance[session.id] ?? 'absent';
                        return (
                          <tr key={session.id} className="border-t border-slate-100">
                            <td className="px-4 py-3 align-top">
                              <div className="font-medium text-slate-900">{formatDate(session.date)}</div>
                              <div className="text-xs text-slate-500">{formatTimeRange(session)}</div>
                              <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
                                <CalendarDays className="w-3 h-3" />
                                {session.sessionType === 'group' ? '단체반' : '개인레슨'} · {session.location}
                              </div>
                            </td>
                            <td className="px-4 py-3 align-top">
                              <p className="font-medium text-slate-900">{session.activity}</p>
                              <p className="text-xs text-slate-500 mt-1">{session.courseName}</p>
                            </td>
                            <td className="px-4 py-3 align-top">
                              <div className="flex flex-wrap gap-2">
                                {(Object.keys(attendancePalette) as AttendanceStatus[]).map((option) => (
                                  <button
                                    key={option}
                                    onClick={() => handleAttendanceChange(session.id, option)}
                                    className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                                      status === option
                                        ? `${attendancePalette[option].bg} ${attendancePalette[option].text} border-transparent`
                                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                    }`}
                                  >
                                    {attendancePalette[option].label}
                                  </button>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3 align-top text-xs text-slate-500">
                              {status === 'late' && (
                                <div className="flex items-center gap-1 text-amber-600">
                                  <AlertTriangle className="w-3 h-3" /> 지각 처리됨
                                </div>
                              )}
                              {status === 'absent' && (
                                <div className="flex items-center gap-1 text-rose-600">
                                  <XCircle className="w-3 h-3" />
                                  {session.sessionType === 'personal'
                                    ? '결석 - 보강 일정 협의 필요'
                                    : '결석 처리됨'}
                                </div>
                              )}
                              {status === 'present' && (
                                <div className="flex items-center gap-1 text-emerald-600">
                                  <CheckCircle2 className="w-3 h-3" /> 정상 출석
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  <Card className="border border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg text-slate-900">코치 코멘트</CardTitle>
                      <PenSquare className="w-5 h-5 text-rose-500" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs text-slate-500">어떤 세션에 대한 피드백인가요?</label>
                        <select
                          value={selectedSessionForNote}
                          onChange={(event) => setSelectedSessionForNote(event.target.value as typeof selectedSessionForNote)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                        >
                          <option value="all">특정 세션 아님 (일반 피드백)</option>
                          {selectedStudent.sessions.map((session) => (
                            <option key={session.id} value={session.id}>
                              {formatDate(session.date)} · {session.activity}
                            </option>
                          ))}
                        </select>
                      </div>
                      <textarea
                        value={noteDraft}
                        onChange={(event) => setNoteDraft(event.target.value)}
                        rows={4}
                        placeholder="레슨 피드백, 보완 포인트, 가정 통신문에 넣을 내용을 작성해 주세요"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={handleAddNote}
                          className="px-4 py-2 bg-rose-500 text-white text-sm font-medium rounded-lg hover:bg-rose-600"
                        >
                          코멘트 저장
                        </button>
                      </div>
                      <div className="space-y-3 divide-y divide-slate-100">
                        {notesForStudent.length === 0 && (
                          <p className="text-sm text-slate-400 text-center py-4">기록된 코멘트가 없습니다.</p>
                        )}
                        {notesForStudent.map((note) => (
                          <div key={note.noteId} className="pt-3 first:pt-0">
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <span>{new Date(note.createdAt).toLocaleString('ko-KR')}</span>
                              <span>•</span>
                              <span>{note.authorName || '코치'}</span>
                            </div>
                            {note.sessionId && (
                              <div className="text-[11px] text-slate-500 mt-1">
                                세션: {selectedStudent.sessions.find((s) => s.id === note.sessionId)?.activity}
                              </div>
                            )}
                            <p className="text-sm text-slate-700 mt-2 whitespace-pre-line">{note.content}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg text-slate-900">과제 / 홈워크</CardTitle>
                      <Target className="w-5 h-5 text-emerald-500" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input
                          value={homeworkDraft.title}
                          onChange={(event) => setHomeworkDraft((prev) => ({ ...prev, title: event.target.value }))}
                          placeholder="과제 제목"
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                        />
                        <input
                          type="date"
                          value={homeworkDraft.dueDate}
                          onChange={(event) => setHomeworkDraft((prev) => ({ ...prev, dueDate: event.target.value }))}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                        />
                      </div>
                      <textarea
                        value={homeworkDraft.description}
                        onChange={(event) => setHomeworkDraft((prev) => ({ ...prev, description: event.target.value }))}
                        rows={3}
                        placeholder="과제 세부 내용 또는 학부모 전달 사항"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={handleAddHomework}
                          className="px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600"
                        >
                          과제 추가
                        </button>
                      </div>
                      <div className="space-y-3 max-h-56 overflow-y-auto">
                        {homeworkForStudent.length === 0 && (
                          <p className="text-sm text-slate-400 text-center py-4">등록된 과제가 없습니다.</p>
                        )}
                        {homeworkForStudent.map((task) => (
                          <div
                            key={task.taskId}
                            className={`border rounded-lg px-4 py-3 ${task.completed ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className={`text-sm font-semibold ${task.completed ? 'text-emerald-700' : 'text-slate-900'}`}>
                                  {task.title}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                  마감일: {new Date(task.dueDate).toLocaleDateString('ko-KR')} · 등록: {new Date(task.createdAt).toLocaleDateString('ko-KR')}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleHomeworkCompleted(selectedStudent.id, task.taskId)}
                                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                                    task.completed
                                      ? 'bg-emerald-500 text-white border-transparent'
                                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                  }`}
                                >
                                  {task.completed ? '완료 취소' : '완료 처리'}
                                </button>
                                <button
                                  onClick={() => removeHomework(selectedStudent.id, task.taskId)}
                                  className="px-2 py-1 text-xs text-rose-500 border border-rose-200 rounded-full hover:bg-rose-50"
                                >
                                  삭제
                                </button>
                              </div>
                            </div>
                            {task.description && (
                              <p className="text-xs text-slate-600 mt-2 whitespace-pre-line">{task.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg text-slate-900">레벨 체크리스트</CardTitle>
                      <Award className="w-5 h-5 text-indigo-500" />
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-slate-600">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>
                            현재 레벨:{' '}
                            <span className="font-semibold text-slate-800">{levelLabels[selectedStudent.level]}</span>
                          </span>
                          <span>
                            완료 {checklistStats.completed}/{checklistStats.total}
                          </span>
                          <span>
                            다음 단계:{' '}
                            <span className="font-semibold text-indigo-600">
                              {levelLabels[resolveNextLevel(selectedStudent.level)]}
                            </span>
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full bg-indigo-500 transition-all"
                            style={{ width: `${checklistStats.percent}%` }}
                          />
                        </div>
                      </div>
                      <div className="space-y-3 max-h-44 overflow-y-auto pr-1">
                        {checklistError && (
                          <p className="text-xs text-rose-500">{checklistError}</p>
                        )}
                        {isChecklistLoading ? (
                          <p className="flex items-center gap-2 text-xs text-slate-500">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> 체크리스트를 불러오는 중입니다...
                          </p>
                        ) : checklistForStudent.length === 0 ? (
                          <p className="text-xs text-slate-400">표시할 체크리스트 항목이 없습니다.</p>
                        ) : (
                          checklistForStudent.map((item) => (
                            <label key={item.id} className="flex items-start gap-2 text-sm text-slate-600">
                              <input
                                type="checkbox"
                                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                checked={item.checked}
                                disabled={true}
                                title="레벨 체크리스트는 실제 수업 체크리스트에서 자동으로 집계됩니다"
                              />
                              <span>
                                <span className="font-medium text-slate-800">{item.label}</span>
                                {item.description && (
                                  <span className="block text-xs text-slate-500">{item.description}</span>
                                )}
                                <span className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-400">
                                  <span className="rounded-full bg-slate-100 px-2 py-0.5">
                                    {categoryLabels[item.category]}
                                  </span>
                                  <span className="rounded-full bg-slate-100 px-2 py-0.5">
                                    목표 레벨: {levelLabels[item.level]}
                                  </span>
                                </span>
                              </span>
                            </label>
                          ))
                        )}
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => selectedStudent && handleResetChecklist(selectedStudent.id)}
                        >
                          초기화
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleRecommendPromotion}
                          disabled={!canRecommendPromotion || isRecommendingPromotion || isChecklistLoading}
                        >
                          {isRecommendingPromotion ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> 승급 요청 중...
                            </span>
                          ) : (
                            '승급 제안'
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                  </>
                )}
            </HealthDialogBody>
            <HealthDialogFooter>
              <DialogClose asChild>
                <Button variant="outline">닫기</Button>
              </DialogClose>
            </HealthDialogFooter>
          </HealthDialogContent>
        </Dialog>

        <footer className="text-xs text-slate-400 text-center pt-6">
          출석과 코멘트 내역은 정산 및 리포트 생성 시 자동 연동됩니다. 필요한 경우 CSV 내보내기 및 학부모 공유 기능을 추가로 연결할 수 있습니다.
        </footer>
      </div>
    </div>
  );
}

export default withAuth(InstructorProgress, {
  requireTypes: ['instructor']
});