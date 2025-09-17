import { ICommunityPost, ICommunityComment, RoomType } from '../models/Community';
export declare class CommunityService {
    private static instance;
    static getInstance(): CommunityService;
    createPost(postData: {
        roomType: RoomType;
        title: string;
        content: string;
        authorId: string;
        authorName: string;
        authorRole: string;
        attachments?: any[];
        roomSpecific?: any;
    }): Promise<ICommunityPost>;
    createEquipmentReview(reviewData: {
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
    }): Promise<ICommunityPost>;
    createMeetup(meetupData: {
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
    }): Promise<ICommunityPost>;
    joinMeetup(postId: string, participantData: {
        participantId: string;
        participantName: string;
        message?: string;
        emergencyContact?: string;
        status?: 'pending' | 'confirmed';
    }): Promise<any>;
    getPostsByRoom(roomType: RoomType, options?: {
        page?: number;
        limit?: number;
        sortBy?: 'latest' | 'popular' | 'rating';
        filters?: any;
    }): Promise<{
        posts: ICommunityPost[];
        pagination: any;
        roomInfo: any;
    }>;
    getEquipmentReviewStats(productName: string, brand?: string): Promise<{
        overallStats: any;
        recentReviews: ICommunityPost[];
        ratingDistribution: any;
        comparisonData: any[];
    }>;
    createComment(commentData: {
        postId: string;
        authorId: string;
        authorName: string;
        authorRole: string;
        content: string;
        parentCommentId?: string;
    }): Promise<ICommunityComment>;
    toggleLike(postId: string, userId: string): Promise<{
        liked: boolean;
        likesCount: number;
    }>;
    getActiveMeetups(): Promise<ICommunityPost[]>;
    getPopularEquipmentReviews(category?: string): Promise<ICommunityPost[]>;
    getRecommendedEquipment(userLevel?: 'beginner' | 'intermediate' | 'advanced'): Promise<any[]>;
    getCommunityStats(): Promise<{
        totalPosts: number;
        totalComments: number;
        activeUsers: number;
        roomStats: any;
        trendingTopics: any[];
        recentActivity: any[];
    }>;
    private validateRoomSpecificData;
    private calculateEquipmentStats;
    private calculateRatingDistribution;
}
export default CommunityService;
//# sourceMappingURL=communityService.d.ts.map