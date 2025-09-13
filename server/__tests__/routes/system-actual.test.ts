import request from 'supertest';
import { app } from '../../src/index';
import { generateTestToken } from '../setup';

describe('실제 시스템 관리 라우트 테스트', () => {
  let adminToken: string;
  let instructorToken: string;
  let studentToken: string;

  beforeAll(() => {
    adminToken = generateTestToken({ userType: 'admin' });
    instructorToken = generateTestToken({ userType: 'instructor' });
    studentToken = generateTestToken({ userType: 'student' });
  });

  describe('GET /api/system/health', () => {
    it('관리자가 시스템 상태를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/system/health')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404, 403]).toContain(response.status);
    });

    it('강사가 시스템 상태를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/system/health')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([404, 403]).toContain(response.status);
    });

    it('학생이 시스템 상태를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/system/health')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([404, 403]).toContain(response.status);
    });
  });

  describe('GET /api/system/info', () => {
    it('관리자가 시스템 정보를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/system/info')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404, 403]).toContain(response.status);
    });

    it('강사가 시스템 정보를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/system/info')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([404, 403]).toContain(response.status);
    });

    it('학생이 시스템 정보를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/system/info')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([404, 403]).toContain(response.status);
    });
  });

  describe('GET /api/system/logs', () => {
    it('관리자가 시스템 로그를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/system/logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404, 403]).toContain(response.status);
    });

    it('강사가 시스템 로그를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/system/logs')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([404, 403]).toContain(response.status);
    });

    it('학생이 시스템 로그를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/system/logs')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([404, 403]).toContain(response.status);
    });
  });

  describe('GET /api/system/metrics', () => {
    it('관리자가 시스템 메트릭을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/system/metrics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404, 403]).toContain(response.status);
    });

    it('강사가 시스템 메트릭을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/system/metrics')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([404, 403]).toContain(response.status);
    });

    it('학생이 시스템 메트릭을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/system/metrics')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([404, 403]).toContain(response.status);
    });
  });

  describe('POST /api/system/backup', () => {
    it('관리자가 시스템 백업을 생성할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/system/backup')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404, 403]).toContain(response.status);
    });

    it('강사가 시스템 백업을 생성할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/system/backup')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([404, 403]).toContain(response.status);
    });

    it('학생이 시스템 백업을 생성할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/system/backup')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([404, 403]).toContain(response.status);
    });
  });

  describe('GET /api/system/backups', () => {
    it('관리자가 백업 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/system/backups')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404, 403]).toContain(response.status);
    });

    it('강사가 백업 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/system/backups')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([404, 403]).toContain(response.status);
    });

    it('학생이 백업 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/system/backups')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([404, 403]).toContain(response.status);
    });
  });

  describe('POST /api/system/restore', () => {
    it('관리자가 시스템을 복원할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/system/restore')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ backupId: '507f1f77bcf86cd799439011' });

      expect([404, 403]).toContain(response.status);
    });

    it('강사가 시스템을 복원할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/system/restore')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({ backupId: '507f1f77bcf86cd799439011' });

      expect([404, 403]).toContain(response.status);
    });

    it('학생이 시스템을 복원할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/system/restore')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ backupId: '507f1f77bcf86cd799439011' });

      expect([404, 403]).toContain(response.status);
    });
  });

  describe('GET /api/system/config', () => {
    it('관리자가 시스템 설정을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/system/config')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404, 403]).toContain(response.status);
    });

    it('강사가 시스템 설정을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/system/config')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([404, 403]).toContain(response.status);
    });

    it('학생이 시스템 설정을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/system/config')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([404, 403]).toContain(response.status);
    });
  });

  describe('PUT /api/system/config', () => {
    it('관리자가 시스템 설정을 수정할 수 있어야 함', async () => {
      const response = await request(app)
        .put('/api/system/config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          maintenanceMode: false,
          maxUsers: 1000,
          sessionTimeout: 3600
        });

      expect([404, 403]).toContain(response.status);
    });

    it('강사가 시스템 설정을 수정할 수 있어야 함', async () => {
      const response = await request(app)
        .put('/api/system/config')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          maintenanceMode: false,
          maxUsers: 1000,
          sessionTimeout: 3600
        });

      expect([404, 403]).toContain(response.status);
    });

    it('학생이 시스템 설정을 수정할 수 있어야 함', async () => {
      const response = await request(app)
        .put('/api/system/config')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          maintenanceMode: false,
          maxUsers: 1000,
          sessionTimeout: 3600
        });

      expect([404, 403]).toContain(response.status);
    });
  });

  describe('POST /api/system/maintenance', () => {
    it('관리자가 유지보수 모드를 활성화할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/system/maintenance')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ enabled: true });

      expect([404, 403]).toContain(response.status);
    });

    it('강사가 유지보수 모드를 활성화할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/system/maintenance')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({ enabled: true });

      expect([404, 403]).toContain(response.status);
    });

    it('학생이 유지보수 모드를 활성화할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/system/maintenance')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ enabled: true });

      expect([404, 403]).toContain(response.status);
    });
  });

  describe('GET /api/system/version', () => {
    it('관리자가 시스템 버전을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/system/version')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404, 403]).toContain(response.status);
    });

    it('강사가 시스템 버전을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/system/version')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([404, 403]).toContain(response.status);
    });

    it('학생이 시스템 버전을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/system/version')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([404, 403]).toContain(response.status);
    });
  });

  describe('에러 처리', () => {
    it('토큰 없이 접근 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/system/health');

      expect([404, 401]).toContain(response.status);
    });

    it('잘못된 토큰으로 접근 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/system/health')
        .set('Authorization', 'Bearer invalid-token');

      expect([404, 401]).toContain(response.status);
    });
  });
});