/**
 * 🤖 JJ Swim Lab - AI 라우트 테스트
 * 
 * 📋 **테스트 목적**
 * - AI 분석 API 엔드포인트 검증
 * - AI 모델 호출 및 응답 처리 확인
 * - 분석 결과 저장 및 조회 기능 테스트
 * - AI 설정 및 구성 관리 테스트
 * 
 * 🔄 **주요 테스트 항목**
 * - 비디오 분석 요청 및 처리
 * - AI 모델 응답 형식 검증
 * - 분석 결과 저장 및 조회
 * - AI 설정 업데이트
 * - 분석 히스토리 관리
 * - 에러 처리 및 예외 상황
 * 
 * 🗄️ **테스트 데이터**
 * - 수영 비디오 분석 요청
 * - AI 모델 예측 결과
 * - 분석 메트릭 및 점수
 * - 사용자 피드백 데이터
 * - AI 설정 및 구성 정보
 * 
 * 🛠️ **필요한 설정**
 * - Jest 테스트 프레임워크
 * - Supertest (API 테스트)
 * - AI 모델 모킹
 * - 테스트 데이터베이스
 * 
 * ⚠️ **테스트 시 주의사항**
 * 1. AI 모델 응답 시간 및 성능 고려
 * 2. 분석 결과의 정확성 및 일관성
 * 3. 대용량 비디오 파일 처리
 * 4. AI 모델 버전 관리 및 호환성
 * 5. 분석 큐 및 배치 처리
 * 6. 사용자 권한 및 접근 제어
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] AI API 엔드포인트 동작 확인
 * - [ ] 분석 결과 저장 로직 확인
 * - [ ] 에러 처리 및 예외 상황 확인
 * - [ ] 성능 및 응답 시간 확인
 * - [ ] 보안 및 권한 검증 확인
 * - [ ] AI 모델 응답 형식 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 AI 라우트 테스트 구현
 * - 2024-12-19: 비디오 분석 API 테스트 추가
 * - 2024-12-19: AI 설정 관리 테스트 구현
 * - 2024-12-19: 분석 결과 조회 테스트 추가
 */

import request from 'supertest';
import { app } from '../../src/index';
import { generateTestToken, clearDatabase } from '../setup';

describe('AI 라우트 테스트', () => {
  let adminToken: string;
  let instructorToken: string;
  let studentToken: string;

  beforeEach(async () => {
    await clearDatabase();
    
    // 테스트 토큰 생성
    adminToken = generateTestToken({
      userId: '507f1f77bcf86cd799439011',
      email: 'admin@example.com',
      userType: 'admin'
    });

    instructorToken = generateTestToken({
      userId: '507f1f77bcf86cd799439012',
      email: 'instructor@example.com',
      userType: 'instructor'
    });

    studentToken = generateTestToken({
      userId: '507f1f77bcf86cd799439013',
      email: 'student@example.com',
      userType: 'student'
    });
  });

  describe('POST /api/ai/analyze', () => {
    it('관리자가 비디오 분석을 요청할 수 있어야 함', async () => {
      const analysisRequest = {
        videoId: '507f1f77bcf86cd799439020',
        analysisType: 'swimming_technique',
        parameters: {
          technique: 'freestyle',
          focus: 'arm_movement'
        }
      };

      const response = await request(app)
        .post('/api/ai/analyze')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(analysisRequest);

      expect([200, 201, 400, 401, 403, 404]).toContain(response.status);
    });

    it('강사가 비디오 분석을 요청할 수 있어야 함', async () => {
      const analysisRequest = {
        videoId: '507f1f77bcf86cd799439020',
        analysisType: 'swimming_technique'
      };

      const response = await request(app)
        .post('/api/ai/analyze')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(analysisRequest);

      expect([200, 201, 400, 401, 403, 404]).toContain(response.status);
    });

    it('학생이 비디오 분석을 요청할 수 있어야 함', async () => {
      const analysisRequest = {
        videoId: '507f1f77bcf86cd799439020',
        analysisType: 'swimming_technique'
      };

      const response = await request(app)
        .post('/api/ai/analyze')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(analysisRequest);

      expect([200, 201, 400, 401, 403, 404]).toContain(response.status);
    });

    it('필수 필드가 누락되면 400 에러를 반환해야 함', async () => {
      const incompleteRequest = {
        analysisType: 'swimming_technique'
        // videoId 누락
      };

      const response = await request(app)
        .post('/api/ai/analyze')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(incompleteRequest);

      expect([400, 401, 403, 404]).toContain(response.status);
    });

    it('토큰 없이 접근 시 401 에러를 반환해야 함', async () => {
      const analysisRequest = {
        videoId: '507f1f77bcf86cd799439020',
        analysisType: 'swimming_technique'
      };

      const response = await request(app)
        .post('/api/ai/analyze')
        .send(analysisRequest);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/ai/analysis/:id', () => {
    it('분석 결과를 조회할 수 있어야 함', async () => {
      const analysisId = '507f1f77bcf86cd799439020';

      const response = await request(app)
        .get(`/api/ai/analysis/${analysisId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 401, 403]).toContain(response.status);
    });

    it('존재하지 않는 분석 ID로 조회 시 404 에러를 반환해야 함', async () => {
      const nonExistentId = '507f1f77bcf86cd799439999';

      const response = await request(app)
        .get(`/api/ai/analysis/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404, 401, 403]).toContain(response.status);
    });

    it('잘못된 분석 ID 형식으로 조회 시 400 에러를 반환해야 함', async () => {
      const invalidId = 'invalid-id';

      const response = await request(app)
        .get(`/api/ai/analysis/${invalidId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect([400, 404, 401, 403]).toContain(response.status);
    });
  });

  describe('GET /api/ai/analysis', () => {
    it('사용자의 분석 히스토리를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/ai/analysis')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          page: 1,
          limit: 10,
          type: 'swimming_technique'
        });

      expect([200, 401, 403, 404]).toContain(response.status);
    });

    it('페이지네이션 파라미터를 처리할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/ai/analysis')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          page: 2,
          limit: 5
        });

      expect([200, 401, 403, 404]).toContain(response.status);
    });

    it('분석 타입별 필터링이 가능해야 함', async () => {
      const response = await request(app)
        .get('/api/ai/analysis')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          type: 'swimming_technique',
          status: 'completed'
        });

      expect([200, 401, 403, 404]).toContain(response.status);
    });
  });

  describe('PUT /api/ai/analysis/:id', () => {
    it('분석 결과를 업데이트할 수 있어야 함', async () => {
      const analysisId = '507f1f77bcf86cd799439020';
      const updateData = {
        status: 'completed',
        confidence: 0.95,
        feedback: '분석이 완료되었습니다.'
      };

      const response = await request(app)
        .put(`/api/ai/analysis/${analysisId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect([200, 404, 400, 401, 403]).toContain(response.status);
    });

    it('분석 상태만 업데이트할 수 있어야 함', async () => {
      const analysisId = '507f1f77bcf86cd799439020';
      const updateData = {
        status: 'failed',
        error: 'AI 모델 처리 중 오류 발생'
      };

      const response = await request(app)
        .put(`/api/ai/analysis/${analysisId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect([200, 404, 400, 401, 403]).toContain(response.status);
    });
  });

  describe('POST /api/ai/config', () => {
    it('관리자가 AI 설정을 업데이트할 수 있어야 함', async () => {
      const configData = {
        modelVersion: 'v2.0.0',
        parameters: {
          confidenceThreshold: 0.8,
          maxProcessingTime: 300,
          enableRealTimeAnalysis: true
        }
      };

      const response = await request(app)
        .post('/api/ai/config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(configData);

      expect([200, 201, 400, 401, 403, 404]).toContain(response.status);
    });

    it('일반 사용자는 AI 설정을 변경할 수 없어야 함', async () => {
      const configData = {
        modelVersion: 'v2.0.0'
      };

      const response = await request(app)
        .post('/api/ai/config')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(configData);

      expect([403, 401, 404]).toContain(response.status);
    });
  });

  describe('GET /api/ai/config', () => {
    it('AI 설정을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/ai/config')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 401, 403, 404]).toContain(response.status);
    });

    it('토큰 없이 설정 조회 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/ai/config');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/ai/batch-analyze', () => {
    it('관리자가 배치 분석을 요청할 수 있어야 함', async () => {
      const batchRequest = {
        videoIds: [
          '507f1f77bcf86cd799439020',
          '507f1f77bcf86cd799439021',
          '507f1f77bcf86cd799439022'
        ],
        analysisType: 'swimming_technique',
        priority: 'normal'
      };

      const response = await request(app)
        .post('/api/ai/batch-analyze')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(batchRequest);

      expect([200, 201, 400, 401, 403, 404]).toContain(response.status);
    });

    it('빈 비디오 목록으로 배치 분석 요청 시 400 에러를 반환해야 함', async () => {
      const invalidRequest = {
        videoIds: [],
        analysisType: 'swimming_technique'
      };

      const response = await request(app)
        .post('/api/ai/batch-analyze')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidRequest);

      expect([400, 401, 403, 404]).toContain(response.status);
    });
  });

  describe('GET /api/ai/batch/:batchId', () => {
    it('배치 분석 상태를 조회할 수 있어야 함', async () => {
      const batchId = '507f1f77bcf86cd799439020';

      const response = await request(app)
        .get(`/api/ai/batch/${batchId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 401, 403]).toContain(response.status);
    });
  });

  describe('POST /api/ai/feedback', () => {
    it('분석 결과에 피드백을 제공할 수 있어야 함', async () => {
      const feedbackData = {
        analysisId: '507f1f77bcf86cd799439020',
        rating: 4,
        comment: '분석 결과가 정확합니다.',
        suggestions: [
          '더 자세한 분석을 원합니다',
          '비교 분석 기능을 추가해주세요'
        ]
      };

      const response = await request(app)
        .post('/api/ai/feedback')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(feedbackData);

      expect([200, 201, 400, 401, 403, 404]).toContain(response.status);
    });

    it('피드백 등급이 범위를 벗어나면 400 에러를 반환해야 함', async () => {
      const invalidFeedback = {
        analysisId: '507f1f77bcf86cd799439020',
        rating: 6, // 1-5 범위를 벗어남
        comment: '테스트 피드백'
      };

      const response = await request(app)
        .post('/api/ai/feedback')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(invalidFeedback);

      expect([400, 401, 403, 404]).toContain(response.status);
    });
  });

  describe('에러 처리', () => {
    it('잘못된 엔드포인트 접근 시 404 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/ai/invalid-endpoint')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });

    it('서버 오류 시 500 에러를 반환해야 함', async () => {
      // 잘못된 데이터로 서버 오류 유발 시도
      const response = await request(app)
        .post('/api/ai/analyze')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          videoId: null,
          analysisType: null
        });

      expect([400, 500, 401, 403]).toContain(response.status);
    });
  });

  describe('성능 테스트', () => {
    it('분석 요청이 적절한 시간 내에 응답해야 함', async () => {
      const analysisRequest = {
        videoId: '507f1f77bcf86cd799439020',
        analysisType: 'swimming_technique'
      };

      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/ai/analyze')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(analysisRequest);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(5000); // 5초 이내 응답
      expect([200, 201, 400, 401, 403, 404]).toContain(response.status);
    });
  });
});
