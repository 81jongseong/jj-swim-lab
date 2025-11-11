import { spawn } from 'child_process';
import path from 'path';

export interface SpawnOptions {
  label: string;
  cwd?: string;
  timeout?: number;
  encoding?: BufferEncoding;
}

export interface SpawnResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  success: boolean;
}

/**
 * UTF-8 강제 환경으로 프로세스 실행
 * 라벨링된 로그 출력 및 에러 처리 포함
 */
export class SpawnProc {
  private static readonly UTF8_ENV = {
    ...process.env,
    PYTHONIOENCODING: 'utf-8',
    LANG: 'C.UTF-8',
    LC_ALL: 'C.UTF-8',
    PYTHONUNBUFFERED: '1'
  };

  /**
   * Python 스크립트 실행
   */
  static async runPython(
    scriptPath: string,
    args: string[] = [],
    options: SpawnOptions
  ): Promise<SpawnResult> {
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    const fullArgs = [scriptPath, ...args];
    
    console.log(`[${options.label}] Python 실행: ${pythonCmd} ${fullArgs.join(' ')}`);
    
    return this.spawnProcess(pythonCmd, fullArgs, options);
  }

  /**
   * Blender 스크립트 실행
   */
  static async runBlender(
    scriptPath: string,
    args: string[] = [],
    options: SpawnOptions
  ): Promise<SpawnResult> {
    const blenderPath = this.getBlenderPath();
    const fullArgs = ['--background', '--python', scriptPath, '--', ...args];
    
    console.log(`[${options.label}] Blender 실행: ${blenderPath} ${fullArgs.join(' ')}`);
    
    return this.spawnProcess(blenderPath, fullArgs, options);
  }

  /**
   * 일반 프로세스 실행
   */
  static async spawnProcess(
    command: string,
    args: string[] = [],
    options: SpawnOptions
  ): Promise<SpawnResult> {
    return new Promise((resolve, reject) => {
      const childProcess = spawn(command, args, {
        cwd: options.cwd || process.cwd(),
        env: this.UTF8_ENV,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';
      let isResolved = false;

      // 타임아웃 설정
      const timeout = options.timeout || 300000; // 기본 5분
      const timeoutId = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          childProcess.kill('SIGTERM');
          reject(new Error(`[${options.label}] 프로세스 타임아웃 (${timeout}ms)`));
        }
      }, timeout);

      // stdout 처리
      childProcess.stdout?.on('data', (data: Buffer) => {
        const output = data.toString('utf8');
        stdout += output;
        
        // 라벨링된 로그 출력
        this.logOutput(output, options.label, 'stdout');
      });

      // stderr 처리
      childProcess.stderr?.on('data', (data: Buffer) => {
        const output = data.toString('utf8');
        stderr += output;
        
        // 라벨링된 로그 출력
        this.logOutput(output, options.label, 'stderr');
      });

      // 프로세스 종료 처리
      childProcess.on('close', (code: number | null) => {
        if (isResolved) return;
        isResolved = true;
        
        clearTimeout(timeoutId);
        
        const exitCode = code || 0;
        const success = exitCode === 0;
        
        console.log(`[${options.label}] 프로세스 종료: 코드 ${exitCode}`);
        
        if (success) {
          resolve({
            stdout,
            stderr,
            exitCode,
            success: true
          });
        } else {
          const error = new Error(`[${options.label}] 프로세스 실패: 코드 ${exitCode}`);
          (error as any).result = {
            stdout,
            stderr,
            exitCode,
            success: false
          };
          reject(error);
        }
      });

      // 프로세스 에러 처리
      childProcess.on('error', (error: Error) => {
        if (isResolved) return;
        isResolved = true;
        
        clearTimeout(timeoutId);
        console.error(`[${options.label}] 프로세스 에러:`, error);
        reject(error);
      });
    });
  }

  /**
   * 라벨링된 로그 출력
   */
  private static logOutput(output: string, label: string, type: 'stdout' | 'stderr'): void {
    const lines = output.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      const prefix = type === 'stderr' ? `[${label}:ERROR]` : `[${label}]`;
      console.log(`${prefix} ${line}`);
    }
  }

  /**
   * Blender 경로 가져오기
   */
  private static getBlenderPath(): string {
    if (process.platform === 'win32') {
      // Windows에서 Blender 경로 찾기
      const possiblePaths = [
        'C:\\Program Files\\Blender Foundation\\Blender 4.5\\blender.exe',
        'C:\\Program Files\\Blender Foundation\\Blender 4.4\\blender.exe',
        'C:\\Program Files\\Blender Foundation\\Blender 4.3\\blender.exe',
        'C:\\Program Files\\Blender Foundation\\Blender 4.2\\blender.exe',
        'C:\\Program Files\\Blender Foundation\\Blender 4.1\\blender.exe',
        'C:\\Program Files\\Blender Foundation\\Blender 4.0\\blender.exe',
        'C:\\Program Files\\Blender Foundation\\Blender 3.6\\blender.exe',
        'C:\\Program Files\\Blender Foundation\\Blender 3.5\\blender.exe',
        'C:\\Program Files\\Blender Foundation\\Blender 3.4\\blender.exe',
        'C:\\Program Files\\Blender Foundation\\Blender 3.3\\blender.exe',
        'C:\\Program Files\\Blender Foundation\\Blender 3.2\\blender.exe',
        'C:\\Program Files\\Blender Foundation\\Blender 3.1\\blender.exe',
        'C:\\Program Files\\Blender Foundation\\Blender 3.0\\blender.exe'
      ];

      for (const blenderPath of possiblePaths) {
        try {
          const fs = require('fs');
          if (fs.existsSync(blenderPath)) {
            return blenderPath;
          }
        } catch (error) {
          console.debug('Blender 경로 확인 실패', { blenderPath, error });
          continue;
        }
      }

      // 기본 경로 반환 (사용자가 수동으로 설정해야 함)
      return 'blender';
    } else {
      // Linux/macOS
      return 'blender';
    }
  }

  /**
   * 파일 존재 검사
   */
  static async checkFileExists(filePath: string): Promise<boolean> {
    try {
      const fs = require('fs').promises;
      await fs.access(filePath);
      return true;
    } catch (error) {
      console.debug('파일 접근 실패', { filePath, error });
      return false;
    }
  }

  /**
   * 디렉토리 생성
   */
  static async ensureDir(dirPath: string): Promise<void> {
    try {
      const fs = require('fs').promises;
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      console.debug('디렉토리 생성 실패 또는 이미 존재', { dirPath, error });
    }
  }

  /**
   * 절대 경로로 변환
   */
  static resolvePath(inputPath: string): string {
    return path.resolve(inputPath);
  }

  /**
   * 경로 정규화 (Windows 경로 처리)
   */
  static normalizePath(inputPath: string): string {
    return path.normalize(inputPath);
  }
}

export default SpawnProc;
