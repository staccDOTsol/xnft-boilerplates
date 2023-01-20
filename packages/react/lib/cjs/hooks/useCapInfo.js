"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCapInfo = void 0;
const useMint_1 = require("./useMint");
const useTokenBonding_1 = require("./useTokenBonding");
const spl_token_bonding_1 = require("@strata-foundation/spl-token-bonding");
const useTokenBondingKey_1 = require("./useTokenBondingKey");
const useTokenAccount_1 = require("./useTokenAccount");
/**
 * Use mint cap information for a token bonding curve to get information like the number of
 * items remaining
 */
const useCapInfo = (tokenBondingKey, useTokenOfferingCurve = false) => {
    const { info: tokenBonding, loading: loadingBonding } = (0, useTokenBonding_1.useTokenBonding)(tokenBondingKey);
    const { result: sellOnlyTokenBondingKey, error: keyError1 } = (0, useTokenBondingKey_1.useTokenBondingKey)(tokenBonding === null || tokenBonding === void 0 ? void 0 : tokenBonding.targetMint, 1);
    if (keyError1) {
        console.error(keyError1);
    }
    const { info: sellOnlyTokenBonding, loading: sellOnlyLoading } = (0, useTokenBonding_1.useTokenBonding)(sellOnlyTokenBondingKey);
    const { info: supplyAcc } = (0, useTokenAccount_1.useTokenAccount)(sellOnlyTokenBonding === null || sellOnlyTokenBonding === void 0 ? void 0 : sellOnlyTokenBonding.baseStorage);
    const supplyMint = (0, useMint_1.useMint)(sellOnlyTokenBonding === null || sellOnlyTokenBonding === void 0 ? void 0 : sellOnlyTokenBonding.baseMint);
    const sellOnlySupply = supplyAcc && supplyMint && (0, spl_token_bonding_1.toNumber)(supplyAcc.amount, supplyMint);
    const targetMintAcct = (0, useMint_1.useMint)(tokenBonding === null || tokenBonding === void 0 ? void 0 : tokenBonding.targetMint);
    const targetMintSupply = targetMintAcct && (0, spl_token_bonding_1.toNumber)(targetMintAcct.supply, targetMintAcct);
    const mintCap = tokenBonding &&
        targetMintAcct &&
        tokenBonding.mintCap &&
        (0, spl_token_bonding_1.toNumber)(tokenBonding.mintCap, targetMintAcct);
    const numRemaining = useTokenOfferingCurve ? sellOnlySupply :
        typeof targetMintSupply != "undefined" && !!mintCap
            ? mintCap - targetMintSupply
            : undefined;
    return {
        loading: loadingBonding || sellOnlyLoading,
        numRemaining,
        mintCap,
    };
};
exports.useCapInfo = useCapInfo;
//# sourceMappingURL=useCapInfo.js.map