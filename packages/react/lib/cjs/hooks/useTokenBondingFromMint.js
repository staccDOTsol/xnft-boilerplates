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
exports.useTokenBondingFromMint = void 0;
const spl_token_bonding_1 = require("@strata-foundation/spl-token-bonding");
const react_async_hook_1 = require("react-async-hook");
const useTokenBonding_1 = require("./useTokenBonding");
function useTokenBondingFromMint(mint, index) {
    const { result: key, loading, error, } = (0, react_async_hook_1.useAsync)((mint, index) => __awaiter(this, void 0, void 0, function* () { return mint && spl_token_bonding_1.SplTokenBonding.tokenBondingKey(mint, index); }), [mint, index || 0]);
    const tokenBondingInfo = (0, useTokenBonding_1.useTokenBonding)(key && key[0]);
    return Object.assign(Object.assign({}, tokenBondingInfo), { loading: tokenBondingInfo.loading || loading, error });
}
exports.useTokenBondingFromMint = useTokenBondingFromMint;
//# sourceMappingURL=useTokenBondingFromMint.js.map