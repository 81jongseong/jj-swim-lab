"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Product_1 = __importDefault(require("../models/Product"));
const Center_1 = __importDefault(require("../models/Center"));
const User_1 = require("../models/User");
async function createSampleProducts() {
    try {
        require('dotenv').config();
        await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a.mongodb.net/jjswimlab?retryWrites=true&w=majority');
        console.log('✅ MongoDB 연결 성공');
        let center = await Center_1.default.findOne();
        if (!center) {
            center = new Center_1.default({
                name: 'JJ 수영학원',
                address: '서울시 강남구 테헤란로 123',
                phone: '02-1234-5678',
                email: 'info@jjswim.com',
                description: '전문 수영 교육 센터',
                facilities: ['25m 풀', '어린이 풀', '사우나', '락커룸'],
                operatingHours: {
                    weekdays: '06:00-22:00',
                    weekends: '08:00-20:00'
                },
                status: 'active'
            });
            await center.save();
            console.log('✅ 센터 생성 완료');
        }
        let admin = await User_1.User.findOne({ userType: 'superAdmin' });
        if (!admin) {
            admin = new User_1.User({
                userId: 'admin',
                name: '시스템 관리자',
                email: 'admin@jjswim.com',
                password: 'hashed_password',
                userType: 'superAdmin',
                centerId: center._id,
                status: 'active'
            });
            await admin.save();
            console.log('✅ 관리자 사용자 생성 완료');
        }
        await Product_1.default.deleteMany({});
        console.log('✅ 기존 상품 삭제 완료');
        const sampleProducts = [
            {
                name: '수영복 (남성용)',
                description: '편안하고 내구성이 뛰어난 남성용 수영복입니다.',
                price: 45000,
                originalPrice: 60000,
                category: 'wear',
                subCategory: 'men',
                brand: 'Speedo',
                sku: 'SWM001',
                stock: 50,
                minStock: 10,
                maxStock: 100,
                status: 'active',
                images: ['https://example.com/swimsuit1.jpg'],
                tags: ['수영복', '남성', 'Speedo', '편안함'],
                specifications: {
                    weight: 0.3,
                    dimensions: { length: 80, width: 40, height: 2 },
                    material: '폴리에스터',
                    color: '네이비',
                    size: 'L'
                },
                isDigital: false,
                isPhysical: true,
                shippingRequired: true,
                centerId: center._id,
                createdBy: admin._id
            },
            {
                name: '수영복 (여성용)',
                description: '세련된 디자인의 여성용 수영복입니다.',
                price: 55000,
                originalPrice: 70000,
                category: 'wear',
                subCategory: 'women',
                brand: 'Arena',
                sku: 'SWW001',
                stock: 30,
                minStock: 5,
                maxStock: 80,
                status: 'active',
                images: ['https://example.com/swimsuit2.jpg'],
                tags: ['수영복', '여성', 'Arena', '세련됨'],
                specifications: {
                    weight: 0.25,
                    dimensions: { length: 75, width: 35, height: 2 },
                    material: '폴리우레탄',
                    color: '블랙',
                    size: 'M'
                },
                isDigital: false,
                isPhysical: true,
                shippingRequired: true,
                centerId: center._id,
                createdBy: admin._id
            },
            {
                name: '수영 고글',
                description: '안개 방지 기능이 있는 고성능 수영 고글입니다.',
                price: 25000,
                originalPrice: 35000,
                category: 'gear',
                subCategory: 'goggles',
                brand: 'TYR',
                sku: 'GOG001',
                stock: 100,
                minStock: 20,
                maxStock: 200,
                status: 'active',
                images: ['https://example.com/goggles1.jpg'],
                tags: ['고글', '안개방지', 'TYR', '고성능'],
                specifications: {
                    weight: 0.1,
                    dimensions: { length: 15, width: 8, height: 4 },
                    material: '실리콘',
                    color: '투명',
                    size: 'One Size'
                },
                isDigital: false,
                isPhysical: true,
                shippingRequired: true,
                centerId: center._id,
                createdBy: admin._id
            },
            {
                name: '수영 모자',
                description: '머리카락 보호와 수력 저항 감소를 위한 수영 모자입니다.',
                price: 15000,
                originalPrice: 20000,
                category: 'gear',
                subCategory: 'cap',
                brand: 'Speedo',
                sku: 'CAP001',
                stock: 80,
                minStock: 15,
                maxStock: 150,
                status: 'active',
                images: ['https://example.com/cap1.jpg'],
                tags: ['모자', '머리보호', 'Speedo', '수력저항'],
                specifications: {
                    weight: 0.05,
                    dimensions: { length: 25, width: 20, height: 1 },
                    material: '실리콘',
                    color: '실버',
                    size: 'One Size'
                },
                isDigital: false,
                isPhysical: true,
                shippingRequired: true,
                centerId: center._id,
                createdBy: admin._id
            },
            {
                name: '수영 수건',
                description: '빠른 건조와 부드러운 촉감의 수영 전용 수건입니다.',
                price: 20000,
                originalPrice: 25000,
                category: 'gear',
                subCategory: 'towel',
                brand: 'Arena',
                sku: 'TWL001',
                stock: 60,
                minStock: 10,
                maxStock: 120,
                status: 'active',
                images: ['https://example.com/towel1.jpg'],
                tags: ['수건', '빠른건조', 'Arena', '부드러움'],
                specifications: {
                    weight: 0.4,
                    dimensions: { length: 100, width: 60, height: 1 },
                    material: '마이크로파이버',
                    color: '화이트',
                    size: 'Large'
                },
                isDigital: false,
                isPhysical: true,
                shippingRequired: true,
                centerId: center._id,
                createdBy: admin._id
            }
        ];
        for (const productData of sampleProducts) {
            const product = new Product_1.default(productData);
            await product.save();
            console.log(`✅ 상품 생성 완료: ${product.name}`);
        }
        console.log('🎉 모든 샘플 상품 생성 완료!');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ 오류 발생:', error);
        process.exit(1);
    }
}
createSampleProducts();
//# sourceMappingURL=createSampleProducts.js.map