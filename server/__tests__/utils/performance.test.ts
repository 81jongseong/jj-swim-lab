/**
 * ⚡ JJ Swim Lab - 성능 측정 유틸리티 테스트
 * 
 * 📋 **테스트 목적**
 * - 성능 측정 유틸리티 함수들의 정확성 검증
 * - 메모리 사용량 모니터링 기능 테스트
 * - 함수 실행 시간 측정 기능 테스트
 * - 성능 최적화 도구들의 동작 확인
 * 
 * 🔄 **테스트 범위**
 * - 메모리 사용량 모니터링 함수
 * - CPU 사용량 모니터링 함수
 * - 응답 시간 측정 미들웨어
 * - 배치 처리 최적화 함수
 * - 캐시 성능 최적화 함수
 * - 데이터베이스 인덱스 제안 함수
 * - 연결 풀 최적화 함수
 * - 쿼리 최적화 함수
 * 
 * 🗄️ **테스트 데이터**
 * - 메모리 사용량 테스트 데이터
 * - CPU 사용량 테스트 데이터
 * - 성능 메트릭 테스트 데이터
 * - 최적화 제안 테스트 데이터
 * 
 * 🛠️ **필요한 설정**
 * - Jest 테스트 프레임워크
 * - Node.js 성능 모니터링 API
 * - 메모리 및 CPU 테스트 환경
 * - 성능 측정 도구
 * 
 * ⚠️ **테스트 시 주의사항**
 * 1. 성능 측정 오버헤드 고려
 * 2. 테스트 환경의 일관성 유지
 * 3. 메모리 누수 방지
 * 4. 비동기 함수 처리 주의
 * 5. 타임아웃 설정 적절히 조정
 * 6. 테스트 격리 및 정리
 * 
 * 🔧 **테스트 실행 체크리스트**
 * - [ ] 메모리 사용량 측정 확인
 * - [ ] CPU 사용량 측정 확인
 * - [ ] 응답 시간 측정 확인
 * - [ ] 배치 처리 최적화 확인
 * - [ ] 캐시 성능 최적화 확인
 * - [ ] 인덱스 제안 기능 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 성능 측정 유틸리티 테스트 구현
 * - 2024-12-19: 메모리 모니터링 테스트 추가
 * - 2024-12-19: CPU 모니터링 테스트 추가
 * - 2024-12-19: 응답 시간 측정 테스트 추가
 * - 2024-12-19: 최적화 도구 테스트 추가
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (성능 측정 유틸리티 테스트 완료)
 * 
 * 🚀 **다음 단계**
 * - 실시간 성능 모니터링 테스트
 * - 성능 기반 자동 스케일링 테스트
 * - 성능 예측 및 분석 테스트
 * - 성능 최적화 자동화 테스트
 * - 성능 보안 강화 테스트
 * 
 * 💡 **테스트 실행 예시**
 * ```bash
 * # 성능 측정 유틸리티 테스트 실행
 * npm test __tests__/utils/performance.test.ts
 * 
 * # 특정 성능 측정 테스트 실행
 * npm test __tests__/utils/performance.test.ts -- --testNamePattern="메모리"
 * 
 * # 커버리지와 함께 테스트 실행
 * npm test __tests__/utils/performance.test.ts -- --coverage
 * ```
 * 
 * 🔍 **성능 측정 유틸리티 테스트 처리 흐름**
 * 1. 테스트 환경 준비 및 초기화
 * 2. 메모리 사용량 모니터링 테스트
 * 3. CPU 사용량 모니터링 테스트
 * 4. 응답 시간 측정 테스트
 * 5. 배치 처리 최적화 테스트
 * 6. 캐시 성능 최적화 테스트
 * 7. 최적화 도구 테스트
 */

import { Request, Response, NextFunction } from 'express';
import { 
  getMemoryUsage, 
  getCpuUsage, 
  responseTimeMiddleware, 
  batchProcess, 
  memoize, 
  suggestIndexes, 
  optimizeConnectionPool, 
  optimizeQuery 
} from '../../src/utils/performance';

describe('성능 측정 유틸리티 테스트', () => {
  describe('메모리 사용량 모니터링', () => {
    it('메모리 사용량을 MB 단위로 반환해야 함', () => {
      const memoryUsage = getMemoryUsage();
      
      expect(memoryUsage).toHaveProperty('rss');
      expect(memoryUsage).toHaveProperty('heapTotal');
      expect(memoryUsage).toHaveProperty('heapUsed');
      expect(memoryUsage).toHaveProperty('external');
      expect(memoryUsage).toHaveProperty('arrayBuffers');
      
      // 모든 값이 숫자이고 양수여야 함
      expect(typeof memoryUsage.rss).toBe('number');
      expect(typeof memoryUsage.heapTotal).toBe('number');
      expect(typeof memoryUsage.heapUsed).toBe('number');
      expect(typeof memoryUsage.external).toBe('number');
      expect(typeof memoryUsage.arrayBuffers).toBe('number');
      
      expect(memoryUsage.rss).toBeGreaterThan(0);
      expect(memoryUsage.heapTotal).toBeGreaterThan(0);
      expect(memoryUsage.heapUsed).toBeGreaterThan(0);
    });

    it('메모리 사용량이 증가하면 값이 변경되어야 함', () => {
      const initialMemory = getMemoryUsage();
      
      // 메모리 사용량을 증가시키는 작업
      const largeArray = new Array(10000).fill('test');
      
      const currentMemory = getMemoryUsage();
      
      expect(currentMemory.heapUsed).toBeGreaterThanOrEqual(initialMemory.heapUsed);
    });
  });

  describe('CPU 사용량 모니터링', () => {
    it('CPU 사용량 정보를 반환해야 함', () => {
      const cpuUsage = getCpuUsage();
      
      expect(cpuUsage).toHaveProperty('user');
      expect(cpuUsage).toHaveProperty('system');
      
      expect(typeof cpuUsage.user).toBe('number');
      expect(typeof cpuUsage.system).toBe('number');
      
      expect(cpuUsage.user).toBeGreaterThanOrEqual(0);
      expect(cpuUsage.system).toBeGreaterThanOrEqual(0);
    });
  });

  describe('응답 시간 측정 미들웨어', () => {
    it('응답 시간을 측정해야 함', (done) => {
      const req = {
        method: 'GET',
        originalUrl: '/test'
      } as Request;
      
      const res = {
        statusCode: 200,
        on: jest.fn((event, callback) => {
          if (event === 'finish') {
            setTimeout(callback, 0);
          }
        })
      } as unknown as Response;
      
      const next = jest.fn();
      
      responseTimeMiddleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
      
      done();
    });
  });

  describe('배치 처리 최적화', () => {
    it('배치 단위로 데이터를 처리해야 함', async () => {
      const items = Array.from({ length: 5 }, (_, i) => i);
      const processor = jest.fn((item) => Promise.resolve(item * 2));
      
      const results = await batchProcess(items, processor, 2);
      
      expect(results).toHaveLength(5);
      expect(results).toEqual([0, 2, 4, 6, 8]);
      expect(processor).toHaveBeenCalledTimes(5);
    });

    it('큰 배치를 작은 단위로 나누어 처리해야 함', async () => {
      const items = Array.from({ length: 10 }, (_, i) => i);
      const processor = jest.fn((item) => Promise.resolve(item));
      
      const results = await batchProcess(items, processor, 3);
      
      expect(results).toHaveLength(10);
      expect(processor).toHaveBeenCalledTimes(10);
    });

    it('에러가 발생한 항목을 적절히 처리해야 함', async () => {
      const items = [1, 2, 3];
      const processor = jest.fn((item) => {
        if (item === 2) {
          return Promise.reject(new Error('Processing error'));
        }
        return Promise.resolve(item);
      });
      
      await expect(batchProcess(items, processor, 2)).rejects.toThrow('Processing error');
    });
  });

  describe('캐시 성능 최적화', () => {
    it('함수 결과를 캐시해야 함', () => {
      const expensiveFunction = jest.fn((x) => x * 2);
      const memoizedFunction = memoize(expensiveFunction, 1000);
      
      // 첫 번째 호출
      const result1 = memoizedFunction(5);
      expect(result1).toBe(10);
      expect(expensiveFunction).toHaveBeenCalledTimes(1);
      
      // 두 번째 호출 (캐시에서 반환)
      const result2 = memoizedFunction(5);
      expect(result2).toBe(10);
      expect(expensiveFunction).toHaveBeenCalledTimes(1);
      
      // 다른 매개변수로 호출
      const result3 = memoizedFunction(3);
      expect(result3).toBe(6);
      expect(expensiveFunction).toHaveBeenCalledTimes(2);
    });

    it('TTL이 지나면 캐시를 무효화해야 함', async () => {
      const expensiveFunction = jest.fn((x) => x * 2);
      const memoizedFunction = memoize(expensiveFunction, 100); // 100ms TTL
      
      // 첫 번째 호출
      const result1 = memoizedFunction(5);
      expect(result1).toBe(10);
      expect(expensiveFunction).toHaveBeenCalledTimes(1);
      
      // TTL 대기
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // TTL 이후 호출
      const result2 = memoizedFunction(5);
      expect(result2).toBe(10);
      expect(expensiveFunction).toHaveBeenCalledTimes(2);
    });
  });

  describe('데이터베이스 인덱스 제안', () => {
    it('빈번한 쿼리에 대한 인덱스를 제안해야 함', () => {
      const queries = [
        { collection: 'users', query: { status: 'active' }, frequency: 100 },
        { collection: 'users', query: { age: { $gte: 18 } }, frequency: 50 },
        { collection: 'orders', query: { status: 'pending' }, frequency: 200 },
        { collection: 'orders', query: { date: { $gte: new Date() } }, frequency: 25 }
      ];
      
      const suggestions = suggestIndexes(queries);
      
      expect(suggestions).toHaveLength(4); // frequency > 10인 것만
      expect(suggestions[0].collection).toBe('orders');
      expect(suggestions[0].fields).toEqual(['status']);
      expect(suggestions[0].frequency).toBe(200);
    });

    it('빈도가 낮은 쿼리는 제안하지 않아야 함', () => {
      const queries = [
        { collection: 'users', query: { status: 'active' }, frequency: 5 },
        { collection: 'orders', query: { status: 'pending' }, frequency: 8 }
      ];
      
      const suggestions = suggestIndexes(queries);
      
      expect(suggestions).toHaveLength(0);
    });

    it('빈 쿼리는 제안하지 않아야 함', () => {
      const queries = [
        { collection: 'users', query: {}, frequency: 100 }
      ];
      
      const suggestions = suggestIndexes(queries);
      
      expect(suggestions).toHaveLength(0);
    });
  });

  describe('연결 풀 최적화', () => {
    it('기본 연결 풀 설정을 반환해야 함', () => {
      const poolConfig = optimizeConnectionPool();
      
      expect(poolConfig).toHaveProperty('maxPoolSize');
      expect(poolConfig).toHaveProperty('minPoolSize');
      expect(poolConfig).toHaveProperty('maxIdleTimeMS');
      expect(poolConfig).toHaveProperty('waitQueueTimeoutMS');
      expect(poolConfig).toHaveProperty('serverSelectionTimeoutMS');
      expect(poolConfig).toHaveProperty('socketTimeoutMS');
      expect(poolConfig).toHaveProperty('heartbeatFrequencyMS');
      
      expect(poolConfig.maxPoolSize).toBe(10);
      expect(poolConfig.minPoolSize).toBe(5);
    });

    it('사용자 정의 풀 크기를 적용해야 함', () => {
      const poolConfig = optimizeConnectionPool(20);
      
      expect(poolConfig.maxPoolSize).toBe(20);
      expect(poolConfig.minPoolSize).toBe(10);
    });
  });

  describe('쿼리 최적화', () => {
    it('빈 select 필드를 제거해야 함', () => {
      const query = {
        filter: { status: 'active' },
        select: {},
        sort: {},
        limit: 100
      };
      
      const optimized = optimizeQuery(query);
      
      expect(optimized).not.toHaveProperty('select');
      expect(optimized).not.toHaveProperty('sort');
      expect(optimized.filter).toEqual({ status: 'active' });
      expect(optimized.limit).toBe(100);
    });

    it('빈 sort 필드를 제거해야 함', () => {
      const query = {
        filter: { status: 'active' },
        select: { name: 1 },
        sort: {},
        limit: 100
      };
      
      const optimized = optimizeQuery(query);
      
      expect(optimized).not.toHaveProperty('sort');
      expect(optimized.select).toEqual({ name: 1 });
    });

    it('과도한 limit을 제한해야 함', () => {
      const query = {
        filter: { status: 'active' },
        limit: 2000
      };
      
      const optimized = optimizeQuery(query);
      
      expect(optimized.limit).toBe(1000);
    });

    it('정상적인 limit은 그대로 유지해야 함', () => {
      const query = {
        filter: { status: 'active' },
        limit: 100
      };
      
      const optimized = optimizeQuery(query);
      
      expect(optimized.limit).toBe(100);
    });
  });

  describe('에러 처리', () => {
    it('메모리 정보를 가져올 수 없는 경우 에러를 발생시켜야 함', () => {
      const originalMemoryUsage = process.memoryUsage;
      process.memoryUsage = jest.fn(() => {
        throw new Error('메모리 정보 접근 실패');
      });

      // 에러가 발생해야 함
      expect(() => getMemoryUsage()).toThrow('메모리 정보 접근 실패');

      // 원래 함수 복원
      process.memoryUsage = originalMemoryUsage;
    });

    it('CPU 사용량 정보를 가져올 수 없는 경우 에러를 발생시켜야 함', () => {
      const originalCpuUsage = process.cpuUsage;
      process.cpuUsage = jest.fn(() => {
        throw new Error('CPU 정보 접근 실패');
      });

      // 에러가 발생해야 함
      expect(() => getCpuUsage()).toThrow('CPU 정보 접근 실패');

      // 원래 함수 복원
      process.cpuUsage = originalCpuUsage;
    });
  });
});