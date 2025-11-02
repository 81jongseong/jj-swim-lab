"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const Center_1 = __importDefault(require("../models/Center"));
const router = express_1.default.Router();
async function geocodeAddress(address) {
    if (!address || address.trim() === '') {
        return null;
    }
    const mockLat = 37.5665 + (Math.random() - 0.5) * 0.2;
    const mockLng = 126.9780 + (Math.random() - 0.5) * 0.2;
    return { lat: mockLat, lng: mockLng };
}
function toH3(lat, lng, resolution = 8) {
    const latGrid = Math.floor(lat / 0.01);
    const lngGrid = Math.floor(lng / 0.01);
    return `h3_${resolution}_${latGrid}_${lngGrid}`;
}
function h3ToLatLng(h3Index) {
    const parts = h3Index.split('_');
    if (parts.length >= 4) {
        const lat = parseFloat(parts[2]) * 0.01 + 0.005;
        const lng = parseFloat(parts[3]) * 0.01 + 0.005;
        return { lat, lng };
    }
    return { lat: 37.5665, lng: 126.9780 };
}
function laplaceNoise(epsilon = 1.0) {
    const u = Math.random() - 0.5;
    const scale = 1 / epsilon;
    return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
}
function round5(n) {
    return Math.round(n / 5) * 5;
}
function addNoiseAndRound(count, epsilon = 1.0) {
    const noisy = count + laplaceNoise(epsilon);
    const rounded = round5(Math.max(0, noisy));
    return rounded;
}
router.get('/aggregate', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        if (user.userType !== 'superAdmin' && user.userType !== 'centerAdmin' && user.userType !== 'center-admin') {
            return res.status(403).json({
                success: false,
                message: '지리적 분포 조회 권한이 없습니다.',
            });
        }
        const isDevelopment = process.env.NODE_ENV !== 'production';
        const K_THRESHOLD = isDevelopment ? 1 : 5;
        const { centerId, from, to, memberType } = req.query;
        const filter = {};
        if (user.userType === 'centerAdmin' || user.userType === 'center-admin') {
            const managedCenters = user.centerAdminInfo?.managedCenters || [];
            if (managedCenters.length > 0) {
                if (centerId && managedCenters.some((c) => {
                    const cId = c.toString ? c.toString() : c._id?.toString() || c;
                    return cId === centerId;
                })) {
                    filter.centerId = centerId;
                }
                else if (centerId === null || centerId === undefined || centerId === '') {
                    const centerIds = managedCenters.map((c) => {
                        return c.toString ? c.toString() : c._id?.toString() || c;
                    });
                    if (centerIds.length > 0) {
                        filter.centerId = { $in: centerIds };
                    }
                }
            }
            else if (user.centerId) {
                filter.centerId = user.centerId;
            }
        }
        else if (centerId && user.userType === 'superAdmin') {
            if (centerId !== 'all' && centerId !== null && centerId !== undefined && centerId !== '') {
                filter.centerId = centerId;
            }
        }
        if (from || to) {
            filter.createdAt = {};
            if (from)
                filter.createdAt.$gte = new Date(from);
            if (to)
                filter.createdAt.$lte = new Date(to);
        }
        let userIds = null;
        if (memberType && ['group-lesson', 'personal-lesson', 'free-swim'].includes(memberType)) {
            const { PersonalLesson } = await Promise.resolve().then(() => __importStar(require('../models/PersonalLesson')));
            const { LaneRental } = await Promise.resolve().then(() => __importStar(require('../models/LaneRental')));
            const { Course } = await Promise.resolve().then(() => __importStar(require('../models/Course')));
            if (memberType === 'personal-lesson') {
                const personalLessons = await PersonalLesson.find({
                    status: { $in: ['pending', 'approved', 'completed'] }
                }).select('studentId').lean();
                userIds = [...new Set(personalLessons.map((pl) => pl.studentId).filter(Boolean))];
                console.log(`👤 개인레슨 수강생: ${userIds.length}명`);
            }
            else if (memberType === 'free-swim') {
                const laneRentals = await LaneRental.find({
                    status: { $in: ['pending', 'approved', 'completed'] }
                }).select('userId').lean();
                userIds = [...new Set(laneRentals.map((lr) => lr.userId).filter(Boolean))];
                console.log(`🏊 자유수영 이용자: ${userIds.length}명`);
            }
            else if (memberType === 'group-lesson') {
                const courses = await Course.find({
                    isActive: true,
                    type: { $in: ['group', 'course'] }
                }).select('enrollments students participants').lean();
                userIds = [];
                courses.forEach((course) => {
                    if (course.enrollments && Array.isArray(course.enrollments)) {
                        course.enrollments.forEach((enrollment) => {
                            const userId = enrollment.student || enrollment.userId || enrollment;
                            if (userId)
                                userIds.push(userId);
                        });
                    }
                    if (course.students && Array.isArray(course.students)) {
                        course.students.forEach((student) => {
                            const userId = student._id || student.id || student;
                            if (userId)
                                userIds.push(userId);
                        });
                    }
                    if (course.participants && Array.isArray(course.participants)) {
                        course.participants.forEach((participant) => {
                            const userId = participant._id || participant.id || participant;
                            if (userId)
                                userIds.push(userId);
                        });
                    }
                });
                userIds = [...new Set(userIds)];
                console.log(`👥 단체레슨 수강생: ${userIds.length}명`);
            }
            if (userIds && userIds.length > 0) {
                filter._id = { $in: userIds };
            }
            else {
                res.json({
                    success: true,
                    cells: [],
                    metadata: {
                        totalCells: 0,
                        filteredCells: 0,
                        k: K_THRESHOLD,
                        privacyNotice: `해당 레슨 유형(${memberType})에 해당하는 회원이 없습니다.`
                    }
                });
                return;
            }
        }
        else if (memberType) {
            filter.userType = memberType;
        }
        filter.$or = [
            { 'location.coordinates': { $exists: true, $ne: [] } },
            { address: { $exists: true, $nin: ['', null] } }
        ];
        console.log('🔍 필터 조건:', JSON.stringify(filter, null, 2));
        const users = await User_1.User.find(filter)
            .select('address location centerId createdAt userType')
            .lean();
        console.log(`📍 지리적 분포 조회: ${users.length}명의 회원 데이터 처리 (필터: ${memberType || '전체'})`);
        const usersWithAddress = users.filter(u => u.address && u.address.trim() !== '');
        const usersWithCoords = users.filter(u => u.location?.coordinates && Array.isArray(u.location.coordinates) && u.location.coordinates.length === 2);
        const usersWithoutLocation = users.filter(u => !u.address && !u.location?.coordinates);
        console.log(`📊 회원 위치 정보 현황:`);
        console.log(`  - 주소지 보유: ${usersWithAddress.length}명`);
        console.log(`  - 좌표 보유: ${usersWithCoords.length}명`);
        console.log(`  - 위치 정보 없음: ${usersWithoutLocation.length}명`);
        const centerIds = [...new Set(users.map(u => u.centerId).filter(Boolean))];
        const { SwimmingCenter } = await Promise.resolve().then(() => __importStar(require('../models/SwimmingCenter')));
        const centers = await SwimmingCenter.find({ _id: { $in: centerIds } })
            .select('_id name')
            .lean();
        const centerMap = new Map(centers.map((c) => [c._id.toString(), c.name || `센터 ${c._id.toString().substring(0, 8)}`]));
        const h3Map = new Map();
        let processedCount = 0;
        let skippedNoCoords = 0;
        let skippedInvalidCoords = 0;
        for (const userItem of users) {
            let coords = null;
            if (userItem.location && userItem.location.coordinates && userItem.location.coordinates.length === 2) {
                coords = {
                    lng: userItem.location.coordinates[0],
                    lat: userItem.location.coordinates[1]
                };
                if (processedCount < 3) {
                    console.log(`  ✅ 좌표 사용: User ${userItem._id} → [${coords.lng}, ${coords.lat}]`);
                }
            }
            else if (userItem.address) {
                coords = await geocodeAddress(userItem.address);
                if (processedCount < 3) {
                    console.log(`  📍 지오코딩: User ${userItem._id}, 주소 "${userItem.address}" → [${coords?.lng}, ${coords?.lat}]`);
                }
            }
            else if (userItem.centerId) {
                try {
                    const { SwimmingCenter } = await Promise.resolve().then(() => __importStar(require('../models/SwimmingCenter')));
                    const center = await SwimmingCenter.findById(userItem.centerId).select('address location').lean();
                    if (center && !Array.isArray(center)) {
                        if (center.location?.coordinates && Array.isArray(center.location.coordinates) && center.location.coordinates.length === 2) {
                            coords = {
                                lng: center.location.coordinates[0],
                                lat: center.location.coordinates[1]
                            };
                            if (processedCount < 3) {
                                console.log(`  🏢 센터 좌표 사용: User ${userItem._id}, Center ${userItem.centerId} → [${coords.lng}, ${coords.lat}]`);
                            }
                        }
                        else if (center.address) {
                            coords = await geocodeAddress(center.address);
                            if (processedCount < 3) {
                                console.log(`  🏢 센터 주소 지오코딩: User ${userItem._id}, Center ${userItem.centerId}, 주소 "${center.address}" → [${coords?.lng}, ${coords?.lat}]`);
                            }
                        }
                    }
                }
                catch (error) {
                    if (processedCount < 3) {
                        console.warn(`  ⚠️ 센터 조회 실패: User ${userItem._id}, Center ${userItem.centerId}`, error);
                    }
                }
            }
            if (!coords) {
                skippedNoCoords++;
                if (skippedNoCoords <= 3) {
                    console.warn(`  ❌ 좌표 없음: User ${userItem._id}, 주소지: ${userItem.address || '없음'}, 센터: ${userItem.centerId || '없음'}`);
                }
                continue;
            }
            if (isNaN(coords.lat) || isNaN(coords.lng) || coords.lat === 0 || coords.lng === 0) {
                skippedInvalidCoords++;
                if (skippedInvalidCoords <= 3) {
                    console.warn(`  ⚠️ 잘못된 좌표: User ${userItem._id}, [${coords.lng}, ${coords.lat}]`);
                }
                continue;
            }
            processedCount++;
            const h3Index = toH3(coords.lat, coords.lng, 8);
            if (h3Map.has(h3Index)) {
                const cell = h3Map.get(h3Index);
                cell.count += 1;
                if (userItem.centerId) {
                    const cId = userItem.centerId.toString();
                    cell.centerCounts[cId] = (cell.centerCounts[cId] || 0) + 1;
                }
            }
            else {
                const center = h3ToLatLng(h3Index);
                const cId = userItem.centerId?.toString();
                h3Map.set(h3Index, {
                    h3Index,
                    lat: center.lat,
                    lng: center.lng,
                    count: 1,
                    countApprox: 0,
                    centerId: cId,
                    centerName: cId ? centerMap.get(cId) : undefined,
                    centerCounts: cId ? { [cId]: 1 } : {},
                });
            }
        }
        let cells = Array.from(h3Map.values());
        const totalCells = cells.length;
        cells = cells.filter(cell => cell.count >= K_THRESHOLD);
        const filteredCells = cells.length;
        console.log(`\n📊 처리 결과:`);
        console.log(`  - 총 회원 수: ${users.length}명`);
        console.log(`  - 좌표 처리 완료: ${processedCount}명`);
        console.log(`  - 좌표 없음으로 스킵: ${skippedNoCoords}명`);
        console.log(`  - 잘못된 좌표로 스킵: ${skippedInvalidCoords}명`);
        console.log(`  - H3 셀 개수: ${h3Map.size}개`);
        console.log(`\n🔒 k-익명성 필터링 전: ${totalCells}개 셀`);
        if (totalCells > 0) {
            const countDistribution = {};
            cells.forEach((cell) => {
                countDistribution[cell.count] = (countDistribution[cell.count] || 0) + 1;
            });
            console.log(`  - 셀별 회원 수 분포:`, countDistribution);
        }
        cells = cells.filter(cell => cell.count >= K_THRESHOLD);
        const filteredCells = cells.length;
        console.log(`🔒 k-익명성 필터링 후: ${filteredCells}개 셀 (k≥${K_THRESHOLD})${isDevelopment ? ' (개발 모드: k=1)' : ''}`);
        cells.forEach(cell => {
            cell.countApprox = addNoiseAndRound(cell.count, 1.0);
            const originalCount = cell.count;
            delete cell.count;
            delete cell.centerCounts;
            if (cells.length <= 10) {
                console.log(`  셀 [${cell.lat.toFixed(4)}, ${cell.lng.toFixed(4)}]: 원본 ${originalCount}명 → 근사값 ${cell.countApprox}명`);
            }
        });
        console.log(`\n📤 최종 응답:`);
        console.log(`  - 총 셀 수: ${cells.length}개`);
        console.log(`  - 총 회원 수 (근사값): ${cells.reduce((sum, c) => sum + c.countApprox, 0)}명`);
        console.log(`📊 [GEO-AUDIT] User: ${user.userId}, Type: ${user.userType}, Filter: ${JSON.stringify({ centerId, from, to, memberType })}, Result: ${filteredCells} cells`);
        res.json({
            success: true,
            cells,
            metadata: {
                totalCells,
                filteredCells,
                k: K_THRESHOLD,
                privacyNotice: `본 데이터는 k-익명성(k≥${K_THRESHOLD}), 노이즈 주입, 5단위 반올림이 적용되었습니다.`,
            },
        });
    }
    catch (error) {
        console.error('지리적 분포 집계 오류:', error);
        res.status(500).json({
            success: false,
            message: '지리적 분포 집계 중 오류가 발생했습니다.',
        });
    }
});
router.get('/centers', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        if (user.userType !== 'superAdmin' && user.userType !== 'centerAdmin') {
            return res.status(403).json({
                success: false,
                message: '센터 목록 조회 권한이 없습니다.',
            });
        }
        const filter = { isActive: true };
        if (user.userType === 'centerAdmin' && user.centerId) {
            filter._id = user.centerId;
        }
        const centers = await Center_1.default.find(filter)
            .select('_id name region city district address')
            .lean();
        res.json({
            success: true,
            centers,
        });
    }
    catch (error) {
        console.error('센터 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '센터 목록 조회 중 오류가 발생했습니다.',
        });
    }
});
exports.default = router;
//# sourceMappingURL=geo-aggregate.js.map