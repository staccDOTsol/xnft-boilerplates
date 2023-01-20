import { CreateMetadataV2, DataV2, Edition, MasterEdition, Metadata, MetadataKey, UpdateMetadataV2, VerifyCollection, CreateMasterEditionV3 } from "@metaplex-foundation/mpl-token-metadata";
import { BN } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { getMintInfo, sendInstructions } from ".";
import { ARWEAVE_UPLOAD_URL, getFilesWithMetadata, prePayForFilesInstructions, uploadToArweave, } from "./arweave";
// @ts-ignore
import localStorageMemory from "localstorage-memory";
import { getStorageAccount, uploadFiles } from "./shdw";
export var MetadataCategory;
(function (MetadataCategory) {
    MetadataCategory["Audio"] = "audio";
    MetadataCategory["Video"] = "video";
    MetadataCategory["Image"] = "image";
    MetadataCategory["VR"] = "vr";
})(MetadataCategory || (MetadataCategory = {}));
const USE_CDN = false; // copied from metaplex. Guess support isn't there yet?
const routeCDN = (uri) => {
    let result = uri;
    if (USE_CDN) {
        result = uri.replace("https://arweave.net/", "https://coldcdn.com/api/cdn/bronil/");
    }
    return result;
};
export function getImageFromMeta(meta) {
    if (meta?.image) {
        return meta?.image;
    }
    else {
        const found = (meta?.properties?.files || []).find((f) => typeof f !== "string" && f.type === "Ima")?.uri;
        return found;
    }
}
const imageFromJson = (newUri, extended) => {
    const image = getImageFromMeta(extended);
    if (image) {
        const file = image.startsWith("http")
            ? extended.image
            : `${newUri}/${extended.image}`;
        return routeCDN(file);
    }
};
//@ts-ignore
const localStorage = (typeof global !== "undefined" && global.localStorage) || localStorageMemory;
export class SplTokenMetadata {
    provider;
    static async init(provider) {
        return new this({
            provider,
        });
    }
    constructor(opts) {
        this.provider = opts.provider;
    }
    static attributesToRecord(attributes) {
        if (!attributes) {
            return undefined;
        }
        return attributes?.reduce((acc, att) => {
            if (att.trait_type)
                acc[att.trait_type] = att.value;
            return acc;
        }, {});
    }
    static async getArweaveMetadata(uri) {
        if (uri && uri.length > 0) {
            const newUri = routeCDN(uri);
            const cached = localStorage.getItem(newUri);
            if (cached) {
                return JSON.parse(cached);
            }
            else {
                try {
                    // TODO: BL handle concurrent calls to avoid double query
                    const result = await fetch(newUri);
                    let data = await result.json();
                    if (data.uri) {
                        data = {
                            ...data,
                            ...(await SplTokenMetadata.getArweaveMetadata(data.uri)),
                        };
                    }
                    try {
                        localStorage.setItem(newUri, JSON.stringify(data));
                    }
                    catch (e) {
                        // ignore
                    }
                    return data;
                }
                catch (e) {
                    console.log(`Could not fetch from ${uri}`, e);
                    return undefined;
                }
            }
        }
    }
    static async getImage(uri) {
        if (uri) {
            const newUri = routeCDN(uri);
            const metadata = await SplTokenMetadata.getArweaveMetadata(uri);
            // @ts-ignore
            if (metadata?.uri) {
                // @ts-ignore
                return SplTokenMetadata.getImage(metadata?.uri);
            }
            return imageFromJson(newUri, metadata);
        }
    }
    async getEditionInfo(metadata) {
        if (!metadata) {
            return {};
        }
        const editionKey = await Edition.getPDA(new PublicKey(metadata.mint));
        let edition;
        let masterEdition;
        const editionOrMasterEditionAcct = await this.provider.connection.getAccountInfo(editionKey);
        const editionOrMasterEdition = editionOrMasterEditionAcct
            ? editionOrMasterEditionAcct?.data[0] == MetadataKey.EditionV1
                ? new Edition(editionKey, editionOrMasterEditionAcct)
                : new MasterEdition(editionKey, editionOrMasterEditionAcct)
            : null;
        if (editionOrMasterEdition instanceof Edition) {
            edition = editionOrMasterEdition;
            const masterEditionInfoAcct = await this.provider.connection.getAccountInfo(new PublicKey(editionOrMasterEdition.data.parent));
            masterEdition =
                masterEditionInfoAcct &&
                    new MasterEdition(new PublicKey(editionOrMasterEdition.data.parent), masterEditionInfoAcct);
        }
        else {
            masterEdition = editionOrMasterEdition;
        }
        return {
            edition: edition?.data,
            masterEdition: masterEdition?.data || undefined,
        };
    }
    async getTokenMetadata(metadataKey) {
        const metadataAcc = await this.provider.connection.getAccountInfo(metadataKey);
        const metadata = metadataAcc && new Metadata(metadataKey, metadataAcc).data;
        const data = await SplTokenMetadata.getArweaveMetadata(metadata?.data.uri);
        const image = await SplTokenMetadata.getImage(metadata?.data.uri);
        const description = data?.description;
        const mint = metadata &&
            (await getMintInfo(this.provider, new PublicKey(metadata.mint)));
        const displayName = metadata?.data.name.length == 32 ? data?.name : metadata?.data.name;
        return {
            displayName,
            metadata: metadata || undefined,
            metadataKey,
            image,
            mint: mint || undefined,
            data,
            description,
            ...(metadata ? await this.getEditionInfo(metadata) : {}),
        };
    }
    sendInstructions(instructions, signers, payer) {
        return sendInstructions(new Map(), this.provider, instructions, signers, payer);
    }
    async uploadMetadata(args) {
        const [accountKey] = await getStorageAccount(this.provider.wallet.publicKey, new BN(0));
        let randomId = Math.floor(Math.random() * (999 - 100 + 1) + 100);
        const metadata = {
            name: args.name,
            symbol: args.symbol,
            description: args.description,
            image: `https://shdw-drive.genesysgo.net/${accountKey.toBase58()}/${args.image.name}`,
            attributes: args.attributes,
            external_url: args.externalUrl || "",
            animation_rl: args.animationUrl,
            creators: args.creators ? args.creators : null,
            seller_fee_basis_points: 0,
            ...(args.extraMetadata || {}),
        };
        const metadataFile = new File([JSON.stringify(metadata)], `${args.mint}-${randomId}.json`);
        const urls = await uploadFiles(this.provider, [metadataFile, args.image], undefined);
        return urls[0];
    }
    /**
     * Wrapper function that prepays for arweave metadata files in SOL, then uploads them to arweave and returns the url
     *
     * @param args
     * @returns
     */
    async createArweaveMetadata(args) {
        const { txid, files } = await this.presignCreateArweaveUrl(args);
        let env = args.env;
        if (!env) {
            // @ts-ignore
            const url = this.provider.connection._rpcEndpoint;
            if (url.includes("devnet")) {
                env = "devnet";
            }
            else {
                env = "mainnet-beta";
            }
        }
        const uri = await this.getArweaveUrl({
            txid,
            mint: args.mint,
            files,
            env,
            uploadUrl: args.uploadUrl || ARWEAVE_UPLOAD_URL,
        });
        return uri;
    }
    async presignCreateArweaveUrlInstructions({ name, symbol, description = "", image, creators, files = [], payer = this.provider.wallet.publicKey, existingFiles, attributes, externalUrl, animationUrl, extraMetadata, }) {
        const metadata = {
            name,
            symbol,
            description,
            image,
            attributes,
            externalUrl: externalUrl || "",
            animationUrl,
            properties: {
                category: MetadataCategory.Image,
                files: [...(existingFiles || []), ...files],
            },
            creators: creators ? creators : null,
            sellerFeeBasisPoints: 0,
            ...(extraMetadata || {}),
        };
        const realFiles = await getFilesWithMetadata(files, metadata);
        const prepayTxnInstructions = await prePayForFilesInstructions(payer, realFiles);
        return {
            instructions: prepayTxnInstructions,
            signers: [],
            output: {
                files: realFiles,
            },
        };
    }
    async presignCreateArweaveUrl(args) {
        const { output: { files }, instructions, signers, } = await this.presignCreateArweaveUrlInstructions(args);
        const txid = await this.sendInstructions(instructions, signers);
        return {
            files,
            txid,
        };
    }
    async getArweaveUrl({ txid, mint, files = [], uploadUrl = ARWEAVE_UPLOAD_URL, env = "mainnet-beta", }) {
        const result = await uploadToArweave(txid, mint, files, uploadUrl, env);
        const metadataFile = result.messages?.find((m) => m.filename === "manifest.json");
        if (!metadataFile) {
            throw new Error("Metadata file not found");
        }
        // Use the uploaded arweave files in token metadata
        return `https://arweave.net/${metadataFile.transactionId}`;
    }
    async createMasterEditionInstructions({ mint, mintAuthority = this.provider.wallet.publicKey, payer = this.provider.wallet.publicKey, }) {
        const metadataPubkey = await Metadata.getPDA(mint);
        const masterEditionPubkey = await MasterEdition.getPDA(mint);
        const instructions = new CreateMasterEditionV3({
            feePayer: payer,
        }, {
            edition: masterEditionPubkey,
            metadata: metadataPubkey,
            mint,
            mintAuthority,
            updateAuthority: mintAuthority,
            maxSupply: new BN(0),
        }).instructions;
        return {
            instructions,
            signers: [],
            output: {
                metadata: metadataPubkey,
            }
        };
    }
    async createMasterEdition(args) {
        const { instructions, signers, output } = await this.createMasterEditionInstructions(args);
        await this.sendInstructions(instructions, signers, args.payer);
        return output;
    }
    async verifyCollectionInstructions({ nftMint, collectionMint, payer = this.provider.wallet.publicKey, }) {
        const metadataAccount = await Metadata.getPDA(nftMint);
        const collectionMetadataAccount = await Metadata.getPDA(collectionMint);
        const collectionMasterEdition = await MasterEdition.getPDA(collectionMint);
        const instructions = new VerifyCollection({ feePayer: payer }, {
            metadata: metadataAccount,
            collectionAuthority: this.provider.wallet.publicKey,
            collectionMint: collectionMint,
            collectionMetadata: collectionMetadataAccount,
            collectionMasterEdition: collectionMasterEdition,
        }).instructions;
        return {
            instructions,
            signers: [],
            output: {
                metadata: metadataAccount,
            }
        };
    }
    async verifyCollection(args) {
        const { instructions, signers, output } = await this.verifyCollectionInstructions(args);
        await this.sendInstructions(instructions, signers, args.payer);
        return output;
    }
    async createMetadataInstructions({ data, authority = this.provider.wallet.publicKey, mint, mintAuthority = this.provider.wallet.publicKey, payer = this.provider.wallet.publicKey, }) {
        const metadata = await Metadata.getPDA(mint);
        const instructions = new CreateMetadataV2({
            feePayer: payer,
        }, {
            metadata,
            mint,
            metadataData: new DataV2({ ...data }),
            mintAuthority,
            updateAuthority: authority,
        }).instructions;
        return {
            instructions,
            signers: [],
            output: {
                metadata,
            },
        };
    }
    async getMetadata(metadataKey) {
        const metadataAcc = await this.provider.connection.getAccountInfo(metadataKey);
        return metadataAcc && new Metadata(metadataKey, metadataAcc).data;
    }
    async createMetadata(args) {
        const { instructions, signers, output } = await this.createMetadataInstructions(args);
        await this.sendInstructions(instructions, signers, args.payer);
        return output;
    }
    async updateMetadataInstructions({ data, newAuthority, metadata, updateAuthority, }) {
        const metadataAcct = (await this.getMetadata(metadata));
        const instructions = new UpdateMetadataV2({}, {
            metadata,
            metadataData: data
                ? new DataV2({ ...data })
                : new DataV2({
                    ...metadataAcct.data,
                    collection: metadataAcct?.collection,
                    uses: metadataAcct?.uses,
                }),
            updateAuthority: updateAuthority || new PublicKey(metadataAcct.updateAuthority),
            newUpdateAuthority: typeof newAuthority == "undefined"
                ? new PublicKey(metadataAcct.updateAuthority)
                : newAuthority || undefined,
            primarySaleHappened: null,
            isMutable: null,
        }).instructions;
        return {
            instructions,
            signers: [],
            output: {
                metadata,
            },
        };
    }
    async updateMetadata(args) {
        const { instructions, signers, output } = await this.updateMetadataInstructions(args);
        await this.sendInstructions(instructions, signers, args.payer);
        return output;
    }
}
//# sourceMappingURL=splTokenMetadata.js.map