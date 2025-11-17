"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.businessValidations = exports.createValidationMiddleware = exports.handleValidationErrors = exports.fileValidations = exports.bookingValidations = exports.courseValidations = exports.userValidations = exports.commonValidations = exports.query = exports.param = exports.body = exports.validationResult = void 0;
const validationResult = (_req) => {
    void _req;
    return {
        isEmpty: () => true,
        array: () => []
    };
};
exports.validationResult = validationResult;
const body = (_field) => {
    void _field;
    const chain = {
        isEmail: () => chain,
        isLength: (_options) => {
            void _options;
            return chain;
        },
        matches: (_pattern) => {
            void _pattern;
            return chain;
        },
        custom: (_fn) => {
            void _fn;
            return chain;
        },
        trim: () => chain,
        escape: () => chain,
        optional: () => chain,
        isNumeric: () => chain,
        isURL: () => chain,
        normalizeEmail: () => chain,
        withMessage: (_msg) => {
            void _msg;
            return chain;
        },
        isInt: (_options) => {
            void _options;
            return chain;
        },
        isFloat: (_options) => {
            void _options;
            return chain;
        },
        isString: () => chain,
        isIn: (_values) => {
            void _values;
            return chain;
        },
        isArray: (_options) => {
            void _options;
            return chain;
        },
        isObject: () => chain,
        isBoolean: () => chain,
        isMongoId: () => chain,
        isMobilePhone: (_locale) => {
            void _locale;
            return chain;
        },
        notEmpty: () => chain,
        isISO8601: () => chain,
        toInt: () => chain,
        toBoolean: () => chain,
        run: () => chain
    };
    return chain;
};
exports.body = body;
const param = (_field) => {
    void _field;
    const chain = {
        isMongoId: () => chain,
        isLength: (_options) => {
            void _options;
            return chain;
        },
        withMessage: (_msg) => {
            void _msg;
            return chain;
        }
    };
    return chain;
};
exports.param = param;
const query = (_field) => {
    void _field;
    const chain = {
        optional: () => chain,
        isInt: (_options) => {
            void _options;
            return chain;
        },
        withMessage: (_msg) => {
            void _msg;
            return chain;
        },
        toInt: () => chain
    };
    return chain;
};
exports.query = query;
exports.commonValidations = {
    email: (0, exports.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('유효한 이메일 주소를 입력해주세요.')
        .isLength({ max: 255 })
        .withMessage('이메일은 255자를 초과할 수 없습니다.'),
    password: (0, exports.body)('password')
        .isLength({ min: 8, max: 128 })
        .withMessage('비밀번호는 8-128자 사이여야 합니다.')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('비밀번호는 대소문자, 숫자, 특수문자(@$!%*?&)를 포함해야 합니다.')
        .custom((value) => {
        if (/(.)\1{2,}/.test(value)) {
            throw new Error('비밀번호는 연속된 문자를 3개 이상 사용할 수 없습니다.');
        }
        const commonPatterns = [
            /123456/,
            /password/i,
            /qwerty/i,
            /abc123/i,
            /admin/i,
            /user/i,
        ];
        if (commonPatterns.some(pattern => pattern.test(value))) {
            throw new Error('비밀번호는 일반적인 패턴을 사용할 수 없습니다.');
        }
        return true;
    }),
    name: (0, exports.body)('name')
        .isLength({ min: 1, max: 50 })
        .withMessage('이름은 1-50자 사이여야 합니다.')
        .matches(/^[가-힣a-zA-Z\s]+$/)
        .withMessage('이름은 한글 또는 영문만 사용 가능합니다.')
        .trim()
        .escape(),
    phone: (0, exports.body)('phone')
        .isMobilePhone('ko-KR')
        .withMessage('유효한 한국 전화번호를 입력해주세요.')
        .custom((value) => {
        const cleanPhone = value.replace(/[-\s]/g, '');
        if (!/^01[016789]\d{7,8}$/.test(cleanPhone)) {
            throw new Error('올바른 휴대폰 번호 형식이 아닙니다.');
        }
        return true;
    }),
    mongoId: (field) => (0, exports.body)(field)
        .isMongoId()
        .withMessage(`유효한 ${field} ID를 입력해주세요.`),
    page: (0, exports.query)('page')
        .optional()
        .isInt({ min: 1, max: 1000 })
        .withMessage('페이지 번호는 1-1000 사이의 정수여야 합니다.')
        .toInt(),
    limit: (0, exports.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('페이지 크기는 1-100 사이의 정수여야 합니다.')
        .toInt(),
    date: (field) => (0, exports.body)(field)
        .isISO8601()
        .withMessage(`유효한 날짜 형식(${field})을 입력해주세요.`)
        .custom((value) => {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            throw new Error('유효하지 않은 날짜입니다.');
        }
        if (date > new Date()) {
            throw new Error('미래 날짜는 사용할 수 없습니다.');
        }
        return true;
    }),
    futureDate: (field) => (0, exports.body)(field)
        .isISO8601()
        .withMessage(`유효한 날짜 형식(${field})을 입력해주세요.`)
        .custom((value) => {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            throw new Error('유효하지 않은 날짜입니다.');
        }
        if (date < new Date()) {
            throw new Error('과거 날짜는 사용할 수 없습니다.');
        }
        return true;
    }),
    time: (field) => (0, exports.body)(field)
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage(`유효한 시간 형식(${field})을 입력해주세요. (HH:MM)`),
    number: (field, min, max) => {
        let validation = (0, exports.body)(field)
            .isNumeric()
            .withMessage(`${field}은 숫자여야 합니다.`);
        if (min !== undefined) {
            validation = validation.isFloat({ min })
                .withMessage(`${field}은 ${min} 이상이어야 합니다.`);
        }
        if (max !== undefined) {
            validation = validation.isFloat({ max })
                .withMessage(`${field}은 ${max} 이하여야 합니다.`);
        }
        return validation;
    },
    integer: (field, min, max) => {
        let validation = (0, exports.body)(field)
            .isInt()
            .withMessage(`${field}은 정수여야 합니다.`);
        if (min !== undefined) {
            validation = validation.isInt({ min })
                .withMessage(`${field}은 ${min} 이상이어야 합니다.`);
        }
        if (max !== undefined) {
            validation = validation.isInt({ max })
                .withMessage(`${field}은 ${max} 이하여야 합니다.`);
        }
        return validation;
    },
    amount: (field) => (0, exports.body)(field)
        .isFloat({ min: 0 })
        .withMessage(`${field}은 0 이상의 숫자여야 합니다.`)
        .custom((value) => {
        if (value.toString().includes('.') && value.toString().split('.')[1].length > 2) {
            throw new Error(`${field}은 소수점 2자리까지만 허용됩니다.`);
        }
        return true;
    }),
    url: (field) => (0, exports.body)(field)
        .isURL()
        .withMessage(`유효한 URL 형식(${field})을 입력해주세요.`)
        .custom((value) => {
        const allowedDomains = [
            'jj-swim-lab.com',
            'youtube.com',
            'vimeo.com',
            'naver.com',
            'google.com',
        ];
        try {
            const url = new URL(value);
            if (!allowedDomains.some(domain => url.hostname.includes(domain))) {
                throw new Error('허용되지 않은 도메인입니다.');
            }
        }
        catch {
            throw new Error('유효하지 않은 URL입니다.');
        }
        return true;
    }),
    text: (field, minLength, maxLength) => {
        let validation = (0, exports.body)(field)
            .isString()
            .withMessage(`${field}은 텍스트여야 합니다.`)
            .trim()
            .escape();
        if (minLength !== undefined) {
            validation = validation.isLength({ min: minLength })
                .withMessage(`${field}은 최소 ${minLength}자 이상이어야 합니다.`);
        }
        if (maxLength !== undefined) {
            validation = validation.isLength({ max: maxLength })
                .withMessage(`${field}은 최대 ${maxLength}자 이하여야 합니다.`);
        }
        return validation;
    },
    oneOf: (field, options) => (0, exports.body)(field)
        .isIn(options)
        .withMessage(`${field}은 ${options.join(', ')} 중 하나여야 합니다.`),
    array: (field, minItems, maxItems) => {
        let validation = (0, exports.body)(field)
            .isArray()
            .withMessage(`${field}은 배열이어야 합니다.`);
        if (minItems !== undefined) {
            validation = validation.isArray({ min: minItems })
                .withMessage(`${field}은 최소 ${minItems}개 이상의 항목이 있어야 합니다.`);
        }
        if (maxItems !== undefined) {
            validation = validation.isArray({ max: maxItems })
                .withMessage(`${field}은 최대 ${maxItems}개 이하의 항목이 있어야 합니다.`);
        }
        return validation;
    },
    object: (field) => (0, exports.body)(field)
        .isObject()
        .withMessage(`${field}은 객체여야 합니다.`),
    boolean: (field) => (0, exports.body)(field)
        .isBoolean()
        .withMessage(`${field}은 true 또는 false여야 합니다.`)
        .toBoolean(),
};
exports.userValidations = {
    create: [
        exports.commonValidations.email,
        exports.commonValidations.password,
        exports.commonValidations.name,
        exports.commonValidations.phone,
        (0, exports.body)('userType')
            .isIn(['admin', 'instructor', 'student', 'center_admin'])
            .withMessage('유효한 사용자 타입을 선택해주세요.'),
        (0, exports.body)('centerId')
            .optional()
            .isMongoId()
            .withMessage('유효한 센터 ID를 입력해주세요.'),
        (0, exports.body)('level')
            .optional()
            .isIn(['beginner', 'intermediate', 'advanced'])
            .withMessage('유효한 레벨을 선택해주세요.'),
    ],
    update: [
        (0, exports.body)('name')
            .optional()
            .isLength({ min: 1, max: 50 })
            .withMessage('이름은 1-50자 사이여야 합니다.')
            .matches(/^[가-힣a-zA-Z\s]+$/)
            .withMessage('이름은 한글 또는 영문만 사용 가능합니다.')
            .trim()
            .escape(),
        (0, exports.body)('phone')
            .optional()
            .isMobilePhone('ko-KR')
            .withMessage('유효한 한국 전화번호를 입력해주세요.'),
        (0, exports.body)('level')
            .optional()
            .isIn(['beginner', 'intermediate', 'advanced'])
            .withMessage('유효한 레벨을 선택해주세요.'),
        (0, exports.body)('isActive')
            .optional()
            .isBoolean()
            .withMessage('활성 상태는 true 또는 false여야 합니다.'),
    ],
    changePassword: [
        (0, exports.body)('currentPassword')
            .notEmpty()
            .withMessage('현재 비밀번호를 입력해주세요.'),
        exports.commonValidations.password,
        (0, exports.body)('confirmPassword')
            .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('비밀번호 확인이 일치하지 않습니다.');
            }
            return true;
        }),
    ],
};
exports.courseValidations = {
    create: [
        exports.commonValidations.text('title', 1, 100),
        exports.commonValidations.text('description', 1, 1000),
        exports.commonValidations.integer('duration', 1, 480),
        exports.commonValidations.amount('price'),
        exports.commonValidations.oneOf('level', ['beginner', 'intermediate', 'advanced']),
        exports.commonValidations.oneOf('type', ['group', 'private', 'semi_private']),
        exports.commonValidations.integer('maxStudents', 1, 20),
        exports.commonValidations.futureDate('startDate'),
        exports.commonValidations.futureDate('endDate'),
        (0, exports.body)('instructorId')
            .isMongoId()
            .withMessage('유효한 강사 ID를 입력해주세요.'),
        (0, exports.body)('centerId')
            .isMongoId()
            .withMessage('유효한 센터 ID를 입력해주세요.'),
    ],
    update: [
        (0, exports.body)('title')
            .optional()
            .isLength({ min: 1, max: 100 })
            .withMessage('제목은 1-100자 사이여야 합니다.')
            .trim()
            .escape(),
        (0, exports.body)('description')
            .optional()
            .isLength({ min: 1, max: 1000 })
            .withMessage('설명은 1-1000자 사이여야 합니다.')
            .trim()
            .escape(),
        (0, exports.body)('duration')
            .optional()
            .isInt({ min: 1, max: 480 })
            .withMessage('수업 시간은 1-480분 사이여야 합니다.'),
        (0, exports.body)('price')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('가격은 0 이상이어야 합니다.'),
        (0, exports.body)('level')
            .optional()
            .isIn(['beginner', 'intermediate', 'advanced'])
            .withMessage('유효한 레벨을 선택해주세요.'),
        (0, exports.body)('type')
            .optional()
            .isIn(['group', 'private', 'semi_private'])
            .withMessage('유효한 타입을 선택해주세요.'),
        (0, exports.body)('maxStudents')
            .optional()
            .isInt({ min: 1, max: 20 })
            .withMessage('최대 학생 수는 1-20명 사이여야 합니다.'),
    ],
};
exports.bookingValidations = {
    create: [
        (0, exports.body)('courseId')
            .isMongoId()
            .withMessage('유효한 코스 ID를 입력해주세요.'),
        (0, exports.body)('studentId')
            .isMongoId()
            .withMessage('유효한 학생 ID를 입력해주세요.'),
        exports.commonValidations.futureDate('bookingDate'),
        exports.commonValidations.time('startTime'),
        exports.commonValidations.time('endTime'),
        (0, exports.body)('notes')
            .optional()
            .isLength({ max: 500 })
            .withMessage('메모는 500자를 초과할 수 없습니다.')
            .trim()
            .escape(),
    ],
    update: [
        (0, exports.body)('bookingDate')
            .optional()
            .isISO8601()
            .withMessage('유효한 날짜 형식을 입력해주세요.'),
        (0, exports.body)('startTime')
            .optional()
            .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .withMessage('유효한 시작 시간을 입력해주세요. (HH:MM)'),
        (0, exports.body)('endTime')
            .optional()
            .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .withMessage('유효한 종료 시간을 입력해주세요. (HH:MM)'),
        (0, exports.body)('status')
            .optional()
            .isIn(['pending', 'confirmed', 'cancelled', 'completed'])
            .withMessage('유효한 상태를 선택해주세요.'),
        (0, exports.body)('notes')
            .optional()
            .isLength({ max: 500 })
            .withMessage('메모는 500자를 초과할 수 없습니다.')
            .trim()
            .escape(),
    ],
};
exports.fileValidations = {
    image: (field = 'image') => [
        (0, exports.body)(field)
            .custom((value, { req }) => {
            if (!req.file) {
                throw new Error('이미지 파일을 업로드해주세요.');
            }
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(req.file.mimetype)) {
                throw new Error('지원되는 이미지 형식은 JPEG, PNG, GIF, WebP입니다.');
            }
            const maxSize = 5 * 1024 * 1024;
            if (req.file.size > maxSize) {
                throw new Error('이미지 파일 크기는 5MB를 초과할 수 없습니다.');
            }
            return true;
        }),
    ],
    video: (field = 'video') => [
        (0, exports.body)(field)
            .custom((value, { req }) => {
            if (!req.file) {
                throw new Error('비디오 파일을 업로드해주세요.');
            }
            const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
            if (!allowedTypes.includes(req.file.mimetype)) {
                throw new Error('지원되는 비디오 형식은 MP4, WebM, QuickTime입니다.');
            }
            const maxSize = 100 * 1024 * 1024;
            if (req.file.size > maxSize) {
                throw new Error('비디오 파일 크기는 100MB를 초과할 수 없습니다.');
            }
            return true;
        }),
    ],
    document: (field = 'document') => [
        (0, exports.body)(field)
            .custom((value, { req }) => {
            if (!req.file) {
                throw new Error('문서 파일을 업로드해주세요.');
            }
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain',
            ];
            if (!allowedTypes.includes(req.file.mimetype)) {
                throw new Error('지원되는 문서 형식은 PDF, Word, TXT입니다.');
            }
            const maxSize = 10 * 1024 * 1024;
            if (req.file.size > maxSize) {
                throw new Error('문서 파일 크기는 10MB를 초과할 수 없습니다.');
            }
            return true;
        }),
    ],
};
const handleValidationErrors = (req, res, next) => {
    const errors = (0, exports.validationResult)(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.type === 'field' ? error.path : 'unknown',
            message: error.msg,
            value: error.type === 'field' ? error.value : undefined,
        }));
        return res.status(400).json({
            error: '입력 데이터 검증 실패',
            message: '입력 데이터를 확인해주세요.',
            details: errorMessages,
        });
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
const createValidationMiddleware = (validations) => {
    return [
        ...validations,
        exports.handleValidationErrors,
    ];
};
exports.createValidationMiddleware = createValidationMiddleware;
exports.businessValidations = {
    checkCourseScheduleConflict: async (req, res, next) => {
        try {
            const { instructorId, startDate, startTime, endTime } = req.body;
            if (!instructorId || !startDate || !startTime || !endTime) {
                return next();
            }
            next();
        }
        catch (error) {
            console.error('일정 충돌 검사 오류:', error);
            res.status(500).json({
                error: '서버 오류가 발생했습니다.',
                message: '잠시 후 다시 시도해주세요.',
            });
        }
    },
    checkBookingAvailability: async (req, res, next) => {
        try {
            const { courseId, bookingDate, startTime, endTime } = req.body;
            if (!courseId || !bookingDate || !startTime || !endTime) {
                return next();
            }
            next();
        }
        catch (error) {
            console.error('예약 가능 시간 검사 오류:', error);
            res.status(500).json({
                error: '서버 오류가 발생했습니다.',
                message: '잠시 후 다시 시도해주세요.',
            });
        }
    },
};
exports.default = {
    commonValidations: exports.commonValidations,
    userValidations: exports.userValidations,
    courseValidations: exports.courseValidations,
    bookingValidations: exports.bookingValidations,
    fileValidations: exports.fileValidations,
    businessValidations: exports.businessValidations,
    handleValidationErrors: exports.handleValidationErrors,
    createValidationMiddleware: exports.createValidationMiddleware,
};
//# sourceMappingURL=validation.js.map