import { NATIVE_MINT } from "@solana/spl-token";
import { useMemo } from "react";
import { useBondedTokenPrice } from "./useBondedTokenPrice";
import { useJupiterPrice } from "./useJupiterPrice";
export function usePriceInSol(token) {
    const bondedTokenPrice = useBondedTokenPrice(token || undefined, NATIVE_MINT);
    const tokenPriceJup = useJupiterPrice(token || undefined, NATIVE_MINT);
    return useMemo(() => bondedTokenPrice || tokenPriceJup, [bondedTokenPrice, tokenPriceJup]);
}
//# sourceMappingURL=usePriceInSol.js.map