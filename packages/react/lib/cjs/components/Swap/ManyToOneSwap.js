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
exports.ManyToOneSwap = void 0;
const react_1 = __importStar(require("react"));
const react_hot_toast_1 = __importDefault(require("react-hot-toast"));
const Notification_1 = require("../Notification");
const SwapForm_1 = require("./SwapForm");
const spl_token_bonding_1 = require("@strata-foundation/spl-token-bonding");
const useManyToOneSwapDriver_1 = require("../../hooks/useManyToOneSwapDriver");
const useSwap_1 = require("../../hooks/useSwap");
const useErrorHandler_1 = require("../../hooks/useErrorHandler");
const useStrataSdks_1 = require("../../hooks/useStrataSdks");
const useTokenMetadata_1 = require("../../hooks/useTokenMetadata");
const useMint_1 = require("../../hooks/useMint");
const useCapInfo_1 = require("../../hooks/useCapInfo");
const spl_utils_1 = require("@strata-foundation/spl-utils");
const ManyToOneSwap = ({ onConnectWallet, extraTransactionInfo, inputs, targetMint, }) => {
    const { loading, error, execute } = (0, useSwap_1.useSwap)();
    const { handleErrors } = (0, useErrorHandler_1.useErrorHandler)();
    const { tokenBondingSdk } = (0, useStrataSdks_1.useStrataSdks)();
    handleErrors(error);
    const { metadata: targetMintMeta } = (0, useTokenMetadata_1.useTokenMetadata)(targetMint);
    const [baseMint, setBaseMint] = (0, react_1.useState)(inputs[0].baseMint);
    const targetMintAcc = (0, useMint_1.useMint)(targetMint);
    const currBonding = (0, react_1.useMemo)(() => { var _a; return (_a = inputs.find(i => i.baseMint.equals(baseMint))) === null || _a === void 0 ? void 0 : _a.tokenBonding; }, [inputs, baseMint]);
    const { numRemaining } = (0, useCapInfo_1.useCapInfo)(currBonding, true);
    const _a = (0, useManyToOneSwapDriver_1.useManyToOneSwapDriver)({
        onConnectWallet,
        extraTransactionInfo,
        inputs,
        baseMint,
        targetMint,
        onTradingMintsChange: ({ base }) => setBaseMint(base),
        swap: (args) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const amount = args.desiredTargetAmount || args.expectedOutputAmount;
                yield execute(Object.assign(Object.assign({}, args), { balanceCheckTries: 0 }));
                react_hot_toast_1.default.custom((t) => (react_1.default.createElement(Notification_1.Notification, { show: t.visible, type: "success", heading: "Transaction Successful", message: `Succesfully purchased ${(0, spl_utils_1.roundToDecimals)((0, spl_token_bonding_1.toNumber)(amount, targetMintAcc), targetMintAcc ? targetMintAcc.decimals : 9)} ${targetMintMeta === null || targetMintMeta === void 0 ? void 0 : targetMintMeta.data.symbol}!`, onDismiss: () => react_hot_toast_1.default.dismiss(t.id) })));
            }
            catch (e) {
                console.error(e);
            }
        }),
    }), { loading: driverLoading } = _a, swapProps = __rest(_a, ["loading"]);
    return (react_1.default.createElement(SwapForm_1.SwapForm, Object.assign({ isLoading: driverLoading, isSubmitting: loading }, swapProps, { numRemaining: numRemaining })));
};
exports.ManyToOneSwap = ManyToOneSwap;
//# sourceMappingURL=ManyToOneSwap.js.map