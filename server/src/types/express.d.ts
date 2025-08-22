import { Request } from 'express';

// Express Request 타입 확장
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        userType: string;
        centerId?: string;
        email?: string;
        name?: string;
      };
    }
  }
}

// 커스텀 타입들
export interface AuthenticatedRequest extends Request {
  user: {
    _id: string;
    userType: string;
    centerId?: string;
    email?: string;
    name?: string;
  };
}

// requireRole 미들웨어와 호환되는 타입
export interface RequireRoleRequest extends Request {
  user: {
    _id: string;
    userType: string;
    centerId?: string;
    email?: string;
    name?: string;
  };
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface DateRangeQuery {
  startDate?: string;
  endDate?: string;
}
