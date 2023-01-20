import { useUserOwnedAmount } from "./bondingPricing";
import { useTokenRefForName } from "./tokenRef";
export function useOwnedAmountOfNameForOwner(owner, handle, collective, tld) {
    const { info: tokenRef, loading: loadingRef } = useTokenRefForName(handle, collective, tld);
    const amount = useUserOwnedAmount(owner, tokenRef?.mint);
    return {
        loading: loadingRef,
        amount,
    };
}
//# sourceMappingURL=useOwnedAmountOfNameForOwner.js.map