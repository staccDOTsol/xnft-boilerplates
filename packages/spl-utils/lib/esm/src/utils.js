import BN from "bn.js";
import { u64 } from "@solana/spl-token";
export const truthy = (value) => !!value;
export function toNumber(numberOrBn, mint) {
    if (BN.isBN(numberOrBn)) {
        return amountAsNum(numberOrBn, mint);
    }
    else {
        return numberOrBn;
    }
}
export function amountAsNum(amount, mint) {
    const decimals = new u64(Math.pow(10, mint.decimals).toString());
    const decimal = amount.mod(decimals).toNumber() / decimals.toNumber();
    return amount.div(decimals).toNumber() + decimal;
}
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
export function supplyAsNum(mint) {
    return amountAsNum(mint.supply, mint);
}
export function numberWithCommas(x, decimals = 4) {
    return roundToDecimals(x, decimals).toLocaleString("en-US", {
        maximumFractionDigits: decimals,
    });
}
export function roundToDecimals(num, decimals) {
    return Math.trunc(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
export function humanReadable(bn, mint) {
    return numberWithCommas(roundToDecimals(toNumber(bn, mint), mint.decimals));
}
//# sourceMappingURL=utils.js.map