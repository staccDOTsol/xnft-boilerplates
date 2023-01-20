"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCurve = void 0;
const useAccount_1 = require("./useAccount");
const useStrataSdks_1 = require("./useStrataSdks");
function useCurve(curve) {
    const { tokenBondingSdk } = (0, useStrataSdks_1.useStrataSdks)();
    return (0, useAccount_1.useAccount)(curve, tokenBondingSdk === null || tokenBondingSdk === void 0 ? void 0 : tokenBondingSdk.curveDecoder, true);
}
exports.useCurve = useCurve;
//# sourceMappingURL=useCurve.js.map