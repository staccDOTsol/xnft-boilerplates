"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFungibleParentEntangler = void 0;
const useAccount_1 = require("./useAccount");
const useStrataSdks_1 = require("./useStrataSdks");
function useFungibleParentEntangler(parentEntanglerKey) {
    const { fungibleEntanglerSdk } = (0, useStrataSdks_1.useStrataSdks)();
    return (0, useAccount_1.useAccount)(parentEntanglerKey, fungibleEntanglerSdk === null || fungibleEntanglerSdk === void 0 ? void 0 : fungibleEntanglerSdk.parentEntanglerDecoder);
}
exports.useFungibleParentEntangler = useFungibleParentEntangler;
//# sourceMappingURL=useFungibleParentEntangler.js.map