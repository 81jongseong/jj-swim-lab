/**
 * 🏢 JJ Swim Lab - 센터 선택 드롭다운 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 강사/회원이 여러 센터에서 활동할 때 센터를 선택하는 드롭다운
 * - 선택한 센터에 따라 데이터 필터링
 * 
 * 🔄 **주요 기능**
 * - 센터 목록 표시 및 선택
 * - 선택한 센터 정보 제공
 * - 센터 정보 로딩 상태 관리
 * 
 * 🗄️ **데이터 연동**
 * - useAuth 훅의 user 정보 (assignedCenters 또는 enrolledCenters)
 * - /api/center-management/:id API (센터 정보 조회)
 * 
 * 🛠️ **필요한 설치 파일**
 * - React 18.3.1
 * - TypeScript 5.x
 * - useAuth 훅
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';

interface Center {
  _id: string;
  name: string;
  address?: string;
}

interface CenterSelectorProps {
  /** 선택된 센터 ID */
  selectedCenterId: string | null;
  /** 센터 선택 변경 핸들러 */
  onCenterChange: (centerId: string | null) => void;
  /** 추가 클래스명 */
  className?: string;
  /** "전체 센터" 옵션 표시 여부 */
  showAllOption?: boolean;
}

export default function CenterSelector({
  selectedCenterId,
  onCenterChange,
  className = '',
  showAllOption = true
}: CenterSelectorProps) {
  const { user } = useAuth();
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCenters();
  }, [user]);

  const loadCenters = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const centerIds: string[] = [];

      // 강사인 경우
      if (user.userType === 'instructor' && user.instructorInfo?.assignedCenters) {
        centerIds.push(...user.instructorInfo.assignedCenters);
      }
      // 회원인 경우
      else if (user.userType === 'student' && user.studentInfo?.enrolledCenters) {
        centerIds.push(...user.studentInfo.enrolledCenters);
      }

      if (centerIds.length === 0) {
        setCenters([]);
        setLoading(false);
        return;
      }

      // 센터 정보 조회
      const centerPromises = centerIds.map(async (centerId) => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:5000/api/center-management/${centerId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              return {
                _id: data.data._id || centerId,
                name: data.data.name || '센터 이름 없음',
                address: data.data.address
              };
            }
          }
        } catch (error) {
          logger.error(`센터 ${centerId} 정보 조회 실패:`, error);
        }
        // 실패 시 기본값 반환
        return {
          _id: centerId,
          name: `센터 ${centerId}`,
          address: undefined
        };
      });

      const centerData = await Promise.all(centerPromises);
      setCenters(centerData.filter(Boolean));
    } catch (error) {
      logger.error('센터 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 센터가 1개 이하면 드롭다운 숨김
  if (loading) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        센터 정보 로딩 중...
      </div>
    );
  }

  if (centers.length <= 1) {
    return null; // 센터가 1개 이하면 드롭다운 표시 안 함
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
        센터:
      </label>
      <select
        value={selectedCenterId || 'all'}
        onChange={(e) => {
          const value = e.target.value;
          onCenterChange(value === 'all' ? null : value);
        }}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      >
        {showAllOption && (
          <option value="all">전체 센터</option>
        )}
        {centers.map((center) => (
          <option key={center._id} value={center._id}>
            {center.name}
          </option>
        ))}
      </select>
    </div>
  );
}

