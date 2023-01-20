import BN from "bn.js";
export interface ITransitionFee {
    percentage: number;
    interval: number;
}
export type ExponentialCurveV0 = {
    c: BN;
    b: BN;
    pow: number;
    frac: number;
};
export type TimeDecayExponentialCurveV0 = {
    c: BN;
    k0: BN;
    k1: BN;
    d: BN;
    interval: number;
};
export declare function fromCurve(curve: any, baseAmount: number, targetSupply: number, goLiveUnixTime: number): IPricingCurve;
export interface IPricingCurve {
    current(unixTime?: number, baseRoyaltiesPercent?: number, targetRoyaltiesPercent?: number): number;
    locked(): number;
    sellTargetAmount(targetAmountNum: number, baseRoyaltiesPercent: number, targetRoyaltiesPercent: number, unixTime?: number): number;
    buyTargetAmount(targetAmountNum: number, baseRoyaltiesPercent: number, targetRoyaltiesPercent: number, unixTime?: number): number;
    buyWithBaseAmount(baseAmountNum: number, baseRoyaltiesPercent: number, targetRoyaltiesPercent: number, unixTime?: number): number;
}
type TimeCurveArgs = {
    curve: any;
    baseAmount: number;
    targetSupply: number;
    goLiveUnixTime: number;
};
interface ITimeCurveItem {
    subCurve: IPricingCurve;
    offset: number;
    buyTransitionFees: ITransitionFee | null;
    sellTransitionFees: ITransitionFee | null;
}
export declare class TimeCurve implements IPricingCurve {
    curve: any;
    baseAmount: number;
    targetSupply: number;
    goLiveUnixTime: number;
    constructor({ curve, baseAmount, targetSupply, goLiveUnixTime, }: TimeCurveArgs);
    currentCurve(unixTime?: number): ITimeCurveItem;
    current(unixTime?: number, baseRoyaltiesPercent?: number, targetRoyaltiesPercent?: number): number;
    locked(): number;
    sellTargetAmount(targetAmountNum: number, baseRoyaltiesPercent: number, targetRoyaltiesPercent: number, unixTime?: number): number;
    buyTargetAmount(targetAmountNum: number, baseRoyaltiesPercent: number, targetRoyaltiesPercent: number, unixTime?: number): number;
    buyWithBaseAmount(baseAmountNum: number, baseRoyaltiesPercent: number, targetRoyaltiesPercent: number, unixTime?: number): number;
}
export declare abstract class BaseExponentialCurve implements IPricingCurve {
    c: number;
    baseAmount: number;
    targetSupply: number;
    goLiveUnixTime: number;
    abstract k(timeElapsed: number): number;
    abstract get b(): number;
    constructor(c: number, baseAmount: number, targetSupply: number, goLiveUnixTime: number);
    current(unixTime?: number, baseRoyaltiesPercent?: number, targetRoyaltiesPercent?: number): number;
    locked(): number;
    changeInTargetAmount(targetAmountNum: number, baseRoyaltiesPercent: number, targetRoyaltiesPercent: number, unixTime?: number): number;
    sellTargetAmount(targetAmountNum: number, baseRoyaltiesPercent: number, targetRoyaltiesPercent: number, unixTime?: number): number;
    buyTargetAmount(targetAmountNum: number, baseRoyaltiesPercent: number, targetRoyaltiesPercent: number, unixTime?: number): number;
    buyWithBaseAmount(baseAmountNum: number, baseRoyaltiesPercent: number, targetRoyaltiesPercent: number, unixTime?: number): number;
}
export declare class ExponentialCurve extends BaseExponentialCurve {
    b: number;
    _k: number;
    pow: number;
    frac: number;
    k(_?: number): number;
    constructor(curve: ExponentialCurveV0, baseAmount: number, targetSupply: number, goLiveUnixTime?: number);
}
export declare class TimeDecayExponentialCurve extends BaseExponentialCurve {
    b: number;
    k0: number;
    k1: number;
    d: number;
    interval: number;
    k(timeElapsed: number): number;
    constructor(curve: TimeDecayExponentialCurveV0, baseAmount: number, targetSupply: number, goLiveUnixTime: number);
}
export {};
//# sourceMappingURL=curves.d.ts.map