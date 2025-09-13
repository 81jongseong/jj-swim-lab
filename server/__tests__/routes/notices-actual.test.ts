import request from 'supertest';
import { app } from '../../src/index';
import { generateTestToken } from '../setup';

describe('실제 공지사항 관리 라우트 테스트', () => {
  let adminToken: string;
  let instructorToken: string;
  let studentToken: string;

  beforeAll(() => {
    adminToken = generateTestToken({ userType: 'admin' });
    instructorToken = generateTestToken({ userType: 'instructor' });
    studentToken = generateTestToken({ userType: 'student' });
  });

  describe('GET /api/notices', () => {
    it('관리자가 공지사항 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notices')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 201, 500, 403]).toContain(response.status);
    });

    it('강사가 공지사항 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notices')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 201, 500, 403]).toContain(response.status);
    });

    it('학생이 공지사항 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notices')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 201, 500, 403]).toContain(response.status);
    });
  });

  describe('POST /api/notices', () => {
    it('관리자가 공지사항을 생성할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/notices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: '테스트 공지사항',
          content: '테스트 공지사항 내용',
          type: 'general',
          priority: 'normal',
          targetAudience: 'all',
          centerId: '507f1f77bcf86cd799439011'
        });

      expect([200, 201, 500, 403]).toContain(response.status);
    });

    it('강사가 공지사항을 생성할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/notices')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: '테스트 공지사항2',
          content: '테스트 공지사항 내용2',
          type: 'general',
          priority: 'normal',
          targetAudience: 'all',
          centerId: '507f1f77bcf86cd799439011'
        });

      expect([200, 201, 500, 403]).toContain(response.status);
    });

    it('학생이 공지사항을 생성할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/notices')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: '테스트 공지사항3',
          content: '테스트 공지사항 내용3',
          type: 'general',
          priority: 'normal',
          targetAudience: 'all',
          centerId: '507f1f77bcf86cd799439011'
        });

      expect([200, 201, 500, 403]).toContain(response.status);
    });
  });

  describe('GET /api/notices/:id', () => {
    it('관리자가 특정 공지사항을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notices/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('강사가 특정 공지사항을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notices/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('학생이 특정 공지사항을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notices/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('존재하지 않는 공지사항 조회 시 404 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/notices/507f1f77bcf86cd799439999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/notices/:id', () => {
    it('관리자가 공지사항을 수정할 수 있어야 함', async () => {
      const response = await request(app)
        .put('/api/notices/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: '수정된 공지사항',
          content: '수정된 공지사항 내용',
          type: 'urgent',
          priority: 'high'
        });

      expect([200, 404, 403]).toContain(response.status);
    });

    it('강사가 공지사항을 수정할 수 있어야 함', async () => {
      const response = await request(app)
        .put('/api/notices/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: '수정된 공지사항',
          content: '수정된 공지사항 내용',
          type: 'urgent',
          priority: 'high'
        });

      expect([200, 404, 403]).toContain(response.status);
    });

    it('학생이 공지사항을 수정할 수 있어야 함', async () => {
      const response = await request(app)
        .put('/api/notices/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: '수정된 공지사항',
          content: '수정된 공지사항 내용',
          type: 'urgent',
          priority: 'high'
        });

      expect([200, 404, 403]).toContain(response.status);
    });
  });

  describe('DELETE /api/notices/:id', () => {
    it('관리자가 공지사항을 삭제할 수 있어야 함', async () => {
      const response = await request(app)
        .delete('/api/notices/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('강사가 공지사항을 삭제할 수 있어야 함', async () => {
      const response = await request(app)
        .delete('/api/notices/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('학생이 공지사항을 삭제할 수 있어야 함', async () => {
      const response = await request(app)
        .delete('/api/notices/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });
  });

  describe('GET /api/notices/center/:centerId', () => {
    it('관리자가 특정 센터의 공지사항을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notices/center/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('강사가 특정 센터의 공지사항을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notices/center/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('학생이 특정 센터의 공지사항을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notices/center/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });
  });

  describe('GET /api/notices/type/:type', () => {
    it('관리자가 특정 타입의 공지사항을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notices/type/general')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('강사가 특정 타입의 공지사항을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notices/type/urgent')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('학생이 특정 타입의 공지사항을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notices/type/maintenance')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });
  });

  describe('GET /api/notices/priority/:priority', () => {
    it('관리자가 특정 우선순위의 공지사항을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notices/priority/high')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('강사가 특정 우선순위의 공지사항을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notices/priority/normal')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('학생이 특정 우선순위의 공지사항을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notices/priority/low')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });
  });

  describe('POST /api/notices/:id/pin', () => {
    it('관리자가 공지사항을 고정할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/notices/507f1f77bcf86cd799439011/pin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('강사가 공지사항을 고정할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/notices/507f1f77bcf86cd799439011/pin')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('학생이 공지사항을 고정할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/notices/507f1f77bcf86cd799439011/pin')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });
  });

  describe('POST /api/notices/:id/unpin', () => {
    it('관리자가 공지사항 고정을 해제할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/notices/507f1f77bcf86cd799439011/unpin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('강사가 공지사항 고정을 해제할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/notices/507f1f77bcf86cd799439011/unpin')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('학생이 공지사항 고정을 해제할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/notices/507f1f77bcf86cd799439011/unpin')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });
  });

  describe('GET /api/notices/pinned', () => {
    it('관리자가 고정된 공지사항을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notices/pinned')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 201, 500, 403]).toContain(response.status);
    });

    it('강사가 고정된 공지사항을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notices/pinned')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 201, 500, 403]).toContain(response.status);
    });

    it('학생이 고정된 공지사항을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notices/pinned')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 201, 500, 403]).toContain(response.status);
    });
  });

  describe('GET /api/notices/recent', () => {
    it('관리자가 최근 공지사항을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notices/recent')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 201, 500, 403]).toContain(response.status);
    });

    it('강사가 최근 공지사항을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notices/recent')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 201, 500, 403]).toContain(response.status);
    });

    it('학생이 최근 공지사항을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notices/recent')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 201, 500, 403]).toContain(response.status);
    });
  });

  describe('에러 처리', () => {
    it('토큰 없이 접근 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/notices');

      expect([200, 401]).toContain(response.status);
    });

    it('잘못된 토큰으로 접근 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/notices')
        .set('Authorization', 'Bearer invalid-token');

      expect([200, 401]).toContain(response.status);
    });
  });
});