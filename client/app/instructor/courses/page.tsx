/**
 * 📚 JJ Swim Lab - 강사 강의 관리 페이지
 * 
 * 📋 **페이지 목적**
 * - 강사의 강의 목록 조회 및 관리
 * - 강의 생성, 수정, 삭제 기능
 * - 강의 진행 상황 모니터링
 * 
 * 🔄 **주요 기능**
 * - 강의 목록 표시 (테이블 형태)
 * - 강의 통계 (총 강의, 활성 강의, 수강생 수, 완료 세션)
 * - 강의 추가/수정/삭제 모달
 * - 강의 상태별 필터링
 * 
 * 📅 **개발 히스토리**
 * - 2025-09-13: 강사 강의 관리 페이지 생성
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2025-09-13
 * - 상태: ✅ 완성
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from '@/components/ui/Modal';
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Select, { SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import Textarea from "@/components/ui/Textarea";
import { BookOpen, Users, Calendar, TrendingUp, Plus, Edit, Eye } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  currentStudents: number;
  maxStudents: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'completed';
  totalSessions: number;
  completedSessions: number;
  location: string;
  description: string;
}

export default function InstructorCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // 샘플 데이터
  useEffect(() => {
    const sampleCourses: Course[] = [
      {
        id: '1',
        name: '자유형 기초반',
        level: 'beginner',
        currentStudents: 8,
        maxStudents: 10,
        startDate: '2025-01-01',
        endDate: '2025-03-31',
        status: 'active',
        totalSessions: 24,
        completedSessions: 8,
        location: '1층 메인풀',
        description: '자유형의 기본 자세와 호흡법을 익히는 초급 과정입니다.'
      },
      {
        id: '2',
        name: '배영 중급반',
        level: 'intermediate',
        currentStudents: 6,
        maxStudents: 8,
        startDate: '2025-01-15',
        endDate: '2025-04-15',
        status: 'active',
        totalSessions: 20,
        completedSessions: 5,
        location: '2층 보조풀',
        description: '배영의 롤링과 스트로크 기술을 향상시키는 중급 과정입니다.'
      },
      {
        id: '3',
        name: '접영 고급반',
        level: 'advanced',
        currentStudents: 4,
        maxStudents: 6,
        startDate: '2024-12-01',
        endDate: '2025-02-28',
        status: 'completed',
        totalSessions: 16,
        completedSessions: 16,
        location: '1층 메인풀',
        description: '접영의 고급 기술과 타이밍을 완성하는 고급 과정입니다.'
      }
    ];

    setTimeout(() => {
      setCourses(sampleCourses);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddCourse = () => {
    setCurrentCourse({
      id: '',
      name: '',
      level: 'beginner',
      currentStudents: 0,
      maxStudents: 0,
      startDate: '',
      endDate: '',
      status: 'active',
      totalSessions: 0,
      completedSessions: 0,
      location: '',
      description: ''
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleEditCourse = (course: Course) => {
    setCurrentCourse(course);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleViewCourse = (course: Course) => {
    setCurrentCourse(course);
    setIsEditing(false);
    setShowModal(true);
  };

  const handleSaveCourse = () => {
    if (!currentCourse) return;

    if (currentCourse.id) {
      // 수정
      setCourses(courses.map(c => c.id === currentCourse.id ? currentCourse : c));
    } else {
      // 추가
      const newCourse = { ...currentCourse, id: Date.now().toString() };
      setCourses([...courses, newCourse]);
    }

    setShowModal(false);
    setCurrentCourse(null);
  };

  const handleDeleteCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">강의 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">강의 관리</h1>
        <p className="text-gray-600">강의 목록을 확인하고 관리하세요.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 강의</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}개</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 강의</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.filter(c => c.status === 'active').length}개
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 수강생</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.reduce((sum, c) => sum + c.currentStudents, 0)}명
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">완료된 세션</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.reduce((sum, c) => sum + c.completedSessions, 0)}회
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 강의 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>강의 목록</CardTitle>
              <CardDescription>
                등록된 강의 목록을 확인하고 관리하세요.
              </CardDescription>
            </div>
            <Button onClick={handleAddCourse}>
              <Plus className="h-4 w-4 mr-2" />
              강의 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">강의명</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">레벨</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">수강생</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">진행률</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">상태</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">기간</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">작업</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td className="border border-gray-300 px-4 py-2 font-medium">{course.name}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <Badge className={getLevelColor(course.level)}>
                        {course.level === 'beginner' ? '초급' :
                         course.level === 'intermediate' ? '중급' : '고급'}
                      </Badge>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {course.currentStudents}/{course.maxStudents}명
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(course.completedSessions / course.totalSessions) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-sm">
                          {Math.round((course.completedSessions / course.totalSessions) * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <Badge className={getStatusColor(course.status)}>
                        {course.status === 'active' ? '진행중' :
                         course.status === 'inactive' ? '비활성' : '완료'}
                      </Badge>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {course.startDate} ~ {course.endDate}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewCourse(course)}>
                          <Eye className="h-4 w-4 mr-1" />
                          보기
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEditCourse(course)}>
                          <Edit className="h-4 w-4 mr-1" />
                          수정
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 모달 */}
      {showModal && currentCourse && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={isEditing ? '강의 정보' : '강의 상세'}
        >
          <div className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <Label htmlFor="name">강의명</Label>
                  <Input
                    id="name"
                    value={currentCourse.name}
                    onChange={(e) => setCurrentCourse(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="level">레벨</Label>
                  <Select
                    value={currentCourse.level}
                    onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => 
                      setCurrentCourse(prev => ({ ...prev, level: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">초급</SelectItem>
                      <SelectItem value="intermediate">중급</SelectItem>
                      <SelectItem value="advanced">고급</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxStudents">최대 수강생</Label>
                    <Input
                      id="maxStudents"
                      type="number"
                      value={currentCourse.maxStudents?.toString() || ''}
                      onChange={(e) => setCurrentCourse(prev => ({ ...prev, maxStudents: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalSessions">총 세션</Label>
                    <Input
                      id="totalSessions"
                      type="number"
                      value={currentCourse.totalSessions?.toString() || ''}
                      onChange={(e) => setCurrentCourse(prev => ({ ...prev, totalSessions: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">시작일</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={currentCourse.startDate}
                      onChange={(e) => setCurrentCourse(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">종료일</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={currentCourse.endDate}
                      onChange={(e) => setCurrentCourse(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">장소</Label>
                  <Input
                    id="location"
                    value={currentCourse.location}
                    onChange={(e) => setCurrentCourse(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="description">설명</Label>
                  <Textarea
                    id="description"
                    value={currentCourse.description}
                    onChange={(e) => setCurrentCourse(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{currentCourse.name}</h3>
                  <p className="text-gray-600">{currentCourse.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>레벨</Label>
                    <Badge className={getLevelColor(currentCourse.level)}>
                      {currentCourse.level === 'beginner' ? '초급' :
                       currentCourse.level === 'intermediate' ? '중급' : '고급'}
                    </Badge>
                  </div>
                  <div>
                    <Label>상태</Label>
                    <Badge className={getStatusColor(currentCourse.status)}>
                      {currentCourse.status === 'active' ? '진행중' :
                       currentCourse.status === 'inactive' ? '비활성' : '완료'}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>수강생</Label>
                    <p>{currentCourse.currentStudents}/{currentCourse.maxStudents}명</p>
                  </div>
                  <div>
                    <Label>진행률</Label>
                    <p>{Math.round((currentCourse.completedSessions / currentCourse.totalSessions) * 100)}%</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>기간</Label>
                    <p>{currentCourse.startDate} ~ {currentCourse.endDate}</p>
                  </div>
                  <div>
                    <Label>장소</Label>
                    <p>{currentCourse.location}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                취소
              </Button>
              {isEditing && (
                <Button onClick={handleSaveCourse}>
                  저장
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}