import express, { Request, Response, Router } from 'express';
import { auth, requireRole } from '../middleware/auth';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { Booking } from '../models/Booking';
import { Payment } from '../models/Payment';
import { Notice } from '../models/Notice';
import { Progress } from '../models/Progress';
import { Evaluation } from '../models/Evaluation';
import { SwimmingCenter } from '../models/SwimmingCenter';

interface AuthRequest extends Request {
  user?: any;
}

const router: Router = express.Router();

// ===== 공통 대시보드 기능 =====

// 1. 사용자별 대시보드 데이터 조회
router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    // 사용자 유형별 레벨 정보
    const userLevelInfo = user.userLevelInfo;

    // 기본 대시보드 데이터
    let dashboardData: any = {
      user: {
        id: user._id,
        name: user.name,
        userId: user.userId,
        userType: user.userType,
        email: user.email,
        levelInfo: userLevelInfo,
        accessPermissions: user.accessPermissions,
        featureSequence: user.featureSequence
      }
    };

    // 사용자 유형별 대시보드 데이터
    switch (user.userType) {
      case 'student':
        dashboardData = await getStudentDashboard(user);
        break;
      case 'instructor':
        dashboardData = await getInstructorDashboard(user);
        break;
      case 'centerAdmin':
        dashboardData = await getCenterAdminDashboard(user);
        break;
      case 'superAdmin':
        dashboardData = await getSuperAdminDashboard(user);
        break;
    }

    return res.json(dashboardData);
  } catch (error) {
    console.error('대시보드 데이터 조회 오류:', error);
    return res.status(500).json({ error: '대시보드 데이터를 불러오는 데 실패했습니다.' });
  }
});

// 10. 회원 맞춤 추천 시스템 (학생만)
router.get('/personalized-recommendations', auth, requireRole(['student']), async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    // 개인 맞춤 추천 시스템
    const recommendations = {
      courses: {
        recommended: [
          {
            name: '자유형 완성 과정',
            reason: '현재 진도 70% 달성으로 다음 단계 준비 완료',
            expectedProgress: '2개월 내 완성 가능',
            price: '150,000원',
            discount: '20% 할인 (진도 달성 보상)'
          },
          {
            name: '평영 기초 과정',
            reason: '자유형 완성 후 자연스러운 다음 단계',
            expectedProgress: '3개월 과정',
            price: '180,000원',
            discount: '첫 달 30% 할인'
          }
        ],
        trending: [
          {
            name: '수영 경기 준비 과정',
            popularity: '🔥 인기 급상승',
            reason: '최근 30일간 150% 증가',
            price: '200,000원'
          }
        ]
      },
      instructors: {
        recommended: [
          {
            name: '김수영 강사',
            rating: 4.8,
            specialty: '자유형 전문',
            reason: '현재 담당 강사와 비슷한 지도 스타일',
            experience: '8년',
            satisfaction: '98%'
          }
        ],
        topRated: [
          {
            name: '박영법 강사',
            rating: 4.9,
            specialty: '전 영법 마스터',
            reason: '전체 강사 중 최고 평점',
            experience: '12년',
            satisfaction: '99%'
          }
        ]
      },
      goals: {
        shortTerm: [
          '2주 내 자유형 호흡법 완벽 숙련',
          '1개월 내 50m 자유형 완주',
          '3개월 내 평영 기본 동작 습득'
        ],
        longTerm: [
          '6개월 내 모든 영법 완성',
          '1년 내 수영 경기 참가',
          '2년 내 수영 강사 자격증 취득'
        ]
      },
      rewards: {
        available: [
          {
            type: '진도 달성 보상',
            description: '체크리스트 80% 완성 시 다음 강습 20% 할인',
            progress: '75%',
            remaining: '2개 항목'
          },
          {
            type: '연속 수강 보상',
            description: '3개월 연속 수강 시 4개월 무료',
            progress: '2개월',
            remaining: '1개월'
          }
        ]
      }
    };

    res.json({
      success: true,
      message: '개인 맞춤 추천 조회 성공!',
      data: recommendations
    });
  } catch (error) {
    console.error('개인 맞춤 추천 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '개인 맞춤 추천 조회에 실패했습니다.'
    });
  }
});

// 11. 회원 성과 분석 및 인사이트 (학생만)
router.get('/performance-insights', auth, requireRole(['student']), async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    // 개인 성과 분석
    const insights = {
      overview: {
        totalLessons: 24,
        completedLessons: 20,
        completionRate: '83%',
        currentStreak: '8일',
        longestStreak: '15일',
        totalSwimmingTime: '48시간'
      },
      progress: {
        swimmingLevel: {
          current: 'intermediate',
          next: 'advanced',
          progress: 65,
          estimatedTimeToNext: '3개월'
        },
        skills: {
          freestyle: { level: 'expert', progress: 95 },
          backstroke: { level: 'intermediate', progress: 70 },
          breaststroke: { level: 'beginner', progress: 30 },
          butterfly: { level: 'not_started', progress: 0 }
        }
      },
      achievements: [
        {
          name: '첫 100m 완주',
          date: '2024-06-15',
          difficulty: 'bronze',
          description: '자유형으로 100m를 완주한 첫 번째 성취'
        },
        {
          name: '연속 30일 수영',
          date: '2024-07-01',
          difficulty: 'silver',
          description: '30일 연속으로 수영장을 방문한 성취'
        },
        {
          name: '모든 기본 영법 습득',
          date: '2024-08-01',
          difficulty: 'gold',
          description: '자유형, 평영, 배영의 기본 동작을 모두 습득'
        }
      ],
      comparisons: {
        peerGroup: {
          rank: '상위 15%',
          totalStudents: 120,
          yourRank: 18,
          improvement: '+5 (지난 달 대비)'
        },
        ageGroup: {
          rank: '상위 20%',
          totalStudents: 85,
          yourRank: 17,
          improvement: '+3 (지난 달 대비)'
        }
      },
      recommendations: [
        '평영 연습 시간을 20% 늘려 다음 레벨 달성 가속화',
        '주말 특별 프로그램 참여로 추가 기술 습득',
        '개인 기록 측정으로 동기부여 강화',
        '정기적인 강사 피드백으로 개선점 파악'
      ]
    };

    res.json({
      success: true,
      message: '성과 분석 및 인사이트 조회 성공!',
      data: insights
    });
  } catch (error) {
    console.error('성과 분석 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '성과 분석 조회에 실패했습니다.'
    });
  }
});

// 12. 회원 커뮤니티 및 소셜 기능 (학생만)
router.get('/community', auth, requireRole(['student']), async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    // 커뮤니티 기능
    const community = {
      studyGroups: [
        {
          name: '자유형 마스터 그룹',
          members: 15,
          level: 'intermediate',
          nextMeeting: '2024-08-20 19:00',
          description: '자유형 완성을 목표로 하는 그룹'
        },
        {
          name: '수영 경기 준비 그룹',
          members: 8,
          level: 'advanced',
          nextMeeting: '2024-08-22 20:00',
          description: '수영 경기 참가를 준비하는 그룹'
        }
      ],
      challenges: [
        {
          name: '8월 수영 거리 챌린지',
          goal: '50km',
          current: '32km',
          progress: 64,
          reward: '특별 강습 1회 무료',
          participants: 45
        },
        {
          name: '영법 완성 챌린지',
          goal: '4가지 영법 완성',
          current: '2가지',
          progress: 50,
          reward: '강사 1:1 특별 지도',
          participants: 23
        }
      ],
      events: [
        {
          name: '수영 페스티벌 2024',
          date: '2024-09-15',
          type: 'competition',
          description: '연간 수영 실력 겨루기 대회',
          participants: 120,
          registrationDeadline: '2024-09-01'
        },
        {
          name: '강사와 함께하는 특별 워크샵',
          date: '2024-08-25',
          type: 'workshop',
          description: '고급 수영 기술 습득 워크샵',
          participants: 30,
          registrationDeadline: '2024-08-20'
        }
      ],
      social: {
        friends: [
          { name: '김수영', level: 'intermediate', mutualCourses: 2 },
          { name: '박영법', level: 'advanced', mutualCourses: 1 }
        ],
        recentActivities: [
          '김수영님이 자유형 100m 완주 달성',
          '박영법님이 새로운 영법 습득',
          '수영 페스티벌 등록 완료'
        ]
      }
    };

    res.json({
      success: true,
      message: '커뮤니티 정보 조회 성공!',
      data: community
    });
  } catch (error) {
    console.error('커뮤니티 정보 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '커뮤니티 정보 조회에 실패했습니다.'
    });
  }
});

// ===== 학생(회원) 대시보드 =====

async function getStudentDashboard(user: any) {
  try {
    // 수강 중인 강습 과정
    const enrolledCourses = await Course.find({
      _id: { $in: user.studentInfo?.enrolledCourses || [] }
    }).populate('instructor', 'name experience');

    // 완료된 강습 과정
    const completedCourses = await Course.find({
      _id: { $in: user.studentInfo?.completedCourses || [] }
    });

    // 최근 예약 내역
    const recentBookings = await Booking.find({
      user: user._id
    })
      .populate('course', 'name')
      .populate('instructor', 'name')
      .sort({ date: -1 })
      .limit(5);

    // 최근 결제 내역
    const recentPayments = await Payment.find({
      user: user._id
    })
      .populate('relatedCourse', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // 내 진도 현황
    const progress = await Progress.find({ 
      student: user._id,
      type: 'progress'
    })
      .populate('course', 'name description level')
      .populate('instructor', 'name')
      .sort({ updatedAt: -1 })
      .limit(3);

    // 체크리스트 현황
    const checklists = await Progress.find({
      student: user._id,
      type: 'checklist'
    })
      .populate('course', 'name')
      .populate('instructor', 'name')
      .sort({ dueDate: 1 });

    // 체크리스트 완료율 계산
    let totalChecklistItems = 0;
    let completedChecklistItems = 0;
    
    for (const checklist of checklists) {
      const items = (checklist as any).checklistItems || [];
      totalChecklistItems += items.length;
      completedChecklistItems += items.filter((item: any) => item.isCompleted).length;
    }

    const checklistCompletionRate = totalChecklistItems > 0 
      ? Math.round((completedChecklistItems / totalChecklistItems) * 100) 
      : 0;

    // 내 평가 내역
    const evaluations = await Evaluation.find({ 
      student: user._id 
    })
      .populate('course', 'name')
      .populate('instructor', 'name')
      .sort({ createdAt: -1 })
      .limit(3);

    // 센터 정보
    const centerInfo = await SwimmingCenter.findOne({
      students: user._id
    }).select('name address phone operatingHours');

    // 수영 레벨별 다음 목표
    const nextLevelGoals = getNextLevelGoals(user.studentInfo?.swimmingLevel || 'beginner');

    return {
      user: {
        id: user._id,
        name: user.name,
        userId: user.userId,
        userType: user.userType,
        email: user.email,
        levelInfo: user.userLevelInfo,
        accessPermissions: user.accessPermissions,
        featureSequence: user.featureSequence
      },
      stats: {
        enrolledCourses: enrolledCourses.length,
        completedCourses: completedCourses.length,
        totalBookings: recentBookings.length,
        totalPayments: recentPayments.length,
        checklistCompletionRate,
        currentLevel: user.studentInfo?.swimmingLevel || 'beginner'
      },
      courses: {
        enrolled: enrolledCourses,
        completed: completedCourses
      },
      recentActivity: {
        bookings: recentBookings,
        payments: recentPayments,
        progress: progress
      },
      checklists: {
        items: checklists,
        completionRate: checklistCompletionRate,
        upcoming: (() => {
          const now = new Date();
          const result: any[] = [];
          for (let i = 0; i < checklists.length && result.length < 3; i++) {
            const c = checklists[i];
            if (c.dueDate && new Date(c.dueDate) > now) {
              result.push(c);
            }
          }
          return result;
        })()
      },
      evaluations: evaluations,
      centerInfo: centerInfo,
      nextLevelGoals: nextLevelGoals,
      quickActions: [
        { name: '강습 예약', action: 'book_lesson', icon: '📅' },
        { name: '진도 확인', action: 'view_progress', icon: '📊' },
        { name: '체크리스트', action: 'view_checklist', icon: '✅' },
        { name: '강사 평가', action: 'evaluate_instructor', icon: '⭐' }
      ]
    };
  } catch (error) {
    console.error('학생 대시보드 생성 오류:', error);
    throw error;
  }
}

// 수영 레벨별 다음 목표 설정
function getNextLevelGoals(currentLevel: string) {
  const goals = {
    beginner: [
      '자유형 기본 동작 습득',
      '호흡법 연습',
      '물에 대한 두려움 극복'
    ],
    intermediate: [
      '자유형 완성 및 지구력 향상',
      '평영 기본 동작 학습',
      '턴 기술 습득'
    ],
    advanced: [
      '모든 영법 완성',
      '경영 기술 향상',
      '개인 기록 단축'
    ],
    expert: [
      '고급 기술 마스터',
      '경기 전략 수립',
      '다른 수영자 지도'
    ]
  };

  return goals[currentLevel as keyof typeof goals] || goals.beginner;
}

// ===== 강사 대시보드 =====

async function getInstructorDashboard(user: any) {
  try {
    // 담당 학생 수
    const instructorCourses = await Course.find({ instructor: user._id }).select('_id');
    const courseIds: any[] = [];
    for (const course of instructorCourses) {
      courseIds.push(course._id);
    }
    const totalStudents = await User.countDocuments({
      userType: 'student',
      'studentInfo.enrolledCourses': { 
        $in: courseIds
      }
    });

    // 담당 강습 과정
    const myCourses = await Course.find({ instructor: user._id })
      .populate('enrolledStudents.student', 'name')
      .sort({ createdAt: -1 });

    // 최근 진도 업데이트
    const recentProgress = await Progress.find({ 
      instructor: user._id,
      type: 'progress'
    })
      .populate('student', 'name')
      .populate('course', 'name')
      .sort({ updatedAt: -1 })
      .limit(5);

    // 체크리스트 현황
    const checklists = await Progress.find({
      instructor: user._id,
      type: 'checklist'
    });

    let totalChecklistItems = 0;
    let completedChecklistItems = 0;
    
    for (const checklist of checklists) {
      const items = checklist.checklistItems || [];
      totalChecklistItems += items.length;
      for (const item of items) {
        if (item.isCompleted) {
          completedChecklistItems++;
        }
      }
    }

    const completionRate = totalChecklistItems > 0 
      ? Math.round((completedChecklistItems / totalChecklistItems) * 100) 
      : 0;

    return {
      user: {
        id: user._id,
        name: user.name,
        userId: user.userId,
        userType: user.userType,
        email: user.email,
        levelInfo: user.userLevelInfo,
        accessPermissions: user.accessPermissions,
        featureSequence: user.featureSequence
      },
      stats: {
        totalStudents,
        totalCourses: myCourses.length,
        completionRate,
        recentUpdates: recentProgress.length
      },
      courses: myCourses,
      recentProgress,
      checklists: {
        items: checklists,
        completionRate,
        upcoming: (() => {
          const now = new Date();
          const result: any[] = [];
          for (const c of checklists) {
            if (c.dueDate && new Date(c.dueDate) > now) {
              result.push(c);
            }
          }
          // 날짜순 정렬
          result.sort((a, b) => {
            if (!a.dueDate || !b.dueDate) return 0;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          });
          return result;
        })()
      },
      quickActions: [
        { name: '학생 진도 관리', action: 'manage_progress', icon: '📊' },
        { name: '체크리스트 생성', action: 'create_checklist', icon: '✅' },
        { name: '학생 평가', action: 'evaluate_student', icon: '⭐' },
        { name: '강습 일정', action: 'view_schedule', icon: '📅' }
      ]
    };
  } catch (error) {
    console.error('강사 대시보드 생성 오류:', error);
    throw error;
  }
}

// ===== 센터 관리자 대시보드 =====

async function getCenterAdminDashboard(user: any) {
  try {
    const centerAdmin = await User.findById(user._id);
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      throw new Error('관리하는 센터가 없습니다.');
    }

    // 센터 통계
    const centerCourses = await Course.find({ center: centerId }).select('_id');
    const courseIds: any[] = [];
    for (const course of centerCourses) {
      courseIds.push(course._id);
    }
    
    const [
      totalInstructors,
      totalStudents,
      totalCourses,
      activeBookings
    ] = await Promise.all([
      User.countDocuments({
        userType: 'instructor',
        'instructorInfo.assignedCenters': centerId
      }),
      User.countDocuments({
        userType: 'student',
        'studentInfo.enrolledCourses': { $in: courseIds }
      }),
      Course.countDocuments({ center: centerId }),
      Booking.countDocuments({
        course: { $in: courseIds },
        date: { $gte: new Date() }
      })
    ]);

    // 센터 정보
    const centerInfo = await SwimmingCenter.findById(centerId)
      .select('name address currentCapacity maxCapacity');

    // 최근 공지사항
    const recentNotices = await Notice.find({ center: centerId })
      .sort({ createdAt: -1 })
      .limit(5);

    return {
      user: {
        id: user._id,
        name: user.name,
        userId: user.userId,
        userType: user.userType,
        email: user.email,
        levelInfo: user.userLevelInfo,
        accessPermissions: user.accessPermissions,
        featureSequence: user.featureSequence
      },
      stats: {
        totalInstructors,
        totalStudents,
        totalCourses,
        activeBookings
      },
      centerInfo,
      recentNotices,
      quickActions: [
        { name: '강사 관리', action: 'manage_instructors', icon: '👨‍🏫' },
        { name: '회원 관리', action: 'manage_students', icon: '👥' },
        { name: '강습 과정 관리', action: 'manage_courses', icon: '📚' },
        { name: '공지사항 관리', action: 'manage_notices', icon: '📢' }
      ]
    };
  } catch (error) {
    console.error('센터 관리자 대시보드 생성 오류:', error);
    throw error;
  }
}

// ===== 총관리자 대시보드 =====

async function getSuperAdminDashboard(user: any) {
  try {
    // 전체 시스템 통계
    const [
      totalUsers,
      totalCenters,
      totalCourses,
      totalBookings
    ] = await Promise.all([
      User.countDocuments(),
      SwimmingCenter.countDocuments(),
      Course.countDocuments(),
      Booking.countDocuments()
    ]);

    // 사용자 유형별 통계
    const userTypeStats = await User.aggregate([
      {
        $group: {
          _id: '$userType',
          count: { $sum: 1 }
        }
      }
    ]);

    // 최근 가입한 사용자
    const recentUsers = await User.find()
      .select('name email userType createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    return {
      user: {
        id: user._id,
        name: user.name,
        userId: user.userId,
        userType: user.userType,
        email: user.email,
        levelInfo: user.userLevelInfo,
        accessPermissions: user.accessPermissions,
        featureSequence: user.featureSequence
      },
      stats: {
        totalUsers,
        totalCenters,
        totalCourses,
        totalBookings
      },
      userTypeStats,
      recentUsers,
      quickActions: [
        { name: '시스템 설정', action: 'system_settings', icon: '⚙️' },
        { name: '사용자 관리', action: 'manage_users', icon: '👥' },
        { name: '센터 관리', action: 'manage_centers', icon: '🏊' },
        { name: '시스템 모니터링', action: 'system_monitoring', icon: '📊' }
      ]
    };
  } catch (error) {
    console.error('총관리자 대시보드 생성 오류:', error);
    throw error;
  }
}

export default router; 