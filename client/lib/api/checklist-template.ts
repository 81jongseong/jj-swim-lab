/**
 * 📋 JJ Swim Lab - 체크리스트 템플릿 API 클라이언트
 * 
 * 📋 **목적**
 * - 체크리스트 템플릿 관련 API 호출을 관리하는 클라이언트
 * - 템플릿 생성, 조회, 수정, 삭제 기능
 * 
 * 🔄 **주요 기능**
 * - 템플릿 목록 조회
 * - 템플릿 생성/수정/삭제
 * - 템플릿 상세 조회
 * 
 * 🔗 **연동 파일**:
 * - client/app/admin/checklist-template/page.tsx
 */

import { logger } from '@/lib/logger';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// 타입 정의
export interface ChecklistTemplateItem {
  _id?: string;
  stepName: string;
  stepOrder: number;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tips?: string;
  teachingMethodId?: string;
  isRequired?: boolean;
  prerequisites?: string[];
  healthRestrictions?: string[];
  alternativeSteps?: string[];
}

export interface ChecklistTemplate {
  _id: string;
  name: string;
  description?: string;
  creatorId: string;
  creatorType: 'center' | 'instructor';
  centerId?: string;
  levels: string[];
  items: ChecklistTemplateItem[];
  isActive: boolean;
  isPublic: boolean;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// 헬퍼 함수
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// API 함수들
export const checklistTemplateApi = {
  // 템플릿 목록 조회
  getTemplates: async (): Promise<ChecklistTemplate[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/checklist-template`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.templates || [];
    } catch (error) {
      logger.error('템플릿 목록 조회 실패:', error);
      throw error;
    }
  },

  // 템플릿 상세 조회
  getTemplate: async (templateId: string): Promise<ChecklistTemplate> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/checklist-template/${templateId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.template;
    } catch (error) {
      logger.error('템플릿 조회 실패:', error);
      throw error;
    }
  },

  // 템플릿 생성
  createTemplate: async (template: Partial<ChecklistTemplate>): Promise<ChecklistTemplate> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/checklist-template`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(template),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.template;
    } catch (error) {
      logger.error('템플릿 생성 실패:', error);
      throw error;
    }
  },

  // 템플릿 수정
  updateTemplate: async (templateId: string, template: Partial<ChecklistTemplate>): Promise<ChecklistTemplate> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/checklist-template/${templateId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(template),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.template;
    } catch (error) {
      logger.error('템플릿 수정 실패:', error);
      throw error;
    }
  },

  // 템플릿 삭제 (비활성화)
  deleteTemplate: async (templateId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/checklist-template/${templateId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      logger.error('템플릿 삭제 실패:', error);
      throw error;
    }
  },
};

export default checklistTemplateApi;



