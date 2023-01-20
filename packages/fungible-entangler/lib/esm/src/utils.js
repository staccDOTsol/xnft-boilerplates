import { u64 } from "@solana/spl-token";
import BN from "bn.js";
export function toBN(numberOrBn, mintOrDecimals) {
    const decimals = typeof mintOrDecimals === "number"
        ? mintOrDecimals
        : mintOrDecimals.decimals;
    if (BN.isBN(numberOrBn)) {
        return numberOrBn;
    }
    else {
        return new BN(Math.ceil(Number(numberOrBn) * Math.pow(10, decimals)).toLocaleString("fullwide", { useGrouping: false }));
    }
}
export function amountAsNum(amount, mint) {
    const decimals = new u64(Math.pow(10, mint.decimals).toString());
    const decimal = amount.mod(decimals).toNumber() / decimals.toNumber();
    return amount.div(decimals).toNumber() + decimal;
}
export function toNumber(numberOrBn, mint) {
    if (BN.isBN(numberOrBn)) {
        return amountAsNum(numberOrBn, mint);
    }
    else {
        return numberOrBn;
    }
}
//# sourceMappingURL=utils.js.map