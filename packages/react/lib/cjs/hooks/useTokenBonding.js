"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTokenBonding = void 0;
const useAccount_1 = require("./useAccount");
const useStrataSdks_1 = require("./useStrataSdks");
const useTokenBonding = (tokenBonding) => {
    const { tokenBondingSdk } = (0, useStrataSdks_1.useStrataSdks)();
    return (0, useAccount_1.useAccount)(tokenBonding, tokenBondingSdk === null || tokenBondingSdk === void 0 ? void 0 : tokenBondingSdk.tokenBondingDecoder);
};
exports.useTokenBonding = useTokenBonding;
//# sourceMappingURL=useTokenBonding.js.map