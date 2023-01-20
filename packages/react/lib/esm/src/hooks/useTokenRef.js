import { useAccount } from "./useAccount";
import { useStrataSdks } from "./useStrataSdks";
export function useTokenRef(tokenRef) {
    const { tokenCollectiveSdk } = useStrataSdks();
    return useAccount(tokenRef, tokenCollectiveSdk?.tokenRefDecoder, true);
}
//# sourceMappingURL=useTokenRef.js.map