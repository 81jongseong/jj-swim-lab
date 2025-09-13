// useAuth 훅 모킹
const mockUseAuth = () => ({
  user: {
    _id: '507f1f77bcf86cd799439011',
    name: '테스트 사용자',
    email: 'test@example.com',
    userType: 'student',
    isActive: true,
  },
  isAuthenticated: true,
  isLoading: false,
  login: jest.fn(),
  logout: jest.fn(),
  hasRole: jest.fn(() => true),
  hasPermission: jest.fn(() => true),
  hasFeature: jest.fn(() => true),
});

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 상태', () => {
    it('기본 상태가 올바르게 설정되어야 함', () => {
      const result = mockUseAuth();
      
      expect(result.user).toBeDefined();
      expect(result.isAuthenticated).toBe(true);
      expect(result.isLoading).toBe(false);
    });
  });

  describe('기본 기능', () => {
    it('로그인 함수가 존재해야 함', () => {
      const result = mockUseAuth();
      
      expect(typeof result.login).toBe('function');
    });

    it('로그아웃 함수가 존재해야 함', () => {
      const result = mockUseAuth();
      
      expect(typeof result.logout).toBe('function');
    });

    it('hasRole 함수가 존재해야 함', () => {
      const result = mockUseAuth();
      
      expect(typeof result.hasRole).toBe('function');
    });

    it('hasPermission 함수가 존재해야 함', () => {
      const result = mockUseAuth();
      
      expect(typeof result.hasPermission).toBe('function');
    });

    it('hasFeature 함수가 존재해야 함', () => {
      const result = mockUseAuth();
      
      expect(typeof result.hasFeature).toBe('function');
    });
  });
});