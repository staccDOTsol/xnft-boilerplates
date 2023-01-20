import { useConnection } from "wallet-adapter-react-xnft";
import { subscribeTransactions, hydrateTransactions, } from "@strata-foundation/accelerator";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccelerator } from "../contexts/acceleratorContext";
import { truthy } from "../utils/truthy";
import { useEndpoint } from "./useEndpoint";
async function getSignatures(connection, address, until, lastSignature, maxSignatures = 1000) {
    if (!connection || !address) {
        return [];
    }
    const fetchSize = Math.min(1000, maxSignatures);
    const signatures = await connection.getSignaturesForAddress(address, {
        before: lastSignature,
        limit: fetchSize,
    });
    const withinTime = signatures.filter((sig) => (sig.blockTime || 0) > (until?.valueOf() || 0) / 1000);
    if (withinTime.length == 1000) {
        return [
            ...withinTime,
            ...(await getSignatures(connection, address, until, signatures[signatures.length - 1].signature, maxSignatures)),
        ];
    }
    return withinTime;
}
function removeDups(txns) {
    const notPending = new Set(Array.from(txns.filter((tx) => !tx.pending).map((tx) => tx.signature)));
    // Use the block times from pending messages so that there's no weird reording on screen
    const pendingBlockTimes = txns
        .filter((tx) => tx.pending)
        .reduce((acc, tx) => ({ ...acc, [tx.signature]: tx.blockTime }), {});
    const seen = new Set();
    return txns
        .map((tx) => {
        const nonPendingAvailable = tx.pending && notPending.has(tx.signature);
        if (!seen.has(tx.signature) && !nonPendingAvailable) {
            tx.blockTime = pendingBlockTimes[tx.signature] || tx.blockTime;
            seen.add(tx.signature);
            return tx;
        }
    })
        .filter(truthy);
}
export const useTransactions = ({ numTransactions, until, address, subscribe = false, accelerated = false, lazy = false, }) => {
    const { accelerator } = useAccelerator();
    const { cluster } = useEndpoint();
    const { connection } = useConnection();
    const [loadingInitial, setLoadingInitial] = useState(!lazy);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState();
    const [hasMore, setHasMore] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const addrStr = useMemo(() => address?.toBase58(), [address]);
    useEffect(() => {
        let dispose;
        if (connection && subscribe && address && cluster) {
            dispose = subscribeTransactions({
                connection,
                address,
                cluster: cluster,
                accelerator,
                callback: (newTx) => {
                    console.log("tx", newTx);
                    setTransactions((txns) => removeDups([newTx, ...txns]));
                },
            });
        }
        return () => {
            if (dispose) {
                dispose();
            }
        };
    }, [connection, subscribe, address, cluster]);
    useEffect(() => {
        setTransactions([]);
        (async () => {
            if (!lazy) {
                setLoadingInitial(true);
                try {
                    const signatures = await getSignatures(connection, address, until, undefined, numTransactions);
                    setHasMore(signatures.length === numTransactions);
                    setTransactions(await hydrateTransactions(connection, signatures));
                }
                catch (e) {
                    setError(e);
                }
                finally {
                    setLoadingInitial(false);
                }
            }
        })();
    }, [connection, addrStr, until, setTransactions, numTransactions]);
    const fetchMore = useCallback(async (num) => {
        setLoadingMore(true);
        try {
            const lastTx = transactions[transactions.length - 1];
            const signatures = await getSignatures(connection, address, until, lastTx && lastTx.transaction && lastTx.transaction.signatures[0], num);
            setHasMore(signatures.length === num);
            const newTxns = await hydrateTransactions(connection, signatures);
            setTransactions((txns) => removeDups([...txns, ...newTxns]));
        }
        catch (e) {
            setError(e);
        }
        finally {
            setLoadingMore(false);
        }
    }, [
        transactions[transactions.length - 1],
        connection,
        address,
        until,
        setHasMore,
        setTransactions,
        setError,
        setLoadingMore,
    ]);
    const fetchNew = useCallback(async (num) => {
        setLoadingMore(true);
        try {
            const earlyTx = transactions[0];
            const earlyBlockTime = earlyTx && earlyTx.blockTime;
            let lastDate = until;
            if (earlyBlockTime) {
                const date = new Date(0);
                date.setUTCSeconds(earlyBlockTime);
                lastDate = date;
            }
            const signatures = await getSignatures(connection, address, lastDate, undefined, num);
            const newTxns = await hydrateTransactions(connection, signatures);
            setTransactions((txns) => removeDups([...newTxns, ...txns]));
        }
        catch (e) {
            setError(e);
        }
        finally {
            setLoadingMore(false);
        }
    }, [
        setLoadingMore,
        setError,
        setTransactions,
        until,
        address,
        transactions[0],
        connection,
    ]);
    return {
        hasMore,
        transactions,
        error,
        loadingInitial,
        loadingMore,
        fetchMore,
        fetchNew,
    };
};
//# sourceMappingURL=useTransactions.js.map