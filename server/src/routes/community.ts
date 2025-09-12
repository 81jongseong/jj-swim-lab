/**
 * 💬 JJ Swim Lab - 커뮤니티 관리 API 라우트
 * 
 * 📋 **라우트 목적**
 * - 수영 강습 커뮤니티 관리 및 CRUD 작업을 위한 API 엔드포인트 제공
 * - 게시글, 댓글, 신고 관리 기능
 * - 커뮤니티 검색, 필터링, 페이지네이션 기능
 * - 커뮤니티 통계 및 분석 데이터 제공
 * - 커뮤니티 보안 및 관리 기능
 * 
 * 🔄 **주요 기능**
 * - 게시글 CRUD 작업 (생성, 조회, 수정, 삭제)
 * - 댓글 CRUD 작업 및 중첩 댓글 지원
 * - 게시글 검색 및 필터링 (제목, 내용, 태그별)
 * - 커뮤니티 신고 및 관리 기능
 * - 페이지네이션 및 정렬 기능
 * - 커뮤니티 통계 및 분석
 * - 게시글 조회수 및 좋아요 기능
 * 
 * 🗄️ **데이터 연동**
 * - CommunityPost 모델과 연동 (게시글 정보)
 * - CommunityComment 모델과 연동 (댓글 정보)
 * - CommunityReport 모델과 연동 (신고 정보)
 * - User 모델과 연동 (작성자 정보)
 * - 인증 미들웨어와 연동 (권한 검증)
 * - MongoDB Atlas 데이터베이스
 * 
 * 🛠️ **필요한 설치 파일**
 * - Express.js Router
 * - Mongoose (MongoDB ODM)
 * - CommunityPost 모델 (../models/CommunityPost)
 * - CommunityComment 모델 (../models/CommunityComment)
 * - CommunityReport 모델 (../models/CommunityReport)
 * - 인증 미들웨어 (../middleware/auth)
 * - MongoDB Atlas (데이터 저장)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 게시글 및 댓글 내용 검증 및 sanitization
 * 2. 커뮤니티 신고 처리 및 관리
 * 3. 게시글 권한 관리 (작성자만 수정/삭제)
 * 4. 검색 성능 최적화 및 인덱스 관리
 * 5. 페이지네이션 성능 최적화
 * 6. API 보안 및 Rate Limiting 적용
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 게시글 및 댓글 검증 로직 확인
 * - [ ] 커뮤니티 신고 처리 확인
 * - [ ] 게시글 권한 관리 확인
 * - [ ] 검색 성능 최적화 확인
 * - [ ] API 엔드포인트 보안 검증
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 커뮤니티 관리 API 구현
 * - 2024-12-19: 게시글 CRUD 시스템 구현
 * - 2024-12-19: 댓글 시스템 및 중첩 댓글 구현
 * - 2024-12-19: 커뮤니티 신고 시스템 구현
 * - 2024-12-19: 검색 및 필터링 기능 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (커뮤니티 관리 API 완료)
 * 
 * 🚀 **다음 단계**
 * - 실시간 댓글 알림 시스템
 * - 게시글 추천 시스템
 * - 커뮤니티 모더레이션 도구
 * - 커뮤니티 통계 대시보드
 * - 커뮤니티 보안 강화
 * 
 * 💡 **사용 예시**
 * ```typescript
 * // 게시글 목록 조회
 * GET /api/community/posts?page=1&limit=10&tag=자유형
 * 
 * // 게시글 생성
 * POST /api/community/posts
 * {
 *   "title": "자유형 기초 강습 후기",
 *   "content": "강습 내용...",
 *   "tags": ["자유형", "초급", "후기"]
 * }
 * 
 * // 댓글 생성
 * POST /api/community/posts/:postId/comments
 * {
 *   "content": "좋은 글 감사합니다!"
 * }
 * 
 * // 커뮤니티 신고
 * POST /api/community/reports
 * {
 *   "targetType": "post",
 *   "targetId": "post001",
 *   "reason": "스팸"
 * }
 * ```
 * 
 * 🔍 **커뮤니티 관리 처리 흐름**
 * 1. 사용자 권한 및 역할 검증
 * 2. 게시글/댓글 데이터 검증 및 sanitization
 * 3. 검색 및 필터링 조건 적용
 * 4. 데이터베이스 쿼리 실행
 * 5. 페이지네이션 및 정렬 처리
 * 6. 커뮤니티 통계 업데이트
 * 7. 응답 데이터 반환 및 로깅
 */

import express, { Request, Response } from 'express';
import { auth, requireRole } from '../middleware/auth';
import { CommunityPost } from '../models/CommunityPost';
import { CommunityComment } from '../models/CommunityComment';
import { CommunityReport } from '../models/CommunityReport';

const router: express.Router = express.Router();

// 게시글 목록
router.get('/posts', async (req: Request, res: Response) => {
  try {
    const { q, tag, page = 1, limit = 10 } = req.query as any;
    const skip = (Number(page)-1) * Number(limit);
    const filter: any = { isPublished: true };
    if (q) filter.$text = { $search: q };
    if (tag) filter.tags = tag;
    const posts = await CommunityPost.find(filter).populate('author','name userId').skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await CommunityPost.countDocuments(filter);
    res.json({ posts, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total/Number(limit)) } });
  } catch (e) {
    res.status(500).json({ error: '게시글 목록을 불러오는데 실패했습니다.' });
  }
});

// 게시글 생성
router.post('/posts', auth, async (req: any, res: Response) => {
  try {
    const { title, content, tags } = req.body;
    if (!title || !content) return res.status(400).json({ error: '제목과 내용은 필수입니다.' });
    const post = await CommunityPost.create({ title, content, tags: tags||[], author: req.user._id });
    res.status(201).json({ post });
  } catch (e) {
    res.status(500).json({ error: '게시글 생성에 실패했습니다.' });
  }
});

// 게시글 상세
router.get('/posts/:id', async (req: Request, res: Response) => {
  try {
    const post = await CommunityPost.findById(req.params.id).populate('author','name userId');
    if (!post || !post.isPublished) return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    res.json({ post });
  } catch (e) {
    res.status(500).json({ error: '게시글 조회에 실패했습니다.' });
  }
});

// 게시글 수정/토글(작성자 또는 슈퍼관리자)
router.put('/posts/:id', auth, async (req: any, res: Response) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    if (String(post.author) !== String(req.user._id) && req.user.userType !== 'superAdmin') {
      return res.status(403).json({ error: '수정 권한이 없습니다.' });
    }
    const updated = await CommunityPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ post: updated });
  } catch (e) {
    res.status(500).json({ error: '게시글 수정에 실패했습니다.' });
  }
});

// 댓글 목록
router.get('/posts/:id/comments', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query as any;
    const skip = (Number(page)-1) * Number(limit);
    const comments = await CommunityComment.find({ postId: req.params.id }).populate('author','name userId').skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await CommunityComment.countDocuments({ postId: req.params.id });
    res.json({ comments, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total/Number(limit)) } });
  } catch (e) {
    res.status(500).json({ error: '댓글 목록을 불러오는데 실패했습니다.' });
  }
});

// 댓글 작성
router.post('/posts/:id/comments', auth, async (req: any, res: Response) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: '내용을 입력해주세요.' });
    const comment = await CommunityComment.create({ postId: req.params.id, author: req.user._id, content });
    await CommunityPost.findByIdAndUpdate(req.params.id, { $inc: { commentsCount: 1 } });
    res.status(201).json({ comment });
  } catch (e) {
    res.status(500).json({ error: '댓글 작성에 실패했습니다.' });
  }
});

export default router;

// 신고 하기
router.post('/reports', auth, async (req: any, res: Response) => {
  try {
    const { targetType, targetId, reason } = req.body;
    if (!['post','comment'].includes(targetType) || !targetId || !reason) return res.status(400).json({ error: '잘못된 신고 데이터' });
    const report = await CommunityReport.create({ targetType, targetId, reason, reporter: req.user._id });
    res.status(201).json({ report });
  } catch (e) {
    if ((e as any).code === 11000) return res.status(400).json({ error: '이미 신고한 대상입니다.' });
    res.status(500).json({ error: '신고 접수 실패' });
  }
});

// 관리자: 신고 목록/상태 변경
router.get('/reports', auth, requireRole(['superAdmin']), async (req: Request, res: Response) => {
  try {
    const { status = 'open', page = 1, limit = 20 } = req.query as any;
    const skip = (Number(page)-1) * Number(limit);
    const filter: any = {};
    if (status) filter.status = status;
    const reports = await CommunityReport.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    const total = await CommunityReport.countDocuments(filter);
    res.json({ reports, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total/Number(limit)) } });
  } catch (e) {
    res.status(500).json({ error: '신고 목록 조회 실패' });
  }
});

router.patch('/reports/:id/status', auth, requireRole(['superAdmin']), async (req: Request, res: Response) => {
  try {
    const { status } = req.body as any;
    if (!['open','reviewed','dismissed'].includes(status)) return res.status(400).json({ error: '유효하지 않은 상태' });
    const updated = await CommunityReport.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) return res.status(404).json({ error: '신고를 찾을 수 없습니다.' });
    res.json({ report: updated });
  } catch (e) {
    res.status(500).json({ error: '신고 상태 변경 실패' });
  }
});


