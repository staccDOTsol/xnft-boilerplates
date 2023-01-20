"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roundToDecimals = void 0;
function roundToDecimals(num, decimals) {
    return Math.trunc(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
exports.roundToDecimals = roundToDecimals;
//# sourceMappingURL=roundToDecimals.js.map