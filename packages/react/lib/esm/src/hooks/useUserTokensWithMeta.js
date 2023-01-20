import { useState, useEffect, useMemo } from "react";
import { useTokenList } from "./useTokenList";
import { useWallet } from "wallet-adapter-react-xnft";
import { NATIVE_MINT } from "@solana/spl-token";
import { SplTokenMetadata } from "@strata-foundation/spl-utils";
import { useStrataSdks } from "./useStrataSdks";
import { useAccount } from "./useAccount";
import { useWalletTokenAccounts } from "./useWalletTokenAccounts";
import { solMetadata, toMetadata } from "./useMetaplexMetadata";
export const useUserTokensWithMeta = (owner, includeSol = false) => {
    const { tokenCollectiveSdk } = useStrataSdks();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const { publicKey } = useWallet();
    const { account } = useAccount(publicKey);
    const { result: tokenAccounts, loading: loadingTokenAccounts, error: tokenAccountsError, } = useWalletTokenAccounts(owner);
    const tokenList = useTokenList();
    useEffect(() => {
        (async function () {
            if (owner && tokenAccounts) {
                try {
                    setLoading(true);
                    const tokenAccountsWithMeta = await tokenCollectiveSdk?.getUserTokensWithMeta(tokenAccounts);
                    // @ts-ignore
                    setData([
                        ...(includeSol
                            ? [
                                {
                                    publicKey: publicKey || undefined,
                                    displayName: "SOL",
                                    metadata: solMetadata,
                                    account: {
                                        address: publicKey,
                                        mint: NATIVE_MINT,
                                        amount: account?.lamports,
                                    },
                                    image: await SplTokenMetadata.getImage(solMetadata.data.uri),
                                },
                            ]
                            : []),
                        ...(tokenAccountsWithMeta || []),
                    ]);
                }
                catch (e) {
                    setError(e);
                }
                finally {
                    setLoading(false);
                }
            }
        })();
    }, [owner, tokenAccounts, tokenCollectiveSdk, setData, setLoading, setError]);
    // Enrich with metadata from the token list
    const enriched = useMemo(() => data.map((d) => {
        const enriched = toMetadata(tokenList && d.account && tokenList.get(d.account?.mint.toBase58()));
        return {
            ...d,
            image: d.image || enriched?.data.uri,
            metadata: d.metadata || enriched,
        };
    }), [data, tokenList]);
    return {
        data: enriched,
        loading: loading || loadingTokenAccounts,
        error: error || tokenAccountsError,
    };
};
//# sourceMappingURL=useUserTokensWithMeta.js.map