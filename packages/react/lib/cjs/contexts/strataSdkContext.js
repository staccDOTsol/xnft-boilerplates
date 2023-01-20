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
exports.StrataSdksProvider = exports.StrataSdksContext = void 0;
const spl_token_bonding_1 = require("@strata-foundation/spl-token-bonding");
const spl_token_collective_1 = require("@strata-foundation/spl-token-collective");
const fungible_entangler_1 = require("@strata-foundation/fungible-entangler");
const spl_utils_1 = require("@strata-foundation/spl-utils");
const react_1 = __importStar(require("react"));
const react_async_hook_1 = require("react-async-hook");
const useProvider_1 = require("../hooks/useProvider");
exports.StrataSdksContext = react_1.default.createContext({
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
function getSdks(provider) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!provider) {
            console.warn("No provider passed via ProviderContext to StrataSdkContext. Please provide a provider");
            return {};
        }
        const [tokenCollective, tokenBonding, fungibleEntangler, splTokenMetadataSdk,] = ((yield tryProm(Promise.all([
            spl_token_collective_1.SplTokenCollective.init(provider),
            spl_token_bonding_1.SplTokenBonding.init(provider),
            fungible_entangler_1.FungibleEntangler.init(provider),
            spl_utils_1.SplTokenMetadata.init(provider),
        ]))) || []);
        return {
            tokenCollectiveSdk: tokenCollective,
            tokenBondingSdk: tokenBonding,
            tokenMetadataSdk: splTokenMetadataSdk,
            fungibleEntanglerSdk: fungibleEntangler,
        };
    });
}
const StrataSdksProvider = ({ children }) => {
    const { provider } = (0, useProvider_1.useProvider)();
    const { result, loading, error } = (0, react_async_hook_1.useAsync)(getSdks, [provider]);
    const sdks = (0, react_1.useMemo)(() => ({
        tokenCollectiveSdk: result === null || result === void 0 ? void 0 : result.tokenCollectiveSdk,
        tokenBondingSdk: result === null || result === void 0 ? void 0 : result.tokenBondingSdk,
        fungibleEntanglerSdk: result === null || result === void 0 ? void 0 : result.fungibleEntanglerSdk,
        tokenMetadataSdk: result === null || result === void 0 ? void 0 : result.tokenMetadataSdk,
        error,
        loading,
    }), [result, loading, error, provider]);
    return (react_1.default.createElement(exports.StrataSdksContext.Provider, { value: sdks }, children));
};
exports.StrataSdksProvider = StrataSdksProvider;
//# sourceMappingURL=strataSdkContext.js.map