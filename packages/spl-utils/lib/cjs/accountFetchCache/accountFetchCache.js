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
exports.AccountFetchCache = exports.DEFAULT_DELAY = exports.DEFAULT_CHUNK_SIZE = void 0;
const web3_js_1 = require("@solana/web3.js");
const eventEmitter_1 = require("./eventEmitter");
const getMultipleAccounts_1 = require("./getMultipleAccounts");
exports.DEFAULT_CHUNK_SIZE = 99;
exports.DEFAULT_DELAY = 50;
function getWriteableAccounts(instructions) {
    return instructions
        .flatMap((i) => i.keys)
        .filter((k) => k.isWritable)
        .map((a) => a.pubkey);
}
let id = 0;
class AccountFetchCache {
    constructor({ connection, chunkSize = exports.DEFAULT_CHUNK_SIZE, delay = exports.DEFAULT_DELAY, commitment, missingRefetchDelay = 10000, extendConnection = false, }) {
        this.accountWatchersCount = new Map();
        this.accountChangeListeners = new Map();
        this.statics = new Set();
        this.missingAccounts = new Map();
        this.genericCache = new Map();
        this.keyToAccountParser = new Map();
        this.timeout = null;
        this.currentBatch = new Set();
        this.pendingCallbacks = new Map();
        this.pendingCalls = new Map();
        this.emitter = new eventEmitter_1.EventEmitter();
        this.connection = connection;
        this.chunkSize = chunkSize;
        this.delay = delay;
        this.commitment = commitment;
        this.missingInterval = setInterval(this.fetchMissing.bind(this), missingRefetchDelay);
        this.oldSendTransaction = connection.sendTransaction.bind(connection);
        this.oldSendRawTransaction =
            connection.sendRawTransaction.bind(connection);
        const self = this;
        if (extendConnection) {
            this.oldGetAccountinfo = connection.getAccountInfo.bind(connection);
            connection.getAccountInfo = (publicKey, com) => __awaiter(this, void 0, void 0, function* () {
                if ((com || connection.commitment) == commitment ||
                    typeof (com || connection.commitment) == "undefined") {
                    const [result, dispose] = yield this.searchAndWatch(publicKey);
                    setTimeout(dispose, 30 * 1000); // cache for 30s
                    return (result === null || result === void 0 ? void 0 : result.account) || null;
                }
                return self.oldGetAccountinfo(publicKey, com);
            });
        }
        connection.sendTransaction = function overloadedSendTransaction(transaction, signers, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const result = yield self.oldSendTransaction(transaction, signers, options);
                this.confirmTransaction(result, "finalized")
                    .then(() => {
                    return self.requeryMissing(transaction.instructions);
                })
                    .catch(console.error);
                return result;
            });
        };
        connection.sendRawTransaction = function overloadedSendRawTransaction(rawTransaction, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const result = yield self.oldSendRawTransaction(rawTransaction, options);
                const instructions = web3_js_1.Transaction.from(rawTransaction).instructions;
                this.confirmTransaction(result, "finalized")
                    .then(() => {
                    return self.requeryMissing(instructions);
                })
                    .catch(console.error);
                return result;
            });
        };
    }
    requeryMissing(instructions) {
        return __awaiter(this, void 0, void 0, function* () {
            const writeableAccounts = getWriteableAccounts(instructions).map((a) => a.toBase58());
            yield Promise.all(writeableAccounts.map((account) => __awaiter(this, void 0, void 0, function* () {
                const parser = this.missingAccounts.get(account);
                const [found, dispose] = yield this.searchAndWatch(new web3_js_1.PublicKey(account), parser, this.statics.has(account), true);
                dispose();
                if (found) {
                    this.missingAccounts.delete(account);
                }
            })));
        });
    }
    fetchMissing() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield Promise.all([...this.missingAccounts].map(([account, _]) => this.searchAndWatch(new web3_js_1.PublicKey(account), this.missingAccounts.get(account), this.statics.has(account), true).then(([_, dispose]) => dispose()) // Dispose immediately, this isn't watching.
                ));
            }
            catch (e) {
                // This happens in an interval, so just log errors
                console.error(e);
            }
        });
    }
    close() {
        if (this.oldGetAccountinfo) {
            this.connection.getAccountInfo = this.oldGetAccountinfo;
        }
        this.connection.sendTransaction = this.oldSendTransaction;
        this.connection.sendRawTransaction = this.oldSendRawTransaction;
        clearInterval(this.missingInterval);
    }
    fetchBatch() {
        return __awaiter(this, void 0, void 0, function* () {
            const currentBatch = this.currentBatch;
            this.currentBatch = new Set(); // Erase current batch from state, so we can fetch multiple at a time
            try {
                console.log(`Batching account fetch of ${currentBatch.size}`);
                const { keys, array } = yield (0, getMultipleAccounts_1.getMultipleAccounts)(this.connection, Array.from(currentBatch), this.commitment);
                keys.forEach((key, index) => {
                    const callback = this.pendingCallbacks.get(key);
                    callback && callback(array[index], null);
                });
                return { keys, array };
            }
            catch (e) {
                currentBatch.forEach((key) => {
                    const callback = this.pendingCallbacks.get(key);
                    callback && callback(null, e);
                });
                throw e;
            }
        });
    }
    addToBatch(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const idStr = id.toBase58();
            this.currentBatch.add(idStr);
            this.timeout != null && clearTimeout(this.timeout);
            if (this.currentBatch.size > exports.DEFAULT_CHUNK_SIZE) {
                this.fetchBatch();
            }
            else {
                this.timeout = setTimeout(() => this.fetchBatch(), this.delay);
            }
            const promise = new Promise((resolve, reject) => {
                this.pendingCallbacks.set(idStr, (info, err) => {
                    this.pendingCallbacks.delete(idStr);
                    if (err) {
                        return reject(err);
                    }
                    resolve(info);
                });
            });
            return promise;
        });
    }
    flush() {
        return __awaiter(this, void 0, void 0, function* () {
            this.timeout && clearTimeout(this.timeout);
            yield this.fetchBatch();
        });
    }
    searchAndWatch(pubKey, parser, isStatic = false, // optimization, set if the data will never change
    forceRequery = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let id;
            if (typeof pubKey === "string") {
                id = new web3_js_1.PublicKey(pubKey);
            }
            else {
                id = pubKey;
            }
            if (!pubKey) {
                return [undefined, () => { }];
            }
            const address = id.toBase58();
            const data = yield this.search(pubKey, parser, isStatic, forceRequery);
            const dispose = this.watch(id, parser, !!data);
            const cacheEntry = this.genericCache.get(address);
            if (!this.genericCache.has(address) || cacheEntry != data) {
                this.updateCache(address, data || null);
            }
            return [data, dispose];
        });
    }
    updateCache(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const isNew = !this.genericCache.has(id);
            this.genericCache.set(id, data || null);
            this.emitter.raiseCacheUpdated(id, isNew, this.keyToAccountParser.get(id));
        });
    }
    // The same as query, except swallows errors and returns undefined.
    search(pubKey, parser, isStatic = false, // optimization, set if the data will never change
    forceRequery = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let id;
            if (typeof pubKey === "string") {
                id = new web3_js_1.PublicKey(pubKey);
            }
            else {
                id = pubKey;
            }
            this.registerParser(id, parser);
            const address = id.toBase58();
            if (isStatic) {
                this.statics.add(address);
            }
            else if (this.statics.has(address)) {
                this.statics.delete(address); // If trying to use this as not static, need to rm it from the statics list.
            }
            if (!forceRequery && this.genericCache.has(address)) {
                const result = this.genericCache.get(address);
                return result == null
                    ? undefined
                    : result;
            }
            const existingQuery = this.pendingCalls.get(address);
            if (!forceRequery && existingQuery) {
                return existingQuery;
            }
            const query = this.addToBatch(id).then((data) => {
                this.pendingCalls.delete(address);
                if (!data) {
                    return undefined;
                }
                const result = this.getParsed(id, data, parser) || {
                    pubkey: id,
                    account: data,
                    info: undefined,
                };
                // Only set the cache for defined static accounts. Static accounts can change if they go from nonexistant to existant.
                // Rely on searchAndWatch to set the generic cache for everything else.
                if (isStatic && result && result.info) {
                    this.updateCache(address, result);
                }
                return result;
            });
            this.pendingCalls.set(address, query);
            return query;
        });
    }
    onAccountChange(key, parser, account) {
        const parsed = this.getParsed(key, account, parser);
        const address = key.toBase58();
        this.updateCache(address, parsed || null);
    }
    watch(id, parser, exists = true) {
        const address = id.toBase58();
        const isStatic = this.statics.has(address);
        let oldCount = (this.accountWatchersCount.get(address) || 0) + 1;
        this.accountWatchersCount.set(address, oldCount);
        if (exists && !isStatic) {
            // Only websocket watch accounts that exist
            // Don't recreate listeners
            if (!this.accountChangeListeners.has(address)) {
                this.accountChangeListeners.set(address, this.connection.onAccountChange(id, (account) => this.onAccountChange(id, undefined, account), this.commitment));
            }
        }
        else if (!exists) {
            // Poll accounts that don't exist
            this.missingAccounts.set(address, parser || this.missingAccounts.get(address));
        }
        return () => {
            const newCount = this.accountWatchersCount.get(address) - 1;
            this.accountWatchersCount.set(address, newCount);
            if (newCount <= 0) {
                const subscriptionId = this.accountChangeListeners.get(address);
                if (subscriptionId) {
                    this.accountChangeListeners.delete(address);
                    this.connection.removeAccountChangeListener(subscriptionId);
                }
                this.missingAccounts.delete(address);
            }
        };
    }
    query(pubKey, parser) {
        return __awaiter(this, void 0, void 0, function* () {
            const ret = yield this.search(pubKey, parser);
            if (!ret) {
                throw new Error("Account not found");
            }
            return ret;
        });
    }
    getParsed(id, obj, parser) {
        const address = typeof id === "string" ? id : id === null || id === void 0 ? void 0 : id.toBase58();
        this.registerParser(id, parser);
        const deserialize = (this.keyToAccountParser.get(address) ||
            AccountFetchCache.defaultParser);
        const account = deserialize(new web3_js_1.PublicKey(address), obj);
        if (!account) {
            return {
                pubkey: new web3_js_1.PublicKey(id),
                account: obj,
            };
        }
        return account;
    }
    get(pubKey) {
        let key;
        if (typeof pubKey !== "string") {
            key = pubKey.toBase58();
        }
        else {
            key = pubKey;
        }
        return this.genericCache.get(key);
    }
    delete(pubKey) {
        let key;
        if (typeof pubKey !== "string") {
            key = pubKey.toBase58();
        }
        else {
            key = pubKey;
        }
        const subId = this.accountChangeListeners.get(key);
        if (subId) {
            this.connection.removeAccountChangeListener(subId);
            this.accountChangeListeners.delete(key);
        }
        if (this.genericCache.has(key)) {
            this.genericCache.delete(key);
            this.emitter.raiseCacheDeleted(key);
            return true;
        }
        return false;
    }
    byParser(parser) {
        const result = [];
        for (const id of this.keyToAccountParser.keys()) {
            if (this.keyToAccountParser.get(id) === parser) {
                result.push(id);
            }
        }
        return result;
    }
    registerParser(pubkey, parser) {
        if (pubkey) {
            const address = typeof pubkey === "string" ? pubkey : pubkey === null || pubkey === void 0 ? void 0 : pubkey.toBase58();
            if (parser && !this.keyToAccountParser.get(address)) {
                this.keyToAccountParser.set(address, parser);
                const cached = this.genericCache.get(address);
                if (cached) {
                    const parsed = parser(cached.pubkey, cached.account);
                    if (parsed) {
                        this.genericCache.set(address, parsed);
                    }
                }
            }
        }
        return pubkey;
    }
}
exports.AccountFetchCache = AccountFetchCache;
AccountFetchCache.defaultParser = (pubkey, account) => ({
    pubkey,
    account,
});
//# sourceMappingURL=accountFetchCache.js.map