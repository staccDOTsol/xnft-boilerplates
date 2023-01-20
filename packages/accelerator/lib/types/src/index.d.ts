import { PublicKey, Transaction } from "@solana/web3.js";
export { subscribeTransactions, hydrateTransactions, } from "./subscribeTransactions";
export type { TransactionResponseWithSig } from "./subscribeTransactions";
export declare enum Cluster {
    Devnet = "devnet",
    Mainnet = "mainnet-beta",
    Testnet = "testnet",
    Localnet = "localnet"
}
declare enum ResponseType {
    Error = "error",
    Transaction = "transaction",
    Unsubscribe = "unsubscribe",
    Subscribe = "subscribe"
}
interface Response {
    type: ResponseType;
}
export declare class Accelerator {
    ws: WebSocket;
    listeners: Record<string, (resp: Response) => void>;
    subs: Record<string, any>;
    transactionListeners: Record<string, string>;
    static waitForConnect(socket: WebSocket): Promise<WebSocket>;
    static init(url: string): Promise<Accelerator>;
    constructor({ ws }: {
        ws: WebSocket;
    });
    private send;
    sendTransaction(cluster: Cluster, tx: Transaction): void;
    unsubscribeTransaction(listenerId: string): Promise<void>;
    onTransaction(cluster: Cluster, account: PublicKey, callback: (resp: {
        txid: string;
        logs: string[] | null;
        transaction: Transaction;
        blockTime: number;
    }) => void): Promise<string>;
    _onTransaction(cluster: Cluster, account: PublicKey, callback: (resp: {
        txid: string;
        transaction: Transaction;
        blockTime: number;
        logs: string[] | null;
    }) => void): Promise<string>;
    listen(listener: (resp: Response) => void): string;
    unlisten(id: string): void;
    listenOnce(matcher: (resp: Response) => boolean): Promise<Response>;
    initSocket(ws: WebSocket): void;
    onMessage(message: MessageEvent<any>): void;
}
//# sourceMappingURL=index.d.ts.map