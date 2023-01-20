import { Transaction } from "@solana/web3.js";
import { ProgramError } from "./anchorError";
import axios from "axios";
import { sendAndConfirmWithRetry } from "./transaction";
async function promiseAllInOrder(it) {
    let ret = [];
    for (const i of it) {
        ret.push(await i());
    }
    return ret;
}
/**
 * Execute transactions from a remote server (either single or multiple transactions)
 * @param provider
 * @param url
 * @param body
 * @param errors
 * @returns
 */
export async function executeRemoteTxn(provider, url, body, errors = new Map()) {
    const txnsToExec = await getAndSignRemoteTxns(provider, url, body);
    return executeTxnsInOrder(provider, txnsToExec, errors);
}
export async function signOnlyNeeded(provider, rawTxns) {
    const txns = rawTxns.map((t) => Transaction.from(t));
    const needToSign = txns.filter((tx) => tx.signatures.some((sig) => sig.publicKey.equals(provider.wallet.publicKey)));
    const signedTxns = await provider.wallet.signAllTransactions(needToSign);
    const txnsToExec = txns.map((txn, idx) => {
        const index = needToSign.indexOf(txn);
        if (index >= 0) {
            return signedTxns[index].serialize({
                requireAllSignatures: false,
                verifySignatures: false,
            });
        }
        return Buffer.from(rawTxns[idx]);
    });
    return txnsToExec;
}
export async function executeTxnsInOrder(provider, txns, errors = new Map()) {
    try {
        return [
            ...(await promiseAllInOrder(txns.map((txn) => async () => {
                const { txid } = await sendAndConfirmWithRetry(provider.connection, txn, {
                    skipPreflight: true,
                }, "confirmed");
                return txid;
            }))),
        ];
    }
    catch (e) {
        const wrappedE = ProgramError.parse(e, errors);
        throw wrappedE == null ? e : wrappedE;
    }
}
/**
 * Get and sign transactions from a remote server (either single or multiple transactions)
 * @param provider
 * @param url
 * @param body
 * @param errors
 * @returns
 */
export async function getAndSignRemoteTxns(provider, url, body) {
    try {
        const resp = await axios.post(url, body, {
            responseType: "json",
        });
        const rawTxns = Array.isArray(resp.data) ? resp.data : [resp.data];
        return await signOnlyNeeded(provider, rawTxns.map((t) => t.data));
    }
    catch (e) {
        if (e.response?.data?.message) {
            throw new Error(e.response.data.message);
        }
        throw e;
    }
}
//# sourceMappingURL=executeRemoteTxn.js.map