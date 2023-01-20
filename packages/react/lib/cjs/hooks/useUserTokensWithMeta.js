"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUserTokensWithMeta = void 0;
const react_1 = require("react");
const useTokenList_1 = require("./useTokenList");
const wallet_adapter_react_xnft_1 = require("wallet-adapter-react-xnft");
const spl_token_1 = require("@solana/spl-token");
const spl_utils_1 = require("@strata-foundation/spl-utils");
const useStrataSdks_1 = require("./useStrataSdks");
const useAccount_1 = require("./useAccount");
const useWalletTokenAccounts_1 = require("./useWalletTokenAccounts");
const useMetaplexMetadata_1 = require("./useMetaplexMetadata");
const useUserTokensWithMeta = (owner, includeSol = false) => {
    const { tokenCollectiveSdk } = (0, useStrataSdks_1.useStrataSdks)();
    const [data, setData] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)();
    const { publicKey } = (0, wallet_adapter_react_xnft_1.useWallet)();
    const { account } = (0, useAccount_1.useAccount)(publicKey);
    const { result: tokenAccounts, loading: loadingTokenAccounts, error: tokenAccountsError, } = (0, useWalletTokenAccounts_1.useWalletTokenAccounts)(owner);
    const tokenList = (0, useTokenList_1.useTokenList)();
    (0, react_1.useEffect)(() => {
        (function () {
            return __awaiter(this, void 0, void 0, function* () {
                if (owner && tokenAccounts) {
                    try {
                        setLoading(true);
                        const tokenAccountsWithMeta = yield (tokenCollectiveSdk === null || tokenCollectiveSdk === void 0 ? void 0 : tokenCollectiveSdk.getUserTokensWithMeta(tokenAccounts));
                        // @ts-ignore
                        setData([
                            ...(includeSol
                                ? [
                                    {
                                        publicKey: publicKey || undefined,
                                        displayName: "SOL",
                                        metadata: useMetaplexMetadata_1.solMetadata,
                                        account: {
                                            address: publicKey,
                                            mint: spl_token_1.NATIVE_MINT,
                                            amount: account === null || account === void 0 ? void 0 : account.lamports,
                                        },
                                        image: yield spl_utils_1.SplTokenMetadata.getImage(useMetaplexMetadata_1.solMetadata.data.uri),
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
            });
        })();
    }, [owner, tokenAccounts, tokenCollectiveSdk, setData, setLoading, setError]);
    // Enrich with metadata from the token list
    const enriched = (0, react_1.useMemo)(() => data.map((d) => {
        var _a;
        const enriched = (0, useMetaplexMetadata_1.toMetadata)(tokenList && d.account && tokenList.get((_a = d.account) === null || _a === void 0 ? void 0 : _a.mint.toBase58()));
        return Object.assign(Object.assign({}, d), { image: d.image || (enriched === null || enriched === void 0 ? void 0 : enriched.data.uri), metadata: d.metadata || enriched });
    }), [data, tokenList]);
    return {
        data: enriched,
        loading: loading || loadingTokenAccounts,
        error: error || tokenAccountsError,
    };
};
exports.useUserTokensWithMeta = useUserTokensWithMeta;
//# sourceMappingURL=useUserTokensWithMeta.js.map