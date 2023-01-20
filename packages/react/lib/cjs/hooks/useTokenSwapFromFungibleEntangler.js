"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTokenSwapFromFungibleEntangler = void 0;
const spl_token_bonding_1 = require("@strata-foundation/spl-token-bonding");
const useFungibleChildEntangler_1 = require("./useFungibleChildEntangler");
const useFungibleParentEntangler_1 = require("./useFungibleParentEntangler");
const useMint_1 = require("./useMint");
const useTokenAccount_1 = require("./useTokenAccount");
const useTokenBondingFromMint_1 = require("./useTokenBondingFromMint");
function useTokenSwapFromFungibleEntangler(id) {
    // load the fungible entangler
    const { info: childEntangler, loading: loading1 } = (0, useFungibleChildEntangler_1.useFungibleChildEntangler)(id);
    const { info: parentEntangler, loading: loading2 } = (0, useFungibleParentEntangler_1.useFungibleParentEntangler)(childEntangler === null || childEntangler === void 0 ? void 0 : childEntangler.parentEntangler);
    const { info: tokenBonding, loading: loading3 } = (0, useTokenBondingFromMint_1.useTokenBondingFromMint)(childEntangler === null || childEntangler === void 0 ? void 0 : childEntangler.childMint, 0);
    // load to find the amount remaining in the fungible entangler
    const { info: supplyAcc } = (0, useTokenAccount_1.useTokenAccount)(parentEntangler === null || parentEntangler === void 0 ? void 0 : parentEntangler.parentStorage);
    const supplyMint = (0, useMint_1.useMint)(parentEntangler === null || parentEntangler === void 0 ? void 0 : parentEntangler.parentMint);
    return {
        tokenBonding,
        numRemaining: supplyAcc && supplyMint && (0, spl_token_bonding_1.toNumber)(supplyAcc === null || supplyAcc === void 0 ? void 0 : supplyAcc.amount, supplyMint),
        childEntangler: childEntangler,
        parentEntangler: parentEntangler,
        loading: loading1 || loading2 || loading3
    };
}
exports.useTokenSwapFromFungibleEntangler = useTokenSwapFromFungibleEntangler;
//# sourceMappingURL=useTokenSwapFromFungibleEntangler.js.map