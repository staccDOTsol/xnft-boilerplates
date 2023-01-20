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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWalletTokenAccounts = exports.TokenAccountParser = exports.deserializeAccount = void 0;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const truthy_1 = require("./truthy");
const deserializeAccount = (data) => {
    const accountInfo = spl_token_1.AccountLayout.decode(data);
    accountInfo.mint = new web3_js_1.PublicKey(accountInfo.mint);
    accountInfo.owner = new web3_js_1.PublicKey(accountInfo.owner);
    accountInfo.amount = spl_token_1.u64.fromBuffer(accountInfo.amount);
    if (accountInfo.delegateOption === 0) {
        accountInfo.delegate = null;
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
};
exports.deserializeAccount = deserializeAccount;
const TokenAccountParser = (pubKey, info) => {
    // Sometimes a wrapped sol account gets closed, goes to 0 length,
    // triggers an update over wss which triggers this guy to get called
    // since your UI already logged that pubkey as a token account. Check for length.
    if (info.data.length > 0) {
        const buffer = Buffer.from(info.data);
        const data = (0, exports.deserializeAccount)(buffer);
        const details = {
            pubkey: pubKey,
            account: Object.assign({}, info),
            info: data,
        };
        return details;
    }
};
exports.TokenAccountParser = TokenAccountParser;
const getWalletTokenAccounts = (connection, owner) => __awaiter(void 0, void 0, void 0, function* () {
    if (!owner) {
        return [];
    }
    // user accounts are updated via ws subscription
    const accounts = yield connection.getTokenAccountsByOwner(owner, {
        programId: spl_token_1.TOKEN_PROGRAM_ID,
    });
    const tokenAccounts = accounts.value
        .map((info) => (0, exports.TokenAccountParser)(info.pubkey, info.account))
        .filter(truthy_1.truthy)
        .filter((t) => t.info.amount.gt(new spl_token_1.u64(0)));
    return tokenAccounts;
});
exports.getWalletTokenAccounts = getWalletTokenAccounts;
//# sourceMappingURL=getWalletTokenAccounts.js.map