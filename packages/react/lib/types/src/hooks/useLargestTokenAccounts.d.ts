import { PublicKey, RpcResponseAndContext, TokenAccountBalancePair } from "@solana/web3.js";
export declare const useLargestTokenAccounts: (tokenMint: PublicKey | undefined | null) => {
    loading: boolean;
    result: RpcResponseAndContext<TokenAccountBalancePair[]> | undefined;
    error: Error | undefined;
};
//# sourceMappingURL=useLargestTokenAccounts.d.ts.map