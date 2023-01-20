import { useMemo } from "react";
import { useAsync } from "react-async-hook";
import { useConnection } from "wallet-adapter-react-xnft";
import { getFeesPerSignature } from "@strata-foundation/spl-utils";
export const useFees = (signatures) => {
    const { connection } = useConnection();
    const { loading, error, result } = useAsync(getFeesPerSignature, [
        connection,
    ]);
    const amount = useMemo(() => ((result || 0) * signatures) / Math.pow(10, 9), [result, signatures]);
    return {
        amount,
        error,
        loading,
    };
};
//# sourceMappingURL=useFees.js.map