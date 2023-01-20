import { PublicKey } from "@solana/web3.js";
import { ITokenWithMetaAndAccount } from "@strata-foundation/spl-token-collective";
export declare const useUserTokensWithMeta: (owner?: PublicKey, includeSol?: boolean) => {
    data: ITokenWithMetaAndAccount[];
    loading: boolean;
    error: Error | undefined;
    includeSol?: boolean;
};
//# sourceMappingURL=useUserTokensWithMeta.d.ts.map