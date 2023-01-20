import { MetadataData } from "@metaplex-foundation/mpl-token-metadata";
import { TokenInfo } from "@solana/spl-token-registry";
import { PublicKey } from "@solana/web3.js";
import { ITokenWithMeta } from "@strata-foundation/spl-utils";
export interface IUseMetaplexTokenMetadataResult extends ITokenWithMeta {
    loading: boolean;
    error: Error | undefined;
}
export declare function toMetadata(tokenInfo: TokenInfo | null | undefined): MetadataData | undefined;
export declare const solMetadata: MetadataData;
/**
 * Get the token account and all metaplex metadata around the token
 *
 * @param token
 * @returns
 */
export declare function useMetaplexTokenMetadata(token: PublicKey | undefined | null): IUseMetaplexTokenMetadataResult;
//# sourceMappingURL=useMetaplexMetadata.d.ts.map