"use strict";
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
        if (user.userType !== 'superAdmin' && user.userType !== 'centerAdmin') {
            return res.status(403).json({
                success: false,
                message: '지리적 분포 조회 권한이 없습니다.',
            });
        }
        const { centerId, from, to, memberType } = req.query;
        const filter = {};
        if (user.userType === 'centerAdmin' && user.centerId) {
            filter.centerId = user.centerId;
        }
        else if (centerId) {
            filter.centerId = centerId;
        }
        if (from || to) {
            filter.createdAt = {};
            if (from)
                filter.createdAt.$gte = new Date(from);
            if (to)
                filter.createdAt.$lte = new Date(to);
        }
        if (memberType) {
            filter.userType = memberType;
        }
        filter.$or = [
            { 'location.coordinates': { $exists: true, $ne: [] } },
            { address: { $exists: true, $ne: '' } }
        ];
        const users = await User_1.User.find(filter)
            .select('address location centerId createdAt userType')
            .lean();
        console.log(`📍 지리적 분포 조회: ${users.length}명의 회원 데이터 처리`);
        const centerIds = [...new Set(users.map(u => u.centerId).filter(Boolean))];
        const centers = await Center_1.default.find({ _id: { $in: centerIds } })
            .select('_id name')
            .lean();
        const centerMap = new Map(centers.map(c => [c._id.toString(), c.name]));
        const h3Map = new Map();
        for (const userItem of users) {
            let coords = null;
            if (userItem.location && userItem.location.coordinates && userItem.location.coordinates.length === 2) {
                coords = {
                    lng: userItem.location.coordinates[0],
                    lat: userItem.location.coordinates[1]
                };
                console.log('✅ GeoJSON 좌표 사용:', coords);
            }
            else if (userItem.address) {
                coords = await geocodeAddress(userItem.address);
                console.log('⚠️ 주소 → 지오코딩:', userItem.address, coords);
            }
            if (!coords)
                continue;
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
        const K_THRESHOLD = 5;
        let cells = Array.from(h3Map.values());
        const totalCells = cells.length;
        cells = cells.filter(cell => cell.count >= K_THRESHOLD);
        const filteredCells = cells.length;
        console.log(`🔒 k-익명성 필터링: ${totalCells}개 셀 → ${filteredCells}개 셀 (k≥${K_THRESHOLD})`);
        cells.forEach(cell => {
            cell.countApprox = addNoiseAndRound(cell.count, 1.0);
            delete cell.count;
            delete cell.centerCounts;
        });
        console.log(`📊 [GEO-AUDIT] User: ${user.userId}, Type: ${user.userType}, Filter: ${JSON.stringify({ centerId, from, to, memberType })}, Result: ${filteredCells} cells`);
        res.json({
            success: true,
            cells,
            metadata: {
                totalCells,
                filteredCells,
                k: K_THRESHOLD,
                privacyNotice: '본 데이터는 k-익명성(k≥5), 노이즈 주입, 5단위 반올림이 적용되었습니다.',
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