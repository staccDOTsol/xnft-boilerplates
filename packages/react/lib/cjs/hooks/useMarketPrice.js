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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMarketPrice = void 0;
const web3_js_1 = require("@solana/web3.js");
const react_1 = require("react");
const serum_1 = require("@project-serum/serum");
const wallet_adapter_react_xnft_1 = require("wallet-adapter-react-xnft");
const SERUM_PROGRAM_ID = new web3_js_1.PublicKey("9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin");
const useMarketPrice = (marketAddress) => {
    const { connection } = (0, wallet_adapter_react_xnft_1.useConnection)();
    const [price, setPrice] = (0, react_1.useState)();
    (0, react_1.useEffect)(() => {
        const fetch = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                let market = yield serum_1.Market.load(connection, marketAddress, undefined, SERUM_PROGRAM_ID);
                const book = yield market.loadAsks(connection);
                const top = book.items(false).next().value;
                setPrice(top.price);
            }
            catch (e) {
                console.error(e);
            }
        });
        fetch();
        const interval = setInterval(fetch, 30 * 1000);
        return () => clearInterval(interval);
    }, []);
    return price;
};
exports.useMarketPrice = useMarketPrice;
//# sourceMappingURL=useMarketPrice.js.map