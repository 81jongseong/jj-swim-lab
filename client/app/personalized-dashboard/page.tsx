'use client';

import { useState } from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import withAuth from '@/components/withAuth';

function PersonalizedDashboardPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">개인화 대시보드</h1>
        <p className="text-gray-600 mt-2">사용자 맞춤형 대시보드를 설정하고 관리합니다.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>진도 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">전체 강습 진도 및 성취도를 확인할 수 있습니다.</p>
            <div className="mt-4">
              <div className="bg-blue-100 p-4 rounded">
                <p className="text-blue-800">진도율: 75%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">최근 강습 및 활동 내역입니다.</p>
            <div className="mt-4 space-y-2">
              <div className="bg-gray-100 p-2 rounded">
                <p className="text-sm">강습 완료: 자유형 기초</p>
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <p className="text-sm">비디오 업로드: 배영 연습</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>성취도</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">학습 성취도 및 목표 달성률입니다.</p>
            <div className="mt-4">
              <div className="bg-green-100 p-4 rounded">
                <p className="text-green-800">목표 달성률: 80%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>대시보드 설정</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">개인화 설정을 통해 대시보드를 커스터마이징할 수 있습니다.</p>
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  진도 현황 표시
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  최근 활동 표시
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  성취도 표시
                </label>
              </div>
            </div>
            <div className="mt-6">
              <Button onClick={() => alert('설정이 저장되었습니다.')}>
                설정 저장
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(PersonalizedDashboardPage);
