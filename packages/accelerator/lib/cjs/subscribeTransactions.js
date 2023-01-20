"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribeTransactions = exports.hydrateTransactions = void 0;
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
const truthy = (value) => !!value;
function hydrateTransactions(connection, signatures, tries = 0) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!connection) {
            return [];
        }
        const rawTxs = yield connection.getTransactions(signatures.map((sig) => sig.signature));
        // Some were null. Try again
        if (rawTxs.some((t) => !t) && tries < 5) {
            yield sleep(500);
            return hydrateTransactions(connection, signatures, tries + 1);
        }
        const txs = rawTxs.map((t, index) => {
            // @ts-ignore
            t.signature = signatures[index].signature;
            // @ts-ignore
            t.pending = false;
            return t;
        });
        return txs
            .filter(truthy)
            .sort((a, b) => (b.blockTime || 0) - (a.blockTime || 0));
    });
}
exports.hydrateTransactions = hydrateTransactions;
// Returns a dispose funciton
function subscribeTransactions({ connection, address, cluster, accelerator, callback, }) {
    const connSubId = connection.onLogs(address, ({ signature, err, logs }, { slot }) => __awaiter(this, void 0, void 0, function* () {
        try {
            const newTxns = yield hydrateTransactions(connection, [
                {
                    slot,
                    signature,
                    blockTime: new Date().valueOf() / 1000,
                    memo: "",
                    err,
                },
            ]);
            if (newTxns[0])
                callback(Object.assign(Object.assign({}, newTxns[0]), { logs }));
        }
        catch (e) {
            console.error("Error while fetching new tx", e);
        }
    }), "confirmed");
    let subId;
    let promise = (() => __awaiter(this, void 0, void 0, function* () {
        if (address && accelerator) {
            subId = yield accelerator.onTransaction(cluster, address, ({ logs, transaction, txid, blockTime }) => {
                callback({
                    signature: txid,
                    transaction: {
                        message: transaction.compileMessage(),
                        signatures: transaction.signatures.map((sig) => sig.publicKey.toBase58()),
                    },
                    logs,
                    blockTime,
                    pending: true,
                });
            });
        }
    }))();
    return () => {
        connection.removeOnLogsListener(connSubId);
        (() => __awaiter(this, void 0, void 0, function* () {
            yield promise;
            if (subId && accelerator) {
                accelerator.unsubscribeTransaction(subId);
            }
        }))();
    };
}
exports.subscribeTransactions = subscribeTransactions;
//# sourceMappingURL=subscribeTransactions.js.map