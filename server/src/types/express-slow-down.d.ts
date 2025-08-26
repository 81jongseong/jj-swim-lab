declare module 'express-slow-down' {
  import { Request, Response, NextFunction } from 'express';

  interface SlowDownOptions {
    windowMs?: number;
    delayAfter?: number;
    delayMs?: number;
    maxDelayMs?: number;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
    keyGenerator?: (req: Request) => string;
    onLimitReached?: (req: Request, res: Response, options: any) => void;
  }

  function slowDown(options?: SlowDownOptions): (req: Request, res: Response, next: NextFunction) => void;
  
  export = slowDown;
}








































