"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useManyToOneSwapDriver = void 0;
const react_1 = require("react");
const useSwapDriver_1 = require("./useSwapDriver");
const useTokenBonding_1 = require("./useTokenBonding");
const useTokenMetadata_1 = require("./useTokenMetadata");
const useManyToOneSwapDriver = ({ onConnectWallet, extraTransactionInfo, inputs, onTradingMintsChange, swap, baseMint, targetMint }) => {
    const tokenBondingKey = (0, react_1.useMemo)(() => {
        var _a;
        return (_a = inputs.find(i => i.baseMint.equals(baseMint))) === null || _a === void 0 ? void 0 : _a.tokenBonding;
    }, [baseMint, inputs]);
    const { info: tokenBonding } = (0, useTokenBonding_1.useTokenBonding)(tokenBondingKey);
    const { metadata: targetMeta, image: targetImage } = (0, useTokenMetadata_1.useTokenMetadata)(targetMint);
    const target = targetMeta && tokenBonding && {
        name: (targetMeta === null || targetMeta === void 0 ? void 0 : targetMeta.data.name) || "",
        ticker: (targetMeta === null || targetMeta === void 0 ? void 0 : targetMeta.data.symbol) || "",
        image: targetImage,
        publicKey: tokenBonding === null || tokenBonding === void 0 ? void 0 : tokenBonding.targetMint,
    };
    const driverProps = (0, useSwapDriver_1.useSwapDriver)({
        id: tokenBonding === null || tokenBonding === void 0 ? void 0 : tokenBonding.targetMint,
        onConnectWallet,
        extraTransactionInfo,
        tradingMints: {
            base: baseMint,
            target: tokenBonding === null || tokenBonding === void 0 ? void 0 : tokenBonding.targetMint
        },
        onTradingMintsChange,
        swap,
    });
    return Object.assign(Object.assign({}, driverProps), { target, baseOptions: (0, react_1.useMemo)(() => inputs.map(i => i.baseMint), [inputs]), targetOptions: [] });
};
exports.useManyToOneSwapDriver = useManyToOneSwapDriver;
//# sourceMappingURL=useManyToOneSwapDriver.js.map