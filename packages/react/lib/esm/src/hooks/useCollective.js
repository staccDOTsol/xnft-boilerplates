import { useAccount } from "./useAccount";
import { useStrataSdks } from "./useStrataSdks";
export function useCollective(collective) {
    const { tokenCollectiveSdk } = useStrataSdks();
    return useAccount(collective, tokenCollectiveSdk?.collectiveDecoder, false);
}
//# sourceMappingURL=useCollective.js.map