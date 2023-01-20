import { useAccount } from "./useAccount";
import { useStrataSdks } from "./useStrataSdks";
export function useCurve(curve) {
    const { tokenBondingSdk } = useStrataSdks();
    return useAccount(curve, tokenBondingSdk?.curveDecoder, true);
}
//# sourceMappingURL=useCurve.js.map