"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCoinGeckoPrice = exports.getCoinGeckoPriceUsd = void 0;
const axios_1 = __importDefault(require("axios"));
const react_1 = require("react");
const useInterval_1 = require("./useInterval");
const lru_cache_1 = __importDefault(require("lru-cache"));
const lru = new lru_cache_1.default({
    ttl: 1000 * 60 * 2,
    ttlAutopurge: true
});
function getCoinGeckoPriceUsd(tokenName = "solana") {
    return __awaiter(this, void 0, void 0, function* () {
        let searchName = tokenName.toLowerCase();
        // Some mappings
        if (searchName === "grape") {
            searchName = "grape-2";
        }
        if (!lru.has(searchName)) {
            const resp = yield (0, axios_1.default)(`https://api.coingecko.com/api/v3/simple/price?ids=${searchName}&vs_currencies=usd`);
            const result = resp.data[searchName];
            if (result) {
                lru.set(searchName, result.usd);
            }
        }
        return lru.get(searchName);
    });
}
exports.getCoinGeckoPriceUsd = getCoinGeckoPriceUsd;
const useCoinGeckoPrice = (tokenName = "solana") => {
    const [price, setPrice] = (0, react_1.useState)();
    (0, useInterval_1.useInterval)(() => {
        var _a;
        (_a = getCoinGeckoPriceUsd(tokenName)) === null || _a === void 0 ? void 0 : _a.then(p => setPrice(p)).catch(console.log);
    }, 2 * 60 * 1000);
    return price;
};
exports.useCoinGeckoPrice = useCoinGeckoPrice;
//# sourceMappingURL=useCoinGeckoPrice.js.map