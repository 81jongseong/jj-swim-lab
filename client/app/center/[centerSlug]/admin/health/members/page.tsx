'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Users, Heart, Activity, Calendar, TrendingUp, Award } from 'lucide-react';
import withAuth from '@/components/withAuth';

interface HealthMember {
  _id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  age: number;
  gender: 'male' | 'female';
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  lastCheckup: Date;
  totalWorkouts: number;
  averageHeartRate: number;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  bmi: number;
  fitnessGoals: string[];
  restrictions: string[];
}

function HealthMembersPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<HealthMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadHealthMembers();
    }
  }, [user]);

  const loadHealthMembers = async () => {
    try {
      setIsLoading(true);
      // 임시 데이터
      const tempMembers: HealthMember[] = [
        {
          _id: '1',
          userId: 'user001',
          name: '김건강',
          email: 'health1@example.com',
          phone: '010-1234-5678',
          age: 35,
          gender: 'male',
          healthStatus: 'good',
          lastCheckup: new Date('2024-01-15'),
          totalWorkouts: 45,
          averageHeartRate: 72,
          bloodPressure: { systolic: 120, diastolic: 80 },
          bmi: 23.5,
          fitnessGoals: ['체중 감량', '근력 향상'],
          restrictions: ['무릎 부상 이력']
        },
        {
          _id: '2',
          userId: 'user002',
          name: '이운동',
          email: 'health2@example.com',
          phone: '010-2345-6789',
          age: 28,
          gender: 'female',
          healthStatus: 'excellent',
          lastCheckup: new Date('2024-01-10'),
          totalWorkouts: 67,
          averageHeartRate: 68,
          bloodPressure: { systolic: 110, diastolic: 70 },
          bmi: 21.2,
          fitnessGoals: ['체력 향상', '유연성 개선'],
          restrictions: []
        },
        {
          _id: '3',
          userId: 'user003',
          name: '박활동',
          email: 'health3@example.com',
          phone: '010-3456-7890',
          age: 42,
          gender: 'male',
          healthStatus: 'fair',
          lastCheckup: new Date('2024-01-05'),
          totalWorkouts: 23,
          averageHeartRate: 78,
          bloodPressure: { systolic: 130, diastolic: 85 },
          bmi: 26.8,
          fitnessGoals: ['혈압 관리', '체중 감량'],
        restrictions: ['고혈압', '당뇨 전단계']
      }
    ];
    // ⭐ 가나다순 정렬
    const sortedMembers = tempMembers.sort((a, b) => 
      a.name.localeCompare(b.name, 'ko-KR')
    );
    setMembers(sortedMembers);
    } catch (error) {
      console.error('건강 회원 데이터 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getHealthStatusLabel = (status: string) => {
    const statuses: { [key: string]: string } = {
      'excellent': '우수',
      'good': '양호',
      'fair': '보통',
      'poor': '주의'
    };
    return statuses[status] || status;
  };

  const getHealthStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'excellent': 'bg-green-100 text-green-800',
      'good': 'bg-blue-100 text-blue-800',
      'fair': 'bg-yellow-100 text-yellow-800',
      'poor': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: '저체중', color: 'text-blue-600' };
    if (bmi < 23) return { label: '정상', color: 'text-green-600' };
    if (bmi < 25) return { label: '과체중', color: 'text-yellow-600' };
    return { label: '비만', color: 'text-red-600' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">건강 회원 관리</h1>
            <p className="text-gray-600">회원들의 건강 상태와 운동 기록을 관리하세요</p>
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 회원</p>
              <p className="text-2xl font-bold text-gray-900">{members.length}명</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Heart className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">평균 심박수</p>
              <p className="text-2xl font-bold text-gray-900">
                {members.length > 0 
                  ? Math.round(members.reduce((sum, member) => sum + member.averageHeartRate, 0) / members.length)
                  : 0
                }bpm
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Activity className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 운동 횟수</p>
              <p className="text-2xl font-bold text-gray-900">
                {members.reduce((sum, member) => sum + member.totalWorkouts, 0)}회
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Award className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">우수 건강상태</p>
              <p className="text-2xl font-bold text-gray-900">
                {members.filter(member => member.healthStatus === 'excellent').length}명
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 회원 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">건강 회원 목록</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  회원
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  건강상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  BMI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  혈압
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  심박수
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  운동횟수
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  마지막 검진
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => {
                const bmiCategory = getBMICategory(member.bmi);
                return (
                  <tr key={member._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                        <div className="text-sm text-gray-500">{member.age}세, {member.gender === 'male' ? '남성' : '여성'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getHealthStatusColor(member.healthStatus)}`}>
                        {getHealthStatusLabel(member.healthStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className={`text-sm font-medium ${bmiCategory.color}`}>
                          {member.bmi.toFixed(1)}
                        </span>
                        <div className="text-xs text-gray-500">{bmiCategory.label}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.bloodPressure.systolic}/{member.bloodPressure.diastolic}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.averageHeartRate}bpm
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.totalWorkouts}회
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.lastCheckup.toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default withAuth(HealthMembersPage, { 
  requireTypes: ['centerAdmin', 'superAdmin'] 
});