import { PublicKey } from "@solana/web3.js";
import { ITokenRef } from "@strata-foundation/spl-token-collective";
import { AccountFetchCache } from "@strata-foundation/spl-utils";
import { UseAccountState } from "./useAccount";
export declare function getOwnerForName(cache: AccountFetchCache | undefined, handle: string | undefined, tld: PublicKey | undefined): Promise<PublicKey | undefined>;
export declare function getClaimedTokenRefKeyForName(cache: AccountFetchCache, handle: string, mint: PublicKey | undefined | null, tld: PublicKey): Promise<PublicKey | undefined>;
export declare function getUnclaimedTokenRefKeyForName(handle: string, mint: PublicKey | undefined | null, tld: PublicKey | undefined): Promise<PublicKey>;
export declare const useUnclaimedTokenRefKeyForName: (name: string | undefined | null, mint: PublicKey | undefined | null, tld: PublicKey | undefined) => {
    result: PublicKey | undefined;
    loading: boolean;
};
export declare const useClaimedTokenRefKeyForName: (name: string | undefined | null, mint: PublicKey | undefined | null, tld: PublicKey | undefined) => {
    result: PublicKey | undefined;
    loading: boolean;
    error?: Error;
};
export declare const useClaimedTokenRefKey: (owner: PublicKey | undefined | null, mint: PublicKey | undefined | null) => PublicKey | undefined;
/**
 * Get a token ref from the bonding instance
 *
 * @param tokenBonding
 * @returns
 */
export declare function useTokenRefFromBonding(tokenBonding: PublicKey | undefined | null): UseAccountState<ITokenRef>;
/**
 * Given a social token mint, get the social token TokenRef
 *
 * @param mint
 * @returns
 */
export declare function useMintTokenRef(mint: PublicKey | undefined | null): UseAccountState<ITokenRef>;
/**
 * Get the token ref for this wallet
 * @param owner
 * @returns
 */
export declare function usePrimaryClaimedTokenRef(owner: PublicKey | undefined | null): UseAccountState<ITokenRef>;
/**
 * Get a TokenRef using a twitter handle name service lookup on `name`. Searches for `name`, then grabs the owner.
 *
 * If the name is unclaimed, grabs the unclaimed token ref if it exists
 *
 * @param name
 * @param mint
 * @param tld
 * @returns
 */
export declare const useTokenRefForName: (name: string | undefined | null, mint: PublicKey | null, tld: PublicKey | undefined) => UseAccountState<ITokenRef>;
//# sourceMappingURL=tokenRef.d.ts.map