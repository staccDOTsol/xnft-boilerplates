"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAssociatedAccount = void 0;
const react_1 = require("react");
const useAssociatedTokenAddress_1 = require("./useAssociatedTokenAddress");
const useTokenAccount_1 = require("./useTokenAccount");
/**
 * Get the associcated token account for this wallet, or the account itself is this address is already an ata
 *
 * @param walletOrAta
 * @param mint
 * @returns
 */
function useAssociatedAccount(walletOrAta, mint) {
    const { result: associatedTokenAddress, loading: loading } = (0, useAssociatedTokenAddress_1.useAssociatedTokenAddress)(walletOrAta, mint);
    const { info: associatedAccount, loading: loading2 } = (0, useTokenAccount_1.useTokenAccount)(associatedTokenAddress);
    const { info: account, loading: loading3 } = (0, useTokenAccount_1.useTokenAccount)(walletOrAta || undefined);
    const result = (0, react_1.useMemo)(() => {
        if ((account === null || account === void 0 ? void 0 : account.mint) === mint) {
            // The passed value is the ata
            return account;
        }
        else {
            return associatedAccount;
        }
    }, [associatedAccount, account, mint]);
    return {
        associatedAccount: result,
        loading: loading || loading2 || loading3,
        associatedAccountKey: associatedTokenAddress,
    };
}
exports.useAssociatedAccount = useAssociatedAccount;
//# sourceMappingURL=useAssociatedAccount.js.map