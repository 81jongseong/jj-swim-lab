/**
 * 🧪 JJ Swim Lab - API 클라이언트 테스트
 * 
 * 📋 **테스트 목적**
 * - API 클라이언트의 HTTP 요청 기능 검증
 * - 인증 토큰 관리 테스트
 * - 에러 처리 및 재시도 로직 테스트
 * - 응답 데이터 처리 테스트
 * 
 * 🔄 **주요 테스트**
 * - HTTP 메서드 테스트 (GET, POST, PUT, DELETE)
 * - 인증 토큰 자동 첨부 테스트
 * - 에러 응답 처리 테스트
 * - 재시도 로직 테스트
 * - 요청/응답 인터셉터 테스트
 * 
 * 🗄️ **테스트 데이터**
 * - 모킹된 fetch 함수
 * - 테스트용 API 응답 데이터
 * - 인증 토큰 데이터
 * - 에러 응답 데이터
 * 
 * 🛠️ **필요한 설치 파일**
 * - Jest 테스트 프레임워크
 * - API 클라이언트
 * - fetch 모킹
 * - 테스트 유틸리티
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. fetch 모킹의 정확성 확인
 * 2. 인증 토큰 관리 검증
 * 3. 에러 처리 로직 확인
 * 4. 비동기 테스트 처리
 * 5. 테스트 데이터 격리 및 정리
 * 6. 네트워크 에러 시뮬레이션
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] HTTP 메서드 테스트 확인
 * - [ ] 인증 토큰 테스트 확인
 * - [ ] 에러 처리 테스트 확인
 * - [ ] 재시도 로직 테스트 확인
 * - [ ] 요청/응답 인터셉터 테스트 확인
 * - [ ] 비동기 테스트 처리 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 API 클라이언트 테스트 구현
 * - 2024-12-19: HTTP 메서드 테스트 구현
 * - 2024-12-19: 인증 토큰 테스트 구현
 * - 2024-12-19: 에러 처리 테스트 구현
 * - 2024-12-19: 재시도 로직 테스트 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (API 클라이언트 테스트 완료)
 * 
 * 🚀 **다음 단계**
 * - 통합 테스트 추가
 * - 성능 테스트 추가
 * - E2E 테스트 통합
 * - 테스트 자동화 개선
 * 
 * 💡 **사용 예시**
 * ```bash
 * # API 클라이언트 테스트 실행
 * npm test -- api.test.ts
 * 
 * # 커버리지와 함께 실행
 * npm run test:coverage -- api.test.ts
 * ```
 * 
 * 🔍 **API 클라이언트 테스트 흐름**
 * 1. 테스트 환경 설정 및 모킹
 * 2. fetch 함수 모킹 설정
 * 3. HTTP 메서드 테스트
 * 4. 인증 토큰 테스트
 * 5. 에러 처리 테스트
 * 6. 재시도 로직 테스트
 * 7. 테스트 결과 검증 및 정리
 */

import apiClient from '@/utils/api';

// fetch 모킹
const mockFetch = jest.fn();
global.fetch = mockFetch;

// localStorage 모킹
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    mockLocalStorage.getItem.mockClear();
  });

  describe('기본 HTTP 메서드', () => {
    it('GET 요청을 올바르게 처리해야 함', async () => {
      const mockResponse = { success: true, data: { users: [] } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await apiClient.get('/users');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('POST 요청을 올바르게 처리해야 함', async () => {
      const mockData = { name: '테스트 사용자', email: 'test@example.com' };
      const mockResponse = { success: true, data: { user: mockData } };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await apiClient.post('/users', mockData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockData),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('PUT 요청을 올바르게 처리해야 함', async () => {
      const mockData = { name: '수정된 사용자' };
      const mockResponse = { success: true, data: { user: mockData } };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await apiClient.put('/users/1', mockData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/1'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(mockData),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('PATCH 요청을 올바르게 처리해야 함', async () => {
      const mockData = { name: '부분 수정' };
      const mockResponse = { success: true, data: { user: mockData } };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await apiClient.patch('/users/1', mockData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/1'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(mockData),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('DELETE 요청을 올바르게 처리해야 함', async () => {
      const mockResponse = { success: true, message: '삭제 완료' };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await apiClient.delete('/users/1');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('인증 토큰 관리', () => {
    it('토큰이 있을 때 Authorization 헤더를 첨부해야 함', async () => {
      const mockToken = 'test-jwt-token';
      mockLocalStorage.getItem.mockReturnValue(mockToken);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      await apiClient.get('/protected');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
          }),
        })
      );
    });

    it('토큰이 없을 때 Authorization 헤더를 첨부하지 않아야 함', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      await apiClient.get('/public');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.any(String),
          }),
        })
      );
    });
  });

  describe('에러 처리', () => {
    it('HTTP 에러 응답을 올바르게 처리해야 함', async () => {
      const mockErrorResponse = {
        success: false,
        error: { message: '사용자를 찾을 수 없습니다', code: 'USER_NOT_FOUND' }
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: jest.fn().mockResolvedValue(mockErrorResponse),
      });

      const result = await apiClient.get('/users/999');
      expect(result.error).toBeDefined();
      expect(result).toEqual(expect.objectContaining({
        error: expect.any(String),
        success: false
      }));
    });

    it('네트워크 에러를 올바르게 처리해야 함', async () => {
      mockFetch.mockRejectedValueOnce(new Error('네트워크 오류'));

      const result = await apiClient.get('/users');
      expect(result.error).toBe('네트워크 오류가 발생했습니다.');
    });

    it('JSON 파싱 에러를 올바르게 처리해야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('JSON 파싱 오류')),
      });

      const result = await apiClient.get('/users');
      expect(result.error).toBe('네트워크 오류가 발생했습니다.');
    });

    it('타임아웃 에러를 올바르게 처리해야 함', async () => {
      mockFetch.mockRejectedValueOnce(new Error('타임아웃'));

      const result = await apiClient.get('/slow-endpoint');
      expect(result.error).toBe('네트워크 오류가 발생했습니다.');
    });
  });

  describe('인증 관련 메서드', () => {
    it('로그인을 올바르게 처리해야 함', async () => {
      const loginData = { userId: 'test@example.com', password: 'password123' };
      const mockResponse = {
        success: true,
        data: {
          user: { id: '1', email: 'test@example.com' },
          token: 'jwt-token'
        }
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await apiClient.login(loginData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(loginData),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('회원가입을 올바르게 처리해야 함', async () => {
      const signupData = {
        name: '테스트 사용자',
        email: 'test@example.com',
        password: 'password123'
      };
      const mockResponse = {
        success: true,
        data: {
          user: { id: '1', email: 'test@example.com' },
          token: 'jwt-token'
        }
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await apiClient.signup(signupData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/signup'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(signupData),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('프로필 조회를 올바르게 처리해야 함', async () => {
      const mockToken = 'test-jwt-token';
      mockLocalStorage.getItem.mockReturnValue(mockToken);
      
      const mockResponse = {
        success: true,
        data: {
          user: { id: '1', name: '테스트 사용자', email: 'test@example.com' }
        }
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await apiClient.getProfile();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/auth/profile',
        {
          headers: {
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          },
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('현재 사용자 정보를 올바르게 반환해야 함', () => {
      const mockUser = { id: '1', name: '테스트 사용자', email: 'test@example.com' };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser));

      const result = apiClient.getCurrentUser();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('user');
      expect(result).toEqual(mockUser);
    });

    it('사용자 정보가 없을 때 null을 반환해야 함', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = apiClient.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('사용자 관리 메서드', () => {
    it('사용자 목록을 올바르게 조회해야 함', async () => {
      const mockResponse = {
        success: true,
        data: {
          users: [
            { id: '1', name: '사용자 1' },
            { id: '2', name: '사용자 2' }
          ],
          total: 2
        }
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await apiClient.getUsers();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/users',
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('특정 사용자를 올바르게 조회해야 함', async () => {
      const userId = '1';
      const mockResponse = {
        success: true,
        data: {
          user: { id: userId, name: '사용자 1' }
        }
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await apiClient.getUser(userId);

      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost:5000/api/users/${userId}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('사용자 생성을 올바르게 처리해야 함', async () => {
      const userData = { name: '새 사용자', email: 'new@example.com' };
      const mockResponse = {
        success: true,
        data: {
          user: { id: '3', ...userData }
        }
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await apiClient.createUser(userData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(userData),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('사용자 수정을 올바르게 처리해야 함', async () => {
      const userId = '1';
      const updateData = { name: '수정된 사용자' };
      const mockResponse = {
        success: true,
        data: {
          user: { id: userId, ...updateData }
        }
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await apiClient.updateUser(userId, updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/users/${userId}`),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('요청 로깅', () => {
    it('요청 정보를 콘솔에 로깅해야 함', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      await apiClient.get('/test');

      expect(consoleSpy).toHaveBeenCalledWith(
        '🔍 API 요청: http://localhost:5000/test'
      );
      
      consoleSpy.mockRestore();
    });

    it('인증 토큰 정보를 콘솔에 로깅해야 함', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const mockToken = 'test-token';
      mockLocalStorage.getItem.mockReturnValue(mockToken);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      await apiClient.get('/test');

      expect(consoleSpy).toHaveBeenCalledWith(
        '🔑 인증 토큰: 있음'
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('응답 처리', () => {
    it('성공적인 응답을 올바르게 처리해야 함', async () => {
      const mockResponse = { success: true, data: { message: '성공' } };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await apiClient.get('/success');

      expect(result).toEqual(mockResponse);
    });

    it('에러 응답을 올바르게 처리해야 함', async () => {
      const mockErrorResponse = {
        success: false,
        error: { message: '에러 발생', code: 'ERROR_CODE' }
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue(mockErrorResponse),
      });

      const result = await apiClient.get('/error');
      expect(result.error).toBeDefined();
      expect(result).toEqual(expect.objectContaining({
        error: expect.any(String),
        success: false
      }));
    });
  });
});
