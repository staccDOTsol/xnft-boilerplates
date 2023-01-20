"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSocialTokenMetadata = void 0;
const tokenRef_1 = require("./tokenRef");
const useTokenBonding_1 = require("./useTokenBonding");
const useTokenMetadata_1 = require("./useTokenMetadata");
const useTokenRef_1 = require("./useTokenRef");
/**
 * Get all metadata associated with a given wallet's social token.
 *
 * @param ownerOrTokenRef
 * @returns
 */
function useSocialTokenMetadata(ownerOrTokenRef) {
    const { info: tokenRef1, loading: loading1 } = (0, tokenRef_1.usePrimaryClaimedTokenRef)(ownerOrTokenRef);
    const { info: tokenRef2, loading: loading2 } = (0, useTokenRef_1.useTokenRef)(ownerOrTokenRef);
    const tokenRef = tokenRef1 || tokenRef2;
    const { info: tokenBonding, loading: loading3 } = (0, useTokenBonding_1.useTokenBonding)((tokenRef === null || tokenRef === void 0 ? void 0 : tokenRef.tokenBonding) || undefined);
    return Object.assign(Object.assign({}, (0, useTokenMetadata_1.useTokenMetadata)(tokenBonding === null || tokenBonding === void 0 ? void 0 : tokenBonding.targetMint)), { tokenRef,
        tokenBonding, loading: loading1 || loading2 || loading3 });
}
exports.useSocialTokenMetadata = useSocialTokenMetadata;
//# sourceMappingURL=useSocialTokenMetadata.js.map