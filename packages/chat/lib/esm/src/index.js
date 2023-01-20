import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { CLAIM_REQUEST_SEED, ENTRY_SEED, NAMESPACES_IDL, NAMESPACES_PROGRAM_ID, NAMESPACE_SEED, withClaimNameEntry, withCreateClaimRequest, withInitNameEntry, withInitNameEntryMint, } from "@cardinal/namespaces";
import { LocalStorageLRU } from "@cocalc/local-storage-lru";
import { Program, utils, } from "@project-serum/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, NATIVE_MINT, Token, TOKEN_PROGRAM_ID, } from "@solana/spl-token";
import { Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction, } from "@solana/web3.js";
import { AnchorSdk, getMintInfo, toBN, truthy, createMintInstructions, SplTokenMetadata, } from "@strata-foundation/spl-utils";
import { SplTokenBonding } from "@strata-foundation/spl-token-bonding";
import BN from "bn.js";
// @ts-ignore
import LitJsSdk from "lit-js-sdk";
// @ts-ignore
import { v4 as uuid } from "uuid";
import { PermissionType, PostAction, MessageType as RawMessageType, } from "./generated/chat";
import { getAuthSig } from "./lit";
import { uploadFiles } from "./shdw";
const MESSAGE_MAX_CHARACTERS = 352; // TODO: This changes with optional accounts in the future
export { RawMessageType };
export * from "./generated/chat";
export * from "./shdw";
export * from "./lit";
const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
const storage = new LocalStorageLRU();
// 3 hours
const KEY_EXPIRY = 3 * 60 * 60 * 1000;
const CONDITION_VERSION = 2;
export class LocalSymKeyStorage {
    url;
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
const SYMM_KEY_ALGO_PARAMS = {
    name: "AES-CBC",
    length: 256,
};
async function generateSymmetricKey() {
    const symmKey = await crypto.subtle.generateKey(SYMM_KEY_ALGO_PARAMS, true, [
        "encrypt",
        "decrypt",
    ]);
    return symmKey;
}
export async function importSymmetricKey(symmKey) {
    // @ts-ignore
    const importedSymmKey = await crypto.subtle.importKey("raw", symmKey, SYMM_KEY_ALGO_PARAMS, true, ["encrypt", "decrypt"]);
    return importedSymmKey;
}
export function exportSymmetricKey(symmKey) {
    return crypto.subtle.exportKey("raw", symmKey);
}
export var MessageType;
(function (MessageType) {
    MessageType["Text"] = "text";
    MessageType["Html"] = "html";
    MessageType["Gify"] = "gify";
    MessageType["Image"] = "image";
    MessageType["React"] = "react";
})(MessageType || (MessageType = {}));
const PROGRAM_LOG = "Program log: ";
const PROGRAM_DATA = "Program data: ";
const PROGRAM_LOG_START_INDEX = PROGRAM_LOG.length;
const PROGRAM_DATA_START_INDEX = PROGRAM_DATA.length;
export var IdentifierType;
(function (IdentifierType) {
    IdentifierType["Chat"] = "chat";
    IdentifierType["User"] = "me";
})(IdentifierType || (IdentifierType = {}));
function puff(str, len) {
    return str.padEnd(32, "\0");
}
function depuff(str) {
    return str.replace(new RegExp("\0", "g"), "");
}
export class ChatSdk extends AnchorSdk {
    litClient;
    litAuthSig;
    chain;
    authingLit;
    symKeyStorage;
    symKeyFetchCache;
    litJsSdk; // to use in nodejs, manually set this to the nodejs lit client. see tests for example
    namespacesProgram;
    conditionVersion = CONDITION_VERSION;
    _namespaces = null;
    _namespacesPromise = null;
    tokenBondingProgram;
    tokenMetadataProgram;
    static ID = new PublicKey("chatGL6yNgZT2Z3BeMYGcgdMpcBKdmxko4C5UhEX4To");
    get isLitAuthed() {
        return Boolean(this.litAuthSig);
    }
    async _litAuth() {
        const cached = storage.get("lit-auth-sol-signature");
        const cachedDate = storage.get("lit-auth-sol-signature-date") || 0;
        const cachedAuthSig = JSON.parse(cached);
        if (!this.wallet || !this.wallet.publicKey) {
            return;
        }
        if (
        // TODO: When sigs expire enable this again
        // Number(cachedDate) >= new Date().valueOf() - 24 * 60 * 60 * 1000 &&
        this.wallet.publicKey.toBase58() === cachedAuthSig?.address) {
            this.litAuthSig = cachedAuthSig;
            return;
        }
        try {
            // @ts-ignore
            if (!this.wallet.signMessage) {
                throw new Error("This wallet does not support signMessage. Please use another wallet");
            }
            this.litAuthSig = await getAuthSig(this.wallet.publicKey, 
            // @ts-ignore
            this.wallet);
            storage.set("lit-auth-sol-signature", JSON.stringify(this.litAuthSig));
            storage.set("lit-auth-sol-signature-date", new Date().valueOf().toString());
        }
        finally {
            this.authingLit = null;
        }
    }
    async litAuth() {
        await this.authingLit;
        if (!this.isLitAuthed && !this.authingLit) {
            this.authingLit = this._litAuth();
        }
        return this.authingLit;
    }
    async getNamespace(namespace) {
        return (await this.namespacesProgram.account.namespace.fetch(namespace));
    }
    static async init(provider, chatProgramId = ChatSdk.ID, splTokenBondingProgramId = SplTokenBonding.ID) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const namespacesProgram = new Program(NAMESPACES_IDL, NAMESPACES_PROGRAM_ID, provider);
        const ChatIDLJson = await Program.fetchIdl(chatProgramId, provider);
        const chat = new Program(ChatIDLJson, chatProgramId, provider);
        const tokenMetadataProgram = await SplTokenMetadata.init(provider);
        const tokenBondingProgram = await SplTokenBonding.init(provider, splTokenBondingProgramId);
        const client = new LitJsSdk.LitNodeClient({
            alertWhenUnauthorized: false,
            debug: false,
        });
        try {
            await client.connect();
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
    }
    constructor({ provider, program, litClient, namespacesProgram, 
    // @ts-ignore
    symKeyStorage = new LocalSymKeyStorage(provider.connection._rpcEndpoint), tokenBondingProgram, tokenMetadataProgram, }) {
        super({ provider, program });
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
        this.litJsSdk = LitJsSdk;
        this.tokenBondingProgram = tokenBondingProgram;
        this.tokenMetadataProgram = tokenMetadataProgram;
    }
    entryDecoder = (pubkey, account) => {
        const coded = this.namespacesProgram.coder.accounts.decode("entry", account.data);
        return {
            ...coded,
            publicKey: pubkey,
        };
    };
    chatDecoder = (pubkey, account) => {
        const coded = this.program.coder.accounts.decode("ChatV0", account.data);
        return {
            ...coded,
            name: depuff(coded.name),
            imageUrl: depuff(coded.imageUrl),
            metadataUrl: depuff(coded.metadataUrl),
            publicKey: pubkey,
        };
    };
    chatPermissionsDecoder = (pubkey, account) => {
        const coded = this.program.coder.accounts.decode("ChatPermissionsV0", account.data);
        return {
            ...coded,
            publicKey: pubkey,
        };
    };
    delegateWalletDecoder = (pubkey, account) => {
        const coded = this.program.coder.accounts.decode("DelegateWalletV0", account.data);
        return {
            ...coded,
            publicKey: pubkey,
        };
    };
    profileDecoder = (pubkey, account) => {
        const coded = this.program.coder.accounts.decode("ProfileV0", account.data);
        return {
            ...coded,
            imageUrl: depuff(coded.imageUrl),
            metadataUrl: depuff(coded.metadataUrl),
            publicKey: pubkey,
        };
    };
    settingsDecoder = (pubkey, account) => {
        const coded = this.program.coder.accounts.decode("SettingsV0", account.data);
        const that = this;
        return {
            ...coded,
            publicKey: pubkey,
            async getDelegateWalletSeed() {
                const symmetricKey = await that.getSymmetricKey(coded.encryptedSymmetricKey, [myWalletPermissions(coded.ownerWallet)]);
                return that.litJsSdk.decryptString(new Blob([
                    that.litJsSdk.uint8arrayFromString(coded.encryptedDelegateWallet, "base16"),
                ]), symmetricKey);
            },
        };
    };
    caseInsensitiveMarkerDecoder = (pubkey, account) => {
        const coded = this.program.coder.accounts.decode("CaseInsensitiveMarkerV0", account.data);
        return {
            ...coded,
            publicKey: pubkey,
        };
    };
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
            .filter(truthy)
            .sort((a, b) => a.startBlockTime - b.startBlockTime);
    }
    async _getSymmetricKey(encryptedSymmetricKey, accessControlConditions) {
        const storedKey = this.symKeyStorage.getSymKey(encryptedSymmetricKey);
        let symmetricKey = storedKey
            ? Buffer.from(storedKey, "hex")
            : undefined;
        if (!symmetricKey) {
            await this.litAuth();
            symmetricKey = await this.litClient.getEncryptionKey({
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
    }
    async getSymmetricKey(encryptedSymmetricKey, accessControlConditions) {
        // Cache promises so we don't fetch the same thing from lit multiple times
        if (!this.symKeyFetchCache[encryptedSymmetricKey]) {
            this.symKeyFetchCache[encryptedSymmetricKey] = this._getSymmetricKey(encryptedSymmetricKey, accessControlConditions);
        }
        return this.symKeyFetchCache[encryptedSymmetricKey];
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
        const { messageType, readPermissionAmount, chatKey, encryptedSymmetricKey, referenceMessageId, readPermissionKey, readPermissionType, ...rest } = parts[0];
        let decodedMessage;
        return {
            ...rest,
            complete: !incomplete,
            referenceMessageId,
            type: messageType && Object.keys(messageType)[0],
            encryptedSymmetricKey,
            startBlockTime: parts[0].blockTime,
            endBlockTime: parts[parts.length - 1].blockTime,
            txids: parts.map((part) => part.txid),
            readPermissionAmount,
            readPermissionKey,
            readPermissionType,
            content,
            chatKey,
            getDecodedMessage: async () => {
                if (decodedMessage) {
                    return decodedMessage;
                }
                let readAmount;
                try {
                    const readMint = await getMintInfo(this.provider, readPermissionKey);
                    readAmount = toBN(readPermissionAmount, readMint);
                }
                catch {
                    readAmount = new BN(readPermissionAmount);
                }
                if (encryptedSymmetricKey) {
                    await this.litAuth();
                    const accessControlConditions = getAccessConditions(parts[0].conditionVersion, readPermissionKey, readAmount, this.chain, readPermissionType);
                    try {
                        const blob = new Blob([
                            this.litJsSdk.uint8arrayFromString(content, "base16"),
                        ]);
                        const symmetricKey = await this.getSymmetricKey(encryptedSymmetricKey, accessControlConditions);
                        decodedMessage = JSON.parse(await this.litJsSdk.decryptString(blob, symmetricKey));
                        decodedMessage.decryptedAttachments = [];
                        decodedMessage.decryptedAttachments.push(...(await Promise.all((decodedMessage.encryptedAttachments || []).map(async (encryptedAttachment) => {
                            const blob = await fetch(
                            // @ts-ignore this is some legacy stuff where it could just be a url
                            encryptedAttachment.file || encryptedAttachment).then((r) => r.blob());
                            const arrBuffer = await this.litJsSdk.decryptFile({
                                symmetricKey,
                                file: blob,
                            });
                            return {
                                file: new Blob([arrBuffer]),
                                // @ts-ignore this is some legacy stuff where it could just be a url
                                name: encryptedAttachment.name || "Attachment",
                            };
                        }))));
                    }
                    catch (e) {
                        console.error("Failed to decode message", e);
                    }
                }
                else {
                    decodedMessage = JSON.parse(content);
                }
                return decodedMessage;
            },
            parts,
        };
    }
    /**
     * Get message parts from a tx. NOTE: It is highly reccommended you use accountFetchCache for efficiency.
     * @param param0
     * @returns
     */
    async getMessagePartsFromInflatedTx({ chat, txid, meta, blockTime, transaction, idl, logs = meta.logMessages }) {
        if (meta?.err) {
            return [];
        }
        const chatAcc = (await this.getChat(chat));
        if (!idl) {
            idl = await Program.fetchIdl(chatAcc.postMessageProgramId, this.provider);
        }
        if (!idl) {
            throw new Error("Chat only supports programs with published IDLs.");
        }
        // ensure all instructions are from the chat program id
        const rightProgram = !transaction || transaction.message.instructions.every((ix) => ensurePubkey(transaction.message.accountKeys[ix.programIdIndex]).equals(chatAcc.postMessageProgramId));
        if (!rightProgram) {
            return [];
        }
        const program = new Program(idl, chatAcc.postMessageProgramId, this.provider);
        const coder = program.coder;
        const messages = logs.map((log) => {
            const logStr = log.startsWith(PROGRAM_LOG)
                ? log.slice(PROGRAM_LOG_START_INDEX)
                : log.slice(PROGRAM_DATA_START_INDEX);
            const event = coder.events.decode(logStr);
            return event;
        }).filter(truthy);
        return Promise.all(messages
            .filter((d) => d.name === "MessagePartEventV0")
            .map(async (msg) => {
            const decoded = msg.data;
            let sender = decoded.sender;
            return {
                ...decoded,
                ...decoded.message,
                blockTime,
                txid,
                chatKey: decoded.chat,
                sender,
            };
        }));
    }
    /**
     * Get message parts from a tx. NOTE: It is highly reccommended you use accountFetchCache for efficiency.
     *
     * @param txid
     * @returns
     */
    async getMessagePartsFromTx({ chat, txid, idl, }) {
        const connection = this.provider.connection;
        const tx = await connection.getTransaction(txid, {
            commitment: "confirmed",
        });
        if (!tx) {
            return [];
        }
        if (tx.meta?.err) {
            return [];
        }
        return this.getMessagePartsFromInflatedTx({
            chat,
            txid,
            meta: tx.meta,
            blockTime: tx.blockTime,
            idl,
        });
    }
    static chatKey(identifierCertificateMint, programId = ChatSdk.ID) {
        return PublicKey.findProgramAddress([
            Buffer.from("identified-chat", "utf-8"),
            identifierCertificateMint.toBuffer(),
        ], programId);
    }
    static chatPermissionsKey(chat, programId = ChatSdk.ID) {
        return PublicKey.findProgramAddress([Buffer.from("permissions", "utf-8"), chat.toBuffer()], programId);
    }
    static caseInsensitiveMarkerKey(namespace, identifier, programId = ChatSdk.ID) {
        return PublicKey.findProgramAddress([
            Buffer.from("case_insensitive", "utf-8"),
            namespace.toBuffer(),
            utils.bytes.utf8.encode(identifier.toLowerCase()),
        ], programId);
    }
    static entryKey(namespaceId, identifier) {
        return PublicKey.findProgramAddress([
            utils.bytes.utf8.encode(ENTRY_SEED),
            namespaceId.toBytes(),
            utils.bytes.utf8.encode(identifier),
        ], NAMESPACES_PROGRAM_ID);
    }
    static delegateWalletKey(delegateWallet, programId = ChatSdk.ID) {
        return PublicKey.findProgramAddress([Buffer.from("delegate-wallet", "utf-8"), delegateWallet.toBuffer()], programId);
    }
    static profileKey(wallet, programId = ChatSdk.ID) {
        return PublicKey.findProgramAddress([Buffer.from("wallet_profile", "utf-8"), wallet.toBuffer()], programId);
    }
    static settingsKey(wallet, programId = ChatSdk.ID) {
        return PublicKey.findProgramAddress([Buffer.from("settings", "utf-8"), wallet.toBuffer()], programId);
    }
    static namespacesKey(programId = ChatSdk.ID) {
        return PublicKey.findProgramAddress([Buffer.from("namespaces", "utf-8")], programId);
    }
    async initializeNamespacesInstructions() {
        try {
            await this.getNamespaces();
            return {
                instructions: [],
                signers: [],
                output: null,
            };
        }
        catch (e) {
            // This is expected
        }
        const [namespaces] = await ChatSdk.namespacesKey();
        const [chatNamespace, chatNamespaceBump] = await PublicKey.findProgramAddress([
            utils.bytes.utf8.encode(NAMESPACE_SEED),
            utils.bytes.utf8.encode(IdentifierType.Chat),
        ], NAMESPACES_PROGRAM_ID);
        const [userNamespace, userNamespaceBump] = await PublicKey.findProgramAddress([
            utils.bytes.utf8.encode(NAMESPACE_SEED),
            utils.bytes.utf8.encode(IdentifierType.User),
        ], NAMESPACES_PROGRAM_ID);
        const instructions = [];
        instructions.push(await this.program.instruction.initializeNamespacesV0({
            chatNamespaceName: IdentifierType.Chat,
            userNamespaceName: IdentifierType.User,
            chatNamespaceBump,
            userNamespaceBump,
        }, {
            accounts: {
                payer: this.wallet.publicKey,
                namespaces,
                namespacesProgram: NAMESPACES_PROGRAM_ID,
                chatNamespace,
                userNamespace,
                systemProgram: SystemProgram.programId,
            },
        }));
        return {
            instructions,
            signers: [],
            output: null,
        };
    }
    async initializeNamespaces() {
        return this.execute(this.initializeNamespacesInstructions(), this.wallet.publicKey, "confirmed");
    }
    async _getNamespaces() {
        const key = (await ChatSdk.namespacesKey(this.programId))[0];
        const namespaces = await this.program.account.namespacesV0.fetch(key);
        return {
            ...namespaces,
            publicKey: key,
            chat: await this.getNamespace(namespaces.chatNamespace),
            user: await this.getNamespace(namespaces.userNamespace),
        };
    }
    async getNamespaces() {
        if (this._namespaces) {
            return this._namespaces;
        }
        this._namespacesPromise = this._getNamespaces();
        this._namespaces = await this._namespacesPromise;
        return this._namespaces;
    }
    /**
     * Attempt to claim the identifier. If the identifier entry already exists, attempt to approve/claim.
     * @param param0
     * @returns
     */
    async claimIdentifierInstructions({ payer = this.wallet.publicKey, owner = this.wallet.publicKey, identifier, type, }) {
        const transaction = new Transaction();
        const certificateMintKeypair = Keypair.generate();
        let signers = [];
        let certificateMint = certificateMintKeypair.publicKey;
        const namespaces = await this.getNamespaces();
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
        const [entryId] = await ChatSdk.entryKey(namespaceId, identifier);
        const existingEntry = await this.namespacesProgram.account.entry.fetchNullable(entryId);
        if (!existingEntry) {
            await withInitNameEntry(transaction, this.provider.connection, this.provider.wallet, namespaceName, identifier);
            signers.push(certificateMintKeypair);
            await withInitNameEntryMint(transaction, this.provider.connection, this.provider.wallet, namespaceName, identifier, certificateMintKeypair);
        }
        else {
            certificateMint = existingEntry.mint;
            signers = [];
        }
        const [claimRequestId] = await PublicKey.findProgramAddress([
            utils.bytes.utf8.encode(CLAIM_REQUEST_SEED),
            namespaceId.toBytes(),
            utils.bytes.utf8.encode(identifier),
            owner.toBytes(),
        ], NAMESPACES_PROGRAM_ID);
        if (!(await this.provider.connection.getAccountInfo(claimRequestId))) {
            await withCreateClaimRequest(this.provider.connection, this.provider.wallet, namespaceName, identifier, owner, transaction);
        }
        const instructions = transaction.instructions;
        const certificateMintMetadata = await Metadata.getPDA(certificateMint);
        const caseInsensitiveMarker = (await ChatSdk.caseInsensitiveMarkerKey(namespaceId, identifier, this.programId))[0];
        if (type === IdentifierType.Chat && !existingEntry?.isClaimed) {
            instructions.push(await this.program.instruction.approveChatIdentifierV0({
                accounts: {
                    payer,
                    caseInsensitiveMarker,
                    namespaces: namespaces.publicKey,
                    chatNamespace: namespaces.chatNamespace,
                    claimRequest: claimRequestId,
                    entry: entryId,
                    certificateMintMetadata,
                    namespacesProgram: NAMESPACES_PROGRAM_ID,
                    tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                },
            }));
        }
        else if (!existingEntry?.isClaimed) {
            instructions.push(await this.program.instruction.approveUserIdentifierV0({
                accounts: {
                    payer,
                    caseInsensitiveMarker,
                    namespaces: namespaces.publicKey,
                    userNamespace: namespaces.userNamespace,
                    claimRequest: claimRequestId,
                    entry: entryId,
                    certificateMintMetadata,
                    namespacesProgram: NAMESPACES_PROGRAM_ID,
                    tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                },
            }));
        }
        const tx2 = new Transaction();
        if (!existingEntry?.isClaimed) {
            await withClaimNameEntry(tx2, this.provider.connection, {
                ...this.provider.wallet,
                publicKey: owner,
            }, namespaceName, identifier, certificateMint, 0, owner, payer);
        }
        return {
            instructions: [instructions, tx2.instructions],
            signers: [signers, []],
            output: { certificateMint },
        };
    }
    async claimIdentifier(args, commitment) {
        return this.executeBig(this.claimIdentifierInstructions(args), args.payer, commitment);
    }
    async claimChatAdminInstructions({ chat, admin = this.wallet.publicKey, }) {
        const chatAcc = (await this.getChat(chat));
        if (chatAcc.identifierCertificateMint && !chatAcc.admin?.equals(admin)) {
            const identifierCertificateMintAccount = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, chatAcc.identifierCertificateMint, admin, true);
            return {
                output: null,
                signers: [],
                instructions: [
                    await this.instruction.claimAdminV0({
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
    }
    async claimAdmin(args, commitment = "confirmed") {
        return this.execute(this.claimChatAdminInstructions(args), args.admin, commitment);
    }
    async closeChatInstructions({ refund = this.wallet.publicKey, chat, admin = this.wallet.publicKey, }) {
        const instructions = [];
        instructions.push(...(await this.claimChatAdminInstructions({
            chat,
            admin,
        })).instructions);
        const chatPermissionsKey = (await ChatSdk.chatPermissionsKey(chat))[0];
        const chatPermissions = await this.getChatPermissions(chatPermissionsKey);
        if (chatPermissions) {
            instructions.push(await this.instruction.closeChatPermissionsV0({
                accounts: {
                    refund,
                    admin,
                    chat,
                    chatPermissions: chatPermissionsKey,
                    systemProgram: SystemProgram.programId,
                },
            }));
        }
        instructions.push(await this.instruction.closeChatV0({
            accounts: {
                refund,
                admin,
                chat,
                systemProgram: SystemProgram.programId,
            },
        }));
        return {
            signers: [],
            instructions,
            output: null,
        };
    }
    async closeChat(args, commitment) {
        await this.execute(this.closeChatInstructions(args), args.refund, commitment);
    }
    async initializeChatInstructions({ payer = this.wallet.publicKey, identifierCertificateMint, identifier, name, permissions, postMessageProgramId = this.programId, imageUrl = "", metadataUrl = "", chatKeypair, admin = this.wallet.publicKey, }) {
        const instructions = [];
        const signers = [];
        if (identifier) {
            const identifierInsts = await this.claimIdentifierInstructions({
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
            chat = (await ChatSdk.chatKey(identifierCertificateMint, this.programId))[0];
            const namespaces = await this.getNamespaces();
            if (!identifier) {
                const metadataKey = await Metadata.getPDA(identifierCertificateMint);
                const metadata = await new Metadata(metadataKey, (await this.provider.connection.getAccountInfo(metadataKey)));
                const [entryName] = metadata.data.data.name.split(".");
                identifier = entryName;
            }
            const [entry] = await await ChatSdk.entryKey(namespaces.chatNamespace, identifier);
            const identifierCertificateMintAccount = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, identifierCertificateMint, admin, true);
            const instruction = await this.instruction.initializeChatV0({
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
                    systemProgram: SystemProgram.programId,
                },
            });
            initChatInstructions.push(instruction);
        }
        else {
            chatKeypair = chatKeypair || Keypair.generate();
            chat = chatKeypair.publicKey;
            const instruction = await this.instruction.initializeUnidentifiedChatV0({
                name,
                imageUrl: imageUrl,
                metadataUrl: metadataUrl,
                postMessageProgramId,
            }, admin, {
                accounts: {
                    payer,
                    chat,
                    systemProgram: SystemProgram.programId,
                },
            });
            initChatInstructions.push(instruction);
            initChatSigners.push(chatKeypair);
        }
        let chatPermissions = undefined;
        if (permissions) {
            let { readPermissionKey, postPermissionKey, postPermissionAction = PostAction.Hold, postPayDestination, postPermissionAmount = 1, defaultReadPermissionAmount = 1, readPermissionType = PermissionType.Token, postPermissionType = PermissionType.Token, } = permissions;
            if (readPermissionKey.equals(NATIVE_MINT)) {
                readPermissionType = PermissionType.Native;
            }
            if (postPermissionKey.equals(NATIVE_MINT)) {
                postPermissionType = PermissionType.Native;
            }
            // find the permission amounts
            let postAmount;
            try {
                const postMint = await getMintInfo(this.provider, postPermissionKey);
                postAmount = toBN(postPermissionAmount, postMint);
            }
            catch {
                // permission key isn't a mint account
                postAmount = new BN(postPermissionAmount);
            }
            let readAmount;
            try {
                const readMint = await getMintInfo(this.provider, readPermissionKey);
                readAmount = toBN(defaultReadPermissionAmount, readMint);
            }
            catch {
                // permission key isn't a mint account
                readAmount = new BN(defaultReadPermissionAmount);
            }
            chatPermissions = (await ChatSdk.chatPermissionsKey(chat, this.programId))[0];
            initChatInstructions.push(await this.instruction.initializeChatPermissionsV0({
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
                    systemProgram: SystemProgram.programId,
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
    }
    async initializeChat(args, commitment = "confirmed") {
        return this.executeBig(this.initializeChatInstructions(args), args.payer, commitment);
    }
    async initializeProfileInstructions({ payer = this.wallet.publicKey, ownerWallet = this.wallet.publicKey, identifierCertificateMint, identifier, imageUrl = "", metadataUrl = "", }) {
        const instructions = [];
        const walletProfile = (await ChatSdk.profileKey(ownerWallet, this.programId))[0];
        const namespaces = await this.getNamespaces();
        const metadataKey = await Metadata.getPDA(identifierCertificateMint);
        if (!identifier) {
            const metadata = await new Metadata(metadataKey, (await this.provider.connection.getAccountInfo(metadataKey)));
            const [entryName] = metadata.data.data.name.split(".");
            identifier = entryName;
        }
        const [entry] = await ChatSdk.entryKey(namespaces.userNamespace, identifier);
        const identifierCertificateMintAccount = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, identifierCertificateMint, ownerWallet, true);
        instructions.push(await this.instruction.initializeProfileV0({
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
                systemProgram: SystemProgram.programId,
            },
        }));
        return {
            output: {
                walletProfile,
            },
            instructions,
            signers: [],
        };
    }
    async initializeProfile(args, commitment = "confirmed") {
        return this.execute(this.initializeProfileInstructions(args), args.payer, commitment);
    }
    async initializeSettingsInstructions({ payer = this.wallet.publicKey, ownerWallet = this.wallet.publicKey, settings, }) {
        const instructions = [];
        const settingsKey = (await ChatSdk.settingsKey(ownerWallet, this.programId))[0];
        const symmKey = await generateSymmetricKey();
        const bufEncryptedSeed = await this.litJsSdk.encryptWithSymmetricKey(symmKey, this.litJsSdk.uint8arrayFromString(settings.delegateWalletSeed));
        const encryptedDelegateWallet = buf2hex(await bufEncryptedSeed.arrayBuffer());
        await this.litAuth();
        const encryptedSymmetricKey = this.litJsSdk.uint8arrayToString(await this.litClient.saveEncryptionKey({
            solRpcConditions: [myWalletPermissions(ownerWallet)],
            symmetricKey: new Uint8Array(await crypto.subtle.exportKey("raw", symmKey)),
            authSig: this.litAuthSig,
            chain: this.chain,
        }), "base16");
        const encryptedSettings = {
            encryptedDelegateWallet,
            encryptedSymmetricKey,
        };
        instructions.push(await this.instruction.initializeSettingsV0(encryptedSettings, {
            accounts: {
                payer,
                settings: settingsKey,
                ownerWallet,
                rent: SYSVAR_RENT_PUBKEY,
                systemProgram: SystemProgram.programId,
            },
        }));
        return {
            output: {
                settings: settingsKey,
            },
            instructions,
            signers: [],
        };
    }
    async initializeSettings(args, commitment = "confirmed") {
        return this.execute(this.initializeSettingsInstructions(args), args.payer, commitment);
    }
    async initializeDelegateWalletInstructions({ payer = this.wallet.publicKey, ownerWallet = this.wallet.publicKey, delegateWalletKeypair, delegateWallet, }) {
        if (!delegateWalletKeypair && !delegateWallet) {
            delegateWalletKeypair = Keypair.generate();
        }
        if (!delegateWallet) {
            delegateWallet = delegateWalletKeypair.publicKey;
        }
        const delegateWalletAcc = (await ChatSdk.delegateWalletKey(delegateWallet))[0];
        const instructions = [];
        const signers = [delegateWalletKeypair].filter(truthy);
        instructions.push(await this.instruction.initializeDelegateWalletV0({
            accounts: {
                delegateWallet: delegateWalletAcc,
                payer,
                owner: ownerWallet,
                delegate: delegateWallet,
                systemProgram: SystemProgram.programId,
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
    }
    async initializeDelegateWallet(args, commitment = "confirmed") {
        return this.execute(this.initializeDelegateWalletInstructions(args), args.payer, commitment);
    }
    async sendMessageInstructions({ sender = this.wallet.publicKey, chat, message: rawMessage, readPermissionAmount, delegateWallet, delegateWalletKeypair, encrypted = true, nftMint, readPermissionKey, readPermissionType, }) {
        const { referenceMessageId, type, ...message } = rawMessage;
        if (encrypted) {
            await this.litAuth();
        }
        let { fileAttachments, ...normalMessage } = message;
        const chatPermissions = (await ChatSdk.chatPermissionsKey(chat, this.programId))[0];
        const chatPermissionsAcc = (await this.getChatPermissions(chatPermissions));
        let readAmount;
        try {
            const readMint = await getMintInfo(this.provider, chatPermissionsAcc.readPermissionKey);
            readAmount = toBN(readPermissionAmount || chatPermissionsAcc.defaultReadPermissionAmount, readMint);
        }
        catch {
            readAmount = new BN(readPermissionAmount || chatPermissionsAcc.defaultReadPermissionAmount);
        }
        const accessControlConditionsToUse = getAccessConditions(this.conditionVersion, chatPermissionsAcc.readPermissionKey, readAmount, this.chain, chatPermissionsAcc.readPermissionType);
        const storedSymKey = this.symKeyStorage.getSymKeyToUse(chatPermissionsAcc.readPermissionKey, readAmount.toNumber());
        let symmKey;
        if (encrypted) {
            if (storedSymKey) {
                symmKey = await importSymmetricKey(Buffer.from(storedSymKey.symKey, "hex"));
            }
            else {
                symmKey = await generateSymmetricKey();
            }
        }
        // Encrypt fileAttachements if needed
        if (fileAttachments && encrypted) {
            fileAttachments = await Promise.all(fileAttachments.map(async (fileAttachment) => {
                const encrypted = await this.litJsSdk.encryptWithSymmetricKey(symmKey, await fileAttachment.file.arrayBuffer());
                return {
                    file: new File([encrypted], fileAttachment.file.name + ".encrypted"),
                    name: fileAttachment.name,
                };
            }));
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
            const uploaded = ((await uploadFiles(this.provider, fileAttachments.map((f) => f.file), delegateWalletKeypair)) || []).filter(truthy);
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
            const encryptedStringOut = await this.litJsSdk.encryptWithSymmetricKey(symmKey, this.litJsSdk.uint8arrayFromString(JSON.stringify(normalMessage)));
            encryptedString = buf2hex(await encryptedStringOut.arrayBuffer());
            if (storedSymKey) {
                encryptedSymmetricKey = storedSymKey.encryptedSymKey;
            }
            else {
                // Cache the sym key we're using
                encryptedSymmetricKey = this.litJsSdk.uint8arrayToString(await this.litClient.saveEncryptionKey({
                    solRpcConditions: accessControlConditionsToUse,
                    symmetricKey: new Uint8Array(await crypto.subtle.exportKey("raw", symmKey)),
                    authSig: this.litAuthSig,
                    chain: this.chain,
                }), "base16");
                this.symKeyStorage.setSymKeyToUse(chatPermissionsAcc.readPermissionKey, readAmount.toNumber(), {
                    symKey: Buffer.from(await exportSymmetricKey(symmKey)).toString("hex"),
                    encryptedSymKey: encryptedSymmetricKey,
                    timeMillis: new Date().valueOf(),
                });
            }
        }
        else {
            encryptedSymmetricKey = "";
            encryptedString = JSON.stringify(message);
        }
        const postPermissionAccount = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, nftMint ? nftMint : chatPermissionsAcc.postPermissionKey, sender, true);
        const remainingAccounts = [];
        if (nftMint) {
            remainingAccounts.push({
                pubkey: await Metadata.getPDA(nftMint),
                isWritable: false,
                isSigner: false,
            });
        }
        if (delegateWallet || delegateWalletKeypair) {
            if (!delegateWallet) {
                delegateWallet = delegateWalletKeypair.publicKey;
            }
            remainingAccounts.push({
                pubkey: (await ChatSdk.delegateWalletKey(delegateWallet, this.programId))[0],
                isWritable: false,
                isSigner: false,
            });
        }
        const contentLength = encryptedString.length;
        const numGroups = Math.ceil(contentLength / MESSAGE_MAX_CHARACTERS);
        const instructionGroups = [];
        const signerGroups = [];
        const messageId = uuid();
        const ix = chatPermissionsAcc?.postPermissionKey.equals(NATIVE_MINT)
            ? this.instruction.sendNativeMessageV0
            : this.instruction.sendTokenMessageV0;
        for (let i = 0; i < numGroups; i++) {
            const instructions = [];
            instructions.push(await ix({
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
                messageType: RawMessageType[capitalizeFirstLetter(type)],
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
                    tokenProgram: TOKEN_PROGRAM_ID,
                },
                remainingAccounts,
            }));
            instructionGroups.push(instructions);
            signerGroups.push([delegateWalletKeypair].filter(truthy));
        }
        return {
            instructions: instructionGroups,
            output: { messageId },
            signers: signerGroups,
        };
    }
    async sendMessage(args, commitment = "confirmed") {
        return this.executeBig(this.sendMessageInstructions(args), args.payer, commitment);
    }
    async createMetadataForBondingInstructions({ metadataUpdateAuthority = this.provider.wallet.publicKey, metadata, targetMintKeypair = Keypair.generate(), decimals, }) {
        const targetMint = targetMintKeypair.publicKey;
        const instructions = [];
        const signers = [];
        instructions.push(...(await createMintInstructions(this.tokenBondingProgram.provider, this.provider.wallet.publicKey, targetMint, decimals)));
        signers.push(targetMintKeypair);
        const { instructions: metadataInstructions, signers: metadataSigners, output, } = await this.tokenMetadataProgram.createMetadataInstructions({
            data: metadata,
            mint: targetMint,
            mintAuthority: this.provider.wallet.publicKey,
            authority: metadataUpdateAuthority,
        });
        instructions.push(...metadataInstructions);
        signers.push(...metadataSigners);
        instructions.push(Token.createSetAuthorityInstruction(TOKEN_PROGRAM_ID, targetMint, (await SplTokenBonding.tokenBondingKey(targetMint))[0], "MintTokens", this.provider.wallet.publicKey, []));
        return {
            instructions,
            signers,
            output: {
                ...output,
                mint: targetMint,
            },
        };
    }
}
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
        return new PublicKey(arg0);
    }
    return arg0;
}
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
//# sourceMappingURL=index.js.map