/**
 * @file 알림 서비스
 * @description 실시간 알림 생성 및 관리 서비스
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

import { Notification } from '../models/Notification';
import { User } from '../models/User';

export class NotificationService {
  /**
   * 학습 진도 알림 생성
   */
  static async createLearningProgressNotification(
    userId: string,
    progressData: any
  ) {
    try {
      const user = await User.findById(userId);
      if (!user) return null;

      const { completedSteps, totalSteps, methodName } = progressData;
      const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

      let title = '';
      let message = '';
      let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';

      if (progressPercentage === 100) {
        title = '🎉 강습법 완료!';
        message = `축하합니다! "${methodName}" 강습법을 완료했습니다.`;
        priority = 'high';
      } else if (progressPercentage >= 75) {
        title = '🔥 거의 완료!';
        message = `"${methodName}" 강습법이 ${progressPercentage}% 완료되었습니다.`;
        priority = 'medium';
      } else if (progressPercentage >= 50) {
        title = '📈 진도 업데이트';
        message = `"${methodName}" 강습법이 ${progressPercentage}% 완료되었습니다.`;
        priority = 'low';
      } else {
        return null; // 50% 미만은 알림 생성하지 않음
      }

      if (title) {
        notificationTitle = title;
      }

      if (title) {
        notificationTitle = title;
      }

      return await Notification.create({
        userId,
        type: 'learning_progress',
        title,
        message,
        data: {
          methodName,
          progressPercentage,
          completedSteps,
          totalSteps
        },
        priority
      });
    } catch (error) {
      console.error('❌ 학습 진도 알림 생성 오류:', error);
      return null;
    }
  }

  /**
   * 추천 알림 생성
   */
  static async createRecommendationNotification(
    userId: string,
    recommendationData: any
  ) {
    try {
      const { type, description, methodName, title: customTitle } = recommendationData;

      let notificationTitle = '';
      let notificationMessage = '';
      let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';

      switch (type) {
        case 'new_recommendation':
          notificationTitle = '💡 새로운 추천!';
          notificationMessage = `"${methodName}" 강습법을 추천드립니다.`;
          priority = 'medium';
          break;
        case 'weak_area':
          notificationTitle = '🎯 약점 보완 추천';
          notificationMessage = `"${methodName}" 강습법으로 약점을 보완해보세요.`;
          priority = 'high';
          break;
        case 'achievement':
          notificationTitle = '🏆 성취 달성!';
          notificationMessage = `"${methodName}" 관련 성취를 달성했습니다.`;
          priority = 'high';
          break;
        default:
          notificationTitle = '📚 학습 추천';
          notificationMessage = `"${methodName}" 강습법을 확인해보세요.`;
          priority = 'low';
      }

      if (customTitle) {
        notificationTitle = customTitle;
      }

      return await Notification.create({
        userId,
        type: 'recommendation',
        title: notificationTitle,
        message: notificationMessage,
        data: {
          recommendationType: type,
          methodName,
          description
        },
        priority
      });
    } catch (error) {
      console.error('❌ 추천 알림 생성 오류:', error);
      return null;
    }
  }

  /**
   * 수업 계획 알림 생성
   */
  static async createLessonPlanNotification(
    instructorId: string,
    studentId: string,
    lessonData: any
  ) {
    try {
      const { title, date, methodName } = lessonData;

      return await Notification.create({
        userId: studentId,
        type: 'lesson_plan',
        title: '📅 수업 계획 알림',
        message: `"${methodName}" 강습법으로 수업이 예정되어 있습니다.`,
        data: {
          lessonTitle: title,
          lessonDate: date,
          methodName,
          instructorId
        },
        priority: 'medium'
      });
    } catch (error) {
      console.error('❌ 수업 계획 알림 생성 오류:', error);
      return null;
    }
  }

  /**
   * 퀴즈 알림 생성
   */
  static async createQuizNotification(
    userId: string,
    quizData: any
  ) {
    try {
      const { title, level, dueDate } = quizData;

      return await Notification.create({
        userId,
        type: 'quiz',
        title: '📝 퀴즈 알림',
        message: `"${title}" 퀴즈가 ${level} 레벨에서 출제되었습니다.`,
        data: {
          quizTitle: title,
          level,
          dueDate
        },
        priority: 'medium',
        expiresAt: dueDate ? new Date(dueDate) : undefined
      });
    } catch (error) {
      console.error('❌ 퀴즈 알림 생성 오류:', error);
      return null;
    }
  }

  /**
   * 시스템 알림 생성
   */
  static async createSystemNotification(
    userId: string,
    systemData: any
  ) {
    try {
      const { title, message, priority = 'medium' } = systemData;

      return await Notification.create({
        userId,
        type: 'system',
        title,
        message,
        data: systemData,
        priority
      });
    } catch (error) {
      console.error('❌ 시스템 알림 생성 오류:', error);
      return null;
    }
  }

  /**
   * 성취 알림 생성
   */
  static async createAchievementNotification(
    userId: string,
    achievementData: any
  ) {
    try {
      const { title, description, badge, points } = achievementData;

      return await Notification.create({
        userId,
        type: 'achievement',
        title: `🏆 ${title}`,
        message: description,
        data: {
          badge,
          points,
          achievementType: achievementData.type
        },
        priority: 'high'
      });
    } catch (error) {
      console.error('❌ 성취 알림 생성 오류:', error);
      return null;
    }
  }

  /**
   * 사용자별 알림 통계
   */
  static async getUserNotificationStats(userId: string) {
    try {
      const stats = await Notification.aggregate([
        { $match: { userId: userId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            unread: {
              $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
            },
            byType: {
              $push: {
                type: '$type',
                isRead: '$isRead'
              }
            }
          }
        }
      ]);

      if (stats.length === 0) {
        return {
          total: 0,
          unread: 0,
          byType: {}
        };
      }

      const result = stats[0];
      const byType: any = {};

      result.byType.forEach((item: any) => {
        if (!byType[item.type]) {
          byType[item.type] = { total: 0, unread: 0 };
        }
        byType[item.type].total++;
        if (!item.isRead) {
          byType[item.type].unread++;
        }
      });

      return {
        total: result.total,
        unread: result.unread,
        byType
      };
    } catch (error) {
      console.error('❌ 알림 통계 조회 오류:', error);
      return {
        total: 0,
        unread: 0,
        byType: {}
      };
    }
  }

  /**
   * 만료된 알림 정리
   */
  static async cleanupExpiredNotifications() {
    try {
      const result = await Notification.deleteMany({
        expiresAt: { $lt: new Date() }
      });

      console.log(`✅ 만료된 알림 ${result.deletedCount}개 정리 완료`);
      return result.deletedCount;
    } catch (error) {
      console.error('❌ 만료된 알림 정리 오류:', error);
      return 0;
    }
  }
}
