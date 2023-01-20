"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTokenSwapFromId = void 0;
const spl_token_bonding_1 = require("@strata-foundation/spl-token-bonding");
const useTokenSwapFromFungibleEntangler_1 = require("./useTokenSwapFromFungibleEntangler");
const useMint_1 = require("./useMint");
const useTokenBondingFromMint_1 = require("./useTokenBondingFromMint");
function useTokenSwapFromId(id) {
    // try and load a token bonding curve as if the id is a mint
    const { info: tokenBonding, loading: bondingLoading } = (0, useTokenBondingFromMint_1.useTokenBondingFromMint)(id, 0);
    const targetMintAcct = (0, useMint_1.useMint)(tokenBonding === null || tokenBonding === void 0 ? void 0 : tokenBonding.targetMint);
    // try and load the fungible entangler
    const entanglerTokenSwap = (0, useTokenSwapFromFungibleEntangler_1.useTokenSwapFromFungibleEntangler)(id);
    // try and load a second bonding curve (legacy support)
    const { info: sellOnlyTokenBonding, loading: sellBondingLoading } = (0, useTokenBondingFromMint_1.useTokenBondingFromMint)(id, 1);
    if (tokenBonding) {
        const targetMintSupply = targetMintAcct && (0, spl_token_bonding_1.toNumber)(targetMintAcct.supply, targetMintAcct);
        const mintCap = tokenBonding && targetMintAcct &&
            tokenBonding.mintCap &&
            (0, spl_token_bonding_1.toNumber)(tokenBonding.mintCap, targetMintAcct);
        const numRemaining = typeof targetMintSupply != "undefined" && !!mintCap
            ? mintCap - targetMintSupply
            : undefined;
        return {
            tokenBonding,
            retrievalTokenBonding: sellOnlyTokenBonding,
            numRemaining,
            loading: bondingLoading || sellBondingLoading,
        };
    }
    return entanglerTokenSwap;
}
exports.useTokenSwapFromId = useTokenSwapFromId;
//# sourceMappingURL=useTokenSwapFromId.js.map