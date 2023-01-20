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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenListProvider = exports.TokenListContext = void 0;
const spl_token_registry_1 = require("@solana/spl-token-registry");
const react_1 = __importStar(require("react"));
exports.TokenListContext = react_1.default.createContext(undefined);
const TokenListProvider = ({ children }) => {
    const [tokenMap, setTokenMap] = (0, react_1.useState)(new Map());
    (0, react_1.useEffect)(() => {
        new spl_token_registry_1.TokenListProvider().resolve().then((tokens) => {
            const tokenList = tokens.filterByChainId(spl_token_registry_1.ENV.MainnetBeta).getList();
            setTokenMap(tokenList.reduce((map, item) => {
                map.set(item.address, item);
                return map;
            }, new Map()));
        });
    }, [setTokenMap]);
    return react_1.default.createElement(exports.TokenListContext.Provider, { value: tokenMap }, children);
};
exports.TokenListProvider = TokenListProvider;
//# sourceMappingURL=tokenList.js.map