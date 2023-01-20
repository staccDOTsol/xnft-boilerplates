"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Royalties = exports.humanReadablePercentage = void 0;
const react_1 = __importDefault(require("react"));
const useTokenMetadata_1 = require("../../hooks/useTokenMetadata");
const TransactionInfo_1 = require("./TransactionInfo");
const humanReadablePercentage = (u32) => {
    if (u32 && u32 !== 0) {
        return ((u32 / 4294967295) * 100).toFixed(2);
    }
    return 0;
};
exports.humanReadablePercentage = humanReadablePercentage;
function Royalties({ tokenBonding, isBuying, formRef, }) {
    const { metadata: baseMeta, loading: baseMetaLoading } = (0, useTokenMetadata_1.useTokenMetadata)(tokenBonding.baseMint);
    const { metadata: targetMeta, loading: targetMetaLoading } = (0, useTokenMetadata_1.useTokenMetadata)(tokenBonding.targetMint);
    const baseRoyalties = isBuying
        ? tokenBonding.buyBaseRoyaltyPercentage
        : tokenBonding.sellBaseRoyaltyPercentage;
    const targetRoyalties = isBuying
        ? tokenBonding.buyTargetRoyaltyPercentage
        : tokenBonding.sellTargetRoyaltyPercentage;
    return (react_1.default.createElement(react_1.default.Fragment, null,
        baseRoyalties > 0 && (react_1.default.createElement(TransactionInfo_1.TransactionInfo, { name: `${baseMeta === null || baseMeta === void 0 ? void 0 : baseMeta.data.symbol} Royalties`, tooltip: `A percentage of every ${baseMeta === null || baseMeta === void 0 ? void 0 : baseMeta.data.symbol} spent or received in this transaction goes to a royalties account set by the ${targetMeta === null || targetMeta === void 0 ? void 0 : targetMeta.data.symbol} owner.`, formRef: formRef, amount: `${(0, exports.humanReadablePercentage)(baseRoyalties)}%` })),
        targetRoyalties > 0 && (react_1.default.createElement(TransactionInfo_1.TransactionInfo, { name: `${targetMeta === null || targetMeta === void 0 ? void 0 : targetMeta.data.symbol} Royalties`, tooltip: `A percentage of every ${targetMeta === null || targetMeta === void 0 ? void 0 : targetMeta.data.symbol} spent or received in this transaction goes to a royalties account set by the ${targetMeta === null || targetMeta === void 0 ? void 0 : targetMeta.data.symbol} owner.`, formRef: formRef, amount: `${(0, exports.humanReadablePercentage)(targetRoyalties)}%` }))));
}
exports.Royalties = Royalties;
//# sourceMappingURL=Royalties.js.map