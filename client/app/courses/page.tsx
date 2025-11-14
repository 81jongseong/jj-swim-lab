"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import apiClient from "@/utils/api";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  Users,
} from "lucide-react";
import { Button } from "@/components/Button";

interface EnrolledCourse {
  _id: string;
  name: string;
  description: string;
  level: string;
  duration: number;
  price: number;
  maxStudents: number;
  currentStudents: number;
  status: string;
  schedule: Array<{ day: string; startTime: string; endTime?: string }>;
  instructor?: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
  } | null;
  center?: {
    _id?: string;
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
  } | null;
  enrollmentStatus?: string;
  enrolledAt?: string | null;
  nextClassStart?: string | null;
  nextClassEnd?: string | null;
}

const levelLabels: Record<string, string> = {
  beginner: "초급",
  intermediate: "중급",
  advanced: "고급",
  expert: "전문",
  master: "마스터",
};

const enrollmentLabels: Record<string, string> = {
  active: "수강 중",
  completed: "수료 완료",
  dropped: "중도 취소",
  pending: "승인 대기",
};

const dayLabels: Record<string, string> = {
  monday: "월요일",
  tuesday: "화요일",
  wednesday: "수요일",
  thursday: "목요일",
  friday: "금요일",
  saturday: "토요일",
  sunday: "일요일",
};

const formatSchedule = (items: Array<{ day: string; startTime: string; endTime?: string }>) => {
  if (!items || items.length === 0) return "시간표 정보 없음";
  return items
    .map((item) => {
      const label = dayLabels[item.day?.toLowerCase?.() || item.day] || item.day;
      return `${label ?? item.day} ${item.startTime}${item.endTime ? ` - ${item.endTime}` : ""}`.trim();
    })
    .join(", ");
};

const formatDate = (value?: string | null) => {
  if (!value) return null;
  try {
    return new Date(value).toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
  } catch {
    return null;
  }
};

export default function StudentCoursesPage() {
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setError("로그인이 필요합니다. 다시 로그인해 주세요.");
      setLoading(false);
      return;
    }

    if (user.userType !== "student") {
      setError("학생 전용 페이지입니다. 다른 역할 계정에서는 접근할 수 없습니다.");
      setLoading(false);
      return;
    }

    const loadCourses = async () => {
      setLoading(true);
      setError("");

      const response = await apiClient.getMyCourses();
      if (response.success && Array.isArray(response.data)) {
        setCourses(response.data as EnrolledCourse[]);
      } else {
        setCourses([]);
        setError(response.message || response.error || "내 강습 정보를 불러오지 못했습니다.");
      }
      setLoading(false);
    };

    loadCourses();
  }, [authLoading, user]);

  const levelOptions = useMemo(() => {
    const unique = new Set<string>();
    courses.forEach((course) => {
      if (course.level) {
        unique.add(course.level);
      }
    });
    return Array.from(unique);
  }, [courses]);

  const filteredCourses = useMemo(() => {
    if (selectedLevel === "all") {
      return courses;
    }
    return courses.filter((course) => course.level === selectedLevel);
  }, [courses, selectedLevel]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-24 text-slate-600">
            <Loader2 className="h-10 w-10 animate-spin mb-4" />
            <p className="text-lg font-medium">내 강습 정보를 불러오는 중입니다...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white border border-red-100 rounded-3xl shadow-sm p-8 text-center space-y-6">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900">내 강의를 불러올 수 없습니다</h1>
              <p className="text-slate-600">{error}</p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white">
                다시 시도하기
              </Button>
              <Link href="/map" className="text-sm text-blue-600 hover:text-blue-700">
                수영센터 찾기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!filteredCourses.length) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-8 text-center space-y-6">
            <CreditCard className="h-12 w-12 text-blue-500 mx-auto" />
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900">아직 신청한 강습이 없습니다</h1>
              <p className="text-slate-600">
                관심 있는 센터와 강습을 찾아 신청해 보세요. 결제 완료 후 이곳에서 수강 중인 강습을 확인할 수 있습니다.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/map">수영센터 찾기</Link>
              </Button>
              <Link href="/payments" className="text-sm text-blue-600 hover:text-blue-700">
                결제 내역 확인하기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 space-y-8">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-slate-900">내 강의</h1>
            <p className="text-slate-600 text-sm">
              결제가 완료된 강습만 표시됩니다. 강습 일정과 상태를 확인하고, 필요시 센터에 문의하세요.
            </p>
          </div>
          {levelOptions.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600">레벨 필터</span>
              <select
                value={selectedLevel}
                onChange={(event) => setSelectedLevel(event.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">전체 레벨</option>
                {levelOptions.map((level) => (
                  <option key={level} value={level}>
                    {levelLabels[level] || level}
                  </option>
                ))}
              </select>
            </div>
          )}
        </header>

        <section className="grid grid-cols-1 gap-6">
          {filteredCourses.map((course) => {
            const enrollmentStatus = enrollmentLabels[course.enrollmentStatus ?? "active"] || course.enrollmentStatus;
            const enrolledAtText = formatDate(course.enrolledAt);
            const nextClassStart = formatDate(course.nextClassStart);

            return (
              <article
                key={course._id}
                className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 space-y-5"
              >
                <header className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">{course.name}</h2>
                      <p className="text-sm text-slate-500 mt-1">
                        {levelLabels[course.level] || course.level} · {course.duration}분 · {course.price.toLocaleString()}원
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        enrollmentStatus === "수강 중"
                          ? "bg-blue-50 text-blue-600"
                          : enrollmentStatus === "수료 완료"
                          ? "bg-green-50 text-green-600"
                          : enrollmentStatus === "중도 취소"
                          ? "bg-red-50 text-red-600"
                          : "bg-yellow-50 text-yellow-600"
                      }`}
                    >
                      {enrollmentStatus}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-sm">{course.description}</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-blue-500 mt-1" />
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase">강습 일정</p>
                      <p className="text-sm text-slate-700 leading-relaxed break-words">
                        {formatSchedule(course.schedule)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-blue-500 mt-1" />
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase">정원 현황</p>
                      <p className="text-sm text-slate-700">
                        {course.currentStudents} / {course.maxStudents}명
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-blue-500 mt-1" />
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase">수업 시간</p>
                      <p className="text-sm text-slate-700">총 {course.duration}분</p>
                      {nextClassStart && (
                        <p className="text-xs text-blue-600">다음 수업 예정일: {nextClassStart}</p>
                      )}
                    </div>
                  </div>

                  {course.center && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-blue-500 mt-1" />
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-500 uppercase">센터 정보</p>
                        <p className="text-sm text-slate-700">{course.center.name}</p>
                        {course.center.address && (
                          <p className="text-xs text-slate-500">{course.center.address}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <footer className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <CreditCard className="h-4 w-4 text-blue-500" />
                    <span>결제 금액 {course.price.toLocaleString()}원</span>
                    {enrolledAtText && (
                      <span className="text-xs text-slate-500">신청일 {enrolledAtText}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" className="text-sm">
                      <Link href="/payments">결제 내역 확인</Link>
                    </Button>
                    <Button asChild className="bg-slate-900 hover:bg-black text-white text-sm flex items-center gap-1">
                      <Link href="/map">
                        더 많은 강습 찾기
                        <CheckCircle className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </footer>
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}

