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

  async login(credentials: { email: string; password: string }): Promise<ApiResponse> {
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
  async getAdminStats(): Promise<ApiResponse> {
    return this.request('/dashboard/admin/stats');
  }

  async getMemberDashboard(): Promise<ApiResponse> {
    return this.request('/dashboard/member');
  }

  async getInstructorDashboard(): Promise<ApiResponse> {
    return this.request('/dashboard/instructor');
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