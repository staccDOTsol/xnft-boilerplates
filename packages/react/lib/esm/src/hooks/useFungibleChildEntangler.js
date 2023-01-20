import { useAccount } from "./useAccount";
import { useStrataSdks } from "./useStrataSdks";
export function useFungibleChildEntangler(childEntanglerKey) {
    const { fungibleEntanglerSdk } = useStrataSdks();
    return useAccount(childEntanglerKey, fungibleEntanglerSdk?.childEntanglerDecoder);
}
//# sourceMappingURL=useFungibleChildEntangler.js.map