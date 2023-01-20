"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRentExemptAmount = void 0;
const react_1 = require("react");
const react_async_hook_1 = require("react-async-hook");
const wallet_adapter_react_xnft_1 = require("wallet-adapter-react-xnft");
const useRentExemptAmount = (size) => {
    const { connection } = (0, wallet_adapter_react_xnft_1.useConnection)();
    const { loading, error, result } = (0, react_async_hook_1.useAsync)(connection.getMinimumBalanceForRentExemption.bind(connection), [size]);
    const amount = (0, react_1.useMemo)(() => (result || 0) / Math.pow(10, 9), [result]);
    return {
        amount,
        error,
        loading,
    };
};
exports.useRentExemptAmount = useRentExemptAmount;
//# sourceMappingURL=useRentExemptAmount.js.map