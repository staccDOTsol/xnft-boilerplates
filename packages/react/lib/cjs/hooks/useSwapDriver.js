"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.useSwapDriver = exports.getMissingSpace = void 0;
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const spl_token_bonding_1 = require("@strata-foundation/spl-token-bonding");
const spl_utils_1 = require("@strata-foundation/spl-utils");
const react_1 = __importStar(require("react"));
const react_async_hook_1 = require("react-async-hook");
const truthy_1 = require("../utils/truthy");
const bondingPricing_1 = require("./bondingPricing");
const useErrorHandler_1 = require("./useErrorHandler");
const useEstimatedFees_1 = require("./useEstimatedFees");
const useMint_1 = require("./useMint");
const useProvider_1 = require("./useProvider");
const useSolanaUnixTime_1 = require("./useSolanaUnixTime");
const useStrataSdks_1 = require("./useStrataSdks");
const useSwapPricing_1 = require("./useSwapPricing");
const useTokenMetadata_1 = require("./useTokenMetadata");
function getMints(hierarchy) {
    if (!hierarchy) {
        return [];
    }
    return [hierarchy.tokenBonding.baseMint, ...getMints(hierarchy.parent)];
}
function getMissingSpace(provider, hierarchy, baseMint, targetMint) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!provider ||
            !provider.wallet ||
            !provider.wallet.publicKey ||
            !baseMint ||
            !targetMint ||
            !hierarchy) {
            return 0;
        }
        const path = hierarchy.path(baseMint, targetMint);
        const accounts = (yield Promise.all(path.map((hierarchy) => __awaiter(this, void 0, void 0, function* () {
            return [
                yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, hierarchy.tokenBonding.baseMint, provider.wallet.publicKey, true),
                yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, hierarchy.tokenBonding.targetMint, provider.wallet.publicKey, true),
            ];
        })))).flat();
        const distinctAccounts = Array.from(new Set(accounts.map((a) => a.toBase58())));
        const totalSpace = (yield Promise.all(distinctAccounts.map((acct) => __awaiter(this, void 0, void 0, function* () {
            if (yield provider.connection.getAccountInfo(new web3_js_1.PublicKey(acct))) {
                return 0;
            }
            return spl_token_1.AccountLayout.span;
        })))).reduce((acc, total) => acc + total, 0);
        return totalSpace;
    });
}
exports.getMissingSpace = getMissingSpace;
const useSwapDriver = ({ onConnectWallet, id, tradingMints, onTradingMintsChange, swap, extraTransactionInfo, }) => {
    const { fungibleEntanglerSdk } = (0, useStrataSdks_1.useStrataSdks)();
    const { provider } = (0, useProvider_1.useProvider)();
    const [internalError, setInternalError] = (0, react_1.useState)();
    const [spendCap, setSpendCap] = (0, react_1.useState)(0);
    const { tokenBonding, numRemaining, childEntangler, parentEntangler, loading: tokenSwapLoading, pricing, error } = (0, useSwapPricing_1.useSwapPricing)(id);
    const { base: baseMint, target: targetMint } = tradingMints;
    const { image: baseImage, metadata: baseMeta, loading: baseMetaLoading, error: baseMetaError, } = (0, useTokenMetadata_1.useTokenMetadata)(baseMint);
    const { image: targetImage, metadata: targetMeta, loading: targetMetaLoading, error: targetMetaError, } = (0, useTokenMetadata_1.useTokenMetadata)(targetMint);
    const { result: missingSpace, error: missingSpaceError } = (0, react_async_hook_1.useAsync)(getMissingSpace, [provider, pricing === null || pricing === void 0 ? void 0 : pricing.hierarchy, baseMint, targetMint]);
    const { amount: feeAmount, error: feeError } = (0, useEstimatedFees_1.useEstimatedFees)(missingSpace || 0, 1);
    const targetMintAcct = (0, useMint_1.useMint)(targetMint);
    const allMints = react_1.default.useMemo(() => [tokenBonding === null || tokenBonding === void 0 ? void 0 : tokenBonding.targetMint, ...getMints(pricing === null || pricing === void 0 ? void 0 : pricing.hierarchy), parentEntangler === null || parentEntangler === void 0 ? void 0 : parentEntangler.parentMint].filter(truthy_1.truthy).filter((x) => (childEntangler ? !x.equals(childEntangler.childMint) : true)), // don't display child entangled tokens
    [tokenBonding, pricing]);
    const ownedBase = (0, bondingPricing_1.useOwnedAmount)(baseMint);
    const { handleErrors } = (0, useErrorHandler_1.useErrorHandler)();
    handleErrors(missingSpaceError, baseMetaError, targetMetaError, feeError, internalError, error);
    const unixTime = (0, useSolanaUnixTime_1.useSolanaUnixTime)();
    (0, react_1.useEffect)(() => {
        if (tokenBonding && targetMintAcct && pricing) {
            const purchaseCap = tokenBonding.purchaseCap
                ? (0, spl_utils_1.amountAsNum)(tokenBonding.purchaseCap, targetMintAcct)
                : Number.POSITIVE_INFINITY;
            const maxSpend = pricing.buyTargetAmount(purchaseCap, pricing.hierarchy.tokenBonding.baseMint, unixTime);
            setSpendCap(maxSpend);
        }
    }, [tokenBonding, targetMint, pricing, setSpendCap, unixTime]);
    const childMint = (0, useMint_1.useMint)(childEntangler === null || childEntangler === void 0 ? void 0 : childEntangler.childMint);
    const base = baseMint && {
        name: (baseMeta === null || baseMeta === void 0 ? void 0 : baseMeta.data.name) || "",
        ticker: (baseMeta === null || baseMeta === void 0 ? void 0 : baseMeta.data.symbol) || "",
        image: baseImage,
        publicKey: baseMint,
    };
    const target = targetMint && {
        name: (targetMeta === null || targetMeta === void 0 ? void 0 : targetMeta.data.name) || "",
        ticker: (targetMeta === null || targetMeta === void 0 ? void 0 : targetMeta.data.symbol) || "",
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
    const baseWithEntangleRemoved = (0, react_1.useMemo)(() => {
        return subEntangledMint(base === null || base === void 0 ? void 0 : base.publicKey);
    }, [base === null || base === void 0 ? void 0 : base.publicKey.toBase58(), parentEntangler, childEntangler]);
    const targetWithEntangleRemoved = (0, react_1.useMemo)(() => {
        return subEntangledMint(target === null || target === void 0 ? void 0 : target.publicKey);
    }, [target === null || target === void 0 ? void 0 : target.publicKey.toBase58(), parentEntangler, childEntangler]);
    const lowMint = (0, react_1.useMemo)(() => {
        try {
            if (baseWithEntangleRemoved && targetWithEntangleRemoved) {
                return pricing === null || pricing === void 0 ? void 0 : pricing.hierarchy.lowest(baseWithEntangleRemoved, targetWithEntangleRemoved);
            }
        }
        catch (e) {
            console.warn(e);
            /// Do nothing
        }
    }, [pricing, baseWithEntangleRemoved, targetWithEntangleRemoved]);
    const targetBonding = lowMint && (pricing === null || pricing === void 0 ? void 0 : pricing.hierarchy.findTarget(lowMint));
    const mintCap = targetBonding &&
        targetMintAcct &&
        targetBonding.mintCap &&
        (0, spl_token_bonding_1.toNumber)(targetBonding.mintCap, targetMintAcct);
    const handleSubmit = (values) => __awaiter(void 0, void 0, void 0, function* () {
        if (values.topAmount) {
            try {
                // They explicitly set the amount they want. Accomodate this if we're not doing a multi
                // level swap
                const path = pricing === null || pricing === void 0 ? void 0 : pricing.hierarchy.path(baseMint, targetMint);
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
                yield swap(Object.assign(Object.assign({ baseMint: entangledBase, targetMint: entangledTarget }, outputAmountSetting), { slippage: +values.slippage / 100, ticker: target.ticker, preInstructions({ isFirst, amount, isBuy }) {
                        return __awaiter(this, void 0, void 0, function* () {
                            if (!isFirst || !childEntangler || !parentEntangler || isBuy || !fungibleEntanglerSdk) {
                                return {
                                    instructions: [],
                                    signers: [],
                                    output: null,
                                };
                            }
                            let numAmount = (0, spl_token_bonding_1.toNumber)(amount, childMint);
                            return yield (fungibleEntanglerSdk === null || fungibleEntanglerSdk === void 0 ? void 0 : fungibleEntanglerSdk.swapParentForChildInstructions({
                                parentEntangler: parentEntangler.publicKey,
                                childEntangler: childEntangler.publicKey,
                                amount: numAmount,
                            }));
                        });
                    },
                    postInstructions({ isLast, amount, isBuy }) {
                        return __awaiter(this, void 0, void 0, function* () {
                            if (!isLast || !childEntangler || !parentEntangler || !isBuy || !fungibleEntanglerSdk) {
                                return {
                                    instructions: [],
                                    signers: [],
                                    output: null,
                                };
                            }
                            return yield (fungibleEntanglerSdk === null || fungibleEntanglerSdk === void 0 ? void 0 : fungibleEntanglerSdk.swapChildForParentInstructions({
                                parentEntangler: parentEntangler.publicKey,
                                childEntangler: childEntangler.publicKey,
                                all: true,
                            }));
                        });
                    } }));
            }
            catch (e) {
                setInternalError(e);
            }
        }
    });
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
        baseOptions: react_1.default.useMemo(() => allMints.filter((mint) => baseMint && !mint.equals(baseMint)), [baseMint, allMints]),
        targetOptions: react_1.default.useMemo(() => allMints.filter((mint) => targetMint && pricing && baseMint && !mint.equals(targetMint)), [targetMint, allMints]),
        swapBaseWithTargetEnabled: Boolean(baseMint &&
            targetMint &&
            pricing &&
            targetWithEntangleRemoved &&
            baseWithEntangleRemoved &&
            pricing.hierarchy.path(targetWithEntangleRemoved, baseWithEntangleRemoved).length > 0),
    };
};
exports.useSwapDriver = useSwapDriver;
//# sourceMappingURL=useSwapDriver.js.map