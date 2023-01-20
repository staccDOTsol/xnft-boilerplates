"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolPriceProvider = exports.SolPriceContext = void 0;
const react_1 = __importStar(require("react"));
const web3_js_1 = require("@solana/web3.js");
const useCoinGeckoPrice_1 = require("../hooks/useCoinGeckoPrice");
const useMarketPrice_1 = require("../hooks/useMarketPrice");
exports.SolPriceContext = (0, react_1.createContext)(undefined);
const SOL_TO_USD_MARKET = new web3_js_1.PublicKey("9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT");
const SolPriceProvider = ({ children }) => {
    const coinGeckoPrice = (0, useCoinGeckoPrice_1.useCoinGeckoPrice)();
    const marketPrice = (0, useMarketPrice_1.useMarketPrice)(SOL_TO_USD_MARKET);
    return (react_1.default.createElement(exports.SolPriceContext.Provider, { value: marketPrice || coinGeckoPrice }, children));
};
exports.SolPriceProvider = SolPriceProvider;
//# sourceMappingURL=solPrice.js.map