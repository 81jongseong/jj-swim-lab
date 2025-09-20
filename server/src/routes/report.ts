/**
 * @file 리포트 API 라우트
 * @description 리포트 관련 API 엔드포인트들을 정의합니다.
 * @date 2025-09-14
 * @author JJ Swim Lab
 */

import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { Report } from '../models/Report';
import { AdminReport } from '../models/AdminReport';

const router: express.Router = express.Router();

// 센터 리포트 조회 API
router.get('/', authMiddleware, async (req: any, res: any) => {
  try {
    const reports = await Report.find({}).populate('centerId');
    res.json({ 
      success: true, 
      data: { reports },
      count: reports.length 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 관리자 리포트 조회 API
router.get('/admin', authMiddleware, async (req: any, res: any) => {
  try {
    const { limit = 50, status, type } = req.query;
    
    let filter: any = {};
    if (status && status !== 'all') filter.status = status;
    if (type && type !== 'all') filter.type = type;
    
    const reports = await AdminReport.find(filter)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('centerId', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
      
    res.json({ 
      success: true, 
      data: { reports },
      count: reports.length 
    });
  } catch (error) {
    console.error('관리자 리포트 조회 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 관리자 리포트 생성 API
router.post('/admin', authMiddleware, async (req: any, res: any) => {
  try {
    const {
      title,
      description,
      type,
      status = 'open',
      priority = 'medium',
      category,
      tags = [],
      centerId
    } = req.body;

    const adminReport = new AdminReport({
      title,
      description,
      type,
      status,
      priority,
      reportedBy: req.user._id,
      category,
      tags,
      ...(centerId && { centerId })
    });

    await adminReport.save();
    
    res.json({
      success: true,
      data: adminReport,
      message: '관리자 리포트가 성공적으로 생성되었습니다.'
    });
  } catch (error) {
    console.error('관리자 리포트 생성 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 관리자 리포트 수정 API
router.put('/admin/:id', authMiddleware, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const adminReport = await AdminReport.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('reportedBy', 'name email')
     .populate('assignedTo', 'name email')
     .populate('centerId', 'name');

    if (!adminReport) {
      return res.status(404).json({ success: false, message: '리포트를 찾을 수 없습니다.' });
    }
    
    res.json({
      success: true,
      data: adminReport,
      message: '관리자 리포트가 성공적으로 수정되었습니다.'
    });
  } catch (error) {
    console.error('관리자 리포트 수정 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 관리자 리포트 상태 업데이트 API
router.patch('/admin/:id/status', authMiddleware, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const adminReport = await AdminReport.findByIdAndUpdate(
      id,
      { status, ...(status === 'resolved' && { resolvedAt: new Date() }) },
      { new: true }
    );

    if (!adminReport) {
      return res.status(404).json({ success: false, message: '리포트를 찾을 수 없습니다.' });
    }
    
    res.json({
      success: true,
      data: adminReport,
      message: '리포트 상태가 성공적으로 업데이트되었습니다.'
    });
  } catch (error) {
    console.error('리포트 상태 업데이트 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 관리자 리포트 삭제 API
router.delete('/admin/:id', authMiddleware, async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const adminReport = await AdminReport.findByIdAndDelete(id);

    if (!adminReport) {
      return res.status(404).json({ success: false, message: '리포트를 찾을 수 없습니다.' });
    }
    
    res.json({
      success: true,
      message: '관리자 리포트가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('관리자 리포트 삭제 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 센터 리포트 생성 API
router.post('/', authMiddleware, async (req: any, res: any) => {
  try {
    const {
      period,
      totalStudents,
      totalRevenue,
      totalClasses,
      averageRating,
      newStudents,
      retentionRate,
      centerId
    } = req.body;

    const report = new Report({
      period,
      totalStudents,
      totalRevenue,
      totalClasses,
      averageRating,
      newStudents,
      retentionRate,
      centerId
    });

    await report.save();
    
    res.json({
      success: true,
      data: report,
      message: '센터 리포트가 성공적으로 생성되었습니다.'
    });
  } catch (error) {
    console.error('센터 리포트 생성 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

export default router;