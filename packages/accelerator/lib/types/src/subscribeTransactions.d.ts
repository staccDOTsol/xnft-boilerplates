import { ConfirmedSignatureInfo, Connection, PublicKey, TransactionResponse } from "@solana/web3.js";
import { Accelerator, Cluster } from ".";
export type TransactionResponseWithSig = Partial<TransactionResponse> & {
    signature: string;
    pending?: boolean;
    logs: string[] | null;
};
export declare function hydrateTransactions(connection: Connection | undefined, signatures: ConfirmedSignatureInfo[], tries?: number): Promise<TransactionResponseWithSig[]>;
export declare function subscribeTransactions({ connection, address, cluster, accelerator, callback, }: {
    connection: Connection;
    address: PublicKey;
    accelerator?: Accelerator;
    cluster: Cluster;
    callback: (tx: TransactionResponseWithSig) => void;
}): () => void;
//# sourceMappingURL=subscribeTransactions.d.ts.map