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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenSearch = void 0;
const react_1 = require("@chakra-ui/react");
const wallet_adapter_react_xnft_1 = require("wallet-adapter-react-xnft");
const fuse_js_1 = __importDefault(require("fuse.js"));
const react_2 = __importStar(require("react"));
const bi_1 = require("react-icons/bi");
const ri_1 = require("react-icons/ri");
const useUserTokensWithMeta_1 = require("../../hooks/useUserTokensWithMeta");
const Spinner_1 = require("../Spinner");
const TokenInfo_1 = require("./TokenInfo");
const SearchError = ({ title = "", subTitle = "", description = "", }) => {
    return (react_2.default.createElement(react_1.VStack, { px: 8, py: 4, rounded: 4, spacing: 0, border: "1px solid #E1E3E8" },
        react_2.default.createElement(react_1.Icon, { h: "44px", w: "44px", as: ri_1.RiCoinLine, color: "gray.300" }),
        react_2.default.createElement(react_1.Text, { fontWeight: 800, fontSize: "14px" }, title),
        react_2.default.createElement(react_1.Text, { fontSize: "14px" }, subTitle),
        react_2.default.createElement(react_1.Text, { textAlign: "center", mt: 4, fontSize: "14px", color: "gray.500" }, description)));
};
exports.TokenSearch = react_2.default.memo(({ onSelect, placeholder = "Search Tokens", resultsStackProps, onBlur, includeSol = false }) => {
    const { publicKey } = (0, wallet_adapter_react_xnft_1.useWallet)();
    const { data: tokens, loading } = (0, useUserTokensWithMeta_1.useUserTokensWithMeta)(publicKey || undefined, includeSol);
    const [search, setSearch] = (0, react_2.useState)("");
    const [focusIndex, setFocusIndex] = (0, react_2.useState)(0);
    const searched = (0, react_2.useMemo)(() => {
        if (tokens) {
            const sorted = tokens === null || tokens === void 0 ? void 0 : tokens.filter((t) => !!t.metadata).sort((a, b) => a.metadata.data.name.localeCompare(b.metadata.data.name));
            if (search) {
                return new fuse_js_1.default(sorted, {
                    keys: ["metadata.data.name", "metadata.data.symbol"],
                    threshold: 0.2,
                })
                    .search(search)
                    .map((result) => result.item);
            }
            else {
                return sorted;
            }
        }
        return [];
    }, [tokens, search]);
    (0, react_2.useEffect)(() => {
        if (searched.length - 1 < focusIndex && searched.length != 0) {
            setFocusIndex(searched.length - 1);
        }
    }, [searched]);
    const tokenInfos = searched.map((tokenWithMeta, index) => {
        var _a;
        return (react_2.default.createElement(TokenInfo_1.TokenInfo, { highlighted: index == focusIndex, key: (_a = tokenWithMeta.publicKey) === null || _a === void 0 ? void 0 : _a.toBase58(), tokenWithMeta: tokenWithMeta, onClick: onSelect }));
    });
    return (react_2.default.createElement(react_1.VStack, { w: "full" },
        react_2.default.createElement(react_1.InputGroup, null,
            react_2.default.createElement(react_1.InputLeftElement, { h: "full", pointerEvents: "none" },
                react_2.default.createElement(react_1.Center, null,
                    react_2.default.createElement(react_1.Icon, { w: "20px", h: "20px", color: "gray.500", as: bi_1.BiSearch }))),
            react_2.default.createElement(react_1.Input, { onBlur: onBlur, autoFocus: true, display: "auto", value: search, onChange: (e) => setSearch(e.target.value), size: "lg", placeholder: placeholder, onKeyDown: (e) => {
                    if (e.key == "Enter" && searched[focusIndex]) {
                        onSelect(searched[focusIndex]);
                    }
                    else if (e.key == "ArrowDown") {
                        setFocusIndex((i) => i == searched.length - 1 ? searched.length - 1 : i + 1);
                    }
                    else if (e.key == "ArrowUp") {
                        setFocusIndex((i) => (i == 0 ? 0 : i - 1));
                    }
                } })),
        react_2.default.createElement(react_1.VStack, Object.assign({}, resultsStackProps, { pt: 2, align: "stretch", divider: react_2.default.createElement(react_1.StackDivider, { borderColor: "gray.200" }), w: "full", justify: "stretch" }),
            tokenInfos,
            loading && react_2.default.createElement(Spinner_1.Spinner, null),
            !loading &&
                (tokenInfos === null || tokenInfos === void 0 ? void 0 : tokenInfos.length) == 0 &&
                (search && search.length > 0 ? (react_2.default.createElement(SearchError, { title: "Could Not Find Token", subTitle: "We couldn't find this token in your wallet.", description: "If you have this token in another wallet, please fund this wallet first." })) : (react_2.default.createElement(SearchError, { title: "No Tokens", subTitle: "It looks like your wallet is empty.", description: "Buy tokens from this wallet first, then they will show up here" }))))));
});
//# sourceMappingURL=TokenSearch.js.map