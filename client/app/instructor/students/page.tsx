'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/utils/api';
import { motion } from 'framer-motion';
import { motionPresets } from '@/lib/motion';

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
  teachingMethodId?: string;
  stepName: string;
  stepOrder: number;
  isCompleted: boolean;
  completedAt?: string;
  category?: string;
  difficulty?: string;
  tips?: string;
  notes?: string;
  instructorNotes?: string;
  instructorComment?: string; // 강사 코멘트 추가
  commentDate?: string; // 코멘트 작성일
}

interface Checklist {
  _id: string;
  studentId: string;
  courseId: string;
  instructorId: string;
  teachingMethodId: string;
  items: ChecklistItem[];
  overallProgress: number;
  lastUpdated: string;
  startDate: string;
  targetCompletionDate?: string;
  status: 'active' | 'completed' | 'paused';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const InstructorStudentsPage = () => {
  // useAuth 제거하고 기본 상태로 변경
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  // 모달 관련 상태
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  // 체크리스트 관련 상태
  const [checklistData, setChecklistData] = useState<any>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedChecklistItem, setSelectedChecklistItem] = useState<any>(null);
  const [commentText, setCommentText] = useState('');
  
  // 레벨별 체크리스트 데이터
  const [beginnerChecklist, setBeginnerChecklist] = useState<any[]>([]);
  const [intermediateChecklist, setIntermediateChecklist] = useState<any[]>([]);
  const [advancedChecklist, setAdvancedChecklist] = useState<any[]>([]);
  
  // 센터별 레벨 데이터
  const [centerLevels, setCenterLevels] = useState<any[]>([]);
  const [currentCenterId, setCurrentCenterId] = useState<string>('');

  useEffect(() => {
    loadClasses();
  }, []);

  // 센터별 레벨 로드
  const loadCenterLevels = async (centerId: string) => {
    try {
      console.log('🔍 센터별 레벨 로드 시작:', centerId);
      const response = await apiClient.get(`/center-levels/center/${centerId}`);
      
      if (response.success) {
        setCenterLevels(response.data);
        setCurrentCenterId(centerId);
        console.log('✅ 센터별 레벨 로드 성공:', response.data);
      } else {
        console.error('❌ 센터별 레벨 로드 실패:', response.message);
      }
    } catch (error) {
      console.error('❌ 센터별 레벨 로드 중 오류:', error);
    }
  };

  const loadClasses = async () => {
    try {
      setLoading(true);
      // 실제로는 API 호출
      const mockClasses: Class[] = [
        {
          _id: '507f1f77bcf86cd799439011',
          name: '초급 자유형 A반',
          level: '초급',
          instructor: '김강사',
          maxStudents: 8,
          schedule: '월,수,금 14:00-16:00',
          students: [
            {
              _id: '507f1f77bcf86cd799439012',
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
              _id: '507f1f77bcf86cd799439013',
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
          _id: '507f1f77bcf86cd799439014',
          name: '중급 접영 B반',
          level: '중급',
          instructor: '김강사',
          maxStudents: 6,
          schedule: '화,목 16:00-18:00',
          students: [
            {
              _id: '507f1f77bcf86cd799439015',
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
      
      // 센터별 레벨 로드 (임시로 첫 번째 클래스의 센터 ID 사용)
      // 실제로는 강사의 센터 ID를 가져와야 함
      const mockCenterId = '507f1f77bcf86cd799439010'; // 임시 센터 ID
      await loadCenterLevels(mockCenterId);
      
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

  // 학생 클릭 핸들러
  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  // 학생 수정 핸들러
  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setShowEditModal(true);
  };

  // 학생 정보 업데이트
  const handleUpdateStudent = async () => {
    if (!editingStudent) return;
    
    try {
      // 학생 정보 업데이트 로직 (필요시 구현)
      console.log('학생 정보 업데이트:', editingStudent);
      setMessage('학생 정보가 업데이트되었습니다.');
      setShowEditModal(false);
      
      // 학생 목록 새로고침
      // loadStudents();
      
    } catch (error) {
      console.error('학생 정보 업데이트 실패:', error);
      setMessage('학생 정보 업데이트에 실패했습니다.');
    }
  };

  // 레벨 변환 함수
  const convertLevelToEnglish = (koreanLevel: string): string => {
    const levelMap: { [key: string]: string } = {
      '초급': 'beginner',
      '중급': 'intermediate',
      '상급': 'advanced'
    };
    return levelMap[koreanLevel] || 'beginner';
  };

  const loadTeachingMethodCheckpoints = async (level: string) => {
    try {
      console.log('🔍 강습법 체크포인트 로드:', level);
      
      // 한국어 레벨을 영어로 변환
      const englishLevel = convertLevelToEnglish(level);
      console.log('🌐 변환된 레벨:', englishLevel);
      
      // 실제 API 호출로 변경
      const response = await fetch(`http://localhost:5000/api/teaching-methods?level=${englishLevel}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 API 응답 데이터:', data);
        return data.data || [];
      } else {
        console.log('📋 강습법 데이터를 가져올 수 없습니다.');
        return [];
      }
    } catch (error) {
      console.error('강습법 로드 오류:', error);
      return [];
    }
  };

  const handleGenerateChecklist = async (student: Student) => {
    try {
      console.log('🔧 체크리스트 생성:', student);
      
      // 1. 학생 레벨에 맞는 강습법 체크포인트 가져오기
      const teachingMethods = await loadTeachingMethodCheckpoints(student.level);
      
      if (teachingMethods.length === 0) {
        alert('해당 레벨의 강습법이 설정되지 않았습니다. 최고관리자에게 문의하세요.');
        return;
      }

      // 2. 강습법을 체크리스트 아이템으로 변환 (서버에서 처리됨)
      // 클라이언트에서는 아이템을 미리 생성하지 않고 서버에 위임

      // 3. 체크리스트 생성 (서버에서 처리)
      const checklistData = {
        studentId: student._id,
        courseId: selectedClass?._id || '',
        studentLevel: student.level // 학생 레벨만 전송
      };

      // 4. 체크리스트를 서버에 저장
      const savedChecklist = await saveChecklistToServer(checklistData);
      
      if (savedChecklist) {
        // 새로 생성된 체크리스트를 상태에 설정
        setChecklistData(savedChecklist);
        setShowChecklistModal(true);
        console.log('✅ 최고관리자 강습법 기반 체크리스트 생성 및 저장 완료');
        
        // 체크리스트 데이터를 다시 로드하여 최신 상태 유지
        await loadStudentChecklist(student._id, selectedClass?._id || '');
      } else {
        alert('체크리스트 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('체크리스트 생성 오류:', error);
      alert('체크리스트 생성 중 오류가 발생했습니다.');
    }
  };

  // 체크리스트를 서버에 저장하는 함수
  const saveChecklistToServer = async (checklistData: { studentId: string; courseId: string; studentLevel: string }): Promise<Checklist | null> => {
    try {
      console.log('💾 체크리스트 서버 저장:', checklistData);
      
      const response = await fetch('http://localhost:5000/api/checklist/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId: checklistData.studentId,
          courseId: checklistData.courseId,
          studentLevel: checklistData.studentLevel
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ 체크리스트 저장 성공:', data);
        return data.checklist;
      } else {
        const errorData = await response.json();
        console.error('❌ 체크리스트 저장 실패:', errorData);
        return null;
      }
    } catch (error) {
      console.error('체크리스트 저장 오류:', error);
      return null;
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
        lastUpdated: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setChecklistData(updatedChecklist);
    } catch (error) {
      console.error('체크리스트 아이템 업데이트 오류:', error);
    }
  };

  // 체크리스트 로드
  const loadStudentChecklist = async (studentId: string, courseId: string) => {
    try {
      // 체크리스트 로드 로직 (필요시 구현)
      console.log('체크리스트 로드:', { studentId, courseId });
      
    } catch (error) {
      console.error('체크리스트 로드 실패:', error);
      setMessage('체크리스트를 불러오는데 실패했습니다.');
    }
  };

  // 강사 코멘트 추가 함수
  const handleAddComment = (index: number, item: ChecklistItem) => {
    setSelectedChecklistItem({ index, item });
    setCommentText(item.instructorComment || '');
    setShowCommentModal(true);
  };

  // 강사 코멘트 저장 함수
  const handleSaveComment = async () => {
    if (!selectedChecklistItem || !checklistData) return;

    try {
                   const updatedItems = [...checklistData.items];
             updatedItems[selectedChecklistItem.index] = {
               ...updatedItems[selectedChecklistItem.index],
               instructorNotes: commentText, // 서버 모델과 일치
               instructorComment: commentText, // 클라이언트 호환성
               commentDate: new Date().toISOString()
             };

             const updatedChecklist: Checklist = {
               ...checklistData,
               items: updatedItems,
               lastUpdated: new Date().toISOString(),
               updatedAt: new Date().toISOString()
             };

      // 서버에 업데이트된 체크리스트 저장
      const response = await fetch(`http://localhost:5000/api/checklist/${checklistData._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: updatedItems
        })
      });

      if (response.ok) {
        setChecklistData(updatedChecklist);
        setShowCommentModal(false);
        setSelectedChecklistItem(null);
        setCommentText('');
        console.log('✅ 강사 코멘트 저장 완료');
      } else {
        alert('코멘트 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('코멘트 저장 오류:', error);
      alert('코멘트 저장 중 오류가 발생했습니다.');
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

  // 페이지 로드 시 모든 레벨의 체크리스트 로드
  useEffect(() => {
    loadAllLevelChecklists();
  }, []);

  // 모든 레벨의 체크리스트 로드
  const loadAllLevelChecklists = async () => {
    try {
      setLoading(true);
      console.log('🚀 모든 레벨 체크리스트 로드 시작...');
      
      // 초급 체크리스트 로드
      console.log('🔍 초급 체크리스트 로드 시작...');
      const beginnerResponse = await apiClient.getTeachingMethods({ difficulty: 'beginner' });
      console.log('📊 초급 API 응답:', beginnerResponse);
      if (beginnerResponse.success) {
        const beginnerItems = createChecklistItems(beginnerResponse.data, 'beginner');
        setBeginnerChecklist(beginnerItems);
        console.log('✅ 초급 체크리스트 설정 완료:', beginnerItems.length);
      }
      
      // 중급 체크리스트 로드
      console.log('🔍 중급 체크리스트 로드 시작...');
      const intermediateResponse = await apiClient.getTeachingMethods({ difficulty: 'intermediate' });
      console.log('📊 중급 API 응답:', intermediateResponse);
      if (intermediateResponse.success) {
        const intermediateItems = createChecklistItems(intermediateResponse.data, 'intermediate');
        setIntermediateChecklist(intermediateItems);
        console.log('✅ 중급 체크리스트 설정 완료:', intermediateItems.length);
      }
      
      // 상급 체크리스트 로드
      console.log('🔍 상급 체크리스트 로드 시작...');
      const advancedResponse = await apiClient.getTeachingMethods({ difficulty: 'advanced' });
      console.log('📊 상급 API 응답:', advancedResponse);
      if (advancedResponse.success) {
        const advancedItems = createChecklistItems(advancedResponse.data, 'advanced');
        setAdvancedChecklist(advancedItems);
        console.log('✅ 상급 체크리스트 설정 완료:', advancedItems.length);
      }
      
      console.log('🎉 모든 레벨 체크리스트 로드 완료!');
      
    } catch (error) {
      console.error('체크리스트 로드 실패:', error);
      setMessage('체크리스트를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 체크리스트 아이템 생성 (센터별 레벨 사용)
  const createChecklistItems = (teachingMethods: any[], level: string) => {
    let allItems: any[] = [];
    
    console.log('🔍 createChecklistItems 호출:', { level, methodsCount: teachingMethods.length });
    console.log('🔍 센터별 레벨 정보:', centerLevels);
    
    teachingMethods.forEach((method, methodIndex) => {
      console.log(`📝 ${methodIndex + 1}번째 강습법 처리:`, {
        name: method.name,
        level: method.level,
        category: method.category
      });
      
      // 센터별 레벨에서 해당 레벨 찾기
      let centerLevel = centerLevels.find(cl => 
        cl.levelName === '초급' && level === 'beginner' ||
        cl.levelName === '중급' && level === 'intermediate' ||
        cl.levelName === '상급' && level === 'advanced'
      );
      
      // 센터별 레벨이 없으면 기본값 사용
      if (!centerLevel) {
        centerLevel = {
          levelName: level === 'beginner' ? '초급' : level === 'intermediate' ? '중급' : '상급',
          levelColor: level === 'beginner' ? 'bg-green-500' : level === 'intermediate' ? 'bg-yellow-500' : 'bg-orange-500'
        };
      }
      
      // 강습법 제목을 상위 체크박스로 추가
      allItems.push({
        id: `method-${method._id}`,
        stepName: method.name,
        stepOrder: methodIndex + 1,
        category: method.category || 'general',
        difficulty: centerLevel.levelName, // 센터별 레벨 이름 사용
        levelColor: centerLevel.levelColor, // 센터별 레벨 색상 사용
        tips: method.description || '',
        teachingMethodId: method._id,
        isCompleted: false,
        isMethod: true, // 강습법 제목임을 표시
        steps: [] // 하위 step들을 저장할 배열
      });
      
      // 각 강습법의 step들을 하위 체크박스로 추가
      method.steps.forEach((step: string, stepIndex: number) => {
        allItems.push({
          id: `step-${method._id}-${stepIndex}`,
          stepName: step,
          stepOrder: stepIndex + 1,
          category: method.category || 'general',
          difficulty: centerLevel.levelName, // 센터별 레벨 이름 사용
          levelColor: centerLevel.levelColor, // 센터별 레벨 색상 사용
          tips: method.tips[stepIndex] || '',
          teachingMethodId: method._id,
          isCompleted: false,
          isMethod: false, // step 항목임을 표시
          parentMethodId: method._id, // 상위 강습법 ID
          parentMethodName: method.name // 상위 강습법 이름
        });
      });
    });
    
    console.log('✅ createChecklistItems 완료:', {
      totalItems: allItems.length,
      methods: allItems.filter(item => item.isMethod).length,
      steps: allItems.filter(item => !item.isMethod).length
    });
    
    return allItems;
  };

  // 체크리스트 섹션 렌더링 (계층 구조, 센터별 레벨 색상 사용)
  const renderChecklistSection = (title: string, items: any[], level: string, color: string) => {
    if (!items || items.length === 0) return null;
    
    // 강습법과 step을 분리
    const methods = items.filter(item => item.isMethod);
    const steps = items.filter(item => !item.isMethod);
    
    // 실제 레벨을 확인하여 제목 동적 생성
    let actualLevel = title;
    let actualLevelColor = color;
    
    if (methods.length > 0) {
      const firstMethod = methods[0];
      if (firstMethod.difficulty) {
        actualLevel = firstMethod.difficulty;
        // 센터별 레벨 색상이 있으면 사용
        if (firstMethod.levelColor) {
          actualLevelColor = firstMethod.levelColor;
        }
      }
    }
    
    console.log(`🔍 ${title} 체크리스트 렌더링:`, {
      title,
      actualLevel,
      actualLevelColor,
      methodsCount: methods.length,
      firstMethodLevel: methods[0]?.difficulty,
      firstMethodColor: methods[0]?.levelColor
    });
    
    return (
      <motion.div
        key={level}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        {/* 레벨별 헤더 */}
        <div className={`flex items-center space-x-3 mb-6 p-4 rounded-lg ${actualLevelColor} bg-opacity-10 border-l-4 ${actualLevelColor.replace('bg-', 'border-')}`}>
          <div className={`w-4 h-4 rounded-full ${actualLevelColor}`}></div>
          <h3 className={`text-xl font-bold ${actualLevelColor.replace('bg-', 'text-')}`}>
            {actualLevel} 체크리스트 ({methods.length}개 강습법)
          </h3>
        </div>
        
        {/* 강습법별 체크리스트 */}
        <div className="space-y-4">
          {methods.map((method, methodIndex) => {
            // 해당 강습법의 step들 찾기
            const methodSteps = steps.filter(step => step.parentMethodId === method.teachingMethodId);
            
            // 진행 상태 계산
            const completedSteps = methodSteps.filter(step => step.isCompleted).length;
            const totalSteps = methodSteps.length;
            const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
            
            // 상위 체크박스 상태 결정
            let methodStatus = 'not-started';
            let methodStatusText = '미시작';
            let methodStatusColor = 'text-gray-500';
            let methodStatusBgColor = 'bg-gray-100';
            
            if (completedSteps === totalSteps && totalSteps > 0) {
              methodStatus = 'completed';
              methodStatusText = '완료';
              methodStatusColor = 'text-green-600';
              methodStatusBgColor = 'bg-green-100';
            } else if (completedSteps > 0) {
              methodStatus = 'in-progress';
              methodStatusText = '진행중';
              methodStatusColor = 'text-blue-600';
              methodStatusBgColor = 'bg-blue-100';
            }
            
            return (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: methodIndex * 0.1 }}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* 강습법 제목 (상위 체크박스) */}
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    {/* 상위 체크박스 상태 표시 */}
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      methodStatus === 'completed'
                        ? 'bg-green-500 border-green-500 text-white cursor-pointer'
                        : methodStatus === 'in-progress'
                        ? 'bg-blue-500 border-blue-500 text-white cursor-pointer'
                        : 'border-gray-400 text-gray-400 cursor-pointer hover:border-gray-500'
                    }`}>
                      {methodStatus === 'completed' ? '✓' : 
                       methodStatus === 'in-progress' ? '●' : ''}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className={`text-lg font-semibold ${
                        methodStatus === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'
                      }`}>
                        {method.stepName}
                      </h4>
                      {method.tips && (
                        <p className="text-sm text-gray-600 mt-1">{method.tips}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* 진행 상태 배지 */}
                      <span className={`text-xs px-2 py-1 rounded ${methodStatusColor} ${methodStatusBgColor}`}>
                        {methodStatusText}
                      </span>
                      
                      {/* 진행률 표시 */}
                      {methodStatus === 'in-progress' && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {progressPercentage}%
                        </span>
                      )}
                      
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                        {completedSteps}/{totalSteps} 단계
                      </span>
                      
                      <button
                        onClick={() => handleAddComment(0, method)}
                        className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-300 hover:border-blue-500 transition-colors"
                      >
                        💬 코멘트
                      </button>
                    </div>
                  </div>
                  
                  {/* 강사 코멘트 표시 */}
                  {method.instructorComment && (
                    <div className="mt-3 p-2 bg-blue-50 rounded border-l-2 border-blue-300">
                      <p className="text-xs text-blue-800">
                        <span className="font-medium">강사 코멘트:</span> {method.instructorComment}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Step 항목들 (하위 체크박스) */}
                {methodSteps.length > 0 && (
                  <div className="p-4 space-y-3">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">📋 학습 단계</h5>
                    {methodSteps.map((step, stepIndex) => (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: stepIndex * 0.05 }}
                        className="flex items-start space-x-3 pl-6"
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors mt-0.5 ${
                          step.isCompleted 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-gray-400 text-gray-400 hover:border-gray-500'
                        }`}>
                          {step.isCompleted ? '✓' : ''}
                        </div>
                        <div className="flex-1">
                          <span className={`text-sm ${
                            step.isCompleted ? 'line-through text-gray-500' : 'text-gray-700'
                          }`}>
                            Step {step.stepOrder}: {step.stepName}
                          </span>
                          {step.tips && (
                            <p className="text-xs text-gray-500 mt-1 ml-4">{step.tips}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleAddComment(0, step)}
                          className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-300 hover:border-blue-500 transition-colors"
                        >
                          💬
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">학생 관리</h1>
          <p className="mt-2 text-gray-600">학생들의 정보와 체크리스트를 관리하세요.</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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

            {/* 체크리스트 섹션 */}
            {selectedStudent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    📋 {selectedStudent.name}님의 체크리스트
                  </h2>
                  <p className="text-gray-600">
                    레벨별 체크리스트를 확인하고 코멘트를 추가하세요.
                  </p>
                </div>

                {/* 레벨별 체크리스트 표시 */}
                {renderChecklistSection('초급', beginnerChecklist, 'beginner', 'bg-green-500')}
                {renderChecklistSection('중급', intermediateChecklist, 'intermediate', 'bg-yellow-500')}
                {renderChecklistSection('상급', advancedChecklist, 'advanced', 'bg-red-500')}

                {/* 체크리스트가 없는 경우 */}
                {beginnerChecklist.length === 0 && 
                 intermediateChecklist.length === 0 && 
                 advancedChecklist.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📋</div>
                    <p className="text-gray-500 text-lg">체크리스트 데이터가 없습니다.</p>
                    <p className="text-gray-400 text-sm mt-2">
                      최고관리자에게 강습법 설정을 요청하세요.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
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
                        value={editingStudent.name}
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

        {/* 코멘트 모달 */}
        {showCommentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-bold mb-4">코멘트 추가</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>단계:</strong> {selectedChecklistItem?.stepName}
                </p>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="코멘트를 입력하세요..."
                  className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCommentModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveComment}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 메시지 표시 */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            {message}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InstructorStudentsPage;


