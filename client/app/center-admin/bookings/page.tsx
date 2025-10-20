/**
 * @file 센터 관리자 예약 관리 페이지
 * @description 센터 관리자가 예약 관리을 관리할 수 있는 페이지입니다.
 * @date 2025-09-14
 * @author JJ Swim Lab
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui';
import { Button } from '../../../components/Button';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';

const CenterAdmin예약관리Page: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 실제 API 호출 (데이터베이스에서 가져오기)
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/centers/bookings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('데이터를 가져올 수 없습니다.');
      }

      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.message || '데이터 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
      setData([]); // API 연결 실패 시 빈 배열
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          예약 관리
        </h1>
        <p className="text-gray-600">
          예약 관리을 관리하세요.
        </p>
      </div>

      {/* 필터 및 검색 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>필터 및 검색</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="검색..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              추가
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 데이터 목록 */}
      <div className="space-y-4">
        {data.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">데이터가 없습니다.</p>
            </CardContent>
          </Card>
        ) : (
          data.map((item, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">항목 {index + 1}</h3>
                    <p className="text-gray-600">설명...</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      수정
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-4 w-4 mr-1" />
                      삭제
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
        <p className="font-semibold">개발 필요:</p>
        <p>이 페이지는 자동 생성되었습니다. 실제 기능을 구현해주세요.</p>
        <p>관련 API 엔드포인트 개발이 필요합니다.</p>
      </div>
    </div>
  );
};

export default CenterAdmin예약관리Page;
