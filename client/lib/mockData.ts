import { faker } from '@faker-js/faker/locale/ko';

// 한국어 설정
faker.setLocale('ko');

// 수영 관련 더미 데이터 생성 유틸리티
export const generateMockData = {
  // 사용자 데이터
  users: (count: number = 10) => {
    const userTypes = ['student', 'instructor', 'centerAdmin', 'superAdmin'] as const;
    const centers = ['서울수영장', '강남수영장', '홍대수영장', '잠실수영장', '올림픽수영장'];
    
    return Array.from({ length: count }, (_, i) => ({
      id: faker.string.uuid(),
      userId: faker.internet.userName(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number('010-####-####'),
      userType: userTypes[i % userTypes.length],
      center: centers[i % centers.length],
      createdAt: faker.date.past(),
      lastLogin: faker.date.recent(),
      isActive: faker.datatype.boolean(0.9),
      profileImage: faker.image.avatar(),
      bio: faker.lorem.sentence(),
      level: faker.number.int({ min: 1, max: 10 }),
      experience: faker.number.int({ min: 0, max: 20 }),
    }));
  },

  // 강습법 데이터
  teachingMethods: (count: number = 20) => {
    const categories = ['자유형', '배영', '평영', '접영', '혼영', '기본기', '턴', '스타트'];
    const difficulties = ['초급', '중급', '고급', '전문가'];
    
    return Array.from({ length: count }, (_, i) => ({
      id: faker.string.uuid(),
      name: `${categories[i % categories.length]} ${faker.lorem.words(2)}`,
      description: faker.lorem.paragraph(),
      category: categories[i % categories.length],
      difficulty: difficulties[i % difficulties.length],
      steps: Array.from({ length: faker.number.int({ min: 3, max: 8 }) }, (_, j) => ({
        step: j + 1,
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        imageUrl: faker.image.url(),
        videoUrl: faker.internet.url(),
      })),
      tips: Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () => faker.lorem.sentence()),
      videoUrl: faker.internet.url(),
      imageUrl: faker.image.url(),
      isActive: faker.datatype.boolean(0.9),
      createdBy: faker.person.fullName(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      views: faker.number.int({ min: 0, max: 10000 }),
      likes: faker.number.int({ min: 0, max: 500 }),
      tags: faker.helpers.arrayElements(['기본기', '고급기술', '경기기술', '건강', '안전'], { min: 2, max: 4 }),
    }));
  },

  // 퀴즈 데이터
  quizzes: (count: number = 15) => {
    const categories = ['수영 이론', '안전 수칙', '기술 요령', '경기 규칙', '건강 관리'];
    const difficulties = ['초급', '중급', '고급'];
    const types = ['multiple-choice', 'essay'];
    
    return Array.from({ length: count }, (_, i) => ({
      id: faker.string.uuid(),
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      category: categories[i % categories.length],
      difficulty: difficulties[i % difficulties.length],
      type: types[i % types.length],
      questions: Array.from({ length: faker.number.int({ min: 5, max: 15 }) }, (_, j) => ({
        id: faker.string.uuid(),
        question: faker.lorem.sentence() + '?',
        type: types[i % types.length],
        options: types[i % types.length] === 'multiple-choice' 
          ? Array.from({ length: 4 }, () => faker.lorem.sentence())
          : undefined,
        correctAnswer: types[i % types.length] === 'multiple-choice' 
          ? faker.number.int({ min: 0, max: 3 })
          : faker.lorem.sentence(),
        explanation: faker.lorem.paragraph(),
        points: faker.number.int({ min: 1, max: 5 }),
      })),
      timeLimit: faker.number.int({ min: 10, max: 60 }),
      passingScore: faker.number.int({ min: 60, max: 90 }),
      maxAttempts: faker.number.int({ min: 1, max: 5 }),
      isActive: faker.datatype.boolean(0.9),
      createdBy: faker.person.fullName(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      tags: faker.helpers.arrayElements(['기본기', '고급기술', '안전', '건강'], { min: 2, max: 4 }),
    }));
  },

  // 퀴즈 시도 데이터
  quizAttempts: (count: number = 50) => {
    return Array.from({ length: count }, (_, i) => ({
      id: faker.string.uuid(),
      quizId: faker.string.uuid(),
      userId: faker.string.uuid(),
      userName: faker.person.fullName(),
      answers: Array.from({ length: faker.number.int({ min: 5, max: 15 }) }, (_, j) => ({
        questionIndex: j,
        selectedAnswer: faker.number.int({ min: 0, max: 3 }),
        isCorrect: faker.datatype.boolean(0.7),
        pointsEarned: faker.number.int({ min: 1, max: 5 }),
        timeSpent: faker.number.int({ min: 10, max: 120 }),
      })),
      totalScore: faker.number.int({ min: 0, max: 100 }),
      maxPossibleScore: 100,
      percentage: faker.number.int({ min: 0, max: 100 }),
      passed: faker.datatype.boolean(0.8),
      timeSpent: faker.number.int({ min: 300, max: 1800 }),
      completedAt: faker.date.recent(),
      startedAt: faker.date.recent(),
    }));
  },

  // 수업 데이터
  classes: (count: number = 30) => {
    const classTypes = ['개인레슨', '그룹레슨', '성인반', '어린이반', '경기반', '건강수영'];
    const levels = ['초급', '중급', '고급', '전문가'];
    const statuses = ['예약가능', '예약완료', '진행중', '완료', '취소'];
    
    return Array.from({ length: count }, (_, i) => ({
      id: faker.string.uuid(),
      name: `${classTypes[i % classTypes.length]} ${faker.lorem.words(2)}`,
      description: faker.lorem.paragraph(),
      type: classTypes[i % classTypes.length],
      level: levels[i % levels.length],
      instructor: faker.person.fullName(),
      center: faker.helpers.arrayElement(['서울수영장', '강남수영장', '홍대수영장', '잠실수영장']),
      maxStudents: faker.number.int({ min: 1, max: 20 }),
      currentStudents: faker.number.int({ min: 0, max: 20 }),
      price: faker.number.int({ min: 20000, max: 200000 }),
      duration: faker.number.int({ min: 30, max: 120 }),
      schedule: {
        dayOfWeek: faker.helpers.arrayElement(['월', '화', '수', '목', '금', '토', '일']),
        startTime: faker.date.recent().toTimeString().slice(0, 5),
        endTime: faker.date.recent().toTimeString().slice(0, 5),
      },
      status: statuses[i % statuses.length],
      startDate: faker.date.future(),
      endDate: faker.date.future(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      tags: faker.helpers.arrayElements(['기본기', '고급기술', '건강', '안전'], { min: 2, max: 4 }),
    }));
  },

  // 예약 데이터
  bookings: (count: number = 40) => {
    const statuses = ['예약완료', '확정', '진행중', '완료', '취소', '노쇼'];
    
    return Array.from({ length: count }, (_, i) => ({
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      userName: faker.person.fullName(),
      classId: faker.string.uuid(),
      className: faker.lorem.words(3),
      instructor: faker.person.fullName(),
      center: faker.helpers.arrayElement(['서울수영장', '강남수영장', '홍대수영장', '잠실수영장']),
      date: faker.date.future(),
      startTime: faker.date.recent().toTimeString().slice(0, 5),
      endTime: faker.date.recent().toTimeString().slice(0, 5),
      status: statuses[i % statuses.length],
      price: faker.number.int({ min: 20000, max: 200000 }),
      paymentStatus: faker.helpers.arrayElement(['미결제', '결제완료', '환불요청', '환불완료']),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      notes: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : '',
    }));
  },

  // 결제 데이터
  payments: (count: number = 35) => {
    const paymentMethods = ['신용카드', '체크카드', '계좌이체', '간편결제', '현금'];
    const statuses = ['대기중', '진행중', '완료', '실패', '취소', '환불'];
    
    return Array.from({ length: count }, (_, i) => ({
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      userName: faker.person.fullName(),
      amount: faker.number.int({ min: 20000, max: 500000 }),
      currency: 'KRW',
      paymentMethod: paymentMethods[i % paymentMethods.length],
      status: statuses[i % statuses.length],
      description: faker.lorem.sentence(),
      transactionId: faker.string.alphanumeric(16).toUpperCase(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      completedAt: faker.datatype.boolean(0.8) ? faker.date.recent() : null,
      failureReason: faker.datatype.boolean(0.1) ? faker.lorem.sentence() : null,
    }));
  },

  // 공지사항 데이터
  notices: (count: number = 25) => {
    const categories = ['공지', '이벤트', '안내', '긴급', '업데이트'];
    const priorities = ['낮음', '보통', '높음', '긴급'];
    
    return Array.from({ length: count }, (_, i) => ({
      id: faker.string.uuid(),
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(3),
      category: categories[i % categories.length],
      priority: priorities[i % priorities.length],
      author: faker.person.fullName(),
      center: faker.helpers.arrayElement(['전체', '서울수영장', '강남수영장', '홍대수영장', '잠실수영장']),
      isPublished: faker.datatype.boolean(0.9),
      isPinned: faker.datatype.boolean(0.2),
      views: faker.number.int({ min: 0, max: 5000 }),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      publishedAt: faker.date.recent(),
      expiresAt: faker.datatype.boolean(0.3) ? faker.date.future() : null,
      tags: faker.helpers.arrayElements(['공지', '이벤트', '안내', '긴급'], { min: 1, max: 3 }),
    }));
  },

  // 진도 데이터
  progress: (count: number = 60) => {
    const progressTypes = ['기본기', '자유형', '배영', '평영', '접영', '턴', '스타트'];
    const statuses = ['미시작', '진행중', '완료', '보류'];
    
    return Array.from({ length: count }, (_, i) => ({
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      userName: faker.person.fullName(),
      type: progressTypes[i % progressTypes.length],
      status: statuses[i % statuses.length],
      progress: faker.number.int({ min: 0, max: 100 }),
      level: faker.number.int({ min: 1, max: 10 }),
      instructor: faker.person.fullName(),
      center: faker.helpers.arrayElement(['서울수영장', '강남수영장', '홍대수영장', '잠실수영장']),
      startDate: faker.date.past(),
      targetDate: faker.date.future(),
      completedDate: faker.datatype.boolean(0.3) ? faker.date.recent() : null,
      notes: faker.datatype.boolean(0.4) ? faker.lorem.sentence() : '',
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    }));
  },

  // 평가 데이터
  evaluations: (count: number = 45) => {
    const evaluationTypes = ['기술평가', '진도평가', '태도평가', '종합평가'];
    
    return Array.from({ length: count }, (_, i) => ({
      id: faker.string.uuid(),
      studentId: faker.string.uuid(),
      studentName: faker.person.fullName(),
      instructorId: faker.string.uuid(),
      instructorName: faker.person.fullName(),
      type: evaluationTypes[i % evaluationTypes.length],
      skills: {
        basic: faker.number.int({ min: 1, max: 5 }),
        technique: faker.number.int({ min: 1, max: 5 }),
        speed: faker.number.int({ min: 1, max: 5 }),
        endurance: faker.number.int({ min: 1, max: 5 }),
      },
      attitude: {
        punctuality: faker.number.int({ min: 1, max: 5 }),
        effort: faker.number.int({ min: 1, max: 5 }),
        cooperation: faker.number.int({ min: 1, max: 5 }),
        enthusiasm: faker.number.int({ min: 1, max: 5 }),
      },
      overallRating: faker.number.int({ min: 1, max: 5 }),
      comments: faker.lorem.paragraph(),
      recommendations: faker.lorem.sentence(),
      evaluationDate: faker.date.recent(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    }));
  },

  // 센터 데이터
  centers: (count: number = 8) => {
    const cities = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종'];
    const districts = ['강남구', '서초구', '마포구', '송파구', '중구', '동구', '북구', '남구'];
    
    return Array.from({ length: count }, (_, i) => ({
      id: faker.string.uuid(),
      name: `${cities[i % cities.length]}수영장`,
      address: `${cities[i % cities.length]} ${districts[i % districts.length]} ${faker.location.street()}`,
      phone: faker.phone.number('02-####-####'),
      email: faker.internet.email(),
      website: faker.internet.url(),
      description: faker.lorem.paragraph(),
      facilities: faker.helpers.arrayElements([
        '25m 풀', '50m 풀', '다이빙대', '사우나', '헬스장', '주차장', '카페', '프로샵'
      ], { min: 3, max: 6 }),
      operatingHours: {
        monday: '06:00-22:00',
        tuesday: '06:00-22:00',
        wednesday: '06:00-22:00',
        thursday: '06:00-22:00',
        friday: '06:00-22:00',
        saturday: '08:00-20:00',
        sunday: '08:00-20:00',
      },
      capacity: faker.number.int({ min: 50, max: 200 }),
      currentMembers: faker.number.int({ min: 20, max: 150 }),
      rating: faker.number.float({ min: 3.0, max: 5.0, precision: 0.1 }),
      reviewCount: faker.number.int({ min: 10, max: 500 }),
      isActive: faker.datatype.boolean(0.95),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    }));
  },

  // 통계 데이터
  statistics: () => ({
    users: {
      total: faker.number.int({ min: 1000, max: 10000 }),
      active: faker.number.int({ min: 800, max: 9000 }),
      newThisMonth: faker.number.int({ min: 50, max: 500 }),
      byType: {
        student: faker.number.int({ min: 800, max: 8000 }),
        instructor: faker.number.int({ min: 50, max: 300 }),
        centerAdmin: faker.number.int({ min: 20, max: 100 }),
        superAdmin: faker.number.int({ min: 1, max: 10 }),
      },
    },
    classes: {
      total: faker.number.int({ min: 100, max: 1000 }),
      active: faker.number.int({ min: 80, max: 900 }),
      completed: faker.number.int({ min: 500, max: 5000 }),
      byType: {
        individual: faker.number.int({ min: 30, max: 300 }),
        group: faker.number.int({ min: 50, max: 500 }),
        competition: faker.number.int({ min: 10, max: 100 }),
      },
    },
    revenue: {
      thisMonth: faker.number.int({ min: 50000000, max: 500000000 }),
      lastMonth: faker.number.int({ min: 45000000, max: 450000000 }),
      growth: faker.number.float({ min: -20, max: 50, precision: 0.1 }),
      byCenter: Array.from({ length: 5 }, () => ({
        name: faker.company.name(),
        amount: faker.number.int({ min: 5000000, max: 50000000 }),
      })),
    },
    engagement: {
      averageSessionTime: faker.number.int({ min: 30, max: 120 }),
      completionRate: faker.number.float({ min: 70, max: 95, precision: 0.1 }),
      satisfactionScore: faker.number.float({ min: 3.5, max: 5.0, precision: 0.1 }),
      activeUsers: faker.number.int({ min: 500, max: 5000 }),
    },
  }),

  // 차트 데이터
  chartData: {
    // 월별 사용자 증가
    monthlyUserGrowth: () => {
      const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
      return months.map((month, i) => ({
        month,
        users: faker.number.int({ min: 50, max: 500 }),
        growth: faker.number.float({ min: -20, max: 50, precision: 0.1 }),
      }));
    },

    // 일별 예약 현황
    dailyBookings: () => {
      const days = ['월', '화', '수', '목', '금', '토', '일'];
      return days.map(day => ({
        day,
        bookings: faker.number.int({ min: 10, max: 100 }),
        completed: faker.number.int({ min: 5, max: 80 }),
        cancelled: faker.number.int({ min: 0, max: 20 }),
      }));
    },

    // 강습법별 인기도
    teachingMethodPopularity: () => {
      const methods = ['자유형', '배영', '평영', '접영', '기본기', '턴', '스타트'];
      return methods.map(method => ({
        method,
        views: faker.number.int({ min: 100, max: 10000 }),
        likes: faker.number.int({ min: 10, max: 1000 }),
        shares: faker.number.int({ min: 0, max: 100 }),
      }));
    },

    // 센터별 성과
    centerPerformance: () => {
      const centers = ['서울수영장', '강남수영장', '홍대수영장', '잠실수영장', '올림픽수영장'];
      return centers.map(center => ({
        center,
        revenue: faker.number.int({ min: 10000000, max: 100000000 }),
        students: faker.number.int({ min: 100, max: 1000 }),
        satisfaction: faker.number.float({ min: 3.5, max: 5.0, precision: 0.1 }),
        completionRate: faker.number.float({ min: 70, max: 95, precision: 0.1 }),
      }));
    },
  },
};

// 특정 타입의 데이터만 생성하는 헬퍼 함수들
export const generateUsers = (count?: number) => generateMockData.users(count);
export const generateTeachingMethods = (count?: number) => generateMockData.teachingMethods(count);
export const generateQuizzes = (count?: number) => generateMockData.quizzes(count);
export const generateQuizAttempts = (count?: number) => generateMockData.quizAttempts(count);
export const generateClasses = (count?: number) => generateMockData.classes(count);
export const generateBookings = (count?: number) => generateMockData.bookings(count);
export const generatePayments = (count?: number) => generateMockData.payments(count);
export const generateNotices = (count?: number) => generateMockData.notices(count);
export const generateProgress = (count?: number) => generateMockData.progress(count);
export const generateEvaluations = (count?: number) => generateMockData.evaluations(count);
export const generateCenters = (count?: number) => generateMockData.centers(count);
export const generateStatistics = () => generateMockData.statistics();
export const generateChartData = () => generateMockData.chartData;

// 모든 데이터를 한번에 생성
export const generateAllMockData = () => ({
  users: generateUsers(50),
  teachingMethods: generateTeachingMethods(30),
  quizzes: generateQuizzes(25),
  quizAttempts: generateQuizAttempts(100),
  classes: generateClasses(40),
  bookings: generateBookings(80),
  payments: generatePayments(60),
  notices: generateNotices(35),
  progress: generateProgress(120),
  evaluations: generateEvaluations(70),
  centers: generateCenters(10),
  statistics: generateStatistics(),
  chartData: generateChartData(),
});

export default generateMockData;
