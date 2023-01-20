"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toNumber = exports.amountAsNum = exports.toBN = void 0;
const spl_token_1 = require("@solana/spl-token");
const bn_js_1 = __importDefault(require("bn.js"));
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
function amountAsNum(amount, mint) {
    const decimals = new spl_token_1.u64(Math.pow(10, mint.decimals).toString());
    const decimal = amount.mod(decimals).toNumber() / decimals.toNumber();
    return amount.div(decimals).toNumber() + decimal;
}
exports.amountAsNum = amountAsNum;
function toNumber(numberOrBn, mint) {
    if (bn_js_1.default.isBN(numberOrBn)) {
        return amountAsNum(numberOrBn, mint);
    }
    else {
        return numberOrBn;
    }
}
exports.toNumber = toNumber;
//# sourceMappingURL=utils.js.map