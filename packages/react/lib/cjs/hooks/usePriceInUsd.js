"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePriceInUsd = void 0;
const usePriceInSol_1 = require("./usePriceInSol");
const useSolPrice_1 = require("./useSolPrice");
function usePriceInUsd(token) {
    const solPrice = (0, useSolPrice_1.useSolPrice)();
    const solAmount = (0, usePriceInSol_1.usePriceInSol)(token);
    return solAmount && solPrice && solAmount * solPrice;
}
exports.usePriceInUsd = usePriceInUsd;
//# sourceMappingURL=usePriceInUsd.js.map