/**
 * 👨‍🏫 JJ Swim Lab - 강사관리 페이지 (백업)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';

export default function InstructorManagementPage() {
  const { user, hasUserType } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 인증 확인
    if (!hasUserType(['superAdmin'])) {
      return;
    }
    
    // 데이터 로딩 시뮬레이션
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [hasUserType]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">강사 데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">강사 관리</h1>
          <p className="text-gray-600">전체 강사의 정보, 성과, 학생 관리를 종합적으로 관리합니다.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">강사 관리 시스템</h2>
          <p className="text-gray-600">강사 관리 기능이 준비 중입니다.</p>
        </div>
      </div>
    </div>
  );
}
