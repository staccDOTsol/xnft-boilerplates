/// <reference types="node" />
import { Creator } from "@metaplex-foundation/mpl-token-metadata";
import * as anchor from "@project-serum/anchor";
import { AnchorProvider, IdlTypes, Program } from "@project-serum/anchor";
import { NameRegistryState } from "@solana/spl-name-service";
import { AccountInfo as TokenAccountInfo } from "@solana/spl-token";
import { AccountInfo, Commitment, Finality, PublicKey } from "@solana/web3.js";
import { ICreateTokenBondingArgs, ITokenBonding, IUpdateTokenBondingArgs, SplTokenBonding } from "@strata-foundation/spl-token-bonding";
import { AnchorSdk, BigInstructionResult, InstructionResult, ITokenWithMeta, SplTokenMetadata, TypedAccountParser } from "@strata-foundation/spl-utils";
import { CollectiveV0, SplTokenCollectiveIDL, TokenRefV0 } from "./generated/spl-token-collective";
export * from "./generated/spl-token-collective";
export interface ITokenWithMetaAndAccount extends ITokenWithMeta {
    publicKey?: PublicKey;
    tokenRef?: ITokenRef;
    tokenBonding?: ITokenBonding;
    account?: TokenAccountInfo;
}
interface TokenAccount {
    pubkey: PublicKey;
    account: AccountInfo<Buffer>;
    info: TokenAccountInfo;
}
export interface ICreateCollectiveArgs {
    /** Payer for this transaction */
    payer?: PublicKey;
    /**
     * Token metadata that, if provided, will create metaplex spl-token-metadata for this collective.
     *
     * Reccommended to always fill this out so that your token displays with a name, symbol, and image.
     */
    metadata?: {
        name: string;
        symbol: string;
        uri: string;
    };
    /**
     * If `mint` is not provided, create a bonding curve automatically for this collective.
     */
    bonding?: ICreateTokenBondingArgs;
    /** The mint to base this collective around. It is recommended for compatability that all collectives be on a bonding curve, so it's easy to make user interfaces that can buy in and out of your social tokens */
    mint?: PublicKey;
    /** **Default:** Fetch from mint. This may not be possible if the mint is being created in the same transaction as the collective. */
    mintAuthority?: PublicKey;
    /** The authority of this collective */
    authority?: PublicKey;
    /** The configs around what is and isn't allowed in the collective */
    config: ICollectiveConfig;
    /** Only required if the mint is already initialised as a social token */
    tokenRef?: PublicKey;
}
/** See [InitializeTokenBondingArgs](https://docs.strataprotocol.com/api/spl-token-bonding/interfaces/ICreateTokenBondingArgs) */
export interface ITokenBondingParams extends Omit<ICreateTokenBondingArgs, "curve" | "baseMint"> {
    /** The curve to create this social token on. **Default:** Curve from the collective's config */
    curve?: PublicKey;
}
/**
 * Set this token as your primary token, so people can look you up without knowing the collective
 */
export interface ISetAsPrimaryArgs {
    payer?: PublicKey;
    tokenRef: PublicKey;
    /**
     * The owner of the `tokenRef`. **Default:** Owner from fetching tokenRef. You may need to provide this if setting
     * primary in the same txn as creating the token ref.
     */
    owner?: PublicKey;
}
/**
 * Update this collective
 */
export interface IUpdateCollectiveArgs {
    payer?: PublicKey;
    collective: PublicKey;
    /**
     * The authority `collective`. **Default:** Authority from fetching the collective.
     *
     * Explicitly pass null to set the authority to none
     */
    authority?: PublicKey | null;
    config: ICollectiveConfig;
}
export interface ICreateSocialTokenArgs {
    /**
     * Is this the primary social token for this wallet? **Default:** true
     *
     * A primary social token is the social token people should see when they look up your wallet. While it's possible to belong to many
     * collectives, generally most people will have one social token.
     *
     * This can be changed at any time.
     */
    isPrimary?: boolean;
    /** If this social token already exists, don't throw an error. **Default:** false */
    ignoreIfExists?: boolean;
    /** The payer for this account and txn */
    payer?: PublicKey;
    /** The collective to create this social token under. Ignored if baseMint is provided */
    collective?: PublicKey;
    /** The base mint to create this token under. **Default:** The Open Collective */
    mint?: PublicKey;
    /** The spl-name-service name to associate with this account. Will create an unclaimed social token. */
    name?: PublicKey;
    /** The spl-name-service name class associated with name above, if provided */
    nameClass?: PublicKey;
    /** The spl-name-service name paent associated with name above, if provided */
    nameParent?: PublicKey;
    /**
     * Token metadata that, if provided, will create metaplex spl-token-metadata for this collective.
     *
     * Reccommended to fill this out so that your token displays with a name, symbol, and image.
     */
    metadata: {
        name: string;
        symbol: string;
        /** Getting a URI for token metadata can be an expensive process that involves a separate transaction
         * If the collective has a default URI configured, you can just not pass this
         * **Default:** {@link ICollectiveConfig.unclaimedTokenMetadataSettings.uri} */
        uri?: string;
        sellerFeeBasisPoints?: number;
        creators?: Creator[] | null;
    };
    /** The wallet to create this social token under, defaults to `provider.wallet` */
    owner?: PublicKey;
    /**  The authority to make changes on this bonding curve. **Default:** `provider.wallet`. */
    authority?: PublicKey | null;
    /**
     * **Default:** New generated keypair
     *
     * Pass in the keypair to use for the mint. Useful if you want a vanity keypair
     */
    targetMintKeypair?: anchor.web3.Keypair;
    /** Params for the bonding curve  */
    tokenBondingParams: ITokenBondingParams;
}
export interface IClaimSocialTokenArgs {
    /**
     * Is this the primary social token for this wallet? **Default:** true
     *
     * A primary social token is the social token people should see when they look up your wallet. While it's possible to belong to many
     * collectives, generally most people will have one social token.
     */
    isPrimary?: boolean;
    /** The payer for this txn */
    payer?: PublicKey;
    /** The owning wallet of this social token. **Default:**: `provider.wallet` */
    owner?: PublicKey;
    /** The authority to make changes on this bonding curve. **Default:** `provider.wallet`. */
    authority?: PublicKey | null;
    /** The token ref of the token we are claiming */
    tokenRef: PublicKey;
    /** Change the smart-contract level name for this token without changing the url. To do a full update to token metadata, directly use SplTokenMetadata after a claim */
    tokenName?: string;
    /** Change the smart-contract level symbol for this token without changing the url. To do a full update to token metadata, directly use SplTokenMetadata after a claim */
    symbol?: string;
    /** The buy base royalties destination. **Default:** ATA of owner */
    buyBaseRoyalties?: PublicKey;
    /** The buy target royalties destination. **Default:** ATA of owner */
    buyTargetRoyalties?: PublicKey;
    /** The sell base royalties destination. **Default:** ATA of owner */
    sellBaseRoyalties?: PublicKey;
    /** The sell target royalties destination. **Default:** ATA of owner */
    sellTargetRoyalties?: PublicKey;
    /**
     * Ignore missing name account. Useful if you're creating the name in the same txn.
     *
     * Otherwise, the sdk checks to make sure the name account exists before claiming to provide a more useful error
     *
     * **Default:** false
     */
    ignoreMissingName?: boolean;
}
export interface IOptOutArgs {
    /** The payer for this txn */
    payer?: PublicKey;
    /** The token ref of the token we are opting out of */
    tokenRef: PublicKey;
    /** The string name stored on chain if this is an unclaimed token */
    handle?: string;
    /** The name class of the name on chain. Must be provided if the name wasn't actually created */
    nameClass?: PublicKey;
    /** The name parent of the name on chain. Must be provided if the name wasn't actually created */
    nameParent?: PublicKey;
}
interface ITokenRefKeyArgs {
    isPrimary?: boolean;
    owner?: PublicKey | null;
    name?: PublicKey | null;
    mint?: PublicKey | null;
}
export interface IRoyaltySetting {
    /**
     * In the case of an unclaimed token, is this royalty account required to be owned by the name account.
     *
     * If `true`, when the token is claimed, the owner of the name that's claiming it will receive all of the funds in the royalty account
     */
    ownedByName?: boolean;
    /**
     * A static address such that all curves must have this as the royalty address.
     */
    address?: number;
}
export interface ITokenBondingSettings {
    curve?: PublicKey;
    minSellBaseRoyaltyPercentage?: number;
    minSellTargetRoyaltyPercentage?: number;
    maxSellBaseRoyaltyPercentage?: number;
    maxSellTargetRoyaltyPercentage?: number;
    minBuyBaseRoyaltyPercentage?: number;
    minBuyTargetRoyaltyPercentage?: number;
    maxBuyBaseRoyaltyPercentage?: number;
    maxBuyTargetRoyaltyPercentage?: number;
    targetMintDecimals?: number;
    buyBaseRoyalties?: IRoyaltySetting;
    sellBaseRoyalties?: IRoyaltySetting;
    buyTargetRoyalties?: IRoyaltySetting;
    sellTargetRoyalties?: IRoyaltySetting;
    minPurchaseCap?: number;
    maxPurchaseCap?: number;
    minMintCap?: number;
    maxMintCap?: number;
}
export interface IUpdateOwnerArgs {
    /** The payer for this txn */
    payer?: PublicKey;
    /** The token ref of the token we are updating */
    tokenRef: PublicKey;
    /** The new owner to set */
    newOwner: PublicKey;
}
export interface IUpdateAuthorityArgs {
    /** The payer for this txn */
    payer?: PublicKey;
    /** The token ref of the token we are updating */
    tokenRef: PublicKey;
    /** The new authority to set */
    newAuthority: PublicKey;
    /** The current owner of the token ref. If executing in the same txn as a change owner, will need to supply this */
    owner?: PublicKey;
}
export interface ITokenMetadataSettings {
    /** The default symbol for an unclaimed token */
    symbol?: string;
    /** The default uri for an unclaimed token */
    uri?: string;
    /** Enforce that the name of the unclaimed token matches the spl-name-service name */
    nameIsNameServiceName?: boolean;
}
export interface ICollectiveConfig {
    /**
     * A collective can either be open or closed. A closed collective must sign on the creation of _any_ social token
     * within the collective. An open collective allows any social tokens to bind themself to the collective token, so long
     * as they follow the CollectiveConfig settings
     */
    isOpen: boolean;
    /** Settings for bonding curves on unclaimed tokens */
    unclaimedTokenBondingSettings?: ITokenBondingSettings;
    /** Settings for bonding curves on claimed tokens */
    claimedTokenBondingSettings?: ITokenBondingSettings;
    /** Settings for token metadata of unclaimed tokens */
    unclaimedTokenMetadataSettings?: ITokenMetadataSettings;
}
export interface IUpdateTokenBondingViaCollectiveArgs extends Omit<Omit<IUpdateTokenBondingArgs, "generalAuthority">, "tokenBonding"> {
    /** The token ref of the token we are updating bonding for */
    tokenRef: PublicKey;
}
export interface IUpdateCurveViaCollectiveArgs {
    tokenRef: PublicKey;
    curve: PublicKey;
    adminKey?: PublicKey | undefined;
}
export interface IClaimBondingAuthorityArgs {
    tokenBonding: PublicKey;
}
type CollectiveConfigV0 = IdlTypes<SplTokenCollectiveIDL>["CollectiveConfigV0"];
/**
 * Unified tokenref interface wrapping the raw TokenRefV0
 */
export interface ITokenRef extends TokenRefV0 {
    publicKey: PublicKey;
    tokenBonding: PublicKey | null;
    collective: PublicKey | null;
    owner: PublicKey | null;
}
/**
 * Unified collective interface wrapping the raw CollectiveV0
 */
export interface ICollective extends CollectiveV0 {
    publicKey: PublicKey;
    config: CollectiveConfigV0;
}
export declare class SplTokenCollective extends AnchorSdk<SplTokenCollectiveIDL> {
    splTokenBondingProgram: SplTokenBonding;
    splTokenMetadata: SplTokenMetadata;
    static ID: anchor.web3.PublicKey;
    static OPEN_COLLECTIVE_ID: anchor.web3.PublicKey;
    static OPEN_COLLECTIVE_BONDING_ID: anchor.web3.PublicKey;
    static OPEN_COLLECTIVE_MINT_ID: anchor.web3.PublicKey;
    static init(provider: AnchorProvider, splCollectiveProgramId?: PublicKey, splTokenBondingProgramId?: PublicKey): Promise<SplTokenCollective>;
    constructor(opts: {
        provider: AnchorProvider;
        program: Program<SplTokenCollectiveIDL>;
        splTokenBondingProgram: SplTokenBonding;
        splTokenMetadata: SplTokenMetadata;
    });
    /**
     * Account decoder to a unified TokenRef interface
     *
     * @param pubkey
     * @param account
     * @returns
     */
    tokenRefDecoder: TypedAccountParser<ITokenRef>;
    /**
     * Account decoder to a unified Collective interface
     *
     * @param pubkey
     * @param account
     * @returns
     */
    collectiveDecoder: TypedAccountParser<ICollective>;
    getCollective(collectiveKey: PublicKey): Promise<ICollective | null>;
    getTokenRef(ownerTokenRefKey: PublicKey): Promise<ITokenRef | null>;
    /**
     * Instructions to create a Collective
     *
     * @param param0
     * @returns
     */
    createCollectiveInstructions({ payer, mint, authority, mintAuthority, config, bonding, metadata, tokenRef, }: ICreateCollectiveArgs): Promise<BigInstructionResult<{
        collective: PublicKey;
        tokenBonding?: PublicKey;
    }>>;
    /**
     * Run {@link createCollectiveInstructions}
     * @param args
     * @returns
     */
    createCollective(args: ICreateCollectiveArgs, commitment?: Finality): Promise<{
        collective: PublicKey;
        tokenBonding?: PublicKey;
    }>;
    /**
     * Instructions to claim a social token
     *
     * @param param0
     * @returns
     */
    claimSocialTokenInstructions({ payer, owner, tokenRef, tokenName, symbol, buyBaseRoyalties, buyTargetRoyalties, sellBaseRoyalties, sellTargetRoyalties, ignoreMissingName, isPrimary, authority, }: IClaimSocialTokenArgs): Promise<BigInstructionResult<null>>;
    /**
     * Run {@link claimSocialTokenInstructions}
     * @param args
     */
    claimSocialToken(args: IClaimSocialTokenArgs): Promise<void>;
    /**
     * Get the seeds for the PDA of a token ref given the various parameters.
     *
     * @param param0
     * @returns
     */
    static ownerTokenRefSeeds({ owner, name, mint, isPrimary, }: ITokenRefKeyArgs): Buffer[];
    static collectiveKey(mint: PublicKey, programId?: PublicKey): Promise<[PublicKey, number]>;
    static ownerTokenRefKey(args: ITokenRefKeyArgs, programId?: PublicKey): Promise<[PublicKey, number]>;
    static mintTokenRefKey(mint: PublicKey, programId?: PublicKey): Promise<[PublicKey, number]>;
    /**
     * Get instructions to set this ownerTokenRef as our primary token ref (lookups to "owner-token-ref", owner pda find this ownerTokenRef)
     *
     * @param param0
     * @returns
     */
    setAsPrimaryInstructions({ payer, tokenRef, owner, }: ISetAsPrimaryArgs): Promise<InstructionResult<{
        primaryTokenRef: PublicKey;
    }>>;
    /**
     * Run {@link setAsPrimaryInstructions}
     * @param args
     */
    setAsPrimary(args: ISetAsPrimaryArgs): Promise<{
        primaryTokenRef: PublicKey;
    }>;
    /**
     * Get instructions to update this collective
     *
     * @param param0
     * @returns
     */
    updateCollectiveInstructions({ collective, authority, config, }: IUpdateCollectiveArgs): Promise<InstructionResult<null>>;
    /**
     * Run {@link updateCollectiveInstructions}
     * @param args
     */
    updateCollective(args: IUpdateCollectiveArgs): Promise<null>;
    /**
     * Instructions to create everything around a social token... metadata, bonding curves, etc.
     *
     * @param param0
     * @returns
     */
    createSocialTokenInstructions({ ignoreIfExists, payer, collective, mint, name, owner, targetMintKeypair, metadata, nameClass, nameParent, tokenBondingParams, isPrimary, authority, }: ICreateSocialTokenArgs): Promise<BigInstructionResult<{
        ownerTokenRef: PublicKey;
        mintTokenRef: PublicKey;
        tokenBonding: PublicKey | null;
        mint: PublicKey;
    }>>;
    /**
     * Run {@link createSocialTokenInstructions}
     * @param args
     * @returns
     */
    createSocialToken(args: ICreateSocialTokenArgs, commitment?: Finality): Promise<{
        ownerTokenRef: PublicKey;
        mintTokenRef: PublicKey;
        tokenBonding: PublicKey | null;
        mint: PublicKey;
    }>;
    getUserTokensWithMeta(tokenAccounts?: TokenAccount[]): Promise<ITokenWithMetaAndAccount[]>;
    /**
     * Claims the reserve and general authority from any bonding curve
     * that has this token ref as the authority. Useful for setting bonding curves
     * that can later be claimed by the social token holder.
     *
     * @param param0
     * @returns
     */
    claimBondingAuthorityInstructions({ tokenBonding, }: IClaimBondingAuthorityArgs): Promise<InstructionResult<null>>;
    /**
     * Runs {@link `claimBondingAuthorityInstructions`}
     *
     * @param args
     * @retruns
     */
    claimBondingAuthority(args: IClaimBondingAuthorityArgs, commitment?: Commitment): Promise<void>;
    /**
     * Update a bonding cruve.
     *
     * @param args
     * @returns
     */
    updateTokenBondingInstructions({ tokenRef, buyBaseRoyaltyPercentage, buyTargetRoyaltyPercentage, sellBaseRoyaltyPercentage, sellTargetRoyaltyPercentage, buyBaseRoyalties, buyTargetRoyalties, sellBaseRoyalties, sellTargetRoyalties, buyFrozen, }: IUpdateTokenBondingViaCollectiveArgs): Promise<InstructionResult<null>>;
    /**
     * Runs {@link `updateTokenBondingInstructions`}
     *
     * @param args
     * @retruns
     */
    updateTokenBonding(args: IUpdateTokenBondingViaCollectiveArgs, commitment?: Commitment): Promise<void>;
    updateCurveInstructions({ tokenRef, curve, adminKey, }: IUpdateCurveViaCollectiveArgs): Promise<InstructionResult<null>>;
    /**
     * Runs {@link `updateCurveInstructions`}
     *
     * @param args
     * @retruns
     */
    updateCurve(args: IUpdateCurveViaCollectiveArgs, commitment?: Commitment): Promise<void>;
    getOptionalNameRecord(name: PublicKey | undefined): Promise<NameRegistryState | null>;
    /**
     * Opt out a social token
     *
     * @param args
     * @returns
     */
    optOutInstructions({ tokenRef, handle, nameClass, nameParent, }: IOptOutArgs): Promise<InstructionResult<null>>;
    /**
     * Runs {@link `optOutInstructions`}
     *
     * @param args
     * @retruns
     */
    optOut(args: IOptOutArgs, commitment?: Commitment): Promise<void>;
    /**
     * Update the owner wallet of a social token
     *
     * @param args
     * @returns
     */
    updateOwnerInstructions({ payer, tokenRef, newOwner, }: IUpdateOwnerArgs): Promise<InstructionResult<{
        ownerTokenRef: PublicKey;
    }>>;
    /**
     * Runs {@link `updateOwnerInstructions`}
     *
     * @param args
     * @retruns
     */
    updateOwner(args: IUpdateOwnerArgs, commitment?: Commitment): Promise<{
        ownerTokenRef: PublicKey;
    }>;
    /**
     * Update the authority of a social token
     *
     * @param args
     * @returns
     */
    updateAuthorityInstructions({ payer, tokenRef, newAuthority, owner, }: IUpdateAuthorityArgs): Promise<InstructionResult<null>>;
    /**
     * Runs {@link `updateAuthorityInstructions`}
     *
     * @param args
     * @retruns
     */
    updateAuthority(args: IUpdateAuthorityArgs): Promise<null>;
}
//# sourceMappingURL=index.d.ts.map