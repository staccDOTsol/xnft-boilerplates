"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFtxPayLink = void 0;
const wallet_adapter_react_xnft_1 = require("wallet-adapter-react-xnft");
function useFtxPayLink() {
    const { publicKey } = (0, wallet_adapter_react_xnft_1.useWallet)();
    return `https://ftx.com/pay/request?coin=SOL&address=${publicKey === null || publicKey === void 0 ? void 0 : publicKey.toBase58()}&tag=&wallet=sol&memoIsRequired=false&memo=&fixedWidth=true`;
}
exports.useFtxPayLink = useFtxPayLink;
//# sourceMappingURL=useFtxPayLink.js.map