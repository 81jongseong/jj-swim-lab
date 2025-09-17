import { Request, Response, NextFunction } from 'express';
import { ActivityType, ResourceType } from '../services/userActivityService';
export declare const trackUserActivity: (req: Request, res: Response, next: NextFunction) => void;
export declare const trackSecurityEvents: (req: Request, res: Response, next: NextFunction) => void;
export declare const trackSpecificActivity: (action: ActivityType, resource: ResourceType) => (req: Request, res: Response, next: NextFunction) => void;
export declare const trackFileUpload: (req: Request, res: Response, next: NextFunction) => void;
export declare const trackDataExport: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=userActivity.d.ts.map