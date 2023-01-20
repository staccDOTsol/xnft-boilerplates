"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTokenAccount = void 0;
const useAccount_1 = require("./useAccount");
const getWalletTokenAccounts_1 = require("../utils/getWalletTokenAccounts");
const parser = (pubkey, acct) => {
    var _a;
    return (_a = (0, getWalletTokenAccounts_1.TokenAccountParser)(pubkey, acct)) === null || _a === void 0 ? void 0 : _a.info;
};
function useTokenAccount(address) {
    return (0, useAccount_1.useAccount)(address, parser);
}
exports.useTokenAccount = useTokenAccount;
//# sourceMappingURL=useTokenAccount.js.map