import { MintInfo, u64 } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { IBondingPricing, ITokenBonding } from "@strata-foundation/spl-token-bonding";
export declare function supplyAsNum(mint: MintInfo): number;
export declare function amountAsNum(amount: u64, mint: MintInfo): number;
export declare function useSolOwnedAmount(ownerPublicKey?: PublicKey): {
    amount: number;
    loading: boolean;
};
export declare function useUserOwnedAmount(wallet: PublicKey | undefined | null, token: PublicKey | undefined | null): number | undefined;
export declare function useOwnedAmount(token: PublicKey | undefined | null): number | undefined;
export interface PricingState {
    loading: boolean;
    tokenBonding?: ITokenBonding;
    pricing?: IBondingPricing;
    error?: Error;
}
/**
 * Get an {@link IPricingCurve} Object that can estimate pricing on this bonding curve,
 * in real time.
 *
 * @param tokenBonding
 * @returns
 */
export declare function useBondingPricing(tokenBonding: PublicKey | undefined | null): PricingState;
/**
 * Same as {@link useBondingPricing}, just from a mint instead of the token bonding key
 *
 * @param mint
 * @param index
 * @returns
 */
export declare function useBondingPricingFromMint(mint: PublicKey | undefined | null, index?: number | undefined): PricingState;
//# sourceMappingURL=bondingPricing.d.ts.map