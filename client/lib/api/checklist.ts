/**
 * 📋 JJ Swim Lab - 체크리스트 API 클라이언트
 * 
 * 📋 **목적**
 * - 체크리스트 관련 API 호출을 관리하는 클라이언트
 * - 반 체크리스트 생성, 조회, 수정 기능
 * - 학생별 진행도 관리 기능
 * 
 * 🔄 **주요 기능**
 * - 반 체크리스트 생성 및 조회
 * - 학생별 진행도 데이터 관리
 * - 체크리스트 항목 완료 상태 업데이트
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// 타입 정의
export interface Class {
  _id: string;
  name: string;
  level: string;
  type: 'group' | 'individual';
  instructor: string;
  maxStudents: number;
  currentStudents: number;
  schedule: string;
}

export interface ChecklistItem {
  _id: string;
  stepName: string;
  stepOrder: string;
  category: string;
  difficulty: string;
  tips: string;
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: Date;
  instructorMessage?: string; // 강사/센터가 추가하는 메시지
  messageUpdatedAt?: Date; // 메시지 업데이트 시간
}

export interface StudentProgress {
  _id: string;
  studentId: string;
  studentName: string;
  checklistId: string;
  completedItems: string[];
  totalItems: number;
  progressPercentage: number;
  lastUpdated: Date;
}

export interface ClassChecklist {
  _id: string;
  classId: string;
  level: string;
  items: ChecklistItem[];
  hiddenItems: string[]; // 숨겨진 항목 ID 배열
  customItems: ChecklistItem[]; // 커스텀 항목 배열
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// API 응답 타입
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 체크리스트 생성 응답 타입
interface ChecklistCreateResponse {
  success: boolean;
  message: string;
  checklist: ClassChecklist;
}

// 체크리스트 조회 응답 타입
interface ChecklistGetResponse {
  success: boolean;
  checklist: ClassChecklist;
}

// 헬퍼 함수
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

const handleApiResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

// API 함수들
export const checklistApi = {
  // 반 목록 조회
  getClasses: async (): Promise<Class[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/classes`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('API 응답:', result);
      return result.data || result || [];
    } catch (error) {
      console.error('반 목록 조회 실패:', error);
      throw error;
    }
  },

  // 반 체크리스트 생성
  createClassChecklist: async (classId: string, level: string): Promise<ClassChecklist> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/class-checklist/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ classId, level }),
      });
      
      const result = await response.json() as ChecklistCreateResponse;
      return result.checklist;
    } catch (error) {
      console.error('체크리스트 생성 실패:', error);
      throw error;
    }
  },

  // 반 체크리스트 조회
  getClassChecklist: async (classId: string): Promise<ClassChecklist | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/class-checklist/class/${classId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (response.status === 404) {
        return null;
      }
      
      const result = await response.json() as ChecklistGetResponse;
      return result.checklist || null;
    } catch (error) {
      console.error('체크리스트 조회 실패:', error);
      throw error;
    }
  },

  // 체크리스트 항목 완료 상태 업데이트
  updateChecklistItem: async (checklistId: string, itemId: string, isCompleted: boolean): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/class-checklist/${checklistId}/items/${itemId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isCompleted }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('체크리스트 항목 업데이트 실패:', error);
      throw error;
    }
  },

  // 학생별 진행도 조회
  getStudentProgress: async (classId: string): Promise<StudentProgress[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/student-progress/class/${classId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.data || result || [];
    } catch (error) {
      console.error('학생 진행도 조회 실패:', error);
      throw error;
    }
  },

  // 학생 진행도 업데이트
  updateStudentProgress: async (studentId: string, checklistId: string, completedItems: string[]): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/student-progress/${studentId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ checklistId, completedItems }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('학생 진행도 업데이트 실패:', error);
      throw error;
    }
  },

  // 체크리스트 삭제
  deleteClassChecklist: async (checklistId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/class-checklist/${checklistId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('체크리스트 삭제 실패:', error);
      throw error;
    }
  },

  // 체크리스트 항목 순서 변경
  updateChecklistItemsOrder: async (checklistId: string, items: ChecklistItem[]): Promise<ClassChecklist> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/class-checklist/${checklistId}/items`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ items }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('체크리스트 항목 순서 변경 실패:', error);
      throw error;
    }
  },

  // 체크리스트 항목에 메시지 추가
  addItemMessage: async (checklistId: string, itemId: string, message: string): Promise<ChecklistItem> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/class-checklist/${checklistId}/items/${itemId}/message`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('체크리스트 항목 메시지 추가 실패:', error);
      throw error;
    }
  },

  // 개인레슨 체크리스트 생성 (모든 레벨 항목 포함)
  createPersonalLessonChecklist: async (classId: string): Promise<ClassChecklist> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/class-checklist/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ classId, isPrivateLesson: true }),
      });
      
      const result = await response.json() as ChecklistCreateResponse;
      return result.checklist;
    } catch (error) {
      console.error('개인레슨 체크리스트 생성 실패:', error);
      throw error;
    }
  },

  // 체크리스트 항목 숨김/표시 설정
  updateHiddenItems: async (checklistId: string, hiddenItemIds: string[]): Promise<ClassChecklist> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/class-checklist/${checklistId}/hide-items`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ hiddenItemIds }),
      });
      
      const result = await response.json();
      return result.checklist;
    } catch (error) {
      console.error('체크리스트 항목 숨김 설정 실패:', error);
      throw error;
    }
  },

  // 커스텀 항목 추가
  addCustomItems: async (checklistId: string, customItems: Partial<ChecklistItem>[]): Promise<ClassChecklist> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/class-checklist/${checklistId}/custom-items`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ customItems }),
      });
      
      const result = await response.json();
      return result.checklist;
    } catch (error) {
      console.error('커스텀 항목 추가 실패:', error);
      throw error;
    }
  },

  // 체크리스트 조회 (숨겨진 항목 포함/제외 옵션)
  getClassChecklistWithOptions: async (classId: string, includeHidden: boolean = false): Promise<{
    checklist: ClassChecklist;
    totalItems: number;
    visibleItems: number;
    hiddenItems: number;
  } | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/class-checklist/class/${classId}?includeHidden=${includeHidden}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (response.status === 404) {
        return null;
      }
      
      const result = await response.json();
      return {
        checklist: result.checklist,
        totalItems: result.totalItems,
        visibleItems: result.visibleItems,
        hiddenItems: result.hiddenItems
      };
    } catch (error) {
      console.error('체크리스트 조회 실패:', error);
      throw error;
    }
  },
};

export default checklistApi;
