import { PublicKey } from "@solana/web3.js";
import { IFungibleChildEntangler } from "@strata-foundation/fungible-entangler";
import { UseAccountState } from "./useAccount";
export declare function useFungibleChildEntangler(childEntanglerKey: PublicKey | undefined | null): UseAccountState<IFungibleChildEntangler | undefined> & {
    error?: Error;
};
//# sourceMappingURL=useFungibleChildEntangler.d.ts.map