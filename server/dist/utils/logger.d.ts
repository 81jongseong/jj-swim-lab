import * as winston from 'winston';
declare const logger: winston.Logger;
export declare const logInfo: (message: string, meta?: any) => void;
export declare const logError: (message: string, error?: any) => void;
export declare const logWarn: (message: string, meta?: any) => void;
export declare const logDebug: (message: string, meta?: any) => void;
export declare const logApi: (req: any, res: any, responseTime: number) => void;
export declare const logPerformance: (operation: string, duration: number, details?: any) => void;
export declare const logDatabase: (operation: string, collection: string, duration: number, details?: any) => void;
export default logger;
//# sourceMappingURL=logger.d.ts.map