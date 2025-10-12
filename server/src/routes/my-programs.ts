/**
 * 🏊 SwimLab - 내 프로그램 조회 라우트 (회원용)
 * 
 * 📋 **주요 기능**
 * - 개인 PT 프로그램 조회
 * - 단체반 프로그램 + 개인별 조정사항 조회
 * - 통합 뷰 제공
 */

import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import SwimProgram from '../models/SwimProgram';
import PersonalProgramAdjustment from '../models/PersonalProgramAdjustment';
const GroupClass = require('../models/GroupClass').default;

interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();

/**
 * GET /api/my-programs
 * 내 프로그램 조회 (개인 PT + 단체반 통합)
 */
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    
    console.log(`🔍 프로그램 조회: ${req.user.name} (${userId})`);
    
    const allPrograms: any[] = [];
    
    // 1. 개인 PT 프로그램
    const individualPrograms = await SwimProgram.find({
      athleteId: userId,
      programScope: 'individual'
    }).sort({ createdAt: -1 }).limit(10);
    
    console.log(`  🏊 개인 PT 프로그램: ${individualPrograms.length}개`);
    
    individualPrograms.forEach(p => {
      allPrograms.push({
        ...p.toObject(),
        programSource: 'individual',
        displayName: `${p.athleteName} (개인 PT)`,
        adjustment: null
      });
    });
    
    // 2. 단체반 프로그램
    const myGroupClasses = await GroupClass.find({
      'students.userId': userId,
      status: 'active'
    });
    
    console.log(`  📚 소속 단체반: ${myGroupClasses.length}개`);
    
    for (const gc of myGroupClasses) {
      const groupPrograms = await SwimProgram.find({
        groupClassId: gc._id,
        programScope: 'group'
      }).sort({ createdAt: -1 }).limit(5);
      
      console.log(`    - ${gc.className}: ${groupPrograms.length}개 프로그램`);
      
      for (const gp of groupPrograms) {
        // 개인별 조정사항 조회
        const adjustment = await PersonalProgramAdjustment.findOne({
          programId: gp._id,
          userId
        });
        
        allPrograms.push({
          ...gp.toObject(),
          programSource: 'group',
          displayName: `${gc.className} (단체반)`,
          adjustment: adjustment ? adjustment.toObject() : null
        });
      }
    }
    
    // 날짜순 정렬
    allPrograms.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    console.log(`✅ 총 ${allPrograms.length}개 프로그램 조회 완료`);
    
    return res.json({
      success: true,
      data: {
        programs: allPrograms,
        total: allPrograms.length,
        individual: individualPrograms.length,
        group: allPrograms.length - individualPrograms.length
      }
    });
    
  } catch (error: any) {
    console.error('❌ 프로그램 조회 실패:', error);
    return res.status(500).json({
      success: false,
      message: '프로그램 조회에 실패했습니다.'
    });
  }
});

export default router;








