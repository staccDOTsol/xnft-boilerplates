import { CreateMetadataV2, DataV2, Metadata, } from "@metaplex-foundation/mpl-token-metadata";
import * as anchor from "@project-serum/anchor";
import { AccountLayout, ASSOCIATED_TOKEN_PROGRAM_ID, NATIVE_MINT, Token, TOKEN_PROGRAM_ID, u64, } from "@solana/spl-token";
import { Keypair, PublicKey, SystemProgram, SYSVAR_CLOCK_PUBKEY, SYSVAR_RENT_PUBKEY, } from "@solana/web3.js";
import { AnchorSdk, createMintInstructions, getMintInfo, getTokenAccount, percent, SplTokenMetadata, } from "@strata-foundation/spl-utils";
import BN from "bn.js";
import { BondingHierarchy } from "./bondingHierarchy";
import { fromCurve } from "./curves";
import { BondingPricing } from "./pricing";
import { amountAsNum, asDecimal, toBN, toNumber, toU128 } from "./utils";
export * from "./bondingHierarchy";
export * from "./curves";
export * from "./generated/spl-token-bonding";
export * from "./pricing";
export * from "./utils";
async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function anyDefined(...args) {
    return args.some((a) => typeof a !== "undefined");
}
function definedOr(value, def) {
    if (typeof value == "undefined") {
        return def;
    }
    return value;
}
/**
 * Curve configuration for c(S^(pow/frac)) + b
 */
export class ExponentialCurveConfig {
    c;
    b;
    pow;
    frac;
    constructor({ c = 1, b = 0, pow = 1, frac = 1, }) {
        this.c = toU128(c);
        this.b = toU128(b);
        this.pow = pow;
        this.frac = frac;
        if (this.b.gt(new BN(0)) && this.c.gt(new BN(0))) {
            throw new Error("Unsupported: Cannot define an exponential function with `b`, the math to go from base to target amount becomes too hard.");
        }
    }
    toRawPrimitiveConfig() {
        return {
            exponentialCurveV0: {
                // @ts-ignore
                c: this.c,
                // @ts-ignore
                b: this.b,
                // @ts-ignore
                pow: this.pow,
                // @ts-ignore
                frac: this.frac,
            },
        };
    }
    toRawConfig() {
        return {
            // @ts-ignore
            definition: {
                timeV0: {
                    curves: [
                        {
                            // @ts-ignore
                            offset: new BN(0),
                            // @ts-ignore
                            curve: this.toRawPrimitiveConfig(),
                        },
                    ],
                },
            },
        };
    }
}
/**
 * Curve configuration for c(S^(pow/frac)) + b
 */
export class TimeDecayExponentialCurveConfig {
    c;
    k0;
    k1;
    d;
    interval;
    constructor({ c = 1, k0 = 0, k1 = 1, d = 1, interval = 24 * 60 * 60, }) {
        this.c = toU128(c);
        this.k0 = toU128(k0);
        this.k1 = toU128(k1);
        this.d = toU128(d);
        this.interval = interval;
    }
    toRawPrimitiveConfig() {
        return {
            timeDecayExponentialCurveV0: {
                // @ts-ignore
                c: this.c,
                // @ts-ignore
                k0: this.k0,
                k1: this.k1,
                d: this.d,
                // @ts-ignore
                interval: this.interval,
            },
        };
    }
    toRawConfig() {
        return {
            // @ts-ignore
            definition: {
                timeV0: {
                    curves: [
                        {
                            // @ts-ignore
                            offset: new BN(0),
                            // @ts-ignore
                            curve: this.toRawPrimitiveConfig(),
                        },
                    ],
                },
            },
        };
    }
}
/**
 * Curve configuration that allows the curve to change parameters at discrete time offsets from the go live date
 */
export class TimeCurveConfig {
    curves = [];
    addCurve(timeOffset, curve, buyTransitionFees = null, sellTransitionFees = null) {
        if (this.curves.length == 0 && timeOffset != 0) {
            throw new Error("First time offset must be 0");
        }
        this.curves.push({
            curve,
            offset: new BN(timeOffset),
            buyTransitionFees,
            sellTransitionFees,
        });
        return this;
    }
    toRawConfig() {
        return {
            // @ts-ignore
            definition: {
                timeV0: {
                    // @ts-ignore
                    curves: this.curves.map(({ curve, offset, buyTransitionFees, sellTransitionFees }) => ({
                        curve: curve.toRawPrimitiveConfig(),
                        offset,
                        buyTransitionFees,
                        sellTransitionFees,
                    })),
                },
            },
        };
    }
}
export class SplTokenBonding extends AnchorSdk {
    state;
    static ID = new PublicKey("TBondmkCYxaPCKG4CHYfVTcwQ8on31xnJrPzk8F8WsS");
    static async init(provider, splTokenBondingProgramId = SplTokenBonding.ID) {
        const SplTokenBondingIDLJson = await anchor.Program.fetchIdl(splTokenBondingProgramId, provider);
        const splTokenBonding = new anchor.Program(SplTokenBondingIDLJson, splTokenBondingProgramId, provider);
        return new this(provider, splTokenBonding);
    }
    constructor(provider, program) {
        super({ provider, program });
    }
    curveDecoder = (pubkey, account) => {
        const coded = this.program.coder.accounts.decode("CurveV0", account.data);
        return {
            ...coded,
            publicKey: pubkey,
        };
    };
    tokenBondingDecoder = (pubkey, account) => {
        const coded = this.program.coder.accounts.decode("TokenBondingV0", account.data);
        return {
            ...coded,
            publicKey: pubkey,
        };
    };
    getTokenBonding(tokenBondingKey) {
        return this.getAccount(tokenBondingKey, this.tokenBondingDecoder);
    }
    getCurve(curveKey) {
        return this.getAccount(curveKey, this.curveDecoder);
    }
    /**
     * This is an admin function run once to initialize the smart contract.
     *
     * @returns Instructions needed to create sol storage
     */
    async initializeSolStorageInstructions({ mintKeypair, }) {
        const exists = await this.getState();
        if (exists) {
            return {
                output: null,
                instructions: [],
                signers: [],
            };
        }
        console.log("Sol storage does not exist, creating...");
        const [state, bumpSeed] = await PublicKey.findProgramAddress([Buffer.from("state", "utf-8")], this.programId);
        const [solStorage, solStorageBumpSeed] = await PublicKey.findProgramAddress([Buffer.from("sol-storage", "utf-8")], this.programId);
        const [wrappedSolAuthority, mintAuthorityBumpSeed] = await PublicKey.findProgramAddress([Buffer.from("wrapped-sol-authority", "utf-8")], this.programId);
        const instructions = [];
        const signers = [];
        signers.push(mintKeypair);
        instructions.push(...[
            SystemProgram.createAccount({
                fromPubkey: this.wallet.publicKey,
                newAccountPubkey: mintKeypair.publicKey,
                space: 82,
                lamports: await this.provider.connection.getMinimumBalanceForRentExemption(82),
                programId: TOKEN_PROGRAM_ID,
            }),
            Token.createInitMintInstruction(TOKEN_PROGRAM_ID, mintKeypair.publicKey, 9, this.wallet.publicKey, wrappedSolAuthority),
        ]);
        instructions.push(...new CreateMetadataV2({
            feePayer: this.wallet.publicKey,
        }, {
            metadata: await Metadata.getPDA(mintKeypair.publicKey),
            mint: mintKeypair.publicKey,
            metadataData: new DataV2({
                name: "Token Bonding Wrapped SOL",
                symbol: "twSOL",
                uri: "",
                sellerFeeBasisPoints: 0,
                // @ts-ignore
                creators: null,
                collection: null,
                uses: null,
            }),
            mintAuthority: this.wallet.publicKey,
            updateAuthority: this.wallet.publicKey,
        }).instructions);
        instructions.push(Token.createSetAuthorityInstruction(TOKEN_PROGRAM_ID, mintKeypair.publicKey, wrappedSolAuthority, "MintTokens", this.wallet.publicKey, []));
        instructions.push(await this.instruction.initializeSolStorageV0({
            solStorageBumpSeed,
            bumpSeed,
            mintAuthorityBumpSeed,
        }, {
            accounts: {
                state,
                payer: this.wallet.publicKey,
                solStorage,
                mintAuthority: wrappedSolAuthority,
                wrappedSolMint: mintKeypair.publicKey,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                rent: SYSVAR_RENT_PUBKEY,
            },
        }));
        return {
            instructions,
            signers,
            output: null,
        };
    }
    /**
     * Admin command run once to initialize the smart contract
     */
    initializeSolStorage({ mintKeypair, }) {
        return this.execute(this.initializeSolStorageInstructions({ mintKeypair }));
    }
    /**
     * Create a curve shape for use in a TokenBonding instance
     *
     * @param param0
     * @returns
     */
    async initializeCurveInstructions({ payer = this.wallet.publicKey, config: curveConfig, curveKeypair = anchor.web3.Keypair.generate(), }) {
        const curve = curveConfig.toRawConfig();
        return {
            output: {
                curve: curveKeypair.publicKey,
            },
            signers: [curveKeypair],
            instructions: [
                SystemProgram.createAccount({
                    fromPubkey: payer,
                    newAccountPubkey: curveKeypair.publicKey,
                    space: 500,
                    lamports: await this.provider.connection.getMinimumBalanceForRentExemption(500),
                    programId: this.programId,
                }),
                await this.instruction.createCurveV0(curve, {
                    accounts: {
                        payer,
                        curve: curveKeypair.publicKey,
                        systemProgram: SystemProgram.programId,
                        rent: SYSVAR_RENT_PUBKEY,
                    },
                }),
            ],
        };
    }
    /**
     * See {@link initializeCurve}
     * @param args
     * @returns
     */
    async initializeCurve(args, commitment = "confirmed") {
        return (await this.execute(this.initializeCurveInstructions(args), args.payer, commitment)).curve;
    }
    /**
     * Get the PDA key of a TokenBonding given the target mint and index
     *
     * `index` = 0 is the default bonding curve that can mint `targetMint`. All other curves are curves that allow burning of `targetMint` for some different base.
     *
     * @param targetMint
     * @param index
     * @returns
     */
    static async tokenBondingKey(targetMint, index = 0, programId = SplTokenBonding.ID) {
        const pad = Buffer.alloc(2);
        new BN(index, 16, "le").toArrayLike(Buffer).copy(pad);
        return PublicKey.findProgramAddress([Buffer.from("token-bonding", "utf-8"), targetMint.toBuffer(), pad], programId);
    }
    static async wrappedSolMintAuthorityKey(programId = SplTokenBonding.ID) {
        return PublicKey.findProgramAddress([Buffer.from("wrapped-sol-authority", "utf-8")], programId);
    }
    /**
     * Create a bonding curve
     *
     * @param param0
     * @returns
     */
    async createTokenBondingInstructions({ generalAuthority = this.wallet.publicKey, curveAuthority = null, reserveAuthority = null, payer = this.wallet.publicKey, curve, baseMint, targetMint, buyBaseRoyalties, buyBaseRoyaltiesOwner = this.wallet.publicKey, buyTargetRoyalties, buyTargetRoyaltiesOwner = this.wallet.publicKey, sellBaseRoyalties, sellBaseRoyaltiesOwner = this.wallet.publicKey, sellTargetRoyalties, sellTargetRoyaltiesOwner = this.wallet.publicKey, buyBaseRoyaltyPercentage = 0, buyTargetRoyaltyPercentage = 0, sellBaseRoyaltyPercentage = 0, sellTargetRoyaltyPercentage = 0, mintCap, purchaseCap, goLiveDate, freezeBuyDate, targetMintDecimals, targetMintKeypair = Keypair.generate(), buyFrozen = false, ignoreExternalReserveChanges = false, ignoreExternalSupplyChanges = false, sellFrozen = false, index, advanced = {
        initialSupplyPad: 0,
        initialReservesPad: 0,
    }, }) {
        if (!targetMint) {
            if (sellTargetRoyalties || buyTargetRoyalties) {
                throw new Error("Cannot define target royalties if mint is not defined");
            }
            if (typeof targetMintDecimals == "undefined") {
                throw new Error("Cannot define mint without decimals ");
            }
        }
        if (!goLiveDate) {
            goLiveDate = new Date(0);
            goLiveDate.setUTCSeconds((await this.getUnixTime()) - 10);
        }
        const provider = this.provider;
        const state = (await this.getState());
        let isNative = baseMint.equals(NATIVE_MINT) || baseMint.equals(state.wrappedSolMint);
        if (isNative) {
            baseMint = state.wrappedSolMint;
        }
        const instructions = [];
        const signers = [];
        let shouldCreateMint = false;
        if (!targetMint) {
            signers.push(targetMintKeypair);
            targetMint = targetMintKeypair.publicKey;
            shouldCreateMint = true;
        }
        // Find the proper bonding index to use that isn't taken.
        let indexToUse = index || 0;
        const getTokenBonding = () => {
            return SplTokenBonding.tokenBondingKey(targetMint, indexToUse);
        };
        const getTokenBondingAccount = async () => {
            return this.provider.connection.getAccountInfo((await getTokenBonding())[0]);
        };
        if (!index) {
            // Find an empty voucher account
            while (await getTokenBondingAccount()) {
                indexToUse++;
            }
        }
        else {
            indexToUse = index;
        }
        const [tokenBonding, bumpSeed] = await SplTokenBonding.tokenBondingKey(targetMint, indexToUse);
        if (shouldCreateMint) {
            instructions.push(...(await createMintInstructions(provider, tokenBonding, targetMint, targetMintDecimals)));
        }
        const baseStorageKeypair = anchor.web3.Keypair.generate();
        signers.push(baseStorageKeypair);
        const baseStorage = baseStorageKeypair.publicKey;
        instructions.push(SystemProgram.createAccount({
            fromPubkey: payer,
            newAccountPubkey: baseStorage,
            space: AccountLayout.span,
            programId: TOKEN_PROGRAM_ID,
            lamports: await this.provider.connection.getMinimumBalanceForRentExemption(AccountLayout.span),
        }), Token.createInitAccountInstruction(TOKEN_PROGRAM_ID, baseMint, baseStorage, tokenBonding));
        if (isNative) {
            buyBaseRoyalties =
                buyBaseRoyalties === null
                    ? null
                    : buyBaseRoyalties || buyBaseRoyaltiesOwner;
            sellBaseRoyalties =
                sellBaseRoyalties === null
                    ? null
                    : sellBaseRoyalties || sellBaseRoyaltiesOwner;
        }
        let createdAccts = new Set();
        if (typeof buyTargetRoyalties === "undefined") {
            buyTargetRoyalties = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, targetMint, buyTargetRoyaltiesOwner, true);
            // If sell target royalties are undefined, we'll do this in the next step
            if (!createdAccts.has(buyTargetRoyalties.toBase58()) &&
                !(await this.accountExists(buyTargetRoyalties))) {
                console.log("Creating buy target royalties...");
                instructions.push(Token.createAssociatedTokenAccountInstruction(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, targetMint, buyTargetRoyalties, buyTargetRoyaltiesOwner, payer));
                createdAccts.add(buyTargetRoyalties.toBase58());
            }
        }
        if (typeof sellTargetRoyalties === "undefined") {
            sellTargetRoyalties = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, targetMint, sellTargetRoyaltiesOwner, true);
            if (!createdAccts.has(sellTargetRoyalties.toBase58()) &&
                !(await this.accountExists(sellTargetRoyalties))) {
                console.log("Creating sell target royalties...");
                instructions.push(Token.createAssociatedTokenAccountInstruction(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, targetMint, sellTargetRoyalties, sellTargetRoyaltiesOwner, payer));
                createdAccts.add(buyTargetRoyalties.toBase58());
            }
        }
        if (typeof buyBaseRoyalties === "undefined") {
            buyBaseRoyalties = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, baseMint, buyBaseRoyaltiesOwner, true);
            // If sell base royalties are undefined, we'll do this in the next step
            if (!createdAccts.has(buyBaseRoyalties.toBase58()) &&
                !(await this.accountExists(buyBaseRoyalties))) {
                console.log("Creating base royalties...", buyBaseRoyalties.toBase58());
                instructions.push(Token.createAssociatedTokenAccountInstruction(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, baseMint, buyBaseRoyalties, buyBaseRoyaltiesOwner, payer));
                createdAccts.add(buyBaseRoyalties.toBase58());
            }
        }
        if (typeof sellBaseRoyalties === "undefined") {
            sellBaseRoyalties = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, baseMint, sellBaseRoyaltiesOwner, true);
            if (!createdAccts.has(sellBaseRoyalties.toBase58()) &&
                !(await this.accountExists(sellBaseRoyalties))) {
                console.log("Creating base royalties...", sellBaseRoyalties.toBase58());
                instructions.push(Token.createAssociatedTokenAccountInstruction(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, baseMint, sellBaseRoyalties, sellBaseRoyaltiesOwner, payer));
                createdAccts.add(sellBaseRoyalties.toBase58());
            }
        }
        const pads = {
            initialReservesPad: advanced.initialReservesPad
                ? toBN(advanced.initialReservesPad, await getMintInfo(this.provider, baseMint))
                : new BN(0),
            initialSupplyPad: advanced.initialSupplyPad
                ? toBN(advanced.initialSupplyPad, typeof targetMintDecimals == "undefined"
                    ? (await getMintInfo(this.provider, targetMint)).decimals
                    : targetMintDecimals)
                : new BN(0),
        };
        instructions.push(await this.instruction.initializeTokenBondingV0({
            index: indexToUse,
            goLiveUnixTime: new BN(Math.floor(goLiveDate.valueOf() / 1000)),
            freezeBuyUnixTime: freezeBuyDate
                ? new BN(Math.floor(freezeBuyDate.valueOf() / 1000))
                : null,
            buyBaseRoyaltyPercentage: percent(buyBaseRoyaltyPercentage) || 0,
            buyTargetRoyaltyPercentage: percent(buyTargetRoyaltyPercentage) || 0,
            sellBaseRoyaltyPercentage: percent(sellBaseRoyaltyPercentage) || 0,
            sellTargetRoyaltyPercentage: percent(sellTargetRoyaltyPercentage) || 0,
            mintCap: mintCap || null,
            purchaseCap: purchaseCap || null,
            generalAuthority,
            curveAuthority,
            reserveAuthority,
            bumpSeed,
            buyFrozen,
            ignoreExternalReserveChanges,
            ignoreExternalSupplyChanges,
            sellFrozen,
            ...pads,
        }, {
            accounts: {
                payer: payer,
                curve,
                tokenBonding,
                baseMint,
                targetMint,
                baseStorage,
                buyBaseRoyalties: buyBaseRoyalties === null
                    ? this.wallet.publicKey // Default to this wallet, it just needs a system program acct
                    : buyBaseRoyalties,
                buyTargetRoyalties: buyTargetRoyalties === null
                    ? this.wallet.publicKey // Default to this wallet, it just needs a system program acct
                    : buyTargetRoyalties,
                sellBaseRoyalties: sellBaseRoyalties === null
                    ? this.wallet.publicKey // Default to this wallet, it just needs a system program acct
                    : sellBaseRoyalties,
                sellTargetRoyalties: sellTargetRoyalties === null
                    ? this.wallet.publicKey // Default to this wallet, it just needs a system program acct
                    : sellTargetRoyalties,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                rent: SYSVAR_RENT_PUBKEY,
                clock: SYSVAR_CLOCK_PUBKEY,
            },
        }));
        return {
            output: {
                baseMint,
                tokenBonding,
                targetMint,
                buyBaseRoyalties: buyBaseRoyalties || this.wallet.publicKey,
                buyTargetRoyalties: buyTargetRoyalties || this.wallet.publicKey,
                sellBaseRoyalties: sellBaseRoyalties || this.wallet.publicKey,
                sellTargetRoyalties: sellTargetRoyalties || this.wallet.publicKey,
                baseStorage,
            },
            instructions,
            signers,
        };
    }
    /**
     * General utility function to check if an account exists
     * @param account
     * @returns
     */
    async accountExists(account) {
        return Boolean(await this.provider.connection.getAccountInfo(account));
    }
    /**
     * Runs {@link `createTokenBondingInstructions`}
     *
     * @param args
     * @returns
     */
    createTokenBonding(args, commitment = "confirmed") {
        return this.execute(this.createTokenBondingInstructions(args), args.payer, commitment);
    }
    async getUnixTime() {
        const acc = await this.provider.connection.getAccountInfo(SYSVAR_CLOCK_PUBKEY);
        //@ts-ignore
        return Number(acc.data.readBigInt64LE(8 * 4));
    }
    async updateCurveInstructions({ tokenBonding: tokenBondingKey, curve }) {
        const tokenBonding = (await this.getTokenBonding(tokenBondingKey));
        if (!tokenBonding) {
            throw new Error("Token bonding does not exist");
        }
        if (!tokenBonding.curveAuthority) {
            throw new Error("No curve authority on this bonding curve");
        }
        return {
            output: null,
            signers: [],
            instructions: [
                await this.instruction.updateCurveV0({ curveAuthority: tokenBonding.curveAuthority }, {
                    accounts: {
                        tokenBonding: tokenBondingKey,
                        curveAuthority: tokenBonding.curveAuthority,
                        curve,
                    },
                }),
            ],
        };
    }
    /**
     * Runs {@link updateCurveInstructions}
     * @param args
     */
    async updateCurve(args, commitment = "confirmed") {
        await this.execute(this.updateCurveInstructions(args), this.wallet.publicKey, commitment);
    }
    /**
     * Update a bonding curve.
     *
     * @param param0
     * @returns
     */
    async updateTokenBondingInstructions({ tokenBonding, buyBaseRoyaltyPercentage, buyTargetRoyaltyPercentage, sellBaseRoyaltyPercentage, sellTargetRoyaltyPercentage, buyBaseRoyalties, buyTargetRoyalties, sellBaseRoyalties, sellTargetRoyalties, generalAuthority, reserveAuthority, buyFrozen, }) {
        const tokenBondingAcct = (await this.getTokenBonding(tokenBonding));
        const generalChanges = anyDefined(buyBaseRoyaltyPercentage, buyTargetRoyaltyPercentage, sellBaseRoyaltyPercentage, sellTargetRoyaltyPercentage, buyBaseRoyalties, buyTargetRoyalties, sellBaseRoyalties, sellTargetRoyalties, generalAuthority, buyFrozen);
        const reserveAuthorityChanges = anyDefined(reserveAuthority);
        const instructions = [];
        if (generalChanges) {
            if (!tokenBondingAcct.generalAuthority) {
                throw new Error("Cannot update a token bonding account that has no authority");
            }
            const args = {
                buyBaseRoyaltyPercentage: definedOr(percent(buyBaseRoyaltyPercentage), tokenBondingAcct.buyBaseRoyaltyPercentage),
                buyTargetRoyaltyPercentage: definedOr(percent(buyTargetRoyaltyPercentage), tokenBondingAcct.buyTargetRoyaltyPercentage),
                sellBaseRoyaltyPercentage: definedOr(percent(sellBaseRoyaltyPercentage), tokenBondingAcct.sellBaseRoyaltyPercentage),
                sellTargetRoyaltyPercentage: definedOr(percent(sellTargetRoyaltyPercentage), tokenBondingAcct.sellTargetRoyaltyPercentage),
                generalAuthority: generalAuthority === null
                    ? null
                    : generalAuthority ||
                        tokenBondingAcct.generalAuthority,
                buyFrozen: typeof buyFrozen === "undefined"
                    ? tokenBondingAcct.buyFrozen
                    : buyFrozen,
            };
            instructions.push(await this.instruction.updateTokenBondingV0(args, {
                accounts: {
                    tokenBonding,
                    generalAuthority: tokenBondingAcct.generalAuthority,
                    baseMint: tokenBondingAcct.baseMint,
                    targetMint: tokenBondingAcct.targetMint,
                    buyTargetRoyalties: buyTargetRoyalties || tokenBondingAcct.buyTargetRoyalties,
                    buyBaseRoyalties: buyBaseRoyalties || tokenBondingAcct.buyBaseRoyalties,
                    sellTargetRoyalties: sellTargetRoyalties || tokenBondingAcct.sellTargetRoyalties,
                    sellBaseRoyalties: sellBaseRoyalties || tokenBondingAcct.sellBaseRoyalties,
                },
            }));
        }
        if (reserveAuthorityChanges) {
            if (!tokenBondingAcct.reserveAuthority) {
                throw new Error("Cannot update reserve authority of a token bonding account that has no reserve authority");
            }
            instructions.push(await this.instruction.updateReserveAuthorityV0({
                newReserveAuthority: reserveAuthority || null,
            }, {
                accounts: {
                    tokenBonding,
                    reserveAuthority: tokenBondingAcct.reserveAuthority,
                },
            }));
        }
        return {
            output: null,
            signers: [],
            instructions,
        };
    }
    /**
     * Runs {@link updateTokenBonding}
     * @param args
     */
    async updateTokenBonding(args, commitment = "confirmed") {
        await this.execute(this.updateTokenBondingInstructions(args), this.wallet.publicKey, commitment);
    }
    /**
     * Instructions to buy twSOL from normal SOL.
     *
     * We wrap SOL so that the bonding contract isn't soaking up a bunch o SOL and damaging the security of the network.
     * The plan is to create a DAO for Strata that will govern what happens with this SOL.
     *
     * @param param0
     * @returns
     */
    async buyBondingWrappedSolInstructions({ payer = this.wallet.publicKey, destination, source = this.wallet.publicKey, amount, }) {
        const state = (await this.getState());
        const stateAddress = (await PublicKey.findProgramAddress([Buffer.from("state", "utf-8")], this.programId))[0];
        const mintAuthority = (await SplTokenBonding.wrappedSolMintAuthorityKey(this.programId))[0];
        const mint = await getMintInfo(this.provider, state.wrappedSolMint);
        let usedAta = false;
        if (!destination) {
            destination = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, state.wrappedSolMint, source, true);
            usedAta = true;
        }
        const instructions = [];
        if (usedAta && !(await this.accountExists(destination))) {
            instructions.push(Token.createAssociatedTokenAccountInstruction(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, state.wrappedSolMint, destination, source, payer));
        }
        instructions.push(await this.instruction.buyWrappedSolV0({
            amount: toBN(amount, mint),
        }, {
            accounts: {
                state: stateAddress,
                wrappedSolMint: state.wrappedSolMint,
                mintAuthority: mintAuthority,
                solStorage: state.solStorage,
                source,
                destination,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            },
        }));
        return {
            signers: [],
            output: {
                destination,
            },
            instructions,
        };
    }
    /**
     * Invoke `buyBondingWrappedSol` instructions
     * @param args
     * @returns
     */
    buyBondingWrappedSol(args, commitment = "confirmed") {
        return this.execute(this.buyBondingWrappedSolInstructions(args), args.payer, commitment);
    }
    /**
     * Instructions to sell twSOL back into normal SOL.
     *
     * @param param0
     * @returns
     */
    async sellBondingWrappedSolInstructions({ source, owner = this.wallet.publicKey, destination = this.wallet.publicKey, amount, all = false, }) {
        const state = (await this.getState());
        const stateAddress = (await PublicKey.findProgramAddress([Buffer.from("state", "utf-8")], this.programId))[0];
        const mint = await getMintInfo(this.provider, state.wrappedSolMint);
        if (!source) {
            source = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, state.wrappedSolMint, owner, true);
        }
        const instructions = [];
        instructions.push(await this.instruction.sellWrappedSolV0({
            amount: toBN(amount, mint),
            all,
        }, {
            accounts: {
                state: stateAddress,
                wrappedSolMint: state.wrappedSolMint,
                solStorage: state.solStorage,
                source,
                owner,
                destination,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            },
        }));
        if (all) {
            instructions.push(Token.createCloseAccountInstruction(TOKEN_PROGRAM_ID, source, destination, owner, []));
        }
        return {
            signers: [],
            output: null,
            instructions,
        };
    }
    /**
     * Execute `sellBondingWrappedSolInstructions`
     * @param args
     * @returns
     */
    async sellBondingWrappedSol(args, commitment = "confirmed") {
        return this.execute(this.sellBondingWrappedSolInstructions(args), args.payer, commitment);
    }
    /**
     * Issue a command to buy `targetMint` tokens with `baseMint` tokens.
     *
     * @param param0
     * @returns
     */
    async buyInstructions({ tokenBonding, source, sourceAuthority = this.wallet.publicKey, destination, desiredTargetAmount, baseAmount, expectedOutputAmount, expectedBaseAmount, slippage, payer = this.wallet.publicKey, }) {
        const state = (await this.getState());
        const tokenBondingAcct = (await this.getTokenBonding(tokenBonding));
        const isNative = tokenBondingAcct.baseMint.equals(NATIVE_MINT) ||
            tokenBondingAcct.baseMint.equals(state.wrappedSolMint);
        // @ts-ignore
        const targetMint = await getMintInfo(this.provider, tokenBondingAcct.targetMint);
        const baseMint = await getMintInfo(this.provider, tokenBondingAcct.baseMint);
        const baseStorage = await getTokenAccount(this.provider, tokenBondingAcct.baseStorage);
        const curve = await this.getPricingCurve(tokenBondingAcct.curve, amountAsNum(tokenBondingAcct.ignoreExternalReserveChanges
            ? tokenBondingAcct.reserveBalanceFromBonding
            : baseStorage.amount, baseMint), amountAsNum(tokenBondingAcct.ignoreExternalSupplyChanges
            ? tokenBondingAcct.supplyFromBonding
            : targetMint.supply, targetMint), tokenBondingAcct.goLiveUnixTime.toNumber());
        const instructions = [];
        // let req = ComputeBudgetProgram.setComputeUnitLimit({units: 400000});
        // instructions.push(req);
        if (!destination) {
            destination = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, tokenBondingAcct.targetMint, sourceAuthority, true);
            if (!(await this.accountExists(destination))) {
                console.log("Creating target account");
                instructions.push(Token.createAssociatedTokenAccountInstruction(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, tokenBondingAcct.targetMint, destination, sourceAuthority, payer));
            }
        }
        let buyTargetAmount = null;
        let buyWithBase = null;
        let maxPrice = 0;
        const unixTime = await this.getUnixTime();
        if (desiredTargetAmount) {
            const desiredTargetAmountNum = toNumber(desiredTargetAmount, targetMint);
            const neededAmount = desiredTargetAmountNum *
                (1 / (1 - asDecimal(tokenBondingAcct.buyTargetRoyaltyPercentage)));
            const min = expectedBaseAmount
                ? toNumber(expectedBaseAmount, targetMint)
                : curve.buyTargetAmount(desiredTargetAmountNum, tokenBondingAcct.buyBaseRoyaltyPercentage, tokenBondingAcct.buyTargetRoyaltyPercentage, unixTime);
            maxPrice = min * (1 + slippage);
            buyTargetAmount = {
                targetAmount: new BN(Math.floor(neededAmount * Math.pow(10, targetMint.decimals))),
                maximumPrice: toBN(maxPrice, baseMint),
            };
        }
        if (baseAmount) {
            const baseAmountNum = toNumber(baseAmount, baseMint);
            maxPrice = baseAmountNum;
            const min = expectedOutputAmount
                ? toNumber(expectedOutputAmount, targetMint)
                : curve.buyWithBaseAmount(baseAmountNum, tokenBondingAcct.buyBaseRoyaltyPercentage, tokenBondingAcct.buyTargetRoyaltyPercentage, unixTime);
            buyWithBase = {
                baseAmount: toBN(baseAmount, baseMint),
                minimumTargetAmount: new BN(Math.ceil(min * (1 - slippage) * Math.pow(10, targetMint.decimals))),
            };
        }
        if (!source) {
            if (isNative) {
                source = sourceAuthority;
            }
            else {
                source = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, tokenBondingAcct.baseMint, sourceAuthority, true);
                if (!(await this.accountExists(source))) {
                    console.warn("Source account for bonding buy does not exist, if it is not created in an earlier instruction this can cause an error");
                }
            }
        }
        const args = {
            // @ts-ignore
            buyTargetAmount,
            // @ts-ignore
            buyWithBase,
        };
        const common = {
            tokenBonding,
            // @ts-ignore
            curve: tokenBondingAcct.curve,
            baseMint: tokenBondingAcct.baseMint,
            targetMint: tokenBondingAcct.targetMint,
            baseStorage: tokenBondingAcct.baseStorage,
            buyBaseRoyalties: tokenBondingAcct.buyBaseRoyalties,
            buyTargetRoyalties: tokenBondingAcct.buyTargetRoyalties,
            tokenProgram: TOKEN_PROGRAM_ID,
            clock: SYSVAR_CLOCK_PUBKEY,
            destination,
        };
        if (isNative) {
            instructions.push(await this.instruction.buyNativeV0(args, {
                accounts: {
                    common,
                    state: state.publicKey,
                    wrappedSolMint: state.wrappedSolMint,
                    mintAuthority: (await SplTokenBonding.wrappedSolMintAuthorityKey(this.programId))[0],
                    solStorage: state.solStorage,
                    systemProgram: SystemProgram.programId,
                    source,
                },
            }));
        }
        else {
            instructions.push(await this.instruction.buyV1(args, {
                accounts: {
                    common,
                    state: state.publicKey,
                    source,
                    sourceAuthority,
                },
            }));
        }
        return {
            output: null,
            signers: [],
            instructions,
        };
    }
    /**
     * Runs {@link buy}
     * @param args
     */
    async buy(args, commitment = "confirmed") {
        await this.execute(this.buyInstructions(args), args.payer, commitment);
    }
    async getTokenAccountBalance(account, commitment = "confirmed") {
        const acct = await this.provider.connection.getAccountInfo(account, commitment);
        if (acct) {
            return u64.fromBuffer(AccountLayout.decode(acct.data).amount);
        }
        return new BN(0);
    }
    /**
     * Swap from any base mint to any target mint that are both on a shared link of bonding curves.
     * Intelligently traverses using either buy or sell, executing multiple txns to either sell baseAmount
     * or buy with baseAmount
     *
     * @param param0
     */
    async swap({ payer = this.wallet.publicKey, sourceAuthority = this.wallet.publicKey, baseMint, targetMint, baseAmount, expectedBaseAmount, desiredTargetAmount, expectedOutputAmount, slippage, balanceCheckTries = 5, extraInstructions = () => Promise.resolve({
        instructions: [],
        signers: [],
        output: null,
    }), preInstructions = async () => {
        return {
            instructions: [],
            signers: [],
            output: null,
        };
    }, postInstructions = () => Promise.resolve({
        instructions: [],
        signers: [],
        output: null,
    }), entangled = null, }) {
        const hierarchyFromTarget = await this.getBondingHierarchy((await SplTokenBonding.tokenBondingKey(targetMint))[0], baseMint);
        const hierarchyFromBase = await this.getBondingHierarchy((await SplTokenBonding.tokenBondingKey(baseMint))[0], targetMint);
        const hierarchy = [hierarchyFromTarget, hierarchyFromBase].find((hierarchy) => hierarchy?.contains(baseMint, targetMint));
        if (!hierarchy) {
            throw new Error(`No bonding curve hierarchies found for base or target that contain both ${baseMint.toBase58()} and ${targetMint.toBase58()}`);
        }
        const isBuy = hierarchy.tokenBonding.targetMint.equals(targetMint);
        const arrHierarchy = hierarchy?.toArray() || [];
        const baseMintInfo = await getMintInfo(this.provider, baseMint);
        let currAmount = baseAmount ? toBN(baseAmount, baseMintInfo) : undefined;
        const hierarchyToTraverse = isBuy ? arrHierarchy.reverse() : arrHierarchy;
        const processedMints = [];
        for (const [index, subHierarchy] of hierarchyToTraverse.entries()) {
            const isLastHop = index === arrHierarchy.length - 1;
            const tokenBonding = subHierarchy.tokenBonding;
            const baseIsSol = tokenBonding.baseMint.equals((await this.getState())?.wrappedSolMint);
            const ataMint = entangled && isBuy
                ? entangled
                : isBuy
                    ? tokenBonding.targetMint
                    : tokenBonding.baseMint;
            const ata = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, ataMint, sourceAuthority, true);
            const getBalance = async () => {
                if (!isBuy && baseIsSol) {
                    const amount = (await this.provider.connection.getAccountInfo(sourceAuthority, "single"))?.lamports || 0;
                    return new BN(amount);
                }
                else {
                    return this.getTokenAccountBalance(ata, "single");
                }
            };
            const preBalance = await getBalance();
            let instructions;
            let signers;
            let currMint;
            if (isBuy) {
                console.log(`Actually doing ${tokenBonding.baseMint.toBase58()} to ${tokenBonding.targetMint.toBase58()}`);
                ({ instructions, signers } = await this.buyInstructions({
                    payer,
                    sourceAuthority,
                    baseAmount: currAmount,
                    tokenBonding: tokenBonding.publicKey,
                    expectedOutputAmount: isLastHop && !desiredTargetAmount
                        ? expectedOutputAmount
                        : undefined,
                    desiredTargetAmount: isLastHop && desiredTargetAmount ? desiredTargetAmount : undefined,
                    expectedBaseAmount: isLastHop && desiredTargetAmount ? expectedBaseAmount : undefined,
                    slippage,
                }));
                currMint = tokenBonding.targetMint;
            }
            else {
                console.log(`SELL doing ${tokenBonding.baseMint.toBase58()} to ${tokenBonding.targetMint.toBase58()}`);
                ({ instructions, signers } = await this.sellInstructions({
                    payer,
                    sourceAuthority,
                    targetAmount: currAmount,
                    tokenBonding: tokenBonding.publicKey,
                    expectedOutputAmount: isLastHop ? expectedOutputAmount : undefined,
                    slippage,
                }));
                currMint = tokenBonding.baseMint;
            }
            const { instructions: extraInstrs, signers: extraSigners } = await extraInstructions({
                tokenBonding,
                amount: currAmount,
                isBuy,
            });
            const { instructions: preInstrs, signers: preSigners } = await preInstructions({
                tokenBonding,
                amount: currAmount,
                desiredTargetAmount,
                isBuy,
                isFirst: index == 0,
            });
            const { instructions: postInstrs, signers: postSigners } = await postInstructions({
                isLast: isLastHop,
                amount: expectedOutputAmount,
                isBuy,
            });
            try {
                await this.sendInstructions([...extraInstrs, ...preInstrs, ...instructions, ...postInstrs], [...extraSigners, ...preSigners, ...signers, ...postSigners], payer);
            }
            catch (e) {
                // Throw a nice error if the swap partially succeeded.
                if (processedMints.length > 0) {
                    const splTokenMetadata = await SplTokenMetadata.init(this.provider);
                    const lastMint = processedMints[processedMints.length - 1];
                    const metadataKey = await Metadata.getPDA(lastMint);
                    const metadata = await splTokenMetadata.getMetadata(metadataKey);
                    const name = metadata?.data.symbol || lastMint.toBase58();
                    const err = new Error(`Swap partially failed, check your wallet for ${name} tokens. Error: ${e.toString()}`);
                    err.stack = e.stack;
                    throw err;
                }
                throw e;
            }
            processedMints.push(currMint);
            async function newBalance(tries = 0) {
                if (tries > balanceCheckTries) {
                    return new BN(0);
                }
                let postBalance = await getBalance();
                // Sometimes it can take a bit for Solana to catch up
                // Wait and see if the balance truly hasn't changed.
                if (postBalance.eq(preBalance)) {
                    console.log("No balance change detected while swapping, trying again", tries);
                    await sleep(5000);
                    return newBalance(tries + 1);
                }
                return postBalance;
            }
            const postBalance = await newBalance();
            currAmount = postBalance.sub(preBalance || new BN(0));
            // Fees, or something else caused the balance to be negative. Just report the change
            // and quit
            if (currAmount.eq(new BN(0))) {
                const targetMintInfo = await getMintInfo(this.provider, isBuy ? tokenBonding.targetMint : tokenBonding.baseMint);
                return {
                    targetAmount: toNumber(postBalance, targetMintInfo) -
                        toNumber(preBalance, targetMintInfo),
                };
            }
        }
        const targetMintInfo = await getMintInfo(this.provider, targetMint);
        return {
            targetAmount: toNumber(currAmount, targetMintInfo),
        };
    }
    async getState() {
        if (this.state) {
            return this.state;
        }
        const stateAddress = (await PublicKey.findProgramAddress([Buffer.from("state", "utf-8")], this.programId))[0];
        const stateRaw = await this.account.programStateV0.fetchNullable(stateAddress);
        const state = stateRaw
            ? {
                ...stateRaw,
                publicKey: stateAddress,
            }
            : null;
        if (state) {
            this.state = state;
        }
        return state;
    }
    /**
     * Instructions to burn `targetMint` tokens in exchange for `baseMint` tokens
     *
     * @param param0
     * @returns
     */
    async sellInstructions({ tokenBonding, source, sourceAuthority = this.wallet.publicKey, destination, targetAmount, expectedOutputAmount, slippage, payer = this.wallet.publicKey, }) {
        const state = (await this.getState());
        const tokenBondingAcct = (await this.getTokenBonding(tokenBonding));
        if (tokenBondingAcct.sellFrozen) {
            throw new Error("Sell is frozen on this bonding curve");
        }
        const isNative = tokenBondingAcct.baseMint.equals(NATIVE_MINT) ||
            tokenBondingAcct.baseMint.equals(state.wrappedSolMint);
        // @ts-ignore
        const targetMint = await getMintInfo(this.provider, tokenBondingAcct.targetMint);
        const baseMint = await getMintInfo(this.provider, tokenBondingAcct.baseMint);
        const baseStorage = await getTokenAccount(this.provider, tokenBondingAcct.baseStorage);
        // @ts-ignore
        const curve = await this.getPricingCurve(tokenBondingAcct.curve, amountAsNum(tokenBondingAcct.ignoreExternalReserveChanges
            ? tokenBondingAcct.reserveBalanceFromBonding
            : baseStorage.amount, baseMint), amountAsNum(tokenBondingAcct.ignoreExternalSupplyChanges
            ? tokenBondingAcct.supplyFromBonding
            : targetMint.supply, targetMint), tokenBondingAcct.goLiveUnixTime.toNumber());
        const instructions = [];
        // let req = ComputeBudgetProgram.setComputeUnitLimit({units: 350000});
        // instructions.push(req);
        if (!source) {
            source = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, tokenBondingAcct.targetMint, sourceAuthority, true);
            if (!(await this.accountExists(source))) {
                console.warn("Source account for bonding buy does not exist, if it is not created in an earlier instruction this can cause an error");
            }
        }
        if (!destination) {
            if (isNative) {
                destination = sourceAuthority;
            }
            else {
                destination = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, tokenBondingAcct.baseMint, sourceAuthority, true);
                if (!(await this.accountExists(destination))) {
                    console.log("Creating base account");
                    instructions.push(Token.createAssociatedTokenAccountInstruction(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, tokenBondingAcct.baseMint, destination, sourceAuthority, payer));
                }
            }
        }
        const unixTime = await this.getUnixTime();
        const targetAmountNum = toNumber(targetAmount, targetMint);
        const min = expectedOutputAmount
            ? toNumber(expectedOutputAmount, baseMint)
            : curve.sellTargetAmount(targetAmountNum, tokenBondingAcct.sellBaseRoyaltyPercentage, tokenBondingAcct.sellTargetRoyaltyPercentage, unixTime);
        const args = {
            targetAmount: toBN(targetAmount, targetMint),
            minimumPrice: new BN(Math.ceil(min * (1 - slippage) * Math.pow(10, baseMint.decimals))),
        };
        const common = {
            tokenBonding,
            // @ts-ignore
            curve: tokenBondingAcct.curve,
            baseMint: tokenBondingAcct.baseMint,
            targetMint: tokenBondingAcct.targetMint,
            baseStorage: tokenBondingAcct.baseStorage,
            sellBaseRoyalties: tokenBondingAcct.sellBaseRoyalties,
            sellTargetRoyalties: tokenBondingAcct.sellTargetRoyalties,
            source,
            sourceAuthority,
            tokenProgram: TOKEN_PROGRAM_ID,
            clock: SYSVAR_CLOCK_PUBKEY,
        };
        if (isNative) {
            instructions.push(await this.instruction.sellNativeV0(args, {
                accounts: {
                    common,
                    destination,
                    state: state.publicKey,
                    wrappedSolMint: state.wrappedSolMint,
                    mintAuthority: (await SplTokenBonding.wrappedSolMintAuthorityKey(this.programId))[0],
                    solStorage: state.solStorage,
                    systemProgram: SystemProgram.programId,
                },
            }));
        }
        else {
            instructions.push(await this.instruction.sellV1(args, {
                accounts: {
                    common,
                    state: state.publicKey,
                    destination,
                },
            }));
        }
        return {
            output: null,
            signers: [],
            instructions,
        };
    }
    /**
     * Runs {@link sell}
     * @param args
     */
    async sell(args, commitment = "confirmed") {
        await this.execute(this.sellInstructions(args), args.payer, commitment);
    }
    /**
     * Instructions to close the bonding curve
     *
     * @param param0
     * @returns
     */
    async closeInstructions({ tokenBonding, generalAuthority, refund = this.wallet.publicKey, }) {
        const tokenBondingAcct = (await this.getTokenBonding(tokenBonding));
        if (!tokenBondingAcct.generalAuthority) {
            throw new Error("Cannot close a bonding account with no general authority");
        }
        return {
            output: null,
            signers: [],
            instructions: [
                await this.instruction.closeTokenBondingV0({
                    accounts: {
                        refund,
                        tokenBonding,
                        generalAuthority: generalAuthority ||
                            tokenBondingAcct.generalAuthority,
                        targetMint: tokenBondingAcct.targetMint,
                        baseStorage: tokenBondingAcct.baseStorage,
                        tokenProgram: TOKEN_PROGRAM_ID,
                    },
                }),
            ],
        };
    }
    /**
     * Runs {@link closeInstructions}
     * @param args
     */
    async close(args, commitment = "confirmed") {
        await this.execute(this.closeInstructions(args), args.payer, commitment);
    }
    /**
     * Instructions to transfer the reserves of the bonding curve
     *
     * @param param0
     * @returns
     */
    async transferReservesInstructions({ tokenBonding, destination, amount, reserveAuthority, destinationWallet = this.wallet.publicKey, payer = this.wallet.publicKey, }) {
        const tokenBondingAcct = (await this.getTokenBonding(tokenBonding));
        const state = (await this.getState());
        const isNative = tokenBondingAcct.baseMint.equals(NATIVE_MINT) ||
            tokenBondingAcct.baseMint.equals(state.wrappedSolMint);
        const baseMint = await getMintInfo(this.provider, tokenBondingAcct.baseMint);
        const instructions = [];
        if (!tokenBondingAcct.reserveAuthority) {
            throw new Error("Cannot transfer reserves on a bonding account with no reserve authority");
        }
        if (!destination && isNative) {
            destination = destinationWallet;
        }
        const destAcct = destination &&
            (await this.provider.connection.getAccountInfo(destination));
        // Destination is a wallet, need to get the ATA
        if (!isNative &&
            (!destAcct || destAcct.owner.equals(SystemProgram.programId))) {
            const ataDestination = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, tokenBondingAcct.baseMint, destinationWallet, false // Explicitly don't allow owner off curve. You need to pass destination as an already created thing to do this
            );
            if (!(await this.accountExists(ataDestination))) {
                instructions.push(Token.createAssociatedTokenAccountInstruction(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, tokenBondingAcct.baseMint, ataDestination, destinationWallet, payer));
            }
            destination = ataDestination;
        }
        const common = {
            tokenBonding,
            reserveAuthority: reserveAuthority || tokenBondingAcct.reserveAuthority,
            baseMint: tokenBondingAcct.baseMint,
            baseStorage: tokenBondingAcct.baseStorage,
            tokenProgram: TOKEN_PROGRAM_ID,
        };
        const args = {
            amount: toBN(amount, baseMint),
        };
        if (isNative) {
            instructions.push(await this.instruction.transferReservesNativeV0(args, {
                accounts: {
                    common,
                    destination: destination,
                    state: state.publicKey,
                    wrappedSolMint: state.wrappedSolMint,
                    mintAuthority: (await SplTokenBonding.wrappedSolMintAuthorityKey(this.programId))[0],
                    solStorage: state.solStorage,
                    systemProgram: SystemProgram.programId,
                },
            }));
        }
        else {
            instructions.push(await this.instruction.transferReservesV0(args, {
                accounts: {
                    common,
                    destination: destination,
                },
            }));
        }
        return {
            output: null,
            signers: [],
            instructions,
        };
    }
    /**
     * Runs {@link closeInstructions}
     * @param args
     */
    async transferReserves(args, commitment = "confirmed") {
        await this.execute(this.transferReservesInstructions(args), args.payer, commitment);
    }
    /**
     * Get a class capable of displaying pricing information or this token bonding at its current reserve and supply
     *
     * @param tokenBonding
     * @returns
     */
    async getBondingPricingCurve(tokenBonding) {
        const tokenBondingAcct = (await this.getTokenBonding(tokenBonding));
        const targetMint = await getMintInfo(this.provider, tokenBondingAcct.targetMint);
        const baseMint = await getMintInfo(this.provider, tokenBondingAcct.baseMint);
        const baseStorage = await getTokenAccount(this.provider, tokenBondingAcct.baseStorage);
        return await this.getPricingCurve(tokenBondingAcct.curve, amountAsNum(tokenBondingAcct.ignoreExternalReserveChanges
            ? tokenBondingAcct.reserveBalanceFromBonding
            : baseStorage.amount, baseMint), amountAsNum(tokenBondingAcct.ignoreExternalSupplyChanges
            ? tokenBondingAcct.supplyFromBonding
            : targetMint.supply, targetMint), tokenBondingAcct.goLiveUnixTime.toNumber());
    }
    /**
     * Given some reserves and supply, get a pricing model for a curve at `key`.
     *
     * @param key
     * @param baseAmount
     * @param targetSupply
     * @param goLiveUnixTime
     * @returns
     */
    async getPricingCurve(key, baseAmount, targetSupply, goLiveUnixTime) {
        const curve = await this.getCurve(key);
        return fromCurve(curve, baseAmount, targetSupply, goLiveUnixTime);
    }
    async getPricing(tokenBondingKey) {
        const hierarchy = await this.getBondingHierarchy(tokenBondingKey);
        if (hierarchy) {
            return new BondingPricing({
                hierarchy: hierarchy,
            });
        }
    }
    /**
     * Fetch the token bonding curve and all of its direct ancestors
     *
     * @param tokenBondingKey
     * @returns
     */
    async getBondingHierarchy(tokenBondingKey, stopAtMint) {
        if (!tokenBondingKey) {
            return;
        }
        const [wrappedSolMint, tokenBonding] = await Promise.all([
            this.getState().then((s) => s?.wrappedSolMint),
            this.getTokenBonding(tokenBondingKey),
        ]);
        if (stopAtMint?.equals(NATIVE_MINT)) {
            stopAtMint = wrappedSolMint;
        }
        if (!tokenBonding) {
            return;
        }
        const pricingCurve = await this.getBondingPricingCurve(tokenBondingKey);
        const parentKey = (await SplTokenBonding.tokenBondingKey(tokenBonding.baseMint))[0];
        const ret = new BondingHierarchy({
            parent: stopAtMint?.equals(tokenBonding.baseMint)
                ? undefined
                : await this.getBondingHierarchy(parentKey, stopAtMint),
            tokenBonding,
            pricingCurve,
            wrappedSolMint,
        });
        (ret.parent || {}).child = ret;
        return ret;
    }
}
//# sourceMappingURL=index.js.map