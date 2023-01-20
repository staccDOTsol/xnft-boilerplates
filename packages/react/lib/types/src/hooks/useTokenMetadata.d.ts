import { PublicKey } from "@solana/web3.js";
import { ITokenWithMetaAndAccount } from "@strata-foundation/spl-token-collective";
export interface IUseTokenMetadataResult extends ITokenWithMetaAndAccount {
    loading: boolean;
    error: Error | undefined;
}
/**
 * Get the token account and all metaplex + token collective metadata around the token
 *
 * @param token
 * @returns
 */
export declare function useTokenMetadata(token: PublicKey | undefined | null): IUseTokenMetadataResult;
//# sourceMappingURL=useTokenMetadata.d.ts.map