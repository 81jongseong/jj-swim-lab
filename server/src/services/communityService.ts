/**
 * 🏊‍♂️ JJ Swim Lab - 커뮤니티 서비스
 * 
 * 📋 **서비스 목적**
 * - 수영 커뮤니티의 모든 소셜 기능 관리
 * - 방별 특화 기능 및 상호작용 처리
 * - 실시간 알림 및 모더레이션 시스템
 */

import { 
  CommunityPost, 
  CommunityComment, 
  MeetupParticipant,
  ICommunityPost,
  ICommunityComment,
  RoomType,
  ROOM_CONFIGS
} from '../models/Community';
import { logInfo, logError } from '../utils/logger';
import mongoose from 'mongoose';

export class CommunityService {
  private static instance: CommunityService;

  static getInstance(): CommunityService {
    if (!CommunityService.instance) {
      CommunityService.instance = new CommunityService();
    }
    return CommunityService.instance;
  }

  /**
   * 게시글 작성 (방별 특화 기능 포함)
   */
  async createPost(postData: {
    roomType: RoomType;
    title: string;
    content: string;
    authorId: string;
    authorName: string;
    authorRole: string;
    attachments?: any[];
    roomSpecific?: any;
  }): Promise<ICommunityPost> {
    try {
      // 방별 유효성 검사
      this.validateRoomSpecificData(postData.roomType, postData.roomSpecific);

      const post = new CommunityPost({
        ...postData,
        views: 0,
        likesCount: 0,
        commentsCount: 0,
        likes: [],
        comments: [],
        isPinned: false,
        isHidden: false,
        isReported: false,
        reportCount: 0
      });

      await post.save();

      logInfo(`새 게시글 작성: ${postData.roomType} - ${postData.title}`);
      
      return post;

    } catch (error) {
      logError('게시글 작성 실패:', error);
      throw error;
    }
  }

  /**
   * 용품 후기 작성 (상세 평가 포함)
   */
  async createEquipmentReview(reviewData: {
    title: string;
    content: string;
    authorId: string;
    authorName: string;
    authorRole: string;
    productName: string;
    brand: string;
    model?: string;
    category: string;
    rating: number;
    usagePeriod: string;
    purchasePrice?: number;
    purchaseDate?: Date;
    purchaseLocation?: string;
    detailedRating: {
      durability: number;
      comfort: number;
      performance: number;
      valueForMoney: number;
      design: number;
    };
    pros: string[];
    cons: string[];
    recommendedFor: string[];
    wouldBuyAgain: boolean;
    recommendToOthers: boolean;
    comparedProducts?: any[];
    beforeAfterImages?: any;
    attachments?: any[];
  }): Promise<ICommunityPost> {
    try {
      const post = await this.createPost({
        roomType: 'equipment_reviews',
        title: reviewData.title,
        content: reviewData.content,
        authorId: reviewData.authorId,
        authorName: reviewData.authorName,
        authorRole: reviewData.authorRole,
        attachments: reviewData.attachments,
        roomSpecific: {
          equipmentReview: {
            productName: reviewData.productName,
            brand: reviewData.brand,
            model: reviewData.model,
            category: reviewData.category,
            rating: reviewData.rating,
            usagePeriod: reviewData.usagePeriod,
            purchasePrice: reviewData.purchasePrice,
            purchaseDate: reviewData.purchaseDate,
            purchaseLocation: reviewData.purchaseLocation,
            detailedRating: reviewData.detailedRating,
            pros: reviewData.pros,
            cons: reviewData.cons,
            recommendedFor: reviewData.recommendedFor,
            wouldBuyAgain: reviewData.wouldBuyAgain,
            recommendToOthers: reviewData.recommendToOthers,
            comparedProducts: reviewData.comparedProducts,
            beforeAfterImages: reviewData.beforeAfterImages
          }
        }
      });

      logInfo(`용품 후기 작성: ${reviewData.productName} (${reviewData.brand})`);
      
      return post;

    } catch (error) {
      logError('용품 후기 작성 실패:', error);
      throw error;
    }
  }

  /**
   * 번개모임 생성
   */
  async createMeetup(meetupData: {
    title: string;
    content: string;
    authorId: string;
    authorName: string;
    authorRole: string;
    meetupDate: Date;
    location: string;
    maxParticipants: number;
    meetupType: string;
    skill_level: string;
    fee?: number;
  }): Promise<ICommunityPost> {
    try {
      const post = await this.createPost({
        roomType: 'meetup',
        title: meetupData.title,
        content: meetupData.content,
        authorId: meetupData.authorId,
        authorName: meetupData.authorName,
        authorRole: meetupData.authorRole,
        roomSpecific: {
          meetup: {
            meetupDate: meetupData.meetupDate,
            location: meetupData.location,
            maxParticipants: meetupData.maxParticipants,
            currentParticipants: 1, // 작성자 포함
            participants: [meetupData.authorId],
            meetupType: meetupData.meetupType,
            skill_level: meetupData.skill_level,
            fee: meetupData.fee,
            status: 'recruiting'
          }
        }
      });

      // 작성자를 첫 번째 참가자로 등록
      await this.joinMeetup(post._id.toString(), {
        participantId: meetupData.authorId,
        participantName: meetupData.authorName,
        message: '모임 주최자입니다.',
        status: 'confirmed'
      });

      logInfo(`번개모임 생성: ${meetupData.title} - ${meetupData.meetupDate}`);
      
      return post;

    } catch (error) {
      logError('번개모임 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 번개모임 참가
   */
  async joinMeetup(postId: string, participantData: {
    participantId: string;
    participantName: string;
    message?: string;
    emergencyContact?: string;
    status?: 'pending' | 'confirmed';
  }): Promise<any> {
    try {
      const post = await CommunityPost.findById(postId);
      if (!post || post.roomType !== 'meetup') {
        throw new Error('번개모임을 찾을 수 없습니다.');
      }

      const meetup = post.roomSpecific?.meetup;
      if (!meetup) {
        throw new Error('번개모임 정보가 없습니다.');
      }

      if (meetup.status !== 'recruiting') {
        throw new Error('모집이 종료된 번개모임입니다.');
      }

      if (meetup.currentParticipants >= meetup.maxParticipants) {
        throw new Error('참가 인원이 마감되었습니다.');
      }

      // 중복 참가 확인
      const existingParticipant = await MeetupParticipant.findOne({
        meetupPostId: postId,
        participantId: participantData.participantId
      });

      if (existingParticipant) {
        throw new Error('이미 참가 신청한 모임입니다.');
      }

      // 참가자 등록
      const participant = new MeetupParticipant({
        meetupPostId: postId,
        ...participantData,
        status: participantData.status || 'pending'
      });

      await participant.save();

      // 번개모임 참가자 수 업데이트
      meetup.currentParticipants += 1;
      meetup.participants.push(new mongoose.Types.ObjectId(participantData.participantId));

      // 마감 체크
      if (meetup.currentParticipants >= meetup.maxParticipants) {
        meetup.status = 'confirmed';
      }

      await post.save();

      logInfo(`번개모임 참가: ${participantData.participantName} -> ${post.title}`);
      
      return participant;

    } catch (error) {
      logError('번개모임 참가 실패:', error);
      throw error;
    }
  }

  /**
   * 게시글 목록 조회 (방별)
   */
  async getPostsByRoom(
    roomType: RoomType,
    options: {
      page?: number;
      limit?: number;
      sortBy?: 'latest' | 'popular' | 'rating';
      filters?: any;
    } = {}
  ): Promise<{
    posts: ICommunityPost[];
    pagination: any;
    roomInfo: any;
  }> {
    try {
      const { page = 1, limit = 20, sortBy = 'latest', filters = {} } = options;
      const skip = (page - 1) * limit;

      const query: any = { roomType, isHidden: false };
      
      // 방별 필터 적용
      if (roomType === 'equipment_reviews' && filters.category) {
        query['roomSpecific.equipmentReview.category'] = filters.category;
      }
      if (roomType === 'meetup' && filters.status) {
        query['roomSpecific.meetup.status'] = filters.status;
      }
      if (roomType === 'tips' && filters.category) {
        query['roomSpecific.tip.category'] = filters.category;
      }

      // 정렬 옵션
      let sortOptions: any = { isPinned: -1, createdAt: -1 };
      if (sortBy === 'popular') {
        sortOptions = { isPinned: -1, likesCount: -1, commentsCount: -1, views: -1 };
      } else if (sortBy === 'rating' && roomType === 'equipment_reviews') {
        sortOptions = { isPinned: -1, 'roomSpecific.equipmentReview.rating': -1, likesCount: -1 };
      }

      const posts = await CommunityPost.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('authorId', 'name profileImage userType')
        .populate({
          path: 'comments',
          options: { limit: 3, sort: { createdAt: -1 } },
          populate: { path: 'authorId', select: 'name profileImage' }
        });

      const total = await CommunityPost.countDocuments(query);

      return {
        posts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        },
        roomInfo: ROOM_CONFIGS[roomType]
      };

    } catch (error) {
      logError('게시글 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 용품별 후기 통계 조회
   */
  async getEquipmentReviewStats(productName: string, brand?: string): Promise<{
    overallStats: any;
    recentReviews: ICommunityPost[];
    ratingDistribution: any;
    comparisonData: any[];
  }> {
    try {
      // 1. 전체 통계
      const statsQuery: any = {
        roomType: 'equipment_reviews',
        'roomSpecific.equipmentReview.productName': new RegExp(productName, 'i'),
        isHidden: false
      };

      if (brand) {
        statsQuery['roomSpecific.equipmentReview.brand'] = new RegExp(brand, 'i');
      }

      const reviews = await CommunityPost.find(statsQuery);
      
      if (reviews.length === 0) {
        return {
          overallStats: null,
          recentReviews: [],
          ratingDistribution: {},
          comparisonData: []
        };
      }

      // 2. 통계 계산
      const overallStats = this.calculateEquipmentStats(reviews);

      // 3. 최근 후기
      const recentReviews = await CommunityPost.find(statsQuery)
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('authorId', 'name profileImage userType');

      // 4. 평점 분포
      const ratingDistribution = this.calculateRatingDistribution(reviews);

      // 5. 비교 데이터
      const comparisonData = await (CommunityPost as any).getEquipmentComparisonData(productName, brand);

      return {
        overallStats,
        recentReviews,
        ratingDistribution,
        comparisonData
      };

    } catch (error) {
      logError('용품 후기 통계 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 댓글 작성
   */
  async createComment(commentData: {
    postId: string;
    authorId: string;
    authorName: string;
    authorRole: string;
    content: string;
    parentCommentId?: string;
  }): Promise<ICommunityComment> {
    try {
      const comment = new CommunityComment({
        ...commentData,
        likesCount: 0,
        repliesCount: 0,
        likes: [],
        replies: [],
        isHidden: false,
        isReported: false
      });

      await comment.save();

      // 게시글의 댓글 수 업데이트
      await CommunityPost.findByIdAndUpdate(commentData.postId, {
        $push: { comments: comment._id },
        $inc: { commentsCount: 1 }
      });

      // 대댓글인 경우 부모 댓글 업데이트
      if (commentData.parentCommentId) {
        await CommunityComment.findByIdAndUpdate(commentData.parentCommentId, {
          $push: { replies: comment._id },
          $inc: { repliesCount: 1 }
        });
      }

      logInfo(`댓글 작성: 게시글 ${commentData.postId}`);
      
      return comment;

    } catch (error) {
      logError('댓글 작성 실패:', error);
      throw error;
    }
  }

  /**
   * 좋아요 토글
   */
  async toggleLike(postId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    try {
      const post = await CommunityPost.findById(postId);
      if (!post) {
        throw new Error('게시글을 찾을 수 없습니다.');
      }

      const userObjectId = new mongoose.Types.ObjectId(userId);
      const isLiked = post.likes.includes(userObjectId);

      if (isLiked) {
        await (post as any).removeLike(userId);
      } else {
        await (post as any).addLike(userId);
      }

      return {
        liked: !isLiked,
        likesCount: post.likesCount
      };

    } catch (error) {
      logError('좋아요 토글 실패:', error);
      throw error;
    }
  }

  /**
   * 활성 번개모임 조회
   */
  async getActiveMeetups(): Promise<ICommunityPost[]> {
    try {
      const meetups = await (CommunityPost as any).getActiveMeetups();
      return meetups;

    } catch (error) {
      logError('활성 번개모임 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 인기 용품 후기 조회
   */
  async getPopularEquipmentReviews(category?: string): Promise<ICommunityPost[]> {
    try {
      const filters: any = { sortBy: 'helpful' };
      if (category) filters.category = category;

      const reviews = await (CommunityPost as any).getDetailedEquipmentReviews(filters);
      return reviews.slice(0, 10); // 상위 10개

    } catch (error) {
      logError('인기 용품 후기 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 추천 용품 리스트 (후기 기반)
   */
  async getRecommendedEquipment(userLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner'): Promise<any[]> {
    try {
      const pipeline = [
        {
          $match: {
            roomType: 'equipment_reviews',
            'roomSpecific.equipmentReview.recommendedFor': userLevel,
            'roomSpecific.equipmentReview.recommendToOthers': true,
            'roomSpecific.equipmentReview.rating': { $gte: 4 },
            isHidden: false
          }
        },
        {
          $group: {
            _id: {
              productName: '$roomSpecific.equipmentReview.productName',
              brand: '$roomSpecific.equipmentReview.brand',
              category: '$roomSpecific.equipmentReview.category'
            },
            avgRating: { $avg: '$roomSpecific.equipmentReview.rating' },
            avgValueForMoney: { $avg: '$roomSpecific.equipmentReview.detailedRating.valueForMoney' },
            reviewCount: { $sum: 1 },
            recommendCount: { $sum: 1 },
            totalLikes: { $sum: '$likesCount' },
            avgPrice: { $avg: '$roomSpecific.equipmentReview.purchasePrice' },
            recentReviews: { $push: {
              title: '$title',
              content: { $substr: ['$content', 0, 100] },
              authorName: '$authorName',
              rating: '$roomSpecific.equipmentReview.rating',
              createdAt: '$createdAt'
            }}
          }
        },
        {
          $addFields: {
            recommendRate: 100, // 이미 recommendToOthers가 true인 것만 필터링했으므로
            popularityScore: {
              $add: [
                { $multiply: ['$avgRating', 20] },
                { $multiply: ['$reviewCount', 5] },
                { $multiply: ['$totalLikes', 2] }
              ]
            }
          }
        },
        { $sort: { popularityScore: -1 as -1, avgRating: -1 as -1 } },
        { $limit: 20 }
      ];

      const recommendations = await CommunityPost.aggregate(pipeline);
      return recommendations;

    } catch (error) {
      logError('추천 용품 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 커뮤니티 통계 대시보드
   */
  async getCommunityStats(): Promise<{
    totalPosts: number;
    totalComments: number;
    activeUsers: number;
    roomStats: any;
    trendingTopics: any[];
    recentActivity: any[];
  }> {
    try {
      // 1. 전체 통계
      const totalPosts = await CommunityPost.countDocuments({ isHidden: false });
      const totalComments = await CommunityComment.countDocuments({ isHidden: false });
      
      // 2. 방별 통계
      const roomStats = await CommunityPost.aggregate([
        { $match: { isHidden: false } },
        {
          $group: {
            _id: '$roomType',
            postCount: { $sum: 1 },
            totalLikes: { $sum: '$likesCount' },
            totalComments: { $sum: '$commentsCount' },
            avgViews: { $avg: '$views' }
          }
        }
      ]);

      // 3. 활성 사용자 수 (최근 7일)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const activeUsers = await CommunityPost.distinct('authorId', {
        createdAt: { $gte: sevenDaysAgo }
      });

      // 4. 트렌딩 토픽
      const trendingTopics = await CommunityPost.find({
        createdAt: { $gte: sevenDaysAgo },
        isHidden: false
      })
      .sort({ likesCount: -1, commentsCount: -1 })
      .limit(10)
      .select('title roomType likesCount commentsCount views');

      // 5. 최근 활동
      const recentActivity = await CommunityPost.find({ isHidden: false })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('authorId', 'name profileImage')
        .select('title roomType authorId createdAt likesCount commentsCount');

      return {
        totalPosts,
        totalComments,
        activeUsers: activeUsers.length,
        roomStats,
        trendingTopics,
        recentActivity
      };

    } catch (error) {
      logError('커뮤니티 통계 조회 실패:', error);
      throw error;
    }
  }

  // Private 헬퍼 메서드들
  private validateRoomSpecificData(roomType: RoomType, roomSpecific?: any): void {
    if (roomType === 'equipment_reviews') {
      if (!roomSpecific?.equipmentReview) {
        throw new Error('용품 후기 정보가 필요합니다.');
      }
      
      const review = roomSpecific.equipmentReview;
      if (!review.productName || !review.brand || !review.rating || !review.usagePeriod) {
        throw new Error('필수 용품 후기 정보가 누락되었습니다.');
      }
      
      if (!review.detailedRating || Object.keys(review.detailedRating).length !== 5) {
        throw new Error('세부 평가 정보가 필요합니다.');
      }
    }
    
    if (roomType === 'meetup') {
      if (!roomSpecific?.meetup) {
        throw new Error('번개모임 정보가 필요합니다.');
      }
      
      const meetup = roomSpecific.meetup;
      if (!meetup.meetupDate || !meetup.location || !meetup.maxParticipants) {
        throw new Error('필수 번개모임 정보가 누락되었습니다.');
      }
    }
  }

  private calculateEquipmentStats(reviews: ICommunityPost[]): any {
    const stats = {
      totalReviews: reviews.length,
      avgRating: 0,
      avgDetailedRating: {
        durability: 0,
        comfort: 0,
        performance: 0,
        valueForMoney: 0,
        design: 0
      },
      wouldBuyAgainRate: 0,
      recommendRate: 0,
      avgUsagePeriodMonths: 0
    };

    if (reviews.length === 0) return stats;

    let totalRating = 0;
    const totalDetailedRating = { durability: 0, comfort: 0, performance: 0, valueForMoney: 0, design: 0 };
    let wouldBuyAgainCount = 0;
    let recommendCount = 0;
    let totalUsageMonths = 0;

    reviews.forEach(review => {
      const equipReview = review.roomSpecific?.equipmentReview;
      if (equipReview) {
        totalRating += equipReview.rating;
        
        Object.keys(totalDetailedRating).forEach(key => {
          totalDetailedRating[key as keyof typeof totalDetailedRating] += equipReview.detailedRating[key as keyof typeof equipReview.detailedRating];
        });
        
        if (equipReview.wouldBuyAgain) wouldBuyAgainCount++;
        if (equipReview.recommendToOthers) recommendCount++;
        
        // 사용 기간을 월 단위로 변환 (간단한 파싱)
        const usagePeriod = equipReview.usagePeriod.toLowerCase();
        if (usagePeriod.includes('년')) {
          const years = parseInt(usagePeriod.match(/\d+/)?.[0] || '0');
          totalUsageMonths += years * 12;
        } else if (usagePeriod.includes('개월')) {
          const months = parseInt(usagePeriod.match(/\d+/)?.[0] || '0');
          totalUsageMonths += months;
        }
      }
    });

    stats.avgRating = Math.round((totalRating / reviews.length) * 10) / 10;
    Object.keys(stats.avgDetailedRating).forEach(key => {
      stats.avgDetailedRating[key as keyof typeof stats.avgDetailedRating] = 
        Math.round((totalDetailedRating[key as keyof typeof totalDetailedRating] / reviews.length) * 10) / 10;
    });
    stats.wouldBuyAgainRate = Math.round((wouldBuyAgainCount / reviews.length) * 100);
    stats.recommendRate = Math.round((recommendCount / reviews.length) * 100);
    stats.avgUsagePeriodMonths = Math.round(totalUsageMonths / reviews.length);

    return stats;
  }

  private calculateRatingDistribution(reviews: ICommunityPost[]): any {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    reviews.forEach(review => {
      const rating = review.roomSpecific?.equipmentReview?.rating;
      if (rating) {
        distribution[rating as keyof typeof distribution]++;
      }
    });

    return distribution;
  }
}

export default CommunityService;
