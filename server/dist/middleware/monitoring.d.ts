import { Request, Response, NextFunction } from 'express';
export declare const apiMonitoring: (req: Request, res: Response, next: NextFunction) => void;
export declare const userActivityTracking: (req: Request, res: Response, next: NextFunction) => void;
export declare const securityEventTracking: (req: Request, res: Response, next: NextFunction) => void;
export declare const errorTracking: (error: any, req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=monitoring.d.ts.map