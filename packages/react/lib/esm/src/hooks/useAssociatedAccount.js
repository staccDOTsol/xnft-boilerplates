import { useMemo } from "react";
import { useAssociatedTokenAddress } from "./useAssociatedTokenAddress";
import { useTokenAccount } from "./useTokenAccount";
/**
 * Get the associcated token account for this wallet, or the account itself is this address is already an ata
 *
 * @param walletOrAta
 * @param mint
 * @returns
 */
export function useAssociatedAccount(walletOrAta, mint) {
    const { result: associatedTokenAddress, loading: loading } = useAssociatedTokenAddress(walletOrAta, mint);
    const { info: associatedAccount, loading: loading2 } = useTokenAccount(associatedTokenAddress);
    const { info: account, loading: loading3 } = useTokenAccount(walletOrAta || undefined);
    const result = useMemo(() => {
        if (account?.mint === mint) {
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
//# sourceMappingURL=useAssociatedAccount.js.map