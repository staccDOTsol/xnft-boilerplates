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
exports.useTwWrappedSolMint = void 0;
const react_async_hook_1 = require("react-async-hook");
const useStrataSdks_1 = require("./useStrataSdks");
function getWrappedSol(tokenBondingSdk) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (!tokenBondingSdk) {
            return;
        }
        return (_a = (yield tokenBondingSdk.getState())) === null || _a === void 0 ? void 0 : _a.wrappedSolMint;
    });
}
function useTwWrappedSolMint() {
    const { tokenBondingSdk } = (0, useStrataSdks_1.useStrataSdks)();
    const { result: wrappedSolMint, error } = (0, react_async_hook_1.useAsync)(getWrappedSol, [tokenBondingSdk]);
    if (error) {
        console.error(error);
    }
    return wrappedSolMint;
}
exports.useTwWrappedSolMint = useTwWrappedSolMint;
//# sourceMappingURL=useTwWrappedSolMint.js.map