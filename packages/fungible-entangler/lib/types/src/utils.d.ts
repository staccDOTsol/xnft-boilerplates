import { MintInfo, u64 } from "@solana/spl-token";
import BN from "bn.js";
export declare function toBN(numberOrBn: BN | number, mintOrDecimals: MintInfo | number): BN;
export declare function amountAsNum(amount: u64, mint: MintInfo): number;
export declare function toNumber(numberOrBn: BN | number, mint: MintInfo): number;
//# sourceMappingURL=utils.d.ts.map