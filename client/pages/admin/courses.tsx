import { useState, useEffect } from 'react';
import apiClient from '../../utils/api';

interface ScheduleSlot {
  day: string;
  startTime: string;
  endTime: string;
}

interface Course {
  _id: string;
  name: string;
  description: string;
  level: string;
  price: number;
  instructor: any;
  duration: number;
  maxStudents: number;
  schedule?: ScheduleSlot[];
  isActive?: boolean;
  enrolledStudents?: any[];
}

interface Instructor {
  _id: string;
  name: string;
  userId: string;
}

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('전체');
  const [selectedInstructor, setSelectedInstructor] = useState('전체');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // 수영장 운영 설정
  const [poolSettings, setPoolSettings] = useState({
    openTime: '06:00',
    closeTime: '22:00',
    laneCount: 6,
    timeSlot: 30 // 30분 단위
  });
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 'beginner',
    price: '',
    duration: 50,
    maxStudents: '',
    instructor: '',
    schedule: [] as ScheduleSlot[]
  });

  const daysOfWeek = [
    { value: 'monday', label: '월' },
    { value: 'tuesday', label: '화' },
    { value: 'wednesday', label: '수' },
    { value: 'thursday', label: '목' },
    { value: 'friday', label: '금' },
    { value: 'saturday', label: '토' },
    { value: 'sunday', label: '일' }
  ];
  
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  // 운영시간 생성 함수
  const generateTimeSlots = () => {
    const slots: string[] = [];
    const start = new Date(`2000-01-01 ${poolSettings.openTime}`);
    const end = new Date(`2000-01-01 ${poolSettings.closeTime}`);
    
    while (start < end) {
      const timeStr = start.toTimeString().slice(0, 5);
      slots.push(timeStr);
      start.setMinutes(start.getMinutes() + poolSettings.timeSlot);
    }
    return slots;
  };

  // 레인별 캘린더 렌더링
  const renderLaneCalendar = () => {
    const weekDays = ['월', '화', '수', '목', '금', '토', '일'];
    const timeSlots = generateTimeSlots();
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">레인별 강습 일정</h3>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 transition-colors text-sm"
          >
            운영 설정
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            {/* 요일 헤더 */}
            <div className="grid grid-cols-8 gap-1 mb-2">
              <div className="w-24"></div> {/* 시간대 헤더 공간 */}
              {weekDays.map((day) => (
                <div key={day} className="text-center font-medium text-gray-700 py-2 bg-gray-50 rounded">
                  {day}
                </div>
              ))}
            </div>
            
            {/* 시간대별 행 */}
            {timeSlots.map((timeSlot) => (
              <div key={timeSlot} className="grid grid-cols-8 gap-1 mb-1">
                {/* 시간대 라벨 */}
                <div className="w-24 text-xs font-medium text-gray-600 py-2 bg-gray-50 rounded flex items-center justify-center">
                  {timeSlot}
                </div>
                
                {/* 각 요일별 셀 */}
                {weekDays.map((day, dayIndex) => {
                  const dayValue = daysOfWeek[dayIndex].value;
                  const coursesInThisSlot = filteredCourses.filter(course => 
                    course.schedule?.some(slot => {
                      const slotDayIndex = daysOfWeek.findIndex(d => d.value === slot.day);
                      return slotDayIndex === dayIndex && 
                             slot.startTime <= timeSlot && 
                             slot.endTime > timeSlot;
                    })
                  );
                  
                  return (
                    <div key={`${day}-${timeSlot}`} className="min-h-[80px] border border-gray-200 rounded p-1 bg-white">
                      <div className="grid grid-cols-6 gap-1">
                        {Array.from({ length: poolSettings.laneCount }, (_, laneIndex) => {
                          const laneNumber = laneIndex + 1;
                          const courseInLane = coursesInThisSlot.find(course => {
                            // 간단한 레인 할당 로직 (실제로는 더 복잡한 로직 필요)
                            return course.schedule?.some(slot => {
                              const slotDayIndex = daysOfWeek.findIndex(d => d.value === slot.day);
                              return slotDayIndex === dayIndex && 
                                     slot.startTime <= timeSlot && 
                                     slot.endTime > timeSlot;
                            });
                          });
                          
                          return (
                            <div 
                              key={`lane-${laneNumber}`} 
                              className="min-h-[60px] border border-gray-300 rounded p-1 bg-gray-50"
                            >
                              <div className="text-xs text-gray-500 text-center mb-1">
                                {laneNumber}레인
                              </div>
                              {courseInLane ? (
                                <div className="text-xs bg-blue-100 text-blue-800 p-1 rounded border border-blue-200">
                                  <div className="font-medium truncate">{courseInLane.name}</div>
                                  <div className="text-blue-600 truncate">
                                    {courseInLane.instructor?.name || '강사 미지정'}
                                  </div>
                                  <div className="text-blue-500">
                                    {getLevelText(courseInLane.level)}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs text-gray-400 text-center">
                                  빈 레인
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        
        {/* 범례 */}
        <div className="mt-4 text-xs text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
              <span>강습</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-50 border border-gray-300 rounded"></div>
              <span>빈 레인</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    fetchCourses();
    fetchInstructors();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getCourses();
      
      if (response.data && response.data.courses && Array.isArray(response.data.courses)) {
        setCourses(response.data.courses);
      } else if (response.data && Array.isArray(response.data)) {
        setCourses(response.data);
      } else {
        setCourses([]);
      }
    } catch (err) {
      setError('강습 과정 목록을 불러오는데 실패했습니다.');
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await apiClient.getUsers();
      if (response.data && response.data.users) {
        const instructorUsers = response.data.users.filter((user: any) => 
          user.userType === 'instructor' || user.userType === 'admin'
        );
        setInstructors(instructorUsers);
      }
    } catch (err) {
      console.error('강사 목록을 불러오는데 실패했습니다:', err);
    }
  };

  const handleAddCourse = () => {
    setFormData({
      name: '',
      description: '',
      level: 'beginner',
      price: '',
      duration: 50,
      maxStudents: '',
      instructor: '',
      schedule: []
    });
    setSelectedCourse(null);
    setShowAddModal(true);
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      name: course.name || '',
      description: course.description || '',
      level: course.level || 'beginner',
      price: course.price?.toString() || '',
      duration: course.duration || 50,
      maxStudents: course.maxStudents?.toString() || '',
      instructor: course.instructor?._id || '',
      schedule: course.schedule || []
    });
    setShowEditModal(true);
  };

  const handleScheduleCourse = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      ...formData,
      schedule: course.schedule || []
    });
    setShowScheduleModal(true);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (window.confirm('정말로 이 강습 과정을 삭제하시겠습니까?')) {
      try {
        const response = await apiClient.deleteCourse(courseId);
        if (response.data) {
          setCourses(courses.filter(course => course._id !== courseId));
          alert('강습 과정이 삭제되었습니다.');
        } else {
          alert('삭제에 실패했습니다.');
        }
      } catch (err) {
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        price: parseInt(formData.price) || 0,
        duration: formData.duration,
        maxStudents: parseInt(formData.maxStudents) || 0,
        instructor: formData.instructor
      };

      if (showAddModal) {
        const response = await apiClient.createCourse(submitData);
        if (response.data && response.data.course) {
          setCourses([...courses, response.data.course]);
          setShowAddModal(false);
          alert('강습 과정이 추가되었습니다.');
        } else {
          alert('추가에 실패했습니다.');
        }
      } else if (selectedCourse) {
        const response = await apiClient.updateCourse(selectedCourse._id, submitData);
        if (response.data && response.data.course) {
          setCourses(courses.map(course => 
            course._id === selectedCourse._id ? response.data.course : course
          ));
          setShowEditModal(false);
          alert('강습 과정이 수정되었습니다.');
        } else {
          alert('수정에 실패했습니다.');
        }
      }
    } catch (err) {
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      const response = await apiClient.updateCourse(selectedCourse._id, {
        schedule: formData.schedule
      });
      
      if (response.data && response.data.course) {
        setCourses(courses.map(course => 
          course._id === selectedCourse._id ? response.data.course : course
        ));
        setShowScheduleModal(false);
        alert('강습 일정이 저장되었습니다.');
      } else {
        alert('일정 저장에 실패했습니다.');
      }
    } catch (err) {
      alert('일정 저장 중 오류가 발생했습니다.');
    }
  };

  const addScheduleSlot = () => {
    setFormData({
      ...formData,
      schedule: [...formData.schedule, {
        day: 'monday',
        startTime: '09:00',
        endTime: '10:00'
      }]
    });
  };

  const removeScheduleSlot = (index: number) => {
    setFormData({
      ...formData,
      schedule: formData.schedule.filter((_, i) => i !== index)
    });
  };

  const updateScheduleSlot = (index: number, field: keyof ScheduleSlot, value: string) => {
    const newSchedule = [...formData.schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setFormData({
      ...formData,
      schedule: newSchedule
    });
  };

  const adjustDuration = (increment: boolean) => {
    const newDuration = increment ? formData.duration + 5 : formData.duration - 5;
    if (newDuration >= 15 && newDuration <= 180) {
      setFormData({
        ...formData,
        duration: newDuration
      });
    }
  };

  const filteredCourses = courses.filter(course => {
    // 검색어 필터
    const matchesSearch = !searchTerm || 
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 난이도 필터
    const matchesLevel = selectedLevel === '전체' || course.level === selectedLevel;
    
    // 강사 필터
    const matchesInstructor = selectedInstructor === '전체' || 
      course.instructor?._id === selectedInstructor;
    
    return matchesSearch && matchesLevel && matchesInstructor;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return '초급';
      case 'intermediate': return '중급';
      case 'advanced': return '고급';
      default: return '기타';
    }
  };

  const getDayLabel = (dayValue: string) => {
    const day = daysOfWeek.find(d => d.value === dayValue);
    return day ? day.label : dayValue;
  };

  const renderWeeklyCalendar = () => {
    const weekDays = ['월', '화', '수', '목', '금', '토', '일'];
    const timeRanges = [
      '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
      '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00',
      '17:00-18:00', '18:00-19:00', '19:00-20:00'
    ];
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">주간 강습 일정</h3>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* 요일 헤더 */}
            <div className="grid grid-cols-8 gap-1 mb-2">
              <div className="w-20"></div> {/* 시간대 헤더 공간 */}
              {weekDays.map((day) => (
                <div key={day} className="text-center font-medium text-gray-700 py-2 bg-gray-50 rounded">
                  {day}
                </div>
              ))}
            </div>
            
            {/* 시간대별 행 */}
            {timeRanges.map((timeRange) => (
              <div key={timeRange} className="grid grid-cols-8 gap-1 mb-1">
                {/* 시간대 라벨 */}
                <div className="w-20 text-xs font-medium text-gray-600 py-2 bg-gray-50 rounded flex items-center justify-center">
                  {timeRange}
                </div>
                
                {/* 각 요일별 셀 */}
                {weekDays.map((day, dayIndex) => {
                  const dayValue = daysOfWeek[dayIndex].value;
                  const coursesInThisSlot = filteredCourses.filter(course => 
                    course.schedule?.some(slot => {
                      const slotDayIndex = daysOfWeek.findIndex(d => d.value === slot.day);
                      return slotDayIndex === dayIndex && 
                             slot.startTime <= timeRange.split('-')[0] && 
                             slot.endTime > timeRange.split('-')[0];
                    })
                  );
                  
                  return (
                    <div key={`${day}-${timeRange}`} className="min-h-[60px] border border-gray-200 rounded p-1 bg-white">
                      <div className="flex flex-wrap gap-1">
                        {coursesInThisSlot.map((course, courseIndex) => {
                          const matchingSlot = course.schedule?.find(slot => {
                            const slotDayIndex = daysOfWeek.findIndex(d => d.value === slot.day);
                            return slotDayIndex === dayIndex && 
                                   slot.startTime <= timeRange.split('-')[0] && 
                                   slot.endTime > timeRange.split('-')[0];
                          });
                          
                          return (
                            <div 
                              key={`${course._id}-${courseIndex}`} 
                              className="text-xs bg-blue-100 text-blue-800 p-1 rounded border border-blue-200 flex-shrink-0 min-w-[80px] max-w-[120px]"
                              title={`${course.name} (${matchingSlot?.startTime}-${matchingSlot?.endTime})`}
                            >
                              <div className="font-medium truncate">{course.name}</div>
                              <div className="text-blue-600 truncate">{course.instructor?.name || '강사 미지정'}</div>
                              <div className="text-blue-500">{course.maxStudents}명</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        
        {/* 범례 */}
        <div className="mt-4 text-xs text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
              <span>강습</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded"></div>
              <span>빈 시간</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderScheduleCalendar = (course: Course) => {
    if (!course.schedule || course.schedule.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500">
          등록된 일정이 없습니다.
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {course.schedule.map((slot, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
            <span className="text-sm font-medium text-blue-800">
              {getDayLabel(slot.day)} {slot.startTime} - {slot.endTime}
            </span>
            <span className="text-xs text-blue-600">
              {course.maxStudents}명
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderFormScheduleSection = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-md font-medium text-gray-700">주간 일정 설정</h4>
        <button
          type="button"
          onClick={addScheduleSlot}
          className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors text-sm"
        >
          + 시간 추가
        </button>
      </div>
      
      {formData.schedule.map((slot, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-medium text-gray-700">시간대 {index + 1}</h5>
            <button
              type="button"
              onClick={() => removeScheduleSlot(index)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              삭제
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">요일</label>
              <select
                value={slot.day}
                onChange={(e) => updateScheduleSlot(index, 'day', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {daysOfWeek.map(day => (
                  <option key={day.value} value={day.value}>{day.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">시작 시간</label>
              <select
                value={slot.startTime}
                onChange={(e) => updateScheduleSlot(index, 'startTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">종료 시간</label>
              <select
                value={slot.endTime}
                onChange={(e) => updateScheduleSlot(index, 'endTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}
      
      {formData.schedule.length === 0 && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          등록된 일정이 없습니다. "시간 추가" 버튼을 클릭하여 일정을 추가하세요.
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">강습 관리</h1>
          <p className="text-gray-600">강습 과정과 일정을 관리하세요</p>
        </div>

        {/* 검색 및 필터 섹션 */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">검색</label>
              <input
                type="text"
                placeholder="과정명 또는 설명으로 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">난이도</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="전체">전체</option>
                <option value="beginner">초급</option>
                <option value="intermediate">중급</option>
                <option value="advanced">고급</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">강사</label>
              <select
                value={selectedInstructor}
                onChange={(e) => setSelectedInstructor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="전체">전체</option>
                {instructors.map(instructor => (
                  <option key={instructor._id} value={instructor._id}>
                    {instructor.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button 
                onClick={handleAddCourse}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                + 새 강습 과정 추가
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">로딩 중...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <>
            {/* 주간 캘린더 표시 */}
            {renderLaneCalendar()}

            {/* 강습 과정 목록 */}
            <div className="bg-white border border-gray-200 rounded-lg mt-6">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">강습 과정 목록</h3>
                  <div className="flex space-x-4">
                    {['전체', '초급', '중급', '고급'].map((filterType) => (
                      <button 
                        key={filterType}
                        onClick={() => setFilter(filterType)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          filter === filterType 
                            ? 'bg-blue-600 text-white' 
                            : 'text-gray-600 hover:text-blue-600'
                        }`}
                      >
                        {filterType}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredCourses.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      {filter === '전체' ? '등록된 강습 과정이 없습니다.' : `${filter} 강습 과정이 없습니다.`}
                    </div>
                  ) : (
                    filteredCourses.map((course) => (
                      <div key={course._id} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <span className={`px-3 py-1 ${getLevelColor(course.level)} text-xs rounded-full`}>
                            {getLevelText(course.level)}
                          </span>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEditCourse(course)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              수정
                            </button>
                            <button 
                              onClick={() => handleScheduleCourse(course)}
                              className="text-green-600 hover:text-green-800 text-sm"
                            >
                              일정
                            </button>
                            <button 
                              onClick={() => handleDeleteCourse(course._id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">{course.name}</h4>
                        <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-blue-600 font-semibold">₩{course.price?.toLocaleString() || 0}</span>
                          <span className="text-gray-500 text-sm">
                            {course.instructor?.name || '강사 미지정'} | {course.duration}분 | 최대 {course.maxStudents}명
                          </span>
                        </div>
                        
                        {/* 주간 캘린더 미리보기 */}
                        <div className="mt-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">주간 일정</h5>
                          {renderScheduleCalendar(course)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">새 강습 과정 추가</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">과정명</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">난이도</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({...formData, level: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="beginner">초급</option>
                      <option value="intermediate">중급</option>
                      <option value="advanced">고급</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">강사</label>
                    <select
                      value={formData.instructor}
                      onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">강사 선택</option>
                      {instructors.map(instructor => (
                        <option key={instructor._id} value={instructor._id}>
                          {instructor.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">가격</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="예: 50000"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">수업 시간 (분)</label>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => adjustDuration(false)}
                        className="px-3 py-2 border border-gray-300 rounded-l-md hover:bg-gray-50"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 50})}
                        className="w-full px-3 py-2 border-t border-b border-gray-300 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="15"
                        max="180"
                        step="5"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => adjustDuration(true)}
                        className="px-3 py-2 border border-gray-300 rounded-r-md hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">최대 인원</label>
                    <input
                      type="number"
                      value={formData.maxStudents}
                      onChange={(e) => setFormData({...formData, maxStudents: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* 요일/시간 설정 섹션 */}
                {renderFormScheduleSection()}
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  추가
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">강습 과정 수정</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">과정명</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">난이도</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({...formData, level: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="beginner">초급</option>
                      <option value="intermediate">중급</option>
                      <option value="advanced">고급</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">강사</label>
                    <select
                      value={formData.instructor}
                      onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">강사 선택</option>
                      {instructors.map(instructor => (
                        <option key={instructor._id} value={instructor._id}>
                          {instructor.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">가격</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="예: 50000"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">수업 시간 (분)</label>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => adjustDuration(false)}
                        className="px-3 py-2 border border-gray-300 rounded-l-md hover:bg-gray-50"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 50})}
                        className="w-full px-3 py-2 border-t border-b border-gray-300 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="15"
                        max="180"
                        step="5"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => adjustDuration(true)}
                        className="px-3 py-2 border border-gray-300 rounded-r-md hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">최대 인원</label>
                    <input
                      type="number"
                      value={formData.maxStudents}
                      onChange={(e) => setFormData({...formData, maxStudents: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* 요일/시간 설정 섹션 */}
                {renderFormScheduleSection()}
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {selectedCourse.name} - 강습 일정 관리
            </h3>
            <form onSubmit={handleScheduleSubmit}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-medium text-gray-700">주간 일정 설정</h4>
                  <button
                    type="button"
                    onClick={addScheduleSlot}
                    className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors text-sm"
                  >
                    + 시간 추가
                  </button>
                </div>
                
                {formData.schedule.map((slot, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-700">시간대 {index + 1}</h5>
                      <button
                        type="button"
                        onClick={() => removeScheduleSlot(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        삭제
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">요일</label>
                        <select
                          value={slot.day}
                          onChange={(e) => updateScheduleSlot(index, 'day', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {daysOfWeek.map(day => (
                            <option key={day.value} value={day.value}>{day.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">시작 시간</label>
                        <select
                          value={slot.startTime}
                          onChange={(e) => updateScheduleSlot(index, 'startTime', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {timeSlots.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">종료 시간</label>
                        <select
                          value={slot.endTime}
                          onChange={(e) => updateScheduleSlot(index, 'endTime', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {timeSlots.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                
                {formData.schedule.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    등록된 일정이 없습니다. "시간 추가" 버튼을 클릭하여 일정을 추가하세요.
                  </div>
                )}
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  일정 저장
                </button>
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pool Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">수영장 운영 설정</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">개장 시간</label>
                <input
                  type="time"
                  value={poolSettings.openTime}
                  onChange={(e) => setPoolSettings({...poolSettings, openTime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">폐장 시간</label>
                <input
                  type="time"
                  value={poolSettings.closeTime}
                  onChange={(e) => setPoolSettings({...poolSettings, closeTime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">레인 개수</label>
                <select
                  value={poolSettings.laneCount}
                  onChange={(e) => setPoolSettings({...poolSettings, laneCount: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>{num}개</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">시간 단위</label>
                <select
                  value={poolSettings.timeSlot}
                  onChange={(e) => setPoolSettings({...poolSettings, timeSlot: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={15}>15분</option>
                  <option value={30}>30분</option>
                  <option value={60}>60분</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                저장
              </button>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 