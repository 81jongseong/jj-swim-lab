import type { UserType } from '../types/user';

export interface MenuItem {
    href: string;
    label: string;
    description?: string;
}

export interface MenuCategory {
    [key: string]: MenuItem[];
}

export interface UserMenuStructure {
    [key: string]: MenuCategory;
}

export interface MenuGroup {
    groupName: string;
    categories: string[];
}

export interface MenuGrouping {
    [key: string]: MenuGroup[];
}

// 사용자별 메뉴 구조 정의
export const userMenuStructure: UserMenuStructure = {
    student: {
        main: [
            { href: '/dashboard', label: '📊 대시보드' },
            { href: '/health', label: '🏥 건강관리' },
            { href: '/routine-recommendation', label: '🤖 AI 루틴 추천' },
            { href: '/map', label: '🗺️ 수영센터 찾기' },
            { href: '/courses', label: '📚 내 강의' },
            { href: '/payments', label: '💰 결제 내역' },
        ],
        experience: [
            { href: '/quiz', label: '🧠 퀴즈' },
            { href: '/video-feedback', label: '🎥 동영상 분석 요청' },
            { href: '/3d-viewer', label: '🎨 3D 뷰어' },
            { href: '/mobile-learning', label: '📱 모바일 학습' },
        ],
        info: [
            { href: '/news', label: '📢 공지사항' },
            { href: '/community', label: '💬 커뮤니티' },
            { href: '/shop', label: '🛍️ 상점' },
            { href: '/profile', label: '👤 프로필' },
            { href: '/localization', label: '🌐 언어 설정' },
            { href: '/accessibility', label: '♿ 접근성 설정' },
        ]
    },
    instructor: {
        quickAccess: [
            { href: '/', label: '🏠 홈' },
            { href: '/instructor/dashboard', label: '📊 강사 대시보드' },
        ],
        classManagement: [
            { href: '/instructor/courses', label: '📚 내 강의 관리' },
            { href: '/instructor/bookings', label: '📅 예약 관리' },
        ],
        studentCare: [
            { href: '/instructor/students', label: '👥 수강생 관리' },
            { href: '/instructor/checklist', label: '📋 체크리스트 관리' },
            { href: '/instructor/progress', label: '📈 진행 · 출석 관리' },
            { href: '/instructor/reviews', label: '📝 업로드 리뷰' },
        ],
        teachingMethods: [
            { href: '/instructor/teaching-methods', label: '🏊‍♂️ 강습법 관리' },
        ],
        programGeneration: [
            { href: '/instructor/swim-training-plan', label: '🏊‍♂️ 프로그램 생성' },
        ],
        coachingTools: [
            { href: '/instructor/health/overview', label: '📊 학생 건강 현황' },
        ],
        experience: [
            { href: '/quiz', label: '🧠 퀴즈' },
            { href: '/3d-viewer', label: '🎨 3D 뷰어' },
            { href: '/mobile-learning', label: '📱 모바일 학습' },
        ],
        resources: [
            { href: '/news', label: '📢 공지사항' },
            { href: '/job-board', label: '💼 구인구직' },
            { href: '/community', label: '💬 커뮤니티' },
            { href: '/shop', label: '🛍️ 상점' },
            { href: '/map', label: '🗺️ 수영센터 찾기' },
            { href: '/profile', label: '👤 프로필' },
            { href: '/localization', label: '🌐 언어 설정' },
            { href: '/accessibility', label: '♿ 접근성 설정' },
        ]
    },
    centerAdmin: {
        dashboard: [
            { href: '/', label: '🏠 홈' },
            { href: '/center/default/admin/dashboard', label: '📊 센터 대시보드' },
            { href: '/center/default/admin/manage', label: '🧾 예약·결제 관리' },
            { href: '/center/default/admin/members', label: '👥 센터 회원 관리' },
            { href: '/center/default/admin/instructors', label: '👨‍🏫 센터 강사 관리' },
            { href: '/center/default/admin/courses', label: '📚 센터 강의 관리' },
            { href: '/center/default/admin/reports', label: '📊 센터 통계' },
            { href: '/center/default/admin/notices', label: '📢 공지사항 관리' },
            { href: '/membership', label: '💳 멤버십 관리' },
        ],
        center: [
            { href: '/center/default/admin/info', label: '⚙️ 센터 정보 관리' },
            { href: '/center/default/admin/branding', label: '🎨 사이트 테마 설정' },
        ],
        community: [
            { href: '/center/default/admin/guide', label: '📖 이용안내' },
            { href: '/news', label: '📢 공지사항' },
            { href: '/job-board', label: '💼 구인구직' },
            { href: '/community', label: '💬 커뮤니티' },
        ],
        tools: [
            { href: '/admin/swim-training-engine', label: '📅 주간 프로그램 생성' },
            { href: '/3d-viewer', label: '🎨 3D 뷰어' },
            { href: '/shop', label: '🛍️ 상점' },
            { href: '/map', label: '🗺️ 수영센터 찾기' },
            { href: '/center-admin/geo-distribution', label: '🗺️ 회원 분포 지도' },
            { href: '/localization', label: '🌐 언어 설정' },
            { href: '/accessibility', label: '♿ 접근성 설정' },
        ]
    },
    'center-admin': {
        dashboard: [
            { href: '/center/default/admin/home', label: '🏠 홈' },
            { href: '/center/default/admin/dashboard', label: '📊 센터 대시보드' },
            { href: '/center/default/admin/manage', label: '🧾 예약·결제 관리' },
            { href: '/center/default/admin/members', label: '👥 센터 회원 관리' },
            { href: '/center/default/admin/instructors', label: '👨‍🏫 센터 강사 관리' },
            { href: '/center/default/admin/courses', label: '📚 센터 강의 관리' },
            { href: '/center/default/admin/reports', label: '📊 센터 통계' },
            { href: '/center/default/admin/notices', label: '📢 공지사항 관리' },
            { href: '/membership', label: '💳 멤버십 관리' },
        ],
        center: [
            { href: '/center/default/admin/info', label: '⚙️ 센터 정보 관리' },
            { href: '/center/default/admin/branding', label: '🎨 사이트 테마 설정' },
        ],
        community: [
            { href: '/center/default/admin/guide', label: '📖 이용안내' },
            { href: '/news', label: '📢 공지사항' },
            { href: '/job-board', label: '💼 구인구직' },
            { href: '/community', label: '💬 커뮤니티' },
        ],
        tools: [
            { href: '/admin/swim-training-engine', label: '📅 주간 프로그램 생성' },
            { href: '/3d-viewer', label: '🎨 3D 뷰어' },
            { href: '/shop', label: '🛍️ 상점' },
            { href: '/map', label: '🗺️ 수영센터 찾기' },
            { href: '/center-admin/geo-distribution', label: '🗺️ 회원 분포 지도' },
            { href: '/localization', label: '🌐 언어 설정' },
            { href: '/accessibility', label: '♿ 접근성 설정' },
        ]
    },
    superAdmin: {
        core: [
            { href: '/', label: '🏠 홈' },
            { href: '/admin/dashboard', label: '📊 최고관리자 대시보드' },
            { href: '/admin/system-settings', label: '⚙️ 시스템 설정' },
            { href: '/admin/system', label: '📈 시스템 사용 통계' },
        ],
        business: [
            { href: '/admin/center-management', label: '🏢 센터 관리' },
            { href: '/admin/center-statistics', label: '📊 센터 통계' },
            { href: '/admin/approvals', label: '⏳ 센터 승인', description: '강사등록/센터등록 승인' },
            { href: '/admin/users', label: '👥 회원 관리' },
            { href: '/admin/instructor-management', label: '👨‍🏫 강사 관리' },
            { href: '/admin/geo-distribution', label: '🗺️ 회원 분포 지도' },
        ],
        revenue: [
            { href: '/admin/total-revenue-management', label: '💎 총 매출 관리' },
            { href: '/admin/revenue-management', label: '💰 센터별 매출 관리' },
            { href: '/membership', label: '💳 멤버십 관리' },
        ],
        content: [
            { href: '/admin/lesson-plans', label: '📋 강습 계획 템플릿' },
            { href: '/admin/teaching-methods', label: '📚 강습법 관리' },
            { href: '/admin/course-oversight', label: '👁️ 강습 과정 감독' },
            { href: '/admin/quiz', label: '🧠 퀴즈 관리' },
            { href: '/admin/quiz-question-generator', label: '🤖 문제 자동 생성' },
            { href: '/admin/swim-training-engine', label: '🏊‍♂️ 수영 트레이닝 규칙 엔진' },
            { href: '/admin/health/overview', label: '📊 전체 건강 현황 및 통계' },
        ],
        operations: [
            { href: '/admin/notices', label: '📢 공지사항 관리' },
            { href: '/admin/reports', label: '🎧 고객지원 관리' },
        ],
        tools: [
            { href: '/3d-viewer', label: '🏊‍♂️ 3D 수영 뷰어 · 영법 관리' },
            { href: '/quiz', label: '🧠 퀴즈 체험' },
        ],
        community: [
            { href: '/job-board', label: '💼 구인구직' },
            { href: '/community', label: '💬 커뮤니티' },
            { href: '/shop', label: '🛍️ 상점' },
            { href: '/map', label: '🗺️ 수영센터 찾기' },
            { href: '/localization', label: '🌐 언어 설정' },
            { href: '/accessibility', label: '♿ 접근성 설정' },
        ]
    },
    guest: {
        main: [
            { href: '/', label: '🏠 홈' },
            { href: '/guide', label: '📖 이용안내' },
            { href: '/news', label: '📢 공지사항' },
        ],
        experience: [
            { href: '/guest-quiz', label: '🧠 퀴즈 체험' },
            { href: '/3d-viewer', label: '🏊‍♂️ 3D 수영 뷰어' },
        ],
        community: [
            { href: '/community', label: '💬 커뮤니티' },
            { href: '/shop', label: '🛍️ 상점' },
            { href: '/map', label: '🗺️ 수영센터 찾기' },
        ],
        auth: [
            { href: '/auth/login', label: '🔑 로그인' },
            { href: '/auth/signup', label: '📝 회원가입' },
            { href: '/auth/signup-center-admin', label: '🏢 센터 등록' },
        ]
    }
};

// 메뉴 그룹화 정의
export const menuGrouping: MenuGrouping = {
    student: [
        { groupName: '📊 내 학습', categories: ['main'] },
        { groupName: '🎯 체험 & 도구', categories: ['experience'] },
        { groupName: '💬 커뮤니티 & 정보', categories: ['info'] },
    ],
    instructor: [
        { groupName: '⚡ 빠른 접근', categories: ['quickAccess'] },
        { groupName: '📚 강의 관리', categories: ['classManagement'] },
        { groupName: '👥 수강생 관리', categories: ['studentCare'] },
        { groupName: '📖 강습법 관리', categories: ['teachingMethods'] },
        { groupName: '🏊 프로그램 생성', categories: ['programGeneration'] },
        { groupName: '🛠️ 코칭 도구', categories: ['coachingTools'] },
        { groupName: '🎯 체험 & 학습', categories: ['experience'] },
        { groupName: '📘 정보 & 지원', categories: ['resources'] },
    ],
    centerAdmin: [
        { groupName: '📊 센터 운영', categories: ['dashboard'] },
        { groupName: '⚙️ 센터 설정', categories: ['center'] },
        { groupName: '💬 커뮤니티', categories: ['community'] },
        { groupName: '🛠️ 도구 & 서비스', categories: ['tools'] },
    ],
    'center-admin': [
        { groupName: '📊 센터 운영', categories: ['dashboard'] },
        { groupName: '⚙️ 센터 설정', categories: ['center'] },
        { groupName: '💬 커뮤니티', categories: ['community'] },
        { groupName: '🛠️ 도구 & 서비스', categories: ['tools'] },
    ],
    superAdmin: [
        { groupName: '🎯 시스템 관리', categories: ['core'] },
        { groupName: '🏢 비즈니스', categories: ['business'] },
        { groupName: '💰 매출', categories: ['revenue'] },
        { groupName: '📚 콘텐츠', categories: ['content'] },
        { groupName: '🎧 운영', categories: ['operations'] },
        { groupName: '🛠️ 도구', categories: ['tools'] },
        { groupName: '🌐 커뮤니티', categories: ['community'] },
    ],
    guest: [
        { groupName: '🏠 홈', categories: ['main'] },
        { groupName: '🎯 체험', categories: ['experience'] },
        { groupName: '💬 커뮤니티', categories: ['community'] },
        { groupName: '🔑 로그인', categories: ['auth'] }
    ]
};
