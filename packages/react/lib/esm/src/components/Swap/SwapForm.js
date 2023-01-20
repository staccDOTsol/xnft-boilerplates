import { Avatar, Box, Button, Center, Divider, Flex, HStack, Icon, IconButton, Input, InputGroup, InputRightElement, Link, Menu, MenuButton, MenuItem, MenuList, ScaleFade, Text, Tooltip, useColorModeValue, VStack, } from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { NATIVE_MINT } from "@solana/spl-token";
import { useWallet } from "wallet-adapter-react-xnft";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { BsChevronDown } from "react-icons/bs";
import { RiArrowUpDownFill, RiInformationLine } from "react-icons/ri";
import * as yup from "yup";
import { useFtxPayLink } from "../../hooks/useFtxPayLink";
import { useMint } from "../../hooks/useMint";
import { useProvider } from "../../hooks/useProvider";
import { useSolanaUnixTime } from "../../hooks/useSolanaUnixTime";
import { useTokenMetadata } from "../../hooks/useTokenMetadata";
import { useTokenSwapFromId } from "../../hooks/useTokenSwapFromId";
import { useTwWrappedSolMint } from "../../hooks/useTwWrappedSolMint";
import { roundToDecimals } from "../../utils/roundToDecimals";
import { Spinner } from "../Spinner";
import { Royalties } from "./Royalties";
import { TransactionInfo } from "./TransactionInfo";
const validationSchema = yup
    .object({
    topAmount: yup.number().required().moreThan(0),
    bottomAmount: yup.number().required().moreThan(0),
    slippage: yup.number().required().moreThan(0),
})
    .required();
function MintMenuItem({ mint, onClick, }) {
    const { image, metadata } = useTokenMetadata(mint);
    return (React.createElement(MenuItem, { onClick: onClick, icon: React.createElement(Center, { w: 8, h: 8, rounded: "full" },
            React.createElement(Avatar, { w: "100%", h: "100%", size: "sm", src: image })) },
        React.createElement(Text, null, metadata?.data.symbol)));
}
export const SwapForm = ({ isLoading = false, extraTransactionInfo, isSubmitting, onConnectWallet, onTradingMintsChange, onBuyBase, onSubmit, id, pricing, base, target, ownedBase, spendCap, feeAmount, baseOptions, targetOptions, mintCap, isBuying, goLiveDate, numRemaining, showAttribution = true, swapBaseWithTargetEnabled = true, }) => {
    const formRef = useRef();
    const { connected } = useWallet();
    const { awaitingApproval } = useProvider();
    const ftxPayLink = useFtxPayLink();
    const [insufficientLiq, setInsufficientLiq] = useState(false);
    const [rate, setRate] = useState("--");
    const [fee, setFee] = useState("--");
    const notLive = goLiveDate && new Date() < goLiveDate;
    const { register, handleSubmit, watch, reset, setValue, formState: { errors }, } = useForm({
        defaultValues: {
            topAmount: undefined,
            bottomAmount: undefined,
            slippage: 1,
        },
        // @ts-ignore
        resolver: yupResolver(validationSchema),
    });
    const wrappedSolMint = useTwWrappedSolMint();
    const isBaseSol = wrappedSolMint &&
        (base?.publicKey.equals(wrappedSolMint) ||
            base?.publicKey.equals(NATIVE_MINT));
    const topAmount = watch("topAmount");
    const bottomAmount = watch("bottomAmount");
    const slippage = watch("slippage");
    const hasBaseAmount = (ownedBase || 0) >= +(topAmount || 0);
    const moreThanSpendCap = +(topAmount || 0) > spendCap;
    const unixTime = useSolanaUnixTime();
    const { tokenBonding, childEntangler, parentEntangler } = useTokenSwapFromId(id);
    const passedMintCap = typeof numRemaining !== "undefined" && numRemaining < bottomAmount;
    const targetMintAcc = useMint(target?.publicKey);
    const baseMintAcc = useMint(base?.publicKey);
    const handleConnectWallet = () => onConnectWallet();
    const manualResetForm = () => {
        reset({ slippage: slippage });
        setInsufficientLiq(false);
        setRate("--");
        setFee("--");
    };
    const [lastSet, setLastSet] = useState("top");
    function updatePrice() {
        if (lastSet == "bottom" && bottomAmount) {
            handleBottomChange(bottomAmount);
        }
        else if (topAmount) {
            handleTopChange(topAmount);
        }
    }
    useEffect(() => {
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
                    : roundToDecimals(amount, targetMintAcc ? targetMintAcc.decimals : 9));
                setRate(`${roundToDecimals(amount / value, targetMintAcc ? targetMintAcc.decimals : 9)}`);
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
                    : roundToDecimals(amount, baseMintAcc ? baseMintAcc.decimals : 9));
                setRate(`${roundToDecimals(value / amount, baseMintAcc ? baseMintAcc.decimals : 9)}`);
                setFee(`${feeAmount}`);
            }
        }
        else {
            manualResetForm();
        }
    };
    const attColor = useColorModeValue("gray.400", "gray.200");
    const dropdownVariant = useColorModeValue("solid", "ghost");
    const swapBackground = useColorModeValue("gray.200", "gray.500");
    const color = useColorModeValue("gray.500", "gray.200");
    const inputBorderColor = useColorModeValue("gray.200", "gray.500");
    const useMaxBg = useColorModeValue("primary.200", "black.500");
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
    const handleSwap = async (values) => {
        await onSubmit({ ...values, lastSet });
    };
    if (isLoading || !base || !target) {
        return React.createElement(Spinner, null);
    }
    return (React.createElement(Box, { ref: formRef, w: "full", color: color },
        React.createElement("form", { onSubmit: handleSubmit(handleSwap) },
            React.createElement(VStack, { spacing: 4, align: "stretch" },
                React.createElement(VStack, { spacing: 1, align: "left" },
                    React.createElement(Flex, { justifyContent: "space-between" },
                        React.createElement(Text, { fontSize: "xs" }, "You Pay"),
                        base && handleBuyBase && (React.createElement(Link, { color: "primary.500", fontSize: "xs", onClick: handleBuyBase },
                            "Buy More ",
                            base.ticker))),
                    React.createElement(InputGroup, { zIndex: 100, size: "lg" },
                        React.createElement(Input, { isInvalid: !!errors.topAmount, isDisabled: !connected, id: "topAmount", borderColor: inputBorderColor, placeholder: "0", type: "number", fontSize: "2xl", fontWeight: "semibold", step: getStep(baseMintAcc ? baseMintAcc.decimals : 9), min: 0, _placeholder: { color: "gray.200" }, ...register("topAmount", {
                                onChange: (e) => handleTopChange(e.target.value),
                            }) }),
                        React.createElement(InputRightElement, { w: "auto", justifyContent: "end", paddingX: 1.5, rounded: "lg" }, connected && (React.createElement(Menu, null,
                            React.createElement(MenuButton, { variant: dropdownVariant, cursor: "pointer", isDisabled: !connected, as: Button, rightIcon: targetOptions.length > 0 ? React.createElement(BsChevronDown, null) : null, leftIcon: React.createElement(Center, { w: 6, h: 6, rounded: "full" },
                                    React.createElement(Avatar, { src: base.image, w: "100%", h: "100%" })), borderRadius: "20px 6px 6px 20px", paddingX: 1.5 }, base.ticker),
                            React.createElement(MenuList, { borderColor: "gray.300" }, baseOptions.map((mint) => (React.createElement(MintMenuItem, { mint: mint, key: mint.toBase58(), onClick: () => onTradingMintsChange({
                                    base: mint,
                                    target: target.publicKey &&
                                        mint.equals(target.publicKey)
                                        ? base.publicKey
                                        : target.publicKey,
                                }) }))))))))),
                React.createElement(HStack, { justify: "center", alignItems: "center", position: "relative", paddingY: 2 },
                    React.createElement(Divider, { borderColor: swapBackground }),
                    React.createElement(Flex, null,
                        !connected && (React.createElement(Button, { size: "xs", colorScheme: "gray", variant: "outline", onClick: handleConnectWallet }, "Connect Wallet")),
                        connected && (React.createElement(Button, { size: "xs", colorScheme: "primary", variant: "ghost", onClick: handleUseMax, _hover: { bgColor: useMaxBg } },
                            "Use Max (",
                            (ownedBase || 0) > spendCap ? spendCap : ownedBase || 0,
                            " ",
                            base.ticker,
                            ")"))),
                    React.createElement(Divider, { borderColor: swapBackground }),
                    swapBaseWithTargetEnabled && (React.createElement(IconButton, { isDisabled: !connected, "aria-label": "Flip Tokens", size: "sm", bgColor: swapBackground, color: "white", rounded: "full", position: "absolute", right: 2, onClick: handleFlipTokens, icon: React.createElement(Icon, { as: RiArrowUpDownFill, w: 5, h: 5 }) }))),
                React.createElement(VStack, { align: "left", spacing: 1 },
                    React.createElement(Text, { fontSize: "xs" }, "You Receive"),
                    React.createElement(InputGroup, { zIndex: 99, size: "lg" },
                        React.createElement(Input, { isInvalid: !!errors.bottomAmount, isDisabled: !connected, id: "bottomAmount", borderColor: inputBorderColor, placeholder: "0", type: "number", fontSize: "2xl", fontWeight: "semibold", step: getStep(targetMintAcc ? targetMintAcc.decimals : 9), min: 0, _placeholder: { color: "gray.200" }, ...register("bottomAmount", {
                                onChange: (e) => handleBottomChange(e.target.value),
                            }) }),
                        React.createElement(InputRightElement, { w: "auto", justifyContent: "end", paddingX: 1.5, rounded: "lg" }, connected && (React.createElement(Menu, null,
                            React.createElement(MenuButton, { variant: dropdownVariant, rightIcon: targetOptions.length > 0 ? React.createElement(BsChevronDown, null) : null, isDisabled: !connected, as: Button, leftIcon: React.createElement(Center, { w: 6, h: 6, rounded: "full" },
                                    React.createElement(Avatar, { src: target.image, w: "100%", h: "100%" })), borderRadius: "20px 6px 6px 20px", paddingX: 1.5 }, target.ticker),
                            React.createElement(MenuList, { borderColor: "gray.300" }, targetOptions.map((mint) => (React.createElement(MintMenuItem, { mint: mint, key: mint.toBase58(), onClick: () => onTradingMintsChange({
                                    target: mint,
                                    base: base.publicKey && mint.equals(base.publicKey)
                                        ? target.publicKey
                                        : base.publicKey,
                                }) }))))))))),
                React.createElement(VStack, { spacing: 1, padding: 4, align: "stretch", borderColor: inputBorderColor, borderWidth: "1px", rounded: "lg", fontSize: "sm", opacity: connected ? 1 : 0.6 },
                    React.createElement(Flex, { justify: "space-between", alignItems: "center" },
                        React.createElement(Text, null, "Rate"),
                        React.createElement(Text, null, rate !== "--"
                            ? `1 ${base.ticker} ≈ ${rate} ${target.ticker}`
                            : rate)),
                    React.createElement(Flex, { justify: "space-between", alignItems: "center" },
                        React.createElement(HStack, null,
                            React.createElement(Text, null, "Slippage"),
                            React.createElement(Tooltip, { isDisabled: !connected, placement: "top", label: "Your transaction will fail if the price changes unfavorably more than this percentage.", portalProps: { containerRef: formRef } },
                                React.createElement(Flex, null,
                                    React.createElement(Icon, { w: 5, h: 5, as: RiInformationLine, _hover: { color: "primary.500", cursor: "pointer" } })))),
                        React.createElement(InputGroup, { size: "sm", w: "60px" },
                            React.createElement(Input, { isInvalid: !!errors.slippage, isDisabled: !connected, id: "slippage", borderColor: inputBorderColor, textAlign: "right", rounded: "lg", placeholder: "0", type: "number", fontWeight: "semibold", step: 1, min: 1, max: 90, paddingRight: 5, paddingLeft: 1, ...register("slippage") }),
                            React.createElement(InputRightElement, { zIndex: 0, w: 4, justifyContent: "end", paddingRight: 1.5, rounded: "lg" },
                                React.createElement(Text, { margin: 0 }, "%")))),
                    React.createElement(Flex, { justify: "space-between", alignItems: "center" },
                        React.createElement(Text, null, "Solana Network Fees"),
                        React.createElement(Flex, null, fee)),
                    numRemaining && (React.createElement(Flex, { justify: "space-between", alignItems: "center" },
                        React.createElement(Text, null, "Remaining"),
                        React.createElement(Flex, null,
                            numRemaining,
                            " / ",
                            mintCap))),
                    base &&
                        target &&
                        pricing?.hierarchy
                            .path(base.publicKey, target.publicKey)
                            .map((h, idx) => (React.createElement(Royalties, { key: `royalties-${idx}`, formRef: formRef, tokenBonding: h.tokenBonding, isBuying: !!isBuying }))),
                    (extraTransactionInfo || []).map((i) => (React.createElement(TransactionInfo, { formRef: formRef, ...i, key: i.name })))),
                React.createElement(Box, { position: "relative" },
                    React.createElement(ScaleFade, { initialScale: 0.9, in: !hasBaseAmount ||
                            moreThanSpendCap ||
                            notLive ||
                            insufficientLiq ||
                            passedMintCap },
                        React.createElement(Center, { bgColor: "gray.500", rounded: "md", paddingY: 2, color: "white", w: "full", position: "absolute", top: -10, fontSize: "sm" },
                            passedMintCap && (React.createElement(Text, null, (numRemaining || 0) > 0
                                ? `Only ${numRemaining} left`
                                : "Sold Out")),
                            moreThanSpendCap && (React.createElement(Text, null,
                                "You cannot buy more than ",
                                spendCap,
                                " ",
                                base.ticker,
                                " at a time.")),
                            notLive && (React.createElement(Text, null,
                                "Goes live at ",
                                goLiveDate && goLiveDate.toLocaleString())),
                            !hasBaseAmount && (React.createElement(Text, null,
                                "Insufficient funds for this trade.",
                                " ",
                                React.createElement(Text, { as: "u" },
                                    React.createElement(Link, { color: "primary.100", _hover: { color: "primary.200" }, onClick: handleBuyBase }, `Buy more now.`)))),
                            insufficientLiq && hasBaseAmount && (React.createElement(Text, null, "Insufficient Liqidity for this trade.")))),
                    !connected && (React.createElement(Button, { w: "full", colorScheme: "primary", size: "lg", onClick: onConnectWallet }, "Connect Wallet")),
                    connected && (React.createElement(Button, { isDisabled: !connected ||
                            !hasBaseAmount ||
                            moreThanSpendCap ||
                            notLive ||
                            insufficientLiq ||
                            passedMintCap, w: "full", colorScheme: "primary", size: "lg", type: "submit", isLoading: awaitingApproval || isSubmitting, loadingText: awaitingApproval ? "Awaiting Approval" : "Swapping" }, "Trade"))),
                showAttribution && (React.createElement(Center, null,
                    React.createElement(HStack, { spacing: 1, fontSize: "14px" },
                        React.createElement(Text, { color: attColor }, "Powered by"),
                        React.createElement(Link, { color: "primary.500", fontWeight: "medium", href: "https://strataprotocol.com" }, "Strata"))))))));
};
export const MemodSwapForm = React.memo(SwapForm);
function getStep(arg0) {
    return arg0 == 0 ? "1" : "0." + "0".repeat(Math.abs(arg0) - 1) + "1";
}
//# sourceMappingURL=SwapForm.js.map