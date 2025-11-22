/// <reference types="node" />
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
interface ExecResult {
    stdout: string;
    stderr: string;
}
declare const execAsync: (command: string, options?: ExecOptions) => Promise<ExecResult>;
export { execAsync };
//# sourceMappingURL=execAsync.d.ts.map