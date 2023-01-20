import { PublicKey } from "@solana/web3.js";
import { IFungibleParentEntangler } from "@strata-foundation/fungible-entangler";
import { UseAccountState } from "./useAccount";
export declare function useFungibleParentEntangler(parentEntanglerKey: PublicKey | undefined | null): UseAccountState<IFungibleParentEntangler> & {
    error?: Error;
};
//# sourceMappingURL=useFungibleParentEntangler.d.ts.map