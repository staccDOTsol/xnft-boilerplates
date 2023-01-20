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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Accelerator = exports.Cluster = exports.hydrateTransactions = exports.subscribeTransactions = void 0;
const web3_js_1 = require("@solana/web3.js");
const uuid_1 = require("uuid");
var subscribeTransactions_1 = require("./subscribeTransactions");
Object.defineProperty(exports, "subscribeTransactions", { enumerable: true, get: function () { return subscribeTransactions_1.subscribeTransactions; } });
Object.defineProperty(exports, "hydrateTransactions", { enumerable: true, get: function () { return subscribeTransactions_1.hydrateTransactions; } });
const async_lock_1 = __importDefault(require("async-lock"));
const lock = new async_lock_1.default();
var Cluster;
(function (Cluster) {
    Cluster["Devnet"] = "devnet";
    Cluster["Mainnet"] = "mainnet-beta";
    Cluster["Testnet"] = "testnet";
    Cluster["Localnet"] = "localnet";
})(Cluster = exports.Cluster || (exports.Cluster = {}));
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
class Accelerator {
    constructor({ ws }) {
        this.subs = {}; // List of current subscriptions
        this.ws = ws;
        this.initSocket(ws);
        this.listeners = {};
        this.transactionListeners = {};
    }
    static waitForConnect(socket) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    static init(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const socket = new WebSocket(url);
            yield Accelerator.waitForConnect(socket);
            return new Accelerator({ ws: socket });
        });
    }
    send(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ws.send(JSON.stringify(payload));
        });
    }
    sendTransaction(cluster, tx) {
        this.send({
            type: RequestType.Transaction,
            transactionBytes: tx.serialize().toJSON().data,
            cluster,
        });
    }
    unsubscribeTransaction(listenerId) {
        return __awaiter(this, void 0, void 0, function* () {
            delete this.subs[listenerId];
            const subId = this.transactionListeners[listenerId];
            if (subId) {
                this.send({
                    type: RequestType.Unsubscribe,
                    id: subId,
                });
                yield this.listenOnce((resp) => resp.type === ResponseType.Unsubscribe);
            }
            delete this.listeners[listenerId];
        });
    }
    onTransaction(cluster, account, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            return lock.acquire("onTransaction", () => __awaiter(this, void 0, void 0, function* () {
                return this._onTransaction(cluster, account, callback);
            }));
        });
    }
    _onTransaction(cluster, account, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const sub = {
                type: RequestType.Subscribe,
                cluster,
                account: account.toBase58(),
            };
            yield this.send(sub);
            const response = yield this.listenOnce((resp) => resp.type === ResponseType.Subscribe);
            const subId = response.id;
            this.subs[subId] = sub;
            const listenerId = yield this.listen((resp) => {
                if (resp.type === ResponseType.Transaction) {
                    const tx = web3_js_1.Transaction.from(new Uint8Array(resp.transactionBytes));
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
        });
    }
    listen(listener) {
        const id = (0, uuid_1.v4)();
        this.listeners[id] = listener;
        return id;
    }
    unlisten(id) {
        delete this.listeners[id];
    }
    listenOnce(matcher) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    initSocket(ws) {
        this.ws = ws;
        const that = this;
        Object.values(this.subs).forEach((sub) => this.send(sub));
        ws.onclose = function () {
            return __awaiter(this, void 0, void 0, function* () {
                // Try to reconnect
                const newWs = new WebSocket(ws.url);
                yield Accelerator.waitForConnect(newWs);
                that.initSocket(newWs);
            });
        };
        ws.onmessage = this.onMessage.bind(this);
    }
    onMessage(message) {
        const parsed = JSON.parse(message.data);
        Object.values(this.listeners).map((listener) => listener && listener(parsed));
    }
}
exports.Accelerator = Accelerator;
//# sourceMappingURL=index.js.map