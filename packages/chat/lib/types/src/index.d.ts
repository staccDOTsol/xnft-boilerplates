import { DataV2 } from "@metaplex-foundation/mpl-token-metadata";
import { EntryData, NamespaceData, NAMESPACES_PROGRAM } from "@cardinal/namespaces";
import { AnchorProvider, IdlTypes, Program } from "@project-serum/anchor";
import { Commitment, ConfirmedTransactionMeta, Finality, Keypair, Message, PublicKey } from "@solana/web3.js";
import { AnchorSdk, BigInstructionResult, InstructionResult, TypedAccountParser, SplTokenMetadata } from "@strata-foundation/spl-utils";
import { SplTokenBonding } from "@strata-foundation/spl-token-bonding";
import BN from "bn.js";
import LitJsSdk from "lit-js-sdk";
import { CaseInsensitiveMarkerV0, ChatIDL, ChatV0, DelegateWalletV0, NamespacesV0, PermissionType, PostAction, ProfileV0, SettingsV0, MessageType as RawMessageType, ChatPermissionsV0 } from "./generated/chat";
export { RawMessageType };
export * from "./generated/chat";
export * from "./shdw";
export * from "./lit";
interface SymKeyInfo {
    encryptedSymKey: string;
    symKey: string;
    timeMillis: number;
}
interface ISymKeyStorage {
    setSymKeyToUse(mintOrCollection: PublicKey, amount: number, key: SymKeyInfo): void;
    getSymKeyToUse(mintOrCollection: PublicKey, amount: number): SymKeyInfo | null;
    setSymKey(encrypted: string, unencrypted: string): void;
    getSymKey(encrypted: string): string | null;
    getTimeSinceLastSet(mintOrCollection: PublicKey, amount: number): number | null;
}
export declare class LocalSymKeyStorage implements ISymKeyStorage {
    readonly url: string;
    constructor(url: string);
    setSymKey(encrypted: string, unencrypted: string): void;
    getSymKey(encrypted: string): string | null;
    private getKey;
    setSymKeyToUse(mintOrCollection: PublicKey, amount: number, symKey: SymKeyInfo): void;
    getTimeSinceLastSet(mintOrCollection: PublicKey, amount: number): number | null;
    getSymKeyToUse(mintOrCollection: PublicKey, amount: number): SymKeyInfo | null;
}
export declare function importSymmetricKey(symmKey: BufferSource): Promise<CryptoKey>;
export declare function exportSymmetricKey(symmKey: CryptoKey): Promise<ArrayBuffer>;
export declare enum MessageType {
    Text = "text",
    Html = "html",
    Gify = "gify",
    Image = "image",
    React = "react"
}
export interface INamespaces extends NamespacesV0 {
    publicKey: PublicKey;
    chat: NamespaceData;
    user: NamespaceData;
}
export interface ReactMessage {
    referenceMessageId: string;
    emoji: string;
}
export interface TextMessage {
    text: string;
}
export interface HtmlMessage {
    html: string;
    encryptedAttachments: {
        name: string;
        file: string;
    }[];
}
export interface ImageMessage {
    attachments: {
        name: string;
        file: string;
    }[];
    encryptedAttachments: {
        name: string;
        file: string;
    }[];
}
export interface GifyMessage {
    gifyId: string;
}
export interface IMessageContent extends Partial<ReactMessage>, Partial<TextMessage>, Partial<HtmlMessage>, Partial<ImageMessage>, Partial<GifyMessage> {
    type: MessageType;
    referenceMessageId?: string;
}
export interface IDecryptedMessageContent extends IMessageContent {
    decryptedAttachments?: {
        name: string;
        file: Blob;
    }[];
}
export interface ISendMessageContent extends IMessageContent {
    fileAttachments?: {
        name: string;
        file: File;
    }[];
}
export interface IDelegateWallet extends DelegateWalletV0 {
    publicKey: PublicKey;
}
export interface IChat extends ChatV0 {
    publicKey: PublicKey;
}
export interface IChatPermissions extends ChatPermissionsV0 {
    publicKey: PublicKey;
}
export interface IEntry extends EntryData {
    publicKey: PublicKey;
    mint: PublicKey;
}
export interface IProfile extends ProfileV0 {
    publicKey: PublicKey;
}
export interface ISettings extends SettingsV0 {
    getDelegateWalletSeed(): Promise<string>;
}
export interface ICaseInsensitiveMarker extends CaseInsensitiveMarkerV0 {
    publicKey: PublicKey;
}
declare type MessagePartV0 = IdlTypes<ChatIDL>["MessagePartV0"];
export interface IMessagePart extends MessagePartV0 {
    txid: string;
    blockTime: number;
    sender: PublicKey;
    chatKey: PublicKey;
}
export interface IMessage {
    type: MessageType;
    complete: boolean;
    id: string;
    txids: string[];
    startBlockTime: number;
    endBlockTime: number;
    readPermissionType: PermissionType;
    readPermissionKey: PublicKey;
    readPermissionAmount: BN;
    referenceMessageId: string | null;
    encryptedSymmetricKey: string;
    content: string;
    getDecodedMessage(): Promise<IDecryptedMessageContent | undefined>;
    sender: PublicKey;
    chatKey: PublicKey;
    parts: IMessagePart[];
}
export interface InitializeChatArgs {
    payer?: PublicKey;
    /** The admin of this chat instance. **Default:** This wallet */
    admin?: PublicKey;
    /** The unique shortname of the chat. This is a cardinal certificate NFT. If this and identifier are not provided, will create an unidentifiedChat */
    identifierCertificateMint?: PublicKey;
    identifier?: string;
    /** If not providing an identifier, creates an unidentified chat using this keypair. **Default:** Generate new keypair */
    chatKeypair?: Keypair;
    /** Human readable name for the chat */
    name: string;
    imageUrl?: string;
    metadataUrl?: string;
    /**
     * The program id that we expect messages to come from. **Default: ** Chat program.
     * This is your hook to have custom post gating logic.
     */
    postMessageProgramId?: PublicKey;
    permissions?: {
        /** The mint you need to read this chat */
        readPermissionKey: PublicKey;
        /** The mint you need to post to this chat */
        postPermissionKey: PublicKey;
        /** The gating mechanism, part of an NFT collection or just holds the token. **Default:** Token */
        readPermissionType?: PermissionType;
        /** The gating mechanism, part of an NFT collection or just holds the token **Default:** Token */
        postPermissionType?: PermissionType;
        /** The number of tokens needed to post to this chat. **Default:** 1 */
        postPermissionAmount?: number | BN;
        /** The action to take when posting. **Default:** hold */
        postPermissionAction?: PostAction;
        /** Amount of read permission mint required to read this chat by default. **Default:** 1 */
        defaultReadPermissionAmount?: any;
        /** The destination to pay to on post */
        postPayDestination?: PublicKey;
    };
}
export interface CloseChatArgs {
    refund?: PublicKey;
    /** The chat to close */
    chat: PublicKey;
    /** The admin account, **Default:** this.wallet.publicKey */
    admin?: PublicKey;
}
export interface ClaimChatAdminArgs {
    /** The chat to close */
    chat: PublicKey;
    /** The admin account, **Default:** this.wallet.publicKey */
    admin?: PublicKey;
}
export interface InitializeProfileArgs {
    payer?: PublicKey;
    /** The owner of this profile. **Default:** the current wallet */
    ownerWallet?: PublicKey;
    /** The unique shortname of the user. This is a cardinal certificate NFT */
    identifierCertificateMint: PublicKey;
    /** Useful when metadata is being created in the same instruction set, short circuit call to get metadata for the identifier. **Default:** metadata of certificate mint name */
    identifier?: string;
    imageUrl?: string;
    metadataUrl?: string;
}
export interface InitializeSettingsArgs {
    payer?: PublicKey;
    /** The owner of this settings. **Default:** the current wallet */
    ownerWallet?: PublicKey;
    settings: {
        delegateWalletSeed: string;
    };
}
export interface InitializeDelegateWalletArgs {
    payer?: PublicKey;
    /** The owning wallet of the delegate. **Default:** the current wallet */
    ownerWallet?: PublicKey;
    /** The delegate wallet to use. **Default:** from keypair */
    delegateWallet?: PublicKey;
    /** The delegate keypair. **Default:** Generate one */
    delegateWalletKeypair?: Keypair;
}
export interface SendMessageArgs {
    payer?: PublicKey;
    /** The chat to send to */
    chat: PublicKey;
    /** The message to send */
    message: ISendMessageContent;
    /** The amount of tokens needed to read. **Default:** from chat permissions */
    readPermissionAmount?: number | BN;
    /** The read permission key (collection, token mint, etc). **Default:** from chat permissions */
    readPermissionKey?: PublicKey;
    /** The read permission key (collection, token mint, etc). **Default:** from chat permissions */
    readPermissionType?: PermissionType;
    /** Lit protocol conditions, **Default:** The chatroom default */
    accessControlConditions?: any;
    /** If using a delegate wallet, will send and sign. **Defualt:** delegateWalletKeypair.publicKey */
    delegateWallet?: PublicKey;
    /** If using a delegate wallet, will send and sign */
    delegateWalletKeypair?: Keypair;
    /** The ownerWallet of the sender. **Default:** this wallet*/
    sender?: PublicKey;
    /** Should we encrypt this message using lit protocol? */
    encrypted?: boolean;
    /** If you need an nft to post the message, this should be the mint of the qualifying nft held by the sender */
    nftMint?: PublicKey;
}
export declare enum IdentifierType {
    Chat = "chat",
    User = "me"
}
export interface ClaimIdentifierArgs {
    payer?: PublicKey;
    /** The wallet to own this. **Default:** this wallet */
    owner?: PublicKey;
    type: IdentifierType;
    identifier: string;
}
interface ICreateMetadataForBondingArgs {
    /**
     * The update authority on the metadata created. **Default:** Seller
     */
    metadataUpdateAuthority?: PublicKey;
    /**
     * The token metadata for the marketplace item
     */
    metadata: DataV2;
    /**
     * Optionally, use this keypair to create the target mint
     */
    targetMintKeypair?: Keypair;
    /**
     * Decimals for the mint
     */
    decimals: number;
}
export declare class ChatSdk extends AnchorSdk<ChatIDL> {
    litClient: LitJsSdk;
    litAuthSig: any | undefined;
    chain: string;
    authingLit: Promise<void> | null;
    symKeyStorage: ISymKeyStorage;
    symKeyFetchCache: Record<string, Promise<Uint8Array | undefined>>;
    litJsSdk: LitJsSdk;
    namespacesProgram: Program<NAMESPACES_PROGRAM>;
    conditionVersion: number;
    _namespaces: INamespaces | null;
    _namespacesPromise: Promise<INamespaces> | null;
    tokenBondingProgram: SplTokenBonding;
    tokenMetadataProgram: SplTokenMetadata;
    static ID: PublicKey;
    get isLitAuthed(): boolean;
    _litAuth(): Promise<void>;
    litAuth(): Promise<void>;
    getNamespace(namespace: PublicKey): Promise<NamespaceData>;
    static init(provider: AnchorProvider, chatProgramId?: PublicKey, splTokenBondingProgramId?: PublicKey): Promise<ChatSdk>;
    constructor({ provider, program, litClient, namespacesProgram, symKeyStorage, tokenBondingProgram, tokenMetadataProgram, }: {
        provider: AnchorProvider;
        program: Program<ChatIDL>;
        litClient: typeof LitJsSdk;
        namespacesProgram: Program<NAMESPACES_PROGRAM>;
        symKeyStorage?: ISymKeyStorage;
        tokenBondingProgram: SplTokenBonding;
        tokenMetadataProgram: SplTokenMetadata;
    });
    entryDecoder: TypedAccountParser<IEntry>;
    chatDecoder: TypedAccountParser<IChat>;
    chatPermissionsDecoder: TypedAccountParser<IChatPermissions>;
    delegateWalletDecoder: TypedAccountParser<IDelegateWallet>;
    profileDecoder: TypedAccountParser<IProfile>;
    settingsDecoder: TypedAccountParser<ISettings>;
    caseInsensitiveMarkerDecoder: TypedAccountParser<ICaseInsensitiveMarker>;
    getChat(chatKey: PublicKey): Promise<IChat | null>;
    getChatPermissions(chatPermissionsKey: PublicKey): Promise<IChatPermissions | null>;
    getProfile(profileKey: PublicKey): Promise<IProfile | null>;
    getSettings(settingsKey: PublicKey): Promise<ISettings | null>;
    getCaseInsensitiveMarker(caseInsensitiveMarkerKey: PublicKey): Promise<ICaseInsensitiveMarker | null>;
    /**
     * Get messages from a bunch of parts. NOTE: It is highly reccommended you use accountFetchCache for efficiency.
     * @param parts
     * @param ignorePartial
     * @returns
     */
    getMessagesFromParts(parts: IMessagePart[], ignorePartial?: boolean): IMessage[];
    _getSymmetricKey(encryptedSymmetricKey: string, accessControlConditions: any): Promise<Uint8Array | undefined>;
    getSymmetricKey(encryptedSymmetricKey: string, accessControlConditions: any): Promise<Uint8Array | undefined>;
    /**
     * Get message from a bunch of parts. NOTE: It is highly reccommended you use accountFetchCache for efficiency.
     *
     * @param parts
     * @param ignorePartial
     * @returns
     */
    getMessageFromParts(parts: IMessagePart[], ignorePartial?: boolean): IMessage | undefined;
    /**
     * Get message parts from a tx. NOTE: It is highly reccommended you use accountFetchCache for efficiency.
     * @param param0
     * @returns
     */
    getMessagePartsFromInflatedTx({ chat, txid, meta, blockTime, transaction, idl, logs }: {
        logs?: string[];
        transaction?: {
            message: Message;
            signatures: string[];
        };
        chat: PublicKey;
        txid: string;
        meta?: ConfirmedTransactionMeta | null;
        blockTime?: number | null;
        idl?: any;
    }): Promise<IMessagePart[]>;
    /**
     * Get message parts from a tx. NOTE: It is highly reccommended you use accountFetchCache for efficiency.
     *
     * @param txid
     * @returns
     */
    getMessagePartsFromTx({ chat, txid, idl, }: {
        chat: PublicKey;
        txid: string;
        idl?: any;
    }): Promise<IMessagePart[]>;
    static chatKey(identifierCertificateMint: PublicKey, programId?: PublicKey): Promise<[PublicKey, number]>;
    static chatPermissionsKey(chat: PublicKey, programId?: PublicKey): Promise<[PublicKey, number]>;
    static caseInsensitiveMarkerKey(namespace: PublicKey, identifier: string, programId?: PublicKey): Promise<[PublicKey, number]>;
    static entryKey(namespaceId: PublicKey, identifier: string): Promise<[PublicKey, number]>;
    static delegateWalletKey(delegateWallet: PublicKey, programId?: PublicKey): Promise<[PublicKey, number]>;
    static profileKey(wallet: PublicKey, programId?: PublicKey): Promise<[PublicKey, number]>;
    static settingsKey(wallet: PublicKey, programId?: PublicKey): Promise<[PublicKey, number]>;
    static namespacesKey(programId?: PublicKey): Promise<[PublicKey, number]>;
    initializeNamespacesInstructions(): Promise<InstructionResult<null>>;
    initializeNamespaces(): Promise<null>;
    _getNamespaces(): Promise<INamespaces>;
    getNamespaces(): Promise<INamespaces>;
    /**
     * Attempt to claim the identifier. If the identifier entry already exists, attempt to approve/claim.
     * @param param0
     * @returns
     */
    claimIdentifierInstructions({ payer, owner, identifier, type, }: ClaimIdentifierArgs): Promise<BigInstructionResult<{
        certificateMint: PublicKey;
    }>>;
    claimIdentifier(args: ClaimIdentifierArgs, commitment?: Finality): Promise<{
        certificateMint: PublicKey;
    }>;
    claimChatAdminInstructions({ chat, admin, }: ClaimChatAdminArgs): Promise<InstructionResult<null>>;
    claimAdmin(args: ClaimChatAdminArgs, commitment?: Finality): Promise<null>;
    closeChatInstructions({ refund, chat, admin, }: CloseChatArgs): Promise<InstructionResult<null>>;
    closeChat(args: CloseChatArgs, commitment?: Finality): Promise<void>;
    initializeChatInstructions({ payer, identifierCertificateMint, identifier, name, permissions, postMessageProgramId, imageUrl, metadataUrl, chatKeypair, admin, }: InitializeChatArgs): Promise<BigInstructionResult<{
        chat: PublicKey;
        chatPermissions?: PublicKey;
        chatKeypair?: Keypair;
        identifierCertificateMint?: PublicKey;
    }>>;
    initializeChat(args: InitializeChatArgs, commitment?: Finality): Promise<{
        chat: PublicKey;
        chatPermissions?: PublicKey;
        identifierCertificateMint?: PublicKey;
    }>;
    initializeProfileInstructions({ payer, ownerWallet, identifierCertificateMint, identifier, imageUrl, metadataUrl, }: InitializeProfileArgs): Promise<InstructionResult<{
        walletProfile: PublicKey;
    }>>;
    initializeProfile(args: InitializeProfileArgs, commitment?: Commitment): Promise<{
        walletProfile: PublicKey;
    }>;
    initializeSettingsInstructions({ payer, ownerWallet, settings, }: InitializeSettingsArgs): Promise<InstructionResult<{
        settings: PublicKey;
    }>>;
    initializeSettings(args: InitializeSettingsArgs, commitment?: Commitment): Promise<{
        settings: PublicKey;
    }>;
    initializeDelegateWalletInstructions({ payer, ownerWallet, delegateWalletKeypair, delegateWallet, }: InitializeDelegateWalletArgs): Promise<InstructionResult<{
        delegateWallet: PublicKey;
        delegateWalletKeypair?: Keypair;
    }>>;
    initializeDelegateWallet(args: InitializeDelegateWalletArgs, commitment?: Commitment): Promise<{
        delegateWallet: PublicKey;
        delegateWalletKeypair?: Keypair;
    }>;
    sendMessageInstructions({ sender, chat, message: rawMessage, readPermissionAmount, delegateWallet, delegateWalletKeypair, encrypted, nftMint, readPermissionKey, readPermissionType, }: SendMessageArgs): Promise<BigInstructionResult<{
        messageId: string;
    }>>;
    sendMessage(args: SendMessageArgs, commitment?: Finality): Promise<{
        txids?: string[];
        messageId: string;
    }>;
    createMetadataForBondingInstructions({ metadataUpdateAuthority, metadata, targetMintKeypair, decimals, }: ICreateMetadataForBondingArgs): Promise<InstructionResult<{
        metadata: PublicKey;
        mint: PublicKey;
    }>>;
}
//# sourceMappingURL=index.d.ts.map