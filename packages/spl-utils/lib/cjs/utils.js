"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.humanReadable = exports.roundToDecimals = exports.numberWithCommas = exports.supplyAsNum = exports.toBN = exports.amountAsNum = exports.toNumber = exports.truthy = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const spl_token_1 = require("@solana/spl-token");
const truthy = (value) => !!value;
exports.truthy = truthy;
function toNumber(numberOrBn, mint) {
    if (bn_js_1.default.isBN(numberOrBn)) {
        return amountAsNum(numberOrBn, mint);
    }
    else {
        return numberOrBn;
    }
}
exports.toNumber = toNumber;
function amountAsNum(amount, mint) {
    const decimals = new spl_token_1.u64(Math.pow(10, mint.decimals).toString());
    const decimal = amount.mod(decimals).toNumber() / decimals.toNumber();
    return amount.div(decimals).toNumber() + decimal;
}
exports.amountAsNum = amountAsNum;
function toBN(numberOrBn, mintOrDecimals) {
    const decimals = typeof mintOrDecimals === "number"
        ? mintOrDecimals
        : mintOrDecimals.decimals;
    if (bn_js_1.default.isBN(numberOrBn)) {
        return numberOrBn;
    }
    else {
        return new bn_js_1.default(Math.ceil(Number(numberOrBn) * Math.pow(10, decimals)).toLocaleString("fullwide", { useGrouping: false }));
    }
}
exports.toBN = toBN;
function supplyAsNum(mint) {
    return amountAsNum(mint.supply, mint);
}
exports.supplyAsNum = supplyAsNum;
function numberWithCommas(x, decimals = 4) {
    return roundToDecimals(x, decimals).toLocaleString("en-US", {
        maximumFractionDigits: decimals,
    });
}
exports.numberWithCommas = numberWithCommas;
function roundToDecimals(num, decimals) {
    return Math.trunc(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
exports.roundToDecimals = roundToDecimals;
function humanReadable(bn, mint) {
    return numberWithCommas(roundToDecimals(toNumber(bn, mint), mint.decimals));
}
exports.humanReadable = humanReadable;
//# sourceMappingURL=utils.js.map