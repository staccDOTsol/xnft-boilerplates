import { useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
export const usePublicKey = (publicKeyStr) => useMemo(() => {
    if (publicKeyStr) {
        try {
            return new PublicKey(publicKeyStr);
        }
        catch {
            // ignore
        }
    }
}, [publicKeyStr]);
//# sourceMappingURL=usePublicKey.js.map