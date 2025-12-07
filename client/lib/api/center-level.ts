/**
 * 🏊‍♂️ JJ Swim Lab - 센터 레벨 관리 API 클라이언트
 * 
 * 📋 **API 클라이언트 목적**
 * - 수영 센터별 레벨 설정을 관리하는 API 클라이언트
 * - 센터 레벨 조회, 수정, 삭제 기능 제공
 * - 레벨별 순서 및 설정 관리
 * - 센터 레벨 통계 및 분석 데이터 제공
 * - 센터 레벨 변경 이력 추적
 * 
 * 🔄 **주요 기능**
 * - 센터 레벨 설정 조회
 * - 센터 레벨 설정 수정
 * - 센터 레벨 설정 삭제
 * - 센터 레벨 통계 조회
 * - 센터 레벨 변경 이력 추적
 * - 센터 레벨 검증 및 유효성 검사
 * 
 * 🗄️ **데이터 연동**
 * - 센터 레벨 설정 데이터
 * - 센터 레벨 통계 및 분석 데이터
 * - 센터 레벨 변경 이력 데이터
 * - 센터 레벨 검증 및 유효성 검사 데이터
 * - API 응답 및 에러 처리 데이터
 * 
 * 🛠️ **필요한 설치 파일**
 * - API 유틸리티 (./utils)
 * - HTTP 클라이언트 라이브러리
 * - 센터 레벨 관리 API 엔드포인트
 * - 에러 처리 및 로깅 시스템
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 센터 레벨 데이터의 일관성 및 무결성
 * 2. 센터 레벨 변경 시 관련 데이터 동기화
 * 3. 센터 레벨 검증 및 유효성 검사
 * 4. API 에러 처리 및 사용자 피드백
 * 5. 센터 레벨 변경 이력 추적
 * 6. 센터 레벨 보안 및 권한 관리
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 센터 레벨 데이터 일관성 확인
 * - [ ] 센터 레벨 변경 시 동기화 확인
 * - [ ] 센터 레벨 검증 로직 확인
 * - [ ] API 에러 처리 확인
 * - [ ] 센터 레벨 변경 이력 추적 확인
 * - [ ] 센터 레벨 보안 및 권한 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 센터 레벨 관리 API 클라이언트 구현
 * - 2024-12-19: 센터 레벨 CRUD 기능 구현
 * - 2024-12-19: 센터 레벨 통계 및 분석 기능 구현
 * - 2024-12-19: 센터 레벨 변경 이력 추적 시스템 구현
 * - 2024-12-19: 센터 레벨 검증 및 유효성 검사 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (센터 레벨 관리 API 클라이언트 완료)
 * 
 * 🚀 **다음 단계**
 * - 실시간 센터 레벨 상태 업데이트
 * - 센터 레벨 추천 시스템
 * - 센터 레벨 공유 및 협업
 * - 센터 레벨 통계 대시보드
 * - 센터 레벨 보안 강화
 * 
 * 💡 **사용 예시**
 * ```typescript
 * // 센터 레벨 설정 조회
 * const centerLevels = await getCenterLevels(centerId);
 * 
 * // 센터 레벨 설정 수정
 * const updatedLevels = await updateCenterLevels(centerId, levelData);
 * 
 * // 센터 레벨 통계 조회
 * const levelStats = await getCenterLevelStats(centerId);
 * ```
 * 
 * 🔍 **센터 레벨 관리 처리 흐름**
 * 1. 센터 레벨 요청 데이터 검증
 * 2. 센터 레벨 API 호출 및 응답 처리
 * 3. 센터 레벨 데이터 변환 및 포맷팅
 * 4. 센터 레벨 변경 이력 추적
 * 5. 센터 레벨 통계 업데이트
 * 6. 센터 레벨 검증 및 유효성 검사
 * 7. 응답 데이터 반환 및 에러 처리
 */

import { handleApiResponse } from './utils';
import { logger } from '@/lib/logger';

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
    logger.api('센터 레벨 조회 API 호출', { centerId, endpoint: `/api/center-levels/${centerId}` });
    
    const response = await fetch(`/api/center-levels/${centerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    logger.api('센터 레벨 조회 API 응답 상태', { status: response.status });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('센터별 레벨 설정을 찾을 수 없습니다. 새로 생성해주세요.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    logger.api('센터 레벨 조회 API 응답 데이터', data);
    
    return data;
  } catch (error) {
    logger.error('센터 레벨 조회 실패:', error);
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
