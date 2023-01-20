import { useMemo } from "react";
import { useAsync } from "react-async-hook";
import { useConnection } from "wallet-adapter-react-xnft";
export const useRentExemptAmount = (size) => {
    const { connection } = useConnection();
    const { loading, error, result } = useAsync(connection.getMinimumBalanceForRentExemption.bind(connection), [size]);
    const amount = useMemo(() => (result || 0) / Math.pow(10, 9), [result]);
    return {
        amount,
        error,
        loading,
    };
};
//# sourceMappingURL=useRentExemptAmount.js.map