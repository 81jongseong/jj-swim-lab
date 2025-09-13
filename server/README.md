# 🏊 JJ Swim Lab 프로젝트

- 통합 수영 교육/운영 플랫폼
- AI 기반 수업 추천, 진도 추적, 지도자 피드백, 영상 분석 포함

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB
- Redis (optional, for caching)

### Installation

```bash
# Install dependencies
npm install

# Environment setup
cp .env.example .env
# Edit .env with your configuration
```

### Development

```bash
# Run development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- __tests__/routes/auth.test.ts
```

---

## 🧪 Testing

### Test Coverage Status
- **✅ 100% Test Coverage Achieved**
- **836 Tests Passing** (0 failures)
- **39 Test Suites** covering all functionality

### Test Categories
- **Routes**: auth, users, courses, bookings, payments, notices, dashboard, uploads, notifications, stats, system, centers, ai
- **Models**: User, Course, Booking, AIAnalysis, Payment, Center, Notice
- **Middleware**: auth, errorHandler, validation
- **Utilities**: logger, performance

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run specific test category
npm test -- __tests__/routes/
npm test -- __tests__/models/
npm test -- __tests__/middleware/
npm test -- __tests__/utils/

# Run tests in watch mode
npm test -- --watch
```

### Test Reports
- Coverage report: `coverage/test-report.html`
- Test results are logged to console with detailed pass/fail information

---

## 📁 Project Structure

```
server/
├── src/
│   ├── routes/           # API routes
│   ├── models/           # Database models
│   ├── middleware/       # Express middleware
│   ├── utils/            # Utility functions
│   ├── config/           # Configuration files
│   └── types/            # TypeScript type definitions
├── __tests__/            # Test files
│   ├── routes/           # Route tests
│   ├── models/           # Model tests
│   ├── middleware/       # Middleware tests
│   ├── utils/            # Utility tests
│   └── setup.ts          # Test setup and utilities
├── coverage/             # Test coverage reports
└── docs/                 # Documentation
```

---

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### User Management
- `GET /api/users` - Get all users (admin only)
- `POST /api/users` - Create new user (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Course Management
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course (instructor only)
- `GET /api/courses/my-courses` - Get user's courses
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Booking Management
- `GET /api/bookings` - Get bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Payment Management
- `GET /api/payments` - Get payments
- `POST /api/payments` - Process payment
- `GET /api/payments/stats` - Payment statistics

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/:id` - Mark as read

### AI Features
- `POST /api/ai/analyze` - AI video analysis
- `GET /api/ai/analysis` - Get analysis results
- `POST /api/ai/feedback` - Provide feedback

---

## 🛡️ Security Features

- JWT Authentication with issuer/audience validation
- Role-based access control (superAdmin, centerAdmin, instructor, student)
- Permission-based authorization
- Input validation and sanitization
- Rate limiting
- CORS protection
- XSS protection
- SQL injection prevention

---

## 🔍 Monitoring & Logging

- Comprehensive logging with Winston
- Performance monitoring
- Error tracking and reporting
- Security event logging
- Test coverage tracking

---

## 📊 Performance

- Optimized database queries
- Efficient middleware stack
- Memory usage monitoring
- CPU usage tracking
- Response time measurement

---

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
```bash
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/jj-swim-lab
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass (100% coverage)
5. Submit a pull request

### Testing Requirements
- All new code must have corresponding tests
- Test coverage must remain at 100%
- All tests must pass before merging

---

## 📝 License

This project is licensed under the MIT License.

---

## 🆘 Support

For support and questions, please contact the development team.

---

*Last updated: December 2024*
*Test Coverage: 100% (836/836 tests passing)*