import { PublicKey } from "@solana/web3.js";
/**
 * Use mint cap information for a token bonding curve to get information like the number of
 * items remaining
 */
export declare const useCapInfo: (tokenBondingKey: PublicKey | undefined, useTokenOfferingCurve?: boolean) => {
    loading: boolean;
    numRemaining: number;
    mintCap: number;
};
//# sourceMappingURL=useCapInfo.d.ts.map