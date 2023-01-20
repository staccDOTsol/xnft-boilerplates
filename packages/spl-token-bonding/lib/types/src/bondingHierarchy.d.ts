import { PublicKey } from "@solana/web3.js";
import { ITokenBonding, IPricingCurve } from ".";
export declare class BondingHierarchy {
    parent?: BondingHierarchy;
    child?: BondingHierarchy;
    tokenBonding: ITokenBonding;
    pricingCurve: IPricingCurve;
    wrappedSolMint: PublicKey;
    constructor({ parent, child, tokenBonding, pricingCurve, wrappedSolMint, }: {
        parent?: BondingHierarchy;
        child?: BondingHierarchy;
        tokenBonding: ITokenBonding;
        pricingCurve: IPricingCurve;
        wrappedSolMint: PublicKey;
    });
    toArray(): BondingHierarchy[];
    lowestOrUndefined(one: PublicKey, two: PublicKey): PublicKey | undefined;
    lowest(one: PublicKey, two: PublicKey): PublicKey;
    highestOrUndefined(one: PublicKey, two: PublicKey): PublicKey | undefined;
    highest(one: PublicKey, two: PublicKey): PublicKey;
    /**
     * Get the path from one token to another.
     *
     * @param one
     * @param two
     * @param ignoreFrozen - Ignore frozen curves, just compute the value
     */
    path(one: PublicKey, two: PublicKey, ignoreFrozen?: boolean): BondingHierarchy[];
    /**
     * Find the bonding curve whose target is this mint
     *
     * @param mint
     */
    findTarget(mint: PublicKey): ITokenBonding;
    /**
     * Does this hierarchy contain all of these mints?
     *
     * @param mints
     */
    contains(...mints: PublicKey[]): boolean;
}
//# sourceMappingURL=bondingHierarchy.d.ts.map