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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SplTokenCollective = void 0;
//@ts-nocheck
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
const anchor = __importStar(require("@project-serum/anchor"));
const spl_name_service_1 = require("@solana/spl-name-service");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const spl_token_bonding_1 = require("@strata-foundation/spl-token-bonding");
const spl_utils_1 = require("@strata-foundation/spl-utils");
const borsh_1 = require("borsh");
__exportStar(require("./generated/spl-token-collective"), exports);
(0, spl_utils_1.extendBorsh)();
function undefinedToNull(obj) {
    if (typeof obj === "undefined") {
        return null;
    }
    return obj;
}
function toIdlTokenMetadataSettings(settings) {
    return {
        symbol: undefinedToNull(settings === null || settings === void 0 ? void 0 : settings.symbol),
        uri: undefinedToNull(settings === null || settings === void 0 ? void 0 : settings.uri),
        nameIsNameServiceName: !!(settings === null || settings === void 0 ? void 0 : settings.nameIsNameServiceName),
    };
}
function toIdlRoyaltySettings(settings) {
    return {
        ownedByName: !!(settings === null || settings === void 0 ? void 0 : settings.ownedByName),
        address: undefinedToNull(settings === null || settings === void 0 ? void 0 : settings.address),
    };
}
function toIdlTokenBondingSettings(settings) {
    return {
        curve: undefinedToNull(settings === null || settings === void 0 ? void 0 : settings.curve),
        minSellBaseRoyaltyPercentage: undefinedToNull((0, spl_utils_1.percent)(settings === null || settings === void 0 ? void 0 : settings.minSellBaseRoyaltyPercentage)),
        minSellTargetRoyaltyPercentage: undefinedToNull((0, spl_utils_1.percent)(settings === null || settings === void 0 ? void 0 : settings.minSellTargetRoyaltyPercentage)),
        maxSellBaseRoyaltyPercentage: undefinedToNull((0, spl_utils_1.percent)(settings === null || settings === void 0 ? void 0 : settings.maxSellBaseRoyaltyPercentage)),
        maxSellTargetRoyaltyPercentage: undefinedToNull((0, spl_utils_1.percent)(settings === null || settings === void 0 ? void 0 : settings.maxSellTargetRoyaltyPercentage)),
        minBuyBaseRoyaltyPercentage: undefinedToNull((0, spl_utils_1.percent)(settings === null || settings === void 0 ? void 0 : settings.minBuyBaseRoyaltyPercentage)),
        minBuyTargetRoyaltyPercentage: undefinedToNull((0, spl_utils_1.percent)(settings === null || settings === void 0 ? void 0 : settings.minBuyTargetRoyaltyPercentage)),
        maxBuyBaseRoyaltyPercentage: undefinedToNull((0, spl_utils_1.percent)(settings === null || settings === void 0 ? void 0 : settings.maxBuyBaseRoyaltyPercentage)),
        maxBuyTargetRoyaltyPercentage: undefinedToNull((0, spl_utils_1.percent)(settings === null || settings === void 0 ? void 0 : settings.maxBuyTargetRoyaltyPercentage)),
        targetMintDecimals: undefinedToNull(settings === null || settings === void 0 ? void 0 : settings.targetMintDecimals),
        // @ts-ignore
        buyBaseRoyalties: toIdlRoyaltySettings(settings === null || settings === void 0 ? void 0 : settings.buyBaseRoyalties),
        // @ts-ignore
        sellBaseRoyalties: toIdlRoyaltySettings(settings === null || settings === void 0 ? void 0 : settings.sellBaseRoyalties),
        // @ts-ignore
        buyTargetRoyalties: toIdlRoyaltySettings(settings === null || settings === void 0 ? void 0 : settings.buyTargetRoyalties),
        // @ts-ignore
        sellTargetRoyalties: toIdlRoyaltySettings(settings === null || settings === void 0 ? void 0 : settings.sellTargetRoyalties),
        minPurchaseCap: undefinedToNull(settings === null || settings === void 0 ? void 0 : settings.minPurchaseCap),
        maxPurchaseCap: undefinedToNull(settings === null || settings === void 0 ? void 0 : settings.maxPurchaseCap),
        minMintCap: undefinedToNull(settings === null || settings === void 0 ? void 0 : settings.minMintCap),
        maxMintCap: undefinedToNull(settings === null || settings === void 0 ? void 0 : settings.maxMintCap),
    };
}
function toIdlConfig(config) {
    return {
        isOpen: config.isOpen,
        // @ts-ignore
        unclaimedTokenBondingSettings: toIdlTokenBondingSettings(config.unclaimedTokenBondingSettings),
        // @ts-ignore
        claimedTokenBondingSettings: toIdlTokenBondingSettings(config.claimedTokenBondingSettings),
        // @ts-ignore
        unclaimedTokenMetadataSettings: toIdlTokenMetadataSettings(config.unclaimedTokenMetadataSettings),
    };
}
function definedOr(value, def) {
    if (typeof value == "undefined") {
        return def;
    }
    return value;
}
class SplTokenCollective extends spl_utils_1.AnchorSdk {
    constructor(opts) {
        super(opts);
        /**
         * Account decoder to a unified TokenRef interface
         *
         * @param pubkey
         * @param account
         * @returns
         */
        this.tokenRefDecoder = (pubkey, account) => {
            const coded = this.program.coder.accounts.decode("TokenRefV0", account.data);
            return Object.assign(Object.assign({}, coded), { publicKey: pubkey });
        };
        /**
         * Account decoder to a unified Collective interface
         *
         * @param pubkey
         * @param account
         * @returns
         */
        this.collectiveDecoder = (pubkey, account) => {
            const coded = this.program.coder.accounts.decode("CollectiveV0", account.data);
            return Object.assign(Object.assign({}, coded), { publicKey: pubkey });
        };
        this.splTokenBondingProgram = opts.splTokenBondingProgram;
        this.splTokenMetadata = opts.splTokenMetadata;
    }
    static init(provider, splCollectiveProgramId = SplTokenCollective.ID, splTokenBondingProgramId = spl_token_bonding_1.SplTokenBonding.ID) {
        return __awaiter(this, void 0, void 0, function* () {
            const SplCollectiveIDLJson = yield anchor.Program.fetchIdl(splCollectiveProgramId, provider);
            // @ts-ignore
            const splCollective = new anchor.Program(SplCollectiveIDLJson, splCollectiveProgramId, provider);
            const splTokenBondingProgram = yield spl_token_bonding_1.SplTokenBonding.init(provider, splTokenBondingProgramId);
            const splTokenMetadata = yield spl_utils_1.SplTokenMetadata.init(provider);
            return new this({
                provider,
                program: splCollective,
                splTokenBondingProgram,
                splTokenMetadata,
            });
        });
    }
    getCollective(collectiveKey) {
        return this.getAccount(collectiveKey, this.collectiveDecoder);
    }
    getTokenRef(ownerTokenRefKey) {
        return this.getAccount(ownerTokenRefKey, this.tokenRefDecoder);
    }
    /**
     * Instructions to create a Collective
     *
     * @param param0
     * @returns
     */
    createCollectiveInstructions({ payer = this.wallet.publicKey, mint, authority, mintAuthority, config, bonding, metadata, tokenRef, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const instructions = [];
            const signers = [];
            let metadataAdded = false;
            const addMetadata = () => __awaiter(this, void 0, void 0, function* () {
                if (metadata && !metadataAdded) {
                    const { instructions: metadataInstructions, signers: metadataSigners } = yield this.splTokenMetadata.createMetadataInstructions({
                        mint: mint,
                        authority: mintAuthority,
                        data: new mpl_token_metadata_1.DataV2({
                            name: metadata.name,
                            symbol: metadata.symbol,
                            uri: metadata.uri,
                            creators: null,
                            sellerFeeBasisPoints: 0,
                            collection: null,
                            uses: null,
                        }),
                    });
                    instructions.push(...metadataInstructions);
                    signers.push(...metadataSigners);
                }
                metadataAdded = true;
            });
            if (!mint) {
                const targetMintKeypair = (bonding === null || bonding === void 0 ? void 0 : bonding.targetMintKeypair) || anchor.web3.Keypair.generate();
                signers.push(targetMintKeypair);
                mint = targetMintKeypair.publicKey;
                instructions.push(...(yield (0, spl_utils_1.createMintInstructions)(this.provider, payer, mint, (bonding === null || bonding === void 0 ? void 0 : bonding.targetMintDecimals) || 9)));
                mintAuthority = payer;
                yield addMetadata();
            }
            if (!mintAuthority) {
                const mintAcct = yield this.provider.connection.getAccountInfo(mint);
                const data = Buffer.from(mintAcct.data);
                const mintInfo = spl_token_1.MintLayout.decode(data);
                if (mintInfo.mintAuthorityOption === 0) {
                    throw new Error("Must have mint authority to create a collective");
                }
                else {
                    mintAuthority = new web3_js_1.PublicKey(mintInfo.mintAuthority);
                }
                yield addMetadata();
            }
            const [collective, collectiveBump] = yield SplTokenCollective.collectiveKey(mint);
            if (yield this.provider.connection.getAccountInfo(collective)) {
                throw new Error("Collective already exists");
            }
            const [mintTokenRef] = yield SplTokenCollective.mintTokenRefKey(mint);
            const tokenRefExists = !!(yield this.provider.connection.getAccountInfo(mintTokenRef));
            if (tokenRef || tokenRefExists) {
                instructions.push(yield this.instruction.initializeCollectiveForSocialTokenV0(
                // @ts-ignore
                {
                    authority: authority ? authority : null,
                    config: toIdlConfig(config),
                }, {
                    accounts: {
                        collective,
                        mint: mint,
                        tokenRef: tokenRef ? tokenRef : mintTokenRef,
                        payer,
                        systemProgram: web3_js_1.SystemProgram.programId,
                        rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                    },
                }));
            }
            else {
                instructions.push(yield this.instruction.initializeCollectiveV0(
                // @ts-ignore
                {
                    authority: authority ? authority : null,
                    bumpSeed: collectiveBump,
                    config: toIdlConfig(config),
                }, {
                    accounts: {
                        collective,
                        mint: mint,
                        mintAuthority: mintAuthority,
                        payer,
                        systemProgram: web3_js_1.SystemProgram.programId,
                        rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                    },
                }));
            }
            const instructions2 = [];
            const signers2 = [];
            let tokenBonding;
            if (bonding) {
                tokenBonding = (yield spl_token_bonding_1.SplTokenBonding.tokenBondingKey(mint, bonding.index || 0))[0];
                // Set back to token bonding's authority
                instructions2.push(spl_token_1.Token.createSetAuthorityInstruction(spl_token_1.TOKEN_PROGRAM_ID, mint, tokenBonding, "MintTokens", mintAuthority, []));
                mintAuthority = tokenBonding;
                var { instructions: tokenBondingInstructions, signers: tokenBondingSigners, output: { tokenBonding: outputTokenBonding }, } = yield this.splTokenBondingProgram.createTokenBondingInstructions(Object.assign(Object.assign({}, bonding), { targetMint: mint }));
                tokenBonding = outputTokenBonding;
                instructions2.push(...tokenBondingInstructions);
                signers2.push(...tokenBondingSigners);
            }
            return {
                output: { collective, tokenBonding },
                instructions: [instructions, instructions2],
                signers: [signers, signers2],
            };
        });
    }
    /**
     * Run {@link createCollectiveInstructions}
     * @param args
     * @returns
     */
    createCollective(args, commitment = "confirmed") {
        return this.executeBig(this.createCollectiveInstructions(args), args.payer, commitment);
    }
    /**
     * Instructions to claim a social token
     *
     * @param param0
     * @returns
     */
    claimSocialTokenInstructions({ payer = this.wallet.publicKey, owner = this.wallet.publicKey, tokenRef, tokenName, symbol, buyBaseRoyalties, buyTargetRoyalties, sellBaseRoyalties, sellTargetRoyalties, ignoreMissingName, isPrimary = true, authority = this.wallet.publicKey, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenRefAcct = (yield this.getTokenRef(tokenRef));
            if (!tokenRefAcct.tokenBonding) {
                throw new Error("Claiming token ref without token bonding not yet supported");
            }
            const tokenBondingAcct = (yield this.splTokenBondingProgram.getTokenBonding(tokenRefAcct.tokenBonding));
            const ownerTokenRef = (yield SplTokenCollective.ownerTokenRefKey({
                mint: tokenBondingAcct.baseMint,
                name: tokenRefAcct.name,
            }))[0];
            const name = tokenRefAcct.name;
            const instructions0 = [];
            if (!ignoreMissingName &&
                !(yield this.splTokenBondingProgram.accountExists(name))) {
                throw new Error("Name account does not exist");
            }
            const defaultBaseRoyalties = yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, tokenBondingAcct.baseMint, owner, true);
            const defaultTargetRoyalties = yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, tokenBondingAcct.targetMint, owner, true);
            if ((!buyTargetRoyalties || !sellTargetRoyalties) &&
                !(yield this.splTokenBondingProgram.accountExists(defaultTargetRoyalties))) {
                console.log(`Creating target royalties ${defaultTargetRoyalties}...`);
                instructions0.push(spl_token_1.Token.createAssociatedTokenAccountInstruction(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, tokenBondingAcct.targetMint, defaultTargetRoyalties, owner, payer));
            }
            if ((!buyBaseRoyalties || !sellBaseRoyalties) &&
                !(yield this.splTokenBondingProgram.accountExists(defaultBaseRoyalties))) {
                console.log(`Creating base royalties ${defaultBaseRoyalties}...`);
                instructions0.push(spl_token_1.Token.createAssociatedTokenAccountInstruction(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, tokenBondingAcct.baseMint, defaultBaseRoyalties, owner, payer));
            }
            if (!buyBaseRoyalties) {
                buyBaseRoyalties = defaultBaseRoyalties;
            }
            if (!sellBaseRoyalties) {
                sellBaseRoyalties = defaultBaseRoyalties;
            }
            if (!buyTargetRoyalties) {
                buyTargetRoyalties = defaultTargetRoyalties;
            }
            if (!sellTargetRoyalties) {
                sellTargetRoyalties = defaultTargetRoyalties;
            }
            const [mintTokenRef] = yield SplTokenCollective.mintTokenRefKey(tokenBondingAcct.targetMint);
            const [newTokenRef] = yield web3_js_1.PublicKey.findProgramAddress(SplTokenCollective.ownerTokenRefSeeds({
                mint: tokenBondingAcct.baseMint,
                owner,
            }), this.programId);
            const instructions1 = [];
            instructions1.push(yield this.instruction.claimSocialTokenV0({
                isPrimary,
                authority,
            }, {
                accounts: {
                    payer,
                    collective: tokenRefAcct.collective || web3_js_1.PublicKey.default,
                    ownerTokenRef,
                    newTokenRef,
                    mintTokenRef,
                    tokenBonding: tokenRefAcct.tokenBonding,
                    tokenMetadata: tokenRefAcct.tokenMetadata,
                    name,
                    owner,
                    baseMint: tokenBondingAcct.baseMint,
                    targetMint: tokenBondingAcct.targetMint,
                    buyBaseRoyalties: tokenBondingAcct.buyBaseRoyalties,
                    buyTargetRoyalties: tokenBondingAcct.buyTargetRoyalties,
                    sellBaseRoyalties: tokenBondingAcct.sellBaseRoyalties,
                    sellTargetRoyalties: tokenBondingAcct.sellTargetRoyalties,
                    newBuyBaseRoyalties: buyBaseRoyalties,
                    newBuyTargetRoyalties: buyTargetRoyalties,
                    newSellBaseRoyalties: sellBaseRoyalties,
                    newSellTargetRoyalties: sellTargetRoyalties,
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                    tokenBondingProgram: this.splTokenBondingProgram.programId,
                    tokenMetadataProgram: mpl_token_metadata_1.MetadataProgram.PUBKEY,
                    systemProgram: web3_js_1.SystemProgram.programId,
                    rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                },
            }));
            if (symbol) {
                const tokenMetadataRaw = yield this.provider.connection.getAccountInfo(tokenRefAcct.tokenMetadata);
                const tokenMetadata = new mpl_token_metadata_1.Metadata(tokenRefAcct.tokenMetadata, tokenMetadataRaw).data;
                const { instructions: updateInstructions } = yield this.splTokenMetadata.updateMetadataInstructions({
                    data: new mpl_token_metadata_1.DataV2({
                        name: tokenName || tokenMetadata.data.name,
                        symbol: symbol || tokenMetadata.data.symbol,
                        uri: tokenMetadata.data.uri,
                        sellerFeeBasisPoints: 0,
                        creators: null,
                        collection: null,
                        uses: null,
                    }),
                    newAuthority: owner,
                    updateAuthority: owner,
                    metadata: tokenRefAcct.tokenMetadata,
                });
                instructions1.push(...updateInstructions);
            }
            const instructions2 = [];
            if (isPrimary) {
                const { instructions: setAsPrimaryInstrs } = yield this.setAsPrimaryInstructions({
                    tokenRef: mintTokenRef,
                    payer,
                    owner,
                });
                instructions2.push(...setAsPrimaryInstrs);
            }
            return {
                signers: [[], [], []],
                instructions: [instructions0, instructions1, instructions2],
                output: null,
            };
        });
    }
    /**
     * Run {@link claimSocialTokenInstructions}
     * @param args
     */
    claimSocialToken(args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.executeBig(this.claimSocialTokenInstructions(args));
        });
    }
    /**
     * Get the seeds for the PDA of a token ref given the various parameters.
     *
     * @param param0
     * @returns
     */
    static ownerTokenRefSeeds({ owner, name, mint, isPrimary, }) {
        const str = Buffer.from("owner-token-ref", "utf-8");
        if ((isPrimary || !mint) && !name) {
            if (!owner) {
                throw new Error("Owner is required for a primary token refs");
            }
            return [str, owner.toBuffer()];
        }
        else {
            if (!mint) {
                throw new Error("Mint is required for non-primary token refs");
            }
            return [str, (name || owner).toBuffer(), mint.toBuffer()];
        }
    }
    static collectiveKey(mint, programId = SplTokenCollective.ID) {
        return web3_js_1.PublicKey.findProgramAddress([Buffer.from("collective", "utf-8"), mint.toBuffer()], programId);
    }
    static ownerTokenRefKey(args, programId = SplTokenCollective.ID) {
        return __awaiter(this, void 0, void 0, function* () {
            return web3_js_1.PublicKey.findProgramAddress(this.ownerTokenRefSeeds(args), programId);
        });
    }
    static mintTokenRefKey(mint, programId = SplTokenCollective.ID) {
        return __awaiter(this, void 0, void 0, function* () {
            return web3_js_1.PublicKey.findProgramAddress([Buffer.from("mint-token-ref", "utf-8"), mint.toBuffer()], programId);
        });
    }
    /**
     * Get instructions to set this ownerTokenRef as our primary token ref (lookups to "owner-token-ref", owner pda find this ownerTokenRef)
     *
     * @param param0
     * @returns
     */
    setAsPrimaryInstructions({ payer = this.wallet.publicKey, tokenRef, owner, }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!owner) {
                // @ts-ignore
                owner = (yield this.getTokenRef(tokenRef)).owner;
            }
            const [primaryTokenRef, bumpSeed] = yield SplTokenCollective.ownerTokenRefKey({
                isPrimary: true,
                owner,
            });
            return {
                signers: [],
                instructions: [
                    yield this.instruction.setAsPrimaryV0({
                        bumpSeed,
                    }, {
                        accounts: {
                            payer,
                            owner: owner,
                            tokenRef,
                            primaryTokenRef,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                        },
                    }),
                ],
                output: {
                    primaryTokenRef,
                },
            };
        });
    }
    /**
     * Run {@link setAsPrimaryInstructions}
     * @param args
     */
    setAsPrimary(args) {
        return this.execute(this.setAsPrimaryInstructions(args));
    }
    /**
     * Get instructions to update this collective
     *
     * @param param0
     * @returns
     */
    updateCollectiveInstructions({ collective, authority, config, }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof authority == "undefined") {
                // @ts-ignore
                authority = (yield this.getCollective(collective)).authority;
            }
            return {
                signers: [],
                instructions: [
                    yield this.instruction.updateCollectiveV0(
                    // @ts-ignore
                    {
                        config: toIdlConfig(config),
                        authority,
                    }, {
                        accounts: {
                            collective,
                            authority,
                        },
                    }),
                ],
                output: null,
            };
        });
    }
    /**
     * Run {@link updateCollectiveInstructions}
     * @param args
     */
    updateCollective(args) {
        return this.execute(this.updateCollectiveInstructions(args));
    }
    /**
     * Instructions to create everything around a social token... metadata, bonding curves, etc.
     *
     * @param param0
     * @returns
     */
    createSocialTokenInstructions({ ignoreIfExists = false, payer = this.wallet.publicKey, collective, mint, name, owner, targetMintKeypair = anchor.web3.Keypair.generate(), metadata, nameClass, nameParent, tokenBondingParams, isPrimary = name ? false : true, authority, }) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        return __awaiter(this, void 0, void 0, function* () {
            let metadataUri = metadata === null || metadata === void 0 ? void 0 : metadata.uri;
            if (!owner && !name) {
                owner = this.wallet.publicKey;
            }
            if (!authority && !name) {
                authority = this.wallet.publicKey;
            }
            const curve = tokenBondingParams.curve;
            const programId = this.programId;
            const provider = this.provider;
            const instructions1 = [];
            const signers1 = [];
            if (!mint && !collective) {
                mint = SplTokenCollective.OPEN_COLLECTIVE_MINT_ID;
            }
            const state = (yield this.splTokenBondingProgram.getState());
            const isNative = (mint === null || mint === void 0 ? void 0 : mint.equals(spl_token_1.NATIVE_MINT)) || (mint === null || mint === void 0 ? void 0 : mint.equals(state.wrappedSolMint));
            if (isNative) {
                mint = state.wrappedSolMint;
            }
            let collectiveBumpSeed = 0;
            if (!collective) {
                [collective, collectiveBumpSeed] = yield SplTokenCollective.collectiveKey(mint);
            }
            const collectiveAcct = yield this.getCollective(collective);
            if (collectiveAcct) {
                collectiveBumpSeed = collectiveAcct.bumpSeed;
            }
            const config = collectiveAcct === null || collectiveAcct === void 0 ? void 0 : collectiveAcct.config;
            if (!mint) {
                if (!collectiveAcct) {
                    throw new Error("Must either provide a collective or a mint");
                }
                mint = collectiveAcct.mint;
            }
            // Token refs
            const [ownerTokenRef, ownerTokenRefBumpSeed] = yield web3_js_1.PublicKey.findProgramAddress(SplTokenCollective.ownerTokenRefSeeds({ mint, owner, name }), programId);
            // create mint with payer as auth
            console.log(`Creating social token mint ${targetMintKeypair.publicKey.toBase58()}`);
            signers1.push(targetMintKeypair);
            const targetMint = targetMintKeypair.publicKey;
            instructions1.push(...(yield (0, spl_utils_1.createMintInstructions)(provider, payer, targetMint, tokenBondingParams.targetMintDecimals ||
                (
                // @ts-ignore
                (_a = config === null || config === void 0 ? void 0 : config.unclaimedTokenBondingSettings) === null || _a === void 0 ? void 0 : _a.targetMintDecimals) ||
                9)));
            const [mintTokenRef, mintTokenRefBumpSeed] = yield SplTokenCollective.mintTokenRefKey(targetMint);
            console.log("ownerTokenRef", ownerTokenRef.toBase58());
            console.log("reverse", mintTokenRef.toBase58());
            const existing = yield this.getTokenRef(ownerTokenRef);
            if (existing) {
                if (ignoreIfExists) {
                    return {
                        instructions: [],
                        signers: [],
                        output: {
                            mint: existing.mint,
                            ownerTokenRef,
                            mintTokenRef,
                            tokenBonding: existing.tokenBonding,
                        },
                    };
                }
                throw new Error("Social token already exists for this wallet or name");
            }
            // create metadata with payer as temporary authority
            console.log("Creating social token metadata...");
            // @ts-ignore
            let uri = metadataUri || ((_b = config === null || config === void 0 ? void 0 : config.unclaimedTokenMetadataSettings) === null || _b === void 0 ? void 0 : _b.uri);
            if (!uri) {
                throw new Error("Must pass metadata.uri or it must be defined on the collective config");
            }
            const tokenBonding = (yield spl_token_bonding_1.SplTokenBonding.tokenBondingKey(targetMint, 0))[0];
            const { instructions: metadataInstructions, signers: metadataSigners, output: { metadata: tokenMetadata }, } = yield this.splTokenMetadata.createMetadataInstructions({
                mint: targetMint,
                authority: owner ? owner : mintTokenRef,
                data: new mpl_token_metadata_1.DataV2(Object.assign({ uri, collection: null, uses: null, creators: null, sellerFeeBasisPoints: 0 }, metadata)),
            });
            instructions1.push(...metadataInstructions);
            signers1.push(...metadataSigners);
            instructions1.push(spl_token_1.Token.createSetAuthorityInstruction(spl_token_1.TOKEN_PROGRAM_ID, targetMint, tokenBonding, "MintTokens", payer, []));
            // Create token bonding
            const instructions2 = [];
            const tokenBondingSettings = owner
                ? config === null || config === void 0 ? void 0 : config.claimedTokenBondingSettings
                : config === null || config === void 0 ? void 0 : config.unclaimedTokenBondingSettings;
            const signers2 = [];
            const curveToUse = (curve ||
                (!owner &&
                    (
                    // @ts-ignore
                    (_d = (_c = collectiveAcct === null || collectiveAcct === void 0 ? void 0 : collectiveAcct.config) === null || _c === void 0 ? void 0 : _c.unclaimedTokenBondingSettings) === null || _d === void 0 ? void 0 : _d.curve)) ||
                // @ts-ignore
                (owner && ((_f = (_e = collectiveAcct === null || collectiveAcct === void 0 ? void 0 : collectiveAcct.config) === null || _e === void 0 ? void 0 : _e.claimedTokenBondingSettings) === null || _f === void 0 ? void 0 : _f.curve)) ||
                (
                // @ts-ignore
                (_h = (_g = collectiveAcct === null || collectiveAcct === void 0 ? void 0 : collectiveAcct.config) === null || _g === void 0 ? void 0 : _g.unclaimedTokenBondingSettings) === null || _h === void 0 ? void 0 : _h.curve) ||
                (
                // @ts-ignore
                (_k = (_j = collectiveAcct === null || collectiveAcct === void 0 ? void 0 : collectiveAcct.config) === null || _j === void 0 ? void 0 : _j.claimedTokenBondingSettings) === null || _k === void 0 ? void 0 : _k.curve));
            if (!curveToUse) {
                throw new Error("No curve provided");
            }
            const { instructions: bondingInstructions, signers: bondingSigners, output: { buyBaseRoyalties, buyTargetRoyalties, sellBaseRoyalties, sellTargetRoyalties, baseMint, }, } = yield this.splTokenBondingProgram.createTokenBondingInstructions(Object.assign({ payer, index: 0, 
                // @ts-ignore
                curve: curveToUse, baseMint: mint, targetMint, generalAuthority: mintTokenRef, reserveAuthority: mintTokenRef, curveAuthority: mintTokenRef, 
                // @ts-ignore
                buyBaseRoyaltiesOwner: (tokenBondingSettings === null || tokenBondingSettings === void 0 ? void 0 : tokenBondingSettings.buyBaseRoyalties.ownedByName)
                    ? mintTokenRef
                    : undefined, 
                // @ts-ignore
                sellBaseRoyaltiesOwner: (tokenBondingSettings === null || tokenBondingSettings === void 0 ? void 0 : tokenBondingSettings.sellBaseRoyalties.ownedByName)
                    ? mintTokenRef
                    : undefined, 
                // @ts-ignore
                buyTargetRoyaltiesOwner: (tokenBondingSettings === null || tokenBondingSettings === void 0 ? void 0 : tokenBondingSettings.buyTargetRoyalties.ownedByName)
                    ? mintTokenRef
                    : undefined, 
                // @ts-ignore
                sellTargetRoyaltiesOwner: (tokenBondingSettings === null || tokenBondingSettings === void 0 ? void 0 : tokenBondingSettings.sellTargetRoyalties.ownedByName)
                    ? mintTokenRef
                    : undefined, buyBaseRoyalties: 
                // @ts-ignore
                ((_l = tokenBondingSettings === null || tokenBondingSettings === void 0 ? void 0 : tokenBondingSettings.buyBaseRoyalties) === null || _l === void 0 ? void 0 : _l.address) || undefined, sellBaseRoyalties: 
                // @ts-ignore
                ((_m = tokenBondingSettings === null || tokenBondingSettings === void 0 ? void 0 : tokenBondingSettings.sellBaseRoyalties) === null || _m === void 0 ? void 0 : _m.address) || undefined, buyTargetRoyalties: 
                // @ts-ignore
                ((_o = tokenBondingSettings === null || tokenBondingSettings === void 0 ? void 0 : tokenBondingSettings.buyTargetRoyalties) === null || _o === void 0 ? void 0 : _o.address) || undefined, sellTargetRoyalties: 
                // @ts-ignore
                ((_p = tokenBondingSettings === null || tokenBondingSettings === void 0 ? void 0 : tokenBondingSettings.sellTargetRoyalties) === null || _p === void 0 ? void 0 : _p.address) || undefined }, tokenBondingParams));
            instructions2.push(...bondingInstructions);
            signers2.push(...bondingSigners);
            const initializeArgs = {
                authority: (collectiveAcct === null || collectiveAcct === void 0 ? void 0 : collectiveAcct.authority) ||
                    web3_js_1.PublicKey.default,
                collective,
                tokenMetadata: new web3_js_1.PublicKey(tokenMetadata),
                tokenBonding,
                payer,
                baseMint,
                targetMint,
                buyBaseRoyalties,
                buyTargetRoyalties,
                sellBaseRoyalties,
                sellTargetRoyalties,
                systemProgram: web3_js_1.SystemProgram.programId,
                rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
            };
            const args = {
                authority: authority || null,
                nameClass: nameClass || null,
                nameParent: nameParent || null,
                collectiveBumpSeed,
                ownerTokenRefBumpSeed,
                mintTokenRefBumpSeed,
            };
            console.log(args);
            const instructions3 = [];
            const signers3 = [];
            if (owner) {
                instructions3.push(yield this.instruction.initializeOwnedSocialTokenV0(args, {
                    accounts: {
                        initializeArgs,
                        owner,
                        payer,
                        ownerTokenRef,
                        mintTokenRef,
                        systemProgram: web3_js_1.SystemProgram.programId,
                        rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                    },
                }));
                if (isPrimary) {
                    const { instructions: setAsPrimaryInstrs } = yield this.setAsPrimaryInstructions({
                        tokenRef: ownerTokenRef,
                        payer,
                        owner,
                    });
                    instructions3.push(...setAsPrimaryInstrs);
                }
            }
            else {
                instructions3.push(yield this.instruction.initializeUnclaimedSocialTokenV0(args, {
                    accounts: {
                        initializeArgs,
                        name: name,
                        payer,
                        ownerTokenRef,
                        mintTokenRef,
                        tokenMetadata,
                        systemProgram: web3_js_1.SystemProgram.programId,
                        rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                    },
                }));
            }
            return {
                output: {
                    mint: targetMintKeypair.publicKey,
                    ownerTokenRef,
                    mintTokenRef,
                    tokenBonding,
                },
                instructions: [instructions1, instructions2, instructions3],
                signers: [signers1, signers2, signers3],
            };
        });
    }
    /**
     * Run {@link createSocialTokenInstructions}
     * @param args
     * @returns
     */
    createSocialToken(args, commitment = "confirmed") {
        return __awaiter(this, void 0, void 0, function* () {
            return this.executeBig(this.createSocialTokenInstructions(args), args.payer, commitment);
        });
    }
    getUserTokensWithMeta(tokenAccounts) {
        return Promise.all((tokenAccounts || []).map(({ pubkey, info }) => __awaiter(this, void 0, void 0, function* () {
            const metadataKey = yield mpl_token_metadata_1.Metadata.getPDA(info.mint);
            const [mintTokenRefKey] = yield SplTokenCollective.mintTokenRefKey(info.mint);
            const account = yield this.provider.connection.getAccountInfo(mintTokenRefKey);
            const ownerTokenRef = account && this.tokenRefDecoder(mintTokenRefKey, account);
            const tokenBondingKey = (yield spl_token_bonding_1.SplTokenBonding.tokenBondingKey(info.mint))[0];
            const tokenBondingAccount = yield this.provider.connection.getAccountInfo(tokenBondingKey);
            const tokenBonding = tokenBondingAccount &&
                this.splTokenBondingProgram.tokenBondingDecoder(tokenBondingKey, tokenBondingAccount);
            return Object.assign(Object.assign({}, (yield this.splTokenMetadata.getTokenMetadata(new web3_js_1.PublicKey(metadataKey)))), { tokenRef: ownerTokenRef || undefined, tokenBonding: tokenBonding || undefined, publicKey: pubkey, account: info });
        })));
    }
    /**
     * Claims the reserve and general authority from any bonding curve
     * that has this token ref as the authority. Useful for setting bonding curves
     * that can later be claimed by the social token holder.
     *
     * @param param0
     * @returns
     */
    claimBondingAuthorityInstructions({ tokenBonding, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenBondingAcct = (yield this.splTokenBondingProgram.getTokenBonding(tokenBonding));
            const [mintTokenRef] = yield SplTokenCollective.mintTokenRefKey(tokenBondingAcct.baseMint);
            return {
                output: null,
                signers: [],
                instructions: [
                    yield this.instruction.claimBondingAuthorityV0({
                        accounts: {
                            mintTokenRef,
                            tokenBondingUpdateAccounts: {
                                tokenBonding: tokenBonding,
                                baseMint: tokenBondingAcct.baseMint,
                                targetMint: tokenBondingAcct.targetMint,
                                buyBaseRoyalties: tokenBondingAcct.buyBaseRoyalties,
                                sellBaseRoyalties: tokenBondingAcct.sellBaseRoyalties,
                                buyTargetRoyalties: tokenBondingAcct.buyTargetRoyalties,
                                sellTargetRoyalties: tokenBondingAcct.sellTargetRoyalties,
                            },
                            tokenBondingProgram: this.splTokenBondingProgram.programId,
                        },
                    }),
                ],
            };
        });
    }
    /**
     * Runs {@link `claimBondingAuthorityInstructions`}
     *
     * @param args
     * @retruns
     */
    claimBondingAuthority(args, commitment = "confirmed") {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.execute(this.claimBondingAuthorityInstructions(args), this.wallet.publicKey, commitment);
        });
    }
    /**
     * Update a bonding cruve.
     *
     * @param args
     * @returns
     */
    updateTokenBondingInstructions({ tokenRef, buyBaseRoyaltyPercentage, buyTargetRoyaltyPercentage, sellBaseRoyaltyPercentage, sellTargetRoyaltyPercentage, buyBaseRoyalties, buyTargetRoyalties, sellBaseRoyalties, sellTargetRoyalties, buyFrozen, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenRefAcct = (yield this.getTokenRef(tokenRef));
            if (!tokenRefAcct.tokenBonding) {
                throw new Error("Cannot update token bonding on a token ref that has no token bonding");
            }
            if (!tokenRefAcct.authority) {
                throw new Error("No authority on this token. Cannot update token bonding.");
            }
            const collectiveAcct = tokenRefAcct.collective &&
                (yield this.getCollective(tokenRefAcct.collective));
            const tokenBondingAcct = (yield this.splTokenBondingProgram.getTokenBonding(tokenRefAcct.tokenBonding));
            if (!tokenBondingAcct.generalAuthority) {
                throw new Error("Cannot update a token bonding account that has no authority");
            }
            const [mintTokenRef] = yield SplTokenCollective.mintTokenRefKey(tokenBondingAcct.targetMint);
            const args = {
                tokenBondingAuthority: tokenBondingAcct.generalAuthority,
                buyBaseRoyaltyPercentage: definedOr((0, spl_utils_1.percent)(buyBaseRoyaltyPercentage), tokenBondingAcct.buyBaseRoyaltyPercentage),
                buyTargetRoyaltyPercentage: definedOr((0, spl_utils_1.percent)(buyTargetRoyaltyPercentage), tokenBondingAcct.buyTargetRoyaltyPercentage),
                sellBaseRoyaltyPercentage: definedOr((0, spl_utils_1.percent)(sellBaseRoyaltyPercentage), tokenBondingAcct.sellBaseRoyaltyPercentage),
                sellTargetRoyaltyPercentage: definedOr((0, spl_utils_1.percent)(sellTargetRoyaltyPercentage), tokenBondingAcct.sellTargetRoyaltyPercentage),
                buyFrozen: typeof buyFrozen === "undefined"
                    ? tokenBondingAcct.buyFrozen
                    : buyFrozen,
            };
            console.log({
                tokenRefAuthority: tokenRefAcct.authority,
                collective: tokenRefAcct.collective || web3_js_1.PublicKey.default,
                authority: (collectiveAcct &&
                    collectiveAcct.authority) ||
                    web3_js_1.PublicKey.default,
                mintTokenRef: mintTokenRef,
                tokenBonding: tokenRefAcct.tokenBonding,
                tokenBondingProgram: this.splTokenBondingProgram.programId,
                baseMint: tokenBondingAcct.baseMint,
                targetMint: tokenBondingAcct.targetMint,
                buyBaseRoyalties: buyBaseRoyalties || tokenBondingAcct.buyBaseRoyalties,
                buyTargetRoyalties: buyTargetRoyalties || tokenBondingAcct.buyTargetRoyalties,
                sellBaseRoyalties: sellBaseRoyalties || tokenBondingAcct.sellBaseRoyalties,
                sellTargetRoyalties: sellTargetRoyalties || tokenBondingAcct.sellTargetRoyalties,
            });
            return {
                output: null,
                signers: [],
                instructions: [
                    yield this.instruction.updateTokenBondingV0(args, {
                        accounts: {
                            tokenRefAuthority: tokenRefAcct.authority,
                            collective: tokenRefAcct.collective || web3_js_1.PublicKey.default,
                            authority: (collectiveAcct &&
                                collectiveAcct.authority) ||
                                web3_js_1.PublicKey.default,
                            mintTokenRef: mintTokenRef,
                            tokenBonding: tokenRefAcct.tokenBonding,
                            tokenBondingProgram: this.splTokenBondingProgram.programId,
                            baseMint: tokenBondingAcct.baseMint,
                            targetMint: tokenBondingAcct.targetMint,
                            buyBaseRoyalties: buyBaseRoyalties || tokenBondingAcct.buyBaseRoyalties,
                            buyTargetRoyalties: buyTargetRoyalties || tokenBondingAcct.buyTargetRoyalties,
                            sellBaseRoyalties: sellBaseRoyalties || tokenBondingAcct.sellBaseRoyalties,
                            sellTargetRoyalties: sellTargetRoyalties || tokenBondingAcct.sellTargetRoyalties,
                        },
                    }),
                ],
            };
        });
    }
    /**
     * Runs {@link `updateTokenBondingInstructions`}
     *
     * @param args
     * @retruns
     */
    updateTokenBonding(args, commitment = "confirmed") {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.execute(this.updateTokenBondingInstructions(args), this.wallet.publicKey, commitment);
        });
    }
    updateCurveInstructions({ tokenRef, curve, adminKey, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenRefAcct = (yield this.getTokenRef(tokenRef));
            if (!tokenRefAcct.tokenBonding) {
                throw new Error("Cannot update curve on a token ref that has no token bonding");
            }
            const collectiveAcct = tokenRefAcct.collective &&
                (yield this.getCollective(tokenRefAcct.collective));
            const tokenBondingAcct = (yield this.splTokenBondingProgram.getTokenBonding(tokenRefAcct.tokenBonding));
            if (!tokenBondingAcct.curveAuthority) {
                throw new Error("Cannot update curve for a token bonding account that has no curve authority");
            }
            const [mintTokenRef] = yield SplTokenCollective.mintTokenRefKey(tokenBondingAcct.targetMint);
            const auth = adminKey
                ? adminKey
                : (collectiveAcct &&
                    collectiveAcct.authority) ||
                    web3_js_1.PublicKey.default;
            const tokenRefAuth = adminKey
                ? adminKey
                : tokenRefAcct.authority;
            return {
                output: null,
                signers: [],
                instructions: [
                    yield this.instruction.updateCurveV0({
                        accounts: {
                            tokenRefAuthority: tokenRefAuth,
                            collective: tokenRefAcct.collective || web3_js_1.PublicKey.default,
                            authority: auth,
                            mintTokenRef: mintTokenRef,
                            tokenBonding: tokenRefAcct.tokenBonding,
                            tokenBondingProgram: this.splTokenBondingProgram.programId,
                            baseMint: tokenBondingAcct.baseMint,
                            targetMint: tokenBondingAcct.targetMint,
                            curve,
                        },
                    }),
                ],
            };
        });
    }
    /**
     * Runs {@link `updateCurveInstructions`}
     *
     * @param args
     * @retruns
     */
    updateCurve(args, commitment = "confirmed") {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.execute(this.updateCurveInstructions(args), this.wallet.publicKey, commitment);
        });
    }
    getOptionalNameRecord(name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!name || name.equals(web3_js_1.PublicKey.default)) {
                return null;
            }
            let nameAccountRaw = yield this.provider.connection.getAccountInfo(name);
            if (nameAccountRaw) {
                return (0, borsh_1.deserializeUnchecked)(spl_name_service_1.NameRegistryState.schema, spl_name_service_1.NameRegistryState, nameAccountRaw.data);
            }
            return null;
        });
    }
    /**
     * Opt out a social token
     *
     * @param args
     * @returns
     */
    optOutInstructions({ tokenRef, handle, nameClass, nameParent, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenRefAcct = (yield this.getTokenRef(tokenRef));
            if (!tokenRefAcct.tokenBonding) {
                throw new Error("Cannot currently opt out on a token ref that has no token bonding");
            }
            const nameAcct = yield this.getOptionalNameRecord(tokenRefAcct.name);
            if (!nameClass && nameAcct) {
                nameClass = nameAcct.class;
            }
            if (!nameParent && nameAcct) {
                nameParent = nameAcct.parentName;
            }
            let nameParentAcct = yield this.getOptionalNameRecord(nameParent);
            const tokenBondingAcct = (yield this.splTokenBondingProgram.getTokenBonding(tokenRefAcct.tokenBonding));
            const [mintTokenRef] = yield SplTokenCollective.mintTokenRefKey(tokenBondingAcct.targetMint);
            const [ownerTokenRef] = yield SplTokenCollective.ownerTokenRefKey({
                name: tokenRefAcct.name,
                owner: tokenRefAcct.isClaimed
                    ? tokenRefAcct.owner
                    : undefined,
                mint: tokenBondingAcct === null || tokenBondingAcct === void 0 ? void 0 : tokenBondingAcct.baseMint,
            });
            const instructions = [];
            if (!tokenRefAcct.isClaimed && !handle) {
                throw new Error("Handle must be provided for opting out of unclaimed tokens");
            }
            const tokenBondingUpdateAccounts = {
                tokenBonding: tokenRefAcct.tokenBonding,
                baseMint: tokenBondingAcct.baseMint,
                targetMint: tokenBondingAcct.targetMint,
                buyBaseRoyalties: tokenBondingAcct.buyBaseRoyalties,
                sellBaseRoyalties: tokenBondingAcct.sellBaseRoyalties,
                buyTargetRoyalties: tokenBondingAcct.buyTargetRoyalties,
                sellTargetRoyalties: tokenBondingAcct.sellTargetRoyalties,
            };
            if (tokenRefAcct.isClaimed) {
                const [primaryTokenRef] = yield SplTokenCollective.ownerTokenRefKey({
                    owner: tokenRefAcct.owner,
                    isPrimary: true,
                });
                instructions.push(yield this.instruction.changeOptStatusClaimedV0({
                    isOptedOut: true,
                }, {
                    accounts: {
                        primaryTokenRef,
                        ownerTokenRef,
                        mintTokenRef,
                        owner: tokenRefAcct.owner,
                        tokenBondingUpdateAccounts,
                        tokenBondingProgram: this.splTokenBondingProgram.programId,
                    },
                }));
            }
            else {
                instructions.push(yield this.instruction.changeOptStatusUnclaimedV0({
                    hashedName: yield (0, spl_name_service_1.getHashedName)(handle),
                    isOptedOut: true,
                }, {
                    accounts: {
                        ownerTokenRef,
                        mintTokenRef,
                        name: tokenRefAcct.name,
                        tokenBondingUpdateAccounts,
                        tokenBondingProgram: this.splTokenBondingProgram.programId,
                    },
                    remainingAccounts: [
                        {
                            pubkey: nameClass || web3_js_1.PublicKey.default,
                            isWritable: false,
                            isSigner: !!nameClass && !nameClass.equals(web3_js_1.PublicKey.default),
                        },
                        {
                            pubkey: nameParent || web3_js_1.PublicKey.default,
                            isWritable: false,
                            isSigner: false,
                        },
                        {
                            pubkey: (nameParentAcct === null || nameParentAcct === void 0 ? void 0 : nameParentAcct.owner) || web3_js_1.PublicKey.default,
                            isWritable: false,
                            isSigner: !!nameParent && !nameParent.equals(web3_js_1.PublicKey.default),
                        },
                    ],
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
     * Runs {@link `optOutInstructions`}
     *
     * @param args
     * @retruns
     */
    optOut(args, commitment = "confirmed") {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.execute(this.optOutInstructions(args), args.payer, commitment);
        });
    }
    /**
     * Update the owner wallet of a social token
     *
     * @param args
     * @returns
     */
    updateOwnerInstructions({ payer = this.wallet.publicKey, tokenRef, newOwner, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenRefAcct = (yield this.getTokenRef(tokenRef));
            if (!tokenRefAcct.tokenBonding) {
                throw new Error("Cannot update a token ref that has no token bonding");
            }
            if (!tokenRefAcct.isClaimed) {
                throw new Error("Cannot update owner on an unclaimed token ref");
            }
            const tokenBondingAcct = (yield this.splTokenBondingProgram.getTokenBonding(tokenRefAcct.tokenBonding));
            const [mintTokenRef] = yield SplTokenCollective.mintTokenRefKey(tokenBondingAcct.targetMint);
            const [oldOwnerTokenRef] = yield SplTokenCollective.ownerTokenRefKey({
                owner: tokenRefAcct.owner,
                mint: tokenBondingAcct === null || tokenBondingAcct === void 0 ? void 0 : tokenBondingAcct.baseMint,
            });
            const [newOwnerTokenRef, ownerTokenRefBumpSeed] = yield SplTokenCollective.ownerTokenRefKey({
                owner: newOwner,
                mint: tokenBondingAcct === null || tokenBondingAcct === void 0 ? void 0 : tokenBondingAcct.baseMint,
            });
            const [oldPrimaryTokenRef] = yield SplTokenCollective.ownerTokenRefKey({
                owner: tokenRefAcct.owner,
                isPrimary: true,
            });
            const [newPrimaryTokenRef, primaryTokenRefBumpSeed] = yield SplTokenCollective.ownerTokenRefKey({
                owner: newOwner,
                isPrimary: true,
            });
            return {
                output: {
                    ownerTokenRef: newOwnerTokenRef,
                },
                signers: [],
                instructions: [
                    yield this.instruction.updateOwnerV0({
                        ownerTokenRefBumpSeed,
                        primaryTokenRefBumpSeed,
                    }, {
                        accounts: {
                            newOwner,
                            payer,
                            baseMint: tokenBondingAcct.baseMint,
                            oldOwnerTokenRef,
                            oldPrimaryTokenRef,
                            newPrimaryTokenRef,
                            newOwnerTokenRef,
                            mintTokenRef,
                            owner: tokenRefAcct.owner,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                        },
                    }),
                ],
            };
        });
    }
    /**
     * Runs {@link `updateOwnerInstructions`}
     *
     * @param args
     * @retruns
     */
    updateOwner(args, commitment = "confirmed") {
        return this.execute(this.updateOwnerInstructions(args), args.payer, commitment);
    }
    /**
     * Update the authority of a social token
     *
     * @param args
     * @returns
     */
    updateAuthorityInstructions({ payer = this.wallet.publicKey, tokenRef, newAuthority, owner, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenRefAcct = (yield this.getTokenRef(tokenRef));
            if (!tokenRefAcct.tokenBonding) {
                throw new Error("Cannot update a token ref that has no token bonding");
            }
            if (!tokenRefAcct.isClaimed) {
                throw new Error("Cannot update authority on an unclaimed token ref");
            }
            owner = owner || tokenRefAcct.owner;
            const tokenBondingAcct = (yield this.splTokenBondingProgram.getTokenBonding(tokenRefAcct.tokenBonding));
            const [mintTokenRef] = yield SplTokenCollective.mintTokenRefKey(tokenBondingAcct.targetMint);
            const [ownerTokenRef] = yield SplTokenCollective.ownerTokenRefKey({
                owner,
                mint: tokenBondingAcct === null || tokenBondingAcct === void 0 ? void 0 : tokenBondingAcct.baseMint,
            });
            const [primaryTokenRef] = yield SplTokenCollective.ownerTokenRefKey({
                owner,
                isPrimary: true,
            });
            return {
                output: null,
                signers: [],
                instructions: [
                    yield this.instruction.updateAuthorityV0({
                        newAuthority,
                    }, {
                        accounts: {
                            payer,
                            primaryTokenRef,
                            baseMint: tokenBondingAcct.baseMint,
                            ownerTokenRef,
                            mintTokenRef,
                            authority: tokenRefAcct.authority,
                        },
                    }),
                ],
            };
        });
    }
    /**
     * Runs {@link `updateAuthorityInstructions`}
     *
     * @param args
     * @retruns
     */
    updateAuthority(args) {
        return this.execute(this.updateAuthorityInstructions(args), args.payer);
    }
}
exports.SplTokenCollective = SplTokenCollective;
SplTokenCollective.ID = new web3_js_1.PublicKey("TCo1sfSr2nCudbeJPykbif64rG9K1JNMGzrtzvPmp3y");
SplTokenCollective.OPEN_COLLECTIVE_ID = new web3_js_1.PublicKey("3cYa5WvT2bgXSLxxu9XDJSHV3x5JZGM91Nc3B7jYhBL7");
SplTokenCollective.OPEN_COLLECTIVE_BONDING_ID = new web3_js_1.PublicKey("9Zse7YX2mPQFoyMuz2Gk2K8WcH83FY1BLfu34vN4sdHi");
SplTokenCollective.OPEN_COLLECTIVE_MINT_ID = new web3_js_1.PublicKey("openDKyuDPS6Ak1BuD3JtvkQGV3tzCxjpHUfe1mdC79");
//# sourceMappingURL=index.js.map