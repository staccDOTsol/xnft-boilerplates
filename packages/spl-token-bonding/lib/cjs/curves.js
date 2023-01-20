"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeDecayExponentialCurve = exports.ExponentialCurve = exports.BaseExponentialCurve = exports.TimeCurve = exports.fromCurve = void 0;
const utils_1 = require("./utils");
function fromCurve(curve, baseAmount, targetSupply, goLiveUnixTime) {
    switch (Object.keys(curve.definition)[0]) {
        case "timeV0":
            return new TimeCurve({
                curve,
                baseAmount,
                targetSupply,
                goLiveUnixTime,
            });
    }
    throw new Error("Curve not found");
}
exports.fromCurve = fromCurve;
function transitionFeesToPercent(offset, fees) {
    if (!fees) {
        return 0;
    }
    if (offset > fees.interval) {
        return 0;
    }
    return ((0, utils_1.asDecimal)(fees.percentage) * ((fees.interval - offset) / fees.interval));
}
function now() {
    return new Date().valueOf() / 1000;
}
class TimeCurve {
    constructor({ curve, baseAmount, targetSupply, goLiveUnixTime, }) {
        this.curve = curve;
        this.baseAmount = baseAmount;
        this.targetSupply = targetSupply;
        this.goLiveUnixTime = goLiveUnixTime;
    }
    currentCurve(unixTime = now()) {
        let subCurve;
        if (unixTime < this.goLiveUnixTime) {
            subCurve = this.curve.definition.timeV0.curves[0];
        }
        else {
            subCurve = [...this.curve.definition.timeV0.curves]
                .reverse()
                .find((c) => unixTime >= this.goLiveUnixTime + c.offset.toNumber());
        }
        return {
            subCurve: subCurve.curve.exponentialCurveV0
                ? new ExponentialCurve(subCurve.curve.exponentialCurveV0, this.baseAmount, this.targetSupply, this.goLiveUnixTime + subCurve.offset.toNumber())
                : new TimeDecayExponentialCurve(subCurve.curve
                    .timeDecayExponentialCurveV0, this.baseAmount, this.targetSupply, this.goLiveUnixTime + subCurve.offset.toNumber()),
            offset: subCurve.offset.toNumber(),
            buyTransitionFees: subCurve.buyTransitionFees,
            sellTransitionFees: subCurve.sellTransitionFees,
        };
    }
    current(unixTime = now(), baseRoyaltiesPercent = 0, targetRoyaltiesPercent = 0) {
        const { subCurve, buyTransitionFees, offset } = this.currentCurve(unixTime);
        return (subCurve.current(unixTime, baseRoyaltiesPercent, targetRoyaltiesPercent) *
            (1 - transitionFeesToPercent(unixTime - offset, buyTransitionFees)));
    }
    locked() {
        return this.currentCurve().subCurve.locked();
    }
    sellTargetAmount(targetAmountNum, baseRoyaltiesPercent, targetRoyaltiesPercent, unixTime = now()) {
        const { subCurve, sellTransitionFees, offset } = this.currentCurve(unixTime);
        const price = subCurve.sellTargetAmount(targetAmountNum, baseRoyaltiesPercent, targetRoyaltiesPercent, unixTime);
        return (price *
            (1 -
                transitionFeesToPercent(unixTime - this.goLiveUnixTime - offset, sellTransitionFees)));
    }
    buyTargetAmount(targetAmountNum, baseRoyaltiesPercent, targetRoyaltiesPercent, unixTime = now()) {
        const { subCurve, buyTransitionFees, offset } = this.currentCurve(unixTime);
        const price = subCurve.buyTargetAmount(targetAmountNum, baseRoyaltiesPercent, targetRoyaltiesPercent, unixTime);
        return (price *
            (1 +
                transitionFeesToPercent(unixTime - this.goLiveUnixTime - offset, buyTransitionFees)));
    }
    buyWithBaseAmount(baseAmountNum, baseRoyaltiesPercent, targetRoyaltiesPercent, unixTime = now()) {
        const { subCurve, buyTransitionFees, offset } = this.currentCurve(unixTime);
        const baseAmountPostFees = baseAmountNum *
            (1 -
                transitionFeesToPercent(unixTime - this.goLiveUnixTime - offset, buyTransitionFees));
        return subCurve.buyWithBaseAmount(baseAmountPostFees, baseRoyaltiesPercent, targetRoyaltiesPercent);
    }
}
exports.TimeCurve = TimeCurve;
class BaseExponentialCurve {
    constructor(c, baseAmount, targetSupply, goLiveUnixTime) {
        this.c = c;
        this.baseAmount = baseAmount;
        this.targetSupply = targetSupply;
        this.goLiveUnixTime = goLiveUnixTime;
    }
    current(unixTime, baseRoyaltiesPercent = 0, targetRoyaltiesPercent = 0) {
        return this.changeInTargetAmount(1, baseRoyaltiesPercent, targetRoyaltiesPercent, unixTime);
    }
    locked() {
        return this.baseAmount;
    }
    changeInTargetAmount(targetAmountNum, baseRoyaltiesPercent, targetRoyaltiesPercent, unixTime = now()) {
        const R = this.baseAmount;
        const S = this.targetSupply;
        const k = this.k(unixTime - this.goLiveUnixTime);
        // Calculate with the actual target amount they will need to get the target amount after royalties
        const dS = targetAmountNum * (1 / (1 - (0, utils_1.asDecimal)(targetRoyaltiesPercent)));
        if (R == 0 || S == 0) {
            // b dS + (c dS^(1 + k))/(1 + k)
            return ((this.b * dS + (this.c * Math.pow(dS, 1 + k)) / (1 + k)) *
                (1 / (1 - (0, utils_1.asDecimal)(baseRoyaltiesPercent))));
        }
        else {
            if (this.b == 0 && this.c != 0) {
                /*
                  (R / S^(1 + k)) ((S + dS)(S + dS)^k - S^(1 + k))
                */
                return ((R / Math.pow(S, 1 + k)) *
                    ((S + dS) * Math.pow(S + dS, k) - Math.pow(S, 1 + k)) *
                    (1 / (1 - (0, utils_1.asDecimal)(baseRoyaltiesPercent))));
            }
            else if (this.c == 0) {
                // R dS / S
                return ((R * dS) / S) * (1 / (1 - (0, utils_1.asDecimal)(baseRoyaltiesPercent)));
            }
            else {
                throw new Error("Cannot convert base amount to target amount when both b and k are defined on an exponential curve. The math is too hard");
            }
        }
    }
    sellTargetAmount(targetAmountNum, baseRoyaltiesPercent, targetRoyaltiesPercent, unixTime = now()) {
        return (-this.changeInTargetAmount(-targetAmountNum * (1 - (0, utils_1.asDecimal)(targetRoyaltiesPercent)), 0, 0, unixTime) *
            (1 - (0, utils_1.asDecimal)(baseRoyaltiesPercent)));
    }
    buyTargetAmount(targetAmountNum, baseRoyaltiesPercent, targetRoyaltiesPercent, unixTime = now()) {
        return this.changeInTargetAmount(targetAmountNum, baseRoyaltiesPercent, targetRoyaltiesPercent, unixTime);
    }
    buyWithBaseAmount(baseAmountNum, baseRoyaltiesPercent, targetRoyaltiesPercent, unixTime = now()) {
        const k = this.k(unixTime - this.goLiveUnixTime);
        const dR = baseAmountNum * (1 - (0, utils_1.asDecimal)(baseRoyaltiesPercent));
        if (this.baseAmount == 0 || this.targetSupply == 0) {
            if (this.b == 0) {
                /*
                 * -S + (((1 + k) dR)/c)^(1/(1 + k))
                 */
                return ((Math.pow(((1 + k) * dR) / this.c, 1 / (1 + k)) - this.targetSupply) *
                    (1 - (0, utils_1.asDecimal)(targetRoyaltiesPercent)));
            }
            else if (this.c == 0) {
                if (this.baseAmount == 0) {
                    return (dR / this.b) * (1 - (0, utils_1.asDecimal)(targetRoyaltiesPercent));
                }
                else {
                    return (((this.targetSupply * dR) / this.baseAmount) *
                        (1 - (0, utils_1.asDecimal)(targetRoyaltiesPercent)));
                }
            }
            throw new Error("Cannot convert base amount to target amount when both b and k are defined on an exponential curve. The math is too hard");
        }
        else {
            const R = this.baseAmount;
            const S = this.targetSupply;
            if (this.b == 0) {
                /*
                 * dS = -S + ((S^(1 + k) (R + dR))/R)^(1/(1 + k))
                 */
                return ((-S + Math.pow((Math.pow(S, 1 + k) * (R + dR)) / R, 1 / (1 + k))) *
                    (1 - (0, utils_1.asDecimal)(targetRoyaltiesPercent)));
            }
            else if (this.c == 0) {
                // dS = S dR / R
                return ((S * dR) / R) * (1 - (0, utils_1.asDecimal)(targetRoyaltiesPercent));
            }
            else {
                throw new Error("Cannot convert base amount to target amount when both b and k are defined on an exponential curve. The math is too hard");
            }
        }
    }
}
exports.BaseExponentialCurve = BaseExponentialCurve;
class ExponentialCurve extends BaseExponentialCurve {
    k(_ = now()) {
        return this._k;
    }
    constructor(curve, baseAmount, targetSupply, goLiveUnixTime = now()) {
        super(+curve.c.toString() / 1000000000000, baseAmount, targetSupply, goLiveUnixTime);
        this.b = +curve.b.toString() / 1000000000000;
        this._k = curve.pow / curve.frac;
        this.pow = curve.pow;
        this.frac = curve.frac;
        this.baseAmount = baseAmount;
        this.targetSupply = targetSupply;
    }
}
exports.ExponentialCurve = ExponentialCurve;
class TimeDecayExponentialCurve extends BaseExponentialCurve {
    k(timeElapsed) {
        const ret = this.k0 -
            (this.k0 - this.k1) *
                Math.min(Math.pow(timeElapsed / this.interval, this.d), 1);
        return ret;
    }
    constructor(curve, baseAmount, targetSupply, goLiveUnixTime) {
        super(+curve.c.toString() / 1000000000000, baseAmount, targetSupply, goLiveUnixTime);
        this.b = 0;
        this.k1 = +curve.k1.toString() / 1000000000000;
        this.k0 = +curve.k0.toString() / 1000000000000;
        this.d = +curve.d.toString() / 1000000000000;
        this.interval = curve.interval;
        this.baseAmount = baseAmount;
        this.targetSupply = targetSupply;
    }
}
exports.TimeDecayExponentialCurve = TimeDecayExponentialCurve;
//# sourceMappingURL=curves.js.map