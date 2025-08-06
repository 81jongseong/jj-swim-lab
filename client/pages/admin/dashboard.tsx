import { useState, useEffect } from 'react';
import apiClient from '../../utils/api';
import { LoadingSpinner } from '../../components/ui';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInstructors: 0,
    totalMembers: 0,
    totalCourses: 0,
    totalBookings: 0,
    totalPayments: 0,
    totalNotices: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getAdminStats();
        
        if (response.data) {
          setStats({
            totalUsers: response.data.totalUsers || 0,
            totalInstructors: response.data.totalInstructors || 0,
            totalMembers: response.data.totalMembers || 0,
            totalCourses: response.data.totalCourses || 0,
            totalBookings: response.data.totalBookings || 0,
            totalPayments: response.data.totalPayments || 0,
            totalNotices: response.data.totalNotices || 0,
          });
        } else if (response.error) {
          setError(response.error);
        }
      } catch (err) {
        setError('통계를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
                      <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <LoadingSpinner size="lg" className="mx-auto" />
                <p className="mt-4 text-gray-600">로딩 중...</p>
              </div>
            </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <>
            {/* Page Title */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">관리자 대시보드</h1>
              <p className="text-gray-600">JJ Swim Lab 관리 시스템의 전체 현황을 확인하세요</p>
            </div>

            {/* Simple Stats */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <span className="text-lg mr-4">👥</span>
                <span className="text-gray-900 font-medium">전체 사용자:</span>
                <span className="ml-2 text-gray-900 underline">{(stats.totalUsers || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center">
                <span className="text-lg mr-4">👨‍🏫</span>
                <span className="text-gray-900 font-medium">강사:</span>
                <span className="ml-2 text-gray-900 underline">{(stats.totalInstructors || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center">
                <span className="text-lg mr-4">👤</span>
                <span className="text-gray-900 font-medium">회원:</span>
                <span className="ml-2 text-gray-900 underline">{(stats.totalMembers || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center">
                <span className="text-lg mr-4">📚</span>
                <span className="text-gray-900 font-medium">강습 과정:</span>
                <span className="ml-2 text-gray-900 underline">{(stats.totalCourses || 0).toLocaleString()}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 