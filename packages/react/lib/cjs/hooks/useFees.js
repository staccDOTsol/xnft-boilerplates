"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFees = void 0;
const react_1 = require("react");
const react_async_hook_1 = require("react-async-hook");
const wallet_adapter_react_xnft_1 = require("wallet-adapter-react-xnft");
const spl_utils_1 = require("@strata-foundation/spl-utils");
const useFees = (signatures) => {
    const { connection } = (0, wallet_adapter_react_xnft_1.useConnection)();
    const { loading, error, result } = (0, react_async_hook_1.useAsync)(spl_utils_1.getFeesPerSignature, [
        connection,
    ]);
    const amount = (0, react_1.useMemo)(() => ((result || 0) * signatures) / Math.pow(10, 9), [result, signatures]);
    return {
        amount,
        error,
        loading,
    };
};
exports.useFees = useFees;
//# sourceMappingURL=useFees.js.map