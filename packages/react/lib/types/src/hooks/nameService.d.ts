import { ReverseTwitterRegistryState } from "@solana/spl-name-service";
import { Connection, PublicKey } from "@solana/web3.js";
export declare function reverseNameLookup(connection: Connection, owner: PublicKey, verifier?: PublicKey, tld?: PublicKey): Promise<ReverseTwitterRegistryState>;
interface ReverseNameState {
    loading: boolean;
    nameString: string | undefined;
    error: Error | undefined;
}
export declare function useReverseName(owner: PublicKey | undefined, verifier?: PublicKey, tld?: PublicKey): ReverseNameState;
interface NameState {
    loading: boolean;
    owner: PublicKey | undefined;
    error: Error | undefined;
}
export declare function useNameOwner(nameString: string | undefined, tld?: PublicKey): NameState;
export {};
//# sourceMappingURL=nameService.d.ts.map