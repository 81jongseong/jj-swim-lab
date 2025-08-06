const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || '요청에 실패했습니다.' };
      }

      return { data };
    } catch (error) {
      console.error('API 요청 오류:', error);
      return { error: '네트워크 오류가 발생했습니다.' };
    }
  }

  // 인증 관련 API
  async signup(userData: any): Promise<ApiResponse> {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { userId: string; password: string }): Promise<ApiResponse> {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  async getProfile(): Promise<ApiResponse> {
    return this.request('/auth/profile');
  }

  // 사용자 관리 API
  async getUsers(params?: { page?: number; limit?: number; userType?: string; search?: string }): Promise<ApiResponse> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/users${queryString}`);
  }

  async getUser(id: string): Promise<ApiResponse> {
    return this.request(`/users/${id}`);
  }

  async updateUser(id: string, userData: any): Promise<ApiResponse> {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse> {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // 대시보드 API
  async getDashboard(): Promise<ApiResponse> {
    return this.request('/dashboard');
  }

  async getAdminStats(period?: string): Promise<ApiResponse> {
    const queryString = period ? `?period=${period}` : '';
    return this.request(`/dashboard/admin/stats${queryString}`);
  }

  async getInstructorStats(): Promise<ApiResponse> {
    return this.request('/dashboard/instructor/stats');
  }

  // 강습 과정 API
  async getCourses(params?: { level?: string; instructor?: string; isActive?: boolean }): Promise<ApiResponse> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/courses${queryString}`);
  }

  async getCourse(id: string): Promise<ApiResponse> {
    return this.request(`/courses/${id}`);
  }

  async createCourse(courseData: any): Promise<ApiResponse> {
    return this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  async updateCourse(id: string, courseData: any): Promise<ApiResponse> {
    return this.request(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  }

  async deleteCourse(id: string): Promise<ApiResponse> {
    return this.request(`/courses/${id}`, {
      method: 'DELETE',
    });
  }

  async enrollCourse(id: string): Promise<ApiResponse> {
    return this.request(`/courses/${id}/enroll`, {
      method: 'POST',
    });
  }

  async cancelCourse(id: string): Promise<ApiResponse> {
    return this.request(`/courses/${id}/cancel`, {
      method: 'POST',
    });
  }

  // 예약 API
  async getBookings(params?: { date?: string; status?: string; user?: string }): Promise<ApiResponse> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/bookings${queryString}`);
  }

  async getBooking(id: string): Promise<ApiResponse> {
    return this.request(`/bookings/${id}`);
  }

  async createBooking(bookingData: any): Promise<ApiResponse> {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async updateBooking(id: string, bookingData: any): Promise<ApiResponse> {
    return this.request(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookingData),
    });
  }

  async cancelBooking(id: string): Promise<ApiResponse> {
    return this.request(`/bookings/${id}/cancel`, {
      method: 'POST',
    });
  }

  async updateBookingStatus(id: string, status: string): Promise<ApiResponse> {
    return this.request(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getAvailableSlots(date: string, laneNumber?: number): Promise<ApiResponse> {
    const queryString = laneNumber ? `?laneNumber=${laneNumber}` : '';
    return this.request(`/bookings/available/${date}${queryString}`);
  }

  // 결제 API
  async getPayments(params?: { status?: string; purpose?: string; startDate?: string; endDate?: string }): Promise<ApiResponse> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/payments${queryString}`);
  }

  async getPayment(id: string): Promise<ApiResponse> {
    return this.request(`/payments/${id}`);
  }

  async createPayment(paymentData: any): Promise<ApiResponse> {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async completePayment(id: string, receiptUrl?: string): Promise<ApiResponse> {
    return this.request(`/payments/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ receiptUrl }),
    });
  }

  async refundPayment(id: string, reason?: string): Promise<ApiResponse> {
    return this.request(`/payments/${id}/refund`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getPaymentStats(startDate?: string, endDate?: string): Promise<ApiResponse> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const queryString = Object.keys(params).length > 0 ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/payments/stats/summary${queryString}`);
  }

  // 공지사항 API
  async getNotices(params?: { category?: string; priority?: string; tag?: string }): Promise<ApiResponse> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/notices${queryString}`);
  }

  async getNotice(id: string): Promise<ApiResponse> {
    return this.request(`/notices/${id}`);
  }

  async createNotice(noticeData: any): Promise<ApiResponse> {
    return this.request('/notices', {
      method: 'POST',
      body: JSON.stringify(noticeData),
    });
  }

  async updateNotice(id: string, noticeData: any): Promise<ApiResponse> {
    return this.request(`/notices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(noticeData),
    });
  }

  async deleteNotice(id: string): Promise<ApiResponse> {
    return this.request(`/notices/${id}`, {
      method: 'DELETE',
    });
  }

  async publishNotice(id: string, isPublished: boolean): Promise<ApiResponse> {
    return this.request(`/notices/${id}/publish`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublished }),
    });
  }

  async getAdminNotices(params?: { category?: string; priority?: string; isPublished?: boolean }): Promise<ApiResponse> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/notices/admin/all${queryString}`);
  }

  async getNoticeStats(): Promise<ApiResponse> {
    return this.request('/notices/admin/stats');
  }

  // 수영장 관련 API
  async getCenters(params?: { latitude?: number; longitude?: number; radius?: number }): Promise<ApiResponse> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/centers${queryString}`);
  }

  async getCenter(id: string): Promise<ApiResponse> {
    return this.request(`/centers/${id}`);
  }

  async getCenterHours(id: string): Promise<ApiResponse> {
    return this.request(`/centers/${id}/hours`);
  }

  async getCenterPricing(id: string): Promise<ApiResponse> {
    return this.request(`/centers/${id}/pricing`);
  }

  async getCenterFacilities(id: string): Promise<ApiResponse> {
    return this.request(`/centers/${id}/facilities`);
  }

  async updateCenterCapacity(id: string, capacity: number): Promise<ApiResponse> {
    return this.request(`/centers/${id}/capacity`, {
      method: 'PATCH',
      body: JSON.stringify({ currentCapacity: capacity }),
    });
  }

  // 진도 관리 API
  async getMyProgress(): Promise<ApiResponse> {
    return this.request('/progress/my-progress');
  }

  async getStudentProgress(studentId: string): Promise<ApiResponse> {
    return this.request(`/progress/student/${studentId}`);
  }

  async updateStudentProgress(studentId: string, progressData: any): Promise<ApiResponse> {
    return this.request(`/progress/student/${studentId}`, {
      method: 'POST',
      body: JSON.stringify(progressData),
    });
  }

  async getClassStudents(classId: string): Promise<ApiResponse> {
    return this.request(`/progress/class/${classId}/students`);
  }

  async getSkillTemplates(params?: { category?: string; level?: string }): Promise<ApiResponse> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/progress/skill-templates${queryString}`);
  }

  async submitEvaluation(evaluationData: any): Promise<ApiResponse> {
    return this.request('/progress/evaluation', {
      method: 'POST',
      body: JSON.stringify(evaluationData),
    });
  }

  async getAvailableEvaluations(): Promise<ApiResponse> {
    return this.request('/progress/evaluations/available');
  }

  // 유틸리티 메서드
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  }

  getUserType(): string | null {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).userType : null;
  }

  getCurrentUser(): any {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient; 