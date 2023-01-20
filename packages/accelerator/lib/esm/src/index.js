import { Transaction } from "@solana/web3.js";
import { v4 as uuid } from "uuid";
export { subscribeTransactions, hydrateTransactions, } from "./subscribeTransactions";
import AsyncLock from "async-lock";
const lock = new AsyncLock();
export var Cluster;
(function (Cluster) {
    Cluster["Devnet"] = "devnet";
    Cluster["Mainnet"] = "mainnet-beta";
    Cluster["Testnet"] = "testnet";
    Cluster["Localnet"] = "localnet";
})(Cluster || (Cluster = {}));
var ResponseType;
(function (ResponseType) {
    ResponseType["Error"] = "error";
    ResponseType["Transaction"] = "transaction";
    ResponseType["Unsubscribe"] = "unsubscribe";
    ResponseType["Subscribe"] = "subscribe";
})(ResponseType || (ResponseType = {}));
var RequestType;
(function (RequestType) {
    RequestType["Transaction"] = "transaction";
    RequestType["Subscribe"] = "subscribe";
    RequestType["Unsubscribe"] = "unsubscribe";
})(RequestType || (RequestType = {}));
export class Accelerator {
    ws;
    listeners;
    subs = {}; // List of current subscriptions
    // Map of our id to subId
    transactionListeners;
    static async waitForConnect(socket) {
        return new Promise((resolve, reject) => {
            let resolved = false;
            socket.onopen = function (e) {
                resolved = true;
                resolve(socket);
            };
            setTimeout(() => {
                if (!resolved) {
                    reject(new Error("Failed to connect to socket within 60 seconds"));
                }
            }, 60 * 1000);
        });
    }
    static async init(url) {
        const socket = new WebSocket(url);
        await Accelerator.waitForConnect(socket);
        return new Accelerator({ ws: socket });
    }
    constructor({ ws }) {
        this.ws = ws;
        this.initSocket(ws);
        this.listeners = {};
        this.transactionListeners = {};
    }
    async send(payload) {
        this.ws.send(JSON.stringify(payload));
    }
    sendTransaction(cluster, tx) {
        this.send({
            type: RequestType.Transaction,
            transactionBytes: tx.serialize().toJSON().data,
            cluster,
        });
    }
    async unsubscribeTransaction(listenerId) {
        delete this.subs[listenerId];
        const subId = this.transactionListeners[listenerId];
        if (subId) {
            this.send({
                type: RequestType.Unsubscribe,
                id: subId,
            });
            await this.listenOnce((resp) => resp.type === ResponseType.Unsubscribe);
        }
        delete this.listeners[listenerId];
    }
    async onTransaction(cluster, account, callback) {
        return lock.acquire("onTransaction", async () => {
            return this._onTransaction(cluster, account, callback);
        });
    }
    async _onTransaction(cluster, account, callback) {
        const sub = {
            type: RequestType.Subscribe,
            cluster,
            account: account.toBase58(),
        };
        await this.send(sub);
        const response = await this.listenOnce((resp) => resp.type === ResponseType.Subscribe);
        const subId = response.id;
        this.subs[subId] = sub;
        const listenerId = await this.listen((resp) => {
            if (resp.type === ResponseType.Transaction) {
                const tx = Transaction.from(new Uint8Array(resp.transactionBytes));
                if (tx.compileMessage().accountKeys.some((key) => key.equals(account))) {
                    callback({
                        transaction: tx,
                        txid: resp.txid,
                        blockTime: resp.blockTime,
                        logs: resp.logs,
                    });
                }
            }
        });
        this.transactionListeners[listenerId] = subId;
        return listenerId;
    }
    listen(listener) {
        const id = uuid();
        this.listeners[id] = listener;
        return id;
    }
    unlisten(id) {
        delete this.listeners[id];
    }
    async listenOnce(matcher) {
        return new Promise((resolve, reject) => {
            let resolved = false;
            let id;
            const listener = (resp) => {
                if (matcher(resp)) {
                    resolved = true;
                    this.unlisten(id);
                    resolve(resp);
                }
            };
            id = this.listen(listener);
            setTimeout(() => {
                if (!resolved) {
                    this.unlisten(id);
                    reject(new Error("Failed to match matcher in 60 seconds"));
                }
            }, 60 * 1000);
        });
    }
    initSocket(ws) {
        this.ws = ws;
        const that = this;
        Object.values(this.subs).forEach((sub) => this.send(sub));
        ws.onclose = async function () {
            // Try to reconnect
            const newWs = new WebSocket(ws.url);
            await Accelerator.waitForConnect(newWs);
            that.initSocket(newWs);
        };
        ws.onmessage = this.onMessage.bind(this);
    }
    onMessage(message) {
        const parsed = JSON.parse(message.data);
        Object.values(this.listeners).map((listener) => listener && listener(parsed));
    }
}
//# sourceMappingURL=index.js.map