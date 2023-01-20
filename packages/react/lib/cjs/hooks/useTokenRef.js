"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTokenRef = void 0;
const useAccount_1 = require("./useAccount");
const useStrataSdks_1 = require("./useStrataSdks");
function useTokenRef(tokenRef) {
    const { tokenCollectiveSdk } = (0, useStrataSdks_1.useStrataSdks)();
    return (0, useAccount_1.useAccount)(tokenRef, tokenCollectiveSdk === null || tokenCollectiveSdk === void 0 ? void 0 : tokenCollectiveSdk.tokenRefDecoder, true);
}
exports.useTokenRef = useTokenRef;
//# sourceMappingURL=useTokenRef.js.map