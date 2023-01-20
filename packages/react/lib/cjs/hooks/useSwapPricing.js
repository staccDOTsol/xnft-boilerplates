"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSwapPricing = void 0;
const react_1 = require("react");
const bondingPricing_1 = require("./bondingPricing");
const useTokenSwapFromId_1 = require("./useTokenSwapFromId");
class WrappedPricing {
    constructor({ pricing, childEntanglerMint, parentEntanglerMint, }) {
        this.pricing = pricing;
        this.childEntanglerMint = childEntanglerMint;
        this.parentEntanglerMint = parentEntanglerMint;
    }
    get hierarchy() {
        return this.pricing.hierarchy;
    }
    subEntangledMint(mint) {
        if (mint && mint.equals(this.parentEntanglerMint)) {
            return this.childEntanglerMint;
        }
        return mint;
    }
    current(baseMint, unixTime) {
        return this.pricing.current(this.subEntangledMint(baseMint), unixTime);
    }
    locked(baseMint) {
        return this.pricing.locked(this.subEntangledMint(baseMint || this.hierarchy.tokenBonding.baseMint));
    }
    swap(baseAmount, baseMint, targetMint, ignoreFrozen, unixTime) {
        return this.pricing.swap(baseAmount, this.subEntangledMint(baseMint), this.subEntangledMint(targetMint), ignoreFrozen, unixTime);
    }
    isBuying(lowMint, targetMint) {
        return this.pricing.isBuying(this.subEntangledMint(lowMint), this.subEntangledMint(targetMint));
    }
    swapTargetAmount(targetAmount, baseMint, targetMint, ignoreFreeze, unixTime) {
        return this.pricing.swapTargetAmount(targetAmount, this.subEntangledMint(baseMint), this.subEntangledMint(targetMint), ignoreFreeze, unixTime);
    }
    sellTargetAmount(targetAmountNum, baseMint, unixTime) {
        return this.pricing.sellTargetAmount(targetAmountNum, this.subEntangledMint(baseMint || this.hierarchy.tokenBonding.baseMint), unixTime);
    }
    buyTargetAmount(targetAmountNum, baseMint, unixTime) {
        return this.pricing.buyTargetAmount(targetAmountNum, this.subEntangledMint(baseMint || this.hierarchy.tokenBonding.baseMint), unixTime);
    }
    buyWithBaseAmount(baseAmountNum, baseMint, unixTime) {
        return this.pricing.buyWithBaseAmount(baseAmountNum, this.subEntangledMint(baseMint || this.hierarchy.tokenBonding.baseMint), unixTime);
    }
}
function useSwapPricing(id) {
    const _a = (0, useTokenSwapFromId_1.useTokenSwapFromId)(id), { tokenBonding, childEntangler, parentEntangler } = _a, rest1 = __rest(_a, ["tokenBonding", "childEntangler", "parentEntangler"]);
    const _b = (0, bondingPricing_1.useBondingPricing)(tokenBonding === null || tokenBonding === void 0 ? void 0 : tokenBonding.publicKey), { pricing } = _b, rest = __rest(_b, ["pricing"]);
    const newPricing = (0, react_1.useMemo)(() => {
        if (pricing && childEntangler && parentEntangler) {
            return new WrappedPricing({
                pricing,
                childEntanglerMint: childEntangler === null || childEntangler === void 0 ? void 0 : childEntangler.childMint,
                parentEntanglerMint: parentEntangler === null || parentEntangler === void 0 ? void 0 : parentEntangler.parentMint,
            });
        }
        return pricing;
    }, [pricing, childEntangler, parentEntangler]);
    return Object.assign(Object.assign(Object.assign({ tokenBonding,
        childEntangler,
        parentEntangler, pricing: newPricing }, rest1), rest), { loading: rest1.loading, pricingLoading: rest.loading });
}
exports.useSwapPricing = useSwapPricing;
//# sourceMappingURL=useSwapPricing.js.map