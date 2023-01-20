"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BondingPricing = void 0;
const spl_token_1 = require("@solana/spl-token");
/**
 * Traverse a bonding hierarchy, executing func and accumulating
 * the results until destination token
 *
 * @param param0
 * @returns
 */
function reduce({ hierarchy, func, initial, destination, wrappedSolMint, }) {
    var _a;
    if (!hierarchy ||
        ((_a = hierarchy.child) === null || _a === void 0 ? void 0 : _a.tokenBonding.baseMint.equals(destination))) {
        return initial;
    }
    if (destination === null || destination === void 0 ? void 0 : destination.equals(spl_token_1.NATIVE_MINT)) {
        destination = wrappedSolMint;
    }
    let current = hierarchy;
    let value = func(initial, current);
    while (!current.tokenBonding.baseMint.equals(destination)) {
        current = current.parent;
        if (!current) {
            throw new Error(`Base mint ${destination.toBase58()} is not in the hierarchy for ${hierarchy.tokenBonding.publicKey.toBase58()}`);
        }
        value = func(value, current);
    }
    return value;
}
/**
 * Traverse a bonding hierarchy, executing func and accumulating
 * the results until destination token starting from parent going to children
 *
 * @param param0
 * @returns
 */
function reduceFromParent({ hierarchy, func, initial, destination, wrappedSolMint, }) {
    if (!hierarchy) {
        return initial;
    }
    if (destination === null || destination === void 0 ? void 0 : destination.equals(spl_token_1.NATIVE_MINT)) {
        destination = wrappedSolMint;
    }
    let current = hierarchy;
    while (!current.tokenBonding.baseMint.equals(destination)) {
        current = current.parent;
        if (!current) {
            throw new Error(`Base mint ${destination.toBase58()} is not in the hierarchy for ${hierarchy.tokenBonding.publicKey.toBase58()}`);
        }
    }
    destination = hierarchy.tokenBonding.targetMint;
    let value = func(initial, current);
    while (!current.tokenBonding.targetMint.equals(destination)) {
        current = current.child;
        value = func(value, current);
    }
    return value;
}
function now() {
    return new Date().valueOf() / 1000;
}
class BondingPricing {
    constructor(args) {
        this.hierarchy = args.hierarchy;
    }
    current(baseMint, unixTime) {
        return reduce({
            hierarchy: this.hierarchy,
            func: (acc, current) => {
                return (acc *
                    current.pricingCurve.current(unixTime || now(), current.tokenBonding.buyBaseRoyaltyPercentage, current.tokenBonding.buyTargetRoyaltyPercentage));
            },
            initial: 1,
            destination: baseMint || this.hierarchy.tokenBonding.baseMint,
            wrappedSolMint: this.hierarchy.wrappedSolMint,
        });
    }
    locked(baseMint) {
        return reduce({
            hierarchy: this.hierarchy.parent,
            func: (acc, current) => {
                return (acc *
                    current.pricingCurve.current(now(), current.tokenBonding.buyBaseRoyaltyPercentage, current.tokenBonding.buyTargetRoyaltyPercentage));
            },
            initial: this.hierarchy.pricingCurve.locked(),
            destination: baseMint || this.hierarchy.tokenBonding.baseMint,
            wrappedSolMint: this.hierarchy.wrappedSolMint,
        });
    }
    swap(baseAmount, baseMint, targetMint, ignoreFrozen = false, unixTime) {
        const lowMint = this.hierarchy.lowest(baseMint, targetMint);
        const highMint = this.hierarchy.highest(baseMint, targetMint);
        const isBuying = this.isBuying(lowMint, targetMint);
        const path = this.hierarchy.path(lowMint, highMint, ignoreFrozen);
        if (path.length == 0) {
            throw new Error(`No path from ${baseMint} to ${targetMint}`);
        }
        if (isBuying) {
            return path.reverse().reduce((amount, { pricingCurve, tokenBonding }) => {
                return pricingCurve.buyWithBaseAmount(amount, tokenBonding.buyBaseRoyaltyPercentage, tokenBonding.buyTargetRoyaltyPercentage, unixTime);
            }, baseAmount);
        }
        else {
            return path.reduce((amount, { pricingCurve, tokenBonding }) => {
                return pricingCurve.sellTargetAmount(amount, tokenBonding.sellBaseRoyaltyPercentage, tokenBonding.sellTargetRoyaltyPercentage, unixTime);
            }, baseAmount);
        }
    }
    isBuying(lowMint, targetMint) {
        return lowMint.equals(targetMint);
    }
    swapTargetAmount(targetAmount, baseMint, targetMint, 
    /** Ignore frozen curves, just compute the value. */
    ignoreFreeze = false, unixTime) {
        const lowMint = this.hierarchy.lowest(baseMint, targetMint);
        const highMint = this.hierarchy.highest(baseMint, targetMint);
        const isBuying = this.isBuying(lowMint, targetMint);
        const path = this.hierarchy.path(lowMint, highMint, ignoreFreeze);
        if (path.length == 0) {
            throw new Error(`No path from ${baseMint} to ${targetMint}`);
        }
        return isBuying
            ? path.reverse().reduce((amount, { pricingCurve, tokenBonding }) => {
                return pricingCurve.buyWithBaseAmount(-amount, tokenBonding.sellBaseRoyaltyPercentage, tokenBonding.sellTargetRoyaltyPercentage, unixTime);
            }, targetAmount)
            : path.reverse().reduce((amount, { pricingCurve, tokenBonding }) => {
                return pricingCurve.buyTargetAmount(amount, tokenBonding.buyBaseRoyaltyPercentage, tokenBonding.buyTargetRoyaltyPercentage, unixTime);
            }, targetAmount);
    }
    sellTargetAmount(targetAmountNum, baseMint, unixTime) {
        return reduce({
            hierarchy: this.hierarchy,
            func: (acc, current) => {
                return current.pricingCurve.sellTargetAmount(acc, current.tokenBonding.sellBaseRoyaltyPercentage, current.tokenBonding.sellTargetRoyaltyPercentage, unixTime);
            },
            initial: targetAmountNum,
            destination: baseMint || this.hierarchy.tokenBonding.baseMint,
            wrappedSolMint: this.hierarchy.wrappedSolMint,
        });
    }
    buyTargetAmount(targetAmountNum, baseMint, unixTime) {
        return reduce({
            hierarchy: this.hierarchy,
            func: (acc, current) => {
                return current.pricingCurve.buyTargetAmount(acc, current.tokenBonding.buyBaseRoyaltyPercentage, current.tokenBonding.buyTargetRoyaltyPercentage, unixTime);
            },
            initial: targetAmountNum,
            destination: baseMint || this.hierarchy.tokenBonding.baseMint,
            wrappedSolMint: this.hierarchy.wrappedSolMint,
        });
    }
    buyWithBaseAmount(baseAmountNum, baseMint, unixTime) {
        return reduceFromParent({
            hierarchy: this.hierarchy,
            func: (acc, current) => {
                return current.pricingCurve.buyWithBaseAmount(acc, current.tokenBonding.buyBaseRoyaltyPercentage, current.tokenBonding.buyTargetRoyaltyPercentage, unixTime);
            },
            initial: baseAmountNum,
            destination: baseMint || this.hierarchy.tokenBonding.baseMint,
            wrappedSolMint: this.hierarchy.wrappedSolMint,
        });
    }
}
exports.BondingPricing = BondingPricing;
//# sourceMappingURL=pricing.js.map