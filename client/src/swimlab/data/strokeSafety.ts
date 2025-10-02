/* src/swimlab/data/strokeSafety.ts */
export type Stroke =
  | 'freestyle' | 'backstroke' | 'breaststroke'
  | 'butterfly' | 'elementary_backstroke' | 'sidestroke';

export interface StrokeSafety {
  stroke: Stroke;
  pros: string[]; cons: string[]; cautions: string[];
  typicalUse: string[];
  evidenceKeys: string[];
}
export const STROKE_SAFETY: StrokeSafety[] = [
  { stroke:'freestyle',
    pros:['가장 효율적','호흡/거리 조절 쉬움'],
    cons:['목 회전/어깨 과사용 가능'],
    cautions:['경추 통증 시 스노클','어깨통증 시 패들 금지'],
    typicalUse:['지구력','템포','기술 전이'],
    evidenceKeys:['SWIMMERS_SHOULDER_SR_2020','LBP_AQUATIC_RCT_JAMA_2022'] },
  { stroke:'backstroke',
    pros:['경추/호흡 스트레스 낮음','중립척추 유지 용이'],
    cons:['등/어깨 유연성 요구','깃발 의존'],
    cautions:['허리 과신전 주의'],
    typicalUse:['회복','정렬','요통 관리'],
    evidenceKeys:['LBP_CPG_JOSPT_2021'] },
  { stroke:'breaststroke',
    pros:['상지 오버헤드 작음','킥 리듬·협응 훈련'],
    cons:['무릎/고관절 외회전·내전 부하'],
    cautions:['무릎/FAI 시 킥 범위 축소','발목염좌/아킬레스 시 회피'],
    typicalUse:['기술·리듬','하체 협응'],
    evidenceKeys:['MENISCUS_CPG_JOSPT_2018','FAIS_NONARTHRITIC_CPG_JOSPT_2023'] },
  { stroke:'butterfly',
    pros:['체간 파워/리듬','브레이크아웃 전이'],
    cons:['요추/어깨 부하 큼'],
    cautions:['요통/어깨통증 시 회피','돌핀킥 과다 금지'],
    typicalUse:['스피드','파워'],
    evidenceKeys:['SWIMMERS_SHOULDER_SR_2020'] },
  { stroke:'elementary_backstroke',
    pros:['저속·저충격','초심자/회복에 적합'],
    cons:['속도 낮음'],
    cautions:['과한 벌림 금지'],
    typicalUse:['재활','회복','통증기'],
    evidenceKeys:['AQUATIC_OA_CDSR_2016'] },
  { stroke:'sidestroke',
    pros:['호흡 자유','구조적으로 쉬움'],
    cons:['비대칭 부하'],
    cautions:['편측 반복 지양, 교대 사용'],
    typicalUse:['장시간 지속','입문'],
    evidenceKeys:['AQUATIC_OA_CDSR_2016'] }
];




