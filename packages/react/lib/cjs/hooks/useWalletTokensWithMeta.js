"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWalletTokensWithMeta = void 0;
const wallet_adapter_react_xnft_1 = require("wallet-adapter-react-xnft");
const react_async_hook_1 = require("react-async-hook");
const useStrataSdks_1 = require("./useStrataSdks");
const useWalletTokenAccounts_1 = require("./useWalletTokenAccounts");
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
function useWalletTokensWithMeta(owner) {
    const { connection } = (0, wallet_adapter_react_xnft_1.useConnection)();
    const { result: tokenAccounts, error } = (0, useWalletTokenAccounts_1.useWalletTokenAccounts)(owner);
    const { tokenCollectiveSdk, loading } = (0, useStrataSdks_1.useStrataSdks)();
    const getTokensWithMeta = tokenCollectiveSdk
        ? tokenCollectiveSdk.getUserTokensWithMeta
        : () => Promise.resolve([]);
    const asyncResult = (0, react_async_hook_1.useAsync)(getTokensWithMeta, [connection, tokenAccounts]);
    return Object.assign(Object.assign({}, asyncResult), { loading: loading || asyncResult.loading, error: asyncResult.error || error });
}
exports.useWalletTokensWithMeta = useWalletTokensWithMeta;
//# sourceMappingURL=useWalletTokensWithMeta.js.map