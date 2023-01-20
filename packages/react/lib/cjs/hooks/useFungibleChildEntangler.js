"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFungibleChildEntangler = void 0;
const useAccount_1 = require("./useAccount");
const useStrataSdks_1 = require("./useStrataSdks");
function useFungibleChildEntangler(childEntanglerKey) {
    const { fungibleEntanglerSdk } = (0, useStrataSdks_1.useStrataSdks)();
    return (0, useAccount_1.useAccount)(childEntanglerKey, fungibleEntanglerSdk === null || fungibleEntanglerSdk === void 0 ? void 0 : fungibleEntanglerSdk.childEntanglerDecoder);
}
exports.useFungibleChildEntangler = useFungibleChildEntangler;
//# sourceMappingURL=useFungibleChildEntangler.js.map