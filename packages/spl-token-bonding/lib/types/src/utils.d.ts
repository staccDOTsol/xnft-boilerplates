import BN from "bn.js";
import { toBN as toBNUtils, toNumber as toNumberUtils, amountAsNum as amountAsNumUtils, supplyAsNum as supplyAsNumUtils } from "@strata-foundation/spl-utils";
/**
 * Convert a number to a 12 decimal fixed precision u128
 *
 * @param num Number to convert to a 12 decimal fixed precision BN
 * @returns
 */
export declare function toU128(num: number | BN): BN;
export declare const toNumber: typeof toNumberUtils;
export declare const toBN: typeof toBNUtils;
export declare const amountAsNum: typeof amountAsNumUtils;
export declare const supplyAsNum: typeof supplyAsNumUtils;
export declare function asDecimal(percent: number): number;
//# sourceMappingURL=utils.d.ts.map