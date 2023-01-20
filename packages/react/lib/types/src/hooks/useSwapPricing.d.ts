import { PublicKey } from "@solana/web3.js";
import { PricingState } from "./bondingPricing";
import { ITokenSwap } from "./useTokenSwapFromFungibleEntangler";
export declare function useSwapPricing(id: PublicKey | undefined): PricingState & ITokenSwap & {
    pricingLoading: boolean;
};
//# sourceMappingURL=useSwapPricing.d.ts.map