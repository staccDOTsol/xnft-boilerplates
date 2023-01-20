"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSolPrice = void 0;
const solPrice_1 = require("../contexts/solPrice");
const react_1 = require("react");
const useSolPrice = () => {
    return (0, react_1.useContext)(solPrice_1.SolPriceContext);
};
exports.useSolPrice = useSolPrice;
//# sourceMappingURL=useSolPrice.js.map