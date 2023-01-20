import { useAccount } from "./useAccount";
import { useStrataSdks } from "./useStrataSdks";
export function useFungibleParentEntangler(parentEntanglerKey) {
    const { fungibleEntanglerSdk } = useStrataSdks();
    return useAccount(parentEntanglerKey, fungibleEntanglerSdk?.parentEntanglerDecoder);
}
//# sourceMappingURL=useFungibleParentEntangler.js.map