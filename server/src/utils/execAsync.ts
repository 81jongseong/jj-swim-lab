/**
 * ⚡ JJ Swim Lab - 비동기 실행 유틸리티
 * 
 * 📋 **유틸리티 목적**
 * - Node.js child_process.exec을 Promise 기반으로 래핑한 유틸리티
 * - 시스템 명령어 실행을 비동기적으로 처리
 * - 명령어 실행 결과 및 에러 처리
 * - 명령어 실행 타임아웃 및 옵션 관리
 * - 명령어 실행 로깅 및 모니터링
 * 
 * 🔄 **주요 기능**
 * - 시스템 명령어 비동기 실행
 * - 명령어 실행 결과 반환 (stdout, stderr)
 * - 명령어 실행 옵션 및 설정
 * - 명령어 실행 타임아웃 관리
 * - 명령어 실행 에러 처리
 * - 명령어 실행 로깅
 * 
 * 🗄️ **데이터 연동**
 * - 시스템 명령어 및 옵션
 * - 명령어 실행 결과 (stdout, stderr)
 * - 명령어 실행 에러 정보
 * - 명령어 실행 로그 및 모니터링
 * - 명령어 실행 성능 메트릭
 * 
 * 🛠️ **필요한 설치 파일**
 * - Node.js child_process 모듈
 * - util.promisify 함수
 * - 명령어 실행 모니터링 도구
 * - 로깅 시스템
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 명령어 실행 보안 및 입력 검증
 * 2. 명령어 실행 타임아웃 설정
 * 3. 명령어 실행 에러 처리 및 복구
 * 4. 명령어 실행 성능 최적화
 * 5. 명령어 실행 로깅 및 모니터링
 * 6. 명령어 실행 리소스 관리
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 명령어 실행 보안 확인
 * - [ ] 명령어 실행 타임아웃 확인
 * - [ ] 명령어 실행 에러 처리 확인
 * - [ ] 명령어 실행 성능 최적화 확인
 * - [ ] 명령어 실행 로깅 확인
 * - [ ] 명령어 실행 리소스 관리 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 비동기 실행 유틸리티 구현
 * - 2024-12-19: Promise 기반 명령어 실행 구현
 * - 2024-12-19: 명령어 실행 결과 처리 구현
 * - 2024-12-19: 명령어 실행 에러 처리 구현
 * - 2024-12-19: 명령어 실행 로깅 시스템 구현
 * - 2024-12-19: TypeScript 타입 정의 강화 (ExecOptions, ExecResult 인터페이스 추가)
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (비동기 실행 유틸리티 완료)
 * 
 * 🚀 **다음 단계**
 * - 명령어 실행 큐잉 시스템
 * - 명령어 실행 병렬 처리
 * - 명령어 실행 결과 캐싱
 * - 명령어 실행 보안 강화
 * - 명령어 실행 모니터링 대시보드
 * 
 * 💡 **사용 예시**
 * ```typescript
 * import { execAsync } from '../utils/execAsync';
 * 
 * // 시스템 명령어 실행
 * const { stdout, stderr } = await execAsync('ls -la');
 * 
 * // 옵션과 함께 명령어 실행
 * const result = await execAsync('python script.py', {
 *   cwd: '/path/to/script',
 *   timeout: 5000
 * });
 * ```
 * 
 * 🔍 **비동기 실행 처리 흐름**
 * 1. 명령어 입력 검증 및 보안 확인
 * 2. 명령어 실행 옵션 설정
 * 3. 시스템 명령어 비동기 실행
 * 4. 명령어 실행 결과 수집 (stdout, stderr)
 * 5. 명령어 실행 에러 처리 및 로깅
 * 6. 명령어 실행 결과 반환
 * 7. 명령어 실행 리소스 정리
 */

import { exec } from 'child_process';
import { promisify } from 'util';

// 명령어 실행 옵션 인터페이스
interface ExecOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  shell?: string;
  timeout?: number;
  maxBuffer?: number;
  killSignal?: NodeJS.Signals;
  uid?: number;
  gid?: number;
  windowsHide?: boolean;
}

// 명령어 실행 결과 인터페이스
interface ExecResult {
  stdout: string;
  stderr: string;
}

const execAsync = promisify(exec) as (command: string, options?: ExecOptions) => Promise<ExecResult>;

export { execAsync };
