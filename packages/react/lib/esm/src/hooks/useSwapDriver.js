import { AccountLayout, ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { toNumber } from "@strata-foundation/spl-token-bonding";
import { amountAsNum } from "@strata-foundation/spl-utils";
import React, { useEffect, useMemo, useState } from "react";
import { useAsync } from "react-async-hook";
import { truthy } from "../utils/truthy";
import { useOwnedAmount } from "./bondingPricing";
import { useErrorHandler } from "./useErrorHandler";
import { useEstimatedFees } from "./useEstimatedFees";
import { useMint } from "./useMint";
import { useProvider } from "./useProvider";
import { useSolanaUnixTime } from "./useSolanaUnixTime";
import { useStrataSdks } from "./useStrataSdks";
import { useSwapPricing } from "./useSwapPricing";
import { useTokenMetadata } from "./useTokenMetadata";
function getMints(hierarchy) {
    if (!hierarchy) {
        return [];
    }
    return [hierarchy.tokenBonding.baseMint, ...getMints(hierarchy.parent)];
}
export async function getMissingSpace(provider, hierarchy, baseMint, targetMint) {
    if (!provider ||
        !provider.wallet ||
        !provider.wallet.publicKey ||
        !baseMint ||
        !targetMint ||
        !hierarchy) {
        return 0;
    }
    const path = hierarchy.path(baseMint, targetMint);
    const accounts = (await Promise.all(path.map(async (hierarchy) => {
        return [
            await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, hierarchy.tokenBonding.baseMint, provider.wallet.publicKey, true),
            await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, hierarchy.tokenBonding.targetMint, provider.wallet.publicKey, true),
        ];
    }))).flat();
    const distinctAccounts = Array.from(new Set(accounts.map((a) => a.toBase58())));
    const totalSpace = (await Promise.all(distinctAccounts.map(async (acct) => {
        if (await provider.connection.getAccountInfo(new PublicKey(acct))) {
            return 0;
        }
        return AccountLayout.span;
    }))).reduce((acc, total) => acc + total, 0);
    return totalSpace;
}
export const useSwapDriver = ({ onConnectWallet, id, tradingMints, onTradingMintsChange, swap, extraTransactionInfo, }) => {
    const { fungibleEntanglerSdk } = useStrataSdks();
    const { provider } = useProvider();
    const [internalError, setInternalError] = useState();
    const [spendCap, setSpendCap] = useState(0);
    const { tokenBonding, numRemaining, childEntangler, parentEntangler, loading: tokenSwapLoading, pricing, error } = useSwapPricing(id);
    const { base: baseMint, target: targetMint } = tradingMints;
    const { image: baseImage, metadata: baseMeta, loading: baseMetaLoading, error: baseMetaError, } = useTokenMetadata(baseMint);
    const { image: targetImage, metadata: targetMeta, loading: targetMetaLoading, error: targetMetaError, } = useTokenMetadata(targetMint);
    const { result: missingSpace, error: missingSpaceError } = useAsync(getMissingSpace, [provider, pricing?.hierarchy, baseMint, targetMint]);
    const { amount: feeAmount, error: feeError } = useEstimatedFees(missingSpace || 0, 1);
    const targetMintAcct = useMint(targetMint);
    const allMints = React.useMemo(() => [tokenBonding?.targetMint, ...getMints(pricing?.hierarchy), parentEntangler?.parentMint].filter(truthy).filter((x) => (childEntangler ? !x.equals(childEntangler.childMint) : true)), // don't display child entangled tokens
    [tokenBonding, pricing]);
    const ownedBase = useOwnedAmount(baseMint);
    const { handleErrors } = useErrorHandler();
    handleErrors(missingSpaceError, baseMetaError, targetMetaError, feeError, internalError, error);
    const unixTime = useSolanaUnixTime();
    useEffect(() => {
        if (tokenBonding && targetMintAcct && pricing) {
            const purchaseCap = tokenBonding.purchaseCap
                ? amountAsNum(tokenBonding.purchaseCap, targetMintAcct)
                : Number.POSITIVE_INFINITY;
            const maxSpend = pricing.buyTargetAmount(purchaseCap, pricing.hierarchy.tokenBonding.baseMint, unixTime);
            setSpendCap(maxSpend);
        }
    }, [tokenBonding, targetMint, pricing, setSpendCap, unixTime]);
    const childMint = useMint(childEntangler?.childMint);
    const base = baseMint && {
        name: baseMeta?.data.name || "",
        ticker: baseMeta?.data.symbol || "",
        image: baseImage,
        publicKey: baseMint,
    };
    const target = targetMint && {
        name: targetMeta?.data.name || "",
        ticker: targetMeta?.data.symbol || "",
        image: targetImage,
        publicKey: targetMint,
    };
    function subEntangledMint(mint) {
        if (mint && parentEntangler && childEntangler) {
            if (mint.equals(parentEntangler.parentMint)) {
                return childEntangler.childMint;
            }
        }
        return mint;
    }
    ;
    const baseWithEntangleRemoved = useMemo(() => {
        return subEntangledMint(base?.publicKey);
    }, [base?.publicKey.toBase58(), parentEntangler, childEntangler]);
    const targetWithEntangleRemoved = useMemo(() => {
        return subEntangledMint(target?.publicKey);
    }, [target?.publicKey.toBase58(), parentEntangler, childEntangler]);
    const lowMint = useMemo(() => {
        try {
            if (baseWithEntangleRemoved && targetWithEntangleRemoved) {
                return pricing?.hierarchy.lowest(baseWithEntangleRemoved, targetWithEntangleRemoved);
            }
        }
        catch (e) {
            console.warn(e);
            /// Do nothing
        }
    }, [pricing, baseWithEntangleRemoved, targetWithEntangleRemoved]);
    const targetBonding = lowMint && pricing?.hierarchy.findTarget(lowMint);
    const mintCap = targetBonding &&
        targetMintAcct &&
        targetBonding.mintCap &&
        toNumber(targetBonding.mintCap, targetMintAcct);
    const handleSubmit = async (values) => {
        if (values.topAmount) {
            try {
                // They explicitly set the amount they want. Accomodate this if we're not doing a multi
                // level swap
                const path = pricing?.hierarchy.path(baseMint, targetMint);
                let shouldUseDesiredTargetAmount = values.lastSet == "bottom" &&
                    path &&
                    path.length == 1 &&
                    path[0].tokenBonding.targetMint.equals(targetMint);
                let outputAmountSetting = {
                    baseAmount: +values.topAmount,
                    expectedOutputAmount: +values.bottomAmount,
                };
                if (shouldUseDesiredTargetAmount) {
                    outputAmountSetting = {
                        desiredTargetAmount: +values.bottomAmount,
                        expectedBaseAmount: +values.topAmount,
                    };
                }
                const entangledBase = (parentEntangler && childEntangler && parentEntangler.parentMint.equals(baseMint)) ? childEntangler.childMint : baseMint;
                const entangledTarget = (parentEntangler && childEntangler && parentEntangler.parentMint.equals(targetMint)) ? childEntangler.childMint : targetMint;
                await swap({
                    baseMint: entangledBase,
                    targetMint: entangledTarget,
                    ...outputAmountSetting,
                    slippage: +values.slippage / 100,
                    ticker: target.ticker,
                    async preInstructions({ isFirst, amount, isBuy }) {
                        if (!isFirst || !childEntangler || !parentEntangler || isBuy || !fungibleEntanglerSdk) {
                            return {
                                instructions: [],
                                signers: [],
                                output: null,
                            };
                        }
                        let numAmount = toNumber(amount, childMint);
                        return await fungibleEntanglerSdk?.swapParentForChildInstructions({
                            parentEntangler: parentEntangler.publicKey,
                            childEntangler: childEntangler.publicKey,
                            amount: numAmount,
                        });
                    },
                    async postInstructions({ isLast, amount, isBuy }) {
                        if (!isLast || !childEntangler || !parentEntangler || !isBuy || !fungibleEntanglerSdk) {
                            return {
                                instructions: [],
                                signers: [],
                                output: null,
                            };
                        }
                        return await fungibleEntanglerSdk?.swapChildForParentInstructions({
                            parentEntangler: parentEntangler.publicKey,
                            childEntangler: childEntangler.publicKey,
                            all: true,
                        });
                    },
                });
            }
            catch (e) {
                setInternalError(e);
            }
        }
    };
    return {
        extraTransactionInfo,
        numRemaining,
        mintCap,
        loading: targetMetaLoading ||
            baseMetaLoading ||
            tokenSwapLoading ||
            !tokenBonding ||
            !baseMeta,
        onConnectWallet,
        onTradingMintsChange,
        onBuyBase: () => {
            const tokenBonding = pricing.hierarchy.findTarget(baseMint);
            onTradingMintsChange({
                base: tokenBonding.baseMint,
                target: tokenBonding.targetMint,
            });
        },
        onSubmit: handleSubmit,
        id,
        pricing,
        base,
        target,
        ownedBase,
        spendCap,
        feeAmount,
        isBuying: Boolean(pricing && lowMint && target && pricing.isBuying(lowMint, target.publicKey)),
        goLiveDate: targetBonding && new Date(targetBonding.goLiveUnixTime.toNumber() * 1000),
        baseOptions: React.useMemo(() => allMints.filter((mint) => baseMint && !mint.equals(baseMint)), [baseMint, allMints]),
        targetOptions: React.useMemo(() => allMints.filter((mint) => targetMint && pricing && baseMint && !mint.equals(targetMint)), [targetMint, allMints]),
        swapBaseWithTargetEnabled: Boolean(baseMint &&
            targetMint &&
            pricing &&
            targetWithEntangleRemoved &&
            baseWithEntangleRemoved &&
            pricing.hierarchy.path(targetWithEntangleRemoved, baseWithEntangleRemoved).length > 0),
    };
};
//# sourceMappingURL=useSwapDriver.js.map