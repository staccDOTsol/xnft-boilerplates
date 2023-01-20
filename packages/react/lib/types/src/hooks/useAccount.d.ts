/// <reference types="node" />
import { PublicKey, AccountInfo } from "@solana/web3.js";
import { TypedAccountParser } from "@strata-foundation/spl-utils";
export interface ParsedAccountBase {
    pubkey: PublicKey;
    account: AccountInfo<Buffer>;
    info: any;
}
export interface UseAccountState<T> {
    loading: boolean;
    account?: AccountInfo<Buffer>;
    info?: T;
}
/**
 * Generic hook to get a cached, auto updating, deserialized form of any Solana account. Massively saves on RPC usage by using
 * the spl-utils accountFetchCache.
 *
 * @param key
 * @param parser
 * @param isStatic
 * @returns
 */
export declare function useAccount<T>(key: null | undefined | PublicKey, parser?: TypedAccountParser<T>, isStatic?: Boolean): UseAccountState<T>;
//# sourceMappingURL=useAccount.d.ts.map