"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePriceInSol = void 0;
const spl_token_1 = require("@solana/spl-token");
const react_1 = require("react");
const useBondedTokenPrice_1 = require("./useBondedTokenPrice");
const useJupiterPrice_1 = require("./useJupiterPrice");
function usePriceInSol(token) {
    const bondedTokenPrice = (0, useBondedTokenPrice_1.useBondedTokenPrice)(token || undefined, spl_token_1.NATIVE_MINT);
    const tokenPriceJup = (0, useJupiterPrice_1.useJupiterPrice)(token || undefined, spl_token_1.NATIVE_MINT);
    return (0, react_1.useMemo)(() => bondedTokenPrice || tokenPriceJup, [bondedTokenPrice, tokenPriceJup]);
}
exports.usePriceInSol = usePriceInSol;
//# sourceMappingURL=usePriceInSol.js.map