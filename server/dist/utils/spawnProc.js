"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpawnProc = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
class SpawnProc {
    static async runPython(scriptPath, args = [], options) {
        const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
        const fullArgs = [scriptPath, ...args];
        console.log(`[${options.label}] Python 실행: ${pythonCmd} ${fullArgs.join(' ')}`);
        return this.spawnProcess(pythonCmd, fullArgs, options);
    }
    static async runBlender(scriptPath, args = [], options) {
        const blenderPath = this.getBlenderPath();
        const fullArgs = ['--background', '--python', scriptPath, '--', ...args];
        console.log(`[${options.label}] Blender 실행: ${blenderPath} ${fullArgs.join(' ')}`);
        return this.spawnProcess(blenderPath, fullArgs, options);
    }
    static async spawnProcess(command, args = [], options) {
        return new Promise((resolve, reject) => {
            const childProcess = (0, child_process_1.spawn)(command, args, {
                cwd: options.cwd || process.cwd(),
                env: this.UTF8_ENV,
                stdio: ['pipe', 'pipe', 'pipe']
            });
            let stdout = '';
            let stderr = '';
            let isResolved = false;
            const timeout = options.timeout || 300000;
            const timeoutId = setTimeout(() => {
                if (!isResolved) {
                    isResolved = true;
                    childProcess.kill('SIGTERM');
                    reject(new Error(`[${options.label}] 프로세스 타임아웃 (${timeout}ms)`));
                }
            }, timeout);
            childProcess.stdout?.on('data', (data) => {
                const output = data.toString('utf8');
                stdout += output;
                this.logOutput(output, options.label, 'stdout');
            });
            childProcess.stderr?.on('data', (data) => {
                const output = data.toString('utf8');
                stderr += output;
                this.logOutput(output, options.label, 'stderr');
            });
            childProcess.on('close', (code) => {
                if (isResolved)
                    return;
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
                }
                else {
                    const error = new Error(`[${options.label}] 프로세스 실패: 코드 ${exitCode}`);
                    error.result = {
                        stdout,
                        stderr,
                        exitCode,
                        success: false
                    };
                    reject(error);
                }
            });
            childProcess.on('error', (error) => {
                if (isResolved)
                    return;
                isResolved = true;
                clearTimeout(timeoutId);
                console.error(`[${options.label}] 프로세스 에러:`, error);
                reject(error);
            });
        });
    }
    static logOutput(output, label, type) {
        const lines = output.split('\n').filter(line => line.trim());
        for (const line of lines) {
            const prefix = type === 'stderr' ? `[${label}:ERROR]` : `[${label}]`;
            console.log(`${prefix} ${line}`);
        }
    }
    static getBlenderPath() {
        if (process.platform === 'win32') {
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
                }
                catch (error) {
                    continue;
                }
            }
            return 'blender';
        }
        else {
            return 'blender';
        }
    }
    static async checkFileExists(filePath) {
        try {
            const fs = require('fs').promises;
            await fs.access(filePath);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    static async ensureDir(dirPath) {
        try {
            const fs = require('fs').promises;
            await fs.mkdir(dirPath, { recursive: true });
        }
        catch (error) {
        }
    }
    static resolvePath(inputPath) {
        return path_1.default.resolve(inputPath);
    }
    static normalizePath(inputPath) {
        return path_1.default.normalize(inputPath);
    }
}
exports.SpawnProc = SpawnProc;
SpawnProc.UTF8_ENV = {
    ...process.env,
    PYTHONIOENCODING: 'utf-8',
    LANG: 'C.UTF-8',
    LC_ALL: 'C.UTF-8',
    PYTHONUNBUFFERED: '1'
};
exports.default = SpawnProc;
//# sourceMappingURL=spawnProc.js.map