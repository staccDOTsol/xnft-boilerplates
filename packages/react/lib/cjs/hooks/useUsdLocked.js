"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUsdLocked = void 0;
const react_1 = require("react");
const bondingPricing_1 = require("./bondingPricing");
const usePriceInUsd_1 = require("./usePriceInUsd");
function useUsdLocked(tokenBondingKey) {
    const { pricing } = (0, bondingPricing_1.useBondingPricing)(tokenBondingKey);
    const lowestMint = (0, react_1.useMemo)(() => {
        const arr = (pricing === null || pricing === void 0 ? void 0 : pricing.hierarchy.toArray()) || [];
        if (arr.length > 0) {
            return arr[arr.length - 1].tokenBonding.baseMint;
        }
    }, [pricing]);
    const fiatPrice = (0, usePriceInUsd_1.usePriceInUsd)(lowestMint);
    const baseLocked = pricing === null || pricing === void 0 ? void 0 : pricing.locked(lowestMint);
    return fiatPrice && baseLocked && baseLocked * fiatPrice;
}
exports.useUsdLocked = useUsdLocked;
//# sourceMappingURL=useUsdLocked.js.map