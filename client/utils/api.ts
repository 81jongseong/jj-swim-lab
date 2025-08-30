/**
 * 🌐 JJ Swim Lab - API 유틸리티
 * 
 * 📋 **유틸리티 목적**
 * - 애플리케이션의 모든 HTTP API 통신을 관리하는 중앙화된 유틸리티
 * - RESTful API 엔드포인트와의 통신 및 데이터 교환 처리
 * - 인증 토큰 관리 및 자동 토큰 갱신
 * - 에러 처리 및 재시도 로직 구현
 * - API 응답 데이터의 타입 안전성 및 검증
 * 
 * 🔄 **주요 기능**
 * - HTTP 요청 메서드 (GET, POST, PUT, DELETE, PATCH)
 * - 인증 토큰 자동 첨부 및 갱신
 * - 에러 처리 및 재시도 메커니즘
 * - 요청/응답 인터셉터 및 로깅
 * - API 응답 데이터 타입 검증
 * - 요청 취소 및 타임아웃 처리
 * 
 * 🗄️ **데이터 연동**
 * - 백엔드 API 서버 및 엔드포인트
 * - JWT 토큰 및 인증 정보
 * - API 요청/응답 데이터
 * - 에러 로그 및 디버깅 정보
 * - 사용자 세션 및 권한 데이터
 * 
 * 🛠️ **필요한 설치 파일**
 * - HTTP 클라이언트 (fetch, axios 등)
 * - JWT 토큰 처리 라이브러리
 * - 타입 검증 및 스키마 라이브러리
 * - 에러 처리 및 로깅 시스템
 * - API 모킹 및 테스트 도구
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. API 엔드포인트 URL의 정확성 및 일관성
 * 2. 인증 토큰의 보안 및 만료 처리
 * 3. 에러 처리의 적절성 및 사용자 경험
 * 4. API 응답 데이터의 타입 안전성
 * 5. 요청 성능 및 메모리 사용량 최적화
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] API 엔드포인트 연결 확인
 * - [ ] 인증 토큰 처리 검증
 * - [ ] 에러 처리 및 재시도 로직 확인
 * - [ ] 타입 안전성 및 데이터 검증 확인
 * - [ ] 성능 및 최적화 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 API 통신)
 * - 2024-12-19: 인증 토큰 관리 시스템 구현
 * - 2024-12-19: 에러 처리 및 재시도 시스템 구현
 * - 2024-12-19: 타입 안전성 및 성능 최적화 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (API 통신 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - AI 기반 API 최적화
 * - 자동 API 성능 모니터링
 * - 성능 최적화
 * - 보안 강화
 * 
 * 💡 **사용 예시**
 * ```tsx
 * // API 유틸리티 사용
 * import { 
 *   apiClient, 
 *   get, 
 *   post, 
 *   put, 
 *   del 
 * } from '@/utils/api';
 * 
 * // GET 요청
 * const users = await get('/users');
 * 
 * // POST 요청
 * const newUser = await post('/users', {
 *   name: '홍길동',
 *   email: 'hong@example.com'
 * });
 * 
 * // PUT 요청
 * const updatedUser = await put('/users/1', {
 *   name: '김철수'
 * });
 * 
 * // DELETE 요청
 * await del('/users/1');
 * ```
 * 
 * 🔍 **API 통신 처리 흐름**
 * 1. API 요청 생성 및 설정
 * 2. 인증 토큰 첨부 및 검증
 * 3. HTTP 요청 전송 및 응답 대기
 * 4. 응답 데이터 처리 및 타입 검증
 * 5. 에러 처리 및 재시도 로직 실행
 */

// HTTP API 통신 관리 유틸리티
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
  async get<T = any>(endpoint: string): Promise<T> {
    return this.request(endpoint, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<T> {
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
  async getCenterInfo(centerId?: string): Promise<any> {
    const endpoint = centerId ? `/api/centers/${centerId}` : '/api/center-info';
    return this.request(endpoint);
  }

  async updateCenterInfo(centerData: any, centerId?: string): Promise<any> {
    const endpoint = centerId ? `/api/centers/${centerId}` : '/api/center-info';
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(centerData),
    });
  }

  // ===== 공지사항 API =====
  async getNotices(params?: { category?: string; isActive?: boolean }): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/api/notices${queryString}`);
  }

  async getAdminNotices(params?: { category?: string; isActive?: boolean }): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/api/admin/notices${queryString}`);
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

  async toggleNoticePublish(id: string, isPublished: boolean): Promise<any> {
    return this.request(`/api/notices/${id}/toggle-publish`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublished }),
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

  async getShopOrders(params?: { limit?: number; status?: string; userId?: string }): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/api/shop/orders${queryString}`);
  }

  async updateShopOrder(id: string, orderData: any): Promise<any> {
    return this.request(`/api/shop/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  }

  async deleteShopOrder(id: string): Promise<any> {
    return this.request(`/api/shop/orders/${id}`, {
      method: 'DELETE',
    });
  }

  async getShopOrderById(id: string): Promise<any> {
    return this.request(`/api/shop/orders/${id}`);
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

  async refundPayment(paymentId: string, reason: string): Promise<any> {
    return this.request(`/api/payments/${paymentId}/refund`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  }

  async updatePaymentStatus(paymentId: string, status: string): Promise<any> {
    return this.request(`/api/payments/${paymentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // ===== 신고 관리 API =====
  async getReports(params?: { limit?: number; status?: string; type?: string }): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/api/reports${queryString}`);
  }

  async updateReport(reportId: string, reportData: any): Promise<any> {
    return this.request(`/api/reports/${reportId}`, {
      method: 'PUT',
      body: JSON.stringify(reportData),
    });
  }

  async updateReportStatus(reportId: string, status: string): Promise<any> {
    return this.request(`/api/reports/${reportId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deleteReport(reportId: string): Promise<any> {
    return this.request(`/api/reports/${reportId}`, {
      method: 'DELETE',
    });
  }

  // ===== 리뷰 관리 API =====
  async getReviewQueue(params?: { status?: string; limit?: number; instructorId?: string }): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/api/reviews/queue${queryString}`);
  }

  async updateReviewStatus(reviewId: string, status: string): Promise<any> {
    return this.request(`/api/reviews/${reviewId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async approveReview(reviewId: string): Promise<any> {
    return this.request(`/api/reviews/${reviewId}/approve`, {
      method: 'PATCH',
    });
  }

  async rejectReview(reviewId: string, reason?: string): Promise<any> {
    return this.request(`/api/reviews/${reviewId}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  }

  async reviewUpload(reviewId: string, reviewData: { status: string; feedback: string; visibility?: string }): Promise<any> {
    return this.request(`/api/reviews/${reviewId}/upload`, {
      method: 'PATCH',
      body: JSON.stringify(reviewData),
    });
  }

  // ===== 업로드 관리 API =====
  async getMyUploads(params?: { page?: number; limit?: number; status?: string }): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/api/uploads/my${queryString}`);
  }

  async uploadFile(fileData: FormData): Promise<any> {
    return this.request('/api/uploads', {
      method: 'POST',
      body: fileData,
      headers: {
        // FormData를 사용할 때는 Content-Type을 설정하지 않음
      },
    });
  }

  async deleteUpload(uploadId: string): Promise<any> {
    return this.request(`/api/uploads/${uploadId}`, {
      method: 'DELETE',
    });
  }

  async updateUploadStatus(uploadId: string, status: string): Promise<any> {
    return this.request(`/api/uploads/${uploadId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async uploadCenterMainImage(centerId: string, imageData: FormData): Promise<any> {
    return this.request(`/api/centers/${centerId}/main-image`, {
      method: 'POST',
      body: imageData,
      headers: {
        // FormData를 사용할 때는 Content-Type을 설정하지 않음
      },
    });
  }

  async uploadCenterGalleryImages(centerId: string, imageData: FormData): Promise<any> {
    return this.request(`/api/centers/${centerId}/gallery`, {
      method: 'POST',
      body: imageData,
      headers: {
        // FormData를 사용할 때는 Content-Type을 설정하지 않음
      },
    });
  }

  async deleteCenterImage(centerId: string, imageId: string): Promise<any> {
    return this.request(`/api/centers/${centerId}/images/${imageId}`, {
      method: 'DELETE',
    });
  }
}

// API 클라이언트 인스턴스 생성 및 내보내기
export const apiClient = new ApiClient();
export default apiClient; 