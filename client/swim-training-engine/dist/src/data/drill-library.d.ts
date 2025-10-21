/**
 * 🏊‍♂️ JJ Swim Lab — Drills & Training Types Library (v1)
 * 목적
 *  - 드릴/훈련종류를 전문가 수준으로 체계화하고, 어디에 도움이 되는지 '도움말'까지 제공
 *  - 25m/50m 풀 모두에서 바로 쓰기 좋게 권장 랩수·레스트·존을 포함
 *  - 네가 커스터마이즈(추가/수정)할 수 있도록 확장 API 제공
 *
 * 통합: swim-planner.v2.ts 와 함께 사용하면, 세션 빌드 시 추천 드릴/훈련을 주입 가능
 */
export type Stroke = 'freestyle' | 'backstroke' | 'breaststroke' | 'butterfly' | 'elementary_backstroke' | 'sidestroke';
export type IntensityZone = 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5';
export type SkillTarget = '스트림라인/자세' | '롤링/체간' | '캐치/물잡기' | '풀/프레스' | '킥/리듬' | '호흡/하이폭식' | '타이밍/조합' | '회전/턴' | '스타트/브레이크아웃' | '시야/오픈워터' | '근지구력' | '스프린트 신경';
export interface Drill {
    id: string;
    name: string;
    strokes: Stroke[];
    skillTargets: SkillTarget[];
    typicalUse: {
        zones: IntensityZone[];
        repLaps25: number[];
        repLaps50: number[];
        restSec: [number, number];
    };
    helps: string[];
    cues: string[];
    cautions?: string[];
}
export interface TrainingType {
    id: string;
    name: string;
    goals: string[];
    zones: IntensityZone[];
    restSec: [number, number];
    repPatterns25: string[];
    repPatterns50: string[];
    metrics: string[];
    goodFor?: string[];
    cautions?: string[];
    recommendedDrills?: string[];
}
export declare const DRILLS: Drill[];
export declare const TRAININGS: TrainingType[];
export declare function listDrillsByStroke(stroke: Stroke): Drill[];
export declare function listDrillsBySkill(target: SkillTarget): Drill[];
export declare function listTrainingTypes(): TrainingType[];
export declare function getHelp(kind: 'drill' | 'training', id: string): string;
export declare function addDrill(newDrill: Drill): void;
export declare function addTrainingType(newType: TrainingType): void;
//# sourceMappingURL=drill-library.d.ts.map