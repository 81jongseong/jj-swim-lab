/**
 * 🏘️ JJ Swim Lab - 커뮤니티 게시판 API 라우트
 * 
 * 📋 기능:
 * - 게시글 CRUD
 * - 블라인드 처리 (최고 관리자)
 * - 경고 발송 (최고 관리자)
 * - 번개모임 참가
 * - 운영 규칙 관리
 */

import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { CommunityPost } from '../models/Community';
import mongoose from 'mongoose';

const router = Router();

/**
 * GET /api/community/posts
 * 게시글 목록 조회
 */
router.get('/posts', async (req: Request, res: Response) => {
  try {
    const { roomType } = req.query;
    
    const filter: any = {};
    if (roomType) {
      filter.roomType = roomType;
    }

    const posts = await CommunityPost.find(filter)
      .populate('authorId', 'name email')
      .populate({
        path: 'roomSpecific.jobBoard.centerId',
        select: 'name',
        model: mongoose.models.Center || mongoose.models.SwimmingCenter || 'Center'
      })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('게시글 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '게시글 조회 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * POST /api/community/posts
 * 게시글 생성
 */
router.post('/posts', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { title, content, roomType, roomSpecific } = req.body;
    const user = (req as any).user;

    console.log('📝 게시글 작성 요청:', { title, roomType, user: user?.name });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: '인증이 필요합니다.' 
      });
    }

    if (!title || !content) {
      return res.status(400).json({ 
        success: false, 
        message: '제목과 내용은 필수입니다.' 
      });
    }

    // job_board 타입인 경우 roomSpecific.jobBoard 필수
    if (roomType === 'job_board' && !roomSpecific?.jobBoard) {
      return res.status(400).json({ 
        success: false, 
        message: '구인구직 게시글은 jobBoard 정보가 필요합니다.' 
      });
    }

    // authorRole 변환: center-admin -> centerAdmin
    let authorRole = user.userType || 'student';
    if (authorRole === 'center-admin') {
      authorRole = 'centerAdmin';
    }

    const postData: any = {
      title,
      content,
      roomType: roomType || 'chat',
      authorId: user._id || user.id,
      authorName: user.name || '익명',
      authorRole: authorRole,
      roomSpecific: roomSpecific || {}
    };

    // job_board인 경우 centerId 설정 (centerAdmin인 경우)
    if (roomType === 'job_board' && roomSpecific?.jobBoard) {
      if (user.userType === 'centerAdmin' || user.userType === 'center-admin') {
        // centerAdmin의 경우 자신의 센터 ID 설정
        if (user.centerId) {
          postData.roomSpecific.jobBoard.centerId = user.centerId;
        } else if (user.memberships && user.memberships.length > 0) {
          // memberships에서 centerId 찾기
          const centerMembership = user.memberships.find((m: any) => m.role === 'centerAdmin');
          if (centerMembership) {
            postData.roomSpecific.jobBoard.centerId = centerMembership.centerId;
          }
        }
      }
      
      // status 기본값 설정
      if (!postData.roomSpecific.jobBoard.status) {
        postData.roomSpecific.jobBoard.status = 'open';
      }
    }

    const newPost = new CommunityPost(postData);
    await newPost.save();

    // populate로 관련 정보 포함
    await newPost.populate('authorId', 'name email');
    if (roomType === 'job_board' && newPost.roomSpecific?.jobBoard?.centerId) {
      await newPost.populate({
        path: 'roomSpecific.jobBoard.centerId',
        select: 'name',
        model: mongoose.models.Center || mongoose.models.SwimmingCenter || 'Center'
      });
    }

    console.log('✅ 게시글 생성 성공:', newPost._id);

    res.json({
      success: true,
      data: newPost,
      message: '게시글이 작성되었습니다.'
    });
  } catch (error: any) {
    console.error('❌ 게시글 작성 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || '게시글 작성 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * PUT /api/community/posts/:id
 * 게시글 수정
 */
router.put('/posts/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { title, content, roomSpecific } = req.body;

    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: '게시글을 찾을 수 없습니다.' 
      });
    }

    // 권한 확인: 작성자 또는 최고 관리자만 수정 가능
    const isAuthor = post.authorId.toString() === (user._id || user.id).toString();
    const isSuperAdmin = user.userType === 'superAdmin';

    if (!isAuthor && !isSuperAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: '수정 권한이 없습니다.' 
      });
    }

    // 수정할 필드 업데이트
    if (title) post.title = title;
    if (content) post.content = content;
    if (roomSpecific) {
      post.roomSpecific = { ...post.roomSpecific, ...roomSpecific };
    }

    await post.save();

    // populate로 관련 정보 포함
    await post.populate('authorId', 'name email');
    if (post.roomType === 'job_board' && post.roomSpecific?.jobBoard?.centerId) {
      await post.populate({
        path: 'roomSpecific.jobBoard.centerId',
        select: 'name',
        model: mongoose.models.Center || mongoose.models.SwimmingCenter || 'Center'
      });
    }

    res.json({
      success: true,
      data: post,
      message: '게시글이 수정되었습니다.'
    });
  } catch (error: any) {
    console.error('게시글 수정 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || '게시글 수정 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * DELETE /api/community/posts/:id
 * 게시글 삭제 (작성자 또는 최고 관리자)
 */
router.delete('/posts/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: '게시글을 찾을 수 없습니다.' 
      });
    }

    // 권한 확인: 작성자 또는 최고 관리자만 삭제 가능
    const isAuthor = post.authorId.toString() === (user._id || user.id).toString();
    const isSuperAdmin = user.userType === 'superAdmin';

    if (!isAuthor && !isSuperAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: '삭제 권한이 없습니다.' 
      });
    }

    await CommunityPost.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: '게시글이 삭제되었습니다.'
    });
  } catch (error) {
    console.error('게시글 삭제 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '게시글 삭제 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * POST /api/community/posts/:id/blind
 * 게시글 블라인드 처리 (최고 관리자 전용)
 */
router.post('/posts/:id/blind', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // 최고 관리자 권한 확인
    if (user.userType !== 'superAdmin') {
      return res.status(403).json({ 
        success: false, 
        message: '블라인드 처리 권한이 없습니다.' 
      });
    }

    const post = await CommunityPost.findByIdAndUpdate(
      req.params.id,
      { isHidden: true },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: '게시글을 찾을 수 없습니다.' 
      });
    }

    res.json({
      success: true,
      post: post,
      message: '게시글이 블라인드 처리되었습니다.'
    });
  } catch (error) {
    console.error('블라인드 처리 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '블라인드 처리 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * POST /api/community/posts/:id/unblind
 * 게시글 블라인드 해제 (최고 관리자 전용)
 */
router.post('/posts/:id/unblind', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // 최고 관리자 권한 확인
    if (user.userType !== 'superAdmin') {
      return res.status(403).json({ 
        success: false, 
        message: '블라인드 해제 권한이 없습니다.' 
      });
    }

    const post = await CommunityPost.findByIdAndUpdate(
      req.params.id,
      { isHidden: false },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: '게시글을 찾을 수 없습니다.' 
      });
    }

    res.json({
      success: true,
      post: post,
      message: '게시글 블라인드가 해제되었습니다.'
    });
  } catch (error) {
    console.error('블라인드 해제 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '블라인드 해제 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * POST /api/community/posts/:id/warn
 * 작성자 경고 (최고 관리자 전용)
 */
router.post('/posts/:id/warn', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { authorId, reason } = req.body;
    
    // 최고 관리자 권한 확인
    if (user.userType !== 'superAdmin') {
      return res.status(403).json({ 
        success: false, 
        message: '경고 발송 권한이 없습니다.' 
      });
    }

    const post = await CommunityPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { warnings: 1 } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: '게시글을 찾을 수 없습니다.' 
      });
    }

    // TODO: 실제로 작성자에게 알림 발송
    // await sendWarningNotification(authorId, reason);

    res.json({
      success: true,
      post: post,
      message: `작성자에게 경고가 발송되었습니다. (사유: ${reason})`
    });
  } catch (error) {
    console.error('경고 발송 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '경고 발송 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * POST /api/community/posts/:id/join
 * 번개모임 참가 신청
 */
router.post('/posts/:id/join', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId, userName } = req.body;

    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: '게시글을 찾을 수 없습니다.' 
      });
    }

    if (!post.meetupDetails) {
      return res.status(400).json({ 
        success: false, 
        message: '번개모임 게시글이 아닙니다.' 
      });
    }

    // 이미 참가 중인지 확인
    const alreadyJoined = post.meetupDetails.participants?.some(p => p.userId === userId);
    if (alreadyJoined) {
      return res.status(400).json({ 
        success: false, 
        message: '이미 참가 신청한 모임입니다.' 
      });
    }

    // 정원 확인
    if (post.meetupDetails.currentParticipants >= post.meetupDetails.maxParticipants) {
      return res.status(400).json({ 
        success: false, 
        message: '모집 인원이 마감되었습니다.' 
      });
    }

    // 참가자 추가
    if (!post.meetupDetails.participants) {
      post.meetupDetails.participants = [];
    }
    
    post.meetupDetails.participants.push({
      userId,
      userName,
      joinedAt: new Date()
    });
    post.meetupDetails.currentParticipants = (post.meetupDetails.currentParticipants || 0) + 1;

    await post.save();

    res.json({
      success: true,
      post: post,
      message: '번개모임 참가 신청이 완료되었습니다.'
    });
  } catch (error) {
    console.error('참가 신청 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '참가 신청 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * PUT /api/community/rules
 * 커뮤니티 운영 규칙 설정 (최고 관리자 전용)
 */
router.put('/rules', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // 최고 관리자 권한 확인
    if (user.userType !== 'superAdmin') {
      return res.status(403).json({ 
        success: false, 
        message: '규칙 설정 권한이 없습니다.' 
      });
    }

    // TODO: 실제로 DB에 저장하거나 설정 파일에 저장
    const { title, rules, penalties } = req.body;

    res.json({
      success: true,
      rules: { title, rules, penalties },
      message: '커뮤니티 운영 규칙이 저장되었습니다.'
    });
  } catch (error) {
    console.error('규칙 저장 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '규칙 저장 중 오류가 발생했습니다.' 
    });
  }
});

export default router;

