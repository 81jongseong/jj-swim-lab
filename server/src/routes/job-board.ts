/**
 * 💼 JJ Swim Lab - 구인구직 지원 API 라우트
 * 
 * 📋 **기능**:
 * - 구인구직 게시글 지원
 * - 지원 목록 조회 (센터 관리자용)
 * - 지원 상태 업데이트 (서류 통과, 면접 일정 등)
 * - 면접 알림 전송
 * 
 * 🔗 **연동 파일**:
 * - server/src/models/JobApplication.ts
 * - server/src/models/Community.ts (구인구직 게시글)
 * - server/src/models/User.ts (강사 정보)
 * - server/src/models/Notification.ts (알림)
 */

import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { JobApplication } from '../models/JobApplication';
import { CommunityPost } from '../models/Community';
import { User } from '../models/User';
import { Notification } from '../models/Notification';
import mongoose from 'mongoose';

// User 모델 import 확인
import '../models/User';

const router = Router();

/**
 * POST /api/job-board/apply
 * 구인구직 게시글 지원
 */
router.post('/apply', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { postId, coverLetter } = req.body;
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    // 강사만 지원 가능
    if (user.userType !== 'instructor') {
      return res.status(403).json({
        success: false,
        message: '강사만 지원할 수 있습니다.'
      });
    }

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: '게시글 ID가 필요합니다.'
      });
    }

    // 게시글 확인
    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '게시글을 찾을 수 없습니다.'
      });
    }

    if (post.roomType !== 'job_board') {
      return res.status(400).json({
        success: false,
        message: '구인구직 게시글이 아닙니다.'
      });
    }

    // 중복 지원 확인
    const existingApplication = await JobApplication.findOne({
      postId,
      applicantId: user._id || user.id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: '이미 지원한 게시글입니다.'
      });
    }

    // 지원 생성
    const application = new JobApplication({
      postId,
      applicantId: user._id || user.id,
      centerId: post.roomSpecific?.jobBoard?.centerId,
      status: 'applied',
      coverLetter: coverLetter || ''
    });

    await application.save();

    // populate로 관련 정보 포함
    await application.populate('postId', 'title');
    await application.populate('applicantId', 'name email phone');
    if (application.centerId) {
      await application.populate('centerId', 'name');
    }

    console.log('✅ 지원 등록 성공:', application._id);

    res.json({
      success: true,
      data: application,
      message: '지원이 완료되었습니다.'
    });
  } catch (error: any) {
    console.error('❌ 지원 등록 오류:', error);
    res.status(500).json({
      success: false,
      message: error.message || '지원 등록 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/job-board/applications
 * 지원 목록 조회 (센터 관리자용)
 */
router.get('/applications', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { postId, status } = req.query;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    // 센터 관리자만 조회 가능
    if (user.userType !== 'centerAdmin' && user.userType !== 'center-admin' && user.userType !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: '센터 관리자만 조회할 수 있습니다.'
      });
    }

    const filter: any = {};

    // 특정 게시글의 지원만 조회
    if (postId) {
      filter.postId = postId;
    }

    // 상태 필터
    if (status) {
      filter.status = status;
    }

    // 센터 관리자는 자신의 센터 지원만 조회
    if (user.userType === 'centerAdmin' || user.userType === 'center-admin') {
      const centerId = user.centerId || (user.memberships && user.memberships.length > 0 
        ? user.memberships.find((m: any) => m.role === 'centerAdmin')?.centerId 
        : null);
      
      if (centerId) {
        filter.centerId = centerId;
      } else {
        // 센터 ID가 없으면 빈 결과 반환
        return res.json({
          success: true,
          data: []
        });
      }
    }

    const applications = await JobApplication.find(filter)
      .populate('postId', 'title content roomSpecific')
      .populate('applicantId', 'name email phone instructorInfo')
      .populate('centerId', 'name')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('지원 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '지원 목록 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/job-board/applications/my
 * 내 지원 목록 조회 (강사용)
 */
router.get('/applications/my', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    const applications = await JobApplication.find({
      applicantId: user._id || user.id
    })
      .populate({
        path: 'postId',
        select: 'title content roomSpecific',
        populate: {
          path: 'roomSpecific.jobBoard.centerId',
          select: 'name',
          model: mongoose.models.Center || mongoose.models.SwimmingCenter || 'Center'
        }
      })
      .populate({
        path: 'centerId',
        select: 'name',
        model: mongoose.models.Center || mongoose.models.SwimmingCenter || 'Center'
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('내 지원 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '지원 목록 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * PUT /api/job-board/applications/:id
 * 지원 상태 업데이트 (서류 통과, 면접 일정 등)
 */
router.put('/applications/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { status, interviewDate, interviewTime, interviewLocation, interviewNotes, documentScore, interviewScore, evaluationNotes } = req.body;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    const application = await JobApplication.findById(req.params.id)
      .populate('postId')
      .populate('applicantId', 'name email phone');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: '지원 정보를 찾을 수 없습니다.'
      });
    }

    // 권한 확인: 센터 관리자 또는 최고 관리자만 수정 가능
    const post = application.postId as any;
    const isCenterAdmin = (user.userType === 'centerAdmin' || user.userType === 'center-admin') && 
      post.roomSpecific?.jobBoard?.centerId?.toString() === (user.centerId || user.memberships?.find((m: any) => m.role === 'centerAdmin')?.centerId)?.toString();
    const isSuperAdmin = user.userType === 'superAdmin';

    if (!isCenterAdmin && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: '수정 권한이 없습니다.'
      });
    }

    // 상태 업데이트
    if (status) {
      application.status = status;
      
      // ⭐ 합격 처리 시 강사 계정에 centerId 설정 (최종합격, 면접합격 포함)
      if (status === 'hired' || status === 'accepted' || status === 'final_passed' || status === 'interview_passed') {
        const applicant = application.applicantId as any;
        const applicantId = applicant._id || applicant;
        
        // centerId 추출
        let centerId = post.roomSpecific?.jobBoard?.centerId;
        if (centerId && typeof centerId === 'object' && centerId._id) {
          centerId = centerId._id;
        }
        centerId = centerId?.toString ? centerId.toString() : centerId;
        
        if (centerId) {
          // 강사 계정 업데이트
          const instructor = await User.findById(applicantId);
          if (instructor && instructor.userType === 'instructor') {
            instructor.centerId = new mongoose.Types.ObjectId(centerId);
            
            // instructorInfo.assignedCenters에도 추가
            if (!instructor.instructorInfo) {
              instructor.instructorInfo = {} as any;
            }
            const assignedCenters = (instructor.instructorInfo as any).assignedCenters || [];
            if (!assignedCenters.includes(centerId)) {
              assignedCenters.push(new mongoose.Types.ObjectId(centerId));
              (instructor.instructorInfo as any).assignedCenters = assignedCenters;
            }
            
            await instructor.save();
            console.log('✅ 강사 계정에 centerId 설정 완료:', {
              instructorId: instructor._id,
              instructorName: instructor.name,
              centerId: centerId
            });
          }
        }
      }
    }

    // 면접 정보 업데이트
    if (interviewDate) {
      application.interviewDate = new Date(interviewDate);
    }
    if (interviewTime) {
      application.interviewTime = interviewTime;
    }
    if (interviewLocation) {
      application.interviewLocation = interviewLocation;
    }
    if (interviewNotes) {
      application.interviewNotes = interviewNotes;
    }

    // 평가 점수 업데이트
    if (documentScore !== undefined) {
      application.documentScore = documentScore;
    }
    if (interviewScore !== undefined) {
      application.interviewScore = interviewScore;
    }
    if (evaluationNotes) {
      application.evaluationNotes = evaluationNotes;
    }

    // 총점 계산
    if (application.documentScore !== undefined && application.interviewScore !== undefined) {
      application.totalScore = application.documentScore + application.interviewScore;
    }

    // 면접 일정이 설정되고 상태가 'interview_scheduled'로 변경되면 알림 전송
    let notificationSent = false;
    if (status === 'interview_scheduled' && application.interviewDate && !application.notificationSent) {
      const applicant = application.applicantId as any;
      void applicant;
      const centerName = post.roomSpecific?.jobBoard?.centerId?.name || '센터';
      
      const interviewDateStr = new Date(application.interviewDate).toLocaleDateString('ko-KR');
      const interviewTimeStr = application.interviewTime || '시간 미정';

      // 면접 알림 생성
      const notification = await Notification.create({
        userId: application.applicantId,
        type: 'system',
        title: '📅 면접 일정 안내',
        message: `"${post.title}" 공고에 대한 면접 일정이 확정되었습니다.\n\n면접 일시: ${interviewDateStr} ${interviewTimeStr}\n면접 장소: ${application.interviewLocation || centerName}\n\n면접 준비를 잘 해주세요!`,
        data: {
          applicationId: application._id,
          postId: post._id,
          interviewDate: application.interviewDate,
          interviewTime: application.interviewTime,
          interviewLocation: application.interviewLocation
        },
        priority: 'high'
      });

      application.notificationSent = true;
      application.notificationSentAt = new Date();
      notificationSent = true;

      console.log('✅ 면접 알림 전송 완료:', notification._id);
    }

    await application.save();

    // populate로 관련 정보 포함
    await application.populate('postId', 'title content roomSpecific');
    await application.populate('applicantId', 'name email phone instructorInfo');
    if (application.centerId) {
      await application.populate('centerId', 'name');
    }

    res.json({
      success: true,
      data: application,
      message: notificationSent ? '지원 상태가 업데이트되었고 면접 알림이 전송되었습니다.' : '지원 상태가 업데이트되었습니다.'
    });
  } catch (error: any) {
    console.error('지원 상태 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      message: error.message || '지원 상태 업데이트 중 오류가 발생했습니다.'
    });
  }
});

/**
 * PUT /api/job-board/applications/:id/respond
 * 면접 수락/거부 응답
 */
router.put('/applications/:id/respond', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { response } = req.body; // 'accept' or 'reject'

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    if (!response || !['accept', 'reject'].includes(response)) {
      return res.status(400).json({
        success: false,
        message: '응답은 accept 또는 reject여야 합니다.'
      });
    }

    const application = await JobApplication.findById(req.params.id)
      .populate({
        path: 'postId',
        populate: {
          path: 'authorId',
          select: 'name email userType _id'
        }
      })
      .populate({
        path: 'applicantId',
        select: 'name email phone _id'
      })
      .populate('centerId', 'name');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: '지원 정보를 찾을 수 없습니다.'
      });
    }

    // 권한 확인: 지원자 본인만 응답 가능
    // applicantId가 populate되었을 수 있으므로 ObjectId로 변환하여 비교
    const applicantId = application.applicantId._id ? application.applicantId._id.toString() : application.applicantId.toString();
    const userId = (user._id || user.id || user.userId).toString();
    
    console.log('🔍 면접 응답 권한 확인:', {
      applicantId,
      userId,
      match: applicantId === userId,
      applicationStatus: application.status
    });

    if (applicantId !== userId) {
      return res.status(403).json({
        success: false,
        message: '응답 권한이 없습니다. 본인의 지원만 응답할 수 있습니다.'
      });
    }

    // 면접 일정이 있는 경우만 응답 가능
    if (application.status !== 'interview_scheduled') {
      return res.status(400).json({
        success: false,
        message: '면접 일정이 확정된 지원만 응답할 수 있습니다.'
      });
    }

    // 응답 처리
    if (response === 'accept') {
      application.status = 'interview_passed'; // 면접 예정으로 변경 (실제 면접 후 결과는 별도로)
      // 면접 수락 알림을 센터 관리자에게 전송
      const post = application.postId as any;
      
      // centerId 추출: populate된 객체이거나 ObjectId일 수 있음
      let centerId = post.roomSpecific?.jobBoard?.centerId;
      if (centerId && typeof centerId === 'object' && centerId._id) {
        centerId = centerId._id;
      }
      centerId = centerId?.toString ? centerId.toString() : centerId;
      
      console.log('🔍 면접 수락 알림 - 센터 ID:', centerId);
      
      // 센터 관리자 찾기
      const centerAdmins = await User.find({
        userType: { $in: ['centerAdmin', 'center-admin'] },
        $or: [
          { centerId: centerId },
          { 'centerAdminInfo.managedCenters': centerId }
        ]
      }).select('_id name email');

      console.log('🔍 찾은 센터 관리자 수:', centerAdmins.length);

      if (centerAdmins.length === 0) {
        // centerId가 없거나 찾을 수 없는 경우, 공고 작성자를 찾기
        const postAuthor = await User.findById(post.authorId || post.authorId?._id).select('_id name email');
        if (postAuthor && (postAuthor.userType === 'centerAdmin' || postAuthor.userType === 'center-admin')) {
          centerAdmins.push(postAuthor);
          console.log('🔍 공고 작성자를 센터 관리자로 추가:', postAuthor._id);
        }
      }

      for (const admin of centerAdmins) {
        const notification = await Notification.create({
          userId: admin._id,
          type: 'system',
          title: '✅ 면접 수락 알림',
          message: `${(application.applicantId as any).name} 강사가 면접을 수락했습니다.\n\n면접 일시: ${new Date(application.interviewDate!).toLocaleDateString('ko-KR')} ${application.interviewTime || ''}\n공고: ${post.title}`,
          data: {
            applicationId: application._id,
            postId: post._id || post._id?.toString(),
            response: 'accept'
          },
          priority: 'high'
        });
        console.log('✅ 면접 수락 알림 생성 완료:', notification._id, '-> 사용자:', admin._id);
      }
    } else {
      application.status = 'withdrawn';
      application.interviewNotes = '면접 거부됨';
      
      // 면접 거부 알림을 센터 관리자에게 전송
      const post = application.postId as any;
      
      // centerId 추출: populate된 객체이거나 ObjectId일 수 있음
      let centerId = post.roomSpecific?.jobBoard?.centerId;
      if (centerId && typeof centerId === 'object' && centerId._id) {
        centerId = centerId._id;
      }
      centerId = centerId?.toString ? centerId.toString() : centerId;
      
      console.log('🔍 면접 거부 알림 - 센터 ID:', centerId);
      
      // 센터 관리자 찾기
      const centerAdmins = await User.find({
        userType: { $in: ['centerAdmin', 'center-admin'] },
        $or: [
          { centerId: centerId },
          { 'centerAdminInfo.managedCenters': centerId }
        ]
      }).select('_id name email');

      console.log('🔍 찾은 센터 관리자 수:', centerAdmins.length);

      if (centerAdmins.length === 0) {
        // centerId가 없거나 찾을 수 없는 경우, 공고 작성자를 찾기
        const postAuthor = await User.findById(post.authorId || post.authorId?._id).select('_id name email');
        if (postAuthor && (postAuthor.userType === 'centerAdmin' || postAuthor.userType === 'center-admin')) {
          centerAdmins.push(postAuthor);
          console.log('🔍 공고 작성자를 센터 관리자로 추가:', postAuthor._id);
        }
      }

      for (const admin of centerAdmins) {
        const notification = await Notification.create({
          userId: admin._id,
          type: 'system',
          title: '❌ 면접 거부 알림',
          message: `${(application.applicantId as any).name} 강사가 면접을 거부했습니다.\n\n공고: ${post.title}`,
          data: {
            applicationId: application._id,
            postId: post._id || post._id?.toString(),
            response: 'reject'
          },
          priority: 'medium'
        });
        console.log('✅ 면접 거부 알림 생성 완료:', notification._id, '-> 사용자:', admin._id);
      }
    }

    await application.save();

    // populate로 관련 정보 포함
    await application.populate('postId', 'title content roomSpecific');
    await application.populate('applicantId', 'name email phone instructorInfo');
    if (application.centerId) {
      await application.populate('centerId', 'name');
    }

    res.json({
      success: true,
      data: application,
      message: response === 'accept' ? '면접을 수락했습니다.' : '면접을 거부했습니다.'
    });
  } catch (error: any) {
    console.error('면접 응답 오류:', error);
    res.status(500).json({
      success: false,
      message: error.message || '면접 응답 처리 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/job-board/applications/:id
 * 지원 상세 정보 조회
 */
router.get('/applications/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    const application = await JobApplication.findById(req.params.id)
      .populate('postId', 'title content roomSpecific')
      .populate('applicantId', 'name email phone instructorInfo')
      .populate('centerId', 'name');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: '지원 정보를 찾을 수 없습니다.'
      });
    }

    // 권한 확인: 지원자 본인, 센터 관리자, 최고 관리자만 조회 가능
    const isApplicant = application.applicantId.toString() === (user._id || user.id).toString();
    const post = application.postId as any;
    const isCenterAdmin = (user.userType === 'centerAdmin' || user.userType === 'center-admin') && 
      post.roomSpecific?.jobBoard?.centerId?.toString() === (user.centerId || user.memberships?.find((m: any) => m.role === 'centerAdmin')?.centerId)?.toString();
    const isSuperAdmin = user.userType === 'superAdmin';

    if (!isApplicant && !isCenterAdmin && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: '조회 권한이 없습니다.'
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('지원 상세 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '지원 상세 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * POST /api/job-board/applications/sync-instructors
 * 이미 합격된 지원의 강사 계정에 centerId 동기화 (관리자용)
 */
router.post('/applications/sync-instructors', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    // 센터 관리자 또는 최고 관리자만 실행 가능
    if (user.userType !== 'centerAdmin' && user.userType !== 'center-admin' && user.userType !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: '권한이 없습니다.'
      });
    }

    // 합격 상태의 지원 조회 (final_passed, interview_passed)
    const passedApplications = await JobApplication.find({
      status: { $in: ['final_passed', 'interview_passed', 'hired', 'accepted'] }
    })
      .populate({
        path: 'postId',
        select: 'title roomSpecific'
      })
      .populate({
        path: 'applicantId',
        select: 'name email userType centerId instructorInfo'
      });

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const application of passedApplications) {
      try {
        const applicant = application.applicantId as any;
        const applicantId = applicant._id || applicant;
        const post = application.postId as any;

        // centerId 추출
        let centerId = post?.roomSpecific?.jobBoard?.centerId || application.centerId;
        if (centerId && typeof centerId === 'object' && centerId._id) {
          centerId = centerId._id;
        }
        centerId = centerId?.toString ? centerId.toString() : centerId;

        if (!centerId) {
          results.push({
            applicationId: application._id,
            applicantName: applicant.name,
            status: 'skipped',
            reason: '센터 ID 없음'
          });
          continue;
        }

        // 강사 계정 업데이트
        const instructor = await User.findById(applicantId);
        if (!instructor || instructor.userType !== 'instructor') {
          results.push({
            applicationId: application._id,
            applicantName: applicant.name,
            status: 'skipped',
            reason: '강사 계정 아님'
          });
          continue;
        }

        const centerIdObj = new mongoose.Types.ObjectId(centerId);
        let updated = false;

        // centerId 설정
        if (!instructor.centerId || instructor.centerId.toString() !== centerId) {
          instructor.centerId = centerIdObj;
          updated = true;
        }

        // instructorInfo.assignedCenters에도 추가
        if (!instructor.instructorInfo) {
          instructor.instructorInfo = {} as any;
        }
        const assignedCenters = (instructor.instructorInfo as any).assignedCenters || [];
        const centerIdStr = centerIdObj.toString();
        if (!assignedCenters.some((c: any) => c.toString() === centerIdStr)) {
          assignedCenters.push(centerIdObj);
          (instructor.instructorInfo as any).assignedCenters = assignedCenters;
          updated = true;
        }

        if (updated) {
          await instructor.save();
          successCount++;
          results.push({
            applicationId: application._id,
            applicantName: instructor.name,
            status: 'success',
            centerId: centerId
          });
          console.log('✅ 강사 계정 동기화 완료:', {
            instructorId: instructor._id,
            instructorName: instructor.name,
            centerId: centerId
          });
        } else {
          results.push({
            applicationId: application._id,
            applicantName: instructor.name,
            status: 'already_synced',
            centerId: centerId
          });
        }
      } catch (error: any) {
        errorCount++;
        results.push({
          applicationId: application._id,
          applicantName: (application.applicantId as any)?.name || '알 수 없음',
          status: 'error',
          error: error.message
        });
        console.error('❌ 강사 계정 동기화 오류:', error);
      }
    }

    res.json({
      success: true,
      message: `동기화 완료: 성공 ${successCount}건, 오류 ${errorCount}건`,
      data: {
        total: passedApplications.length,
        success: successCount,
        errors: errorCount,
        results
      }
    });
  } catch (error: any) {
    console.error('강사 계정 동기화 오류:', error);
    res.status(500).json({
      success: false,
      message: error.message || '동기화 중 오류가 발생했습니다.'
    });
  }
});

export default router;

