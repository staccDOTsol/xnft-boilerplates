import { useState, useEffect } from "react";
import { useConnection } from "wallet-adapter-react-xnft";
export const useLargestTokenAccounts = (tokenMint) => {
    const { connection } = useConnection();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState();
    const [error, setError] = useState();
    useEffect(() => {
        (async () => {
            if (tokenMint) {
                setLoading(true);
                try {
                    const result = await connection.getTokenLargestAccounts(tokenMint);
                    setResult(result);
                }
                catch (e) {
                    setError(e);
                }
                finally {
                    setLoading(false);
                }
            }
        })();
    }, [tokenMint]);
    return { loading, result, error };
};
//# sourceMappingURL=useLargestTokenAccounts.js.map