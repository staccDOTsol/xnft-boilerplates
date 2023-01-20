"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BondingHierarchy = void 0;
const spl_token_1 = require("@solana/spl-token");
function sanitizeSolMint(mint, wrappedSolMint) {
    if (mint.equals(spl_token_1.NATIVE_MINT)) {
        return wrappedSolMint;
    }
    return mint;
}
class BondingHierarchy {
    constructor({ parent, child, tokenBonding, pricingCurve, wrappedSolMint, }) {
        this.parent = parent;
        this.child = child;
        this.tokenBonding = tokenBonding;
        this.pricingCurve = pricingCurve;
        this.wrappedSolMint = wrappedSolMint;
    }
    toArray() {
        let arr = [];
        let current = this;
        do {
            arr.push(current);
            current = current === null || current === void 0 ? void 0 : current.parent;
        } while (current);
        return arr;
    }
    lowestOrUndefined(one, two) {
        var _a, _b;
        return (_b = (_a = this.toArray().find((hierarchy) => hierarchy.tokenBonding.targetMint.equals(sanitizeSolMint(one, this.wrappedSolMint)) ||
            hierarchy.tokenBonding.targetMint.equals(sanitizeSolMint(two, this.wrappedSolMint)))) === null || _a === void 0 ? void 0 : _a.tokenBonding) === null || _b === void 0 ? void 0 : _b.targetMint;
    }
    lowest(one, two) {
        const found = this.lowestOrUndefined(one, two);
        if (!found) {
            throw new Error(`No bonding found with target mint ${one.toBase58()} or ${two.toBase58()}`);
        }
        return found;
    }
    highestOrUndefined(one, two) {
        var _a, _b;
        return (_b = (_a = this.toArray().find((hierarchy) => hierarchy.tokenBonding.baseMint.equals(sanitizeSolMint(one, this.wrappedSolMint)) ||
            hierarchy.tokenBonding.baseMint.equals(sanitizeSolMint(two, this.wrappedSolMint)))) === null || _a === void 0 ? void 0 : _a.tokenBonding) === null || _b === void 0 ? void 0 : _b.baseMint;
    }
    highest(one, two) {
        const found = this.highestOrUndefined(one, two);
        if (!found) {
            throw new Error(`No bonding found with target mint ${one.toBase58()} or ${two.toBase58()}`);
        }
        return found;
    }
    /**
     * Get the path from one token to another.
     *
     * @param one
     * @param two
     * @param ignoreFrozen - Ignore frozen curves, just compute the value
     */
    path(one, two, ignoreFrozen = false) {
        const lowest = this.lowestOrUndefined(one, two);
        if (!lowest) {
            return [];
        }
        const highest = lowest.equals(one)
            ? sanitizeSolMint(two, this.wrappedSolMint)
            : sanitizeSolMint(one, this.wrappedSolMint);
        const arr = this.toArray();
        const lowIdx = arr.findIndex((h) => h.tokenBonding.targetMint.equals(lowest));
        const highIdx = arr.findIndex((h) => h.tokenBonding.baseMint.equals(highest));
        const buying = lowest.equals(two);
        const result = arr.slice(lowIdx, highIdx + 1);
        if (ignoreFrozen ||
            result.every((r) => buying ? !r.tokenBonding.buyFrozen : !r.tokenBonding.sellFrozen)) {
            return result;
        }
        else {
            return [];
        }
    }
    /**
     * Find the bonding curve whose target is this mint
     *
     * @param mint
     */
    findTarget(mint) {
        return this.toArray().find((h) => h.tokenBonding.targetMint.equals(mint))
            .tokenBonding;
    }
    /**
     * Does this hierarchy contain all of these mints?
     *
     * @param mints
     */
    contains(...mints) {
        const availableMints = new Set(this.toArray().flatMap((h) => [
            h.tokenBonding.baseMint.toBase58(),
            h.tokenBonding.targetMint.toBase58(),
        ]));
        return mints.every((mint) => availableMints.has(sanitizeSolMint(mint, this.wrappedSolMint).toBase58()));
    }
}
exports.BondingHierarchy = BondingHierarchy;
//# sourceMappingURL=bondingHierarchy.js.map