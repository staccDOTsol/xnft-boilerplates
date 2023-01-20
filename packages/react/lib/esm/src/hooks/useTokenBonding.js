import { useAccount } from "./useAccount";
import { useStrataSdks } from "./useStrataSdks";
export const useTokenBonding = (tokenBonding) => {
    const { tokenBondingSdk } = useStrataSdks();
    return useAccount(tokenBonding, tokenBondingSdk?.tokenBondingDecoder);
};
//# sourceMappingURL=useTokenBonding.js.map