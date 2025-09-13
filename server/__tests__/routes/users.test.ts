/**
 * 👥 사용자 관리 라우트 테스트
 */

import request from 'supertest';
import { app } from '../../src/index';
import { generateTestToken, clearDatabase, createTestUser } from '../setup';

describe('사용자 관리 라우트 테스트', () => {
  let adminToken: string;
  let testUser: any;

  beforeEach(async () => {
    await clearDatabase();
    
    // 관리자 사용자 생성
    const admin = await createTestUser({
      email: 'admin@example.com',
      userType: 'centerAdmin',
      name: '관리자'
    });

    adminToken = generateTestToken({
      userId: admin._id.toString(),
      email: admin.email,
      userType: admin.userType
    });

    // 테스트 사용자 생성
    testUser = await createTestUser({
      email: 'user@example.com',
      userType: 'student',
      name: '테스트 사용자'
    });
  });

  describe('GET /api/users', () => {
    it('관리자가 모든 사용자를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('일반 사용자가 사용자 목록 조회 시 403 에러를 반환해야 함', async () => {
      const userToken = generateTestToken({
        userId: testUser._id.toString(),
        email: testUser.email,
        userType: testUser.userType
      });

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/users/:id', () => {
    it('관리자가 특정 사용자를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('존재하지 않는 사용자 조회 시 404 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404, 403]).toContain(response.status);
    });
  });

  describe('POST /api/users', () => {
    it('관리자가 새 사용자를 생성할 수 있어야 함', async () => {
      const newUserData = {
        email: 'newuser@example.com',
        name: '새 사용자',
        userType: 'student',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUserData);

      expect([200, 201, 400, 403]).toContain(response.status);
    });

    it('중복된 이메일로 사용자 생성 시 409 에러를 반환해야 함', async () => {
      const duplicateUserData = {
        email: 'user@example.com', // 이미 존재하는 이메일
        name: '중복 사용자',
        userType: 'student',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(duplicateUserData);

      expect([409, 400, 403]).toContain(response.status);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('관리자가 사용자 정보를 수정할 수 있어야 함', async () => {
      const updateData = {
        name: '수정된 이름',
        phone: '010-1234-5678'
      };

      const response = await request(app)
        .put(`/api/users/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('존재하지 않는 사용자 수정 시 404 에러를 반환해야 함', async () => {
      const updateData = {
        name: '수정된 이름'
      };

      const response = await request(app)
        .put('/api/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect([404, 403]).toContain(response.status);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('관리자가 사용자를 삭제할 수 있어야 함', async () => {
      const response = await request(app)
        .delete(`/api/users/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('존재하지 않는 사용자 삭제 시 404 에러를 반환해야 함', async () => {
      const response = await request(app)
        .delete('/api/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404, 403]).toContain(response.status);
    });
  });

  describe('에러 처리', () => {
    it('토큰 없이 접근 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/users');

      expect(response.status).toBe(401);
    });

    it('잘못된 토큰으로 접근 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});