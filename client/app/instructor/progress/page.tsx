'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import withAuth from '@/components/withAuth';
import {
  CalendarDays,
  ClipboardList,
  PenSquare,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MessageCircle,
  Target,
  CalendarCheck,
  BookOpen,
  Loader2
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

const attendancePalette: Record<AttendanceStatus, { label: string; bg: string; text: string }> = {
  present: { label: '출석', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  late: { label: '지각', bg: 'bg-amber-100', text: 'text-amber-700' },
  absent: { label: '결석', bg: 'bg-rose-100', text: 'text-rose-700' }
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
  const [weekAnchor, setWeekAnchor] = useState<Date>(() => getWeekStart(new Date()));
  const [noteDraft, setNoteDraft] = useState<string>('');
  const [selectedSessionForNote, setSelectedSessionForNote] = useState<string | 'all'>('all');
  const [homeworkDraft, setHomeworkDraft] = useState({ title: '', description: '', dueDate: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isStudentsLoading, setIsStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
 
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

  const weekDates = useMemo(() => {
    const start = getWeekStart(addDays(weekAnchor, weekOffset));
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }, [weekAnchor, weekOffset]);

  const sessionsThisWeek = useMemo(() => {
    if (!selectedStudent) return [];
    return selectedStudent.sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      const start = weekDates[0];
      const end = addDays(start, 6);
      return sessionDate >= start && sessionDate <= end;
    });
  }, [selectedStudent, weekDates]);

  const weeklyAttendanceStats = useMemo(() => {
    if (sessionsThisWeek.length === 0) {
      return { present: 0, late: 0, absent: 0, rate: 0 };
    }
    const counts = { present: 0, late: 0, absent: 0 } as Record<AttendanceStatus, number>;
    sessionsThisWeek.forEach((session) => {
      const status = attendance[session.id] ?? 'absent';
      counts[status] += 1;
    });
    const attended = counts.present + counts.late;
    const rate = Math.round((attended / sessionsThisWeek.length) * 100);
    return { ...counts, rate };
  }, [sessionsThisWeek, attendance]);

  const handleWeekChange = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      setWeekAnchor(getWeekStart(new Date()));
      setWeekOffset(0);
      return;
    }
    const delta = direction === 'prev' ? -1 : 1;
    setWeekOffset((prev) => prev + delta);
  };

  const handleAttendanceChange = (sessionId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [sessionId]: status }));
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
        }))
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">레슨 진행 · 출석 관리</h1>
          <p className="text-gray-600">
            출석, 코멘트, 과제를 한 번에 관리하고 주간 진행 상황을 추적하세요. 정산 자료도 출석 데이터를 기반으로 자동 집계할 수 있습니다.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">이번 주 출석률</CardTitle>
              <CalendarCheck className="w-5 h-5 text-sky-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-slate-900">{weeklyAttendanceStats.rate}%</div>
              <div className="grid grid-cols-3 gap-2 text-xs text-slate-600 mt-4">
                <span>출석 {weeklyAttendanceStats.present}회</span>
                <span>지각 {weeklyAttendanceStats.late}회</span>
                <span>결석 {weeklyAttendanceStats.absent}회</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">담당 학생</CardTitle>
              <Users className="w-5 h-5 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-slate-900">{students.length}명</div>
              <p className="text-xs text-slate-500 mt-4">
                출석 관리와 코멘트를 기록하면 정산 리포트에 자동 반영됩니다.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">미완료 과제</CardTitle>
              <ClipboardList className="w-5 h-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-slate-900">
                {homeworkForStudent.filter((task) => !task.completed).length}건
              </div>
              <p className="text-xs text-slate-500 mt-4">
                과제를 완료 처리하면 학부모/학생 보고서에도 반영됩니다.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">코치 코멘트</CardTitle>
              <MessageCircle className="w-5 h-5 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-slate-900">{notesForStudent.length}건</div>
              <p className="text-xs text-slate-500 mt-4">
                코멘트는 학생별 히스토리와 레슨 리포트에서 확인할 수 있습니다.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-slate-900">담당 학생</h2>
              <p className="text-sm text-slate-500">카드를 클릭하면 레슨 진행 · 출석 관리 팝업이 열립니다.</p>
            </div>
            <BookOpen className="w-6 h-6 text-slate-400" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {students.map((student) => (
              <Card
                key={student.id}
                className="border-slate-200 cursor-pointer transition hover:border-sky-400 hover:shadow"
                onClick={() => {
                  setSelectedStudentId(student.id);
                  setWeekAnchor(getWeekStart(new Date()));
                  setWeekOffset(0);
                  setDialogOpen(true);
                }}
              >
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-slate-900">{student.name}</CardTitle>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${levelBadges[student.level]}`}>
                      {levelLabels[student.level]}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{student.courseName}</p>
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
                        {student.personalLesson && <span>개인레슨</span>}
                        <span>이번 주 세션 {sessionsThisWeek}회</span>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            ))}
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
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleWeekChange('prev')}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        weekOffset < 0
                          ? 'border-sky-400 bg-sky-50 text-sky-600'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      이전 주
                    </button>
                    <button
                      onClick={() => handleWeekChange('today')}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        weekOffset === 0
                          ? 'border-sky-500 bg-sky-100 text-sky-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      이번 주
                    </button>
                    <button
                      onClick={() => handleWeekChange('next')}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        weekOffset > 0
                          ? 'border-sky-400 bg-sky-50 text-sky-600'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      다음 주
                    </button>
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
                      {sessionsThisWeek.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                            해당 주간에 예정된 레슨이 없습니다.
                          </td>
                        </tr>
                      )}
                      {sessionsThisWeek.map((session) => {
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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