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
exports.useAssociatedTokenAddress = void 0;
const spl_token_1 = require("@solana/spl-token");
const react_async_hook_1 = require("react-async-hook");
const fetch = (wallet, mint) => __awaiter(void 0, void 0, void 0, function* () {
    if (!wallet || !mint) {
        return undefined;
    }
    return spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, mint, wallet, true);
});
function useAssociatedTokenAddress(wallet, mint) {
    const { result, loading } = (0, react_async_hook_1.useAsync)(fetch, [wallet, mint]);
    return { result, loading };
}
exports.useAssociatedTokenAddress = useAssociatedTokenAddress;
//# sourceMappingURL=useAssociatedTokenAddress.js.map