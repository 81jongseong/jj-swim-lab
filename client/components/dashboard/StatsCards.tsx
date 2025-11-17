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

// ⭐ 다음 강습 포맷팅 함수 (요일 포함)
const formatNextLesson = (nextLesson: string | null): { date: string; time: string; dayOfWeek: string } | null => {
  if (!nextLesson) return null;
  
  try {
    // "2025-01-15 14:00" 형식 파싱
    const [datePart, timePart] = nextLesson.split(' ');
    if (!datePart || !timePart) return null;
    
    const date = new Date(datePart + 'T' + timePart + ':00');
    if (isNaN(date.getTime())) return null;
    
    const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const dayOfWeek = dayNames[date.getDay()];
    
    // 날짜 포맷: "1월 15일"
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // 시간 포맷: "14:00"
    const [hours, minutes] = timePart.split(':');
    const time = `${hours}:${minutes}`;
    
    return {
      date: `${month}월 ${day}일`,
      time: time,
      dayOfWeek: dayOfWeek
    };
  } catch {
    return null;
  }
};

export default function StatsCards({ stats }: StatsCardsProps) {
  const nextLessonFormatted = formatNextLesson(stats.nextLesson);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* ⭐ 총예약과 활성강습 통합 - 등록된 강습으로 표시 */}
      <div 
        className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105 border-2 border-transparent hover:border-green-300"
        onClick={() => {
          console.log('등록된 강습 카드 클릭됨');
          window.location.href = '/courses';
        }}
      >
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <img 
              src="/icons/manifest-icon-192.maskable.png" 
              alt="수영" 
              className="w-8 h-8 object-cover"
            />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">등록된 강습</p>
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
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600">총 결제</p>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-bold text-gray-900">{stats.totalPayments.toLocaleString()}</p>
              <p className="text-sm text-gray-600">원</p>
            </div>
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
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600">다음 강습</p>
            {nextLessonFormatted ? (
              <div className="space-y-0.5">
                <p className="text-lg font-bold text-gray-900">{nextLessonFormatted.date}</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-blue-600">{nextLessonFormatted.dayOfWeek}</p>
                  <span className="text-gray-400">·</span>
                  <p className="text-sm text-gray-700">{nextLessonFormatted.time}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm font-medium text-gray-500">예정 없음</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

