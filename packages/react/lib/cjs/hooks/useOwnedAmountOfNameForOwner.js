"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOwnedAmountOfNameForOwner = void 0;
const bondingPricing_1 = require("./bondingPricing");
const tokenRef_1 = require("./tokenRef");
function useOwnedAmountOfNameForOwner(owner, handle, collective, tld) {
    const { info: tokenRef, loading: loadingRef } = (0, tokenRef_1.useTokenRefForName)(handle, collective, tld);
    const amount = (0, bondingPricing_1.useUserOwnedAmount)(owner, tokenRef === null || tokenRef === void 0 ? void 0 : tokenRef.mint);
    return {
        loading: loadingRef,
        amount,
    };
}
exports.useOwnedAmountOfNameForOwner = useOwnedAmountOfNameForOwner;
//# sourceMappingURL=useOwnedAmountOfNameForOwner.js.map