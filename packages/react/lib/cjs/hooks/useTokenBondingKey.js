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
exports.useTokenBondingKey = void 0;
const spl_token_bonding_1 = require("@strata-foundation/spl-token-bonding");
const react_1 = require("react");
const react_async_hook_1 = require("react-async-hook");
function tokenBondingKey(mintKey, index) {
    return __awaiter(this, void 0, void 0, function* () {
        return mintKey
            ? (yield spl_token_bonding_1.SplTokenBonding.tokenBondingKey(mintKey, index))[0]
            : undefined;
    });
}
function useTokenBondingKey(mintKey, index) {
    const uniqueMintKey = (0, react_1.useMemo)(() => mintKey, [mintKey === null || mintKey === void 0 ? void 0 : mintKey.toBase58()]);
    return (0, react_async_hook_1.useAsync)(tokenBondingKey, [uniqueMintKey, index]);
}
exports.useTokenBondingKey = useTokenBondingKey;
//# sourceMappingURL=useTokenBondingKey.js.map