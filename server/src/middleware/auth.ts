import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

interface AuthRequest extends Request {
  user?: any;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
    }
    
    req.user = user;
    return next();
  } catch (error) {
    console.error('인증 오류:', error);
    return res.status(401).json({ error: '인증에 실패했습니다.' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }
    
    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }
    
    return next();
  };
}; 