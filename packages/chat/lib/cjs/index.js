"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatSdk = exports.IdentifierType = exports.MessageType = exports.exportSymmetricKey = exports.importSymmetricKey = exports.LocalSymKeyStorage = exports.RawMessageType = void 0;
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
const namespaces_1 = require("@cardinal/namespaces");
const local_storage_lru_1 = require("@cocalc/local-storage-lru");
const anchor_1 = require("@project-serum/anchor");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const spl_utils_1 = require("@strata-foundation/spl-utils");
const spl_token_bonding_1 = require("@strata-foundation/spl-token-bonding");
const bn_js_1 = __importDefault(require("bn.js"));
// @ts-ignore
const lit_js_sdk_1 = __importDefault(require("lit-js-sdk"));
// @ts-ignore
const uuid_1 = require("uuid");
const chat_1 = require("./generated/chat");
Object.defineProperty(exports, "RawMessageType", { enumerable: true, get: function () { return chat_1.MessageType; } });
const lit_1 = require("./lit");
const shdw_1 = require("./shdw");
const MESSAGE_MAX_CHARACTERS = 352; // TODO: This changes with optional accounts in the future
__exportStar(require("./generated/chat"), exports);
__exportStar(require("./shdw"), exports);
__exportStar(require("./lit"), exports);
const TOKEN_METADATA_PROGRAM_ID = new web3_js_1.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
const storage = new local_storage_lru_1.LocalStorageLRU();
// 3 hours
const KEY_EXPIRY = 3 * 60 * 60 * 1000;
const CONDITION_VERSION = 2;
class LocalSymKeyStorage {
    constructor(url) {
        this.url = url;
    }
    setSymKey(encrypted, unencrypted) {
        storage.set("enc" + CONDITION_VERSION + encrypted, unencrypted);
    }
    getSymKey(encrypted) {
        return storage.get("enc" + CONDITION_VERSION + encrypted);
    }
    getKey(mintOrCollection, amount) {
        return `sym-${CONDITION_VERSION}-${this.url}-${mintOrCollection.toBase58()}-${amount}`;
    }
    setSymKeyToUse(mintOrCollection, amount, symKey) {
        const key = this.getKey(mintOrCollection, amount);
        storage.set(key, JSON.stringify(symKey));
    }
    getTimeSinceLastSet(mintOrCollection, amount) {
        const item = storage.get(this.getKey(mintOrCollection, amount));
        if (item) {
            return new Date().valueOf() - JSON.parse(item).timeMillis;
        }
        return null;
    }
    getSymKeyToUse(mintOrCollection, amount) {
        const aDayAgo = new Date();
        aDayAgo.setDate(aDayAgo.getDate() - 1);
        const lastSet = this.getTimeSinceLastSet(mintOrCollection, amount);
        if (!lastSet) {
            return null;
        }
        if (lastSet > KEY_EXPIRY) {
            return null;
        }
        const item = storage.get(this.getKey(mintOrCollection, amount));
        if (item) {
            return JSON.parse(item);
        }
        return null;
    }
}
exports.LocalSymKeyStorage = LocalSymKeyStorage;
const SYMM_KEY_ALGO_PARAMS = {
    name: "AES-CBC",
    length: 256,
};
function generateSymmetricKey() {
    return __awaiter(this, void 0, void 0, function* () {
        const symmKey = yield crypto.subtle.generateKey(SYMM_KEY_ALGO_PARAMS, true, [
            "encrypt",
            "decrypt",
        ]);
        return symmKey;
    });
}
function importSymmetricKey(symmKey) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        const importedSymmKey = yield crypto.subtle.importKey("raw", symmKey, SYMM_KEY_ALGO_PARAMS, true, ["encrypt", "decrypt"]);
        return importedSymmKey;
    });
}
exports.importSymmetricKey = importSymmetricKey;
function exportSymmetricKey(symmKey) {
    return crypto.subtle.exportKey("raw", symmKey);
}
exports.exportSymmetricKey = exportSymmetricKey;
var MessageType;
(function (MessageType) {
    MessageType["Text"] = "text";
    MessageType["Html"] = "html";
    MessageType["Gify"] = "gify";
    MessageType["Image"] = "image";
    MessageType["React"] = "react";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
const PROGRAM_LOG = "Program log: ";
const PROGRAM_DATA = "Program data: ";
const PROGRAM_LOG_START_INDEX = PROGRAM_LOG.length;
const PROGRAM_DATA_START_INDEX = PROGRAM_DATA.length;
var IdentifierType;
(function (IdentifierType) {
    IdentifierType["Chat"] = "chat";
    IdentifierType["User"] = "me";
})(IdentifierType = exports.IdentifierType || (exports.IdentifierType = {}));
function puff(str, len) {
    return str.padEnd(32, "\0");
}
function depuff(str) {
    return str.replace(new RegExp("\0", "g"), "");
}
class ChatSdk extends spl_utils_1.AnchorSdk {
    constructor({ provider, program, litClient, namespacesProgram, 
    // @ts-ignore
    symKeyStorage = new LocalSymKeyStorage(provider.connection._rpcEndpoint), tokenBondingProgram, tokenMetadataProgram, }) {
        super({ provider, program });
        this.conditionVersion = CONDITION_VERSION;
        this._namespaces = null;
        this._namespacesPromise = null;
        this.entryDecoder = (pubkey, account) => {
            const coded = this.namespacesProgram.coder.accounts.decode("entry", account.data);
            return Object.assign(Object.assign({}, coded), { publicKey: pubkey });
        };
        this.chatDecoder = (pubkey, account) => {
            const coded = this.program.coder.accounts.decode("ChatV0", account.data);
            return Object.assign(Object.assign({}, coded), { name: depuff(coded.name), imageUrl: depuff(coded.imageUrl), metadataUrl: depuff(coded.metadataUrl), publicKey: pubkey });
        };
        this.chatPermissionsDecoder = (pubkey, account) => {
            const coded = this.program.coder.accounts.decode("ChatPermissionsV0", account.data);
            return Object.assign(Object.assign({}, coded), { publicKey: pubkey });
        };
        this.delegateWalletDecoder = (pubkey, account) => {
            const coded = this.program.coder.accounts.decode("DelegateWalletV0", account.data);
            return Object.assign(Object.assign({}, coded), { publicKey: pubkey });
        };
        this.profileDecoder = (pubkey, account) => {
            const coded = this.program.coder.accounts.decode("ProfileV0", account.data);
            return Object.assign(Object.assign({}, coded), { imageUrl: depuff(coded.imageUrl), metadataUrl: depuff(coded.metadataUrl), publicKey: pubkey });
        };
        this.settingsDecoder = (pubkey, account) => {
            const coded = this.program.coder.accounts.decode("SettingsV0", account.data);
            const that = this;
            return Object.assign(Object.assign({}, coded), { publicKey: pubkey, getDelegateWalletSeed() {
                    return __awaiter(this, void 0, void 0, function* () {
                        const symmetricKey = yield that.getSymmetricKey(coded.encryptedSymmetricKey, [myWalletPermissions(coded.ownerWallet)]);
                        return that.litJsSdk.decryptString(new Blob([
                            that.litJsSdk.uint8arrayFromString(coded.encryptedDelegateWallet, "base16"),
                        ]), symmetricKey);
                    });
                } });
        };
        this.caseInsensitiveMarkerDecoder = (pubkey, account) => {
            const coded = this.program.coder.accounts.decode("CaseInsensitiveMarkerV0", account.data);
            return Object.assign(Object.assign({}, coded), { publicKey: pubkey });
        };
        this.symKeyFetchCache = {};
        this.namespacesProgram = namespacesProgram;
        this.authingLit = null;
        // @ts-ignore
        const endpoint = provider.connection._rpcEndpoint;
        if (endpoint.includes("dev") ||
            endpoint.includes("local") ||
            endpoint.includes("127.0.0.1")) {
            this.chain = "solanaDevnet";
        }
        else {
            this.chain = "solana";
        }
        this.litClient = litClient;
        this.symKeyStorage = symKeyStorage;
        this.litJsSdk = lit_js_sdk_1.default;
        this.tokenBondingProgram = tokenBondingProgram;
        this.tokenMetadataProgram = tokenMetadataProgram;
    }
    get isLitAuthed() {
        return Boolean(this.litAuthSig);
    }
    _litAuth() {
        return __awaiter(this, void 0, void 0, function* () {
            const cached = storage.get("lit-auth-sol-signature");
            const cachedDate = storage.get("lit-auth-sol-signature-date") || 0;
            const cachedAuthSig = JSON.parse(cached);
            if (!this.wallet || !this.wallet.publicKey) {
                return;
            }
            if (
            // TODO: When sigs expire enable this again
            // Number(cachedDate) >= new Date().valueOf() - 24 * 60 * 60 * 1000 &&
            this.wallet.publicKey.toBase58() === (cachedAuthSig === null || cachedAuthSig === void 0 ? void 0 : cachedAuthSig.address)) {
                this.litAuthSig = cachedAuthSig;
                return;
            }
            try {
                // @ts-ignore
                if (!this.wallet.signMessage) {
                    throw new Error("This wallet does not support signMessage. Please use another wallet");
                }
                this.litAuthSig = yield (0, lit_1.getAuthSig)(this.wallet.publicKey, 
                // @ts-ignore
                this.wallet);
                storage.set("lit-auth-sol-signature", JSON.stringify(this.litAuthSig));
                storage.set("lit-auth-sol-signature-date", new Date().valueOf().toString());
            }
            finally {
                this.authingLit = null;
            }
        });
    }
    litAuth() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.authingLit;
            if (!this.isLitAuthed && !this.authingLit) {
                this.authingLit = this._litAuth();
            }
            return this.authingLit;
        });
    }
    getNamespace(namespace) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.namespacesProgram.account.namespace.fetch(namespace));
        });
    }
    static init(provider, chatProgramId = ChatSdk.ID, splTokenBondingProgramId = spl_token_bonding_1.SplTokenBonding.ID) {
        return __awaiter(this, void 0, void 0, function* () {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const namespacesProgram = new anchor_1.Program(namespaces_1.NAMESPACES_IDL, namespaces_1.NAMESPACES_PROGRAM_ID, provider);
            const ChatIDLJson = yield anchor_1.Program.fetchIdl(chatProgramId, provider);
            const chat = new anchor_1.Program(ChatIDLJson, chatProgramId, provider);
            const tokenMetadataProgram = yield spl_utils_1.SplTokenMetadata.init(provider);
            const tokenBondingProgram = yield spl_token_bonding_1.SplTokenBonding.init(provider, splTokenBondingProgramId);
            const client = new lit_js_sdk_1.default.LitNodeClient({
                alertWhenUnauthorized: false,
                debug: false,
            });
            try {
                yield client.connect();
            }
            catch (e) {
                console.warn(e);
            }
            return new this({
                provider,
                program: chat,
                litClient: client,
                namespacesProgram,
                tokenBondingProgram,
                tokenMetadataProgram,
            });
        });
    }
    getChat(chatKey) {
        return this.getAccount(chatKey, this.chatDecoder);
    }
    getChatPermissions(chatPermissionsKey) {
        return this.getAccount(chatPermissionsKey, this.chatPermissionsDecoder);
    }
    getProfile(profileKey) {
        return this.getAccount(profileKey, this.profileDecoder);
    }
    getSettings(settingsKey) {
        return this.getAccount(settingsKey, this.settingsDecoder);
    }
    getCaseInsensitiveMarker(caseInsensitiveMarkerKey) {
        return this.getAccount(caseInsensitiveMarkerKey, this.caseInsensitiveMarkerDecoder);
    }
    /**
     * Get messages from a bunch of parts. NOTE: It is highly reccommended you use accountFetchCache for efficiency.
     * @param parts
     * @param ignorePartial
     * @returns
     */
    getMessagesFromParts(parts, ignorePartial = true) {
        const partsById = parts.reduce((acc, part) => {
            acc[part.id] = acc[part.id] || [];
            acc[part.id].push(part);
            return acc;
        }, {});
        const messages = Object.values(partsById).map((parts) => this.getMessageFromParts(parts, ignorePartial));
        return messages
            .filter(spl_utils_1.truthy)
            .sort((a, b) => a.startBlockTime - b.startBlockTime);
    }
    _getSymmetricKey(encryptedSymmetricKey, accessControlConditions) {
        return __awaiter(this, void 0, void 0, function* () {
            const storedKey = this.symKeyStorage.getSymKey(encryptedSymmetricKey);
            let symmetricKey = storedKey
                ? Buffer.from(storedKey, "hex")
                : undefined;
            if (!symmetricKey) {
                yield this.litAuth();
                symmetricKey = yield this.litClient.getEncryptionKey({
                    solRpcConditions: accessControlConditions,
                    // Note, below we convert the encryptedSymmetricKey from a UInt8Array to a hex string.  This is because we obtained the encryptedSymmetricKey from "saveEncryptionKey" which returns a UInt8Array.  But the getEncryptionKey method expects a hex string.
                    toDecrypt: encryptedSymmetricKey,
                    chain: this.chain,
                    authSig: this.litAuthSig,
                });
                const symKeyStr = Buffer.from(symmetricKey).toString("hex");
                this.symKeyStorage.setSymKey(encryptedSymmetricKey, symKeyStr);
            }
            delete this.symKeyFetchCache[encryptedSymmetricKey];
            return symmetricKey;
        });
    }
    getSymmetricKey(encryptedSymmetricKey, accessControlConditions) {
        return __awaiter(this, void 0, void 0, function* () {
            // Cache promises so we don't fetch the same thing from lit multiple times
            if (!this.symKeyFetchCache[encryptedSymmetricKey]) {
                this.symKeyFetchCache[encryptedSymmetricKey] = this._getSymmetricKey(encryptedSymmetricKey, accessControlConditions);
            }
            return this.symKeyFetchCache[encryptedSymmetricKey];
        });
    }
    /**
     * Get message from a bunch of parts. NOTE: It is highly reccommended you use accountFetchCache for efficiency.
     *
     * @param parts
     * @param ignorePartial
     * @returns
     */
    getMessageFromParts(parts, ignorePartial = true) {
        if (parts.length == 0) {
            return undefined;
        }
        const incomplete = parts.length !== parts[0].totalParts;
        if (ignorePartial && incomplete) {
            return undefined;
        }
        const content = parts
            .sort((a, b) => a.currentPart - b.currentPart)
            .map((part) => part.content)
            .join("");
        const _a = parts[0], { messageType, readPermissionAmount, chatKey, encryptedSymmetricKey, referenceMessageId, readPermissionKey, readPermissionType } = _a, rest = __rest(_a, ["messageType", "readPermissionAmount", "chatKey", "encryptedSymmetricKey", "referenceMessageId", "readPermissionKey", "readPermissionType"]);
        let decodedMessage;
        return Object.assign(Object.assign({}, rest), { complete: !incomplete, referenceMessageId, type: messageType && Object.keys(messageType)[0], encryptedSymmetricKey, startBlockTime: parts[0].blockTime, endBlockTime: parts[parts.length - 1].blockTime, txids: parts.map((part) => part.txid), readPermissionAmount,
            readPermissionKey,
            readPermissionType,
            content,
            chatKey, getDecodedMessage: () => __awaiter(this, void 0, void 0, function* () {
                if (decodedMessage) {
                    return decodedMessage;
                }
                let readAmount;
                try {
                    const readMint = yield (0, spl_utils_1.getMintInfo)(this.provider, readPermissionKey);
                    readAmount = (0, spl_utils_1.toBN)(readPermissionAmount, readMint);
                }
                catch (_b) {
                    readAmount = new bn_js_1.default(readPermissionAmount);
                }
                if (encryptedSymmetricKey) {
                    yield this.litAuth();
                    const accessControlConditions = getAccessConditions(parts[0].conditionVersion, readPermissionKey, readAmount, this.chain, readPermissionType);
                    try {
                        const blob = new Blob([
                            this.litJsSdk.uint8arrayFromString(content, "base16"),
                        ]);
                        const symmetricKey = yield this.getSymmetricKey(encryptedSymmetricKey, accessControlConditions);
                        decodedMessage = JSON.parse(yield this.litJsSdk.decryptString(blob, symmetricKey));
                        decodedMessage.decryptedAttachments = [];
                        decodedMessage.decryptedAttachments.push(...(yield Promise.all((decodedMessage.encryptedAttachments || []).map((encryptedAttachment) => __awaiter(this, void 0, void 0, function* () {
                            const blob = yield fetch(
                            // @ts-ignore this is some legacy stuff where it could just be a url
                            encryptedAttachment.file || encryptedAttachment).then((r) => r.blob());
                            const arrBuffer = yield this.litJsSdk.decryptFile({
                                symmetricKey,
                                file: blob,
                            });
                            return {
                                file: new Blob([arrBuffer]),
                                // @ts-ignore this is some legacy stuff where it could just be a url
                                name: encryptedAttachment.name || "Attachment",
                            };
                        })))));
                    }
                    catch (e) {
                        console.error("Failed to decode message", e);
                    }
                }
                else {
                    decodedMessage = JSON.parse(content);
                }
                return decodedMessage;
            }), parts });
    }
    /**
     * Get message parts from a tx. NOTE: It is highly reccommended you use accountFetchCache for efficiency.
     * @param param0
     * @returns
     */
    getMessagePartsFromInflatedTx({ chat, txid, meta, blockTime, transaction, idl, logs = meta.logMessages }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (meta === null || meta === void 0 ? void 0 : meta.err) {
                return [];
            }
            const chatAcc = (yield this.getChat(chat));
            if (!idl) {
                idl = yield anchor_1.Program.fetchIdl(chatAcc.postMessageProgramId, this.provider);
            }
            if (!idl) {
                throw new Error("Chat only supports programs with published IDLs.");
            }
            // ensure all instructions are from the chat program id
            const rightProgram = !transaction || transaction.message.instructions.every((ix) => ensurePubkey(transaction.message.accountKeys[ix.programIdIndex]).equals(chatAcc.postMessageProgramId));
            if (!rightProgram) {
                return [];
            }
            const program = new anchor_1.Program(idl, chatAcc.postMessageProgramId, this.provider);
            const coder = program.coder;
            const messages = logs.map((log) => {
                const logStr = log.startsWith(PROGRAM_LOG)
                    ? log.slice(PROGRAM_LOG_START_INDEX)
                    : log.slice(PROGRAM_DATA_START_INDEX);
                const event = coder.events.decode(logStr);
                return event;
            }).filter(spl_utils_1.truthy);
            return Promise.all(messages
                .filter((d) => d.name === "MessagePartEventV0")
                .map((msg) => __awaiter(this, void 0, void 0, function* () {
                const decoded = msg.data;
                let sender = decoded.sender;
                return Object.assign(Object.assign(Object.assign({}, decoded), decoded.message), { blockTime,
                    txid, chatKey: decoded.chat, sender });
            })));
        });
    }
    /**
     * Get message parts from a tx. NOTE: It is highly reccommended you use accountFetchCache for efficiency.
     *
     * @param txid
     * @returns
     */
    getMessagePartsFromTx({ chat, txid, idl, }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const connection = this.provider.connection;
            const tx = yield connection.getTransaction(txid, {
                commitment: "confirmed",
            });
            if (!tx) {
                return [];
            }
            if ((_a = tx.meta) === null || _a === void 0 ? void 0 : _a.err) {
                return [];
            }
            return this.getMessagePartsFromInflatedTx({
                chat,
                txid,
                meta: tx.meta,
                blockTime: tx.blockTime,
                idl,
            });
        });
    }
    static chatKey(identifierCertificateMint, programId = ChatSdk.ID) {
        return web3_js_1.PublicKey.findProgramAddress([
            Buffer.from("identified-chat", "utf-8"),
            identifierCertificateMint.toBuffer(),
        ], programId);
    }
    static chatPermissionsKey(chat, programId = ChatSdk.ID) {
        return web3_js_1.PublicKey.findProgramAddress([Buffer.from("permissions", "utf-8"), chat.toBuffer()], programId);
    }
    static caseInsensitiveMarkerKey(namespace, identifier, programId = ChatSdk.ID) {
        return web3_js_1.PublicKey.findProgramAddress([
            Buffer.from("case_insensitive", "utf-8"),
            namespace.toBuffer(),
            anchor_1.utils.bytes.utf8.encode(identifier.toLowerCase()),
        ], programId);
    }
    static entryKey(namespaceId, identifier) {
        return web3_js_1.PublicKey.findProgramAddress([
            anchor_1.utils.bytes.utf8.encode(namespaces_1.ENTRY_SEED),
            namespaceId.toBytes(),
            anchor_1.utils.bytes.utf8.encode(identifier),
        ], namespaces_1.NAMESPACES_PROGRAM_ID);
    }
    static delegateWalletKey(delegateWallet, programId = ChatSdk.ID) {
        return web3_js_1.PublicKey.findProgramAddress([Buffer.from("delegate-wallet", "utf-8"), delegateWallet.toBuffer()], programId);
    }
    static profileKey(wallet, programId = ChatSdk.ID) {
        return web3_js_1.PublicKey.findProgramAddress([Buffer.from("wallet_profile", "utf-8"), wallet.toBuffer()], programId);
    }
    static settingsKey(wallet, programId = ChatSdk.ID) {
        return web3_js_1.PublicKey.findProgramAddress([Buffer.from("settings", "utf-8"), wallet.toBuffer()], programId);
    }
    static namespacesKey(programId = ChatSdk.ID) {
        return web3_js_1.PublicKey.findProgramAddress([Buffer.from("namespaces", "utf-8")], programId);
    }
    initializeNamespacesInstructions() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.getNamespaces();
                return {
                    instructions: [],
                    signers: [],
                    output: null,
                };
            }
            catch (e) {
                // This is expected
            }
            const [namespaces] = yield ChatSdk.namespacesKey();
            const [chatNamespace, chatNamespaceBump] = yield web3_js_1.PublicKey.findProgramAddress([
                anchor_1.utils.bytes.utf8.encode(namespaces_1.NAMESPACE_SEED),
                anchor_1.utils.bytes.utf8.encode(IdentifierType.Chat),
            ], namespaces_1.NAMESPACES_PROGRAM_ID);
            const [userNamespace, userNamespaceBump] = yield web3_js_1.PublicKey.findProgramAddress([
                anchor_1.utils.bytes.utf8.encode(namespaces_1.NAMESPACE_SEED),
                anchor_1.utils.bytes.utf8.encode(IdentifierType.User),
            ], namespaces_1.NAMESPACES_PROGRAM_ID);
            const instructions = [];
            instructions.push(yield this.program.instruction.initializeNamespacesV0({
                chatNamespaceName: IdentifierType.Chat,
                userNamespaceName: IdentifierType.User,
                chatNamespaceBump,
                userNamespaceBump,
            }, {
                accounts: {
                    payer: this.wallet.publicKey,
                    namespaces,
                    namespacesProgram: namespaces_1.NAMESPACES_PROGRAM_ID,
                    chatNamespace,
                    userNamespace,
                    systemProgram: web3_js_1.SystemProgram.programId,
                },
            }));
            return {
                instructions,
                signers: [],
                output: null,
            };
        });
    }
    initializeNamespaces() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.execute(this.initializeNamespacesInstructions(), this.wallet.publicKey, "confirmed");
        });
    }
    _getNamespaces() {
        return __awaiter(this, void 0, void 0, function* () {
            const key = (yield ChatSdk.namespacesKey(this.programId))[0];
            const namespaces = yield this.program.account.namespacesV0.fetch(key);
            return Object.assign(Object.assign({}, namespaces), { publicKey: key, chat: yield this.getNamespace(namespaces.chatNamespace), user: yield this.getNamespace(namespaces.userNamespace) });
        });
    }
    getNamespaces() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._namespaces) {
                return this._namespaces;
            }
            this._namespacesPromise = this._getNamespaces();
            this._namespaces = yield this._namespacesPromise;
            return this._namespaces;
        });
    }
    /**
     * Attempt to claim the identifier. If the identifier entry already exists, attempt to approve/claim.
     * @param param0
     * @returns
     */
    claimIdentifierInstructions({ payer = this.wallet.publicKey, owner = this.wallet.publicKey, identifier, type, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = new web3_js_1.Transaction();
            const certificateMintKeypair = web3_js_1.Keypair.generate();
            let signers = [];
            let certificateMint = certificateMintKeypair.publicKey;
            const namespaces = yield this.getNamespaces();
            let namespaceName;
            let namespaceId;
            if (type === IdentifierType.Chat) {
                namespaceName = namespaces.chat.name;
                namespaceId = namespaces.chatNamespace;
            }
            else {
                namespaceName = namespaces.user.name;
                namespaceId = namespaces.userNamespace;
            }
            const [entryId] = yield ChatSdk.entryKey(namespaceId, identifier);
            const existingEntry = yield this.namespacesProgram.account.entry.fetchNullable(entryId);
            if (!existingEntry) {
                yield (0, namespaces_1.withInitNameEntry)(transaction, this.provider.connection, this.provider.wallet, namespaceName, identifier);
                signers.push(certificateMintKeypair);
                yield (0, namespaces_1.withInitNameEntryMint)(transaction, this.provider.connection, this.provider.wallet, namespaceName, identifier, certificateMintKeypair);
            }
            else {
                certificateMint = existingEntry.mint;
                signers = [];
            }
            const [claimRequestId] = yield web3_js_1.PublicKey.findProgramAddress([
                anchor_1.utils.bytes.utf8.encode(namespaces_1.CLAIM_REQUEST_SEED),
                namespaceId.toBytes(),
                anchor_1.utils.bytes.utf8.encode(identifier),
                owner.toBytes(),
            ], namespaces_1.NAMESPACES_PROGRAM_ID);
            if (!(yield this.provider.connection.getAccountInfo(claimRequestId))) {
                yield (0, namespaces_1.withCreateClaimRequest)(this.provider.connection, this.provider.wallet, namespaceName, identifier, owner, transaction);
            }
            const instructions = transaction.instructions;
            const certificateMintMetadata = yield mpl_token_metadata_1.Metadata.getPDA(certificateMint);
            const caseInsensitiveMarker = (yield ChatSdk.caseInsensitiveMarkerKey(namespaceId, identifier, this.programId))[0];
            if (type === IdentifierType.Chat && !(existingEntry === null || existingEntry === void 0 ? void 0 : existingEntry.isClaimed)) {
                instructions.push(yield this.program.instruction.approveChatIdentifierV0({
                    accounts: {
                        payer,
                        caseInsensitiveMarker,
                        namespaces: namespaces.publicKey,
                        chatNamespace: namespaces.chatNamespace,
                        claimRequest: claimRequestId,
                        entry: entryId,
                        certificateMintMetadata,
                        namespacesProgram: namespaces_1.NAMESPACES_PROGRAM_ID,
                        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                        systemProgram: web3_js_1.SystemProgram.programId,
                    },
                }));
            }
            else if (!(existingEntry === null || existingEntry === void 0 ? void 0 : existingEntry.isClaimed)) {
                instructions.push(yield this.program.instruction.approveUserIdentifierV0({
                    accounts: {
                        payer,
                        caseInsensitiveMarker,
                        namespaces: namespaces.publicKey,
                        userNamespace: namespaces.userNamespace,
                        claimRequest: claimRequestId,
                        entry: entryId,
                        certificateMintMetadata,
                        namespacesProgram: namespaces_1.NAMESPACES_PROGRAM_ID,
                        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                        systemProgram: web3_js_1.SystemProgram.programId,
                    },
                }));
            }
            const tx2 = new web3_js_1.Transaction();
            if (!(existingEntry === null || existingEntry === void 0 ? void 0 : existingEntry.isClaimed)) {
                yield (0, namespaces_1.withClaimNameEntry)(tx2, this.provider.connection, Object.assign(Object.assign({}, this.provider.wallet), { publicKey: owner }), namespaceName, identifier, certificateMint, 0, owner, payer);
            }
            return {
                instructions: [instructions, tx2.instructions],
                signers: [signers, []],
                output: { certificateMint },
            };
        });
    }
    claimIdentifier(args, commitment) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.executeBig(this.claimIdentifierInstructions(args), args.payer, commitment);
        });
    }
    claimChatAdminInstructions({ chat, admin = this.wallet.publicKey, }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const chatAcc = (yield this.getChat(chat));
            if (chatAcc.identifierCertificateMint && !((_a = chatAcc.admin) === null || _a === void 0 ? void 0 : _a.equals(admin))) {
                const identifierCertificateMintAccount = yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, chatAcc.identifierCertificateMint, admin, true);
                return {
                    output: null,
                    signers: [],
                    instructions: [
                        yield this.instruction.claimAdminV0({
                            accounts: {
                                chat,
                                identifierCertificateMintAccount,
                                ownerWallet: admin,
                            },
                        }),
                    ],
                };
            }
            return {
                output: null,
                signers: [],
                instructions: [],
            };
        });
    }
    claimAdmin(args, commitment = "confirmed") {
        return __awaiter(this, void 0, void 0, function* () {
            return this.execute(this.claimChatAdminInstructions(args), args.admin, commitment);
        });
    }
    closeChatInstructions({ refund = this.wallet.publicKey, chat, admin = this.wallet.publicKey, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const instructions = [];
            instructions.push(...(yield this.claimChatAdminInstructions({
                chat,
                admin,
            })).instructions);
            const chatPermissionsKey = (yield ChatSdk.chatPermissionsKey(chat))[0];
            const chatPermissions = yield this.getChatPermissions(chatPermissionsKey);
            if (chatPermissions) {
                instructions.push(yield this.instruction.closeChatPermissionsV0({
                    accounts: {
                        refund,
                        admin,
                        chat,
                        chatPermissions: chatPermissionsKey,
                        systemProgram: web3_js_1.SystemProgram.programId,
                    },
                }));
            }
            instructions.push(yield this.instruction.closeChatV0({
                accounts: {
                    refund,
                    admin,
                    chat,
                    systemProgram: web3_js_1.SystemProgram.programId,
                },
            }));
            return {
                signers: [],
                instructions,
                output: null,
            };
        });
    }
    closeChat(args, commitment) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.execute(this.closeChatInstructions(args), args.refund, commitment);
        });
    }
    initializeChatInstructions({ payer = this.wallet.publicKey, identifierCertificateMint, identifier, name, permissions, postMessageProgramId = this.programId, imageUrl = "", metadataUrl = "", chatKeypair, admin = this.wallet.publicKey, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const instructions = [];
            const signers = [];
            if (identifier) {
                const identifierInsts = yield this.claimIdentifierInstructions({
                    payer,
                    owner: admin,
                    identifier,
                    type: IdentifierType.Chat,
                });
                identifierCertificateMint = identifierInsts.output.certificateMint;
                instructions.push(...identifierInsts.instructions);
                signers.push(...identifierInsts.signers);
            }
            const initChatInstructions = [];
            const initChatSigners = [];
            let chat;
            if (identifierCertificateMint) {
                chat = (yield ChatSdk.chatKey(identifierCertificateMint, this.programId))[0];
                const namespaces = yield this.getNamespaces();
                if (!identifier) {
                    const metadataKey = yield mpl_token_metadata_1.Metadata.getPDA(identifierCertificateMint);
                    const metadata = yield new mpl_token_metadata_1.Metadata(metadataKey, (yield this.provider.connection.getAccountInfo(metadataKey)));
                    const [entryName] = metadata.data.data.name.split(".");
                    identifier = entryName;
                }
                const [entry] = yield yield ChatSdk.entryKey(namespaces.chatNamespace, identifier);
                const identifierCertificateMintAccount = yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, identifierCertificateMint, admin, true);
                const instruction = yield this.instruction.initializeChatV0({
                    name,
                    imageUrl: imageUrl,
                    metadataUrl: metadataUrl,
                    postMessageProgramId,
                }, {
                    accounts: {
                        payer,
                        chat,
                        namespaces: namespaces.publicKey,
                        entry,
                        identifierCertificateMint,
                        identifierCertificateMintAccount,
                        ownerWallet: admin,
                        systemProgram: web3_js_1.SystemProgram.programId,
                    },
                });
                initChatInstructions.push(instruction);
            }
            else {
                chatKeypair = chatKeypair || web3_js_1.Keypair.generate();
                chat = chatKeypair.publicKey;
                const instruction = yield this.instruction.initializeUnidentifiedChatV0({
                    name,
                    imageUrl: imageUrl,
                    metadataUrl: metadataUrl,
                    postMessageProgramId,
                }, admin, {
                    accounts: {
                        payer,
                        chat,
                        systemProgram: web3_js_1.SystemProgram.programId,
                    },
                });
                initChatInstructions.push(instruction);
                initChatSigners.push(chatKeypair);
            }
            let chatPermissions = undefined;
            if (permissions) {
                let { readPermissionKey, postPermissionKey, postPermissionAction = chat_1.PostAction.Hold, postPayDestination, postPermissionAmount = 1, defaultReadPermissionAmount = 1, readPermissionType = chat_1.PermissionType.Token, postPermissionType = chat_1.PermissionType.Token, } = permissions;
                if (readPermissionKey.equals(spl_token_1.NATIVE_MINT)) {
                    readPermissionType = chat_1.PermissionType.Native;
                }
                if (postPermissionKey.equals(spl_token_1.NATIVE_MINT)) {
                    postPermissionType = chat_1.PermissionType.Native;
                }
                // find the permission amounts
                let postAmount;
                try {
                    const postMint = yield (0, spl_utils_1.getMintInfo)(this.provider, postPermissionKey);
                    postAmount = (0, spl_utils_1.toBN)(postPermissionAmount, postMint);
                }
                catch (_a) {
                    // permission key isn't a mint account
                    postAmount = new bn_js_1.default(postPermissionAmount);
                }
                let readAmount;
                try {
                    const readMint = yield (0, spl_utils_1.getMintInfo)(this.provider, readPermissionKey);
                    readAmount = (0, spl_utils_1.toBN)(defaultReadPermissionAmount, readMint);
                }
                catch (_b) {
                    // permission key isn't a mint account
                    readAmount = new bn_js_1.default(defaultReadPermissionAmount);
                }
                chatPermissions = (yield ChatSdk.chatPermissionsKey(chat, this.programId))[0];
                initChatInstructions.push(yield this.instruction.initializeChatPermissionsV0({
                    defaultReadPermissionAmount: readAmount,
                    postPermissionKey,
                    readPermissionKey,
                    postPermissionAction: postPermissionAction,
                    postPermissionAmount: postAmount,
                    postPayDestination: postPayDestination || null,
                    readPermissionType: readPermissionType,
                    postPermissionType: postPermissionType,
                }, {
                    accounts: {
                        payer,
                        chat,
                        chatPermissions: chatPermissions,
                        admin,
                        systemProgram: web3_js_1.SystemProgram.programId,
                    },
                }));
            }
            instructions.push(initChatInstructions);
            signers.push(initChatSigners);
            return {
                output: {
                    chat,
                    chatPermissions,
                    chatKeypair,
                    identifierCertificateMint,
                },
                signers,
                instructions,
            };
        });
    }
    initializeChat(args, commitment = "confirmed") {
        return __awaiter(this, void 0, void 0, function* () {
            return this.executeBig(this.initializeChatInstructions(args), args.payer, commitment);
        });
    }
    initializeProfileInstructions({ payer = this.wallet.publicKey, ownerWallet = this.wallet.publicKey, identifierCertificateMint, identifier, imageUrl = "", metadataUrl = "", }) {
        return __awaiter(this, void 0, void 0, function* () {
            const instructions = [];
            const walletProfile = (yield ChatSdk.profileKey(ownerWallet, this.programId))[0];
            const namespaces = yield this.getNamespaces();
            const metadataKey = yield mpl_token_metadata_1.Metadata.getPDA(identifierCertificateMint);
            if (!identifier) {
                const metadata = yield new mpl_token_metadata_1.Metadata(metadataKey, (yield this.provider.connection.getAccountInfo(metadataKey)));
                const [entryName] = metadata.data.data.name.split(".");
                identifier = entryName;
            }
            const [entry] = yield ChatSdk.entryKey(namespaces.userNamespace, identifier);
            const identifierCertificateMintAccount = yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, identifierCertificateMint, ownerWallet, true);
            instructions.push(yield this.instruction.initializeProfileV0({
                imageUrl,
                metadataUrl,
            }, {
                accounts: {
                    payer,
                    walletProfile,
                    namespaces: namespaces.publicKey,
                    entry,
                    identifierCertificateMint,
                    identifierCertificateMintAccount,
                    ownerWallet,
                    systemProgram: web3_js_1.SystemProgram.programId,
                },
            }));
            return {
                output: {
                    walletProfile,
                },
                instructions,
                signers: [],
            };
        });
    }
    initializeProfile(args, commitment = "confirmed") {
        return __awaiter(this, void 0, void 0, function* () {
            return this.execute(this.initializeProfileInstructions(args), args.payer, commitment);
        });
    }
    initializeSettingsInstructions({ payer = this.wallet.publicKey, ownerWallet = this.wallet.publicKey, settings, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const instructions = [];
            const settingsKey = (yield ChatSdk.settingsKey(ownerWallet, this.programId))[0];
            const symmKey = yield generateSymmetricKey();
            const bufEncryptedSeed = yield this.litJsSdk.encryptWithSymmetricKey(symmKey, this.litJsSdk.uint8arrayFromString(settings.delegateWalletSeed));
            const encryptedDelegateWallet = buf2hex(yield bufEncryptedSeed.arrayBuffer());
            yield this.litAuth();
            const encryptedSymmetricKey = this.litJsSdk.uint8arrayToString(yield this.litClient.saveEncryptionKey({
                solRpcConditions: [myWalletPermissions(ownerWallet)],
                symmetricKey: new Uint8Array(yield crypto.subtle.exportKey("raw", symmKey)),
                authSig: this.litAuthSig,
                chain: this.chain,
            }), "base16");
            const encryptedSettings = {
                encryptedDelegateWallet,
                encryptedSymmetricKey,
            };
            instructions.push(yield this.instruction.initializeSettingsV0(encryptedSettings, {
                accounts: {
                    payer,
                    settings: settingsKey,
                    ownerWallet,
                    rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                    systemProgram: web3_js_1.SystemProgram.programId,
                },
            }));
            return {
                output: {
                    settings: settingsKey,
                },
                instructions,
                signers: [],
            };
        });
    }
    initializeSettings(args, commitment = "confirmed") {
        return __awaiter(this, void 0, void 0, function* () {
            return this.execute(this.initializeSettingsInstructions(args), args.payer, commitment);
        });
    }
    initializeDelegateWalletInstructions({ payer = this.wallet.publicKey, ownerWallet = this.wallet.publicKey, delegateWalletKeypair, delegateWallet, }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!delegateWalletKeypair && !delegateWallet) {
                delegateWalletKeypair = web3_js_1.Keypair.generate();
            }
            if (!delegateWallet) {
                delegateWallet = delegateWalletKeypair.publicKey;
            }
            const delegateWalletAcc = (yield ChatSdk.delegateWalletKey(delegateWallet))[0];
            const instructions = [];
            const signers = [delegateWalletKeypair].filter(spl_utils_1.truthy);
            instructions.push(yield this.instruction.initializeDelegateWalletV0({
                accounts: {
                    delegateWallet: delegateWalletAcc,
                    payer,
                    owner: ownerWallet,
                    delegate: delegateWallet,
                    systemProgram: web3_js_1.SystemProgram.programId,
                },
            }));
            return {
                output: {
                    delegateWallet: delegateWalletAcc,
                    delegateWalletKeypair,
                },
                instructions,
                signers,
            };
        });
    }
    initializeDelegateWallet(args, commitment = "confirmed") {
        return __awaiter(this, void 0, void 0, function* () {
            return this.execute(this.initializeDelegateWalletInstructions(args), args.payer, commitment);
        });
    }
    sendMessageInstructions({ sender = this.wallet.publicKey, chat, message: rawMessage, readPermissionAmount, delegateWallet, delegateWalletKeypair, encrypted = true, nftMint, readPermissionKey, readPermissionType, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { referenceMessageId, type } = rawMessage, message = __rest(rawMessage, ["referenceMessageId", "type"]);
            if (encrypted) {
                yield this.litAuth();
            }
            let { fileAttachments } = message, normalMessage = __rest(message, ["fileAttachments"]);
            const chatPermissions = (yield ChatSdk.chatPermissionsKey(chat, this.programId))[0];
            const chatPermissionsAcc = (yield this.getChatPermissions(chatPermissions));
            let readAmount;
            try {
                const readMint = yield (0, spl_utils_1.getMintInfo)(this.provider, chatPermissionsAcc.readPermissionKey);
                readAmount = (0, spl_utils_1.toBN)(readPermissionAmount || chatPermissionsAcc.defaultReadPermissionAmount, readMint);
            }
            catch (_a) {
                readAmount = new bn_js_1.default(readPermissionAmount || chatPermissionsAcc.defaultReadPermissionAmount);
            }
            const accessControlConditionsToUse = getAccessConditions(this.conditionVersion, chatPermissionsAcc.readPermissionKey, readAmount, this.chain, chatPermissionsAcc.readPermissionType);
            const storedSymKey = this.symKeyStorage.getSymKeyToUse(chatPermissionsAcc.readPermissionKey, readAmount.toNumber());
            let symmKey;
            if (encrypted) {
                if (storedSymKey) {
                    symmKey = yield importSymmetricKey(Buffer.from(storedSymKey.symKey, "hex"));
                }
                else {
                    symmKey = yield generateSymmetricKey();
                }
            }
            // Encrypt fileAttachements if needed
            if (fileAttachments && encrypted) {
                fileAttachments = yield Promise.all(fileAttachments.map((fileAttachment) => __awaiter(this, void 0, void 0, function* () {
                    const encrypted = yield this.litJsSdk.encryptWithSymmetricKey(symmKey, yield fileAttachment.file.arrayBuffer());
                    return {
                        file: new File([encrypted], fileAttachment.file.name + ".encrypted"),
                        name: fileAttachment.name,
                    };
                })));
            }
            // Attach files to either attachments or encryptedAttachments based on whether they were encrypted
            if (fileAttachments) {
                let attachments;
                if (encrypted) {
                    normalMessage.encryptedAttachments =
                        normalMessage.encryptedAttachments || [];
                    attachments = normalMessage.encryptedAttachments;
                }
                else {
                    normalMessage.attachments = normalMessage.attachments || [];
                    attachments = normalMessage.attachments;
                }
                const uploaded = ((yield (0, shdw_1.uploadFiles)(this.provider, fileAttachments.map((f) => f.file), delegateWalletKeypair)) || []).filter(spl_utils_1.truthy);
                if (uploaded.length != fileAttachments.length) {
                    throw new Error("Failed to upload all files");
                }
                attachments.push(...uploaded.map((uploaded, i) => ({
                    file: uploaded,
                    name: fileAttachments[i].name,
                })));
            }
            // Encrypt the actual json structure
            let encryptedSymmetricKey, encryptedString;
            if (encrypted) {
                const encryptedStringOut = yield this.litJsSdk.encryptWithSymmetricKey(symmKey, this.litJsSdk.uint8arrayFromString(JSON.stringify(normalMessage)));
                encryptedString = buf2hex(yield encryptedStringOut.arrayBuffer());
                if (storedSymKey) {
                    encryptedSymmetricKey = storedSymKey.encryptedSymKey;
                }
                else {
                    // Cache the sym key we're using
                    encryptedSymmetricKey = this.litJsSdk.uint8arrayToString(yield this.litClient.saveEncryptionKey({
                        solRpcConditions: accessControlConditionsToUse,
                        symmetricKey: new Uint8Array(yield crypto.subtle.exportKey("raw", symmKey)),
                        authSig: this.litAuthSig,
                        chain: this.chain,
                    }), "base16");
                    this.symKeyStorage.setSymKeyToUse(chatPermissionsAcc.readPermissionKey, readAmount.toNumber(), {
                        symKey: Buffer.from(yield exportSymmetricKey(symmKey)).toString("hex"),
                        encryptedSymKey: encryptedSymmetricKey,
                        timeMillis: new Date().valueOf(),
                    });
                }
            }
            else {
                encryptedSymmetricKey = "";
                encryptedString = JSON.stringify(message);
            }
            const postPermissionAccount = yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, nftMint ? nftMint : chatPermissionsAcc.postPermissionKey, sender, true);
            const remainingAccounts = [];
            if (nftMint) {
                remainingAccounts.push({
                    pubkey: yield mpl_token_metadata_1.Metadata.getPDA(nftMint),
                    isWritable: false,
                    isSigner: false,
                });
            }
            if (delegateWallet || delegateWalletKeypair) {
                if (!delegateWallet) {
                    delegateWallet = delegateWalletKeypair.publicKey;
                }
                remainingAccounts.push({
                    pubkey: (yield ChatSdk.delegateWalletKey(delegateWallet, this.programId))[0],
                    isWritable: false,
                    isSigner: false,
                });
            }
            const contentLength = encryptedString.length;
            const numGroups = Math.ceil(contentLength / MESSAGE_MAX_CHARACTERS);
            const instructionGroups = [];
            const signerGroups = [];
            const messageId = (0, uuid_1.v4)();
            const ix = (chatPermissionsAcc === null || chatPermissionsAcc === void 0 ? void 0 : chatPermissionsAcc.postPermissionKey.equals(spl_token_1.NATIVE_MINT))
                ? this.instruction.sendNativeMessageV0
                : this.instruction.sendTokenMessageV0;
            for (let i = 0; i < numGroups; i++) {
                const instructions = [];
                instructions.push(yield ix({
                    conditionVersion: this.conditionVersion,
                    id: messageId,
                    content: encryptedString.slice(i * MESSAGE_MAX_CHARACTERS, (i + 1) * MESSAGE_MAX_CHARACTERS),
                    encryptedSymmetricKey,
                    readPermissionAmount: readAmount,
                    readPermissionType: (readPermissionType ||
                        chatPermissionsAcc.readPermissionType),
                    readPermissionKey: readPermissionKey || chatPermissionsAcc.readPermissionKey,
                    totalParts: numGroups,
                    currentPart: i,
                    messageType: chat_1.MessageType[capitalizeFirstLetter(type)],
                    referenceMessageId: referenceMessageId || null,
                }, {
                    accounts: {
                        chat,
                        chatPermissions,
                        sender,
                        signer: delegateWallet || sender,
                        // @ts-ignore
                        postPermissionAccount,
                        postPermissionMint: nftMint
                            ? nftMint
                            : chatPermissionsAcc.postPermissionKey,
                        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                    },
                    remainingAccounts,
                }));
                instructionGroups.push(instructions);
                signerGroups.push([delegateWalletKeypair].filter(spl_utils_1.truthy));
            }
            return {
                instructions: instructionGroups,
                output: { messageId },
                signers: signerGroups,
            };
        });
    }
    sendMessage(args, commitment = "confirmed") {
        return __awaiter(this, void 0, void 0, function* () {
            return this.executeBig(this.sendMessageInstructions(args), args.payer, commitment);
        });
    }
    createMetadataForBondingInstructions({ metadataUpdateAuthority = this.provider.wallet.publicKey, metadata, targetMintKeypair = web3_js_1.Keypair.generate(), decimals, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const targetMint = targetMintKeypair.publicKey;
            const instructions = [];
            const signers = [];
            instructions.push(...(yield (0, spl_utils_1.createMintInstructions)(this.tokenBondingProgram.provider, this.provider.wallet.publicKey, targetMint, decimals)));
            signers.push(targetMintKeypair);
            const { instructions: metadataInstructions, signers: metadataSigners, output, } = yield this.tokenMetadataProgram.createMetadataInstructions({
                data: metadata,
                mint: targetMint,
                mintAuthority: this.provider.wallet.publicKey,
                authority: metadataUpdateAuthority,
            });
            instructions.push(...metadataInstructions);
            signers.push(...metadataSigners);
            instructions.push(spl_token_1.Token.createSetAuthorityInstruction(spl_token_1.TOKEN_PROGRAM_ID, targetMint, (yield spl_token_bonding_1.SplTokenBonding.tokenBondingKey(targetMint))[0], "MintTokens", this.provider.wallet.publicKey, []));
            return {
                instructions,
                signers,
                output: Object.assign(Object.assign({}, output), { mint: targetMint }),
            };
        });
    }
}
exports.ChatSdk = ChatSdk;
ChatSdk.ID = new web3_js_1.PublicKey("chatGL6yNgZT2Z3BeMYGcgdMpcBKdmxko4C5UhEX4To");
function getAccessConditions(conditionVersion, readKey, threshold, chain, permissionType) {
    if (conditionVersion === 0) {
        return [tokenAccessPermissions(readKey, threshold, chain)];
    }
    if (conditionVersion === 1) {
        return [
            collectionAccessPermissions(readKey, threshold, chain),
            { operator: "or" },
            tokenAccessPermissions(readKey, threshold, chain),
        ];
    }
    const permissionTypeStr = Object.keys(permissionType)[0];
    if (permissionTypeStr === "token") {
        return [tokenAccessPermissions(readKey, threshold, chain)];
    }
    else if (permissionTypeStr == "native") {
        return [nativePermissions(readKey, threshold, chain)];
    }
    return [collectionAccessPermissions(readKey, threshold, chain)];
}
function collectionAccessPermissions(permittedCollection, threshold, chain) {
    return {
        method: "balanceOfMetaplexCollection",
        params: [permittedCollection.toBase58()],
        chain,
        returnValueTest: {
            key: "",
            comparator: ">=",
            value: threshold.toString(10),
        },
    };
}
function tokenAccessPermissions(readPermissionMint, threshold, chain) {
    return {
        method: "balanceOfToken",
        params: [readPermissionMint.toBase58()],
        chain,
        returnValueTest: {
            key: `$.amount`,
            comparator: ">=",
            value: threshold.toString(10),
        },
    };
}
function myWalletPermissions(wallet) {
    return {
        method: "",
        params: [":userAddress"],
        chain: "solana",
        returnValueTest: {
            key: "",
            comparator: "=",
            value: wallet.toBase58(),
        },
    };
}
function nativePermissions(wallet, threshold, chain) {
    return {
        method: "getBalance",
        params: [wallet.toBase58()],
        chain,
        returnValueTest: {
            key: "",
            comparator: ">=",
            value: threshold.toString(10),
        },
    };
}
function buf2hex(buffer) {
    // buffer is an ArrayBuffer
    return [...new Uint8Array(buffer)]
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("");
}
function ensurePubkey(arg0) {
    if (typeof arg0 === "string") {
        return new web3_js_1.PublicKey(arg0);
    }
    return arg0;
}
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
//# sourceMappingURL=index.js.map