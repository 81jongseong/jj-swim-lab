import { Router, Request, Response } from 'express';
import { SwimmingCenter } from '../models/SwimmingCenter';

const router: Router = Router();

// 모든 수영장 목록 조회 (게스트용)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;
    
    let query: any = { isActive: true };
    
    // 위치 기반 검색
    if (latitude && longitude) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude as string), parseFloat(latitude as string)]
          },
          $maxDistance: parseFloat(radius as string) * 1000 // 미터 단위
        }
      };
    }
    
    const centers = await SwimmingCenter.find(query)
      .select('name address location phone facilities operatingHours pricing currentCapacity maxCapacity images')
      .limit(50);
    
    res.json(centers);
  } catch (error) {
    console.error('수영장 목록 조회 오류:', error);
    res.status(500).json({ error: '수영장 목록을 불러오는데 실패했습니다.' });
  }
});

// 특정 수영장 상세 정보 조회
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const center = await SwimmingCenter.findById(req.params.id)
      .populate('courses', 'name description level price schedule')
      .populate('instructors', 'name experience specialties');
    
    if (!center) {
      return res.status(404).json({ error: '수영장을 찾을 수 없습니다.' });
    }
    
    res.json(center);
  } catch (error) {
    console.error('수영장 상세 정보 조회 오류:', error);
    res.status(500).json({ error: '수영장 정보를 불러오는데 실패했습니다.' });
  }
});

// 수영장 운영 시간 조회
router.get('/:id/hours', async (req: Request, res: Response) => {
  try {
    const center = await SwimmingCenter.findById(req.params.id)
      .select('operatingHours');
    
    if (!center) {
      return res.status(404).json({ error: '수영장을 찾을 수 없습니다.' });
    }
    
    res.json(center.operatingHours);
  } catch (error) {
    console.error('운영 시간 조회 오류:', error);
    res.status(500).json({ error: '운영 시간을 불러오는데 실패했습니다.' });
  }
});

// 수영장 요금 정보 조회
router.get('/:id/pricing', async (req: Request, res: Response) => {
  try {
    const center = await SwimmingCenter.findById(req.params.id)
      .select('pricing');
    
    if (!center) {
      return res.status(404).json({ error: '수영장을 찾을 수 없습니다.' });
    }
    
    res.json(center.pricing);
  } catch (error) {
    console.error('요금 정보 조회 오류:', error);
    res.status(500).json({ error: '요금 정보를 불러오는데 실패했습니다.' });
  }
});

// 수영장 시설 정보 조회
router.get('/:id/facilities', async (req: Request, res: Response) => {
  try {
    const center = await SwimmingCenter.findById(req.params.id)
      .select('facilities');
    
    if (!center) {
      return res.status(404).json({ error: '수영장을 찾을 수 없습니다.' });
    }
    
    res.json(center.facilities);
  } catch (error) {
    console.error('시설 정보 조회 오류:', error);
    res.status(500).json({ error: '시설 정보를 불러오는데 실패했습니다.' });
  }
});

// 현재 입장 인원 업데이트 (실시간)
router.patch('/:id/capacity', async (req: Request, res: Response) => {
  try {
    const { currentCapacity } = req.body;
    
    const center = await SwimmingCenter.findByIdAndUpdate(
      req.params.id,
      { currentCapacity },
      { new: true }
    ).select('currentCapacity maxCapacity');
    
    if (!center) {
      return res.status(404).json({ error: '수영장을 찾을 수 없습니다.' });
    }
    
    res.json({
      currentCapacity: center.currentCapacity,
      maxCapacity: center.maxCapacity,
      occupancyRate: Math.round((center.currentCapacity / center.maxCapacity) * 100)
    });
  } catch (error) {
    console.error('입장 인원 업데이트 오류:', error);
    res.status(500).json({ error: '입장 인원 업데이트에 실패했습니다.' });
  }
});

export default router; 