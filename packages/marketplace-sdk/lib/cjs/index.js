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
exports.MarketplaceSdk = exports.LBC_CURVE_FEES = exports.FIXED_CURVE_FEES = exports.FEES_WALLET = void 0;
const anchor_1 = require("@project-serum/anchor");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const spl_token_bonding_1 = require("@strata-foundation/spl-token-bonding");
const spl_token_collective_1 = require("@strata-foundation/spl-token-collective");
const fungible_entangler_1 = require("@strata-foundation/fungible-entangler");
const spl_utils_1 = require("@strata-foundation/spl-utils");
const bn_js_1 = __importDefault(require("bn.js"));
const bs58_1 = __importDefault(require("bs58"));
const buffer_1 = require("buffer");
exports.FEES_WALLET = new web3_js_1.PublicKey("989wTE33inEx5k3o8pxSSSU9HEmf9Sj4PSqF6NZbxHkp");
exports.FIXED_CURVE_FEES = 0;
exports.LBC_CURVE_FEES = 0;
const truthy = (value) => !!value;
class MarketplaceSdk {
    constructor(provider, tokenBondingSdk, tokenCollectiveSdk, fungibleEntanglerSdk, tokenMetadataSdk) {
        this.provider = provider;
        this.tokenBondingSdk = tokenBondingSdk;
        this.tokenCollectiveSdk = tokenCollectiveSdk;
        this.fungibleEntanglerSdk = fungibleEntanglerSdk;
        this.tokenMetadataSdk = tokenMetadataSdk;
    }
    static bountyAttributes({ mint, contact, discussion, }) {
        return [
            {
                trait_type: "is_strata_bounty",
                display_type: "Strata Bounty",
                value: "true",
            },
            {
                trait_type: "bounty_uri",
                display_type: "Bounty URI",
                value: `https://marketplace.strataprotocol.com/bounties/${mint}`,
            },
            {
                trait_type: "contact",
                display_type: "Contact",
                value: contact,
            },
            {
                trait_type: "discussion",
                display_type: "Discussion",
                value: discussion,
            },
        ];
    }
    static init(provider, splTokenBondingProgramId = spl_token_bonding_1.SplTokenBonding.ID, splTokenCollectiveProgramId = spl_token_collective_1.SplTokenCollective.ID, fungibleEntanglerProgramId = fungible_entangler_1.FungibleEntangler.ID) {
        return __awaiter(this, void 0, void 0, function* () {
            return new this(provider, yield spl_token_bonding_1.SplTokenBonding.init(provider, splTokenBondingProgramId), yield spl_token_collective_1.SplTokenCollective.init(provider, splTokenCollectiveProgramId), yield fungible_entangler_1.FungibleEntangler.init(provider, fungibleEntanglerProgramId), yield spl_utils_1.SplTokenMetadata.init(provider));
        });
    }
    createManualTokenInstructions({ mintKeypair = web3_js_1.Keypair.generate(), decimals, metadata, amount, payer = this.provider.wallet.publicKey, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const publicKey = this.provider.wallet.publicKey;
            var mint = mintKeypair.publicKey;
            var instructions = [];
            var ata = yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, mint, publicKey);
            instructions.push(...(yield (0, spl_utils_1.createMintInstructions)(this.provider, publicKey, mint, 0, publicKey)));
            var metadataInstructions = yield this.tokenMetadataSdk.createMetadataInstructions({
                mint,
                authority: publicKey,
                data: metadata,
            });
            instructions.push(...metadataInstructions.instructions);
            instructions.push(spl_token_1.Token.createAssociatedTokenAccountInstruction(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, mint, ata, publicKey, publicKey));
            instructions.push(spl_token_1.Token.createMintToInstruction(spl_token_1.TOKEN_PROGRAM_ID, mint, ata, publicKey, [], amount));
            return {
                instructions,
                signers: [mintKeypair],
                output: { mint },
            };
        });
    }
    createManualToken(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const { instructions, signers, output } = yield this.createManualTokenInstructions(args);
            yield this.tokenMetadataSdk.sendInstructions(instructions, signers, args.payer);
            return output;
        });
    }
    createFixedCurve({ keypair, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const curve = yield this.tokenBondingSdk.initializeCurve({
                curveKeypair: keypair,
                config: new spl_token_bonding_1.ExponentialCurveConfig({
                    c: 0,
                    pow: 0,
                    frac: 1,
                    b: 1,
                }),
            });
            return curve;
        });
    }
    disburseBountyInstructions(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.disburseCurveInstructions(args);
        });
    }
    /**
     * Disburses all of the funds from the curve to the specified address
     * and closes the bonding curve
     *
     * If the bounty is owned by a previous unclaimed social token, handles the changeover of owners
     *
     * @param param0
     * @returns
     */
    disburseCurveInstructions({ tokenBonding, destination, destinationWallet = this.provider.wallet.publicKey, includeRetrievalCurve, closeBonding = true, parentEntangler, childEntangler, closeEntangler, }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const instructions = [];
            const signers = [];
            const tokenBondingAcct = (yield this.tokenBondingSdk.getTokenBonding(tokenBonding));
            let authority = null;
            try {
                const tokenRef = yield this.tokenCollectiveSdk.getTokenRef(tokenBondingAcct.reserveAuthority);
                if (tokenRef) {
                    authority = tokenRef.owner;
                    const { instructions: i0, signers: s0 } = yield this.tokenCollectiveSdk.claimBondingAuthorityInstructions({
                        tokenBonding,
                    });
                    instructions.push(...i0);
                    signers.push(...s0);
                }
            }
            catch (e) {
                // ignore
            }
            const reserveAmount = yield this.tokenBondingSdk.getTokenAccountBalance(tokenBondingAcct.baseStorage);
            const { instructions: i1, signers: s1 } = yield ((_a = this.tokenBondingSdk) === null || _a === void 0 ? void 0 : _a.transferReservesInstructions({
                amount: reserveAmount,
                destination,
                destinationWallet,
                tokenBonding,
                reserveAuthority: authority || undefined,
            }));
            instructions.push(...i1);
            signers.push(...s1);
            if (closeBonding) {
                const { instructions: i2, signers: s2 } = yield this.tokenBondingSdk.closeInstructions({
                    tokenBonding,
                    generalAuthority: authority || undefined,
                });
                instructions.push(...i2);
                signers.push(...s2);
            }
            if (closeEntangler && parentEntangler && childEntangler) {
                const parentEntanglerAcct = (yield this.fungibleEntanglerSdk.getParentEntangler(parentEntangler));
                const childEntanglerAcct = (yield this.fungibleEntanglerSdk.getChildEntangler(childEntangler));
                const childAmount = yield this.tokenBondingSdk.getTokenAccountBalance(childEntanglerAcct.childStorage);
                const parentAmount = yield this.tokenBondingSdk.getTokenAccountBalance(parentEntanglerAcct.parentStorage);
                const transferChild = yield this.fungibleEntanglerSdk.transferInstructions({
                    childEntangler,
                    amount: childAmount,
                    destination,
                    destinationWallet,
                });
                const transferParent = yield this.fungibleEntanglerSdk.transferInstructions({
                    parentEntangler,
                    amount: parentAmount,
                    destination,
                    destinationWallet,
                });
                const closeChild = yield this.fungibleEntanglerSdk.closeInstructions({
                    childEntangler,
                });
                const closeParent = yield this.fungibleEntanglerSdk.closeInstructions({
                    parentEntangler,
                });
                instructions.push(...transferChild.instructions, ...transferParent.instructions, ...closeChild.instructions, ...closeParent.instructions);
                signers.push(...transferChild.signers, ...transferParent.signers, ...closeChild.signers, ...closeParent.signers);
            }
            if (includeRetrievalCurve) {
                const retrievalInstrs = yield this.disburseCurveInstructions({
                    tokenBonding: (yield spl_token_bonding_1.SplTokenBonding.tokenBondingKey(tokenBondingAcct.targetMint, 1))[0],
                    includeRetrievalCurve: false,
                    destinationWallet,
                    destination,
                });
                instructions.push(...retrievalInstrs.instructions);
                signers.push(...retrievalInstrs.signers);
            }
            return {
                output: null,
                instructions,
                signers,
            };
        });
    }
    disburseBounty(args, finality) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.disburseCurve(args, finality);
        });
    }
    /**
     * Executes `disburseCurveInstructions`
     * @param args
     * @returns
     */
    disburseCurve(args, finality) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.tokenBondingSdk.execute(this.disburseCurveInstructions(args), args.payer, finality);
        });
    }
    getBounties({ baseMint, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const state = yield this.tokenBondingSdk.getState();
            if (baseMint === null || baseMint === void 0 ? void 0 : baseMint.equals(spl_token_1.NATIVE_MINT)) {
                baseMint = state.wrappedSolMint;
            }
            const descriminator = anchor_1.BorshAccountsCoder.accountDiscriminator("tokenBondingV0");
            const filters = [
                {
                    memcmp: {
                        offset: 0,
                        bytes: bs58_1.default.encode(buffer_1.Buffer.concat([descriminator, baseMint === null || baseMint === void 0 ? void 0 : baseMint.toBuffer()].filter(truthy))),
                    },
                },
                {
                    // All royalties should be 0 and curve should be fixed and mint cap + purchase cap not defined
                    memcmp: {
                        offset: descriminator.length +
                            32 + // base mint
                            32 + // target mint
                            33 + // general authority
                            33 + // reserve authority
                            1 + // curve authority
                            32 + // base storage
                            32 * 4,
                        bytes: bs58_1.default.encode(buffer_1.Buffer.concat([
                            new spl_token_1.u64(0).toBuffer(),
                            new spl_token_1.u64(0).toBuffer(),
                            new web3_js_1.PublicKey(MarketplaceSdk.FIXED_CURVE).toBuffer(),
                            buffer_1.Buffer.from(new Uint8Array([0, 0])),
                        ])),
                    },
                },
            ];
            const mints = yield this.provider.connection.getProgramAccounts(this.tokenBondingSdk.programId, {
                // Just get the base and target mints
                dataSlice: {
                    length: 64,
                    offset: descriminator.length,
                },
                filters,
            });
            const goLives = yield this.provider.connection.getProgramAccounts(this.tokenBondingSdk.programId, {
                // Just get the go lives
                dataSlice: {
                    offset: descriminator.length +
                        32 + // base mint
                        32 + // target mint
                        33 + // general authority
                        33 + // reserve authority
                        1 + // curve authority
                        32 + // base storage
                        32 * 4 + // royalties,
                        4 * 4 + // royalties amounts,
                        32 + // curve
                        1 + // Mint cap
                        1,
                    length: 8,
                },
                filters,
            });
            const contributions = yield this.provider.connection.getProgramAccounts(this.tokenBondingSdk.programId, {
                // Just get the contributions
                dataSlice: {
                    offset: descriminator.length +
                        32 + // base mint
                        32 + // target mint
                        33 + // general authority
                        33 + // reserve authority
                        1 + // curve authority
                        32 + // base storage
                        32 * 4 + // royalties,
                        4 * 4 + // royalties amounts,
                        32 + // curve
                        1 + // Mint cap
                        1 + // Purchase cap
                        8 + // go live,
                        1 + // freeze buy,
                        8 + // created,
                        1 + // buy frozen
                        1 + // sell frozen
                        2 +
                        1 +
                        1 +
                        1 +
                        2,
                    length: 8,
                },
                filters,
            });
            return mints.map((mint, index) => {
                const goLive = goLives[index];
                const contribution = contributions[index];
                return {
                    tokenBondingKey: mint.pubkey,
                    baseMint: new web3_js_1.PublicKey(mint.account.data.slice(0, 32)),
                    targetMint: new web3_js_1.PublicKey(mint.account.data.slice(32, 64)),
                    goLiveUnixTime: new bn_js_1.default(goLive.account.data, 10, "le"),
                    reserveBalanceFromBonding: new bn_js_1.default(contribution.account.data, 10, "le"),
                };
            });
        });
    }
    createMetadataForBondingInstructions({ metadataUpdateAuthority = this.provider.wallet.publicKey, metadata, targetMintKeypair = web3_js_1.Keypair.generate(), decimals, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const targetMint = targetMintKeypair.publicKey;
            const instructions = [];
            const signers = [];
            instructions.push(...(yield (0, spl_utils_1.createMintInstructions)(this.tokenBondingSdk.provider, this.provider.wallet.publicKey, targetMint, decimals)));
            signers.push(targetMintKeypair);
            const { instructions: metadataInstructions, signers: metadataSigners, output, } = yield this.tokenMetadataSdk.createMetadataInstructions({
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
    /**
     * Creates a market item selling a quantity qty for a price
     *
     * @param param0
     * @returns
     */
    createMarketItemInstructions({ payer = this.provider.wallet.publicKey, seller = this.provider.wallet.publicKey, metadata, metadataUpdateAuthority = seller, quantity, price, bondingArgs, baseMint, targetMintKeypair = web3_js_1.Keypair.generate(), }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!price && !(bondingArgs === null || bondingArgs === void 0 ? void 0 : bondingArgs.curve)) {
                throw new Error("Must either pass price or bondingArgs.curve");
            }
            const instructions = [];
            const signers = [];
            metadataUpdateAuthority = metadataUpdateAuthority || seller;
            const { output: { mint: targetMint }, signers: metadataSigners, instructions: metadataInstructions, } = yield this.createMetadataForBondingInstructions({
                targetMintKeypair,
                metadata,
                metadataUpdateAuthority: metadataUpdateAuthority,
                decimals: (bondingArgs === null || bondingArgs === void 0 ? void 0 : bondingArgs.targetMintDecimals) || 0,
            });
            instructions.push(...metadataInstructions);
            signers.push(...metadataSigners);
            let curve = bondingArgs === null || bondingArgs === void 0 ? void 0 : bondingArgs.curve;
            if (price) {
                const feeModifier = 1;
                const { instructions: curveInstructions, signers: curveSigners, output: { curve: outCurve }, } = yield this.tokenBondingSdk.initializeCurveInstructions({
                    config: new spl_token_bonding_1.ExponentialCurveConfig({
                        c: 0,
                        pow: 0,
                        frac: 1,
                        b: price * feeModifier,
                    }),
                });
                instructions.push(...curveInstructions);
                signers.push(...curveSigners);
                curve = outCurve;
            }
            const { output: { tokenBonding }, instructions: tokenBondingInstructions, signers: tokenBondingSigners, } = yield this.tokenBondingSdk.createTokenBondingInstructions(Object.assign(Object.assign({ payer, reserveAuthority: seller, generalAuthority: seller, curveAuthority: seller, targetMint, mintCap: quantity
                    ? new bn_js_1.default((quantity * Math.pow(10, (bondingArgs === null || bondingArgs === void 0 ? void 0 : bondingArgs.targetMintDecimals) || 0)).toLocaleString("fullwide", {
                        useGrouping: false,
                    }))
                    : undefined, ignoreExternalReserveChanges: true, ignoreExternalSupplyChanges: true, sellFrozen: true, buyBaseRoyaltyPercentage: 0, buyBaseRoyaltiesOwner: exports.FEES_WALLET, sellBaseRoyaltyPercentage: 0, sellTargetRoyaltyPercentage: 0, buyTargetRoyaltyPercentage: 0, baseMint, targetMintDecimals: 0 }, bondingArgs), { curve: curve }));
            return {
                output: {
                    tokenBonding,
                    targetMint,
                },
                instructions: [instructions, tokenBondingInstructions],
                signers: [signers, tokenBondingSigners],
            };
        });
    }
    /**
     * Executes `createMarketItemIntructions`
     * @param args
     * @returns
     */
    createMarketItem(args, finality) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.tokenBondingSdk.executeBig(this.createMarketItemInstructions(args), args.payer, finality);
        });
    }
    static isNormalBounty(tokenBonding) {
        if (!tokenBonding) {
            return true;
        }
        return (tokenBonding.buyBaseRoyaltyPercentage == 0 &&
            tokenBonding.sellBaseRoyaltyPercentage == 0 &&
            tokenBonding.buyTargetRoyaltyPercentage == 0 &&
            tokenBonding.sellTargetRoyaltyPercentage == 0 &&
            tokenBonding.curve.equals(new web3_js_1.PublicKey(MarketplaceSdk.FIXED_CURVE)) &&
            tokenBonding.curveAuthority == null &&
            !tokenBonding.ignoreExternalReserveChanges &&
            !tokenBonding.ignoreExternalSupplyChanges &&
            tokenBonding.mintCap == null &&
            tokenBonding.purchaseCap == null);
    }
    /**
     * Creates a bounty
     *
     * @param param0
     * @returns
     */
    createBountyInstructions({ payer = this.provider.wallet.publicKey, authority = this.provider.wallet.publicKey, targetMintKeypair = web3_js_1.Keypair.generate(), metadata, metadataUpdateAuthority = authority, bondingArgs, baseMint, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const curve = (bondingArgs === null || bondingArgs === void 0 ? void 0 : bondingArgs.curve) || new web3_js_1.PublicKey(MarketplaceSdk.FIXED_CURVE);
            const baseMintAcct = yield (0, spl_utils_1.getMintInfo)(this.provider, baseMint);
            const instructions = [];
            const signers = [];
            metadataUpdateAuthority = metadataUpdateAuthority || authority;
            const { output: { mint: targetMint }, signers: metadataSigners, instructions: metadataInstructions, } = yield this.createMetadataForBondingInstructions({
                metadata,
                targetMintKeypair,
                metadataUpdateAuthority: metadataUpdateAuthority,
                decimals: typeof (bondingArgs === null || bondingArgs === void 0 ? void 0 : bondingArgs.targetMintDecimals) == "undefined"
                    ? baseMintAcct.decimals
                    : bondingArgs.targetMintDecimals,
            });
            instructions.push(...metadataInstructions);
            signers.push(...metadataSigners);
            const { output: { tokenBonding }, instructions: tokenBondingInstructions, signers: tokenBondingSigners, } = yield this.tokenBondingSdk.createTokenBondingInstructions(Object.assign({ payer, curve: curve, reserveAuthority: authority, generalAuthority: authority, targetMint, buyBaseRoyaltyPercentage: 0, sellBaseRoyaltyPercentage: 0, sellTargetRoyaltyPercentage: 0, buyTargetRoyaltyPercentage: 0, baseMint }, bondingArgs));
            return {
                output: {
                    tokenBonding,
                    targetMint,
                },
                instructions: [instructions, tokenBondingInstructions],
                signers: [signers, tokenBondingSigners],
            };
        });
    }
    /**
     * Executes `createBountyIntructions`
     * @param args
     * @returns
     */
    createBounty(args, finality) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.tokenBondingSdk.executeBig(this.createBountyInstructions(args), args.payer, finality);
        });
    }
    static lbcCurve({ interval, startPrice, minPrice, maxSupply, timeDecay, }) {
        if (startPrice < minPrice) {
            throw new Error("Max price must be more than min price");
        }
        if (minPrice == 0) {
            throw new Error("Min price must be more than 0");
        }
        maxSupply = maxSupply * 2;
        minPrice = minPrice / 2; // Account for ending with k = 1 instead of k = 0
        // end price = start price / (1 + k0)
        // (1 + k0) (end price) = start price
        // (1 + k0)  = (start price) / (end price)
        // k0  = (start price) / (end price) - 1
        const k0 = startPrice / minPrice - 1;
        const k1 = 1; // Price should never stop increasing, or it's easy to have a big price drop at the end.
        return {
            curveConfig: new spl_token_bonding_1.TimeDecayExponentialCurveConfig({
                k1,
                k0,
                interval,
                c: 1,
                d: timeDecay || 1 / Math.max(k0 - 1, 1),
            }),
            reserves: minPrice * maxSupply,
            supply: maxSupply,
        };
    }
    /**
     * Creates an LBC
     *
     * @param param0
     * @returns
     */
    createLiquidityBootstrapperInstructions({ payer = this.provider.wallet.publicKey, authority = this.provider.wallet.publicKey, targetMint, targetMintKeypair, metadata, metadataUpdateAuthority = authority, interval, startPrice, minPrice, maxSupply, bondingArgs, baseMint, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const instructions = [];
            const signers = [];
            const feeModifier = 1;
            const { reserves: initialReservesPad, supply: initialSupplyPad, curveConfig, } = MarketplaceSdk.lbcCurve({
                interval,
                startPrice: startPrice * feeModifier,
                minPrice: minPrice * feeModifier,
                maxSupply,
            });
            let curve = bondingArgs === null || bondingArgs === void 0 ? void 0 : bondingArgs.curve;
            if (!curve) {
                const { output: { curve: outCurve }, instructions: curveInstructions, signers: curveSigners, } = yield this.tokenBondingSdk.initializeCurveInstructions({
                    config: curveConfig,
                });
                instructions.push(...curveInstructions);
                signers.push(...curveSigners);
                curve = outCurve;
            }
            const baseMintAcct = yield (0, spl_utils_1.getMintInfo)(this.provider, baseMint);
            metadataUpdateAuthority = metadataUpdateAuthority || authority;
            const decimals = typeof (bondingArgs === null || bondingArgs === void 0 ? void 0 : bondingArgs.targetMintDecimals) == "undefined"
                ? baseMintAcct.decimals
                : bondingArgs.targetMintDecimals;
            if (targetMintKeypair && metadata) {
                const { output: { mint: outTargetMint }, signers: metadataSigners, instructions: metadataInstructions, } = yield this.createMetadataForBondingInstructions({
                    metadata,
                    targetMintKeypair,
                    metadataUpdateAuthority: metadataUpdateAuthority,
                    decimals,
                });
                targetMint = outTargetMint;
                instructions.push(...metadataInstructions);
                signers.push(...metadataSigners);
            }
            if (targetMint && (yield this.tokenBondingSdk.accountExists(targetMint))) {
                const mint = yield (0, spl_utils_1.getMintInfo)(this.provider, targetMint);
                const mintAuthority = (yield spl_token_bonding_1.SplTokenBonding.tokenBondingKey(targetMint))[0];
                if (!mint.mintAuthority) {
                    throw new Error("Mint must have an authority");
                }
                if (!mint.mintAuthority.equals(mintAuthority)) {
                    instructions.push(yield spl_token_1.Token.createSetAuthorityInstruction(spl_token_1.TOKEN_PROGRAM_ID, targetMint, mintAuthority, "MintTokens", mint.mintAuthority, []));
                }
            }
            const { output: { tokenBonding, targetMint: bondingTargetMint }, instructions: tokenBondingInstructions, signers: tokenBondingSigners, } = yield this.tokenBondingSdk.createTokenBondingInstructions(Object.assign({ payer, curve: curve, reserveAuthority: authority, generalAuthority: authority, ignoreExternalReserveChanges: true, ignoreExternalSupplyChanges: true, targetMint, sellBaseRoyaltyPercentage: 0, sellTargetRoyaltyPercentage: 0, buyTargetRoyaltyPercentage: 0, baseMint, advanced: {
                    initialSupplyPad,
                    initialReservesPad,
                }, mintCap: (0, spl_token_bonding_1.toBN)(maxSupply, decimals), buyBaseRoyaltyPercentage: 0, buyBaseRoyaltiesOwner: exports.FEES_WALLET }, bondingArgs));
            return {
                output: {
                    tokenBonding,
                    targetMint: bondingTargetMint,
                },
                instructions: [instructions, tokenBondingInstructions],
                signers: [signers, tokenBondingSigners],
            };
        });
    }
    /**
     * Executes `createLiquidityBootstrapperIntructions`
     * @param args
     * @returns
     */
    createLiquidityBootstrapper(args, finality) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.tokenBondingSdk.executeBig(this.createLiquidityBootstrapperInstructions(args), args.payer, finality);
        });
    }
    /**
     * Sell `supplyAmount` supply of tokens of `supplyMint` by creating a system of two bonding curves:
     *
     *    Offer bonding curve - sells an intermediary token for the base token
     *    Retrieval bonding curve - allows burning the intermediary token for the set supply
     */
    createTokenBondingForSetSupplyInstructions(_a) {
        var { supplyAmount, reserveAuthority = this.provider.wallet.publicKey, supplyMint, source = this.provider.wallet.publicKey, fixedCurve = new web3_js_1.PublicKey(MarketplaceSdk.FIXED_CURVE) } = _a, args = __rest(_a, ["supplyAmount", "reserveAuthority", "supplyMint", "source", "fixedCurve"]);
        return __awaiter(this, void 0, void 0, function* () {
            const supplyMintAcc = yield (0, spl_utils_1.getMintInfo)(this.provider, supplyMint);
            const sourceAcct = yield this.provider.connection.getAccountInfo(source);
            // Source is a wallet, need to get the ATA
            if (!sourceAcct || sourceAcct.owner.equals(web3_js_1.SystemProgram.programId)) {
                const ataSource = yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, supplyMint, source, true);
                if (!(yield this.tokenBondingSdk.accountExists(ataSource))) {
                    throw new Error(`Source of ${source === null || source === void 0 ? void 0 : source.toBase58()} does not hold any ${supplyMint.toBase58()} tokens`);
                }
                source = ataSource;
            }
            const offeringInstrs = yield this.tokenBondingSdk.createTokenBondingInstructions(Object.assign(Object.assign({}, args), { targetMintDecimals: supplyMintAcc.decimals, reserveAuthority, mintCap: (0, spl_token_bonding_1.toBN)(supplyAmount, supplyMintAcc), ignoreExternalReserveChanges: true, ignoreExternalSupplyChanges: true }));
            const retrievalInstrs = yield this.fungibleEntanglerSdk.createFungibleEntanglerInstructions({
                authority: reserveAuthority,
                dynamicSeed: web3_js_1.Keypair.generate().publicKey.toBuffer(),
                amount: supplyAmount,
                parentMint: supplyMint,
                childMint: offeringInstrs.output.targetMint,
            });
            return {
                instructions: [offeringInstrs.instructions, retrievalInstrs.instructions],
                signers: [offeringInstrs.signers, retrievalInstrs.signers],
                output: {
                    offer: offeringInstrs.output,
                    retrieval: retrievalInstrs.output,
                },
            };
        });
    }
    /**
     * Executes `createTokenBondingForSetSupplyInstructions`
     * @param args
     * @returns
     */
    createTokenBondingForSetSupply(args, finality) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.tokenBondingSdk.executeBig(this.createTokenBondingForSetSupplyInstructions(args), args.payer, finality);
        });
    }
}
exports.MarketplaceSdk = MarketplaceSdk;
MarketplaceSdk.FIXED_CURVE = "fixmyQQ8cCVFh8Pp5LwZg4N3rXkym7sUXmGehxHqTAS";
//# sourceMappingURL=index.js.map