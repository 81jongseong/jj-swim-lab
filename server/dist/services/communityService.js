"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityService = void 0;
const Community_1 = require("../models/Community");
const logger_1 = require("../utils/logger");
const mongoose_1 = __importDefault(require("mongoose"));
class CommunityService {
    static getInstance() {
        if (!CommunityService.instance) {
            CommunityService.instance = new CommunityService();
        }
        return CommunityService.instance;
    }
    async createPost(postData) {
        try {
            this.validateRoomSpecificData(postData.roomType, postData.roomSpecific);
            const post = new Community_1.CommunityPost({
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
            (0, logger_1.logInfo)(`새 게시글 작성: ${postData.roomType} - ${postData.title}`);
            return post;
        }
        catch (error) {
            (0, logger_1.logError)('게시글 작성 실패:', error);
            throw error;
        }
    }
    async createEquipmentReview(reviewData) {
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
            (0, logger_1.logInfo)(`용품 후기 작성: ${reviewData.productName} (${reviewData.brand})`);
            return post;
        }
        catch (error) {
            (0, logger_1.logError)('용품 후기 작성 실패:', error);
            throw error;
        }
    }
    async createMeetup(meetupData) {
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
                        currentParticipants: 1,
                        participants: [meetupData.authorId],
                        meetupType: meetupData.meetupType,
                        skill_level: meetupData.skill_level,
                        fee: meetupData.fee,
                        status: 'recruiting'
                    }
                }
            });
            await this.joinMeetup(post._id.toString(), {
                participantId: meetupData.authorId,
                participantName: meetupData.authorName,
                message: '모임 주최자입니다.',
                status: 'confirmed'
            });
            (0, logger_1.logInfo)(`번개모임 생성: ${meetupData.title} - ${meetupData.meetupDate}`);
            return post;
        }
        catch (error) {
            (0, logger_1.logError)('번개모임 생성 실패:', error);
            throw error;
        }
    }
    async joinMeetup(postId, participantData) {
        try {
            const post = await Community_1.CommunityPost.findById(postId);
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
            const existingParticipant = await Community_1.MeetupParticipant.findOne({
                meetupPostId: postId,
                participantId: participantData.participantId
            });
            if (existingParticipant) {
                throw new Error('이미 참가 신청한 모임입니다.');
            }
            const participant = new Community_1.MeetupParticipant({
                meetupPostId: postId,
                ...participantData,
                status: participantData.status || 'pending'
            });
            await participant.save();
            meetup.currentParticipants += 1;
            meetup.participants.push(new mongoose_1.default.Types.ObjectId(participantData.participantId));
            if (meetup.currentParticipants >= meetup.maxParticipants) {
                meetup.status = 'confirmed';
            }
            await post.save();
            (0, logger_1.logInfo)(`번개모임 참가: ${participantData.participantName} -> ${post.title}`);
            return participant;
        }
        catch (error) {
            (0, logger_1.logError)('번개모임 참가 실패:', error);
            throw error;
        }
    }
    async getPostsByRoom(roomType, options = {}) {
        try {
            const { page = 1, limit = 20, sortBy = 'latest', filters = {} } = options;
            const skip = (page - 1) * limit;
            const query = { roomType, isHidden: false };
            if (roomType === 'equipment_reviews' && filters.category) {
                query['roomSpecific.equipmentReview.category'] = filters.category;
            }
            if (roomType === 'meetup' && filters.status) {
                query['roomSpecific.meetup.status'] = filters.status;
            }
            if (roomType === 'tips' && filters.category) {
                query['roomSpecific.tip.category'] = filters.category;
            }
            let sortOptions = { isPinned: -1, createdAt: -1 };
            if (sortBy === 'popular') {
                sortOptions = { isPinned: -1, likesCount: -1, commentsCount: -1, views: -1 };
            }
            else if (sortBy === 'rating' && roomType === 'equipment_reviews') {
                sortOptions = { isPinned: -1, 'roomSpecific.equipmentReview.rating': -1, likesCount: -1 };
            }
            const posts = await Community_1.CommunityPost.find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .populate('authorId', 'name profileImage userType')
                .populate({
                path: 'comments',
                options: { limit: 3, sort: { createdAt: -1 } },
                populate: { path: 'authorId', select: 'name profileImage' }
            });
            const total = await Community_1.CommunityPost.countDocuments(query);
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
                roomInfo: Community_1.ROOM_CONFIGS[roomType]
            };
        }
        catch (error) {
            (0, logger_1.logError)('게시글 목록 조회 실패:', error);
            throw error;
        }
    }
    async getEquipmentReviewStats(productName, brand) {
        try {
            const statsQuery = {
                roomType: 'equipment_reviews',
                'roomSpecific.equipmentReview.productName': new RegExp(productName, 'i'),
                isHidden: false
            };
            if (brand) {
                statsQuery['roomSpecific.equipmentReview.brand'] = new RegExp(brand, 'i');
            }
            const reviews = await Community_1.CommunityPost.find(statsQuery);
            if (reviews.length === 0) {
                return {
                    overallStats: null,
                    recentReviews: [],
                    ratingDistribution: {},
                    comparisonData: []
                };
            }
            const overallStats = this.calculateEquipmentStats(reviews);
            const recentReviews = await Community_1.CommunityPost.find(statsQuery)
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('authorId', 'name profileImage userType');
            const ratingDistribution = this.calculateRatingDistribution(reviews);
            const comparisonData = await Community_1.CommunityPost.getEquipmentComparisonData(productName, brand);
            return {
                overallStats,
                recentReviews,
                ratingDistribution,
                comparisonData
            };
        }
        catch (error) {
            (0, logger_1.logError)('용품 후기 통계 조회 실패:', error);
            throw error;
        }
    }
    async createComment(commentData) {
        try {
            const comment = new Community_1.CommunityComment({
                ...commentData,
                likesCount: 0,
                repliesCount: 0,
                likes: [],
                replies: [],
                isHidden: false,
                isReported: false
            });
            await comment.save();
            await Community_1.CommunityPost.findByIdAndUpdate(commentData.postId, {
                $push: { comments: comment._id },
                $inc: { commentsCount: 1 }
            });
            if (commentData.parentCommentId) {
                await Community_1.CommunityComment.findByIdAndUpdate(commentData.parentCommentId, {
                    $push: { replies: comment._id },
                    $inc: { repliesCount: 1 }
                });
            }
            (0, logger_1.logInfo)(`댓글 작성: 게시글 ${commentData.postId}`);
            return comment;
        }
        catch (error) {
            (0, logger_1.logError)('댓글 작성 실패:', error);
            throw error;
        }
    }
    async toggleLike(postId, userId) {
        try {
            const post = await Community_1.CommunityPost.findById(postId);
            if (!post) {
                throw new Error('게시글을 찾을 수 없습니다.');
            }
            const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
            const isLiked = post.likes.includes(userObjectId);
            if (isLiked) {
                await post.removeLike(userId);
            }
            else {
                await post.addLike(userId);
            }
            return {
                liked: !isLiked,
                likesCount: post.likesCount
            };
        }
        catch (error) {
            (0, logger_1.logError)('좋아요 토글 실패:', error);
            throw error;
        }
    }
    async getActiveMeetups() {
        try {
            const meetups = await Community_1.CommunityPost.getActiveMeetups();
            return meetups;
        }
        catch (error) {
            (0, logger_1.logError)('활성 번개모임 조회 실패:', error);
            throw error;
        }
    }
    async getPopularEquipmentReviews(category) {
        try {
            const filters = { sortBy: 'helpful' };
            if (category)
                filters.category = category;
            const reviews = await Community_1.CommunityPost.getDetailedEquipmentReviews(filters);
            return reviews.slice(0, 10);
        }
        catch (error) {
            (0, logger_1.logError)('인기 용품 후기 조회 실패:', error);
            throw error;
        }
    }
    async getRecommendedEquipment(userLevel = 'beginner') {
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
                            } }
                    }
                },
                {
                    $addFields: {
                        recommendRate: 100,
                        popularityScore: {
                            $add: [
                                { $multiply: ['$avgRating', 20] },
                                { $multiply: ['$reviewCount', 5] },
                                { $multiply: ['$totalLikes', 2] }
                            ]
                        }
                    }
                },
                { $sort: { popularityScore: -1, avgRating: -1 } },
                { $limit: 20 }
            ];
            const recommendations = await Community_1.CommunityPost.aggregate(pipeline);
            return recommendations;
        }
        catch (error) {
            (0, logger_1.logError)('추천 용품 조회 실패:', error);
            throw error;
        }
    }
    async getCommunityStats() {
        try {
            const totalPosts = await Community_1.CommunityPost.countDocuments({ isHidden: false });
            const totalComments = await Community_1.CommunityComment.countDocuments({ isHidden: false });
            const roomStats = await Community_1.CommunityPost.aggregate([
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
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const activeUsers = await Community_1.CommunityPost.distinct('authorId', {
                createdAt: { $gte: sevenDaysAgo }
            });
            const trendingTopics = await Community_1.CommunityPost.find({
                createdAt: { $gte: sevenDaysAgo },
                isHidden: false
            })
                .sort({ likesCount: -1, commentsCount: -1 })
                .limit(10)
                .select('title roomType likesCount commentsCount views');
            const recentActivity = await Community_1.CommunityPost.find({ isHidden: false })
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
        }
        catch (error) {
            (0, logger_1.logError)('커뮤니티 통계 조회 실패:', error);
            throw error;
        }
    }
    validateRoomSpecificData(roomType, roomSpecific) {
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
    calculateEquipmentStats(reviews) {
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
        if (reviews.length === 0)
            return stats;
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
                    totalDetailedRating[key] += equipReview.detailedRating[key];
                });
                if (equipReview.wouldBuyAgain)
                    wouldBuyAgainCount++;
                if (equipReview.recommendToOthers)
                    recommendCount++;
                const usagePeriod = equipReview.usagePeriod.toLowerCase();
                if (usagePeriod.includes('년')) {
                    const years = parseInt(usagePeriod.match(/\d+/)?.[0] || '0');
                    totalUsageMonths += years * 12;
                }
                else if (usagePeriod.includes('개월')) {
                    const months = parseInt(usagePeriod.match(/\d+/)?.[0] || '0');
                    totalUsageMonths += months;
                }
            }
        });
        stats.avgRating = Math.round((totalRating / reviews.length) * 10) / 10;
        Object.keys(stats.avgDetailedRating).forEach(key => {
            stats.avgDetailedRating[key] =
                Math.round((totalDetailedRating[key] / reviews.length) * 10) / 10;
        });
        stats.wouldBuyAgainRate = Math.round((wouldBuyAgainCount / reviews.length) * 100);
        stats.recommendRate = Math.round((recommendCount / reviews.length) * 100);
        stats.avgUsagePeriodMonths = Math.round(totalUsageMonths / reviews.length);
        return stats;
    }
    calculateRatingDistribution(reviews) {
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(review => {
            const rating = review.roomSpecific?.equipmentReview?.rating;
            if (rating) {
                distribution[rating]++;
            }
        });
        return distribution;
    }
}
exports.CommunityService = CommunityService;
exports.default = CommunityService;
//# sourceMappingURL=communityService.js.map