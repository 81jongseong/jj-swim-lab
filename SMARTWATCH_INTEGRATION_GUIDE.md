# 🏊‍♂️ JJ Swim Lab - 스마트워치 연동 가이드

## 📱 지원 기기
- **Apple Watch** (Series 4 이상)
- **Samsung Galaxy Watch** (Watch4 이상)  
- **Garmin** (Swim 2, Fenix 시리즈)

## 🔧 연동 방법

### 1. **Apple Watch 연동**
```swift
// iOS 앱에서 HealthKit 사용
import HealthKit

// 수영 운동 데이터 수집
let workoutType = HKWorkoutType.workoutType()
let swimmingWorkout = HKWorkout(
    activityType: .swimming,
    start: startDate,
    end: endDate,
    duration: duration,
    totalEnergyBurned: calories,
    totalDistance: distance,
    metadata: nil
)

// JJ Swim Lab 서버로 전송
let apiURL = "https://your-server.com/api/smartwatch/sync"
let headers = ["Authorization": "Bearer \(userToken)"]
```

### 2. **Samsung Galaxy Watch 연동**
```kotlin
// Tizen 웹앱 또는 Wear OS
// Samsung Health SDK 사용

val sessionData = mapOf(
    "sessionId" to "samsung_${System.currentTimeMillis()}",
    "deviceInfo" to mapOf(
        "deviceType" to "samsung_galaxy_watch",
        "deviceModel" to "Galaxy Watch6",
        "firmwareVersion" to "5.0.0.2"
    ),
    "sessionInfo" to sessionInfo,
    "performanceMetrics" to metrics
)

// HTTP POST 요청
sendDataToServer(sessionData)
```

### 3. **Garmin 연동**
```javascript
// Connect IQ 앱
// Garmin SDK 사용

var sessionData = {
    sessionId: "garmin_" + Date.now(),
    deviceInfo: {
        deviceType: "garmin",
        deviceModel: "Garmin Swim 2",
        firmwareVersion: "4.20"
    },
    sessionInfo: {
        startTime: session.startTime,
        endTime: session.endTime,
        duration: session.duration,
        technique: session.stroke,
        poolLength: 25,
        totalDistance: session.distance
    },
    performanceMetrics: {
        averageSpeed: session.avgSpeed,
        maxSpeed: session.maxSpeed,
        averageHeartRate: session.avgHR,
        maxHeartRate: session.maxHR,
        minHeartRate: session.minHR,
        strokeCount: session.strokes,
        strokeRate: session.strokeRate,
        caloriesBurned: session.calories,
        efficiency: calculateEfficiency(session)
    }
};

// 서버 전송
Communications.makeWebRequest(
    "https://your-server.com/api/smartwatch/sync",
    { "Authorization" => "Bearer " + userToken },
    { :method => Communications.HTTP_REQUEST_METHOD_POST,
      :headers => { "Content-Type" => Communications.REQUEST_CONTENT_TYPE_JSON },
      :responseType => Communications.HTTP_RESPONSE_CONTENT_TYPE_JSON },
    method(:onReceive)
);
```

## 🔌 API 엔드포인트

### **POST /api/smartwatch/sync**
스마트워치 데이터 동기화

**요청 예시:**
```json
{
  "sessionId": "unique_session_id",
  "deviceInfo": {
    "deviceType": "apple_watch",
    "deviceModel": "Apple Watch Series 9",
    "firmwareVersion": "10.1"
  },
  "sessionInfo": {
    "startTime": "2024-01-01T10:00:00Z",
    "endTime": "2024-01-01T10:45:00Z",
    "duration": 45,
    "technique": "freestyle",
    "poolLength": 25,
    "totalDistance": 1000
  },
  "performanceMetrics": {
    "averageSpeed": 1.2,
    "maxSpeed": 1.5,
    "averageHeartRate": 145,
    "maxHeartRate": 165,
    "minHeartRate": 120,
    "strokeCount": 800,
    "strokeRate": 18,
    "caloriesBurned": 320,
    "efficiency": 85
  },
  "detailedData": {
    "heartRateData": [
      {"timestamp": "2024-01-01T10:05:00Z", "heartRate": 145},
      {"timestamp": "2024-01-01T10:10:00Z", "heartRate": 150}
    ],
    "strokeData": [
      {"timestamp": "2024-01-01T10:05:00Z", "strokeType": "freestyle", "strokeCount": 20, "strokeRate": 18}
    ],
    "speedData": [
      {"timestamp": "2024-01-01T10:05:00Z", "speed": 1.2, "distance": 100}
    ],
    "restPeriods": [
      {"startTime": "2024-01-01T10:15:00Z", "endTime": "2024-01-01T10:17:00Z", "duration": 2}
    ]
  }
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "_id": "60f7b1234567890abcdef123",
    "sessionId": "unique_session_id",
    "isProcessed": false
  },
  "message": "스마트 워치 데이터가 성공적으로 동기화되었습니다."
}
```

### **GET /api/smartwatch/data**
스마트워치 데이터 조회

**쿼리 매개변수:**
- `limit`: 조회할 데이터 개수 (기본값: 10)
- `offset`: 페이지네이션 오프셋 (기본값: 0)
- `technique`: 수영 기법 필터 (freestyle, backstroke, breaststroke, butterfly)
- `studentId`: 학생 ID (강사/관리자만 사용 가능)

**응답:**
```json
{
  "success": true,
  "data": {
    "sessions": [...],
    "pagination": {
      "total": 25,
      "limit": 10,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

## 🤖 AI 분석 기능

데이터 동기화 후 자동으로 AI 분석이 수행됩니다:

- **자세 분석**: 수영 자세의 정확도 평가 (0-100점)
- **호흡 패턴**: 호흡의 일관성과 효율성 분석
- **스트로크 분석**: 스트로크의 일관성, 효율성, 파워 평가
- **전체 효율성**: 종합적인 수영 효율성 점수
- **개선 추천**: 개인화된 운동 개선 사항 제안

## 📊 대시보드 연동

동기화된 데이터는 다음 페이지에서 확인 가능:

1. **학생 대시보드** (`/dashboard`)
   - 최근 운동 통계
   - 스마트워치 연동 현황
   - AI 분석 결과

2. **건강 페이지** (`/health`)
   - 상세 운동 기록
   - 스마트워치별 데이터 비교
   - 성과 트렌드 분석

3. **운동 기록** (`/health` > 운동 기록 탭)
   - 세션별 상세 분석
   - 기법별 성과 비교
   - AI 추천사항

## 🔐 보안 및 인증

- **JWT 토큰**: 모든 API 요청에 Bearer 토큰 필요
- **권한 확인**: 사용자별 데이터 접근 제한
- **데이터 암호화**: 민감한 건강 데이터 암호화 저장

## 🧪 테스트 방법

1. **샘플 데이터 생성**:
   ```bash
   cd server
   node scripts/add-comprehensive-dashboard-data.js
   ```

2. **로그인**: `student1 / 101010`

3. **데이터 확인**:
   - 대시보드 페이지 접속
   - 건강 페이지 > 운동 기록 탭
   - 스마트워치 연동 섹션

## ❓ 자주 묻는 질문

**Q: 지원하지 않는 기기는 어떻게 하나요?**
A: `deviceType`을 `"other"`로 설정하고 기본 데이터 구조를 사용하세요.

**Q: 실시간 데이터 전송이 가능한가요?**
A: 현재는 세션 완료 후 일괄 전송만 지원합니다.

**Q: 데이터 동기화가 실패하면?**
A: 로컬에 저장 후 네트워크 연결 시 재시도하는 로직을 구현하세요.

---
📧 **문의**: 기술적 문제가 있으면 개발팀에 연락하세요.
