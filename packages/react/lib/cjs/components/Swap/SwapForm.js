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
exports.MemodSwapForm = exports.SwapForm = void 0;
const react_1 = require("@chakra-ui/react");
const yup_1 = require("@hookform/resolvers/yup");
const spl_token_1 = require("@solana/spl-token");
const wallet_adapter_react_xnft_1 = require("wallet-adapter-react-xnft");
const react_2 = __importStar(require("react"));
const react_hook_form_1 = require("react-hook-form");
const bs_1 = require("react-icons/bs");
const ri_1 = require("react-icons/ri");
const yup = __importStar(require("yup"));
const useFtxPayLink_1 = require("../../hooks/useFtxPayLink");
const useMint_1 = require("../../hooks/useMint");
const useProvider_1 = require("../../hooks/useProvider");
const useSolanaUnixTime_1 = require("../../hooks/useSolanaUnixTime");
const useTokenMetadata_1 = require("../../hooks/useTokenMetadata");
const useTokenSwapFromId_1 = require("../../hooks/useTokenSwapFromId");
const useTwWrappedSolMint_1 = require("../../hooks/useTwWrappedSolMint");
const roundToDecimals_1 = require("../../utils/roundToDecimals");
const Spinner_1 = require("../Spinner");
const Royalties_1 = require("./Royalties");
const TransactionInfo_1 = require("./TransactionInfo");
const validationSchema = yup
    .object({
    topAmount: yup.number().required().moreThan(0),
    bottomAmount: yup.number().required().moreThan(0),
    slippage: yup.number().required().moreThan(0),
})
    .required();
function MintMenuItem({ mint, onClick, }) {
    const { image, metadata } = (0, useTokenMetadata_1.useTokenMetadata)(mint);
    return (react_2.default.createElement(react_1.MenuItem, { onClick: onClick, icon: react_2.default.createElement(react_1.Center, { w: 8, h: 8, rounded: "full" },
            react_2.default.createElement(react_1.Avatar, { w: "100%", h: "100%", size: "sm", src: image })) },
        react_2.default.createElement(react_1.Text, null, metadata === null || metadata === void 0 ? void 0 : metadata.data.symbol)));
}
const SwapForm = ({ isLoading = false, extraTransactionInfo, isSubmitting, onConnectWallet, onTradingMintsChange, onBuyBase, onSubmit, id, pricing, base, target, ownedBase, spendCap, feeAmount, baseOptions, targetOptions, mintCap, isBuying, goLiveDate, numRemaining, showAttribution = true, swapBaseWithTargetEnabled = true, }) => {
    const formRef = (0, react_2.useRef)();
    const { connected } = (0, wallet_adapter_react_xnft_1.useWallet)();
    const { awaitingApproval } = (0, useProvider_1.useProvider)();
    const ftxPayLink = (0, useFtxPayLink_1.useFtxPayLink)();
    const [insufficientLiq, setInsufficientLiq] = (0, react_2.useState)(false);
    const [rate, setRate] = (0, react_2.useState)("--");
    const [fee, setFee] = (0, react_2.useState)("--");
    const notLive = goLiveDate && new Date() < goLiveDate;
    const { register, handleSubmit, watch, reset, setValue, formState: { errors }, } = (0, react_hook_form_1.useForm)({
        defaultValues: {
            topAmount: undefined,
            bottomAmount: undefined,
            slippage: 1,
        },
        // @ts-ignore
        resolver: (0, yup_1.yupResolver)(validationSchema),
    });
    const wrappedSolMint = (0, useTwWrappedSolMint_1.useTwWrappedSolMint)();
    const isBaseSol = wrappedSolMint &&
        ((base === null || base === void 0 ? void 0 : base.publicKey.equals(wrappedSolMint)) ||
            (base === null || base === void 0 ? void 0 : base.publicKey.equals(spl_token_1.NATIVE_MINT)));
    const topAmount = watch("topAmount");
    const bottomAmount = watch("bottomAmount");
    const slippage = watch("slippage");
    const hasBaseAmount = (ownedBase || 0) >= +(topAmount || 0);
    const moreThanSpendCap = +(topAmount || 0) > spendCap;
    const unixTime = (0, useSolanaUnixTime_1.useSolanaUnixTime)();
    const { tokenBonding, childEntangler, parentEntangler } = (0, useTokenSwapFromId_1.useTokenSwapFromId)(id);
    const passedMintCap = typeof numRemaining !== "undefined" && numRemaining < bottomAmount;
    const targetMintAcc = (0, useMint_1.useMint)(target === null || target === void 0 ? void 0 : target.publicKey);
    const baseMintAcc = (0, useMint_1.useMint)(base === null || base === void 0 ? void 0 : base.publicKey);
    const handleConnectWallet = () => onConnectWallet();
    const manualResetForm = () => {
        reset({ slippage: slippage });
        setInsufficientLiq(false);
        setRate("--");
        setFee("--");
    };
    const [lastSet, setLastSet] = (0, react_2.useState)("top");
    function updatePrice() {
        if (lastSet == "bottom" && bottomAmount) {
            handleBottomChange(bottomAmount);
        }
        else if (topAmount) {
            handleTopChange(topAmount);
        }
    }
    (0, react_2.useEffect)(() => {
        updatePrice();
    }, [pricing, bottomAmount, topAmount, targetMintAcc, baseMintAcc, unixTime]);
    const handleTopChange = (value = 0) => {
        if (tokenBonding && pricing && base && target && value && +value >= 0) {
            setLastSet("top");
            const amount = pricing.swap(+value, base.publicKey, target.publicKey, true, unixTime);
            if (isNaN(amount)) {
                setInsufficientLiq(true);
            }
            else {
                setInsufficientLiq(false);
                setValue("bottomAmount", +value == 0
                    ? 0
                    : (0, roundToDecimals_1.roundToDecimals)(amount, targetMintAcc ? targetMintAcc.decimals : 9));
                setRate(`${(0, roundToDecimals_1.roundToDecimals)(amount / value, targetMintAcc ? targetMintAcc.decimals : 9)}`);
                setFee(`${feeAmount}`);
            }
        }
        else {
            manualResetForm();
        }
    };
    const handleBottomChange = (value = 0) => {
        if (tokenBonding && pricing && base && target && value && +value >= 0) {
            let amount = Math.abs(pricing.swapTargetAmount(+value, target.publicKey, base.publicKey, true, unixTime));
            setLastSet("bottom");
            if (isNaN(amount)) {
                setInsufficientLiq(true);
            }
            else {
                setInsufficientLiq(false);
                setValue("topAmount", +value == 0
                    ? 0
                    : (0, roundToDecimals_1.roundToDecimals)(amount, baseMintAcc ? baseMintAcc.decimals : 9));
                setRate(`${(0, roundToDecimals_1.roundToDecimals)(value / amount, baseMintAcc ? baseMintAcc.decimals : 9)}`);
                setFee(`${feeAmount}`);
            }
        }
        else {
            manualResetForm();
        }
    };
    const attColor = (0, react_1.useColorModeValue)("gray.400", "gray.200");
    const dropdownVariant = (0, react_1.useColorModeValue)("solid", "ghost");
    const swapBackground = (0, react_1.useColorModeValue)("gray.200", "gray.500");
    const color = (0, react_1.useColorModeValue)("gray.500", "gray.200");
    const inputBorderColor = (0, react_1.useColorModeValue)("gray.200", "gray.500");
    const useMaxBg = (0, react_1.useColorModeValue)("primary.200", "black.500");
    const handleUseMax = () => {
        const amount = (ownedBase || 0) >= spendCap ? spendCap : ownedBase || 0;
        setValue("topAmount", amount);
        handleTopChange(amount);
    };
    const handleFlipTokens = () => {
        if (base && target) {
            onTradingMintsChange({
                base: target.publicKey,
                target: base.publicKey,
            });
        }
    };
    const handleBuyBase = onBuyBase
        ? () => onBuyBase(tokenBonding.publicKey)
        : isBaseSol
            ? () => window.open(ftxPayLink)
            : undefined;
    const handleSwap = (values) => __awaiter(void 0, void 0, void 0, function* () {
        yield onSubmit(Object.assign(Object.assign({}, values), { lastSet }));
    });
    if (isLoading || !base || !target) {
        return react_2.default.createElement(Spinner_1.Spinner, null);
    }
    return (react_2.default.createElement(react_1.Box, { ref: formRef, w: "full", color: color },
        react_2.default.createElement("form", { onSubmit: handleSubmit(handleSwap) },
            react_2.default.createElement(react_1.VStack, { spacing: 4, align: "stretch" },
                react_2.default.createElement(react_1.VStack, { spacing: 1, align: "left" },
                    react_2.default.createElement(react_1.Flex, { justifyContent: "space-between" },
                        react_2.default.createElement(react_1.Text, { fontSize: "xs" }, "You Pay"),
                        base && handleBuyBase && (react_2.default.createElement(react_1.Link, { color: "primary.500", fontSize: "xs", onClick: handleBuyBase },
                            "Buy More ",
                            base.ticker))),
                    react_2.default.createElement(react_1.InputGroup, { zIndex: 100, size: "lg" },
                        react_2.default.createElement(react_1.Input, Object.assign({ isInvalid: !!errors.topAmount, isDisabled: !connected, id: "topAmount", borderColor: inputBorderColor, placeholder: "0", type: "number", fontSize: "2xl", fontWeight: "semibold", step: getStep(baseMintAcc ? baseMintAcc.decimals : 9), min: 0, _placeholder: { color: "gray.200" } }, register("topAmount", {
                            onChange: (e) => handleTopChange(e.target.value),
                        }))),
                        react_2.default.createElement(react_1.InputRightElement, { w: "auto", justifyContent: "end", paddingX: 1.5, rounded: "lg" }, connected && (react_2.default.createElement(react_1.Menu, null,
                            react_2.default.createElement(react_1.MenuButton, { variant: dropdownVariant, cursor: "pointer", isDisabled: !connected, as: react_1.Button, rightIcon: targetOptions.length > 0 ? react_2.default.createElement(bs_1.BsChevronDown, null) : null, leftIcon: react_2.default.createElement(react_1.Center, { w: 6, h: 6, rounded: "full" },
                                    react_2.default.createElement(react_1.Avatar, { src: base.image, w: "100%", h: "100%" })), borderRadius: "20px 6px 6px 20px", paddingX: 1.5 }, base.ticker),
                            react_2.default.createElement(react_1.MenuList, { borderColor: "gray.300" }, baseOptions.map((mint) => (react_2.default.createElement(MintMenuItem, { mint: mint, key: mint.toBase58(), onClick: () => onTradingMintsChange({
                                    base: mint,
                                    target: target.publicKey &&
                                        mint.equals(target.publicKey)
                                        ? base.publicKey
                                        : target.publicKey,
                                }) }))))))))),
                react_2.default.createElement(react_1.HStack, { justify: "center", alignItems: "center", position: "relative", paddingY: 2 },
                    react_2.default.createElement(react_1.Divider, { borderColor: swapBackground }),
                    react_2.default.createElement(react_1.Flex, null,
                        !connected && (react_2.default.createElement(react_1.Button, { size: "xs", colorScheme: "gray", variant: "outline", onClick: handleConnectWallet }, "Connect Wallet")),
                        connected && (react_2.default.createElement(react_1.Button, { size: "xs", colorScheme: "primary", variant: "ghost", onClick: handleUseMax, _hover: { bgColor: useMaxBg } },
                            "Use Max (",
                            (ownedBase || 0) > spendCap ? spendCap : ownedBase || 0,
                            " ",
                            base.ticker,
                            ")"))),
                    react_2.default.createElement(react_1.Divider, { borderColor: swapBackground }),
                    swapBaseWithTargetEnabled && (react_2.default.createElement(react_1.IconButton, { isDisabled: !connected, "aria-label": "Flip Tokens", size: "sm", bgColor: swapBackground, color: "white", rounded: "full", position: "absolute", right: 2, onClick: handleFlipTokens, icon: react_2.default.createElement(react_1.Icon, { as: ri_1.RiArrowUpDownFill, w: 5, h: 5 }) }))),
                react_2.default.createElement(react_1.VStack, { align: "left", spacing: 1 },
                    react_2.default.createElement(react_1.Text, { fontSize: "xs" }, "You Receive"),
                    react_2.default.createElement(react_1.InputGroup, { zIndex: 99, size: "lg" },
                        react_2.default.createElement(react_1.Input, Object.assign({ isInvalid: !!errors.bottomAmount, isDisabled: !connected, id: "bottomAmount", borderColor: inputBorderColor, placeholder: "0", type: "number", fontSize: "2xl", fontWeight: "semibold", step: getStep(targetMintAcc ? targetMintAcc.decimals : 9), min: 0, _placeholder: { color: "gray.200" } }, register("bottomAmount", {
                            onChange: (e) => handleBottomChange(e.target.value),
                        }))),
                        react_2.default.createElement(react_1.InputRightElement, { w: "auto", justifyContent: "end", paddingX: 1.5, rounded: "lg" }, connected && (react_2.default.createElement(react_1.Menu, null,
                            react_2.default.createElement(react_1.MenuButton, { variant: dropdownVariant, rightIcon: targetOptions.length > 0 ? react_2.default.createElement(bs_1.BsChevronDown, null) : null, isDisabled: !connected, as: react_1.Button, leftIcon: react_2.default.createElement(react_1.Center, { w: 6, h: 6, rounded: "full" },
                                    react_2.default.createElement(react_1.Avatar, { src: target.image, w: "100%", h: "100%" })), borderRadius: "20px 6px 6px 20px", paddingX: 1.5 }, target.ticker),
                            react_2.default.createElement(react_1.MenuList, { borderColor: "gray.300" }, targetOptions.map((mint) => (react_2.default.createElement(MintMenuItem, { mint: mint, key: mint.toBase58(), onClick: () => onTradingMintsChange({
                                    target: mint,
                                    base: base.publicKey && mint.equals(base.publicKey)
                                        ? target.publicKey
                                        : base.publicKey,
                                }) }))))))))),
                react_2.default.createElement(react_1.VStack, { spacing: 1, padding: 4, align: "stretch", borderColor: inputBorderColor, borderWidth: "1px", rounded: "lg", fontSize: "sm", opacity: connected ? 1 : 0.6 },
                    react_2.default.createElement(react_1.Flex, { justify: "space-between", alignItems: "center" },
                        react_2.default.createElement(react_1.Text, null, "Rate"),
                        react_2.default.createElement(react_1.Text, null, rate !== "--"
                            ? `1 ${base.ticker} ≈ ${rate} ${target.ticker}`
                            : rate)),
                    react_2.default.createElement(react_1.Flex, { justify: "space-between", alignItems: "center" },
                        react_2.default.createElement(react_1.HStack, null,
                            react_2.default.createElement(react_1.Text, null, "Slippage"),
                            react_2.default.createElement(react_1.Tooltip, { isDisabled: !connected, placement: "top", label: "Your transaction will fail if the price changes unfavorably more than this percentage.", portalProps: { containerRef: formRef } },
                                react_2.default.createElement(react_1.Flex, null,
                                    react_2.default.createElement(react_1.Icon, { w: 5, h: 5, as: ri_1.RiInformationLine, _hover: { color: "primary.500", cursor: "pointer" } })))),
                        react_2.default.createElement(react_1.InputGroup, { size: "sm", w: "60px" },
                            react_2.default.createElement(react_1.Input, Object.assign({ isInvalid: !!errors.slippage, isDisabled: !connected, id: "slippage", borderColor: inputBorderColor, textAlign: "right", rounded: "lg", placeholder: "0", type: "number", fontWeight: "semibold", step: 1, min: 1, max: 90, paddingRight: 5, paddingLeft: 1 }, register("slippage"))),
                            react_2.default.createElement(react_1.InputRightElement, { zIndex: 0, w: 4, justifyContent: "end", paddingRight: 1.5, rounded: "lg" },
                                react_2.default.createElement(react_1.Text, { margin: 0 }, "%")))),
                    react_2.default.createElement(react_1.Flex, { justify: "space-between", alignItems: "center" },
                        react_2.default.createElement(react_1.Text, null, "Solana Network Fees"),
                        react_2.default.createElement(react_1.Flex, null, fee)),
                    numRemaining && (react_2.default.createElement(react_1.Flex, { justify: "space-between", alignItems: "center" },
                        react_2.default.createElement(react_1.Text, null, "Remaining"),
                        react_2.default.createElement(react_1.Flex, null,
                            numRemaining,
                            " / ",
                            mintCap))),
                    base &&
                        target &&
                        (pricing === null || pricing === void 0 ? void 0 : pricing.hierarchy.path(base.publicKey, target.publicKey).map((h, idx) => (react_2.default.createElement(Royalties_1.Royalties, { key: `royalties-${idx}`, formRef: formRef, tokenBonding: h.tokenBonding, isBuying: !!isBuying })))),
                    (extraTransactionInfo || []).map((i) => (react_2.default.createElement(TransactionInfo_1.TransactionInfo, Object.assign({ formRef: formRef }, i, { key: i.name }))))),
                react_2.default.createElement(react_1.Box, { position: "relative" },
                    react_2.default.createElement(react_1.ScaleFade, { initialScale: 0.9, in: !hasBaseAmount ||
                            moreThanSpendCap ||
                            notLive ||
                            insufficientLiq ||
                            passedMintCap },
                        react_2.default.createElement(react_1.Center, { bgColor: "gray.500", rounded: "md", paddingY: 2, color: "white", w: "full", position: "absolute", top: -10, fontSize: "sm" },
                            passedMintCap && (react_2.default.createElement(react_1.Text, null, (numRemaining || 0) > 0
                                ? `Only ${numRemaining} left`
                                : "Sold Out")),
                            moreThanSpendCap && (react_2.default.createElement(react_1.Text, null,
                                "You cannot buy more than ",
                                spendCap,
                                " ",
                                base.ticker,
                                " at a time.")),
                            notLive && (react_2.default.createElement(react_1.Text, null,
                                "Goes live at ",
                                goLiveDate && goLiveDate.toLocaleString())),
                            !hasBaseAmount && (react_2.default.createElement(react_1.Text, null,
                                "Insufficient funds for this trade.",
                                " ",
                                react_2.default.createElement(react_1.Text, { as: "u" },
                                    react_2.default.createElement(react_1.Link, { color: "primary.100", _hover: { color: "primary.200" }, onClick: handleBuyBase }, `Buy more now.`)))),
                            insufficientLiq && hasBaseAmount && (react_2.default.createElement(react_1.Text, null, "Insufficient Liqidity for this trade.")))),
                    !connected && (react_2.default.createElement(react_1.Button, { w: "full", colorScheme: "primary", size: "lg", onClick: onConnectWallet }, "Connect Wallet")),
                    connected && (react_2.default.createElement(react_1.Button, { isDisabled: !connected ||
                            !hasBaseAmount ||
                            moreThanSpendCap ||
                            notLive ||
                            insufficientLiq ||
                            passedMintCap, w: "full", colorScheme: "primary", size: "lg", type: "submit", isLoading: awaitingApproval || isSubmitting, loadingText: awaitingApproval ? "Awaiting Approval" : "Swapping" }, "Trade"))),
                showAttribution && (react_2.default.createElement(react_1.Center, null,
                    react_2.default.createElement(react_1.HStack, { spacing: 1, fontSize: "14px" },
                        react_2.default.createElement(react_1.Text, { color: attColor }, "Powered by"),
                        react_2.default.createElement(react_1.Link, { color: "primary.500", fontWeight: "medium", href: "https://strataprotocol.com" }, "Strata"))))))));
};
exports.SwapForm = SwapForm;
exports.MemodSwapForm = react_2.default.memo(exports.SwapForm);
function getStep(arg0) {
    return arg0 == 0 ? "1" : "0." + "0".repeat(Math.abs(arg0) - 1) + "1";
}
//# sourceMappingURL=SwapForm.js.map