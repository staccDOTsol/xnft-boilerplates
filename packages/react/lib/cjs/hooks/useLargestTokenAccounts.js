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
exports.useLargestTokenAccounts = void 0;
const react_1 = require("react");
const wallet_adapter_react_xnft_1 = require("wallet-adapter-react-xnft");
const useLargestTokenAccounts = (tokenMint) => {
    const { connection } = (0, wallet_adapter_react_xnft_1.useConnection)();
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [result, setResult] = (0, react_1.useState)();
    const [error, setError] = (0, react_1.useState)();
    (0, react_1.useEffect)(() => {
        (() => __awaiter(void 0, void 0, void 0, function* () {
            if (tokenMint) {
                setLoading(true);
                try {
                    const result = yield connection.getTokenLargestAccounts(tokenMint);
                    setResult(result);
                }
                catch (e) {
                    setError(e);
                }
                finally {
                    setLoading(false);
                }
            }
        }))();
    }, [tokenMint]);
    return { loading, result, error };
};
exports.useLargestTokenAccounts = useLargestTokenAccounts;
//# sourceMappingURL=useLargestTokenAccounts.js.map