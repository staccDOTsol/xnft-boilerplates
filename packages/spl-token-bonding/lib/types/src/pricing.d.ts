import { PublicKey } from "@solana/web3.js";
import { BondingHierarchy } from ".";
export interface IBondingPricing {
    get hierarchy(): BondingHierarchy;
    current(baseMint: PublicKey, unixTime?: number): number;
    locked(baseMint?: PublicKey): number;
    swap(baseAmount: number, baseMint: PublicKey, targetMint: PublicKey, ignoreFrozen: boolean, unixTime?: number): number;
    isBuying(lowMint: PublicKey, targetMint: PublicKey): boolean;
    swapTargetAmount(targetAmount: number, baseMint: PublicKey, targetMint: PublicKey, 
    /** Ignore frozen curves, just compute the value. */
    ignoreFreeze: boolean, unixTime?: number): number;
    sellTargetAmount(targetAmountNum: number, baseMint?: PublicKey, unixTime?: number): number;
    buyTargetAmount(targetAmountNum: number, baseMint?: PublicKey, unixTime?: number): number;
    buyWithBaseAmount(baseAmountNum: number, baseMint?: PublicKey, unixTime?: number): number;
}
export declare class BondingPricing implements IBondingPricing {
    hierarchy: BondingHierarchy;
    constructor(args: {
        hierarchy: BondingHierarchy;
    });
    current(baseMint?: PublicKey, unixTime?: number): number;
    locked(baseMint?: PublicKey): number;
    swap(baseAmount: number, baseMint: PublicKey, targetMint: PublicKey, ignoreFrozen?: boolean, unixTime?: number): number;
    isBuying(lowMint: PublicKey, targetMint: PublicKey): boolean;
    swapTargetAmount(targetAmount: number, baseMint: PublicKey, targetMint: PublicKey, 
    /** Ignore frozen curves, just compute the value. */
    ignoreFreeze?: boolean, unixTime?: number): number;
    sellTargetAmount(targetAmountNum: number, baseMint?: PublicKey, unixTime?: number): number;
    buyTargetAmount(targetAmountNum: number, baseMint?: PublicKey, unixTime?: number): number;
    buyWithBaseAmount(baseAmountNum: number, baseMint?: PublicKey, unixTime?: number): number;
}
//# sourceMappingURL=pricing.d.ts.map