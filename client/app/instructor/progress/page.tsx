'use client';

import { useState, useEffect } from 'react';

interface Progress {
  id: number;
  studentName: string;
  course: string;
  level: string;
  progress: number;
  skills: {
    freestyle: number;
    backstroke: number;
    breaststroke: number;
    butterfly: number;
  };
  lastUpdate: string;
}

export default function InstructorProgressPage() {
  const [progresses, setProgresses] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setProgresses([
        {
          id: 1,
          studentName: '김수영',
          course: '초급 자유형',
          level: '초급',
          progress: 75,
          skills: { freestyle: 80, backstroke: 60, breaststroke: 40, butterfly: 20 },
          lastUpdate: '2025-01-18'
        },
        {
          id: 2,
          studentName: '이영수',
          course: '중급 접영',
          level: '중급',
          progress: 60,
          skills: { freestyle: 90, backstroke: 85, breaststroke: 70, butterfly: 50 },
          lastUpdate: '2025-01-17'
        },
        {
          id: 3,
          studentName: '박수영',
          course: '고급 평영',
          level: '고급',
          progress: 90,
          skills: { freestyle: 95, backstroke: 90, breaststroke: 85, butterfly: 80 },
          lastUpdate: '2025-01-19'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">로딩 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">진도 관리</h1>

        <div className="space-y-6">
          {progresses.map((progress) => (
            <div key={progress.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{progress.studentName}</h3>
                  <p className="text-sm text-gray-600">{progress.course} - {progress.level}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{progress.progress}%</div>
                  <div className="text-sm text-gray-500">전체 진도</div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">기술별 진도:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>자유형</span>
                      <span>{progress.skills.freestyle}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${progress.skills.freestyle}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>배영</span>
                      <span>{progress.skills.backstroke}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${progress.skills.backstroke}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>평영</span>
                      <span>{progress.skills.breaststroke}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${progress.skills.breaststroke}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>접영</span>
                      <span>{progress.skills.butterfly}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full" 
                        style={{ width: `${progress.skills.butterfly}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  마지막 업데이트: {progress.lastUpdate}
                </div>
                <div className="flex gap-2">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    진도 업데이트
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                    상세보기
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}






































