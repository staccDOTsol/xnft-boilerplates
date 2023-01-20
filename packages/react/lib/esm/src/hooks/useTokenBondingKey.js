import { SplTokenBonding } from "@strata-foundation/spl-token-bonding";
import { useMemo } from "react";
import { useAsync } from "react-async-hook";
async function tokenBondingKey(mintKey, index) {
    return mintKey
        ? (await SplTokenBonding.tokenBondingKey(mintKey, index))[0]
        : undefined;
}
export function useTokenBondingKey(mintKey, index) {
    const uniqueMintKey = useMemo(() => mintKey, [mintKey?.toBase58()]);
    return useAsync(tokenBondingKey, [uniqueMintKey, index]);
}
//# sourceMappingURL=useTokenBondingKey.js.map