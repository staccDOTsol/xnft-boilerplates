import BN from "bn.js";
import { MintInfo, u64 } from "@solana/spl-token";
export type Truthy<T> = T extends false | "" | 0 | null | undefined ? never : T;
export declare const truthy: <T>(value: T) => value is Truthy<T>;
export declare function toNumber(numberOrBn: BN | number, mint: MintInfo): number;
export declare function amountAsNum(amount: u64, mint: MintInfo): number;
export declare function toBN(numberOrBn: BN | number, mintOrDecimals: MintInfo | number): BN;
export declare function supplyAsNum(mint: MintInfo): number;
export declare function numberWithCommas(x: number, decimals?: number): string;
export declare function roundToDecimals(num: number, decimals: number): number;
export declare function humanReadable(bn: BN, mint: MintInfo): string;
//# sourceMappingURL=utils.d.ts.map