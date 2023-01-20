"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useReserveAmount = void 0;
const spl_token_bonding_1 = require("@strata-foundation/spl-token-bonding");
const react_1 = require("react");
const useMint_1 = require("./useMint");
const useTokenAccount_1 = require("./useTokenAccount");
const useTokenBonding_1 = require("./useTokenBonding");
function useReserveAmount(tokenBonding) {
    const { info: tokenBondingAcc, loading: loadingBonding } = (0, useTokenBonding_1.useTokenBonding)(tokenBonding);
    const { info: reserves, loading: loadingToken } = (0, useTokenAccount_1.useTokenAccount)(tokenBondingAcc === null || tokenBondingAcc === void 0 ? void 0 : tokenBondingAcc.baseStorage);
    const baseMint = (0, useMint_1.useMint)(tokenBondingAcc === null || tokenBondingAcc === void 0 ? void 0 : tokenBondingAcc.baseMint);
    const loading = (0, react_1.useMemo)(() => loadingBonding || loadingToken, [loadingBonding, loadingToken]);
    const reserveAmount = (0, react_1.useMemo)(() => !reserves && !loading
        ? 0
        : reserves && baseMint && (0, spl_token_bonding_1.amountAsNum)(reserves.amount, baseMint), [reserves, baseMint, loading]);
    return reserveAmount;
}
exports.useReserveAmount = useReserveAmount;
//# sourceMappingURL=useReserveAmount.js.map