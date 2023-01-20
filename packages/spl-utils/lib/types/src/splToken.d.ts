/// <reference types="node" />
import { AnchorProvider } from "@project-serum/anchor";
import { AccountInfo, MintInfo } from "@solana/spl-token";
import { Keypair, PublicKey, TransactionInstruction } from "@solana/web3.js";
export declare function createMint(provider: AnchorProvider, authority?: PublicKey, decimals?: number, mintKeypair?: Keypair): Promise<PublicKey>;
export declare function createMintInstructions(provider: AnchorProvider, authority: PublicKey, mint: PublicKey, decimals?: number, freezeAuthority?: PublicKey): Promise<TransactionInstruction[]>;
export declare function getMintInfo(provider: AnchorProvider, addr: PublicKey): Promise<MintInfo>;
export declare function createAtaAndMint(provider: AnchorProvider, mint: PublicKey, amount: number, to?: PublicKey, authority?: PublicKey, payer?: PublicKey, confirmOptions?: any): Promise<PublicKey>;
export declare function parseMintAccount(data: Buffer): MintInfo;
export declare function getTokenAccount(provider: AnchorProvider, addr: PublicKey): Promise<AccountInfo>;
export declare function parseTokenAccount(data: Buffer): AccountInfo;
export declare function sleep(ms: number): Promise<any>;
//# sourceMappingURL=splToken.d.ts.map