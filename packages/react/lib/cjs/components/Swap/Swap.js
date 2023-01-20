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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemodSwap = exports.Swap = void 0;
const useErrorHandler_1 = require("../../hooks/useErrorHandler");
const useSwap_1 = require("../../hooks/useSwap");
const useTokenSwapFromId_1 = require("../../hooks/useTokenSwapFromId");
const react_1 = __importStar(require("react"));
const react_hot_toast_1 = __importDefault(require("react-hot-toast"));
const useSwapDriver_1 = require("../../hooks/useSwapDriver");
const Notification_1 = require("../Notification");
const SwapForm_1 = require("./SwapForm");
const identity = () => { };
const Swap = ({ id, onConnectWallet, onSuccess = (values) => {
    react_hot_toast_1.default.custom((t) => (react_1.default.createElement(Notification_1.Notification, { show: t.visible, type: "success", heading: "Transaction Successful", message: `Succesfully purchased ${Number(values.targetAmount).toFixed(9)}!`, onDismiss: () => react_hot_toast_1.default.dismiss(t.id) })));
}, }) => {
    const { loading, error, execute } = (0, useSwap_1.useSwap)();
    const { handleErrors } = (0, useErrorHandler_1.useErrorHandler)();
    handleErrors(error);
    const { tokenBonding, numRemaining, childEntangler, parentEntangler } = (0, useTokenSwapFromId_1.useTokenSwapFromId)(id);
    const [tradingMints, setTradingMints] = (0, react_1.useState)({
        base: tokenBonding === null || tokenBonding === void 0 ? void 0 : tokenBonding.baseMint,
        target: parentEntangler && childEntangler
            ? parentEntangler.parentMint
            : tokenBonding === null || tokenBonding === void 0 ? void 0 : tokenBonding.targetMint,
    });
    react_1.default.useEffect(() => {
        if ((!tradingMints.base || !tradingMints.target) && tokenBonding) {
            if (childEntangler && parentEntangler) {
                setTradingMints({
                    base: tokenBonding.baseMint,
                    target: parentEntangler.parentMint,
                });
                return;
            }
            setTradingMints({
                base: tokenBonding.baseMint,
                target: tokenBonding.targetMint,
            });
        }
    }, [tokenBonding, tradingMints]);
    const _a = (0, useSwapDriver_1.useSwapDriver)({
        tradingMints,
        onConnectWallet: onConnectWallet || identity,
        onTradingMintsChange: setTradingMints,
        swap: (args) => execute(Object.assign({ entangled: parentEntangler === null || parentEntangler === void 0 ? void 0 : parentEntangler.parentMint }, args))
            .then((values) => {
            onSuccess(Object.assign(Object.assign({}, args), values));
        })
            .catch(console.error),
        id,
    }), { loading: driverLoading } = _a, swapProps = __rest(_a, ["loading"]);
    return (react_1.default.createElement(SwapForm_1.MemodSwapForm, Object.assign({ isLoading: driverLoading, isSubmitting: loading }, swapProps)));
};
exports.Swap = Swap;
exports.MemodSwap = react_1.default.memo(exports.Swap);
//# sourceMappingURL=Swap.js.map