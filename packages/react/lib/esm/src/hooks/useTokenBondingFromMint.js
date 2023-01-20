import { SplTokenBonding, } from "@strata-foundation/spl-token-bonding";
import { useAsync } from "react-async-hook";
import { useTokenBonding } from "./useTokenBonding";
export function useTokenBondingFromMint(mint, index) {
    const { result: key, loading, error, } = useAsync(async (mint, index) => mint && SplTokenBonding.tokenBondingKey(mint, index), [mint, index || 0]);
    const tokenBondingInfo = useTokenBonding(key && key[0]);
    return {
        ...tokenBondingInfo,
        loading: tokenBondingInfo.loading || loading,
        error,
    };
}
//# sourceMappingURL=useTokenBondingFromMint.js.map