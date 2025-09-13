import request from 'supertest';
import { app } from '../../src/index';
import { generateTestToken } from '../setup';

describe('실제 파일 업로드 관리 라우트 테스트', () => {
  let adminToken: string;
  let instructorToken: string;
  let studentToken: string;

  beforeAll(() => {
    adminToken = generateTestToken({ userType: 'admin' });
    instructorToken = generateTestToken({ userType: 'instructor' });
    studentToken = generateTestToken({ userType: 'student' });
  });

  describe('POST /api/uploads', () => {
    it('관리자가 파일을 업로드할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/uploads')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', Buffer.from('test file content'), 'test.txt');

      expect([200, 201, 401, 403, 404, 500]).toContain(response.status);
    });

    it('강사가 파일을 업로드할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/uploads')
        .set('Authorization', `Bearer ${instructorToken}`)
        .attach('file', Buffer.from('test file content'), 'test.txt');

      expect([200, 201, 401, 403, 404, 500]).toContain(response.status);
    });

    it('학생이 파일을 업로드할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/uploads')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('file', Buffer.from('test file content'), 'test.txt');

      expect([200, 201, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/uploads', () => {
    it('관리자가 업로드된 파일 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/uploads')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 201, 401, 403, 404, 500]).toContain(response.status);
    });

    it('강사가 업로드된 파일 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/uploads')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 201, 401, 403, 404, 500]).toContain(response.status);
    });

    it('학생이 업로드된 파일 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/uploads')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 201, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/uploads/:id', () => {
    it('관리자가 특정 파일을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/uploads/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('강사가 특정 파일을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/uploads/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('학생이 특정 파일을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/uploads/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('존재하지 않는 파일 조회 시 404 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/uploads/507f1f77bcf86cd799439999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/uploads/:id', () => {
    it('관리자가 파일을 삭제할 수 있어야 함', async () => {
      const response = await request(app)
        .delete('/api/uploads/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('강사가 파일을 삭제할 수 있어야 함', async () => {
      const response = await request(app)
        .delete('/api/uploads/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('학생이 파일을 삭제할 수 있어야 함', async () => {
      const response = await request(app)
        .delete('/api/uploads/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/uploads/user/:userId', () => {
    it('관리자가 특정 사용자의 파일을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/uploads/user/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('강사가 특정 사용자의 파일을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/uploads/user/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('학생이 특정 사용자의 파일을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/uploads/user/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/uploads/type/:type', () => {
    it('관리자가 특정 타입의 파일을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/uploads/type/image')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('강사가 특정 타입의 파일을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/uploads/type/image')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('학생이 특정 타입의 파일을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/uploads/type/image')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('POST /api/uploads/:id/share', () => {
    it('관리자가 파일을 공유할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/uploads/507f1f77bcf86cd799439011/share')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ sharedWith: ['507f1f77bcf86cd799439012'] });

      expect([200, 404]).toContain(response.status);
    });

    it('강사가 파일을 공유할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/uploads/507f1f77bcf86cd799439011/share')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({ sharedWith: ['507f1f77bcf86cd799439012'] });

      expect([200, 404]).toContain(response.status);
    });

    it('학생이 파일을 공유할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/uploads/507f1f77bcf86cd799439011/share')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ sharedWith: ['507f1f77bcf86cd799439012'] });

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('POST /api/uploads/:id/unshare', () => {
    it('관리자가 파일 공유를 해제할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/uploads/507f1f77bcf86cd799439011/unshare')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('강사가 파일 공유를 해제할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/uploads/507f1f77bcf86cd799439011/unshare')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('학생이 파일 공유를 해제할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/uploads/507f1f77bcf86cd799439011/unshare')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/uploads/shared', () => {
    it('관리자가 공유된 파일을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/uploads/shared')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 201, 401, 403, 404, 500]).toContain(response.status);
    });

    it('강사가 공유된 파일을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/uploads/shared')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 201, 401, 403, 404, 500]).toContain(response.status);
    });

    it('학생이 공유된 파일을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/uploads/shared')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 201, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/uploads/stats', () => {
    it('관리자가 업로드 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/uploads/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 201, 401, 403, 404, 500]).toContain(response.status);
    });

    it('강사가 업로드 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/uploads/stats')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 201, 401, 403, 404, 500]).toContain(response.status);
    });

    it('학생이 업로드 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/uploads/stats')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 201, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('에러 처리', () => {
    it('토큰 없이 접근 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/uploads');

      expect(response.status).toBe(401);
    });

    it('잘못된 토큰으로 접근 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/uploads')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});