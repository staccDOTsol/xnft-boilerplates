import { PublicKey } from "@solana/web3.js";
export declare const AUTH_SIGNATURE_BODY = "I am creating an account to use Lit Protocol at {{timestamp}}";
export declare type MessageSigner = {
    signMessage: (data: Uint8Array, encoding: string) => Uint8Array;
};
export declare function getAuthSig(publicKey: PublicKey, signer: Uint8Array | MessageSigner): Promise<{
    sig: string;
    derivedVia: string;
    signedMessage: string;
    address: string;
}>;
//# sourceMappingURL=lit.d.ts.map