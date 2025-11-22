"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const LessonTicket_1 = require("../models/LessonTicket");
const Booking_1 = require("../models/Booking");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
router.get('/', auth_1.authMiddleware, (0, auth_1.requireRole)(['centeradmin', 'centerAdmin']), async (req, res) => {
    try {
        console.log('🔍 센터 회원 목록 조회 시작');
        console.log('   - 사용자 ID:', req.user._id);
        const centerAdmin = await User_1.User.findById(req.user._id);
        console.log('   - 센터 관리자:', centerAdmin?.email);
        console.log('   - 관리 센터:', centerAdmin?.centerAdminInfo?.managedCenters);
        if (!centerAdmin?.centerAdminInfo?.managedCenters || centerAdmin.centerAdminInfo.managedCenters.length === 0) {
            console.log('❌ 관리하는 센터가 없음');
            return res.status(404).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const centerId = centerAdmin.centerAdminInfo.managedCenters[0];
        console.log('   - 센터 ID:', centerId);
        const { search, status, type } = req.query;
        console.log('   - 검색 조건:', { search, status, type });
        const query = {
            centerId: centerId,
            userType: 'student'
        };
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }
        if (status) {
            query.isActive = status === 'active';
        }
        console.log('   - 회원 조회 쿼리:', JSON.stringify(query));
        const membersRaw = await User_1.User.find(query)
            .select('name email phone isActive createdAt studentInfo')
            .sort({ createdAt: -1 });
        const members = membersRaw.map(m => m.toObject());
        console.log(`   - 조회된 회원 수: ${members.length}명`);
        if (members.length > 0) {
            console.log('   - 첫 번째 회원:', members[0].name, members[0].email);
            console.log('   - studentInfo:', members[0].studentInfo);
            console.log('   - centerMemo:', members[0].studentInfo?.centerMemo);
            console.log('   - centerMemoUpdatedAt:', members[0].studentInfo?.centerMemoUpdatedAt);
        }
        const membersWithTickets = await Promise.all(members.map(async (member) => {
            const activeTickets = await LessonTicket_1.LessonTicket.find({
                userId: member._id,
                status: 'active'
            }).select('type name totalSessions remainingSessions expiryDate').lean();
            const totalAttendance = await Booking_1.Booking.countDocuments({
                userId: member._id,
                status: 'completed'
            });
            let assignedInstructor = null;
            if (member.studentInfo?.instructorId) {
                const instructor = await User_1.User.findById(member.studentInfo.instructorId)
                    .select('name email')
                    .lean();
                assignedInstructor = instructor;
            }
            if (member.name === '윤서아') {
                console.log('🔍 윤서아 데이터 확인:');
                console.log('   - studentInfo:', member.studentInfo);
                console.log('   - centerMemo:', member.studentInfo?.centerMemo);
                console.log('   - centerMemoUpdatedAt:', member.studentInfo?.centerMemoUpdatedAt);
            }
            return {
                _id: member._id,
                name: member.name,
                email: member.email,
                phone: member.phone,
                status: member.studentInfo?.status || (member.isActive ? 'active' : 'inactive'),
                joinedAt: member.createdAt,
                currentLevel: member.studentInfo?.currentLevel || null,
                assignedInstructor: assignedInstructor,
                centerMemo: member.studentInfo?.centerMemo || null,
                centerMemoUpdatedAt: member.studentInfo?.centerMemoUpdatedAt || null,
                centerMemos: member.studentInfo?.centerMemos || [],
                tickets: activeTickets,
                totalTickets: activeTickets.length,
                totalRemainingSessions: activeTickets.reduce((sum, t) => sum + t.remainingSessions, 0),
                totalAttendance: totalAttendance
            };
        }));
        console.log(`✅ 센터 회원 목록 조회 완료: ${membersWithTickets.length}명`);
        const membersWithMemo = membersWithTickets.filter(m => m.centerMemo);
        if (membersWithMemo.length > 0) {
            console.log(`📝 메모가 있는 회원: ${membersWithMemo.length}명`);
            membersWithMemo.forEach(m => {
                console.log(`   - ${m.name}: "${m.centerMemo?.substring(0, 20)}..."`);
            });
        }
        res.json({
            success: true,
            data: membersWithTickets,
            total: membersWithTickets.length
        });
    }
    catch (error) {
        (0, logger_1.logError)('센터 회원 목록 조회 오류', error);
        res.status(500).json({
            success: false,
            message: '회원 목록 조회에 실패했습니다.'
        });
    }
});
router.get('/:memberId', auth_1.authMiddleware, (0, auth_1.requireRole)(['centeradmin', 'centerAdmin']), async (req, res) => {
    try {
        const { memberId } = req.params;
        const centerAdmin = await User_1.User.findById(req.user._id);
        if (!centerAdmin?.centerAdminInfo?.managedCenters) {
            return res.status(404).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const centerId = centerAdmin.centerAdminInfo.managedCenters[0];
        const member = await User_1.User.findOne({
            _id: memberId,
            centerId: centerId,
            userType: 'student'
        })
            .select('name email phone isActive createdAt studentInfo')
            .lean();
        if (!member) {
            return res.status(404).json({
                success: false,
                message: '회원을 찾을 수 없습니다.'
            });
        }
        const tickets = await LessonTicket_1.LessonTicket.find({
            userId: memberId
        })
            .sort({ createdAt: -1 })
            .lean();
        const attendanceHistory = await Booking_1.Booking.find({
            userId: memberId
        })
            .sort({ date: -1 })
            .limit(20)
            .populate('courseId', 'name')
            .lean();
        let assignedInstructor = null;
        if (member.studentInfo?.instructorId) {
            assignedInstructor = await User_1.User.findById(member.studentInfo.instructorId)
                .select('name email')
                .lean();
        }
        res.json({
            success: true,
            data: {
                ...member,
                status: member.isActive ? 'active' : 'inactive',
                tickets: tickets,
                attendanceHistory: attendanceHistory,
                assignedInstructor: assignedInstructor
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('회원 상세 정보 조회 오류', error);
        res.status(500).json({
            success: false,
            message: '회원 정보 조회에 실패했습니다.'
        });
    }
});
router.patch('/:memberId/status', auth_1.authMiddleware, (0, auth_1.requireRole)(['centeradmin', 'centerAdmin']), async (req, res) => {
    try {
        const { memberId } = req.params;
        const { status } = req.body;
        if (!['active', 'inactive', 'suspended'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: '올바른 상태 값이 아닙니다.'
            });
        }
        const centerAdmin = await User_1.User.findById(req.user._id);
        if (!centerAdmin?.centerAdminInfo?.managedCenters) {
            return res.status(404).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const centerId = centerAdmin.centerAdminInfo.managedCenters[0];
        const member = await User_1.User.findOneAndUpdate({
            _id: memberId,
            centerId: centerId,
            userType: 'student'
        }, {
            isActive: status === 'active',
            'studentInfo.status': status
        }, { new: true }).select('name email status isActive');
        if (!member) {
            return res.status(404).json({
                success: false,
                message: '회원을 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            message: '회원 상태가 변경되었습니다.',
            data: member
        });
    }
    catch (error) {
        (0, logger_1.logError)('회원 상태 변경 오류', error);
        res.status(500).json({
            success: false,
            message: '회원 상태 변경에 실패했습니다.'
        });
    }
});
router.post('/:memberId/memo', auth_1.authMiddleware, (0, auth_1.requireRole)(['centeradmin', 'centerAdmin']), async (req, res) => {
    try {
        console.log('📝 메모 추가 요청 시작');
        const { memberId } = req.params;
        const { content, type } = req.body;
        console.log('   - 회원 ID:', memberId);
        console.log('   - 메모 내용:', content);
        console.log('   - 메모 유형:', type);
        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: '메모 내용을 입력해주세요.'
            });
        }
        const centerAdmin = await User_1.User.findById(req.user._id);
        if (!centerAdmin?.centerAdminInfo?.managedCenters) {
            console.log('❌ 관리하는 센터가 없음');
            return res.status(404).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const centerId = centerAdmin.centerAdminInfo.managedCenters[0];
        console.log('   - 센터 ID:', centerId);
        console.log('   - 작성자:', centerAdmin.name);
        const newMemo = {
            content: content.trim(),
            type: type || 'info',
            createdBy: req.user._id,
            createdByName: centerAdmin.name,
            createdAt: new Date()
        };
        const member = await User_1.User.findOneAndUpdate({
            _id: memberId,
            centerId: centerId,
            userType: 'student'
        }, {
            $push: {
                'studentInfo.centerMemos': newMemo
            }
        }, { new: true }).select('name studentInfo.centerMemos');
        if (!member) {
            console.log('❌ 회원을 찾을 수 없음');
            return res.status(404).json({
                success: false,
                message: '회원을 찾을 수 없습니다.'
            });
        }
        console.log('✅ 메모 추가 성공');
        console.log('   - 회원명:', member.name);
        console.log('   - 총 메모 개수:', member.studentInfo?.centerMemos?.length);
        res.json({
            success: true,
            message: '센터 메모가 추가되었습니다.',
            data: member
        });
    }
    catch (error) {
        (0, logger_1.logError)('센터 메모 추가 오류', error);
        res.status(500).json({
            success: false,
            message: '센터 메모 추가에 실패했습니다.'
        });
    }
});
router.delete('/:memberId/memo/:memoId', auth_1.authMiddleware, (0, auth_1.requireRole)(['centeradmin', 'centerAdmin']), async (req, res) => {
    try {
        const { memberId, memoId } = req.params;
        const centerAdmin = await User_1.User.findById(req.user._id);
        if (!centerAdmin?.centerAdminInfo?.managedCenters) {
            return res.status(404).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const centerId = centerAdmin.centerAdminInfo.managedCenters[0];
        const member = await User_1.User.findOneAndUpdate({
            _id: memberId,
            centerId: centerId,
            userType: 'student'
        }, {
            $pull: {
                'studentInfo.centerMemos': { _id: memoId }
            }
        }, { new: true }).select('name studentInfo.centerMemos');
        if (!member) {
            return res.status(404).json({
                success: false,
                message: '회원을 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            message: '센터 메모가 삭제되었습니다.',
            data: member
        });
    }
    catch (error) {
        (0, logger_1.logError)('센터 메모 삭제 오류', error);
        res.status(500).json({
            success: false,
            message: '센터 메모 삭제에 실패했습니다.'
        });
    }
});
router.get('/alerts/expiring-tickets', auth_1.authMiddleware, (0, auth_1.requireRole)(['centeradmin', 'centerAdmin']), async (req, res) => {
    try {
        const centerAdmin = await User_1.User.findById(req.user._id);
        if (!centerAdmin?.centerAdminInfo?.managedCenters) {
            return res.status(404).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const centerId = centerAdmin.centerAdminInfo.managedCenters[0];
        const expiringTickets = await LessonTicket_1.LessonTicket.getExpiringSoonTickets(centerId);
        res.json({
            success: true,
            data: expiringTickets,
            total: expiringTickets.length
        });
    }
    catch (error) {
        (0, logger_1.logError)('만료 임박 수강권 조회 오류', error);
        res.status(500).json({
            success: false,
            message: '만료 임박 수강권 조회에 실패했습니다.'
        });
    }
});
router.get('/stats/summary', auth_1.authMiddleware, (0, auth_1.requireRole)(['centeradmin', 'centerAdmin']), async (req, res) => {
    try {
        console.log('📊 센터 회원 통계 조회 시작');
        const centerAdmin = await User_1.User.findById(req.user._id);
        if (!centerAdmin?.centerAdminInfo?.managedCenters) {
            console.log('❌ 관리하는 센터가 없음');
            return res.status(404).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const centerId = centerAdmin.centerAdminInfo.managedCenters[0];
        console.log('   - 센터 ID:', centerId);
        const totalMembers = await User_1.User.countDocuments({
            centerId: centerId,
            userType: 'student'
        });
        const activeMembers = await User_1.User.countDocuments({
            centerId: centerId,
            userType: 'student',
            isActive: true
        });
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const newMembersThisMonth = await User_1.User.countDocuments({
            centerId: centerId,
            userType: 'student',
            createdAt: { $gte: startOfMonth }
        });
        const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const expiringTicketsCount = await LessonTicket_1.LessonTicket.countDocuments({
            centerId: centerId,
            status: 'active',
            expiryDate: { $lte: sevenDaysFromNow, $gte: new Date() }
        });
        console.log('📊 통계 결과:', {
            totalMembers,
            activeMembers,
            newMembersThisMonth,
            expiringTicketsCount
        });
        res.json({
            success: true,
            data: {
                totalMembers,
                activeMembers,
                newMembersThisMonth,
                expiringTicketsCount
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('회원 통계 조회 오류', error);
        res.status(500).json({
            success: false,
            message: '회원 통계 조회에 실패했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=center-members.js.map