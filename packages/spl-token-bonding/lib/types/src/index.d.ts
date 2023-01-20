import * as anchor from "@project-serum/anchor";
import { Program, AnchorProvider } from "@project-serum/anchor";
import { Commitment, Keypair, PublicKey } from "@solana/web3.js";
import { AnchorSdk, InstructionResult, TypedAccountParser } from "@strata-foundation/spl-utils";
import BN from "bn.js";
import { BondingHierarchy } from "./bondingHierarchy";
import { IPricingCurve, ITransitionFee } from "./curves";
import { CurveV0, ProgramStateV0, SplTokenBondingIDL, TokenBondingV0 } from "./generated/spl-token-bonding";
import { BondingPricing } from "./pricing";
export * from "./bondingHierarchy";
export * from "./curves";
export * from "./generated/spl-token-bonding";
export * from "./pricing";
export * from "./utils";
/**
 * The curve config required by the smart contract is unwieldy, implementors of `CurveConfig` wrap the interface
 */
export interface ICurveConfig {
    toRawConfig(): CurveV0;
}
export interface IPrimitiveCurve {
    toRawPrimitiveConfig(): any;
}
/**
 * Curve configuration for c(S^(pow/frac)) + b
 */
export declare class ExponentialCurveConfig implements ICurveConfig, IPrimitiveCurve {
    c: BN;
    b: BN;
    pow: number;
    frac: number;
    constructor({ c, b, pow, frac, }: {
        c?: number | BN;
        b?: number | BN;
        pow?: number;
        frac?: number;
    });
    toRawPrimitiveConfig(): any;
    toRawConfig(): CurveV0;
}
/**
 * Curve configuration for c(S^(pow/frac)) + b
 */
export declare class TimeDecayExponentialCurveConfig implements ICurveConfig, IPrimitiveCurve {
    c: BN;
    k0: BN;
    k1: BN;
    d: BN;
    interval: number;
    constructor({ c, k0, k1, d, interval, }: {
        c?: number | BN;
        k0?: number | BN;
        k1?: number | BN;
        d?: number | BN;
        interval?: number;
    });
    toRawPrimitiveConfig(): any;
    toRawConfig(): CurveV0;
}
/**
 * Curve configuration that allows the curve to change parameters at discrete time offsets from the go live date
 */
export declare class TimeCurveConfig implements ICurveConfig {
    curves: {
        curve: IPrimitiveCurve;
        offset: BN;
        buyTransitionFees: ITransitionFee | null;
        sellTransitionFees: ITransitionFee | null;
    }[];
    addCurve(timeOffset: number, curve: IPrimitiveCurve, buyTransitionFees?: ITransitionFee | null, sellTransitionFees?: ITransitionFee | null): TimeCurveConfig;
    toRawConfig(): CurveV0;
}
export interface IInitializeCurveArgs {
    /** The configuration for the shape of curve */
    config: ICurveConfig;
    /** The payer to create this curve, defaults to provider.wallet */
    payer?: PublicKey;
    /** The keypair to use for this curve */
    curveKeypair?: Keypair;
}
export interface ICreateTokenBondingOutput {
    tokenBonding: PublicKey;
    baseMint: PublicKey;
    targetMint: PublicKey;
    buyBaseRoyalties: PublicKey;
    buyTargetRoyalties: PublicKey;
    sellBaseRoyalties: PublicKey;
    sellTargetRoyalties: PublicKey;
    baseStorage: PublicKey;
}
export interface ICreateTokenBondingArgs {
    /** The payer to create this token bonding, defaults to provider.wallet */
    payer?: PublicKey;
    /** The shape of the bonding curve. Must be created using {@link SplTokenBonding.initializeCurve} */
    curve: PublicKey;
    /** The base mint that the `targetMint` will be priced in terms of. `baseMint` tokens will fill the bonding curve reserves */
    baseMint: PublicKey;
    /**
     * The mint this bonding curve will create on `buy`. If not provided, specify `targetMintDecimals` and it will create one for you
     *
     * It can be useful to pass the mint in if you're creating a bonding curve for an existing mint. Keep in mind,
     * the authority on this mint will need to be set to the token bonding pda
     */
    targetMint?: PublicKey;
    /**
     * **Default:** New generated keypair
     *
     * Pass in the keypair to use for the mint. Useful if you want a vanity keypair
     */
    targetMintKeypair?: anchor.web3.Keypair;
    /** If `targetMint` is not defined, will create a mint with this number of decimals */
    targetMintDecimals?: number;
    /**
     * Account to store royalties in terms of `baseMint` tokens when the {@link SplTokenBonding.buy} command is issued
     *
     * If not provided, will create an Associated Token Account with `buyBaseRoyaltiesOwner`
  
     * Note that this can be explicitly set to null if there are no royalties
    */
    buyBaseRoyalties?: PublicKey | null;
    /** Only required when `buyBaseRoyalties` is undefined. The owner of the `buyBaseRoyalties` account. **Default:** `provider.wallet` */
    buyBaseRoyaltiesOwner?: PublicKey;
    /**
     * Account to store royalties in terms of `targetMint` tokens when the {@link SplTokenBonding.buy} command is issued
     *
     * If not provided, will create an Associated Token Account with `buyTargetRoyaltiesOwner`
     *
     * Note that this can be explicitly set to null if there are no royalties
     */
    buyTargetRoyalties?: PublicKey | null;
    /** Only required when `buyTargetRoyalties` is undefined. The owner of the `buyTargetRoyalties` account. **Default:** `provider.wallet` */
    buyTargetRoyaltiesOwner?: PublicKey;
    /**
     * Account to store royalties in terms of `baseMint` tokens when the {@link SplTokenBonding.sell} command is issued
     *
     * If not provided, will create an Associated Token Account with `sellBaseRoyaltiesOwner`
     *
     * Note that this can be explicitly set to null if there are no royalties
     */
    sellBaseRoyalties?: PublicKey | null;
    /** Only required when `sellBaseRoyalties` is undefined. The owner of the `sellBaseRoyalties` account. **Default:** `provider.wallet` */
    sellBaseRoyaltiesOwner?: PublicKey;
    /**
     * Account to store royalties in terms of `targetMint` tokens when the {@link SplTokenBonding.sell} command is issued
     *
     * If not provided, will create an Associated Token Account with `sellTargetRoyaltiesOwner`
     *
     *  Note that this can be explicitly set to null if there are no royalties
     */
    sellTargetRoyalties?: PublicKey | null;
    /** Only required when `sellTargetRoyalties` is undefined. The owner of the `sellTargetRoyalties` account. **Default:** `provider.wallet` */
    sellTargetRoyaltiesOwner?: PublicKey;
    /**
     * General authority to change things like royalty percentages and freeze the curve. This is the least dangerous authority
     * **Default:** Wallet public key. Pass null to explicitly not set this authority.
     */
    generalAuthority?: PublicKey | null;
    /**
     * Authority to swap or change the reserve account. **This authority is dangerous. Use with care**
     *
     * From a trust perspective, this authority should almost always be held by another program that handles migrating bonding
     * curves, instead of by an individual.
     *
     * **Default:** null. You most likely don't need this permission, if it is being set you should do so explicitly.
     */
    reserveAuthority?: PublicKey | null;
    /**
     * Authority to swap or change the underlying curve. **This authority is dangerous. Use with care**
     *
     * From a trust perspective, this authority should almost always be held by another program that handles migrating bonding
     * curves, instead of by an individual.
     *
     * **Default:** null. You most likely don't need this permission, if it is being set you should do so explicitly.
     */
    curveAuthority?: PublicKey | null;
    /** Number from 0 to 100. Default: 0 */
    buyBaseRoyaltyPercentage?: number;
    /** Number from 0 to 100. Default: 0 */
    buyTargetRoyaltyPercentage?: number;
    /** Number from 0 to 100. Default: 0 */
    sellBaseRoyaltyPercentage?: number;
    /** Number from 0 to 100. Default: 0 */
    sellTargetRoyaltyPercentage?: number;
    /** Maximum `targetMint` tokens this bonding curve will mint before disabling {@link SplTokenBonding.buy}. **Default:** infinite */
    mintCap?: BN;
    /** Maximum `targetMint` tokens that can be purchased in a single call to {@link SplTokenBonding.buy}. Useful for limiting volume. **Default:** 0 */
    purchaseCap?: BN;
    /** The date this bonding curve will go live. Before this date, {@link SplTokenBonding.buy} and {@link SplTokenBonding.sell} are disabled. **Default:** 1 second ago */
    goLiveDate?: Date;
    /** The date this bonding curve will shut down. After this date, {@link SplTokenBonding.buy} and {@link SplTokenBonding.sell} are disabled. **Default:** null */
    freezeBuyDate?: Date;
    /** Should this bonding curve be frozen initially? It can be unfrozen using {@link SplTokenBonding.updateTokenBonding}. **Default:** false */
    buyFrozen?: boolean;
    /** Should this bonding curve have sell functionality? **Default:** false */
    sellFrozen?: boolean;
    /**
     *
     * Should the bonding curve's price change based on funds entering or leaving the reserves account outside of buy/sell
     *
     * Setting this to `false` means that sending tokens into the reserves improves value for all holders,
     * withdrawing money from reserves (via reserve authority) detracts value from holders.
     *
     */
    ignoreExternalReserveChanges?: boolean;
    /**
     * Should the bonding curve's price change based on external burning of target tokens?
     *
     * Setting this to `false` enables what is called a "sponsored burn". With a sponsored burn,
     * burning tokens increases the value for all holders
     */
    ignoreExternalSupplyChanges?: boolean;
    /**
     * Multiple bonding curves can exist for a given target mint.
     * 0 is reserved for the one where the program owns mint authority and can mint new tokens. All other curves may exist as
     * markeplace curves
     */
    index?: number;
    advanced?: {
        /**
         * Initial padding is an advanced feature, incorrect use could lead to insufficient reserves to cover sells
         *
         * Start the curve off at a given reserve and supply synthetically. This means price can start nonzero. The current use case
         * for this is LBCs. Note that a curve cannot be adaptive. ignoreExternalReserveChanges and ignoreExternalSupplyChanges
         * must be true
         * */
        initialSupplyPad: BN | number;
        /**
         * Initial padding is an advanced feature, incorrect use could lead to insufficient reserves to cover sells
         * */
        initialReservesPad: BN | number;
    };
}
export interface IUpdateTokenBondingCurveArgs {
    tokenBonding: PublicKey;
    curve: PublicKey;
}
export interface IUpdateTokenBondingArgs {
    /** The bonding curve to update */
    tokenBonding: PublicKey;
    /** Number from 0 to 100. **Default:** current */
    buyBaseRoyaltyPercentage?: number;
    /** Number from 0 to 100. **Default:** current */
    buyTargetRoyaltyPercentage?: number;
    /** Number from 0 to 100. **Default:** current */
    sellBaseRoyaltyPercentage?: number;
    /** Number from 0 to 100. **Default:** current */
    sellTargetRoyaltyPercentage?: number;
    /** A new account to store royalties. **Default:** current */
    buyBaseRoyalties?: PublicKey;
    /** A new account to store royalties. **Default:** current */
    buyTargetRoyalties?: PublicKey;
    /** A new account to store royalties. **Default:** current */
    sellBaseRoyalties?: PublicKey;
    /** A new account to store royalties. **Default:** current */
    sellTargetRoyalties?: PublicKey;
    generalAuthority?: PublicKey | null;
    reserveAuthority?: PublicKey | null;
    /** Should this bonding curve be frozen, disabling buy and sell? It can be unfrozen using {@link SplTokenBonding.updateTokenBonding}. **Default:** current */
    buyFrozen?: boolean;
}
export interface IBuyArgs {
    tokenBonding: PublicKey;
    /** The payer to run this transaction, defaults to provider.wallet */
    payer?: PublicKey;
    /** The source account to purchase with. **Default:** ata of `sourceAuthority` */
    source?: PublicKey;
    /** The source destination to purchase to. **Default:** ata of `sourceAuthority` */
    destination?: PublicKey;
    /** The wallet funding the purchase. **Default:** Provider wallet */
    sourceAuthority?: PublicKey;
    /** Must provide either base amount or desired target amount */
    desiredTargetAmount?: BN | number;
    baseAmount?: BN | number;
    expectedOutputAmount?: BN | number /** Expected output amount of `targetMint` before slippage */;
    /** When using desiredTargetAmount, the expected base amount used before slippage */
    expectedBaseAmount?: BN | number;
    /** Decimal number. max price will be (1 + slippage) * price_for_desired_target_amount */
    slippage: number;
}
/** DEPRECATED. Will be removed in a future version */
export interface IExtraInstructionArgs {
    tokenBonding: ITokenBonding;
    isBuy: boolean;
    amount: BN | undefined;
}
export interface IPreInstructionArgs {
    tokenBonding: ITokenBonding;
    isBuy: boolean;
    amount: BN | undefined;
    desiredTargetAmount?: BN | number;
    isFirst: boolean;
}
export interface IPostInstructionArgs {
    isBuy: boolean;
    amount: number | BN | undefined;
    isLast: boolean;
}
export interface ISwapArgs {
    baseMint: PublicKey;
    targetMint: PublicKey;
    /** The payer to run this transaction, defaults to provider.wallet */
    payer?: PublicKey;
    /** The wallet funding the purchase. **Default:** Provider wallet */
    sourceAuthority?: PublicKey;
    /** The amount of baseMint to purchase with */
    baseAmount?: BN | number;
    expectedOutputAmount?: BN | number /** Expected output amount before slippage */;
    expectedBaseAmount?: BN | number /** Only when `desiredOutputAmount` present: Expected base amount before slippage */;
    /**
     * Desired output amount. If specified, uses buy({ desiredTargetAmount }) for the last stage of the swap. This
     * is useful in decimals 0 type situation where you want the whole item or nothing
     */
    desiredTargetAmount?: BN | number;
    /** The slippage PER TRANSACTION */
    slippage: number;
    /** DEPRECATED. Will be removed in a future version. Please use preInstructions instead */
    extraInstructions?: (args: IExtraInstructionArgs) => Promise<InstructionResult<null>>;
    /** Optionally inject extra instructions before each trade. Usefull for adding txn fees */
    preInstructions?: (args: IPreInstructionArgs) => Promise<InstructionResult<null>>;
    /** Optionally inject extra instructions after each transaction */
    postInstructions?: (args: IPostInstructionArgs) => Promise<InstructionResult<null>>;
    /** If the token is entangled, this is the mint of the entangled token */
    entangled?: PublicKey | null;
    /**
     * Number of times to retry the checks for a change in balance. Default: 5
     */
    balanceCheckTries?: number;
}
export interface ISellArgs {
    tokenBonding: PublicKey;
    /** The payer to run this transaction, defaults to provider.wallet */
    payer?: PublicKey;
    source?: PublicKey /** `targetMint` source account to sell from. **Default:** ATA of sourceAuthority */;
    destination?: PublicKey /** `baseMint` destination for tokens from the reserve. **Default:** ATA of wallet */;
    sourceAuthority?: PublicKey /** **Default:** wallet */;
    targetAmount: BN | number /** The amount of `targetMint` tokens to sell. */;
    expectedOutputAmount?: BN | number /** Expected output amount of `baseMint` before slippage */;
    slippage: number;
}
export interface ICloseArgs {
    tokenBonding: PublicKey;
    /** The payer to run this transaction. **Default:** provider.wallet */
    payer?: PublicKey;
    /** Account to receive the rent sol. **Default**: provide.wallet */
    refund?: PublicKey;
    /**
     * Optional (**Default**: General authority on the token bonding). This parameter is only needed when updating the general
     * authority in the same txn as ruunning close
     */
    generalAuthority?: PublicKey;
}
export interface ITransferReservesArgs {
    /** The payer to run this transaction, defaults to provider.wallet */
    payer?: PublicKey;
    tokenBonding: PublicKey;
    amount: BN | number;
    /**
     * The destination for the reserves **Default:** ata of destinationWallet
     */
    destination?: PublicKey;
    /**
     * The destination wallet for the reserves **Default:**
     */
    destinationWallet?: PublicKey;
    /**
     * Optional (**Default**: Reserve authority on the token bonding). This parameter is only needed when updating the reserve
     * authority in the same txn as ruunning transfer
     */
    reserveAuthority?: PublicKey;
}
export interface IBuyBondingWrappedSolArgs {
    amount: BN | number /** The amount of wSOL to buy. If a number, multiplied out to get lamports. If BN, it's lamports */;
    destination?: PublicKey /** The destination twSOL account. **Default:** ATA of owner */;
    source?: PublicKey /** The source of non-wrapped SOL */;
    payer?: PublicKey;
}
export interface ISellBondingWrappedSolArgs {
    amount: BN | number /** The amount of wSOL to buy. If a number, multiplied out to get lamports. If BN, it's lamports */;
    source?: PublicKey /** The twSOL source account. **Default:** ATA of owner */;
    destination?: PublicKey /** The destination to send the actual SOL lamports. **Default:** provider wallet */;
    owner?: PublicKey /** The owner of the twSOL source account. **Default:** provider wallet */;
    payer?: PublicKey;
    all?: boolean /** Sell all and close this account? **Default:** false */;
}
/**
 * Unified token bonding interface wrapping the raw TokenBondingV0
 */
export interface ITokenBonding extends TokenBondingV0 {
    publicKey: PublicKey;
}
export interface IProgramState extends ProgramStateV0 {
    publicKey: PublicKey;
}
/**
 * Unified curve interface wrapping the raw CurveV0
 */
export interface ICurve extends CurveV0 {
    publicKey: PublicKey;
}
export declare class SplTokenBonding extends AnchorSdk<SplTokenBondingIDL> {
    state: IProgramState | undefined;
    static ID: anchor.web3.PublicKey;
    static init(provider: AnchorProvider, splTokenBondingProgramId?: PublicKey): Promise<SplTokenBonding>;
    constructor(provider: AnchorProvider, program: Program<SplTokenBondingIDL>);
    curveDecoder: TypedAccountParser<ICurve>;
    tokenBondingDecoder: TypedAccountParser<ITokenBonding>;
    getTokenBonding(tokenBondingKey: PublicKey): Promise<ITokenBonding | null>;
    getCurve(curveKey: PublicKey): Promise<ICurve | null>;
    /**
     * This is an admin function run once to initialize the smart contract.
     *
     * @returns Instructions needed to create sol storage
     */
    initializeSolStorageInstructions({ mintKeypair, }: {
        mintKeypair: Keypair;
    }): Promise<InstructionResult<null>>;
    /**
     * Admin command run once to initialize the smart contract
     */
    initializeSolStorage({ mintKeypair, }: {
        mintKeypair: Keypair;
    }): Promise<null>;
    /**
     * Create a curve shape for use in a TokenBonding instance
     *
     * @param param0
     * @returns
     */
    initializeCurveInstructions({ payer, config: curveConfig, curveKeypair, }: IInitializeCurveArgs): Promise<InstructionResult<{
        curve: PublicKey;
    }>>;
    /**
     * See {@link initializeCurve}
     * @param args
     * @returns
     */
    initializeCurve(args: IInitializeCurveArgs, commitment?: Commitment): Promise<PublicKey>;
    /**
     * Get the PDA key of a TokenBonding given the target mint and index
     *
     * `index` = 0 is the default bonding curve that can mint `targetMint`. All other curves are curves that allow burning of `targetMint` for some different base.
     *
     * @param targetMint
     * @param index
     * @returns
     */
    static tokenBondingKey(targetMint: PublicKey, index?: number, programId?: PublicKey): Promise<[PublicKey, number]>;
    static wrappedSolMintAuthorityKey(programId?: PublicKey): Promise<[PublicKey, number]>;
    /**
     * Create a bonding curve
     *
     * @param param0
     * @returns
     */
    createTokenBondingInstructions({ generalAuthority, curveAuthority, reserveAuthority, payer, curve, baseMint, targetMint, buyBaseRoyalties, buyBaseRoyaltiesOwner, buyTargetRoyalties, buyTargetRoyaltiesOwner, sellBaseRoyalties, sellBaseRoyaltiesOwner, sellTargetRoyalties, sellTargetRoyaltiesOwner, buyBaseRoyaltyPercentage, buyTargetRoyaltyPercentage, sellBaseRoyaltyPercentage, sellTargetRoyaltyPercentage, mintCap, purchaseCap, goLiveDate, freezeBuyDate, targetMintDecimals, targetMintKeypair, buyFrozen, ignoreExternalReserveChanges, ignoreExternalSupplyChanges, sellFrozen, index, advanced, }: ICreateTokenBondingArgs): Promise<InstructionResult<ICreateTokenBondingOutput>>;
    /**
     * General utility function to check if an account exists
     * @param account
     * @returns
     */
    accountExists(account: anchor.web3.PublicKey): Promise<boolean>;
    /**
     * Runs {@link `createTokenBondingInstructions`}
     *
     * @param args
     * @returns
     */
    createTokenBonding(args: ICreateTokenBondingArgs, commitment?: Commitment): Promise<ICreateTokenBondingOutput>;
    getUnixTime(): Promise<number>;
    updateCurveInstructions({ tokenBonding: tokenBondingKey, curve }: IUpdateTokenBondingCurveArgs): Promise<{
        output: any;
        signers: any[];
        instructions: anchor.web3.TransactionInstruction[];
    }>;
    /**
     * Runs {@link updateCurveInstructions}
     * @param args
     */
    updateCurve(args: IUpdateTokenBondingCurveArgs, commitment?: Commitment): Promise<void>;
    /**
     * Update a bonding curve.
     *
     * @param param0
     * @returns
     */
    updateTokenBondingInstructions({ tokenBonding, buyBaseRoyaltyPercentage, buyTargetRoyaltyPercentage, sellBaseRoyaltyPercentage, sellTargetRoyaltyPercentage, buyBaseRoyalties, buyTargetRoyalties, sellBaseRoyalties, sellTargetRoyalties, generalAuthority, reserveAuthority, buyFrozen, }: IUpdateTokenBondingArgs): Promise<InstructionResult<null>>;
    /**
     * Runs {@link updateTokenBonding}
     * @param args
     */
    updateTokenBonding(args: IUpdateTokenBondingArgs, commitment?: Commitment): Promise<void>;
    /**
     * Instructions to buy twSOL from normal SOL.
     *
     * We wrap SOL so that the bonding contract isn't soaking up a bunch o SOL and damaging the security of the network.
     * The plan is to create a DAO for Strata that will govern what happens with this SOL.
     *
     * @param param0
     * @returns
     */
    buyBondingWrappedSolInstructions({ payer, destination, source, amount, }: IBuyBondingWrappedSolArgs): Promise<InstructionResult<{
        destination: PublicKey;
    }>>;
    /**
     * Invoke `buyBondingWrappedSol` instructions
     * @param args
     * @returns
     */
    buyBondingWrappedSol(args: IBuyBondingWrappedSolArgs, commitment?: Commitment): Promise<{
        destination: PublicKey;
    }>;
    /**
     * Instructions to sell twSOL back into normal SOL.
     *
     * @param param0
     * @returns
     */
    sellBondingWrappedSolInstructions({ source, owner, destination, amount, all, }: ISellBondingWrappedSolArgs): Promise<InstructionResult<null>>;
    /**
     * Execute `sellBondingWrappedSolInstructions`
     * @param args
     * @returns
     */
    sellBondingWrappedSol(args: ISellBondingWrappedSolArgs, commitment?: Commitment): Promise<null>;
    /**
     * Issue a command to buy `targetMint` tokens with `baseMint` tokens.
     *
     * @param param0
     * @returns
     */
    buyInstructions({ tokenBonding, source, sourceAuthority, destination, desiredTargetAmount, baseAmount, expectedOutputAmount, expectedBaseAmount, slippage, payer, }: IBuyArgs): Promise<InstructionResult<null>>;
    /**
     * Runs {@link buy}
     * @param args
     */
    buy(args: IBuyArgs, commitment?: Commitment): Promise<void>;
    getTokenAccountBalance(account: PublicKey, commitment?: Commitment): Promise<BN>;
    /**
     * Swap from any base mint to any target mint that are both on a shared link of bonding curves.
     * Intelligently traverses using either buy or sell, executing multiple txns to either sell baseAmount
     * or buy with baseAmount
     *
     * @param param0
     */
    swap({ payer, sourceAuthority, baseMint, targetMint, baseAmount, expectedBaseAmount, desiredTargetAmount, expectedOutputAmount, slippage, balanceCheckTries, extraInstructions, preInstructions, postInstructions, entangled, }: ISwapArgs): Promise<{
        targetAmount: number;
    }>;
    getState(): Promise<(IProgramState & {
        publicKey: PublicKey;
    }) | null>;
    /**
     * Instructions to burn `targetMint` tokens in exchange for `baseMint` tokens
     *
     * @param param0
     * @returns
     */
    sellInstructions({ tokenBonding, source, sourceAuthority, destination, targetAmount, expectedOutputAmount, slippage, payer, }: ISellArgs): Promise<InstructionResult<null>>;
    /**
     * Runs {@link sell}
     * @param args
     */
    sell(args: ISellArgs, commitment?: Commitment): Promise<void>;
    /**
     * Instructions to close the bonding curve
     *
     * @param param0
     * @returns
     */
    closeInstructions({ tokenBonding, generalAuthority, refund, }: ICloseArgs): Promise<InstructionResult<null>>;
    /**
     * Runs {@link closeInstructions}
     * @param args
     */
    close(args: ICloseArgs, commitment?: Commitment): Promise<void>;
    /**
     * Instructions to transfer the reserves of the bonding curve
     *
     * @param param0
     * @returns
     */
    transferReservesInstructions({ tokenBonding, destination, amount, reserveAuthority, destinationWallet, payer, }: ITransferReservesArgs): Promise<InstructionResult<null>>;
    /**
     * Runs {@link closeInstructions}
     * @param args
     */
    transferReserves(args: ITransferReservesArgs, commitment?: Commitment): Promise<void>;
    /**
     * Get a class capable of displaying pricing information or this token bonding at its current reserve and supply
     *
     * @param tokenBonding
     * @returns
     */
    getBondingPricingCurve(tokenBonding: PublicKey): Promise<IPricingCurve>;
    /**
     * Given some reserves and supply, get a pricing model for a curve at `key`.
     *
     * @param key
     * @param baseAmount
     * @param targetSupply
     * @param goLiveUnixTime
     * @returns
     */
    getPricingCurve(key: PublicKey, baseAmount: number, targetSupply: number, goLiveUnixTime: number): Promise<IPricingCurve>;
    getPricing(tokenBondingKey: PublicKey | undefined): Promise<BondingPricing | undefined>;
    /**
     * Fetch the token bonding curve and all of its direct ancestors
     *
     * @param tokenBondingKey
     * @returns
     */
    getBondingHierarchy(tokenBondingKey: PublicKey | undefined, stopAtMint?: PublicKey | undefined): Promise<BondingHierarchy | undefined>;
}
//# sourceMappingURL=index.d.ts.map