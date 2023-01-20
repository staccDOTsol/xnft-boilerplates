import { useMemo } from "react";
import { useSwapDriver } from "./useSwapDriver";
import { useTokenBonding } from "./useTokenBonding";
import { useTokenMetadata } from "./useTokenMetadata";
export const useManyToOneSwapDriver = ({ onConnectWallet, extraTransactionInfo, inputs, onTradingMintsChange, swap, baseMint, targetMint }) => {
    const tokenBondingKey = useMemo(() => {
        return inputs.find(i => i.baseMint.equals(baseMint))?.tokenBonding;
    }, [baseMint, inputs]);
    const { info: tokenBonding } = useTokenBonding(tokenBondingKey);
    const { metadata: targetMeta, image: targetImage } = useTokenMetadata(targetMint);
    const target = targetMeta && tokenBonding && {
        name: targetMeta?.data.name || "",
        ticker: targetMeta?.data.symbol || "",
        image: targetImage,
        publicKey: tokenBonding?.targetMint,
    };
    const driverProps = useSwapDriver({
        id: tokenBonding?.targetMint,
        onConnectWallet,
        extraTransactionInfo,
        tradingMints: {
            base: baseMint,
            target: tokenBonding?.targetMint
        },
        onTradingMintsChange,
        swap,
    });
    return {
        ...driverProps,
        target,
        baseOptions: useMemo(() => inputs.map(i => i.baseMint), [inputs]),
        targetOptions: []
    };
};
//# sourceMappingURL=useManyToOneSwapDriver.js.map