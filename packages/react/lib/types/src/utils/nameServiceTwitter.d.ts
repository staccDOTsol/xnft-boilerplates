import { NameRegistryState } from "@solana/spl-name-service";
import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
export declare function getTwitterRegistryKey(handle: string, twitterRootParentRegistryKey?: PublicKey): Promise<PublicKey>;
export declare function getTwitterRegistry(connection: Connection, twitter_handle: string, twitterRootParentRegistryKey?: PublicKey): Promise<NameRegistryState>;
export declare function createVerifiedTwitterRegistry(connection: Connection, twitterHandle: string, verifiedPubkey: PublicKey, space: number, // The space that the user will have to write data into the verified registry
payerKey: PublicKey, nameProgramId?: PublicKey, twitterVerificationAuthority?: PublicKey, twitterRootParentRegistryKey?: PublicKey): Promise<TransactionInstruction[]>;
export declare function createReverseTwitterRegistry(connection: Connection, twitterHandle: string, twitterRegistryKey: PublicKey, verifiedPubkey: PublicKey, payerKey: PublicKey, nameProgramId?: PublicKey, twitterVerificationAuthority?: PublicKey, twitterRootParentRegistryKey?: PublicKey): Promise<TransactionInstruction[]>;
//# sourceMappingURL=nameServiceTwitter.d.ts.map