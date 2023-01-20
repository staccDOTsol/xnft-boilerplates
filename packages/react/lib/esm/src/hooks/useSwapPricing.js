import { useMemo } from "react";
import { useBondingPricing } from "./bondingPricing";
import { useTokenSwapFromId } from "./useTokenSwapFromId";
class WrappedPricing {
    pricing;
    childEntanglerMint;
    parentEntanglerMint;
    get hierarchy() {
        return this.pricing.hierarchy;
    }
    constructor({ pricing, childEntanglerMint, parentEntanglerMint, }) {
        this.pricing = pricing;
        this.childEntanglerMint = childEntanglerMint;
        this.parentEntanglerMint = parentEntanglerMint;
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
export function useSwapPricing(id) {
    const { tokenBonding, childEntangler, parentEntangler, ...rest1 } = useTokenSwapFromId(id);
    const { pricing, ...rest } = useBondingPricing(tokenBonding?.publicKey);
    const newPricing = useMemo(() => {
        if (pricing && childEntangler && parentEntangler) {
            return new WrappedPricing({
                pricing,
                childEntanglerMint: childEntangler?.childMint,
                parentEntanglerMint: parentEntangler?.parentMint,
            });
        }
        return pricing;
    }, [pricing, childEntangler, parentEntangler]);
    return {
        tokenBonding,
        childEntangler,
        parentEntangler,
        pricing: newPricing,
        ...rest1,
        ...rest,
        loading: rest1.loading,
        pricingLoading: rest.loading,
    };
}
//# sourceMappingURL=useSwapPricing.js.map