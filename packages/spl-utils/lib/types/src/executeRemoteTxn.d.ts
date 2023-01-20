/// <reference types="node" />
import { Provider, AnchorProvider } from "@project-serum/anchor";
/**
 * Execute transactions from a remote server (either single or multiple transactions)
 * @param provider
 * @param url
 * @param body
 * @param errors
 * @returns
 */
export declare function executeRemoteTxn(provider: AnchorProvider, url: string, body: any, errors?: Map<number, string>): Promise<string[]>;
export declare function signOnlyNeeded(provider: AnchorProvider, rawTxns: Buffer[]): Promise<Buffer[]>;
export declare function executeTxnsInOrder(provider: Provider, txns: Buffer[], errors?: Map<number, string>): Promise<string[]>;
/**
 * Get and sign transactions from a remote server (either single or multiple transactions)
 * @param provider
 * @param url
 * @param body
 * @param errors
 * @returns
 */
export declare function getAndSignRemoteTxns(provider: AnchorProvider, url: string, body: any): Promise<Buffer[]>;
//# sourceMappingURL=executeRemoteTxn.d.ts.map