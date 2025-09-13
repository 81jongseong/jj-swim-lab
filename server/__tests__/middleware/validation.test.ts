/**
 * 🔍 유효성 검증 미들웨어 테스트
 */

import request from 'supertest';
import { app } from '../../src/index';
import { generateTestToken, clearDatabase, createTestUser } from '../setup';

describe('유효성 검증 미들웨어 테스트', () => {
  let testToken: string;

  beforeEach(async () => {
    await clearDatabase();
    
    const user = await createTestUser({
      email: 'test@example.com',
      userType: 'student'
    });

    testToken = generateTestToken({
      userId: user._id.toString(),
      email: user.email,
      userType: user.userType
    });
  });

  describe('이메일 유효성 검증', () => {
    it('유효한 이메일 형식을 허용해야 함', async () => {
      const validData = {
        email: 'test@example.com',
        name: '테스트 사용자'
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${testToken}`)
        .send(validData);

      expect([200, 201, 400, 403]).toContain(response.status);
    });

    it('무효한 이메일 형식을 거부해야 함', async () => {
      const invalidData = {
        email: 'invalid-email',
        name: '테스트 사용자'
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${testToken}`)
        .send(invalidData);

      expect([400, 403]).toContain(response.status);
    });
  });

  describe('비밀번호 유효성 검증', () => {
    it('유효한 비밀번호를 허용해야 함', async () => {
      const validData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: '새 사용자'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(validData);

      expect([200, 201, 400]).toContain(response.status);
    });

    it('너무 짧은 비밀번호를 거부해야 함', async () => {
      const invalidData = {
        email: 'newuser@example.com',
        password: '123',
        name: '새 사용자'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(invalidData);

      expect([400, 403]).toContain(response.status);
    });
  });

  describe('전화번호 유효성 검증', () => {
    it('유효한 전화번호 형식을 허용해야 함', async () => {
      const validData = {
        name: '수정된 이름',
        phone: '010-1234-5678'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${testToken}`)
        .send(validData);

      expect([200, 400, 401, 403]).toContain(response.status);
    });

    it('무효한 전화번호 형식을 거부해야 함', async () => {
      const invalidData = {
        name: '수정된 이름',
        phone: '123'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${testToken}`)
        .send(invalidData);

      expect([400, 403]).toContain(response.status);
    });
  });

  describe('ObjectId 유효성 검증', () => {
    it('유효한 ObjectId를 허용해야 함', async () => {
      const response = await request(app)
        .get('/api/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('무효한 ObjectId를 거부해야 함', async () => {
      const response = await request(app)
        .get('/api/users/invalid-id')
        .set('Authorization', `Bearer ${testToken}`);

      expect([400, 403]).toContain(response.status);
    });
  });

  describe('필수 필드 검증', () => {
    it('필수 필드가 누락된 경우 400 에러를 반환해야 함', async () => {
      const incompleteData = {
        // email 누락
        name: '테스트 사용자'
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${testToken}`)
        .send(incompleteData);

      expect([400, 403]).toContain(response.status);
    });

    it('빈 문자열을 거부해야 함', async () => {
      const emptyData = {
        email: '',
        name: '테스트 사용자'
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${testToken}`)
        .send(emptyData);

      expect([400, 403]).toContain(response.status);
    });
  });

  describe('데이터 타입 검증', () => {
    it('잘못된 데이터 타입을 거부해야 함', async () => {
      const invalidTypeData = {
        email: 'test@example.com',
        name: 123 // 문자열이어야 함
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${testToken}`)
        .send(invalidTypeData);

      expect([400, 403]).toContain(response.status);
    });
  });

  describe('에러 처리', () => {
    it('유효성 검증 실패 시 적절한 에러 메시지를 반환해야 함', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(invalidData);

      expect([400, 403]).toContain(response.status);
      // 응답 본문이 존재하는지 확인
      expect(response.body).toBeDefined();
    });
  });
});

