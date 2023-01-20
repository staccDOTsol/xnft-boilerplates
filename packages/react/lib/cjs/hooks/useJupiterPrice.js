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
exports.useJupiterPrice = exports.getJupiterPriceCached = void 0;
const axios_1 = __importDefault(require("axios"));
const react_1 = require("react");
const useInterval_1 = require("./useInterval");
const lru_cache_1 = __importDefault(require("lru-cache"));
const useMint_1 = require("./useMint");
const useTwWrappedSolMint_1 = require("./useTwWrappedSolMint");
const spl_token_1 = require("@solana/spl-token");
const lru = new lru_cache_1.default({
    ttl: 1000 * 60 * 2,
    ttlAutopurge: true
});
function getJupiterPriceCached(inputMint, priceMint, inputDecimals, priceDecimals) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!inputMint || !priceMint || typeof inputDecimals === "undefined" || typeof priceDecimals === "undefined") {
            return;
        }
        let key = inputMint.toBase58() + priceMint.toBase58();
        if (!lru.has(key)) {
            const resp = yield (0, axios_1.default)(`https://quote-api.jup.ag/v1/quote?inputMint=${inputMint}&outputMint=${priceMint}&amount=${1 * Math.pow(10, inputDecimals)}&slippage=0.5&feeBps=4`);
            if (!resp.data.error) {
                const data = resp.data.data[0];
                const result = data &&
                    data.outAmount /
                        Math.pow(10, priceDecimals) /
                        (data.inAmount / Math.pow(10, inputDecimals));
                if (result) {
                    lru.set(key, result);
                }
            }
        }
        return lru.get(key);
    });
}
exports.getJupiterPriceCached = getJupiterPriceCached;
const useJupiterPrice = (inputMint, priceMint) => {
    const [price, setPrice] = (0, react_1.useState)();
    const input = (0, useMint_1.useMint)(inputMint);
    const output = (0, useMint_1.useMint)(priceMint);
    const wrappedSolMint = (0, useTwWrappedSolMint_1.useTwWrappedSolMint)();
    (0, useInterval_1.useInterval)(() => {
        var _a;
        if (wrappedSolMint && inputMint && priceMint) {
            (_a = getJupiterPriceCached(inputMint.equals(wrappedSolMint) ? spl_token_1.NATIVE_MINT : inputMint, priceMint.equals(wrappedSolMint) ? spl_token_1.NATIVE_MINT : priceMint, inputMint.equals(spl_token_1.NATIVE_MINT) ? 9 : input === null || input === void 0 ? void 0 : input.decimals, priceMint.equals(spl_token_1.NATIVE_MINT) ? 9 : output === null || output === void 0 ? void 0 : output.decimals)) === null || _a === void 0 ? void 0 : _a.then((p) => setPrice(p)).catch(console.log);
        }
    }, 2 * 60 * 1000, [input, output, inputMint, priceMint, wrappedSolMint]);
    return price;
};
exports.useJupiterPrice = useJupiterPrice;
//# sourceMappingURL=useJupiterPrice.js.map