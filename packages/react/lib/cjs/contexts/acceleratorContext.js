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
exports.useAccelerator = exports.AcceleratorProvider = exports.AcceleratorProviderRaw = exports.AcceleratorContext = void 0;
const accelerator_1 = require("@strata-foundation/accelerator");
const react_1 = __importStar(require("react"));
const react_async_hook_1 = require("react-async-hook");
exports.AcceleratorContext = react_1.default.createContext({
    loading: true,
});
function tryProm(prom) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield prom;
        }
        catch (e) {
            console.error(e);
        }
        return undefined;
    });
}
function getSdk(url) {
    return __awaiter(this, void 0, void 0, function* () {
        return tryProm(accelerator_1.Accelerator.init(url));
    });
}
const AcceleratorProviderRaw = ({ children, url, }) => {
    const { result, loading, error } = (0, react_async_hook_1.useAsync)(getSdk, [url]);
    const sdks = (0, react_1.useMemo)(() => ({
        accelerator: result,
        error,
        loading,
    }), [result, loading, error]);
    return (react_1.default.createElement(exports.AcceleratorContext.Provider, { value: sdks }, children));
};
exports.AcceleratorProviderRaw = AcceleratorProviderRaw;
const AcceleratorProvider = ({ children, url, }) => {
    return react_1.default.createElement(exports.AcceleratorProviderRaw, { url: url }, children);
};
exports.AcceleratorProvider = AcceleratorProvider;
const useAccelerator = () => {
    return (0, react_1.useContext)(exports.AcceleratorContext);
};
exports.useAccelerator = useAccelerator;
//# sourceMappingURL=acceleratorContext.js.map