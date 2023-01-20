"use strict";
// Copied from https://github.com/project-serum/serum-ts/blob/master/packages/common/src/index.ts
// This package hasn't had it's dependencies updated in a year and so explodes with newer versions of web3js
// Better to just cut the dependency
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
exports.sleep = exports.parseTokenAccount = exports.getTokenAccount = exports.parseMintAccount = exports.createAtaAndMint = exports.getMintInfo = exports.createMintInstructions = exports.createMint = void 0;
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
function createMint(provider, authority, decimals, mintKeypair) {
    return __awaiter(this, void 0, void 0, function* () {
        if (authority === undefined) {
            authority = provider.wallet.publicKey;
        }
        if (mintKeypair === undefined) {
            mintKeypair = web3_js_1.Keypair.generate();
        }
        const instructions = yield createMintInstructions(provider, authority, mintKeypair.publicKey, decimals);
        const tx = new web3_js_1.Transaction();
        tx.add(...instructions);
        yield provider.sendAndConfirm(tx, [mintKeypair], {});
        return mintKeypair.publicKey;
    });
}
exports.createMint = createMint;
function createMintInstructions(provider, authority, mint, decimals, freezeAuthority) {
    return __awaiter(this, void 0, void 0, function* () {
        let instructions = [
            web3_js_1.SystemProgram.createAccount({
                fromPubkey: provider.wallet.publicKey,
                newAccountPubkey: mint,
                space: 82,
                lamports: yield provider.connection.getMinimumBalanceForRentExemption(82),
                programId: spl_token_1.TOKEN_PROGRAM_ID,
            }),
            spl_token_1.Token.createInitMintInstruction(spl_token_1.TOKEN_PROGRAM_ID, mint, decimals !== null && decimals !== void 0 ? decimals : 0, authority, freezeAuthority || null),
        ];
        return instructions;
    });
}
exports.createMintInstructions = createMintInstructions;
function getMintInfo(provider, addr) {
    return __awaiter(this, void 0, void 0, function* () {
        let depositorAccInfo = yield provider.connection.getAccountInfo(addr);
        if (depositorAccInfo === null) {
            throw new Error("Failed to find token account");
        }
        return parseMintAccount(depositorAccInfo.data);
    });
}
exports.getMintInfo = getMintInfo;
function createAtaAndMint(provider, mint, amount, to = provider.wallet.publicKey, authority = provider.wallet.publicKey, payer = provider.wallet.publicKey, confirmOptions = undefined) {
    return __awaiter(this, void 0, void 0, function* () {
        const ata = yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, mint, to);
        const mintTx = new web3_js_1.Transaction({ feePayer: payer });
        if (!(yield provider.connection.getAccountInfo(ata))) {
            mintTx.add(spl_token_1.Token.createAssociatedTokenAccountInstruction(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, mint, ata, to, payer));
        }
        mintTx.add(spl_token_1.Token.createMintToInstruction(spl_token_1.TOKEN_PROGRAM_ID, mint, ata, authority, [], amount));
        yield provider.sendAndConfirm(mintTx, undefined, confirmOptions);
        return ata;
    });
}
exports.createAtaAndMint = createAtaAndMint;
function parseMintAccount(data) {
    const m = spl_token_1.MintLayout.decode(data);
    m.mintAuthority = new web3_js_1.PublicKey(m.mintAuthority);
    m.supply = spl_token_1.u64.fromBuffer(m.supply);
    m.isInitialized = m.state !== 0;
    return m;
}
exports.parseMintAccount = parseMintAccount;
function getTokenAccount(provider, addr) {
    return __awaiter(this, void 0, void 0, function* () {
        let depositorAccInfo = yield provider.connection.getAccountInfo(addr);
        if (depositorAccInfo === null) {
            throw new Error("Failed to find token account");
        }
        return parseTokenAccount(depositorAccInfo.data);
    });
}
exports.getTokenAccount = getTokenAccount;
function parseTokenAccount(data) {
    const accountInfo = spl_token_1.AccountLayout.decode(data);
    accountInfo.mint = new web3_js_1.PublicKey(accountInfo.mint);
    accountInfo.owner = new web3_js_1.PublicKey(accountInfo.owner);
    accountInfo.amount = spl_token_1.u64.fromBuffer(accountInfo.amount);
    if (accountInfo.delegateOption === 0) {
        accountInfo.delegate = null;
        // eslint-disable-next-line new-cap
        accountInfo.delegatedAmount = new spl_token_1.u64(0);
    }
    else {
        accountInfo.delegate = new web3_js_1.PublicKey(accountInfo.delegate);
        accountInfo.delegatedAmount = spl_token_1.u64.fromBuffer(accountInfo.delegatedAmount);
    }
    accountInfo.isInitialized = accountInfo.state !== 0;
    accountInfo.isFrozen = accountInfo.state === 2;
    if (accountInfo.isNativeOption === 1) {
        accountInfo.rentExemptReserve = spl_token_1.u64.fromBuffer(accountInfo.isNative);
        accountInfo.isNative = true;
    }
    else {
        accountInfo.rentExemptReserve = null;
        accountInfo.isNative = false;
    }
    if (accountInfo.closeAuthorityOption === 0) {
        accountInfo.closeAuthority = null;
    }
    else {
        accountInfo.closeAuthority = new web3_js_1.PublicKey(accountInfo.closeAuthority);
    }
    return accountInfo;
}
exports.parseTokenAccount = parseTokenAccount;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.sleep = sleep;
//# sourceMappingURL=splToken.js.map