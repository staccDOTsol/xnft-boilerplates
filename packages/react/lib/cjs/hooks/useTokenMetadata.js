"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTokenMetadata = void 0;
const wallet_adapter_react_xnft_1 = require("wallet-adapter-react-xnft");
const tokenRef_1 = require("./tokenRef");
const useAssociatedAccount_1 = require("./useAssociatedAccount");
const useMetaplexMetadata_1 = require("./useMetaplexMetadata");
/**
 * Get the token account and all metaplex + token collective metadata around the token
 *
 * @param token
 * @returns
 */
function useTokenMetadata(token) {
    const metaplexData = (0, useMetaplexMetadata_1.useMetaplexTokenMetadata)(token);
    const wallet = (0, wallet_adapter_react_xnft_1.useWallet)();
    const { associatedAccount } = (0, useAssociatedAccount_1.useAssociatedAccount)(wallet.publicKey, token);
    const { info: mintTokenRef, loading: loadingTokenRef } = (0, tokenRef_1.useMintTokenRef)(token);
    return Object.assign(Object.assign({}, metaplexData), { tokenRef: mintTokenRef, loading: Boolean(token && (loadingTokenRef || metaplexData.loading)), account: associatedAccount });
}
exports.useTokenMetadata = useTokenMetadata;
//# sourceMappingURL=useTokenMetadata.js.map