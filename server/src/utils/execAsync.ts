import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec) as (command: string, options?: any) => Promise<{ stdout: string; stderr: string }>;

export { execAsync };
