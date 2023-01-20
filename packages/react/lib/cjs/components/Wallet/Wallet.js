"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallet = void 0;
const react_1 = require("@chakra-ui/react");
const spl_token_1 = require("@solana/spl-token");
const wallet_adapter_react_xnft_1 = require("wallet-adapter-react-xnft");
const bondingPricing_1 = require("../../hooks/bondingPricing");
const useErrorHandler_1 = require("../../hooks/useErrorHandler");
const usePriceInUsd_1 = require("../../hooks/usePriceInUsd");
const useTwWrappedSolMint_1 = require("../../hooks/useTwWrappedSolMint");
const useUserTokensWithMeta_1 = require("../../hooks/useUserTokensWithMeta");
const react_2 = __importDefault(require("react"));
const react_hot_toast_1 = __importDefault(require("react-hot-toast"));
const ri_1 = require("react-icons/ri");
const Notification_1 = require("../Notification");
const Spinner_1 = require("../Spinner");
const TokenInfo_1 = require("./TokenInfo");
const SolLogoIcon = (0, react_1.createIcon)({
    displayName: "Solana",
    viewBox: "0 0 96 96",
    path: [
        react_2.default.createElement("circle", { cx: "48", cy: "48", r: "48", fill: "black" }),
        react_2.default.createElement("path", { d: "M64.8743 43.4897C64.5684 43.1761 64.1536 43 63.7211 43H23.8174C23.0905 43 22.7266 43.9017 23.2408 44.4287L31.1257 52.5103C31.4316 52.8239 31.8464 53 32.2789 53H72.1826C72.9095 53 73.2734 52.0983 72.7592 51.5713L64.8743 43.4897Z", fill: "url(#paint0_linear)" }),
        react_2.default.createElement("path", { d: "M31.1257 58.5352C31.4316 58.2231 31.8464 58.0478 32.2789 58.0478H72.1826C72.9095 58.0478 73.2734 58.9452 72.7592 59.4697L64.8743 67.5126C64.5684 67.8247 64.1536 68 63.7211 68H23.8174C23.0905 68 22.7266 67.1027 23.2408 66.5781L31.1257 58.5352Z", fill: "url(#paint1_linear)" }),
        react_2.default.createElement("path", { d: "M31.1257 28.4874C31.4316 28.1753 31.8464 28 32.2789 28H72.1826C72.9095 28 73.2734 28.8973 72.7592 29.4219L64.8743 37.4648C64.5684 37.7769 64.1536 37.9522 63.7211 37.9522H23.8174C23.0905 37.9522 22.7266 37.0548 23.2408 36.5303L31.1257 28.4874Z", fill: "url(#paint2_linear)" }),
        react_2.default.createElement("defs", null,
            ",",
            react_2.default.createElement("linearGradient", { id: "paint0_linear", x1: "56.8029", y1: "16.975", x2: "28.0661", y2: "70.6352", gradientUnits: "userSpaceOnUse" },
                ",",
                react_2.default.createElement("stop", { stopColor: "#00FFA3" }),
                ",",
                react_2.default.createElement("stop", { offset: "1", stopColor: "#DC1FFF" }),
                ","),
            ",",
            react_2.default.createElement("linearGradient", { id: "paint1_linear", x1: "56.8029", y1: "17.0278", x2: "28.2797", y2: "70.545", gradientUnits: "userSpaceOnUse" },
                ",",
                react_2.default.createElement("stop", { stopColor: "#00FFA3" }),
                ",",
                react_2.default.createElement("stop", { offset: "1", stopColor: "#DC1FFF" }),
                ","),
            ",",
            react_2.default.createElement("linearGradient", { id: "paint2_linear", x1: "56.8029", y1: "17.0278", x2: "28.2797", y2: "70.545", gradientUnits: "userSpaceOnUse" },
                ",",
                react_2.default.createElement("stop", { stopColor: "#00FFA3" }),
                ",",
                react_2.default.createElement("stop", { offset: "1", stopColor: "#DC1FFF" }),
                ","),
            ","),
    ],
});
exports.Wallet = react_2.default.memo(({ wumLeaderboardLink, onSelect, solLink, onSendClick, }) => {
    const { publicKey } = (0, wallet_adapter_react_xnft_1.useWallet)();
    const { amount: solOwned } = (0, bondingPricing_1.useSolOwnedAmount)(publicKey || undefined);
    const solPrice = (0, usePriceInUsd_1.usePriceInUsd)(spl_token_1.NATIVE_MINT);
    const { data: tokens, loading, error, } = (0, useUserTokensWithMeta_1.useUserTokensWithMeta)(publicKey || undefined);
    const { handleErrors } = (0, useErrorHandler_1.useErrorHandler)();
    handleErrors(error);
    const twSol = (0, useTwWrappedSolMint_1.useTwWrappedSolMint)();
    return (react_2.default.createElement(react_1.VStack, { overflow: "auto", align: "stretch", w: "full", h: "full", spacing: 4, padding: 2 },
        react_2.default.createElement(react_1.VStack, { align: "stretch", w: "full", spacing: 4 },
            react_2.default.createElement(react_1.VStack, { pt: 2, align: "stretch", divider: react_2.default.createElement(react_1.StackDivider, { borderColor: "gray.200" }), spacing: 4, w: "full" },
                react_2.default.createElement(react_1.HStack, { direction: "row", justifyContent: "space-evenly", divider: react_2.default.createElement(react_1.StackDivider, { borderColor: "gray.200" }) },
                    react_2.default.createElement(react_1.VStack, { flexGrow: 1, flexBasis: 0, onClick: () => window.open(solLink, "_blank"), _hover: { opacity: "0.5", cursor: "pointer" }, spacing: 1, flexDir: "column", align: "center" },
                        react_2.default.createElement(react_1.Icon, { as: SolLogoIcon, w: "48px", h: "48px" }),
                        react_2.default.createElement(react_1.HStack, { align: "center", spacing: 1 },
                            react_2.default.createElement(react_1.Icon, { as: ri_1.RiCoinLine, w: "16px", h: "16px" }),
                            react_2.default.createElement(react_1.Text, { fontWeight: 600 }, solOwned === null || solOwned === void 0 ? void 0 :
                                solOwned.toFixed(2),
                                " SOL"),
                            react_2.default.createElement(react_1.Text, { fontWeight: 600, color: "gray.500" },
                                "(~$",
                                ((solPrice || 0) * solOwned).toFixed(2),
                                ")"))))),
            react_2.default.createElement(react_1.SimpleGrid, { spacing: 2, columns: 2 },
                react_2.default.createElement(react_1.Button, { flexGrow: 1, colorScheme: "indigo", onClick: () => {
                        navigator.clipboard.writeText((publicKey === null || publicKey === void 0 ? void 0 : publicKey.toBase58()) || "");
                        react_hot_toast_1.default.custom((t) => (react_2.default.createElement(Notification_1.Notification, { show: t.visible, type: "info", heading: "Copied to Clipboard", message: publicKey === null || publicKey === void 0 ? void 0 : publicKey.toBase58(), onDismiss: () => react_hot_toast_1.default.dismiss(t.id) })));
                    } }, "Receive"),
                react_2.default.createElement(react_1.Button, { onClick: onSendClick, flexGrow: 1, w: "full", colorScheme: "indigo" }, "Send"))),
        react_2.default.createElement(react_1.VStack, { align: "stretch", w: "full", spacing: 0, mt: loading ? 0 : -4, divider: react_2.default.createElement(react_1.StackDivider, { borderColor: "gray.200" }) },
            loading && (react_2.default.createElement(react_1.Center, null,
                react_2.default.createElement(Spinner_1.Spinner, { size: "lg" }))),
            !loading &&
                (tokens === null || tokens === void 0 ? void 0 : tokens.filter((t) => { var _a; return !!t.metadata && ((_a = t.mint) === null || _a === void 0 ? void 0 : _a.decimals) != 0; }).sort((a, b) => twSol && a.account.mint.equals(twSol)
                    ? -1
                    : twSol && b.account.mint.equals(twSol)
                        ? 1
                        : a.metadata.data.name.localeCompare(b.metadata.data.name)).map((tokenWithMeta) => {
                    var _a;
                    return (react_2.default.createElement(TokenInfo_1.TokenInfo, { key: (_a = tokenWithMeta.publicKey) === null || _a === void 0 ? void 0 : _a.toBase58(), tokenWithMeta: tokenWithMeta, onClick: onSelect }));
                })))));
});
//# sourceMappingURL=Wallet.js.map