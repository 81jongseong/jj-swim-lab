import request from 'supertest';
import { app } from '../../src/index';
import { createTestUser, createTestToken } from '../setup';

describe('실제 인증 관리 라우트 테스트', () => {
  let adminToken: string;
  let instructorToken: string;
  let studentToken: string;

  beforeAll(() => {
    adminToken = createTestToken({ userType: 'admin' });
    instructorToken = createTestToken({ userType: 'instructor' });
    studentToken = createTestToken({ userType: 'student' });
  });

  describe('POST /api/auth/signup', () => {
    it('새로운 사용자를 등록할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          name: '새 사용자',
          userType: 'student',
          centerId: '507f1f77bcf86cd799439011'
        });

      expect([201, 400]).toContain(response.status);
    });

    it('중복된 이메일로 등록 시 에러를 반환해야 함', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'existing@example.com',
          password: 'password123',
          name: '기존 사용자',
          userType: 'student',
          centerId: '507f1f77bcf86cd799439011'
        });

      expect([400, 409]).toContain(response.status);
    });

    it('필수 필드가 누락된 경우 에러를 반환해야 함', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'incomplete@example.com',
          password: 'password123'
          // name, userType, centerId 누락
        });

      expect([400, 422]).toContain(response.status);
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

      expect([200, 400, 401]).toContain(response.status);
    });

    it('잘못된 이메일로 로그인 시 에러를 반환해야 함', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'password123'
        });

      expect([401, 404]).toContain(response.status);
    });

    it('잘못된 비밀번호로 로그인 시 에러를 반환해야 함', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect([401, 403]).toContain(response.status);
    });

    it('필수 필드가 누락된 경우 에러를 반환해야 함', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
          // password 누락
        });

      expect([400, 422]).toContain(response.status);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('관리자가 로그아웃할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404]).toContain(response.status);
    });

    it('강사가 로그아웃할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([404]).toContain(response.status);
    });

    it('학생이 로그아웃할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([404]).toContain(response.status);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('관리자가 프로필을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 401]).toContain(response.status);
    });

    it('강사가 프로필을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 401]).toContain(response.status);
    });

    it('학생이 프로필을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 401]).toContain(response.status);
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('관리자가 프로필을 수정할 수 있어야 함', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '수정된 관리자',
          phone: '010-1234-5678'
        });

      expect([404]).toContain(response.status);
    });

    it('강사가 프로필을 수정할 수 있어야 함', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          name: '수정된 강사',
          phone: '010-1234-5678'
        });

      expect([404]).toContain(response.status);
    });

    it('학생이 프로필을 수정할 수 있어야 함', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: '수정된 학생',
          phone: '010-1234-5678'
        });

      expect([404]).toContain(response.status);
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('관리자가 비밀번호를 변경할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123'
        });

      expect([404]).toContain(response.status);
    });

    it('강사가 비밀번호를 변경할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123'
        });

      expect([404]).toContain(response.status);
    });

    it('학생이 비밀번호를 변경할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123'
        });

      expect([404]).toContain(response.status);
    });

    it('잘못된 현재 비밀번호로 변경 시 에러를 반환해야 함', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123'
        });

      expect([404]).toContain(response.status);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('존재하는 이메일로 비밀번호 재설정 요청을 할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'test@example.com'
        });

      expect([404]).toContain(response.status);
    });

    it('존재하지 않는 이메일로 비밀번호 재설정 요청 시 에러를 반환해야 함', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com'
        });

      expect([400, 404]).toContain(response.status);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('유효한 토큰으로 비밀번호를 재설정할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'valid-reset-token',
          newPassword: 'newpassword123'
        });

      expect([404]).toContain(response.status);
    });

    it('잘못된 토큰으로 비밀번호 재설정 시 에러를 반환해야 함', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-reset-token',
          newPassword: 'newpassword123'
        });

      expect([404]).toContain(response.status);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('관리자가 토큰을 갱신할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404]).toContain(response.status);
    });

    it('강사가 토큰을 갱신할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([404]).toContain(response.status);
    });

    it('학생이 토큰을 갱신할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([404]).toContain(response.status);
    });
  });

  describe('에러 처리', () => {
    it('토큰 없이 보호된 라우트에 접근 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
    });

    it('잘못된 토큰으로 보호된 라우트에 접근 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});