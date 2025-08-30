"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Button, Input, Card, Badge, Select } from '@/components/ui';

interface Student {
  _id: string;
  name: string;
  userId: string;
  currentLevel: string;
  enrolledAt: string;
}

interface LevelChangeHistory {
  fromLevel: string;
  toLevel: string;
  changedBy: {
    name: string;
    userId: string;
    userType: string;
  };
  reason: string;
  changedAt: string;
}

interface LevelStats {
  [key: string]: number;
}

export default function StudentLevelsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [levelHistory, setLevelHistory] = useState<LevelChangeHistory[]>([]);
  const [isLevelChangeModalOpen, setIsLevelChangeModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [newLevel, setNewLevel] = useState('');
  const [reason, setReason] = useState('');
  const [levelStats, setLevelStats] = useState<LevelStats>({});

  const isCenterAdmin = user?.userType === 'centerAdmin';
  const isSuperAdmin = user?.userType === 'superAdmin';
  const isInstructor = user?.userType === 'instructor';

  useEffect(() => {
    if (isCenterAdmin || isSuperAdmin || isInstructor) {
      fetchStudentLevels();
    }
  }, [user]);

  const fetchStudentLevels = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      let url = '';
      if (isCenterAdmin) {
        url = `http://localhost:5000/api/student-levels/center/${(user as any).centerId}/levels`;
      } else if (isSuperAdmin) {
        // 총관리자는 모든 센터 조회 가능
        url = `http://localhost:5000/api/student-levels/center/${(user as any).centerId || 'all'}/levels`;
      } else if (isInstructor) {
        // 강사는 자신이 담당하는 학생만 조회
        url = 'http://localhost:5000/api/users?userType=student';
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (isInstructor) {
          // 강사는 자신이 담당하는 학생만 필터링
          const myStudents = data.data.filter((student: any) => 
            student.instructorInfo?.assignedInstructor === user._id
          );
          setStudents(myStudents);
        } else {
          setStudents(data.data.students || data.data);
          setLevelStats(data.data.levelStats || {});
        }
      }
    } catch (error) {
      console.error('학생 레벨 정보 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLevelChange = async () => {
    if (!selectedStudent || !newLevel) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('인증 토큰이 없습니다.');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/student-levels/${selectedStudent._id}/level`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newLevel,
          reason
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert('학생 레벨이 성공적으로 변경되었습니다.');
        
        // 모달 닫기 및 상태 초기화
        setIsLevelChangeModalOpen(false);
        setSelectedStudent(null);
        setNewLevel('');
        setReason('');
        
        // 목록 새로고침
        fetchStudentLevels();
      } else {
        const errorData = await response.json();
        alert('레벨 변경에 실패했습니다: ' + (errorData.message || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('레벨 변경 중 오류:', error);
      alert('레벨 변경 중 오류가 발생했습니다.');
    }
  };

  const fetchLevelHistory = async (studentId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/student-levels/${studentId}/level-history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLevelHistory(data.data.levelHistory);
        setIsHistoryModalOpen(true);
      }
    } catch (error) {
      console.error('레벨 변경 이력 로드 실패:', error);
    }
  };

  const getLevelColor = (level: string) => {
    const colorMap: { [key: string]: string } = {
      beginner: 'bg-blue-100 text-blue-800',
      intermediate: 'bg-green-100 text-green-800',
      advanced: 'bg-yellow-100 text-yellow-800',
      expert: 'bg-red-100 text-red-800'
    };
    return colorMap[level] || 'bg-gray-100 text-gray-800';
  };

  const getLevelDisplayName = (level: string) => {
    const nameMap: { [key: string]: string } = {
      beginner: '초급',
      intermediate: '중급',
      advanced: '상급',
      expert: '전문가'
    };
    return nameMap[level] || level;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">로딩 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">학생 레벨 관리</h1>
          <p className="mt-2 text-gray-600">
            학생들의 수영 레벨을 관리하고 변경 이력을 확인합니다.
          </p>
        </div>

        {/* 레벨별 통계 */}
        {Object.keys(levelStats).length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 레벨별 학생 현황</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(levelStats).map(([level, count]) => (
                <Card key={level} className="text-center">
                  <div className="p-4">
                    <div className="text-2xl font-bold text-blue-600">{count}</div>
                    <div className="text-sm text-gray-600">{getLevelDisplayName(level)}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 학생 목록 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">👥 학생 목록</h2>
          <div className="bg-white shadow rounded-lg overflow-hidden">
                            <table className="w-full min-w-[800px] lg:min-w-[1000px] xl:min-w-[1200px] divide-y divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    학생 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    현재 레벨
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    등록일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.userId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getLevelColor(student.currentLevel)}>
                        {getLevelDisplayName(student.currentLevel)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(student.enrolledAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button
                        onClick={() => {
                          setSelectedStudent(student);
                          setNewLevel(student.currentLevel);
                          setIsLevelChangeModalOpen(true);
                        }}
                        size="sm"
                        variant="outline"
                      >
                        🎯 레벨 변경
                      </Button>
                      <Button
                        onClick={() => fetchLevelHistory(student._id)}
                        size="sm"
                        variant="outline"
                      >
                        📋 이력 보기
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {students.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              <p>등록된 학생이 없습니다.</p>
            </div>
          </div>
        )}

        {/* 레벨 변경 모달 */}
        {isLevelChangeModalOpen && selectedStudent && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    학생 레벨 변경
                  </h3>
                  <button
                    onClick={() => {
                      setIsLevelChangeModalOpen(false);
                      setSelectedStudent(null);
                      setNewLevel('');
                      setReason('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      학생 이름
                    </label>
                    <div className="text-lg font-semibold text-gray-900">{selectedStudent.name}</div>
                  </div>

                  <div>
                    <label htmlFor="newLevel" className="block text-sm font-medium text-gray-700 mb-2">
                      새로운 레벨 *
                    </label>
                    <select
                      id="newLevel"
                      value={newLevel}
                      onChange={(e) => setNewLevel(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="beginner">초급</option>
                      <option value="intermediate">중급</option>
                      <option value="advanced">상급</option>
                      <option value="expert">전문가</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                      변경 사유
                    </label>
                    <textarea
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="레벨 변경 사유를 입력하세요"
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      onClick={() => {
                        setIsLevelChangeModalOpen(false);
                        setSelectedStudent(null);
                        setNewLevel('');
                        setReason('');
                      }}
                      variant="outline"
                    >
                      취소
                    </Button>
                    <Button onClick={handleLevelChange}>
                      레벨 변경
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 레벨 변경 이력 모달 */}
        {isHistoryModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    레벨 변경 이력
                  </h3>
                  <button
                    onClick={() => setIsHistoryModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {levelHistory.length > 0 ? (
                    levelHistory.map((record, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-3">
                            <Badge className={getLevelColor(record.fromLevel)}>
                              {getLevelDisplayName(record.fromLevel)}
                            </Badge>
                            <span className="text-gray-500">→</span>
                            <Badge className={getLevelColor(record.toLevel)}>
                              {getLevelDisplayName(record.toLevel)}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(record.changedAt).toLocaleDateString('ko-KR')}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">변경자:</span> {record.changedBy.name} ({record.changedBy.userType})
                        </div>
                        {record.reason && (
                          <div className="mt-1 text-sm text-gray-600">
                            <span className="font-medium">사유:</span> {record.reason}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      레벨 변경 이력이 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
