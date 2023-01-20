//@ts-nocheck
import { Metadata, DataV2, MetadataProgram, } from "@metaplex-foundation/mpl-token-metadata";
import * as anchor from "@project-serum/anchor";
import { getHashedName, NameRegistryState } from "@solana/spl-name-service";
import { ASSOCIATED_TOKEN_PROGRAM_ID, MintLayout, NATIVE_MINT, Token, TOKEN_PROGRAM_ID, } from "@solana/spl-token";
import { PublicKey, SystemProgram, SYSVAR_CLOCK_PUBKEY, SYSVAR_RENT_PUBKEY, } from "@solana/web3.js";
import { SplTokenBonding, } from "@strata-foundation/spl-token-bonding";
import { AnchorSdk, createMintInstructions, extendBorsh, percent, SplTokenMetadata, } from "@strata-foundation/spl-utils";
import { deserializeUnchecked } from "borsh";
export * from "./generated/spl-token-collective";
extendBorsh();
function undefinedToNull(obj) {
    if (typeof obj === "undefined") {
        return null;
    }
    return obj;
}
function toIdlTokenMetadataSettings(settings) {
    return {
        symbol: undefinedToNull(settings?.symbol),
        uri: undefinedToNull(settings?.uri),
        nameIsNameServiceName: !!settings?.nameIsNameServiceName,
    };
}
function toIdlRoyaltySettings(settings) {
    return {
        ownedByName: !!settings?.ownedByName,
        address: undefinedToNull(settings?.address),
    };
}
function toIdlTokenBondingSettings(settings) {
    return {
        curve: undefinedToNull(settings?.curve),
        minSellBaseRoyaltyPercentage: undefinedToNull(percent(settings?.minSellBaseRoyaltyPercentage)),
        minSellTargetRoyaltyPercentage: undefinedToNull(percent(settings?.minSellTargetRoyaltyPercentage)),
        maxSellBaseRoyaltyPercentage: undefinedToNull(percent(settings?.maxSellBaseRoyaltyPercentage)),
        maxSellTargetRoyaltyPercentage: undefinedToNull(percent(settings?.maxSellTargetRoyaltyPercentage)),
        minBuyBaseRoyaltyPercentage: undefinedToNull(percent(settings?.minBuyBaseRoyaltyPercentage)),
        minBuyTargetRoyaltyPercentage: undefinedToNull(percent(settings?.minBuyTargetRoyaltyPercentage)),
        maxBuyBaseRoyaltyPercentage: undefinedToNull(percent(settings?.maxBuyBaseRoyaltyPercentage)),
        maxBuyTargetRoyaltyPercentage: undefinedToNull(percent(settings?.maxBuyTargetRoyaltyPercentage)),
        targetMintDecimals: undefinedToNull(settings?.targetMintDecimals),
        // @ts-ignore
        buyBaseRoyalties: toIdlRoyaltySettings(settings?.buyBaseRoyalties),
        // @ts-ignore
        sellBaseRoyalties: toIdlRoyaltySettings(settings?.sellBaseRoyalties),
        // @ts-ignore
        buyTargetRoyalties: toIdlRoyaltySettings(settings?.buyTargetRoyalties),
        // @ts-ignore
        sellTargetRoyalties: toIdlRoyaltySettings(settings?.sellTargetRoyalties),
        minPurchaseCap: undefinedToNull(settings?.minPurchaseCap),
        maxPurchaseCap: undefinedToNull(settings?.maxPurchaseCap),
        minMintCap: undefinedToNull(settings?.minMintCap),
        maxMintCap: undefinedToNull(settings?.maxMintCap),
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
export class SplTokenCollective extends AnchorSdk {
    splTokenBondingProgram;
    splTokenMetadata;
    static ID = new PublicKey("TCo1sfSr2nCudbeJPykbif64rG9K1JNMGzrtzvPmp3y");
    static OPEN_COLLECTIVE_ID = new PublicKey("3cYa5WvT2bgXSLxxu9XDJSHV3x5JZGM91Nc3B7jYhBL7");
    static OPEN_COLLECTIVE_BONDING_ID = new PublicKey("9Zse7YX2mPQFoyMuz2Gk2K8WcH83FY1BLfu34vN4sdHi");
    static OPEN_COLLECTIVE_MINT_ID = new PublicKey("openDKyuDPS6Ak1BuD3JtvkQGV3tzCxjpHUfe1mdC79");
    static async init(provider, splCollectiveProgramId = SplTokenCollective.ID, splTokenBondingProgramId = SplTokenBonding.ID) {
        const SplCollectiveIDLJson = await anchor.Program.fetchIdl(splCollectiveProgramId, provider);
        // @ts-ignore
        const splCollective = new anchor.Program(SplCollectiveIDLJson, splCollectiveProgramId, provider);
        const splTokenBondingProgram = await SplTokenBonding.init(provider, splTokenBondingProgramId);
        const splTokenMetadata = await SplTokenMetadata.init(provider);
        return new this({
            provider,
            program: splCollective,
            splTokenBondingProgram,
            splTokenMetadata,
        });
    }
    constructor(opts) {
        super(opts);
        this.splTokenBondingProgram = opts.splTokenBondingProgram;
        this.splTokenMetadata = opts.splTokenMetadata;
    }
    /**
     * Account decoder to a unified TokenRef interface
     *
     * @param pubkey
     * @param account
     * @returns
     */
    tokenRefDecoder = (pubkey, account) => {
        const coded = this.program.coder.accounts.decode("TokenRefV0", account.data);
        return {
            ...coded,
            publicKey: pubkey,
        };
    };
    /**
     * Account decoder to a unified Collective interface
     *
     * @param pubkey
     * @param account
     * @returns
     */
    collectiveDecoder = (pubkey, account) => {
        const coded = this.program.coder.accounts.decode("CollectiveV0", account.data);
        return {
            ...coded,
            publicKey: pubkey,
        };
    };
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
    async createCollectiveInstructions({ payer = this.wallet.publicKey, mint, authority, mintAuthority, config, bonding, metadata, tokenRef, }) {
        const instructions = [];
        const signers = [];
        let metadataAdded = false;
        const addMetadata = async () => {
            if (metadata && !metadataAdded) {
                const { instructions: metadataInstructions, signers: metadataSigners } = await this.splTokenMetadata.createMetadataInstructions({
                    mint: mint,
                    authority: mintAuthority,
                    data: new DataV2({
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
        };
        if (!mint) {
            const targetMintKeypair = bonding?.targetMintKeypair || anchor.web3.Keypair.generate();
            signers.push(targetMintKeypair);
            mint = targetMintKeypair.publicKey;
            instructions.push(...(await createMintInstructions(this.provider, payer, mint, bonding?.targetMintDecimals || 9)));
            mintAuthority = payer;
            await addMetadata();
        }
        if (!mintAuthority) {
            const mintAcct = await this.provider.connection.getAccountInfo(mint);
            const data = Buffer.from(mintAcct.data);
            const mintInfo = MintLayout.decode(data);
            if (mintInfo.mintAuthorityOption === 0) {
                throw new Error("Must have mint authority to create a collective");
            }
            else {
                mintAuthority = new PublicKey(mintInfo.mintAuthority);
            }
            await addMetadata();
        }
        const [collective, collectiveBump] = await SplTokenCollective.collectiveKey(mint);
        if (await this.provider.connection.getAccountInfo(collective)) {
            throw new Error("Collective already exists");
        }
        const [mintTokenRef] = await SplTokenCollective.mintTokenRefKey(mint);
        const tokenRefExists = !!(await this.provider.connection.getAccountInfo(mintTokenRef));
        if (tokenRef || tokenRefExists) {
            instructions.push(await this.instruction.initializeCollectiveForSocialTokenV0(
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
                    systemProgram: SystemProgram.programId,
                    rent: SYSVAR_RENT_PUBKEY,
                },
            }));
        }
        else {
            instructions.push(await this.instruction.initializeCollectiveV0(
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
                    systemProgram: SystemProgram.programId,
                    rent: SYSVAR_RENT_PUBKEY,
                },
            }));
        }
        const instructions2 = [];
        const signers2 = [];
        let tokenBonding;
        if (bonding) {
            tokenBonding = (await SplTokenBonding.tokenBondingKey(mint, bonding.index || 0))[0];
            // Set back to token bonding's authority
            instructions2.push(Token.createSetAuthorityInstruction(TOKEN_PROGRAM_ID, mint, tokenBonding, "MintTokens", mintAuthority, []));
            mintAuthority = tokenBonding;
            var { instructions: tokenBondingInstructions, signers: tokenBondingSigners, output: { tokenBonding: outputTokenBonding }, } = await this.splTokenBondingProgram.createTokenBondingInstructions({
                ...bonding,
                targetMint: mint,
            });
            tokenBonding = outputTokenBonding;
            instructions2.push(...tokenBondingInstructions);
            signers2.push(...tokenBondingSigners);
        }
        return {
            output: { collective, tokenBonding },
            instructions: [instructions, instructions2],
            signers: [signers, signers2],
        };
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
    async claimSocialTokenInstructions({ payer = this.wallet.publicKey, owner = this.wallet.publicKey, tokenRef, tokenName, symbol, buyBaseRoyalties, buyTargetRoyalties, sellBaseRoyalties, sellTargetRoyalties, ignoreMissingName, isPrimary = true, authority = this.wallet.publicKey, }) {
        const tokenRefAcct = (await this.getTokenRef(tokenRef));
        if (!tokenRefAcct.tokenBonding) {
            throw new Error("Claiming token ref without token bonding not yet supported");
        }
        const tokenBondingAcct = (await this.splTokenBondingProgram.getTokenBonding(tokenRefAcct.tokenBonding));
        const ownerTokenRef = (await SplTokenCollective.ownerTokenRefKey({
            mint: tokenBondingAcct.baseMint,
            name: tokenRefAcct.name,
        }))[0];
        const name = tokenRefAcct.name;
        const instructions0 = [];
        if (!ignoreMissingName &&
            !(await this.splTokenBondingProgram.accountExists(name))) {
            throw new Error("Name account does not exist");
        }
        const defaultBaseRoyalties = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, tokenBondingAcct.baseMint, owner, true);
        const defaultTargetRoyalties = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, tokenBondingAcct.targetMint, owner, true);
        if ((!buyTargetRoyalties || !sellTargetRoyalties) &&
            !(await this.splTokenBondingProgram.accountExists(defaultTargetRoyalties))) {
            console.log(`Creating target royalties ${defaultTargetRoyalties}...`);
            instructions0.push(Token.createAssociatedTokenAccountInstruction(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, tokenBondingAcct.targetMint, defaultTargetRoyalties, owner, payer));
        }
        if ((!buyBaseRoyalties || !sellBaseRoyalties) &&
            !(await this.splTokenBondingProgram.accountExists(defaultBaseRoyalties))) {
            console.log(`Creating base royalties ${defaultBaseRoyalties}...`);
            instructions0.push(Token.createAssociatedTokenAccountInstruction(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, tokenBondingAcct.baseMint, defaultBaseRoyalties, owner, payer));
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
        const [mintTokenRef] = await SplTokenCollective.mintTokenRefKey(tokenBondingAcct.targetMint);
        const [newTokenRef] = await PublicKey.findProgramAddress(SplTokenCollective.ownerTokenRefSeeds({
            mint: tokenBondingAcct.baseMint,
            owner,
        }), this.programId);
        const instructions1 = [];
        instructions1.push(await this.instruction.claimSocialTokenV0({
            isPrimary,
            authority,
        }, {
            accounts: {
                payer,
                collective: tokenRefAcct.collective || PublicKey.default,
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
                tokenProgram: TOKEN_PROGRAM_ID,
                tokenBondingProgram: this.splTokenBondingProgram.programId,
                tokenMetadataProgram: MetadataProgram.PUBKEY,
                systemProgram: SystemProgram.programId,
                rent: SYSVAR_RENT_PUBKEY,
            },
        }));
        if (symbol) {
            const tokenMetadataRaw = await this.provider.connection.getAccountInfo(tokenRefAcct.tokenMetadata);
            const tokenMetadata = new Metadata(tokenRefAcct.tokenMetadata, tokenMetadataRaw).data;
            const { instructions: updateInstructions } = await this.splTokenMetadata.updateMetadataInstructions({
                data: new DataV2({
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
            const { instructions: setAsPrimaryInstrs } = await this.setAsPrimaryInstructions({
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
    }
    /**
     * Run {@link claimSocialTokenInstructions}
     * @param args
     */
    async claimSocialToken(args) {
        await this.executeBig(this.claimSocialTokenInstructions(args));
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
        return PublicKey.findProgramAddress([Buffer.from("collective", "utf-8"), mint.toBuffer()], programId);
    }
    static async ownerTokenRefKey(args, programId = SplTokenCollective.ID) {
        return PublicKey.findProgramAddress(this.ownerTokenRefSeeds(args), programId);
    }
    static async mintTokenRefKey(mint, programId = SplTokenCollective.ID) {
        return PublicKey.findProgramAddress([Buffer.from("mint-token-ref", "utf-8"), mint.toBuffer()], programId);
    }
    /**
     * Get instructions to set this ownerTokenRef as our primary token ref (lookups to "owner-token-ref", owner pda find this ownerTokenRef)
     *
     * @param param0
     * @returns
     */
    async setAsPrimaryInstructions({ payer = this.wallet.publicKey, tokenRef, owner, }) {
        if (!owner) {
            // @ts-ignore
            owner = (await this.getTokenRef(tokenRef)).owner;
        }
        const [primaryTokenRef, bumpSeed] = await SplTokenCollective.ownerTokenRefKey({
            isPrimary: true,
            owner,
        });
        return {
            signers: [],
            instructions: [
                await this.instruction.setAsPrimaryV0({
                    bumpSeed,
                }, {
                    accounts: {
                        payer,
                        owner: owner,
                        tokenRef,
                        primaryTokenRef,
                        systemProgram: SystemProgram.programId,
                        rent: SYSVAR_RENT_PUBKEY,
                    },
                }),
            ],
            output: {
                primaryTokenRef,
            },
        };
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
    async updateCollectiveInstructions({ collective, authority, config, }) {
        if (typeof authority == "undefined") {
            // @ts-ignore
            authority = (await this.getCollective(collective)).authority;
        }
        return {
            signers: [],
            instructions: [
                await this.instruction.updateCollectiveV0(
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
    async createSocialTokenInstructions({ ignoreIfExists = false, payer = this.wallet.publicKey, collective, mint, name, owner, targetMintKeypair = anchor.web3.Keypair.generate(), metadata, nameClass, nameParent, tokenBondingParams, isPrimary = name ? false : true, authority, }) {
        let metadataUri = metadata?.uri;
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
        const state = (await this.splTokenBondingProgram.getState());
        const isNative = mint?.equals(NATIVE_MINT) || mint?.equals(state.wrappedSolMint);
        if (isNative) {
            mint = state.wrappedSolMint;
        }
        let collectiveBumpSeed = 0;
        if (!collective) {
            [collective, collectiveBumpSeed] = await SplTokenCollective.collectiveKey(mint);
        }
        const collectiveAcct = await this.getCollective(collective);
        if (collectiveAcct) {
            collectiveBumpSeed = collectiveAcct.bumpSeed;
        }
        const config = collectiveAcct?.config;
        if (!mint) {
            if (!collectiveAcct) {
                throw new Error("Must either provide a collective or a mint");
            }
            mint = collectiveAcct.mint;
        }
        // Token refs
        const [ownerTokenRef, ownerTokenRefBumpSeed] = await PublicKey.findProgramAddress(SplTokenCollective.ownerTokenRefSeeds({ mint, owner, name }), programId);
        // create mint with payer as auth
        console.log(`Creating social token mint ${targetMintKeypair.publicKey.toBase58()}`);
        signers1.push(targetMintKeypair);
        const targetMint = targetMintKeypair.publicKey;
        instructions1.push(...(await createMintInstructions(provider, payer, targetMint, tokenBondingParams.targetMintDecimals ||
            // @ts-ignore
            config?.unclaimedTokenBondingSettings?.targetMintDecimals ||
            9)));
        const [mintTokenRef, mintTokenRefBumpSeed] = await SplTokenCollective.mintTokenRefKey(targetMint);
        console.log("ownerTokenRef", ownerTokenRef.toBase58());
        console.log("reverse", mintTokenRef.toBase58());
        const existing = await this.getTokenRef(ownerTokenRef);
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
        let uri = metadataUri || config?.unclaimedTokenMetadataSettings?.uri;
        if (!uri) {
            throw new Error("Must pass metadata.uri or it must be defined on the collective config");
        }
        const tokenBonding = (await SplTokenBonding.tokenBondingKey(targetMint, 0))[0];
        const { instructions: metadataInstructions, signers: metadataSigners, output: { metadata: tokenMetadata }, } = await this.splTokenMetadata.createMetadataInstructions({
            mint: targetMint,
            authority: owner ? owner : mintTokenRef,
            data: new DataV2({
                uri,
                collection: null,
                uses: null,
                creators: null,
                sellerFeeBasisPoints: 0,
                ...metadata,
            }),
        });
        instructions1.push(...metadataInstructions);
        signers1.push(...metadataSigners);
        instructions1.push(Token.createSetAuthorityInstruction(TOKEN_PROGRAM_ID, targetMint, tokenBonding, "MintTokens", payer, []));
        // Create token bonding
        const instructions2 = [];
        const tokenBondingSettings = owner
            ? config?.claimedTokenBondingSettings
            : config?.unclaimedTokenBondingSettings;
        const signers2 = [];
        const curveToUse = (curve ||
            (!owner &&
                // @ts-ignore
                collectiveAcct?.config?.unclaimedTokenBondingSettings?.curve) ||
            // @ts-ignore
            (owner && collectiveAcct?.config?.claimedTokenBondingSettings?.curve) ||
            // @ts-ignore
            collectiveAcct?.config?.unclaimedTokenBondingSettings?.curve ||
            // @ts-ignore
            collectiveAcct?.config?.claimedTokenBondingSettings?.curve);
        if (!curveToUse) {
            throw new Error("No curve provided");
        }
        const { instructions: bondingInstructions, signers: bondingSigners, output: { buyBaseRoyalties, buyTargetRoyalties, sellBaseRoyalties, sellTargetRoyalties, baseMint, }, } = await this.splTokenBondingProgram.createTokenBondingInstructions({
            payer,
            index: 0,
            // @ts-ignore
            curve: curveToUse,
            baseMint: mint,
            targetMint,
            generalAuthority: mintTokenRef,
            reserveAuthority: mintTokenRef,
            curveAuthority: mintTokenRef,
            // @ts-ignore
            buyBaseRoyaltiesOwner: tokenBondingSettings?.buyBaseRoyalties.ownedByName
                ? mintTokenRef
                : undefined,
            // @ts-ignore
            sellBaseRoyaltiesOwner: tokenBondingSettings?.sellBaseRoyalties
                .ownedByName
                ? mintTokenRef
                : undefined,
            // @ts-ignore
            buyTargetRoyaltiesOwner: tokenBondingSettings?.buyTargetRoyalties
                .ownedByName
                ? mintTokenRef
                : undefined,
            // @ts-ignore
            sellTargetRoyaltiesOwner: tokenBondingSettings?.sellTargetRoyalties
                .ownedByName
                ? mintTokenRef
                : undefined,
            buyBaseRoyalties: 
            // @ts-ignore
            tokenBondingSettings?.buyBaseRoyalties?.address || undefined,
            sellBaseRoyalties: 
            // @ts-ignore
            tokenBondingSettings?.sellBaseRoyalties?.address || undefined,
            buyTargetRoyalties: 
            // @ts-ignore
            tokenBondingSettings?.buyTargetRoyalties?.address || undefined,
            sellTargetRoyalties: 
            // @ts-ignore
            tokenBondingSettings?.sellTargetRoyalties?.address || undefined,
            ...tokenBondingParams,
        });
        instructions2.push(...bondingInstructions);
        signers2.push(...bondingSigners);
        const initializeArgs = {
            authority: collectiveAcct?.authority ||
                PublicKey.default,
            collective,
            tokenMetadata: new PublicKey(tokenMetadata),
            tokenBonding,
            payer,
            baseMint,
            targetMint,
            buyBaseRoyalties,
            buyTargetRoyalties,
            sellBaseRoyalties,
            sellTargetRoyalties,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
            clock: SYSVAR_CLOCK_PUBKEY,
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
            instructions3.push(await this.instruction.initializeOwnedSocialTokenV0(args, {
                accounts: {
                    initializeArgs,
                    owner,
                    payer,
                    ownerTokenRef,
                    mintTokenRef,
                    systemProgram: SystemProgram.programId,
                    rent: SYSVAR_RENT_PUBKEY,
                },
            }));
            if (isPrimary) {
                const { instructions: setAsPrimaryInstrs } = await this.setAsPrimaryInstructions({
                    tokenRef: ownerTokenRef,
                    payer,
                    owner,
                });
                instructions3.push(...setAsPrimaryInstrs);
            }
        }
        else {
            instructions3.push(await this.instruction.initializeUnclaimedSocialTokenV0(args, {
                accounts: {
                    initializeArgs,
                    name: name,
                    payer,
                    ownerTokenRef,
                    mintTokenRef,
                    tokenMetadata,
                    systemProgram: SystemProgram.programId,
                    rent: SYSVAR_RENT_PUBKEY,
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
    }
    /**
     * Run {@link createSocialTokenInstructions}
     * @param args
     * @returns
     */
    async createSocialToken(args, commitment = "confirmed") {
        return this.executeBig(this.createSocialTokenInstructions(args), args.payer, commitment);
    }
    getUserTokensWithMeta(tokenAccounts) {
        return Promise.all((tokenAccounts || []).map(async ({ pubkey, info }) => {
            const metadataKey = await Metadata.getPDA(info.mint);
            const [mintTokenRefKey] = await SplTokenCollective.mintTokenRefKey(info.mint);
            const account = await this.provider.connection.getAccountInfo(mintTokenRefKey);
            const ownerTokenRef = account && this.tokenRefDecoder(mintTokenRefKey, account);
            const tokenBondingKey = (await SplTokenBonding.tokenBondingKey(info.mint))[0];
            const tokenBondingAccount = await this.provider.connection.getAccountInfo(tokenBondingKey);
            const tokenBonding = tokenBondingAccount &&
                this.splTokenBondingProgram.tokenBondingDecoder(tokenBondingKey, tokenBondingAccount);
            return {
                ...(await this.splTokenMetadata.getTokenMetadata(new PublicKey(metadataKey))),
                tokenRef: ownerTokenRef || undefined,
                tokenBonding: tokenBonding || undefined,
                publicKey: pubkey,
                account: info,
            };
        }));
    }
    /**
     * Claims the reserve and general authority from any bonding curve
     * that has this token ref as the authority. Useful for setting bonding curves
     * that can later be claimed by the social token holder.
     *
     * @param param0
     * @returns
     */
    async claimBondingAuthorityInstructions({ tokenBonding, }) {
        const tokenBondingAcct = (await this.splTokenBondingProgram.getTokenBonding(tokenBonding));
        const [mintTokenRef] = await SplTokenCollective.mintTokenRefKey(tokenBondingAcct.baseMint);
        return {
            output: null,
            signers: [],
            instructions: [
                await this.instruction.claimBondingAuthorityV0({
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
    }
    /**
     * Runs {@link `claimBondingAuthorityInstructions`}
     *
     * @param args
     * @retruns
     */
    async claimBondingAuthority(args, commitment = "confirmed") {
        await this.execute(this.claimBondingAuthorityInstructions(args), this.wallet.publicKey, commitment);
    }
    /**
     * Update a bonding cruve.
     *
     * @param args
     * @returns
     */
    async updateTokenBondingInstructions({ tokenRef, buyBaseRoyaltyPercentage, buyTargetRoyaltyPercentage, sellBaseRoyaltyPercentage, sellTargetRoyaltyPercentage, buyBaseRoyalties, buyTargetRoyalties, sellBaseRoyalties, sellTargetRoyalties, buyFrozen, }) {
        const tokenRefAcct = (await this.getTokenRef(tokenRef));
        if (!tokenRefAcct.tokenBonding) {
            throw new Error("Cannot update token bonding on a token ref that has no token bonding");
        }
        if (!tokenRefAcct.authority) {
            throw new Error("No authority on this token. Cannot update token bonding.");
        }
        const collectiveAcct = tokenRefAcct.collective &&
            (await this.getCollective(tokenRefAcct.collective));
        const tokenBondingAcct = (await this.splTokenBondingProgram.getTokenBonding(tokenRefAcct.tokenBonding));
        if (!tokenBondingAcct.generalAuthority) {
            throw new Error("Cannot update a token bonding account that has no authority");
        }
        const [mintTokenRef] = await SplTokenCollective.mintTokenRefKey(tokenBondingAcct.targetMint);
        const args = {
            tokenBondingAuthority: tokenBondingAcct.generalAuthority,
            buyBaseRoyaltyPercentage: definedOr(percent(buyBaseRoyaltyPercentage), tokenBondingAcct.buyBaseRoyaltyPercentage),
            buyTargetRoyaltyPercentage: definedOr(percent(buyTargetRoyaltyPercentage), tokenBondingAcct.buyTargetRoyaltyPercentage),
            sellBaseRoyaltyPercentage: definedOr(percent(sellBaseRoyaltyPercentage), tokenBondingAcct.sellBaseRoyaltyPercentage),
            sellTargetRoyaltyPercentage: definedOr(percent(sellTargetRoyaltyPercentage), tokenBondingAcct.sellTargetRoyaltyPercentage),
            buyFrozen: typeof buyFrozen === "undefined"
                ? tokenBondingAcct.buyFrozen
                : buyFrozen,
        };
        console.log({
            tokenRefAuthority: tokenRefAcct.authority,
            collective: tokenRefAcct.collective || PublicKey.default,
            authority: (collectiveAcct &&
                collectiveAcct.authority) ||
                PublicKey.default,
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
                await this.instruction.updateTokenBondingV0(args, {
                    accounts: {
                        tokenRefAuthority: tokenRefAcct.authority,
                        collective: tokenRefAcct.collective || PublicKey.default,
                        authority: (collectiveAcct &&
                            collectiveAcct.authority) ||
                            PublicKey.default,
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
    }
    /**
     * Runs {@link `updateTokenBondingInstructions`}
     *
     * @param args
     * @retruns
     */
    async updateTokenBonding(args, commitment = "confirmed") {
        await this.execute(this.updateTokenBondingInstructions(args), this.wallet.publicKey, commitment);
    }
    async updateCurveInstructions({ tokenRef, curve, adminKey, }) {
        const tokenRefAcct = (await this.getTokenRef(tokenRef));
        if (!tokenRefAcct.tokenBonding) {
            throw new Error("Cannot update curve on a token ref that has no token bonding");
        }
        const collectiveAcct = tokenRefAcct.collective &&
            (await this.getCollective(tokenRefAcct.collective));
        const tokenBondingAcct = (await this.splTokenBondingProgram.getTokenBonding(tokenRefAcct.tokenBonding));
        if (!tokenBondingAcct.curveAuthority) {
            throw new Error("Cannot update curve for a token bonding account that has no curve authority");
        }
        const [mintTokenRef] = await SplTokenCollective.mintTokenRefKey(tokenBondingAcct.targetMint);
        const auth = adminKey
            ? adminKey
            : (collectiveAcct &&
                collectiveAcct.authority) ||
                PublicKey.default;
        const tokenRefAuth = adminKey
            ? adminKey
            : tokenRefAcct.authority;
        return {
            output: null,
            signers: [],
            instructions: [
                await this.instruction.updateCurveV0({
                    accounts: {
                        tokenRefAuthority: tokenRefAuth,
                        collective: tokenRefAcct.collective || PublicKey.default,
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
    }
    /**
     * Runs {@link `updateCurveInstructions`}
     *
     * @param args
     * @retruns
     */
    async updateCurve(args, commitment = "confirmed") {
        await this.execute(this.updateCurveInstructions(args), this.wallet.publicKey, commitment);
    }
    async getOptionalNameRecord(name) {
        if (!name || name.equals(PublicKey.default)) {
            return null;
        }
        let nameAccountRaw = await this.provider.connection.getAccountInfo(name);
        if (nameAccountRaw) {
            return deserializeUnchecked(NameRegistryState.schema, NameRegistryState, nameAccountRaw.data);
        }
        return null;
    }
    /**
     * Opt out a social token
     *
     * @param args
     * @returns
     */
    async optOutInstructions({ tokenRef, handle, nameClass, nameParent, }) {
        const tokenRefAcct = (await this.getTokenRef(tokenRef));
        if (!tokenRefAcct.tokenBonding) {
            throw new Error("Cannot currently opt out on a token ref that has no token bonding");
        }
        const nameAcct = await this.getOptionalNameRecord(tokenRefAcct.name);
        if (!nameClass && nameAcct) {
            nameClass = nameAcct.class;
        }
        if (!nameParent && nameAcct) {
            nameParent = nameAcct.parentName;
        }
        let nameParentAcct = await this.getOptionalNameRecord(nameParent);
        const tokenBondingAcct = (await this.splTokenBondingProgram.getTokenBonding(tokenRefAcct.tokenBonding));
        const [mintTokenRef] = await SplTokenCollective.mintTokenRefKey(tokenBondingAcct.targetMint);
        const [ownerTokenRef] = await SplTokenCollective.ownerTokenRefKey({
            name: tokenRefAcct.name,
            owner: tokenRefAcct.isClaimed
                ? tokenRefAcct.owner
                : undefined,
            mint: tokenBondingAcct?.baseMint,
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
            const [primaryTokenRef] = await SplTokenCollective.ownerTokenRefKey({
                owner: tokenRefAcct.owner,
                isPrimary: true,
            });
            instructions.push(await this.instruction.changeOptStatusClaimedV0({
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
            instructions.push(await this.instruction.changeOptStatusUnclaimedV0({
                hashedName: await getHashedName(handle),
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
                        pubkey: nameClass || PublicKey.default,
                        isWritable: false,
                        isSigner: !!nameClass && !nameClass.equals(PublicKey.default),
                    },
                    {
                        pubkey: nameParent || PublicKey.default,
                        isWritable: false,
                        isSigner: false,
                    },
                    {
                        pubkey: nameParentAcct?.owner || PublicKey.default,
                        isWritable: false,
                        isSigner: !!nameParent && !nameParent.equals(PublicKey.default),
                    },
                ],
            }));
        }
        return {
            output: null,
            signers: [],
            instructions,
        };
    }
    /**
     * Runs {@link `optOutInstructions`}
     *
     * @param args
     * @retruns
     */
    async optOut(args, commitment = "confirmed") {
        await this.execute(this.optOutInstructions(args), args.payer, commitment);
    }
    /**
     * Update the owner wallet of a social token
     *
     * @param args
     * @returns
     */
    async updateOwnerInstructions({ payer = this.wallet.publicKey, tokenRef, newOwner, }) {
        const tokenRefAcct = (await this.getTokenRef(tokenRef));
        if (!tokenRefAcct.tokenBonding) {
            throw new Error("Cannot update a token ref that has no token bonding");
        }
        if (!tokenRefAcct.isClaimed) {
            throw new Error("Cannot update owner on an unclaimed token ref");
        }
        const tokenBondingAcct = (await this.splTokenBondingProgram.getTokenBonding(tokenRefAcct.tokenBonding));
        const [mintTokenRef] = await SplTokenCollective.mintTokenRefKey(tokenBondingAcct.targetMint);
        const [oldOwnerTokenRef] = await SplTokenCollective.ownerTokenRefKey({
            owner: tokenRefAcct.owner,
            mint: tokenBondingAcct?.baseMint,
        });
        const [newOwnerTokenRef, ownerTokenRefBumpSeed] = await SplTokenCollective.ownerTokenRefKey({
            owner: newOwner,
            mint: tokenBondingAcct?.baseMint,
        });
        const [oldPrimaryTokenRef] = await SplTokenCollective.ownerTokenRefKey({
            owner: tokenRefAcct.owner,
            isPrimary: true,
        });
        const [newPrimaryTokenRef, primaryTokenRefBumpSeed] = await SplTokenCollective.ownerTokenRefKey({
            owner: newOwner,
            isPrimary: true,
        });
        return {
            output: {
                ownerTokenRef: newOwnerTokenRef,
            },
            signers: [],
            instructions: [
                await this.instruction.updateOwnerV0({
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
                        systemProgram: SystemProgram.programId,
                        rent: SYSVAR_RENT_PUBKEY,
                    },
                }),
            ],
        };
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
    async updateAuthorityInstructions({ payer = this.wallet.publicKey, tokenRef, newAuthority, owner, }) {
        const tokenRefAcct = (await this.getTokenRef(tokenRef));
        if (!tokenRefAcct.tokenBonding) {
            throw new Error("Cannot update a token ref that has no token bonding");
        }
        if (!tokenRefAcct.isClaimed) {
            throw new Error("Cannot update authority on an unclaimed token ref");
        }
        owner = owner || tokenRefAcct.owner;
        const tokenBondingAcct = (await this.splTokenBondingProgram.getTokenBonding(tokenRefAcct.tokenBonding));
        const [mintTokenRef] = await SplTokenCollective.mintTokenRefKey(tokenBondingAcct.targetMint);
        const [ownerTokenRef] = await SplTokenCollective.ownerTokenRefKey({
            owner,
            mint: tokenBondingAcct?.baseMint,
        });
        const [primaryTokenRef] = await SplTokenCollective.ownerTokenRefKey({
            owner,
            isPrimary: true,
        });
        return {
            output: null,
            signers: [],
            instructions: [
                await this.instruction.updateAuthorityV0({
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
//# sourceMappingURL=index.js.map