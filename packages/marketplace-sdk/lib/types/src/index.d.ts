import { DataV2 } from "@metaplex-foundation/mpl-token-metadata";
import { AnchorProvider } from "@project-serum/anchor";
import { Finality, Keypair, PublicKey } from "@solana/web3.js";
import { ICreateTokenBondingArgs, ICreateTokenBondingOutput, ICurveConfig, ITokenBonding, SplTokenBonding } from "@strata-foundation/spl-token-bonding";
import { SplTokenCollective } from "@strata-foundation/spl-token-collective";
import { FungibleEntangler, ICreateFungibleEntanglerOutput } from "@strata-foundation/fungible-entangler";
import { Attribute, BigInstructionResult, InstructionResult, SplTokenMetadata } from "@strata-foundation/spl-utils";
import BN from "bn.js";
export declare const FEES_WALLET: PublicKey;
export declare const FIXED_CURVE_FEES = 0;
export declare const LBC_CURVE_FEES = 0;
export declare type GetBountyItem = {
    tokenBondingKey: PublicKey;
    targetMint: PublicKey;
    baseMint: PublicKey;
    reserveBalanceFromBonding: BN;
    goLiveUnixTime: BN;
};
interface ICreateMarketItemArgs {
    payer?: PublicKey;
    /**
     * Optionally, use this keypair to create the target mint
     */
    targetMintKeypair?: Keypair;
    /**
     * Wallet who will receive the proceeds of this sale. **Default:** provider wallet publicKey
     */
    seller?: PublicKey;
    /**
     * The update authority on the metadata created. **Default:** Seller
     */
    metadataUpdateAuthority?: PublicKey;
    /**
     * The token metadata for the marketplace item
     */
    metadata: DataV2;
    /**
     * The quantity to stop selling at
     */
    quantity?: number;
    /**
     * The price to sell them for. If not provided, should pass `bondingArgs.curve`
     */
    price?: number;
    /**
     * The mint to base the sales off of
     */
    baseMint: PublicKey;
    /**
     * Optionally -- override bonding params
     */
    bondingArgs?: Partial<ICreateTokenBondingArgs>;
}
interface ICreateBountyArgs {
    payer?: PublicKey;
    /**
     * Optionally, use this keypair to create the target mint
     */
    targetMintKeypair?: Keypair;
    /**
     * Wallet who will approve the bounty and disburse the funds
     */
    authority?: PublicKey;
    /**
     * The update authority on the metadata created. **Default:** authority
     */
    metadataUpdateAuthority?: PublicKey;
    /**
     * The token metadata for the marketplace item
     */
    metadata: DataV2;
    /**
     * The mint to base the sales off of
     */
    baseMint: PublicKey;
    /**
     * Optionally -- override bonding params
     */
    bondingArgs?: Partial<ICreateTokenBondingArgs>;
}
interface ILbcCurveArgs {
    /** Max tokens to be sold */
    maxSupply: number;
    /** Interval in seconds to sell them over */
    interval: number;
    /**
     * Starting price
     */
    startPrice: number;
    /**
     * Minimum price (finishing price if no one buys anything)
     */
    minPrice: number;
    /** Optional, the time decay exponential */
    timeDecay?: number;
}
interface ICreateLiquidityBootstrapperArgs extends ILbcCurveArgs {
    payer?: PublicKey;
    /**
     * Optionally, use this keypair to create the target mint
     */
    targetMintKeypair?: Keypair;
    /**
     * Optionally, use this mint. You must have mint authority
     */
    targetMint?: PublicKey;
    /**
     * Wallet who will recieve the funds from the liquidity bootstrapping
     */
    authority?: PublicKey;
    /**
     * The token metadata for the LBC item
     */
    metadata?: DataV2;
    /**
     * The update authority on the metadata created. **Default:** authority
     */
    metadataUpdateAuthority?: PublicKey;
    /**
     * The mint to base the sales off of
     */
    baseMint: PublicKey;
    /**
     * Optionally -- override bonding params
     */
    bondingArgs?: Partial<ICreateTokenBondingArgs>;
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
interface IDisburseCurveArgs {
    payer?: PublicKey;
    /**
     * The token bonding id of the bounty
     */
    tokenBonding: PublicKey;
    /**
     * The destination to disburse funds to (ata)
     */
    destination?: PublicKey;
    /**
     * The destination wallet to disburse funds to (if not providing destination)
     */
    destinationWallet?: PublicKey;
    /** If this is an initial token offering, also close the second curve */
    includeRetrievalCurve?: boolean;
    /** Should this only transfer reserves, or transfer and close? */
    closeBonding?: Boolean;
    /** Should this close the passed entangler for token offerings? */
    closeEntangler?: Boolean;
    parentEntangler?: PublicKey;
    childEntangler?: PublicKey;
}
interface ICreateTokenBondingForSetSupplyArgs extends ICreateTokenBondingArgs, Omit<ICreateRetrievalCurveForSetSupplyArgs, "targetMint"> {
}
interface ICreateRetrievalCurveForSetSupplyArgs {
    payer?: PublicKey;
    /** The source for the set supply (**Default:** ata of provider wallet) */
    source?: PublicKey;
    /** The mint we're selling a set supply of */
    supplyMint: PublicKey;
    /** The set supply to sell */
    supplyAmount: number;
    /** Optional override of the default fixed constant price curve */
    fixedCurve?: PublicKey;
    /**
     * Authority to swap or change the reserve account.
     */
    reserveAuthority?: PublicKey | null;
    targetMint: PublicKey;
}
interface ICreateManualTokenArgs {
    payer?: PublicKey;
    /**
     * Optional vanity keypair
     */
    mintKeypair?: Keypair;
    decimals: number;
    amount: number;
    metadata: DataV2;
}
export declare class MarketplaceSdk {
    readonly provider: AnchorProvider;
    readonly tokenBondingSdk: SplTokenBonding;
    readonly tokenCollectiveSdk: SplTokenCollective;
    readonly fungibleEntanglerSdk: FungibleEntangler;
    readonly tokenMetadataSdk: SplTokenMetadata;
    static FIXED_CURVE: string;
    static bountyAttributes({ mint, contact, discussion, }: {
        mint: PublicKey;
        contact: string;
        discussion: string;
    }): Attribute[];
    static init(provider: AnchorProvider, splTokenBondingProgramId?: PublicKey, splTokenCollectiveProgramId?: PublicKey, fungibleEntanglerProgramId?: PublicKey): Promise<MarketplaceSdk>;
    constructor(provider: AnchorProvider, tokenBondingSdk: SplTokenBonding, tokenCollectiveSdk: SplTokenCollective, fungibleEntanglerSdk: FungibleEntangler, tokenMetadataSdk: SplTokenMetadata);
    createManualTokenInstructions({ mintKeypair, decimals, metadata, amount, payer, }: ICreateManualTokenArgs): Promise<InstructionResult<{
        mint: PublicKey;
    }>>;
    createManualToken(args: ICreateManualTokenArgs): Promise<{
        mint: PublicKey;
    }>;
    createFixedCurve({ keypair, }: {
        keypair: Keypair;
    }): Promise<PublicKey>;
    disburseBountyInstructions(args: IDisburseCurveArgs): Promise<InstructionResult<null>>;
    /**
     * Disburses all of the funds from the curve to the specified address
     * and closes the bonding curve
     *
     * If the bounty is owned by a previous unclaimed social token, handles the changeover of owners
     *
     * @param param0
     * @returns
     */
    disburseCurveInstructions({ tokenBonding, destination, destinationWallet, includeRetrievalCurve, closeBonding, parentEntangler, childEntangler, closeEntangler, }: IDisburseCurveArgs): Promise<InstructionResult<null>>;
    disburseBounty(args: IDisburseCurveArgs, finality?: Finality): Promise<null>;
    /**
     * Executes `disburseCurveInstructions`
     * @param args
     * @returns
     */
    disburseCurve(args: IDisburseCurveArgs, finality?: Finality): Promise<null>;
    getBounties({ baseMint, }: {
        baseMint?: PublicKey;
    }): Promise<GetBountyItem[]>;
    createMetadataForBondingInstructions({ metadataUpdateAuthority, metadata, targetMintKeypair, decimals, }: ICreateMetadataForBondingArgs): Promise<InstructionResult<{
        metadata: PublicKey;
        mint: PublicKey;
    }>>;
    /**
     * Creates a market item selling a quantity qty for a price
     *
     * @param param0
     * @returns
     */
    createMarketItemInstructions({ payer, seller, metadata, metadataUpdateAuthority, quantity, price, bondingArgs, baseMint, targetMintKeypair, }: ICreateMarketItemArgs): Promise<BigInstructionResult<{
        tokenBonding: PublicKey;
        targetMint: PublicKey;
    }>>;
    /**
     * Executes `createMarketItemIntructions`
     * @param args
     * @returns
     */
    createMarketItem(args: ICreateMarketItemArgs, finality?: Finality): Promise<{
        tokenBonding: PublicKey;
        targetMint: PublicKey;
    }>;
    static isNormalBounty(tokenBonding: ITokenBonding | undefined): boolean;
    /**
     * Creates a bounty
     *
     * @param param0
     * @returns
     */
    createBountyInstructions({ payer, authority, targetMintKeypair, metadata, metadataUpdateAuthority, bondingArgs, baseMint, }: ICreateBountyArgs): Promise<BigInstructionResult<{
        tokenBonding: PublicKey;
        targetMint: PublicKey;
    }>>;
    /**
     * Executes `createBountyIntructions`
     * @param args
     * @returns
     */
    createBounty(args: ICreateBountyArgs, finality?: Finality): Promise<{
        tokenBonding: PublicKey;
        targetMint: PublicKey;
    }>;
    static lbcCurve({ interval, startPrice, minPrice, maxSupply, timeDecay, }: ILbcCurveArgs): {
        reserves: number;
        supply: number;
        curveConfig: ICurveConfig;
    };
    /**
     * Creates an LBC
     *
     * @param param0
     * @returns
     */
    createLiquidityBootstrapperInstructions({ payer, authority, targetMint, targetMintKeypair, metadata, metadataUpdateAuthority, interval, startPrice, minPrice, maxSupply, bondingArgs, baseMint, }: ICreateLiquidityBootstrapperArgs): Promise<BigInstructionResult<{
        tokenBonding: PublicKey;
        targetMint: PublicKey;
    }>>;
    /**
     * Executes `createLiquidityBootstrapperIntructions`
     * @param args
     * @returns
     */
    createLiquidityBootstrapper(args: ICreateLiquidityBootstrapperArgs, finality?: Finality): Promise<{
        tokenBonding: PublicKey;
        targetMint: PublicKey;
    }>;
    /**
     * Sell `supplyAmount` supply of tokens of `supplyMint` by creating a system of two bonding curves:
     *
     *    Offer bonding curve - sells an intermediary token for the base token
     *    Retrieval bonding curve - allows burning the intermediary token for the set supply
     */
    createTokenBondingForSetSupplyInstructions({ supplyAmount, reserveAuthority, supplyMint, source, fixedCurve, ...args }: ICreateTokenBondingForSetSupplyArgs): Promise<BigInstructionResult<{
        offer: ICreateTokenBondingOutput;
        retrieval: ICreateFungibleEntanglerOutput;
    }>>;
    /**
     * Executes `createTokenBondingForSetSupplyInstructions`
     * @param args
     * @returns
     */
    createTokenBondingForSetSupply(args: ICreateTokenBondingForSetSupplyArgs, finality?: Finality): Promise<{
        offer: ICreateTokenBondingOutput;
        retrieval: ICreateFungibleEntanglerOutput;
    }>;
}
export {};
//# sourceMappingURL=index.d.ts.map