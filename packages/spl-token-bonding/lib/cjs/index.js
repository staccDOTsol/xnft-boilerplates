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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SplTokenBonding = exports.TimeCurveConfig = exports.TimeDecayExponentialCurveConfig = exports.ExponentialCurveConfig = void 0;
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
const anchor = __importStar(require("@project-serum/anchor"));
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const spl_utils_1 = require("@strata-foundation/spl-utils");
const bn_js_1 = __importDefault(require("bn.js"));
const bondingHierarchy_1 = require("./bondingHierarchy");
const curves_1 = require("./curves");
const pricing_1 = require("./pricing");
const utils_1 = require("./utils");
__exportStar(require("./bondingHierarchy"), exports);
__exportStar(require("./curves"), exports);
__exportStar(require("./generated/spl-token-bonding"), exports);
__exportStar(require("./pricing"), exports);
__exportStar(require("./utils"), exports);
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => setTimeout(resolve, ms));
    });
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
class ExponentialCurveConfig {
    constructor({ c = 1, b = 0, pow = 1, frac = 1, }) {
        this.c = (0, utils_1.toU128)(c);
        this.b = (0, utils_1.toU128)(b);
        this.pow = pow;
        this.frac = frac;
        if (this.b.gt(new bn_js_1.default(0)) && this.c.gt(new bn_js_1.default(0))) {
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
                            offset: new bn_js_1.default(0),
                            // @ts-ignore
                            curve: this.toRawPrimitiveConfig(),
                        },
                    ],
                },
            },
        };
    }
}
exports.ExponentialCurveConfig = ExponentialCurveConfig;
/**
 * Curve configuration for c(S^(pow/frac)) + b
 */
class TimeDecayExponentialCurveConfig {
    constructor({ c = 1, k0 = 0, k1 = 1, d = 1, interval = 24 * 60 * 60, }) {
        this.c = (0, utils_1.toU128)(c);
        this.k0 = (0, utils_1.toU128)(k0);
        this.k1 = (0, utils_1.toU128)(k1);
        this.d = (0, utils_1.toU128)(d);
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
                            offset: new bn_js_1.default(0),
                            // @ts-ignore
                            curve: this.toRawPrimitiveConfig(),
                        },
                    ],
                },
            },
        };
    }
}
exports.TimeDecayExponentialCurveConfig = TimeDecayExponentialCurveConfig;
/**
 * Curve configuration that allows the curve to change parameters at discrete time offsets from the go live date
 */
class TimeCurveConfig {
    constructor() {
        this.curves = [];
    }
    addCurve(timeOffset, curve, buyTransitionFees = null, sellTransitionFees = null) {
        if (this.curves.length == 0 && timeOffset != 0) {
            throw new Error("First time offset must be 0");
        }
        this.curves.push({
            curve,
            offset: new bn_js_1.default(timeOffset),
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
exports.TimeCurveConfig = TimeCurveConfig;
class SplTokenBonding extends spl_utils_1.AnchorSdk {
    static init(provider, splTokenBondingProgramId = SplTokenBonding.ID) {
        return __awaiter(this, void 0, void 0, function* () {
            const SplTokenBondingIDLJson = yield anchor.Program.fetchIdl(splTokenBondingProgramId, provider);
            const splTokenBonding = new anchor.Program(SplTokenBondingIDLJson, splTokenBondingProgramId, provider);
            return new this(provider, splTokenBonding);
        });
    }
    constructor(provider, program) {
        super({ provider, program });
        this.curveDecoder = (pubkey, account) => {
            const coded = this.program.coder.accounts.decode("CurveV0", account.data);
            return Object.assign(Object.assign({}, coded), { publicKey: pubkey });
        };
        this.tokenBondingDecoder = (pubkey, account) => {
            const coded = this.program.coder.accounts.decode("TokenBondingV0", account.data);
            return Object.assign(Object.assign({}, coded), { publicKey: pubkey });
        };
    }
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
    initializeSolStorageInstructions({ mintKeypair, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const exists = yield this.getState();
            if (exists) {
                return {
                    output: null,
                    instructions: [],
                    signers: [],
                };
            }
            console.log("Sol storage does not exist, creating...");
            const [state, bumpSeed] = yield web3_js_1.PublicKey.findProgramAddress([Buffer.from("state", "utf-8")], this.programId);
            const [solStorage, solStorageBumpSeed] = yield web3_js_1.PublicKey.findProgramAddress([Buffer.from("sol-storage", "utf-8")], this.programId);
            const [wrappedSolAuthority, mintAuthorityBumpSeed] = yield web3_js_1.PublicKey.findProgramAddress([Buffer.from("wrapped-sol-authority", "utf-8")], this.programId);
            const instructions = [];
            const signers = [];
            signers.push(mintKeypair);
            instructions.push(...[
                web3_js_1.SystemProgram.createAccount({
                    fromPubkey: this.wallet.publicKey,
                    newAccountPubkey: mintKeypair.publicKey,
                    space: 82,
                    lamports: yield this.provider.connection.getMinimumBalanceForRentExemption(82),
                    programId: spl_token_1.TOKEN_PROGRAM_ID,
                }),
                spl_token_1.Token.createInitMintInstruction(spl_token_1.TOKEN_PROGRAM_ID, mintKeypair.publicKey, 9, this.wallet.publicKey, wrappedSolAuthority),
            ]);
            instructions.push(...new mpl_token_metadata_1.CreateMetadataV2({
                feePayer: this.wallet.publicKey,
            }, {
                metadata: yield mpl_token_metadata_1.Metadata.getPDA(mintKeypair.publicKey),
                mint: mintKeypair.publicKey,
                metadataData: new mpl_token_metadata_1.DataV2({
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
            instructions.push(spl_token_1.Token.createSetAuthorityInstruction(spl_token_1.TOKEN_PROGRAM_ID, mintKeypair.publicKey, wrappedSolAuthority, "MintTokens", this.wallet.publicKey, []));
            instructions.push(yield this.instruction.initializeSolStorageV0({
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
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                    systemProgram: web3_js_1.SystemProgram.programId,
                    rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                },
            }));
            return {
                instructions,
                signers,
                output: null,
            };
        });
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
    initializeCurveInstructions({ payer = this.wallet.publicKey, config: curveConfig, curveKeypair = anchor.web3.Keypair.generate(), }) {
        return __awaiter(this, void 0, void 0, function* () {
            const curve = curveConfig.toRawConfig();
            return {
                output: {
                    curve: curveKeypair.publicKey,
                },
                signers: [curveKeypair],
                instructions: [
                    web3_js_1.SystemProgram.createAccount({
                        fromPubkey: payer,
                        newAccountPubkey: curveKeypair.publicKey,
                        space: 500,
                        lamports: yield this.provider.connection.getMinimumBalanceForRentExemption(500),
                        programId: this.programId,
                    }),
                    yield this.instruction.createCurveV0(curve, {
                        accounts: {
                            payer,
                            curve: curveKeypair.publicKey,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                        },
                    }),
                ],
            };
        });
    }
    /**
     * See {@link initializeCurve}
     * @param args
     * @returns
     */
    initializeCurve(args, commitment = "confirmed") {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.execute(this.initializeCurveInstructions(args), args.payer, commitment)).curve;
        });
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
    static tokenBondingKey(targetMint, index = 0, programId = SplTokenBonding.ID) {
        return __awaiter(this, void 0, void 0, function* () {
            const pad = Buffer.alloc(2);
            new bn_js_1.default(index, 16, "le").toArrayLike(Buffer).copy(pad);
            return web3_js_1.PublicKey.findProgramAddress([Buffer.from("token-bonding", "utf-8"), targetMint.toBuffer(), pad], programId);
        });
    }
    static wrappedSolMintAuthorityKey(programId = SplTokenBonding.ID) {
        return __awaiter(this, void 0, void 0, function* () {
            return web3_js_1.PublicKey.findProgramAddress([Buffer.from("wrapped-sol-authority", "utf-8")], programId);
        });
    }
    /**
     * Create a bonding curve
     *
     * @param param0
     * @returns
     */
    createTokenBondingInstructions({ generalAuthority = this.wallet.publicKey, curveAuthority = null, reserveAuthority = null, payer = this.wallet.publicKey, curve, baseMint, targetMint, buyBaseRoyalties, buyBaseRoyaltiesOwner = this.wallet.publicKey, buyTargetRoyalties, buyTargetRoyaltiesOwner = this.wallet.publicKey, sellBaseRoyalties, sellBaseRoyaltiesOwner = this.wallet.publicKey, sellTargetRoyalties, sellTargetRoyaltiesOwner = this.wallet.publicKey, buyBaseRoyaltyPercentage = 0, buyTargetRoyaltyPercentage = 0, sellBaseRoyaltyPercentage = 0, sellTargetRoyaltyPercentage = 0, mintCap, purchaseCap, goLiveDate, freezeBuyDate, targetMintDecimals, targetMintKeypair = web3_js_1.Keypair.generate(), buyFrozen = false, ignoreExternalReserveChanges = false, ignoreExternalSupplyChanges = false, sellFrozen = false, index, advanced = {
        initialSupplyPad: 0,
        initialReservesPad: 0,
    }, }) {
        return __awaiter(this, void 0, void 0, function* () {
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
                goLiveDate.setUTCSeconds((yield this.getUnixTime()) - 10);
            }
            const provider = this.provider;
            const state = (yield this.getState());
            let isNative = baseMint.equals(spl_token_1.NATIVE_MINT) || baseMint.equals(state.wrappedSolMint);
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
            const getTokenBondingAccount = () => __awaiter(this, void 0, void 0, function* () {
                return this.provider.connection.getAccountInfo((yield getTokenBonding())[0]);
            });
            if (!index) {
                // Find an empty voucher account
                while (yield getTokenBondingAccount()) {
                    indexToUse++;
                }
            }
            else {
                indexToUse = index;
            }
            const [tokenBonding, bumpSeed] = yield SplTokenBonding.tokenBondingKey(targetMint, indexToUse);
            if (shouldCreateMint) {
                instructions.push(...(yield (0, spl_utils_1.createMintInstructions)(provider, tokenBonding, targetMint, targetMintDecimals)));
            }
            const baseStorageKeypair = anchor.web3.Keypair.generate();
            signers.push(baseStorageKeypair);
            const baseStorage = baseStorageKeypair.publicKey;
            instructions.push(web3_js_1.SystemProgram.createAccount({
                fromPubkey: payer,
                newAccountPubkey: baseStorage,
                space: spl_token_1.AccountLayout.span,
                programId: spl_token_1.TOKEN_PROGRAM_ID,
                lamports: yield this.provider.connection.getMinimumBalanceForRentExemption(spl_token_1.AccountLayout.span),
            }), spl_token_1.Token.createInitAccountInstruction(spl_token_1.TOKEN_PROGRAM_ID, baseMint, baseStorage, tokenBonding));
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
                buyTargetRoyalties = yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, targetMint, buyTargetRoyaltiesOwner, true);
                // If sell target royalties are undefined, we'll do this in the next step
                if (!createdAccts.has(buyTargetRoyalties.toBase58()) &&
                    !(yield this.accountExists(buyTargetRoyalties))) {
                    console.log("Creating buy target royalties...");
                    instructions.push(spl_token_1.Token.createAssociatedTokenAccountInstruction(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, targetMint, buyTargetRoyalties, buyTargetRoyaltiesOwner, payer));
                    createdAccts.add(buyTargetRoyalties.toBase58());
                }
            }
            if (typeof sellTargetRoyalties === "undefined") {
                sellTargetRoyalties = yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, targetMint, sellTargetRoyaltiesOwner, true);
                if (!createdAccts.has(sellTargetRoyalties.toBase58()) &&
                    !(yield this.accountExists(sellTargetRoyalties))) {
                    console.log("Creating sell target royalties...");
                    instructions.push(spl_token_1.Token.createAssociatedTokenAccountInstruction(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, targetMint, sellTargetRoyalties, sellTargetRoyaltiesOwner, payer));
                    createdAccts.add(buyTargetRoyalties.toBase58());
                }
            }
            if (typeof buyBaseRoyalties === "undefined") {
                buyBaseRoyalties = yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, baseMint, buyBaseRoyaltiesOwner, true);
                // If sell base royalties are undefined, we'll do this in the next step
                if (!createdAccts.has(buyBaseRoyalties.toBase58()) &&
                    !(yield this.accountExists(buyBaseRoyalties))) {
                    console.log("Creating base royalties...", buyBaseRoyalties.toBase58());
                    instructions.push(spl_token_1.Token.createAssociatedTokenAccountInstruction(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, baseMint, buyBaseRoyalties, buyBaseRoyaltiesOwner, payer));
                    createdAccts.add(buyBaseRoyalties.toBase58());
                }
            }
            if (typeof sellBaseRoyalties === "undefined") {
                sellBaseRoyalties = yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, baseMint, sellBaseRoyaltiesOwner, true);
                if (!createdAccts.has(sellBaseRoyalties.toBase58()) &&
                    !(yield this.accountExists(sellBaseRoyalties))) {
                    console.log("Creating base royalties...", sellBaseRoyalties.toBase58());
                    instructions.push(spl_token_1.Token.createAssociatedTokenAccountInstruction(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, baseMint, sellBaseRoyalties, sellBaseRoyaltiesOwner, payer));
                    createdAccts.add(sellBaseRoyalties.toBase58());
                }
            }
            const pads = {
                initialReservesPad: advanced.initialReservesPad
                    ? (0, utils_1.toBN)(advanced.initialReservesPad, yield (0, spl_utils_1.getMintInfo)(this.provider, baseMint))
                    : new bn_js_1.default(0),
                initialSupplyPad: advanced.initialSupplyPad
                    ? (0, utils_1.toBN)(advanced.initialSupplyPad, typeof targetMintDecimals == "undefined"
                        ? (yield (0, spl_utils_1.getMintInfo)(this.provider, targetMint)).decimals
                        : targetMintDecimals)
                    : new bn_js_1.default(0),
            };
            instructions.push(yield this.instruction.initializeTokenBondingV0(Object.assign({ index: indexToUse, goLiveUnixTime: new bn_js_1.default(Math.floor(goLiveDate.valueOf() / 1000)), freezeBuyUnixTime: freezeBuyDate
                    ? new bn_js_1.default(Math.floor(freezeBuyDate.valueOf() / 1000))
                    : null, buyBaseRoyaltyPercentage: (0, spl_utils_1.percent)(buyBaseRoyaltyPercentage) || 0, buyTargetRoyaltyPercentage: (0, spl_utils_1.percent)(buyTargetRoyaltyPercentage) || 0, sellBaseRoyaltyPercentage: (0, spl_utils_1.percent)(sellBaseRoyaltyPercentage) || 0, sellTargetRoyaltyPercentage: (0, spl_utils_1.percent)(sellTargetRoyaltyPercentage) || 0, mintCap: mintCap || null, purchaseCap: purchaseCap || null, generalAuthority,
                curveAuthority,
                reserveAuthority,
                bumpSeed,
                buyFrozen,
                ignoreExternalReserveChanges,
                ignoreExternalSupplyChanges,
                sellFrozen }, pads), {
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
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                    systemProgram: web3_js_1.SystemProgram.programId,
                    rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                    clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
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
        });
    }
    /**
     * General utility function to check if an account exists
     * @param account
     * @returns
     */
    accountExists(account) {
        return __awaiter(this, void 0, void 0, function* () {
            return Boolean(yield this.provider.connection.getAccountInfo(account));
        });
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
    getUnixTime() {
        return __awaiter(this, void 0, void 0, function* () {
            const acc = yield this.provider.connection.getAccountInfo(web3_js_1.SYSVAR_CLOCK_PUBKEY);
            //@ts-ignore
            return Number(acc.data.readBigInt64LE(8 * 4));
        });
    }
    updateCurveInstructions({ tokenBonding: tokenBondingKey, curve }) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenBonding = (yield this.getTokenBonding(tokenBondingKey));
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
                    yield this.instruction.updateCurveV0({ curveAuthority: tokenBonding.curveAuthority }, {
                        accounts: {
                            tokenBonding: tokenBondingKey,
                            curveAuthority: tokenBonding.curveAuthority,
                            curve,
                        },
                    }),
                ],
            };
        });
    }
    /**
     * Runs {@link updateCurveInstructions}
     * @param args
     */
    updateCurve(args, commitment = "confirmed") {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.execute(this.updateCurveInstructions(args), this.wallet.publicKey, commitment);
        });
    }
    /**
     * Update a bonding curve.
     *
     * @param param0
     * @returns
     */
    updateTokenBondingInstructions({ tokenBonding, buyBaseRoyaltyPercentage, buyTargetRoyaltyPercentage, sellBaseRoyaltyPercentage, sellTargetRoyaltyPercentage, buyBaseRoyalties, buyTargetRoyalties, sellBaseRoyalties, sellTargetRoyalties, generalAuthority, reserveAuthority, buyFrozen, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenBondingAcct = (yield this.getTokenBonding(tokenBonding));
            const generalChanges = anyDefined(buyBaseRoyaltyPercentage, buyTargetRoyaltyPercentage, sellBaseRoyaltyPercentage, sellTargetRoyaltyPercentage, buyBaseRoyalties, buyTargetRoyalties, sellBaseRoyalties, sellTargetRoyalties, generalAuthority, buyFrozen);
            const reserveAuthorityChanges = anyDefined(reserveAuthority);
            const instructions = [];
            if (generalChanges) {
                if (!tokenBondingAcct.generalAuthority) {
                    throw new Error("Cannot update a token bonding account that has no authority");
                }
                const args = {
                    buyBaseRoyaltyPercentage: definedOr((0, spl_utils_1.percent)(buyBaseRoyaltyPercentage), tokenBondingAcct.buyBaseRoyaltyPercentage),
                    buyTargetRoyaltyPercentage: definedOr((0, spl_utils_1.percent)(buyTargetRoyaltyPercentage), tokenBondingAcct.buyTargetRoyaltyPercentage),
                    sellBaseRoyaltyPercentage: definedOr((0, spl_utils_1.percent)(sellBaseRoyaltyPercentage), tokenBondingAcct.sellBaseRoyaltyPercentage),
                    sellTargetRoyaltyPercentage: definedOr((0, spl_utils_1.percent)(sellTargetRoyaltyPercentage), tokenBondingAcct.sellTargetRoyaltyPercentage),
                    generalAuthority: generalAuthority === null
                        ? null
                        : generalAuthority ||
                            tokenBondingAcct.generalAuthority,
                    buyFrozen: typeof buyFrozen === "undefined"
                        ? tokenBondingAcct.buyFrozen
                        : buyFrozen,
                };
                instructions.push(yield this.instruction.updateTokenBondingV0(args, {
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
                instructions.push(yield this.instruction.updateReserveAuthorityV0({
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
        });
    }
    /**
     * Runs {@link updateTokenBonding}
     * @param args
     */
    updateTokenBonding(args, commitment = "confirmed") {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.execute(this.updateTokenBondingInstructions(args), this.wallet.publicKey, commitment);
        });
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
    buyBondingWrappedSolInstructions({ payer = this.wallet.publicKey, destination, source = this.wallet.publicKey, amount, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const state = (yield this.getState());
            const stateAddress = (yield web3_js_1.PublicKey.findProgramAddress([Buffer.from("state", "utf-8")], this.programId))[0];
            const mintAuthority = (yield SplTokenBonding.wrappedSolMintAuthorityKey(this.programId))[0];
            const mint = yield (0, spl_utils_1.getMintInfo)(this.provider, state.wrappedSolMint);
            let usedAta = false;
            if (!destination) {
                destination = yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, state.wrappedSolMint, source, true);
                usedAta = true;
            }
            const instructions = [];
            if (usedAta && !(yield this.accountExists(destination))) {
                instructions.push(spl_token_1.Token.createAssociatedTokenAccountInstruction(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, state.wrappedSolMint, destination, source, payer));
            }
            instructions.push(yield this.instruction.buyWrappedSolV0({
                amount: (0, utils_1.toBN)(amount, mint),
            }, {
                accounts: {
                    state: stateAddress,
                    wrappedSolMint: state.wrappedSolMint,
                    mintAuthority: mintAuthority,
                    solStorage: state.solStorage,
                    source,
                    destination,
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                    systemProgram: web3_js_1.SystemProgram.programId,
                },
            }));
            return {
                signers: [],
                output: {
                    destination,
                },
                instructions,
            };
        });
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
    sellBondingWrappedSolInstructions({ source, owner = this.wallet.publicKey, destination = this.wallet.publicKey, amount, all = false, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const state = (yield this.getState());
            const stateAddress = (yield web3_js_1.PublicKey.findProgramAddress([Buffer.from("state", "utf-8")], this.programId))[0];
            const mint = yield (0, spl_utils_1.getMintInfo)(this.provider, state.wrappedSolMint);
            if (!source) {
                source = yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, state.wrappedSolMint, owner, true);
            }
            const instructions = [];
            instructions.push(yield this.instruction.sellWrappedSolV0({
                amount: (0, utils_1.toBN)(amount, mint),
                all,
            }, {
                accounts: {
                    state: stateAddress,
                    wrappedSolMint: state.wrappedSolMint,
                    solStorage: state.solStorage,
                    source,
                    owner,
                    destination,
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                    systemProgram: web3_js_1.SystemProgram.programId,
                },
            }));
            if (all) {
                instructions.push(spl_token_1.Token.createCloseAccountInstruction(spl_token_1.TOKEN_PROGRAM_ID, source, destination, owner, []));
            }
            return {
                signers: [],
                output: null,
                instructions,
            };
        });
    }
    /**
     * Execute `sellBondingWrappedSolInstructions`
     * @param args
     * @returns
     */
    sellBondingWrappedSol(args, commitment = "confirmed") {
        return __awaiter(this, void 0, void 0, function* () {
            return this.execute(this.sellBondingWrappedSolInstructions(args), args.payer, commitment);
        });
    }
    /**
     * Issue a command to buy `targetMint` tokens with `baseMint` tokens.
     *
     * @param param0
     * @returns
     */
    buyInstructions({ tokenBonding, source, sourceAuthority = this.wallet.publicKey, destination, desiredTargetAmount, baseAmount, expectedOutputAmount, expectedBaseAmount, slippage, payer = this.wallet.publicKey, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const state = (yield this.getState());
            const tokenBondingAcct = (yield this.getTokenBonding(tokenBonding));
            const isNative = tokenBondingAcct.baseMint.equals(spl_token_1.NATIVE_MINT) ||
                tokenBondingAcct.baseMint.equals(state.wrappedSolMint);
            // @ts-ignore
            const targetMint = yield (0, spl_utils_1.getMintInfo)(this.provider, tokenBondingAcct.targetMint);
            const baseMint = yield (0, spl_utils_1.getMintInfo)(this.provider, tokenBondingAcct.baseMint);
            const baseStorage = yield (0, spl_utils_1.getTokenAccount)(this.provider, tokenBondingAcct.baseStorage);
            const curve = yield this.getPricingCurve(tokenBondingAcct.curve, (0, utils_1.amountAsNum)(tokenBondingAcct.ignoreExternalReserveChanges
                ? tokenBondingAcct.reserveBalanceFromBonding
                : baseStorage.amount, baseMint), (0, utils_1.amountAsNum)(tokenBondingAcct.ignoreExternalSupplyChanges
                ? tokenBondingAcct.supplyFromBonding
                : targetMint.supply, targetMint), tokenBondingAcct.goLiveUnixTime.toNumber());
            const instructions = [];
            // let req = ComputeBudgetProgram.setComputeUnitLimit({units: 400000});
            // instructions.push(req);
            if (!destination) {
                destination = yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, tokenBondingAcct.targetMint, sourceAuthority, true);
                if (!(yield this.accountExists(destination))) {
                    console.log("Creating target account");
                    instructions.push(spl_token_1.Token.createAssociatedTokenAccountInstruction(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, tokenBondingAcct.targetMint, destination, sourceAuthority, payer));
                }
            }
            let buyTargetAmount = null;
            let buyWithBase = null;
            let maxPrice = 0;
            const unixTime = yield this.getUnixTime();
            if (desiredTargetAmount) {
                const desiredTargetAmountNum = (0, utils_1.toNumber)(desiredTargetAmount, targetMint);
                const neededAmount = desiredTargetAmountNum *
                    (1 / (1 - (0, utils_1.asDecimal)(tokenBondingAcct.buyTargetRoyaltyPercentage)));
                const min = expectedBaseAmount
                    ? (0, utils_1.toNumber)(expectedBaseAmount, targetMint)
                    : curve.buyTargetAmount(desiredTargetAmountNum, tokenBondingAcct.buyBaseRoyaltyPercentage, tokenBondingAcct.buyTargetRoyaltyPercentage, unixTime);
                maxPrice = min * (1 + slippage);
                buyTargetAmount = {
                    targetAmount: new bn_js_1.default(Math.floor(neededAmount * Math.pow(10, targetMint.decimals))),
                    maximumPrice: (0, utils_1.toBN)(maxPrice, baseMint),
                };
            }
            if (baseAmount) {
                const baseAmountNum = (0, utils_1.toNumber)(baseAmount, baseMint);
                maxPrice = baseAmountNum;
                const min = expectedOutputAmount
                    ? (0, utils_1.toNumber)(expectedOutputAmount, targetMint)
                    : curve.buyWithBaseAmount(baseAmountNum, tokenBondingAcct.buyBaseRoyaltyPercentage, tokenBondingAcct.buyTargetRoyaltyPercentage, unixTime);
                buyWithBase = {
                    baseAmount: (0, utils_1.toBN)(baseAmount, baseMint),
                    minimumTargetAmount: new bn_js_1.default(Math.ceil(min * (1 - slippage) * Math.pow(10, targetMint.decimals))),
                };
            }
            if (!source) {
                if (isNative) {
                    source = sourceAuthority;
                }
                else {
                    source = yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, tokenBondingAcct.baseMint, sourceAuthority, true);
                    if (!(yield this.accountExists(source))) {
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
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
                destination,
            };
            if (isNative) {
                instructions.push(yield this.instruction.buyNativeV0(args, {
                    accounts: {
                        common,
                        state: state.publicKey,
                        wrappedSolMint: state.wrappedSolMint,
                        mintAuthority: (yield SplTokenBonding.wrappedSolMintAuthorityKey(this.programId))[0],
                        solStorage: state.solStorage,
                        systemProgram: web3_js_1.SystemProgram.programId,
                        source,
                    },
                }));
            }
            else {
                instructions.push(yield this.instruction.buyV1(args, {
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
        });
    }
    /**
     * Runs {@link buy}
     * @param args
     */
    buy(args, commitment = "confirmed") {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.execute(this.buyInstructions(args), args.payer, commitment);
        });
    }
    getTokenAccountBalance(account, commitment = "confirmed") {
        return __awaiter(this, void 0, void 0, function* () {
            const acct = yield this.provider.connection.getAccountInfo(account, commitment);
            if (acct) {
                return spl_token_1.u64.fromBuffer(spl_token_1.AccountLayout.decode(acct.data).amount);
            }
            return new bn_js_1.default(0);
        });
    }
    /**
     * Swap from any base mint to any target mint that are both on a shared link of bonding curves.
     * Intelligently traverses using either buy or sell, executing multiple txns to either sell baseAmount
     * or buy with baseAmount
     *
     * @param param0
     */
    swap({ payer = this.wallet.publicKey, sourceAuthority = this.wallet.publicKey, baseMint, targetMint, baseAmount, expectedBaseAmount, desiredTargetAmount, expectedOutputAmount, slippage, balanceCheckTries = 5, extraInstructions = () => Promise.resolve({
        instructions: [],
        signers: [],
        output: null,
    }), preInstructions = () => __awaiter(this, void 0, void 0, function* () {
        return {
            instructions: [],
            signers: [],
            output: null,
        };
    }), postInstructions = () => Promise.resolve({
        instructions: [],
        signers: [],
        output: null,
    }), entangled = null, }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const hierarchyFromTarget = yield this.getBondingHierarchy((yield SplTokenBonding.tokenBondingKey(targetMint))[0], baseMint);
            const hierarchyFromBase = yield this.getBondingHierarchy((yield SplTokenBonding.tokenBondingKey(baseMint))[0], targetMint);
            const hierarchy = [hierarchyFromTarget, hierarchyFromBase].find((hierarchy) => hierarchy === null || hierarchy === void 0 ? void 0 : hierarchy.contains(baseMint, targetMint));
            if (!hierarchy) {
                throw new Error(`No bonding curve hierarchies found for base or target that contain both ${baseMint.toBase58()} and ${targetMint.toBase58()}`);
            }
            const isBuy = hierarchy.tokenBonding.targetMint.equals(targetMint);
            const arrHierarchy = (hierarchy === null || hierarchy === void 0 ? void 0 : hierarchy.toArray()) || [];
            const baseMintInfo = yield (0, spl_utils_1.getMintInfo)(this.provider, baseMint);
            let currAmount = baseAmount ? (0, utils_1.toBN)(baseAmount, baseMintInfo) : undefined;
            const hierarchyToTraverse = isBuy ? arrHierarchy.reverse() : arrHierarchy;
            const processedMints = [];
            for (const [index, subHierarchy] of hierarchyToTraverse.entries()) {
                const isLastHop = index === arrHierarchy.length - 1;
                const tokenBonding = subHierarchy.tokenBonding;
                const baseIsSol = tokenBonding.baseMint.equals((_a = (yield this.getState())) === null || _a === void 0 ? void 0 : _a.wrappedSolMint);
                const ataMint = entangled && isBuy
                    ? entangled
                    : isBuy
                        ? tokenBonding.targetMint
                        : tokenBonding.baseMint;
                const ata = yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, ataMint, sourceAuthority, true);
                const getBalance = () => __awaiter(this, void 0, void 0, function* () {
                    var _b;
                    if (!isBuy && baseIsSol) {
                        const amount = ((_b = (yield this.provider.connection.getAccountInfo(sourceAuthority, "single"))) === null || _b === void 0 ? void 0 : _b.lamports) || 0;
                        return new bn_js_1.default(amount);
                    }
                    else {
                        return this.getTokenAccountBalance(ata, "single");
                    }
                });
                const preBalance = yield getBalance();
                let instructions;
                let signers;
                let currMint;
                if (isBuy) {
                    console.log(`Actually doing ${tokenBonding.baseMint.toBase58()} to ${tokenBonding.targetMint.toBase58()}`);
                    ({ instructions, signers } = yield this.buyInstructions({
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
                    ({ instructions, signers } = yield this.sellInstructions({
                        payer,
                        sourceAuthority,
                        targetAmount: currAmount,
                        tokenBonding: tokenBonding.publicKey,
                        expectedOutputAmount: isLastHop ? expectedOutputAmount : undefined,
                        slippage,
                    }));
                    currMint = tokenBonding.baseMint;
                }
                const { instructions: extraInstrs, signers: extraSigners } = yield extraInstructions({
                    tokenBonding,
                    amount: currAmount,
                    isBuy,
                });
                const { instructions: preInstrs, signers: preSigners } = yield preInstructions({
                    tokenBonding,
                    amount: currAmount,
                    desiredTargetAmount,
                    isBuy,
                    isFirst: index == 0,
                });
                const { instructions: postInstrs, signers: postSigners } = yield postInstructions({
                    isLast: isLastHop,
                    amount: expectedOutputAmount,
                    isBuy,
                });
                try {
                    yield this.sendInstructions([...extraInstrs, ...preInstrs, ...instructions, ...postInstrs], [...extraSigners, ...preSigners, ...signers, ...postSigners], payer);
                }
                catch (e) {
                    // Throw a nice error if the swap partially succeeded.
                    if (processedMints.length > 0) {
                        const splTokenMetadata = yield spl_utils_1.SplTokenMetadata.init(this.provider);
                        const lastMint = processedMints[processedMints.length - 1];
                        const metadataKey = yield mpl_token_metadata_1.Metadata.getPDA(lastMint);
                        const metadata = yield splTokenMetadata.getMetadata(metadataKey);
                        const name = (metadata === null || metadata === void 0 ? void 0 : metadata.data.symbol) || lastMint.toBase58();
                        const err = new Error(`Swap partially failed, check your wallet for ${name} tokens. Error: ${e.toString()}`);
                        err.stack = e.stack;
                        throw err;
                    }
                    throw e;
                }
                processedMints.push(currMint);
                function newBalance(tries = 0) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (tries > balanceCheckTries) {
                            return new bn_js_1.default(0);
                        }
                        let postBalance = yield getBalance();
                        // Sometimes it can take a bit for Solana to catch up
                        // Wait and see if the balance truly hasn't changed.
                        if (postBalance.eq(preBalance)) {
                            console.log("No balance change detected while swapping, trying again", tries);
                            yield sleep(5000);
                            return newBalance(tries + 1);
                        }
                        return postBalance;
                    });
                }
                const postBalance = yield newBalance();
                currAmount = postBalance.sub(preBalance || new bn_js_1.default(0));
                // Fees, or something else caused the balance to be negative. Just report the change
                // and quit
                if (currAmount.eq(new bn_js_1.default(0))) {
                    const targetMintInfo = yield (0, spl_utils_1.getMintInfo)(this.provider, isBuy ? tokenBonding.targetMint : tokenBonding.baseMint);
                    return {
                        targetAmount: (0, utils_1.toNumber)(postBalance, targetMintInfo) -
                            (0, utils_1.toNumber)(preBalance, targetMintInfo),
                    };
                }
            }
            const targetMintInfo = yield (0, spl_utils_1.getMintInfo)(this.provider, targetMint);
            return {
                targetAmount: (0, utils_1.toNumber)(currAmount, targetMintInfo),
            };
        });
    }
    getState() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.state) {
                return this.state;
            }
            const stateAddress = (yield web3_js_1.PublicKey.findProgramAddress([Buffer.from("state", "utf-8")], this.programId))[0];
            const stateRaw = yield this.account.programStateV0.fetchNullable(stateAddress);
            const state = stateRaw
                ? Object.assign(Object.assign({}, stateRaw), { publicKey: stateAddress }) : null;
            if (state) {
                this.state = state;
            }
            return state;
        });
    }
    /**
     * Instructions to burn `targetMint` tokens in exchange for `baseMint` tokens
     *
     * @param param0
     * @returns
     */
    sellInstructions({ tokenBonding, source, sourceAuthority = this.wallet.publicKey, destination, targetAmount, expectedOutputAmount, slippage, payer = this.wallet.publicKey, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const state = (yield this.getState());
            const tokenBondingAcct = (yield this.getTokenBonding(tokenBonding));
            if (tokenBondingAcct.sellFrozen) {
                throw new Error("Sell is frozen on this bonding curve");
            }
            const isNative = tokenBondingAcct.baseMint.equals(spl_token_1.NATIVE_MINT) ||
                tokenBondingAcct.baseMint.equals(state.wrappedSolMint);
            // @ts-ignore
            const targetMint = yield (0, spl_utils_1.getMintInfo)(this.provider, tokenBondingAcct.targetMint);
            const baseMint = yield (0, spl_utils_1.getMintInfo)(this.provider, tokenBondingAcct.baseMint);
            const baseStorage = yield (0, spl_utils_1.getTokenAccount)(this.provider, tokenBondingAcct.baseStorage);
            // @ts-ignore
            const curve = yield this.getPricingCurve(tokenBondingAcct.curve, (0, utils_1.amountAsNum)(tokenBondingAcct.ignoreExternalReserveChanges
                ? tokenBondingAcct.reserveBalanceFromBonding
                : baseStorage.amount, baseMint), (0, utils_1.amountAsNum)(tokenBondingAcct.ignoreExternalSupplyChanges
                ? tokenBondingAcct.supplyFromBonding
                : targetMint.supply, targetMint), tokenBondingAcct.goLiveUnixTime.toNumber());
            const instructions = [];
            // let req = ComputeBudgetProgram.setComputeUnitLimit({units: 350000});
            // instructions.push(req);
            if (!source) {
                source = yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, tokenBondingAcct.targetMint, sourceAuthority, true);
                if (!(yield this.accountExists(source))) {
                    console.warn("Source account for bonding buy does not exist, if it is not created in an earlier instruction this can cause an error");
                }
            }
            if (!destination) {
                if (isNative) {
                    destination = sourceAuthority;
                }
                else {
                    destination = yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, tokenBondingAcct.baseMint, sourceAuthority, true);
                    if (!(yield this.accountExists(destination))) {
                        console.log("Creating base account");
                        instructions.push(spl_token_1.Token.createAssociatedTokenAccountInstruction(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, tokenBondingAcct.baseMint, destination, sourceAuthority, payer));
                    }
                }
            }
            const unixTime = yield this.getUnixTime();
            const targetAmountNum = (0, utils_1.toNumber)(targetAmount, targetMint);
            const min = expectedOutputAmount
                ? (0, utils_1.toNumber)(expectedOutputAmount, baseMint)
                : curve.sellTargetAmount(targetAmountNum, tokenBondingAcct.sellBaseRoyaltyPercentage, tokenBondingAcct.sellTargetRoyaltyPercentage, unixTime);
            const args = {
                targetAmount: (0, utils_1.toBN)(targetAmount, targetMint),
                minimumPrice: new bn_js_1.default(Math.ceil(min * (1 - slippage) * Math.pow(10, baseMint.decimals))),
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
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
            };
            if (isNative) {
                instructions.push(yield this.instruction.sellNativeV0(args, {
                    accounts: {
                        common,
                        destination,
                        state: state.publicKey,
                        wrappedSolMint: state.wrappedSolMint,
                        mintAuthority: (yield SplTokenBonding.wrappedSolMintAuthorityKey(this.programId))[0],
                        solStorage: state.solStorage,
                        systemProgram: web3_js_1.SystemProgram.programId,
                    },
                }));
            }
            else {
                instructions.push(yield this.instruction.sellV1(args, {
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
        });
    }
    /**
     * Runs {@link sell}
     * @param args
     */
    sell(args, commitment = "confirmed") {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.execute(this.sellInstructions(args), args.payer, commitment);
        });
    }
    /**
     * Instructions to close the bonding curve
     *
     * @param param0
     * @returns
     */
    closeInstructions({ tokenBonding, generalAuthority, refund = this.wallet.publicKey, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenBondingAcct = (yield this.getTokenBonding(tokenBonding));
            if (!tokenBondingAcct.generalAuthority) {
                throw new Error("Cannot close a bonding account with no general authority");
            }
            return {
                output: null,
                signers: [],
                instructions: [
                    yield this.instruction.closeTokenBondingV0({
                        accounts: {
                            refund,
                            tokenBonding,
                            generalAuthority: generalAuthority ||
                                tokenBondingAcct.generalAuthority,
                            targetMint: tokenBondingAcct.targetMint,
                            baseStorage: tokenBondingAcct.baseStorage,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                        },
                    }),
                ],
            };
        });
    }
    /**
     * Runs {@link closeInstructions}
     * @param args
     */
    close(args, commitment = "confirmed") {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.execute(this.closeInstructions(args), args.payer, commitment);
        });
    }
    /**
     * Instructions to transfer the reserves of the bonding curve
     *
     * @param param0
     * @returns
     */
    transferReservesInstructions({ tokenBonding, destination, amount, reserveAuthority, destinationWallet = this.wallet.publicKey, payer = this.wallet.publicKey, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenBondingAcct = (yield this.getTokenBonding(tokenBonding));
            const state = (yield this.getState());
            const isNative = tokenBondingAcct.baseMint.equals(spl_token_1.NATIVE_MINT) ||
                tokenBondingAcct.baseMint.equals(state.wrappedSolMint);
            const baseMint = yield (0, spl_utils_1.getMintInfo)(this.provider, tokenBondingAcct.baseMint);
            const instructions = [];
            if (!tokenBondingAcct.reserveAuthority) {
                throw new Error("Cannot transfer reserves on a bonding account with no reserve authority");
            }
            if (!destination && isNative) {
                destination = destinationWallet;
            }
            const destAcct = destination &&
                (yield this.provider.connection.getAccountInfo(destination));
            // Destination is a wallet, need to get the ATA
            if (!isNative &&
                (!destAcct || destAcct.owner.equals(web3_js_1.SystemProgram.programId))) {
                const ataDestination = yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, tokenBondingAcct.baseMint, destinationWallet, false // Explicitly don't allow owner off curve. You need to pass destination as an already created thing to do this
                );
                if (!(yield this.accountExists(ataDestination))) {
                    instructions.push(spl_token_1.Token.createAssociatedTokenAccountInstruction(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, tokenBondingAcct.baseMint, ataDestination, destinationWallet, payer));
                }
                destination = ataDestination;
            }
            const common = {
                tokenBonding,
                reserveAuthority: reserveAuthority || tokenBondingAcct.reserveAuthority,
                baseMint: tokenBondingAcct.baseMint,
                baseStorage: tokenBondingAcct.baseStorage,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            };
            const args = {
                amount: (0, utils_1.toBN)(amount, baseMint),
            };
            if (isNative) {
                instructions.push(yield this.instruction.transferReservesNativeV0(args, {
                    accounts: {
                        common,
                        destination: destination,
                        state: state.publicKey,
                        wrappedSolMint: state.wrappedSolMint,
                        mintAuthority: (yield SplTokenBonding.wrappedSolMintAuthorityKey(this.programId))[0],
                        solStorage: state.solStorage,
                        systemProgram: web3_js_1.SystemProgram.programId,
                    },
                }));
            }
            else {
                instructions.push(yield this.instruction.transferReservesV0(args, {
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
        });
    }
    /**
     * Runs {@link closeInstructions}
     * @param args
     */
    transferReserves(args, commitment = "confirmed") {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.execute(this.transferReservesInstructions(args), args.payer, commitment);
        });
    }
    /**
     * Get a class capable of displaying pricing information or this token bonding at its current reserve and supply
     *
     * @param tokenBonding
     * @returns
     */
    getBondingPricingCurve(tokenBonding) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenBondingAcct = (yield this.getTokenBonding(tokenBonding));
            const targetMint = yield (0, spl_utils_1.getMintInfo)(this.provider, tokenBondingAcct.targetMint);
            const baseMint = yield (0, spl_utils_1.getMintInfo)(this.provider, tokenBondingAcct.baseMint);
            const baseStorage = yield (0, spl_utils_1.getTokenAccount)(this.provider, tokenBondingAcct.baseStorage);
            return yield this.getPricingCurve(tokenBondingAcct.curve, (0, utils_1.amountAsNum)(tokenBondingAcct.ignoreExternalReserveChanges
                ? tokenBondingAcct.reserveBalanceFromBonding
                : baseStorage.amount, baseMint), (0, utils_1.amountAsNum)(tokenBondingAcct.ignoreExternalSupplyChanges
                ? tokenBondingAcct.supplyFromBonding
                : targetMint.supply, targetMint), tokenBondingAcct.goLiveUnixTime.toNumber());
        });
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
    getPricingCurve(key, baseAmount, targetSupply, goLiveUnixTime) {
        return __awaiter(this, void 0, void 0, function* () {
            const curve = yield this.getCurve(key);
            return (0, curves_1.fromCurve)(curve, baseAmount, targetSupply, goLiveUnixTime);
        });
    }
    getPricing(tokenBondingKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const hierarchy = yield this.getBondingHierarchy(tokenBondingKey);
            if (hierarchy) {
                return new pricing_1.BondingPricing({
                    hierarchy: hierarchy,
                });
            }
        });
    }
    /**
     * Fetch the token bonding curve and all of its direct ancestors
     *
     * @param tokenBondingKey
     * @returns
     */
    getBondingHierarchy(tokenBondingKey, stopAtMint) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!tokenBondingKey) {
                return;
            }
            const [wrappedSolMint, tokenBonding] = yield Promise.all([
                this.getState().then((s) => s === null || s === void 0 ? void 0 : s.wrappedSolMint),
                this.getTokenBonding(tokenBondingKey),
            ]);
            if (stopAtMint === null || stopAtMint === void 0 ? void 0 : stopAtMint.equals(spl_token_1.NATIVE_MINT)) {
                stopAtMint = wrappedSolMint;
            }
            if (!tokenBonding) {
                return;
            }
            const pricingCurve = yield this.getBondingPricingCurve(tokenBondingKey);
            const parentKey = (yield SplTokenBonding.tokenBondingKey(tokenBonding.baseMint))[0];
            const ret = new bondingHierarchy_1.BondingHierarchy({
                parent: (stopAtMint === null || stopAtMint === void 0 ? void 0 : stopAtMint.equals(tokenBonding.baseMint))
                    ? undefined
                    : yield this.getBondingHierarchy(parentKey, stopAtMint),
                tokenBonding,
                pricingCurve,
                wrappedSolMint,
            });
            (ret.parent || {}).child = ret;
            return ret;
        });
    }
}
exports.SplTokenBonding = SplTokenBonding;
SplTokenBonding.ID = new web3_js_1.PublicKey("TBondmkCYxaPCKG4CHYfVTcwQ8on31xnJrPzk8F8WsS");
//# sourceMappingURL=index.js.map