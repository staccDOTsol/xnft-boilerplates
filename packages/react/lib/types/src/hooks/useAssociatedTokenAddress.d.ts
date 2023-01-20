import { PublicKey } from "@solana/web3.js";
interface AssocState {
    loading: boolean;
    result?: PublicKey;
}
export declare function useAssociatedTokenAddress(wallet: PublicKey | undefined | null, mint: PublicKey | undefined | null): AssocState;
export {};
//# sourceMappingURL=useAssociatedTokenAddress.d.ts.map