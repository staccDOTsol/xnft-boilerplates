import { PublicKey } from "@solana/web3.js";
import { IFungibleChildEntangler, IFungibleParentEntangler } from "@strata-foundation/fungible-entangler";
import { ITokenBonding } from "@strata-foundation/spl-token-bonding";
export interface ITokenSwap {
    tokenBonding: ITokenBonding | undefined;
    numRemaining: number | undefined;
    retrievalTokenBonding?: ITokenBonding;
    childEntangler?: IFungibleChildEntangler;
    parentEntangler?: IFungibleParentEntangler;
    loading: boolean;
}
export declare function useTokenSwapFromFungibleEntangler(id: PublicKey | undefined | null): ITokenSwap;
//# sourceMappingURL=useTokenSwapFromFungibleEntangler.d.ts.map