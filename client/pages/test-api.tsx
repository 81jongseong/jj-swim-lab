'use client';

import { useState, useEffect } from 'react';
import apiClient from '../utils/api';

export default function TestAPI() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testEndpoints = async () => {
    setLoading(true);
    const testResults: any = {};

    try {
      // 1. 서버 상태 확인
      const healthResponse = await fetch('http://localhost:5001/health');
      testResults.health = await healthResponse.json();

      // 2. 회원가입 테스트
      const signupData = {
        userId: 'testuser',
        name: '테스트 사용자',
        email: 'test@example.com',
        password: 'password123',
        phone: '010-1234-5678',
        userType: 'member'
      };
      
      const signupResponse = await apiClient.signup(signupData);
      testResults.signup = signupResponse;

      if (signupResponse.data?.token) {
        // 3. 로그인 테스트
        const loginResponse = await apiClient.login({
          userId: 'testuser',
          password: 'password123'
        });
        testResults.login = loginResponse;

        // 4. 프로필 조회 테스트
        const profileResponse = await apiClient.getProfile();
        testResults.profile = profileResponse;

        // 5. 대시보드 테스트
        const dashboardResponse = await apiClient.getDashboard();
        testResults.dashboard = dashboardResponse;

        // 6. 강습 과정 조회 테스트
        const coursesResponse = await apiClient.getCourses();
        testResults.courses = coursesResponse;

        // 7. 공지사항 조회 테스트
        const noticesResponse = await apiClient.getNotices();
        testResults.notices = noticesResponse;

        // 8. 예약 가능 시간 조회 테스트
        const today = new Date().toISOString().split('T')[0];
        const availableSlotsResponse = await apiClient.getAvailableSlots(today);
        testResults.availableSlots = availableSlotsResponse;

      }

    } catch (error) {
      testResults.error = error;
    }

    setResults(testResults);
    setLoading(false);
  };

  const testAdminFeatures = async () => {
    setLoading(true);
    const testResults: any = {};

    try {
      // 관리자 계정으로 로그인
      const adminLoginResponse = await apiClient.login({
        userId: 'admin',
        password: 'admin123'
      });
      testResults.adminLogin = adminLoginResponse;

      if (adminLoginResponse.data?.token) {
        // 관리자 통계 조회
        const adminStatsResponse = await apiClient.getAdminStats();
        testResults.adminStats = adminStatsResponse;

        // 결제 통계 조회
        const paymentStatsResponse = await apiClient.getPaymentStats();
        testResults.paymentStats = paymentStatsResponse;

        // 공지사항 통계 조회
        const noticeStatsResponse = await apiClient.getNoticeStats();
        testResults.noticeStats = noticeStatsResponse;
      }

    } catch (error) {
      testResults.error = error;
    }

    setResults(testResults);
    setLoading(false);
  };

  const createTestData = async () => {
    setLoading(true);
    const testResults: any = {};

    try {
      // 관리자로 로그인
      await apiClient.login({
        userId: 'admin',
        password: 'admin123'
      });

      // 테스트 강습 과정 생성
      const courseData = {
        name: '초급 자유형 강습',
        description: '수영을 처음 배우는 분들을 위한 초급 과정입니다.',
        level: 'beginner',
        duration: 60,
        price: 50000,
        maxStudents: 8,
        schedule: [
          {
            day: 'monday',
            startTime: '10:00',
            endTime: '11:00'
          },
          {
            day: 'wednesday',
            startTime: '10:00',
            endTime: '11:00'
          }
        ]
      };

      const courseResponse = await apiClient.createCourse(courseData);
      testResults.createCourse = courseResponse;

      // 테스트 공지사항 생성
      const noticeData = {
        title: '수영장 이용 안내',
        content: '코로나19 예방을 위해 마스크 착용과 손 씻기를 철저히 해주세요.',
        category: 'general',
        priority: 'high',
        isPublished: true,
        tags: ['안내', '코로나19']
      };

      const noticeResponse = await apiClient.createNotice(noticeData);
      testResults.createNotice = noticeResponse;

    } catch (error) {
      testResults.error = error;
    }

    setResults(testResults);
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">API 테스트 페이지</h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testEndpoints}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '테스트 중...' : '기본 API 테스트'}
        </button>
        
        <button
          onClick={testAdminFeatures}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 ml-2"
        >
          관리자 기능 테스트
        </button>
        
        <button
          onClick={createTestData}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50 ml-2"
        >
          테스트 데이터 생성
        </button>
      </div>

      {Object.keys(results).length > 0 && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-4">테스트 결과:</h2>
          <pre className="text-sm overflow-auto max-h-96">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 