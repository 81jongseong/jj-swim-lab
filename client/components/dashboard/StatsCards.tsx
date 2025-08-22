'use client';

interface MemberStats {
  totalBookings: number;
  activeCourses: number;
  totalPayments: number;
  nextLesson: string | null;
}

interface StatsCardsProps {
  stats: MemberStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div 
        className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105 border-2 border-transparent hover:border-blue-300"
        onClick={() => {
          console.log('총 예약 카드 클릭됨');
          window.location.href = '/bookings';
        }}
      >
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <span className="text-2xl">📅</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">총 예약</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
          </div>
        </div>
      </div>

      <div 
        className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105 border-2 border-transparent hover:border-green-300"
        onClick={() => {
          console.log('활성 강습 카드 클릭됨');
          window.location.href = '/courses';
        }}
      >
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <span className="text-2xl">🏊‍♂️</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">활성 강습</p>
            <p className="text-2xl font-bold text-gray-900">{stats.activeCourses}</p>
          </div>
        </div>
      </div>

      <div 
        className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105 border-2 border-transparent hover:border-purple-300"
        onClick={() => {
          console.log('총 결제 카드 클릭됨');
          window.location.href = '/payments';
        }}
      >
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 rounded-lg">
            <span className="text-2xl">💰</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">총 결제</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalPayments.toLocaleString()}원</p>
          </div>
        </div>
      </div>

      <div 
        className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105 border-2 border-transparent hover:border-yellow-300"
        onClick={() => {
          console.log('다음 강습 카드 클릭됨');
          window.location.href = '/dashboard/checklist';
        }}
      >
        <div className="flex items-center">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <span className="text-2xl">⏰</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">다음 강습</p>
            <p className="text-sm font-bold text-gray-900">{stats.nextLesson || '예정 없음'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

