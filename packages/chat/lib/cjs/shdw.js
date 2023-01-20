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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomizeFileName = exports.uploadFiles = exports.initStorageIfNeeded = void 0;
const sdk_1 = require("@orca-so/sdk");
const anchor_1 = require("@project-serum/anchor");
const sdk_2 = require("@shadow-drive/sdk");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const spl_utils_1 = require("@strata-foundation/spl-utils");
const bn_js_1 = __importDefault(require("bn.js"));
const decimal_js_1 = __importDefault(require("decimal.js"));
class NodeWallet {
    constructor(payer) {
        this.payer = payer;
    }
    signTransaction(tx) {
        return __awaiter(this, void 0, void 0, function* () {
            tx.partialSign(this.payer);
            return tx;
        });
    }
    signAllTransactions(txs) {
        return __awaiter(this, void 0, void 0, function* () {
            return txs.map((t) => {
                t.partialSign(this.payer);
                return t;
            });
        });
    }
    get publicKey() {
        return this.payer.publicKey;
    }
}
exports.default = NodeWallet;
const PROGRAM_ID = new web3_js_1.PublicKey("2e1wdyNhUvE76y6yUCvah2KaviavMJYKoRun8acMRBZZ");
const SHDW = new web3_js_1.PublicKey("SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y");
function getStorageAccount(key, accountSeed) {
    return web3_js_1.PublicKey.findProgramAddress([
        Buffer.from("storage-account"),
        key.toBytes(),
        accountSeed.toTwos(2).toArrayLike(Buffer, "le", 4),
    ], PROGRAM_ID);
}
function getOwnedAmount(provider, wallet, mint) {
    return __awaiter(this, void 0, void 0, function* () {
        const ata = yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, mint, wallet, true);
        const mintAcc = yield (0, spl_utils_1.getMintInfo)(provider, mint);
        const acct = yield provider.connection.getAccountInfo(ata, "confirmed");
        if (acct) {
            return (0, spl_utils_1.toNumber)(spl_token_1.u64.fromBuffer(spl_token_1.AccountLayout.decode(acct.data).amount), mintAcc);
        }
        return 0;
    });
}
function getEndpoint(connection) {
    // @ts-ignore
    const endpoint = connection._rpcEndpoint;
    // Gengo only works on mainnet
    if (endpoint.includes("dev") ||
        endpoint.includes("localhost")) {
        return "https://ssc-dao.genesysgo.net";
    }
    return endpoint;
}
function initStorageIfNeeded(provider, delegateWallet, sizeBytes) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (sizeBytes == 0) {
            return;
        }
        if (provider) {
            delegateWallet = maybeUseDevnetWallet(provider === null || provider === void 0 ? void 0 : provider.connection, delegateWallet);
            const connection = new web3_js_1.Connection(getEndpoint(provider.connection), "max");
            const localProvider = new anchor_1.AnchorProvider(connection, delegateWallet ? new NodeWallet(delegateWallet) : provider.wallet, {});
            const pubKey = delegateWallet
                ? delegateWallet.publicKey
                : provider.wallet.publicKey;
            const shdwDrive = new sdk_2.ShdwDrive(localProvider.connection, localProvider.wallet);
            const [accountKey] = yield getStorageAccount(pubKey, new bn_js_1.default(0));
            let storageAccount;
            try {
                storageAccount = yield shdwDrive.getStorageAccount(accountKey);
            }
            catch (e) {
                // ignore
            }
            // Double storage size every time there's not enough
            let sizeKB = 0;
            const storageAvailable = storageAccount &&
                Number(storageAccount.reserved_bytes) -
                    Number(storageAccount.current_usage);
            const storageAccountBigEnough = storageAvailable && storageAvailable > sizeBytes;
            if (!storageAccountBigEnough) {
                let sizeToAdd = Number(storageAvailable || 2 * sizeBytes);
                while (sizeToAdd < sizeBytes) {
                    sizeToAdd += sizeToAdd;
                }
                sizeKB = Math.ceil(sizeToAdd / 1024);
            }
            else if (!storageAccount) {
                sizeKB = Math.ceil((2 * sizeBytes) / 1024);
            }
            console.log(`Storage currently has ${Number(storageAvailable || 0)}, file size is ${sizeBytes}, adding ${sizeKB} KB`);
            const shadesNeeded = storageAccountBigEnough
                ? 0
                : Math.max(sizeKB * 1024, 1);
            const shdwNeeded = shadesNeeded / Math.pow(10, 9);
            const shdwOwnedAmount = yield getOwnedAmount(localProvider, pubKey, SHDW);
            const solOwnedAmount = (_a = (yield connection.getAccountInfo(pubKey))) === null || _a === void 0 ? void 0 : _a.lamports;
            if (shdwOwnedAmount < shdwNeeded) {
                if (!solOwnedAmount) {
                    throw new Error("Not enough sol in wallet " + pubKey.toBase58());
                }
                const orca = (0, sdk_1.getOrca)(localProvider.connection);
                const orcaSolPool = orca.getPool(sdk_1.OrcaPoolConfig.SHDW_SOL);
                const solToken = orcaSolPool.getTokenB();
                const shdwToken = orcaSolPool.getTokenA();
                const quote = yield orcaSolPool.getQuote(shdwToken, 
                // Add 5% more than we need, at least need 1 shade
                new decimal_js_1.default(shdwNeeded * 1.5));
                console.log(`Not enough SHDW, buying ${shdwNeeded} SHDW for ~${quote
                    .getExpectedOutputAmount()
                    .toNumber()} SOL`);
                if (quote.getExpectedOutputAmount().toU64().gte(new bn_js_1.default(solOwnedAmount))) {
                    throw new Error("Not enough sol");
                }
                const swapPayload = yield orcaSolPool.swap(pubKey, solToken, quote.getExpectedOutputAmount(), new decimal_js_1.default(shdwNeeded));
                const tx = swapPayload.transaction;
                tx.recentBlockhash = (yield localProvider.connection.getRecentBlockhash()).blockhash;
                tx.feePayer = pubKey;
                const signers = [...swapPayload.signers, delegateWallet].filter(spl_utils_1.truthy);
                tx.sign(...signers);
                yield (0, spl_utils_1.sendAndConfirmWithRetry)(localProvider.connection, tx.serialize(), {
                    skipPreflight: true,
                }, "max");
                // Even with max confirmation, still this sometimes fails
                yield (0, spl_utils_1.sleep)(2000);
            }
            yield shdwDrive.init();
            // TODO: Ensure immutable. Rn throws invalid account descriminator for v1 accounts
            // if (storageAccount && !storageAccount.immutable) {
            //   await withRetries(
            //     () => shdwDrive.makeStorageImmutable(accountKey, "v2"),
            //     3
            //   );
            // }
            if (storageAccount && sizeKB && !storageAccountBigEnough) {
                yield withRetries(() => shdwDrive.addStorage(accountKey, sizeKB + "KB", "v2"), 3);
            }
            else if (!storageAccount) {
                yield withRetries(() => shdwDrive.createStorageAccount("chat", sizeKB + "KB", "v2"), 3);
                yield withRetries(() => shdwDrive.makeStorageImmutable(accountKey, "v2"), 3);
            }
        }
    });
}
exports.initStorageIfNeeded = initStorageIfNeeded;
function uploadFiles(provider, files, delegateWallet, tries = 5) {
    return __awaiter(this, void 0, void 0, function* () {
        if (files.length == 0) {
            return [];
        }
        const size = files.reduce((acc, f) => acc + f.size, 0);
        yield initStorageIfNeeded(provider, delegateWallet, size);
        if (provider) {
            delegateWallet = maybeUseDevnetWallet(provider.connection, delegateWallet);
            const pubKey = delegateWallet
                ? delegateWallet.publicKey
                : provider.wallet.publicKey;
            const [accountKey] = yield getStorageAccount(pubKey, new bn_js_1.default(0));
            const shdwDrive = new sdk_2.ShdwDrive(
            // @ts-ignore
            new web3_js_1.Connection(getEndpoint(provider.connection), "max"), delegateWallet ? new NodeWallet(delegateWallet) : provider.wallet);
            yield shdwDrive.init();
            const res = yield withRetries(() => __awaiter(this, void 0, void 0, function* () {
                const uploaded = (yield shdwDrive.uploadMultipleFiles(accountKey, 
                // @ts-ignore
                files)).map((r) => r.location);
                if (uploaded.length !== files.length) {
                    throw new Error("Upload failed");
                }
                return uploaded;
            }), tries);
            return res;
        }
    });
}
exports.uploadFiles = uploadFiles;
function randomizeFileName(file) {
    const ext = file.name.split(".").pop();
    const name = randomIdentifier() + (ext ? `.${ext}` : "");
    Object.defineProperty(file, "name", {
        writable: true,
        value: name,
    });
}
exports.randomizeFileName = randomizeFileName;
function randomIdentifier() {
    return Math.random().toString(32).slice(2);
}
// docusaurus SSR has issues with Keypair.fromSecretKey running, not sure why.
const getDevnetWallet = () => {
    try {
        return web3_js_1.Keypair.fromSecretKey(new Uint8Array([
            17, 83, 103, 136, 230, 98, 37, 214, 218, 31, 168, 218, 184, 30, 163, 18,
            164, 101, 117, 232, 151, 205, 200, 74, 198, 52, 31, 21, 234, 238, 220,
            182, 9, 99, 203, 242, 226, 192, 165, 246, 188, 184, 61, 204, 50, 228,
            30, 89, 215, 145, 146, 206, 179, 116, 224, 158, 180, 176, 27, 221, 238,
            77, 69, 207,
        ]));
    }
    catch (e) {
        //ignore
    }
};
// A devnet wallet loaded with 1 SHDW for testing in devnet. Yes, anyone can mess with this wallet.
// If they do, devnet shdw things will not continue working. That's life. If you find this,
// please don't be an asshole.
const DEVNET_WALLET = getDevnetWallet();
function maybeUseDevnetWallet(connection, delegateWallet) {
    // @ts-ignore
    if (connection._rpcEndpoint.includes("dev") || connection._rpcEndpoint.includes("localhost")) {
        return DEVNET_WALLET;
    }
    return delegateWallet;
}
function withRetries(arg0, tries = 3) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield arg0();
        }
        catch (e) {
            if (tries > 0) {
                console.warn(`Failed tx, retrying up to ${tries} more times.`, e);
                yield (0, spl_utils_1.sleep)(1000);
                return withRetries(arg0, tries - 1);
            }
            throw e;
        }
    });
}
//# sourceMappingURL=shdw.js.map