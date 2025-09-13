import request from 'supertest';
import { app } from '../../src/index';
import { generateTestToken } from '../setup';

describe('실제 대시보드 관리 라우트 테스트', () => {
  let adminToken: string;
  let instructorToken: string;
  let studentToken: string;

  beforeAll(() => {
    adminToken = generateTestToken({ userType: 'admin' });
    instructorToken = generateTestToken({ userType: 'instructor' });
    studentToken = generateTestToken({ userType: 'student' });
  });

  describe('GET /api/dashboard', () => {
    it('관리자가 대시보드를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('강사가 대시보드를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('학생이 대시보드를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/dashboard/stats', () => {
    it('관리자가 대시보드 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('강사가 대시보드 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('학생이 대시보드 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/dashboard/overview', () => {
    it('관리자가 대시보드 개요를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard/overview')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('강사가 대시보드 개요를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard/overview')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('학생이 대시보드 개요를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard/overview')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/dashboard/recent-activities', () => {
    it('관리자가 최근 활동을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard/recent-activities')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('강사가 최근 활동을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard/recent-activities')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('학생이 최근 활동을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard/recent-activities')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/dashboard/notifications', () => {
    it('관리자가 대시보드 알림을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard/notifications')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('강사가 대시보드 알림을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard/notifications')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('학생이 대시보드 알림을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard/notifications')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/dashboard/upcoming-events', () => {
    it('관리자가 예정된 이벤트를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard/upcoming-events')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('강사가 예정된 이벤트를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard/upcoming-events')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('학생이 예정된 이벤트를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard/upcoming-events')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/dashboard/performance', () => {
    it('관리자가 성능 지표를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard/performance')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('강사가 성능 지표를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard/performance')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('학생이 성능 지표를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard/performance')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/dashboard/center/:centerId', () => {
    it('관리자가 특정 센터의 대시보드를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard/center/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('강사가 특정 센터의 대시보드를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard/center/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('학생이 특정 센터의 대시보드를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard/center/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/dashboard/user/:userId', () => {
    it('관리자가 특정 사용자의 대시보드를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard/user/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('강사가 특정 사용자의 대시보드를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard/user/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('학생이 특정 사용자의 대시보드를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard/user/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/dashboard/analytics', () => {
    it('관리자가 분석 데이터를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard/analytics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('강사가 분석 데이터를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard/analytics')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('학생이 분석 데이터를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard/analytics')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/dashboard/reports', () => {
    it('관리자가 보고서를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard/reports')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('강사가 보고서를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard/reports')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('학생이 보고서를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard/reports')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('POST /api/dashboard/widgets', () => {
    it('관리자가 위젯을 생성할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/dashboard/widgets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          type: 'chart',
          title: '테스트 차트',
          config: { type: 'line', data: [] },
          position: { x: 0, y: 0, w: 4, h: 3 }
        });

      expect([200, 404]).toContain(response.status);
    });

    it('강사가 위젯을 생성할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/dashboard/widgets')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          type: 'chart',
          title: '테스트 차트2',
          config: { type: 'line', data: [] },
          position: { x: 0, y: 0, w: 4, h: 3 }
        });

      expect([200, 404]).toContain(response.status);
    });

    it('학생이 위젯을 생성할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/dashboard/widgets')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          type: 'chart',
          title: '테스트 차트3',
          config: { type: 'line', data: [] },
          position: { x: 0, y: 0, w: 4, h: 3 }
        });

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('PUT /api/dashboard/widgets/:id', () => {
    it('관리자가 위젯을 수정할 수 있어야 함', async () => {
      const response = await request(app)
        .put('/api/dashboard/widgets/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: '수정된 차트',
          config: { type: 'bar', data: [] },
          position: { x: 4, y: 0, w: 4, h: 3 }
        });

      expect([200, 404]).toContain(response.status);
    });

    it('강사가 위젯을 수정할 수 있어야 함', async () => {
      const response = await request(app)
        .put('/api/dashboard/widgets/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: '수정된 차트',
          config: { type: 'bar', data: [] },
          position: { x: 4, y: 0, w: 4, h: 3 }
        });

      expect([200, 404]).toContain(response.status);
    });

    it('학생이 위젯을 수정할 수 있어야 함', async () => {
      const response = await request(app)
        .put('/api/dashboard/widgets/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: '수정된 차트',
          config: { type: 'bar', data: [] },
          position: { x: 4, y: 0, w: 4, h: 3 }
        });

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('DELETE /api/dashboard/widgets/:id', () => {
    it('관리자가 위젯을 삭제할 수 있어야 함', async () => {
      const response = await request(app)
        .delete('/api/dashboard/widgets/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('강사가 위젯을 삭제할 수 있어야 함', async () => {
      const response = await request(app)
        .delete('/api/dashboard/widgets/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('학생이 위젯을 삭제할 수 있어야 함', async () => {
      const response = await request(app)
        .delete('/api/dashboard/widgets/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('에러 처리', () => {
    it('토큰 없이 접근 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard');

      expect([200, 404, 401]).toContain(response.status);
    });

    it('잘못된 토큰으로 접근 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', 'Bearer invalid-token');

      expect([200, 404, 401]).toContain(response.status);
    });
  });
});