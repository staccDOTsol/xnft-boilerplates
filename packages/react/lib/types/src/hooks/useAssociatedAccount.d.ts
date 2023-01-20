import { AccountInfo as TokenAccountInfo } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
export interface AssociatedAccountState {
    associatedAccount?: TokenAccountInfo;
    associatedAccountKey?: PublicKey;
    loading: boolean;
}
/**
 * Get the associcated token account for this wallet, or the account itself is this address is already an ata
 *
 * @param walletOrAta
 * @param mint
 * @returns
 */
export declare function useAssociatedAccount(walletOrAta: PublicKey | undefined | null, mint: PublicKey | undefined | null): AssociatedAccountState;
//# sourceMappingURL=useAssociatedAccount.d.ts.map