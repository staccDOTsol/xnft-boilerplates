"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBondedTokenPrice = void 0;
const react_1 = require("react");
const bondingPricing_1 = require("./bondingPricing");
const useJupiterPrice_1 = require("./useJupiterPrice");
function useBondedTokenPrice(bondedMint, priceMint) {
    const { pricing } = (0, bondingPricing_1.useBondingPricingFromMint)(bondedMint);
    const lowestMint = (0, react_1.useMemo)(() => {
        const arr = (pricing === null || pricing === void 0 ? void 0 : pricing.hierarchy.toArray()) || [];
        if (arr.length > 0) {
            return arr[arr.length - 1].tokenBonding.baseMint;
        }
    }, [pricing]);
    const lowestMintPriceJup = (0, useJupiterPrice_1.useJupiterPrice)(lowestMint || undefined, priceMint);
    const [price, setPrice] = (0, react_1.useState)();
    (0, react_1.useEffect)(() => {
        if (pricing && priceMint) {
            if (pricing.hierarchy.contains(priceMint)) {
                setPrice(pricing === null || pricing === void 0 ? void 0 : pricing.current(priceMint));
            }
            else if (lowestMintPriceJup && lowestMint) {
                setPrice((pricing === null || pricing === void 0 ? void 0 : pricing.current(lowestMint)) * lowestMintPriceJup);
            }
        }
    }, [priceMint, pricing, lowestMintPriceJup, lowestMint]);
    return price;
}
exports.useBondedTokenPrice = useBondedTokenPrice;
//# sourceMappingURL=useBondedTokenPrice.js.map