'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';

export default function QuizManagementPageTest() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || (user.userType !== 'superAdmin' && user.userType !== 'centerAdmin')) {
    return <div>접근 권한 없음</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">퀴즈 관리</h1>
        <p className="text-gray-600">퀴즈를 생성하고 관리합니다</p>
      </div>
    </div>
  );
}

