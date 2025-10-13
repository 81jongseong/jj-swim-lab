# 🎯 게스트 회원 제한 및 네이밍 개선안

## 📋 현재 구조

### 🏊 수영 엔진 체험 경로
```
현재: /health/input (건강체크)
      ↓
      /guest/programs (체험 프로그램)
```

---

## 🎨 네이밍 개선안

### 1️⃣ **추천 네이밍: "스윔랩 체험" (SwimLab Trial)**

**이유**:
- ✅ **명확성**: "스윔랩" 브랜드 강조
- ✅ **직관성**: 무엇을 체험하는지 명확
- ✅ **일관성**: admin의 "swim-training-engine"과 매칭

**경로 제안**:
```
/swimlab/trial        → 스윔랩 체험 입력
/swimlab/trial/result → 체험 프로그램 결과
```

### 2️⃣ **대안 1: "AI 프로그램 체험"**

**경로**:
```
/ai-program/trial     → AI 프로그램 체험
/ai-program/result    → 체험 결과
```

### 3️⃣ **대안 2: "스마트 수영 진단" (Smart Swim Analysis)**

**경로**:
```
/swim-analysis        → 스마트 수영 진단
/swim-analysis/result → 맞춤 프로그램
```

### 4️⃣ **최고관리자 대시보드 네이밍**

**현재**: `admin` (너무 일반적)

**개선안**:
```
/super-admin     → 최고관리자 (Super Admin)
/system-admin    → 시스템 관리자
/master-admin    → 마스터 관리자
```

**역할 구분**:
```
최고관리자 (Super Admin):  전체 시스템 관리
센터 관리자 (Center Admin): 센터별 관리
강사 (Instructor):          회원 및 수업 관리
회원 (Student):             개인 학습
게스트 (Guest):             체험판
```

---

## 🚫 게스트 회원 제한사항

### 1️⃣ **프로그램 생성**

#### ✅ **허용**
- 1일 프로그램 생성 (하루치만)
- 건강 정보 입력
- AI 프로그램 체험
- 프로그램 상세 보기
- 프로그램 인쇄/다운로드 (1회만)

#### 🚫 **제한**
- 주간 프로그램 (7일) - "정회원 전용"
- 월간 프로그램 (30일) - "정회원 전용"
- 프로그램 저장 - "회원가입 후 이용 가능"
- 프로그램 수정 - "강사 회원 전용"
- 프로그램 이력 조회 - "정회원 전용"

### 2️⃣ **커뮤니티**

#### ✅ **허용 (읽기 전용)**
- 게시글 목록 보기
- 게시글 상세 보기 (처음 3줄만)
- 인기 게시글 미리보기
- 댓글 개수 보기

#### 🚫 **제한**
- 게시글 작성 - "회원가입 후 이용 가능"
- 댓글 작성 - "회원가입 후 이용 가능"
- 좋아요/추천 - "회원가입이 필요합니다"
- 북마크/저장 - "회원가입이 필요합니다"
- 게시글 전체 내용 - "회원 전용 콘텐츠입니다" (흐림 처리)
- 이미지/동영상 보기 - "회원 전용" (워터마크)

### 3️⃣ **기타 기능**

#### ✅ **허용**
- 공지사항 보기
- FAQ 보기
- 센터 찾기
- 강사 소개 보기
- 서비스 소개 보기
- 퀴즈 풀기 (1회만)

#### 🚫 **제한**
- 프로필 저장 - "회원가입 필요"
- 진도 기록 - "회원 전용"
- 성취도 분석 - "회원 전용"
- 강사 배정 - "정회원 전용"
- 예약/결제 - "회원가입 필요"
- 수업 신청 - "회원 전용"

---

## 💡 추천 제한 전략

### 🎯 **핵심 원칙**

1. **맛보기 충분히**: 체험으로 가치 인식
2. **명확한 가치**: 정회원의 혜택 명확히
3. **부드러운 유도**: 강요 아닌 안내

### 📊 **커뮤니티 제한 예시**

```javascript
// 게시글 목록
<div className="grid gap-4">
  {posts.slice(0, 3).map(post => (
    <PostCard post={post} />
  ))}
  
  {/* 게스트 제한 안내 */}
  <div className="blur-sm pointer-events-none">
    <PostCard post={posts[3]} />
    <PostCard post={posts[4]} />
  </div>
  
  <div className="text-center p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-300">
    <h3 className="text-xl font-bold mb-2">🔒 회원 전용 콘텐츠</h3>
    <p className="text-gray-600 mb-4">
      더 많은 게시글과 전문가 팁을 보시려면 회원가입이 필요합니다
    </p>
    <button className="px-6 py-3 bg-blue-500 text-white rounded-lg">
      회원가입하고 모든 콘텐츠 보기 →
    </button>
  </div>
</div>
```

### 📱 **게시글 상세 제한**

```javascript
// 게시글 본문
{isGuest ? (
  <>
    <div className="prose max-w-none">
      {post.content.slice(0, 200)}...
    </div>
    
    <div className="relative">
      <div className="blur-lg select-none">
        {post.content.slice(200)}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/80">
        <div className="text-center p-8 bg-white rounded-xl shadow-xl border-2 border-purple-500">
          <h3 className="text-xl font-bold mb-2">🔒 회원 전용</h3>
          <p className="text-gray-600 mb-4">
            전체 내용을 보시려면 회원가입이 필요합니다
          </p>
          <button className="px-6 py-3 bg-purple-500 text-white rounded-lg">
            무료 회원가입 →
          </button>
        </div>
      </div>
    </div>
  </>
) : (
  <div className="prose max-w-none">
    {post.content}
  </div>
)}
```

---

## 🎯 최종 추천

### 📍 **네이밍**

```
경로 구조:
/swimlab/trial          → 🏊 스윔랩 체험 (건강정보 입력)
/swimlab/trial/result   → 📊 AI 맞춤 프로그램 (결과)

최고관리자:
/super-admin            → 🔧 최고관리자 대시보드

센터관리자:
/center-admin           → 🏢 센터 관리자 (그대로)

강사:
/instructor             → 👨‍🏫 강사 대시보드 (그대로)

회원:
/student                → 👤 회원 대시보드 (그대로)
```

### 🚫 **커뮤니티 제한**

| 기능 | 게스트 | 회원 |
|------|--------|------|
| 게시글 목록 | ✅ 처음 3개 | ✅ 전체 |
| 게시글 상세 | ✅ 처음 200자 | ✅ 전체 |
| 이미지/영상 | 🔒 워터마크 | ✅ 원본 |
| 댓글 보기 | ✅ 개수만 | ✅ 전체 |
| 댓글 작성 | 🚫 | ✅ |
| 게시글 작성 | 🚫 | ✅ |
| 좋아요 | 🚫 | ✅ |
| 북마크 | 🚫 | ✅ |

### 💡 **UX 개선**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎁 체험 회원입니다

✅ 이용 가능:
  • 1일 AI 맞춤 프로그램 생성
  • 커뮤니티 게시글 미리보기 (3개)
  • 센터 찾기, 강사 소개

🔒 회원 전용:
  • 주간/월간 프로그램 (7-30일)
  • 프로그램 저장 및 이력 관리
  • 커뮤니티 전체 기능
  • 진도 기록 및 성취도 분석
  • 강사 1:1 관리

[회원가입하고 모든 기능 이용하기 →]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ✅ 구현 우선순위

### 🥇 **1순위: 네이밍 변경**
```
/health/input  →  /swimlab/trial
/guest/programs  →  /swimlab/trial/result
/admin/*  →  /super-admin/*
```

### 🥈 **2순위: 커뮤니티 제한**
- 게시글 목록: 처음 3개만
- 게시글 상세: 처음 200자 + 흐림 처리
- 작성 기능: 전면 차단 + 회원가입 유도

### 🥉 **3순위: 안내 메시지**
- 게스트 상태 배너
- 회원 전용 기능 표시
- 회원가입 유도 CTA

**어떤 순서로 진행할까요?** 🚀

