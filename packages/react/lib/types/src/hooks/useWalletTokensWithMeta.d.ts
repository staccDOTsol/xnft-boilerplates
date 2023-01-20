import { PublicKey } from "@solana/web3.js";
import { ITokenWithMetaAndAccount } from "@strata-foundation/spl-token-collective";
import { UseAsyncReturn } from "react-async-hook";
/**
 * @deprecated The method should not be used. It fetches way too much data. Consider fetching only the data
 * you need in the components you need. If each component fetches data around a token, you can display a loading
 * mask for each individual component
 *
 * Get all tokens in a wallet plus all relevant metadata from spl-token-metadata and spl-token-collective
 *
 * @param owner
 * @returns
 */
export declare function useWalletTokensWithMeta(owner?: PublicKey): UseAsyncReturn<ITokenWithMetaAndAccount[]>;
//# sourceMappingURL=useWalletTokensWithMeta.d.ts.map