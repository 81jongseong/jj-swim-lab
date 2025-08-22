# 🗄️ JJ Swim Lab MongoDB Atlas 전용 설정 가이드

## 📋 개요

JJ Swim Lab 프로젝트를 MongoDB Atlas만 사용하도록 설정하는 가이드입니다. 로컬 MongoDB 설치 없이 클라우드 기반으로 운영합니다.

## 🚀 MongoDB Atlas 설정

### 1단계: MongoDB Atlas 계정 생성 및 클러스터 설정

1. **MongoDB Atlas 접속**
   - [cloud.mongodb.com](https://cloud.mongodb.com) 접속
   - 계정 생성 또는 로그인

2. **새 클러스터 생성**
   - "Build a Database" 클릭
   - Free Tier 선택 (M0 Sandbox)
   - Cloud Provider: AWS 선택
   - Region: Asia Pacific (Seoul) 선택
   - Cluster Name: `jj-swim-lab-cluster`

3. **데이터베이스 사용자 생성**
   - Database Access → "Add New Database User"
   - Username: `jjswimlab_user`
   - Password: 강력한 비밀번호 생성
   - User Privileges: "Read and write to any database"

4. **네트워크 액세스 설정**
   - Network Access → "Add IP Address"
   - IP Address: `0.0.0.0/0` (모든 IP 허용) 또는 특정 IP

5. **데이터베이스 생성**
   - Browse Collections → "Create Database"
   - Database Name: `jjswimlab`
   - Collection Name: `users`

## 🔧 환경 변수 설정

### 프로덕션 환경 변수 (.env.production)

```bash
# ===== 기본 환경 설정 =====
NODE_ENV=production
PORT=5000
APP_NAME=JJ Swim Lab
APP_VERSION=1.0.0

# ===== MongoDB Atlas 연결 =====
MONGODB_URI=mongodb+srv://jjswimlab_user:your-password@jj-swim-lab-cluster.mongodb.net/jjswimlab?retryWrites=true&w=majority
DB_NAME=jjswimlab

# MongoDB Atlas 연결 풀 설정
MONGODB_MAX_POOL_SIZE=10
MONGODB_MIN_POOL_SIZE=2
MONGODB_CONNECT_TIMEOUT_MS=30000
MONGODB_SOCKET_TIMEOUT_MS=45000

# ===== JWT 인증 설정 =====
JWT_SECRET=your-production-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
JWT_ISSUER=jj-swim-lab

# ===== 보안 설정 =====
CORS_ORIGIN=https://your-domain.com
CORS_CREDENTIALS=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ===== 로깅 설정 =====
LOG_LEVEL=warn
LOG_FILE_PATH=./logs/app.log

# ===== 성능 모니터링 =====
PERFORMANCE_MONITORING_ENABLED=true
LIGHTHOUSE_CI_ENABLED=true
```

### 개발 환경 변수 (.env.development)

```bash
# ===== 기본 환경 설정 =====
NODE_ENV=development
PORT=5000
APP_NAME=JJ Swim Lab
APP_VERSION=1.0.0

# ===== MongoDB Atlas 연결 =====
MONGODB_URI=mongodb+srv://jjswimlab_user:your-password@jj-swim-lab-cluster.mongodb.net/jjswimlab_dev?retryWrites=true&w=majority
DB_NAME=jjswimlab_dev

# MongoDB Atlas 연결 풀 설정
MONGODB_MAX_POOL_SIZE=5
MONGODB_MIN_POOL_SIZE=1
MONGODB_CONNECT_TIMEOUT_MS=30000
MONGODB_SOCKET_TIMEOUT_MS=45000

# ===== JWT 인증 설정 =====
JWT_SECRET=dev-jwt-secret-key-for-development-only
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
JWT_ISSUER=jj-swim-lab

# ===== 보안 설정 =====
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# ===== 로깅 설정 =====
LOG_LEVEL=debug
LOG_FILE_PATH=./logs/app.log

# ===== 성능 모니터링 =====
PERFORMANCE_MONITORING_ENABLED=true
LIGHTHOUSE_CI_ENABLED=true

# ===== 개발 환경 전용 =====
DEBUG=true
SHOW_QUERIES=true
ENABLE_SWAGGER=true
```

## 🔐 보안 설정

### 1단계: 강력한 JWT 시크릿 생성

```bash
# Node.js로 강력한 시크릿 생성
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# 또는 OpenSSL 사용
openssl rand -base64 64
```

### 2단계: 환경별 데이터베이스 분리

- **개발 환경**: `jjswimlab_dev`
- **스테이징 환경**: `jjswimlab_staging`
- **프로덕션 환경**: `jjswimlab_prod`

### 3단계: IP 제한 설정

**프로덕션 환경에서는 특정 IP만 허용:**

```bash
# MongoDB Atlas Network Access에서
# 특정 IP 주소만 허용
# 예: 192.168.1.0/24 (사무실 네트워크)
# 예: 203.241.xxx.xxx (서버 IP)
```

## 📊 데이터베이스 모니터링

### 1단계: MongoDB Atlas 대시보드 활용

- **Performance Advisor**: 쿼리 성능 분석
- **Real-Time Performance**: 실시간 성능 모니터링
- **Database Profiler**: 느린 쿼리 식별
- **Logs**: 데이터베이스 로그 확인

### 2단계: 연결 풀 모니터링

```javascript
// server/src/db.ts에서 연결 상태 모니터링
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB Atlas 연결 성공');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB Atlas 연결 오류:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB Atlas 연결 해제');
});
```

## 🚀 배포 시 고려사항

### 1단계: 환경별 설정 분리

```bash
# Vercel 환경 변수 설정
# Settings → Environment Variables

# Production
MONGODB_URI=mongodb+srv://jjswimlab_user:prod-password@jj-swim-lab-cluster.mongodb.net/jjswimlab_prod?retryWrites=true&w=majority
NODE_ENV=production

# Preview (Staging)
MONGODB_URI=mongodb+srv://jjswimlab_user:staging-password@jj-swim-lab-cluster.mongodb.net/jjswimlab_staging?retryWrites=true&w=majority
NODE_ENV=staging
```

### 2단계: 백업 설정

**MongoDB Atlas 자동 백업 활성화:**

- **Backup → Schedule → Edit Configuration**
- **Frequency**: Daily
- **Retention**: 7 days
- **Time**: 02:00 UTC (한국 시간 11:00)

### 3단계: 알림 설정

**MongoDB Atlas 알림 설정:**

- **Alerts → Rules → Create Rule**
- **Connection Count**: 80% 이상 시 알림
- **Query Targeting**: 1000ms 이상 시 알림
- **Error Rate**: 1% 이상 시 알림

## 🔍 문제 해결

### 일반적인 연결 문제

#### 1. 연결 타임아웃
```bash
# 환경 변수에서 타임아웃 값 증가
MONGODB_CONNECT_TIMEOUT_MS=60000
MONGODB_SOCKET_TIMEOUT_MS=60000
```

#### 2. 인증 실패
```bash
# 사용자명/비밀번호 확인
# Database Access에서 사용자 권한 확인
# Network Access에서 IP 주소 확인
```

#### 3. 연결 풀 부족
```bash
# 연결 풀 크기 증가
MONGODB_MAX_POOL_SIZE=20
MONGODB_MIN_POOL_SIZE=5
```

## 📈 성능 최적화

### 1단계: 인덱스 설정

**자주 사용되는 쿼리에 인덱스 추가:**

```javascript
// User 모델에 인덱스 추가
userSchema.index({ email: 1 });
userSchema.index({ userType: 1 });
userSchema.index({ createdAt: -1 });

// TeachingMethod 모델에 인덱스 추가
teachingMethodSchema.index({ level: 1 });
teachingMethodSchema.index({ category: 1 });
teachingMethodSchema.index({ name: 1 });
```

### 2단계: 쿼리 최적화

**N+1 문제 방지:**

```javascript
// populate 사용으로 연관 데이터 한 번에 조회
const users = await User.find()
  .populate('centerId')
  .populate('membershipId')
  .lean(); // 가상 필드 제외하고 빠른 조회
```

## 🎯 다음 단계

### 단기 계획 (1-2주)
- [ ] **MongoDB Atlas 클러스터 설정 완료**
- [ ] **환경별 데이터베이스 분리**
- [ ] **연결 풀 최적화**

### 중기 계획 (1-2개월)
- [ ] **자동 백업 설정**
- [ ] **성능 모니터링 대시보드**
- [ ] **알림 시스템 구축**

### 장기 계획 (3-6개월)
- [ ] **다중 리전 배포**
- [ ] **자동 스케일링**
- [ **AI 기반 쿼리 최적화**

---

**마지막 업데이트**: 2025년 8월 23일  
**버전**: 1.0.0  
**담당자**: 개발팀
