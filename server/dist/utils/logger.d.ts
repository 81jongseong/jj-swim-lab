import * as winston from 'winston';
declare const logger: winston.Logger;
declare const httpLogger: winston.Logger;
declare const dbLogger: winston.Logger;
declare const performanceLogger: winston.Logger;
export declare const logInfo: (message: string, meta?: any) => void;
export declare const logError: (message: string, error?: any) => void;
export declare const logWarn: (message: string, meta?: any) => void;
export declare const logDebug: (message: string, meta?: any) => void;
export declare const logHttp: (message: string, meta?: any) => void;
export declare const logDatabase: (message: string, meta?: any) => void;
export declare const logPerformance: (message: string, meta?: any) => void;
export declare const logRequest: (req: any, res: any, responseTime: number) => void;
export declare const logDatabaseQuery: (query: string, executionTime: number) => void;
export declare const logPerformanceMetric: (operation: string, duration: number, meta?: any) => void;
export default logger;
export { httpLogger, dbLogger, performanceLogger };
//# sourceMappingURL=logger.d.ts.map