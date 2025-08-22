'use client';

import { useState, useEffect } from 'react';
import withAuth from '../../../components/withAuth';

interface Student {
  _id: string;
  name: string;
  email: string;
  phone: string;
  level: string;
  progress: number;
  lastLesson: string;
  nextLesson: string;
  attendance: number;
  totalLessons: number;
  notes: string;
}

interface Class {
  _id: string;
  name: string;
  level: string;
  instructor: string;
  students: Student[];
  schedule: string;
  maxStudents: number;
}

interface ChecklistItem {
  stepName: string;
  isCompleted: boolean;
  completedAt?: string;
  tips?: string;
}

interface Checklist {
  _id: string;
  studentId: string;
  courseId: string;
  items: ChecklistItem[];
  overallProgress: number;
  createdAt: string;
  updatedAt: string;
}

function InstructorStudentsPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [checklistData, setChecklistData] = useState<Checklist | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      // 실제로는 API 호출
      const mockClasses: Class[] = [
        {
          _id: '1',
          name: '초급 자유형 A반',
          level: '초급',
          instructor: '김강사',
          maxStudents: 8,
          schedule: '월,수,금 14:00-16:00',
          students: [
            {
              _id: '1',
              name: '김수영',
              email: 'kim@example.com',
              phone: '010-1234-5678',
              level: '초급',
              progress: 60,
              lastLesson: '2025-01-20',
              nextLesson: '2025-01-22',
              attendance: 8,
              totalLessons: 10,
              notes: '호흡법에 어려움을 겪고 있음'
            },
            {
              _id: '2',
              name: '이영희',
              email: 'lee@example.com',
              phone: '010-2345-6789',
              level: '초급',
              progress: 40,
              lastLesson: '2025-01-19',
              nextLesson: '2025-01-21',
              attendance: 6,
              totalLessons: 8,
              notes: '기본 자세가 안정적임'
            }
          ]
        },
        {
          _id: '2',
          name: '중급 접영 B반',
          level: '중급',
          instructor: '김강사',
          maxStudents: 6,
          schedule: '화,목 16:00-18:00',
          students: [
            {
              _id: '3',
              name: '박철수',
              email: 'park@example.com',
              phone: '010-3456-7890',
              level: '중급',
              progress: 80,
              lastLesson: '2025-01-18',
              nextLesson: '2025-01-23',
              attendance: 12,
              totalLessons: 15,
              notes: '턴 기법에 능숙함'
            }
          ]
        }
      ];
      setClasses(mockClasses);
    } catch (error) {
      console.error('반 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (classId: string) => {
    const selected = classes.find(c => c._id === classId);
    setSelectedClass(selected || null);
    setSelectedStudent(null);
  };

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setShowEditModal(true);
  };

  const handleUpdateStudent = () => {
    if (!editingStudent) return;

    const updatedClasses = classes.map(c => ({
      ...c,
      students: c.students.map(s => 
        s._id === editingStudent._id ? editingStudent : s
      )
    }));

    setClasses(updatedClasses);
    setShowEditModal(false);
    setEditingStudent(null);
  };

  const handleGenerateChecklist = async (student: Student) => {
    try {
      console.log('🔧 체크리스트 생성:', student);
      
      // 실제로는 API 호출
      const mockChecklist: Checklist = {
        _id: '68a85b959b3caf2f85bde33a',
        studentId: student._id,
        courseId: selectedClass?._id || '',
        items: [
          {
            stepName: '기본 자세 익히기',
            isCompleted: student.progress >= 20,
            completedAt: student.progress >= 20 ? '2025-01-15' : undefined,
            tips: '어깨를 이완하고 팔을 자연스럽게 뻗으세요'
          },
          {
            stepName: '발 딛기 연습',
            isCompleted: student.progress >= 40,
            completedAt: student.progress >= 40 ? '2025-01-17' : undefined,
            tips: '무릎을 약간 구부리고 발끝으로 물을 밀어내세요'
          },
          {
            stepName: '호흡법 연습',
            isCompleted: student.progress >= 60,
            completedAt: student.progress >= 60 ? '2025-01-19' : undefined,
            tips: '고개를 돌릴 때 입을 벌려 빠르게 숨을 들이쉬세요'
          },
          {
            stepName: '기본 스트로크 연습',
            isCompleted: student.progress >= 80,
            completedAt: student.progress >= 80 ? '2025-01-20' : undefined,
            tips: '팔을 물속에서 S자로 움직이세요'
          }
        ],
        overallProgress: student.progress,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setChecklistData(mockChecklist);
      setShowChecklistModal(true);
    } catch (error) {
      console.error('체크리스트 생성 오류:', error);
      alert('체크리스트 생성 중 오류가 발생했습니다.');
    }
  };

  const handleChecklistItemUpdate = async (checklistId: string, itemIndex: number, isCompleted: boolean) => {
    try {
      if (!checklistData) return;

      const updatedItems = [...checklistData.items];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        isCompleted,
        completedAt: isCompleted ? new Date().toISOString() : undefined
      };

      const overallProgress = Math.round((updatedItems.filter(item => item.isCompleted).length / updatedItems.length) * 100);

      const updatedChecklist: Checklist = {
        ...checklistData,
        items: updatedItems,
        overallProgress,
        updatedAt: new Date().toISOString()
      };

      setChecklistData(updatedChecklist);
    } catch (error) {
      console.error('체크리스트 아이템 업데이트 오류:', error);
    }
  };

  const loadStudentChecklist = async (studentId: string, courseId: string) => {
    try {
      console.log('🔍 학생 체크리스트 로드:', { studentId, courseId });
      
      // 실제 API 호출로 변경
      const response = await fetch(`http://localhost:5000/api/checklist/student/${studentId}/course/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChecklistData(data.checklist);
      } else {
        // API에서 데이터를 가져올 수 없는 경우 null로 설정
        console.log('📋 체크리스트 데이터가 없습니다.');
        setChecklistData(null);
      }
    } catch (error) {
      console.error('체크리스트 로드 오류:', error);
      setChecklistData(null);
    }
  };

  const handleDeleteChecklist = async () => {
    if (!checklistData || !window.confirm('정말로 이 체크리스트를 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/checklist/${checklistData._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        alert('체크리스트가 성공적으로 삭제되었습니다!');
        setChecklistData(null);
        setShowChecklistModal(false);
        // 체크리스트가 삭제되었으므로 더 이상 로드하지 않음
        console.log('✅ 체크리스트 삭제 완료 - 더 이상 로드하지 않음');
      } else {
        const errorData = await response.json();
        alert(`체크리스트 삭제 실패: ${errorData.message || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('체크리스트 삭제 오류:', error);
      alert('체크리스트 삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">반 목록을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">👥 내 반 학생 관리</h1>
          <p className="text-xl text-gray-600">담당 반의 학생들을 관리하고 진도를 체크하세요</p>
        </div>

        {/* 반 선택 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            반 선택
          </label>
          <select
            value={selectedClass?._id || ''}
            onChange={(e) => handleClassChange(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">반을 선택하세요</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name} ({cls.students.length}/{cls.maxStudents}명)
              </option>
            ))}
          </select>
        </div>

        {/* 학생 목록 */}
        {selectedClass && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedClass.name} - 학생 목록 ({selectedClass.students.length}명)
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedClass.schedule} | {selectedClass.level}
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      학생명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      연락처
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      레벨
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      진행률
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      출석률
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      다음 강의
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedClass.students.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          student.level === '초급' ? 'bg-blue-100 text-blue-800' :
                          student.level === '중급' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {student.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${student.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{student.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {Math.round((student.attendance / student.totalLessons) * 100)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {student.attendance}/{student.totalLessons}회
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.nextLesson}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleStudentClick(student)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          상세보기
                        </button>
                        <button
                          onClick={() => handleEditStudent(student)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            loadStudentChecklist(student._id, selectedClass._id);
                            setShowChecklistModal(true);
                          }}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          체크리스트
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 학생 상세 정보 모달 */}
        {showStudentModal && selectedStudent && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedStudent.name} - 상세 정보
                  </h3>
                  <button
                    onClick={() => setShowStudentModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">이름</label>
                      <p className="text-sm text-gray-900">{selectedStudent.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">이메일</label>
                      <p className="text-sm text-gray-900">{selectedStudent.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">전화번호</label>
                      <p className="text-sm text-gray-900">{selectedStudent.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">레벨</label>
                      <p className="text-sm text-gray-900">{selectedStudent.level}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">메모</label>
                    <p className="text-sm text-gray-900">{selectedStudent.notes || '메모가 없습니다.'}</p>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setShowStudentModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      닫기
                    </button>
                    <button
                      onClick={() => {
                        setShowStudentModal(false);
                        handleEditStudent(selectedStudent);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      수정
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 학생 수정 모달 */}
        {showEditModal && editingStudent && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingStudent.name} - 정보 수정
                  </h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleUpdateStudent(); }} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">이름</label>
                      <input
                        type="text"
                        value={editingStudent.name}
                        onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">이메일</label>
                      <input
                        type="email"
                        value={editingStudent.email}
                        onChange={(e) => setEditingStudent({...editingStudent, email: e.target.value})}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">전화번호</label>
                      <input
                        type="tel"
                        value={editingStudent.phone}
                        onChange={(e) => setEditingStudent({...editingStudent, phone: e.target.value})}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">레벨</label>
                      <select
                        value={editingStudent.level}
                        onChange={(e) => setEditingStudent({...editingStudent, level: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="초급">초급</option>
                        <option value="중급">중급</option>
                        <option value="고급">고급</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">메모</label>
                    <textarea
                      value={editingStudent.notes || ''}
                      onChange={(e) => setEditingStudent({...editingStudent, notes: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      수정
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* 체크리스트 모달 */}
        {showChecklistModal && selectedStudent && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedStudent.name} - 체크리스트
                  </h3>
                  <button
                    onClick={() => setShowChecklistModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {checklistData ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">학생 정보</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-blue-700">이름:</span> {selectedStudent.name}
                        </div>
                        <div>
                          <span className="text-blue-700">레벨:</span> {selectedStudent.level}
                        </div>
                        <div>
                          <span className="text-blue-700">반:</span> {selectedClass?.name}
                        </div>
                        <div>
                          <span className="text-blue-700">생성일:</span> {new Date(checklistData.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">학습 단계</h4>
                      <div className="space-y-3">
                        {checklistData.items?.map((item: ChecklistItem, index: number) => (
                          <div key={index} className="p-3 bg-gray-50 rounded border">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={item.isCompleted}
                                  onChange={(e) => handleChecklistItemUpdate(checklistData._id, index, e.target.checked)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className={`text-sm font-medium ${item.isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                                  {item.stepName}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.isCompleted ? `완료: ${new Date(item.completedAt!).toLocaleDateString()}` : '미완료'}
                              </div>
                            </div>
                            {item.tips && (
                              <div className="ml-6 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                💡 {item.tips}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">전체 진행률</h4>
                      <div className="flex items-center space-x-3">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-green-600 h-3 rounded-full transition-all duration-300" 
                            style={{ width: `${checklistData.overallProgress || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-green-800">
                          {checklistData.overallProgress || 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-2">체크리스트 생성</h4>
                    <p className="text-sm text-yellow-800 mb-3">
                      이 학생을 위한 체크리스트가 아직 생성되지 않았습니다.
                    </p>
                    <div className="space-y-3">
                      <p className="text-xs text-gray-600">
                        선택된 반: {selectedClass?.name} - {selectedClass?.level}
                      </p>
                      <button
                        onClick={() => handleGenerateChecklist(selectedStudent)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        레벨별 완전 체크리스트 생성
                      </button>
                    </div>
                  </div>
                )}
                
                {/* 체크리스트가 있을 때 삭제 버튼 표시 */}
                {checklistData && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg">
                    <h4 className="font-medium text-red-900 mb-2">체크리스트 관리</h4>
                    <button
                      onClick={handleDeleteChecklist}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      체크리스트 삭제
                    </button>
                  </div>
                )}
                
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setShowChecklistModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(InstructorStudentsPage, { requireTypes: ['instructor', 'superAdmin'], requirePermission: null });


