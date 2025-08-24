// API 클라이언트 - 모든 경로에 /api/ 접두사 적용
class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    console.log(`🔍 API 요청: ${this.baseURL}${endpoint}`);
    console.log(`🔑 인증 토큰: ${token ? '있음' : '없음'}`);

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();
      
      console.log(`📡 응답 상태: ${response.status} ${response.statusText}`);
      console.log(`📊 응답 데이터:`, data);

      if (!response.ok) {
        console.error(`❌ API 오류: ${response.status} - ${data.error || data.message || '알 수 없는 오류'}`);
        return { 
          error: data.error || data.message || '요청에 실패했습니다.',
          status: response.status,
          details: data
        };
      }

      // 서버 응답 구조를 그대로 반환 (success, data, message 등 포함)
      return data;
    } catch (error) {
      console.error(`💥 네트워크 오류:`, error);
      return { error: '네트워크 오류가 발생했습니다.' };
    }
  }

  // ===== 범용 HTTP 메소드 =====
  async get(endpoint: string): Promise<any> {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint: string, data?: any): Promise<any> {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(endpoint: string, data?: any): Promise<any> {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch(endpoint: string, data?: any): Promise<any> {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(endpoint: string): Promise<any> {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // ===== 인증 관련 API =====
  async login(credentials: { userId: string; password: string }): Promise<any> {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async signup(userData: any): Promise<any> {
    return this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile(): Promise<any> {
    return this.request('/api/auth/profile');
  }

  getCurrentUser(): any {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  // ===== 강습법 관리 API =====
  async getTeachingMethods(params?: { category?: string; difficulty?: string; search?: string }): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/api/teaching-methods${queryString}`);
  }

  async getTeachingMethod(id: string): Promise<any> {
    return this.request(`/api/teaching-methods/${id}`);
  }

  // ===== 체크리스트 관리 API =====
  async getInstructorChecklists(instructorId: string): Promise<any> {
    return this.request(`/api/checklist/instructor/${instructorId}`);
  }

  async getStudentChecklist(studentId: string, courseId: string): Promise<any> {
    return this.request(`/api/checklist/student/${studentId}/course/${courseId}`);
  }

  async generateChecklist(checklistData: { studentId: string; courseId: string }): Promise<any> {
    return this.request('/api/checklist/generate', {
      method: 'POST',
      body: JSON.stringify(checklistData),
    });
  }

  async updateChecklistItem(checklistId: string, itemIndex: number, updateData: { isCompleted?: boolean; notes?: string; instructorNotes?: string }): Promise<any> {
    return this.request(`/api/checklist/${checklistId}/items/${itemIndex}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  async updateChecklist(checklistId: string, updateData: { status?: string; notes?: string; targetCompletionDate?: string }): Promise<any> {
    return this.request(`/api/checklist/${checklistId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  async deleteChecklist(checklistId: string): Promise<any> {
    return this.request(`/api/checklist/${checklistId}`, {
      method: 'DELETE',
    });
  }

  // ===== 사용자 관리 API =====
  async getUsers(params?: { role?: string; centerId?: string; page?: number; limit?: number }): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/api/users${queryString}`);
  }

  async getUser(id: string): Promise<any> {
    return this.request(`/api/users/${id}`);
  }

  async createUser(userData: any): Promise<any> {
    return this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: any): Promise<any> {
    return this.request(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<any> {
    return this.request(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  // ===== 대시보드 API =====
  async getDashboardData(userType: string): Promise<any> {
    return this.request(`/api/dashboard/${userType}`);
  }

  async getUserDashboard(): Promise<any> {
    return this.request('/api/dashboard');
  }

  async getDashboardStats(params?: { startDate?: string; endDate?: string; centerId?: string }): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/api/dashboard/admin/stats${queryString}`);
  }

  // ===== 강습 과정 API =====
  async getCourses(params?: { level?: string; instructor?: string; isActive?: boolean }): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/api/courses${queryString}`);
  }

  async getCourse(id: string): Promise<any> {
    return this.request(`/api/courses/${id}`);
  }

  async createCourse(courseData: any): Promise<any> {
    return this.request('/api/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  async updateCourse(id: string, courseData: any): Promise<any> {
    return this.request(`/api/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  }

  async deleteCourse(id: string): Promise<any> {
    return this.request(`/api/courses/${id}`, {
      method: 'DELETE',
    });
  }

  // 강습 과정 등록/해제
  async enrollCourse(courseId: string): Promise<any> {
    return this.request(`/api/courses/${courseId}/enroll`, {
      method: 'POST',
    });
  }

  async unenrollCourse(courseId: string): Promise<any> {
    return this.request(`/api/courses/${courseId}/unenroll`, {
      method: 'POST',
    });
  }

  // 학생별 강습 과정 진도율 업데이트
  async updateCourseProgress(courseId: string, studentId: string, progressData: any): Promise<any> {
    return this.request(`/api/courses/${courseId}/progress/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify(progressData),
    });
  }

  // 강사가 관리하는 반 목록 가져오기
  async getInstructorClasses(instructorId: string): Promise<any> {
    return this.request(`/api/courses/instructor/${instructorId}/classes`);
  }

  // 특정 반의 회원 진도 관리
  async getClassStudentsProgress(classId: string): Promise<any> {
    return this.request(`/api/courses/class/${classId}/students/progress`);
  }

  // ===== 예약 관리 API =====
  async getBookings(params?: { userId?: string; courseId?: string; status?: string }): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/api/bookings${queryString}`);
  }

  async createBooking(bookingData: any): Promise<any> {
    return this.request('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async updateBooking(id: string, bookingData: any): Promise<any> {
    return this.request(`/api/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookingData),
    });
  }

  async deleteBooking(id: string): Promise<any> {
    return this.request(`/api/bookings/${id}`, {
      method: 'DELETE',
    });
  }

  // ===== 결제 관리 API =====
  async getPayments(params?: { userId?: string; status?: string; startDate?: string; endDate?: string }): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/api/payments${queryString}`);
  }

  async createPayment(paymentData: any): Promise<any> {
    return this.request('/api/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async updatePayment(id: string, paymentData: any): Promise<any> {
    return this.request(`/api/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(paymentData),
    });
  }

  // ===== 센터 정보 API =====
  async getCenterInfo(): Promise<any> {
    return this.request('/api/center-info');
  }

  async updateCenterInfo(centerData: any): Promise<any> {
    return this.request('/api/center-info', {
      method: 'PUT',
      body: JSON.stringify(centerData),
    });
  }

  // ===== 공지사항 API =====
  async getNotices(params?: { category?: string; isActive?: boolean }): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/api/notices${queryString}`);
  }

  async createNotice(noticeData: any): Promise<any> {
    return this.request('/api/notices', {
      method: 'POST',
      body: JSON.stringify(noticeData),
    });
  }

  async updateNotice(id: string, noticeData: any): Promise<any> {
    return this.request(`/api/notices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(noticeData),
    });
  }

  async deleteNotice(id: string): Promise<any> {
    return this.request(`/api/notices/${id}`, {
      method: 'DELETE',
    });
  }

  // ===== 퀴즈 API =====
  async getQuizzes(params?: { category?: string; difficulty?: string }): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/api/quiz${queryString}`);
  }

  async submitQuizAnswer(quizId: string, answers: any): Promise<any> {
    return this.request(`/api/quiz/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify(answers),
    });
  }

  // ===== 커뮤니티 API =====
  async getCommunityPosts(params?: { category?: string; author?: string }): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/api/community${queryString}`);
  }

  async createCommunityPost(postData: any): Promise<any> {
    return this.request('/api/community', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async updateCommunityPost(id: string, postData: any): Promise<any> {
    return this.request(`/api/community/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  }

  async deleteCommunityPost(id: string): Promise<any> {
    return this.request(`/api/community/${id}`, {
      method: 'DELETE',
    });
  }

  // ===== 쇼핑몰 API =====
  async getShopProducts(params?: { category?: string; priceRange?: string }): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/api/shop/products${queryString}`);
  }

  async createShopOrder(orderData: any): Promise<any> {
    return this.request('/api/shop/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  // ===== 수업 계획 API =====
  async getLessonPlans(params?: { instructorId?: string; classId?: string; date?: string }): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/api/lesson-plans${queryString}`);
  }

  async createLessonPlan(planData: any): Promise<any> {
    return this.request('/api/lesson-plans', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  }

  async updateLessonPlan(id: string, planData: any): Promise<any> {
    return this.request(`/api/lesson-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(planData),
    });
  }

  async deleteLessonPlan(id: string): Promise<any> {
    return this.request(`/api/lesson-plans/${id}`, {
      method: 'DELETE',
    });
  }

  // ===== 운동 데이터 API =====
  async getExerciseData(params?: { userId?: string; date?: string; type?: string }): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/api/exercise${queryString}`);
  }

  async submitExerciseData(exerciseData: any): Promise<any> {
    return this.request('/api/exercise', {
      method: 'POST',
      body: JSON.stringify(exerciseData),
    });
  }

  async getExerciseStats(userId: string, period: string): Promise<any> {
    return this.request(`/api/exercise/stats/${userId}?period=${period}`);
  }

  // ===== 예약 관리 API =====
  async cancelBooking(bookingId: string): Promise<any> {
    return this.request(`/api/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
    });
  }

  async updateBookingStatus(bookingId: string, status: string): Promise<any> {
    return this.request(`/api/bookings/${bookingId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
}

// API 클라이언트 인스턴스 생성 및 내보내기
export const apiClient = new ApiClient();
export default apiClient; 