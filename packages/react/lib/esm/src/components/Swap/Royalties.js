import React from "react";
import { useTokenMetadata } from "../../hooks/useTokenMetadata";
import { TransactionInfo } from "./TransactionInfo";
export const humanReadablePercentage = (u32) => {
    if (u32 && u32 !== 0) {
        return ((u32 / 4294967295) * 100).toFixed(2);
    }
    return 0;
};
export function Royalties({ tokenBonding, isBuying, formRef, }) {
    const { metadata: baseMeta, loading: baseMetaLoading } = useTokenMetadata(tokenBonding.baseMint);
    const { metadata: targetMeta, loading: targetMetaLoading } = useTokenMetadata(tokenBonding.targetMint);
    const baseRoyalties = isBuying
        ? tokenBonding.buyBaseRoyaltyPercentage
        : tokenBonding.sellBaseRoyaltyPercentage;
    const targetRoyalties = isBuying
        ? tokenBonding.buyTargetRoyaltyPercentage
        : tokenBonding.sellTargetRoyaltyPercentage;
    return (React.createElement(React.Fragment, null,
        baseRoyalties > 0 && (React.createElement(TransactionInfo, { name: `${baseMeta?.data.symbol} Royalties`, tooltip: `A percentage of every ${baseMeta?.data.symbol} spent or received in this transaction goes to a royalties account set by the ${targetMeta?.data.symbol} owner.`, formRef: formRef, amount: `${humanReadablePercentage(baseRoyalties)}%` })),
        targetRoyalties > 0 && (React.createElement(TransactionInfo, { name: `${targetMeta?.data.symbol} Royalties`, tooltip: `A percentage of every ${targetMeta?.data.symbol} spent or received in this transaction goes to a royalties account set by the ${targetMeta?.data.symbol} owner.`, formRef: formRef, amount: `${humanReadablePercentage(targetRoyalties)}%` }))));
}
//# sourceMappingURL=Royalties.js.map