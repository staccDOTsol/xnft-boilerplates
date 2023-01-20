/// <reference types="node" />
import { AccountInfo, Connection, PublicKey } from "@solana/web3.js";
import { AccountInfo as TokenAccountInfo } from "@solana/spl-token";
export declare const deserializeAccount: (data: Buffer) => any;
export interface TokenAccount {
    pubkey: PublicKey;
    account: AccountInfo<Buffer>;
    info: TokenAccountInfo;
}
export declare const TokenAccountParser: (pubKey: PublicKey, info: AccountInfo<Buffer>) => TokenAccount | undefined;
export declare const getWalletTokenAccounts: (connection: Connection, owner?: PublicKey) => Promise<TokenAccount[]>;
//# sourceMappingURL=getWalletTokenAccounts.d.ts.map