"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenInfo = void 0;
const react_1 = require("@chakra-ui/react");
const bondingPricing_1 = require("../../hooks/bondingPricing");
const useErrorHandler_1 = require("../../hooks/useErrorHandler");
const usePriceInUsd_1 = require("../../hooks/usePriceInUsd");
const useStrataSdks_1 = require("../../hooks/useStrataSdks");
const useTwWrappedSolMint_1 = require("../../hooks/useTwWrappedSolMint");
const react_2 = __importDefault(require("react"));
const react_async_hook_1 = require("react-async-hook");
const ri_1 = require("react-icons/ri");
function unwrapTwSol(tokenBondingSdk, account) {
    return __awaiter(this, void 0, void 0, function* () {
        if (tokenBondingSdk) {
            yield tokenBondingSdk.sellBondingWrappedSol({
                amount: 0,
                all: true,
                source: account,
            });
        }
    });
}
exports.TokenInfo = react_2.default.memo(({ tokenWithMeta, onClick, highlighted, }) => {
    const { metadata, image, account } = tokenWithMeta;
    const fiatPrice = (0, usePriceInUsd_1.usePriceInUsd)(account === null || account === void 0 ? void 0 : account.mint);
    const ownedAmount = (0, bondingPricing_1.useOwnedAmount)(account === null || account === void 0 ? void 0 : account.mint);
    const twSol = (0, useTwWrappedSolMint_1.useTwWrappedSolMint)();
    const { tokenBondingSdk } = (0, useStrataSdks_1.useStrataSdks)();
    const { execute: unwrap, loading, error } = (0, react_async_hook_1.useAsyncCallback)(unwrapTwSol);
    const { handleErrors } = (0, useErrorHandler_1.useErrorHandler)();
    handleErrors(error);
    return (react_2.default.createElement(react_1.HStack, { onClick: (e) => {
            e.stopPropagation();
            e.preventDefault();
            onClick(tokenWithMeta);
        }, alignItems: "center", justify: "space-between", justifyItems: "center", _hover: { opacity: "0.5", cursor: "pointer" }, borderColor: highlighted ? "indigo.500" : undefined, borderWidth: highlighted ? "1px" : undefined, borderRadius: highlighted ? "4px" : undefined },
        react_2.default.createElement(react_1.HStack, { padding: 4, spacing: 3, align: "center" },
            react_2.default.createElement(react_1.Avatar, { name: metadata === null || metadata === void 0 ? void 0 : metadata.data.symbol, src: image }),
            react_2.default.createElement(react_1.Flex, { flexDir: "column" },
                react_2.default.createElement(react_1.Text, null, metadata === null || metadata === void 0 ? void 0 : metadata.data.name),
                react_2.default.createElement(react_1.HStack, { align: "center", spacing: 1 },
                    react_2.default.createElement(react_1.Icon, { as: ri_1.RiCoinLine, w: "16px", h: "16px" }),
                    react_2.default.createElement(react_1.Text, null, ownedAmount === null || ownedAmount === void 0 ? void 0 :
                        ownedAmount.toFixed(2),
                        " ", metadata === null || metadata === void 0 ? void 0 :
                        metadata.data.symbol),
                    react_2.default.createElement(react_1.Text, { color: "gray.500" },
                        "(~$",
                        fiatPrice &&
                            ownedAmount &&
                            (fiatPrice * ownedAmount).toFixed(2),
                        ")")))),
        twSol && account && twSol.equals(account.mint) && (react_2.default.createElement(react_1.Button, { isLoading: loading, onClick: () => unwrap(tokenBondingSdk, account === null || account === void 0 ? void 0 : account.address), colorScheme: "indigo", size: "xs" }, "Unwrap"))));
});
//# sourceMappingURL=TokenInfo.js.map