/**
 * @file JJ Swim Lab - YouTube 비디오 API 라우트
 * 
 * 📋 **라우트 목적**
 * - JJ Swim Lab 시스템의 YouTube 비디오 관리를 위한 API 엔드포인트
 * - 강습법과 연결된 YouTube 비디오 CRUD 작업
 * - 비디오 검색 및 필터링 기능
 * - 카테고리별 및 레벨별 비디오 조회
 * 
 * 🔄 **주요 기능**
 * - YouTube 비디오 목록 조회 (검색, 필터링)
 * - 특정 비디오 상세 조회
 * - 새 비디오 추가 (YouTube URL에서 ID 추출)
 * - 비디오 정보 수정
 * - 비디오 삭제
 * - 강습법별 비디오 조회
 * - 카테고리별 통계 조회
 * 
 * 🗄️ **데이터 연동**
 * - YouTubeVideo 모델과 연동
 * - TeachingMethod 모델과 연동
 * - User 모델과 연동 (인증)
 * 
 * 🛠️ **필요한 설치 파일**
 * - Express.js 4.18.2
 * - Mongoose 7.8.7
 * - YouTubeVideo 모델
 * - 인증 미들웨어
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. YouTube URL에서 비디오 ID 추출 검증
 * 2. 썸네일 URL 자동 생성 및 검증
 * 3. 권한 기반 접근 제어
 * 4. 입력 데이터 검증 및 sanitization
 * 5. 에러 핸들링 및 응답 형식 일관성
 * 6. API 성능 최적화 및 캐싱 고려
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] API 엔드포인트 검증
 * - [ ] 권한 관리 확인
 * - [ ] 입력 데이터 검증 확인
 * - [ ] 에러 핸들링 확인
 * - [ ] 응답 형식 일관성 확인
 * - [ ] 모델 연동 확인
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-13: 초기 YouTube 비디오 API 구현
 * - 2025-01-13: CRUD 작업 완성
 * - 2025-01-13: 검색 및 필터링 기능 구현
 * - 2025-01-13: 강습법 연결 기능 구현
 * - 2025-01-13: 통계 조회 기능 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2025-01-13
 * - 상태: ✅ 완성 (YouTube 비디오 API 완료)
 * 
 * 🚀 **다음 단계**
 * - YouTube API 연동으로 메타데이터 자동 수집
 * - 비디오 재생 통계 수집
 * - 비디오 추천 알고리즘 구현
 * - 플레이리스트 관리 기능
 * - 비디오 북마크 시스템
 * 
 * 💡 **API 사용 예시**
 * ```typescript
 * // 비디오 목록 조회
 * GET /api/youtube-videos?category=자유형&level=beginner
 * 
 * // 새 비디오 추가
 * POST /api/youtube-videos
 * {
 *   "title": "자유형 기초 강습",
 *   "description": "자유형 수영의 기본 자세",
 *   "videoId": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
 *   "category": "자유형",
 *   "level": "beginner"
 * }
 * 
 * // 강습법별 비디오 조회
 * GET /api/youtube-videos/teaching-method/:methodId
 * ```
 * 
 * 🔍 **API 데이터 처리 흐름**
 * 1. 요청 데이터 검증 및 권한 확인
 * 2. YouTube URL에서 비디오 ID 추출
 * 3. 썸네일 URL 자동 생성
 * 4. 데이터베이스 작업 수행
 * 5. 응답 데이터 형식화 및 반환
 * 6. 에러 처리 및 로깅
 * 7. 캐시 업데이트 (필요시)
 */

import express, { Request, Response, Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import { YouTubeVideo } from '../models/YouTubeVideo';
import { TeachingMethod } from '../models/TeachingMethod';
import { logInfo, logError, logWarn, logDebug } from '../utils/logger';

interface AuthRequest extends Request {
  user?: any;
}

const router: Router = express.Router();

// YouTube URL에서 비디오 ID 추출 함수
const extractVideoId = (url: string): string => {
  const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : '';
};

// 썸네일 URL 생성 함수
const getThumbnailUrl = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

// 모든 YouTube 비디오 조회 (공개)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, level, search, teachingMethodId } = req.query;
    
    const query: any = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (level) {
      query.level = level;
    }
    
    if (teachingMethodId) {
      query.teachingMethodId = teachingMethodId;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log('🔍 YouTube 비디오 조회 쿼리:', JSON.stringify(query, null, 2));
    
    const videos = await YouTubeVideo.find(query)
      .populate('teachingMethodId', 'name category level')
      .populate('createdBy', 'name userType')
      .sort({ createdAt: -1 })
      .select('-__v');
    
    console.log(`📊 쿼리 결과: ${videos.length}개의 비디오 발견`);
    
    res.json({
      success: true,
      message: 'YouTube 비디오 목록 조회 성공!',
      data: videos,
      total: videos.length
    });
  } catch (error) {
    logError('YouTube 비디오 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: 'YouTube 비디오 목록을 불러오는 데 실패했습니다.'
    });
  }
});

// 특정 YouTube 비디오 조회 (공개)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const video = await YouTubeVideo.findById(id)
      .populate('teachingMethodId', 'name category level steps tips')
      .populate('createdBy', 'name userType')
      .select('-__v');
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'YouTube 비디오를 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      message: 'YouTube 비디오 조회 성공!',
      data: video
    });
  } catch (error) {
    logError('YouTube 비디오 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: 'YouTube 비디오를 불러오는 데 실패했습니다.'
    });
  }
});

// YouTube 비디오 생성 (강사, 센터 관리자, 총관리자만)
router.post('/', authMiddleware, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, videoId, category, level, duration, teachingMethodId, tags } = req.body;
    
    if (!title || !description || !videoId || !category || !level) {
      return res.status(400).json({
        success: false,
        message: '필수 필드가 누락되었습니다.'
      });
    }
    
    // YouTube URL에서 비디오 ID 추출
    const extractedVideoId = extractVideoId(videoId);
    if (!extractedVideoId) {
      return res.status(400).json({
        success: false,
        message: '유효한 YouTube URL을 입력해주세요.'
      });
    }
    
    // 중복 체크
    const existingVideo = await YouTubeVideo.findOne({ videoId: extractedVideoId });
    if (existingVideo) {
      return res.status(400).json({
        success: false,
        message: '이미 등록된 YouTube 비디오입니다.'
      });
    }
    
    // 강습법 존재 확인 (선택사항)
    if (teachingMethodId) {
      const teachingMethod = await TeachingMethod.findById(teachingMethodId);
      if (!teachingMethod) {
        return res.status(400).json({
          success: false,
          message: '연결할 강습법을 찾을 수 없습니다.'
        });
      }
    }
    
    const newVideo = new YouTubeVideo({
      title,
      description,
      videoId: extractedVideoId,
      thumbnailUrl: getThumbnailUrl(extractedVideoId),
      duration: duration || '',
      category,
      level,
      teachingMethodId: teachingMethodId || null,
      createdBy: req.user._id,
      isActive: true,
      tags: Array.isArray(tags) ? tags : []
    });
    
    await newVideo.save();
    
    // 생성된 비디오 정보 반환 (관련 데이터 포함)
    const savedVideo = await YouTubeVideo.findById(newVideo._id)
      .populate('teachingMethodId', 'name category level')
      .populate('createdBy', 'name userType')
      .select('-__v');
    
    res.status(201).json({
      success: true,
      message: 'YouTube 비디오가 성공적으로 생성되었습니다!',
      data: savedVideo
    });
  } catch (error) {
    logError('YouTube 비디오 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: 'YouTube 비디오 생성에 실패했습니다.'
    });
  }
});

// YouTube 비디오 수정 (생성자, 센터 관리자, 총관리자만)
router.put('/:id', authMiddleware, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, videoId, category, level, duration, teachingMethodId, tags } = req.body;
    
    const video = await YouTubeVideo.findById(id);
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'YouTube 비디오를 찾을 수 없습니다.'
      });
    }
    
    // 권한 확인: 생성자이거나 관리자여야 함
    if (req.user.userType !== 'superAdmin' && 
        req.user.userType !== 'centerAdmin' && 
        (!video.createdBy || video.createdBy.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: '수정 권한이 없습니다.'
      });
    }
    
    // YouTube URL에서 비디오 ID 추출 (새 URL이 제공된 경우)
    let extractedVideoId = video.videoId;
    if (videoId && videoId !== video.videoId) {
      extractedVideoId = extractVideoId(videoId);
      if (!extractedVideoId) {
        return res.status(400).json({
          success: false,
          message: '유효한 YouTube URL을 입력해주세요.'
        });
      }
      
      // 중복 체크 (자신 제외)
      const existingVideo = await YouTubeVideo.findOne({ 
        videoId: extractedVideoId, 
        _id: { $ne: id } 
      });
      if (existingVideo) {
        return res.status(400).json({
          success: false,
          message: '이미 등록된 YouTube 비디오입니다.'
        });
      }
    }
    
    // 강습법 존재 확인 (선택사항)
    if (teachingMethodId && teachingMethodId !== video.teachingMethodId?.toString()) {
      const teachingMethod = await TeachingMethod.findById(teachingMethodId);
      if (!teachingMethod) {
        return res.status(400).json({
          success: false,
          message: '연결할 강습법을 찾을 수 없습니다.'
        });
      }
    }
    
    // 데이터 업데이트
    if (title) video.title = title;
    if (description) video.description = description;
    if (extractedVideoId !== video.videoId) {
      video.videoId = extractedVideoId;
      video.thumbnailUrl = getThumbnailUrl(extractedVideoId);
    }
    if (category) video.category = category;
    if (level) video.level = level;
    if (duration !== undefined) video.duration = duration;
    if (teachingMethodId !== undefined) video.teachingMethodId = teachingMethodId || null;
    if (tags !== undefined) video.tags = Array.isArray(tags) ? tags : [];
    
    video.updatedAt = new Date();
    
    await video.save();
    
    // 수정된 비디오 정보 반환 (관련 데이터 포함)
    const updatedVideo = await YouTubeVideo.findById(video._id)
      .populate('teachingMethodId', 'name category level')
      .populate('createdBy', 'name userType')
      .select('-__v');
    
    res.json({
      success: true,
      message: 'YouTube 비디오가 성공적으로 수정되었습니다!',
      data: updatedVideo
    });
  } catch (error) {
    logError('YouTube 비디오 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: 'YouTube 비디오 수정에 실패했습니다.'
    });
  }
});

// YouTube 비디오 삭제 (생성자, 센터 관리자, 총관리자만)
router.delete('/:id', authMiddleware, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ YouTube 비디오 삭제 요청: ${id}`);
    
    const video = await YouTubeVideo.findById(id);
    
    if (!video) {
      console.log(`❌ YouTube 비디오를 찾을 수 없음: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'YouTube 비디오를 찾을 수 없습니다.'
      });
    }
    
    console.log(`📋 삭제할 YouTube 비디오: ${video.title} (${video.category})`);
    
    // 권한 확인: 생성자이거나 관리자여야 함
    if (req.user.userType !== 'superAdmin' && 
        req.user.userType !== 'centerAdmin' && 
        (!video.createdBy || video.createdBy.toString() !== req.user._id.toString())) {
      console.log(`❌ 삭제 권한 없음: 사용자 ${req.user.userType}, 비디오 생성자 ${video.createdBy}`);
      return res.status(403).json({
        success: false,
        message: '삭제 권한이 없습니다.'
      });
    }
    
    // 실제 삭제
    const deleteResult = await YouTubeVideo.findByIdAndDelete(id);
    console.log(`✅ YouTube 비디오 삭제 완료: ${id}, 결과:`, deleteResult);
    
    res.json({
      success: true,
      message: 'YouTube 비디오가 성공적으로 삭제되었습니다!'
    });
  } catch (error) {
    logError('YouTube 비디오 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: 'YouTube 비디오 삭제에 실패했습니다.'
    });
  }
});

// 강습법별 YouTube 비디오 조회
router.get('/teaching-method/:methodId', async (req: Request, res: Response) => {
  try {
    const { methodId } = req.params;
    
    const videos = await YouTubeVideo.find({ 
      teachingMethodId: methodId, 
      isActive: true 
    })
    .populate('teachingMethodId', 'name category level')
    .populate('createdBy', 'name userType')
    .sort({ createdAt: -1 })
    .select('-__v');
    
    res.json({
      success: true,
      message: '강습법별 YouTube 비디오 조회 성공!',
      data: videos,
      total: videos.length
    });
  } catch (error) {
    logError('강습법별 YouTube 비디오 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '강습법별 YouTube 비디오 조회에 실패했습니다.'
    });
  }
});

// YouTube 비디오 카테고리별 통계
router.get('/stats/categories', async (req: Request, res: Response) => {
  try {
    const stats = await YouTubeVideo.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          levels: { $addToSet: '$level' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      message: '카테고리별 통계 조회 성공!',
      data: stats
    });
  } catch (error) {
    logError('카테고리 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '통계 조회에 실패했습니다.'
    });
  }
});

// YouTube 비디오 레벨별 통계
router.get('/stats/levels', async (req: Request, res: Response) => {
  try {
    const stats = await YouTubeVideo.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 },
          categories: { $addToSet: '$category' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      message: '레벨별 통계 조회 성공!',
      data: stats
    });
  } catch (error) {
    logError('레벨 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '통계 조회에 실패했습니다.'
    });
  }
});

export default router;

