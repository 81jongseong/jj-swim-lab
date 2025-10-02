import { HealthInput, SwimLevel } from '../types';
export declare const WHO_BASE: {
    mod_min: number;
    mod_max: number;
    vig_min: number;
    vig_max: number;
};
export declare function medicalClearanceNeeded(i: HealthInput): boolean;
export declare function weeklyDoseMinutes(i: HealthInput): number;
export declare function levelSessionRange(level: SwimLevel): [number, number];
export declare function rpePrimary(): string;
export declare function hrSecondary(i: HealthInput): string | undefined;
export declare const BP_STOP_RULE = "SBP\u2265250 or DBP\u2265115(\uC989\uC2DC \uC911\uC9C0)";
//# sourceMappingURL=health-policy.d.ts.map