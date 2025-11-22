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
export declare class SpawnProc {
    private static readonly UTF8_ENV;
    static runPython(scriptPath: string, args: string[], options: SpawnOptions): Promise<SpawnResult>;
    static runBlender(scriptPath: string, args: string[], options: SpawnOptions): Promise<SpawnResult>;
    static spawnProcess(command: string, args: string[], options: SpawnOptions): Promise<SpawnResult>;
    private static logOutput;
    private static getBlenderPath;
    static checkFileExists(filePath: string): Promise<boolean>;
    static ensureDir(dirPath: string): Promise<void>;
    static resolvePath(inputPath: string): string;
    static normalizePath(inputPath: string): string;
}
export default SpawnProc;
//# sourceMappingURL=spawnProc.d.ts.map