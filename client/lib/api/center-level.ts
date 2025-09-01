import { handleApiResponse } from './utils';

export interface CenterLevel {
  _id: string;
  centerId: string;
  levels: {
    name: string;
    order: number;
    description?: string;
    color?: string;
  }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CenterLevelUpdateRequest {
  levels: {
    name: string;
    order: number;
    description?: string;
    color?: string;
  }[];
}

// 센터별 레벨 설정 조회
export const getCenterLevels = async (centerId: string): Promise<CenterLevel> => {
  try {
    console.log('🔍 API 호출:', `/api/center-levels/${centerId}`);
    
    const response = await fetch(`/api/center-levels/${centerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    console.log('📡 API 응답 상태:', response.status);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('센터별 레벨 설정을 찾을 수 없습니다. 새로 생성해주세요.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ API 응답 데이터:', data);
    
    return data;
  } catch (error) {
    console.error('❌ getCenterLevels 에러:', error);
    throw error;
  }
};

// 센터별 레벨 설정 업데이트
export const updateCenterLevels = async (
  centerId: string, 
  data: CenterLevelUpdateRequest
): Promise<CenterLevel> => {
  const response = await fetch(`/api/center-levels/${centerId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  });
  
  return handleApiResponse<CenterLevel>(response);
};

// 센터별 레벨 설정 삭제 (비활성화)
export const deleteCenterLevels = async (centerId: string): Promise<{ message: string }> => {
  const response = await fetch(`/api/center-levels/${centerId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return handleApiResponse<{ message: string }>(response);
};
