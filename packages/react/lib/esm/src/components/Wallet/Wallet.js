import { Button, Center, createIcon, HStack, Icon, SimpleGrid, StackDivider, Text, VStack } from "@chakra-ui/react";
import { NATIVE_MINT } from "@solana/spl-token";
import { useWallet } from "wallet-adapter-react-xnft";
import { useSolOwnedAmount } from "../../hooks/bondingPricing";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import { usePriceInUsd } from "../../hooks/usePriceInUsd";
import { useTwWrappedSolMint } from "../../hooks/useTwWrappedSolMint";
import { useUserTokensWithMeta } from "../../hooks/useUserTokensWithMeta";
import React from "react";
import toast from "react-hot-toast";
import { RiCoinLine } from "react-icons/ri";
import { Notification } from "../Notification";
import { Spinner } from "../Spinner";
import { TokenInfo } from "./TokenInfo";
const SolLogoIcon = createIcon({
    displayName: "Solana",
    viewBox: "0 0 96 96",
    path: [
        React.createElement("circle", { cx: "48", cy: "48", r: "48", fill: "black" }),
        React.createElement("path", { d: "M64.8743 43.4897C64.5684 43.1761 64.1536 43 63.7211 43H23.8174C23.0905 43 22.7266 43.9017 23.2408 44.4287L31.1257 52.5103C31.4316 52.8239 31.8464 53 32.2789 53H72.1826C72.9095 53 73.2734 52.0983 72.7592 51.5713L64.8743 43.4897Z", fill: "url(#paint0_linear)" }),
        React.createElement("path", { d: "M31.1257 58.5352C31.4316 58.2231 31.8464 58.0478 32.2789 58.0478H72.1826C72.9095 58.0478 73.2734 58.9452 72.7592 59.4697L64.8743 67.5126C64.5684 67.8247 64.1536 68 63.7211 68H23.8174C23.0905 68 22.7266 67.1027 23.2408 66.5781L31.1257 58.5352Z", fill: "url(#paint1_linear)" }),
        React.createElement("path", { d: "M31.1257 28.4874C31.4316 28.1753 31.8464 28 32.2789 28H72.1826C72.9095 28 73.2734 28.8973 72.7592 29.4219L64.8743 37.4648C64.5684 37.7769 64.1536 37.9522 63.7211 37.9522H23.8174C23.0905 37.9522 22.7266 37.0548 23.2408 36.5303L31.1257 28.4874Z", fill: "url(#paint2_linear)" }),
        React.createElement("defs", null,
            ",",
            React.createElement("linearGradient", { id: "paint0_linear", x1: "56.8029", y1: "16.975", x2: "28.0661", y2: "70.6352", gradientUnits: "userSpaceOnUse" },
                ",",
                React.createElement("stop", { stopColor: "#00FFA3" }),
                ",",
                React.createElement("stop", { offset: "1", stopColor: "#DC1FFF" }),
                ","),
            ",",
            React.createElement("linearGradient", { id: "paint1_linear", x1: "56.8029", y1: "17.0278", x2: "28.2797", y2: "70.545", gradientUnits: "userSpaceOnUse" },
                ",",
                React.createElement("stop", { stopColor: "#00FFA3" }),
                ",",
                React.createElement("stop", { offset: "1", stopColor: "#DC1FFF" }),
                ","),
            ",",
            React.createElement("linearGradient", { id: "paint2_linear", x1: "56.8029", y1: "17.0278", x2: "28.2797", y2: "70.545", gradientUnits: "userSpaceOnUse" },
                ",",
                React.createElement("stop", { stopColor: "#00FFA3" }),
                ",",
                React.createElement("stop", { offset: "1", stopColor: "#DC1FFF" }),
                ","),
            ","),
    ],
});
export const Wallet = React.memo(({ wumLeaderboardLink, onSelect, solLink, onSendClick, }) => {
    const { publicKey } = useWallet();
    const { amount: solOwned } = useSolOwnedAmount(publicKey || undefined);
    const solPrice = usePriceInUsd(NATIVE_MINT);
    const { data: tokens, loading, error, } = useUserTokensWithMeta(publicKey || undefined);
    const { handleErrors } = useErrorHandler();
    handleErrors(error);
    const twSol = useTwWrappedSolMint();
    return (React.createElement(VStack, { overflow: "auto", align: "stretch", w: "full", h: "full", spacing: 4, padding: 2 },
        React.createElement(VStack, { align: "stretch", w: "full", spacing: 4 },
            React.createElement(VStack, { pt: 2, align: "stretch", divider: React.createElement(StackDivider, { borderColor: "gray.200" }), spacing: 4, w: "full" },
                React.createElement(HStack, { direction: "row", justifyContent: "space-evenly", divider: React.createElement(StackDivider, { borderColor: "gray.200" }) },
                    React.createElement(VStack, { flexGrow: 1, flexBasis: 0, onClick: () => window.open(solLink, "_blank"), _hover: { opacity: "0.5", cursor: "pointer" }, spacing: 1, flexDir: "column", align: "center" },
                        React.createElement(Icon, { as: SolLogoIcon, w: "48px", h: "48px" }),
                        React.createElement(HStack, { align: "center", spacing: 1 },
                            React.createElement(Icon, { as: RiCoinLine, w: "16px", h: "16px" }),
                            React.createElement(Text, { fontWeight: 600 },
                                solOwned?.toFixed(2),
                                " SOL"),
                            React.createElement(Text, { fontWeight: 600, color: "gray.500" },
                                "(~$",
                                ((solPrice || 0) * solOwned).toFixed(2),
                                ")"))))),
            React.createElement(SimpleGrid, { spacing: 2, columns: 2 },
                React.createElement(Button, { flexGrow: 1, colorScheme: "indigo", onClick: () => {
                        navigator.clipboard.writeText(publicKey?.toBase58() || "");
                        toast.custom((t) => (React.createElement(Notification, { show: t.visible, type: "info", heading: "Copied to Clipboard", message: publicKey?.toBase58(), onDismiss: () => toast.dismiss(t.id) })));
                    } }, "Receive"),
                React.createElement(Button, { onClick: onSendClick, flexGrow: 1, w: "full", colorScheme: "indigo" }, "Send"))),
        React.createElement(VStack, { align: "stretch", w: "full", spacing: 0, mt: loading ? 0 : -4, divider: React.createElement(StackDivider, { borderColor: "gray.200" }) },
            loading && (React.createElement(Center, null,
                React.createElement(Spinner, { size: "lg" }))),
            !loading &&
                tokens
                    ?.filter((t) => !!t.metadata && t.mint?.decimals != 0)
                    .sort((a, b) => twSol && a.account.mint.equals(twSol)
                    ? -1
                    : twSol && b.account.mint.equals(twSol)
                        ? 1
                        : a.metadata.data.name.localeCompare(b.metadata.data.name))
                    .map((tokenWithMeta) => (React.createElement(TokenInfo, { key: tokenWithMeta.publicKey?.toBase58(), tokenWithMeta: tokenWithMeta, onClick: onSelect }))))));
});
//# sourceMappingURL=Wallet.js.map