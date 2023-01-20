import { PublicKey } from "@solana/web3.js";
import { ITokenBonding } from "@strata-foundation/spl-token-bonding";
import { ITokenRef } from "@strata-foundation/spl-token-collective";
import { IUseTokenMetadataResult } from "./useTokenMetadata";
export interface IUseSocialTokenMetadataResult extends IUseTokenMetadataResult {
    tokenBonding?: ITokenBonding;
    tokenRef?: ITokenRef;
}
/**
 * Get all metadata associated with a given wallet's social token.
 *
 * @param ownerOrTokenRef
 * @returns
 */
export declare function useSocialTokenMetadata(ownerOrTokenRef: PublicKey | undefined | null): IUseSocialTokenMetadataResult;
//# sourceMappingURL=useSocialTokenMetadata.d.ts.map