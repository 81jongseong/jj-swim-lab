/**
 * 👥 JJ Swim Lab - 사용자 관리 API 클라이언트
 * 
 * 📋 **목적**
 * - 사용자 관리 관련 API 호출을 관리하는 클라이언트
 * - 센터별 사용자 조회 및 관리 기능
 * 
 * 🔄 **주요 기능**
 * - 센터 사용자 목록 조회
 * - 사용자 상태 관리
 * - 사용자 정보 수정
 * 
 * 🔗 **연동 파일**:
 * - client/app/admin/user-management/page.tsx
 * - client/app/center-admin/members/page.tsx
 */

import { logger } from '@/lib/logger';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// 타입 정의
export interface User {
  _id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  userType: 'student' | 'instructor' | 'centerAdmin' | 'superAdmin';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // 학생 정보
  studentInfo?: {
    swimmingLevel: string;
    enrolledCenters: string[];
    emergencyContact?: string;
    healthConditions?: string[];
  };
  
  // 강사 정보
  instructorInfo?: {
    instructorLevel: string;
    assignedCenters: string[];
    specialties: string[];
    experience: number;
  };
  
  // 센터 관리자 정보
  centerAdminInfo?: {
    managedCenters: string[];
    centerName?: string;
  };
}

// 헬퍼 함수
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// 센터 사용자 조회 (센터 관리자용)
export const getCenterUsers = async (params: {
  page?: number;
  limit?: number;
  userType?: string;
  level?: string;
  search?: string;
  status?: string;
}): Promise<{
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}> => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/api/users/center-users?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    logger.error('센터 사용자 조회 실패:', error);
    throw error;
  }
};

// 사용자 상태 변경
export const updateUserStatus = async (userId: string, isActive: boolean): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isActive }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    logger.error('사용자 상태 변경 실패:', error);
    throw error;
  }
};

// 사용자 정보 수정
export const updateUser = async (userId: string, userData: Partial<User>): Promise<User> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    logger.error('사용자 정보 수정 실패:', error);
    throw error;
  }
};

export default {
  getCenterUsers,
  updateUserStatus,
  updateUser,
};



