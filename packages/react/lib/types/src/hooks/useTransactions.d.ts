import { PublicKey } from "@solana/web3.js";
import { TransactionResponseWithSig } from "@strata-foundation/accelerator";
interface ITransactions {
    error: Error | undefined;
    hasMore: boolean;
    loadingInitial: boolean;
    loadingMore: boolean;
    transactions: TransactionResponseWithSig[];
    fetchMore(num: number): Promise<void>;
    fetchNew(num: number): Promise<void>;
}
export declare const useTransactions: ({ numTransactions, until, address, subscribe, accelerated, lazy, }: {
    numTransactions: number;
    until?: Date;
    address?: PublicKey;
    /** Subscribe to new transactions on the address */
    subscribe?: boolean;
    /** Use the Strata accelerator service to see transacions before they are confirmed (if the user also sends to the accelerator) */
    accelerated?: boolean;
    /** If lazy, don't fetch until fetchNew called */
    lazy?: boolean;
}) => ITransactions;
export {};
//# sourceMappingURL=useTransactions.d.ts.map