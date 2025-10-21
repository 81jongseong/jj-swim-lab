/**
 * JJ Swim Lab: 페이스 변환 및 훈련존 계산
 */
import { Zone, PaceInputs } from './types';
export declare function resolveBasePace(p: PaceInputs): number;
export declare function zonePace(css: number): Record<Zone, [number, number]>;
export declare function getPaceRange(zone: Zone, css: number): [number, number];
export declare function calculateZoneDistribution(totalMeters: number, zones: Record<Zone, [number, number]>): Record<Zone, number>;
export declare function formatPaceNote(pace: number, zone: Zone): string;
export declare function calculateRestTime(intensity: Zone, distance: number): number;
export declare function adjustPaceByRPE(basePace: number, rpe: number): number;
//# sourceMappingURL=pace.d.ts.map