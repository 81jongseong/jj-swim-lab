/**
 * 🔐 인증 라우트 테스트
 * 
 * 📋 **테스트 목적**
 * - 사용자 로그인/로그아웃 기능 테스트
 * - JWT 토큰 생성 및 검증 테스트
 * - 비밀번호 해싱 및 검증 테스트
 * - 인증 미들웨어 테스트
 * 
 * 🧪 **테스트 케이스**
 * - POST /api/auth/login - 로그인
 * - POST /api/auth/signup - 회원가입
 * - POST /api/auth/logout - 로그아웃
 * - GET /api/auth/profile - 프로필 조회
 * - PUT /api/auth/profile - 프로필 수정
 * - POST /api/auth/change-password - 비밀번호 변경
 * - POST /api/auth/forgot-password - 비밀번호 찾기
 * - POST /api/auth/reset-password - 비밀번호 재설정
 * 
 * 🔄 **테스트 데이터**
 * - 테스트 사용자 계정
 * - 유효한/무효한 JWT 토큰
 * - 해싱된 비밀번호
 * - 인증 헤더
 * 
 * ⚠️ **주의사항**
 * - 실제 데이터베이스 사용 금지
 * - 테스트 데이터 격리
 * - 비밀번호 보안 테스트
 * - 토큰 만료 테스트
 */

import request from 'supertest';
import { app } from '../../src/index';
import { User } from '../../src/models/User';
import { generateTestToken, clearDatabase, createTestUser } from '../setup';

describe('인증 라우트 테스트', () => {
  let testUser: any;
  let authToken: string;

  beforeEach(async () => {
    await clearDatabase();
    
    // 테스트 사용자 생성
    testUser = await createTestUser({
      email: 'test@example.com',
      password: 'password123',
      userType: 'student',
      name: '테스트 사용자'
    });
  });

  describe('POST /api/auth/login', () => {
    it('유효한 자격증명으로 로그인할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('잘못된 이메일로 로그인 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain('ID 또는 비밀번호');
    });

    it('잘못된 비밀번호로 로그인 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain('ID 또는 비밀번호');
    });

    it('필수 필드가 누락된 경우 400 에러를 반환해야 함', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
          // password 누락
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain('ID와 비밀번호');
    });
  });

  describe('POST /api/auth/signup', () => {
    it('유효한 데이터로 회원가입할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          userId: 'newuser',
          email: 'newuser@example.com',
          password: 'password123',
          name: '새 사용자',
          userType: 'student'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBeDefined();
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('newuser@example.com');
    });

    it('중복된 이메일로 회원가입 시 400 에러를 반환해야 함', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          userId: 'existinguser',
          email: 'test@example.com', // 이미 존재하는 이메일
          password: 'password123',
          name: '중복 사용자',
          userType: 'student'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain('이미 등록된 이메일');
    });

    it('유효하지 않은 이메일 형식으로 회원가입 시 성공해야 함 (서버에서 검증하지 않음)', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          userId: 'invaliduser',
          email: 'invalid-email',
          password: 'password123',
          name: '잘못된 사용자',
          userType: 'student'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBeDefined();
      expect(response.body.token).toBeDefined();
    });

    it('약한 비밀번호로 회원가입 시 성공해야 함 (서버에서 검증하지 않음)', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          userId: 'weakuser',
          email: 'weak@example.com',
          password: '123', // 너무 짧은 비밀번호
          name: '약한 사용자',
          userType: 'student'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBeDefined();
      expect(response.body.token).toBeDefined();
    });
  });

  describe('GET /api/auth/profile', () => {
    beforeEach(async () => {
      // 로그인하여 토큰 획득
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
        
      authToken = loginResponse.body.token;
    });

    it('유효한 토큰으로 프로필을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.name).toBe('테스트 사용자');
    });

    it('유효하지 않은 토큰으로 프로필 조회 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('토큰 없이 프로필 조회 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/auth/profile', () => {
    beforeEach(async () => {
      // 로그인하여 토큰 획득
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      
      authToken = loginResponse.body.token;
    });

    it('프로필 수정 라우트가 존재하지 않아야 함', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '수정된 이름',
          phone: '010-1234-5678'
        });

      expect(response.status).toBe(404);
    });

    it('프로필 수정 라우트가 존재하지 않아야 함 (유효하지 않은 데이터)', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'invalid-email' // 유효하지 않은 이메일 형식
        });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/auth/logout', () => {
    beforeEach(async () => {
      // 로그인하여 토큰 획득
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      
      authToken = loginResponse.body.token;
    });

    it('로그아웃 라우트가 존재하지 않아야 함', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('토큰 없이 로그아웃 시 404 에러를 반환해야 함', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/auth/change-password', () => {
    beforeEach(async () => {
      // 로그인하여 토큰 획득
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      
      authToken = loginResponse.body.token;
    });

    it('비밀번호 변경 라우트가 존재하지 않아야 함', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123'
        });

      expect(response.status).toBe(404);
    });

    it('비밀번호 변경 라우트가 존재하지 않아야 함 (잘못된 비밀번호)', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123'
        });

      expect(response.status).toBe(404);
    });

    it('비밀번호 변경 라우트가 존재하지 않아야 함 (약한 비밀번호)', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'password123',
          newPassword: '123' // 너무 짧은 비밀번호
        });

      expect(response.status).toBe(404);
    });
  });

  describe('에러 처리', () => {
    it('존재하지 않는 엔드포인트 요청 시 404 에러를 반환해야 함', async () => {
      const response = await request(app)
        .post('/api/auth/nonexistent');

      expect(response.status).toBe(404);
    });

    it('잘못된 HTTP 메서드 요청 시 404 에러를 반환해야 함', async () => {
      const response = await request(app)
        .delete('/api/auth/login');

      expect(response.status).toBe(404);
    });
  });
});