import { useEffect, useMemo, useState } from "react";
import { useBondingPricingFromMint } from "./bondingPricing";
import { useJupiterPrice } from "./useJupiterPrice";
export function useBondedTokenPrice(bondedMint, priceMint) {
    const { pricing } = useBondingPricingFromMint(bondedMint);
    const lowestMint = useMemo(() => {
        const arr = pricing?.hierarchy.toArray() || [];
        if (arr.length > 0) {
            return arr[arr.length - 1].tokenBonding.baseMint;
        }
    }, [pricing]);
    const lowestMintPriceJup = useJupiterPrice(lowestMint || undefined, priceMint);
    const [price, setPrice] = useState();
    useEffect(() => {
        if (pricing && priceMint) {
            if (pricing.hierarchy.contains(priceMint)) {
                setPrice(pricing?.current(priceMint));
            }
            else if (lowestMintPriceJup && lowestMint) {
                setPrice(pricing?.current(lowestMint) * lowestMintPriceJup);
            }
        }
    }, [priceMint, pricing, lowestMintPriceJup, lowestMint]);
    return price;
}
//# sourceMappingURL=useBondedTokenPrice.js.map