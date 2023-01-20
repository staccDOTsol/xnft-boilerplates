import { AnchorProvider, Wallet } from "@project-serum/anchor";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
export default class NodeWallet implements Wallet {
    readonly payer: Keypair;
    constructor(payer: Keypair);
    signTransaction(tx: Transaction): Promise<Transaction>;
    signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
    get publicKey(): PublicKey;
}
export declare function initStorageIfNeeded(provider: AnchorProvider | undefined, delegateWallet: Keypair | undefined, sizeBytes: number): Promise<void>;
export declare function uploadFiles(provider: AnchorProvider | undefined, files: File[], delegateWallet: Keypair | undefined, tries?: number): Promise<string[] | undefined>;
export declare function randomizeFileName(file: File): void;
//# sourceMappingURL=shdw.d.ts.map