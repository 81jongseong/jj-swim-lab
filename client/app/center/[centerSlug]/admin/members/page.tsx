/**
 * JJ Swim Lab - 센터별 회원 관리 페이지
 * 
 * 연동 데이터
 * - GET    /api/center-admin/members             : 센터 회원 목록 조회
 * - GET    /api/center-admin/courses             : 배정 가능한 과정 목록 조회
 * - PUT    /api/center-admin/members/:id/course  : 회원 과정 배정
 * - DELETE /api/center-admin/members/:id/course/:courseId : 회원 과정 배정 해제
 * 
 * 연동 훅 및 컴포넌트
 * - useAuth (로그인 상태 및 권한 확인)
 * - useParams (현재 센터 식별자 추출)
 * - apiClient (공통 API 호출 래퍼)
 * - withAuth (센터 관리자/슈퍼 관리자 전용 보호)
 */

'use client';
import { logger } from '@/lib/logger';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import withAuth from '@/components/withAuth';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/utils/api';
import { LoadingState, ConfirmModal, ErrorState } from '@/components/common';

interface ApiListResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

type MemberStatus = 'active' | 'inactive' | 'suspended';

type AssignmentStatus = 'active' | 'completed' | 'cancelled';

interface AssignedCourse {
  courseId: string;
  courseName: string;
  instructorName?: string;
  enrollmentDate?: string | Date;
  status?: AssignmentStatus;
}

interface Member {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  userType: 'student' | 'instructor' | 'centerAdmin';
  status: MemberStatus;
  enrollmentDate?: string | Date;
  assignedCourses?: AssignedCourse[];
  studentInfo?: {
    swimmingLevel?: string;
    centerMemo?: string;
  };
  centerMemo?: string;
}

interface Course {
  _id: string;
  name: string;
  instructorName?: string;
  level?: string;
  maxStudents?: number;
  currentStudents?: number;
}

const statusLabels: Record<MemberStatus, string> = {
  active: '활성',
  inactive: '비활성',
  suspended: '정지',
};

const statusBadgeClass: Record<MemberStatus, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  suspended: 'bg-red-100 text-red-800',
};

const CenterAdminMembersPage: React.FC = () => {
  const params = useParams<{ centerSlug: string }>();
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | MemberStatus>('all');
  const [courseFilter, setCourseFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [assignmentDraft, setAssignmentDraft] = useState<Record<string, string>>({});
  const [page, setPage] = useState<number>(1);
  
  // ConfirmModal 상태
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
    variant: 'info'
  });
  const [pageSize, setPageSize] = useState<number>(20);
  const [sortKey, setSortKey] = useState<'name' | 'createdAt' | 'status' | 'courses'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const loadMembers = useCallback(async () => {
      setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<ApiListResponse<Member[]>>('/api/center-admin/members');
      if (response.success && Array.isArray(response.data)) {
        setMembers(response.data);
      } else {
        setError(response.message ?? '회원 목록을 불러오지 못했습니다.');
      }
    } catch (err) {
      logger.error('회원 목록 조회 실패:', err);
      setError('회원 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadCourses = useCallback(async () => {
    try {
      const response = await apiClient.get<ApiListResponse<Course[]>>('/api/center-admin/courses');
      if (response.success && Array.isArray(response.data)) {
        setCourses(response.data);
      }
    } catch (err) {
      logger.error('과정 목록 조회 실패:', err);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    void loadMembers();
    void loadCourses();
  }, [loadCourses, loadMembers, user]);

  const handleAssignCourse = async (memberId: string) => {
    const courseId = assignmentDraft[memberId];
    if (!courseId) {
      alert('배정할 과정을 선택하세요.');
      return;
    }

    try {
      const response = await apiClient.put<ApiListResponse<unknown>>(
        `/api/center-admin/members/${memberId}/course`,
        { courseId }
      );
      
      if (!response.success) {
        alert(response.message ?? '과정 배정에 실패했습니다.');
        return;
      }

      setAssignmentDraft((prev) => ({ ...prev, [memberId]: '' }));
      await loadMembers();
      alert('과정이 성공적으로 배정되었습니다.');
    } catch (err) {
      logger.error('과정 배정 실패:', err);
      alert('과정 배정 중 오류가 발생했습니다.');
    }
  };

  const handleUnassignCourse = async (memberId: string, courseId: string) => {
    setConfirmModal({
      isOpen: true,
      message: '해당 과정 배정을 해제하시겠습니까?',
      variant: 'warning',
      onConfirm: async () => {
        try {
          const response = await apiClient.delete<ApiListResponse<unknown>>(
            `/api/center-admin/members/${memberId}/course/${courseId}`
          );
          
          if (!response.success) {
            alert(response.message ?? '과정 배정 해제에 실패했습니다.');
            setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} });
            return;
          }

          await loadMembers();
          alert('과정 배정이 해제되었습니다.');
          setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} });
        } catch (err) {
          logger.error('과정 배정 해제 실패:', err);
          alert('과정 배정 해제 중 오류가 발생했습니다.');
        }
      }
    });
  };

  const filteredMembers = useMemo(() => {
    const result = members.filter((member) => {
      const matchesSearch = [member.name, member.email, member.phone]
        .filter(Boolean)
        .some((value) =>
          value!.toLowerCase().includes(searchTerm.trim().toLowerCase())
        );

      const matchesStatus =
        statusFilter === 'all' || member.status === statusFilter;

      const hasCourses = (member.assignedCourses?.length ?? 0) > 0;
      const matchesCourse =
        courseFilter === 'all' ||
        (courseFilter === 'assigned' && hasCourses) ||
        (courseFilter === 'unassigned' && !hasCourses);

      return matchesSearch && matchesStatus && matchesCourse;
    });
    // 정렬
    const sorted = [...result].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'name') {
        return (a.name || '').localeCompare(b.name || '') * dir;
      }
      if (sortKey === 'status') {
        return (a.status || '').localeCompare(b.status || '') * dir;
      }
      if (sortKey === 'courses') {
        const ac = a.assignedCourses?.length ?? 0;
        const bc = b.assignedCourses?.length ?? 0;
        return (ac - bc) * dir;
      }
      // createdAt: 최신순 기본
      const aCreated = (a as any).createdAt ? new Date((a as any).createdAt).getTime() : 0;
      const bCreated = (b as any).createdAt ? new Date((b as any).createdAt).getTime() : 0;
      return (aCreated - bCreated) * dir;
    });
    return sorted;
  }, [courseFilter, members, searchTerm, sortDir, sortKey, statusFilter]);

  const pagedMembers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, page, pageSize]);

  const stats = useMemo(() => {
    const total = members.length;
    const active = members.filter(m => m.status === 'active').length;
    const inactive = members.filter(m => m.status === 'inactive').length;
    const suspended = members.filter(m => m.status === 'suspended').length;
    const assigned = members.filter(m => (m.assignedCourses?.length ?? 0) > 0).length;
    const unassigned = total - assigned;
    return { total, active, inactive, suspended, assigned, unassigned };
  }, [members]);

  if (isLoading) {
    return <LoadingState message="회원 정보를 불러오는 중입니다…" size="lg" fullScreen />;
  }

  const centerSlug = params?.centerSlug ?? '센터';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4">
        <header>
          <h1 className="text-3xl font-semibold text-gray-900">{centerSlug} 회원 관리</h1>
          <p className="mt-2 text-sm text-gray-600">
            회원 목록을 조회하고 과정 배정 현황을 관리할 수 있습니다.
          </p>
        </header>

        {/* 요약 카드 */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-gray-500">전체 회원</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">{stats.total}</div>
        </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-gray-500">활성</div>
            <div className="mt-1 text-2xl font-semibold text-emerald-700">{stats.active}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-gray-500">비활성</div>
            <div className="mt-1 text-2xl font-semibold text-gray-700">{stats.inactive}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-gray-500">정지</div>
            <div className="mt-1 text-2xl font-semibold text-red-700">{stats.suspended}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-gray-500">배정됨</div>
            <div className="mt-1 text-2xl font-semibold text-blue-700">{stats.assigned}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-gray-500">미배정</div>
            <div className="mt-1 text-2xl font-semibold text-amber-700">{stats.unassigned}</div>
          </div>
        </section>

        {error && (
          <ErrorState 
            message={error}
            onRetry={loadMembers}
            retryText="다시 시도"
            className="mb-4"
          />
        )}

        <section className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-end md:justify-between sticky top-0 z-10">
          <div className="flex flex-1 flex-col gap-3 md:flex-row">
            <div className="flex flex-1 flex-col gap-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="member-search">
                검색 (이름, 이메일, 연락처)
              </label>
                <input
                id="member-search"
                  type="text"
                  value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="홍길동 / hong@example.com"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="status-filter">
                상태 필터
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="all">전체 상태</option>
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
                <option value="suspended">정지</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="course-filter">
                과정 배정 여부
              </label>
              <select
                id="course-filter"
                value={courseFilter}
                onChange={(event) => setCourseFilter(event.target.value as typeof courseFilter)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="all">전체</option>
                <option value="assigned">배정됨</option>
                <option value="unassigned">미배정</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="sort-key">
                정렬
              </label>
              <div className="flex items-center gap-2">
                <select
                  id="sort-key"
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as typeof sortKey)}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="createdAt">최근 가입</option>
                  <option value="name">이름</option>
                  <option value="status">상태</option>
                  <option value="courses">배정 코스 수</option>
                </select>
                            <button
                  type="button"
                  onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50"
                  aria-label="정렬 방향 전환"
                >
                  {sortDir === 'asc' ? '오름차순' : '내림차순'}
                            </button>
                          </div>
                        </div>
                    </div>
                <button
            type="button"
            onClick={() => void loadMembers()}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
            새로 고침
                </button>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">회원 정보</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">상태</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">배정 과정</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">메모</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">코스 배정</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                      조건에 맞는 회원이 없습니다.
                    </td>
                  </tr>
                )}

                {pagedMembers.map((member) => {
                  const assigned = member.assignedCourses ?? [];
                  const selectedCourseId = assignmentDraft[member._id] ?? '';

                  return (
                    <tr key={member._id} className="align-top">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-xs text-gray-500">{member.email}</div>
                        {member.phone && (
                          <div className="text-xs text-gray-500">{member.phone}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusBadgeClass[member.status]}`}
                        >
                          {statusLabels[member.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {assigned.length === 0 ? (
                          <span className="text-xs text-gray-500">배정된 과정이 없습니다.</span>
                        ) : (
                          <ul className="flex flex-col gap-1 text-xs text-gray-700">
                            {assigned.map((course) => (
                              <li key={course.courseId} className="flex items-center justify-between gap-2 rounded border border-gray-200 px-2 py-1">
                                <span>
                                  <span className="font-medium">{course.courseName}</span>
                                  {course.instructorName && (
                                    <span className="ml-1 text-gray-500">(강사: {course.instructorName})</span>
                )}
                                </span>
                <button
                                  type="button"
                                  onClick={() => void handleUnassignCourse(member._id, course.courseId)}
                                  className="text-xs font-semibold text-red-600 hover:text-red-700"
                >
                                  해제
                </button>
                              </li>
                            ))}
                          </ul>
        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-600 whitespace-pre-line">
                          {member.centerMemo ?? member.studentInfo?.centerMemo ?? '등록된 메모가 없습니다.'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          <select
                            value={selectedCourseId}
                            onChange={(event) =>
                              setAssignmentDraft((prev) => ({
                                ...prev,
                                [member._id]: event.target.value,
                              }))
                            }
                            className="rounded-md border border-gray-300 px-3 py-2 text-xs shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                          >
                            <option value="">과정을 선택하세요</option>
                            {courses.map((course) => (
                              <option key={course._id} value={course._id}>
                                {course.name}
                              </option>
                            ))}
                          </select>
                <button
                            type="button"
                            onClick={() => void handleAssignCourse(member._id)}
                            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                            disabled={!selectedCourseId}
                          >
                            과정 배정
                </button>
              </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
                      </div>
          {/* 페이지네이션 */}
          <div className="flex items-center justify-between border-t border-gray-200 p-3 text-sm">
            <div className="text-gray-600">
              총 {filteredMembers.length}명 · {page} / {Math.max(1, Math.ceil(filteredMembers.length / pageSize))} 페이지
                    </div>
            <div className="flex items-center gap-2">
              <label className="text-gray-600" htmlFor="page-size">페이지당</label>
              <select
                id="page-size"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-md border border-gray-300 px-2 py-1"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <div className="ml-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-md border border-gray-300 px-3 py-1 text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  이전
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const max = Math.max(1, Math.ceil(filteredMembers.length / pageSize));
                    setPage((p) => Math.min(max, p + 1));
                  }}
                  disabled={page >= Math.ceil(filteredMembers.length / pageSize)}
                  className="rounded-md border border-gray-300 px-3 py-1 text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  다음
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ConfirmModal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} })}
        onConfirm={confirmModal.onConfirm}
        message={confirmModal.message}
        variant={confirmModal.variant || 'info'}
        title="확인"
        confirmText="확인"
        cancelText="취소"
      />
    </div>
  );
};

export default withAuth(CenterAdminMembersPage, { roles: ['centerAdmin', 'superAdmin'] });

